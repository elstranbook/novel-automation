"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

const modelOptions = ["gpt-4.1-mini", "gpt-4.1", "gpt-4o", "gpt-4"];

type StoryDetails = Record<string, unknown>;

type PremisesAndEndings = {
  premises: string[];
  chosen_premise: string;
  potential_endings: string[];
  chosen_ending?: string;
};

type ChapterOutline = Array<Record<string, unknown>>;

type ChapterGuide = Record<string, Record<string, unknown>>;

type ChapterBeats = Record<string, Array<Record<string, unknown>>>;

type ScenesMap = Record<string, string[]>;

type NovelFormats = Record<string, string>;

type BookDescriptions = Record<string, string>;

type NovelSummary = {
  id: string;
  title: string;
  created_at: string;
  series_id: string | null;
  book_number: number | null;
};

const downloadText = (filename: string, content: string, mime = "text/plain") => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const formatJson = (value: unknown) =>
  value ? JSON.stringify(value, null, 2) : "";

const titleize = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatReadable = (value: unknown, depth = 0): string => {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          return `${"  ".repeat(depth)}-\n${formatReadable(item, depth + 1)}`;
        }
        return `${"  ".repeat(depth)}- ${String(item)}`;
      })
      .join("\n");
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, val]) => {
        const heading = `${"  ".repeat(depth)}${titleize(key)}:`;
        if (typeof val === "object" && val !== null) {
          return `${heading}\n${formatReadable(val, depth + 1)}`;
        }
        return `${heading} ${String(val)}`;
      })
      .join("\n");
  }

  return String(value);
};

const Collapsible = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <details className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
    <summary className="cursor-pointer text-xs font-semibold text-zinc-300">
      {label}
    </summary>
    <div className="mt-3">{children}</div>
  </details>
);

const normalizeStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item));
      }
    } catch {
      if (value.includes(",")) {
        return value.split(",").map((item) => item.trim()).filter(Boolean);
      }
      return [value];
    }
    return [value];
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const nested =
      record.keywords ?? record.categories ?? record.items ?? record.list;
    if (Array.isArray(nested)) {
      return nested.map((item) => String(item));
    }
    if (typeof nested === "string") {
      return normalizeStringArray(nested);
    }
    if (typeof record.raw === "string") {
      return normalizeStringArray(record.raw);
    }
  }

  return [];
};

export default function StudioPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-zinc-950 text-zinc-100" />}
    >
      <StudioContent />
    </Suspense>
  );
}

