import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type WorldPayload = {
  seriesId: string;
  setting?: string;
  rules?: Record<string, unknown> | null;
  lore?: Record<string, unknown> | null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get("seriesId");
  if (!seriesId) {
    return NextResponse.json({ error: "seriesId required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("series_worlds")
    .select("id,setting,rules,lore")
    .eq("series_id", seriesId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ world: data ?? null });
}

export async function POST(request: Request) {
  try {
    const { seriesId, setting, rules, lore } =
      (await request.json()) as WorldPayload;

    if (!seriesId) {
      return NextResponse.json(
        { error: "seriesId required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("series_worlds")
      .upsert({
        series_id: seriesId,
        setting: setting ?? "",
        rules: rules ?? null,
        lore: lore ?? null,
      })
      .select("id,setting,rules,lore")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ world: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save world" }, { status: 500 });
  }
}
