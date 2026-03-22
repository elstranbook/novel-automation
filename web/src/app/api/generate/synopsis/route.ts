import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";

export async function POST(request: Request) {
  try {
    const { storyDetails, premisesAndEndings, model } = await request.json();

    if (!storyDetails) {
      return NextResponse.json(
        { error: "Story details are required" },
        { status: 400 }
      );
    }

    const title = storyDetails.title ?? "Untitled";
    const theme = storyDetails.story_theme ?? "Growth and self-discovery";
    const wordCount = storyDetails.estimated_word_count ?? "70,000-90,000";
    const targetAge = storyDetails.target_age_range ?? "13-18";
    const mainCharacter = storyDetails.main_character_name ?? "the protagonist";
    const conflict = storyDetails.central_conflict ?? "a significant challenge";

    const trimContext = (value: unknown, max = 1200) =>
      JSON.stringify(value ?? "").slice(0, max);

    const summarizeContext = (context: Record<string, unknown>) => ({
      series_title: context.series_title,
      series_arc: context.series_arc,
      book_number: context.book_number,
      total_books: context.total_books,
      canon_entries: (context.canon_entries as unknown[] | undefined)?.slice(0, 5),
      secrets: (context.secrets as unknown[] | undefined)?.slice(0, 5),
      relationships: (context.relationships as unknown[] | undefined)?.slice(0, 5),
      plot_threads: (context.plot_threads as unknown[] | undefined)?.slice(0, 5),
      callbacks: (context.callbacks as unknown[] | undefined)?.slice(0, 5),
    });

    const description = `Theme: ${theme}\nGenre: ${
      storyDetails.genre ?? "Young Adult Fiction"
    }\nCentral Concept: ${
      storyDetails.central_concept ?? "A coming-of-age journey"
    }\nSetting: ${storyDetails.setting ?? "A world of possibility"}\nNovel About: ${
      storyDetails.novel_about ?? ""
    }\nSeries Context: ${
      storyDetails.series_context
        ? trimContext(summarizeContext(storyDetails.series_context as Record<string, unknown>), 1200)
        : ""
    }\nCanon Facts: ${
      storyDetails.series_context?.canon_entries ? trimContext(storyDetails.series_context.canon_entries, 800) : ""
    }\nMystery Log: ${
      storyDetails.series_context?.secrets ? trimContext(storyDetails.series_context.secrets, 800) : ""
    }\nRelationships: ${
      storyDetails.series_context?.relationships ? trimContext(storyDetails.series_context.relationships, 800) : ""
    }`;

    const premise = premisesAndEndings?.chosen_premise ?? "";
    const ending = premisesAndEndings?.chosen_ending ?? "";

    const seriesContext = storyDetails.series_context ?? null;
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

      if (seriesContext.character_arcs) {
        seriesGuidance += "\nCharacter Arcs Across Series:\n";
        Object.entries(seriesContext.character_arcs).forEach(
          ([charName, charArc]) => {
            seriesGuidance += `- ${charName}: ${charArc}\n`;
          }
        );
      }

      if (seriesContext.themes) {
        seriesGuidance += "\nSeries Themes to Incorporate:\n";
        seriesContext.themes.forEach((themeItem: string) => {
          seriesGuidance += `- ${themeItem}\n`;
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
I am writing a Young Adult fantasy Novel titled "${title}".

The theme centers around ${theme}.

Target word count range: ${wordCount}
Intended YA audience: ${targetAge}

The story follows ${mainCharacter} as they face ${conflict}.

${seriesGuidance}

Given the following premise and story information, provide a highly detailed synopsis for this YA novel using a traditional three-act structure.

The synopsis should:
– Clearly label Act I, Act II, and Act III
– Highlight the main characters, their emotional journey, and the obstacles they face
– Emphasize the passion, stakes, and tension
– Hint at the resolution without spoiling the ending completely
– Leave readers eager to dive into the story

Use a tone and language that captures the spirit of a YA novel while still offering depth, clarity, and structure.

Description:
${description}

Premise: ${premise}
Ending: ${ending}
`;

    const system = `You are a professional YA novelist skilled at creating compelling synopses.
Create a detailed three-act structure synopsis that would excite both readers and publishers.
Focus on emotional arcs, character development, and the unique aspects that make this story stand out in the YA market.`;

    const response = await runChatCompletion({
      model: model || "gpt-4.1-mini",
      system,
      prompt,
      jsonResponse: false,
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
