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

Based on these details, generate 15 highly relevant and specific keywords or phrases that real readers might type into a search engine (e.g., Google, Amazon, etc.) to find this novel. Focus on terms that are:
- Natural and conversational (how people actually search)
- Related to the genre, themes, characters, and plot
- Likely to appeal to the target audience
- Optimized for discoverability (including both short and long-tail keywords)

Format your response as a JSON array of strings, with each entry being a keyword or phrase.
`;

    const system = `You are an expert in book marketing and search engine optimization.
Generate specific, relevant keywords that would help readers discover this novel.
Focus on actual search terms people use, not generic descriptors.
Your response should be a JSON array of strings containing exactly 15 keywords/phrases.`;

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
