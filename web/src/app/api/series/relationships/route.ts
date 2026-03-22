import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type RelationshipPayload = {
  seriesId: string;
  relationships: Array<Record<string, unknown>>;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get("seriesId");
  if (!seriesId) {
    return NextResponse.json({ error: "seriesId required" }, { status: 400 });
  }

  const { data: log } = await supabaseAdmin
    .from("relationship_log")
    .select("id,relationships")
    .eq("series_id", seriesId)
    .maybeSingle();

  return NextResponse.json({ relationships: log?.relationships ?? [] });
}

export async function POST(request: Request) {
  try {
    const { seriesId, relationships } =
      (await request.json()) as RelationshipPayload;
    if (!seriesId) {
      return NextResponse.json({ error: "seriesId required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("relationship_log")
      .upsert({
        series_id: seriesId,
        relationships: relationships ?? [],
      })
      .select("id,relationships")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ relationships: data.relationships ?? [] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save relationships" }, { status: 500 });
  }
}
