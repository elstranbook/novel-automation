"use client";

import { Document, HeadingLevel, Packer, Paragraph, PageBreak } from "docx";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

// Mockup App Imports
import { MockupEditor } from "@/components/editor/MockupEditor";
import { TemplateCard } from "@/components/gallery/TemplateCard";
import { CategoryFilter } from "@/components/gallery/CategoryFilter";
import { AutoPreviewGallery } from "@/components/gallery/AutoPreviewGallery";
import { PSDUploadDialog } from "@/components/editor/PSDUploadDialog";
import { useMockupState } from "@/hooks/useMockupState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus } from "lucide-react";
import type { Template, Category, TemplatesResponse } from "@/types";

const modelOptions = ["gpt-4o", "gpt-4o-mini", "o3-mini", "o1-preview", "o1-mini"];

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

const copyToClipboard = async (text: string) => {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

const blobToBase64 = async (blob: Blob) => {
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const base64ToBlob = (base64: string, mime: string) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
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

const pageBreakText = "\f";
const pageBreakMarkdown = "\n\n\\pagebreak\n\n";
const pageBreakHtml = '<div style="page-break-after: always; break-after: page;"></div>';

const formatProseText = (prose: ScenesMap) =>
  Object.entries(prose)
    .map(([chapter, scenes], index) => {
      const chapterHeader = `Chapter ${index + 1}: ${chapter}`;
      return `${chapterHeader}\n\n${scenes.join("\n\n")}`;
    })
    .join(`\n\n${pageBreakText}\n\n`);

const formatProseMarkdown = (prose: ScenesMap) =>
  Object.entries(prose)
    .map(([chapter, scenes], index) => {
      const chapterHeader = `## Chapter ${index + 1}: ${chapter}`;
      return `${chapterHeader}\n\n${scenes.join("\n\n")}`;
    })
    .join(pageBreakMarkdown);

const formatProseHtml = (prose: ScenesMap) =>
  `<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\" />\n<title>Novel Export</title>\n</head>\n<body>\n${Object.entries(prose)
    .map(([chapter, scenes], index) => {
      const header = `<h2>Chapter ${index + 1}: ${chapter}</h2>`;
      const body = scenes
        .map((scene) => `<p>${scene.replace(/\n+/g, "</p><p>")}</p>`)
        .join("\n");
      const separator = index < Object.keys(prose).length - 1 ? pageBreakHtml : "";
      return `${header}\n${body}\n${separator}`;
    })
    .join("\n\n")}\n</body>\n</html>`;

const buildDocxDocument = (prose: ScenesMap) => {
  const children: Paragraph[] = [];
  Object.entries(prose).forEach(([chapter, scenes], index) => {
    children.push(
      new Paragraph({
        text: `Chapter ${index + 1}: ${chapter}`,
        heading: HeadingLevel.HEADING_1,
      })
    );
    scenes.forEach((scene) => {
      scene.split(/\n{2,}/).forEach((paragraph) => {
        if (paragraph.trim().length > 0) {
          children.push(new Paragraph(paragraph.trim()));
        }
      });
      children.push(new Paragraph(""));
    });
    if (index < Object.keys(prose).length - 1) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
  });

  return new Document({ sections: [{ children }] });
};

const parseSocialSnippets = (content: string) => {
  if (!content) return [] as Array<{ title: string; body: string } & { key: string }>;

  const lines = content.split(/\r?\n/);
  const sections: Array<{ title: string; body: string[]; key: string }> = [];
  const headerPattern = /^(\d+\.)?\s*([A-Z][A-Z\s/\-&]+)\s*:?$/;

  let current: { title: string; body: string[]; key: string } | null = null;

  const normalizeKey = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");

  const matchKey = (raw: string) => {
    const normalized = normalizeKey(raw);
    if (normalized.includes("twitter") || normalized.includes("x")) return "twitter";
    if (normalized.includes("instagram")) return "instagram";
    if (normalized.includes("tiktok")) return "tiktok";
    if (normalized.includes("facebook")) return "facebook";
    if (normalized.includes("newsletter") || normalized.includes("email"))
      return "newsletter";
    return normalized || "general";
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      if (current) current.body.push("");
      return;
    }

    const match = trimmed.match(headerPattern);
    if (match) {
      if (current) sections.push(current);
      const rawTitle = match[2] ?? trimmed;
      current = { title: rawTitle, body: [], key: matchKey(rawTitle) };
      return;
    }

    if (!current) {
      current = { title: "General", body: [], key: "general" };
    }
    current.body.push(line);
  });

  if (current) sections.push(current);

  return sections
    .map((section) => ({
      title: titleize(section.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")),
      body: section.body.join("\n").trim(),
      key: section.key,
    }))
    .filter((section) => section.body.length > 0);
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
  const [showSavedNovels, setShowSavedNovels] = useState(false);
  const [selectedNovelId, setSelectedNovelId] = useState<string | null>(null);
  const [novelId, setNovelId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [novelAbout, setNovelAbout] = useState("");
  const [model, setModel] = useState(modelOptions[0]);
  const [maxSceneLength, setMaxSceneLength] = useState(1000);
  const [minSceneLength, setMinSceneLength] = useState(300);

  const [seriesId] = useState<string | null>(
    searchParams.get("seriesId")
  );
  const [seriesBookNumber] = useState<number>(
    Number(searchParams.get("bookNumber") ?? 1)
  );
  const [seriesBookOptions, setSeriesBookOptions] = useState<
    Array<{ book_number: number; title: string }>
  >([]);
  const [prefillTitle] = useState<string>(searchParams.get("title") ?? "");
  const [prefillAbout] = useState<string>(searchParams.get("about") ?? "");
  const [seriesContext, setSeriesContext] = useState<Record<string, unknown> | null>(null);

  const [storyDetails, setStoryDetails] = useState<StoryDetails | null>(null);
  const [premisesAndEndings, setPremisesAndEndings] =
    useState<PremisesAndEndings | null>(null);
  const [showPremisesPanel, setShowPremisesPanel] = useState(false);
  const [novelSynopsis, setNovelSynopsis] = useState<string | null>(null);
  const [characterProfiles, setCharacterProfiles] = useState<string | null>(null);
  const [bookDescriptions, setBookDescriptions] =
    useState<BookDescriptions | null>(null);
  const [showBookDescriptions, setShowBookDescriptions] = useState(false);
  const [novelKeywords, setNovelKeywords] = useState<string[] | null>(null);
  const [novelBisac, setNovelBisac] = useState<string[] | null>(null);
  const [novelPlan, setNovelPlan] = useState<string | null>(null);
  const [chapterOutline, setChapterOutline] = useState<ChapterOutline | null>(
    null
  );
  const [chapterGuide, setChapterGuide] = useState<ChapterGuide | null>(null);
  const [chapterBeats, setChapterBeats] = useState<ChapterBeats | null>(null);
  const [allScenes, setAllScenes] = useState<ScenesMap | null>(null);
  const [novelQuotes, setNovelQuotes] = useState<string[] | null>(null);
  const [promotionalArticles, setPromotionalArticles] = useState<
    Array<Record<string, unknown>> | null
  >(null);
  const [promoArticleType, setPromoArticleType] =
    useState<string>("theme_analysis");
  const [promoLengthType, setPromoLengthType] =
    useState<string>("medium");
  const [promoTone, setPromoTone] = useState<string>("formal");
  const [promoCtaType, setPromoCtaType] = useState<string>("medium");
  const [promoIncludeLinks, setPromoIncludeLinks] = useState<boolean>(false);
  const [socialSnippets, setSocialSnippets] = useState<string | null>(null);
  const [novelFormats, setNovelFormats] = useState<Record<string, string>>({});
  const [savingExport, setSavingExport] = useState<string | null>(null);
  const [socialSnippetsByPlatform, setSocialSnippetsByPlatform] = useState<
    Record<string, string>
  >({});
  const [editingSocialSnippets, setEditingSocialSnippets] = useState<
    Record<string, string>
  >({});
  const [editingSocialSnippetKeys, setEditingSocialSnippetKeys] = useState<
    Record<string, boolean>
  >({});
  const [copiedSnippetKey, setCopiedSnippetKey] = useState<string | null>(null);
  const [view, setView] = useState<"write" | "cover" | "mockups" | "promotional" | "publish">("write");
  const [activeStudioTab, setActiveStudioTab] = useState<
    "pipeline" | "promotional"
  >("pipeline");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const [showPipelineMap, setShowPipelineMap] = useState(false);
  const [showPromotionalMap, setShowPromotionalMap] = useState(false);
  const [coverPrompt, setCoverPrompt] = useState<string | null>(null);
  const [imageModel, setImageModel] = useState("dall-e-3");
  const [generatedCoverUrl, setGeneratedCoverUrl] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [publishPublicId, setPublishPublicId] = useState<string | null>(null);
  const [proseScenes, setProseScenes] = useState<ScenesMap | null>(null);

  // Mockup App State
  const {
    selectedTemplate,
    activeTab: mockupActiveTab,
    userImage: mockupUserImage,
    setSelectedTemplate,
    setUserImage: setMockupUserImage,
    setActiveTab: setMockupActiveTab,
  } = useMockupState();

  const [mockupTemplates, setMockupTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [isMockupLoading, setIsMockupLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mockupViewMode, setMockupViewMode] = useState<"gallery" | "smart-preview">("gallery");
  const [showPSDDialog, setShowPSDDialog] = useState(false);

  // Keep a legacy coverUrl for compatibility if needed, 
  // but sync it with mockupUserImage where possible.
  const [coverUrl, setCoverUrl] = useState("");
  const [mockupJobId, setMockupJobId] = useState<string | null>(null);

  // Sync generated cover to mockup user image
  useEffect(() => {
    if (generatedCoverUrl) {
      setMockupUserImage(generatedCoverUrl);
    }
  }, [generatedCoverUrl, setMockupUserImage]);

  // Fetch mockup templates
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsMockupLoading(true);
      try {
        const response = await fetch("/api/templates");
        const data: TemplatesResponse = await response.json();
        if (data && Array.isArray(data.templates)) {
          setMockupTemplates(data.templates);
          setFilteredTemplates(data.templates);
        }
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      } finally {
        setIsMockupLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  // Filter mockup templates
  useEffect(() => {
    let filtered = mockupTemplates;
    if (selectedCategory !== "all") {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
      );
    }
    setFilteredTemplates(filtered);
  }, [mockupTemplates, selectedCategory, searchQuery]);

  const [editingText, setEditingText] = useState("");
  const [editingSuggestions, setEditingSuggestions] = useState<Array<Record<string, unknown>>>([]);

  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isFilled = (value: unknown) => {
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === "object") {
      return Object.keys(value as Record<string, unknown>).length > 0;
    }
    return Boolean(value);
  };

  const getChapterDisplayTitle = (chapterKey: string, index: number) => {
    const chapterNumber = Number.parseInt(chapterKey, 10);
    const outlineIndex = Number.isNaN(chapterNumber) ? index : chapterNumber - 1;
    const outlineEntry = chapterOutline?.[outlineIndex] as Record<string, unknown> | undefined;
    const chapterTitle = outlineEntry?.title ? String(outlineEntry.title) : "Untitled";
    const displayNumber = Number.isNaN(chapterNumber) ? index + 1 : chapterNumber;
    return `Chapter ${displayNumber}: ${chapterTitle}`;
  };

  const formatChapterBeatsText = (beats: ChapterBeats) =>
    Object.entries(beats)
      .map(([chapterKey, chapterBeats], index) =>
        `${getChapterDisplayTitle(chapterKey, index)}\n\n${formatReadable(chapterBeats)}`
      )
      .join("\n\n");

  const normalizeScenesResponse = (scenes: unknown): string[] => {
    if (Array.isArray(scenes)) {
      return scenes.map((scene) => (typeof scene === "string" ? scene : formatReadable(scene)));
    }
    if (scenes && typeof scenes === "object") {
      const record = scenes as Record<string, unknown>;
      if (Array.isArray(record.scenes)) {
        return record.scenes.map((scene) =>
          typeof scene === "string" ? scene : formatReadable(scene)
        );
      }
      return Object.values(record).map((scene) =>
        typeof scene === "string" ? scene : formatReadable(scene)
      );
    }
    return scenes ? [String(scenes)] : [];
  };

  const pipelineSteps = useMemo(
    () => [
      {
        step: "Story details",
        requires: ["Title", "Novel about"],
        produces: ["storyDetails"],
        status: isFilled(storyDetails) ? "ready" : "missing",
      },
      {
        step: "Premises & endings",
        requires: ["storyDetails"],
        produces: ["premisesAndEndings"],
        status: isFilled(premisesAndEndings) ? "ready" : "missing",
      },
      {
        step: "Synopsis",
        requires: ["storyDetails", "premisesAndEndings"],
        produces: ["novelSynopsis"],
        status: isFilled(novelSynopsis) ? "ready" : "missing",
      },
      {
        step: "Character profiles",
        requires: ["storyDetails", "novelSynopsis"],
        produces: ["characterProfiles"],
        status: isFilled(characterProfiles) ? "ready" : "missing",
      },
      {
        step: "Book descriptions",
        requires: ["storyDetails", "novelSynopsis"],
        produces: ["bookDescriptions"],
        status: isFilled(bookDescriptions) ? "ready" : "missing",
      },
      {
        step: "Keywords",
        requires: ["storyDetails", "novelSynopsis"],
        produces: ["novelKeywords"],
        status: isFilled(novelKeywords) ? "ready" : "missing",
      },
      {
        step: "BISAC",
        requires: ["storyDetails", "novelSynopsis"],
        produces: ["novelBisac"],
        status: isFilled(novelBisac) ? "ready" : "missing",
      },
      {
        step: "Novel plan",
        requires: ["storyDetails", "novelSynopsis", "characterProfiles"],
        produces: ["novelPlan"],
        status: isFilled(novelPlan) ? "ready" : "missing",
      },
      {
        step: "Chapter outline",
        requires: ["storyDetails", "novelPlan"],
        produces: ["chapterOutline"],
        status: isFilled(chapterOutline) ? "ready" : "missing",
      },
      {
        step: "Chapter guide",
        requires: ["chapterOutline", "novelSynopsis", "characterProfiles", "novelPlan"],
        produces: ["chapterGuide"],
        status: isFilled(chapterGuide) ? "ready" : "missing",
      },
      {
        step: "Chapter beats",
        requires: ["chapterGuide"],
        produces: ["chapterBeats"],
        status: isFilled(chapterBeats) ? "ready" : "missing",
      },
      {
        step: "Scenes",
        requires: ["chapterBeats"],
        produces: ["allScenes"],
        status: isFilled(allScenes) ? "ready" : "missing",
      },
      {
        step: "Prose",
        requires: ["allScenes"],
        produces: ["proseScenes"],
        status: isFilled(proseScenes) ? "ready" : "missing",
      },
      {
        step: "Cover prompt",
        requires: ["storyDetails"],
        produces: ["coverPrompt"],
        status: isFilled(coverPrompt) ? "ready" : "missing",
      },
      {
        step: "Quotes",
        requires: ["proseScenes"],
        produces: ["novelQuotes"],
        status: isFilled(novelQuotes) ? "ready" : "missing",
      },
      {
        step: "Promotional articles",
        requires: ["storyDetails"],
        produces: ["promotionalArticles"],
        status: isFilled(promotionalArticles) ? "ready" : "missing",
      },
      {
        step: "Social snippets",
        requires: ["promotionalArticles"],
        produces: ["socialSnippets"],
        status: isFilled(socialSnippets) ? "ready" : "missing",
      },
      {
        step: "Exports",
        requires: ["proseScenes"],
        produces: ["novelFormats"],
        status: isFilled(novelFormats) ? "ready" : "missing",
      },
    ],
    [
      storyDetails,
      premisesAndEndings,
      novelSynopsis,
      characterProfiles,
      bookDescriptions,
      novelKeywords,
      novelBisac,
      novelPlan,
      chapterOutline,
      chapterGuide,
      chapterBeats,
      allScenes,
      proseScenes,
      coverPrompt,
      novelQuotes,
      promotionalArticles,
      socialSnippets,
      novelFormats,
    ]
  );

  const stepsCompleted = useMemo(
    () => pipelineSteps.filter((row) => row.status === "ready").length,
    [pipelineSteps]
  );

  const renderStepBadge = (stepName: string) => {
    const step = pipelineSteps.find((row) => row.step === stepName);
    if (!step || step.status !== "ready") return null;
    return (
      <span className="inline-flex rounded-full border border-emerald-400/40 px-2 py-0.5 text-[10px] text-emerald-200">
        {step.step === "Exports" ? "Formats & Exports ready" : `${step.step} done`}
      </span>
    );
  };

  const SectionHeading = ({ title, step }: { title: string; step: string }) => (
    <div className="flex flex-wrap items-center gap-2">
      <h2 className="text-xl font-semibold">{title}</h2>
      {renderStepBadge(step)}
    </div>
  );

  const studioTabs = [
    { id: "pipeline" as const, label: "Books (Write)" },
    { id: "promotional" as const, label: "Promotional" },
  ];

  const requireUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Please sign in to save outputs.");
    }
    setAuthEmail(user.email ?? null);
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
    setLastSavedAt(new Date().toLocaleString());
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

  const loadLatestNovel = async (userIdValue: string) => {
    const { data: novel } = await supabase
      .from("novels")
      .select("id,title,created_at,series_id,book_number,story_details")
      .eq("user_id", userIdValue)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (novel) {
      setNovelId(novel.id);
      setTitle(novel.title ?? "");
      const storyDetails = novel.story_details as Record<string, unknown> | null;
      const aboutValue =
        storyDetails && typeof storyDetails.novel_about === "string"
          ? storyDetails.novel_about
          : "";
      setNovelAbout(aboutValue);
      await loadNovelData(novel.id);
      return true;
    }

    return false;
  };

  const loadSeriesNovel = async (
    userIdValue: string,
    seriesIdValue: string,
    bookNumber: number
  ) => {
    const { data: seriesBook } = await supabase
      .from("series_books")
      .select("novel_id,title,summary")
      .eq("series_id", seriesIdValue)
      .eq("book_number", bookNumber)
      .maybeSingle();

    if (seriesBook?.novel_id) {
      await loadNovelData(seriesBook.novel_id as string);
      if (seriesBook.title) setTitle(String(seriesBook.title));
      if (seriesBook.summary) setNovelAbout(String(seriesBook.summary));
      return true;
    }

    const { data: novel } = await supabase
      .from("novels")
      .select("id,title,story_details")
      .eq("series_id", seriesIdValue)
      .eq("book_number", bookNumber)
      .maybeSingle();

    if (novel) {
      await loadNovelData(novel.id);
      return true;
    }

    const { data: inserted } = await supabase
      .from("novels")
      .insert({
        user_id: userIdValue,
        title: seriesBook?.title ?? `Book ${bookNumber}`,
        series_id: seriesIdValue,
        book_number: bookNumber,
      })
      .select("id")
      .single();

    if (inserted?.id) {
      await loadNovelData(inserted.id as string);
      if (seriesBook?.title) setTitle(String(seriesBook.title));
      if (seriesBook?.summary) setNovelAbout(String(seriesBook.summary));
      return true;
    }

    return false;
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
      const storyDetails = novel.story_details as Record<string, unknown> | null;
      const aboutValue =
        storyDetails && typeof storyDetails.novel_about === "string"
          ? storyDetails.novel_about
          : "";
      setNovelAbout(aboutValue);
      setModel(novel.model ?? modelOptions[0]);
      setMaxSceneLength(novel.max_scene_length ?? 1000);
      setMinSceneLength(novel.min_scene_length ?? 300);
      setStoryDetails(novel.story_details ?? null);

      if (novel.cover_url) {
        setGeneratedCoverUrl(novel.cover_url);
        setCoverUrl(novel.cover_url);
      } else {
        setGeneratedCoverUrl(null);
        setCoverUrl("");
      }
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
        let content: string;
        const rawContent = row.scene_content as unknown;
        if (typeof rawContent === "string") {
          content = rawContent;
        } else {
          content = formatReadable(rawContent);
        }
        if (!content || content === "[object Object]") {
          content = "(Scene content missing or invalid.)";
        }
        grouped[row.chapter_title].push(content);
      });
      setAllScenes(grouped);
    }

    const { data: proseRows } = await supabase
      .from("prose_scenes")
      .select("chapter_title,scene_content,scene_order")
      .eq("novel_id", novelIdValue)
      .order("scene_order", { ascending: true });

    if (proseRows) {
      const groupedProse: ScenesMap = {};
      proseRows.forEach((row) => {
        if (!groupedProse[row.chapter_title]) {
          groupedProse[row.chapter_title] = [];
        }
        groupedProse[row.chapter_title].push(row.scene_content as string);
      });
      setProseScenes(groupedProse);
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

    const { data: promotionalArticlesRows, error: promotionalArticlesError } = await supabase
      .from("promotional_articles")
      .select("article_type,length_type,tone,cta_type,title,content")
      .eq("novel_id", novelIdValue)
      .order("created_at", { ascending: false });

    if (promotionalArticlesError) {
      console.warn("Failed to load promotional articles", promotionalArticlesError);
    } else if (promotionalArticlesRows) {
      setPromotionalArticles(
        promotionalArticlesRows.map((row) => ({
          article_type: row.article_type,
          length_type: row.length_type,
          tone: row.tone,
          cta_type: row.cta_type,
          title: row.title,
          content: row.content,
        }))
      );
    }

    const { data: socialSnippetRow, error: socialSnippetError } = await supabase
      .from("social_snippets")
      .select("content")
      .eq("novel_id", novelIdValue)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (socialSnippetError) {
      console.warn("Failed to load social snippets", socialSnippetError);
    } else if (socialSnippetRow?.content) {
      setSocialSnippets(socialSnippetRow.content);
    }

    const { data: formatRows } = await supabase
      .from("novel_formats")
      .select("format_name,content")
      .eq("novel_id", novelIdValue);

    if (formatRows) {
      const formatted: Record<string, string> = {};
      formatRows.forEach((row) => {
        formatted[row.format_name] = row.content;
      });
      setNovelFormats(formatted);
    }

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
        setAuthEmail(user.email ?? null);
        await loadNovels(user.id);
        let loadedLatest = false;
        resetPipeline();
        if (seriesId) {
          const { data: bookRows } = await supabase
            .from("series_books")
            .select("book_number,title")
            .eq("series_id", seriesId)
            .order("book_number", { ascending: true });
          setSeriesBookOptions(
            (bookRows ?? []).map((row) => ({
              book_number: Number(row.book_number),
              title: String(row.title ?? `Book ${row.book_number}`),
            }))
          );
        }

        if (seriesId && seriesBookNumber) {
          loadedLatest = await loadSeriesNovel(user.id, seriesId, seriesBookNumber);
        }
        if (!loadedLatest && prefillTitle) {
          setTitle(prefillTitle);
          setNovelAbout(prefillAbout);
        }
      } else {
        const redirectTo = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?redirect=${redirectTo}`;
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillTitle, prefillAbout]);

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
    setNovelAbout("");
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
    setNovelQuotes(null);
    setPromotionalArticles(null);
    setPromoArticleType("theme_analysis");
    setPromoLengthType("medium");
    setPromoTone("formal");
    setPromoCtaType("medium");
    setPromoIncludeLinks(false);
    setSocialSnippets(null);
    setSocialSnippetsByPlatform({});
    setEditingSocialSnippets({});
    setEditingSocialSnippetKeys({});
    setCopiedSnippetKey(null);
    setNovelFormats({});
    setSavingExport(null);
    setActiveStudioTab("pipeline");
    setCoverPrompt(null);
    setProseScenes(null);
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
        body: JSON.stringify({ title, novelAbout, model, seriesContext }),
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
        body: JSON.stringify({
          storyDetails,
          premisesAndEndings,
          model,
          studioTitle: title,
        }),
      });
      if (!response.ok) throw new Error("Failed to generate synopsis");
      const data = await response.json();
      const synopsisText = data.synopsis ?? data.summary ?? "";
      setNovelSynopsis(synopsisText);
      await saveSingleRow(
        "novel_synopsis",
        { synopsis: synopsisText },
        novelIdValue,
        user.id
      );
      if (seriesId && seriesBookNumber) {
        await supabase
          .from("series_books")
          .update({ summary: synopsisText })
          .eq("series_id", seriesId)
          .eq("book_number", seriesBookNumber);
      }
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

      const response = await fetch("/api/generate/book-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyDetails, model, mode: "all" }),
      });

      if (!response.ok) throw new Error("Failed to generate descriptions");
      const data = await response.json();
      const descriptions: BookDescriptions = data.descriptions ?? {};
      if (!Object.keys(descriptions).length) {
        throw new Error("No descriptions returned.");
      }

      await supabase
        .from("book_descriptions")
        .delete()
        .eq("novel_id", novelIdValue);

      const rows = Object.entries(descriptions).map(([key, content]) => {
        const [descriptionType, lengthType] = key.split("_");
        return {
          novel_id: novelIdValue,
          user_id: user.id,
          description_type: descriptionType ?? "marketing",
          length_type: lengthType ?? "standard",
          content: String(content ?? ""),
        };
      });

      if (rows.length) {
        await supabase.from("book_descriptions").insert(rows);
      }

      setBookDescriptions(descriptions);
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
          storyDetails,
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
          storyDetails,
          model,
        }),
      });
      if (!response.ok) throw new Error("Failed to generate beats");
      const data = await response.json();
      setChapterBeats(data.beats ?? {});
      await saveSingleRow(
        "chapter_beats",
        { beats: data.beats ?? {}, beats_raw: data.beatsRaw ?? null },
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
    if (!chapterOutline) {
      setError("Generate chapter outline first.");
      return;
    }

    setLoadingStep("scenes");
    setError(null);
    try {
      const user = await requireUser();
      const novelIdValue = await ensureNovel(user.id);

      const normalizedScenes: ScenesMap = {};
      const chapters = Array.isArray(chapterOutline)
        ? chapterOutline
        : Array.isArray((chapterOutline as Record<string, unknown>)?.chapters)
          ? ((chapterOutline as Record<string, unknown>)?.chapters as Record<string, unknown>[]) 
          : [];

      if (chapters.length === 0) {
        throw new Error("Chapter outline is empty. Regenerate the chapter outline first.");
      }

      for (let index = 0; index < chapters.length; index += 1) {
        const chapter = chapters[index] as Record<string, unknown>;
        const chapterTitle = String(
          chapter.title ?? chapter.chapter_title ?? chapter.name ?? "Untitled"
        );
        const displayTitle = getChapterDisplayTitle(String(index + 1), index);
        setMessage(`Generating scenes for ${displayTitle}`);
        const response = await fetch("/api/generate/scenes/chapter", {
          signal: AbortSignal.timeout(240000),
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chapter,
            storyDetails,
            chapterBeats,
            model,
            maxSceneLength,
            minSceneLength,
            premisesAndEndings,
            characterProfiles,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to generate scenes");
        }

        const data = await response.json();
        const scenesList = normalizeScenesResponse(data.scenes);
        const sceneRaw = data.sceneRaw ?? null;
        if (scenesList.length === 0) {
          throw new Error("Scenes generation returned no output.");
        }

        normalizedScenes[displayTitle] = scenesList;
        await saveSingleRow(
          "scenes",
          {
            chapter_title: displayTitle,
            scene_content: JSON.stringify(scenesList),
            scene_order: index + 1,
            scene_raw: sceneRaw,
          },
          novelIdValue,
          user.id
        );
      }

      setMessage(null);
      setAllScenes(normalizedScenes);
      setProseScenes(null);

      await supabase.from("scenes").delete().eq("novel_id", novelIdValue);
      const rows: Array<Record<string, unknown>> = [];
      Object.entries(normalizedScenes).forEach(([chapterTitle, scenes]) => {
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

  const generateProse = async () => {
    if (!allScenes) {
      setError("Generate scenes first.");
      return;
    }

    setLoadingStep("prose");
    setError(null);
    try {
      const user = await requireUser();
      const novelIdValue = await ensureNovel(user.id);
      const prose: ScenesMap = {};

      const entries = Object.entries(allScenes);
      for (let index = 0; index < entries.length; index += 1) {
        const [chapterTitle, scenes] = entries[index];
        const chapterProse: string[] = [];

        for (let sceneIndex = 0; sceneIndex < scenes.length; sceneIndex += 1) {
          const scene = scenes[sceneIndex];
          setMessage(
            `Generating prose for ${chapterTitle} scene ${sceneIndex + 1}/${scenes.length}`
          );

          const response = await fetch("/api/generate/prose/chapter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              scene,
              chapterTitle,
              sceneNumber: sceneIndex + 1,
              model,
              maxSceneLength,
              chapterSummary: chapterOutline?.[index]?.summary ?? "",
              chapterBeats: chapterBeats?.[chapterTitle] ?? chapterBeats?.[index + 1],
              previousScene: sceneIndex > 0 ? chapterProse[sceneIndex - 1] : "",
              emotionalState: chapterOutline?.[index]?.emotional_development ?? "",
              keyConflict: chapterOutline?.[index]?.theme_focus ?? "",
              voiceAnchor: storyDetails?.tone ?? "raw, emotional, slightly messy, introspective",
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to generate prose");
          }

          const data = await response.json();
          chapterProse.push(String(data.prose));

          await saveSingleRow(
            "novel_formats",
            {
              format_name: `prose_${chapterTitle}_scene_${sceneIndex + 1}`,
              content: String(data.prose),
              prose_raw: data.proseRaw ?? null,
            },
            novelIdValue,
            user.id
          );
        }

        prose[chapterTitle] = chapterProse;
      }

      setMessage(null);
      setProseScenes(prose);

      await supabase.from("prose_scenes").delete().eq("novel_id", novelIdValue);
      const rows: Array<Record<string, unknown>> = [];
      Object.entries(prose).forEach(([chapterTitle, scenes]) => {
        (scenes as string[]).forEach((scene, sceneOrder) => {
          rows.push({
            novel_id: novelIdValue,
            user_id: user.id,
            chapter_title: chapterTitle,
            scene_content: scene,
            scene_order: sceneOrder,
          });
        });
      });
      if (rows.length) {
        await supabase.from("prose_scenes").insert(rows);
      }

      const formats = await generateExportFormats();
      if (formats) {
        setNovelFormats((prev) => ({
          ...prev,
          txt: formats.txt,
          md: formats.markdown,
          html: formats.html,
        }));
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
        body: JSON.stringify({ storyDetails, model, studioTitle: title }),
      });
      if (!response.ok) throw new Error("Failed to generate cover prompt");
      const data = await response.json();
      setCoverPrompt(data.prompt);
      await saveSingleRow(
        "cover_design_prompts",
        { prompt: data.prompt ?? "", title: data.title ?? title },
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
      let scenesSource = proseScenes ?? allScenes;

      if (!scenesSource || Object.keys(scenesSource).length === 0) {
        const { data: proseRows } = await supabase
          .from("prose_scenes")
          .select("chapter_title,scene_content,scene_order")
          .eq("novel_id", novelIdValue)
          .order("scene_order", { ascending: true });

        if (proseRows && proseRows.length > 0) {
          const groupedProse: ScenesMap = {};
          proseRows.forEach((row) => {
            if (!groupedProse[row.chapter_title]) {
              groupedProse[row.chapter_title] = [];
            }
            groupedProse[row.chapter_title].push(row.scene_content as string);
          });
          setProseScenes(groupedProse);
          scenesSource = groupedProse;
        }
      }

      if (!scenesSource || Object.keys(scenesSource).length === 0) {
        const { data: sceneRows } = await supabase
          .from("scenes")
          .select("chapter_title,scene_content,scene_order")
          .eq("novel_id", novelIdValue)
          .order("scene_order", { ascending: true });

        if (sceneRows && sceneRows.length > 0) {
          const groupedScenes: ScenesMap = {};
          sceneRows.forEach((row) => {
            if (!groupedScenes[row.chapter_title]) {
              groupedScenes[row.chapter_title] = [];
            }
            groupedScenes[row.chapter_title].push(row.scene_content as string);
          });
          setAllScenes(groupedScenes);
          scenesSource = groupedScenes;
        }
      }

      if (!scenesSource || Object.keys(scenesSource).length === 0) {
        throw new Error("Generate scenes or prose before quotes.");
      }

      const response = await fetch("/api/generate/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyDetails,
          model,
          allScenes: scenesSource,
          novelId: novelIdValue,
        }),
      });
      if (!response.ok) throw new Error("Failed to generate quotes");
      const data = await response.json();
      setNovelQuotes(data.quotes ?? []);
      await saveSingleRow(
        "novel_quotes",
        { quotes: data.quotes ?? [], source: proseScenes ? "prose" : "scenes" },
        novelIdValue,
        user.id
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingStep(null);
    }
  };

  const generatePromotionalArticle = async (options?: {
    articleType?: string;
    lengthType?: string;
    tone?: string;
    ctaType?: string;
    includeLinks?: boolean;
  }) => {
    setLoadingStep("promo");
    setError(null);
    try {
      const user = await requireUser();
      const novelIdValue = await ensureNovel(user.id);
      const response = await fetch("/api/generate/promotional-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyDetails,
          model,
          articleType: options?.articleType ?? "theme_analysis",
          lengthType: options?.lengthType ?? "medium",
          tone: options?.tone ?? "formal",
          ctaType: options?.ctaType ?? "medium",
          includeLinks: options?.includeLinks ?? false,
          studioTitle: title,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate promotional article");
      }

      const data = await response.json();
      const newArticle = {
        article_type: data.articleType ?? options?.articleType ?? "theme_analysis",
        length_type: data.lengthType ?? options?.lengthType ?? "medium",
        tone: data.tone ?? options?.tone ?? "formal",
        cta_type: data.ctaType ?? options?.ctaType ?? "medium",
        title: data.title ?? "Promotional Article",
        content: data.content ?? "",
      };

      setPromotionalArticles((prev) => [newArticle, ...(prev ?? [])]);
      await supabase.from("promotional_articles").insert({
        novel_id: novelIdValue,
        user_id: user.id,
        article_type: newArticle.article_type,
        length_type: newArticle.length_type,
        tone: newArticle.tone,
        cta_type: newArticle.cta_type,
        title: newArticle.title,
        content: newArticle.content,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingStep(null);
    }
  };

  const generateSocialSnippets = async (
    articleContent?: string,
    platform?: "twitter" | "instagram" | "tiktok" | "facebook" | "newsletter"
  ) => {
    setLoadingStep("social");
    setError(null);
    try {
      const user = await requireUser();
      const novelIdValue = await ensureNovel(user.id);
      const response = await fetch("/api/generate/social-snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyDetails,
          model,
          articleContent,
          platform,
          studioTitle: title,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate social snippets");
      }

      const data = await response.json();
      const content = String(data.content ?? "");

      if (platform) {
        setSocialSnippetsByPlatform((prev) => ({
          ...prev,
          [platform]: content,
        }));
        setEditingSocialSnippetKeys((prev) => ({
          ...prev,
          [platform]: false,
        }));
        setEditingSocialSnippets((prev) => {
          const next = { ...prev };
          delete next[platform];
          return next;
        });
      } else {
        setSocialSnippets(content);
        await supabase.from("social_snippets").insert({
          novel_id: novelIdValue,
          user_id: user.id,
          content,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingStep(null);
    }
  };

  const generateCoverImage = async () => {
    if (!coverPrompt) return;
    setLoadingStep("cover-image");
    setError(null);
    try {
      const response = await fetch("/api/generate/cover-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: coverPrompt, 
          model: imageModel,
          novelId: novelId // Pass novel ID for saving
        }),
      });
      if (!response.ok) throw new Error("Failed to generate cover image");
      const data = await response.json();
      setGeneratedCoverUrl(data.imageUrl);
      setCoverUrl(data.imageUrl); // Sync with mockup form
      setMessage("Cover image generated and saved successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingStep(null);
    }
  };

  const generateMockup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverUrl) return;
    setLoadingStep("mockup");
    setError(null);
    try {
      const response = await fetch("/api/mockup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          novelId,
          coverUrl,
          templateId: selectedTemplate,
          coverId: `cover_${Date.now()}`,
        }),
      });
      if (!response.ok) throw new Error("Failed to submit mockup");
      const data = await response.json();
      setMockupJobId(data.jobId);
      setMessage("Mockup render job submitted successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingStep(null);
    }
  };

  const publishNovelAction = async () => {
    if (!novelId) return;
    setLoadingStep("publish");
    setError(null);
    try {
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novelId }),
      });
      if (!response.ok) throw new Error("Failed to publish novel");
      const data = await response.json();
      if (data.success) {
        setIsPublished(true);
        setPublishPublicId(data.publicId);
        setMessage("Novel published to public library successfully!");
      } else {
        throw new Error(data.error || "Publishing failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingStep(null);
    }
  };

  const clearSocialSnippets = async () => {
    setError(null);
    try {
      const user = await requireUser();
      const novelIdValue = await ensureNovel(user.id);
      await supabase.from("social_snippets").delete().eq("novel_id", novelIdValue);
      setSocialSnippets(null);
      setSocialSnippetsByPlatform({});
      setEditingSocialSnippets({});
      setEditingSocialSnippetKeys({});
      setCopiedSnippetKey(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const saveNovelFormat = async (
    format: string,
    content: string,
    mime: string
  ) => {
    setSavingExport(format);
    setError(null);
    try {
      const user = await requireUser();
      const novelIdValue = await ensureNovel(user.id);
      await supabase
        .from("novel_formats")
        .delete()
        .eq("novel_id", novelIdValue)
        .eq("format_name", format);
      await supabase.from("novel_formats").insert({
        novel_id: novelIdValue,
        user_id: user.id,
        format_name: format,
        content,
      });
      setLastSavedAt(new Date().toLocaleString());
      setNovelFormats((prev) => ({ ...prev, [format]: content }));
      setMessage("Export saved to your library.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSavingExport(null);
    }
  };

  const generateExportFormats = async () => {
    if (!proseScenes) return null;
    const response = await fetch("/api/generate/formats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scenes: proseScenes,
        title: title || storyDetails?.title || "Untitled Novel",
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to generate formats");
    }
    const data = await response.json();
    const formats = data.formats as {
      txt: string;
      markdown: string;
      html: string;
    };

    try {
      const user = await requireUser();
      const novelIdValue = await ensureNovel(user.id);
      await supabase
        .from("novel_formats")
        .delete()
        .eq("novel_id", novelIdValue)
        .in("format_name", ["txt", "md", "html"]);
      await supabase.from("novel_formats").insert([
        {
          novel_id: novelIdValue,
          user_id: user.id,
          format_name: "txt",
          content: formats.txt,
        },
        {
          novel_id: novelIdValue,
          user_id: user.id,
          format_name: "md",
          content: formats.markdown,
        },
        {
          novel_id: novelIdValue,
          user_id: user.id,
          format_name: "html",
          content: formats.html,
        },
      ]);
      setLastSavedAt(new Date().toLocaleString());
      setNovelFormats((prev) => ({
        ...prev,
        txt: formats.txt,
        md: formats.markdown,
        html: formats.html,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }

    return formats;
  };

  const saveDocxExport = async () => {
    if (!proseScenes) return;
    setSavingExport("docx");
    setError(null);
    try {
      const doc = buildDocxDocument(proseScenes);
      const blob = await Packer.toBlob(doc);
      const base64 = await blobToBase64(blob);
      await saveNovelFormat("docx", base64, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setSavingExport(null);
    }
  };

  const clearPromotionalArticles = async () => {
    setError(null);
    try {
      const user = await requireUser();
      const novelIdValue = await ensureNovel(user.id);
      await supabase.from("promotional_articles").delete().eq("novel_id", novelIdValue);
      setPromotionalArticles(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
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
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 lg:flex-row">
        <aside className="sticky top-24 hidden h-[calc(100vh-6rem)] w-[280px] flex-shrink-0 flex-col gap-4 self-start overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 lg:flex">
          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Saved novels
            </h2>
            <p className="text-xs text-zinc-500">
              Pick a stored novel to reload all generation steps.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {novels.length === 0 && (
              <span className="text-xs text-zinc-500">No novels saved yet.</span>
            )}
            {novels.map((novel) => (
              <button
                key={novel.id}
                onClick={() => setSelectedNovelId(novel.id)}
                className={`group flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs transition ${
                  novel.id === selectedNovelId
                    ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-200"
                    : "border-zinc-800 text-zinc-300 hover:border-zinc-600"
                }`}
              >
                <span className="truncate" title={novel.title}>
                  {novel.title}
                </span>
                <span className="text-[10px] text-zinc-500">
                  {new Date(novel.created_at).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        </aside>
        <main className="flex flex-1 flex-col gap-8">
          {/* Persistent Main Menu */}
          <div className="sticky top-0 z-40 -mx-6 bg-zinc-950/80 px-6 py-4 backdrop-blur-md border-b border-zinc-800">
            <div className="flex items-center justify-center gap-2 sm:gap-6">
              {[
                { id: "write", label: "Write" },
                { id: "cover", label: "Cover" },
                { id: "mockups", label: "Mockups" },
                { id: "promotional", label: "Promotional" },
                { id: "publish", label: "Publish" }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setView(t.id as any);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`rounded-full px-5 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                    view === t.id
                      ? "bg-white text-zinc-900 shadow-lg shadow-white/5"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {view === "write" && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <header className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link href="/" className="text-sm text-zinc-400">
                ← Back to home
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                {lastSavedAt && (
                  <span className="text-xs text-zinc-400">Last saved: {lastSavedAt}</span>
                )}
                <Link
                  href="/series"
                  className="rounded-full border border-emerald-500/60 px-3 py-1 text-xs text-emerald-200"
                >
                  Go to Series
                </Link>
              </div>
            </div>
          </header>
          <div>
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
          </div>

        {(message || error) && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-200">
            {error ?? message}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {studioTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveStudioTab(tab.id);
                  if (tab.id === "promotional") {
                    setView("promotional");
                  }
                }}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  activeStudioTab === tab.id
                    ? "border-white text-white"
                    : "border-zinc-700 text-zinc-400"
                }`}
              >
                {tab.id === "pipeline" ? "Books (Write)" : tab.label}
              </button>
            ))}
          </div>
          {authEmail && (
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <span>{authEmail}</span>
              <button
                onClick={async () => {
                  resetPipeline();
                  await supabase.auth.signOut();
                  window.location.href = "/login";
                }}
                className="rounded-full border border-zinc-700 px-3 py-1 text-xs"
              >
                Sign out
              </button>
            </div>
          )}
        </div>

        {seriesId && seriesBookNumber ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-xs text-zinc-300">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-zinc-100">
                  Series Book #{seriesBookNumber}
                </p>
                <p className="text-xs text-zinc-400">
                  Manage this book from your series map.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {seriesBookOptions.length > 0 && (
                  <select
                    value={String(seriesBookNumber)}
                    onChange={(event) => {
                      const nextBook = event.target.value;
                      window.location.href = `/studio?seriesId=${seriesId}&bookNumber=${nextBook}`;
                    }}
                    className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs text-zinc-100"
                  >
                    {seriesBookOptions.map((option) => (
                      <option
                        key={option.book_number}
                        value={String(option.book_number)}
                      >
                        Book {option.book_number}: {option.title}
                      </option>
                    ))}
                  </select>
                )}
                <Link
                  href="/series"
                  className="rounded-full border border-zinc-700 px-3 py-1 text-xs"
                >
                  Back to Series
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        {activeStudioTab === "pipeline" && (
          <>
            <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Pipeline prompt map</h2>
                  <p className="mt-2 text-sm text-zinc-300">
                    This map shows which outputs feed each step and what needs to exist
                    before a step can run.
                  </p>
                </div>
                <button
                  onClick={() => setShowPipelineMap((prev) => !prev)}
                  className="rounded-full border border-zinc-700 px-4 py-2 text-xs"
                >
                  {showPipelineMap ? "Hide map" : "Show map"}
                </button>
              </div>
              {showPipelineMap && (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {pipelineSteps.map((row) => (
                    <div
                      key={row.step}
                      className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-zinc-100">
                          {row.step}
                        </p>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] ${
                            row.status === "ready"
                              ? "border-emerald-400/60 text-emerald-200"
                              : "border-amber-500/40 text-amber-200"
                          }`}
                        >
                          {row.status === "ready" ? "Ready" : "Missing"}
                        </span>
                      </div>
                      {row.status === "ready" && (
                        <span className="mt-2 inline-flex rounded-full border border-emerald-400/40 px-2 py-0.5 text-[10px] text-emerald-200">
                          {row.step === "Exports"
                            ? "Formats & Exports ready"
                            : `${row.step} done`}
                        </span>
                      )}
                      <p className="mt-2 text-[11px] text-zinc-400">Requires</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {row.requires.map((item) => (
                          <span
                            key={`${row.step}-${item}`}
                            className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px]"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 text-[11px] text-zinc-400">Produces</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {row.produces.map((item) => (
                          <span
                            key={`${row.step}-${item}`}
                            className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px]"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

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
            <label className="flex flex-col gap-2 text-sm md:col-span-2">
              What the novel is about
              <textarea
                value={novelAbout}
                onChange={(event) => setNovelAbout(event.target.value)}
                className="min-h-[120px] rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
                placeholder="Describe the premise, themes, or specific idea you want..."
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
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              <button
              onClick={generateStoryDetails}
              disabled={!title || !novelAbout || loadingStep === "story"}
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
        </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <SectionHeading title="1. Story details" step="Story details" />
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
          <SectionHeading title="2. Premises & endings" step="Premises & endings" />
          <Collapsible label="Premises & endings">
            <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={generatePremises}
              disabled={!storyDetails || !storyDetails?.novel_about || loadingStep === "premises"}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
            >
              {loadingStep === "premises"
                ? "Generating..."
                : "Generate Premises & Endings"}
            </button>
            <button
              onClick={generatePremises}
              disabled={!storyDetails}
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm"
            >
              ♻️ Regenerate Premises & Endings
            </button>
          </div>
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
                  <div className="mt-3 space-y-2">
                    <p className="text-[10px] uppercase text-zinc-500">Select a premise</p>
                    {premisesAndEndings.premises.map((premise, index) => (
                      <button
                        key={`premise-select-${index}`}
                        onClick={async () => {
                          const updated = {
                            ...premisesAndEndings,
                            chosen_premise: premise,
                          };
                          setPremisesAndEndings(updated);
                          try {
                            const user = await requireUser();
                            const novelIdValue = await ensureNovel(user.id);
                            await saveSingleRow(
                              "premises_and_endings",
                              {
                                premises: updated.premises,
                                chosen_premise: updated.chosen_premise,
                                potential_endings: updated.potential_endings,
                                chosen_ending: updated.chosen_ending,
                              },
                              novelIdValue,
                              user.id
                            );
                          } catch (err) {
                            setError(err instanceof Error ? err.message : "Unknown error");
                          }
                        }}
                        className={`w-full rounded-lg border px-3 py-2 text-left text-xs ${
                          premisesAndEndings.chosen_premise === premise
                            ? "border-emerald-400/60 bg-emerald-500/10"
                            : "border-zinc-800 bg-zinc-950/60"
                        }`}
                      >
                        {premise}
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 text-sm font-semibold text-zinc-100">
                    Chosen ending
                  </p>
                  <p className="mt-2 text-sm">
                    {premisesAndEndings.chosen_ending}
                  </p>
                  <div className="mt-3 space-y-2">
                    <p className="text-[10px] uppercase text-zinc-500">Select an ending</p>
                    {premisesAndEndings.potential_endings.map((ending, index) => (
                      <button
                        key={`ending-select-${index}`}
                        onClick={async () => {
                          const updated = {
                            ...premisesAndEndings,
                            chosen_ending: ending,
                          };
                          setPremisesAndEndings(updated);
                          try {
                            const user = await requireUser();
                            const novelIdValue = await ensureNovel(user.id);
                            await saveSingleRow(
                              "premises_and_endings",
                              {
                                premises: updated.premises,
                                chosen_premise: updated.chosen_premise,
                                potential_endings: updated.potential_endings,
                                chosen_ending: updated.chosen_ending,
                              },
                              novelIdValue,
                              user.id
                            );
                          } catch (err) {
                            setError(err instanceof Error ? err.message : "Unknown error");
                          }
                        }}
                        className={`w-full rounded-lg border px-3 py-2 text-left text-xs ${
                          premisesAndEndings.chosen_ending === ending
                            ? "border-emerald-400/60 bg-emerald-500/10"
                            : "border-zinc-800 bg-zinc-950/60"
                        }`}
                      >
                        {ending}
                      </button>
                    ))}
                  </div>
                </div>
                <Collapsible label="Premises & endings">
                  <pre className="whitespace-pre-wrap text-xs text-zinc-200">
                    {formatReadable(premisesAndEndings)}
                  </pre>
                </Collapsible>
              </div>
            </div>
          )}
          </Collapsible>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <SectionHeading title="3. Synopsis" step="Synopsis" />
          <button
            onClick={generateSynopsis}
            disabled={!premisesAndEndings || !storyDetails?.novel_about || loadingStep === "synopsis"}
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
          <SectionHeading title="4. Character profiles" step="Character profiles" />
          <button
            onClick={generateProfiles}
            disabled={!novelSynopsis || !storyDetails?.novel_about || loadingStep === "profiles"}
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
          <SectionHeading title="4a. Book descriptions" step="Book descriptions" />
          <button
            onClick={generateBookDescriptions}
            disabled={!storyDetails || !storyDetails?.novel_about || loadingStep === "descriptions"}
            className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
          >
            {loadingStep === "descriptions"
              ? "Generating..."
              : "Generate Book Descriptions"}
          </button>
          {bookDescriptions && (
            <div className="mt-4">
              <Collapsible label="Book descriptions">
                <div className="grid gap-4 md:grid-cols-2">
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
              </Collapsible>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <SectionHeading title="4b. Novel keywords" step="Keywords" />
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={generateKeywords}
              disabled={!storyDetails || !storyDetails?.novel_about || loadingStep === "keywords"}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
            >
              {loadingStep === "keywords" ? "Generating..." : "Generate Keywords"}
            </button>
            <button
              onClick={generateKeywords}
              disabled={!storyDetails}
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm"
            >
              ♻️ Regenerate Keywords
            </button>
          </div>
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
          <SectionHeading title="4c. BISAC categories" step="BISAC" />
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={generateBisac}
              disabled={!storyDetails || !storyDetails?.novel_about || loadingStep === "bisac"}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
            >
              {loadingStep === "bisac" ? "Generating..." : "Generate BISAC"}
            </button>
            <button
              onClick={generateBisac}
              disabled={!storyDetails}
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm"
            >
              ♻️ Regenerate BISAC Categories
            </button>
          </div>
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
          <SectionHeading title="5. Novel plan" step="Novel plan" />
          <button
            onClick={generateNovelPlan}
            disabled={!characterProfiles || !storyDetails?.novel_about || loadingStep === "plan"}
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
          <SectionHeading title="6. Chapter outline" step="Chapter outline" />
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={generateChapterOutline}
              disabled={!novelPlan || !storyDetails?.novel_about || loadingStep === "outline"}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
            >
              {loadingStep === "outline"
                ? "Generating..."
                : "Generate Chapter Outline"}
            </button>
            <button
              onClick={generateChapterOutline}
              disabled={!novelPlan}
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm"
            >
              ♻️ Regenerate Chapter Outline
            </button>
          </div>
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
          <SectionHeading title="7. Chapter guide" step="Chapter guide" />
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={generateChapterGuide}
              disabled={!chapterOutline || !storyDetails?.novel_about || loadingStep === "guide"}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
            >
              {loadingStep === "guide" ? "Generating..." : "Generate Chapter Guide"}
            </button>
            <button
              onClick={generateChapterGuide}
              disabled={!chapterOutline}
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm"
            >
              ♻️ Regenerate Chapter Guide
            </button>
          </div>
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
          <SectionHeading title="8. Chapter beats" step="Chapter beats" />
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={generateChapterBeats}
              disabled={!chapterGuide || !storyDetails?.novel_about || loadingStep === "beats"}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
            >
              {loadingStep === "beats" ? "Generating..." : "Generate Chapter Beats"}
            </button>
            <button
              onClick={generateChapterBeats}
              disabled={!chapterGuide}
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm"
            >
              ♻️ Regenerate Chapter Beats
            </button>
          </div>
          {chapterBeats && (
            <div className="mt-4 space-y-3">
              <button
                onClick={() =>
                  downloadText(
                    `${title || "story"}_chapter_beats.txt`,
                    formatChapterBeatsText(chapterBeats)
                  )
                }
                className="rounded-full border border-zinc-700 px-3 py-1 text-xs"
              >
                Download TXT
              </button>
              <Collapsible label="Chapter beats">
                <div className="space-y-4 text-xs text-zinc-200">
                  {Object.entries(chapterBeats).map(([chapterKey, beats], index) => (
                    <div
                      key={chapterKey}
                      className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4"
                    >
                      <p className="text-sm font-semibold text-zinc-100">
                        {getChapterDisplayTitle(chapterKey, index)}
                      </p>
                      <pre className="mt-2 whitespace-pre-wrap text-xs">
                        {formatReadable(beats)}
                      </pre>
                    </div>
                  ))}
                </div>
              </Collapsible>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <SectionHeading title="9. Scenes" step="Scenes" />
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={generateScenes}
              disabled={!chapterBeats || !storyDetails?.novel_about || loadingStep === "scenes"}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
            >
              {loadingStep === "scenes" ? "Generating..." : "Generate Scenes"}
            </button>
            <button
              onClick={generateScenes}
              disabled={!chapterBeats}
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm"
            >
              ♻️ Regenerate All Scenes
            </button>
          </div>
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
                        {typeof scene === "string"
                          ? scene
                          : formatReadable(scene)}
                      </pre>
                    ))}
                  </div>
                ))}
              </Collapsible>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <SectionHeading title="10. Generate Prose" step="Prose" />
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={generateProse}
              disabled={!allScenes || !storyDetails?.novel_about || loadingStep === "prose"}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
            >
              {loadingStep === "prose" ? "Generating..." : "Generate Prose"}
            </button>
            <button
              onClick={generateProse}
              disabled={!allScenes}
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm"
            >
              ♻️ Regenerate Prose
            </button>
          </div>
          {proseScenes && (
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    downloadText(
                      `${title || "story"}_novel.txt`,
                      formatProseText(proseScenes)
                    )
                  }
                  className="rounded-full border border-zinc-700 px-3 py-1 text-xs"
                >
                  Download TXT
                </button>
                <button
                  onClick={() =>
                    downloadText(
                      `${title || "story"}_novel.md`,
                      formatProseMarkdown(proseScenes),
                      "text/markdown"
                    )
                  }
                  className="rounded-full border border-zinc-700 px-3 py-1 text-xs"
                >
                  Download Markdown
                </button>
                <button
                  onClick={() =>
                    downloadText(
                      `${title || "story"}_novel.html`,
                      formatProseHtml(proseScenes),
                      "text/html"
                    )
                  }
                  className="rounded-full border border-zinc-700 px-3 py-1 text-xs"
                >
                  Download HTML
                </button>
              </div>
              <Collapsible label="Generated prose">
                {Object.entries(proseScenes).map(([chapter, scenes]) => (
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
          <SectionHeading title="11. Formats & exports" step="Exports" />
          <p className="mt-2 text-sm text-zinc-400">
            Export the full novel prose (all scenes stitched together).
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={async () => {
                if (!proseScenes) return;
                const formats = await generateExportFormats();
                if (!formats) return;
                await saveNovelFormat("txt", formats.txt, "text/plain");
              }}
              disabled={!proseScenes || savingExport === "txt"}
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm"
            >
              {savingExport === "txt" ? "Saving..." : "Save TXT"}
            </button>
            <button
              onClick={async () => {
                if (!proseScenes) return;
                const formats = await generateExportFormats();
                if (!formats) return;
                await saveNovelFormat("md", formats.markdown, "text/markdown");
              }}
              disabled={!proseScenes || savingExport === "md"}
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm"
            >
              {savingExport === "md" ? "Saving..." : "Save Markdown"}
            </button>
            <button
              onClick={async () => {
                if (!proseScenes) return;
                const formats = await generateExportFormats();
                if (!formats) return;
                await saveNovelFormat("html", formats.html, "text/html");
              }}
              disabled={!proseScenes || savingExport === "html"}
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm"
            >
              {savingExport === "html" ? "Saving..." : "Save HTML"}
            </button>
            <button
              onClick={saveDocxExport}
              disabled={!proseScenes || savingExport === "docx"}
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm"
            >
              {savingExport === "docx" ? "Saving..." : "Save DOCX"}
            </button>
          </div>
          <div className="mt-4 rounded-lg border border-dashed border-zinc-800 p-4 text-xs text-zinc-400">
            {novelFormats.txt && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>TXT saved</span>
                <button
                  onClick={() =>
                    downloadText(
                      `${title || "story"}_novel.txt`,
                      novelFormats.txt
                    )
                  }
                  className="rounded-full border border-zinc-700 px-3 py-1 text-[10px]"
                >
                  Download TXT
                </button>
              </div>
            )}
            {novelFormats.md && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>Markdown saved</span>
                <button
                  onClick={() =>
                    downloadText(
                      `${title || "story"}_novel.md`,
                      novelFormats.md,
                      "text/markdown"
                    )
                  }
                  className="rounded-full border border-zinc-700 px-3 py-1 text-[10px]"
                >
                  Download Markdown
                </button>
              </div>
            )}
            {novelFormats.html && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>HTML saved</span>
                <button
                  onClick={() =>
                    downloadText(
                      `${title || "story"}_novel.html`,
                      novelFormats.html,
                      "text/html"
                    )
                  }
                  className="rounded-full border border-zinc-700 px-3 py-1 text-[10px]"
                >
                  Download HTML
                </button>
              </div>
            )}
            {novelFormats.docx && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>DOCX saved</span>
                <button
                  onClick={() => {
                    const blob = base64ToBlob(
                      novelFormats.docx,
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    );
                    const url = URL.createObjectURL(blob);
                    const anchor = document.createElement("a");
                    anchor.href = url;
                    anchor.download = `${title || "story"}_novel.docx`;
                    anchor.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="rounded-full border border-zinc-700 px-3 py-1 text-[10px]"
                >
                  Download DOCX
                </button>
              </div>
            )}
            {!novelFormats.txt &&
              !novelFormats.md &&
              !novelFormats.html &&
              !novelFormats.docx && (
                <p>No saved exports yet. Save a format to store it.</p>
              )}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <SectionHeading title="12. Cover prompt" step="Cover prompt" />
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={generateCoverPrompt}
              disabled={!storyDetails || loadingStep === "cover"}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
            >
              {loadingStep === "cover" ? "Generating..." : "Generate Cover Prompt"}
            </button>
            <button
              onClick={generateCoverPrompt}
              disabled={!storyDetails}
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm"
            >
              ♻️ Regenerate Cover Prompt
            </button>
          </div>
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
          <SectionHeading title="13. Quote snippets" step="Quotes" />
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={generateQuotes}
              disabled={!storyDetails || loadingStep === "quotes"}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
            >
              {loadingStep === "quotes" ? "Generating..." : "Generate Quotes"}
            </button>
            <button
              onClick={generateQuotes}
              disabled={!storyDetails}
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm"
            >
              ♻️ Regenerate Novel Quotes
            </button>
          </div>
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
          <h2 className="text-xl font-semibold">Editing feedback</h2>
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
      </>
    )}
  </div>
)}

{view === "promotional" && (
  <div className="space-y-8 animate-in fade-in duration-700">
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <SectionHeading title="Promotional articles" step="Promotional articles" />
            <p className="text-sm text-zinc-400">
              Generate marketing-ready articles, author letters, and SEO-friendly reviews.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowPromotionalMap((prev) => !prev)}
              className="rounded-full border border-zinc-700 px-4 py-2 text-xs"
            >
              {showPromotionalMap ? "Hide map" : "Show map"}
            </button>
            <button
              onClick={clearPromotionalArticles}
              disabled={!promotionalArticles || promotionalArticles.length === 0}
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm"
            >
              Clear Articles
            </button>
          </div>
        </div>

        {showPromotionalMap && (
          <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
            <h3 className="text-lg font-semibold text-zinc-100">Promotional prompt map</h3>
            <p className="mt-2 text-sm text-zinc-300">
              This map shows what feeds promotional articles and social snippets.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                {
                  step: "Promotional article",
                  requires: ["storyDetails"],
                  produces: ["promotionalArticles"],
                  status: isFilled(promotionalArticles) ? "ready" : "missing",
                },
                {
                  step: "Social snippets",
                  requires: ["storyDetails", "promotionalArticles (optional)"],
                  produces: ["socialSnippets"],
                  status: isFilled(socialSnippets) ? "ready" : "missing",
                },
              ].map((row) => (
                <div
                  key={row.step}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-zinc-100">{row.step}</p>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] ${
                        row.status === "ready"
                          ? "border-emerald-400/60 text-emerald-200"
                          : "border-amber-500/40 text-amber-200"
                      }`}
                    >
                      {row.status === "ready" ? "Ready" : "Missing"}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-zinc-400">Requires</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {row.requires.map((item) => (
                      <span
                        key={`${row.step}-${item}`}
                        className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] text-zinc-400">Produces</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {row.produces.map((item) => (
                      <span
                        key={`${row.step}-${item}`}
                        className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="text-xs text-zinc-300">
            Article Type
            <select
              value={promoArticleType}
              onChange={(event) => setPromoArticleType(event.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100"
            >
              <option value="theme_analysis">Theme analysis</option>
              <option value="character_spotlight">Character spotlight</option>
              <option value="author_journey">Author journey</option>
              <option value="world_building">World building</option>
              <option value="quote_spotlight">Quote spotlight</option>
              <option value="lessons_learned">Lessons teens can learn</option>
              <option value="comparison_article">Comparison article</option>
              <option value="symbolism_article">Hidden symbolism</option>
              <option value="emotional_hook">Emotional hook</option>
              <option value="author_letter">Author letter</option>
              <option value="problem_solution">Problem-solution</option>
              <option value="seo_review">SEO review</option>
            </select>
          </label>
          <label className="text-xs text-zinc-300">
            Article Length
            <select
              value={promoLengthType}
              onChange={(event) => setPromoLengthType(event.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100"
            >
              <option value="short">Short (300-600 words)</option>
              <option value="medium">Medium (800-1200 words)</option>
              <option value="long">Long (1500-2000 words)</option>
            </select>
          </label>
          <label className="text-xs text-zinc-300">
            Tone Preference
            <select
              value={promoTone}
              onChange={(event) => setPromoTone(event.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100"
            >
              <option value="formal">Formal</option>
              <option value="warm">Warm</option>
              <option value="casual">Casual</option>
              <option value="emotional">Emotional</option>
            </select>
          </label>
          <label className="text-xs text-zinc-300">
            Call-to-Action Style
            <select
              value={promoCtaType}
              onChange={(event) => setPromoCtaType(event.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100"
            >
              <option value="soft">Soft sell</option>
              <option value="medium">Medium sell</option>
              <option value="strong">Strong sell</option>
            </select>
          </label>
        </div>
        <label className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
          <input
            type="checkbox"
            checked={promoIncludeLinks}
            onChange={(event) => setPromoIncludeLinks(event.target.checked)}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-950"
          />
          Include placeholder links [BOOK_LINK]
        </label>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() =>
              generatePromotionalArticle({
                articleType: promoArticleType,
                lengthType: promoLengthType,
                tone: promoTone,
                ctaType: promoCtaType,
                includeLinks: promoIncludeLinks,
              })
            }
            disabled={!storyDetails || loadingStep === "promo"}
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
          >
            {loadingStep === "promo" ? "Generating..." : "Generate Article"}
          </button>
          <button
            onClick={() =>
              generatePromotionalArticle({
                articleType: "character_spotlight",
                lengthType: "short",
                tone: "warm",
                ctaType: "soft",
              })
            }
            disabled={!storyDetails || loadingStep === "promo"}
            className="rounded-full border border-zinc-700 px-5 py-2 text-sm"
          >
            Quick Character Spotlight
          </button>
          <button
            onClick={() =>
              generatePromotionalArticle({
                articleType: "seo_review",
                lengthType: "long",
                tone: "formal",
                ctaType: "strong",
                includeLinks: true,
              })
            }
            disabled={!storyDetails || loadingStep === "promo"}
            className="rounded-full border border-zinc-700 px-5 py-2 text-sm"
          >
            SEO Review Article
          </button>
        </div>
        <p className="mt-3 text-xs text-zinc-400">
          Generate marketing-ready articles like theme deep-dives, author letters,
          and SEO-friendly reviews. Each click adds a new variant.
        </p>

        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">Premises & endings</p>
            <button
              onClick={() => setShowPremisesPanel((prev) => !prev)}
              className="rounded-full border border-zinc-700 px-3 py-1 text-[10px]"
            >
              {showPremisesPanel ? "Hide" : "Show"}
            </button>
          </div>
          {showPremisesPanel && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-zinc-100">
                  Social media snippets
                </h3>
                <p className="text-xs text-zinc-400">
                  Generate multi-platform social posts (X, Instagram, TikTok, Facebook, newsletter).
                </p>
              </div>
              <button
                onClick={() => generateSocialSnippets()}
                disabled={!storyDetails || loadingStep === "social"}
                className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
              >
                {loadingStep === "social" ? "Generating..." : "Generate Snippets"}
              </button>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() =>
                generateSocialSnippets(
                  typeof promotionalArticles?.[0]?.content === "string"
                    ? promotionalArticles?.[0]?.content
                    : undefined
                )
              }
              disabled={!storyDetails || loadingStep === "social"}
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm"
            >
              Use Latest Article
            </button>
            <button
              onClick={clearSocialSnippets}
              disabled={!socialSnippets}
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm"
            >
              Clear Snippets
            </button>
            {socialSnippets && (
              <button
                onClick={() =>
                  downloadText(
                    `${title || "story"}_social_snippets.txt`,
                    socialSnippets
                  )
                }
                className="rounded-full border border-zinc-700 px-3 py-1 text-xs"
              >
                Download TXT
              </button>
            )}
          </div>
          {socialSnippets ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {parseSocialSnippets(socialSnippets).length > 0 ? (
                parseSocialSnippets(socialSnippets).map((section) => (
                  <div
                    key={section.title}
                    className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-zinc-100">
                        {section.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        {section.key !== "general" && (
                          <button
                            onClick={() =>
                              generateSocialSnippets(
                                typeof promotionalArticles?.[0]?.content ===
                                  "string"
                                  ? promotionalArticles?.[0]?.content
                                  : undefined,
                                section.key as
                                  | "twitter"
                                  | "instagram"
                                  | "tiktok"
                                  | "facebook"
                                  | "newsletter"
                              )
                            }
                            disabled={loadingStep === "social"}
                            className="rounded-full border border-zinc-700 px-3 py-1 text-[10px]"
                          >
                            Regenerate
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            const text =
                              socialSnippetsByPlatform[section.key] ?? section.body;
                            const copied = await copyToClipboard(text);
                            if (copied) {
                              setCopiedSnippetKey(section.key);
                              setTimeout(() => setCopiedSnippetKey(null), 1500);
                            }
                          }}
                          className="rounded-full border border-zinc-700 px-3 py-1 text-[10px]"
                        >
                          {copiedSnippetKey === section.key ? "Copied" : "Copy"}
                        </button>
                        <button
                          onClick={() =>
                            setEditingSocialSnippetKeys((prev) => ({
                              ...prev,
                              [section.key]: !prev[section.key],
                            }))
                          }
                          className="rounded-full border border-zinc-700 px-3 py-1 text-[10px]"
                        >
                          {editingSocialSnippetKeys[section.key] ? "Cancel" : "Edit"}
                        </button>
                        {editingSocialSnippetKeys[section.key] && (
                          <button
                            onClick={() =>
                              setSocialSnippetsByPlatform((prev) => ({
                                ...prev,
                                [section.key]:
                                  editingSocialSnippets[section.key] ??
                                  socialSnippetsByPlatform[section.key] ??
                                  section.body,
                              }))
                            }
                            className="rounded-full border border-emerald-500/60 px-3 py-1 text-[10px] text-emerald-200"
                          >
                            Save
                          </button>
                        )}
                        <button
                          onClick={() =>
                            downloadText(
                              `${title || "story"}_${section.title.replace(/\s+/g, "_")}.txt`,
                              socialSnippetsByPlatform[section.key] ?? section.body
                            )
                          }
                          className="rounded-full border border-zinc-700 px-3 py-1 text-[10px]"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                    {editingSocialSnippetKeys[section.key] ? (
                      <textarea
                        value={
                          editingSocialSnippets[section.key] ??
                          socialSnippetsByPlatform[section.key] ??
                          section.body
                        }
                        onChange={(event) =>
                          setEditingSocialSnippets((prev) => ({
                            ...prev,
                            [section.key]: event.target.value,
                          }))
                        }
                        className="mt-3 min-h-[140px] w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                      />
                    ) : (
                      <pre className="mt-3 whitespace-pre-wrap text-xs">
                        {socialSnippetsByPlatform[section.key] ?? section.body}
                      </pre>
                    )}
                  </div>
                ))
              ) : (
                <pre className="whitespace-pre-wrap text-xs text-zinc-200">
                  {socialSnippets}
                </pre>
              )}
            </div>
          ) : (
            <p className="mt-4 text-xs text-zinc-500">
              No snippets yet. Generate to see ready-to-post social content.
            </p>
          )}
        </div>

        {promotionalArticles && promotionalArticles.length > 0 ? (
          <div className="mt-6 space-y-4">
            {promotionalArticles.map((article, index) => {
              const articleType =
                typeof article.article_type === "string"
                  ? article.article_type
                  : "promotional";
              const lengthType =
                typeof article.length_type === "string"
                  ? article.length_type
                  : "medium";
              const articleTitle =
                typeof article.title === "string"
                  ? article.title
                  : "Promotional Article";
              const content =
                typeof article.content === "string" ? article.content : "";
              const label = `${titleize(articleType)} (${lengthType})`;

              return (
                <div
                  key={`${articleTitle}-${index}`}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">
                        {articleTitle}
                      </p>
                      <p className="text-xs text-zinc-400">{label}</p>
                    </div>
                    <button
                      onClick={() =>
                        downloadText(
                          `${title || "story"}_promo_${articleType}.txt`,
                          `# ${articleTitle}\n\n${content}`
                        )
                      }
                      className="rounded-full border border-zinc-700 px-3 py-1 text-xs"
                    >
                      Download
                    </button>
                  </div>
                  <pre className="mt-3 whitespace-pre-wrap text-xs">
                    {content}
                  </pre>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-400">
            No promotional articles yet. Generate one to see it here.
          </div>
        )}
      </section>
    </div>
  )}

