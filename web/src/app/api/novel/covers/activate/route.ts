import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * POST /api/novel/covers/activate
 * Sets a specific cover as active (is_active = true) and deactivates all other
 * covers for the same novel. This persists the "Use as Cover" selection.
 *
 * Body: { novelId: string, coverUrl: string }
 */
export async function POST(req: Request) {
  try {
    const { novelId, coverUrl } = await req.json();

    if (!novelId || !coverUrl) {
      return NextResponse.json(
        { error: "novelId and coverUrl are required" },
        { status: 400 }
      );
    }

    // Deactivate all covers for this novel
    const { error: deactivateError } = await supabaseAdmin
      .from("cover_design_prompts")
      .update({ is_active: false })
      .eq("novel_id", novelId);

    if (deactivateError) {
      console.error("❌ Error deactivating covers:", deactivateError.message);
      return NextResponse.json(
        { error: "Failed to deactivate existing covers" },
        { status: 500 }
      );
    }

    // Activate the selected cover by URL
    const { data, error: activateError } = await supabaseAdmin
      .from("cover_design_prompts")
      .update({ is_active: true })
      .eq("novel_id", novelId)
      .eq("url", coverUrl)
      .select("id, url, is_active");

    if (activateError) {
      console.error("❌ Error activating cover:", activateError.message);
      return NextResponse.json(
        { error: "Failed to activate cover" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      console.warn("⚠️ No cover row found with that URL to activate");
      return NextResponse.json(
        { error: "Cover not found" },
        { status: 404 }
      );
    }

    console.log("✅ Cover activated:", data[0].id);
    return NextResponse.json({ success: true, cover: data[0] });
  } catch (error) {
    console.error("❌ Cover activate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to activate cover" },
      { status: 500 }
    );
  }
}
