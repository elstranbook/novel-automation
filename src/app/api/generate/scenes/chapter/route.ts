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
import { parseScenePayload } from "@/lib/prosePrompt";

type SceneSummary = {
  scene_number: number;
  summary: string;
  beat_reference: string;
  cast?: string[];
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

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type Beat = {
  beat_number?: number;
  action?: string;
  emotional_impact?: string;
  tension_hook?: string;
};

const safeMap = <T, U>(value: unknown, mapper: (item: T) => U): U[] =>
  Array.isArray(value) ? (value as T[]).map(mapper) : [];

const normalizeSceneList = (
  parsed: unknown,
  beatsList: Beat[]
): SceneSummary[] | null => {
  if (!parsed) return null;

  const parseCast = (value: unknown): string[] | undefined => {
    if (Array.isArray(value)) {
      const names = value
        .map((item) =>
          typeof item === "string"
            ? item.trim()
            : String(
                (item as Record<string, unknown>)?.name ??
                  (item as Record<string, unknown>)?.character ??
                  ""
              ).trim()
        )
        .filter(Boolean);
      return names.length ? names : undefined;
    }
    if (typeof value === "string" && value.trim()) {
      const names = value
        .split(/,|&|\band\b/i)
        .map((s) => s.trim())
        .filter(Boolean);
      return names.length ? names : undefined;
    }
    return undefined;
  };

  const toScene = (item: unknown, index: number): SceneSummary | null => {
    const fromPayload = parseScenePayload(item);
    const summary = fromPayload.summary.trim();
    if (!summary || /^Scene for Chapter/i.test(summary)) return null;
    let cast: string[] | undefined;
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const rec = item as Record<string, unknown>;
      cast =
        parseCast(rec.cast) ||
        parseCast(rec.characters) ||
        parseCast(rec.character_names) ||
        parseCast(rec.cast_names);
    }
    return {
      scene_number: fromPayload.sceneNumber ?? index + 1,
      summary,
      beat_reference:
        fromPayload.beatReference ??
        `Beat ${fromPayload.sceneNumber ?? index + 1}`,
      ...(cast ? { cast } : {}),
    };
  };

  if (Array.isArray(parsed)) {
    const scenes = parsed
      .map((item, index) => toScene(item, index))
      .filter(Boolean) as SceneSummary[];
    return scenes.length ? scenes : null;
  }

  if (typeof parsed === "object") {
    const record = parsed as Record<string, unknown>;
    if (Array.isArray(record.scenes)) {
      return normalizeSceneList(record.scenes, beatsList);
    }
  }

  if (typeof parsed === "string" && parsed.trim()) {
    const one = toScene(parsed, 0);
    return one ? [one] : null;
  }

  return null;
};

