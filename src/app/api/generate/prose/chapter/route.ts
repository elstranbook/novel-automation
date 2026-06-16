import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveModel, PipelineStep } from "@/lib/modelDefaults";
import { formatCharactersForPrompt, formatPOVCharacterContext } from "@/lib/characterPrompt";

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
    const {
      scene,
      chapterTitle,
      sceneNumber,
      model,
      maxSceneLength,
      chapterSummary,
      chapterBeats,
      previousScene,
      emotionalState,
      keyConflict,
      voiceAnchor,
      worldContext,
      seriesId,
      povCharacter,
      characterContext,
    } = await request.json();

    if (!scene) {
      return NextResponse.json(
        { error: "Scene summary is required" },
        { status: 400 }
      );
    }

    const baseModel = resolveModel(model, PipelineStep.PROSE);
    const trimmedPrevious =
      typeof previousScene === "string"
        ? previousScene.slice(-800)
        : "No previous scene available.";
    const beatsText = Array.isArray(chapterBeats)
      ? chapterBeats
          .map(
            (beat: Record<string, unknown>) =>
              `Beat ${beat.beat_number ?? "?"}: ${beat.action ?? "No action"}`
          )
          .join("\n")
      : "No chapter beats provided.";

    const worldBlock = worldContext
      ? `
World Setting: ${String((worldContext as Record<string, unknown>).setting ?? "").slice(0, 600)}
World Rules: ${String((worldContext as Record<string, unknown>).rules ?? "").slice(0, 600)}
World Lore: ${String((worldContext as Record<string, unknown>).lore ?? "").slice(0, 600)}
World Elements: ${Array.isArray((worldContext as Record<string, unknown>).elements) ? JSON.stringify((worldContext as Record<string, unknown>).elements).slice(0, 800) : ""}
`
      : "";

    // ─── Build character context block ──────────────────────────────────────────
    // Priority: 1) Pre-formatted string passed from client  2) Fetch from DB using seriesId
    let characterBlock = "";
    if (characterContext && typeof characterContext === "string" && characterContext.trim()) {
      characterBlock = characterContext;
    } else if (seriesId) {
      try {
        const { data: characters } = await supabaseAdmin
          .from("series_characters")
          .select("*")
          .eq("series_id", seriesId);
        if (characters && characters.length > 0) {
          // Full cast overview (compact)
          characterBlock = formatCharactersForPrompt(characters, { maxLength: 2500 });
          // POV character deep dive if we can identify them
          if (povCharacter) {
            const povBlock = formatPOVCharacterContext(characters, povCharacter, { maxLength: 2500 });
            if (povBlock) {
              characterBlock = `${povBlock}\n\nOTHER CHARACTERS IN THIS SCENE:\n${characterBlock}`;
            }
          }
        }
      } catch (err) {
        console.warn("[prose] Failed to load character context:", err);
      }
    }

    const contextBlock = `
Chapter Title: ${chapterTitle ?? "Untitled"}
Chapter Summary: ${chapterSummary ?? "Not provided"}
Chapter Beats:\n${beatsText}
Previous Scene (last lines): ${trimmedPrevious}
Character Emotional State: ${emotionalState ?? "Not provided"}
Key Conflict: ${keyConflict ?? "Not provided"}
Voice Anchor: ${voiceAnchor ?? "raw, emotional, slightly messy, introspective"}
${worldBlock}${characterBlock ? `\n${characterBlock}\n` : ""}Scene Summary:\n${scene}
`;

    const longDirective = `
Begin writing Chapter ${chapterTitle ?? "Untitled"}, Scene ${sceneNumber ?? "?"} using the detailed scene summary and context provided.

Writing Guidelines:
– Focus on a slow, deliberate buildup, allowing the emotional tone and character stakes to deepen gradually.
– Use intimate, vivid moments to show the emotional toll of the scene and allow readers to connect with the characters.
– Let dialogue reveal dynamics, tension, or internal struggles. Keep it natural, grounded, and full of subtext.
– Emphasize "show, don't tell" storytelling. Let physical actions, choices, and setting carry emotional and thematic weight.
– Use strong verbs, sensory-rich description, and a deep POV (if applicable) to fully immerse the reader.
– Allow the scene to naturally lead toward its conclusion and, if appropriate, transition smoothly into the next.
${worldBlock ? "– GROUND YOUR WRITING IN THE WORLD. Reference specific locations, rules, lore, and elements from the world context. Characters should interact with their environment authentically — mention place names, cultural details, magical rules, or artifacts where they naturally fit. The world should feel alive and specific, not generic.\n" : ""}${characterBlock ? "– WRITE IN CHARACTER. Use the character profiles above to inform dialogue style, vocabulary, personality, and emotional responses. Each character should speak and act consistently with their defined voice, desires, fears, and personality traits. The POV character's voice profile is especially important — match their speech patterns and vocabulary level.\n" : ""}

Narrative Style:
* Point of View: First-person for the main character
* Tense: Past

Write up to ${maxSceneLength ?? 1000} words of character-driven, emotionally layered prose.
Write only the prose for the scene, without any formatting, headers, or scene numbers.
`;

    const system = `You are an expert fiction writer specializing in deep, emotionally resonant first-person prose. Write immersive, character-driven scenes that follow "show, don't tell" principles. Focus on emotional depth, vivid sensory detail, and authentic dialogue.`;

    const buildPrompt = (instruction: string) => `${contextBlock}\n${instruction}`;

    const validateProse = (text: string) => {
      if (!text.trim()) return false;
      if (text.trim().length < 200) return false;
      const hasDialogue = /"[^"]+"/.test(text);
      const hasAction = /(walked|ran|turned|looked|grabbed|held|sat|stood)/i.test(text);
      return hasDialogue || hasAction;
    };

    const runProse = async (instruction: string) =>
      runChatCompletion({
        model: baseModel,
        system,
        prompt: buildPrompt(instruction),
        jsonResponse: false,
        maxTokens: 3000,
      });

    const attempts = [
      longDirective,
      `${longDirective}\n\nStrict: Follow all instructions. Must be vivid and detailed.`,
      `Write the scene in clear, straightforward prose. Keep first-person past tense and emotional truth.\n${scene}`,
    ];

    let prose = "";
    let usedFallback = false;

    for (let attempt = 0; attempt < attempts.length; attempt += 1) {
      console.info("prose attempt", { sceneNumber, attempt: attempt + 1 });
      const response = await runProse(attempts[attempt]);
      console.info("prose raw output", { sceneNumber, attempt: attempt + 1, response });
      prose = String(response ?? "");
      console.info("prose parsed output", { sceneNumber, attempt: attempt + 1, prose });
      if (validateProse(prose)) {
        await logGeneration({
          step: "prose",
          attempt: attempt + 1,
          success: true,
          usedFallback: false,
        });
        break;
      }
    }

    if (!validateProse(prose)) {
      usedFallback = true;
      const response = await runProse(
        `Recovery mode: Write a simple but complete version of this scene. First-person past tense, 2-4 paragraphs.\n${scene}`
      );
      console.info("prose raw output", { sceneNumber, attempt: attempts.length + 1, response });
      prose = String(response ?? "");
    }

    if (!validateProse(prose)) {
      usedFallback = true;
      prose = `I moved through the moment with a heavy heart, trying to make sense of what just happened. ${scene}`;
    }

    await logGeneration({
      step: "prose",
      attempt: attempts.length + (usedFallback ? 1 : 0),
      success: validateProse(prose),
      usedFallback,
    });

    if (typeof previousScene === "string" && previousScene.trim()) {
      const lastParagraph = previousScene.trim().split(/\n\n+/).slice(-1)[0];
      if (!prose.includes(lastParagraph.trim())) {
        prose = `${lastParagraph}\n\n${prose}`;
      }
    }

    return NextResponse.json({
      prose,
      proseRaw: {
        attempts: attempts.map((instruction, index) => ({
          attempt: index + 1,
          text: instruction,
        })),
        final: prose,
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
