import { NextResponse } from "next/server";
import { analyzeSearchIntent } from "@/lib/seoArticleService";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * POST /api/generate/seo-intent
 * Analyze a search question and extract structured search intent.
 */
export async function POST(request: Request) {
  try {
    const { question, model } = await request.json();

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json(
        { error: "A search question is required" },
        { status: 400 }
      );
    }

    const intent = await analyzeSearchIntent(question, model);

    return NextResponse.json({ intent });
  } catch (error) {
    console.error("SEO intent analysis failed:", error);
    return NextResponse.json(
      { error: "Failed to analyze search intent" },
      { status: 500 }
    );
  }
}
