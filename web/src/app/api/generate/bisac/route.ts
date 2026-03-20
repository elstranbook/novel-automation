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
- Theme: ${storyDetails.theme ?? storyDetails.story_theme ?? ""}
- Target Audience: ${storyDetails.audience_age_range ?? storyDetails.target_age_range ?? ""}
- Main Character(s): ${storyDetails.main_character ?? storyDetails.main_character_name ?? ""}
- Central Conflict: ${storyDetails.central_conflict ?? ""}
- Setting: ${storyDetails.setting ?? ""}

Additional context:
${(synopsis ?? "").slice(0, 500)}

Based on these details, suggest 10 BISAC subject categories that best represent this novel. These categories should align with how readers would search for or browse books similar to mine in a bookstore or online retailer. Focus on:
- Broad genres (e.g., Fiction / Fantasy / Epic)
- Specific themes or topics (e.g., Family Life / Coming of Age)
- Target audience considerations (e.g., Juvenile Fiction / Social Themes)
- Any unique elements of the story that might fit niche categories

Format your response as a JSON array of strings, with each entry being a BISAC subject category.
`;

    const system = `You are an expert in book publishing and categorization.
Generate accurate BISAC subject categories that would help bookstores and online retailers properly categorize this novel. Use the official BISAC format (e.g., 'Fiction / Fantasy / Epic').
Include both broad and specific categories. Your response should be a JSON array of strings containing exactly 10 BISAC category suggestions.`;

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
