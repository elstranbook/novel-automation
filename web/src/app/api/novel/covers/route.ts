import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const novelId = searchParams.get("novelId");

    if (!novelId) {
      return NextResponse.json({ error: "novelId required" }, { status: 400 });
    }

    // Get novel's cover_url from Supabase
    const { data: novel } = await supabaseAdmin
      .from("novels")
      .select("cover_url, created_at")
      .eq("id", novelId)
      .maybeSingle();
    
    console.log("Novel cover_url:", novel?.cover_url);

    return NextResponse.json({ coverUrl: novel?.cover_url || null });
  } catch (error) {
    console.error("Error fetching covers:", error);
    return NextResponse.json({ error: "Failed to fetch covers" }, { status: 500 });
  }
}