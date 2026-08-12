import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";
import { resolveModel, PipelineStep } from "@/lib/modelDefaults";
import {
  getSeriesContext,
  hydrateStoryDetailsWithLiveSeriesContext,
  seriesGenerationMeta,
} from "@/lib/seriesContext";
import { formatSeriesContextForPrompt } from "@/lib/seriesPrompt";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const { storyDetails: rawDetails, premisesAndEndings, model, studioTitle, seriesId, bookNumber: requestBookNumber } =
      await request.json();
    const storyDetails = await hydrateStoryDetailsWithLiveSeriesContext(
      rawDetails,
      seriesId,
      requestBookNumber
    );

    if (!storyDetails) {
      return NextResponse.json(
        { error: "Story details are required" },
        { status: 400 }
      );
    }

    const title = storyDetails.title ?? studioTitle ?? "Untitled";
    const theme = storyDetails.story_theme ?? "Growth and self-discovery";
    const wordCount = storyDetails.estimated_word_count ?? "70,000-90,000";
    const targetAge = storyDetails.target_age_range ?? "";
    const mainCharacter = storyDetails.main_character_name ?? "the protagonist";
    const conflict = storyDetails.central_conflict ?? "a significant challenge";
    const genre = storyDetails.genre ?? "Fiction";
    const narrativeStyle = String(storyDetails.narrative_style ?? "").trim();

    const description = `Theme: ${theme}\nGenre: ${
      storyDetails.genre ?? "Fiction"
    }\nCentral Concept: ${
      storyDetails.central_concept ?? "A compelling journey"
    }\nSetting: ${storyDetails.setting ?? "A vivid world"}\nNovel About: ${
      storyDetails.novel_about ?? ""
    }\n${formatSeriesContextForPrompt(getSeriesContext(storyDetails))}`;

    const premise = premisesAndEndings?.chosen_premise ?? "";
    const ending = premisesAndEndings?.chosen_ending ?? "";

    const seriesContext = getSeriesContext(storyDetails);
    let seriesGuidance = "";
    if (seriesContext) {
      const bookNumber = seriesContext.book_number ?? 1;
      const totalBooks = seriesContext.total_books ?? 1;
      const seriesTitle = seriesContext.series_title ?? "Untitled Series";

      seriesGuidance = `
SERIES CONTEXT (Important - incorporate into your synopsis):

This novel is Book ${bookNumber} of ${totalBooks} in a series titled "${seriesTitle}".

Series Arc: ${seriesContext.series_arc ?? "No series arc provided"}
`;

      if (seriesContext.character_arcs && typeof seriesContext.character_arcs === "object") {
        seriesGuidance += "\nCharacter Arcs Across Series:\n";
        Object.entries(seriesContext.character_arcs as Record<string, unknown>).forEach(
          ([charName, charArc]) => {
            seriesGuidance += `- ${charName}: ${charArc}\n`;
          }
        );
      }

      if (Array.isArray(seriesContext.themes)) {
        seriesGuidance += "\nSeries Themes to Incorporate:\n";
        seriesContext.themes.forEach((themeItem) => {
          seriesGuidance += `- ${String(themeItem)}\n`;
        });
      }

      seriesGuidance += "\nRequirements for this book's position in the series:\n";
      if (bookNumber === 1) {
        seriesGuidance +=
          "- As the FIRST book, establish the series world, main characters, and core conflicts\n" +
          "- Set up plot threads that can be developed in future books\n" +
          "- Focus on making this a complete story while introducing the larger series arc\n";
      } else if (bookNumber === totalBooks) {
        seriesGuidance +=
          "- As the FINAL book, provide satisfying resolutions to both this book's plot and the overall series arc\n" +
          "- Address all major character arcs and provide closure\n" +
          "- Deliver on the promises set up in previous books\n";
      } else {
        seriesGuidance +=
          `- As book #${bookNumber} in the middle of the series, balance advancing the series arc with having its own complete story\n` +
          "- Continue character development from previous books while setting up future development\n" +
          "- Raise the stakes from previous books\n";
      }

      if (seriesContext.prior_books) {
        seriesGuidance +=
          "\nPrevious books in the series (ensure continuity with these):\n";
        seriesContext.prior_books.forEach((book: { title?: string }) => {
          seriesGuidance += `- ${book.title ?? "Previous Book"}\n`;
        });
      }
    }

    const prompt = `
I am writing a ${genre} novel titled "${title}".

The theme centers around ${theme}.

Target word count range: ${wordCount}
${targetAge ? `Intended audience: ${targetAge}` : "Intended audience: match the genre and author brief"}
${narrativeStyle ? `Narrative style: ${narrativeStyle}` : ""}

The story follows ${mainCharacter} as they face ${conflict}.

${seriesGuidance}

Given the following premise and story information, provide a highly detailed synopsis for this novel using a traditional three-act structure.

The synopsis should:
– Clearly label Act I, Act II, and Act III
– Highlight the main characters, their emotional journey, and the obstacles they face
– Emphasize the passion, stakes, and tension
– Hint at the resolution without spoiling the ending completely
– Leave readers eager to dive into the story

Use a tone and language that fits the genre (${genre}) while still offering depth, clarity, and structure.

Description:
${description}

Premise: ${premise}
Ending: ${ending}
`;

    const system = `You are a professional novelist skilled at creating compelling synopses for ${genre} fiction.
Create a detailed three-act structure synopsis that would excite both readers and publishers.
Focus on emotional arcs, character development, and the unique aspects that make this story stand out.
Match the stated genre and audience; do not assume Young Adult unless the material calls for it.`;

    const response = await runChatCompletion({
      model: resolveModel(model, PipelineStep.SYNOPSIS),
      system,
      prompt,
      jsonResponse: false,
      generationMeta: seriesGenerationMeta(storyDetails, "synopsis", seriesId),
    });

    return NextResponse.json({ synopsis: response });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate synopsis" },
      { status: 500 }
    );
  }
}
