import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type ForeshadowPayload = {
  seriesId: string;
  eventType: string;
  eventDescription: string;
  setupBook: number;
  payoffBook?: number | null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get("seriesId");
  if (!seriesId) {
    return NextResponse.json({ error: "seriesId required" }, { status: 400 });
  }

  const { data } = await supabaseAdmin
    .from("foreshadowing")
    .select("id,event_type,event_description,setup_book,payoff_book,status")
    .eq("series_id", seriesId)
    .order("setup_book", { ascending: true });

  return NextResponse.json({ foreshadowing: data ?? [] });
}

export async function POST(request: Request) {
  try {
    const { seriesId, eventType, eventDescription, setupBook, payoffBook } =
      (await request.json()) as ForeshadowPayload;
    const { data, error } = await supabaseAdmin
      .from("foreshadowing")
      .insert({
        series_id: seriesId,
        event_type: eventType,
        event_description: eventDescription,
        setup_book: setupBook,
        payoff_book: payoffBook ?? null,
      })
      .select("id,event_type,event_description,setup_book,payoff_book,status")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ foreshadow: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save foreshadowing" }, { status: 500 });
  }
}
