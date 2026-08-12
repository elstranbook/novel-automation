import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";
import { resolveModel, PipelineStep } from "@/lib/modelDefaults";
import { formatCharactersForPrompt } from "@/lib/characterPrompt";
import {
  getSeriesContext,
  hydrateStoryDetailsWithLiveSeriesContext,
  seriesGenerationMeta,
} from "@/lib/seriesContext";
import { formatSeriesContextForPrompt } from "@/lib/seriesPrompt";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function resolveWordCount(storyDetails: Record<string, unknown>): number {
  const raw = storyDetails.estimated_word_count;
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    return Math.round(raw);
  }
  if (typeof raw === "string") {
    const digits = raw.replace(/,/g, "").match(/\d+/);
    if (digits) {
      const n = Number(digits[0]);
      if (Number.isFinite(n) && n > 0) return n;
    }
  }
  return 80000;
}

function formatBlueprintBlock(blueprint: unknown): string {
  if (!blueprint) return "";
  if (typeof blueprint === "string") {
    const trimmed = blueprint.trim();
    return trimmed ? `BOOK BLUEPRINT:\n${trimmed}` : "";
  }
  try {
    const text = JSON.stringify(blueprint, null, 2);
    if (!text || text === "{}" || text === "[]") return "";
    return `BOOK BLUEPRINT:\n${text.slice(0, 3500)}`;
  } catch {
    return "";
  }
}

