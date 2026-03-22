import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type CharacterPayload = {
  seriesId: string;
  name: string;
  role?: string;
  description?: string;
  arc?: Record<string, unknown> | null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get("seriesId");
  if (!seriesId) {
    return NextResponse.json({ error: "seriesId required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("series_characters")
    .select("id,name,role,description,arc")
    .eq("series_id", seriesId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ characters: data ?? [] });
}

export async function POST(request: Request) {
  try {
    const { seriesId, name, role, description, arc } =
      (await request.json()) as CharacterPayload;
    if (!seriesId || !name) {
      return NextResponse.json(
        { error: "seriesId and name are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("series_characters")
      .insert({
        series_id: seriesId,
        name,
        role: role ?? "",
        description: description ?? "",
        arc: arc ?? null,
      })
      .select("id,name,role,description,arc")
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
