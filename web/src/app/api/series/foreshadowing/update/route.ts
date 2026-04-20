import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type ForeshadowUpdate = {
  id: string;
  status?: string;
  existingHints?: number;
  requiredHints?: number;
};

export async function PUT(request: Request) {
  try {
    const { id, status, existingHints, requiredHints } =
      (await request.json()) as ForeshadowUpdate;
    const { data, error } = await supabaseAdmin
      .from("foreshadowing")
      .update({
        status,
        existing_hints: existingHints ?? null,
        required_hints: requiredHints ?? null,
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ foreshadow: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update foreshadowing" }, { status: 500 });
  }
}
