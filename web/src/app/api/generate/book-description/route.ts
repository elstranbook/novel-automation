import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";

export async function POST(request: Request) {
  try {
    const { storyDetails, model, descriptionType, lengthType } =
      await request.json();

    if (!storyDetails) {
      return NextResponse.json(
        { error: "Story details are required" },
        { status: 400 }
      );
    }

    const prompt = `
Write a ${lengthType ?? "standard"} ${descriptionType ?? "marketing"} description for the YA novel described below.

Story Details:
${JSON.stringify(storyDetails, null, 2)}

Return the description as plain text.
`;

    const system =
      "You are a professional book marketer. Craft compelling YA book descriptions.";

    const response = await runChatCompletion({
      model: model || "gpt-4.1-mini",
      system,
      prompt,
      jsonResponse: false,
    });

    return NextResponse.json({ description: response });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate book description" },
      { status: 500 }
    );
  }
}
