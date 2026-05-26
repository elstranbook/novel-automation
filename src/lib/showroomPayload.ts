import { supabaseAdmin } from "@/lib/supabaseAdmin";

type NovelRow = {
  id: string;
  title: string;
  series_id: string | null;
  book_number: number | null;
  created_at: string;
};

type JsonRow = { created_at: string; [key: string]: unknown };
type FormatRow = { format_name: string; content: string; created_at: string };

/** A single promotional article row */
type PromotionalArticleRow = {
  article_type: string;
  length_type: string;
  tone: string | null;
  cta_type: string | null;
  title: string | null;
  content: string | null;
  created_at: string;
};

/** A cover row from cover_design_prompts */
type CoverRow = {
  id: string;
  url: string | null;
  model: string | null;
  is_active: boolean;
  created_at: string;
};

/**
 * Showroom payload — only includes data that appears on the publish page
 * and is needed by elstranbooks.com.
 *
 * Removed (not needed in showroom):
 * - dedication (already embedded in the novel export)
 * - coverPrompt (only the cover image is needed)
 * - allCovers (only the selected/active cover is needed)
 * - all format variants (only the fully formatted DOCX novel is needed)
 */
export type ShowroomPayload = {
  source: "elstran-studio";
  generatedAt: string;
  novel: {
    id: string;
    title: string;
    createdAt: string;
    seriesId: string | null;
    bookNumber: number | null;
  };
  publish: {
    /** Short marketing description (marketing_short or marketing_standard fallback) */
    shortDescription: string | null;
    /** Back cover description */
    backCoverDescription: string | null;
    /** All book descriptions for reference */
    bookDescriptions: Array<{
      type: string;
      length: string;
      content: string;
    }>;
    keywords: string[];
    bisac: string[];
    /** The active/selected cover image URL */
    coverUrl: string | null;
    facebookImageUrl: string | null;
    instagramImageUrl: string | null;
    quotes: string[];
    /** The fully formatted novel as base64-encoded DOCX */
    formattedNovel: string | null;
    promotionalArticles: Array<{
      articleType: string;
      lengthType: string;
      tone: string | null;
      ctaType: string | null;
      title: string | null;
      content: string | null;
      contentFormat: "html" | "text";
    }>;
    socialSnippets: string | null;
  };
};

/** Lightweight payload for the novels list endpoint */
export type ShowroomNovelListItem = {
  id: string;
  title: string;
  createdAt: string;
  seriesId: string | null;
  bookNumber: number | null;
  coverUrl: string | null;
};

const parseStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
};

/**
 * Build a showroom payload for a single novel.
 * Only includes what elstranbooks.com needs: descriptions, keywords, BISAC,
 * selected cover, social images, quotes, fully formatted novel (DOCX),
 * promotional articles (HTML), and social snippets.
 */
