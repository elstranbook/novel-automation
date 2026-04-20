import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type PlotThreadUpdate = {
  id: string;
  status?: string;
  resolvedInBook?: number | null;
};

export async function PUT(request: Request) {
  try {
    const { id, status, resolvedInBook } =
      (await request.json()) as PlotThreadUpdate;
    const { data, error } = await supabaseAdmin
      .from("plot_thread")
      .update({
        status: status ?? "setup",
        resolved_in_book: resolvedInBook ?? null,
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ thread: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update plot thread" }, { status: 500 });
  }
}
