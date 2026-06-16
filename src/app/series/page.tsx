"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import CharactersTab from "@/components/tabs/CharactersTab";

const AUTO = "auto" as const;

const modelOptions = [
  AUTO,  // 🤖 Auto — best model per pipeline step
  // ── Qwen3 (OpenRouter) ──
  "qwen/qwen3-235b-a22b-instruct-2507",  // 🏆 Best for creative writing
  "qwen/qwen3-235b-a22b-thinking-2507",   // 🧠 Complex narrative planning
  "qwen/qwen3-235b-a22b",                  // 📖 Base model
  "qwen/qwen3-14b",                        // ⚡ Efficient & affordable
  "qwen/qwen3-30b-a3b",                    // ⚖️ Balanced MoE
  "qwen/qwen3-32b",                        // 💪 Dense 32B
  // ── OpenAI ──
  "gpt-4.1-mini",
  "gpt-4.1",
  "gpt-4o",
  "gpt-4",
];

type SeriesSummary = {
  id: string;
  title: string;
  description: string | null;
  num_books: number;
  premise: string | null;
  genre: string | null;
  tone: string | null;
  themes: unknown; // jsonb
  target_audience: string | null;
  world_name: string | null;
  world_description: string | null;
  main_conflict: string | null;
  status: string | null;
};

/** Row shape returned by series_books insert + select(...) */
type SeriesBookInsertedRow = {
  id: string;
  series_id: string;
  book_number: number;
  title: string | null;
  status: string | null;
  summary: string | null;
};

/** Row shape returned by novels insert + select("id,series_id,book_number") */
type NovelInsertedRow = {
  id: string;
  series_id: string;
  book_number: number;
};

