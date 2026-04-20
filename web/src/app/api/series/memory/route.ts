import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type MemoryPayload = {
  seriesId: string;
  category?: string;
  content: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get("seriesId");
  if (!seriesId) {
    return NextResponse.json({ error: "seriesId required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("series_memory")
    .select("id,category,content,created_at")
    .eq("series_id", seriesId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ entries: data ?? [] });
}

export async function POST(request: Request) {
  try {
    const { seriesId, category, content } = (await request.json()) as MemoryPayload;
    if (!seriesId || !content) {
      return NextResponse.json(
        { error: "seriesId and content required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("series_memory")
      .insert({
        series_id: seriesId,
        category: category ?? "canon",
        content,
      })
      .select("id,category,content,created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ entry: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save memory entry" },
      { status: 500 }
    );
  }
}
