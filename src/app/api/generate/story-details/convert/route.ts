import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";
import { resolveModel, PipelineStep } from "@/lib/modelDefaults";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const { description, model } = await request.json();

    if (!description || typeof description !== "string" || !description.trim()) {
      return NextResponse.json(
        { error: "A description is required" },
        { status: 400 }
      );
    }

    const prompt = `
I have a description of a novel. Convert it into structured story details.

Here is the description:
${description.trim()}

Extract or infer the following details and return them as a JSON object with exactly these keys:
1. title: The novel's title (extract from description or give a best guess)
2. genre: The specific genre or genres (do not force Young Adult unless the description calls for it)
3. story_theme: The central theme or message
4. central_concept: The core idea or high-concept premise
5. estimated_word_count: Estimated word count appropriate for the genre/audience (often 70000-90000 for adult; shorter for middle grade/YA when relevant)
6. target_age_range: The intended audience age range if inferable (e.g., 8-12, 13-18, Adult); otherwise leave as "General"
7. main_character_name: The name of the protagonist
8. central_conflict: The primary challenge or conflict the main character faces
9. setting: The primary world/location where the story takes place
10. time_period: When the story takes place
11. supporting_characters: 3-5 key supporting characters with names and brief descriptions (as an array of objects with name and description fields)
12. plot_summary: A 2-3 paragraph summary of the overall plot
13. narrative_style: First person, third person limited, omniscient, etc. (infer from description; do not default to first person)
14. novel_about: A concise summary of what the novel is about

Use the information from the description as much as possible. If something isn't mentioned, make a reasonable inference based on the genre and what is described. Do not leave any field empty.

Format the response as a JSON object with exactly these keys.
`;

    const systemMessage =
      "You are a professional novelist and editor skilled at analyzing book descriptions and extracting structured details. Convert a plain text description into structured story details. Match genre and audience to the material; do not assume Young Adult unless specified. Be specific and creative with inferences while staying true to the provided description.";

    const result = await runChatCompletion({
      model: resolveModel(model, PipelineStep.STORY_DETAILS),
      system: systemMessage,
      prompt,
      jsonResponse: true,
      maxTokens: 1500,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Story details conversion error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to convert description";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
