import { supabaseAdmin } from "@/lib/supabaseAdmin";

type NovelRow = {
  id: string;
  title: string;
  model: string;
  story_details: Record<string, unknown> | null;
  series_id: string | null;
  book_number: number | null;
  created_at: string;
};

type TextRow = { content: string; created_at: string };
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

/** A scene row from the scenes table */
type SceneRow = {
  chapter_title: string;
  scene_content: string;
  scene_order: number;
  chapter_order: number;
};

/** A cover row from cover_design_prompts */
type CoverRow = {
  id: string;
  prompt: string | null;
  url: string | null;
  model: string | null;
  is_active: boolean;
  created_at: string;
};

export type ShowroomPayload = {
  source: "elstran-studio";
  generatedAt: string;
  novel: {
    id: string;
    title: string;
    model: string;
    createdAt: string;
    seriesId: string | null;
    bookNumber: number | null;
  };
  publish: {
    storyDetails: Record<string, unknown> | null;
    premisesAndEndings: {
      premises: string[];
      chosenPremise: string | null;
      potentialEndings: string[];
      chosenEnding: string | null;
    } | null;
    synopsis: string | null;
    characterProfiles: string | null;
    bookDescriptions: Array<{
      type: string;
      length: string;
      content: string;
    }>;
    keywords: string[];
    bisac: string[];
    novelPlan: string | null;
    chapterOutlines: Array<Record<string, unknown>> | null;
    chapterGuide: Record<string, Record<string, unknown>> | null;
    chapterBeats: Record<string, Array<Record<string, unknown>>> | null;
    proseScenes: Record<string, string[]> | null;
    coverUrl: string | null;
    coverPrompt: string | null;
    allCovers: Array<{
      id: string;
      url: string | null;
      prompt: string | null;
      model: string | null;
      isActive: boolean;
      createdAt: string;
    }>;
    facebookImageUrl: string | null;
    instagramImageUrl: string | null;
    quotes: string[];
    dedication: string | null;
    formats: Record<string, string>;
    promotionalArticles: Array<{
      articleType: string;
      lengthType: string;
      tone: string | null;
      ctaType: string | null;
      title: string | null;
      content: string | null;
    }>;
    socialSnippets: string | null;
  };
};

/** Lightweight payload for the novels list endpoint */
export type ShowroomNovelListItem = {
  id: string;
  title: string;
  model: string;
  createdAt: string;
  seriesId: string | null;
  bookNumber: number | null;
  synopsis: string | null;
  coverUrl: string | null;
};

const parseStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
};

/**
 * Parse a JSON string/array value into a string array.
 * Handles cases where the value is stored as a JSON string.
 */
const parseJsonStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string");
      }
    } catch {
      // not JSON, return empty
    }
  }
  return [];
};

/**
 * Build a complete showroom payload for a single novel.
 * This includes ALL data from the publish page — novel metadata,
 * story details, premises & endings, synopsis, character profiles,
 * book descriptions, keywords, BISAC, novel plan, chapter outlines,
 * chapter guide, chapter beats, prose scenes, cover images,
 * quotes, dedication, formats, promotional articles, and social snippets.
 */
