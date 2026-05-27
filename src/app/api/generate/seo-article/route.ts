import { NextResponse } from "next/server";
import { runFullPipeline, type SeoArticleGenerationSettings } from "@/lib/seoArticleService";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * POST /api/generate/seo-article
 * Full pipeline: question → intent → match → generate → store.
 *
 * Body:
 *   question: string (required)
 *   userId: string (required)
 *   settings: SeoArticleGenerationSettings (optional)
 *   overrideBookIds: string[] (optional — manual book selection override)
 */
export async function POST(request: Request) {
  try {
    const {
      question,
      userId,
      settings = {},
      overrideBookIds,
    } = await request.json();

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

    const generationSettings: SeoArticleGenerationSettings = {
      tone: settings.tone || "thoughtful",
      wordCount: settings.wordCount || 1800,
      promotionIntensity: settings.promotionIntensity ?? 50,
      targetAudience: settings.targetAudience || "",
      primaryKeyword: settings.primaryKeyword || "",
      secondaryKeywords: settings.secondaryKeywords || [],
      internalLinks: settings.internalLinks || [],
      readingGrade: settings.readingGrade || 0,
      model: settings.model,
    };

    const result = await runFullPipeline(
      question,
      userId,
      generationSettings,
      overrideBookIds
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("SEO article generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate SEO article: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}