export default function SeriesPage() {
  const supabase = createSupabaseBrowserClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [seriesList, setSeriesList] = useState<SeriesSummary[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [numBooks, setNumBooks] = useState(3);
  const [model, setModel] = useState<string>("gpt-4.1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [arc, setArc] = useState<Record<string, unknown> | null>(null);
  const [seriesBible, setSeriesBible] = useState<Record<string, unknown> | null>(null);
  const [seriesMap, setSeriesMap] = useState<Record<string, unknown>[] | null>(null);
  const [characterEvolution, setCharacterEvolution] = useState<Record<string, unknown> | null>(null);
  const [bookBlueprint, setBookBlueprint] = useState<Record<string, unknown> | null>(null);
  const [allBlueprints, setAllBlueprints] = useState<Array<Record<string, unknown>>>([]);
  const [seriesBooks, setSeriesBooks] = useState<
    Array<Record<string, unknown>>
  >([]);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [suiteTone, setSuiteTone] = useState("");
  const [suiteSetting, setSuiteSetting] = useState("");
  const [suiteCharacters, setSuiteCharacters] = useState("");
  const [suiteThemes, setSuiteThemes] = useState("");
  const [suiteCoreConflict, setSuiteCoreConflict] = useState("");
  const [suiteBookNumber, setSuiteBookNumber] = useState(1);
  const [suiteGenre, setSuiteGenre] = useState("");
  const [suiteTargetAudience, setSuiteTargetAudience] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [seriesCharacters, setSeriesCharacters] = useState<
    Array<Record<string, unknown>>
  >([]);
  const [seriesWorld, setSeriesWorld] = useState<Record<string, unknown> | null>(null);
  const [worldSummaryDraft, setWorldSummaryDraft] = useState("");
  const [worldSettingDraft, setWorldSettingDraft] = useState("");
  const [worldRulesDraft, setWorldRulesDraft] = useState("");
  const [worldLoreDraft, setWorldLoreDraft] = useState("");
  const [worldElements, setWorldElements] = useState<Array<Record<string, unknown>>>([]);
  const [newElementType, setNewElementType] = useState("location");
  const [newElementName, setNewElementName] = useState("");
  const [newElementDescription, setNewElementDescription] = useState("");
  const [newElementImportance, setNewElementImportance] = useState("moderate");
  const [newElementIntroducedBook, setNewElementIntroducedBook] = useState(0);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editingElementName, setEditingElementName] = useState("");
  const [editingElementType, setEditingElementType] = useState("location");
  const [editingElementDescription, setEditingElementDescription] = useState("");
  const [editingElementImportance, setEditingElementImportance] = useState("moderate");
  const [editingElementIntroducedBook, setEditingElementIntroducedBook] = useState(0);
  const [seriesMemory, setSeriesMemory] = useState<Array<Record<string, unknown>>>([]);
  const [seriesLogs, setSeriesLogs] = useState<Array<Record<string, unknown>>>([]);
  const [activeMemoryTab, setActiveMemoryTab] = useState("canon");
  const [logTypeFilter, setLogTypeFilter] = useState("all");
  const [canonCategory, setCanonCategory] = useState("world");
  const [canonFact, setCanonFact] = useState("");
  const [canonSource, setCanonSource] = useState("");
  const [mysteryTitle, setMysteryTitle] = useState("");
  const [mysteryDescription, setMysteryDescription] = useState("");
  const [clueDescription, setClueDescription] = useState("");
  const [clueBook, setClueBook] = useState(1);
  const [relationshipInput, setRelationshipInput] = useState("");
  const [relationshipA, setRelationshipA] = useState("");
  const [canonFilter, setCanonFilter] = useState("all");
  const [canonSearch, setCanonSearch] = useState("");
  // Canon lock toggle for new entries (default: locked = cannot_change: true)
  const [canonLocked, setCanonLocked] = useState(true);
  // Multi-select for bulk actions
  const [selectedCanonIds, setSelectedCanonIds] = useState<Set<string>>(new Set());
  const [bulkCanonCategory, setBulkCanonCategory] = useState("world");
  const [mysterySearch, setMysterySearch] = useState("");
  const [mysteryBookFilter, setMysteryBookFilter] = useState(0);
  const [relationshipsSearch, setRelationshipsSearch] = useState("");
  const [relationshipsStatusFilter, setRelationshipsStatusFilter] = useState("all");
  const [timelineSearch, setTimelineSearch] = useState("");
  const [timelineBookFilter, setTimelineBookFilter] = useState(0);
  const [relationshipB, setRelationshipB] = useState("");
  const [relationshipType, setRelationshipType] = useState("friends");
  const [relationshipStatus, setRelationshipStatus] = useState("neutral");
  const [plotThreads, setPlotThreads] = useState<Array<Record<string, unknown>>>([]);
  const [plotName, setPlotName] = useState("");
  const [plotDescription, setPlotDescription] = useState("");
  const [plotType, setPlotType] = useState("main");
  const [plotIntroducedBook, setPlotIntroducedBook] = useState(1);
  const [plotResolvedBook, setPlotResolvedBook] = useState<number | null>(null);
  const [plotStatus, setPlotStatus] = useState("setup");
  const [plotFilter, setPlotFilter] = useState("all");
  const [plotSearch, setPlotSearch] = useState("");
  const [editingRelationshipId, setEditingRelationshipId] = useState<string | null>(null);
  const [editingRelationshipA, setEditingRelationshipA] = useState("");
  const [editingRelationshipB, setEditingRelationshipB] = useState("");
  const [editingRelationshipType, setEditingRelationshipType] = useState("friends");
  const [editingRelationshipStatus, setEditingRelationshipStatus] = useState("neutral");
  const [editingCanonId, setEditingCanonId] = useState<string | null>(null);
  const [editingCanonFact, setEditingCanonFact] = useState("");
  const [editingCanonCategory, setEditingCanonCategory] = useState("world");
  const [editingCanonSource, setEditingCanonSource] = useState("");
  const [editingCanonLocked, setEditingCanonLocked] = useState(true);
  const [editingSecretId, setEditingSecretId] = useState<string | null>(null);
  const [editingSecretTitle, setEditingSecretTitle] = useState("");
  const [editingSecretDescription, setEditingSecretDescription] = useState("");
  const [editingRelationshipIndex, setEditingRelationshipIndex] = useState<
    number | null
  >(null);
  const [editingRelationshipText, setEditingRelationshipText] = useState("");
  const [editingClueId, setEditingClueId] = useState<string | null>(null);
  const [editingClueDescription, setEditingClueDescription] = useState("");
  const [editingClueBook, setEditingClueBook] = useState(1);
  // ── Mystery tab: dedicated state for secrets + clues ─────────────────────────
  // Previously these were merged into seriesMemory, which caused the bug where
  // the API returns { secrets, clues } but the loader read `entries` (always []).
  // Now they live in their own arrays so canon/relationship data is never clobbered.
  const [mysterySecrets, setMysterySecrets] = useState<Array<Record<string, unknown>>>([]);
  const [mysteryClues, setMysteryClues] = useState<Array<Record<string, unknown>>>([]);
  // Secret form: extended fields (who_knows, who_doesnt_know, reveal planning, status)
  const [mysteryWhoKnows, setMysteryWhoKnows] = useState("");
  const [mysteryWhoDoesntKnow, setMysteryWhoDoesntKnow] = useState("");
  const [mysteryRevealedInBook, setMysteryRevealedInBook] = useState<number | null>(null);
  const [mysteryRevealedInChapter, setMysteryRevealedInChapter] = useState<number | null>(null);
  const [mysteryRevealMethod, setMysteryRevealMethod] = useState("");
  const [mysterySecretStatus, setMysterySecretStatus] = useState("hidden");
  // Clue form: extended fields (secret link, clue_type, planted_in_chapter, is_obvious, was_noticed)
  const [clueSecretId, setClueSecretId] = useState<string>("");
  const [clueType, setClueType] = useState("dialogue");
  const [clueChapter, setClueChapter] = useState<number | null>(null);
  const [clueIsObvious, setClueIsObvious] = useState(false);
  const [clueWasNoticed, setClueWasNoticed] = useState(false);
  // Filters
  const [secretStatusFilter, setSecretStatusFilter] = useState("all");
  const [clueTypeFilter, setClueTypeFilter] = useState("all");
  // Edit-mode extended fields
  const [editingSecretStatus, setEditingSecretStatus] = useState("hidden");
  const [editingSecretWhoKnows, setEditingSecretWhoKnows] = useState("");
  const [editingSecretWhoDoesntKnow, setEditingSecretWhoDoesntKnow] = useState("");
  const [editingSecretRevealedInBook, setEditingSecretRevealedInBook] = useState<number | null>(null);
  const [editingSecretRevealedInChapter, setEditingSecretRevealedInChapter] = useState<number | null>(null);
  const [editingSecretRevealMethod, setEditingSecretRevealMethod] = useState("");
  const [editingClueSecretId, setEditingClueSecretId] = useState<string>("");
  const [editingClueType, setEditingClueType] = useState("dialogue");
  const [editingClueChapter, setEditingClueChapter] = useState<number | null>(null);
  const [editingClueIsObvious, setEditingClueIsObvious] = useState(false);
  const [editingClueWasNoticed, setEditingClueWasNoticed] = useState(false);
  // Bulk actions
  const [selectedSecretIds, setSelectedSecretIds] = useState<Set<string>>(new Set());
  const [selectedClueIds, setSelectedClueIds] = useState<Set<string>>(new Set());
  const [seriesTimeline, setSeriesTimeline] = useState<Array<Record<string, unknown>>>([]);
  const [timelineTitle, setTimelineTitle] = useState("");
  const [timelineDescription, setTimelineDescription] = useState("");
  const [timelineBook, setTimelineBook] = useState(1);
  const [timelineOrder, setTimelineOrder] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<
    { id: string; endpoint: string; refresh: () => Promise<void> } | null
  >(null);
  const [editingTimelineId, setEditingTimelineId] = useState<string | null>(null);
  const [editingTimelineTitle, setEditingTimelineTitle] = useState("");
  const [editingTimelineDescription, setEditingTimelineDescription] = useState("");
  const [editingTimelineOrder, setEditingTimelineOrder] = useState(1);
  const [editingTimelineBook, setEditingTimelineBook] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeSeries = useMemo(() => {
    if (selectedSeriesId) {
      return seriesList.find(s => s.id === selectedSeriesId) ?? seriesList[0] ?? null;
    }
    return seriesList[0] ?? null;
  }, [selectedSeriesId, seriesList]);

  const filteredCanon = useMemo(() => {
    const query = canonSearch.trim().toLowerCase();
    // Only include actual canon entries (they have a `fact` field).
    // seriesMemory also contains mystery + relationship entries which we must exclude.
    return seriesMemory
      .filter((entry) => entry.fact != null)
      .filter((entry) => {
        const category = String(entry.category ?? "").toLowerCase();
        const matchesCategory = canonFilter === "all" || category === canonFilter;
        const matchesQuery =
          !query || JSON.stringify(entry).toLowerCase().includes(query);
        return matchesCategory && matchesQuery;
      });
  }, [seriesMemory, canonFilter, canonSearch]);

  // Refresh ONLY canon entries from the API and merge them back into seriesMemory,
  // preserving mystery + relationship entries. This prevents the bug where editing
  // a canon entry wipes sibling-tab data from local state.
  const refreshCanonOnly = useCallback(async () => {
    if (!activeSeries) return;
    const response = await fetch(
      `/api/series/canon?seriesId=${activeSeries.id}`
    );
    const data = await response.json();
    const freshCanon = (data.entries ?? []) as Array<Record<string, unknown>>;
    // Remove old canon entries (those with a `fact` field) and append fresh ones.
    setSeriesMemory((prev) => [
      ...prev.filter((e) => e.fact == null),
      ...freshCanon,
    ]);
  }, [activeSeries]);

  // Refresh ONLY mystery entries (secrets + clues) from the API.
  // Mysteries now live in their own dedicated state arrays, so this no longer
  // risks clobbering canon/relationship data from sibling tabs.
  const refreshMysteryOnly = useCallback(async () => {
    if (!activeSeries) return;
    const response = await fetch(
      `/api/series/mystery?seriesId=${activeSeries.id}`
    );
    const data = await response.json();
    setMysterySecrets((data.secrets ?? []) as Array<Record<string, unknown>>);
    setMysteryClues((data.clues ?? []) as Array<Record<string, unknown>>);
  }, [activeSeries]);

  // Secrets are filtered separately from clues — they have different fields
  // (status, who_knows, revealed_in_book) and different filters (status filter).
  const filteredSecrets = useMemo(() => {
    const query = mysterySearch.trim().toLowerCase();
    return mysterySecrets.filter((entry) => {
      const matchesQuery =
        !query || JSON.stringify(entry).toLowerCase().includes(query);
      const bookValue = Number(entry.revealed_in_book ?? 0);
      const matchesBook =
        !mysteryBookFilter || bookValue === mysteryBookFilter;
      const status = String(entry.status ?? "hidden").toLowerCase();
      const matchesStatus =
        secretStatusFilter === "all" || status === secretStatusFilter;
      return matchesQuery && matchesBook && matchesStatus;
    });
  }, [mysterySecrets, mysterySearch, mysteryBookFilter, secretStatusFilter]);

  // Clues have their own filter set: clue_type + planted_in_book.
  const filteredClues = useMemo(() => {
    const query = mysterySearch.trim().toLowerCase();
    return mysteryClues.filter((entry) => {
      const matchesQuery =
        !query || JSON.stringify(entry).toLowerCase().includes(query);
      const bookValue = Number(entry.planted_in_book ?? 0);
      const matchesBook =
        !mysteryBookFilter || bookValue === mysteryBookFilter;
      const type = String(entry.clue_type ?? "").toLowerCase();
      const matchesType =
        clueTypeFilter === "all" || type === clueTypeFilter;
      return matchesQuery && matchesBook && matchesType;
    });
  }, [mysteryClues, mysterySearch, mysteryBookFilter, clueTypeFilter]);

  const filteredRelationships = useMemo(() => {
    const query = relationshipsSearch.trim().toLowerCase();
    return seriesMemory.filter((entry) => {
      const status = String(entry.status ?? "").toLowerCase();
      const matchesStatus =
        relationshipsStatusFilter === "all" ||
        status === relationshipsStatusFilter;
      const matchesQuery =
        !query || JSON.stringify(entry).toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [seriesMemory, relationshipsSearch, relationshipsStatusFilter]);

  const filteredPlots = useMemo(() => {
    const query = plotSearch.trim().toLowerCase();
    return plotThreads.filter((thread) => {
      const matchesQuery =
        !query || JSON.stringify(thread).toLowerCase().includes(query);
      const matchesType =
        plotFilter === "all" || String(thread.type ?? "main") === plotFilter;
      return matchesQuery && matchesType;
    });
  }, [plotThreads, plotSearch, plotFilter]);

  const tensionCurveData = useMemo(() => {
    const bookNumbers = new Set<number>();
    seriesBooks.forEach((book) => {
      const value = Number(book.book_number ?? 0);
      if (value) bookNumbers.add(value);
    });
    seriesTimeline.forEach((event) => {
      const value = Number(event.book_number ?? 0);
      if (value) bookNumbers.add(value);
    });
    plotThreads.forEach((thread) => {
      const start = Number(thread.introduced_in_book ?? 0);
      const end = Number(thread.resolved_in_book ?? 0);
      if (start) bookNumbers.add(start);
      if (end) bookNumbers.add(end);
    });
    const maxBook = Math.max(1, ...Array.from(bookNumbers));
    const points = Array.from({ length: maxBook }, (_, index) => {
      const book = index + 1;
      const timelineCount = seriesTimeline.filter(
        (event) => Number(event.book_number ?? 0) === book
      ).length;
      const activeThreads = plotThreads.filter((thread) => {
        const start = Number(thread.introduced_in_book ?? 0) || book;
        const end = Number(thread.resolved_in_book ?? 0) || maxBook;
        return book >= start && book <= end;
      }).length;
      const score = timelineCount * 2 + activeThreads;
      return { book, score };
    });
    return points;
  }, [seriesBooks, seriesTimeline, plotThreads]);

  const loadingSteps = useMemo(() => {
    if (!loadingStep) return [];
    const stepsByType: Record<string, string[]> = {
      bible: [
        "Collecting series inputs",
        "Drafting series bible",
        "Saving world & characters",
      ],
      map: ["Building series map", "Creating book entries", "Linking novels"],
      evolution: [
        "Analyzing character arcs",
        "Generating evolution notes",
        "Saving to memory",
      ],
      blueprint: [
        "Drafting book blueprint",
        "Structuring chapters",
        "Saving blueprint memory",
      ],
      default: ["Generating content", "Compiling output", "Finalizing"],
    };
    return stepsByType[loadingStep] ?? stepsByType.default;
  }, [loadingStep]);

  const filteredTimeline = useMemo(() => {
    const query = timelineSearch.trim().toLowerCase();
    return seriesTimeline.filter((entry) => {
      const matchesQuery =
        !query || JSON.stringify(entry).toLowerCase().includes(query);
      const bookValue = Number(entry.book_number ?? 0);
      const matchesBook = !timelineBookFilter || bookValue === timelineBookFilter;
      return matchesQuery && matchesBook;
    });
  }, [seriesTimeline, timelineSearch, timelineBookFilter]);

  const groupedTimeline = useMemo(() => {
    return filteredTimeline.reduce(
      (acc, entry) => {
        const bookNumber = Number(entry.book_number ?? 0) || 0;
        const key = bookNumber || 0;
        const existing = Array.isArray(acc[key]) ? acc[key] : [];
        acc[key] = [...existing, entry];
        return acc;
      },
      {} as Record<number, Array<Record<string, unknown>>>
    );
  }, [filteredTimeline]);

  const logTypes = useMemo(() => {
    const types = new Set<string>();
    seriesLogs.forEach((log) => {
      const value = String(log.type ?? "");
      if (value) types.add(value);
    });
    return ["all", ...Array.from(types)];
  }, [seriesLogs]);

  const filteredLogs = useMemo(() => {
    return seriesLogs.filter((log) => {
      if (logTypeFilter === "all") return true;
      return String(log.type ?? "") === logTypeFilter;
    });
  }, [seriesLogs, logTypeFilter]);

  const memoryCounts = useMemo(() => {
    return seriesMemory.reduce(
      (acc, entry) => {
        const category = String(entry.category ?? "canon").toLowerCase();
        const current = typeof acc[category] === "number" ? acc[category] : 0;
        acc[category] = current + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [seriesMemory]);

  const memoryTabs = [
    { id: "canon", label: "Canon" },
    { id: "relationships", label: "Relationships" },
    { id: "mystery", label: "Mysteries" },
  ];

  const filteredMemoryEntries = useMemo(() => {
    if (activeMemoryTab === "relationships") {
      return seriesMemory.filter((entry) =>
        String(entry.category ?? "").toLowerCase().includes("relationship")
      );
    }
    if (activeMemoryTab === "mystery") {
      return seriesMemory.filter((entry) => {
        const category = String(entry.category ?? "").toLowerCase();
        return category.includes("clue") || category.includes("secret");
      });
    }
    return seriesMemory.filter((entry) => {
      const category = String(entry.category ?? "canon").toLowerCase();
      return category === "canon" || category === "warning";
    });
  }, [activeMemoryTab, seriesMemory]);

  const [newMemoryContent, setNewMemoryContent] = useState("");
  const [newMemoryCategory, setNewMemoryCategory] = useState("canon");
  const [memoryStatus, setMemoryStatus] = useState<string | null>(null);
  const [memoryWarnings, setMemoryWarnings] = useState<
    Array<{ id: string; message: string; severity: string }>
  >([]);

  const clearSeriesData = () => {
    setSeriesBooks([]);
    setSeriesCharacters([]);
    setSeriesWorld(null);
    setWorldSettingDraft("");
    setWorldRulesDraft("");
    setWorldLoreDraft("");
    setWorldElements([]);
    setNewElementName("");
    setNewElementDescription("");
    setNewElementImportance("moderate");
    setEditingElementId(null);
    setSeriesMemory([]);
    setSeriesTimeline([]);
    setPlotThreads([]);
    setSeriesLogs([]);
    setArc(null);
    setSeriesBible(null);
    setSeriesMap(null);
    setCharacterEvolution(null);
    setBookBlueprint(null);
    setAllBlueprints([]);
    // Reset suite fields — they'll be repopulated from the database
    setSuiteTone("");
    setSuiteSetting("");
    setSuiteCharacters("");
    setSuiteCoreConflict("");
    setSuiteThemes("");
    setSuiteBookNumber(1);
    setSuiteGenre("");
    setSuiteTargetAudience("");
  };

  const selectSeries = async (seriesId: string, seriesListRef?: SeriesSummary[]) => {
    console.log(`[selectSeries] Loading data for series ${seriesId}`);
    setSelectedSeriesId(seriesId);
    clearSeriesData();
    setSidebarOpen(false);

    // Load all series data in parallel for instant tab switching
    // Uses server-side API routes (bypass RLS) instead of direct browser Supabase queries
    try {
      const [
        booksRes,
        charactersRes,
        worldRes,
        canonRes,
        mysteryRes,
        relationshipsRes,
        plotsRes,
        timelineRes,
        memoryRes,
        logsRes,
        arcRes,
        bibleRes,
        mapsRes,
        evolutionRes,
        blueprintsRes,
        worldElementsRes,
      ] = await Promise.allSettled([
        fetch(`/api/series/books?seriesId=${seriesId}`).then(r => r.json()),
        fetch(`/api/series/characters?seriesId=${seriesId}`).then(r => r.json()),
        fetch(`/api/series/world?seriesId=${seriesId}`).then(r => r.json()),
        fetch(`/api/series/canon?seriesId=${seriesId}`).then(r => r.json()),
        fetch(`/api/series/mystery?seriesId=${seriesId}`).then(r => r.json()),
        fetch(`/api/series/relationships/entries?seriesId=${seriesId}`).then(r => r.json()),
        fetch(`/api/series/plot-threads?seriesId=${seriesId}`).then(r => r.json()),
        fetch(`/api/series/timeline?seriesId=${seriesId}`).then(r => r.json()),
        fetch(`/api/series/memory?seriesId=${seriesId}`).then(r => r.json()),
        fetch(`/api/series/generation-log?seriesId=${seriesId}`).then(r => r.json()),
        // Overview tab: series arc
        fetch(`/api/series/arcs?seriesId=${seriesId}`).then(r => r.json()),
        // Overview tab: series bible
        fetch(`/api/series/bibles?seriesId=${seriesId}`).then(r => r.json()),
        // Overview tab: series book maps
        fetch(`/api/series/book-maps?seriesId=${seriesId}`).then(r => r.json()),
        // Overview tab: character evolution
        fetch(`/api/series/character-evolution?seriesId=${seriesId}`).then(r => r.json()),
        // Overview tab: book blueprints
        fetch(`/api/series/book-blueprints?seriesId=${seriesId}`).then(r => r.json()),
        // World tab: world elements
        fetch(`/api/series/world-elements?seriesId=${seriesId}`).then(r => r.json()),
      ]);

      // Books (from server-side API)
      if (booksRes.status === "fulfilled") {
        const booksData = booksRes.value.books ?? [];
        console.log(`[selectSeries] Loaded ${booksData.length} series_books for series ${seriesId}`);
        setSeriesBooks(booksData);
      } else {
        console.error("[selectSeries] series_books query rejected:", booksRes.reason);
      }

      // Characters
      if (charactersRes.status === "fulfilled") {
        setSeriesCharacters(charactersRes.value.characters ?? []);
      }

      // World
      if (worldRes.status === "fulfilled") {
        const w = worldRes.value.world;
        setSeriesWorld(w ?? null);
        setWorldSummaryDraft(String(w?.summary ?? ""));
        setWorldSettingDraft(String(w?.setting ?? ""));
        // rules/lore may come back as objects (jsonb) — normalize to string
        const rulesVal = w?.rules;
        const loreVal = w?.lore;
        setWorldRulesDraft(
          typeof rulesVal === "object" && rulesVal !== null
            ? JSON.stringify(rulesVal, null, 2)
            : String(rulesVal ?? "")
        );
        setWorldLoreDraft(
          typeof loreVal === "object" && loreVal !== null
            ? JSON.stringify(loreVal, null, 2)
            : String(loreVal ?? "")
        );
      }

      // Canon / Memory: canon + relationships go into seriesMemory;
      // mysteries now live in their own dedicated state (mysterySecrets + mysteryClues).
      // Previously we tried to merge `mysteryRes.value.entries` into seriesMemory, but
      // the mystery API returns `{ secrets, clues }` (no `entries` key) — so the
      // mysteries tab appeared empty until manual refresh.
      const canonEntries = canonRes.status === "fulfilled" ? (canonRes.value.entries ?? []) : [];
      const relationshipEntries = relationshipsRes.status === "fulfilled" ? (relationshipsRes.value.entries ?? []) : [];
      setSeriesMemory([...canonEntries, ...relationshipEntries]);

      // Mystery: dedicated state for secrets and clues
      if (mysteryRes.status === "fulfilled") {
        setMysterySecrets(mysteryRes.value.secrets ?? []);
        setMysteryClues(mysteryRes.value.clues ?? []);
      } else {
        setMysterySecrets([]);
        setMysteryClues([]);
      }

      // Plot threads
      if (plotsRes.status === "fulfilled") {
        setPlotThreads(plotsRes.value.threads ?? []);
      }

      // Timeline
      if (timelineRes.status === "fulfilled") {
        setSeriesTimeline(timelineRes.value.events ?? []);
      }

      // Memory (overwrite if memory endpoint returned entries)
      if (memoryRes.status === "fulfilled") {
        const memEntries = memoryRes.value.entries ?? [];
        if (memEntries.length > 0) {
          setSeriesMemory(memEntries);
        }
      }

      // Generation logs
      if (logsRes.status === "fulfilled") {
        setSeriesLogs(logsRes.value.logs ?? []);
      }

      // Series arc (Overview tab)
      if (arcRes.status === "fulfilled") {
        if (arcRes.value.error) {
          console.error("[selectSeries] Error loading series_arcs:", arcRes.value.error);
        }
        const arcsData = arcRes.value.arcs ?? [];
        if (arcsData.length > 0) {
          setArc(arcsData[0] as Record<string, unknown>);
        }
      }

      // Series bible (Overview tab)
      if (bibleRes.status === "fulfilled") {
        if (bibleRes.value.error) {
          console.error("[selectSeries] Error loading series_bibles:", bibleRes.value.error);
        }
        const biblesData = bibleRes.value.bibles ?? [];
        if (biblesData.length > 0) {
          setSeriesBible(biblesData[0] as Record<string, unknown>);
        }
      }

      // Series book maps (Overview tab)
      if (mapsRes.status === "fulfilled") {
        if (mapsRes.value.error) {
          console.error("[selectSeries] Error loading series_book_maps:", mapsRes.value.error);
        }
        const mapsData = mapsRes.value.maps ?? [];
        if (mapsData.length > 0) {
          setSeriesMap(mapsData as unknown as Record<string, unknown>[]);
          console.log(`[selectSeries] Loaded ${mapsData.length} series_book_maps for series ${seriesId}`);
        } else {
          // Fallback: reconstruct basic map data from series_books if series_book_maps is empty
          // This ensures the map section shows even if series_book_maps insert failed
          const books = booksRes.status === "fulfilled" ? (booksRes.value.books ?? []) : [];
          if (books.length > 0) {
            const reconstructedMap = books.map((book: Record<string, unknown>) => ({
              book_number: book.book_number,
              map_data: {
                book_number: book.book_number,
                title: book.title ?? `Book ${book.book_number}`,
                central_conflict: book.summary ?? "",
                status: book.status ?? "planned",
              },
            }));
            setSeriesMap(reconstructedMap);
            console.log(`[selectSeries] Reconstructed series map from ${books.length} series_books (series_book_maps was empty)`);
          } else {
            console.warn(`[selectSeries] No series_book_maps and no series_books found for series ${seriesId}`);
          }
        }
      } else {
        console.error("[selectSeries] series_book_maps query rejected:", mapsRes.reason);
      }

      // Character evolution (Overview tab)
      if (evolutionRes.status === "fulfilled") {
        if (evolutionRes.value.error) {
          console.error("[selectSeries] Error loading series_character_evolution:", evolutionRes.value.error);
        }
        const evoData = evolutionRes.value.evolution ?? [];
        if (evoData.length > 0) {
          setCharacterEvolution(evoData[0] as Record<string, unknown>);
        }
      }

      // Book blueprints (Overview tab) — show the one matching suiteBookNumber or the first
      const blueprintsData = blueprintsRes.status === "fulfilled" ? (blueprintsRes.value.blueprints ?? []) : [];
      if (blueprintsRes.status === "fulfilled" && blueprintsRes.value.error) {
        console.error("[selectSeries] Error loading series_book_blueprints:", blueprintsRes.value.error);
      }
      setAllBlueprints(blueprintsData as Record<string, unknown>[]);
      if (blueprintsData.length > 0) {
        const matching = blueprintsData.find(
          (b: Record<string, unknown>) => Number(b.book_number) === suiteBookNumber
        );
        setBookBlueprint((matching ?? blueprintsData[0]) as Record<string, unknown>);
      }

      // World elements (World tab)
      if (worldElementsRes.status === "fulfilled") {
        setWorldElements(worldElementsRes.value.elements ?? []);
      }

      // Populate overview suite fields from the series row (seriesList already has the expanded fields)
      // Use the passed seriesListRef if available (avoids stale closure when called from loadSeries)
      const listToSearch = seriesListRef ?? seriesList;
      const currentSeries = listToSearch.find(s => s.id === seriesId);
      if (currentSeries) {
        if (currentSeries.tone) setSuiteTone(String(currentSeries.tone));
        if (currentSeries.genre) setSuiteGenre(String(currentSeries.genre));
        if (currentSeries.target_audience) setSuiteTargetAudience(String(currentSeries.target_audience));
        if (currentSeries.world_name || currentSeries.world_description) {
          const setting = [currentSeries.world_name, currentSeries.world_description].filter(Boolean).join(" — ");
          if (setting) setSuiteSetting(setting);
        }
        if (currentSeries.main_conflict) setSuiteCoreConflict(String(currentSeries.main_conflict));
        if (currentSeries.themes) {
          const themesVal = currentSeries.themes;
          if (Array.isArray(themesVal)) {
            setSuiteThemes(themesVal.join(", "));
          } else if (typeof themesVal === "string") {
            setSuiteThemes(themesVal);
          }
        }
      }

      // Populate suite characters from series_bibles character_files
      if (bibleRes.status === "fulfilled" && bibleRes.value.data && bibleRes.value.data.length > 0) {
        const bible = bibleRes.value.data[0] as Record<string, unknown>;
        const characterFiles = bible.character_files as Record<string, unknown> | null;
        if (characterFiles && typeof characterFiles === "object") {
          const charNames = Object.keys(characterFiles);
          if (charNames.length > 0) {
            setSuiteCharacters(charNames.join(", "));
          }
        }
        // Also populate themes from bible if not already set from series table
        if ((!currentSeries?.themes) && bible.themes_symbols) {
          const ts = bible.themes_symbols;
          if (Array.isArray(ts)) {
            setSuiteThemes(ts.map((t: unknown) => typeof t === "string" ? t : String((t as Record<string, unknown>)?.theme ?? t)).join(", "));
          }
        }
      }
    } catch (err) {
      console.error("Failed to load series data:", err);
    }
  };

  const loadSeries = async (userIdValue: string) => {
    console.log(`[loadSeries] Loading series for user ${userIdValue}`);
    // Use server-side API route (bypasses RLS) instead of direct browser Supabase query
    let data: SeriesSummary[] | null = null;

    try {
      const res = await fetch(`/api/series/list?userId=${userIdValue}`);
      if (!res.ok) {
        console.error("[loadSeries] API returned status", res.status);
      }
      const json = await res.json();
      data = (json.series ?? null) as SeriesSummary[] | null;
    } catch (err) {
      console.error("[loadSeries] Failed to fetch series list:", err);
    }

    if (data && data.length > 0) {
      console.log(`[loadSeries] Found ${data.length} series, selecting target`);
      setSeriesList(data);
      const targetId = selectedSeriesId ?? (data[0]?.id ?? null);
      if (targetId && data.some((s: SeriesSummary) => s.id === targetId)) {
        // Use selectSeries to load all data for the target series
        await selectSeries(targetId, data);
      } else if (data[0]) {
        await selectSeries(data[0].id, data);
      }
    } else {
      console.warn("[loadSeries] No series data found for user");
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        setAuthEmail(user.email ?? null);
        await loadSeries(user.id);
      } else {
        const redirectTo = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?redirect=${redirectTo}`;
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createSeries = async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");

      const response = await fetch("/api/generate/series/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          title,
          description,
          numBooks,
          model,
        }),
      });

      if (!response.ok) throw new Error("Failed to create series");

      const data = await response.json();
      setArc(data.arc ?? null);
      setSeriesBible(null);
      setSeriesMap(null);
      setCharacterEvolution(null);
      setBookBlueprint(null);
      setTitle("");
      setDescription("");
      setShowCreateForm(false);
      await loadSeries(user.id);
      // Auto-select the newly created series (it will be first after reload)
      // Use the server-side API to avoid RLS issues
      try {
        const listRes = await fetch(`/api/series/list?userId=${user.id}`);
        const listJson = await listRes.json();
        const freshList = listJson.series as SeriesSummary[] | undefined;
        if (freshList && freshList[0]) {
          setSelectedSeriesId(freshList[0].id);
        }
      } catch {
        // ignore — loadSeries already selected the series
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold">Confirm delete</h2>
            <p className="mt-2 text-sm text-zinc-400">
              This action cannot be undone. Are you sure?
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={async () => {
                  await fetch(pendingDelete.endpoint, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: pendingDelete.id }),
                  });
                  await pendingDelete.refresh();
                  setPendingDelete(null);
                }}
                className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900"
              >
                Delete
              </button>
              <button
                onClick={() => setPendingDelete(null)}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm text-zinc-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loadingStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 px-6">
          <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
            <button
              onClick={() => setLoadingStep(null)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
              aria-label="Dismiss"
            >
              ✕
            </button>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Generating</p>
            <h2 className="mt-2 text-lg font-semibold text-zinc-100">
              {String(loadingStep)} in progress
            </h2>
            <div className="mt-4 h-2 w-full rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-500/70"
                style={{
                  width: `${Math.max(20, Math.round((loadingSteps.length || 1) * 25))}%`,
                }}
              />
            </div>
            <div className="mt-4 space-y-2 text-left text-xs text-zinc-300">
              {loadingSteps.map((step, index) => {
                const isActive = index === 1;
                const isDone = index === 0;
                return (
                  <div key={step} className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isDone
                          ? "bg-emerald-400"
                          : isActive
                            ? "bg-amber-400"
                            : "bg-zinc-600"
                      }`}
                    />
                    <span className={isActive ? "text-amber-200" : "text-zinc-300"}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-zinc-400">
              This may take a minute. You can keep working in another tab.
            </p>
          </div>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-800 bg-zinc-900 transition-transform duration-200 md:static md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-100">My Series</h2>
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500/20 px-1.5 text-[10px] font-semibold text-emerald-300">
                {seriesList.length}
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:text-zinc-200 md:hidden"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          {/* New Series button */}
          <div className="px-3 pt-3">
            <button
              onClick={() => {
                setActiveTab("overview");
                setSidebarOpen(false);
              }}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:border-emerald-500/40 hover:text-emerald-200"
            >
              + New Series
            </button>
          </div>

          {/* Series list */}
          <div className="flex-1 overflow-y-auto px-3 py-3" style={{ scrollbarWidth: "thin", scrollbarColor: "#3f3f46 transparent" }}>
            {seriesList.length === 0 && (
              <p className="px-2 py-4 text-center text-xs text-zinc-500">No series yet.</p>
            )}
            {seriesList.map((series) => (
              <button
                key={series.id}
                onClick={() => selectSeries(series.id)}
                className={`mb-1 w-full rounded-lg px-3 py-2.5 text-left transition ${
                  activeSeries?.id === series.id
                    ? "border-l-2 border-l-emerald-500 bg-emerald-500/10"
                    : "border-l-2 border-l-transparent hover:bg-zinc-800/60"
                }`}
              >
                <p className={`truncate text-sm font-medium ${
                  activeSeries?.id === series.id ? "text-emerald-200" : "text-zinc-200"
                }`}>
                  {series.title}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                  {series.description || "No description"}
                </p>
                <p className="mt-1 text-[10px] text-zinc-600">
                  {series.num_books} book{series.num_books !== 1 ? "s" : ""}
                </p>
              </button>
            ))}
          </div>

          {/* Sidebar footer - user info */}
          <div className="border-t border-zinc-800 px-4 py-3">
            {authEmail && (
              <div className="flex flex-col gap-2">
                <span className="truncate text-[11px] text-zinc-500">{authEmail}</span>
                <button
                  onClick={async () => {
                    clearSeriesData();
                    setUserId(null);
                    setAuthEmail(null);
                    setSeriesList([]);
                    setSelectedSeriesId(null);
                    await supabase.auth.signOut();
                    window.location.href = "/login";
                  }}
                  className="rounded-full border border-zinc-700 px-3 py-1 text-[11px] text-zinc-400 transition hover:text-zinc-200"
                >
                  Sign out
                </button>
              </div>
            )}
            {userId ? (
              <span className="text-[10px] text-zinc-600">Signed in</span>
            ) : (
              <Link href="/login" className="text-[11px] underline text-zinc-400">
                Sign in to save series
              </Link>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
            {/* Mobile hamburger + header */}
            <header className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 transition hover:text-zinc-200 md:hidden"
                    aria-label="Open sidebar"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <line x1="2" y1="4" x2="16" y2="4" />
                      <line x1="2" y1="9" x2="16" y2="9" />
                      <line x1="2" y1="14" x2="16" y2="14" />
                    </svg>
                  </button>
                  <Link href="/" className="text-sm text-zinc-400">
                    ← Back to home
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {activeSeries && (
                    <Link
                      href={`/studio?seriesId=${activeSeries.id}&bookNumber=1`}
                      className="rounded-full border border-blue-500/60 px-3 py-1.5 text-xs font-medium text-blue-200 transition hover:bg-blue-500/10"
                    >
                      Open in Studio
                    </Link>
                  )}
                  <Link
                    href="/studio"
                    className="rounded-full border border-emerald-500/60 px-3 py-1 text-xs text-emerald-200"
                  >
                    Go to Studio
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-semibold">Series Mode</h1>
                {activeSeries && (
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs text-emerald-300">
                    {activeSeries.title}
                  </span>
                )}
              </div>
              <p className="text-zinc-300">
                Create series arcs and jump directly into book generation.
              </p>
            </header>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Create new series</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-1 rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400 transition hover:text-zinc-200"
            >
              {showCreateForm ? "Hide" : "New Series"}
            </button>
          </div>
          {showCreateForm && (
          <div className="mt-4 grid gap-4">
            <label className="flex flex-col gap-2 text-sm">
              Series title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm">
                Number of books
                <input
                  type="number"
                  value={numBooks}
                  onChange={(event) => setNumBooks(Number(event.target.value))}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                Model
                <select
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3"
                >
                  {modelOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "auto"
                        ? "🤖 Auto — best model per step"
                        : option.startsWith("qwen/")
                          ? `✨ ${option} (Qwen3/OpenRouter)`
                          : option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button
              onClick={createSeries}
              disabled={!title || loading}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create series & arc"}
            </button>
          </div>
          )}
          {!showCreateForm && activeSeries && (
            <p className="mt-2 text-xs text-zinc-500">
              Currently working on: <span className="text-zinc-300">{activeSeries.title}</span>. Click "New Series" to create another.
            </p>
          )}
        </section>

        {arc && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="text-xl font-semibold">Latest series arc</h2>
            <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-zinc-950/60 p-4 text-xs text-zinc-200">
              {JSON.stringify(arc, null, 2)}
            </pre>
          </section>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: "overview", label: "Overview" },
            { id: "characters", label: "Characters" },
            { id: "world", label: "World" },
            { id: "canon", label: "Canon" },
            { id: "mystery", label: "Mystery" },
            { id: "relationships", label: "Relationships" },
            { id: "plots", label: "Plots" },
            { id: "books", label: "Books" },
            { id: "memory", label: "Memory" },
            { id: "timeline", label: "Timeline" },
            { id: "logs", label: "Generation Logs" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 rounded-full border px-4 py-2.5 text-sm transition ${
                activeTab === tab.id
                  ? "border-white text-white"
                  : "border-zinc-700 text-zinc-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="text-xl font-semibold">Series suite</h2>
          <p className="text-sm text-zinc-400">
            Generate the series bible, map, character evolution, and book blueprint.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="text-xs text-zinc-300">
              Genre
              <input
                value={suiteGenre}
                onChange={(event) => setSuiteGenre(event.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                placeholder="Young Adult Fiction, Fantasy, Thriller..."
              />
            </label>
            <label className="text-xs text-zinc-300">
              Target Audience
              <input
                value={suiteTargetAudience}
                onChange={(event) => setSuiteTargetAudience(event.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                placeholder="13-18, Adult, Children..."
              />
            </label>
            <label className="text-xs text-zinc-300">
              Tone / Vibe
              <input
                value={suiteTone}
                onChange={(event) => setSuiteTone(event.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                placeholder="Emotional, dramatic, hopeful"
              />
            </label>
            <label className="text-xs text-zinc-300">
              Setting
              <input
                value={suiteSetting}
                onChange={(event) => setSuiteSetting(event.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                placeholder="Contemporary"
              />
            </label>
            <label className="text-xs text-zinc-300 md:col-span-2">
              Main Characters (comma-separated)
              <input
                value={suiteCharacters}
                onChange={(event) => setSuiteCharacters(event.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                placeholder="Character 1, Character 2"
              />
            </label>
            <label className="text-xs text-zinc-300 md:col-span-2">
              Core Conflict
              <input
                value={suiteCoreConflict}
                onChange={(event) => setSuiteCoreConflict(event.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                placeholder="A secret threatens to unravel everything"
              />
            </label>
            <label className="text-xs text-zinc-300 md:col-span-2">
              Themes
              <input
                value={suiteThemes}
                onChange={(event) => setSuiteThemes(event.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                placeholder="Coming of age, identity, relationships"
              />
            </label>
            <label className="text-xs text-zinc-300">
              Blueprint Book #
              <input
                type="number"
                min={1}
                value={suiteBookNumber}
                onChange={(event) =>
                  setSuiteBookNumber(Number(event.target.value) || 1)
                }
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
              />
            </label>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <button
              onClick={async () => {
                setLoadingStep("bible");
                setError(null);
                try {
                  if (!activeSeries) throw new Error("Create a series first");
                  const response = await fetch("/api/generate/series/bible", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      seriesId: activeSeries.id,
                      title: activeSeries.title,
                      genre: suiteGenre || "Fiction",
                      targetAge: suiteTargetAudience || "Adult",
                      tone: suiteTone,
                      setting: suiteSetting || description || "Contemporary",
                      mainCharacters: suiteCharacters,
                      coreConflict: suiteCoreConflict || description || "",
                      themes: suiteThemes,
                      numBooks: activeSeries.num_books,
                      model,
                    }),
                  });
                  if (!response.ok) throw new Error("Failed to generate series bible");
                  const data = await response.json();
                  setSeriesBible(data.bible ?? null);
                  if (activeSeries) {
                    // Save suite fields, world, and characters via server-side API (bypasses RLS)
                    const characterFiles = data.bible?.character_files ?? {};
                    const charRows = Object.entries(characterFiles).map(([name, info]) => ({
                      series_id: activeSeries.id,
                      name,
                      role: "Main",
                      description: (info as Record<string, unknown>)?.arc_summary ?? null,
                      arc: info,
                    }));
                    await fetch("/api/series/save-suite", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        seriesId: activeSeries.id,
                        suiteFields: {
                          tone: suiteTone || null,
                          genre: suiteGenre || null,
                          target_audience: suiteTargetAudience || null,
                          themes: suiteThemes ? suiteThemes.split(",").map((t: string) => t.trim()).filter(Boolean) : null,
                          main_conflict: suiteCoreConflict || null,
                          world_name: suiteSetting ? suiteSetting.split(" — ")[0] : null,
                          world_description: suiteSetting || null,
                        },
                        world: {
                          setting: suiteSetting,
                          rules: data.bible?.world_rules ?? null,
                          lore: data.bible?.history_lore ?? null,
                        },
                        characters: charRows,
                      }),
                    });
                  }
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Unknown error");
                } finally {
                  setLoadingStep(null);
                }
              }}
              className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
            >
              {loadingStep === "bible" ? "Generating..." : "Generate Series Bible"}
            </button>
            <button
              onClick={async () => {
                setLoadingStep("map");
                setError(null);
                try {
                  if (!activeSeries) throw new Error("Create a series first");
                  if (!userId) throw new Error("Please sign in");
                  const response = await fetch("/api/generate/series/map", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      seriesId: activeSeries.id,
                      title: activeSeries.title,
                      numBooks: activeSeries.num_books,
                      model,
                    }),
                  });
                  if (!response.ok) throw new Error("Failed to generate series map");
                  const data = await response.json();
                  setSeriesMap(data.maps ?? null);
                  // Server-side route now handles all database writes (series_books, novels, novel_id)
                  // Just use the returned books data to update state
                  if (data.books && data.books.length > 0) {
                    setSeriesBooks(data.books);
                    console.log(`[map-gen] Updated series state with ${data.books.length} books from server`);
                  }
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Unknown error");
                } finally {
                  setLoadingStep(null);
                }
              }}
              className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
            >
              {loadingStep === "map" ? "Generating..." : "Generate Series Map"}
            </button>
            <button
              onClick={async () => {
                setLoadingStep("evolution");
                setError(null);
                try {
                  if (!activeSeries) throw new Error("Create a series first");
                  const response = await fetch("/api/generate/series/evolution", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      seriesId: activeSeries.id,
                      numBooks: activeSeries.num_books,
                      characters: suiteCharacters
                        ? suiteCharacters.split(",").map((name) => name.trim())
                        : ["Main Character"],
                      model,
                    }),
                  });
                  if (!response.ok) throw new Error("Failed to generate evolution");
                  const data = await response.json();
                  setCharacterEvolution(data.evolution ?? null);
                  if (activeSeries) {
                    // Save to series_memory via server-side API (bypasses RLS)
                    await fetch("/api/series/memory/save", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        seriesId: activeSeries.id,
                        category: "character_evolution",
                        content: JSON.stringify(data.evolution ?? {}),
                      }),
                    });
                  }
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Unknown error");
                } finally {
                  setLoadingStep(null);
                }
              }}
              className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
            >
              {loadingStep === "evolution" ? "Generating..." : "Generate Character Evolution"}
            </button>
            <button
              onClick={async () => {
                setLoadingStep("blueprint");
                setError(null);
                try {
                  if (!activeSeries) throw new Error("Create a series first");
                  const response = await fetch("/api/generate/series/blueprint", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      seriesId: activeSeries.id,
                      title: activeSeries.title,
                      numBooks: activeSeries.num_books,
                      bookNumber: suiteBookNumber,
                      model,
                    }),
                  });
                  if (!response.ok) throw new Error("Failed to generate blueprint");
                  const data = await response.json();
                  setBookBlueprint(data.blueprint ?? null);
                  if (activeSeries) {
                    // Save to series_memory via server-side API (bypasses RLS)
                    await fetch("/api/series/memory/save", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        seriesId: activeSeries.id,
                        category: `book_${suiteBookNumber}_blueprint`,
                        content: JSON.stringify(data.blueprint ?? {}),
                      }),
                    });
                  }
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Unknown error");
                } finally {
                  setLoadingStep(null);
                }
              }}
              className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
            >
              {loadingStep === "blueprint" ? "Generating..." : "Generate Book Blueprint"}
            </button>
            <button
              onClick={async () => {
                if (!activeSeries) return;
                setLoadingStep("all-blueprints");
                setError(null);
                try {
                  const totalBooks = activeSeries.num_books || 1;
                  const generatedBlueprints: Record<string, unknown>[] = [];
                  for (let bn = 1; bn <= totalBooks; bn++) {
                    setStatusMessage(`Generating blueprint for Book ${bn} of ${totalBooks}...`);
                    const response = await fetch("/api/generate/series/blueprint", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        seriesId: activeSeries.id,
                        title: activeSeries.title,
                        numBooks: totalBooks,
                        bookNumber: bn,
                        model,
                      }),
                    });
                    if (!response.ok) throw new Error(`Failed to generate blueprint for Book ${bn}`);
                    const data = await response.json();
                    generatedBlueprints.push({
                      book_number: bn,
                      blueprint: data.blueprint ?? null,
                    });
                  }
                  setStatusMessage(null);
                  // Reload all blueprints from DB
                  if (activeSeries) {
                    await selectSeries(activeSeries.id);
                  }
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Unknown error");
                } finally {
                  setLoadingStep(null);
                  setStatusMessage(null);
                }
              }}
              disabled={loadingStep === "all-blueprints"}
              className="rounded-full border border-emerald-700/60 px-4 py-2.5 text-sm text-emerald-200 transition hover:bg-emerald-700/10 disabled:opacity-50"
            >
              {loadingStep === "all-blueprints" ? (statusMessage || "Generating all...") : "Generate All Blueprints"}
            </button>
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-zinc-100">Tension Curve</h3>
                <span className="text-[10px] text-zinc-500">Auto-generated</span>
              </div>
              <div className="mt-3 h-32 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                <svg viewBox="0 0 100 40" className="h-full w-full">
                  {tensionCurveData.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="1.5"
                      points={tensionCurveData
                        .map((point, index) => {
                          const x = (index / (tensionCurveData.length - 1)) * 100;
                          const maxScore = Math.max(
                            ...tensionCurveData.map((item) => item.score),
                            1
                          );
                          const y = 36 - (point.score / maxScore) * 30;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                    />
                  )}
                  {tensionCurveData.map((point, index) => {
                    const x =
                      tensionCurveData.length > 1
                        ? (index / (tensionCurveData.length - 1)) * 100
                        : 50;
                    const maxScore = Math.max(
                      ...tensionCurveData.map((item) => item.score),
                      1
                    );
                    const y = 36 - (point.score / maxScore) * 30;
                    return (
                      <circle
                        key={point.book}
                        cx={x}
                        cy={y}
                        r="1.8"
                        fill="#facc15"
                      />
                    );
                  })}
                </svg>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-zinc-400">
                {tensionCurveData.map((point) => (
                  <span key={point.book}>
                    {String(seriesBooks.find(b => Number(b.book_number) === point.book)?.title ?? `Book ${point.book}`)}: {point.score}
                  </span>
                ))}
              </div>
            </div>
            {seriesBible && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
                <h3 className="text-sm font-semibold text-zinc-100">Series Bible</h3>
                <pre className="mt-2 whitespace-pre-wrap text-xs text-zinc-200">
                  {JSON.stringify(seriesBible, null, 2)}
                </pre>
              </div>
            )}
            {seriesBooks.length > 0 && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
                <h3 className="text-sm font-semibold text-zinc-100">Series Books</h3>
                <div className="mt-3 space-y-3">
                  {seriesBooks.map((book) => (
                    <div
                      key={String(book.id)}
                      className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-200"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-zinc-100">
                            {String(book.title ?? "Untitled")}
                          </p>
                          <p className="text-xs text-zinc-400">
                            Book {String(book.book_number ?? "?")}
                          </p>
                          <p className="text-xs text-zinc-400">
                            Status: {String(book.status ?? "draft")}
                          </p>
                        </div>
                        <Link
                          href={`/studio?seriesId=${book.series_id}&bookNumber=${book.book_number}`}
                          className="rounded-full border border-blue-500/40 px-3 py-1 text-[10px] text-blue-200 transition hover:bg-blue-500/10"
                        >
                          Open in Studio
                        </Link>
                      </div>
                      {Boolean(book.summary) && (
                        <p className="mt-2 text-xs text-zinc-300">
                          {String(book.summary)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {seriesMap && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
                <h3 className="text-sm font-semibold text-zinc-100">Series Map</h3>
                {activeSeries && Array.isArray(seriesMap) && seriesMap.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {seriesMap.map((mapItem: Record<string, unknown>, idx: number) => (
                      <Link
                        key={idx}
                        href={`/studio?seriesId=${activeSeries.id}&bookNumber=${mapItem.book_number ?? idx + 1}`}
                        className="rounded-full border border-blue-500/40 px-3 py-1 text-[10px] text-blue-200 transition hover:bg-blue-500/10"
                      >
                        {String((mapItem.map_data as Record<string, unknown>)?.title ?? (mapItem as Record<string, unknown>).title ?? `Book ${mapItem.book_number ?? idx + 1}`)} → Studio
                      </Link>
                    ))}
                  </div>
                )}
                <pre className="mt-2 whitespace-pre-wrap text-xs text-zinc-200">
                  {JSON.stringify(seriesMap, null, 2)}
                </pre>
              </div>
            )}
            {characterEvolution && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
                <h3 className="text-sm font-semibold text-zinc-100">Character Evolution</h3>
                <pre className="mt-2 whitespace-pre-wrap text-xs text-zinc-200">
                  {JSON.stringify(characterEvolution, null, 2)}
                </pre>
              </div>
            )}
            {allBlueprints.length > 0 && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-zinc-100">Book Blueprints ({allBlueprints.length})</h3>
                  <div className="flex gap-1">
                    {allBlueprints.map((bp: Record<string, unknown>) => {
                      const bpNum = Number(bp.book_number ?? 0);
                      const isActive = bookBlueprint && Number((bookBlueprint as Record<string, unknown>).book_number ?? 0) === bpNum;
                      return (
                        <button
                          key={bpNum}
                          onClick={() => {
                            setBookBlueprint(bp);
                            setSuiteBookNumber(bpNum);
                          }}
                          className={`rounded px-2 py-0.5 text-[10px] transition ${
                            isActive
                              ? "bg-blue-600 text-white"
                              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                          }`}
                        >
                          {String(seriesBooks.find(b => Number(b.book_number) === bpNum)?.title ?? `Book ${bpNum}`)}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {bookBlueprint && (
                  <pre className="mt-2 whitespace-pre-wrap text-xs text-zinc-200">
                    {JSON.stringify(
                      bookBlueprint.blueprint ?? bookBlueprint,
                      null,
                      2
                    )}
                  </pre>
                )}
              </div>
            )}
            {allBlueprints.length === 0 && bookBlueprint && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
                <h3 className="text-sm font-semibold text-zinc-100">Book Blueprint</h3>
                <pre className="mt-2 whitespace-pre-wrap text-xs text-zinc-200">
                  {JSON.stringify(bookBlueprint, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </section>
        )}

        {activeTab === "characters" && (
          <CharactersTab
            characters={seriesCharacters.map((c) => ({
              id: String(c.id ?? ""),
              name: String(c.name ?? ""),
              role: String(c.role ?? "supporting"),
              age: c.age != null ? String(c.age) : null,
              gender: c.gender != null ? String(c.gender) : null,
              appearance: c.appearance ?? null,
              personality: c.personality ?? null,
              backstory: c.backstory != null ? String(c.backstory) : null,
              description: c.description != null ? String(c.description) : null,
              motivation: c.motivation != null ? String(c.motivation) : null,
              conflict: c.conflict != null ? String(c.conflict) : null,
              core_desire: c.core_desire != null ? String(c.core_desire) : null,
              big_fear: c.big_fear != null ? String(c.big_fear) : null,
              hidden_secret: c.hidden_secret != null ? String(c.hidden_secret) : null,
              start_state: c.start_state != null ? String(c.start_state) : null,
              end_state: c.end_state != null ? String(c.end_state) : null,
              growth_arc: c.growth_arc ?? null,
              arc: c.arc ?? null,
              arc_stages: Array.isArray(c.arc_stages) ? c.arc_stages : null,
              voice_profile: c.voice_profile ?? null,
              emotional_memory: c.emotional_memory ?? null,
              knowledge_timeline: c.knowledge_timeline ?? null,
              relationships: c.relationships ?? null,
              introduced_in_book: typeof c.introduced_in_book === "number" ? c.introduced_in_book : null,
              introduced_in_chapter: typeof c.introduced_in_chapter === "number" ? c.introduced_in_chapter : null,
              is_fully_developed: typeof c.is_fully_developed === "boolean" ? c.is_fully_developed : null,
            }))}
            relationships={seriesMemory.filter((entry) => {
              // Only pass relationship entries to the CharactersTab
              const cat = String(entry.category ?? "").toLowerCase();
              return cat === "relationship" || !!entry.character_a_name || !!entry.character_b_name;
            }).map((entry) => ({
              id: String(entry.id ?? ""),
              character_a_name: entry.character_a_name != null ? String(entry.character_a_name) : undefined,
              character_b_name: entry.character_b_name != null ? String(entry.character_b_name) : undefined,
              relationship_type: entry.relationship_type != null ? String(entry.relationship_type) : undefined,
              status: entry.status != null ? String(entry.status) : undefined,
              trust_level: typeof entry.trust_level === "number" ? entry.trust_level : undefined,
              tension_level: typeof entry.tension_level === "number" ? entry.tension_level : undefined,
            }))}
            seriesId={activeSeries?.id ?? ""}
            onRefresh={async () => {
              if (!activeSeries) return;
              const response = await fetch(
                `/api/series/characters?seriesId=${activeSeries.id}`
              );
              const data = await response.json();
              setSeriesCharacters(data.characters ?? []);
            }}
            onCharacterUpdated={(updatedChar) => {
              setSeriesCharacters((prev) =>
                prev.map((c) => (String(c.id) === String(updatedChar.id) ? updatedChar as unknown as typeof c : c))
              );
            }}
          />
        )}

        {activeTab === "world" && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">World</h2>
                <p className="text-sm text-zinc-400">
                  Track world rules, lore, and settings.
                </p>
              </div>
              <button
                onClick={async () => {
                  if (!activeSeries) return;
                  const response = await fetch(
                    `/api/series/world?seriesId=${activeSeries.id}`
                  );
                  const data = await response.json();
                  const w = data.world;
                  setSeriesWorld(w ?? null);
                  setWorldSummaryDraft(String(w?.summary ?? ""));
                  setWorldSettingDraft(String(w?.setting ?? ""));
                  // rules/lore may come back as objects (jsonb) — normalize to string
                  const rulesVal = w?.rules;
                  const loreVal = w?.lore;
                  setWorldRulesDraft(
                    typeof rulesVal === "object" && rulesVal !== null
                      ? JSON.stringify(rulesVal, null, 2)
                      : String(rulesVal ?? "")
                  );
                  setWorldLoreDraft(
                    typeof loreVal === "object" && loreVal !== null
                      ? JSON.stringify(loreVal, null, 2)
                      : String(loreVal ?? "")
                  );
                }}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
              >
                Refresh World
              </button>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="space-y-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <p className="text-xs uppercase text-zinc-400">World Summary</p>
                  <textarea
                    value={worldSummaryDraft}
                    onChange={(event) => setWorldSummaryDraft(event.target.value)}
                    className="mt-2 min-h-[120px] w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-zinc-100"
                    placeholder="A brief overview of your world — its core concept, tone, and what makes it unique."
                  />
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <p className="text-xs uppercase text-zinc-400">Setting</p>
                  <textarea
                    value={worldSettingDraft}
                    onChange={(event) => setWorldSettingDraft(event.target.value)}
                    className="mt-2 min-h-[120px] w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-zinc-100"
                    placeholder="City, era, cultural context"
                  />
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <p className="text-xs uppercase text-zinc-400">Rules & Constraints</p>
                  <textarea
                    value={worldRulesDraft}
                    onChange={(event) => setWorldRulesDraft(event.target.value)}
                    className="mt-2 min-h-[120px] w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-zinc-100"
                    placeholder="Rules, limitations, systems"
                  />
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <p className="text-xs uppercase text-zinc-400">Lore & History</p>
                  <textarea
                    value={worldLoreDraft}
                    onChange={(event) => setWorldLoreDraft(event.target.value)}
                    className="mt-2 min-h-[120px] w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-zinc-100"
                    placeholder="Lore, myths, historical anchors"
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!activeSeries) return;
                    await fetch("/api/series/world", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        seriesId: activeSeries.id,
                        summary: worldSummaryDraft,
                        setting: worldSettingDraft,
                        rules: worldRulesDraft,
                        lore: worldLoreDraft,
                      }),
                    });
                    const response = await fetch(
                      `/api/series/world?seriesId=${activeSeries.id}`
                    );
                    const data = await response.json();
                    const w = data.world;
                    setSeriesWorld(w ?? null);
                    setWorldSummaryDraft(String(w?.summary ?? ""));
                    setWorldSettingDraft(String(w?.setting ?? ""));
                    const rulesVal = w?.rules;
                    const loreVal = w?.lore;
                    setWorldRulesDraft(
                      typeof rulesVal === "object" && rulesVal !== null
                        ? JSON.stringify(rulesVal, null, 2)
                        : String(rulesVal ?? "")
                    );
                    setWorldLoreDraft(
                      typeof loreVal === "object" && loreVal !== null
                        ? JSON.stringify(loreVal, null, 2)
                        : String(loreVal ?? "")
                    );
                  }}
                  className="rounded-full border border-emerald-500/60 px-4 py-2.5 text-sm text-emerald-200"
                >
                  Save World Overview
                </button>
              </div>

              <div className="space-y-3">
                {/* Add Element Form */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                  <p className="text-xs uppercase text-emerald-300 font-semibold">Add World Element</p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Track locations, magic systems, artifacts, factions, and other world details.
                  </p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-[10px] uppercase text-zinc-500">Type</label>
                      <select
                        value={newElementType}
                        onChange={(e) => setNewElementType(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                      >
                        <option value="location">Location</option>
                        <option value="magic_system">Magic System</option>
                        <option value="artifact">Artifact</option>
                        <option value="faction">Faction</option>
                        <option value="creature">Creature</option>
                        <option value="technology">Technology</option>
                        <option value="culture">Culture</option>
                        <option value="religion">Religion</option>
                        <option value="language">Language</option>
                        <option value="event">Historical Event</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-zinc-500">Name</label>
                      <input
                        value={newElementName}
                        onChange={(e) => setNewElementName(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                        placeholder="e.g. The Crystal Caverns"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="text-[10px] uppercase text-zinc-500">Description</label>
                    <textarea
                      value={newElementDescription}
                      onChange={(e) => setNewElementDescription(e.target.value)}
                      className="mt-1 min-h-[80px] w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                      placeholder="Describe this world element — its purpose, history, rules..."
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap items-end gap-3">
                    <div>
                      <label className="text-[10px] uppercase text-zinc-500">Importance</label>
                      <select
                        value={newElementImportance}
                        onChange={(e) => setNewElementImportance(e.target.value)}
                        className="mt-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                      >
                        <option value="low">Low</option>
                        <option value="moderate">Moderate</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-zinc-500">Introduced in Book</label>
                      <select
                        value={newElementIntroducedBook}
                        onChange={(e) => setNewElementIntroducedBook(Number(e.target.value))}
                        className="mt-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                      >
                        <option value={0}>Not set</option>
                        {seriesBooks.map((book) => (
                          <option key={String(book.id)} value={Number(book.book_number)}>
                            Book {String(book.book_number)} — {String(book.title ?? "Untitled")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={async () => {
                        if (!activeSeries || !newElementName.trim()) return;
                        await fetch("/api/series/world-elements", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            seriesId: activeSeries.id,
                            type: newElementType,
                            name: newElementName.trim(),
                            description: newElementDescription.trim(),
                            importance: newElementImportance,
                            introduced_in_book: newElementIntroducedBook > 0 ? newElementIntroducedBook : null,
                          }),
                        });
                        setNewElementName("");
                        setNewElementDescription("");
                        setNewElementImportance("moderate");
                        setNewElementIntroducedBook(0);
                        const response = await fetch(
                          `/api/series/world-elements?seriesId=${activeSeries.id}`
                        );
                        const data = await response.json();
                        setWorldElements(data.elements ?? []);
                      }}
                      disabled={!newElementName.trim()}
                      className="rounded-full border border-emerald-500/60 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Add Element
                    </button>
                  </div>
                </div>

                {/* Element Cards */}
                {worldElements.length === 0 && (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-6 text-center">
                    <p className="text-sm text-zinc-400">No world elements yet.</p>
                    <p className="mt-1 text-xs text-zinc-500">Add locations, magic systems, artifacts, and more above.</p>
                  </div>
                )}
                {worldElements.length > 0 && (
                  <div className="grid gap-3 md:grid-cols-1">
                    {worldElements.map((element) => {
                      const isEditing: boolean = editingElementId === String(element.id);
                      const importanceColor =
                        String(element.importance) === "high"
                          ? "border-red-500/40 text-red-200"
                          : String(element.importance) === "low"
                            ? "border-zinc-600 text-zinc-400"
                            : "border-amber-500/40 text-amber-200";
                      const typeLabel = String(element.type ?? "other").replace(/_/g, " ");
                      const bookNum = Number(element.introduced_in_book ?? 0);
                      const bookTitle = bookNum > 0
                        ? seriesBooks.find((b) => Number(b.book_number) === bookNum)
                        : null;
                      return (
                        <div
                          key={String(element.id)}
                          className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-zinc-100">
                                {String(element.name ?? "Unnamed")}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                <span className="rounded-full border border-blue-500/40 px-2 py-0.5 text-[10px] text-blue-200 capitalize">
                                  {typeLabel}
                                </span>
                                <span className={`rounded-full border px-2 py-0.5 text-[10px] capitalize ${importanceColor}`}>
                                  {String(element.importance ?? "moderate")}
                                </span>
                                {bookNum > 0 && (
                                  <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] text-zinc-400">
                                    Book {bookNum}{bookTitle ? ` — ${String(bookTitle.title ?? "")}` : ""}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button
                                onClick={() => {
                                  if (isEditing) {
                                    setEditingElementId(null);
                                  } else {
                                    setEditingElementId(String(element.id));
                                    setEditingElementName(String(element.name ?? ""));
                                    setEditingElementType(String(element.type ?? "other"));
                                    setEditingElementDescription(String(element.description ?? ""));
                                    setEditingElementImportance(String(element.importance ?? "moderate"));
                                    setEditingElementIntroducedBook(Number(element.introduced_in_book ?? 0));
                                  }
                                }}
                                className="rounded border border-zinc-700 px-2 py-1 text-[10px] text-zinc-300 transition hover:border-zinc-500"
                              >
                                {isEditing ? "Cancel" : "Edit"}
                              </button>
                              <button
                                onClick={async () => {
                                  if (!activeSeries) return;
                                  setPendingDelete({
                                    id: String(element.id),
                                    endpoint: "/api/series/world-elements/delete",
                                    refresh: async () => {
                                      const response = await fetch(
                                        `/api/series/world-elements?seriesId=${activeSeries.id}`
                                      );
                                      const data = await response.json();
                                      setWorldElements(data.elements ?? []);
                                    },
                                  });
                                }}
                                className="rounded border border-red-500/30 px-2 py-1 text-[10px] text-red-300 transition hover:bg-red-500/10"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          {isEditing ? (
                            <div className="mt-3 space-y-2">
                              <div className="grid gap-2 md:grid-cols-2">
                                <div>
                                  <label className="text-[10px] uppercase text-zinc-500">Name</label>
                                  <input
                                    value={editingElementName}
                                    onChange={(e) => setEditingElementName(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] uppercase text-zinc-500">Type</label>
                                  <select
                                    value={editingElementType}
                                    onChange={(e) => setEditingElementType(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                                  >
                                    <option value="location">Location</option>
                                    <option value="magic_system">Magic System</option>
                                    <option value="artifact">Artifact</option>
                                    <option value="faction">Faction</option>
                                    <option value="creature">Creature</option>
                                    <option value="technology">Technology</option>
                                    <option value="culture">Culture</option>
                                    <option value="religion">Religion</option>
                                    <option value="language">Language</option>
                                    <option value="event">Historical Event</option>
                                    <option value="other">Other</option>
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className="text-[10px] uppercase text-zinc-500">Description</label>
                                <textarea
                                  value={editingElementDescription}
                                  onChange={(e) => setEditingElementDescription(e.target.value)}
                                  className="mt-1 min-h-[80px] w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                                />
                              </div>
                              <div className="flex flex-wrap items-center gap-3">
                                <div>
                                  <label className="text-[10px] uppercase text-zinc-500">Importance</label>
                                  <select
                                    value={editingElementImportance}
                                    onChange={(e) => setEditingElementImportance(e.target.value)}
                                    className="mt-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                                  >
                                    <option value="low">Low</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="high">High</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] uppercase text-zinc-500">Introduced in Book</label>
                                  <select
                                    value={editingElementIntroducedBook}
                                    onChange={(e) => setEditingElementIntroducedBook(Number(e.target.value))}
                                    className="mt-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                                  >
                                    <option value={0}>Not set</option>
                                    {seriesBooks.map((book) => (
                                      <option key={String(book.id)} value={Number(book.book_number)}>
                                        Book {String(book.book_number)} — {String(book.title ?? "Untitled")}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <button
                                  onClick={async () => {
                                    if (!activeSeries) return;
                                    await fetch("/api/series/world-elements/update", {
                                      method: "PUT",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        id: editingElementId,
                                        name: editingElementName.trim(),
                                        type: editingElementType,
                                        description: editingElementDescription.trim(),
                                        importance: editingElementImportance,
                                        introduced_in_book: editingElementIntroducedBook > 0 ? editingElementIntroducedBook : null,
                                      }),
                                    });
                                    setEditingElementId(null);
                                    const response = await fetch(
                                      `/api/series/world-elements?seriesId=${activeSeries.id}`
                                    );
                                    const data = await response.json();
                                    setWorldElements(data.elements ?? []);
                                  }}
                                  className="rounded-full border border-emerald-500/60 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/10"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            String(element.description ?? "").trim().length > 0 ? (
                              <p className="mt-2 text-xs text-zinc-300 leading-relaxed">
                                {String(element.description)}
                              </p>
                            ) : null
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "canon" && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="text-xl font-semibold">Canon Log</h2>
            <p className="text-sm text-zinc-400">
              Canon facts that must never change. Locked facts (🔒) are passed
              to the writing pipeline as immutable constraints.
            </p>

            {/* ─── Add Form ─────────────────────────────────────────── */}
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-xs text-zinc-300">
                Category
                <select
                  value={canonCategory}
                  onChange={(event) => setCanonCategory(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                >
                  <option value="world">World</option>
                  <option value="character">Character</option>
                  <option value="event">Event</option>
                  <option value="rule">Rule</option>
                </select>
              </label>
              <label className="text-xs text-zinc-300">
                Source
                <input
                  value={canonSource}
                  onChange={(event) => setCanonSource(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                  placeholder="Book 1, Chapter 3"
                />
              </label>
              <label className="text-xs text-zinc-300 md:col-span-2">
                Canon fact
                <textarea
                  value={canonFact}
                  onChange={(event) => setCanonFact(event.target.value)}
                  className="min-h-[100px] rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-zinc-300 md:col-span-2">
                <input
                  type="checkbox"
                  checked={canonLocked}
                  onChange={(event) => setCanonLocked(event.target.checked)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-950"
                />
                <span>
                  🔒 Locked (cannot change) — the writing pipeline will treat
                  this as an immutable constraint. Unchecked = soft canon
                  (advisory only).
                </span>
              </label>
            </div>

            {/* ─── Filter Bar ───────────────────────────────────────── */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="text-xs text-zinc-300">
                Filter
                <select
                  value={canonFilter}
                  onChange={(event) => setCanonFilter(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                >
                  <option value="all">All</option>
                  <option value="world">World</option>
                  <option value="character">Character</option>
                  <option value="event">Event</option>
                  <option value="rule">Rule</option>
                </select>
              </label>
              <label className="text-xs text-zinc-300">
                Search
                <input
                  value={canonSearch}
                  onChange={(event) => setCanonSearch(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                />
              </label>
              <button
                onClick={async () => {
                  if (!activeSeries || !canonFact) return;
                  await fetch("/api/series/canon", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      seriesId: activeSeries.id,
                      category: canonCategory,
                      fact: canonFact,
                      source: canonSource,
                      cannot_change: canonLocked,
                    }),
                  });
                  setCanonFact("");
                  setCanonSource("");
                  await refreshCanonOnly();
                }}
                className="rounded-full border border-emerald-500/60 px-4 py-2.5 text-sm text-emerald-200"
              >
                Add Canon Fact
              </button>
              <button
                onClick={() => {
                  setCanonFilter("all");
                  setCanonSearch("");
                  setSelectedCanonIds(new Set());
                }}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
              >
                Clear Filters
              </button>
              <button
                onClick={refreshCanonOnly}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
              >
                Refresh Canon
              </button>
            </div>

            {/* ─── Bulk Actions Bar (shown when items are selected) ─── */}
            {selectedCanonIds.size > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-xs">
                <span className="font-semibold text-amber-200">
                  {selectedCanonIds.size} selected
                </span>
                <button
                  onClick={async () => {
                    const ids = Array.from(selectedCanonIds);
                    await Promise.all(
                      ids.map((id) =>
                        fetch("/api/series/canon/delete", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id }),
                        })
                      )
                    );
                    setSelectedCanonIds(new Set());
                    await refreshCanonOnly();
                  }}
                  className="rounded-full border border-rose-500/60 px-3 py-1.5 text-[11px] text-rose-200"
                >
                  Delete {selectedCanonIds.size} selected
                </button>
                <label className="flex items-center gap-2 text-zinc-300">
                  Recategorize to:
                  <select
                    value={bulkCanonCategory}
                    onChange={(event) => setBulkCanonCategory(event.target.value)}
                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs"
                  >
                    <option value="world">World</option>
                    <option value="character">Character</option>
                    <option value="event">Event</option>
                    <option value="rule">Rule</option>
                  </select>
                </label>
                <button
                  onClick={async () => {
                    const ids = Array.from(selectedCanonIds);
                    await Promise.all(
                      ids.map((id) =>
                        fetch("/api/series/canon/update", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            id,
                            category: bulkCanonCategory,
                          }),
                        })
                      )
                    );
                    setSelectedCanonIds(new Set());
                    await refreshCanonOnly();
                  }}
                  className="rounded-full border border-zinc-700 px-3 py-1.5 text-[11px]"
                >
                  Apply
                </button>
                <button
                  onClick={() => setSelectedCanonIds(new Set())}
                  className="ml-auto rounded-full border border-zinc-700 px-3 py-1.5 text-[11px]"
                >
                  Clear selection
                </button>
              </div>
            )}

            {/* ─── Select All + Count ───────────────────────────────── */}
            {filteredCanon.length > 0 && (
              <div className="mt-4 flex items-center gap-3 text-xs text-zinc-400">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={
                      filteredCanon.length > 0 &&
                      filteredCanon.every((e) =>
                        selectedCanonIds.has(String(e.id ?? ""))
                      )
                    }
                    onChange={(event) => {
                      if (event.target.checked) {
                        setSelectedCanonIds(
                          new Set(
                            filteredCanon.map((e) => String(e.id ?? ""))
                          )
                        );
                      } else {
                        setSelectedCanonIds(new Set());
                      }
                    }}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-950"
                  />
                  Select all ({filteredCanon.length})
                </label>
              </div>
            )}

            {/* ─── Entry List ───────────────────────────────────────── */}
            <div className="mt-4 space-y-3">
              {filteredCanon.length === 0 ? (
                <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-950/40 p-8 text-center text-sm text-zinc-500">
                  {seriesMemory.some((e) => e.fact != null)
                    ? "No canon entries match your filter. Try clearing the filter or search."
                    : "No canon facts yet. Add one above to start enforcing continuity across your series."}
                </div>
              ) : (
                filteredCanon.map((entry) => {
                  const entryId = String(entry.id ?? "");
                  const isSelected = selectedCanonIds.has(entryId);
                  const isLocked = entry.cannot_change !== false && entry.cannot_change !== null;
                  const category = String(entry.category ?? "fact");
                  // Color-coded category badge
                  const categoryColor =
                    category === "world"
                      ? "border-emerald-500/60 text-emerald-300 bg-emerald-500/10"
                      : category === "character"
                        ? "border-blue-500/60 text-blue-300 bg-blue-500/10"
                        : category === "event"
                          ? "border-purple-500/60 text-purple-300 bg-purple-500/10"
                          : category === "rule"
                            ? "border-amber-500/60 text-amber-300 bg-amber-500/10"
                            : "border-zinc-700 text-zinc-300";
                  // Format created_at
                  const createdAt = entry.created_at
                    ? new Date(String(entry.created_at)).toLocaleDateString(
                        undefined,
                        { year: "numeric", month: "short", day: "numeric" }
                      )
                    : null;

                  return (
                    <div
                      key={entryId}
                      className={`rounded-lg border p-4 text-xs text-zinc-200 transition-colors ${
                        isSelected
                          ? "border-amber-500/50 bg-amber-500/5"
                          : "border-zinc-800 bg-zinc-950/60"
                      }`}
                    >
                      {/* Header row: checkbox + badge + lock + source + date */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(event) => {
                            setSelectedCanonIds((prev) => {
                              const next = new Set(prev);
                              if (event.target.checked) next.add(entryId);
                              else next.delete(entryId);
                              return next;
                            });
                          }}
                          className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-950"
                        />
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${categoryColor}`}
                            >
                              {category}
                            </span>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] ${
                                isLocked
                                  ? "border-rose-500/50 text-rose-300 bg-rose-500/10"
                                  : "border-zinc-600 text-zinc-400"
                              }`}
                              title={
                                isLocked
                                  ? "Locked — pipeline treats this as immutable"
                                  : "Soft canon — advisory only"
                              }
                            >
                              {isLocked ? "🔒 Locked" : "🔓 Soft"}
                            </span>
                            {String(entry.source ?? "").trim() && (
                              <span className="text-zinc-500">
                                📖 {String(entry.source)}
                              </span>
                            )}
                            {createdAt && (
                              <span className="text-zinc-600">
                                📅 {createdAt}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Edit mode or display mode */}
                      {editingCanonId === entryId ? (
                        <div className="mt-3 space-y-2 pl-7">
                          <select
                            value={editingCanonCategory}
                            onChange={(event) => setEditingCanonCategory(event.target.value)}
                            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                          >
                            <option value="world">World</option>
                            <option value="character">Character</option>
                            <option value="event">Event</option>
                            <option value="rule">Rule</option>
                          </select>
                          <textarea
                            value={editingCanonFact}
                            onChange={(event) => setEditingCanonFact(event.target.value)}
                            className="min-h-[80px] w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                          />
                          <input
                            value={editingCanonSource}
                            onChange={(event) => setEditingCanonSource(event.target.value)}
                            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                            placeholder="Source (e.g. Book 1, Chapter 3)"
                          />
                          <label className="flex items-center gap-2 text-xs text-zinc-300">
                            <input
                              type="checkbox"
                              checked={editingCanonLocked}
                              onChange={(event) => setEditingCanonLocked(event.target.checked)}
                              className="h-4 w-4 rounded border-zinc-700 bg-zinc-950"
                            />
                            🔒 Locked (cannot change)
                          </label>
                        </div>
                      ) : (
                        <p className="mt-2 pl-7 text-xs">{String(entry.fact ?? "")}</p>
                      )}

                      {/* Action buttons */}
                      <div className="mt-3 flex flex-wrap gap-2 pl-7">
                        {editingCanonId === entryId ? (
                          <>
                            <button
                              onClick={async () => {
                                await fetch("/api/series/canon/update", {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    id: entryId,
                                    fact: editingCanonFact,
                                    category: editingCanonCategory,
                                    source: editingCanonSource,
                                    cannot_change: editingCanonLocked,
                                  }),
                                });
                                setEditingCanonId(null);
                                await refreshCanonOnly();
                              }}
                              className="rounded-full border border-emerald-500/60 px-3 py-1 text-[10px] text-emerald-200"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingCanonId(null)}
                              className="rounded-full border border-zinc-700 px-3 py-1 text-[10px]"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingCanonId(entryId);
                                setEditingCanonFact(String(entry.fact ?? ""));
                                setEditingCanonCategory(String(entry.category ?? "world"));
                                setEditingCanonSource(String(entry.source ?? ""));
                                setEditingCanonLocked(
                                  entry.cannot_change !== false && entry.cannot_change !== null
                                );
                              }}
                              className="rounded-full border border-zinc-700 px-3 py-1 text-[10px]"
                            >
                              Edit
                            </button>
                            {/* Quick lock/unlock toggle without entering edit mode */}
                            <button
                              onClick={async () => {
                                await fetch("/api/series/canon/update", {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    id: entryId,
                                    cannot_change: !isLocked,
                                  }),
                                });
                                await refreshCanonOnly();
                              }}
                              className="rounded-full border border-zinc-700 px-3 py-1 text-[10px]"
                              title={isLocked ? "Unlock (make soft canon)" : "Lock (make immutable)"}
                            >
                              {isLocked ? "🔓 Unlock" : "🔒 Lock"}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() =>
                            setPendingDelete({
                              id: entryId,
                              endpoint: "/api/series/canon/delete",
                              refresh: refreshCanonOnly,
                            })
                          }
                          className="rounded-full border border-rose-500/40 px-3 py-1 text-[10px] text-rose-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {activeTab === "mystery" && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="text-xl font-semibold">Mystery Log</h2>
            <p className="text-sm text-zinc-400">
              Secrets and clues across the series. Secrets hold the truth; clues are the breadcrumbs readers follow toward reveal.
            </p>

            {/* ─── Secret form (full schema) ─────────────────────────────────── */}
            <details className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
              <summary className="cursor-pointer text-sm font-medium text-zinc-200">
                + Add Secret
              </summary>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="text-xs text-zinc-300">
                  Title <span className="text-rose-400">*</span>
                  <input
                    value={mysteryTitle}
                    onChange={(event) => setMysteryTitle(event.target.value)}
                    placeholder="e.g. The Veil opens only on full moons"
                    className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                  />
                </label>
                <label className="text-xs text-zinc-300">
                  Status
                  <select
                    value={mysterySecretStatus}
                    onChange={(event) => setMysterySecretStatus(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                  >
                    <option value="hidden">Hidden</option>
                    <option value="partial">Partial (some hints dropped)</option>
                    <option value="revealed">Revealed</option>
                  </select>
                </label>
                <label className="text-xs text-zinc-300 md:col-span-2">
                  Description <span className="text-rose-400">*</span>
                  <textarea
                    value={mysteryDescription}
                    onChange={(event) => setMysteryDescription(event.target.value)}
                    placeholder="What is the secret truth?"
                    className="min-h-[80px] rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                  />
                </label>
                <label className="text-xs text-zinc-300">
                  Who knows (comma-separated)
                  <input
                    value={mysteryWhoKnows}
                    onChange={(event) => setMysteryWhoKnows(event.target.value)}
                    placeholder="e.g. Mara, the Council"
                    className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                  />
                </label>
                <label className="text-xs text-zinc-300">
                  Who doesn&apos;t know (comma-separated)
                  <input
                    value={mysteryWhoDoesntKnow}
                    onChange={(event) => setMysteryWhoDoesntKnow(event.target.value)}
                    placeholder="e.g. the general public"
                    className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                  />
                </label>
                <label className="text-xs text-zinc-300">
                  Reveal in book #
                  <input
                    type="number"
                    value={mysteryRevealedInBook ?? ""}
                    onChange={(event) => setMysteryRevealedInBook(event.target.value ? Number(event.target.value) : null)}
                    className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                  />
                </label>
                <label className="text-xs text-zinc-300">
                  Reveal in chapter #
                  <input
                    type="number"
                    value={mysteryRevealedInChapter ?? ""}
                    onChange={(event) => setMysteryRevealedInChapter(event.target.value ? Number(event.target.value) : null)}
                    className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                  />
                </label>
                <label className="text-xs text-zinc-300 md:col-span-2">
                  Reveal method
                  <input
                    value={mysteryRevealMethod}
                    onChange={(event) => setMysteryRevealMethod(event.target.value)}
                    placeholder="e.g. Council confession during confrontation"
                    className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                  />
                </label>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={async () => {
                    if (!activeSeries || !mysteryTitle || !mysteryDescription) return;
                    await fetch("/api/series/mystery", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        type: "secret",
                        seriesId: activeSeries.id,
                        title: mysteryTitle,
                        description: mysteryDescription,
                        status: mysterySecretStatus,
                        whoKnows: mysteryWhoKnows || null,
                        whoDoesntKnow: mysteryWhoDoesntKnow || null,
                        revealedInBook: mysteryRevealedInBook,
                        revealedInChapter: mysteryRevealedInChapter,
                        revealMethod: mysteryRevealMethod || null,
                      }),
                    });
                    setMysteryTitle("");
                    setMysteryDescription("");
                    setMysteryWhoKnows("");
                    setMysteryWhoDoesntKnow("");
                    setMysteryRevealedInBook(null);
                    setMysteryRevealedInChapter(null);
                    setMysteryRevealMethod("");
                    setMysterySecretStatus("hidden");
                    await refreshMysteryOnly();
                  }}
                  className="rounded-full border border-emerald-500/60 px-4 py-2 text-sm text-emerald-200"
                >
                  Save Secret
                </button>
              </div>
            </details>

            {/* ─── Clue form (full schema, with secret linking) ───────────────── */}
            <details className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
              <summary className="cursor-pointer text-sm font-medium text-zinc-200">
                + Add Clue
              </summary>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="text-xs text-zinc-300">
                  Description <span className="text-rose-400">*</span>
                  <textarea
                    value={clueDescription}
                    onChange={(event) => setClueDescription(event.target.value)}
                    placeholder="What hint is planted in the story?"
                    className="min-h-[80px] rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                  />
                </label>
                <div className="grid gap-3">
                  <label className="text-xs text-zinc-300">
                    Clue type
                    <select
                      value={clueType}
                      onChange={(event) => setClueType(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                    >
                      <option value="dialogue">Dialogue</option>
                      <option value="object">Object</option>
                      <option value="event">Event</option>
                      <option value="description">Description</option>
                    </select>
                  </label>
                  <label className="text-xs text-zinc-300">
                    Links to secret
                    <select
                      value={clueSecretId}
                      onChange={(event) => setClueSecretId(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                    >
                      <option value="">— (unlinked) —</option>
                      {mysterySecrets.map((s) => (
                        <option key={String(s.id)} value={String(s.id)}>
                          {String(s.title ?? "Untitled secret")}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="text-xs text-zinc-300">
                  Planted in book # <span className="text-rose-400">*</span>
                  <input
                    type="number"
                    value={clueBook}
                    onChange={(event) => setClueBook(Number(event.target.value) || 1)}
                    className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                  />
                </label>
                <label className="text-xs text-zinc-300">
                  Planted in chapter #
                  <input
                    type="number"
                    value={clueChapter ?? ""}
                    onChange={(event) => setClueChapter(event.target.value ? Number(event.target.value) : null)}
                    className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                  />
                </label>
                <label className="flex items-center gap-2 text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={clueIsObvious}
                    onChange={(event) => setClueIsObvious(event.target.checked)}
                    className="h-4 w-4"
                  />
                  Obvious (reader can spot it)
                </label>
                <label className="flex items-center gap-2 text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={clueWasNoticed}
                    onChange={(event) => setClueWasNoticed(event.target.checked)}
                    className="h-4 w-4"
                  />
                  Was noticed (a character reacted)
                </label>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={async () => {
                    if (!activeSeries || !clueDescription) return;
                    await fetch("/api/series/mystery", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        type: "clue",
                        seriesId: activeSeries.id,
                        description: clueDescription,
                        secretId: clueSecretId || null,
                        plantedInBook: clueBook,
                        plantedInChapter: clueChapter,
                        clueType,
                        isObvious: clueIsObvious,
                        wasNoticed: clueWasNoticed,
                      }),
                    });
                    setClueDescription("");
                    setClueSecretId("");
                    setClueChapter(null);
                    setClueType("dialogue");
                    setClueIsObvious(false);
                    setClueWasNoticed(false);
                    await refreshMysteryOnly();
                  }}
                  className="rounded-full border border-emerald-500/60 px-4 py-2 text-sm text-emerald-200"
                >
                  Save Clue
                </button>
              </div>
            </details>

            {/* ─── Filters ───────────────────────────────────────────────────── */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="text-xs text-zinc-300">
                Search
                <input
                  value={mysterySearch}
                  onChange={(event) => setMysterySearch(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                />
              </label>
              <label className="text-xs text-zinc-300">
                Book #
                <input
                  type="number"
                  value={mysteryBookFilter || ""}
                  onChange={(event) => setMysteryBookFilter(Number(event.target.value) || 0)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                />
              </label>
              <label className="text-xs text-zinc-300">
                Secret status
                <select
                  value={secretStatusFilter}
                  onChange={(event) => setSecretStatusFilter(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                >
                  <option value="all">All statuses</option>
                  <option value="hidden">Hidden</option>
                  <option value="partial">Partial</option>
                  <option value="revealed">Revealed</option>
                </select>
              </label>
              <label className="text-xs text-zinc-300">
                Clue type
                <select
                  value={clueTypeFilter}
                  onChange={(event) => setClueTypeFilter(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                >
                  <option value="all">All types</option>
                  <option value="dialogue">Dialogue</option>
                  <option value="object">Object</option>
                  <option value="event">Event</option>
                  <option value="description">Description</option>
                </select>
              </label>
              <button
                onClick={() => {
                  setMysterySearch("");
                  setMysteryBookFilter(0);
                  setSecretStatusFilter("all");
                  setClueTypeFilter("all");
                }}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
              >
                Clear Filters
              </button>
              <button
                onClick={refreshMysteryOnly}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
              >
                Refresh Mysteries
              </button>
            </div>

            {/* ─── Bulk actions ──────────────────────────────────────────────── */}
            {(selectedSecretIds.size > 0 || selectedClueIds.size > 0) && (
              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-amber-700/40 bg-amber-950/20 p-3 text-xs text-amber-200">
                <span>
                  {selectedSecretIds.size} secret(s) + {selectedClueIds.size} clue(s) selected
                </span>
                <button
                  onClick={async () => {
                    if (!activeSeries) return;
                    await Promise.all(
                      Array.from(selectedSecretIds).map((id) =>
                        fetch("/api/series/mystery/secret/delete", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id }),
                        })
                      )
                    );
                    await Promise.all(
                      Array.from(selectedClueIds).map((id) =>
                        fetch("/api/series/mystery/clue/delete", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id }),
                        })
                      )
                    );
                    setSelectedSecretIds(new Set());
                    setSelectedClueIds(new Set());
                    await refreshMysteryOnly();
                  }}
                  className="rounded-full border border-rose-500/60 px-3 py-1 text-rose-200"
                >
                  Bulk Delete
                </button>
                <button
                  onClick={async () => {
                    if (!activeSeries) return;
                    await Promise.all(
                      Array.from(selectedSecretIds).map((id) =>
                        fetch("/api/series/mystery/secret", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id, status: "revealed" }),
                        })
                      )
                    );
                    await Promise.all(
                      Array.from(selectedClueIds).map((id) =>
                        fetch("/api/series/mystery/clue", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id, wasNoticed: true }),
                        })
                      )
                    );
                    setSelectedSecretIds(new Set());
                    setSelectedClueIds(new Set());
                    await refreshMysteryOnly();
                  }}
                  className="rounded-full border border-emerald-500/60 px-3 py-1 text-emerald-200"
                >
                  Mark Selected as Revealed/Noticed
                </button>
                <button
                  onClick={() => {
                    setSelectedSecretIds(new Set());
                    setSelectedClueIds(new Set());
                  }}
                  className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-300"
                >
                  Clear Selection
                </button>
              </div>
            )}

            {/* ─── Secrets list ─────────────────────────────────────────────── */}
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-200">
                  Secrets ({filteredSecrets.length}
                  {filteredSecrets.length !== mysterySecrets.length ? ` of ${mysterySecrets.length}` : ""})
                </h3>
                {filteredSecrets.length > 0 && (
                  <button
                    onClick={() => {
                      const visibleIds = new Set(filteredSecrets.map((s) => String(s.id ?? "")));
                      const allSelected = Array.from(visibleIds).every((id) => selectedSecretIds.has(id));
                      setSelectedSecretIds((prev) => {
                        const next = new Set(prev);
                        if (allSelected) {
                          visibleIds.forEach((id) => next.delete(id));
                        } else {
                          visibleIds.forEach((id) => next.add(id));
                        }
                        return next;
                      });
                    }}
                    className="text-[10px] text-zinc-400 hover:text-zinc-200"
                  >
                    {filteredSecrets.every((s) => selectedSecretIds.has(String(s.id ?? "")))
                      ? "Deselect all visible"
                      : "Select all visible"}
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {filteredSecrets.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-950/40 p-6 text-center text-xs text-zinc-500">
                    {mysterySecrets.length === 0
                      ? "No secrets yet. Add one above to start tracking mysteries in your series."
                      : "No secrets match the current filters."}
                  </div>
                ) : (
                  filteredSecrets.map((secret) => {
                    const secretId = String(secret.id ?? "");
                    const isSelected = selectedSecretIds.has(secretId);
                    const status = String(secret.status ?? "hidden").toLowerCase();
                    const statusColor =
                      status === "revealed"
                        ? "border-emerald-500/60 bg-emerald-950/20 text-emerald-200"
                        : status === "partial"
                        ? "border-amber-500/60 bg-amber-950/20 text-amber-200"
                        : "border-purple-500/60 bg-purple-950/20 text-purple-200";
                    return (
                      <div
                        key={secretId}
                        className={`rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200 ${isSelected ? "ring-1 ring-amber-500/50" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(event) => {
                              setSelectedSecretIds((prev) => {
                                const next = new Set(prev);
                                if (event.target.checked) next.add(secretId);
                                else next.delete(secretId);
                                return next;
                              });
                            }}
                            className="mt-1 h-4 w-4"
                          />
                          <div className="flex-1">
                            {editingSecretId === secretId ? (
                              <div className="space-y-2">
                                <input
                                  value={editingSecretTitle}
                                  onChange={(event) => setEditingSecretTitle(event.target.value)}
                                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                                />
                                <textarea
                                  value={editingSecretDescription}
                                  onChange={(event) => setEditingSecretDescription(event.target.value)}
                                  className="min-h-[80px] w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                                />
                                <div className="grid gap-2 md:grid-cols-2">
                                  <select
                                    value={editingSecretStatus}
                                    onChange={(event) => setEditingSecretStatus(event.target.value)}
                                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                                  >
                                    <option value="hidden">Hidden</option>
                                    <option value="partial">Partial</option>
                                    <option value="revealed">Revealed</option>
                                  </select>
                                  <input
                                    value={editingSecretWhoKnows}
                                    onChange={(event) => setEditingSecretWhoKnows(event.target.value)}
                                    placeholder="Who knows (comma-separated)"
                                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                                  />
                                  <input
                                    value={editingSecretWhoDoesntKnow}
                                    onChange={(event) => setEditingSecretWhoDoesntKnow(event.target.value)}
                                    placeholder="Who doesn't know"
                                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                                  />
                                  <input
                                    type="number"
                                    value={editingSecretRevealedInBook ?? ""}
                                    onChange={(event) => setEditingSecretRevealedInBook(event.target.value ? Number(event.target.value) : null)}
                                    placeholder="Reveal book #"
                                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                                  />
                                  <input
                                    type="number"
                                    value={editingSecretRevealedInChapter ?? ""}
                                    onChange={(event) => setEditingSecretRevealedInChapter(event.target.value ? Number(event.target.value) : null)}
                                    placeholder="Reveal chapter #"
                                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                                  />
                                  <input
                                    value={editingSecretRevealMethod}
                                    onChange={(event) => setEditingSecretRevealMethod(event.target.value)}
                                    placeholder="Reveal method"
                                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm md:col-span-2"
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-zinc-100">
                                    {String(secret.title ?? "Secret")}
                                  </p>
                                  <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${statusColor}`}>
                                    {status}
                                  </span>
                                </div>
                                <p className="mt-2 text-xs">{String(secret.description ?? "")}</p>
                                <div className="mt-2 grid gap-1 text-[10px] text-zinc-400 md:grid-cols-2">
                                  {secret.who_knows ? (
                                    <div>
                                      <span className="text-zinc-500">Knows:</span>{" "}
                                      {Array.isArray(secret.who_knows)
                                        ? secret.who_knows.join(", ")
                                        : String(secret.who_knows)}
                                    </div>
                                  ) : null}
                                  {secret.who_doesnt_know ? (
                                    <div>
                                      <span className="text-zinc-500">Doesn&apos;t know:</span>{" "}
                                      {Array.isArray(secret.who_doesnt_know)
                                        ? secret.who_doesnt_know.join(", ")
                                        : String(secret.who_doesnt_know)}
                                    </div>
                                  ) : null}
                                  {secret.revealed_in_book != null && (
                                    <div>
                                      <span className="text-zinc-500">Reveal:</span> Book {String(secret.revealed_in_book)}
                                      {secret.revealed_in_chapter != null ? `, Ch ${String(secret.revealed_in_chapter)}` : ""}
                                    </div>
                                  )}
                                  {secret.reveal_method ? (
                                    <div>
                                      <span className="text-zinc-500">Method:</span> {String(secret.reveal_method)}
                                    </div>
                                  ) : null}
                                  {secret.created_at ? (
                                    <div>
                                      <span className="text-zinc-500">Added:</span>{" "}
                                      {String(secret.created_at).slice(0, 10)}
                                    </div>
                                  ) : null}
                                </div>
                              </>
                            )}
                            <div className="mt-3 flex flex-wrap gap-2">
                              {editingSecretId === secretId ? (
                                <>
                                  <button
                                    onClick={async () => {
                                      await fetch("/api/series/mystery/secret", {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                          id: secretId,
                                          title: editingSecretTitle,
                                          description: editingSecretDescription,
                                          status: editingSecretStatus,
                                          whoKnows: editingSecretWhoKnows || null,
                                          whoDoesntKnow: editingSecretWhoDoesntKnow || null,
                                          revealedInBook: editingSecretRevealedInBook,
                                          revealedInChapter: editingSecretRevealedInChapter,
                                          revealMethod: editingSecretRevealMethod || null,
                                        }),
                                      });
                                      setEditingSecretId(null);
                                      await refreshMysteryOnly();
                                    }}
                                    className="rounded-full border border-emerald-500/60 px-3 py-1 text-[10px] text-emerald-200"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingSecretId(null)}
                                    className="rounded-full border border-zinc-700 px-3 py-1 text-[10px] text-zinc-300"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingSecretId(secretId);
                                      setEditingSecretTitle(String(secret.title ?? ""));
                                      setEditingSecretDescription(String(secret.description ?? ""));
                                      setEditingSecretStatus(String(secret.status ?? "hidden"));
                                      const wk = secret.who_knows;
                                      setEditingSecretWhoKnows(
                                        Array.isArray(wk) ? wk.join(", ") : String(wk ?? "")
                                      );
                                      const wdk = secret.who_doesnt_know;
                                      setEditingSecretWhoDoesntKnow(
                                        Array.isArray(wdk) ? wdk.join(", ") : String(wdk ?? "")
                                      );
                                      setEditingSecretRevealedInBook(
                                        secret.revealed_in_book != null ? Number(secret.revealed_in_book) : null
                                      );
                                      setEditingSecretRevealedInChapter(
                                        secret.revealed_in_chapter != null ? Number(secret.revealed_in_chapter) : null
                                      );
                                      setEditingSecretRevealMethod(String(secret.reveal_method ?? ""));
                                    }}
                                    className="rounded-full border border-zinc-700 px-3 py-1 text-[10px]"
                                  >
                                    Edit
                                  </button>
                                  {/* Quick status toggle (no edit mode needed) */}
                                  {status !== "revealed" && (
                                    <button
                                      onClick={async () => {
                                        await fetch("/api/series/mystery/secret", {
                                          method: "PUT",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({
                                            id: secretId,
                                            status: status === "hidden" ? "partial" : "revealed",
                                          }),
                                        });
                                        await refreshMysteryOnly();
                                      }}
                                      className="rounded-full border border-amber-500/60 px-3 py-1 text-[10px] text-amber-200"
                                    >
                                      Mark as {status === "hidden" ? "Partial" : "Revealed"}
                                    </button>
                                  )}
                                </>
                              )}
                              <button
                                onClick={() =>
                                  setPendingDelete({
                                    id: secretId,
                                    endpoint: "/api/series/mystery/secret/delete",
                                    refresh: refreshMysteryOnly,
                                  })
                                }
                                className="rounded-full border border-rose-500/40 px-3 py-1 text-[10px] text-rose-300"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ─── Clues list ───────────────────────────────────────────────── */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-200">
                  Clues ({filteredClues.length}
                  {filteredClues.length !== mysteryClues.length ? ` of ${mysteryClues.length}` : ""})
                </h3>
                {filteredClues.length > 0 && (
                  <button
                    onClick={() => {
                      const visibleIds = new Set(filteredClues.map((c) => String(c.id ?? "")));
                      const allSelected = Array.from(visibleIds).every((id) => selectedClueIds.has(id));
                      setSelectedClueIds((prev) => {
                        const next = new Set(prev);
                        if (allSelected) {
                          visibleIds.forEach((id) => next.delete(id));
                        } else {
                          visibleIds.forEach((id) => next.add(id));
                        }
                        return next;
                      });
                    }}
                    className="text-[10px] text-zinc-400 hover:text-zinc-200"
                  >
                    {filteredClues.every((c) => selectedClueIds.has(String(c.id ?? "")))
                      ? "Deselect all visible"
                      : "Select all visible"}
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {filteredClues.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-950/40 p-6 text-center text-xs text-zinc-500">
                    {mysteryClues.length === 0
                      ? "No clues yet. Plant a clue above to start building toward a reveal."
                      : "No clues match the current filters."}
                  </div>
                ) : (
                  filteredClues.map((clue) => {
                    const clueId = String(clue.id ?? "");
                    const isSelected = selectedClueIds.has(clueId);
                    const type = String(clue.clue_type ?? "clue").toLowerCase();
                    const typeColor =
                      type === "dialogue"
                        ? "border-sky-500/60 bg-sky-950/20 text-sky-200"
                        : type === "object"
                        ? "border-indigo-500/60 bg-indigo-950/20 text-indigo-200"
                        : type === "event"
                        ? "border-rose-500/60 bg-rose-950/20 text-rose-200"
                        : "border-zinc-500/60 bg-zinc-900/40 text-zinc-300";
                    // Look up parent secret title for display
                    const parentSecret = mysterySecrets.find(
                      (s) => String(s.id) === String(clue.secret_id ?? "")
                    );
                    return (
                      <div
                        key={`clue-${clueId}`}
                        className={`rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200 ${isSelected ? "ring-1 ring-amber-500/50" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(event) => {
                              setSelectedClueIds((prev) => {
                                const next = new Set(prev);
                                if (event.target.checked) next.add(clueId);
                                else next.delete(clueId);
                                return next;
                              });
                            }}
                            className="mt-1 h-4 w-4"
                          />
                          <div className="flex-1">
                            {editingClueId === clueId ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editingClueDescription}
                                  onChange={(event) => setEditingClueDescription(event.target.value)}
                                  className="min-h-[80px] w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                                />
                                <div className="grid gap-2 md:grid-cols-2">
                                  <select
                                    value={editingClueType}
                                    onChange={(event) => setEditingClueType(event.target.value)}
                                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                                  >
                                    <option value="dialogue">Dialogue</option>
                                    <option value="object">Object</option>
                                    <option value="event">Event</option>
                                    <option value="description">Description</option>
                                  </select>
                                  <select
                                    value={editingClueSecretId}
                                    onChange={(event) => setEditingClueSecretId(event.target.value)}
                                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                                  >
                                    <option value="">— (unlinked) —</option>
                                    {mysterySecrets.map((s) => (
                                      <option key={String(s.id)} value={String(s.id)}>
                                        {String(s.title ?? "Untitled secret")}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    type="number"
                                    value={editingClueBook}
                                    onChange={(event) => setEditingClueBook(Number(event.target.value) || 1)}
                                    placeholder="Planted in book"
                                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                                  />
                                  <input
                                    type="number"
                                    value={editingClueChapter ?? ""}
                                    onChange={(event) => setEditingClueChapter(event.target.value ? Number(event.target.value) : null)}
                                    placeholder="Planted in chapter"
                                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                                  />
                                  <label className="flex items-center gap-2 text-xs text-zinc-300">
                                    <input
                                      type="checkbox"
                                      checked={editingClueIsObvious}
                                      onChange={(event) => setEditingClueIsObvious(event.target.checked)}
                                      className="h-4 w-4"
                                    />
                                    Obvious
                                  </label>
                                  <label className="flex items-center gap-2 text-xs text-zinc-300">
                                    <input
                                      type="checkbox"
                                      checked={editingClueWasNoticed}
                                      onChange={(event) => setEditingClueWasNoticed(event.target.checked)}
                                      className="h-4 w-4"
                                    />
                                    Was noticed
                                  </label>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${typeColor}`}>
                                    {type}
                                  </span>
                                  {clue.was_noticed === true && (
                                    <span className="rounded-full border border-emerald-500/60 bg-emerald-950/20 px-2 py-0.5 text-[10px] uppercase text-emerald-200">
                                      Noticed
                                    </span>
                                  )}
                                  {clue.is_obvious === true && clue.was_noticed !== true && (
                                    <span className="rounded-full border border-amber-500/60 bg-amber-950/20 px-2 py-0.5 text-[10px] uppercase text-amber-200">
                                      Obvious
                                    </span>
                                  )}
                                  {clue.was_noticed !== true && clue.is_obvious !== true && (
                                    <span className="rounded-full border border-zinc-600 bg-zinc-900/40 px-2 py-0.5 text-[10px] uppercase text-zinc-400">
                                      Subtle
                                    </span>
                                  )}
                                </div>
                                <p className="mt-2 text-xs">{String(clue.description ?? "")}</p>
                                <div className="mt-2 grid gap-1 text-[10px] text-zinc-400 md:grid-cols-2">
                                  <div>
                                    <span className="text-zinc-500">Planted:</span> Book {String(clue.planted_in_book ?? "?")}
                                    {clue.planted_in_chapter != null ? `, Ch ${String(clue.planted_in_chapter)}` : ""}
                                  </div>
                                  {parentSecret ? (
                                    <div>
                                      <span className="text-zinc-500">Points to:</span>{" "}
                                      <span className="text-purple-300">{String(parentSecret.title ?? "")}</span>
                                    </div>
                                  ) : null}
                                  {clue.created_at ? (
                                    <div>
                                      <span className="text-zinc-500">Added:</span>{" "}
                                      {String(clue.created_at).slice(0, 10)}
                                    </div>
                                  ) : null}
                                </div>
                              </>
                            )}
                            <div className="mt-3 flex flex-wrap gap-2">
                              {editingClueId === clueId ? (
                                <>
                                  <button
                                    onClick={async () => {
                                      await fetch("/api/series/mystery/clue", {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                          id: clueId,
                                          description: editingClueDescription,
                                          plantedInBook: editingClueBook,
                                          plantedInChapter: editingClueChapter,
                                          secretId: editingClueSecretId || null,
                                          clueType: editingClueType,
                                          isObvious: editingClueIsObvious,
                                          wasNoticed: editingClueWasNoticed,
                                        }),
                                      });
                                      setEditingClueId(null);
                                      await refreshMysteryOnly();
                                    }}
                                    className="rounded-full border border-emerald-500/60 px-3 py-1 text-[10px] text-emerald-200"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingClueId(null)}
                                    className="rounded-full border border-zinc-700 px-3 py-1 text-[10px] text-zinc-300"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingClueId(clueId);
                                      setEditingClueDescription(String(clue.description ?? ""));
                                      setEditingClueBook(Number(clue.planted_in_book ?? 1));
                                      setEditingClueChapter(
                                        clue.planted_in_chapter != null ? Number(clue.planted_in_chapter) : null
                                      );
                                      setEditingClueSecretId(String(clue.secret_id ?? ""));
                                      setEditingClueType(String(clue.clue_type ?? "dialogue"));
                                      setEditingClueIsObvious(Boolean(clue.is_obvious));
                                      setEditingClueWasNoticed(Boolean(clue.was_noticed));
                                    }}
                                    className="rounded-full border border-zinc-700 px-3 py-1 text-[10px]"
                                  >
                                    Edit
                                  </button>
                                  {clue.was_noticed !== true && (
                                    <button
                                      onClick={async () => {
                                        await fetch("/api/series/mystery/clue", {
                                          method: "PUT",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ id: clueId, wasNoticed: true }),
                                        });
                                        await refreshMysteryOnly();
                                      }}
                                      className="rounded-full border border-emerald-500/60 px-3 py-1 text-[10px] text-emerald-200"
                                    >
                                      Mark as Noticed
                                    </button>
                                  )}
                                </>
                              )}
                              <button
                                onClick={() =>
                                  setPendingDelete({
                                    id: clueId,
                                    endpoint: "/api/series/mystery/clue/delete",
                                    refresh: refreshMysteryOnly,
                                  })
                                }
                                className="rounded-full border border-rose-500/40 px-3 py-1 text-[10px] text-rose-300"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "relationships" && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="text-xl font-semibold">Relationship Log</h2>
            <p className="text-sm text-zinc-400">
              Track how characters relate and change.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-xs text-zinc-300">
                Character A
                <input
                  value={relationshipA}
                  onChange={(event) => setRelationshipA(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                />
              </label>
              <label className="text-xs text-zinc-300">
                Character B
                <input
                  value={relationshipB}
                  onChange={(event) => setRelationshipB(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                />
              </label>
              <label className="text-xs text-zinc-300">
                Relationship type
                <select
                  value={relationshipType}
                  onChange={(event) => setRelationshipType(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                >
                  <option value="friends">Friends</option>
                  <option value="enemies">Enemies</option>
                  <option value="romantic">Romantic</option>
                  <option value="family">Family</option>
                  <option value="allies">Allies</option>
                  <option value="rivals">Rivals</option>
                </select>
              </label>
              <label className="text-xs text-zinc-300">
                Status
                <select
                  value={relationshipStatus}
                  onChange={(event) => setRelationshipStatus(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                >
                  <option value="neutral">Neutral</option>
                  <option value="positive">Positive</option>
                  <option value="tense">Tense</option>
                  <option value="broken">Broken</option>
                </select>
              </label>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="text-xs text-zinc-300">
                Status
                <select
                  value={relationshipsStatusFilter}
                  onChange={(event) => setRelationshipsStatusFilter(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                >
                  <option value="all">All</option>
                  <option value="neutral">Neutral</option>
                  <option value="positive">Positive</option>
                  <option value="tense">Tense</option>
                  <option value="broken">Broken</option>
                </select>
              </label>
              <label className="text-xs text-zinc-300">
                Search
                <input
                  value={relationshipsSearch}
                  onChange={(event) => setRelationshipsSearch(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                />
              </label>
              <button
                onClick={() => {
                  setRelationshipsStatusFilter("all");
                  setRelationshipsSearch("");
                }}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
              >
                Clear Filters
              </button>
              <button
                onClick={async () => {
                  if (!activeSeries || !relationshipA || !relationshipB) return;
                  await fetch("/api/series/relationships/entries", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      seriesId: activeSeries.id,
                      characterAName: relationshipA,
                      characterBName: relationshipB,
                      relationshipType,
                      status: relationshipStatus,
                    }),
                  });
                  setRelationshipA("");
                  setRelationshipB("");
                  const response = await fetch(
                    `/api/series/relationships/entries?seriesId=${activeSeries.id}`
                  );
                  const data = await response.json();
                  setSeriesMemory(data.entries ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
              >
                Add Relationship
              </button>
              <button
                onClick={async () => {
                  if (!activeSeries) return;
                  const response = await fetch(
                    `/api/series/relationships/entries?seriesId=${activeSeries.id}`
                  );
                  const data = await response.json();
                  setSeriesMemory(data.entries ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
              >
                Refresh Relationships
              </button>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="space-y-3">
                {filteredRelationships.length === 0 && (
                  <p className="text-xs text-zinc-500">No relationships yet.</p>
                )}
                {filteredRelationships.map((relationship) => (
                  <div
                    key={String(relationship.id)}
                    className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200"
                  >
                  {editingRelationshipId === String(relationship.id ?? "") ? (
                    <div className="grid gap-2 md:grid-cols-2">
                      <input
                        value={editingRelationshipA}
                        onChange={(event) => setEditingRelationshipA(event.target.value)}
                        className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                      />
                      <input
                        value={editingRelationshipB}
                        onChange={(event) => setEditingRelationshipB(event.target.value)}
                        className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                      />
                      <select
                        value={editingRelationshipType}
                        onChange={(event) => setEditingRelationshipType(event.target.value)}
                        className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                      >
                        <option value="friends">Friends</option>
                        <option value="enemies">Enemies</option>
                        <option value="romantic">Romantic</option>
                        <option value="family">Family</option>
                        <option value="allies">Allies</option>
                        <option value="rivals">Rivals</option>
                      </select>
                      <select
                        value={editingRelationshipStatus}
                        onChange={(event) => setEditingRelationshipStatus(event.target.value)}
                        className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                      >
                        <option value="neutral">Neutral</option>
                        <option value="positive">Positive</option>
                        <option value="tense">Tense</option>
                        <option value="broken">Broken</option>
                      </select>
                    </div>
                  ) : (
                    <p className="text-xs">
                      {String(relationship.character_a_name ?? "")} &amp;{" "}
                      {String(relationship.character_b_name ?? "")} —{" "}
                      <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px]">
                        {String(relationship.relationship_type ?? "")}
                      </span>
                      <span className="ml-2 rounded-full border border-zinc-700 px-2 py-0.5 text-[10px]">
                        {String(relationship.status ?? "")}
                      </span>
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {editingRelationshipId === String(relationship.id ?? "") ? (
                      <button
                        onClick={async () => {
                          await fetch("/api/series/relationships/entries", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              seriesId: activeSeries.id,
                              relationshipLogId: relationship.relationship_log_id,
                              characterAName: editingRelationshipA,
                              characterBName: editingRelationshipB,
                              relationshipType: editingRelationshipType,
                              status: editingRelationshipStatus,
                            }),
                          });
                          setEditingRelationshipId(null);
                          const response = await fetch(
                            `/api/series/relationships/entries?seriesId=${activeSeries.id}`
                          );
                          const data = await response.json();
                          setSeriesMemory(data.entries ?? []);
                        }}
                        className="rounded-full border border-emerald-500/60 px-3 py-1 text-[10px] text-emerald-200"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingRelationshipId(String(relationship.id ?? ""));
                          setEditingRelationshipA(String(relationship.character_a_name ?? ""));
                          setEditingRelationshipB(String(relationship.character_b_name ?? ""));
                          setEditingRelationshipType(String(relationship.relationship_type ?? "friends"));
                          setEditingRelationshipStatus(String(relationship.status ?? "neutral"));
                        }}
                        className="rounded-full border border-zinc-700 px-3 py-1 text-[10px]"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setPendingDelete({
                          id: String(relationship.id ?? ""),
                          endpoint: "/api/series/relationships/entries/delete",
                          refresh: async () => {
                            const refreshed = await fetch(
                              `/api/series/relationships/entries?seriesId=${activeSeries.id}`
                            );
                            const data = await refreshed.json();
                            setSeriesMemory(data.entries ?? []);
                          },
                        })
                      }
                      className="rounded-full border border-zinc-700 px-3 py-1 text-[10px]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              </div>
              <div className="space-y-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <p className="text-xs uppercase text-zinc-400">By Status</p>
                  <div className="mt-3 space-y-2 text-xs text-zinc-300">
                    {["positive", "neutral", "tense", "broken"].map((status) => {
                      const count = filteredRelationships.filter(
                        (entry) => String(entry.status ?? "").toLowerCase() === status
                      ).length;
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <span className="capitalize">{status}</span>
                          <span className="text-zinc-400">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <p className="text-xs uppercase text-zinc-400">Highlights</p>
                  <p className="mt-2 text-xs text-zinc-400">
                    Focus on tense or broken relationships for major plot beats.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "plots" && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="text-xl font-semibold">Plots</h2>
            <p className="text-sm text-zinc-400">
              Track plot threads across the series.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-xs text-zinc-300">
                Thread name
                <input
                  value={plotName}
                  onChange={(event) => setPlotName(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                />
              </label>
              <label className="text-xs text-zinc-300">
                Type
                <select
                  value={plotType}
                  onChange={(event) => setPlotType(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                >
                  <option value="main">Main</option>
                  <option value="subplot">Subplot</option>
                  <option value="character">Character</option>
                  <option value="world">World</option>
                </select>
              </label>
              <label className="text-xs text-zinc-300">
                Introduced in book
                <input
                  type="number"
                  value={plotIntroducedBook}
                  onChange={(event) =>
                    setPlotIntroducedBook(Number(event.target.value) || 1)
                  }
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                />
              </label>
              <label className="text-xs text-zinc-300">
                Resolved in book (optional)
                <input
                  type="number"
                  value={plotResolvedBook ?? ""}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    setPlotResolvedBook(value ? value : null);
                  }}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                />
              </label>
              <label className="text-xs text-zinc-300 md:col-span-2">
                Description
                <textarea
                  value={plotDescription}
                  onChange={(event) => setPlotDescription(event.target.value)}
                  className="min-h-[90px] rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="text-xs text-zinc-300">
                Filter
                <select
                  value={plotFilter}
                  onChange={(event) => setPlotFilter(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                >
                  <option value="all">All</option>
                  <option value="main">Main</option>
                  <option value="subplot">Subplot</option>
                  <option value="character">Character</option>
                  <option value="world">World</option>
                </select>
              </label>
              <label className="text-xs text-zinc-300">
                Search
                <input
                  value={plotSearch}
                  onChange={(event) => setPlotSearch(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                />
              </label>
              <button
                onClick={() => {
                  setPlotFilter("all");
                  setPlotSearch("");
                }}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
              >
                Clear Filters
              </button>
              <button
                onClick={async () => {
                  if (!activeSeries || !plotName || !plotDescription) return;
                  await fetch("/api/series/plot-threads", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      seriesId: activeSeries.id,
                      name: plotName,
                      description: plotDescription,
                      type: plotType,
                      introducedInBook: plotIntroducedBook,
                      resolvedInBook: plotResolvedBook,
                    }),
                  });
                  setPlotName("");
                  setPlotDescription("");
                  const response = await fetch(
                    `/api/series/plot-threads?seriesId=${activeSeries.id}`
                  );
                  const data = await response.json();
                  setPlotThreads(data.threads ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
              >
                Add Thread
              </button>
              <button
                onClick={async () => {
                  if (!activeSeries) return;
                  const response = await fetch(
                    `/api/series/plot-threads?seriesId=${activeSeries.id}`
                  );
                  const data = await response.json();
                  setPlotThreads(data.threads ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
              >
                Refresh Threads
              </button>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="space-y-3">
                {filteredPlots.length === 0 && (
                  <p className="text-xs text-zinc-500">No plot threads yet.</p>
                )}
                {filteredPlots.map((thread) => (
                  <div
                    key={String(thread.id)}
                    className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200"
                  >
                    <p className="text-sm font-semibold text-zinc-100">
                      {String(thread.name ?? "Thread")}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {String(thread.type ?? "main")}
                      <span className="ml-2 rounded-full border border-zinc-700 px-2 py-0.5 text-[10px]">
                        {String(thread.status ?? plotStatus)}
                      </span>
                    </p>
                    <p className="mt-2 text-xs">{String(thread.description ?? "")}</p>
                    <p className="mt-2 text-[10px] text-zinc-500">
                      {(() => {
                        const introTitle = seriesBooks.find(b => Number(b.book_number) === Number(thread.introduced_in_book))?.title;
                        const resolveTitle = thread.resolved_in_book ? seriesBooks.find(b => Number(b.book_number) === Number(thread.resolved_in_book))?.title : null;
                        return String(introTitle ?? `Book ${thread.introduced_in_book ?? "?"}`) + (resolveTitle ? ` → ${resolveTitle}` : "");
                      })()}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={async () => {
                          await fetch("/api/series/plot-threads/update", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              id: String(thread.id ?? ""),
                              status: "in_progress",
                              resolvedInBook: thread.resolved_in_book ?? null,
                            }),
                          });
                          const response = await fetch(
                            `/api/series/plot-threads?seriesId=${activeSeries.id}`
                          );
                          const data = await response.json();
                          setPlotThreads(data.threads ?? []);
                        }}
                        className="rounded-full border border-zinc-700 px-3 py-1 text-[10px]"
                      >
                        Mark In Progress
                      </button>
                      <button
                        onClick={() =>
                          setPendingDelete({
                            id: String(thread.id ?? ""),
                            endpoint: "/api/series/plot-threads/delete",
                            refresh: async () => {
                              const response = await fetch(
                                `/api/series/plot-threads?seriesId=${activeSeries.id}`
                              );
                              const data = await response.json();
                              setPlotThreads(data.threads ?? []);
                            },
                          })
                        }
                        className="rounded-full border border-zinc-700 px-3 py-1 text-[10px]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <p className="text-xs uppercase text-zinc-400">Plot Summary</p>
                  <p className="mt-2 text-xs text-zinc-400">
                    {filteredPlots.length} threads across the series.
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <p className="text-xs uppercase text-zinc-400">By Type</p>
                  <div className="mt-2 space-y-2 text-xs text-zinc-300">
                    {[
                      "main",
                      "subplot",
                      "character",
                      "world",
                    ].map((type) => {
                      const count = filteredPlots.filter(
                        (thread) => String(thread.type ?? "") === type
                      ).length;
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <span className="capitalize">{type}</span>
                          <span className="text-zinc-400">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "books" && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Books</h2>
                <p className="text-sm text-zinc-400">
                  Overview of books in this series.
                </p>
              </div>
              <button
                onClick={async () => {
                  if (!activeSeries) return;
                  const res = await fetch(`/api/series/books?seriesId=${activeSeries.id}`);
                  const data = await res.json();
                  setSeriesBooks(data.books ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
              >
                Refresh Books
              </button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {seriesBooks.length === 0 && (
                <p className="text-xs text-zinc-500">No books yet.</p>
              )}
              {seriesBooks.map((book) => (
                <div
                  key={String(book.id)}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-zinc-100">
                      {String(book.title ?? "Untitled")}
                    </p>
                    <span className="ml-2 rounded-full border border-zinc-700 px-2 py-0.5 text-[10px]">
                      Book {String(book.book_number ?? "?")}
                    </span>
                    <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px]">
                      {String(book.status ?? "draft")}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-400">
                    {String(book.summary ?? "No summary yet.")}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Boolean(book.novel_id) && (
                      <span className="rounded-full border border-emerald-500/40 px-2 py-0.5 text-[10px] text-emerald-200">
                        Novel linked
                      </span>
                    )}
                    <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px]">
                      Chapters: {String(book.chapter_count ?? "?")}
                    </span>
                    <Link
                      href={`/studio?seriesId=${book.series_id}&bookNumber=${book.book_number}`}
                      className="rounded-full border border-blue-500/40 px-2 py-0.5 text-[10px] text-blue-200 transition hover:bg-blue-500/10"
                    >
                      Open in Studio
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "memory" && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Memory</h2>
                <p className="text-sm text-zinc-400">
                  Capture canon updates, callbacks, and continuity notes.
                </p>
              </div>
              <button
                onClick={async () => {
                  if (!activeSeries) return;
                  const response = await fetch(
                    `/api/series/memory?seriesId=${activeSeries.id}`
                  );
                  const data = await response.json();
                  setSeriesMemory(data.entries ?? []);
                  const warningsResponse = await fetch(
                    `/api/series/memory/validate?seriesId=${activeSeries.id}`
                  );
                  const warningsData = await warningsResponse.json();
                  setMemoryWarnings(warningsData.warnings ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
              >
                Refresh Memory
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-4">
              {memoryTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveMemoryTab(tab.id)}
                  className={`rounded-xl border px-4 py-3 text-left text-xs transition ${
                    activeMemoryTab === tab.id
                      ? "border-emerald-400/60 bg-emerald-500/10"
                      : "border-zinc-800 bg-zinc-950/60"
                  }`}
                >
                  <p className="text-xs text-zinc-400">{tab.label}</p>
                  <p className="mt-2 text-lg font-semibold text-zinc-100">
                    {Number(memoryCounts[tab.id] ?? 0)}
                  </p>
                </button>
              ))}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-xs">
                <p className="text-xs text-zinc-400">Warnings</p>
                <p className="mt-2 text-lg font-semibold text-amber-200">
                  {memoryWarnings.length}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <p className="text-xs uppercase text-zinc-400">Add Memory Entry</p>
                  <div className="mt-3 grid gap-3">
                    <label className="text-xs text-zinc-300">
                      Category
                      <select
                        value={newMemoryCategory}
                        onChange={(event) => setNewMemoryCategory(event.target.value)}
                        className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                      >
                        <option value="canon">Canon</option>
                        <option value="callback">Callback</option>
                        <option value="foreshadow">Foreshadow</option>
                        <option value="clue">Clue</option>
                        <option value="secret">Secret</option>
                        <option value="relationship">Relationship</option>
                        <option value="knowledge">Knowledge</option>
                        <option value="warning">Warning</option>
                      </select>
                    </label>
                    <label className="text-xs text-zinc-300">
                      Memory entry
                      <textarea
                        value={newMemoryContent}
                        onChange={(event) => setNewMemoryContent(event.target.value)}
                        className="min-h-[120px] rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                      />
                    </label>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={async () => {
                          if (!activeSeries || !newMemoryContent) return;
                          const response = await fetch("/api/series/memory", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              seriesId: activeSeries.id,
                              category: newMemoryCategory,
                              content: newMemoryContent,
                            }),
                          });
                          if (response.ok) {
                            setMemoryStatus("Saved memory entry.");
                            setNewMemoryContent("");
                            const refreshed = await fetch(
                              `/api/series/memory?seriesId=${activeSeries.id}`
                            );
                            const data = await refreshed.json();
                            setSeriesMemory(data.entries ?? []);
                            const warningsResponse = await fetch(
                              `/api/series/memory/validate?seriesId=${activeSeries.id}`
                            );
                            const warningsData = await warningsResponse.json();
                            setMemoryWarnings(warningsData.warnings ?? []);
                          }
                        }}
                        className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
                      >
                        Save Memory
                      </button>
                      <button
                        onClick={() => {
                          setNewMemoryContent("");
                          setNewMemoryCategory("canon");
                        }}
                        className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
                      >
                        Clear
                      </button>
                    </div>
                    {memoryStatus && (
                      <p className="text-xs text-emerald-300">{memoryStatus}</p>
                    )}
                  </div>
                </div>

                {memoryWarnings.length > 0 && (
                  <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-200">
                    <p className="font-semibold">Continuity Warnings</p>
                    <ul className="mt-2 list-disc space-y-1 pl-4">
                      {memoryWarnings.map((warning, index) => (
                        <li key={`${index}-${String((warning as { id?: string }).id ?? "warn")}`}>
                          {String((warning as { message?: string }).message ?? warning)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs uppercase text-zinc-400">Entries</p>
                    <span className="text-xs text-zinc-500">
                      {filteredMemoryEntries.length} entries
                    </span>
                  </div>
                  <div className="mt-3 space-y-3">
                    {filteredMemoryEntries.length === 0 && (
                      <p className="text-xs text-zinc-500">No entries yet.</p>
                    )}
                    {filteredMemoryEntries.map((entry) => (
                      <div
                        key={String(entry.id)}
                        className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-200"
                      >
                        <p className="text-[10px] uppercase text-zinc-400">
                          {String(entry.category ?? "canon")}
                        </p>
                        <p className="mt-2 text-xs">{String(entry.content ?? "")}</p>
                        <p className="mt-2 text-[10px] text-zinc-500">
                          {String(entry.created_at ?? "")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "timeline" && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="text-xl font-semibold">Timeline</h2>
            <p className="text-sm text-zinc-400">
              Track key events across the series.
            </p>
            {formError && (
              <p className="mt-2 text-xs text-rose-400">{formError}</p>
            )}
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-xs text-zinc-300">
                Event title
                <input
                  value={timelineTitle}
                  onChange={(event) => setTimelineTitle(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                />
              </label>
              <label className="text-xs text-zinc-300">
                Book #
                <input
                  type="number"
                  value={timelineBook}
                  onChange={(event) => setTimelineBook(Number(event.target.value) || 1)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                />
              </label>
              <label className="text-xs text-zinc-300">
                Order
                <input
                  type="number"
                  value={timelineOrder}
                  onChange={(event) => setTimelineOrder(Number(event.target.value) || 1)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                />
              </label>
              <label className="text-xs text-zinc-300 md:col-span-2">
                Description
                <textarea
                  value={timelineDescription}
                  onChange={(event) => setTimelineDescription(event.target.value)}
                  className="min-h-[100px] rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={async () => {
                  if (!activeSeries) return;
                  if (!timelineTitle || !timelineDescription) {
                    setFormError("Title and description are required.");
                    return;
                  }
                  setFormError(null);
                  await fetch("/api/series/timeline", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      seriesId: activeSeries.id,
                      eventOrder: timelineOrder,
                      title: timelineTitle,
                      description: timelineDescription,
                      bookNumber: timelineBook,
                    }),
                  });
                  setTimelineTitle("");
                  setTimelineDescription("");
                  const response = await fetch(
                    `/api/series/timeline?seriesId=${activeSeries.id}`
                  );
                  const data = await response.json();
                  setSeriesTimeline(data.events ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
              >
                Add Event
              </button>
              <button
                onClick={async () => {
                  if (!activeSeries) return;
                  const response = await fetch(
                    `/api/series/timeline?seriesId=${activeSeries.id}`
                  );
                  const data = await response.json();
                  setSeriesTimeline(data.events ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
              >
                Refresh Timeline
              </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="text-xs text-zinc-300">
                Search
                <input
                  value={timelineSearch}
                  onChange={(event) => setTimelineSearch(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                />
              </label>
              <label className="text-xs text-zinc-300">
                Book #
                <input
                  type="number"
                  value={timelineBookFilter || ""}
                  onChange={(event) => setTimelineBookFilter(Number(event.target.value) || 0)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                />
              </label>
              <button
                onClick={() => {
                  setTimelineSearch("");
                  setTimelineBookFilter(0);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
              >
                Clear Filters
              </button>
              <button
                onClick={async () => {
                  if (!activeSeries) return;
                  const response = await fetch(
                    `/api/series/timeline?seriesId=${activeSeries.id}`
                  );
                  const data = await response.json();
                  setSeriesTimeline(data.events ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
              >
                Refresh Timeline
              </button>
            </div>
            <div className="mt-4 space-y-6">
              {Object.keys(groupedTimeline).length === 0 && (
                <p className="text-xs text-zinc-500">No timeline events yet.</p>
              )}
              {Object.entries(groupedTimeline)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([bookNumber, events]) => {
                  const list = Array.isArray(events) ? events : [];
                  return (
                    <div key={bookNumber} className="space-y-3">
                      <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-2">
                        <p className="text-xs font-semibold text-zinc-200">
                          {(() => {
                            const bn = Number(bookNumber);
                            const bookTitle = seriesBooks.find(b => Number(b.book_number) === bn)?.title;
                            return String(bookTitle ?? `Book ${bn || "Unassigned"}`);
                          })()}
                        </p>
                        <span className="text-[10px] text-zinc-400">
                          {list.length} events
                        </span>
                      </div>
                      <div className="space-y-4">
                        {list.map((event, index) => (
                          <div key={String(event.id)} className="relative pl-6">
                            <span className="absolute left-1 top-3 h-full w-px bg-zinc-800" />
                            <span
                              className={`absolute left-0 top-3 h-3 w-3 rounded-full border bg-zinc-950 ${
                                String(event.event_type ?? event.eventType ?? "plot") === "character"
                                  ? "border-blue-400/60"
                                  : String(event.event_type ?? event.eventType ?? "plot") === "world"
                                    ? "border-purple-400/60"
                                    : "border-emerald-400/60"
                              }`}
                            />
                            <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200">
                          {editingTimelineId === String(event.id ?? "") ? (
                            <div className="space-y-2">
                              <input
                                value={editingTimelineTitle}
                                onChange={(eventInput) => setEditingTimelineTitle(eventInput.target.value)}
                                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                              />
                              <textarea
                                value={editingTimelineDescription}
                                onChange={(eventInput) => setEditingTimelineDescription(eventInput.target.value)}
                                className="min-h-[80px] w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                              />
                              <div className="grid gap-2 md:grid-cols-2">
                                <input
                                  type="number"
                                  value={editingTimelineBook}
                                  onChange={(eventInput) =>
                                    setEditingTimelineBook(Number(eventInput.target.value) || 1)
                                  }
                                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                                />
                                <input
                                  type="number"
                                  value={editingTimelineOrder}
                                  onChange={(eventInput) =>
                                    setEditingTimelineOrder(Number(eventInput.target.value) || 1)
                                  }
                                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                                />
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm font-semibold text-zinc-100">
                                {String(event.title ?? "Event")}
                              </p>
                              <p className="text-xs text-zinc-400">
                                <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px]">
                                  {(() => {
                                    const ebn = Number(event.book_number);
                                    const evtBookTitle = seriesBooks.find(b => Number(b.book_number) === ebn)?.title;
                                    return String(evtBookTitle ?? `Book ${event.book_number ?? "?"}`);
                                  })()}
                                </span>
                                <span className="ml-2 rounded-full border border-zinc-700 px-2 py-0.5 text-[10px]">
                                  Order {String(event.event_order ?? "?")}
                                </span>
                                <span className="ml-2 rounded-full border border-zinc-700 px-2 py-0.5 text-[10px]">
                                  {String(event.event_type ?? event.eventType ?? "plot")}
                                </span>
                              </p>
                              {event.in_world_date && (
                                <p className="mt-2 text-[10px] text-zinc-500">
                                  Date: {String(event.in_world_date)}
                                </p>
                              )}
                              <p className="mt-2 text-xs">{String(event.description ?? "")}</p>
                            </>
                          )}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {editingTimelineId === String(event.id ?? "") ? (
                              <button
                                onClick={async () => {
                                  await fetch("/api/series/timeline-events/update", {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      id: String(event.id ?? ""),
                                      eventName: editingTimelineTitle,
                                      description: editingTimelineDescription,
                                      eventType: "plot",
                                    }),
                                  });
                                  setEditingTimelineId(null);
                                  const response = await fetch(
                                    `/api/series/timeline?seriesId=${activeSeries.id}`
                                  );
                                  const data = await response.json();
                                  setSeriesTimeline(data.events ?? []);
                                }}
                                className="rounded-full border border-emerald-500/60 px-3 py-1 text-[10px] text-emerald-200"
                              >
                                Save
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingTimelineId(String(event.id ?? ""));
                                  setEditingTimelineTitle(String(event.title ?? ""));
                                  setEditingTimelineDescription(String(event.description ?? ""));
                                  setEditingTimelineBook(Number(event.book_number ?? 1));
                                  setEditingTimelineOrder(Number(event.event_order ?? 1));
                                }}
                                className="rounded-full border border-zinc-700 px-3 py-1 text-[10px]"
                              >
                                Edit
                              </button>
                            )}
                            <button
                              onClick={() =>
                                setPendingDelete({
                                  id: String(event.id ?? ""),
                                  endpoint: "/api/series/timeline-events/delete",
                                  refresh: async () => {
                                    const response = await fetch(
                                      `/api/series/timeline?seriesId=${activeSeries.id}`
                                    );
                                    const data = await response.json();
                                    setSeriesTimeline(data.events ?? []);
                                  },
                                })
                              }
                              className="rounded-full border border-zinc-700 px-3 py-1 text-[10px]"
                            >
                              Delete
                            </button>
                          </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === "logs" && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Generation Logs</h2>
                <p className="text-sm text-zinc-400">
                  Track model calls and outputs for this series.
                </p>
              </div>
              <button
                onClick={async () => {
                  if (!activeSeries) return;
                  const response = await fetch(
                    `/api/series/generation-log?seriesId=${activeSeries.id}`
                  );
                  const data = await response.json();
                  setSeriesLogs(data.logs ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
              >
                Refresh Logs
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="text-xs text-zinc-300">
                Filter
                <select
                  value={logTypeFilter}
                  onChange={(event) => setLogTypeFilter(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                >
                  {logTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === "all" ? "All" : type}
                    </option>
                  ))}
                </select>
              </label>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-xs">
                <p className="text-xs text-zinc-400">Total Logs</p>
                <p className="mt-1 text-lg font-semibold text-zinc-100">
                  {filteredLogs.length}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {filteredLogs.length === 0 && (
                <p className="text-xs text-zinc-500">No logs yet.</p>
              )}
              {filteredLogs.slice(0, 10).map((log) => (
                <div
                  key={String(log.id)}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-zinc-400">
                      {String(log.type ?? "Unknown")}
                    </p>
                    <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px]">
                      {String(log.status ?? "")}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-300">
                    {String(log.summary ?? log.message ?? "")}
                  </p>
                  <p className="mt-2 text-[10px] text-zinc-500">
                    {String(log.started_at ?? "")}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Tools</h2>
            <button
              onClick={async () => {
                if (!activeSeries) return;
                await fetch("/api/series/migrate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ seriesId: activeSeries.id }),
                });
              }}
              className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
            >
              Run Legacy Migration
            </button>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            Select a series from the sidebar to work with it.
          </p>
        </section>
          </div>
        </main>
      </div>
    </div>
  );
}
