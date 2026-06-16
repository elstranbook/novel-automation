import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type CanonUpdate = {
  id: string;
  fact?: string;
  category?: string;
  source?: string;
  cannot_change?: boolean;
};

export async function PUT(request: Request) {
  try {
    const { id, fact, category, source, cannot_change } =
      (await request.json()) as CanonUpdate;

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    // Build the update payload from provided fields only
    const updates: Record<string, unknown> = {};
    if (fact !== undefined) updates.fact = fact;
    if (category !== undefined) updates.category = category;
    if (source !== undefined) updates.source = source;
    if (cannot_change !== undefined) updates.cannot_change = cannot_change;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "At least one of fact, category, source, cannot_change required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("canon_log_entry")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ entry: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update canon entry" }, { status: 500 });
  }
}
