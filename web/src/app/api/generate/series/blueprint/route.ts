import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { runChatCompletion } from "@/lib/openaiClient";

type BlueprintRequest = {
  seriesId: string;
  title: string;
  numBooks: number;
  bookNumber: number;
  model?: string;
};

export async function POST(request: Request) {
  try {
    const { seriesId, title, numBooks, bookNumber, model } =
      (await request.json()) as BlueprintRequest;

    if (!seriesId || !title || !numBooks || !bookNumber) {
      return NextResponse.json(
        { error: "Series ID, title, numBooks, and bookNumber are required" },
        { status: 400 }
      );
    }

    const { data: bible } = await supabaseAdmin
      .from("series_bibles")
      .select("*")
      .eq("series_id", seriesId)
      .maybeSingle();

    const { data: bookMap } = await supabaseAdmin
      .from("series_book_maps")
      .select("map_data")
      .eq("series_id", seriesId)
      .eq("book_number", bookNumber)
      .maybeSingle();

    const { data: evolution } = await supabaseAdmin
      .from("series_character_evolution")
      .select("evolution")
      .eq("series_id", seriesId)
      .maybeSingle();

    const contextParts = [
      bible ? `SERIES BIBLE:\n${JSON.stringify(bible, null, 2).slice(0, 2000)}` : "",
      bookMap ? `BOOK MAP:\n${JSON.stringify(bookMap.map_data, null, 2)}` : "",
      evolution
        ? `CHARACTER EVOLUTION:\n${JSON.stringify(evolution.evolution, null, 2).slice(0, 2000)}`
        : "",
    ].filter(Boolean);

    const prompt = `
Generate a detailed BOOK BLUEPRINT for Book ${bookNumber} of ${numBooks} in the "${title}" series.

${contextParts.join("\n\n")}

Create a complete outline including:

1) OPENING SHIFT
   - The inciting incident
   - What changes the protagonist's world
   - Hook that pulls readers in

2) MIDPOINT SHOCK
   - The major revelation at midpoint
   - How it changes everything
   - The point of no return

3) LOWEST EMOTIONAL POINT
   - The all-is-lost moment
   - Deepest despair/doubt
   - What brings them to their knees

4) CLIMAX
   - The final confrontation
   - What's at stake
   - How it's resolved (or not)

5) ENDING CHANGE
   - How the world is different
   - Character transformation shown
   - Emotional resolution

6) RELATIONSHIP CHANGES
   - How key relationships evolved
   - New alliances or breaks
   - Romantic developments if any

7) THEME PRESSURE
   - How themes are tested in this book
   - Thematic questions raised
   - Symbolic moments

8) SETUP FOR NEXT BOOK (if not final book)
   - Seeds planted
   - Unresolved threads
   - What readers will anticipate

9) FULL OUTLINE
   - Chapter-by-chapter breakdown (15-25 chapters)
   - Key scenes per chapter
   - Emotional beats throughout

Return as JSON:
{
  "opening_shift": "...",
  "midpoint_shock": "...",
  "lowest_point": "...",
  "climax": "...",
  "ending_change": "...",
  "relationship_changes": "...",
  "theme_pressure": "...",
  "next_book_setup": "...",
  "full_outline": "Chapter 1: ... Chapter 2: ... etc"
}
`;

    const system = `You are an expert YA novel architect. Create emotionally powerful
book outlines with perfect pacing, shocking twists, and satisfying arcs. Every
chapter must serve the story. Build toward the climax with mounting tension.`;

    const response = await runChatCompletion({
      model: model || "gpt-4.1-mini",
      system,
      prompt,
      jsonResponse: true,
      maxTokens: 6000,
    });

    const { error } = await supabaseAdmin
      .from("series_book_blueprints")
      .upsert({
        series_id: seriesId,
        book_number: bookNumber,
        blueprint: response,
      });

    if (error) throw error;

    return NextResponse.json({ blueprint: response });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate book blueprint" },
      { status: 500 }
    );
  }
}