export async function POST(request: Request) {
  try {
    const { storyDetails: rawDetails, synopsis, characterProfiles, model, seriesId, bookNumber } =
      await request.json();
    const storyDetails = await hydrateStoryDetailsWithLiveSeriesContext(
      rawDetails,
      seriesId,
      bookNumber
    );

    if (!storyDetails) {
      return NextResponse.json(
        { error: "Story details are required" },
        { status: 400 }
      );
    }

    const seriesContext = getSeriesContext(storyDetails);
    let seriesGuidance = "";
    if (seriesContext) {
      seriesGuidance = `
SERIES CONTEXT (Incorporate into your plan):

This novel is Book ${seriesContext.book_number ?? 1} of ${
        seriesContext.total_books ?? 1
      } in a series titled "${seriesContext.series_title ?? "Untitled Series"}".
`;

      if (seriesContext.series_arc) {
        seriesGuidance += `\nOverall Series Arc: ${seriesContext.series_arc}\n`;
      }

      seriesGuidance += "\nSeries Planning Elements:\n";
      if ((seriesContext.book_number ?? 1) === 1) {
        seriesGuidance += `
As the FIRST book in the series:
- Establish core world elements that will persist throughout the series
- Introduce characters who will have multi-book arcs
- Plant seeds for future developments in later books
- Resolve the main conflict of this book while leaving larger series questions open
- Create a satisfying story that stands alone but hints at more to come
`;
      } else if ((seriesContext.book_number ?? 1) === (seriesContext.total_books ?? 1)) {
        seriesGuidance += `
As the FINAL book in the series:
- Resolve all major series plotlines and character arcs
- Call back to important moments from earlier books
- Provide emotional closure for long-running character relationships
- Tie up loose ends while maintaining the possibility of future stories
- Deliver a climax that pays off setup from previous books
`;
      } else {
        const position =
          (seriesContext.book_number ?? 1) <=
          (seriesContext.total_books ?? 1) / 2
            ? "early"
            : "later";
        seriesGuidance += `
As a MIDDLE book (${position} in the series):
- Continue developing series-wide character arcs
- Deepen the world established in previous books
- Raise the stakes from previous installments
- Resolve some conflicts while introducing new ones
- Balance being a self-contained story and advancing the series arc
`;
      }

      if ((seriesContext.book_number ?? 1) > 1 && seriesContext.prior_books) {
        seriesGuidance += "\nContinuity Requirements:\n";
        seriesGuidance += "- Maintain consistency with previously established elements\n";
        seriesGuidance += "- Reference key events from previous books where relevant\n";
        seriesGuidance += "- Show character growth influenced by previous experiences\n";
      }
    }

    const synopsisValue = synopsis ?? "";
    const profilesValue = characterProfiles ?? "";
    const novelAbout = storyDetails.novel_about ?? "";
    const genre = String(storyDetails.genre ?? "fiction").trim() || "fiction";
    const targetAge = String(storyDetails.target_age_range ?? "").trim();
    const narrativeStyle = String(storyDetails.narrative_style ?? "").trim();
    const wordCount = resolveWordCount(storyDetails);

    // Prefer live series blueprint when present; else standalone storyDetails blueprint
    const blueprint =
      seriesContext?.book_blueprint ?? storyDetails.book_blueprint ?? null;
    const blueprintBlock = formatBlueprintBlock(blueprint);

    // Build formatted character section from series_characters if available
    const seriesCharacters = seriesContext?.characters;
    const formattedCharacters = (Array.isArray(seriesCharacters) && seriesCharacters.length > 0)
      ? formatCharactersForPrompt(
          seriesCharacters as Parameters<typeof formatCharactersForPrompt>[0],
          { maxLength: 4000 }
        )
      : (typeof profilesValue === 'string' ? profilesValue : "");

    const prompt = `
Following the synopsis below, create a structured plan to guide me in building a compelling, emotionally rich narrative that keeps readers engaged throughout my ${wordCount}-word ${genre} novel${targetAge ? ` for readers aged ${targetAge}` : ""}${narrativeStyle ? ` written in ${narrativeStyle}` : ""}. Break the novel down into 3 parts, providing an approximate word count for each section along with key milestones and plot points to hit.

${seriesGuidance}

${blueprintBlock}

Include specific guidance for:

1. Character Development:
Outline the protagonist's growth arc and relationships, detailing how they evolve emotionally and personally. Highlight moments of transformation and key decisions that define their journey. Make use of their character profile to make them real and unique.

2. Conflict and Tension:
Define the central conflicts and how tension escalates at each stage, building momentum toward the climax. Include suggestions for balancing high-stakes moments with quieter, reflective scenes to maintain emotional pacing.

3. Secondary Characters:
Describe their roles and contributions to the plot, and how they support or complicate the main storyline. Provide insight into their mini-arcs and how they intersect with the protagonist's journey.

4. Themes:
Suggest ways to weave the novel's core themes naturally through dialogue, events, symbolism, and character actions to enhance emotional impact and depth.

5. Pacing and Structure:
Offer guidance on the emotional and narrative pacing for each section, ensuring the story unfolds organically and peaks at the right moments. Include recommendations for cliffhangers, twists, and reflective pauses where appropriate.

6. Foreshadowing and Payoff:
Indicate key opportunities for foreshadowing early on, ensuring satisfying payoffs that tie loose ends and reinforce the story's themes by the conclusion.

Synopsis:
${synopsisValue}

Author Intent (What the novel is about):
${novelAbout}

Series Context:
${formatSeriesContextForPrompt(seriesContext, { includeCharacters: false })}

Character Profiles:
${formattedCharacters || profilesValue}
`;

    const system = `You are a professional novel structure expert and writing coach for ${genre} fiction.
Create a comprehensive novel plan that gives practical, actionable guidance for developing a compelling narrative.
Focus on emotional arcs, structural balance, and specific plot milestones that will help the author craft a satisfying story.
Provide a balance of big-picture guidance and specific tactical suggestions.
Match the stated genre, audience, and narrative style; do not assume Young Adult unless the material calls for it.`;

    const response = await runChatCompletion({
      model: resolveModel(model, PipelineStep.NOVEL_PLAN),
      system,
      prompt,
      jsonResponse: false,
      generationMeta: seriesGenerationMeta(storyDetails, "novel-plan", seriesId),
    });

    return NextResponse.json({ plan: response });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate novel plan" },
      { status: 500 }
    );
  }
}
