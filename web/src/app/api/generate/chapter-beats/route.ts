import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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
  return beatsList.every((beat) => beat.action && beat.emotional_impact);
};

export async function POST(request: Request) {
  try {
    const { chapterOutline, chapterGuide, synopsis, characterProfiles, novelPlan, storyDetails, model } =
      await request.json();

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

    for (const chapter of outlineArray) {
      const chapterRecord = chapter as Record<string, unknown>;
      const chapterNum = String(chapterRecord.number ?? outlineArray.indexOf(chapter) + 1);
      const chapterTitle = chapterRecord.title ?? "Untitled Chapter";
      const chapterSummary = chapterRecord.summary ?? "No summary available";
      const guideDetails = (chapterGuide as Record<string, unknown>)[chapterNum] ?? {};

      console.info(`Generating detailed action beats for Chapter ${chapterNum}: ${chapterTitle}...`);

      const baseContext = `
Chapter: ${chapterNum}: ${chapterTitle}
Chapter Outline: ${JSON.stringify(chapterRecord, null, 2)}
Chapter Summary: ${chapterSummary}
Additional Story Information:
- Synopsis: ${synopsis ?? ""}
- Character Profiles: ${characterProfiles ?? ""}
- Novel Plan: ${novelPlan ?? ""}
- Author Intent: ${storyDetails?.novel_about ?? ""}
- Series Context: ${storyDetails?.series_context ? JSON.stringify(storyDetails.series_context).slice(0, 1600) : ""}
- Canon Facts: ${storyDetails?.series_context?.canon_entries ? JSON.stringify(storyDetails.series_context.canon_entries).slice(0, 800) : ""}
- Mysteries: ${storyDetails?.series_context?.secrets ? JSON.stringify(storyDetails.series_context.secrets).slice(0, 800) : ""}
- Relationships: ${storyDetails?.series_context?.relationships ? JSON.stringify(storyDetails.series_context.relationships).slice(0, 800) : ""}
- Plot Threads: ${storyDetails?.series_context?.plot_threads ? JSON.stringify(storyDetails.series_context.plot_threads).slice(0, 800) : ""}
- Callbacks: ${storyDetails?.series_context?.callbacks ? JSON.stringify(storyDetails.series_context.callbacks).slice(0, 800) : ""}
- Chapter Guide: ${JSON.stringify(guideDetails, null, 2)}
`;

      const strictPrompt = `
Take the chapter summary and produce exactly 5 action beats that progress the chapter from opening to closing.

${baseContext}

Rules:
– Always use proper nouns (character names, locations, etc.).
– Each beat must include a clear action, a resulting emotional shift, and a hanging tension/hook.
– Beats must be sequential and build momentum. No beat may be redundant.
– Use specific, concrete events that can be written as scenes.

Return ONLY a JSON array of exactly 5 objects with these fields:
- "beat_number": integer (1-5)
- "action": string
- "emotional_impact": string
- "tension_hook": string
`;

      const simplifiedPrompt = `
Create 5 sequential chapter beats using the summary and outline below.
Return a JSON array of 5 objects with beat_number, action, emotional_impact, tension_hook.

${baseContext}
`;

      const recoveryPrompt = `
Write 5 simple beats (1-5) as JSON objects with action, emotional_impact, tension_hook.
Chapter summary: ${chapterSummary}
`;

      const system = `You are a professional novelist and writing coach creating detailed action beats for a chapter.
Return valid JSON only.`;

      const runAttempt = async (prompt: string, attempt: number) => {
        console.info("chapter_beats attempt", { chapterNum, attempt });
        const response = await runChatCompletion({
          model: model || "gpt-4.1-mini",
          system,
          prompt,
          jsonResponse: false,
          maxTokens: 4000,
        });
        console.info("chapter_beats raw output", { chapterNum, attempt, response });
        try {
          const parsed = parseJsonArray(response);
          console.info("chapter_beats parsed output", { chapterNum, attempt, parsed });
          if (Array.isArray(parsed) && validateBeats(parsed as Beat[], 5)) {
            return { parsed, success: true };
          }
          return { parsed, success: false };
        } catch (error) {
          console.warn("chapter_beats parse error", { chapterNum, attempt, error });
          return { parsed: null, success: false };
        }
      };

      const attempts = [strictPrompt, simplifiedPrompt, recoveryPrompt];
      let finalParsed: Beat[] | null = null;
      let usedFallback = false;

      for (let attempt = 0; attempt < attempts.length; attempt += 1) {
        const { parsed, success } = await runAttempt(attempts[attempt], attempt + 1);
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
        usedFallback = true;
        finalParsed = [
          {
            beat_number: 1,
            action: "Character faces an initial challenge related to the chapter's main conflict",
            emotional_impact: "Starts with confidence but shifts to uncertainty as obstacles arise",
            tension_hook: "Will they make the right choice when faced with unexpected resistance?",
          },
          {
            beat_number: 2,
            action: "A key conversation reveals important information or character dynamics",
            emotional_impact: "Surprise or concern as new information changes their understanding",
            tension_hook: "How will they adapt their approach with this new knowledge?",
          },
          {
            beat_number: 3,
            action: "An unexpected complication makes the character's goal more difficult",
            emotional_impact: "Frustration turns to determination as they commit to overcoming the obstacle",
            tension_hook: "Can they find a creative solution before time runs out?",
          },
          {
            beat_number: 4,
            action: "Character makes progress but at a cost or sacrifice",
            emotional_impact: "Relief mixed with concern about the consequences of their actions",
            tension_hook: "Will the sacrifice they made come back to haunt them?",
          },
          {
            beat_number: 5,
            action: "Resolution of immediate problem creates a new question or direction",
            emotional_impact: "Satisfaction with current progress but anxiety about what comes next",
            tension_hook: "How will this apparent victory affect their overall journey?",
          },
        ];
        await logGeneration({
          step: "beats",
          attempt: attempts.length,
          success: false,
          usedFallback: true,
        });
      }

      beats[chapterNum] = finalParsed;
    }

    return NextResponse.json({ beats });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate chapter beats" },
      { status: 500 }
    );
  }
}
