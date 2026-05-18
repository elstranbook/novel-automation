import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";

export async function POST(request: Request) {
  try {
    const {
      storyDetails,
      premisesAndEndings,
      novelSynopsis,
      characterProfiles,
      model,
    } = await request.json();

    if (!storyDetails) {
      return NextResponse.json(
        { error: "Story details are required" },
        { status: 400 }
      );
    }

    const title =
      storyDetails.title ?? "Untitled";
    const genre =
      storyDetails.genre ?? "Young Adult Fiction";
    const themes =
      storyDetails.story_theme ?? "Growth and self-discovery";
    const premise =
      premisesAndEndings?.chosen_premise ?? "";
    const ending =
      premisesAndEndings?.chosen_ending ?? "";
    const synopsis = novelSynopsis ?? "";
    const mainCharacter =
      storyDetails.main_character_name ?? "the protagonist";
    const centralConflict =
      storyDetails.central_conflict ?? "a significant challenge";
    const emotionalTone =
      storyDetails.emotional_tone ?? storyDetails.tone ?? "Emotional and compelling";

    const characterSummary =
      typeof characterProfiles === "string"
        ? characterProfiles.slice(0, 800)
        : "";

    const prompt = `Write 1 original dedication page for a YA fictional novel using the information below.

The dedications should feel emotionally authentic, memorable, and aligned with the emotional core of the story. The tone should match the novel naturally without sounding overly poetic, forced, or generic.

Some dedications may be heartfelt, bittersweet, hopeful, melancholic, romantic, reflective, dark, or inspirational depending on the themes and ending of the novel.

The dedications should feel like an emotional doorway into the story and subtly reflect the protagonist's journey, central conflict, or emotional resolution without revealing spoilers directly.

Keep each dedication concise and impactful (1–4 lines maximum). Vary the style and emotional tone between each option.

Novel Information:

* Novel Title: ${title}
* Genre: ${genre}
* Target Audience: Young Adult
* Themes: ${themes}
* Premise: ${premise}
* Ending: ${ending}
* Synopsis: ${synopsis.slice(0, 1500)}
* Main Character Profile: ${mainCharacter} — ${centralConflict}. ${characterSummary}
* Emotional Tone of the Story: ${emotionalTone}

Some dedications can be directed toward:

* readers
* teenagers struggling to belong
* people healing from heartbreak or loss
* outsiders, survivors, dreamers, or broken families
* a fictional character
* someone the protagonist could never forget

Avoid clichés and generic motivational lines. Make every dedication feel emotionally specific to this novel's story and themes.

Return ONLY the dedication text itself — no labels, no numbering, no quotes around it, no preamble. Just the raw dedication that would appear on the dedication page of the book.`;

    const system = `You are a professional YA novelist skilled at crafting emotionally resonant dedication pages.
Write a single, original dedication that would appear on a book's dedication page.
Keep it concise (1-4 lines), emotionally authentic, and specific to the novel's themes and emotional core.
Avoid clichés and generic motivational lines. Make it feel like an emotional doorway into the story.`;

    const response = await runChatCompletion({
      model: model || "gpt-4.1-mini",
      system,
      prompt,
      jsonResponse: false,
      maxTokens: 300,
    });

    const dedication = String(response).trim();

    return NextResponse.json({ dedication });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate dedication" },
      { status: 500 }
    );
  }
}
