import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";
import { resolveModel, PipelineStep } from "@/lib/modelDefaults";
import {
  getSeriesContext,
  hydrateStoryDetailsWithLiveSeriesContext,
  seriesGenerationMeta,
} from "@/lib/seriesContext";
import { formatSeriesContextForPrompt } from "@/lib/seriesPrompt";
import { alignBlueprintToOutline } from "@/lib/blueprintAlign";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const normalizeOutline = (outline: unknown): Array<Record<string, unknown>> => {
  let response: Array<Record<string, unknown>> = [];

  if (Array.isArray(outline)) {
    response = outline as Array<Record<string, unknown>>;
  } else if (outline && typeof outline === "object") {
    const outlineObj = outline as Record<string, unknown>;
    if ("chapters" in outlineObj && Array.isArray(outlineObj.chapters)) {
      response = outlineObj.chapters as Array<Record<string, unknown>>;
    } else {
      response = [outlineObj];
    }
  }

  return response
    .map((chapter: Record<string, unknown>, index: number) => ({
      number: Number(chapter.number ?? index + 1),
      title: String(chapter.title ?? "").trim(),
      pov: String(chapter.pov ?? "Main Character").trim(),
      summary: String(chapter.summary ?? "").trim(),
      emotional_development: String(
        chapter.emotional_development ?? ""
      ).trim(),
      theme_focus: String(chapter.theme_focus ?? "").trim(),
      estimated_word_count: Number(
        chapter.estimated_word_count ?? chapter.word_count ?? 900
      ),
      events: Array.isArray(chapter.events)
        ? chapter.events.map((e) => String(e))
        : [],
    }))
    .filter(
      (chapter) =>
        chapter.title &&
        !chapter.title.includes("needs generation") &&
        chapter.summary &&
        !chapter.summary.startsWith("Missing outline")
    );
};

const parseOutlineRaw = (raw: unknown): unknown => {
  if (typeof raw !== "string") return raw;
  try {
    const match = raw.match(/\[\s*{[\s\S]*}\s*\]/);
    return match ? JSON.parse(match[0]) : JSON.parse(raw);
  } catch {
    return raw;
  }
};

