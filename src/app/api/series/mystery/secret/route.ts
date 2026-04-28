import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type SecretUpdatePayload = {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  revealedInBook?: number | null;
};

export async function PUT(request: Request) {
  try {
    const { id, title, description, status, revealedInBook } =
      (await request.json()) as SecretUpdatePayload;
    const { data, error } = await supabaseAdmin
      .from("secret")
      .update({
        title,
        description,
        status,
        revealed_in_book: revealedInBook ?? null,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ secret: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update secret" }, { status: 500 });
  }
}
