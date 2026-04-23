import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * POST /api/novel/covers/activate
 * Sets a specific cover as active (is_active = true) and deactivates all other
 * covers for the same novel. This persists the "Use as Cover" selection.
 *
 * Body: { novelId: string, coverId?: string, coverUrl?: string }
 *
 * Prefer coverId (row UUID) for reliable matching. Falls back to coverUrl
 * if coverId is not provided, but URL matching is unreliable for base64 data URLs.
 */
export async function POST(req: Request) {
  try {
    const { novelId, coverId, coverUrl } = await req.json();

    if (!novelId || (!coverId && !coverUrl)) {
      return NextResponse.json(
        { error: "novelId and either coverId or coverUrl are required" },
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

    // Activate the selected cover — prefer ID matching (reliable) over URL matching (unreliable for base64)
    let query = supabaseAdmin
      .from("cover_design_prompts")
      .update({ is_active: true })
      .eq("novel_id", novelId);

    if (coverId) {
      query = query.eq("id", coverId);
    } else {
      query = query.eq("url", coverUrl);
    }

    const { data, error: activateError } = await query.select("id, url, is_active");

    if (activateError) {
      console.error("❌ Error activating cover:", activateError.message);
      return NextResponse.json(
        { error: "Failed to activate cover" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      console.warn("⚠️ No cover row found to activate", { coverId, coverUrl: coverUrl?.substring(0, 80) });
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
