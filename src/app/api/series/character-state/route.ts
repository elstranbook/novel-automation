import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type CharacterStatePayload = {
  characterId: string;
  bookId: string;
  age?: string | null;
  location?: string | null;
  emotionalState?: string | null;
  knowledge?: Record<string, unknown> | unknown[] | null;
  dontKnow?: Record<string, unknown> | unknown[] | null;
  beliefs?: Record<string, unknown> | unknown[] | null;
  relationships?: Record<string, unknown> | unknown[] | null;
  skills?: Record<string, unknown> | unknown[] | null;
  possessions?: Record<string, unknown> | unknown[] | null;
  developments?: Record<string, unknown> | unknown[] | null;
  trauma?: Record<string, unknown> | unknown[] | string | null;
  growth?: Record<string, unknown> | unknown[] | string | null;
  losses?: Record<string, unknown> | unknown[] | null;
  gains?: Record<string, unknown> | unknown[] | null;
  internalConflict?: string | null;
  emotionalEvents?: Record<string, unknown> | unknown[] | null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const characterId = searchParams.get("characterId");
  const bookId = searchParams.get("bookId");
  if (!characterId || !bookId) {
    return NextResponse.json(
      { error: "characterId and bookId required" },
      { status: 400 }
    );
  }

  const { data } = await supabaseAdmin
    .from("character_state")
    .select("*")
    .eq("character_id", characterId)
    .eq("book_id", bookId)
    .maybeSingle();

  return NextResponse.json({ state: data ?? null });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CharacterStatePayload;
    if (!payload.characterId || !payload.bookId) {
      return NextResponse.json(
        { error: "characterId and bookId required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("character_state")
      .upsert(
        {
          character_id: payload.characterId,
          book_id: payload.bookId,
          age: payload.age ?? null,
          location: payload.location ?? null,
          emotional_state: payload.emotionalState ?? null,
          knowledge: payload.knowledge ?? null,
          dont_know: payload.dontKnow ?? null,
          beliefs: payload.beliefs ?? null,
          relationships: payload.relationships ?? null,
          skills: payload.skills ?? null,
          possessions: payload.possessions ?? null,
          developments: payload.developments ?? null,
          trauma: payload.trauma ?? null,
          growth: payload.growth ?? null,
          losses: payload.losses ?? null,
          gains: payload.gains ?? null,
          internal_conflict: payload.internalConflict ?? null,
          emotional_events: payload.emotionalEvents ?? null,
        },
        { onConflict: "character_id,book_id" }
      )
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ state: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save character state" }, { status: 500 });
  }
}
