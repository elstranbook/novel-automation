import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type ClueUpdatePayload = {
  id: string;
  description?: string;
  plantedInBook?: number | null;
  plantedInChapter?: number | null;
  secretId?: string | null;
  clueType?: string | null; // dialogue | object | event | description
  isObvious?: boolean | null;
  wasNoticed?: boolean | null;
};

export async function PUT(request: Request) {
  try {
    const {
      id,
      description,
      plantedInBook,
      plantedInChapter,
      secretId,
      clueType,
      isObvious,
      wasNoticed,
    } = (await request.json()) as ClueUpdatePayload;

    // Build update payload — only include fields that were explicitly provided.
    const updates: Record<string, unknown> = {};
    if (description !== undefined) updates.description = description;
    if (plantedInBook !== undefined) updates.planted_in_book = plantedInBook;
    if (plantedInChapter !== undefined) updates.planted_in_chapter = plantedInChapter;
    if (secretId !== undefined) updates.secret_id = secretId;
    if (clueType !== undefined) updates.clue_type = clueType;
    if (isObvious !== undefined) updates.is_obvious = isObvious;
    if (wasNoticed !== undefined) updates.was_noticed = wasNoticed;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields provided to update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("clue")
      .update(updates)
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
