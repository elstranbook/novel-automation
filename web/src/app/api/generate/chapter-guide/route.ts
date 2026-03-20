import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";

export async function POST(request: Request) {
  try {
    const { chapterOutline, model } = await request.json();

    if (!chapterOutline) {
      return NextResponse.json(
        { error: "Chapter outline is required" },
        { status: 400 }
      );
    }

    const prompt = `
Using the chapter outline below, create a detailed chapter-by-chapter writing guide. For each chapter provide:
- scene_goal
- key_dialogue (3-5 lines)
- emotional_pacing
- sensory_details (3-5 items)
- foreshadowing (1-3 hints)
- symbolism (1-3 symbols)

Chapter Outline:
${JSON.stringify(chapterOutline, null, 2)}

Return a JSON object where each key is the chapter number (as a string) and each value is an object with the fields above.
`;

    const system =
      "You are a professional writing coach. Provide a detailed guide for each chapter with actionable storytelling cues.";

    const response = await runChatCompletion({
      model: model || "gpt-4.1-mini",
      system,
      prompt,
      jsonResponse: true,
    });

    return NextResponse.json({ guide: response });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate chapter guide" },
      { status: 500 }
    );
  }
}
