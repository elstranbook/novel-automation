import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type DeletePayload = { id: string };

export async function DELETE(request: Request) {
  try {
    const { id } = (await request.json()) as DeletePayload;
    const { error } = await supabaseAdmin.from("secret").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete secret" }, { status: 500 });
  }
}
