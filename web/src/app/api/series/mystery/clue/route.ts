import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type ClueUpdatePayload = {
  id: string;
  description?: string;
  plantedInBook?: number;
  wasNoticed?: boolean;
};

export async function PUT(request: Request) {
  try {
    const { id, description, plantedInBook, wasNoticed } =
      (await request.json()) as ClueUpdatePayload;
    const { data, error } = await supabaseAdmin
      .from("clue")
      .update({
        description,
        planted_in_book: plantedInBook ?? null,
        was_noticed: wasNoticed ?? false,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ clue: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update clue" }, { status: 500 });
  }
}
