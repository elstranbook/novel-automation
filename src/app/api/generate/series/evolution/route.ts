import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { runChatCompletion } from "@/lib/openaiClient";
import { resolveModel, PipelineStep } from "@/lib/modelDefaults";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type EvolutionRequest = {
  seriesId: string;
  numBooks: number;
  characters: Array<{ name?: string } | string>;
  model?: string;
};

export async function POST(request: Request) {
  try {
    const { seriesId, numBooks, characters, model } =
      (await request.json()) as EvolutionRequest;

    if (!seriesId || !numBooks || !characters?.length) {
      return NextResponse.json(
        { error: "Series ID, numBooks, and characters are required" },
        { status: 400 }
      );
    }

    const { data: bible } = await supabaseAdmin
      .from("series_bibles")
      .select("*")
      .eq("series_id", seriesId)
      .maybeSingle();

    const { data: seriesRow } = await supabaseAdmin
      .from("series")
      .select("genre, target_audience")
      .eq("id", seriesId)
      .maybeSingle();
    const genreLabel = String(seriesRow?.genre ?? "").trim() || "fiction";
    const audience = String(seriesRow?.target_audience ?? "").trim();

    const charList = characters
      .map((char) => (typeof char === "string" ? char : char.name ?? ""))
      .filter(Boolean)
      .join(", ");

    const charContext = bible?.character_files
      ? `CHARACTER FILES FROM BIBLE:\n${JSON.stringify(
          bible.character_files,
          null,
          2
        )}`
      : "";

    const prompt = `
Create a CHARACTER EVOLUTION ENGINE for the following characters in a ${numBooks}-book ${genreLabel} series:
${audience ? `Target audience: ${audience}` : ""}

Characters: ${charList}

${charContext}

For EACH character, provide a complete evolution arc:

1) STARTING EMOTIONAL STATE
   - Where they begin emotionally
   - Their worldview at the start

2) WOUNDS
   - Past trauma and pain
   - What has hurt them

3) FEARS
   - Deep fears that drive behavior
   - What they're running from

4) INTERNAL BATTLE
   - The war within themselves
   - Conflicting desires/values

5) POTENTIAL CORRUPTION OR HEALING
   - Could they become darker? How?
   - Could they heal? What would trigger it?

6) END-OF-SERIES FORM
   - Who they become by series end
   - How they've transformed

7) BOOK-BY-BOOK STATE (for each of ${numBooks} books)
   - Emotional state at start of book
   - Key growth/setback in book
   - State at end of book

Return as JSON:
{
  "Character Name": {
    "starting_state": "...",
    "wounds": "...",
    "fears": "...",
    "internal_battle": "...",
    "corruption_or_healing": "...",
    "end_of_series_form": "...",
    "book_states": {
      "1": {"start": "...", "growth": "...", "end": "..."},
      "2": {"start": "...", "growth": "...", "end": "..."}
    }
  }
}
`;

    const system = `You are a master character psychologist. You understand the deep
psychology of characters in ${genreLabel} fiction - their wounds, fears, and growth potential. Create
believable, emotionally resonant character arcs that never flatten or reset.
Match the stated genre and audience; do not assume Young Adult unless the material calls for it.`;

    const response = await runChatCompletion({
      model: resolveModel(model, PipelineStep.SERIES_EVOLUTION),
      system,
      prompt,
      jsonResponse: true,
      maxTokens: 5000,
      generationMeta: { seriesId, type: "series-evolution" },
    });

    const { error } = await supabaseAdmin
      .from("series_character_evolution")
      .upsert({
        series_id: seriesId,
        evolution: response,
      });

    if (error) throw error;

    return NextResponse.json({ evolution: response });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate character evolution" },
      { status: 500 }
    );
  }
}
