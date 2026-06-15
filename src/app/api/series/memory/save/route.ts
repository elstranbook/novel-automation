import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

/**
 * POST /api/series/memory/save
 * Inserts a memory entry.  Uses supabaseAdmin so RLS never blocks writes.
 */
export async function POST(request: Request) {
  try {
    const { seriesId, category, content } = await request.json() as {
      seriesId: string;
      category: string;
      content: string;
    };

    if (!seriesId || !category) {
      return NextResponse.json({ error: "seriesId and category required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("series_memory")
      .insert({ series_id: seriesId, category, content: content ?? "" });

    if (error) {
      console.error("[memory-save] Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[memory-save] Error:", error);
    return NextResponse.json({ error: "Failed to save memory" }, { status: 500 });
  }
}
