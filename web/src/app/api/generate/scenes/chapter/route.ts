import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type SceneSummary = {
  scene_number?: number;
  summary?: string;
  beat_reference?: string;
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

const splitScenesByMarkers = (value: string): string[] => {
  const normalized = value.trim();
  if (!normalized) return [];
  const pattern = /(\n|^)(scene\s+\d+[:.)-]?\s*)/gi;
  const matches = [...normalized.matchAll(pattern)];
  if (matches.length <= 1) {
    return [normalized];
  }
  const indices = matches.map((match) => match.index ?? 0).concat(normalized.length);
  return indices.slice(0, -1).map((start, index) => {
    const end = indices[index + 1];
    return normalized.slice(start, end).trim();
  });
};

const generateScenesForChapter = async ({
  chapter,
  storyDetails,
  chapterBeats,
  model,
  maxSceneLength,
  minSceneLength,
  premisesAndEndings,
  characterProfiles,
}: {
  chapter: Record<string, unknown>;
  storyDetails: Record<string, unknown>;
  chapterBeats?: Array<Record<string, unknown>>;
  model: string;
  maxSceneLength: number;
  minSceneLength: number;
  premisesAndEndings?: Record<string, unknown>;
  characterProfiles?: string;
}): Promise<{ scenes: Array<Record<string, unknown>>; sceneRaw: Record<string, unknown> }> => {
  const chapterInfoRecord: Record<string, unknown> =
    typeof chapter === "object" && chapter ? (chapter as Record<string, unknown>) : {};
  if (!chapterInfoRecord.number) chapterInfoRecord.number = 1;
  if (!chapterInfoRecord.title) chapterInfoRecord.title = "Untitled Chapter";
  if (!chapterInfoRecord.pov) chapterInfoRecord.pov = "Main Character";
  if (!Array.isArray(chapterInfoRecord.events)) {
    chapterInfoRecord.events = ["Key event 1", "Key event 2", "Key event 3"];
  }

  const chapterNumber = chapterInfoRecord.number ?? "?";
  const chapterTitle = chapterInfoRecord.title ?? "Untitled";
  console.info(`Starting scene generation for Chapter ${chapterNumber}: ${chapterTitle}`);
  const chapterInfo = JSON.stringify(chapterInfoRecord, null, 2);

  const beatsForChapter = (() => {
    if (Array.isArray(chapterBeats)) {
      return chapterBeats;
    }
    if (chapterBeats && typeof chapterBeats === "object") {
      const beatsRecord = chapterBeats as Record<string, unknown>;
      const chapterKey = chapterNumber ? String(chapterNumber) : undefined;
      const directBeats = chapterKey ? beatsRecord[chapterKey] : undefined;
      if (Array.isArray(directBeats)) {
        return directBeats;
      }
      return Object.values(beatsRecord).flatMap((value) =>
        Array.isArray(value) ? value : []
      );
    }
    return [];
  })();

  const storyInfoRecord: Record<string, unknown> =
    typeof storyDetails === "object" && storyDetails
      ? (storyDetails as Record<string, unknown>)
      : {};
  if (!storyInfoRecord.genre) storyInfoRecord.genre = "Young Adult Fiction";
  if (!storyInfoRecord.story_theme) storyInfoRecord.story_theme = "Coming of age";
  if (!storyInfoRecord.setting) storyInfoRecord.setting = "Contemporary world";

  const storyInfo = JSON.stringify(storyInfoRecord, null, 2);
  const novelAbout = storyInfoRecord.novel_about ?? "";
  const seriesContext = storyDetails.series_context as
    | {
        canon_entries?: unknown;
        secrets?: unknown;
        relationships?: unknown;
        plot_threads?: unknown;
        callbacks?: unknown;
      }
    | undefined;

  let premisesEndingInfo = "";
  if (premisesAndEndings?.chosen_premise && premisesAndEndings?.chosen_ending) {
    premisesEndingInfo = `
THE PREMISE:
${premisesAndEndings.chosen_premise}

THE ENDING:
${premisesAndEndings.chosen_ending}
`;
    const chapterNumberValue = Number(chapter.number ?? 0);
    if (chapterNumberValue >= 15) {
      premisesEndingInfo +=
        "\nSince this is a later chapter, make sure to build toward the chosen ending.";
    }
  }

  if (!chapterBeats || chapterBeats.length === 0) {
    const prompt = `
Write the complete scenes for Chapter ${chapterNumber}: "${chapterTitle}" in the novel "${
      storyDetails.title ?? ""
    }".

STORY DETAILS:
${storyInfo}
${novelAbout ? `\nAUTHOR INTENT (What the novel is about):\n${novelAbout}\n` : ""}

CHAPTER INFORMATION:
${chapterInfo}

${premisesEndingInfo}

Guidelines:
1. Create 2-5 distinct scenes for this chapter based on the key events
2. Each scene should be between ${minSceneLength} and ${maxSceneLength} words
3. Stay consistent with the POV specified in the chapter information
4. Include dialogue, description, and character development
5. Write in first-person past tense from the POV character's perspective
6. Connect each scene with clear transitions

Format the response as a JSON array of scene strings. Return just the array of scene strings.
`;

    const system = `You are a professional novelist writing scenes for Chapter ${chapterNumber} in the novel '${
      storyDetails.title ?? ""
    }'.
Write compelling, immersive scenes that advance the plot and develop the characters.
Use first-person past tense from the POV character's perspective.
Return your scenes ONLY as a JSON array of strings.`;

    const response = await runChatCompletion({
      model,
      system,
      prompt,
      jsonResponse: false,
      maxTokens: 8000,
    });

    let parsed: unknown = response;
    try {
      if (typeof response === "string") {
        const match = response.match(/\[[\s\S]*\]/);
        parsed = match ? JSON.parse(match[0]) : JSON.parse(response);
      }
    } catch {
      parsed = null;
    }

    if (Array.isArray(parsed)) {
      return {
        scenes: parsed as Array<Record<string, unknown>>,
        sceneRaw: {
          input: { chapterNumber, chapterTitle, beatsCount: beatsForChapter.length },
          output: parsed,
          parsed,
        },
      };
    }

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const parsedRecord = parsed as Record<string, unknown>;
      if (Array.isArray(parsedRecord.scenes)) {
        return {
          scenes: parsedRecord.scenes as Array<Record<string, unknown>>,
          sceneRaw: {
            input: { chapterNumber, chapterTitle, beatsCount: beatsForChapter.length },
            output: parsedRecord.scenes,
            parsed: parsedRecord.scenes,
          },
        };
      }
      const sceneKeys = Object.keys(parsedRecord).filter((key) =>
        key.toLowerCase().startsWith("scene")
      );
      if (sceneKeys.length > 0) {
        const scenes = safeMap<string, unknown>(
          sceneKeys.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
          (key) => parsedRecord[key] ?? ""
        );
        return {
          scenes: scenes as Array<Record<string, unknown>>,
          sceneRaw: {
            input: { chapterNumber, chapterTitle, beatsCount: beatsForChapter.length },
            output: scenes,
            parsed: scenes,
          },
        };
      }
      const scenes = Object.values(parsedRecord);
      return {
        scenes: scenes as Array<Record<string, unknown>>,
        sceneRaw: {
          input: { chapterNumber, chapterTitle, beatsCount: beatsForChapter.length },
          output: scenes,
          parsed: scenes,
        },
      };
    }

    if (typeof response === "string" && response.trim()) {
      const splitScenes = splitScenesByMarkers(response);
      const scenes = splitScenes.length > 0 ? splitScenes : [response.trim()];
      return {
        scenes: scenes as Array<Record<string, unknown>>,
        sceneRaw: {
          input: { chapterNumber, chapterTitle, beatsCount: beatsForChapter.length },
          output: scenes,
          parsed: scenes,
        },
      };
    }

    const scenes = [`Scene for Chapter ${chapterNumber}: ${chapterTitle}`];
    return {
      scenes,
      sceneRaw: {
        input: { chapterNumber, chapterTitle, beatsCount: beatsForChapter.length },
        output: scenes,
        parsed: scenes,
      },
    };
  }

  const beatsForChapter = (() => {
    if (Array.isArray(chapterBeats)) {
      return chapterBeats;
    }
    if (chapterBeats && typeof chapterBeats === "object") {
      const beatsRecord = chapterBeats as Record<string, unknown>;
      const chapterKey = chapterNumber ? String(chapterNumber) : undefined;
      const directBeats = chapterKey ? beatsRecord[chapterKey] : undefined;
      if (Array.isArray(directBeats)) {
        return directBeats;
      }
      return Object.values(beatsRecord).flatMap((value) =>
        Array.isArray(value) ? value : []
      );
    }
    return [];
  })();

  const beatsList = Array.isArray(beatsForChapter) ? beatsForChapter : [];
  console.info(`Chapter beats count: ${beatsList.length}`);
  const beatsText = safeMap<Beat, string>(beatsList, (beat) =>
    `Beat ${beat.beat_number ?? "?"}: ${
      beat.action ?? "No action"
    }\nEmotional Impact: ${
      beat.emotional_impact ?? "None"}
    \nTension/Hook: ${beat.tension_hook ?? "None"}`
  ).join("\n\n");

  const baseContext = `
Chapter Summary:
${chapter.summary ?? "No summary available"}

Author Intent (What the novel is about):
${novelAbout}

Series Context:
${seriesContext ? JSON.stringify(seriesContext).slice(0, 1600) : ""}
Canon Facts:
${seriesContext?.canon_entries ? JSON.stringify(seriesContext.canon_entries).slice(0, 800) : ""}
Mysteries:
${seriesContext?.secrets ? JSON.stringify(seriesContext.secrets).slice(0, 800) : ""}
Relationships:
${seriesContext?.relationships ? JSON.stringify(seriesContext.relationships).slice(0, 800) : ""}
Plot Threads:
${seriesContext?.plot_threads ? JSON.stringify(seriesContext.plot_threads).slice(0, 800) : ""}
Callbacks:
${seriesContext?.callbacks ? JSON.stringify(seriesContext.callbacks).slice(0, 800) : ""}

Chapter Story Beats:
${beatsText}

Character Information:
${characterProfiles ?? "No character profiles available"}

${premisesEndingInfo}

Additional Information:
- Genre: ${storyDetails.genre ?? "Young Adult Fiction"}
- Theme: ${storyDetails.story_theme ?? "Coming of age"}
- Setting: ${storyDetails.setting ?? "Contemporary world"}
`;

  const strictPrompt = `
Using the chapter summary and story beats, create structured scene summaries for Chapter ${chapterNumber} of "${
    storyDetails.title ?? ""
  }".

Rules:
– Generate exactly ${beatsList.length || "the same number of"} scenes, one scene per beat, in order.
– Each scene must be a concise, concrete summary that can be expanded into prose later.
– Include a beat reference (e.g., "Beat 1").

Return ONLY valid JSON in this format:
[
  {"scene_number": 1, "summary": "...", "beat_reference": "Beat 1"}
]

${baseContext}
`;

  const simplifiedPrompt = `
Write ${beatsList.length || ""} short scene summaries from the beats below.
Return JSON array with scene_number, summary, beat_reference.

${baseContext}
`;

  const recoveryPrompt = `
Write ${beatsList.length || 5} simple scene summaries (one per beat).
Return JSON array with scene_number, summary, beat_reference.
Chapter summary: ${chapter.summary ?? "No summary available"}
`;

  const system = `You are a professional story planner creating structured scene summaries.
Return valid JSON only.`;

  const runAttempt = async (prompt: string, attempt: number) => {
    console.info("chapter_scenes attempt", { chapterNumber, attempt });
    const response = await runChatCompletion({
      model,
      system,
      prompt,
      jsonResponse: false,
      maxTokens: 4000,
    });
    console.info("chapter_scenes raw output", { chapterNumber, attempt, response });
    let parsed: unknown = response;
    try {
      if (typeof response === "string") {
        const match = response.match(/\[[\s\S]*\]/);
        parsed = match ? JSON.parse(match[0]) : JSON.parse(response);
      }
    } catch (error) {
      console.warn("chapter_scenes parse error", { chapterNumber, attempt, error });
      parsed = null;
    }

    if (Array.isArray(parsed)) {
      const cleaned = parsed.map((item, index) => {
        const scene = item as Record<string, unknown>;
        return {
          scene_number: Number(scene.scene_number ?? index + 1),
          summary: String(scene.summary ?? scene.scene ?? ""),
          beat_reference: String(scene.beat_reference ?? `Beat ${index + 1}`),
        };
      });
      return { parsed: cleaned, success: cleaned.every((scene) => scene.summary) };
    }

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const parsedRecord = parsed as Record<string, unknown>;
      if (Array.isArray(parsedRecord.scenes)) {
        return { parsed: parsedRecord.scenes, success: true };
      }
      const sceneKeys = Object.keys(parsedRecord).filter((key) =>
        key.toLowerCase().startsWith("scene")
      );
      if (sceneKeys.length > 0) {
        const scenes = safeMap<string, SceneSummary>(
          sceneKeys.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
          (key) => ({ summary: String(parsedRecord[key] ?? "") })
        );
        return { parsed: scenes, success: scenes.length > 0 };
      }
    }

    if (typeof response === "string" && response.trim()) {
      const splitScenes = splitScenesByMarkers(response);
      const scenes = splitScenes.map((text, index) => ({
        scene_number: index + 1,
        summary: text,
        beat_reference: `Beat ${index + 1}`,
      }));
      return { parsed: scenes, success: scenes.length > 0 };
    }

    return { parsed: null, success: false };
  };

  const attempts = [strictPrompt, simplifiedPrompt, recoveryPrompt];
  for (let attempt = 0; attempt < attempts.length; attempt += 1) {
    const { parsed, success } = await runAttempt(attempts[attempt], attempt + 1);
    console.info("chapter_scenes parsed output", { chapterNumber, attempt: attempt + 1, parsed });
    if (success && parsed) {
      await logGeneration({
        step: "scenes",
        attempt: attempt + 1,
        success: true,
        usedFallback: false,
      });
      return {
        scenes: parsed as Array<Record<string, unknown>>,
        sceneRaw: {
          input: {
            chapterNumber,
            chapterTitle,
            beatsCount: beatsList.length,
          },
          output: parsed,
          parsed,
        },
      };
    }
  }

  await logGeneration({
    step: "scenes",
    attempt: attempts.length,
    success: false,
    usedFallback: true,
  });

  const fallbackScenes = beatsList.map((beat, index) => ({
    scene_number: index + 1,
    summary: (beat as Beat).action ?? `Scene for Beat ${index + 1}`,
    beat_reference: `Beat ${index + 1}`,
  }));

  return {
    scenes: fallbackScenes,
    sceneRaw: {
      input: {
        chapterNumber,
        chapterTitle,
        beatsCount: beatsList.length,
      },
      output: fallbackScenes,
      parsed: fallbackScenes,
    },
  };
};

