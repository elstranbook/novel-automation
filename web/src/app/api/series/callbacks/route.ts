import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type CallbackPayload = {
  seriesId: string;
  originalBook: number;
  originalEvent: string;
  callbackBook: number;
  callbackDescription: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get("seriesId");
  if (!seriesId) {
    return NextResponse.json({ error: "seriesId required" }, { status: 400 });
  }
  const { data } = await supabaseAdmin
    .from("callback")
    .select("id,original_book,original_event,callback_book,callback_description")
    .eq("series_id", seriesId)
    .order("original_book", { ascending: true });

  return NextResponse.json({ callbacks: data ?? [] });
}

export async function POST(request: Request) {
  try {
    const { seriesId, originalBook, originalEvent, callbackBook, callbackDescription } =
      (await request.json()) as CallbackPayload;
    const { data, error } = await supabaseAdmin
      .from("callback")
      .insert({
        series_id: seriesId,
        original_book: originalBook,
        original_event: originalEvent,
        callback_book: callbackBook,
        callback_description: callbackDescription,
      })
      .select("id,original_book,original_event,callback_book,callback_description")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ callback: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save callback" }, { status: 500 });
  }
}
