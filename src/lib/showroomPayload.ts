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
    synopsis: string | null;
    descriptions: string[];
    coverUrl: string | null;
    keywords: string[];
    bisac: string[];
    quotes: string[];
    socialSnippets: string | null;
    formats: Record<string, string>;
    storyDetails: Record<string, unknown> | null;
  };
};

const parseStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
};

export async function buildShowroomPayload(
  novelId: string
): Promise<ShowroomPayload | null> {
  const { data: novel, error: novelError } = await supabaseAdmin
    .from("novels")
    .select("id,title,model,story_details,series_id,book_number,created_at")
    .eq("id", novelId)
    .single<NovelRow>();

  if (novelError || !novel) return null;

  const [
    synopsisResult,
    descriptionsResult,
    keywordsResult,
    bisacResult,
    quotesResult,
    socialResult,
    formatsResult,
    coverResult,
  ] = await Promise.all([
    supabaseAdmin
      .from("novel_synopsis")
      .select("synopsis,created_at")
      .eq("novel_id", novelId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<{ synopsis: string; created_at: string }>(),
    supabaseAdmin
      .from("book_descriptions")
      .select("content,created_at")
      .eq("novel_id", novelId)
      .order("created_at", { ascending: false })
      .returns<TextRow[]>(),
    supabaseAdmin
      .from("novel_keywords")
      .select("keywords,created_at")
      .eq("novel_id", novelId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<JsonRow>(),
    supabaseAdmin
      .from("novel_bisac")
      .select("categories,created_at")
      .eq("novel_id", novelId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<JsonRow>(),
    supabaseAdmin
      .from("novel_quotes")
      .select("quotes,created_at")
      .eq("novel_id", novelId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<JsonRow>(),
    supabaseAdmin
      .from("social_snippets")
      .select("content,created_at")
      .eq("novel_id", novelId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<TextRow>(),
    supabaseAdmin
      .from("novel_formats")
      .select("format_name,content,created_at")
      .eq("novel_id", novelId)
      .returns<FormatRow[]>(),
    supabaseAdmin
      .from("cover_design_prompts")
      .select("url,created_at,is_active")
      .eq("novel_id", novelId)
      .order("is_active", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<{ url: string | null; created_at: string; is_active: boolean }>(),
  ]);

  const formats: Record<string, string> = {};
  for (const row of formatsResult.data ?? []) {
    if (typeof row.format_name === "string" && typeof row.content === "string") {
      formats[row.format_name] = row.content;
    }
  }

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
      synopsis: synopsisResult.data?.synopsis ?? null,
      descriptions: (descriptionsResult.data ?? [])
        .map((row) => row.content)
        .filter((content): content is string => typeof content === "string"),
      coverUrl: coverResult.data?.url ?? null,
      keywords: parseStringArray(keywordsResult.data?.keywords),
      bisac: parseStringArray(bisacResult.data?.categories),
      quotes: parseStringArray(quotesResult.data?.quotes),
      socialSnippets: socialResult.data?.content ?? null,
      formats,
      storyDetails: novel.story_details,
    },
  };
}
