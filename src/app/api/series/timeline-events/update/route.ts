import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type TimelineUpdatePayload = {
  id: string;
  title?: string;
  description?: string;
  bookNumber?: number | null;
  chapterNumber?: number | null;
  eventOrder?: number;
};

export async function PUT(request: Request) {
  try {
    const { id, title, description, bookNumber, chapterNumber, eventOrder } =
      (await request.json()) as TimelineUpdatePayload;
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const patch: Record<string, unknown> = {};
    if (title !== undefined) patch.title = title;
    if (description !== undefined) patch.description = description;
    if (bookNumber !== undefined) patch.book_number = bookNumber;
    if (chapterNumber !== undefined) patch.chapter_number = chapterNumber;
    if (eventOrder !== undefined) patch.event_order = eventOrder;

    const { data, error } = await supabaseAdmin
      .from("series_timeline_events")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ event: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update timeline event" }, { status: 500 });
  }
}
