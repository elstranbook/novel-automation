import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type TimelinePayload = {
  seriesId: string;
  eventOrder: number;
  title?: string;
  description: string;
  bookNumber?: number | null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get("seriesId");
  if (!seriesId) {
    return NextResponse.json({ error: "seriesId required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("series_timeline_events")
    .select("id,event_order,title,description,book_number")
    .eq("series_id", seriesId)
    .order("event_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ events: data ?? [] });
}

export async function POST(request: Request) {
  try {
    const { seriesId, eventOrder, title, description, bookNumber } =
      (await request.json()) as TimelinePayload;
    if (!seriesId || !description) {
      return NextResponse.json(
        { error: "seriesId and description required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("series_timeline_events")
      .insert({
        series_id: seriesId,
        event_order: eventOrder ?? 1,
        title: title ?? "",
        description,
        book_number: bookNumber ?? null,
      })
      .select("id,event_order,title,description,book_number")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ event: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save timeline event" },
      { status: 500 }
    );
  }
}
