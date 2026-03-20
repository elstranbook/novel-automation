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
Create a structured novel plan based on the story details below. The plan should include:
- Story structure (acts or parts)
- Key turning points
- Character arcs
- Thematic progression
- Pacing guidance

Story Details:
${JSON.stringify(storyDetails, null, 2)}
`;

    const system =
      "You are a professional story architect. Provide a structured novel plan with clear beats and emotional progression.";

    const response = await runChatCompletion({
      model: model || "gpt-4.1-mini",
      system,
      prompt,
      jsonResponse: false,
    });

    return NextResponse.json({ plan: response });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate novel plan" },
      { status: 500 }
    );
  }
}
