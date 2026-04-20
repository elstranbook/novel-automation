import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type LogPayload = {
  seriesId: string;
  type: string;
  targetId?: string | null;
  prompt?: string | null;
  result?: string | null;
  status?: string;
  errorMessage?: string | null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get("seriesId");
  if (!seriesId) {
    return NextResponse.json({ error: "seriesId required" }, { status: 400 });
  }

  const { data } = await supabaseAdmin
    .from("generation_log")
    .select("*")
    .eq("series_id", seriesId)
    .order("started_at", { ascending: false });

  return NextResponse.json({ logs: data ?? [] });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LogPayload;
    if (!payload.seriesId || !payload.type) {
      return NextResponse.json(
        { error: "seriesId and type required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("generation_log")
      .insert({
        series_id: payload.seriesId,
        type: payload.type,
        target_id: payload.targetId ?? null,
        prompt: payload.prompt ?? null,
        result: payload.result ?? null,
        status: payload.status ?? "pending",
        error_message: payload.errorMessage ?? null,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ log: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save generation log" }, { status: 500 });
  }
}
