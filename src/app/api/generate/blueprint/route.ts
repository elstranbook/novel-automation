import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";
import { resolveModel, PipelineStep } from "@/lib/modelDefaults";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type BlueprintRequest = {
  title: string;
  novelAbout?: string;
  model?: string;
  genre?: string;
  targetAgeRange?: string;
  narrativeStyle?: string;
};

export async function POST(request: Request) {
  try {
    const { title, novelAbout, model, genre, targetAgeRange, narrativeStyle } =
      (await request.json()) as BlueprintRequest;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const genreLabel = String(genre ?? "").trim() || "fiction";
    const audience = String(targetAgeRange ?? "").trim();
    const style = String(narrativeStyle ?? "").trim();

    const prompt = `
Generate a detailed BOOK BLUEPRINT for a standalone ${genreLabel} novel titled "${title}".
${novelAbout ? `\nThe author describes the novel as follows:\n${novelAbout}\n` : ""}
${audience ? `Target audience: ${audience}\n` : ""}
${style ? `Narrative style: ${style}\n` : ""}

Create a complete structural outline including:

1) OPENING SHIFT
   - The inciting incident that starts the story
   - What changes the protagonist's world at the beginning
   - The hook that pulls readers in

2) MIDPOINT SHOCK
   - The major revelation or reversal at the story's midpoint
   - How it changes everything the protagonist believed
   - The point of no return

3) LOWEST EMOTIONAL POINT
   - The all-is-lost moment
   - The protagonist's deepest despair or doubt
   - What brings them to their knees

4) CLIMAX
   - The final confrontation or decisive moment
   - What's at stake and why it matters
   - How the central conflict is resolved

5) ENDING CHANGE
   - How the protagonist's world is different now
   - The character transformation the reader witnesses
   - The emotional resolution that satisfies the arc

6) RELATIONSHIP CHANGES
   - How key relationships evolve through the story
   - New alliances, friendships, or breaks
   - Romantic developments if relevant to the story

7) THEME PRESSURE
   - How the central themes are tested and explored
   - Thematic questions the story raises
   - Symbolic moments that reinforce the theme

8) FULL OUTLINE
   - Chapter-by-chapter breakdown (15-25 chapters)
   - Key scenes per chapter
   - Emotional beats throughout the story

Return as JSON with exactly these keys:
{
  "opening_shift": "...",
  "midpoint_shock": "...",
  "lowest_point": "...",
  "climax": "...",
  "ending_change": "...",
  "relationship_changes": "...",
  "theme_pressure": "...",
  "full_outline": "Chapter 1: ... Chapter 2: ... etc"
}

Note: This is a STANDALONE novel (not part of a series), so do NOT include a "next_book_setup" field.
`;

    const system = `You are an expert novel architect for ${genreLabel}. Create emotionally powerful
book outlines with perfect pacing, shocking twists, and satisfying arcs. Every
chapter must serve the story. Build toward the climax with mounting tension.
This is a standalone novel, so deliver a complete, self-contained narrative arc.
Match the stated genre and audience; do not assume Young Adult unless the material calls for it.`;

    const response = await runChatCompletion({
      model: resolveModel(model, PipelineStep.STANDALONE_BLUEPRINT),
      system,
      prompt,
      jsonResponse: true,
      maxTokens: 6000,
    });

    return NextResponse.json({ blueprint: response });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate book blueprint" },
      { status: 500 }
    );
  }
}
