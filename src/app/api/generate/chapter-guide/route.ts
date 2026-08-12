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

const REQUIRED_FIELDS = [
  "key_dialogue",
  "symbolism",
  "emotional_pacing",
  "sensory_details",
  "foreshadowing",
  "scene_goal",
] as const;

const isPlaceholderGuide = (entry: Record<string, unknown>): boolean => {
  const dialogue = entry.key_dialogue;
  if (Array.isArray(dialogue)) {
    return dialogue.some((line) =>
      /this is where a revealing line|here's where a character would/i.test(
        String(line)
      )
    );
  }
  return false;
};

const isValidGuideEntry = (entry: unknown): entry is Record<string, unknown> => {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return false;
  const record = entry as Record<string, unknown>;
  if (isPlaceholderGuide(record)) return false;
  return REQUIRED_FIELDS.every((key) => {
    const value = record[key];
    if (value == null) return false;
    if (Array.isArray(value)) return value.length > 0;
    return String(value).trim().length > 0;
  });
};

const parseGuideResponse = (
  response: unknown
): Record<string, Record<string, unknown>> | null => {
  if (!response) return null;
  let parsed: unknown = response;
  if (typeof response === "string") {
    try {
      const match = response.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : JSON.parse(response);
    } catch {
      return null;
    }
  }
  if (!parsed || typeof parsed !== "object") return null;

  const record = parsed as Record<string, unknown>;
  // Single chapter shaped like fields at top level
  if (REQUIRED_FIELDS.some((k) => k in record) && !("1" in record)) {
    return { pending: record as Record<string, unknown> };
  }

  const out: Record<string, Record<string, unknown>> = {};
  for (const [key, value] of Object.entries(record)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      out[String(key)] = value as Record<string, unknown>;
    }
  }
  return Object.keys(out).length ? out : null;
};

const chunk = <T,>(arr: T[], size: number): T[][] => {
  const batches: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    batches.push(arr.slice(i, i + size));
  }
  return batches;
};

export async function POST(request: Request) {
  try {
    const {
      chapterOutline,
      novelSynopsis,
      characterProfiles,
      novelPlan,
      storyDetails: rawDetails,
      model,
      seriesId,
      bookNumber,
    } = await request.json();

    const storyDetails = await hydrateStoryDetailsWithLiveSeriesContext(
      rawDetails,
      seriesId,
      bookNumber
    );

    const seriesContext = getSeriesContext(storyDetails);
    const seriesCharacters = seriesContext?.characters;
    const formattedCharacters =
      Array.isArray(seriesCharacters) && seriesCharacters.length > 0
        ? formatCharactersForPrompt(seriesCharacters, { maxLength: 3000 })
        : typeof characterProfiles === "string"
          ? characterProfiles.slice(0, 3000)
          : "Not provided";

    if (!chapterOutline) {
      return NextResponse.json(
        { error: "Chapter outline is required" },
        { status: 400 }
      );
    }

    const outlineArray = Array.isArray(chapterOutline)
      ? chapterOutline
      : (chapterOutline?.chapters as Array<Record<string, unknown>>) ?? [];

    if (outlineArray.length === 0) {
      return NextResponse.json(
        { error: "Chapter outline is empty" },
        { status: 400 }
      );
    }

    const effectiveBlueprint =
      seriesContext?.book_blueprint ?? storyDetails?.book_blueprint ?? null;

    const blueprintSection = effectiveBlueprint
      ? `\n═══ BOOK BLUEPRINT — MANDATORY STRUCTURAL PLAN ═══\nYour chapter guide MUST align with this blueprint:\n${JSON.stringify(effectiveBlueprint, null, 2)}\n═══ END BLUEPRINT ═══\n`
      : "";

    const seriesBlock = formatSeriesContextForPrompt(seriesContext, {
      includeCharacters: false,
      priority: true,
      maxLength: 6500,
    });

    const baseModel = resolveModel(model, PipelineStep.CHAPTER_GUIDE);
    const generationMeta = seriesGenerationMeta(
      storyDetails,
      "chapter-guide",
      seriesId
    );

    const system = `You are an expert novelist creating a detailed chapter guide.
Format your ENTIRE response as VALID JSON.
Each chapter key must be the chapter number as a string.
Each chapter must include concrete, novel-specific content for:
key_dialogue (array), symbolism (array), emotional_pacing (string), sensory_details (array), foreshadowing (array), scene_goal (string).
No placeholder text. No commentary outside JSON.`;

    const guide: Record<string, Record<string, unknown>> = {};
    const batches = chunk(outlineArray, 5);

    for (const batch of batches) {
      const simplified = batch.map((chapter, index) => {
        const record = chapter as Record<string, unknown>;
        return {
          number: record.number ?? index + 1,
          title: record.title ?? `Chapter ${index + 1}`,
          summary: record.summary ?? "",
        };
      });
      const numbers = simplified.map((c) => String(c.number));

      const prompt = `
Create a detailed chapter guide for these chapters only: ${numbers.join(", ")}.

Novel Context:
- Synopsis: ${(novelSynopsis ?? "").slice(0, 1000) || "Not provided"}
- Main Characters: ${formattedCharacters.slice(0, 2500) || "Not provided"}
- Novel Plan: ${(novelPlan ?? "").slice(0, 800) || "Not provided"}
- Author Intent: ${String(storyDetails?.novel_about ?? "").slice(0, 500) || "Not provided"}
${blueprintSection}
${seriesBlock ? `Series Context:\n${seriesBlock}\n` : ""}

Chapters:
${JSON.stringify(simplified, null, 2)}

Return JSON shaped like:
{
  "${numbers[0]}": {
    "key_dialogue": ["...", "..."],
    "symbolism": ["...", "..."],
    "emotional_pacing": "...",
    "sensory_details": ["...", "..."],
    "foreshadowing": ["...", "..."],
    "scene_goal": "..."
  }
}
Include every chapter number in this batch. Content must be specific to this novel.
`;

      let batchGuide: Record<string, Record<string, unknown>> | null = null;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const response = await runChatCompletion({
          model: baseModel,
          system,
          prompt,
          jsonResponse: true,
          maxTokens: 5000,
          generationMeta,
        });
        batchGuide = parseGuideResponse(response);
        if (batchGuide && numbers.every((n) => isValidGuideEntry(batchGuide![n]))) {
          break;
        }
        // If single pending entry for a one-chapter batch
        if (
          batchGuide?.pending &&
          numbers.length === 1 &&
          isValidGuideEntry(batchGuide.pending)
        ) {
          batchGuide = { [numbers[0]]: batchGuide.pending };
          break;
        }
        batchGuide = null;
      }

      if (!batchGuide) {
        return NextResponse.json(
          {
            error: `Failed to generate chapter guide for chapters ${numbers.join(", ")}. Regenerate.`,
          },
          { status: 422 }
        );
      }

      for (const num of numbers) {
        const entry = batchGuide[num];
        if (!isValidGuideEntry(entry)) {
          return NextResponse.json(
            {
              error: `Chapter guide for chapter ${num} was incomplete or placeholder. Regenerate.`,
            },
            { status: 422 }
          );
        }
        guide[num] = entry;
      }
    }

    const missing = outlineArray
      .map((c, i) => String((c as Record<string, unknown>).number ?? i + 1))
      .filter((n) => !guide[n]);
    if (missing.length) {
      return NextResponse.json(
        {
          error: `Chapter guide missing chapters: ${missing.join(", ")}`,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ guide });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate chapter guide" },
      { status: 500 }
    );
  }
}
