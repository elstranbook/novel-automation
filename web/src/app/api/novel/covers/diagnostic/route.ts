import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * Diagnostic endpoint to check cover_design_prompts table structure and data.
 * Call with ?novelId=<id> to check covers for a specific novel.
 * Call without params to check table structure only.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const novelId = searchParams.get("novelId");

    const result: Record<string, unknown> = {};

    // 1. Check if the cover_design_prompts table is accessible with new columns
    const { data: tableCheck, error: tableError } = await supabaseAdmin
      .from("cover_design_prompts")
      .select("id, novel_id, prompt, url, model, is_active, created_at")
      .limit(5);

    if (tableError) {
      result.tableAccessible = false;
      result.tableError = tableError.message;
      result.hint = "The cover_design_prompts table may be missing the url, model, or is_active columns. Run the migration SQL in your Supabase SQL editor.";
    } else {
      result.tableAccessible = true;
      result.totalRows = tableCheck?.length ?? 0;
      result.rowsWithUrl = tableCheck?.filter((r) => r.url).length ?? 0;
      result.rowsWithoutUrl = tableCheck?.filter((r) => !r.url).length ?? 0;
      result.sampleRows = tableCheck?.map((r) => ({
        id: r.id?.substring(0, 8) + "...",
        novel_id: r.novel_id?.substring(0, 8) + "...",
        hasUrl: !!r.url,
        urlPrefix: r.url ? r.url.substring(0, 60) + "..." : null,
        model: r.model,
        is_active: r.is_active,
        promptLength: r.prompt?.length ?? 0,
        created_at: r.created_at,
      }));
    }

    // 2. If novelId provided, check covers for that specific novel
    if (novelId) {
      const { data: novelCovers, error: novelError } = await supabaseAdmin
        .from("cover_design_prompts")
        .select("id, url, model, is_active, prompt, created_at")
        .eq("novel_id", novelId)
        .order("created_at", { ascending: false });

      if (novelError) {
        result.novelCoversError = novelError.message;
      } else {
        result.novelCovers = novelCovers?.map((c) => ({
          id: c.id?.substring(0, 8) + "...",
          hasUrl: !!c.url,
          urlPrefix: c.url ? c.url.substring(0, 80) + "..." : null,
          model: c.model,
          is_active: c.is_active,
          promptLength: c.prompt?.length ?? 0,
          created_at: c.created_at,
        }));
        result.novelCoverCount = novelCovers?.length ?? 0;
        result.activeCoverCount = novelCovers?.filter((c) => c.is_active).length ?? 0;
        result.coversWithUrl = novelCovers?.filter((c) => c.url).length ?? 0;
      }

      // Also check if the novel-covers storage bucket is accessible
      const { data: buckets, error: bucketError } = await supabaseAdmin
        .storage
        .listBuckets();

      if (bucketError) {
        result.storageError = bucketError.message;
      } else {
        const novelCoversBucket = buckets?.find((b) => b.name === "novel-covers");
        result.novelCoversBucketExists = !!novelCoversBucket;
        result.novelCoversBucketPublic = novelCoversBucket?.public ?? false;
      }
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Cover diagnostic error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Diagnostic failed" },
      { status: 500 }
    );
  }
}
