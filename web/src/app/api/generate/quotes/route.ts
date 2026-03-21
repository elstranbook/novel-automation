import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";

const formatScenesForQuotes = (scenes: Record<string, string[]>) => {
  const formatted: string[] = [];

  Object.entries(scenes).forEach(([chapterTitle, chapterScenes]) => {
    const match = chapterTitle.match(/Chapter\s+(\d+)/i);
    const chapterNum = match ? match[1] : "?";
    chapterScenes.forEach((scene, index) => {
      const snippet = scene.length > 500 ? `${scene.slice(0, 500)}...` : scene;
      formatted.push(
        `Chapter ${chapterNum}: ${chapterTitle}, Scene ${index + 1}\n${snippet}\n`
      );
    });
  });

  let allScenesText = formatted.join("\n");
  if (allScenesText.length > 12000) {
    const third = Math.floor(formatted.length / 3) || 1;
    const sample = [
      ...formatted.slice(0, third),
      ...formatted.slice(third, third * 2),
      ...formatted.slice(-third),
    ];
    allScenesText = sample.join("\n");
  }

  return allScenesText;
};

export async function POST(request: Request) {
  try {
    const { storyDetails, model, allScenes } = await request.json();

    if (!storyDetails || !allScenes) {
      return NextResponse.json(
        { error: "Story details and scenes are required" },
        { status: 400 }
      );
    }

    const novelTitle = storyDetails.title ?? "Untitled";
    const scenesText = formatScenesForQuotes(allScenes);

    const prompt = `
Analyze the following novel content chapter by chapter and extract the most powerful, emotional, or impactful quotes that would work well for marketing and advertisement. For each quote, include:

1. The quote itself (highlighting defiance, hope, resilience, or rebellion).
2. The character who said it (or if it's narration, label it as such).
3. The chapter number and scene (e.g., Chapter 3, Scene 1).
4. The novel title ("${novelTitle}") at the end.

Format each entry like this:
"Quote." — [Character/Narration], [Chapter #, Scene #], ${novelTitle}

Focus on lines that are:
- Defiant or rebellious
- Emotionally charged
- Poetic or vivid
- Themes of hope, survival, or revolution
- Short and punchy (good for social media)
- Longer, profound lines (good for trailers or book blurbs)

Make the tone emotionally engaging, fast-paced, and tailored to teen readers.
Use hooks, curiosity, and relatable language. Avoid generic phrasing.

Ignore minor dialogue or filler text. Prioritize quotes that would grab a reader's attention and make them curious about the story.

NOVEL CONTENT:
${scenesText}
`;

    const system = `You are a literary agent skilled at identifying powerful quotes from novels that would work well for marketing and publicity.
Extract 10-15 impactful quotes from the novel sections provided, following the format requested precisely.
Return the quotes as an array of properly formatted strings, not as a numbered list.
Write with an emotionally engaging, fast-paced tone tailored to teen readers, using hooks, curiosity, and relatable language while avoiding generic phrasing.`;

    const response = await runChatCompletion({
      model: model || "gpt-4.1-mini",
      system,
      prompt,
      jsonResponse: false,
      maxTokens: 2000,
    });

    return NextResponse.json({ quotes: response });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate quotes" },
      { status: 500 }
    );
  }
}
