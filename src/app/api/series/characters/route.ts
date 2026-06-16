import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type CharacterPayload = {
  seriesId: string;
  name: string;
  role?: string;
  description?: string;
  arc?: Record<string, unknown> | null;
  age?: string | null;
  gender?: string | null;
  appearance?: Record<string, unknown> | null;
  personality?: Record<string, unknown> | null;
  backstory?: string | null;
  motivation?: string | null;
  conflict?: string | null;
  core_desire?: string | null;
  big_fear?: string | null;
  hidden_secret?: string | null;
  growth_arc?: Record<string, unknown> | null;
  start_state?: string | null;
  end_state?: string | null;
  knowledge_timeline?: Record<string, unknown> | null;
  relationships?: Record<string, unknown> | null;
  voice_profile?: Record<string, unknown> | null;
  emotional_memory?: Record<string, unknown> | null;
  arc_stages?: unknown[] | null;
  introduced_in_book?: number | null;
  introduced_in_chapter?: number | null;
  is_fully_developed?: boolean | null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get("seriesId");
  if (!seriesId) {
    return NextResponse.json({ error: "seriesId required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("series_characters")
    .select("*")
    .eq("series_id", seriesId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ characters: data ?? [] });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CharacterPayload;
    const { seriesId, name } = body;
    if (!seriesId || !name) {
      return NextResponse.json(
        { error: "seriesId and name are required" },
        { status: 400 }
      );
    }

    const insertData: Record<string, unknown> = {
      series_id: seriesId,
      name,
      role: body.role ?? "",
      description: body.description ?? "",
      arc: body.arc ?? null,
      age: body.age ?? null,
      gender: body.gender ?? null,
      appearance: body.appearance ?? null,
      personality: body.personality ?? null,
      backstory: body.backstory ?? null,
      motivation: body.motivation ?? null,
      conflict: body.conflict ?? null,
      core_desire: body.core_desire ?? null,
      big_fear: body.big_fear ?? null,
      hidden_secret: body.hidden_secret ?? null,
      growth_arc: body.growth_arc ?? null,
      start_state: body.start_state ?? null,
      end_state: body.end_state ?? null,
      knowledge_timeline: body.knowledge_timeline ?? null,
      relationships: body.relationships ?? null,
      voice_profile: body.voice_profile ?? null,
      emotional_memory: body.emotional_memory ?? null,
      arc_stages: body.arc_stages ?? null,
      introduced_in_book: body.introduced_in_book ?? null,
      introduced_in_chapter: body.introduced_in_chapter ?? null,
      is_fully_developed: body.is_fully_developed ?? false,
    };

    const { data, error } = await supabaseAdmin
      .from("series_characters")
      .insert(insertData)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ character: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save character" },
      { status: 500 }
    );
  }
}
