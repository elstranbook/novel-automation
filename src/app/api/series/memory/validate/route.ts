import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  inferSeriesMemoryWarnings,
  type SeriesMemoryEntry,
} from "@/lib/seriesMemoryValidate";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get("seriesId");

  if (!seriesId) {
    return NextResponse.json({ error: "seriesId required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("series_memory")
    .select("*")
    .eq("series_id", seriesId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: books } = await supabaseAdmin
    .from("series_books")
    .select("*")
    .eq("series_id", seriesId);

  const totalBooks = Math.max(
    1,
    ...(books ?? []).map((book) => Number(book.book_number) || 1)
  );

  const warnings = inferSeriesMemoryWarnings(
    (data ?? []) as SeriesMemoryEntry[],
    totalBooks,
    { includeRelationshipChecks: true }
  );
  return NextResponse.json({ warnings });
}
