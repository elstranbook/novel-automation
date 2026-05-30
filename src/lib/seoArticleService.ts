/**
 * SEO Article Service — Search Question → Promotional Article
 *
 * Core service handling:
 *   1. Novel metadata enrichment (themes, topics, emotions, audience, marketing_summary, embedding)
 *   2. Search intent extraction
 *   3. Book relevance matching (vector + metadata scoring)
 *   4. SEO article generation
 */

import { supabaseAdmin } from "./supabaseAdmin";
import { runChatCompletion } from "./openaiClient";
import { resolveModel, PipelineStep } from "./modelDefaults";
import { openaiClient } from "./openaiClient";

// ─── Types ───────────────────────────────────────────────────────────

export type SearchIntent = {
  intent: "informational" | "commercial" | "comparison" | "emotional" | "discovery";
  themes: string[];
  topics: string[];
  emotions: string[];
  audience: string[];
  genreFit: string[];
  searchSummary: string;
};

export type BookCandidate = {
  id: string;
  title: string;
  genre: string[];
  themes: string[];
  topics: string[];
  emotions: string[];
  audience: string[];
  synopsis: string;
  marketingSummary: string;
  popularityScore: number;
  similarity: number;
  relevanceScore: number;
};

export type GeneratedArticle = {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  excerpt: string;
  articleHtml: string;
  articleMarkdown: string;
  faq: Array<{ question: string; answer: string }>;
  promotedBooks: string[];
  promotionReason: string;
};

export type SeoArticleGenerationSettings = {
  tone?: "thoughtful" | "exciting" | "academic";
  wordCount?: number;
  promotionIntensity?: 0 | 25 | 50 | 75 | 100;
  targetAudience?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  internalLinks?: string[];
  readingGrade?: number;
  model?: string;
};

// ─── Defaults ────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: Required<Omit<SeoArticleGenerationSettings, "model">> = {
  tone: "thoughtful",
  wordCount: 1800,
  promotionIntensity: 50,
  targetAudience: "",
  primaryKeyword: "",
  secondaryKeywords: [],
  internalLinks: [],
  readingGrade: 0,
};

// ─── Phase 0: Novel Metadata Enrichment ──────────────────────────────

/**
 * Build combined search text from a novel's existing data.
 */
function buildSearchText(novel: Record<string, unknown>): string {
  const parts: string[] = [];

  const title = typeof novel.title === "string" ? novel.title : "";
  if (title) parts.push(`Title: ${title}`);

  const storyDetails = novel.story_details as Record<string, unknown> | undefined;
  if (storyDetails) {
    const genre = typeof storyDetails.genre === "string" ? storyDetails.genre : "";
    const theme = typeof storyDetails.story_theme === "string" ? storyDetails.story_theme : "";
    const setting = typeof storyDetails.setting === "string" ? storyDetails.setting : "";
    const mainChar = typeof storyDetails.main_character_name === "string" ? storyDetails.main_character_name : "";
    const conflict = typeof storyDetails.central_conflict === "string" ? storyDetails.central_conflict : "";
    const plot = typeof storyDetails.plot_summary === "string" ? storyDetails.plot_summary : "";
    const age = typeof storyDetails.target_age_range === "string" ? storyDetails.target_age_range : "";

    if (genre) parts.push(`Genre: ${genre}`);
    if (theme) parts.push(`Theme: ${theme}`);
    if (setting) parts.push(`Setting: ${setting}`);
    if (mainChar) parts.push(`Main Character: ${mainChar}`);
    if (conflict) parts.push(`Central Conflict: ${conflict}`);
    if (plot) parts.push(`Plot: ${plot}`);
    if (age) parts.push(`Target Age: ${age}`);
  }

  // Include themes, topics, emotions, audience if already enriched
  const themes = novel.themes as string[] | undefined;
  if (themes?.length) parts.push(`Themes: ${themes.join(", ")}`);

  const topics = novel.topics as string[] | undefined;
  if (topics?.length) parts.push(`Topics: ${topics.join(", ")}`);

  const emotions = novel.emotions as string[] | undefined;
  if (emotions?.length) parts.push(`Emotions: ${emotions.join(", ")}`);

  const audience = novel.audience as string[] | undefined;
  if (audience?.length) parts.push(`Audience: ${audience.join(", ")}`);

  const marketingSummary = typeof novel.marketing_summary === "string" ? novel.marketing_summary : "";
  if (marketingSummary) parts.push(`Marketing: ${marketingSummary}`);

  return parts.join("\n");
}

