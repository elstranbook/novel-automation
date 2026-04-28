import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type BookMemoryPayload = {
  bookId: string;
  canonState?: Record<string, unknown> | null;
  relationshipState?: Record<string, unknown> | null;
  mysteryState?: Record<string, unknown> | null;
  characterKnowledge?: Record<string, unknown> | null;
  emotionalMemories?: Record<string, unknown> | null;
  compressedSummary?: Record<string, unknown> | null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get("bookId");
  if (!bookId) {
    return NextResponse.json({ error: "bookId required" }, { status: 400 });
  }

  const { data } = await supabaseAdmin
    .from("book_memory")
    .select("*")
    .eq("book_id", bookId)
    .maybeSingle();

  return NextResponse.json({ memory: data ?? null });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as BookMemoryPayload;
    if (!payload.bookId) {
      return NextResponse.json({ error: "bookId required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("book_memory")
      .upsert({
        book_id: payload.bookId,
        canon_state: payload.canonState ?? null,
        relationship_state: payload.relationshipState ?? null,
        mystery_state: payload.mysteryState ?? null,
        character_knowledge: payload.characterKnowledge ?? null,
        emotional_memories: payload.emotionalMemories ?? null,
        compressed_summary: payload.compressedSummary ?? null,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ memory: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save book memory" }, { status: 500 });
  }
}
