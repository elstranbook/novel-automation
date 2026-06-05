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

/** Single chapter for the showroom chapters sync endpoint */
export type ShowroomChapterItem = {
  id: string;
  chapterNumber: number;
  title: string;
  content: string;
  isPreview?: boolean;
};

/** Payload returned by GET /api/showroom/novels/{novelId}/chapters */
export type ShowroomChaptersPayload = {
  source: "elstran-studio";
  novelId: string;
  chapters: ShowroomChapterItem[];
};

type ProseSceneRow = {
  chapter_title: string;
  scene_content: string;
  scene_order: number;
  chapter_order: number;
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

const getChapterNumberFromTitle = (chapterTitle: string, fallback: number): number => {
  const [numberPart] = chapterTitle.split(":");
  const parsed = parseInt(numberPart?.trim() ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseChapterDisplayTitle = (chapterTitle: string, chapterNumber: number): string => {
  const parts = chapterTitle.split(":");
  if (parts.length > 1) {
    const name = parts.slice(1).join(":").trim();
    if (name) return name;
  }
  const trimmed = chapterTitle.trim();
  return trimmed || `Chapter ${chapterNumber}`;
};

/**
 * Build chapter prose for showroom sync (elstranbooks.com reader).
 * Groups prose_scenes by chapter_order and joins scene text per chapter.
 * Chapter IDs are deterministic so re-sync updates existing book chapters.
 */
export async function buildShowroomChaptersPayload(
  novelId: string
): Promise<ShowroomChaptersPayload | null> {
  const { data: novel, error: novelError } = await supabaseAdmin
    .from("novels")
    .select("id")
    .eq("id", novelId)
    .maybeSingle<{ id: string }>();

  if (novelError || !novel) return null;

  const { data: rows, error: scenesError } = await supabaseAdmin
    .from("prose_scenes")
    .select("chapter_title,scene_content,scene_order,chapter_order")
    .eq("novel_id", novelId)
    .order("chapter_order", { ascending: true })
    .order("scene_order", { ascending: true })
    .returns<ProseSceneRow[]>();

  if (scenesError) {
    const message = scenesError.message ?? "Failed to load prose scenes";
    if (/prose_scenes|relation.*does not exist/i.test(message)) {
      throw new Error(
        "prose_scenes table is missing in Supabase. Run supabase/migrations/add_prose_scenes.sql"
      );
    }
    throw new Error(message);
  }

  if (!rows?.length) {
    return {
      source: "elstran-studio",
      novelId,
      chapters: [],
    };
  }

  const chapterMap = new Map<number, ProseSceneRow[]>();
  for (const row of rows) {
    const existing = chapterMap.get(row.chapter_order) ?? [];
    existing.push(row);
    chapterMap.set(row.chapter_order, existing);
  }

  const chapters: ShowroomChapterItem[] = [];
  const sortedOrders = [...chapterMap.keys()].sort((a, b) => a - b);

  for (const chapterOrder of sortedOrders) {
    const sceneRows = chapterMap.get(chapterOrder)!;
    const rawTitle = sceneRows[0]?.chapter_title ?? `Chapter ${chapterOrder + 1}`;
    const chapterNumber = getChapterNumberFromTitle(rawTitle, chapterOrder + 1);
    const title = parseChapterDisplayTitle(rawTitle, chapterNumber);
    const content = sceneRows
      .map((row) =>
        typeof row.scene_content === "string"
          ? row.scene_content
          : String(row.scene_content ?? "")
      )
      .filter((text) => text.trim().length > 0)
      .join("\n\n");

    if (!content.trim()) continue;

    chapters.push({
      id: `${novelId}-chapter-${chapterOrder}`,
      chapterNumber,
      title,
      content,
      isPreview: chapterNumber === 1,
    });
  }

  return {
    source: "elstran-studio",
    novelId,
    chapters,
  };
}

// ---------------------------------------------------------------------------
// SEO Article showroom types & builders
// ---------------------------------------------------------------------------

/** Showroom payload for a single SEO article */
export type ShowroomSeoArticle = {
  id: string;
  question: string;
  slug: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  excerpt: string | null;
  articleHtml: string | null;
  articleMarkdown: string | null;
  faq: Array<{ question: string; answer: string }> | null;
  promotedBooks: Array<{ title: string; id: string | null }> | null;
  promotionReason: string | null;
  selectedBooks: string[] | null;
  searchIntent: Record<string, unknown> | null;
  relevanceScores: Array<Record<string, unknown>> | null;
  tone: string | null;
  wordCount: number | null;
  promotionIntensity: number | null;
  targetAudience: string | null;
  primaryKey: string | null;
  secondaryKeywords: string[] | null;
  internalLinks: string[] | null;
  readingGrade: number | null;
  generationTimeMs: number | null;
  status: string | null;
  createdAt: string | null;
  publishedAt: string | null;
};

/** Lightweight list item for SEO articles */
export type ShowroomSeoArticleListItem = {
  id: string;
  question: string;
  slug: string | null;
  metaTitle: string | null;
  status: string | null;
  createdAt: string | null;
  publishedAt: string | null;
};

/** Row shape returned by Supabase for the seo_articles list query */
type SeoArticleListRow = {
  id: string;
  question: string;
  slug: string | null;
  meta_title: string | null;
  status: string | null;
  created_at: string | null;
  published_at: string | null;
};

/** Row shape returned by Supabase for a single seo_articles detail query */
type SeoArticleDetailRow = {
  id: string;
  question: string;
  slug: string | null;
  meta_title: string | null;
  meta_description: string | null;
  excerpt: string | null;
  article_html: string | null;
  article_markdown: string | null;
  faq: unknown;
  promoted_books: unknown;
  promotion_reason: string | null;
  selected_books: unknown;
  search_intent: unknown;
  relevance_scores: unknown;
  tone: string | null;
  word_count: number | null;
  promotion_intensity: number | null;
  target_audience: string | null;
  primary_keyword: string | null;
  secondary_keywords: unknown;
  internal_links: unknown;
  reading_grade: number | null;
  generation_time_ms: number | null;
  status: string | null;
  created_at: string | null;
  published_at: string | null;
};

/**
 * Fetch all published SEO articles for a user and return lightweight list items.
 */
export async function buildShowroomSeoArticlesList(
  userId: string
): Promise<ShowroomSeoArticleListItem[]> {
  const { data, error } = await supabaseAdmin
    .from("seo_articles")
    .select("id,question,slug,meta_title,status,created_at,published_at")
    .eq("user_id", userId)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .returns<SeoArticleListRow[]>();

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    question: row.question,
    slug: row.slug,
    metaTitle: row.meta_title,
    status: row.status,
    createdAt: row.created_at,
    publishedAt: row.published_at,
  }));
}