export async function POST(request: Request) {
  try {
    const { storyDetails: rawDetails, model, novelPlan, seriesId, bookNumber } =
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

    const title = storyDetails.title ?? "Untitled";
    const theme = storyDetails.story_theme ?? "";
    const structuredPlan = novelPlan ?? "";
    const novelAbout = storyDetails.novel_about ?? "";

    const seriesContext = getSeriesContext(storyDetails);
    const effectiveBlueprint =
      seriesContext?.book_blueprint ?? storyDetails.book_blueprint ?? null;

    const blueprintSection = effectiveBlueprint
      ? `\n═══ BOOK BLUEPRINT — MANDATORY STRUCTURAL PLAN ═══\nYour chapter outline MUST follow this blueprint exactly. It defines the structural arc this book must follow:\n${JSON.stringify(effectiveBlueprint, null, 2)}\n\nBlueprint Alignment Rules:\n- opening_shift: Your FIRST 2-3 chapters MUST establish this starting situation for the protagonist.\n- midpoint_shock: Place this pivotal reversal at approximately the MIDDLE of your chapter outline (around chapter 50% mark).\n- lowest_point: Position this darkest hour at approximately the 70-75% mark of your chapters.\n- climax: Place the decisive confrontation at approximately the 85-90% mark.\n- ending_change: Your LAST 1-2 chapters MUST deliver this transformative resolution.\n- relationship_changes: Distribute these across chapters, showing gradual evolution.\n- theme_pressure: Every chapter's theme_focus should reflect or build upon this pressure.\n- full_outline: Use this as the overarching framework for chapter sequencing.\n═══ END BLUEPRINT ═══\n`
      : "";

    const prompt = `
Following the structured plan below, please create a detailed chapter outline for "${title}" designed to establish a powerful emotional arc that deeply explores the complexities of ${theme}.
${blueprintSection}
Break the story into the necessary chapters as you see fit that serve the purpose of the story, with word count estimates for each chapter to ensure balanced pacing and focus. Each chapter should allow room for meaningful character development, emotional depth, and tension that draws readers in.

Guidelines:
– The outline should follow the Parts in your structured plan (e.g., Part I, Part II, etc.)
– Ensure that each chapter reflects shifts in tone, rising stakes, or key moments of character growth
– Design each chapter to support a powerful emotional arc, exploring the complexities of all core themes
– Return a complete outline (typically 15–25 chapters). Do not omit chapters.

For each chapter, include:
* Short summary of what happens
* The emotional focus and development of key characters
* Key moments of tension, conflict, or change
* Estimated word count for balanced pacing
* Theme focus or symbol: (e.g., betrayal, growth, power, identity, loss)

Structured Plan:
${structuredPlan}

Author Intent (What the novel is about):
${novelAbout}

Series Context:
${formatSeriesContextForPrompt(seriesContext)}

Format your response as a JSON array of chapter objects with the following fields:
- "number": The chapter number (integer)
- "title": A compelling chapter title (string)
- "pov": Which character's point of view is used (string)
- "summary": A brief summary of key events (string)
- "emotional_development": The emotional focus and character development (string)
- "theme_focus": The theme or symbol emphasized in this chapter (string)
- "estimated_word_count": Word count target for this chapter (integer)
- "events": Key plot points or scenes in the chapter (array of strings)
`;

    const system = `You are a professional novelist and story structure expert. 
Create a compelling chapter outline that follows the provided structured plan while developing emotional arcs and themes.
You must structure your response as a valid JSON array with all required fields.
This is for a software application that needs this exact format to function properly.`;

    const generationMeta = seriesGenerationMeta(
      storyDetails,
      "chapter-outline",
      seriesId
    );
    const resolvedModel = resolveModel(model, PipelineStep.CHAPTER_OUTLINE);

    const raw = await runChatCompletion({
      model: resolvedModel,
      system,
      prompt,
      jsonResponse: false,
      maxTokens: 8000,
      generationMeta,
    });

    let outline = normalizeOutline(parseOutlineRaw(raw));

    // If short, try one continuation fill for the missing numbers only
    if (outline.length > 0 && outline.length < 12) {
      const have = new Set(outline.map((c) => Number(c.number)));
      const maxNum = Math.max(...outline.map((c) => Number(c.number)), 0);
      const targetCount = Math.max(18, maxNum);
      const missingNumbers: number[] = [];
      for (let i = 1; i <= targetCount; i += 1) {
        if (!have.has(i)) missingNumbers.push(i);
      }

      if (missingNumbers.length > 0 && missingNumbers.length <= 12) {
        const fillPrompt = `You are continuing a chapter outline for "${title}".
Create full chapter entries ONLY for chapters ${missingNumbers.join(", ")},
keeping the tone, emotional arc, and themes consistent. Use the same JSON array format with fields:
number, title, pov, summary, emotional_development, theme_focus, estimated_word_count, events.
Do not include chapters outside of ${missingNumbers.join(", ")}.

Context:
${structuredPlan}

Author Intent:
${novelAbout}

Existing chapters (for continuity):
${JSON.stringify(outline.slice(0, 8), null, 2)}`;

        const fillRaw = await runChatCompletion({
          model: resolvedModel,
          system,
          prompt: fillPrompt,
          jsonResponse: false,
          maxTokens: 6000,
          generationMeta,
        });

        const filled = normalizeOutline(parseOutlineRaw(fillRaw));
        const filledMap = new Map(
          filled.map((chapter) => [Number(chapter.number), chapter])
        );
        for (const num of missingNumbers) {
          const chapter = filledMap.get(num);
          if (chapter) outline.push(chapter);
        }
        outline = outline
          .sort((a, b) => Number(a.number) - Number(b.number))
          .filter(
            (c, i, arr) =>
              arr.findIndex((x) => Number(x.number) === Number(c.number)) === i
          );
      }
    }

    if (outline.length < 8) {
      return NextResponse.json(
        {
          error:
            "Chapter outline incomplete after generation. Regenerate the outline.",
          outline,
        },
        { status: 422 }
      );
    }

    const invalid = outline.some(
      (c) =>
        !c.title ||
        !c.summary ||
        String(c.title).includes("needs generation")
    );
    if (invalid) {
      return NextResponse.json(
        {
          error:
            "Chapter outline contained placeholder chapters. Regenerate the outline.",
          outline,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      outline,
      alignment: alignBlueprintToOutline(
        effectiveBlueprint as Parameters<typeof alignBlueprintToOutline>[0],
        outline
      ),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate chapter outline" },
      { status: 500 }
    );
  }
}
