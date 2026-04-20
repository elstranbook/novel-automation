import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type WorldElementUpdate = {
  id: string;
  description?: string;
  importance?: string;
};

export async function PUT(request: Request) {
  try {
    const { id, description, importance } =
      (await request.json()) as WorldElementUpdate;
    const { data, error } = await supabaseAdmin
      .from("world_element")
      .update({
        description,
        importance,
      })
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
