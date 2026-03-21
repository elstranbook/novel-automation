import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const { scene, chapterTitle, sceneNumber, model, maxSceneLength } =
      await request.json();

    if (!scene) {
      return NextResponse.json(
        { error: "Scene summary is required" },
        { status: 400 }
      );
    }

    const prompt = `
${scene}

Begin writing Chapter ${chapterTitle}, Scene ${sceneNumber} using the detailed scene summary provided.

The writing should naturally reflect the scene's genre, tone, point of view, setting, and key characters—all of which can be inferred from the scene summary provided.

Writing Guidelines:
– Focus on a slow, deliberate buildup, allowing the emotional tone and character stakes to deepen gradually.
– Use intimate, vivid moments to show the emotional toll of the scene and allow readers to connect with the characters.
– Let dialogue reveal dynamics, tension, or internal struggles. Keep it natural, grounded, and full of subtext.
– Emphasize "show, don't tell" storytelling. Let physical actions, choices, and setting carry emotional and thematic weight.
– Use strong verbs, sensory-rich description, and a deep POV (if applicable) to fully immerse the reader.
– Allow the scene to naturally lead toward its conclusion and, if appropriate, transition smoothly into the next.

Narrative Style:
* Point of View: First-person for the main character
* Tense: Past

Write up to ${maxSceneLength ?? 1000} words of character-driven, emotionally layered prose.
Let the scene summary guide your tone, structure, pacing, and character focus.

Write only the prose for the scene, without any formatting, headers, or scene numbers.
`;

    const system = `You are an expert fiction writer specializing in deep, emotionally resonant first-person prose. Write immersive, character-driven scenes that follow "show, don't tell" principles. Focus on emotional depth, vivid sensory detail, and authentic dialogue.`;

    const response = await runChatCompletion({
      model: model || "gpt-4.1-mini",
      system,
      prompt,
      jsonResponse: false,
      maxTokens: 3000,
    });

    return NextResponse.json({ prose: response });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate prose" },
      { status: 500 }
    );
  }
}
