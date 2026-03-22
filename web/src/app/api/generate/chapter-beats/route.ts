import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";

export async function POST(request: Request) {
  try {
    const { chapterOutline, chapterGuide, synopsis, characterProfiles, novelPlan, storyDetails, model } =
      await request.json();

    if (!chapterOutline || !chapterGuide) {
      return NextResponse.json(
        { error: "Chapter outline and guide are required" },
        { status: 400 }
      );
    }

    const outlineArray = Array.isArray(chapterOutline)
      ? chapterOutline
      : (chapterOutline?.chapters as Array<Record<string, unknown>>) ?? [];

    const beats: Record<string, Array<Record<string, unknown>>> = {};

    for (const chapter of outlineArray) {
      const chapterRecord = chapter as Record<string, unknown>;
      const chapterNum = String(chapterRecord.number ?? outlineArray.indexOf(chapter) + 1);
      const chapterTitle = chapterRecord.title ?? "Untitled Chapter";
      const chapterSummary = chapterRecord.summary ?? "No summary available";
      const guideDetails = (chapterGuide as Record<string, unknown>)[chapterNum] ?? {};

      const prompt = `
Take the following chapter summary and generate a list of 5 highly detailed action beats for a prose draft. Use the additional story information provided to fully flesh out the chapter's structure and momentum.

Chapter: ${chapterNum}: ${chapterTitle}
Chapter Outline: ${JSON.stringify(chapterRecord, null, 2)}
Chapter Summary: ${chapterSummary}
Additional Story Information:
- Synopsis: ${synopsis ?? ""}
- Character Profiles: ${characterProfiles ?? ""}
- Novel Plan: ${novelPlan ?? ""}
- Author Intent: ${storyDetails?.novel_about ?? ""}
- Series Context: ${storyDetails?.series_context ? JSON.stringify(storyDetails.series_context).slice(0, 1600) : ""}
- Canon Facts: ${storyDetails?.series_context?.canon_entries ? JSON.stringify(storyDetails.series_context.canon_entries).slice(0, 800) : ""}
- Mysteries: ${storyDetails?.series_context?.secrets ? JSON.stringify(storyDetails.series_context.secrets).slice(0, 800) : ""}
- Relationships: ${storyDetails?.series_context?.relationships ? JSON.stringify(storyDetails.series_context.relationships).slice(0, 800) : ""}
- Plot Threads: ${storyDetails?.series_context?.plot_threads ? JSON.stringify(storyDetails.series_context.plot_threads).slice(0, 800) : ""}
- Callbacks: ${storyDetails?.series_context?.callbacks ? JSON.stringify(storyDetails.series_context.callbacks).slice(0, 800) : ""}
- Chapter Guide: ${JSON.stringify(guideDetails, null, 2)}

Guidelines:
– Always use proper nouns (character names, locations, etc.)—avoid vague pronouns.
– Each beat should reflect clear action, emotional shifts, or key decisions that push the story forward.
– Beats should show what happens, who does it, and why it matters—emotionally or narratively.
– Think in terms of cinematic or dramatic moments, whether you're outlining for a screenplay, novel, or graphic narrative.
– These beats should serve as a scene-by-scene guide to write the full chapter with clarity and purpose.

For each beat, also include:
* Emotional impact or shift: (How does the character feel before/after this beat?)
* Beat-ending tension or hook: (What question is left hanging?)

Format your response as a JSON array where each item is an object with these fields:
- "beat_number": (integer)
- "action": (string describing what happens)
- "emotional_impact": (string describing the emotional shift)
- "tension_hook": (string describing the question left hanging)
`;

      const system = `You are a professional novelist and writing coach creating detailed action beats for a chapter.
Provide rich, specific guidance for each beat that aligns with the overall narrative and themes.
Your beats should be concrete and actionable, helping to create a cohesive and engaging story.
Format your response as a proper JSON array with all the required fields.`;

      const response = await runChatCompletion({
        model: model || "gpt-4.1-mini",
        system,
        prompt,
        jsonResponse: false,
        maxTokens: 4000,
      });

      let parsed: unknown = response;
      try {
        if (typeof response === "string") {
          const match = response.match(/\[\s*{[\s\S]*}\s*\]/);
          parsed = match ? JSON.parse(match[0]) : JSON.parse(response);
        }
      } catch {
        parsed = null;
      }

      if (Array.isArray(parsed)) {
        beats[chapterNum] = parsed as Array<Record<string, unknown>>;
      } else {
        beats[chapterNum] = [
          {
            beat_number: 1,
            action: "Introduce the scene goal.",
            emotional_impact: "Establishes stakes.",
            tension_hook: "A new complication emerges.",
          },
        ];
      }
    }

    return NextResponse.json({ beats });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate chapter beats" },
      { status: 500 }
    );
  }
}