export async function buildShowroomPayload(
  novelId: string
): Promise<ShowroomPayload | null> {
  const { data: novel, error: novelError } = await supabaseAdmin
    .from("novels")
    .select("id,title,series_id,book_number,created_at")
    .eq("id", novelId)
    .single<NovelRow>();

  if (novelError || !novel) return null;

  // Fetch only publish-page data in parallel
  const [
    descriptionsResult,
    keywordsResult,
    bisacResult,
    quotesResult,
    socialResult,
    formatsResult,
    coversResult,
    articlesResult,
  ] = await Promise.all([
    // Book Descriptions
    supabaseAdmin
      .from("book_descriptions")
      .select("description_type,length_type,content,created_at")
      .eq("novel_id", novelId)
      .order("created_at", { ascending: false })
      .returns<Array<{ description_type: string; length_type: string; content: string; created_at: string }>>(),

    // Keywords
    supabaseAdmin
      .from("novel_keywords")
      .select("keywords,created_at")
      .eq("novel_id", novelId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<JsonRow>(),

    // BISAC
    supabaseAdmin
      .from("novel_bisac")
      .select("categories,created_at")
      .eq("novel_id", novelId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<JsonRow>(),

    // Quotes
    supabaseAdmin
      .from("novel_quotes")
      .select("quotes,created_at")
      .eq("novel_id", novelId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<JsonRow>(),

    // Social Snippets
    supabaseAdmin
      .from("social_snippets")
      .select("content,created_at")
      .eq("novel_id", novelId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<{ content: string; created_at: string }>(),

    // Formats — we only need the fully formatted DOCX novel (export_docx)
    supabaseAdmin
      .from("novel_formats")
      .select("format_name,content,created_at")
      .eq("novel_id", novelId)
      .eq("format_name", "export_docx")
      .limit(1)
      .maybeSingle<FormatRow>(),

    // Cover Design Prompts
    supabaseAdmin
      .from("cover_design_prompts")
      .select("id,url,model,is_active,created_at")
      .eq("novel_id", novelId)
      .order("is_active", { ascending: false })
      .order("created_at", { ascending: false })
      .returns<CoverRow[]>(),

    // Promotional Articles
    supabaseAdmin
      .from("promotional_articles")
      .select("article_type,length_type,tone,cta_type,title,content,created_at")
      .eq("novel_id", novelId)
      .order("created_at", { ascending: false })
      .returns<PromotionalArticleRow[]>(),
  ]);

  // The fully formatted novel is stored as "export_docx" — a base64-encoded DOCX
  const formattedNovel = formatsResult.data?.content ?? null;

  // Determine the active/latest cover URL (exclude social media images)
  const coverCovers = (coversResult.data ?? []).filter(
    (c) =>
      !String(c.model || "").startsWith("facebook-") &&
      !String(c.model || "").startsWith("instagram-")
  );
  const activeCover = coverCovers.find((c) => c.is_active && c.url) || coverCovers.find((c) => c.url);

  // Get Facebook & Instagram images
  const fbCover = (coversResult.data ?? []).find(
    (c) => c.url && String(c.model || "").startsWith("facebook-")
  );
  const igCover = (coversResult.data ?? []).find(
    (c) => c.url && String(c.model || "").startsWith("instagram-")
  );

  // Build promotional articles — detect format (HTML vs plain text)
  const promotionalArticles: ShowroomPayload["publish"]["promotionalArticles"] = (
    articlesResult.data ?? []
  ).map((row) => {
    const isHtml = row.content
      ? /<[a-z][\s\S]*>/i.test(row.content)
      : false;
    return {
      articleType: row.article_type,
      lengthType: row.length_type,
      tone: row.tone,
      ctaType: row.cta_type,
      title: row.title,
      content: row.content,
      contentFormat: isHtml ? "html" : "text",
    };
  });

  // Extract key descriptions for easy access
  const descData = descriptionsResult.data ?? [];
  const findDescription = (type: string, length: string) =>
    descData.find((row) => row.description_type === type && row.length_type === length)?.content ?? null;

  const shortDescription =
    findDescription("marketing", "short") ??
    findDescription("marketing", "standard") ??
    null;

  // The back cover description may be stored in different formats depending
  // on when it was generated:
  // - Old (buggy save): description_type="back", length_type="cover" → key "back_cover"
  // - New (fixed save): description_type="back_cover", length_type="standard" → key "back_cover_standard"
  const backCoverDescription =
    findDescription("back_cover", "standard") ??
    findDescription("back_cover", "long") ??
    findDescription("back", "cover") ??
    null;

  return {
    source: "elstran-studio",
    generatedAt: new Date().toISOString(),
    novel: {
      id: novel.id,
      title: novel.title,
      createdAt: novel.created_at,
      seriesId: novel.series_id,
      bookNumber: novel.book_number ?? null,
    },
    publish: {
      shortDescription,
      backCoverDescription,
      bookDescriptions: descData.map((row) => ({
        type: row.description_type,
        length: row.length_type,
        content: row.content,
      })),
      keywords: parseStringArray(keywordsResult.data?.keywords),
      bisac: parseStringArray(bisacResult.data?.categories),
      coverUrl: activeCover?.url ?? null,
      facebookImageUrl: fbCover?.url ?? null,
      instagramImageUrl: igCover?.url ?? null,
      quotes: parseStringArray(quotesResult.data?.quotes),
      formattedNovel,
      promotionalArticles,
      socialSnippets: socialResult.data?.content ?? null,
    },
  };
}

/**
 * Get a list of all novels in the pipeline with basic metadata.
 * Used by the showroom novels list endpoint.
 */
export async function buildShowroomNovelsList(): Promise<ShowroomNovelListItem[]> {
  const { data: novels, error } = await supabaseAdmin
    .from("novels")
    .select("id,title,series_id,book_number,created_at")
    .order("created_at", { ascending: false })
    .returns<NovelRow[]>();

  if (error || !novels) return [];

  // For each novel, fetch cover URL in parallel
  const items = await Promise.all(
    novels.map(async (novel) => {
      const { data: coverRes } = await supabaseAdmin
        .from("cover_design_prompts")
        .select("url,is_active,model")
        .eq("novel_id", novel.id)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle<{ url: string | null; is_active: boolean; model: string }>();

      // Fallback: if no active cover, get the most recent cover that isn't social media
      let coverUrl = coverRes?.url ?? null;
      if (!coverUrl) {
        const { data: fallbackCover } = await supabaseAdmin
          .from("cover_design_prompts")
          .select("url,model")
          .eq("novel_id", novel.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle<{ url: string | null; model: string }>();

        if (fallbackCover?.url && !String(fallbackCover.model || "").startsWith("facebook-") && !String(fallbackCover.model || "").startsWith("instagram-")) {
          coverUrl = fallbackCover.url;
        }
      }

      return {
        id: novel.id,
        title: novel.title,
        createdAt: novel.created_at,
        seriesId: novel.series_id,
        bookNumber: novel.book_number ?? null,
        coverUrl,
      };
    })
  );

  return items;
}
