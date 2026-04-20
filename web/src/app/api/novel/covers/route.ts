import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const novelId = searchParams.get("novelId");

    if (!novelId) {
      return NextResponse.json({ error: "novelId required" }, { status: 400 });
    }

    // Get cover URLs from cover_design_prompts table (not from novels table)
    const { data: covers, error } = await supabaseAdmin
      .from("cover_design_prompts")
      .select("url, model, is_active, created_at")
      .eq("novel_id", novelId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching covers:", error);
      return NextResponse.json({ error: "Failed to fetch covers" }, { status: 500 });
    }

    // Prefer the active cover, otherwise the most recent one with a URL
    const activeCover = covers?.find((c) => c.is_active && c.url);
    const latestCoverWithUrl = covers?.find((c) => c.url);
    const coverUrl = activeCover?.url || latestCoverWithUrl?.url || null;

    return NextResponse.json({
      coverUrl,
      covers: covers?.filter((c) => c.url).map((c) => ({
        url: c.url,
        model: c.model,
        isActive: c.is_active,
        createdAt: c.created_at,
      })) ?? [],
    });
  } catch (error) {
    console.error("Error fetching covers:", error);
    return NextResponse.json({ error: "Failed to fetch covers" }, { status: 500 });
  }
}