export async function buildShowroomPayload(
  novelId: string
): Promise<ShowroomPayload | null> {
  const { data: novel, error: novelError } = await supabaseAdmin
    .from("novels")
    .select("id,title,model,story_details,series_id,book_number,created_at")
    .eq("id", novelId)
    .single<NovelRow>();

  if (novelError || !novel) return null;

  // Fetch all data in parallel for maximum performance
  const [
    synopsisResult,
    premisesResult,
    profilesResult,
    descriptionsResult,
    keywordsResult,
    bisacResult,
    planResult,
    outlineResult,
    guideResult,
    beatsResult,
    scenesResult,
    quotesResult,
    socialResult,
    formatsResult,
    coversResult,
    dedicationResult,
    articlesResult,
  ] = await Promise.all([
    // Synopsis
    supabaseAdmin
      .from("novel_synopsis")
      .select("synopsis,created_at")
      .eq("novel_id", novelId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<{ synopsis: string; created_at: string }>(),

    // Premises & Endings
    supabaseAdmin
      .from("premises_and_endings")
      .select("premises,chosen_premise,potential_endings,chosen_ending,created_at")
      .eq("novel_id", novelId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),

    // Character Profiles
    supabaseAdmin
      .from("character_profiles")
      .select("profiles,created_at")
      .eq("novel_id", novelId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<{ profiles: string; created_at: string }>(),

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

    // Novel Plan
    supabaseAdmin
      .from("novel_plans")
      .select("plan,created_at")
      .eq("novel_id", novelId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<{ plan: string; created_at: string }>(),

    // Chapter Outlines
    supabaseAdmin
      .from("chapter_outlines")
      .select("outline,created_at")
      .eq("novel_id", novelId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<{ outline: unknown; created_at: string }>(),

    // Chapter Guides
    supabaseAdmin
      .from("chapter_guides")
      .select("guide,created_at")
      .eq("novel_id", novelId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<{ guide: unknown; created_at: string }>(),

    // Chapter Beats
    supabaseAdmin
      .from("chapter_beats")
      .select("beats,created_at")
      .eq("novel_id", novelId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<{ beats: unknown; created_at: string }>(),

    // Scenes (prose)
    supabaseAdmin
      .from("scenes")
      .select("chapter_title,scene_content,scene_order,chapter_order")
      .eq("novel_id", novelId)
      .order("chapter_order", { ascending: true })
      .order("scene_order", { ascending: true })
      .returns<SceneRow[]>(),

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
      .maybeSingle<TextRow>(),

    // Formats
    supabaseAdmin
      .from("novel_formats")
      .select("format_name,content,created_at")
      .eq("novel_id", novelId)
      .returns<FormatRow[]>(),

    // Cover Design Prompts (all covers)
    supabaseAdmin
      .from("cover_design_prompts")
      .select("id,prompt,url,model,is_active,created_at")
      .eq("novel_id", novelId)
      .order("is_active", { ascending: false })
      .order("created_at", { ascending: false })
      .returns<CoverRow[]>(),

    // Dedication
    supabaseAdmin
      .from("novel_dedications")
      .select("dedication,created_at")
      .eq("novel_id", novelId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<{ dedication: string; created_at: string }>(),

    // Promotional Articles
    supabaseAdmin
      .from("promotional_articles")
      .select("article_type,length_type,tone,cta_type,title,content,created_at")
      .eq("novel_id", novelId)
      .order("created_at", { ascending: false })
      .returns<PromotionalArticleRow[]>(),
  ]);

  // Build formats map
  const formats: Record<string, string> = {};
  for (const row of formatsResult.data ?? []) {
    if (typeof row.format_name === "string" && typeof row.content === "string") {
      formats[row.format_name] = row.content;
    }
  }

  // Build prose scenes map (grouped by chapter)
  const proseScenes: Record<string, string[]> = {};
  for (const scene of scenesResult.data ?? []) {
    const chapterKey = scene.chapter_title;
    if (!proseScenes[chapterKey]) {
      proseScenes[chapterKey] = [];
    }
    proseScenes[chapterKey].push(
      typeof scene.scene_content === "string"
        ? scene.scene_content
        : JSON.stringify(scene.scene_content)
    );
  }
  const hasProseScenes = Object.keys(proseScenes).length > 0;

  // Determine the active/latest cover URL
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

  // Get cover prompt (prefer AI-generated, not social media or custom upload)
  const aiPromptRow = coverCovers.find(
    (c) => c.prompt && c.model !== "custom-upload"
  );
  const coverPrompt = aiPromptRow?.prompt ?? coverCovers.find((c) => c.prompt)?.prompt ?? null;

  // Parse premises & endings
  let premisesAndEndings: ShowroomPayload["publish"]["premisesAndEndings"] = null;
  if (premisesResult.data) {
    const pData = premisesResult.data;
    premisesAndEndings = {
      premises: parseJsonStringArray(pData.premises),
      chosenPremise: typeof pData.chosen_premise === "string" ? pData.chosen_premise : null,
      potentialEndings: parseJsonStringArray(pData.potential_endings),
      chosenEnding: typeof pData.chosen_ending === "string" ? pData.chosen_ending : null,
    };
  }

  // Parse chapter outlines
  let chapterOutlines: Array<Record<string, unknown>> | null = null;
  if (outlineResult.data?.outline) {
    const outline = outlineResult.data.outline;
    if (Array.isArray(outline)) {
      chapterOutlines = outline.map((item: unknown) =>
        typeof item === "object" && item !== null
          ? (item as Record<string, unknown>)
          : { value: item }
      );
    } else if (typeof outline === "object") {
      // If it's an object with numbered keys, convert to array
      chapterOutlines = Object.values(outline as Record<string, unknown>).map(
        (item: unknown) =>
          typeof item === "object" && item !== null
            ? (item as Record<string, unknown>)
            : { value: item }
      );
    }
  }

  // Parse chapter guide
  let chapterGuide: Record<string, Record<string, unknown>> | null = null;
  if (guideResult.data?.guide) {
    const guide = guideResult.data.guide;
    if (typeof guide === "object" && guide !== null) {
      chapterGuide = guide as Record<string, Record<string, unknown>>;
    }
  }

  // Parse chapter beats
  let chapterBeats: Record<string, Array<Record<string, unknown>>> | null = null;
  if (beatsResult.data?.beats) {
    const beats = beatsResult.data.beats;
    if (typeof beats === "object" && beats !== null) {
      // Convert each value to an array of records
      const rawBeats = beats as Record<string, unknown>;
      chapterBeats = {};
      for (const [key, value] of Object.entries(rawBeats)) {
        if (Array.isArray(value)) {
          chapterBeats[key] = value.map((item: unknown) =>
            typeof item === "object" && item !== null
              ? (item as Record<string, unknown>)
              : { value: item }
          );
        } else {
          chapterBeats[key] = [{ value }];
        }
      }
    }
  }

  // Build promotional articles
  const promotionalArticles: ShowroomPayload["publish"]["promotionalArticles"] = (
    articlesResult.data ?? []
  ).map((row) => ({
    articleType: row.article_type,
    lengthType: row.length_type,
    tone: row.tone,
    ctaType: row.cta_type,
    title: row.title,
    content: row.content,
  }));

  // Build all covers list
  const allCovers: ShowroomPayload["publish"]["allCovers"] = coverCovers.map((c) => ({
    id: c.id,
    url: c.url,
    prompt: c.prompt,
    model: c.model,
    isActive: c.is_active,
    createdAt: c.created_at,
  }));

  return {
    source: "elstran-studio",
    generatedAt: new Date().toISOString(),
    novel: {
      id: novel.id,
      title: novel.title,
      model: novel.model,
      createdAt: novel.created_at,
      seriesId: novel.series_id,
      bookNumber: novel.book_number ?? null,
    },
    publish: {
      storyDetails: novel.story_details,
      premisesAndEndings,
      synopsis: synopsisResult.data?.synopsis ?? null,
      characterProfiles: profilesResult.data?.profiles ?? null,
      bookDescriptions: (descriptionsResult.data ?? []).map((row) => ({
        type: row.description_type,
        length: row.length_type,
        content: row.content,
      })),
      keywords: parseStringArray(keywordsResult.data?.keywords),
      bisac: parseStringArray(bisacResult.data?.categories),
      novelPlan: planResult.data?.plan ?? null,
      chapterOutlines,
      chapterGuide,
      chapterBeats,
      proseScenes: hasProseScenes ? proseScenes : null,
      coverUrl: activeCover?.url ?? null,
      coverPrompt,
      allCovers,
      facebookImageUrl: fbCover?.url ?? null,
      instagramImageUrl: igCover?.url ?? null,
      quotes: parseStringArray(quotesResult.data?.quotes),
      dedication: dedicationResult.data?.dedication ?? null,
      formats,
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
    .select("id,title,model,series_id,book_number,created_at")
    .order("created_at", { ascending: false })
    .returns<NovelRow[]>();

  if (error || !novels) return [];

  // For each novel, also fetch synopsis and cover URL in parallel
  const items = await Promise.all(
    novels.map(async (novel) => {
      const [synopsisRes, coverRes] = await Promise.all([
        supabaseAdmin
          .from("novel_synopsis")
          .select("synopsis")
          .eq("novel_id", novel.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle<{ synopsis: string }>(),
        supabaseAdmin
          .from("cover_design_prompts")
          .select("url,is_active,model")
          .eq("novel_id", novel.id)
          .eq("is_active", true)
          .limit(1)
          .maybeSingle<{ url: string | null; is_active: boolean; model: string }>(),
      ]);

      // Fallback: if no active cover, get the most recent cover that isn't social media
      let coverUrl = coverRes.data?.url ?? null;
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
        model: novel.model,
        createdAt: novel.created_at,
        seriesId: novel.series_id,
        bookNumber: novel.book_number ?? null,
        synopsis: synopsisRes.data?.synopsis ?? null,
        coverUrl,
      };
    })
  );

  return items;
}
