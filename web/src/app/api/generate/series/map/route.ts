import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { runChatCompletion } from "@/lib/openaiClient";

type SeriesMapRequest = {
  seriesId: string;
  title: string;
  numBooks: number;
  model?: string;
  seriesBible?: Record<string, unknown> | null;
};

export async function POST(request: Request) {
  try {
    const { seriesId, title, numBooks, model, seriesBible } =
      (await request.json()) as SeriesMapRequest;

    if (!seriesId || !title || !numBooks) {
      return NextResponse.json(
        { error: "Series ID, title, and numBooks are required" },
        { status: 400 }
      );
    }

    let bibleContext = "";
    const bible = seriesBible
      ? seriesBible
      : (
          await supabaseAdmin
            .from("series_bibles")
            .select("*")
            .eq("series_id", seriesId)
            .maybeSingle()
        ).data ?? null;

    if (bible) {
      bibleContext = `
SERIES BIBLE REFERENCE:
World Overview: ${bible.world_overview ?? "N/A"}
Core Themes: ${JSON.stringify(bible.themes_symbols ?? [])}
Character Files: ${JSON.stringify(bible.character_files ?? {})}
Series Arc Summary: ${bible.series_arc_summary ?? "N/A"}
`;
    }

    const prompt = `
Create a detailed BOOK-BY-BOOK MAP for a ${numBooks}-book YA series titled "${title}".
${bibleContext}

For EACH of the ${numBooks} books, provide:

1) CENTRAL CONFLICT
   - The main problem/challenge of this book
   - Internal and external conflicts

2) EMOTIONAL JOURNEY
   - The protagonist's emotional arc in this book
   - Key emotional beats and turning points

3) CHARACTER GROWTH
   - How characters evolve in this book
   - What lessons they learn

4) TWIST OR REVEAL
   - The major twist or revelation
   - How it changes everything

5) FINAL STATE
   - How the book ends
   - What has changed from the beginning

6) FORESHADOWING SEEDS
   - Elements planted for future books
   - Hints and setups for later payoffs

7) STAKES ESCALATION
   - How stakes are raised from the previous book
   - Why this book matters more

**CRITICAL RULES:**
- Each book must raise the stakes
- Never allow emotional resets between books
- Build toward the final book
- Plant seeds that pay off later

Return as JSON array with one object per book:
[
  {
    "book_number": 1,
    "central_conflict": "...",
    "emotional_journey": "...",
    "character_growth": "...",
    "twist_reveal": "...",
    "final_state": "...",
    "foreshadowing_seeds": ["seed1", "seed2"],
    "stakes_escalation": "..."
  }
]
`;

    const system = `You are an expert series planner. Each book must escalate stakes,
    deepen characters, and build toward the finale. Never allow resets. Always think
    in terms of the full series arc.`;

    const response = await runChatCompletion({
      model: model || "gpt-4.1-mini",
      system,
      prompt,
      jsonResponse: true,
      maxTokens: 5000,
    });

    const { error } = await supabaseAdmin
      .from("series_book_maps")
      .delete()
      .eq("series_id", seriesId);

    if (error) throw error;

    if (Array.isArray(response)) {
      const rows = response.map((bookMap) => ({
        series_id: seriesId,
        book_number: bookMap.book_number ?? 1,
        map_data: bookMap,
      }));
      if (rows.length) {
        await supabaseAdmin.from("series_book_maps").insert(rows);
      }
    }

    return NextResponse.json({ maps: response });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate series map" },
      { status: 500 }
    );
  }
}
