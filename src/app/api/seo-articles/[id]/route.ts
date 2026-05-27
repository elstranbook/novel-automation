import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

/**
 * GET /api/seo-articles/[id]?userId=xxx
 * Get a single SEO article by ID.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("seo_articles")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ article: data });
  } catch (error) {
    console.error("Failed to get SEO article:", error);
    return NextResponse.json({ error: "Failed to get SEO article" }, { status: 500 });
  }
}

/**
 * PATCH /api/seo-articles/[id]
 * Update an SEO article (edit content, change status, publish).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, ...updates } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // If publishing, set published_at
    if (updates.status === "published" && !updates.published_at) {
      updates.published_at = new Date().toISOString();
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("seo_articles")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ article: data });
  } catch (error) {
    console.error("Failed to update SEO article:", error);
    return NextResponse.json({ error: "Failed to update SEO article" }, { status: 500 });
  }
}

/**
 * DELETE /api/seo-articles/[id]?userId=xxx
 * Delete an SEO article.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("seo_articles")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete SEO article:", error);
    return NextResponse.json({ error: "Failed to delete SEO article" }, { status: 500 });
  }
}
