import { NextResponse } from "next/server";
import { findRelevantBooks, selectBooks, type SearchIntent } from "@/lib/seoArticleService";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * POST /api/generate/seo-match-books
 * Find books relevant to a search question using vector search + metadata scoring.
 */
export async function POST(request: Request) {
  try {
    const { question, intent, userId } = await request.json();

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json(
        { error: "A search question is required" },
        { status: 400 }
      );
    }

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Use provided intent or construct a minimal one
    const searchIntent: SearchIntent = intent || {
      intent: "informational",
      themes: [],
      topics: [],
      emotions: [],
      audience: [],
      genreFit: [],
      searchSummary: question,
    };

    const candidates = await findRelevantBooks(question, searchIntent, userId);
    const selection = selectBooks(candidates);

    return NextResponse.json({
      candidates,
      selected: selection.selected,
      reason: selection.reason,
    });
  } catch (error) {
    console.error("Book matching failed:", error);
    return NextResponse.json(
      { error: "Failed to match books" },
      { status: 500 }
    );
  }
}
