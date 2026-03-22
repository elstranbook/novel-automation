import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type CanonUpdate = {
  id: string;
  fact?: string;
  category?: string;
};

export async function PUT(request: Request) {
  try {
    const { id, fact, category } = (await request.json()) as CanonUpdate;
    const { data, error } = await supabaseAdmin
      .from("canon_log_entry")
      .update({
        fact,
        category,
      })
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