/**
 * Fetch a single published SEO article by ID and return the full showroom payload.
 * Returns null if the article is not found or not published.
 */
export async function buildShowroomSeoArticlePayload(
  articleId: string,
  userId: string
): Promise<ShowroomSeoArticle | null> {
  const { data, error } = await supabaseAdmin
    .from("seo_articles")
    .select(
      "id,question,slug,meta_title,meta_description,excerpt,article_html,article_markdown,faq,promoted_books,promotion_reason,selected_books,search_intent,relevance_scores,tone,word_count,promotion_intensity,target_audience,primary_keyword,secondary_keywords,internal_links,reading_grade,generation_time_ms,status,created_at,published_at"
    )
    .eq("id", articleId)
    .eq("user_id", userId)
    .eq("status", "published")
    .maybeSingle<SeoArticleDetailRow>();

  if (error || !data) return null;

  // Safely cast jsonb fields
  const faq = Array.isArray(data.faq)
    ? (data.faq as Array<{ question: string; answer: string }>)
    : null;

  const promotedBooks = Array.isArray(data.promoted_books)
    ? (data.promoted_books as Array<{ title: string; id: string | null }>)
    : null;

  const selectedBooks = Array.isArray(data.selected_books)
    ? (data.selected_books as string[])
    : null;

  const searchIntent =
    data.search_intent && typeof data.search_intent === "object"
      ? (data.search_intent as Record<string, unknown>)
      : null;

  const relevanceScores = Array.isArray(data.relevance_scores)
    ? (data.relevance_scores as Array<Record<string, unknown>>)
    : null;

  const secondaryKeywords = Array.isArray(data.secondary_keywords)
    ? (data.secondary_keywords as string[])
    : null;

  const internalLinks = Array.isArray(data.internal_links)
    ? (data.internal_links as string[])
    : null;

  return {
    id: data.id,
    question: data.question,
    slug: data.slug,
    metaTitle: data.meta_title,
    metaDescription: data.meta_description,
    excerpt: data.excerpt,
    articleHtml: data.article_html,
    articleMarkdown: data.article_markdown,
    faq,
    promotedBooks,
    promotionReason: data.promotion_reason,
    selectedBooks,
    searchIntent,
    relevanceScores,
    tone: data.tone,
    wordCount: data.word_count,
    promotionIntensity: data.promotion_intensity,
    targetAudience: data.target_audience,
    primaryKey: data.primary_keyword,
    secondaryKeywords,
    internalLinks,
    readingGrade: data.reading_grade,
    generationTimeMs: data.generation_time_ms,
    status: data.status,
    createdAt: data.created_at,
    publishedAt: data.published_at,
  };
}
