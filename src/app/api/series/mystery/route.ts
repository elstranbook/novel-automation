import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type SecretPayload = {
  seriesId: string;
  title: string;
  description: string;
  revealedInBook?: number | null;
  revealedInChapter?: number | null;
  revealMethod?: string | null;
  whoKnows?: unknown;
  whoDoesntKnow?: unknown;
  status?: string | null; // hidden | partial | revealed (default: hidden)
};

type CluePayload = {
  seriesId: string;
  description: string;
  secretId?: string | null;
  plantedInBook: number;
  plantedInChapter?: number | null;
  clueType?: string | null; // dialogue | object | event | description
  isObvious?: boolean | null;
  wasNoticed?: boolean | null;
};

/** Coerce a string-or-array input into a JSONB-safe array */
function coerceList(value: unknown): unknown {
  if (value == null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.includes(",")) {
      return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [trimmed];
  }
  if (Array.isArray(value)) return value;
  return value;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get("seriesId");
  if (!seriesId) {
    return NextResponse.json({ error: "seriesId required" }, { status: 400 });
  }

  const { data: log } = await supabaseAdmin
    .from("mystery_log")
    .select("*")
    .eq("series_id", seriesId)
    .maybeSingle();

  const { data: secrets } = await supabaseAdmin
    .from("secret")
    .select("*")
    .eq("mystery_log_id", log?.id ?? "");

  const { data: clues } = await supabaseAdmin
    .from("clue")
    .select("*")
    .eq("mystery_log_id", log?.id ?? "");

  return NextResponse.json({ log: log ?? null, secrets: secrets ?? [], clues: clues ?? [] });
}

export async function POST(request: Request) {
  const body = await request.json();

  // Ensure mystery_log row exists for this series (upsert returns the id)
  const ensureLog = async (seriesId: string) => {
    const { data: log } = await supabaseAdmin
      .from("mystery_log")
      .upsert({ series_id: seriesId })
      .select("id")
      .single();
    return log?.id;
  };

  if (body.type === "secret") {
    const {
      seriesId,
      title,
      description,
      revealedInBook,
      revealedInChapter,
      revealMethod,
      whoKnows,
      whoDoesntKnow,
      status,
    } = body as SecretPayload;

    if (!seriesId || !title || !description) {
      return NextResponse.json(
        { error: "seriesId, title, and description are required" },
        { status: 400 }
      );
    }

    const logId = await ensureLog(seriesId);
    const { data, error } = await supabaseAdmin
      .from("secret")
      .insert({
        mystery_log_id: logId,
        title,
        description,
        revealed_in_book: revealedInBook ?? null,
        revealed_in_chapter: revealedInChapter ?? null,
        reveal_method: revealMethod ?? null,
        who_knows: coerceList(whoKnows),
        who_doesnt_know: coerceList(whoDoesntKnow),
        status: status ?? "hidden",
      })
      .select("*")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ secret: data });
  }

  // Clue creation
  const {
    seriesId,
    description,
    secretId,
    plantedInBook,
    plantedInChapter,
    clueType,
    isObvious,
    wasNoticed,
  } = body as CluePayload;

  if (!seriesId || !description || !plantedInBook) {
    return NextResponse.json(
      { error: "seriesId, description, and plantedInBook are required" },
      { status: 400 }
    );
  }

  const logId = await ensureLog(seriesId);
  const { data, error } = await supabaseAdmin
    .from("clue")
    .insert({
      mystery_log_id: logId,
      description,
      secret_id: secretId ?? null,
      planted_in_book: plantedInBook,
      planted_in_chapter: plantedInChapter ?? null,
      clue_type: clueType ?? null,
      is_obvious: isObvious ?? false,
      was_noticed: wasNoticed ?? false,
    })
    .select("*")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ clue: data });
}
