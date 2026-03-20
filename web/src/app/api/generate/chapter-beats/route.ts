import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";

export async function POST(request: Request) {
  try {
    const { chapterOutline, chapterGuide, model } = await request.json();

    if (!chapterOutline || !chapterGuide) {
      return NextResponse.json(
        { error: "Chapter outline and guide are required" },
        { status: 400 }
      );
    }

    const prompt = `
Using the chapter outline and chapter guide below, create action beats for every chapter.

For each chapter, provide 5-8 beats with:
- beat_number
- action
- emotional_impact
- tension_hook

Chapter Outline:
${JSON.stringify(chapterOutline, null, 2)}

Chapter Guide:
${JSON.stringify(chapterGuide, null, 2)}

Return JSON with chapter numbers as keys and arrays of beats as values.
`;

    const system =
      "You are a professional YA novelist. Provide action beats that drive momentum and emotional tension.";

    const response = await runChatCompletion({
      model: model || "gpt-4.1-mini",
      system,
      prompt,
      jsonResponse: true,
    });

    const outlineArray = Array.isArray(chapterOutline)
      ? chapterOutline
      : (chapterOutline?.chapters as Array<Record<string, unknown>>) ?? [];

    const beats: Record<string, Array<Record<string, unknown>>> =
      response && typeof response === "object"
        ? { ...(response as Record<string, Array<Record<string, unknown>>>) }
        : {};

    outlineArray.forEach((chapter, index) => {
      const number = String(
        (chapter as Record<string, unknown>).number ?? index + 1
      );
      if (!beats[number]) {
        beats[number] = [
          {
            beat_number: 1,
            action: "Introduce the scene goal.",
            emotional_impact: "Establishes stakes.",
            tension_hook: "A new complication emerges.",
          },
        ];
      }
    });

    return NextResponse.json({ beats });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate chapter beats" },
      { status: 500 }
    );
  }
}
