import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

/**
 * GET /api/seo-articles?userId=xxx
 * List all SEO articles for a user.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    let query = supabaseAdmin
      .from("seo_articles")
      .select("id, question, title, slug, status, promoted_books, promotion_intensity, tone, word_count, generation_time_ms, created_at, updated_at, published_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ articles: data });
  } catch (error) {
    console.error("Failed to list SEO articles:", error);
    return NextResponse.json({ error: "Failed to list SEO articles" }, { status: 500 });
  }
}

/**
 * POST /api/seo-articles
 * Create a new SEO article (manual save).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, ...articleData } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("seo_articles")
      .insert({ user_id: userId, ...articleData })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ article: data });
  } catch (error) {
    console.error("Failed to create SEO article:", error);
    return NextResponse.json({ error: "Failed to create SEO article" }, { status: 500 });
  }
}
