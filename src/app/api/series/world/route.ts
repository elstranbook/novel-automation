import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type WorldPayload = {
  seriesId: string;
  summary?: string;
  setting?: string;
  rules?: string | Record<string, unknown> | null;
  lore?: string | Record<string, unknown> | null;
};

/** Convert a value that might be jsonb (object) or text into a plain string */
function toText(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get("seriesId");
  if (!seriesId) {
    return NextResponse.json({ error: "seriesId required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("series_worlds")
    .select("*")
    .eq("series_id", seriesId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Normalize rules/lore to text (they may come back as jsonb objects)
  if (data) {
    data.rules = toText(data.rules);
    data.lore = toText(data.lore);
    data.summary = toText(data.summary) ?? "";
  }

  return NextResponse.json({ world: data ?? null });
}

export async function POST(request: Request) {
  try {
    const { seriesId, summary, setting, rules, lore } =
      (await request.json()) as WorldPayload;

    if (!seriesId) {
      return NextResponse.json(
        { error: "seriesId required" },
        { status: 400 }
      );
    }

    const payload: Record<string, unknown> = {
      setting: setting ?? "",
      rules: rules ?? null,
      lore: lore ?? null,
    };

    // Only include summary if the column exists (graceful for pre-migration)
    if (summary !== undefined) {
      payload.summary = summary;
    }

    // Check if a world row already exists for this series
    const { data: existing } = await supabaseAdmin
      .from("series_worlds")
      .select("id")
      .eq("series_id", seriesId)
      .maybeSingle();

    let result;
    if (existing) {
      // Update existing row
      result = await supabaseAdmin
        .from("series_worlds")
        .update(payload)
        .eq("id", existing.id)
        .select("*")
        .single();
    } else {
      // Insert new row
      result = await supabaseAdmin
        .from("series_worlds")
        .insert({
          series_id: seriesId,
          ...payload,
        })
        .select("*")
        .single();
    }

    const { data, error } = result;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Normalize rules/lore to text in the response
    if (data) {
      data.rules = toText(data.rules);
      data.lore = toText(data.lore);
      data.summary = toText(data.summary) ?? "";
    }

    return NextResponse.json({ world: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save world" }, { status: 500 });
  }
}
