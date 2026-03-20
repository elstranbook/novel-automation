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
I am working on a novel with the following details:
- Title: ${storyDetails.title ?? ""}
- Genre: ${storyDetails.genre ?? ""}
- Theme: ${storyDetails.story_theme ?? storyDetails.theme ?? ""}
- Target Audience: ${storyDetails.target_age_range ?? ""}
- Main Character(s): ${storyDetails.main_character_name ?? ""}
- Central Conflict: ${storyDetails.central_conflict ?? ""}
- Setting: ${storyDetails.setting ?? ""}

Additional context:
${synopsis ?? ""}

Based on these details, suggest 10 BISAC subject categories that best represent this novel. These categories should align with how readers would search for or browse books similar to mine in a bookstore or online retailer.

Format your response as a JSON array of strings.
`;

    const system =
      "You are an expert in book publishing and categorization. Generate accurate BISAC subject categories.";

    const response = await runChatCompletion({
      model: model || "gpt-4.1-mini",
      system,
      prompt,
      jsonResponse: true,
    });

    return NextResponse.json({ categories: response });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate BISAC categories" },
      { status: 500 }
    );
  }
}
