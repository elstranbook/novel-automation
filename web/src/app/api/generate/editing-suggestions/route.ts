import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";

export async function POST(request: Request) {
  try {
    const { text, model, contentId, contentType } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const prompt = `
Analyze the following ${contentType ?? "scene"} and provide:
- overall_assessment
- strengths (list)
- weaknesses (list)
- suggestions (list)

Text:
${text}

Format the response as JSON with keys: overall_assessment, strengths, weaknesses, suggestions.
`;

    const system =
      "You are a professional fiction editor. Provide concise, actionable feedback.";

    const response = await runChatCompletion({
      model: model || "gpt-4.1-mini",
      system,
      prompt,
      jsonResponse: true,
    });

    return NextResponse.json({
      contentId,
      contentType,
      suggestions: response,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate editing suggestions" },
      { status: 500 }
    );
  }
}
