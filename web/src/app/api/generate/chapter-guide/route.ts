import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";

const createDefaultChapterEntry = () => ({
  key_dialogue: [
    "This is where a revealing line of dialogue would appear.",
    "Here's where a character would express their emotions.",
    "This dialogue would advance the plot or reveal character.",
  ],
  symbolism: [
    "A symbolic element that represents the character's journey",
    "An object or image that reinforces the chapter's theme",
  ],
  emotional_pacing:
    "The chapter would start with tension, build through conflict, and end with a moment of realization.",
  sensory_details: [
    "A visual detail that grounds the reader in the setting",
    "A sound that creates atmosphere in a key scene",
    "A tactile sensation that makes the scene feel real",
  ],
  foreshadowing: [
    "A subtle hint about a future plot development",
    "An unexplained detail that will become significant later",
  ],
  scene_goal: "The protagonist needs to overcome an obstacle related to their overall character arc.",
});

const parseGuideResponse = (response: unknown) => {
  if (!response) return null;
  if (typeof response === "object") {
    return response as Record<string, Record<string, unknown>>;
  }
  if (typeof response === "string") {
    try {
      const match = response.match(/\{[\s\S]*\}/);
      const parsed = match ? JSON.parse(match[0]) : JSON.parse(response);
      return parsed as Record<string, Record<string, unknown>>;
    } catch {
      return null;
    }
  }
  return null;
};

const completeChapterGuide = (
  chapterGuide: Record<string, Record<string, unknown>>,
  outlineArray: Array<Record<string, unknown>>
) => {
  const result: Record<string, Record<string, unknown>> = {};
  outlineArray.forEach((chapter, index) => {
    const number = String(chapter.number ?? index + 1);
    const entry = chapterGuide[number] ?? {};
    const defaults = createDefaultChapterEntry();
    const completed: Record<string, unknown> = {};

    Object.entries(defaults).forEach(([key, value]) => {
      const current = (entry as Record<string, unknown>)[key];
      if (current) {
        completed[key] = current;
      } else {
        completed[key] = value;
      }
    });

    result[number] = completed;
  });

  return result;
};

const generateMissingChapters = async (
  chapterGuide: Record<string, Record<string, unknown>>,
  outlineArray: Array<Record<string, unknown>>,
  model: string
) => {
  const updated = { ...chapterGuide };

  for (const [index, chapter] of outlineArray.entries()) {
    const number = String(chapter.number ?? index + 1);
    if (updated[number]) continue;

    const prompt = `Create a detailed guide for Chapter ${number}: ${
      chapter.title ?? `Chapter ${number}`
    }.

Chapter Summary: ${chapter.summary ?? "No summary available"}

Include these exact fields:
1. key_dialogue: 3-4 specific lines or exchanges
2. symbolism: 2-3 symbolic elements
3. emotional_pacing: A description of the emotional arc
4. sensory_details: 3-4 vivid sensory descriptions
5. foreshadowing: 2-3 subtle hints about future developments
6. scene_goal: What the viewpoint character wants to achieve

Format as valid JSON for a SINGLE chapter with the exact structure shown.`;

    try {
      const response = await runChatCompletion({
        model,
        system: "You are creating a detailed guide for a single chapter in a novel. Format your response as valid JSON.",
        prompt,
        jsonResponse: true,
        maxTokens: 1000,
      });

      const parsed = parseGuideResponse(response);
      if (parsed) {
        if (parsed[number]) {
          updated[number] = parsed[number];
        } else if (
          (parsed as Record<string, unknown>).key_dialogue ||
          (parsed as Record<string, unknown>).symbolism ||
          (parsed as Record<string, unknown>).emotional_pacing
        ) {
          updated[number] = parsed as unknown as Record<string, unknown>;
        }
      }
    } catch {
      updated[number] = createDefaultChapterEntry();
    }

    if (!updated[number]) {
      updated[number] = createDefaultChapterEntry();
    }
  }

  return updated;
};

export async function POST(request: Request) {
  try {
    const { chapterOutline, novelSynopsis, characterProfiles, novelPlan, storyDetails, model } =
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
- Author Intent: ${(storyDetails?.novel_about ?? "").slice(0, 500) || "Not provided"}
- Series Context: ${storyDetails?.series_context ? JSON.stringify(storyDetails.series_context).slice(0, 1600) : "Not provided"}
- Canon Facts: ${storyDetails?.series_context?.canon_entries ? JSON.stringify(storyDetails.series_context.canon_entries).slice(0, 800) : "Not provided"}
- Mysteries: ${storyDetails?.series_context?.secrets ? JSON.stringify(storyDetails.series_context.secrets).slice(0, 800) : "Not provided"}
- Relationships: ${storyDetails?.series_context?.relationships ? JSON.stringify(storyDetails.series_context.relationships).slice(0, 800) : "Not provided"}
- Plot Threads: ${storyDetails?.series_context?.plot_threads ? JSON.stringify(storyDetails.series_context.plot_threads).slice(0, 800) : "Not provided"}
- Callbacks: ${storyDetails?.series_context?.callbacks ? JSON.stringify(storyDetails.series_context.callbacks).slice(0, 800) : "Not provided"}

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

    const baseModel = model || "gpt-4.1-mini";
    const maxRetries = 3;
    let guide: Record<string, Record<string, unknown>> | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt += 1) {
      const response = await runChatCompletion({
        model: baseModel,
        system,
        prompt,
        jsonResponse: attempt === 0,
        maxTokens: 3000,
      });

      guide = parseGuideResponse(response);
      if (!guide) {
        const shortenedPrompt = prompt.replace(
          /Novel Context:[\s\S]*?Chapter Outline:/,
          "Novel Context: Young adult novel with character development and emotional journey.\n\nChapter Outline:"
        );
        const retryResponse = await runChatCompletion({
          model: baseModel,
          system,
          prompt: shortenedPrompt,
          jsonResponse: false,
          maxTokens: 3000,
        });
        guide = parseGuideResponse(retryResponse);
      }

      if (guide) break;
    }

    if (!guide) {
      return NextResponse.json(
        { error: "Failed to parse chapter guide JSON" },
        { status: 502 }
      );
    }

    if (Object.keys(guide).length < outlineArray.length) {
      guide = await generateMissingChapters(guide, outlineArray, baseModel);
    }

    const completedGuide = completeChapterGuide(guide, outlineArray);

    return NextResponse.json({ guide: completedGuide });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate chapter guide" },
      { status: 500 }
    );
  }
}
