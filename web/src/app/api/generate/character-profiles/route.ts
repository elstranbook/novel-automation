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
Write detailed character profiles for the novel described below.

Story Details:
${JSON.stringify(storyDetails, null, 2)}

Include:
- Protagonist profile (background, goals, flaws, growth arc)
- Supporting characters with motivations and conflicts
- Antagonist or opposing force details
- Relationship dynamics among characters

Return the output as rich markdown text.
`;

    const system =
      "You are a professional YA novelist crafting deep, nuanced character profiles.";

    const response = await runChatCompletion({
      model: model || "gpt-4.1-mini",
      system,
      prompt,
      jsonResponse: false,
    });

    return NextResponse.json({ profiles: response });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate character profiles" },
      { status: 500 }
    );
  }
}
