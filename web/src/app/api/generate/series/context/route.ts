import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

    const { data: arc, error: arcError } = await supabaseAdmin
      .from("series_arcs")
      .select("*")
      .eq("series_id", seriesId)
      .single();

    if (arcError) throw arcError;

    const { data: priorBooks } = await supabaseAdmin
      .from("novel_synopsis")
      .select("novel_id, synopsis")
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

    const context = {
      series_title: series.title,
      series_arc: arc.overall_arc,
      character_arcs: arc.character_arcs,
      themes: arc.themes,
      continuity_notes: arc.continuity_notes,
      book_number: bookNumber,
      total_books: series.num_books,
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
