import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";
import { resolveModel, PipelineStep } from "@/lib/modelDefaults";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

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

    const title = storyDetails.title ?? "Untitled";
    const genre = String(storyDetails.genre ?? "Fiction").trim() || "Fiction";
    const targetAge = String(storyDetails.target_age_range ?? "").trim();
    const themes =
      storyDetails.story_theme ?? "Growth and self-discovery";
    const premise = premisesAndEndings?.chosen_premise ?? "";
    const ending = premisesAndEndings?.chosen_ending ?? "";
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

    const prompt = `Write 1 original dedication page for a ${genre} novel using the information below.

The dedication should feel emotionally authentic, memorable, and aligned with the emotional core of the story. The tone should match the novel naturally without sounding overly poetic, forced, or generic.

Some dedications may be heartfelt, bittersweet, hopeful, melancholic, romantic, reflective, dark, or inspirational depending on the themes and ending of the novel.

The dedication should feel like an emotional doorway into the story and subtly reflect the protagonist's journey, central conflict, or emotional resolution without revealing spoilers directly.

Keep the dedication concise and impactful (1–4 lines maximum).

Novel Information:

* Novel Title: ${title}
* Genre: ${genre}
* Target Audience: ${targetAge || "match the genre"}
* Themes: ${themes}
* Premise: ${premise}
* Ending: ${ending}
* Synopsis: ${synopsis.slice(0, 1500)}
* Main Character Profile: ${mainCharacter} — ${centralConflict}. ${characterSummary}
* Emotional Tone of the Story: ${emotionalTone}

Avoid clichés and generic motivational lines. Make the dedication feel emotionally specific to this novel's story and themes.

Return ONLY the dedication text itself — no labels, no numbering, no quotes around it, no preamble. Just the raw dedication that would appear on the dedication page of the book.`;

    const system = `You are a professional novelist skilled at crafting emotionally resonant dedication pages for ${genre} fiction.
Write a single, original dedication that would appear on a book's dedication page.
Keep it concise (1-4 lines), emotionally authentic, and specific to the novel's themes and emotional core.
Match the stated genre and audience; do not assume Young Adult unless the material calls for it.
Avoid clichés and generic motivational lines.`;

    const response = await runChatCompletion({
      model: resolveModel(model, PipelineStep.DEDICATION),
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