const generateScenesForChapter = async ({
  chapter,
  storyDetails,
  chapterBeats,
  model,
  premisesAndEndings,
  characterProfiles,
  totalChapters,
}: {
  chapter: Record<string, unknown>;
  storyDetails: Record<string, unknown>;
  chapterBeats?: Array<Record<string, unknown>>;
  model: string;
  premisesAndEndings?: Record<string, unknown>;
  characterProfiles?: string;
  totalChapters?: number;
}): Promise<{ scenes: SceneSummary[]; sceneRaw: Record<string, unknown> }> => {
  const chapterInfoRecord: Record<string, unknown> =
    typeof chapter === "object" && chapter ? chapter : {};
  if (!chapterInfoRecord.number) chapterInfoRecord.number = 1;
  if (!chapterInfoRecord.title) chapterInfoRecord.title = "Untitled Chapter";
  if (!chapterInfoRecord.pov) chapterInfoRecord.pov = "Main Character";

  const chapterNumber = chapterInfoRecord.number ?? "?";
  const chapterTitle = chapterInfoRecord.title ?? "Untitled";
  console.info(
    `Starting scene generation for Chapter ${chapterNumber}: ${chapterTitle}`
  );

  const beatsForChapter = (() => {
    if (Array.isArray(chapterBeats)) return chapterBeats;
    if (chapterBeats && typeof chapterBeats === "object") {
      const beatsRecord = chapterBeats as Record<string, unknown>;
      const chapterKey = chapterNumber ? String(chapterNumber) : undefined;
      const directBeats = chapterKey ? beatsRecord[chapterKey] : undefined;
      if (Array.isArray(directBeats)) return directBeats;
      return Object.values(beatsRecord).flatMap((value) =>
        Array.isArray(value) ? value : []
      );
    }
    return [];
  })();

  const seriesContext = getSeriesContext(storyDetails);
  const seriesCharacters = seriesContext?.characters;
  const formattedCharacters =
    Array.isArray(seriesCharacters) && seriesCharacters.length > 0
      ? formatCharactersForPrompt(seriesCharacters, { maxLength: 2500 })
      : typeof characterProfiles === "string"
        ? characterProfiles.slice(0, 2500)
        : "No character profiles available";

  const seriesBlock = formatSeriesContextForPrompt(seriesContext, {
    includeCharacters: false,
    priority: true,
    maxLength: 6500,
  });

  let premisesEndingInfo = "";
  if (
    premisesAndEndings?.chosen_premise &&
    premisesAndEndings?.chosen_ending
  ) {
    premisesEndingInfo = `
THE PREMISE:
${premisesAndEndings.chosen_premise}

THE ENDING:
${premisesAndEndings.chosen_ending}
`;
    const chapterNumberValue = Number(chapter.number ?? 0);
    const total = Math.max(Number(totalChapters) || 0, chapterNumberValue, 1);
    const lateCutoff = Math.floor(total * 0.85);
    if (chapterNumberValue >= lateCutoff) {
      premisesEndingInfo +=
        "\nSince this is a later chapter, make sure to build toward the chosen ending.";
    }
  }

  const beatsList = Array.isArray(beatsForChapter) ? beatsForChapter : [];
  const expected =
    beatsList.length > 0
      ? beatsList.length
      : Math.min(
          5,
          Math.max(
            2,
            Array.isArray(chapterInfoRecord.events)
              ? chapterInfoRecord.events.length
              : 3
          )
        );

  const beatsText =
    beatsList.length > 0
      ? safeMap<Beat, string>(beatsList, (beat) =>
          `Beat ${beat.beat_number ?? "?"}: ${
            beat.action ?? "No action"
          }\nEmotional Impact: ${
            beat.emotional_impact ?? "None"
          }\nTension/Hook: ${beat.tension_hook ?? "None"}`
        ).join("\n\n")
      : `Derive ${expected} scenes from chapter events:\n${JSON.stringify(
          chapterInfoRecord.events ?? [],
          null,
          2
        )}`;

  const baseContext = `
Chapter Summary:
${chapter.summary ?? "No summary available"}

Author Intent:
${storyDetails.novel_about ?? ""}

${seriesBlock ? `Series Context:\n${seriesBlock}\n` : ""}

Chapter Story Beats:
${beatsText}

Character Information:
${formattedCharacters}

${premisesEndingInfo}

Additional Information:
- Genre: ${storyDetails.genre ?? "Fiction"}
- Theme: ${storyDetails.story_theme ?? "Coming of age"}
- Setting: ${storyDetails.setting ?? "Contemporary world"}
- POV: ${chapterInfoRecord.pov}
`;

  const strictPrompt = `
Using the chapter summary and story beats, create structured SCENE SUMMARIES (not prose) for Chapter ${chapterNumber} of "${
    storyDetails.title ?? ""
  }".

Rules:
– Generate exactly ${expected} scenes${beatsList.length ? ", one scene per beat, in order" : ""}.
– Each scene must be a concise, concrete summary that can be expanded into prose later.
– Include a beat reference (e.g., "Beat 1").
– Include "cast": an array of character names present in that scene (from the profiles when possible).
– Do NOT write full prose. Summaries only.

Return ONLY valid JSON in this format:
[
  {"scene_number": 1, "summary": "...", "beat_reference": "Beat 1", "cast": ["Name A", "Name B"]}
]

${baseContext}
`;

  const simplifiedPrompt = `
Write ${expected} short scene summaries from the beats/events below.
Return JSON array with scene_number, summary, beat_reference, and cast (array of names). Summaries only, not prose.

${baseContext}
`;

  const system = `You are a professional story planner creating structured scene summaries.
Return valid JSON only. Never write full scene prose.`;

  const runAttempt = async (prompt: string, attempt: number) => {
    console.info("chapter_scenes attempt", { chapterNumber, attempt });
    const response = await runChatCompletion({
      model,
      system,
      prompt,
      jsonResponse: false,
      maxTokens: 4000,
      generationMeta: seriesGenerationMeta(
        storyDetails,
        "scenes",
        typeof storyDetails.series_id === "string"
          ? storyDetails.series_id
          : null
      ),
    });
    let parsed: unknown = response;
    try {
      if (typeof response === "string") {
        const match = response.match(/\[[\s\S]*\]/);
        parsed = match ? JSON.parse(match[0]) : JSON.parse(response);
      }
    } catch {
      parsed = response;
    }

    const scenes = normalizeSceneList(parsed, beatsList as Beat[]);
    const success =
      !!scenes &&
      scenes.length === expected &&
      scenes.every((s) => s.summary.trim().length > 20);
    return { parsed: scenes, success, raw: response };
  };

  const attempts = [strictPrompt, simplifiedPrompt];
  for (let attempt = 0; attempt < attempts.length; attempt += 1) {
    const { parsed, success, raw } = await runAttempt(
      attempts[attempt],
      attempt + 1
    );
    if (success && parsed) {
      await logGeneration({
        step: "scenes",
        attempt: attempt + 1,
        success: true,
        usedFallback: false,
      });
      return {
        scenes: parsed,
        sceneRaw: {
          input: {
            chapterNumber,
            chapterTitle,
            beatsCount: beatsList.length,
            expected,
          },
          output: raw,
          parsed,
        },
      };
    }
  }

  await logGeneration({
    step: "scenes",
    attempt: attempts.length,
    success: false,
    usedFallback: false,
  });

  throw new Error(
    `Failed to generate scene summaries for Chapter ${chapterNumber}. Regenerate scenes.`
  );
};

