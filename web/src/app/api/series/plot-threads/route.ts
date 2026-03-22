import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type PlotThreadPayload = {
  seriesId: string;
  name: string;
  description: string;
  type?: string;
  introducedInBook?: number;
  resolvedInBook?: number | null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get("seriesId");
  if (!seriesId) {
    return NextResponse.json({ error: "seriesId required" }, { status: 400 });
  }

  const { data } = await supabaseAdmin
    .from("plot_thread")
    .select("id,name,description,type,introduced_in_book,resolved_in_book,status")
    .eq("series_id", seriesId)
    .order("introduced_in_book", { ascending: true });

  return NextResponse.json({ threads: data ?? [] });
}

export async function POST(request: Request) {
  try {
    const { seriesId, name, description, type, introducedInBook, resolvedInBook } =
      (await request.json()) as PlotThreadPayload;
    const { data, error } = await supabaseAdmin
      .from("plot_thread")
      .insert({
        series_id: seriesId,
        name,
        description,
        type: type ?? "main",
        introduced_in_book: introducedInBook ?? 1,
        resolved_in_book: resolvedInBook ?? null,
      })
      .select("id,name,description,type,introduced_in_book,resolved_in_book,status")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ thread: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save plot thread" }, { status: 500 });
  }
}
