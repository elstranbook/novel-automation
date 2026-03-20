import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";

export async function POST(request: Request) {
  try {
    const { storyDetails, model } = await request.json();

    if (!storyDetails) {
      return NextResponse.json(
        { error: "Story details are required" },
        { status: 400 }
      );
    }

    const prompt = `
Create a detailed book cover design prompt for the YA novel described below. Include style, color palette, typography suggestions, imagery, mood, and composition notes.

Story Details:
${JSON.stringify(storyDetails, null, 2)}

Return the prompt as plain text.
`;

    const system =
      "You are a creative director specializing in YA book cover design.";

    const response = await runChatCompletion({
      model: model || "gpt-4.1-mini",
      system,
      prompt,
      jsonResponse: false,
    });

    return NextResponse.json({ prompt: response });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate cover prompt" },
      { status: 500 }
    );
  }
}
