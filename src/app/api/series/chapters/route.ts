import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type ChapterPayload = {
  bookId: string;
  chapterNumber: number;
  title?: string;
  synopsis?: string;
  content?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get("bookId");
  const seriesId = searchParams.get("seriesId");

  // Support both bookId (single book) and seriesId (all books in series)
  if (seriesId) {
    // Get all book IDs for this series first
    const { data: books, error: booksError } = await supabaseAdmin
      .from("series_books")
      .select("id")
      .eq("series_id", seriesId);

    if (booksError) {
      return NextResponse.json({ error: booksError.message }, { status: 500 });
    }

    const bookIds = (books ?? []).map((b: { id: string }) => b.id);

    if (bookIds.length === 0) {
      return NextResponse.json({ chapters: [] });
    }

    const { data, error } = await supabaseAdmin
      .from("chapter")
      .select("*")
      .in("book_id", bookIds)
      .order("chapter_number", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ chapters: data ?? [] });
  }

  if (!bookId) {
    return NextResponse.json(
      { error: "bookId or seriesId required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("chapter")
    .select("*")
    .eq("book_id", bookId)
    .order("chapter_number", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ chapters: data ?? [] });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ChapterPayload;
    if (!payload.bookId || !payload.chapterNumber) {
      return NextResponse.json(
        { error: "bookId and chapterNumber required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("chapter")
      .upsert({
        book_id: payload.bookId,
        chapter_number: payload.chapterNumber,
        title: payload.title ?? null,
        synopsis: payload.synopsis ?? null,
        content: payload.content ?? null,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ chapter: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save chapter" }, { status: 500 });
  }
}
