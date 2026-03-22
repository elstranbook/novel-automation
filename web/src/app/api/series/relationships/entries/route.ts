import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type RelationshipEntryPayload = {
  seriesId: string;
  relationshipLogId?: string;
  characterAName: string;
  characterBName: string;
  relationshipType: string;
  status?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const relationshipLogId = searchParams.get("relationshipLogId");
  const seriesId = searchParams.get("seriesId");
  if (!relationshipLogId && !seriesId) {
    return NextResponse.json(
      { error: "relationshipLogId or seriesId required" },
      { status: 400 }
    );
  }

  let logId = relationshipLogId;
  if (!logId && seriesId) {
    const { data: log } = await supabaseAdmin
      .from("relationship_log")
      .select("id")
      .eq("series_id", seriesId)
      .maybeSingle();
    logId = log?.id ?? null;
  }

  if (!logId) {
    return NextResponse.json({ entries: [] });
  }

  const { data } = await supabaseAdmin
    .from("relationship_entry")
    .select("*")
    .eq("relationship_log_id", logId)
    .order("created_at", { ascending: true });

  return NextResponse.json({ entries: data ?? [] });
}

export async function PUT(request: Request) {
  try {
    const {
      seriesId,
      relationshipLogId,
      characterAName,
      characterBName,
      relationshipType,
      status,
    } = (await request.json()) as RelationshipEntryPayload;

    if (!seriesId) {
      return NextResponse.json({ error: "seriesId required" }, { status: 400 });
    }

    let logId = relationshipLogId;
    if (!logId) {
      const { data: log } = await supabaseAdmin
        .from("relationship_log")
        .upsert({ series_id: seriesId })
        .select("id")
        .single();
      logId = log?.id ?? null;
    }

    const { data, error } = await supabaseAdmin
      .from("relationship_entry")
      .upsert({
        relationship_log_id: logId,
        character_a_name: characterAName,
        character_b_name: characterBName,
        relationship_type: relationshipType,
        status: status ?? "neutral",
      })
      .select("*")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ entry: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update relationship entry" }, { status: 500 });
  }
}
