import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";

export async function POST(request: Request) {
  try {
    const { storyDetails, synopsis, model } = await request.json();

    if (!storyDetails) {
      return NextResponse.json(
        { error: "Story details are required" },
        { status: 400 }
      );
    }

    const title = storyDetails.title ?? "Untitled";
    const seriesContext = storyDetails.series_context ?? null;
    let seriesGuidance = "";
    if (seriesContext) {
      seriesGuidance = `
This novel is Book ${seriesContext.book_number ?? 1} of ${
        seriesContext.total_books ?? 1
      } in a series.
`;
    }

    const prompt = `
Write a comprehensive character profile for all of the characters of the novel "${title}" based on the synopsis provided below.

Synopsis:
${synopsis ?? ""}

${seriesGuidance}

Please include the following elements in each profile:
* Full Name
* Role in the Story (Protagonist, Antagonist, Mentor, etc.)
* Physical Description (Age, features, body language, fashion style)
* Core Personality Traits (Shown through action or dialogue—not just listed)
* Backstory (Key events that shaped them)
* Motivations and Desires
* Fears and Flaws
* Character Arc (How they grow or change over the course of the story)
* Key Relationships (Allies, enemies, love interests, etc.)
* Important Symbols or Objects tied to them (optional)
* Emotional Struggles or Internal Conflicts
* Voice & Dialogue Style (e.g., blunt and sarcastic, poetic and hesitant, formal with clipped speech)
`;

    let finalPrompt = prompt;
    if (seriesContext && (seriesContext.book_number ?? 1) > 1) {
      finalPrompt += `
For established characters from previous books in the series, also include:
* Previous Development (How they've changed in prior books)
* Continuity Elements (Key traits, relationships, or items that must remain consistent)
* New Challenges (Fresh conflicts or growth opportunities in this installment)
`;
    }

    finalPrompt += `
This profile should feel like a living portrait of the character, helping guide their actions, voice, and emotional journey throughout the novel. Focus on showing who they are through behavior, conflict, and desire, rather than just telling.
`;

    const system = `You are a professional character development expert for YA fiction.
Create detailed character profiles that bring each character to life with distinctive voices, motivations, and emotional depth.
Ensure main characters have clear emotional arcs while supporting characters have distinctive qualities that help them stand out.`;

    const response = await runChatCompletion({
      model: model || "gpt-4.1-mini",
      system,
      prompt: finalPrompt,
      jsonResponse: false,
    });

    return NextResponse.json({ profiles: response });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate character profiles" },
      { status: 500 }
    );
  }
}