export async function POST(request: Request) {
  try {
    const {
      chapter,
      storyDetails: rawDetails,
      chapterBeats,
      model,
      premisesAndEndings,
      characterProfiles,
      seriesId,
      bookNumber,
      totalChapters,
    } = await request.json();

    if (!rawDetails || !chapter) {
      return NextResponse.json(
        { error: "Story details and chapter are required" },
        { status: 400 }
      );
    }

    const storyDetails =
      (await hydrateStoryDetailsWithLiveSeriesContext(
        rawDetails,
        seriesId,
        bookNumber
      )) ?? rawDetails;

    const safeChapter = chapter as Record<string, unknown>;
    const chapterNumber =
      typeof safeChapter.number === "number" ||
      typeof safeChapter.number === "string"
        ? safeChapter.number
        : typeof safeChapter.chapter_number === "number" ||
            typeof safeChapter.chapter_number === "string"
          ? safeChapter.chapter_number
          : undefined;
    const chapterTitleValue =
      safeChapter.title ??
      safeChapter.chapter_title ??
      safeChapter.name ??
      "Untitled";

    // Resolve beats for this chapter if a map was passed
    let beatsForChapter = chapterBeats;
    if (
      chapterBeats &&
      typeof chapterBeats === "object" &&
      !Array.isArray(chapterBeats) &&
      chapterNumber != null
    ) {
      const map = chapterBeats as Record<string, unknown>;
      const direct = map[String(chapterNumber)];
      if (Array.isArray(direct)) beatsForChapter = direct;
    }

    const result = await generateScenesForChapter({
      chapter,
      storyDetails,
      chapterBeats: beatsForChapter as Array<Record<string, unknown>>,
      model: resolveModel(model, PipelineStep.SCENES_CHAPTER),
      premisesAndEndings,
      characterProfiles,
      totalChapters: Number(totalChapters) || undefined,
    });

    const chapterTitle = `Chapter ${chapterNumber ?? "?"}: ${chapterTitleValue}`;

    // Return structured scenes (objects). Studio normalizeScenesResponse can stringify;
    // prose route parses via parseScenePayload.
    return NextResponse.json({
      chapterTitle,
      scenes: result.scenes,
      sceneRaw: result.sceneRaw,
    });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Failed to generate scenes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
