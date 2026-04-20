import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type LogUpdatePayload = {
  id: string;
  status?: string;
  result?: string | null;
  errorMessage?: string | null;
};

export async function PUT(request: Request) {
  try {
    const { id, status, result, errorMessage } =
      (await request.json()) as LogUpdatePayload;
    const { data, error } = await supabaseAdmin
      .from("generation_log")
      .update({
        status: status ?? "completed",
        result: result ?? null,
        error_message: errorMessage ?? null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ log: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update log" }, { status: 500 });
  }
}
