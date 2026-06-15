import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const { seriesId, bookNumber } = await request.json();

    if (!seriesId || !bookNumber) {
      return NextResponse.json(
        { error: "Series ID and book number are required" },
        { status: 400 }
      );
    }

    const { data: series, error: seriesError } = await supabaseAdmin
      .from("series")
      .select("*")
      .eq("id", seriesId)
      .single();

    if (seriesError) throw seriesError;

    const { data: arc } = await supabaseAdmin
      .from("series_arcs")
      .select("*")
      .eq("series_id", seriesId)
      .maybeSingle();

    const { data: priorBooks } = await supabaseAdmin
      .from("novel_synopsis")
      .select("*")
      .in(
        "novel_id",
        (
          await supabaseAdmin
            .from("novels")
            .select("id")
            .eq("series_id", seriesId)
            .lt("book_number", bookNumber)
        ).data?.map((row) => row.id) ?? []
      );

    const [
      { data: world },
      { data: characters },
      { data: memory },
      { data: books },
      { data: canonLog },
      { data: canonEntries },
      { data: relationshipLog },
      { data: mysteryLog },
      { data: secrets },
      { data: clues },
      { data: plotThreads },
      { data: worldElements },
      { data: foreshadowing },
      { data: callbacks },
    ] = await Promise.all([
      supabaseAdmin
        .from("series_worlds")
        .select("*")
        .eq("series_id", seriesId)
        .maybeSingle(),
      supabaseAdmin
        .from("series_characters")
        .select("*")
        .eq("series_id", seriesId),
      supabaseAdmin
        .from("series_memory")
        .select("*")
        .eq("series_id", seriesId)
        .order("created_at", { ascending: true }),
      supabaseAdmin
        .from("series_books")
        .select("*")
        .eq("series_id", seriesId)
        .order("book_number", { ascending: true }),
      supabaseAdmin
        .from("canon_log")
        .select("*")
        .eq("series_id", seriesId)
        .maybeSingle(),
      supabaseAdmin
        .from("canon_log_entry")
        .select("*")
        .in(
          "canon_log_id",
          (
            await supabaseAdmin
              .from("canon_log")
              .select("id")
              .eq("series_id", seriesId)
          ).data?.map((row) => row.id) ?? []
        ),
      supabaseAdmin
        .from("relationship_log")
        .select("*")
        .eq("series_id", seriesId)
        .maybeSingle(),
      supabaseAdmin
        .from("mystery_log")
        .select("*")
        .eq("series_id", seriesId)
        .maybeSingle(),
      supabaseAdmin
        .from("secret")
        .select("*")
        .in(
          "mystery_log_id",
          (
            await supabaseAdmin
              .from("mystery_log")
              .select("id")
              .eq("series_id", seriesId)
          ).data?.map((row) => row.id) ?? []
        ),
      supabaseAdmin
        .from("clue")
        .select("*")
        .in(
          "mystery_log_id",
          (
            await supabaseAdmin
              .from("mystery_log")
              .select("id")
              .eq("series_id", seriesId)
          ).data?.map((row) => row.id) ?? []
        ),
      supabaseAdmin
        .from("plot_thread")
        .select("*")
        .eq("series_id", seriesId),
      supabaseAdmin
        .from("world_element")
        .select("*")
        .eq("series_id", seriesId),
      supabaseAdmin
        .from("foreshadowing")
        .select("*")
        .eq("series_id", seriesId),
      supabaseAdmin
        .from("callback")
        .select("*")
        .eq("series_id", seriesId),
    ]);

    const context = {
      series_title: series.title,
      series_description: series.description,
      series_arc: arc?.overall_arc ?? null,
      character_arcs: arc?.character_arcs ?? null,
      themes: arc?.themes ?? null,
      continuity_notes: arc?.continuity_notes ?? null,
      book_number: bookNumber,
      total_books: series.num_books,
      world: world ?? null,
      characters: characters ?? [],
      memory: memory ?? [],
      book_map: books ?? [],
      canon_log: canonLog ?? null,
      canon_entries: canonEntries ?? [],
      relationships: relationshipLog?.relationships ?? [],
      mystery_log: mysteryLog ?? null,
      secrets: secrets ?? [],
      clues: clues ?? [],
      plot_threads: plotThreads ?? [],
      world_elements: worldElements ?? [],
      foreshadowing: foreshadowing ?? [],
      callbacks: callbacks ?? [],
      prior_books: (priorBooks ?? []).map((book) => ({
        title: `Book ${book.novel_id}`,
        synopsis: book.synopsis,
      })),
    };

    return NextResponse.json({ context });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load series context" },
      { status: 500 }
    );
  }
}
