import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type CallbackUpdate = {
  id: string;
  callbackDescription?: string;
  isExecuted?: boolean;
};

export async function PUT(request: Request) {
  try {
    const { id, callbackDescription, isExecuted } =
      (await request.json()) as CallbackUpdate;
    const { data, error } = await supabaseAdmin
      .from("callback")
      .update({
        callback_description: callbackDescription,
        is_executed: isExecuted ?? false,
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ callback: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update callback" }, { status: 500 });
  }
}
