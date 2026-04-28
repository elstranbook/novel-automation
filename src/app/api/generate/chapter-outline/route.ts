import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";

const ensureOutlineShape = (
  outline: unknown,
  minCount = 18,
  fillMissing = true
) => {
  let response: Array<Record<string, unknown>> = [];

  if (Array.isArray(outline)) {
    response = outline as Array<Record<string, unknown>>;
  } else if (outline && typeof outline === "object") {
    const outlineObj = outline as Record<string, unknown>;
    if ("chapters" in outlineObj && Array.isArray(outlineObj.chapters)) {
      response = outlineObj.chapters as Array<Record<string, unknown>>;
    } else {
      response = [outlineObj];
    }
  }

  if (response.length < minCount && fillMissing) {
    const existingCount = response.length;
    for (let i = existingCount + 1; i <= minCount; i += 1) {
      response.push({
        number: i,
        title: `Chapter ${i} (needs generation)`,
        pov: "Main Character",
        summary: `Missing outline for chapter ${i}. Please regenerate.`,
        emotional_development: "Missing emotional development",
        theme_focus: "Missing theme focus",
        estimated_word_count: 900,
        events: [`Missing event for chapter ${i}`],
      });
    }
  }

  return response.map((chapter: Record<string, unknown>, index: number) => ({
    number: chapter.number ?? index + 1,
    title: chapter.title ?? `Chapter ${index + 1}`,
    pov: chapter.pov ?? "Main Character",
    summary: chapter.summary ?? `Summary of Chapter ${index + 1}`,
    emotional_development:
      chapter.emotional_development ?? "Character growth and emotional changes",
    theme_focus: chapter.theme_focus ?? "Main theme explored in this chapter",
    estimated_word_count:
      chapter.estimated_word_count ?? chapter.word_count ?? 900,
    events: Array.isArray(chapter.events)
      ? chapter.events
      : [`Event 1 in Chapter ${index + 1}`, `Event 2 in Chapter ${index + 1}`],
  }));
};