/**
 * Enrich a single novel's search metadata using AI.
 * Returns the enriched fields (themes, topics, emotions, audience, marketing_summary, search_text).
 */
export async function enrichNovelMetadata(
  novelId: string,
  userId: string,
  model?: string
): Promise<{
  themes: string[];
  topics: string[];
  emotions: string[];
  audience: string[];
  marketing_summary: string;
  search_text: string;
} | null> {
  // Fetch the novel and its related data
  const { data: novel } = await supabaseAdmin
    .from("novels")
    .select("id, title, story_details")
    .eq("id", novelId)
    .eq("user_id", userId)
    .single();

  if (!novel) return null;

  // Fetch synopsis
  const { data: synopsisRow } = await supabaseAdmin
    .from("novel_synopsis")
    .select("synopsis")
    .eq("novel_id", novelId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Fetch character profiles
  const { data: charsRow } = await supabaseAdmin
    .from("character_profiles")
    .select("profiles")
    .eq("novel_id", novelId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Fetch keywords
  const { data: keywordsRow } = await supabaseAdmin
    .from("novel_keywords")
    .select("keywords")
    .eq("novel_id", novelId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Fetch book descriptions
  const { data: descRows } = await supabaseAdmin
    .from("book_descriptions")
    .select("content, description_type")
    .eq("novel_id", novelId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(3);

  // Build context
  const title = novel.title || "Untitled";
  const storyDetails = (novel.story_details as Record<string, unknown>) || {};
  const synopsis = synopsisRow?.synopsis || "";
  const characters = charsRow?.profiles || "";
  const keywords = keywordsRow?.keywords
    ? Array.isArray(keywordsRow.keywords)
      ? (keywordsRow.keywords as string[]).join(", ")
      : String(keywordsRow.keywords)
    : "";
  const descriptions = descRows
    ? descRows.map((d: { content: string; description_type: string }) => `[${d.description_type}]: ${d.content}`).join("\n")
    : "";

  const prompt = `Analyze this novel and extract structured search/relevance metadata.

Title: ${title}
Genre: ${storyDetails.genre || "Unknown"}
Story Theme: ${storyDetails.story_theme || ""}
Main Character: ${storyDetails.main_character_name || ""}
Central Conflict: ${storyDetails.central_conflict || ""}
Setting: ${storyDetails.setting || ""}
Plot Summary: ${storyDetails.plot_summary || ""}
Target Age: ${storyDetails.target_age_range || ""}

Synopsis:
${synopsis ? synopsis.substring(0, 1500) : "Not available"}

Characters:
${characters ? String(characters).substring(0, 1000) : "Not available"}

Keywords: ${keywords || "None"}

Descriptions:
${descriptions ? descriptions.substring(0, 800) : "Not available"}

Return a JSON object with exactly these fields:
{
  "themes": ["theme1", "theme2", ...] — 3-8 core narrative themes (e.g. "identity", "belonging", "sacrifice"),
  "topics": ["topic1", "topic2", ...] — 3-8 subject topics the book covers (e.g. "teen psychology", "social media"),
  "emotions": ["emotion1", "emotion2", ...] — 3-6 primary emotions the book evokes (e.g. "hope", "grief"),
  "audience": ["audience1", ...] — 2-4 target audience segments (e.g. "young adult", "dystopian fans"),
  "marketing_summary": "A 2-3 sentence marketing pitch that captures the essence, appeal, and unique selling point of this book."
}

Be specific, not generic. Use lowercase. Return ONLY valid JSON.`;

  const resolvedModel = resolveModel(model, PipelineStep.NOVEL_ENRICHMENT);

  const result = await runChatCompletion({
    model: resolvedModel,
    system: "You are a literary metadata analyst. You extract precise, searchable metadata from novels. Return only valid JSON.",
    prompt,
    jsonResponse: true,
    maxTokens: 1500,
  });

  if (!result || typeof result !== "object" || ("error" in result && result.error)) {
    console.error("Enrichment failed for novel", novelId, result);
    return null;
  }

  const data = result as Record<string, unknown>;
  const themes = Array.isArray(data.themes) ? data.themes.map(String) : [];
  const topics = Array.isArray(data.topics) ? data.topics.map(String) : [];
  const emotions = Array.isArray(data.emotions) ? data.emotions.map(String) : [];
  const audience = Array.isArray(data.audience) ? data.audience.map(String) : [];
  const marketing_summary = typeof data.marketing_summary === "string" ? data.marketing_summary : "";

  // Build combined search text
  const searchText = buildSearchText({
    ...novel,
    themes,
    topics,
    emotions,
    audience,
    marketing_summary,
  });

  // Update the novel in Supabase
  await supabaseAdmin
    .from("novels")
    .update({
      themes,
      topics,
      emotions,
      audience,
      marketing_summary,
      search_text: searchText,
      metadata_enriched_at: new Date().toISOString(),
    })
    .eq("id", novelId)
    .eq("user_id", userId);

  return { themes, topics, emotions, audience, marketing_summary, search_text: searchText };
}

/**
 * Generate an embedding for a text string using OpenAI's embedding API.
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!text || text.trim().length === 0) return null;

  try {
    const response = await openaiClient.embeddings.create({
      model: "text-embedding-3-small",
      input: text.substring(0, 8000), // Token limit safety
    });

    return response.data[0]?.embedding ?? null;
  } catch (error) {
    console.error("Embedding generation failed:", error);
    return null;
  }
}

/**
 * Generate and store embedding for a novel.
 */
export async function generateNovelEmbedding(novelId: string, userId: string): Promise<boolean> {
  // Get the search_text
  const { data: novel } = await supabaseAdmin
    .from("novels")
    .select("search_text")
    .eq("id", novelId)
    .eq("user_id", userId)
    .single();

  if (!novel?.search_text) return false;

  const embedding = await generateEmbedding(novel.search_text);
  if (!embedding) return false;

  // Store the embedding using Supabase admin (bypasses RLS)
  const { error } = await supabaseAdmin.rpc("update_novel_embedding", {
    p_novel_id: novelId,
    p_user_id: userId,
    p_embedding: embedding,
  });

  // If the RPC doesn't exist yet, fall back to raw SQL approach
  if (error) {
    console.log("RPC update_novel_embedding not available, using direct update");
    // We need to use a direct SQL approach since Supabase JS doesn't support vector directly
    // The embedding will be stored when the migration is run
    return false;
  }

  return true;
}

/**
 * Batch enrichment: enrich all novels for a user that haven't been enriched yet.
 */
export async function batchEnrichNovels(
  userId: string,
  model?: string
): Promise<{ enriched: number; failed: number }> {
  const { data: novels } = await supabaseAdmin
    .from("novels")
    .select("id")
    .eq("user_id", userId)
    .is("metadata_enriched_at", null);

  if (!novels || novels.length === 0) return { enriched: 0, failed: 0 };

  let enriched = 0;
  let failed = 0;

  for (const novel of novels) {
    try {
      const result = await enrichNovelMetadata(novel.id, userId, model);
      if (result) {
        // Generate and store embedding
        await generateAndStoreEmbedding(novel.id, userId, result.search_text);
        enriched += 1;
      } else {
        failed += 1;
      }
    } catch {
      failed += 1;
    }
  }

  return { enriched, failed };
}

/**
 * Generate embedding and store it via the update_novel_embedding RPC (preferred)
 * or fall back to a direct update if the RPC is unavailable.
 */
export async function generateAndStoreEmbedding(novelId: string, userId: string, searchText: string): Promise<boolean> {
  const embedding = await generateEmbedding(searchText);
  if (!embedding) return false;

  // Primary: use the RPC function which correctly handles the vector type
  try {
    const { error } = await supabaseAdmin.rpc("update_novel_embedding", {
      p_novel_id: novelId,
      p_user_id: userId,
      p_embedding: embedding,
    });

    if (!error) return true;

    // RPC failed — log and fall back to direct update
    console.warn("[generateAndStoreEmbedding] RPC update_novel_embedding failed, falling back to direct update:", error.message);
  } catch (rpcErr) {
    console.warn("[generateAndStoreEmbedding] RPC update_novel_embedding threw, falling back to direct update:", rpcErr instanceof Error ? rpcErr.message : rpcErr);
  }

  // Fallback: direct Supabase update (may not correctly serialize vector type for PostgREST)
  try {
    const { error } = await supabaseAdmin
      .from("novels")
      .update({ embedding: embedding as any } as any)
      .eq("id", novelId)
      .eq("user_id", userId);

    if (error) {
      console.error("[generateAndStoreEmbedding] Direct update also failed:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[generateAndStoreEmbedding] Direct update threw:", err);
    return false;
  }
}

// ─── Phase 1: Search Intent Extraction ───────────────────────────────

export async function analyzeSearchIntent(
  question: string,
  model?: string
): Promise<SearchIntent> {
  const resolvedModel = resolveModel(model, PipelineStep.SEO_INTENT);

  const result = await runChatCompletion({
    model: resolvedModel,
    system: `You are a search intent analyst. You analyze search questions and extract structured intent data.
Return ONLY valid JSON with the exact schema specified. Be specific and precise.`,
    prompt: `Analyze this search question and extract its intent:

"${question}"

Return a JSON object with exactly these fields:
{
  "intent": "informational" | "commercial" | "comparison" | "emotional" | "discovery",
  "themes": ["theme1", "theme2", ...] — 2-6 abstract themes this question touches (e.g. "identity", "belonging"),
  "topics": ["topic1", "topic2", ...] — 2-5 concrete topics (e.g. "teen psychology", "social media effects"),
  "emotions": ["emotion1", ...] — 1-4 emotions the searcher likely feels (e.g. "loneliness", "curiosity"),
  "audience": ["audience1", ...] — 1-3 audience segments (e.g. "young adult", "parents of teens"),
  "genreFit": ["genre1", ...] — 1-4 book genres that might answer this question (e.g. "YA", "dystopian"),
  "searchSummary": "One-sentence summary of what this person is searching for and why."
}`,
    jsonResponse: true,
    maxTokens: 1000,
  });

  if (!result || typeof result !== "object" || ("error" in result && result.error)) {
    // Return a fallback intent
    return {
      intent: "informational",
      themes: [],
      topics: [],
      emotions: [],
      audience: [],
      genreFit: [],
      searchSummary: question,
    };
  }

  const data = result as Record<string, unknown>;
  return {
    intent: (["informational", "commercial", "comparison", "emotional", "discovery"].includes(
      String(data.intent)
    ) ? String(data.intent) : "informational") as SearchIntent["intent"],
    themes: Array.isArray(data.themes) ? data.themes.map(String) : [],
    topics: Array.isArray(data.topics) ? data.topics.map(String) : [],
    emotions: Array.isArray(data.emotions) ? data.emotions.map(String) : [],
    audience: Array.isArray(data.audience) ? data.audience.map(String) : [],
    genreFit: Array.isArray(data.genreFit) ? data.genreFit.map(String) : [],
    searchSummary: typeof data.searchSummary === "string" ? data.searchSummary : question,
  };
}

// ─── Phase 2: Book Relevance Engine ──────────────────────────────────

/**
 * Find relevant books using vector search (primary) and metadata filtering (fallback).
 */
export async function findRelevantBooks(
  question: string,
  intent: SearchIntent,
  userId: string,
  maxResults: number = 10
): Promise<BookCandidate[]> {
  // Generate embedding for the question
  const questionEmbedding = await generateEmbedding(question);

  let candidates: Array<{
    id: string;
    title: string;
    themes: string[] | null;
    topics: string[] | null;
    emotions: string[] | null;
    audience: string[] | null;
    marketing_summary: string | null;
    popularity_score: number | null;
    similarity: number;
  }> = [];

  // Method A: Vector search
  if (questionEmbedding) {
    try {
      const { data: vectorResults, error } = await supabaseAdmin.rpc("match_novels", {
        query_embedding: questionEmbedding,
        match_user_id: userId,
        match_threshold: 0.3,
        match_count: maxResults,
      });

      if (!error && vectorResults && vectorResults.length > 0) {
        candidates = vectorResults;
      }
    } catch (err) {
      console.error("Vector search failed, falling back to metadata:", err);
    }
  }

  // Method B: Metadata filtering fallback
  if (candidates.length === 0) {
    const { data: novels } = await supabaseAdmin
      .from("novels")
      .select("id, title, themes, topics, emotions, audience, marketing_summary, popularity_score, story_details")
      .eq("user_id", userId)
      .not("metadata_enriched_at", "is", null);

    if (novels && novels.length > 0) {
      candidates = novels.map((n: any) => ({
        ...n,
        similarity: 0, // No vector similarity available
      }));
    }
  }

  // If still no candidates, try all novels (even un-enriched ones)
  if (candidates.length === 0) {
    const { data: novels } = await supabaseAdmin
      .from("novels")
      .select("id, title, themes, topics, emotions, audience, marketing_summary, popularity_score, story_details")
      .eq("user_id", userId);

    if (novels && novels.length > 0) {
      candidates = novels.map((n: any) => ({
        ...n,
        themes: n.themes || [],
        topics: n.topics || [],
        emotions: n.emotions || [],
        audience: n.audience || [],
        marketing_summary: n.marketing_summary || null,
        popularity_score: n.popularity_score || 50,
        similarity: 0,
      }));
    }
  }

  if (candidates.length === 0) return [];

  // Also fetch synopsis for each candidate
  const candidateIds = candidates.map((c) => c.id);
  const { data: synopsisRows } = await supabaseAdmin
    .from("novel_synopsis")
    .select("novel_id, synopsis")
    .in("novel_id", candidateIds)
    .eq("user_id", userId);

  const synopsisMap = new Map<string, string>();
  if (synopsisRows) {
    for (const row of synopsisRows) {
      if (!synopsisMap.has(row.novel_id)) {
        synopsisMap.set(row.novel_id, row.synopsis);
      }
    }
  }

  // Score each candidate
  const scored: BookCandidate[] = candidates.map((c) => {
    const cThemes = c.themes || [];
    const cTopics = c.topics || [];
    const cEmotions = c.emotions || [];
    const cAudience = c.audience || [];
    const popularity = c.popularity_score ?? 50;

    // Calculate similarity scores
    const themeSim = computeSetSimilarity(intent.themes, cThemes);
    const topicSim = computeSetSimilarity(intent.topics, cTopics);
    const audienceFit = computeSetSimilarity(intent.audience, cAudience);
    const genreFit = computeSetSimilarity(intent.genreFit, [...cThemes, ...cAudience]);

    // Weighted final score (normalize to 0-100)
    const rawScore =
      themeSim * 0.40 +
      topicSim * 0.30 +
      audienceFit * 0.15 +
      genreFit * 0.10 +
      (popularity / 100) * 0.05 +
      c.similarity * 0.30; // Vector similarity gets significant weight

    const relevanceScore = Math.min(100, Math.round(rawScore * 100));

    // Get genre from story_details if themes not available
    const storyDetails = (c as any).story_details as Record<string, unknown> | undefined;
    const genreStr = typeof storyDetails?.genre === "string" ? storyDetails.genre : "";
    const genre = genreStr ? [genreStr] : [];

    return {
      id: c.id,
      title: c.title || "Untitled",
      genre,
      themes: cThemes,
      topics: cTopics,
      emotions: cEmotions,
      audience: cAudience,
      synopsis: synopsisMap.get(c.id) || "",
      marketingSummary: c.marketing_summary || "",
      popularityScore: popularity,
      similarity: c.similarity,
      relevanceScore,
    };
  });

  // Sort by relevance score descending
  scored.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return scored.slice(0, maxResults);
}

/**
 * Compute Jaccard-like similarity between two string arrays.
 * Uses partial matching (substring) for flexibility.
 */
function computeSetSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;

  const aLower = a.map((s) => s.toLowerCase());
  const bLower = b.map((s) => s.toLowerCase());

  let matches = 0;
  for (const item of aLower) {
    for (const candidate of bLower) {
      if (item === candidate || item.includes(candidate) || candidate.includes(item)) {
        matches += 1;
        break;
      }
    }
  }

  return matches / Math.max(a.length, b.length);
}

/**
 * Apply selection rules based on relevance scores.
 */
export function selectBooks(candidates: BookCandidate[]): {
  selected: BookCandidate[];
  reason: string;
} {
  if (candidates.length === 0) {
    return { selected: [], reason: "No books in catalog match this search question." };
  }

  const top = candidates[0];

  // Top score > 85 → Promote 1 book
  if (top.relevanceScore > 85) {
    return {
      selected: [top],
      reason: `Strong thematic match (${top.relevanceScore}%): "${top.title}" directly addresses this question's themes.`,
    };
  }

  // Top 2 within 10 points → Mention both
  if (candidates.length >= 2) {
    const second = candidates[1];
    if (top.relevanceScore - second.relevanceScore <= 10 && top.relevanceScore > 60) {
      return {
        selected: [top, second],
        reason: `Two strong matches: "${top.title}" (${top.relevanceScore}%) and "${second.title}" (${second.relevanceScore}%) both relate to this question.`,
      };
    }
  }

  // No score > 60 → No promotion
  if (top.relevanceScore <= 60) {
    return {
      selected: [],
      reason: "No strong book recommendation available. Article will be informational only.",
    };
  }

  // Default: promote the top match
  return {
    selected: [top],
    reason: `Moderate match (${top.relevanceScore}%): "${top.title}" has relevant themes for this question.`,
  };
}

// ─── Phase 3: Article Generation ────────────────────────────────────

export async function generateSeoArticle(
  question: string,
  intent: SearchIntent,
  selectedBooks: BookCandidate[],
  settings: SeoArticleGenerationSettings = {}
): Promise<GeneratedArticle> {
  const s = { ...DEFAULT_SETTINGS, ...settings };
  const resolvedModel = resolveModel(settings.model, PipelineStep.SEO_ARTICLE);

  // Build book context for the prompt
  const bookContext = selectedBooks.length > 0
    ? selectedBooks
        .map((book, i) => {
          return `Book ${i + 1}: "${book.title}"
Genre: ${book.genre.join(", ") || "YA Fiction"}
Themes: ${book.themes.join(", ") || "N/A"}
Topics: ${book.topics.join(", ") || "N/A"}
Emotions: ${book.emotions.join(", ") || "N/A"}
Audience: ${book.audience.join(", ") || "Young Adult"}
Marketing Summary: ${book.marketingSummary || "N/A"}
Synopsis: ${book.synopsis ? book.synopsis.substring(0, 500) + "..." : "N/A"}`;
        })
        .join("\n\n")
    : "No specific book recommendation for this question.";

  // Promotion intensity instructions
  const promotionInstructions: Record<number, string> = {
    0: "Do NOT mention or reference any book. Write a purely informational article.",
    25: `Briefly mention "${selectedBooks[0]?.title || "the book"}" once in a natural context. One sentence maximum. No dedicated section.`,
    50: `Naturally integrate "${selectedBooks[0]?.title || "the book"}" into the article where contextually relevant. Mention it 2-3 times with specific thematic connections. Include a brief thematic connection paragraph.`,
    75: `Include a dedicated section exploring how "${selectedBooks[0]?.title || "the book"}" addresses this question's themes. Use specific plot elements, character arcs, and worldbuilding details. Multiple contextual mentions throughout.`,
    100: `Write a strong recommendation for "${selectedBooks[0]?.title || "the book"}" with a clear CTA. Include a dedicated section, specific examples, and end with an explicit recommendation to read it. Use phrases like "I highly recommend" and "discover why readers love."`,
  };

  const promotionRule = promotionInstructions[s.promotionIntensity] || promotionInstructions[50];

  // Hard rule against excessive mentions
  const maxMentions = s.promotionIntensity <= 25 ? 1 : s.promotionIntensity <= 50 ? 3 : s.promotionIntensity <= 75 ? 5 : 7;

  const prompt = `You are generating an SEO article that answers a search question while naturally introducing a relevant book.

SEARCH QUESTION:
${question}

SEARCH INTENT:
Type: ${intent.intent}
Themes: ${intent.themes.join(", ") || "General"}
Topics: ${intent.topics.join(", ") || "General"}
Emotions: ${intent.emotions.join(", ") || "Neutral"}
Target Audience: ${intent.audience.join(", ") || "General readers"}

SELECTED BOOKS:
${bookContext}

GENERATION RULES:
Weighting: Answer question (60%) → Expand insights (20%) → Book integration (15%) → CTA (5%)

1. Answer the search question directly and thoroughly FIRST
2. Provide genuinely useful, well-researched information
3. Introduce the selected book only when contextually relevant
4. Use themes, conflicts, emotions, and worldbuilding from the book for natural integration
5. Maintain editorial quality — this is NOT an advertisement
6. Do NOT mention the same book more than ${maxMentions} times total
7. Avoid keyword stuffing and repetitive mentions
8. Write in a ${s.tone} tone

PROMOTION INTENSITY (level ${s.promotionIntensity}/100):
${promotionRule}

${s.primaryKeyword ? `PRIMARY KEYWORD: ${s.primaryKeyword}\nUse this keyword naturally in the title, first paragraph, and 2-3 more times.` : ""}
${s.secondaryKeywords?.length ? `SECONDARY KEYWORDS: ${s.secondaryKeywords.join(", ")}\nSprinkle naturally throughout.` : ""}
${s.targetAudience ? `TARGET AUDIENCE: ${s.targetAudience}` : ""}
${s.readingGrade ? `READING GRADE LEVEL: ${s.readingGrade} (use appropriate vocabulary)` : ""}

ARTICLE LENGTH: Approximately ${s.wordCount} words

${s.internalLinks?.length ? `Include these internal links naturally: ${s.internalLinks.join(", ")}` : ""}

Return a JSON object with exactly these fields:
{
  "metaTitle": "SEO-optimized title tag (50-60 characters)",
  "metaDescription": "SEO meta description (150-160 characters)",
  "slug": "url-friendly-slug",
  "excerpt": "2-3 sentence article excerpt/summary",
  "articleHtml": "Full article as structured HTML using <article>, <h2>, <h3>, <p>, <blockquote>, <strong>, <em>, <ul>, <li> tags. No <html>/<head>/<body> wrappers.",
  "articleMarkdown": "The same article content in Markdown format for editing",
  "faq": [
    {"question": "Related FAQ question 1", "answer": "Concise answer 1"},
    {"question": "Related FAQ question 2", "answer": "Concise answer 2"},
    {"question": "Related FAQ question 3", "answer": "Concise answer 3"}
  ],
  "promotedBooks": [${selectedBooks.map((b) => `"${b.title}"`).join(", ")}],
  "promotionReason": "Brief explanation of why these books were selected for this question"
}`;

  const result = await runChatCompletion({
    model: resolvedModel,
    system: `You are an expert SEO content writer who specializes in YA literature. You create articles that genuinely answer questions while naturally integrating book recommendations. Your articles are publication-ready, editorially excellent, and optimized for search without keyword stuffing. Write in a ${s.tone} tone.`,
    prompt,
    jsonResponse: true,
    maxTokens: 5000,
  });

  if (!result || typeof result !== "object" || ("error" in result && result.error)) {
    throw new Error("Article generation failed: " + (typeof result === "object" && result !== null && "error" in result ? (result as any).error : "Unknown error"));
  }

  const data = result as Record<string, unknown>;

  return {
    metaTitle: typeof data.metaTitle === "string" ? data.metaTitle : "",
    metaDescription: typeof data.metaDescription === "string" ? data.metaDescription : "",
    slug: typeof data.slug === "string" ? data.slug : generateSlug(question),
    excerpt: typeof data.excerpt === "string" ? data.excerpt : "",
    articleHtml: typeof data.articleHtml === "string" ? data.articleHtml : "",
    articleMarkdown: typeof data.articleMarkdown === "string" ? data.articleMarkdown : "",
    faq: Array.isArray(data.faq)
      ? data.faq.map((f: any) => ({
          question: typeof f?.question === "string" ? f.question : "",
          answer: typeof f?.answer === "string" ? f.answer : "",
        }))
      : [],
    promotedBooks: Array.isArray(data.promotedBooks)
      ? data.promotedBooks.map(String)
      : selectedBooks.map((b) => b.title),
    promotionReason:
      typeof data.promotionReason === "string"
        ? data.promotionReason
        : "",
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
}

/**
 * Full pipeline: question → intent → match → generate → store
 */
export async function runFullPipeline(
  question: string,
  userId: string,
  settings: SeoArticleGenerationSettings = {},
  overrideBookIds?: string[]
): Promise<{
  intent: SearchIntent;
  candidates: BookCandidate[];
  selected: BookCandidate[];
  article: GeneratedArticle;
  articleId: string;
  generationTimeMs: number;
}> {
  const startTime = Date.now();

  // Phase 1: Analyze search intent (with graceful fallback)
  let intent: SearchIntent;
  try {
    intent = await analyzeSearchIntent(question, settings.model);
  } catch (err) {
    console.warn("[SEO Pipeline] analyzeSearchIntent failed, using fallback intent:", err instanceof Error ? err.message : err);
    intent = {
      intent: "informational",
      themes: [],
      topics: [],
      emotions: [],
      audience: [],
      genreFit: [],
      searchSummary: question,
    };
  }

  // Phase 2: Find relevant books
  let candidates = await findRelevantBooks(question, intent, userId);

  let selected: BookCandidate[];
  let selectionReason: string;

  if (overrideBookIds && overrideBookIds.length > 0) {
    // User manually overrode book selection
    selected = candidates.filter((c) => overrideBookIds.includes(c.id));
    // If some IDs weren't in candidates, fetch them directly
    const foundIds = selected.map((s) => s.id);
    const missingIds = overrideBookIds.filter((id) => !foundIds.includes(id));

    if (missingIds.length > 0) {
      const { data: novels } = await supabaseAdmin
        .from("novels")
        .select("id, title, themes, topics, emotions, audience, marketing_summary, popularity_score, story_details")
        .in("id", missingIds)
        .eq("user_id", userId);

      if (novels) {
        for (const novel of novels) {
          const storyDetails = (novel as any).story_details as Record<string, unknown> | undefined;
          const genreStr = typeof storyDetails?.genre === "string" ? storyDetails.genre : "";

          selected.push({
            id: novel.id,
            title: novel.title,
            genre: genreStr ? [genreStr] : [],
            themes: novel.themes || [],
            topics: novel.topics || [],
            emotions: novel.emotions || [],
            audience: novel.audience || [],
            synopsis: "",
            marketingSummary: novel.marketing_summary || "",
            popularityScore: novel.popularity_score || 50,
            similarity: 0,
            relevanceScore: 0,
          });
        }
      }
    }

    selectionReason = "Manually selected by user.";
  } else {
    const selection = selectBooks(candidates);
    selected = selection.selected;
    selectionReason = selection.reason;
  }

  // Phase 3: Generate article (with better error handling)
  let article: GeneratedArticle;
  try {
    article = await generateSeoArticle(question, intent, selected, settings);
  } catch (err) {
    throw new Error(
      "SEO article generation failed during the writing phase. " +
      (err instanceof Error ? err.message : String(err))
    );
  }

  const generationTimeMs = Date.now() - startTime;

  // Store in seo_articles table
  const { data: savedArticle, error } = await supabaseAdmin
    .from("seo_articles")
    .insert({
      user_id: userId,
      question,
      selected_books: selected.map((b) => b.id),
      relevance_scores: candidates.slice(0, 5).map((c) => ({
        bookId: c.id,
        title: c.title,
        score: c.relevanceScore,
        similarity: c.similarity,
      })),
      search_intent: intent,
      title: article.metaTitle,
      slug: article.slug,
      meta_title: article.metaTitle,
      meta_description: article.metaDescription,
      excerpt: article.excerpt,
      article_html: article.articleHtml,
      article_markdown: article.articleMarkdown,
      faq: article.faq,
      promoted_books: article.promotedBooks.map((title, i) => ({
        title,
        id: selected[i]?.id || null,
      })),
      promotion_reason: selectionReason || article.promotionReason,
      tone: settings.tone || "thoughtful",
      word_count: settings.wordCount || 1800,
      promotion_intensity: settings.promotionIntensity ?? 50,
      target_audience: settings.targetAudience || null,
      primary_keyword: settings.primaryKeyword || null,
      secondary_keywords: settings.secondaryKeywords || [],
      internal_links: settings.internalLinks || [],
      reading_grade: settings.readingGrade || null,
      generation_settings: settings,
      generation_time_ms: generationTimeMs,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to save SEO article:", error);
  }

  return {
    intent,
    candidates,
    selected,
    article,
    articleId: savedArticle?.id || "",
    generationTimeMs,
  };
}
