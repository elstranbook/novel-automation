import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type SecretPayload = {
  seriesId: string;
  title: string;
  description: string;
  revealedInBook?: number | null;
};

type CluePayload = {
  seriesId: string;
  description: string;
  secretId?: string | null;
  plantedInBook: number;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get("seriesId");
  if (!seriesId) {
    return NextResponse.json({ error: "seriesId required" }, { status: 400 });
  }

  const { data: log } = await supabaseAdmin
    .from("mystery_log")
    .select("id,active_mysteries,resolved_mysteries")
    .eq("series_id", seriesId)
    .maybeSingle();

  const { data: secrets } = await supabaseAdmin
    .from("secret")
    .select("id,title,description,status,revealed_in_book")
    .eq("mystery_log_id", log?.id ?? "");

  const { data: clues } = await supabaseAdmin
    .from("clue")
    .select("id,description,secret_id,planted_in_book")
    .eq("mystery_log_id", log?.id ?? "");

  return NextResponse.json({ log: log ?? null, secrets: secrets ?? [], clues: clues ?? [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (body.type === "secret") {
    const { seriesId, title, description, revealedInBook } = body as SecretPayload;
    const { data: log } = await supabaseAdmin
      .from("mystery_log")
      .upsert({ series_id: seriesId })
      .select("id")
      .single();
    const { data, error } = await supabaseAdmin
      .from("secret")
      .insert({
        mystery_log_id: log?.id,
        title,
        description,
        revealed_in_book: revealedInBook ?? null,
      })
      .select("id,title,description,status,revealed_in_book")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ secret: data });
  }

  const { seriesId, description, secretId, plantedInBook } = body as CluePayload;
  const { data: log } = await supabaseAdmin
    .from("mystery_log")
    .upsert({ series_id: seriesId })
    .select("id")
    .single();
  const { data, error } = await supabaseAdmin
    .from("clue")
    .insert({
      mystery_log_id: log?.id,
      description,
      secret_id: secretId ?? null,
      planted_in_book: plantedInBook,
    })
    .select("id,description,secret_id,planted_in_book")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ clue: data });
}
