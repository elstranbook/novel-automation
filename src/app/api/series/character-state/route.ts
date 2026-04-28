import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type CharacterStatePayload = {
  characterId: string;
  bookId: string;
  emotionalState?: string;
  knowledge?: Record<string, unknown> | null;
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
      .upsert({
        character_id: payload.characterId,
        book_id: payload.bookId,
        emotional_state: payload.emotionalState ?? null,
        knowledge: payload.knowledge ?? null,
      })
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
