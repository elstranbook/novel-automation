import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";

export async function POST(request: Request) {
  try {
    const { storyDetails, model, synopsis } = await request.json();

    if (!storyDetails) {
      return NextResponse.json(
        { error: "Story details are required" },
        { status: 400 }
      );
    }

    const prompt = `
Generate 20 search keywords that potential readers might use to discover the novel described below.

Story Details:
${JSON.stringify(storyDetails, null, 2)}

Synopsis (if available):
${synopsis ?? ""}

Return a JSON array of keyword strings.
`;

    const system =
      "You are a book marketing expert. Provide high-intent search keywords for YA readers.";

    const response = await runChatCompletion({
      model: model || "gpt-4.1-mini",
      system,
      prompt,
      jsonResponse: true,
    });

    return NextResponse.json({ keywords: response });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate keywords" },
      { status: 500 }
    );
  }
}
