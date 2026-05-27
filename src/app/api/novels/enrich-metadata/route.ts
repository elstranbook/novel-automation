import { NextResponse } from "next/server";
import { enrichNovelMetadata, batchEnrichNovels, generateAndStoreEmbedding } from "@/lib/seoArticleService";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * POST /api/novels/enrich-metadata
 * Enrich novel metadata (themes, topics, emotions, audience, marketing_summary, embedding).
 *
 * Body:
 *   userId: string (required)
 *   novelId: string (optional — if provided, enrich only this novel; otherwise batch)
 *   model: string (optional)
 */
export async function POST(request: Request) {
  try {
    const { userId, novelId, model } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    if (novelId) {
      // Enrich a single novel
      const result = await enrichNovelMetadata(novelId, userId, model);

      if (!result) {
        return NextResponse.json(
          { error: "Failed to enrich novel metadata. Novel may not exist or AI generation failed." },
          { status: 500 }
        );
      }

      // Generate and store embedding
      await generateAndStoreEmbedding(novelId, userId, result.search_text);

      return NextResponse.json({
        success: true,
        novelId,
        themes: result.themes,
        topics: result.topics,
        emotions: result.emotions,
        audience: result.audience,
        marketingSummary: result.marketing_summary,
      });
    }

    // Batch enrichment
    const result = await batchEnrichNovels(userId, model);

    // Generate embeddings for all enriched novels
    const { data: enrichedNovels } = await supabaseAdmin
      .from("novels")
      .select("id, search_text")
      .eq("user_id", userId)
      .not("metadata_enriched_at", "is", null)
      .is("embedding", null);

    if (enrichedNovels) {
      for (const novel of enrichedNovels) {
        if (novel.search_text) {
          await generateAndStoreEmbedding(novel.id, userId, novel.search_text);
        }
      }
    }

    return NextResponse.json({
      success: true,
      enriched: result.enriched,
      failed: result.failed,
    });
  } catch (error) {
    console.error("Metadata enrichment failed:", error);
    return NextResponse.json(
      { error: "Failed to enrich novel metadata" },
      { status: 500 }
    );
  }
}
