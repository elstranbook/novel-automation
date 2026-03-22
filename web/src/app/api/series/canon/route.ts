import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type CanonEntryPayload = {
  seriesId: string;
  category: string;
  fact: string;
  source?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get("seriesId");
  if (!seriesId) {
    return NextResponse.json({ error: "seriesId required" }, { status: 400 });
  }

  const { data: log } = await supabaseAdmin
    .from("canon_log")
    .select("*")
    .eq("series_id", seriesId)
    .maybeSingle();

  const { data: entries } = await supabaseAdmin
    .from("canon_log_entry")
    .select("id,category,fact,source,created_at")
    .eq("canon_log_id", log?.id ?? "")
    .order("created_at", { ascending: true });

  return NextResponse.json({ log: log ?? null, entries: entries ?? [] });
}

export async function POST(request: Request) {
  try {
    const { seriesId, category, fact, source } =
      (await request.json()) as CanonEntryPayload;
    if (!seriesId || !category || !fact) {
      return NextResponse.json(
        { error: "seriesId, category, fact required" },
        { status: 400 }
      );
    }

    const { data: log } = await supabaseAdmin
      .from("canon_log")
      .upsert({ series_id: seriesId })
      .select("id")
      .single();

    const { data, error } = await supabaseAdmin
      .from("canon_log_entry")
      .insert({
        canon_log_id: log?.id,
        category,
        fact,
        source: source ?? "",
      })
      .select("id,category,fact,source,created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ entry: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save canon entry" }, { status: 500 });
  }
}