export async function POST(request: Request) {
  try {
    const { storyDetails, model, novelPlan } = await request.json();

    if (!storyDetails) {
      return NextResponse.json(
        { error: "Story details are required" },
        { status: 400 }
      );
    }

    const title = storyDetails.title ?? "Untitled";
    const theme = storyDetails.story_theme ?? "";
    const structuredPlan = novelPlan ?? "";
    const novelAbout = storyDetails.novel_about ?? "";

    const prompt = `
Following the structured plan below, please create a detailed chapter outline for "${title}" designed to establish a powerful emotional arc that deeply explores the complexities of ${theme}.

Break the story into the necessary chapters as you see fit that serve the purpose of the story, with word count estimates for each chapter to ensure balanced pacing and focus. Each chapter should allow room for meaningful character development, emotional depth, and tension that draws readers in.

Guidelines:
– The outline should follow the Parts in your structured plan (e.g., Part I, Part II, etc.)
– Ensure that each chapter reflects shifts in tone, rising stakes, or key moments of character growth
– Design each chapter to support a powerful emotional arc, exploring the complexities of all core themes

For each chapter, include:
* Short summary of what happens
* The emotional focus and development of key characters
* Key moments of tension, conflict, or change
* Estimated word count for balanced pacing
* Theme focus or symbol: (e.g., betrayal, growth, power, identity, loss)

Structured Plan:
${structuredPlan}

Author Intent (What the novel is about):
${novelAbout}

Series Context:
${storyDetails.series_context ? JSON.stringify(storyDetails.series_context).slice(0, 1600) : ""}
Canon Facts:
${storyDetails.series_context?.canon_entries ? JSON.stringify(storyDetails.series_context.canon_entries).slice(0, 800) : ""}
Mystery Log:
${storyDetails.series_context?.secrets ? JSON.stringify(storyDetails.series_context.secrets).slice(0, 800) : ""}
Relationships:
${storyDetails.series_context?.relationships ? JSON.stringify(storyDetails.series_context.relationships).slice(0, 800) : ""}
Plot Threads:
${storyDetails.series_context?.plot_threads ? JSON.stringify(storyDetails.series_context.plot_threads).slice(0, 800) : ""}
Callbacks:
${storyDetails.series_context?.callbacks ? JSON.stringify(storyDetails.series_context.callbacks).slice(0, 800) : ""}

Format your response as a JSON array of chapter objects with the following fields:
- "number": The chapter number (integer)
- "title": A compelling chapter title (string)
- "pov": Which character's point of view is used (string)
- "summary": A brief summary of key events (string)
- "emotional_development": The emotional focus and character development (string)
- "theme_focus": The theme or symbol emphasized in this chapter (string)
- "estimated_word_count": Word count target for this chapter (integer)
- "events": Key plot points or scenes in the chapter (array of strings)
`;

    const system = `You are a professional novelist and story structure expert. 
Create a compelling chapter outline that follows the provided structured plan while developing emotional arcs and themes.
You must structure your response as a valid JSON array with all required fields.
This is for a software application that needs this exact format to function properly.`;

    const raw = await runChatCompletion({
      model: model || "gpt-4.1-mini",
      system,
      prompt,
      jsonResponse: false,
    });

    let parsed: unknown = raw;
    try {
      if (typeof raw === "string") {
        const match = raw.match(/\[\s*{[\s\S]*}\s*\]/);
        parsed = match ? JSON.parse(match[0]) : JSON.parse(raw);
      } else {
        parsed = raw;
      }
    } catch {
      parsed = raw;
    }

    let outline = ensureOutlineShape(parsed, 18);

    if (outline.some((chapter) => String(chapter.title ?? "").includes("needs generation"))) {
      const missingStart = outline.findIndex((chapter) =>
        String(chapter.title ?? "").includes("needs generation")
      );
      const missingNumbers = outline
        .filter((chapter) => String(chapter.title ?? "").includes("needs generation"))
        .map((chapter) => Number(chapter.number ?? 0))
        .filter((value) => value > 0);

      const fillPrompt = `You are continuing a chapter outline for "${title}".
We already have chapters 1-${missingStart}. Create full chapter entries for chapters ${missingNumbers.join(", ")},
keeping the tone, emotional arc, and themes consistent. Use the same JSON array format with fields:
number, title, pov, summary, emotional_development, theme_focus, estimated_word_count, events.
Do not include chapters outside of ${missingNumbers.join(", ")}.`; 

      const fillRaw = await runChatCompletion({
        model: model || "gpt-4.1-mini",
        system,
        prompt: `${fillPrompt}\n\nContext:\n${structuredPlan}\n\nAuthor Intent:\n${novelAbout}`,
        jsonResponse: false,
      });

      let fillParsed: unknown = fillRaw;
      try {
        if (typeof fillRaw === "string") {
          const match = fillRaw.match(/\[\s*{[\s\S]*}\s*\]/);
          fillParsed = match ? JSON.parse(match[0]) : JSON.parse(fillRaw);
        } else {
          fillParsed = fillRaw;
        }
      } catch {
        fillParsed = fillRaw;
      }

      const fillOutline = ensureOutlineShape(fillParsed, missingNumbers.length, false);
      const filledMap = new Map(
        fillOutline.map((chapter) => [Number(chapter.number ?? 0), chapter])
      );

      outline = outline.map((chapter) => {
        const num = Number(chapter.number ?? 0);
        if (filledMap.has(num)) {
          return filledMap.get(num) ?? chapter;
        }
        return chapter;
      });

      if (outline.some((chapter) => String(chapter.title ?? "").includes("needs generation"))) {
        return NextResponse.json({
          outline,
          warning: "Outline incomplete; regenerate to fill missing chapters.",
        });
      }
    }

    return NextResponse.json({ outline });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate chapter outline" },
      { status: 500 }
    );
  }
}
