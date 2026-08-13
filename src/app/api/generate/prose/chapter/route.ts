import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveModel, PipelineStep } from "@/lib/modelDefaults";
import { loadSeriesContext } from "@/lib/seriesContext";
import {
  buildProseSystemPrompt,
  buildRevisePrompt,
  buildSceneCardPrompt,
  DRAFT_TEMPERATURE,
  filterSeriesForScene,
  inferPacing,
  lastNWords,
  parseScenePayload,
  extractSceneCastNames,
  proseMaxTokens,
  REVISE_TEMPERATURE,
  validateProseDraft,
  isLengthOnlyFailure,
  type BeatLike,
  type ScenePacing,
} from "@/lib/prosePrompt";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      scene,
      chapterTitle,
      sceneNumber,
      sceneCount,
      model,
      maxSceneLength,
      chapterSummary,
      chapterBeats,
      beat: beatFromClient,
      previousScene,
      previousSceneEnding,
      previousChapterEnding,
      emotionalState,
      keyConflict,
      chapterGoal,
      pacing: pacingFromClient,
      narrativeStyle,
      voiceSample,
      seriesId,
      bookNumber,
      chapterNumber,
      povCharacter,
      characterContext,
      castNames: castNamesFromClient,
      sensory,
      keyDialogue,
      chosenEnding,
      isLateBook,
      novelId,
      totalChapters,
    } = body;

    if (!scene) {
      return NextResponse.json(
        { error: "Scene summary is required" },
        { status: 400 }
      );
    }

    const parsed = parseScenePayload(scene);
    if (!parsed.summary.trim()) {
      return NextResponse.json(
        { error: "Scene summary is empty or unreadable" },
        { status: 400 }
      );
    }

    const wordTarget = Number(maxSceneLength) || 1000;
    const maxTokens = proseMaxTokens(wordTarget);
    const draftModel = resolveModel(model, PipelineStep.PROSE);
    const reviseModel = resolveModel(model, PipelineStep.PROSE_REVISE);

    let matchingBeat: BeatLike | null =
      beatFromClient && typeof beatFromClient === "object"
        ? (beatFromClient as BeatLike)
        : null;

    if (!matchingBeat && Array.isArray(chapterBeats)) {
      const idx =
        Number(parsed.sceneNumber ?? sceneNumber ?? 1) - 1;
      const byRef = parsed.beatReference
        ? chapterBeats.find((b: BeatLike) =>
            String(b.beat_number ?? "").includes(
              String(parsed.beatReference).replace(/\D/g, "")
            )
          )
        : null;
      matchingBeat =
        (byRef as BeatLike) ||
        (chapterBeats[Math.max(0, idx)] as BeatLike) ||
        null;
    }

    const continuityEnding =
      lastNWords(
        String(
          previousSceneEnding ||
            previousChapterEnding ||
            previousScene ||
            ""
        ),
        200
      ) || "";

    let characterBlock = "";
    let seriesBlock = "";
    let hasCanon = false;
    let hasMystery = false;
    let hasPlots = false;
    let hasTimeline = false;
    let blueprintPosition:
      | "opening"
      | "midpoint"
      | "lowest"
      | "climax"
      | "ending"
      | "normal" = "normal";

    if (seriesId) {
      try {
        const live = await loadSeriesContext(
          seriesId,
          Number(bookNumber) || 1
        );
        const fromScene = extractSceneCastNames(scene);
        const fromClient = Array.isArray(castNamesFromClient)
          ? castNamesFromClient.map((n: unknown) => String(n).trim()).filter(Boolean)
          : [];
        const castNames = Array.from(new Set([...fromClient, ...fromScene]));
        const chapterNum = Number(chapterNumber) || 0;
        const filtered = filterSeriesForScene(live, {
          bookNumber: Number(bookNumber) || live.book_number || 1,
          chapterNumber: chapterNum,
          totalChapters: Number(totalChapters) || 0,
          povCharacter: povCharacter ?? null,
          castNames,
        });
        seriesBlock = filtered.block;
        characterBlock = filtered.characterBlock;
        hasCanon = filtered.hasCanon;
        hasMystery = filtered.hasMystery;
        hasPlots = filtered.hasPlots;
        hasTimeline = filtered.hasTimeline;

        const ratio =
          chapterNum > 0 && Number(totalChapters) > 0
            ? chapterNum / Number(totalChapters)
            : isLateBook
              ? 0.9
              : 0.4;
        if (ratio <= 0.15) blueprintPosition = "opening";
        else if (ratio >= 0.45 && ratio <= 0.58) blueprintPosition = "midpoint";
        else if (ratio >= 0.65 && ratio <= 0.78) blueprintPosition = "lowest";
        else if (ratio >= 0.82 && ratio < 0.93) blueprintPosition = "climax";
        else if (ratio >= 0.93) blueprintPosition = "ending";
      } catch (err) {
        console.warn("[prose] Failed to load live series context:", err);
      }
    }

    if (
      characterContext &&
      typeof characterContext === "string" &&
      characterContext.trim()
    ) {
      const profiles = characterContext.trim();
      if (!characterBlock) {
        characterBlock = profiles;
      } else if (characterBlock.length < 400) {
        characterBlock = `${characterBlock}\n\nBOOK CHARACTER PROFILES (supplement):\n${profiles.slice(0, 2000)}`;
      }
    }

    // Generate voice sample on the fly if missing and we can persist it
    let resolvedVoiceSample =
      typeof voiceSample === "string" && voiceSample.trim()
        ? voiceSample.trim()
        : "";

    if (!resolvedVoiceSample && povCharacter) {
      try {
        const styleHint = String(narrativeStyle ?? "").trim() || "the story's established POV and tense";
        const sampleRaw = await runChatCompletion({
          model: draftModel,
          system:
            "You write short voice samples for fiction protagonists. No plot. No analysis.",
          prompt: `Write about 160 words in the voice of ${povCharacter}. Mundane moment only (waiting, washing a mug, walking home). Match narrative style: ${styleHint}. No plot stakes.`,
          jsonResponse: false,
          maxTokens: 500,
          temperature: 0.7,
        });
        resolvedVoiceSample = String(sampleRaw ?? "").trim();
        if (resolvedVoiceSample && novelId) {
          try {
            const { data: novelRow } = await supabaseAdmin
              .from("novels")
              .select("story_details")
              .eq("id", novelId)
              .maybeSingle();
            const details =
              (novelRow?.story_details as Record<string, unknown>) ?? {};
            await supabaseAdmin
              .from("novels")
              .update({
                story_details: {
                  ...details,
                  voice_sample: resolvedVoiceSample,
                },
              })
              .eq("id", novelId);
          } catch (persistErr) {
            console.warn("[prose] Failed to persist voice_sample:", persistErr);
          }
        }
      } catch (voiceErr) {
        console.warn("[prose] Failed to generate voice sample:", voiceErr);
      }
    }

    const pacing: ScenePacing =
      pacingFromClient === "sprint" ||
      pacingFromClient === "talky" ||
      pacingFromClient === "linger" ||
      pacingFromClient === "aftermath"
        ? pacingFromClient
        : inferPacing(matchingBeat, {
            estimatedWordCount: wordTarget,
            blueprintPosition,
          });

    const system = buildProseSystemPrompt(
      narrativeStyle,
      povCharacter ?? null
    );

    const sceneCard = buildSceneCardPrompt({
      chapterTitle: chapterTitle ?? "Untitled",
      sceneNumber: sceneNumber ?? parsed.sceneNumber ?? "?",
      sceneCount,
      summary: parsed.summary,
      beat: matchingBeat,
      chapterSummary,
      chapterGoal,
      emotionalState,
      keyConflict,
      pacing,
      maxSceneLength: wordTarget,
      narrativeStyle,
      voiceSample: resolvedVoiceSample,
      povCharacter,
      previousEnding: continuityEnding,
      sensory,
      keyDialogue,
      chosenEnding,
      isLateBook: Boolean(isLateBook),
      characterBlock,
      seriesBlock,
      hasCanon,
      hasMystery,
      hasPlots,
      hasTimeline,
    });

    const runDraft = async () =>
      runChatCompletion({
        model: draftModel,
        system,
        prompt: sceneCard,
        jsonResponse: false,
        maxTokens,
        temperature: DRAFT_TEMPERATURE,
        generationMeta: seriesId
          ? { seriesId, type: "prose" }
          : undefined,
      });

    let draft = "";
    let draftOk = false;
    let lastDraftValidation: ReturnType<typeof validateProseDraft> | null = null;
    const warnings: string[] = [];

    for (let attempt = 0; attempt < 2; attempt += 1) {
      console.info("prose draft attempt", {
        sceneNumber,
        attempt: attempt + 1,
      });
      const response = await runDraft();
      draft = String(response ?? "").trim();
      const validation = validateProseDraft(draft, parsed.summary, {
        maxSceneLength: wordTarget,
      });
      lastDraftValidation = validation;
      if (validation.ok) {
        draftOk = true;
        await logGeneration({
          step: "prose",
          attempt: attempt + 1,
          success: true,
          usedFallback: false,
        });
        break;
      }
      // Length-only miss: keep draft and proceed to revise (do not burn retries).
      if (isLengthOnlyFailure(validation)) {
        draftOk = true;
        warnings.push(
          `length_off_target:${validation.wordCount ?? "?"}/${validation.wordTarget ?? wordTarget}`
        );
        await logGeneration({
          step: "prose",
          attempt: attempt + 1,
          success: true,
          usedFallback: true,
        });
        console.warn(
          "prose draft length-only miss; proceeding to revise",
          validation.reason,
          validation.wordCount,
          validation.wordTarget
        );
        break;
      }
      console.warn("prose draft rejected", validation.reason);
    }

    if (!draftOk) {
      await logGeneration({
        step: "prose",
        attempt: 2,
        success: false,
        usedFallback: false,
      });
      return NextResponse.json(
        {
          error:
            "Prose draft failed validation after retries. Regenerate this scene.",
          validationReason: lastDraftValidation?.reason ?? "unknown",
          proseRaw: { draft, summary: parsed.summary },
        },
        { status: 500 }
      );
    }

    const buildRevise = (sourceDraft: string) =>
      buildRevisePrompt({
        draft: sourceDraft,
        voiceSample: resolvedVoiceSample,
        narrativeStyle,
        povCharacter,
        summary: parsed.summary,
        beat: matchingBeat,
        pacing,
        maxSceneLength: wordTarget,
        previousEnding: continuityEnding,
        hasMystery,
        hasCanon,
        hasPlots,
        hasTimeline,
        seriesBlock,
      });

    let prose = draft;
    for (let reviseAttempt = 0; reviseAttempt < 2; reviseAttempt += 1) {
      try {
        const revised = await runChatCompletion({
          model: reviseModel,
          system:
            "You are a line editor. Rewrite the scene. Keep plot, POV, and facts. Improve the sentences. Return only the rewritten prose.",
          prompt: buildRevise(prose),
          jsonResponse: false,
          maxTokens,
          temperature: REVISE_TEMPERATURE,
          generationMeta: seriesId
            ? { seriesId, type: "prose_revise" }
            : undefined,
        });
        const revisedText = String(revised ?? "").trim();
        const revisedOk = validateProseDraft(revisedText, parsed.summary, {
          maxSceneLength: wordTarget,
        });
        if (revisedOk.ok) {
          prose = revisedText;
          // Length fixed by revise — drop prior length warning if present.
          const cleaned = warnings.filter(
            (w) => !w.startsWith("length_off_target:")
          );
          warnings.length = 0;
          warnings.push(...cleaned);
          break;
        }
        if (isLengthOnlyFailure(revisedOk)) {
          // Prefer revised text even if still off-band; soft-accept.
          prose = revisedText;
          const marker = `length_off_target:${revisedOk.wordCount ?? "?"}/${revisedOk.wordTarget ?? wordTarget}`;
          const withoutOld = warnings.filter(
            (w) => !w.startsWith("length_off_target:")
          );
          warnings.length = 0;
          warnings.push(...withoutOld, marker);
          console.warn(
            "[prose] revise length-only miss; soft-accepting",
            revisedOk.reason,
            "attempt",
            reviseAttempt + 1
          );
          break;
        }
        console.warn(
          "[prose] revise rejected:",
          revisedOk.reason,
          "attempt",
          reviseAttempt + 1
        );
      } catch (reviseErr) {
        console.warn("[prose] revise failed, keeping draft:", reviseErr);
        break;
      }
    }

    return NextResponse.json({
      prose,
      voiceSample: resolvedVoiceSample || null,
      warnings: warnings.length ? warnings : undefined,
      proseRaw: {
        draft,
        final: prose,
        pacing,
        summary: parsed.summary,
        beat: matchingBeat,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate prose" },
      { status: 500 }
    );
  }
}
