import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type TimelineUpdatePayload = {
  id: string;
  description?: string;
  eventName?: string;
  eventType?: string;
};

export async function PUT(request: Request) {
  try {
    const { id, description, eventName, eventType } =
      (await request.json()) as TimelineUpdatePayload;
    const { data, error } = await supabaseAdmin
      .from("timeline_event")
      .update({
        description,
        event_name: eventName,
        event_type: eventType,
      })
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