{view === "cover" && (
  <div className="space-y-8 animate-in fade-in duration-700">
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 shadow-2xl">
      <SectionHeading title="🎨 Cover Design" step="Cover" />
      <p className="mt-2 text-sm text-zinc-500">Generate a high-quality AI cover image for your novel.</p>
      
      <div className="mt-6">
        <label className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Generation Model
          <select 
            value={imageModel}
            onChange={(e) => setImageModel(e.target.value)}
            className="mt-2 max-w-xs rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none transition-colors"
          >
            <option value="dall-e-3">GPT Image 1.5 (Default)</option>
            <option value="dall-e-2">GPT Image 1.0 (Standard)</option>
          </select>
        </label>
      </div>
      
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <button 
            onClick={generateCoverPrompt}
            disabled={!storyDetails || loadingStep === "cover"}
            className="w-full rounded-2xl bg-zinc-800 py-4 text-sm font-bold uppercase tracking-widest text-white hover:bg-zinc-700 transition-all"
          >
            {loadingStep === "cover" ? "Generating Prompt..." : "1. Refresh Design Prompt"}
          </button>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 min-h-[200px]">
            <pre className="whitespace-pre-wrap text-xs text-zinc-400 leading-relaxed">{coverPrompt || "Generate a prompt in the Write view first..."}</pre>
          </div>
        </div>

        <div className="space-y-6">
          <button 
            onClick={generateCoverImage}
            disabled={!coverPrompt || loadingStep === "cover-image"}
            className="w-full rounded-2xl bg-white py-4 text-sm font-black uppercase tracking-widest text-zinc-950 hover:bg-zinc-200 transition-all"
          >
            {loadingStep === "cover-image" ? "Creating Image..." : "2. Generate AI Cover Image"}
          </button>
          <div className="aspect-[2/3] w-full max-w-sm mx-auto overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 flex items-center justify-center shadow-2xl">
            {generatedCoverUrl ? (
              <img src={generatedCoverUrl} alt="Generated Cover" className="h-full w-full object-cover" />
            ) : (
              <div className="text-center p-12 opacity-20">
                <span className="text-6xl">🎨</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  </div>
)}

{view === "mockups" && (
  <div className="space-y-8 animate-in fade-in duration-700 min-h-[800px]">
    {mockupActiveTab === "gallery" ? (
      <div className="space-y-8">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 shadow-2xl">
          <SectionHeading title="🖼️ 3D Mockup Gallery" step="Mockup" />
          <p className="mt-2 text-sm text-zinc-500">Select a professional template to render your book cover in 3D.</p>

          <div className="mt-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 min-w-[200px]">
                <Input 
                  placeholder="Search templates..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-xl border-zinc-800 bg-zinc-950 text-zinc-100"
                />
              </div>
              <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
                <Button 
                  variant={mockupViewMode === 'gallery' ? 'secondary' : 'ghost'} 
                  size="sm"
                  onClick={() => setMockupViewMode('gallery')}
                  className="rounded-lg text-[10px] uppercase font-bold tracking-widest"
                >
                  Gallery
                </Button>
                <Button 
                  variant={mockupViewMode === 'smart-preview' ? 'secondary' : 'ghost'} 
                  size="sm"
                  onClick={() => setMockupViewMode('smart-preview')}
                  className="rounded-lg text-[10px] uppercase font-bold tracking-widest"
                >
                  Smart Preview
                </Button>
              </div>
            </div>

            {mockupViewMode === 'smart-preview' && mockupUserImage ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6">
                <AutoPreviewGallery userImage={mockupUserImage} onSelectTemplate={setSelectedTemplate} />
              </div>
            ) : (
              <div className="space-y-6">
                <CategoryFilter 
                  categories={[
                    { id: 'all', name: 'All', icon: '🎨' },
                    { id: 'novel', name: 'Novels', icon: '📚' },
                    { id: 'tshirt', name: 'Apparel', icon: '👕' },
                  ]} 
                  selectedCategory={selectedCategory} 
                  onSelect={setSelectedCategory} 
                />

                <div className="flex justify-end">
                  <Button onClick={() => setShowPSDDialog(true)} className="gap-2">
                    <Plus className="w-4 h-4" /> Upload PSD Template
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isMockupLoading ? (
                    [1,2,3].map(i => <div key={i} className="aspect-[4/3] rounded-2xl bg-zinc-900 animate-pulse border border-zinc-800" />)
                  ) : filteredTemplates.length > 0 ? (
                    filteredTemplates.map((template) => (
                      <TemplateCard key={template.id} template={template} onClick={setSelectedTemplate} />
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center text-zinc-500 italic">No templates found matching your search.</div>
                  )}
                </div>
              </div>
            )}

            <PSDUploadDialog 
              open={showPSDDialog} 
              onOpenChange={setShowPSDDialog}
              onTemplateCreated={(template) => {
                setMockupTemplates(prev => [template, ...prev]);
                setFilteredTemplates(prev => [template, ...prev]);
                setShowPSDDialog(false);
              }} 
            />
          </div>
        </section>
      </div>
    ) : (
      <div className="h-full animate-in zoom-in-95 duration-500">
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={() => setMockupActiveTab('gallery')} className="text-zinc-500 hover:text-white uppercase text-[10px] font-bold tracking-widest gap-2">
            <ArrowLeft className="w-3 h-3" /> Back to Gallery
          </Button>
        </div>
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-1 overflow-hidden shadow-2xl min-h-[700px]">
          <MockupEditor onBack={() => setMockupActiveTab('gallery')} />
        </div>
      </div>
    )}
  </div>
)}
{view === "publish" && (
  <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95 duration-700">
    <section className="max-w-2xl w-full rounded-[3rem] border border-zinc-800 bg-zinc-900/20 p-16 text-center backdrop-blur-3xl shadow-2xl">
      <div className="mx-auto h-20 w-20 text-5xl mb-8 grayscale hover:grayscale-0 transition-all cursor-default">🚀</div>
      <h2 className="text-4xl font-black tracking-tight text-zinc-100">Finalize & Publish</h2>
      <p className="mt-6 text-zinc-400 leading-relaxed text-lg">Promote your novel from the Studio to the Public library.</p>
      
      <div className="mt-12 space-y-6">
        <button
          onClick={publishNovelAction}
          disabled={!novelId || isPublished || !!loadingStep}
          className={`w-full max-w-md rounded-full px-10 py-6 text-xl font-black uppercase tracking-widest transition-all shadow-2xl ${
            isPublished 
            ? "bg-emerald-500 text-white cursor-default" 
            : "bg-white text-zinc-900 hover:scale-105 active:scale-95 hover:shadow-white/10"
          }`}
        >
          {loadingStep === "publish" ? "Publishing..." : isPublished ? "✓ Published" : "Publish to Library"}
        </button>
        
        {publishPublicId && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pt-4">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-500">Available in Library</p>
            <p className="text-[10px] text-zinc-600 mt-2 font-mono">{publishPublicId}</p>
          </div>
        )}
      </div>
    </section>
  </div>
)}
  </main>
</div>
</div>
);
}
