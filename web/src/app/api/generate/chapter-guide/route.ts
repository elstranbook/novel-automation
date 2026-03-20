import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";

export async function POST(request: Request) {
  try {
    const { chapterOutline, novelSynopsis, characterProfiles, novelPlan, model } =
      await request.json();

    if (!chapterOutline) {
      return NextResponse.json(
        { error: "Chapter outline is required" },
        { status: 400 }
      );
    }

    const outlineArray = Array.isArray(chapterOutline)
      ? chapterOutline
      : (chapterOutline?.chapters as Array<Record<string, unknown>>) ?? [];

    const simplifiedOutline = outlineArray.map((chapter, index) => {
      const record = chapter as Record<string, unknown>;
      return {
        number: record.number ?? index + 1,
        title: record.title ?? `Chapter ${index + 1}`,
        summary: record.summary ?? "No summary available",
      };
    });

    const chapterOutlineJson = JSON.stringify(simplifiedOutline, null, 2);

    const prompt = `
Create a detailed chapter guide for the young adult novel (approximately 120000 words).

Novel Context:
- Synopsis: ${(novelSynopsis ?? "").slice(0, 1000) || "Not provided"}
- Main Characters: ${(characterProfiles ?? "").slice(0, 1000) || "Not provided"}
- Novel Plan: ${(novelPlan ?? "").slice(0, 1000) || "Not provided"}

Chapter Outline: ${chapterOutlineJson}

For EACH CHAPTER NUMBER in the outline, create a guide with these EXACT fields:
1. key_dialogue: 3-4 specific lines or exchanges that reveal character or advance plot
2. symbolism: 2-3 symbolic elements that reinforce themes
3. emotional_pacing: A clear description of the emotional arc in the chapter
4. sensory_details: 3-4 vivid sensory descriptions to include
5. foreshadowing: 2-3 subtle hints about future developments
6. scene_goal: A concise statement of what the viewpoint character wants to achieve

Your response must be VALID JSON with this exact structure (example for ONE chapter):
{
  "1": {
    "key_dialogue": [
      "I can't go back there. Not after what happened.",
      "Sometimes the thing we're most afraid of is exactly what we need to face.",
      "Promise me you won't tell anyone what you saw."
    ],
    "symbolism": [
      "The broken watch represents Emma's feelings of being stuck in time",
      "The locked garden gate symbolizes opportunities just out of reach"
    ],
    "emotional_pacing": "The chapter begins with anxiety, shifts to cautious hope, then ends with determination.",
    "sensory_details": [
      "The scent of lemon polish mixing with dust in the old library",
      "The feel of cool metal keys against sweaty palms",
      "The distant echo of laughter from the school cafeteria"
    ],
    "foreshadowing": [
      "The strange symbol on the library book will become significant later",
      "Mr. Peterson's unexplained absence hints at the trouble to come"
    ],
    "scene_goal": "Emma needs to find the missing journal before anyone discovers it's gone."
  }
}

Create entries for ALL chapters in the outline, following this exact format.
Do not include any explanatory text outside the JSON structure.
All fields are required for every chapter.
`;

    const system = `You are an expert YA novelist creating a detailed chapter guide.

IMPORTANT INSTRUCTIONS:
1. Format your ENTIRE response as a VALID JSON object
2. Each chapter must have ALL required fields (key_dialogue, symbolism, emotional_pacing, sensory_details, foreshadowing, scene_goal)
3. Each array field must contain multiple concrete examples, not generic placeholders
4. The content should be specific to the novel and avoid generic writing advice
5. Do not include any text, explanations or comments outside the JSON structure
6. Ensure your JSON is properly formatted with correct quotes, commas, and braces

Your response will be parsed directly as JSON and any formatting errors will cause failure.`;

    const response = await runChatCompletion({
      model: model || "gpt-4.1-mini",
      system,
      prompt,
      jsonResponse: true,
      maxTokens: 3000,
    });

    const guide: Record<string, Record<string, unknown>> =
      response && typeof response === "object"
        ? { ...(response as Record<string, Record<string, unknown>>) }
        : {};

    outlineArray.forEach((chapter, index) => {
      const number = String(
        (chapter as Record<string, unknown>).number ?? index + 1
      );
      if (!guide[number]) {
        guide[number] = {
          key_dialogue: ["Character reveals a goal."],
          symbolism: ["A recurring motif"],
          emotional_pacing: "Builds tension and character growth.",
          sensory_details: ["Atmosphere", "Lighting", "Sound"],
          foreshadowing: ["A subtle hint of future conflict."],
          scene_goal: "Advance the plot and emotional arc.",
        };
      }
    });

    return NextResponse.json({ guide });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate chapter guide" },
      { status: 500 }
    );
  }
}
