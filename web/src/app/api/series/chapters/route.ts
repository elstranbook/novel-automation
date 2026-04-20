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
  if (!bookId) {
    return NextResponse.json({ error: "bookId required" }, { status: 400 });
  }

  const { data } = await supabaseAdmin
    .from("chapter")
    .select("*")
    .eq("book_id", bookId)
    .order("chapter_number", { ascending: true });

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
