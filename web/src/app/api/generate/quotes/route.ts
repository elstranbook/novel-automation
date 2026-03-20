import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";

export async function POST(request: Request) {
  try {
    const { storyDetails, model, chapterOutline, scenes } = await request.json();

    if (!storyDetails) {
      return NextResponse.json(
        { error: "Story details are required" },
        { status: 400 }
      );
    }

    const prompt = `
Generate 10 memorable quote snippets from the YA novel described below. Use the story details and any provided outline/scenes to create plausible quotes.

Story Details:
${JSON.stringify(storyDetails, null, 2)}

Chapter Outline:
${JSON.stringify(chapterOutline ?? {}, null, 2)}

Scenes (optional):
${JSON.stringify(scenes ?? {}, null, 2)}

Return a JSON array of quote strings.
`;

    const system =
      "You are a YA novelist creating emotionally resonant quote snippets for marketing.";

    const response = await runChatCompletion({
      model: model || "gpt-4.1-mini",
      system,
      prompt,
      jsonResponse: true,
    });

    return NextResponse.json({ quotes: response });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate quotes" },
      { status: 500 }
    );
  }
}
