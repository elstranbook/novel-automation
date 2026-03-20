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
Using the story details below, write a detailed three-act structure synopsis for the novel. The synopsis should be written in 3 distinct sections: Act I, Act II, and Act III.

Story Details (JSON):
${JSON.stringify(storyDetails, null, 2)}

Rules:
- Each act should be labeled clearly with Act I, Act II, Act III
- Provide 2-3 paragraphs per act
- Focus on emotional stakes, character growth, and central conflict
`;

    const system =
      "You are a professional YA novelist. Write a rich three-act synopsis with emotional depth and clear character arcs.";

    const response = await runChatCompletion({
      model: model || "gpt-4.1-mini",
      system,
      prompt,
      jsonResponse: false,
    });

    return NextResponse.json({ synopsis: response });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate synopsis" },
      { status: 500 }
    );
  }
}