export async function POST(request: Request) {
  try {
    const {
      chapter,
      storyDetails,
      chapterBeats,
      model,
      maxSceneLength,
      minSceneLength,
      premisesAndEndings,
      characterProfiles,
    } = await request.json();

    if (!storyDetails || !chapter) {
      return NextResponse.json(
        { error: "Story details and chapter are required" },
        { status: 400 }
      );
    }

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
      safeChapter.title ?? safeChapter.chapter_title ?? safeChapter.name ?? "Untitled";

    const result = await generateScenesForChapter({
      chapter,
      storyDetails,
      chapterBeats,
      model: model || "gpt-4.1-mini",
      maxSceneLength: maxSceneLength ?? 1000,
      minSceneLength: minSceneLength ?? 300,
      premisesAndEndings,
      characterProfiles,
    });

    const chapterTitle = `Chapter ${chapterNumber ?? "?"}: ${chapterTitleValue}`;

    const normalizedScenes = Array.isArray(result.scenes)
      ? result.scenes.map((scene) =>
          typeof scene === "string" ? scene : JSON.stringify(scene)
        )
      : [typeof result.scenes === "string" ? result.scenes : JSON.stringify(result.scenes)];

    return NextResponse.json({
      chapterTitle,
      scenes: normalizedScenes,
      sceneRaw: result.sceneRaw,
    });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Failed to generate scenes";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
