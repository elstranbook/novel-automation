import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type WorldElementUpdate = {
  id: string;
  name?: string;
  type?: string;
  description?: string;
  importance?: string;
  introduced_in_book?: number | null;
};

export async function PUT(request: Request) {
  try {
    const { id, name, type, description, importance, introduced_in_book } =
      (await request.json()) as WorldElementUpdate;

    const updatePayload: Record<string, unknown> = {};

    if (name !== undefined) updatePayload.name = name;
    if (type !== undefined) updatePayload.type = type;
    if (description !== undefined) updatePayload.description = description;
    if (importance !== undefined) updatePayload.importance = importance;
    if (introduced_in_book !== undefined) {
      updatePayload.introduced_in_book =
        introduced_in_book != null && introduced_in_book > 0
          ? introduced_in_book
          : null;
    }

    const { data, error } = await supabaseAdmin
      .from("world_element")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ element: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update world element" }, { status: 500 });
  }
}
