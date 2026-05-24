import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";
import { resolveModel, PipelineStep } from "@/lib/modelDefaults";

export async function POST(request: Request) {
  try {
    const { title, novelAbout, model, seriesContext } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const prompt = `
I am writing a Young Adult Novel titled "${title}".
${novelAbout ? `\nHere is what I want the novel to be about:\n${novelAbout}\n` : ""}${seriesContext ? `\nSeries context to honor:\n${JSON.stringify(seriesContext, null, 2)}\n` : ""}
Give me the following details:
1. story_theme: The central theme or message of the novel
2. genre: The specific genre or genres this novel belongs to
3. central_concept: The core idea or high-concept premise of the story
4. estimated_word_count: The estimated word count for the complete novel
5. target_age_range: The intended young adult audience age range (e.g., 12-15, 16-18)
6. main_character_name: The name of the protagonist
7. central_conflict: The primary challenge or conflict the main character faces
8. setting: The primary world/location where the story takes place
9. time_period: When the story takes place
10. supporting_characters: 4-6 key supporting characters with names and brief descriptions
11. plot_summary: A 2-3 paragraph summary of the overall plot
12. narrative_style: First person, third person limited, omniscient, etc.
13. novel_about: Use the author's input as a guiding summary of what the novel is about.

Format the response as a JSON object with exactly these keys.
`;

    const systemMessage =
      "You are a professional young adult novelist skilled at creating compelling story outlines. Your task is to create a detailed YA novel structure that appeals to teen readers. Respect any provided series context for continuity.";

    const result = await runChatCompletion({
      model: resolveModel(model, PipelineStep.STORY_DETAILS),
      system: systemMessage,
      prompt,
      jsonResponse: true,
      maxTokens: 1200,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Story details generation error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate story details";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
