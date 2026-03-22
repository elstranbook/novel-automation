import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const generateScenesForChapter = async ({
  chapter,
  storyDetails,
  chapterBeats,
  model,
  maxSceneLength,
  minSceneLength,
  premisesAndEndings,
  characterProfiles,
}: {
  chapter: Record<string, unknown>;
  storyDetails: Record<string, unknown>;
  chapterBeats?: Array<Record<string, unknown>>;
  model: string;
  maxSceneLength: number;
  minSceneLength: number;
  premisesAndEndings?: Record<string, unknown>;
  characterProfiles?: string;
}) => {
  const chapterNumber = chapter.number ?? "?";
  const chapterTitle = chapter.title ?? "Untitled";
  const chapterInfo = JSON.stringify(chapter, null, 2);
  const storyInfo = JSON.stringify(storyDetails, null, 2);
  const novelAbout = storyDetails.novel_about ?? "";

  let premisesEndingInfo = "";
  if (premisesAndEndings?.chosen_premise && premisesAndEndings?.chosen_ending) {
    premisesEndingInfo = `
THE PREMISE:
${premisesAndEndings.chosen_premise}

THE ENDING:
${premisesAndEndings.chosen_ending}
`;
    const chapterNumberValue = Number(chapter.number ?? 0);
    if (chapterNumberValue >= 15) {
      premisesEndingInfo +=
        "\nSince this is a later chapter, make sure to build toward the chosen ending.";
    }
  }

  if (!chapterBeats || chapterBeats.length === 0) {
    const prompt = `
Write the complete scenes for Chapter ${chapterNumber}: "${chapterTitle}" in the novel "${
      storyDetails.title ?? ""
    }".

STORY DETAILS:
${storyInfo}
${novelAbout ? `\nAUTHOR INTENT (What the novel is about):\n${novelAbout}\n` : ""}

CHAPTER INFORMATION:
${chapterInfo}

${premisesEndingInfo}

Guidelines:
1. Create 2-5 distinct scenes for this chapter based on the key events
2. Each scene should be between ${minSceneLength} and ${maxSceneLength} words
3. Stay consistent with the POV specified in the chapter information
4. Include dialogue, description, and character development
5. Write in first-person past tense from the POV character's perspective
6. Connect each scene with clear transitions

Format the response as a JSON array of scene strings. Return just the array of scene strings.
`;

    const system = `You are a professional novelist writing scenes for Chapter ${chapterNumber} in the novel '${
      storyDetails.title ?? ""
    }'.
Write compelling, immersive scenes that advance the plot and develop the characters.
Use first-person past tense from the POV character's perspective.
Return your scenes ONLY as a JSON array of strings.`;

    return runChatCompletion({
      model,
      system,
      prompt,
      jsonResponse: true,
      maxTokens: 8000,
    });
  }

  const beatsText = chapterBeats
    .map(
      (beat) =>
        `Beat ${beat.beat_number ?? "?"}: ${
          beat.action ?? "No action"
        }\nEmotional Impact: ${
          beat.emotional_impact ?? "None"
        }\nTension/Hook: ${beat.tension_hook ?? "None"}`
    )
    .join("\n\n");

  const prompt = `
Using the chapter summary and story beats, expand Chapter ${chapterNumber} of "${
    storyDetails.title ?? ""
  }" into a detailed, scene-by-scene breakdown.

Guidelines:
– The breakdown should follow the natural progression of the chapter, with each scene building on the last to maintain flow, momentum, and emotional resonance.
– Write in first-person past tense, from ${chapter.pov ?? "the POV character"}'s point of view.
– Focus on show-don't-tell, using a deep point of view to reveal thoughts, feelings, and conflict through action and internal narration.
– Use realistic dialogue with purpose—each exchange should move the story forward or reveal something meaningful.
– Emphasize strong verbs and avoid overly mushy or sentimental description.

Chapter Summary:
${chapter.summary ?? "No summary available"}

Author Intent (What the novel is about):
${novelAbout}

Series Context:
${storyDetails.series_context ? JSON.stringify(storyDetails.series_context).slice(0, 1600) : ""}
Canon Facts:
${storyDetails.series_context?.canon_entries ? JSON.stringify(storyDetails.series_context.canon_entries).slice(0, 800) : ""}
Mysteries:
${storyDetails.series_context?.secrets ? JSON.stringify(storyDetails.series_context.secrets).slice(0, 800) : ""}
Relationships:
${storyDetails.series_context?.relationships ? JSON.stringify(storyDetails.series_context.relationships).slice(0, 800) : ""}
Plot Threads:
${storyDetails.series_context?.plot_threads ? JSON.stringify(storyDetails.series_context.plot_threads).slice(0, 800) : ""}
Callbacks:
${storyDetails.series_context?.callbacks ? JSON.stringify(storyDetails.series_context.callbacks).slice(0, 800) : ""}

Chapter Story Beats:
${beatsText}

Character Information:
${characterProfiles ?? "No character profiles available"}

${premisesEndingInfo}

Additional Information:
- Genre: ${storyDetails.genre ?? "Young Adult Fiction"}
- Theme: ${storyDetails.story_theme ?? "Coming of age"}
- Setting: ${storyDetails.setting ?? "Contemporary world"}

For each beat, create a detailed scene using this prompt:

Begin writing Chapter ${chapterNumber}: ${chapterTitle}, Scene [beat number] of "${
    storyDetails.title ?? ""
  }" using the detailed scene summary provided.

The writing should naturally reflect the scene's genre, tone, point of view, setting, and key characters—all of which can be inferred from the scene summary provided.

Writing Guidelines:
– Focus on a slow, deliberate buildup, allowing the emotional tone and character stakes to deepen gradually.
– Use intimate, vivid moments to show the emotional toll of the scene and allow readers to connect with the characters.
– Let dialogue reveal dynamics, tension, or internal struggles. Keep it natural, grounded, and full of subtext.
– Emphasize "show, don't tell" storytelling. Let physical actions, choices, and setting carry emotional and thematic weight.
– Use strong verbs, sensory-rich description, and a deep POV (if applicable) to fully immerse the reader.
– Allow the scene to naturally lead toward its conclusion and, if appropriate, transition smoothly into the next.

Narrative Style:
* Point of View: First-person for the main character
* Tense: Past

Write up to ${maxSceneLength} words of character-driven, emotionally layered prose.
Let the scene summary guide your tone, structure, pacing, and character focus.

Write only the prose for the scene, without any formatting, headers, or scene numbers.

Format your response as a JSON array of scene strings, one scene per beat. Return just the array of scene strings.
`;

  const system = `You are a professional young adult novelist writing Chapter ${chapterNumber} of '${
    storyDetails.title ?? ""
  }' in first-person past tense.
Create vivid, emotionally resonant scenes from the main character's perspective.
Include sensory details, realistic dialogue, and deep point-of-view narration.
Focus on a slow, deliberate buildup, allowing the emotional tone and character stakes to deepen gradually.
Use intimate, vivid moments to show the emotional toll of the scene and let readers connect with characters.
Write only the prose for each scene, without any formatting, headers, or scene numbers.
Return your scenes ONLY as a JSON array of strings.`;

  return runChatCompletion({
    model,
    system,
    prompt,
    jsonResponse: true,
    maxTokens: 8000,
  });
};

export async function POST(request: Request) {
  try {
    const {
      chapter,
      storyDetails,
      chapterBeats,
      model,
      maxSceneLength,
      minSceneLength,
      premisesAndEndings,
      characterProfiles,
    } = await request.json();

    if (!storyDetails || !chapter) {
      return NextResponse.json(
        { error: "Story details and chapter are required" },
        { status: 400 }
      );
    }

    const scenes = await generateScenesForChapter({
      chapter,
      storyDetails,
      chapterBeats,
      model: model || "gpt-4.1-mini",
      maxSceneLength: maxSceneLength ?? 1000,
      minSceneLength: minSceneLength ?? 300,
      premisesAndEndings,
      characterProfiles,
    });

    const chapterTitle = `Chapter ${chapter.number ?? "?"}: ${
      chapter.title ?? "Untitled"
    }`;

    const normalizedScenes = Array.isArray(scenes)
    ? scenes.map((scene) =>
        typeof scene === "string" ? scene : JSON.stringify(scene)
      )
    : [typeof scenes === "string" ? scenes : JSON.stringify(scenes)];

    return NextResponse.json({ chapterTitle, scenes: normalizedScenes });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate scenes" },
      { status: 500 }
    );
  }
}
