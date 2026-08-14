import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";
import { resolveModel, PipelineStep } from "@/lib/modelDefaults";
import {
  getSeriesContext,
  hydrateStoryDetailsWithLiveSeriesContext,
  seriesGenerationMeta,
} from "@/lib/seriesContext";
import { formatCharactersForPrompt } from "@/lib/characterPrompt";
import { formatSeriesContextForPrompt } from "@/lib/seriesPrompt";
import {
  normalizeStructuredCharacter,
  stringifyCharacterProfiles,
  type StructuredCharacter,
} from "@/lib/characterProfiles";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function parseCharactersResponse(raw: unknown): StructuredCharacter[] {
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    try {
      const match = raw.match(/\[[\s\S]*\]/);
      parsed = match ? JSON.parse(match[0]) : JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const rec = parsed as Record<string, unknown>;
    if (Array.isArray(rec.characters)) parsed = rec.characters;
    else if (Array.isArray(rec.profiles)) parsed = rec.profiles;
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map(normalizeStructuredCharacter)
    .filter(Boolean) as StructuredCharacter[];
}

export async function POST(request: Request) {
  try {
    const { storyDetails: rawDetails, synopsis, model, seriesId, bookNumber: requestBookNumber } =
      await request.json();
    const storyDetails = await hydrateStoryDetailsWithLiveSeriesContext(
      rawDetails,
      seriesId,
      requestBookNumber
    );

    if (!storyDetails) {
      return NextResponse.json(
        { error: "Story details are required" },
        { status: 400 }
      );
    }

    const title = storyDetails.title ?? "Untitled";
    const novelAbout = storyDetails.novel_about ?? "";
    const genre = String(storyDetails.genre ?? "Fiction").trim() || "Fiction";
    const targetAge = String(storyDetails.target_age_range ?? "").trim();
    const narrativeStyle = String(storyDetails.narrative_style ?? "").trim();
    const bookNumber = Number(
      requestBookNumber ?? storyDetails.book_number ?? 1
    );
    const seriesContext = getSeriesContext(storyDetails);
    const seriesCharacters = Array.isArray(seriesContext?.characters)
      ? formatCharactersForPrompt(
          seriesContext.characters as Parameters<typeof formatCharactersForPrompt>[0],
          { maxLength: 4000 }
        )
      : "";
    let seriesGuidance = "";
    const existingCharacters: string[] = [];
    if (seriesContext) {
      seriesGuidance = `
SERIES CONTEXT (Important for character development):

This novel is Book ${seriesContext.book_number ?? 1} of ${
        seriesContext.total_books ?? 1
      } in a series titled "${seriesContext.series_title ?? "Untitled Series"}".

${formatSeriesContextForPrompt(seriesContext, { includeCharacters: false })}
${seriesCharacters ? `\n${seriesCharacters}\n` : ""}
`;

      if (seriesContext.character_arcs && typeof seriesContext.character_arcs === "object") {
        seriesGuidance += "\nCharacter Arcs Throughout Series:\n";
        Object.entries(seriesContext.character_arcs as Record<string, unknown>).forEach(
          ([charName, charArc]) => {
            seriesGuidance += `- ${charName}: ${charArc}\n`;
            existingCharacters.push(String(charName));
          }
        );
      }

      if ((seriesContext.book_number ?? 1) > 1 && seriesContext.prior_books) {
        seriesGuidance += "\nContinuity Requirements:\n";
        seriesGuidance +=
          "- Maintain consistency with established characters from previous books\n";
        seriesGuidance +=
          "- Show character growth based on previous experiences\n";

        if (existingCharacters.length > 0) {
          seriesGuidance += "\nEstablished Characters (deepen these):\n";
          existingCharacters.forEach((character) => {
            seriesGuidance += `- ${character}\n`;
          });
        }
      }
    }

    const prompt = `
Create structured character profiles for the novel "${title}".

Synopsis:
${synopsis ?? ""}

Author Intent:
${novelAbout}

${seriesGuidance}

Return JSON ONLY as an array of character objects. Each object MUST use these keys:
- name (string, required)
- role (Protagonist, Antagonist, Mentor, Supporting, etc.)
- description (2–4 sentence living portrait)
- age (string)
- gender (string)
- appearance (object or short notes)
- personality (object or short notes)
- backstory (string)
- motivation (string)
- conflict (string)
- core_desire (string)
- big_fear (string)
- hidden_secret (string, optional)
- growth_arc (object or short notes for how they change)
- start_state (string)
- end_state (string)
- relationships (object or short notes)
- voice_profile (object with dialogue/style notes)
- public_mask (what they show others)
- private_want (what they actually pursue this book)
- contradiction (how mask and want collide in behavior)
- speech_tells (short distinctive speech habit)
- introduced_in_book (number, default ${bookNumber})
- introduced_in_chapter (number, optional)

Include the protagonist plus key supporting cast (typically 4–8 characters).
Focus on behavior, desire, and conflict — not generic trait lists.
`;

    const system = `You are a professional character development expert for ${genre} fiction${targetAge ? ` aimed at readers aged ${targetAge}` : ""}.
Return valid JSON only (an array of character objects).
Match the stated genre and audience; do not assume Young Adult unless the material calls for it.${narrativeStyle ? ` Respect narrative style: ${narrativeStyle}.` : ""}`;

    const response = await runChatCompletion({
      model: resolveModel(model, PipelineStep.CHARACTER_PROFILES),
      system,
      prompt,
      jsonResponse: true,
      maxTokens: 5000,
      generationMeta: seriesGenerationMeta(storyDetails, "character-profiles", seriesId),
    });

    let characters = parseCharactersResponse(response);
    if (!characters.length) {
      // One retry with stricter instruction
      const retry = await runChatCompletion({
        model: resolveModel(model, PipelineStep.CHARACTER_PROFILES),
        system,
        prompt: `${prompt}\n\nIMPORTANT: Return a JSON array only. No markdown.`,
        jsonResponse: true,
        maxTokens: 5000,
        generationMeta: seriesGenerationMeta(
          storyDetails,
          "character-profiles-retry",
          seriesId
        ),
      });
      characters = parseCharactersResponse(retry);
    }

    if (!characters.length) {
      return NextResponse.json(
        { error: "Character profiles generation returned no structured cast. Regenerate." },
        { status: 422 }
      );
    }

    characters = characters.map((c) => ({
      ...c,
      introduced_in_book: c.introduced_in_book ?? bookNumber,
    }));

    const profiles = stringifyCharacterProfiles(characters);
    const readable = formatCharactersForPrompt(
      characters as Parameters<typeof formatCharactersForPrompt>[0],
      { maxLength: 12000 }
    );

    return NextResponse.json({
      profiles,
      characters,
      readable,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate character profiles" },
      { status: 500 }
    );
  }
}
