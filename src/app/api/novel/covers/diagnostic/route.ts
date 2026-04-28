import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * Diagnostic endpoint to check cover infrastructure.
 * Call with ?novelId=<id> to check covers for a specific novel.
 * Call without params to check table and bucket structure only.
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
      result.tableHint = "The cover_design_prompts table may be missing the url, model, or is_active columns. Run the migration SQL in your Supabase SQL editor.";
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

    // 2. ALWAYS check storage bucket status (not just when novelId is provided)
    const { data: buckets, error: bucketError } = await supabaseAdmin
      .storage
      .listBuckets();

    if (bucketError) {
      result.storageError = bucketError.message;
      result.storageHint = "Could not list storage buckets. Check your SUPABASE_SERVICE_ROLE_KEY.";
    } else {
      const novelCoversBucket = buckets?.find((b) => b.name === "novel-covers");
      result.novelCoversBucketExists = !!novelCoversBucket;
      result.novelCoversBucketPublic = novelCoversBucket?.public ?? false;
      result.allBucketNames = buckets?.map((b) => b.name);

      if (!novelCoversBucket) {
        result.storageHint = "CRITICAL: The 'novel-covers' storage bucket does NOT exist. Cover images cannot be uploaded or persisted. Fix: Go to Supabase Dashboard → Storage → New Bucket → name: 'novel-covers', toggle 'Public bucket' ON. The API will also attempt to auto-create this bucket on the next cover generation.";
      }
    }

    // 3. If novelId provided, check covers for that specific novel
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