function StudioContent() {
  const supabase = createSupabaseBrowserClient();
  const searchParams = useSearchParams();

  const [userId, setUserId] = useState<string | null>(null);
  const [novels, setNovels] = useState<NovelSummary[]>([]);
  const [selectedNovelId, setSelectedNovelId] = useState<string | null>(null);
  const [novelId, setNovelId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [model, setModel] = useState(modelOptions[0]);
  const [maxSceneLength, setMaxSceneLength] = useState(1000);
  const [minSceneLength, setMinSceneLength] = useState(300);

  const [seriesId] = useState<string | null>(
    searchParams.get("seriesId")
  );
  const [seriesBookNumber] = useState<number>(
    Number(searchParams.get("bookNumber") ?? 1)
  );
  const [seriesContext, setSeriesContext] = useState<Record<string, unknown> | null>(null);

  const [storyDetails, setStoryDetails] = useState<StoryDetails | null>(null);
  const [premisesAndEndings, setPremisesAndEndings] =
    useState<PremisesAndEndings | null>(null);
  const [novelSynopsis, setNovelSynopsis] = useState<string | null>(null);
  const [characterProfiles, setCharacterProfiles] = useState<string | null>(null);
  const [bookDescriptions, setBookDescriptions] =
    useState<BookDescriptions | null>(null);
  const [novelKeywords, setNovelKeywords] = useState<string[] | null>(null);
  const [novelBisac, setNovelBisac] = useState<string[] | null>(null);
  const [novelPlan, setNovelPlan] = useState<string | null>(null);
  const [chapterOutline, setChapterOutline] = useState<ChapterOutline | null>(
    null
  );
  const [chapterGuide, setChapterGuide] = useState<ChapterGuide | null>(null);
  const [chapterBeats, setChapterBeats] = useState<ChapterBeats | null>(null);
  const [allScenes, setAllScenes] = useState<ScenesMap | null>(null);
  const [novelFormats, setNovelFormats] = useState<NovelFormats | null>(null);
  const [novelQuotes, setNovelQuotes] = useState<string[] | null>(null);
  const [coverPrompt, setCoverPrompt] = useState<string | null>(null);

  const [editingText, setEditingText] = useState("");
  const [editingSuggestions, setEditingSuggestions] = useState<Array<Record<string, unknown>>>([]);

  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stepsCompleted = useMemo(() => {
    const steps = [
      storyDetails,
      premisesAndEndings,
      novelSynopsis,
      characterProfiles,
      novelPlan,
      chapterOutline,
      chapterGuide,
      chapterBeats,
      allScenes,
      novelFormats,
    ];
    return steps.filter(Boolean).length;
  }, [
    storyDetails,
    premisesAndEndings,
    novelSynopsis,
    characterProfiles,
    novelPlan,
    chapterOutline,
    chapterGuide,
    chapterBeats,
    allScenes,
    novelFormats,
  ]);

  const requireUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Please sign in to save outputs.");
    }
    return user;
  };

  const ensureNovel = async (userIdValue: string) => {
    if (novelId) {
      return novelId;
    }

    const { data, error: insertError } = await supabase
      .from("novels")
      .insert({
        user_id: userIdValue,
        title,
        model,
        max_scene_length: maxSceneLength,
        min_scene_length: minSceneLength,
        series_id: seriesId ?? null,
        book_number: seriesBookNumber ?? 1,
      })
      .select("id")
      .single();

    if (insertError) {
      throw insertError;
    }

    setNovelId(data.id);
    return data.id as string;
  };

  const saveSingleRow = async (
    table: string,
    values: Record<string, unknown>,
    novelIdValue: string,
    userIdValue: string
  ) => {
    await supabase.from(table).delete().eq("novel_id", novelIdValue);
    const { error: insertError } = await supabase.from(table).insert({
      ...values,
      novel_id: novelIdValue,
      user_id: userIdValue,
    });
    if (insertError) throw insertError;
  };

  const loadNovels = async (userIdValue: string) => {
    const { data, error: loadError } = await supabase
      .from("novels")
      .select("id,title,created_at,series_id,book_number")
      .eq("user_id", userIdValue)
      .order("created_at", { ascending: false });

    if (!loadError && data) {
      setNovels(data as NovelSummary[]);
    }
  };

  const loadNovelData = async (novelIdValue: string) => {
    const { data: novel } = await supabase
      .from("novels")
      .select("*")
      .eq("id", novelIdValue)
      .maybeSingle();

    if (novel) {
      setNovelId(novel.id);
      setTitle(novel.title ?? "");
      setModel(novel.model ?? modelOptions[0]);
      setMaxSceneLength(novel.max_scene_length ?? 1000);
      setMinSceneLength(novel.min_scene_length ?? 300);
      setStoryDetails(novel.story_details ?? null);
    }

    const [{ data: premises }, { data: synopsis }, { data: profiles }] =
      await Promise.all([
        supabase
          .from("premises_and_endings")
          .select("*")
          .eq("novel_id", novelIdValue)
          .maybeSingle(),
        supabase
          .from("novel_synopsis")
          .select("*")
          .eq("novel_id", novelIdValue)
          .maybeSingle(),
        supabase
          .from("character_profiles")
          .select("*")
          .eq("novel_id", novelIdValue)
          .maybeSingle(),
      ]);

    if (premises) {
      setPremisesAndEndings({
        premises: premises.premises ?? [],
        chosen_premise: premises.chosen_premise ?? "",
        potential_endings: premises.potential_endings ?? [],
        chosen_ending: premises.chosen_ending ?? "",
      });
    }

    if (synopsis) {
      setNovelSynopsis(synopsis.synopsis ?? null);
    }

    if (profiles) {
      setCharacterProfiles(profiles.profiles ?? null);
    }

    const [{ data: plan }, { data: outline }, { data: guide }, { data: beats }] =
      await Promise.all([
        supabase
          .from("novel_plans")
          .select("*")
          .eq("novel_id", novelIdValue)
          .maybeSingle(),
        supabase
          .from("chapter_outlines")
          .select("*")
          .eq("novel_id", novelIdValue)
          .maybeSingle(),
        supabase
          .from("chapter_guides")
          .select("*")
          .eq("novel_id", novelIdValue)
          .maybeSingle(),
        supabase
          .from("chapter_beats")
          .select("*")
          .eq("novel_id", novelIdValue)
          .maybeSingle(),
      ]);

    if (plan) setNovelPlan(plan.plan ?? null);
    if (outline) setChapterOutline(outline.outline ?? null);
    if (guide) setChapterGuide(guide.guide ?? null);
    if (beats) setChapterBeats(beats.beats ?? null);

    const { data: scenesRows } = await supabase
      .from("scenes")
      .select("chapter_title,scene_content,scene_order")
      .eq("novel_id", novelIdValue)
      .order("scene_order", { ascending: true });

    if (scenesRows) {
      const grouped: ScenesMap = {};
      scenesRows.forEach((row) => {
        if (!grouped[row.chapter_title]) {
          grouped[row.chapter_title] = [];
        }
        grouped[row.chapter_title].push(row.scene_content);
      });
      setAllScenes(grouped);
    }

    const { data: formats } = await supabase
      .from("novel_formats")
      .select("format_name,content")
      .eq("novel_id", novelIdValue);

    if (formats) {
      const formatted: NovelFormats = {};
      formats.forEach((row) => {
        formatted[row.format_name] = row.content;
      });
      setNovelFormats(formatted);
    }

    const { data: keywords } = await supabase
      .from("novel_keywords")
      .select("keywords")
      .eq("novel_id", novelIdValue)
      .maybeSingle();
    if (keywords?.keywords !== undefined) {
      setNovelKeywords(normalizeStringArray(keywords.keywords));
    }

    const { data: bisac } = await supabase
      .from("novel_bisac")
      .select("categories")
      .eq("novel_id", novelIdValue)
      .maybeSingle();
    if (bisac?.categories !== undefined) {
      setNovelBisac(normalizeStringArray(bisac.categories));
    }

    const { data: descriptions } = await supabase
      .from("book_descriptions")
      .select("description_type,length_type,content")
      .eq("novel_id", novelIdValue);
    if (descriptions) {
      const mapped: BookDescriptions = {};
      descriptions.forEach((row) => {
        mapped[`${row.description_type}_${row.length_type}`] = row.content;
      });
      setBookDescriptions(mapped);
    }

    const { data: quotes } = await supabase
      .from("novel_quotes")
      .select("quotes")
      .eq("novel_id", novelIdValue)
      .maybeSingle();
    if (quotes?.quotes) setNovelQuotes(quotes.quotes);

    const { data: cover } = await supabase
      .from("cover_design_prompts")
      .select("prompt")
      .eq("novel_id", novelIdValue)
      .maybeSingle();
    if (cover?.prompt) setCoverPrompt(cover.prompt);
  };

  const loadSeriesContext = async (seriesIdValue: string, bookNumber: number) => {
    const response = await fetch("/api/generate/series/context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seriesId: seriesIdValue, bookNumber }),
    });
    if (!response.ok) {
      throw new Error("Failed to load series context");
    }
    const data = await response.json();
    setSeriesContext(data.context);
    return data.context;
  };

  useEffect(() => {
    const bootstrap = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        await loadNovels(user.id);
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedNovelId) {
      loadNovelData(selectedNovelId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNovelId]);

  useEffect(() => {
    if (seriesId && seriesBookNumber) {
      loadSeriesContext(seriesId, seriesBookNumber).catch(() => null);
    }
  }, [seriesId, seriesBookNumber]);

  // GENERATORS
  const resetPipeline = () => {
    setStoryDetails(null);
    setPremisesAndEndings(null);
    setNovelSynopsis(null);
    setCharacterProfiles(null);
    setBookDescriptions(null);
    setNovelKeywords(null);
    setNovelBisac(null);
    setNovelPlan(null);
    setChapterOutline(null);
    setChapterGuide(null);
    setChapterBeats(null);
    setAllScenes(null);
    setNovelFormats(null);
    setNovelQuotes(null);
    setCoverPrompt(null);
  };

  const generateStoryDetails = async () => {
    setLoadingStep("story");
    setError(null);
    setMessage(null);
    try {
      const user = await requireUser();
      const response = await fetch("/api/generate/story-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, model, seriesContext }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate story details");
      }

      const data = await response.json();
      const combined = seriesContext
        ? { ...data, series_context: seriesContext }
        : data;
      setStoryDetails(combined);

      const novelIdValue = await ensureNovel(user.id);
      await supabase
        .from("novels")
        .update({ story_details: combined })
        .eq("id", novelIdValue);

      await loadNovels(user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingStep(null);
    }
  };

  const generatePremises = async () => {
    setLoadingStep("premises");
    setError(null);
    try {
      const user = await requireUser();
      const novelIdValue = await ensureNovel(user.id);
      const response = await fetch("/api/generate/premises-endings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyDetails, model }),
      });
      if (!response.ok) throw new Error("Failed to generate premises");
      const data = await response.json();
      setPremisesAndEndings(data);
      await saveSingleRow(
        "premises_and_endings",
        {
          premises: data.premises ?? [],
          chosen_premise: data.chosen_premise ?? "",
          potential_endings: data.potential_endings ?? [],
          chosen_ending: data.chosen_ending ?? "",
        },
        novelIdValue,
        user.id
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingStep(null);
    }
  };

  const generateSynopsis = async () => {
    setLoadingStep("synopsis");
    setError(null);
    try {
      const user = await requireUser();
      const novelIdValue = await ensureNovel(user.id);
      const response = await fetch("/api/generate/synopsis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyDetails, premisesAndEndings, model }),
      });
      if (!response.ok) throw new Error("Failed to generate synopsis");
      const data = await response.json();
      setNovelSynopsis(data.synopsis);
      await saveSingleRow(
        "novel_synopsis",
        { synopsis: data.synopsis ?? "" },
        novelIdValue,
        user.id
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingStep(null);
    }
  };

  const generateProfiles = async () => {
    setLoadingStep("profiles");
    setError(null);
    try {
      const user = await requireUser();
      const novelIdValue = await ensureNovel(user.id);
      const response = await fetch("/api/generate/character-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyDetails, synopsis: novelSynopsis, model }),
      });
      if (!response.ok) throw new Error("Failed to generate profiles");
      const data = await response.json();
      setCharacterProfiles(data.profiles);
      await saveSingleRow(
        "character_profiles",
        { profiles: data.profiles ?? "" },
        novelIdValue,
        user.id
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingStep(null);
    }
  };

  const generateBookDescriptions = async () => {
    setLoadingStep("descriptions");
    setError(null);
    try {
      const user = await requireUser();
      const novelIdValue = await ensureNovel(user.id);
      const descriptionTypes = [
        { descriptionType: "marketing", lengthType: "standard" },
        { descriptionType: "marketing", lengthType: "short" },
        { descriptionType: "back_cover", lengthType: "standard" },
        { descriptionType: "pitch", lengthType: "standard" },
      ];

      await supabase
        .from("book_descriptions")
        .delete()
        .eq("novel_id", novelIdValue);

      const results: BookDescriptions = {};
      for (const config of descriptionTypes) {
        const response = await fetch("/api/generate/book-description", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storyDetails,
            model,
            descriptionType: config.descriptionType,
            lengthType: config.lengthType,
          }),
        });
        if (!response.ok) throw new Error("Failed to generate description");
        const data = await response.json();
        results[`${config.descriptionType}_${config.lengthType}`] =
          data.description;
        await supabase.from("book_descriptions").insert({
          novel_id: novelIdValue,
          user_id: user.id,
          description_type: config.descriptionType,
          length_type: config.lengthType,
          content: data.description ?? "",
        });
      }

      setBookDescriptions(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingStep(null);
    }
  };

  const generateKeywords = async () => {
    setLoadingStep("keywords");
    setError(null);
    try {
      const user = await requireUser();
      const novelIdValue = await ensureNovel(user.id);
      const response = await fetch("/api/generate/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyDetails, model, synopsis: novelSynopsis }),
      });
      if (!response.ok) throw new Error("Failed to generate keywords");
      const data = await response.json();
      const normalizedKeywords = normalizeStringArray(data.keywords ?? []);
      setNovelKeywords(normalizedKeywords);
      await saveSingleRow(
        "novel_keywords",
        { keywords: normalizedKeywords },
        novelIdValue,
        user.id
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingStep(null);
    }
  };

  const generateBisac = async () => {
    setLoadingStep("bisac");
    setError(null);
    try {
      const user = await requireUser();
      const novelIdValue = await ensureNovel(user.id);
      const response = await fetch("/api/generate/bisac", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyDetails, model, synopsis: novelSynopsis }),
      });
      if (!response.ok) throw new Error("Failed to generate BISAC");
      const data = await response.json();
      const normalizedBisac = normalizeStringArray(data.categories ?? []);
      setNovelBisac(normalizedBisac);
      await saveSingleRow(
        "novel_bisac",
        { categories: normalizedBisac },
        novelIdValue,
        user.id
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingStep(null);
    }
  };

  const generateNovelPlan = async () => {
    setLoadingStep("plan");
    setError(null);
    try {
      const user = await requireUser();
      const novelIdValue = await ensureNovel(user.id);
      const response = await fetch("/api/generate/novel-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyDetails,
          synopsis: novelSynopsis,
          characterProfiles,
          model,
        }),
      });
      if (!response.ok) throw new Error("Failed to generate plan");
      const data = await response.json();
      setNovelPlan(data.plan ?? "");
      await saveSingleRow(
        "novel_plans",
        { plan: data.plan ?? "" },
        novelIdValue,
        user.id
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingStep(null);
    }
  };
  const generateChapterOutline = async () => {
    setLoadingStep("outline");
    setError(null);
    try {
      const user = await requireUser();
      const novelIdValue = await ensureNovel(user.id);
      const response = await fetch("/api/generate/chapter-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyDetails, model, novelPlan }),
      });
      if (!response.ok) throw new Error("Failed to generate outline");
      const data = await response.json();
      setChapterOutline(data.outline ?? []);
      await saveSingleRow(
        "chapter_outlines",
        { outline: data.outline ?? [] },
        novelIdValue,
        user.id
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingStep(null);
    }
  };

  const generateChapterGuide = async () => {
    setLoadingStep("guide");
    setError(null);
    try {
      const user = await requireUser();
      const novelIdValue = await ensureNovel(user.id);
      const response = await fetch("/api/generate/chapter-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterOutline,
          novelSynopsis,
          characterProfiles,
          novelPlan,
          model,
        }),
      });
      if (!response.ok) throw new Error("Failed to generate guide");
      const data = await response.json();
      setChapterGuide(data.guide ?? {});
      await saveSingleRow(
        "chapter_guides",
        { guide: data.guide ?? {} },
        novelIdValue,
        user.id
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingStep(null);
    }
  };

  const generateChapterBeats = async () => {
    setLoadingStep("beats");
    setError(null);
    try {
      const user = await requireUser();
      const novelIdValue = await ensureNovel(user.id);
      const response = await fetch("/api/generate/chapter-beats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterOutline,
          chapterGuide,
          synopsis: novelSynopsis,
          characterProfiles,
          novelPlan,
          model,
        }),
      });
      if (!response.ok) throw new Error("Failed to generate beats");
      const data = await response.json();
      setChapterBeats(data.beats ?? {});
      await saveSingleRow(
        "chapter_beats",
        { beats: data.beats ?? {} },
        novelIdValue,
        user.id
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingStep(null);
    }
  };

  const generateScenes = async () => {
    setLoadingStep("scenes");
    setError(null);
    try {
      const user = await requireUser();
      const novelIdValue = await ensureNovel(user.id);
      const outlineValue = chapterOutline as
        | Array<Record<string, unknown>>
        | Record<string, unknown>
        | null;
      const outlineArray = Array.isArray(outlineValue)
        ? outlineValue
        : ((outlineValue?.chapters as Array<Record<string, unknown>>) ?? []);

      const aggregatedScenes: ScenesMap = {};

      for (let index = 0; index < outlineArray.length; index += 1) {
        const chapter = outlineArray[index] as Record<string, unknown>;
        const chapterNumber = String(chapter.number ?? index + 1);
        setMessage(
          `Generating scenes for Chapter ${chapterNumber} (${index + 1}/${outlineArray.length})`
        );
        const response = await fetch("/api/generate/scenes/chapter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chapter,
            storyDetails,
            chapterBeats: chapterBeats?.[chapterNumber],
            model,
            maxSceneLength,
            minSceneLength,
            premisesAndEndings,
            characterProfiles,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate scenes");
        }

        const data = await response.json();
        if (!data.scenes || data.scenes.length === 0) {
          throw new Error("Scenes generation returned no output.");
        }
        aggregatedScenes[data.chapterTitle] = data.scenes as string[];
      }

      setMessage(null);
      setAllScenes(aggregatedScenes);

      await supabase.from("scenes").delete().eq("novel_id", novelIdValue);
      const rows: Array<Record<string, unknown>> = [];
      Object.entries(aggregatedScenes).forEach(([chapterTitle, scenes]) => {
        (scenes as string[]).forEach((scene, index) => {
          rows.push({
            novel_id: novelIdValue,
            user_id: user.id,
            chapter_title: chapterTitle,
            scene_content: scene,
            scene_order: index,
          });
        });
      });
      if (rows.length) {
        await supabase.from("scenes").insert(rows);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingStep(null);
    }
  };

  const generateFormats = async () => {
    setLoadingStep("formats");
    setError(null);
    try {
      const user = await requireUser();
      const novelIdValue = await ensureNovel(user.id);
      const response = await fetch("/api/generate/formats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenes: allScenes }),
      });
      if (!response.ok) throw new Error("Failed to generate formats");
      const data = await response.json();
      setNovelFormats(data.formats ?? {});
      await supabase.from("novel_formats").delete().eq("novel_id", novelIdValue);
      const rows = Object.entries(data.formats ?? {}).map(([format, content]) => ({
        novel_id: novelIdValue,
        user_id: user.id,
        format_name: format,
        content: String(content),
      }));
      if (rows.length) {
        await supabase.from("novel_formats").insert(rows);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingStep(null);
    }
  };

  const generateCoverPrompt = async () => {
    setLoadingStep("cover");
    setError(null);
    try {
      const user = await requireUser();
      const novelIdValue = await ensureNovel(user.id);
      const response = await fetch("/api/generate/cover-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyDetails, model }),
      });
      if (!response.ok) throw new Error("Failed to generate cover prompt");
      const data = await response.json();
      setCoverPrompt(data.prompt);
      await saveSingleRow(
        "cover_design_prompts",
        { prompt: data.prompt ?? "" },
        novelIdValue,
        user.id
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingStep(null);
    }
  };

  const generateQuotes = async () => {
    setLoadingStep("quotes");
    setError(null);
    try {
      const user = await requireUser();
      const novelIdValue = await ensureNovel(user.id);
      const response = await fetch("/api/generate/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyDetails,
          model,
          chapterOutline,
          scenes: allScenes,
        }),
      });
      if (!response.ok) throw new Error("Failed to generate quotes");
      const data = await response.json();
      setNovelQuotes(data.quotes ?? []);
      await saveSingleRow(
        "novel_quotes",
        { quotes: data.quotes ?? [] },
        novelIdValue,
        user.id
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingStep(null);
    }
  };

  const generateEditingSuggestions = async () => {
    setLoadingStep("editing");
    setError(null);
    try {
      const user = await requireUser();
      const novelIdValue = await ensureNovel(user.id);
      const response = await fetch("/api/generate/editing-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: editingText,
          model,
          contentId: novelIdValue,
          contentType: "manual",
        }),
      });
      if (!response.ok) throw new Error("Failed to generate editing suggestions");
      const data = await response.json();
      setEditingSuggestions((prev) => [data, ...prev]);
      await supabase.from("editing_suggestions").insert({
        novel_id: novelIdValue,
        user_id: user.id,
        content_id: data.contentId ?? novelIdValue,
        content_type: data.contentType ?? "manual",
        original_text: editingText,
        overall_assessment: data.suggestions?.overall_assessment ?? "",
        strengths: data.suggestions?.strengths ?? [],
        weaknesses: data.suggestions?.weaknesses ?? [],
        suggestions: data.suggestions?.suggestions ?? [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingStep(null);
    }
  };
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-3">
          <Link href="/" className="text-sm text-zinc-400">
            ← Back to home
          </Link>
          <h1 className="text-3xl font-semibold">Studio</h1>
          <p className="text-zinc-300">
            Full pipeline studio with Supabase persistence. Use the steps below to
            generate everything you need.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
            <span>Steps complete: {stepsCompleted} / 10</span>
            {userId ? (
              <span className="rounded-full border border-zinc-700 px-3 py-1">
                Signed in
              </span>
            ) : (
              <Link href="/login" className="underline">
                Sign in to save
              </Link>
            )}
          </div>
        </header>

        {(message || error) && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-200">
            {error ?? message}
          </div>
        )}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              Novel title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
                placeholder="The Midnight Inheritors"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Model
              <select
                value={model}
                onChange={(event) => setModel(event.target.value)}
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
              >
                {modelOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Min scene length
              <input
                type="number"
                value={minSceneLength}
                onChange={(event) => setMinSceneLength(Number(event.target.value))}
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Max scene length
              <input
                type="number"
                value={maxSceneLength}
                onChange={(event) => setMaxSceneLength(Number(event.target.value))}
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
              />
            </label>
          </div>
          {seriesContext && (
            <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-300">
              <p className="font-semibold text-zinc-200">Series context</p>
              <pre className="mt-2 whitespace-pre-wrap">
                {formatJson(seriesContext)}
              </pre>
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={generateStoryDetails}
              disabled={!title || loadingStep === "story"}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 disabled:opacity-50"
            >
              {loadingStep === "story"
                ? "Generating..."
                : "Generate Story Details"}
            </button>
            <button
              onClick={resetPipeline}
              className="rounded-full border border-zinc-700 px-6 py-3 text-sm"
            >
              Reset pipeline
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-xl font-semibold">Saved novels</h2>
          <p className="text-sm text-zinc-400">
            Pick a stored novel to reload all generation steps.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {novels.length === 0 && (
              <span className="text-sm text-zinc-500">No novels saved yet.</span>
            )}
            {novels.map((novel) => (
              <button
                key={novel.id}
                onClick={() => setSelectedNovelId(novel.id)}
                className={`rounded-full border px-4 py-2 text-sm ${
                  novel.id === selectedNovelId
                    ? "border-white text-white"
                    : "border-zinc-700 text-zinc-300"
                }`}
              >
                {novel.title}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-xl font-semibold">1. Story details</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <button
              onClick={generateStoryDetails}
              disabled={!title || loadingStep === "story"}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
            >
              {loadingStep === "story"
                ? "Generating..."
                : "Generate Story Details"}
            </button>
            <button
              onClick={() => {
                resetPipeline();
                generateStoryDetails();
              }}
              disabled={!title}
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm"
            >
              Regenerate story details
            </button>
          </div>
          {storyDetails && (
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    downloadText(
                      `${title || "story"}_story_details.txt`,
                      formatReadable(storyDetails)
                    )
                  }
                  className="rounded-full border border-zinc-700 px-3 py-1 text-xs"
                >
                  Download TXT
                </button>
              </div>
              <Collapsible label="Story details">
                <pre className="whitespace-pre-wrap text-xs text-zinc-200">
                  {formatReadable(storyDetails)}
                </pre>
              </Collapsible>
            </div>
          )}
        </section>
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-xl font-semibold">2. Premises & endings</h2>
          <button
            onClick={generatePremises}
            disabled={!storyDetails || loadingStep === "premises"}
            className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
          >
            {loadingStep === "premises"
              ? "Generating..."
              : "Generate Premises & Endings"}
          </button>
          {premisesAndEndings && (
            <div className="mt-4 space-y-3">
              <button
                onClick={() =>
                  downloadText(
                    `${title || "story"}_premises_endings.txt`,
                    formatReadable(premisesAndEndings)
                  )
                }
                className="rounded-full border border-zinc-700 px-3 py-1 text-xs"
              >
                Download TXT
              </button>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200">
                <p className="text-sm font-semibold text-zinc-100">
                  Chosen premise
                </p>
                <p className="mt-2 text-sm">
                  {premisesAndEndings.chosen_premise}
                </p>
                <p className="mt-4 text-sm font-semibold text-zinc-100">
                  Chosen ending
                </p>
                <p className="mt-2 text-sm">
                  {premisesAndEndings.chosen_ending}
                </p>
              </div>
                <Collapsible label="Premises & endings">
                  <pre className="whitespace-pre-wrap text-xs text-zinc-200">
                    {formatReadable(premisesAndEndings)}
                  </pre>
                </Collapsible>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-xl font-semibold">3. Synopsis</h2>
          <button
            onClick={generateSynopsis}
            disabled={!premisesAndEndings || loadingStep === "synopsis"}
            className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
          >
            {loadingStep === "synopsis" ? "Generating..." : "Generate Synopsis"}
          </button>
          {novelSynopsis && (
            <div className="mt-4 space-y-3">
              <button
                onClick={() =>
                  downloadText(
                    `${title || "story"}_synopsis.txt`,
                    novelSynopsis
                  )
                }
                className="rounded-full border border-zinc-700 px-3 py-1 text-xs"
              >
                Download TXT
              </button>
              <Collapsible label="Synopsis">
                <pre className="whitespace-pre-wrap text-xs text-zinc-200">
                  {novelSynopsis}
                </pre>
              </Collapsible>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-xl font-semibold">4. Character profiles</h2>
          <button
            onClick={generateProfiles}
            disabled={!novelSynopsis || loadingStep === "profiles"}
            className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
          >
            {loadingStep === "profiles"
              ? "Generating..."
              : "Generate Character Profiles"}
          </button>
          {characterProfiles && (
            <div className="mt-4 space-y-3">
              <button
                onClick={() =>
                  downloadText(
                    `${title || "story"}_character_profiles.txt`,
                    characterProfiles
                  )
                }
                className="rounded-full border border-zinc-700 px-3 py-1 text-xs"
              >
                Download TXT
              </button>
              <Collapsible label="Character profiles">
                <pre className="whitespace-pre-wrap text-xs text-zinc-200">
                  {characterProfiles}
                </pre>
              </Collapsible>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-xl font-semibold">4a. Book descriptions</h2>
          <button
            onClick={generateBookDescriptions}
            disabled={!storyDetails || loadingStep === "descriptions"}
            className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
          >
            {loadingStep === "descriptions"
              ? "Generating..."
              : "Generate Book Descriptions"}
          </button>
          {bookDescriptions && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {Object.entries(bookDescriptions).map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-zinc-100">{key}</p>
                    <button
                      onClick={() =>
                        downloadText(`${title || "story"}_${key}.txt`, value)
                      }
                      className="rounded-full border border-zinc-700 px-3 py-1 text-xs"
                    >
                      Download
                    </button>
                  </div>
                  <pre className="mt-2 whitespace-pre-wrap text-xs">{value}</pre>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-xl font-semibold">4b. Novel keywords</h2>
          <button
            onClick={generateKeywords}
            disabled={!storyDetails || loadingStep === "keywords"}
            className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
          >
            {loadingStep === "keywords" ? "Generating..." : "Generate Keywords"}
          </button>
          {novelKeywords && (
            <div className="mt-4 space-y-3">
              <button
                onClick={() =>
                  downloadText(
                    `${title || "story"}_keywords.txt`,
                    formatReadable(novelKeywords)
                  )
                }
                className="rounded-full border border-zinc-700 px-3 py-1 text-xs"
              >
                Download TXT
              </button>
              <Collapsible label="Keywords">
                <div className="flex flex-wrap gap-2">
                  {novelKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-zinc-700 px-3 py-1 text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </Collapsible>
            </div>
          )}
        </section>
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-xl font-semibold">4c. BISAC categories</h2>
          <button
            onClick={generateBisac}
            disabled={!storyDetails || loadingStep === "bisac"}
            className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
          >
            {loadingStep === "bisac" ? "Generating..." : "Generate BISAC"}
          </button>
          {novelBisac && (
            <div className="mt-4 space-y-3">
              <button
                onClick={() =>
                  downloadText(
                    `${title || "story"}_bisac.txt`,
                    formatReadable(novelBisac)
                  )
                }
                className="rounded-full border border-zinc-700 px-3 py-1 text-xs"
              >
                Download TXT
              </button>
              <Collapsible label="BISAC categories">
                <div className="flex flex-col gap-2 text-sm text-zinc-200">
                  {novelBisac.map((category) => (
                    <span key={category}>• {category}</span>
                  ))}
                </div>
              </Collapsible>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-xl font-semibold">5. Novel plan</h2>
          <button
            onClick={generateNovelPlan}
            disabled={!characterProfiles || loadingStep === "plan"}
            className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
          >
            {loadingStep === "plan" ? "Generating..." : "Generate Novel Plan"}
          </button>
          {novelPlan && (
            <div className="mt-4 space-y-3">
              <button
                onClick={() =>
                  downloadText(`${title || "story"}_novel_plan.txt`, novelPlan)
                }
                className="rounded-full border border-zinc-700 px-3 py-1 text-xs"
              >
                Download TXT
              </button>
              <Collapsible label="Novel plan">
                <pre className="whitespace-pre-wrap text-xs text-zinc-200">
                  {novelPlan}
                </pre>
              </Collapsible>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-xl font-semibold">6. Chapter outline</h2>
          <button
            onClick={generateChapterOutline}
            disabled={!novelPlan || loadingStep === "outline"}
            className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
          >
            {loadingStep === "outline"
              ? "Generating..."
              : "Generate Chapter Outline"}
          </button>
          {chapterOutline && (
            <div className="mt-4 space-y-3">
              <button
                onClick={() =>
                  downloadText(
                    `${title || "story"}_chapter_outline.txt`,
                    formatReadable(chapterOutline)
                  )
                }
                className="rounded-full border border-zinc-700 px-3 py-1 text-xs"
              >
                Download TXT
              </button>
              <Collapsible label="Chapter outline">
                <pre className="whitespace-pre-wrap text-xs text-zinc-200">
                  {formatReadable(chapterOutline)}
                </pre>
              </Collapsible>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-xl font-semibold">7. Chapter guide</h2>
          <button
            onClick={generateChapterGuide}
            disabled={!chapterOutline || loadingStep === "guide"}
            className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
          >
            {loadingStep === "guide" ? "Generating..." : "Generate Chapter Guide"}
          </button>
          {chapterGuide && (
            <div className="mt-4 space-y-3">
              <button
                onClick={() =>
                  downloadText(
                    `${title || "story"}_chapter_guide.txt`,
                    formatReadable(chapterGuide)
                  )
                }
                className="rounded-full border border-zinc-700 px-3 py-1 text-xs"
              >
                Download TXT
              </button>
              <Collapsible label="Chapter guide">
                <pre className="whitespace-pre-wrap text-xs text-zinc-200">
                  {formatReadable(chapterGuide)}
                </pre>
              </Collapsible>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-xl font-semibold">8. Chapter beats</h2>
          <button
            onClick={generateChapterBeats}
            disabled={!chapterGuide || loadingStep === "beats"}
            className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
          >
            {loadingStep === "beats" ? "Generating..." : "Generate Chapter Beats"}
          </button>
          {chapterBeats && (
            <div className="mt-4 space-y-3">
              <button
                onClick={() =>
                  downloadText(
                    `${title || "story"}_chapter_beats.txt`,
                    formatReadable(chapterBeats)
                  )
                }
                className="rounded-full border border-zinc-700 px-3 py-1 text-xs"
              >
                Download TXT
              </button>
              <Collapsible label="Chapter beats">
                <pre className="whitespace-pre-wrap text-xs text-zinc-200">
                  {formatReadable(chapterBeats)}
                </pre>
              </Collapsible>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-xl font-semibold">9. Scenes</h2>
          <button
            onClick={generateScenes}
            disabled={!chapterBeats || loadingStep === "scenes"}
            className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
          >
            {loadingStep === "scenes" ? "Generating..." : "Generate Scenes"}
          </button>
          {allScenes && (
            <div className="mt-4 space-y-4">
              <button
                onClick={() =>
                  downloadText(
                    `${title || "story"}_scenes.txt`,
                    formatReadable(allScenes)
                  )
                }
                className="rounded-full border border-zinc-700 px-3 py-1 text-xs"
              >
                Download TXT
              </button>
              <Collapsible label="Scenes">
                {Object.entries(allScenes).map(([chapter, scenes]) => (
                  <div
                    key={chapter}
                    className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200"
                  >
                    <p className="text-sm font-semibold text-zinc-100">
                      {chapter}
                    </p>
                    {scenes.map((scene, index) => (
                      <pre key={index} className="mt-2 whitespace-pre-wrap">
                        {scene}
                      </pre>
                    ))}
                  </div>
                ))}
              </Collapsible>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-xl font-semibold">10. Formats & exports</h2>
          <button
            onClick={generateFormats}
            disabled={!allScenes || loadingStep === "formats"}
            className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
          >
            {loadingStep === "formats" ? "Generating..." : "Generate Formats"}
          </button>
          {novelFormats && (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {Object.entries(novelFormats).map(([format, content]) => (
                <div
                  key={format}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200"
                >
                  <p className="text-sm font-semibold text-zinc-100">{format}</p>
                  <button
                    onClick={() =>
                      downloadText(`novel.${format}`, content as string)
                    }
                    className="mt-2 rounded-full border border-zinc-700 px-3 py-1 text-xs"
                  >
                    Download
                  </button>
                  <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap">
                    {content}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-xl font-semibold">Bonus: Cover prompt</h2>
          <button
            onClick={generateCoverPrompt}
            disabled={!storyDetails || loadingStep === "cover"}
            className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
          >
            {loadingStep === "cover" ? "Generating..." : "Generate Cover Prompt"}
          </button>
          {coverPrompt && (
            <div className="mt-4 space-y-3">
              <button
                onClick={() =>
                  downloadText(`${title || "story"}_cover_prompt.txt`, coverPrompt)
                }
                className="rounded-full border border-zinc-700 px-3 py-1 text-xs"
              >
                Download TXT
              </button>
              <Collapsible label="Cover prompt">
                <pre className="whitespace-pre-wrap text-xs text-zinc-200">
                  {coverPrompt}
                </pre>
              </Collapsible>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-xl font-semibold">Bonus: Quote snippets</h2>
          <button
            onClick={generateQuotes}
            disabled={!storyDetails || loadingStep === "quotes"}
            className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
          >
            {loadingStep === "quotes" ? "Generating..." : "Generate Quotes"}
          </button>
          {novelQuotes && (
            <div className="mt-4 space-y-3">
              <button
                onClick={() =>
                  downloadText(
                    `${title || "story"}_quotes.txt`,
                    formatReadable(novelQuotes)
                  )
                }
                className="rounded-full border border-zinc-700 px-3 py-1 text-xs"
              >
                Download TXT
              </button>
              <Collapsible label="Quote snippets">
                <ul className="space-y-2 text-sm text-zinc-200">
                  {novelQuotes.map((quote, index) => (
                    <li key={index}>“{quote}”</li>
                  ))}
                </ul>
              </Collapsible>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-xl font-semibold">Bonus: Editing feedback</h2>
          <textarea
            value={editingText}
            onChange={(event) => setEditingText(event.target.value)}
            className="mt-4 h-40 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
            placeholder="Paste prose or a scene here for feedback"
          />
          <button
            onClick={generateEditingSuggestions}
            disabled={!editingText || loadingStep === "editing"}
            className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
          >
            {loadingStep === "editing" ? "Generating..." : "Get Editing Notes"}
          </button>
          {editingSuggestions.length > 0 && (
            <div className="mt-4 space-y-3">
              <button
                onClick={() =>
                  downloadText(
                    `${title || "story"}_editing_feedback.txt`,
                    formatReadable(editingSuggestions)
                  )
                }
                className="rounded-full border border-zinc-700 px-3 py-1 text-xs"
              >
                Download TXT
              </button>
              <Collapsible label="Editing feedback">
                {editingSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200"
                  >
                    <p className="text-sm font-semibold text-zinc-100">
                      {String(suggestion.contentType ?? "notes")}
                    </p>
                    <pre className="mt-2 whitespace-pre-wrap">
                      {formatReadable(suggestion.suggestions)}
                    </pre>
                  </div>
                ))}
              </Collapsible>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
