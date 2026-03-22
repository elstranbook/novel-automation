import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type WorldElementPayload = {
  seriesId: string;
  type: string;
  name: string;
  description: string;
  importance?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get("seriesId");
  if (!seriesId) {
    return NextResponse.json({ error: "seriesId required" }, { status: 400 });
  }

  const { data } = await supabaseAdmin
    .from("world_element")
    .select("id,type,name,description,importance")
    .eq("series_id", seriesId)
    .order("created_at", { ascending: true });

  return NextResponse.json({ elements: data ?? [] });
}

export async function POST(request: Request) {
  try {
    const { seriesId, type, name, description, importance } =
      (await request.json()) as WorldElementPayload;
    const { data, error } = await supabaseAdmin
      .from("world_element")
      .insert({
        series_id: seriesId,
        type,
        name,
        description,
        importance: importance ?? "moderate",
      })
      .select("id,type,name,description,importance")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ element: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save world element" }, { status: 500 });
  }
}
