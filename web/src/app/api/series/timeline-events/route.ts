import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type TimelinePayload = {
  seriesId: string;
  eventName: string;
  description: string;
  eventType?: string;
  inWorldDate?: string;
  bookId?: string | null;
  chapterId?: string | null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get("seriesId");
  if (!seriesId) {
    return NextResponse.json({ error: "seriesId required" }, { status: 400 });
  }

  const { data } = await supabaseAdmin
    .from("timeline_event")
    .select("*")
    .eq("series_id", seriesId)
    .order("created_at", { ascending: true });

  return NextResponse.json({ events: data ?? [] });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as TimelinePayload;
    if (!payload.seriesId || !payload.eventName || !payload.description) {
      return NextResponse.json(
        { error: "seriesId, eventName, description required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("timeline_event")
      .insert({
        series_id: payload.seriesId,
        event_name: payload.eventName,
        description: payload.description,
        event_type: payload.eventType ?? "plot",
        in_world_date: payload.inWorldDate ?? null,
        book_id: payload.bookId ?? null,
        chapter_id: payload.chapterId ?? null,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ event: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save timeline event" }, { status: 500 });
  }
}
