import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type TensionPayload = {
  bookId: string;
  startTension?: number;
  incitingIncident?: number | null;
  firstComplication?: number | null;
  midpointTension?: number | null;
  falseHope?: number | null;
  climaxTension?: number | null;
  resolutionTension?: number | null;
  currentTension?: number | null;
  lastPeak?: string | null;
  targetPacing?: Record<string, unknown> | unknown[] | null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get("bookId");
  if (!bookId) {
    return NextResponse.json({ error: "bookId required" }, { status: 400 });
  }

  const { data } = await supabaseAdmin
    .from("tension_profile")
    .select("*")
    .eq("book_id", bookId)
    .maybeSingle();

  return NextResponse.json({ tension: data ?? null });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as TensionPayload;
    if (!payload.bookId) {
      return NextResponse.json({ error: "bookId required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("tension_profile")
      .upsert(
        {
          book_id: payload.bookId,
          start_tension: payload.startTension ?? 2,
          inciting_incident: payload.incitingIncident ?? null,
          first_complication: payload.firstComplication ?? null,
          midpoint_tension: payload.midpointTension ?? null,
          false_hope: payload.falseHope ?? null,
          climax_tension: payload.climaxTension ?? null,
          resolution_tension: payload.resolutionTension ?? null,
          current_tension: payload.currentTension ?? payload.startTension ?? 2,
          last_peak: payload.lastPeak ?? null,
          target_pacing: payload.targetPacing ?? null,
        },
        { onConflict: "book_id" }
      )
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tension: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save tension profile" }, { status: 500 });
  }
}
