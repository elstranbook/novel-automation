import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type BookMemoryPayload = {
  bookId: string;
  canonState?: Record<string, unknown> | unknown[] | null;
  relationshipState?: Record<string, unknown> | unknown[] | null;
  mysteryState?: Record<string, unknown> | unknown[] | null;
  characterKnowledge?: Record<string, unknown> | unknown[] | null;
  emotionalMemories?: Record<string, unknown> | unknown[] | null;
  compressedSummary?: Record<string, unknown> | string | null;
  newFacts?: Record<string, unknown> | unknown[] | null;
  changedRelationships?: Record<string, unknown> | unknown[] | null;
  newClues?: Record<string, unknown> | unknown[] | null;
  resolvedMysteries?: Record<string, unknown> | unknown[] | null;
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
      .upsert(
        {
          book_id: payload.bookId,
          canon_state: payload.canonState ?? null,
          relationship_state: payload.relationshipState ?? null,
          mystery_state: payload.mysteryState ?? null,
          character_knowledge: payload.characterKnowledge ?? null,
          emotional_memories: payload.emotionalMemories ?? null,
          compressed_summary: payload.compressedSummary ?? null,
          new_facts: payload.newFacts ?? null,
          changed_relationships: payload.changedRelationships ?? null,
          new_clues: payload.newClues ?? null,
          resolved_mysteries: payload.resolvedMysteries ?? null,
        },
        { onConflict: "book_id" }
      )
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
