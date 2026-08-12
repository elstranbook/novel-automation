import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
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

type Beat = {
  beat_number?: number;
  action?: string;
  emotional_impact?: string;
  tension_hook?: string;
};

const logGeneration = async (payload: {
  step: string;
  attempt: number;
  success: boolean;
  usedFallback: boolean;
}) => {
  try {
    await supabaseAdmin.from("generation_logs").insert({
      step: payload.step,
      attempt: payload.attempt,
      success: payload.success,
      used_fallback: payload.usedFallback,
    });
  } catch (error) {
    console.warn("Failed to write generation log", error);
  }
};

const parseJsonArray = (raw: unknown) => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) {
      return JSON.parse(match[0]);
    }
    return JSON.parse(raw);
  }
  return null;
};

const validateBeats = (beatsList: Beat[], expected: number) => {
  if (!Array.isArray(beatsList)) return false;
  if (beatsList.length !== expected) return false;
  return beatsList.every(
    (beat) =>
      beat.action &&
      beat.emotional_impact &&
      !/initial challenge related to the chapter's main conflict/i.test(
        String(beat.action)
      )
  );
};

const desiredBeatCount = (
  chapter: Record<string, unknown>,
  chapterIndex: number,
  totalChapters: number
): number => {
  const words = Number(
    chapter.estimated_word_count ?? chapter.word_count ?? 900
  );
  const ratio = totalChapters > 0 ? (chapterIndex + 1) / totalChapters : 0.5;
  const isClimaxRegion = ratio >= 0.85 && ratio <= 0.95;
  const isLowestRegion = ratio >= 0.7 && ratio < 0.8;
  if (words < 700) return 3;
  if (words >= 1400 || isClimaxRegion || isLowestRegion) return 7;
  return 5;
};

export async function POST(request: Request) {
  try {
    const {
      chapterOutline,
      chapterGuide,
      synopsis,
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
          : "";

    if (!chapterOutline || !chapterGuide) {
      return NextResponse.json(
        { error: "Chapter outline and guide are required" },
        { status: 400 }
      );
    }

    const outlineArray = Array.isArray(chapterOutline)
      ? chapterOutline
      : (chapterOutline?.chapters as Array<Record<string, unknown>>) ?? [];

    const beats: Record<string, Array<Record<string, unknown>>> = {};
    const beatsRaw: {
      attempts: Array<{ attempt: number; output: unknown }>;
      final: Beat[];
    } = {
      attempts: [],
      final: [],
    };

    const effectiveBlueprint =
      seriesContext?.book_blueprint ?? storyDetails?.book_blueprint ?? null;
    const seriesBlock = formatSeriesContextForPrompt(seriesContext, {
      includeCharacters: false,
      priority: true,
      maxLength: 6500,
    });
    const generationMeta = seriesGenerationMeta(
      storyDetails,
      "chapter-beats",
      seriesId
    );
    const resolvedModel = resolveModel(model, PipelineStep.CHAPTER_BEATS);

    for (let i = 0; i < outlineArray.length; i += 1) {
      const chapterRecord = outlineArray[i] as Record<string, unknown>;
      const chapterNum = String(
        chapterRecord.number ?? i + 1
      );
      const chapterTitle = chapterRecord.title ?? "Untitled Chapter";
      const chapterSummary = chapterRecord.summary ?? "No summary available";
      const guideDetails =
        (chapterGuide as Record<string, unknown>)[chapterNum] ?? {};
      const expected = desiredBeatCount(
        chapterRecord,
        i,
        outlineArray.length
      );

      console.info(
        `Generating ${expected} action beats for Chapter ${chapterNum}: ${chapterTitle}...`
      );

      const blueprintSection = effectiveBlueprint
        ? `\n═══ BOOK BLUEPRINT — MANDATORY STRUCTURAL PLAN ═══\nYour action beats MUST align with this blueprint:\n${JSON.stringify(effectiveBlueprint, null, 2)}\n═══ END BLUEPRINT ═══\n`
        : "";

      const baseContext = `
Chapter: ${chapterNum}: ${chapterTitle}
Chapter Outline: ${JSON.stringify(chapterRecord, null, 2)}
Chapter Summary: ${chapterSummary}
Additional Story Information:
- Synopsis: ${synopsis ?? ""}
- Character Profiles: ${formattedCharacters || characterProfiles || ""}
- Novel Plan: ${(novelPlan ?? "").toString().slice(0, 1200)}
- Author Intent: ${storyDetails?.novel_about ?? ""}
${blueprintSection}
${seriesBlock ? `Series Context:\n${seriesBlock}\n` : ""}
- Chapter Guide: ${JSON.stringify(guideDetails, null, 2)}
`;

      const strictPrompt = `
Take the chapter summary and produce exactly ${expected} action beats that progress the chapter from opening to closing.

${baseContext}

Rules:
– Always use proper nouns (character names, locations, etc.).
– Each beat must include a clear action, a resulting emotional shift, and a hanging tension/hook.
– Beats must be sequential and build momentum. No beat may be redundant.
– Use specific, concrete events that can be written as scenes.

Return ONLY a JSON array of exactly ${expected} objects with these fields:
- "beat_number": integer (1-${expected})
- "action": string
- "emotional_impact": string
- "tension_hook": string
`;

      const simplifiedPrompt = `
Create ${expected} sequential chapter beats using the summary and outline below.
Return a JSON array of ${expected} objects with beat_number, action, emotional_impact, tension_hook.

${baseContext}
`;

      const system = `You are a professional novelist and writing coach creating detailed action beats for a chapter.
Return valid JSON only.`;

      const runAttempt = async (prompt: string, attempt: number) => {
        console.info("chapter_beats attempt", { chapterNum, attempt });
        const response = await runChatCompletion({
          model: resolvedModel,
          system,
          prompt,
          jsonResponse: false,
          maxTokens: 4000,
          generationMeta,
        });
        const rawLog = { attempt, output: response };
        try {
          const parsed = parseJsonArray(response);
          if (Array.isArray(parsed) && validateBeats(parsed as Beat[], expected)) {
            return { parsed, success: true, raw: rawLog };
          }
          return { parsed, success: false, raw: rawLog };
        } catch (error) {
          console.warn("chapter_beats parse error", {
            chapterNum,
            attempt,
            error,
          });
          return { parsed: null, success: false, raw: rawLog };
        }
      };

      const attempts = [strictPrompt, simplifiedPrompt];
      let finalParsed: Beat[] | null = null;
      const rawAttempts: Array<{ attempt: number; output: unknown }> = [];

      for (let attempt = 0; attempt < attempts.length; attempt += 1) {
        const { parsed, success, raw } = await runAttempt(
          attempts[attempt],
          attempt + 1
        );
        rawAttempts.push(raw);
        if (success && Array.isArray(parsed)) {
          finalParsed = parsed as Beat[];
          await logGeneration({
            step: "beats",
            attempt: attempt + 1,
            success: true,
            usedFallback: false,
          });
          break;
        }
      }

      if (!finalParsed) {
        await logGeneration({
          step: "beats",
          attempt: attempts.length,
          success: false,
          usedFallback: false,
        });
        return NextResponse.json(
          {
            error: `Failed to generate beats for chapter ${chapterNum}. Regenerate chapter beats.`,
            beats,
            beatsRaw: { attempts: rawAttempts, final: [] },
          },
          { status: 422 }
        );
      }

      beats[chapterNum] = finalParsed;
      beatsRaw.attempts = rawAttempts;
      beatsRaw.final = finalParsed;
    }

    return NextResponse.json({ beats, beatsRaw });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate chapter beats" },
      { status: 500 }
    );
  }
}
