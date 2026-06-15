"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

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
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [arc, setArc] = useState<Record<string, unknown> | null>(null);
  const [seriesBible, setSeriesBible] = useState<Record<string, unknown> | null>(null);
  const [seriesMap, setSeriesMap] = useState<Record<string, unknown>[] | null>(null);
  const [characterEvolution, setCharacterEvolution] = useState<Record<string, unknown> | null>(null);
  const [bookBlueprint, setBookBlueprint] = useState<Record<string, unknown> | null>(null);
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
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [seriesWorld, setSeriesWorld] = useState<Record<string, unknown> | null>(null);
  const [worldSettingDraft, setWorldSettingDraft] = useState("");
  const [worldRulesDraft, setWorldRulesDraft] = useState("");
  const [worldLoreDraft, setWorldLoreDraft] = useState("");
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
    return seriesMemory.filter((entry) => {
      const category = String(entry.category ?? "").toLowerCase();
      const matchesCategory = canonFilter === "all" || category === canonFilter;
      const matchesQuery =
        !query || JSON.stringify(entry).toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [seriesMemory, canonFilter, canonSearch]);

  const filteredMystery = useMemo(() => {
    const query = mysterySearch.trim().toLowerCase();
    return seriesMemory.filter((entry) => {
      const matchesQuery =
        !query || JSON.stringify(entry).toLowerCase().includes(query);
      const bookValue = Number(
        entry.revealed_in_book ?? entry.planted_in_book ?? 0
      );
      const matchesBook =
        !mysteryBookFilter || bookValue === mysteryBookFilter;
      return matchesQuery && matchesBook;
    });
  }, [seriesMemory, mysterySearch, mysteryBookFilter]);

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

  const groupedCharacters = useMemo(() => {
    return seriesCharacters.reduce(
      (acc, character) => {
        const role = String(character.role ?? "supporting").toLowerCase();
        const existing = Array.isArray(acc[role]) ? acc[role] : [];
        acc[role] = [...existing, character];
        return acc;
      },
      {} as Record<string, Array<Record<string, unknown>>>
    );
  }, [seriesCharacters]);

  const selectedCharacter = useMemo(() => {
    return (
      seriesCharacters.find(
        (character) => String(character.id) === String(selectedCharacterId)
      ) ?? null
    );
  }, [seriesCharacters, selectedCharacterId]);

  const selectedCharacterRelationships = useMemo(() => {
    if (!selectedCharacter) return [];
    const name = String(selectedCharacter.name ?? "").toLowerCase();
    if (!name) return [];
    return seriesMemory.filter((entry) => {
      const a = String(entry.character_a_name ?? "").toLowerCase();
      const b = String(entry.character_b_name ?? "").toLowerCase();
      return a === name || b === name;
    });
  }, [seriesMemory, selectedCharacter]);

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
    setSelectedCharacterId(null);
    setSeriesWorld(null);
    setWorldSettingDraft("");
    setWorldRulesDraft("");
    setWorldLoreDraft("");
    setSeriesMemory([]);
    setSeriesTimeline([]);
    setPlotThreads([]);
    setSeriesLogs([]);
    setArc(null);
    setSeriesBible(null);
    setSeriesMap(null);
    setCharacterEvolution(null);
    setBookBlueprint(null);
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

  const selectSeries = async (seriesId: string) => {
    setSelectedSeriesId(seriesId);
    clearSeriesData();
    setSidebarOpen(false);

    // Load all series data in parallel for instant tab switching
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
      ] = await Promise.allSettled([
        supabase
          .from("series_books")
          .select("id,series_id,book_number,title,status,summary,novel_id")
          .eq("series_id", seriesId)
          .order("book_number", { ascending: true }),
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
        supabase
          .from("series_arcs")
          .select("overall_arc,character_arcs,themes,continuity_notes")
          .eq("series_id", seriesId)
          .order("created_at", { ascending: false })
          .limit(1),
        // Overview tab: series bible
        supabase
          .from("series_bibles")
          .select("world_overview,world_rules,history_lore,character_files,relationship_map,series_arc_summary,themes_symbols,story_rules,continuity_lockfile,unanswered_mysteries")
          .eq("series_id", seriesId)
          .limit(1),
        // Overview tab: series book maps
        supabase
          .from("series_book_maps")
          .select("book_number,map_data")
          .eq("series_id", seriesId)
          .order("book_number", { ascending: true }),
        // Overview tab: character evolution
        supabase
          .from("series_character_evolution")
          .select("evolution")
          .eq("series_id", seriesId)
          .limit(1),
        // Overview tab: book blueprints
        supabase
          .from("series_book_blueprints")
          .select("book_number,blueprint")
          .eq("series_id", seriesId)
          .order("book_number", { ascending: true }),
      ]);

      // Books (from supabase directly)
      if (booksRes.status === "fulfilled") {
        if (booksRes.value.error) {
          console.error("Error loading series_books:", booksRes.value.error);
        }
        const booksData = booksRes.value.data ?? [];
        console.log(`Loaded ${booksData.length} series_books for series ${seriesId}`);
        setSeriesBooks(booksData);
      } else {
        console.error("series_books query rejected:", booksRes.reason);
      }

      // Characters
      if (charactersRes.status === "fulfilled") {
        setSeriesCharacters(charactersRes.value.characters ?? []);
      }

      // World
      if (worldRes.status === "fulfilled") {
        const w = worldRes.value.world;
        setSeriesWorld(w ?? null);
        setWorldSettingDraft(String(w?.setting ?? ""));
        setWorldRulesDraft(String(w?.rules ?? ""));
        setWorldLoreDraft(String(w?.lore ?? ""));
      }

      // Canon / Memory (combines canon, mystery, relationships into seriesMemory)
      const canonEntries = canonRes.status === "fulfilled" ? (canonRes.value.entries ?? []) : [];
      const mysteryEntries = mysteryRes.status === "fulfilled" ? (mysteryRes.value.entries ?? []) : [];
      const relationshipEntries = relationshipsRes.status === "fulfilled" ? (relationshipsRes.value.entries ?? []) : [];
      setSeriesMemory([...canonEntries, ...mysteryEntries, ...relationshipEntries]);

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
      if (arcRes.status === "fulfilled" && arcRes.value.data && arcRes.value.data.length > 0) {
        setArc(arcRes.value.data[0] as Record<string, unknown>);
      }

      // Series bible (Overview tab)
      if (bibleRes.status === "fulfilled" && bibleRes.value.data && bibleRes.value.data.length > 0) {
        setSeriesBible(bibleRes.value.data[0] as Record<string, unknown>);
      }

      // Series book maps (Overview tab)
      if (mapsRes.status === "fulfilled" && mapsRes.value.data && mapsRes.value.data.length > 0) {
        setSeriesMap(mapsRes.value.data as unknown as Record<string, unknown>[]);
      }

      // Character evolution (Overview tab)
      if (evolutionRes.status === "fulfilled" && evolutionRes.value.data && evolutionRes.value.data.length > 0) {
        setCharacterEvolution(evolutionRes.value.data[0] as Record<string, unknown>);
      }

      // Book blueprints (Overview tab) — show the one matching suiteBookNumber or the first
      if (blueprintsRes.status === "fulfilled" && blueprintsRes.value.data && blueprintsRes.value.data.length > 0) {
        const matching = blueprintsRes.value.data.find(
          (b: Record<string, unknown>) => Number(b.book_number) === suiteBookNumber
        );
        setBookBlueprint((matching ?? blueprintsRes.value.data[0]) as Record<string, unknown>);
      }

      // Populate overview suite fields from the series row (seriesList already has the expanded fields)
      const currentSeries = seriesList.find(s => s.id === seriesId);
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
    const { data } = await supabase
      .from("series")
      .select("id,title,description,num_books,premise,genre,tone,themes,target_audience,world_name,world_description,main_conflict,status")
      .eq("user_id", userIdValue)
      .order("created_at", { ascending: false });

    if (data) {
      setSeriesList(data as SeriesSummary[]);
      const targetId = selectedSeriesId ?? (data[0]?.id ?? null);
      if (targetId && data.some((s: SeriesSummary) => s.id === targetId)) {
        // Use selectSeries to load all data for the target series
        await selectSeries(targetId);
      } else if (data[0]) {
        await selectSeries(data[0].id);
      }
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
      const { data: freshList } = await supabase
        .from("series")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
      if (freshList && freshList[0]) {
        setSelectedSeriesId(freshList[0].id);
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
                    // Save suite fields back to the series row so they persist
                    await supabase.from("series").update({
                      tone: suiteTone || null,
                      genre: suiteGenre || null,
                      target_audience: suiteTargetAudience || null,
                      themes: suiteThemes ? suiteThemes.split(",").map((t: string) => t.trim()).filter(Boolean) : null,
                      main_conflict: suiteCoreConflict || null,
                      world_name: suiteSetting ? suiteSetting.split(" — ")[0] : null,
                      world_description: suiteSetting || null,
                    }).eq("id", activeSeries.id);
                    await supabase.from("series_worlds").upsert({
                      series_id: activeSeries.id,
                      setting: suiteSetting,
                      rules: data.bible?.world_rules ?? null,
                      lore: data.bible?.history_lore ?? null,
                    });
                    const characterFiles = data.bible?.character_files ?? {};
                    await supabase.from("series_characters").delete().eq("series_id", activeSeries.id);
                    const rows = Object.entries(characterFiles).map(([name, info]) => ({
                      series_id: activeSeries.id,
                      name,
                      role: "Main",
                      description: (info as Record<string, unknown>)?.arc_summary ?? null,
                      arc: info,
                    }));
                    if (rows.length) {
                      await supabase.from("series_characters").insert(rows);
                    }
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
                  if (activeSeries && Array.isArray(data.maps)) {
                    const { error: deleteError } = await supabase.from("series_books").delete().eq("series_id", activeSeries.id);
                    if (deleteError) console.error("Failed to delete old series_books:", deleteError);
                    const rows = data.maps.map((book: Record<string, unknown>) => ({
                      series_id: activeSeries.id,
                      book_number: Number(book.book_number ?? 1),
                      title: String(book.title ?? `Book ${book.book_number ?? 1}`),
                      status: "planned",
                      summary: String(book.central_conflict ?? ""),
                    }));
                    if (rows.length) {
                      const { data: inserted, error: insertError } = await supabase
                        .from("series_books")
                        .insert(rows)
                        .select("id,series_id,book_number,title,status,summary");
                      if (insertError) console.error("Failed to insert series_books:", insertError);
                      if (inserted) {
                        const insertedBooks = inserted as SeriesBookInsertedRow[];
                        const novelRows = insertedBooks.map((bookRow) => ({
                          user_id: userId,
                          title: bookRow.title ?? `Book ${bookRow.book_number}`,
                          series_id: bookRow.series_id,
                          book_number: bookRow.book_number,
                        }));
                        const { data: novelsInserted, error: novelInsertError } = await supabase
                          .from("novels")
                          .insert(novelRows)
                          .select("id,series_id,book_number");
                        if (novelInsertError) console.error("Failed to insert novels:", novelInsertError);
                        const novels = (novelsInserted ?? []) as NovelInsertedRow[];
                        if (novels.length) {
                          const updateResults = await Promise.all(
                            novels.map((novelRow) =>
                              supabase
                                .from("series_books")
                                .update({ novel_id: novelRow.id })
                                .eq("series_id", novelRow.series_id)
                                .eq("book_number", novelRow.book_number)
                            )
                          );
                          updateResults.forEach((r, i) => {
                            if (r.error) console.error(`Failed to update novel_id for book ${i+1}:`, r.error);
                          });
                        }
                        // Reload books from database to ensure we have the full, correct data including novel_id
                        const { data: refreshedBooks, error: refreshError } = await supabase
                          .from("series_books")
                          .select("id,series_id,book_number,title,status,summary,novel_id")
                          .eq("series_id", activeSeries.id)
                          .order("book_number", { ascending: true });
                        if (refreshError) console.error("Failed to refresh series_books:", refreshError);
                        setSeriesBooks(refreshedBooks ?? insertedBooks.map((bookRow) => ({
                          ...bookRow,
                          novel_id:
                            novels.find(
                              (novelRow) =>
                                novelRow.series_id === bookRow.series_id &&
                                novelRow.book_number === bookRow.book_number
                            )?.id ?? null,
                        })));
                      }
                    }
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
                    await supabase.from("series_memory").insert({
                      series_id: activeSeries.id,
                      category: "character_evolution",
                      content: JSON.stringify(data.evolution ?? {}),
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
                    await supabase.from("series_memory").insert({
                      series_id: activeSeries.id,
                      category: `book_${suiteBookNumber}_blueprint`,
                      content: JSON.stringify(data.blueprint ?? {}),
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
                    Book {point.book}: {point.score}
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
                            Book {String(book.book_number ?? "?")}: {String(
                              book.title ?? "Untitled"
                            )}
                          </p>
                          <p className="text-xs text-zinc-400">
                            Status: {String(book.status ?? "draft")}
                          </p>
                        </div>
                        <Link
                          href={`/studio?seriesId=${book.series_id}&bookNumber=${book.book_number}`}
                          className="rounded-full border border-zinc-700 px-3 py-1 text-[10px]"
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
                        Book {String(mapItem.book_number ?? idx + 1)} → Studio
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
            {bookBlueprint && (
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
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Characters</h2>
                <p className="text-sm text-zinc-400">
                  Manage the characters across your series.
                </p>
              </div>
              <button
                onClick={async () => {
                  if (!activeSeries) return;
                  const response = await fetch(
                    `/api/series/characters?seriesId=${activeSeries.id}`
                  );
                  const data = await response.json();
                  setSeriesCharacters(data.characters ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
              >
                Refresh Characters
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-4">
              {[
                { label: "Protagonists", key: "protagonist" },
                { label: "Antagonists", key: "antagonist" },
                { label: "Supporting", key: "supporting" },
                { label: "Other", key: "" },
              ].map((item) => {
                const count = Object.entries(groupedCharacters).reduce(
                  (acc, [role, list]) => {
                    const items = Array.isArray(list) ? list : [];
                    if (item.key && role.includes(item.key)) {
                      return acc + items.length;
                    }
                    if (!item.key && !role.includes("protagonist") && !role.includes("antagonist") && !role.includes("support")) {
                      return acc + items.length;
                    }
                    return acc;
                  },
                  0
                );
                return (
                  <div
                    key={item.label}
                    className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-xs"
                  >
                    <p className="text-xs text-zinc-400">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-100">
                      {count}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="space-y-3">
                {Object.keys(groupedCharacters).length === 0 && (
                  <p className="text-sm text-zinc-500">No characters yet.</p>
                )}
                {Object.entries(groupedCharacters).map(([role, characters]) => {
                  const list = Array.isArray(characters) ? characters : [];
                  return (
                    <div key={role} className="space-y-2">
                      <p className="text-xs font-semibold uppercase text-zinc-400">
                        {role || "Uncategorized"}
                      </p>
                      {list.map((character) => (
                        <button
                          key={String(character.id)}
                          onClick={() => setSelectedCharacterId(String(character.id ?? ""))}
                          className={`w-full rounded-lg border px-4 py-3 text-left text-xs transition ${
                            String(character.id) === String(selectedCharacterId)
                              ? "border-emerald-400/60 bg-emerald-500/10"
                              : "border-zinc-800 bg-zinc-950/60"
                          }`}
                        >
                          <p className="text-sm font-semibold text-zinc-100">
                            {String(character.name ?? "Unnamed")}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {String(character.role ?? "Supporting")}
                          </p>
                          {character.description && (
                            <p className="mt-2 text-xs text-zinc-300">
                              {String(character.description)}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200">
                {selectedCharacter ? (
                  <>
                    <p className="text-sm font-semibold text-zinc-100">
                      {String(selectedCharacter.name ?? "Unnamed")}
                    </p>
                    <p className="text-xs text-zinc-400">
                      Role: {String(selectedCharacter.role ?? "Supporting")}
                    </p>
                    <p className="mt-3 text-xs">
                      {String(selectedCharacter.description ?? "No description yet.")}
                    </p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                        <p className="text-[10px] uppercase text-zinc-400">Motivation</p>
                        <p className="mt-2 text-xs text-zinc-200">
                          {String(selectedCharacter.motivation ?? "Not set")}
                        </p>
                      </div>
                      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                        <p className="text-[10px] uppercase text-zinc-400">Conflict</p>
                        <p className="mt-2 text-xs text-zinc-200">
                          {String(selectedCharacter.conflict ?? "Not set")}
                        </p>
                      </div>
                      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                        <p className="text-[10px] uppercase text-zinc-400">Personality</p>
                        <p className="mt-2 text-xs text-zinc-200">
                          {String(selectedCharacter.personality ?? "Not set")}
                        </p>
                      </div>
                      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                        <p className="text-[10px] uppercase text-zinc-400">Backstory</p>
                        <p className="mt-2 text-xs text-zinc-200">
                          {String(selectedCharacter.backstory ?? "Not set")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold uppercase text-zinc-400">
                        Emotional Memory
                      </p>
                      <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-3 text-xs text-zinc-200">
                        {selectedCharacter.emotional_memory ? (
                          <pre className="whitespace-pre-wrap text-[11px]">
                            {JSON.stringify(selectedCharacter.emotional_memory ?? {}, null, 2)}
                          </pre>
                        ) : (
                          <p className="text-xs text-zinc-400">No emotional memory captured.</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold uppercase text-zinc-400">
                        Arc Stages
                      </p>
                      <div className="space-y-2">
                        {(() => {
                          const arcStages = Array.isArray(selectedCharacter.arc_stages)
                            ? selectedCharacter.arc_stages
                            : Array.isArray((selectedCharacter.arc as { stages?: unknown })?.stages)
                              ? ((selectedCharacter.arc as { stages?: unknown[] }).stages ?? [])
                              : [];
                          return arcStages.slice(0, 4).map((stage, index) => (
                            <div
                              key={`${selectedCharacter.id}-stage-${index}`}
                              className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-200"
                            >
                              {typeof stage === "string" ? stage : JSON.stringify(stage)}
                            </div>
                          ));
                        })()}
                        {!Array.isArray(selectedCharacter.arc_stages) &&
                          !Array.isArray((selectedCharacter.arc as { stages?: unknown })?.stages) && (
                            <p className="text-xs text-zinc-400">No arc stages available.</p>
                          )}
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold uppercase text-zinc-400">
                        Relationships Snapshot
                      </p>
                      <div className="space-y-2">
                        {selectedCharacterRelationships.slice(0, 4).map((relationship) => (
                          <div
                            key={String(relationship.id)}
                            className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-200"
                          >
                            <p className="text-xs text-zinc-400">
                              {String(relationship.character_a_name ?? "?")} ↔ {String(
                                relationship.character_b_name ?? "?"
                              )}
                            </p>
                            <p className="mt-1 text-xs">
                              {String(relationship.relationship_type ?? "")}
                            </p>
                          </div>
                        ))}
                        {selectedCharacterRelationships.length === 0 && (
                          <p className="text-xs text-zinc-400">No relationships logged.</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold uppercase text-zinc-400">
                        Arc Snapshot
                      </p>
                      <pre className="whitespace-pre-wrap rounded-lg bg-zinc-900/70 p-3 text-[11px] text-zinc-200">
                        {JSON.stringify(selectedCharacter.arc ?? {}, null, 2)}
                      </pre>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-zinc-400">
                    Select a character to view details.
                  </p>
                )}
              </div>
            </div>
          </section>
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
                  setSeriesWorld(data.world ?? null);
                  setWorldSettingDraft(String(data.world?.setting ?? ""));
                  setWorldRulesDraft(String(data.world?.rules ?? ""));
                  setWorldLoreDraft(String(data.world?.lore ?? ""));
                }}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
              >
                Refresh World
              </button>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="space-y-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <p className="text-xs uppercase text-zinc-400">World Overview</p>
                  <p className="mt-2 text-sm text-zinc-200">
                    {String(seriesWorld?.summary ?? "Add a world summary to guide your series.")}
                  </p>
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
                        setting: worldSettingDraft,
                        rules: worldRulesDraft,
                        lore: worldLoreDraft,
                      }),
                    });
                    const response = await fetch(
                      `/api/series/world?seriesId=${activeSeries.id}`
                    );
                    const data = await response.json();
                    setSeriesWorld(data.world ?? null);
                  }}
                  className="rounded-full border border-emerald-500/60 px-4 py-2.5 text-sm text-emerald-200"
                >
                  Save World Overview
                </button>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <p className="text-xs uppercase text-zinc-400">World Elements</p>
                  <p className="mt-2 text-xs text-zinc-400">
                    {Array.isArray(seriesWorld?.elements) && seriesWorld?.elements.length
                      ? "Elements linked to this series."
                      : "No world elements yet. Add them from the Studio workflow or API."}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(seriesWorld?.elements ?? [], null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "canon" && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="text-xl font-semibold">Canon Log</h2>
            <p className="text-sm text-zinc-400">
              Canon facts that must never change.
            </p>
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
            </div>
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
                    }),
                  });
                  setCanonFact("");
                  const response = await fetch(
                    `/api/series/canon?seriesId=${activeSeries.id}`
                  );
                  const data = await response.json();
                  setSeriesMemory(data.entries ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
              >
                Add Canon Fact
              </button>
              <button
                onClick={() => {
                  setCanonFilter("all");
                  setCanonSearch("");
                }}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
              >
                Clear Filters
              </button>
              <button
                onClick={async () => {
                  if (!activeSeries) return;
                  const response = await fetch(
                    `/api/series/canon?seriesId=${activeSeries.id}`
                  );
                  const data = await response.json();
                  setSeriesMemory(data.entries ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
              >
                Refresh Canon
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {seriesMemory.map((entry) => (
                <div
                  key={String(entry.id)}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200"
                >
                  <p className="text-xs text-zinc-400">
                    <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px]">
                      {String(entry.category ?? "fact")}
                    </span>
                    <span className="ml-2">{String(entry.source ?? "")}</span>
                  </p>
                  {editingCanonId === String(entry.id ?? "") ? (
                    <div className="mt-2 space-y-2">
                      <select
                        value={editingCanonCategory}
                        onChange={(event) => setEditingCanonCategory(event.target.value)}
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                      >
                        <option value="world">World</option>
                        <option value="character">Character</option>
                        <option value="event">Event</option>
                        <option value="rule">Rule</option>
                      </select>
                      <textarea
                        value={editingCanonFact}
                        onChange={(event) => setEditingCanonFact(event.target.value)}
                        className="min-h-[80px] w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                      />
                    </div>
                  ) : (
                    <p className="mt-2 text-xs">{String(entry.fact ?? "")}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {editingCanonId === String(entry.id ?? "") ? (
                      <button
                        onClick={async () => {
                          await fetch("/api/series/canon/update", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              id: String(entry.id ?? ""),
                              fact: editingCanonFact,
                              category: editingCanonCategory,
                            }),
                          });
                          setEditingCanonId(null);
                          const refreshed = await fetch(
                            `/api/series/canon?seriesId=${activeSeries.id}`
                          );
                          const data = await refreshed.json();
                          setSeriesMemory(data.entries ?? []);
                        }}
                        className="rounded-full border border-emerald-500/60 px-3 py-1 text-[10px] text-emerald-200"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingCanonId(String(entry.id ?? ""));
                          setEditingCanonFact(String(entry.fact ?? ""));
                          setEditingCanonCategory(String(entry.category ?? "world"));
                        }}
                        className="rounded-full border border-zinc-700 px-3 py-1 text-[10px]"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setPendingDelete({
                          id: String(entry.id ?? ""),
                          endpoint: "/api/series/canon/delete",
                          refresh: async () => {
                            const refreshed = await fetch(
                              `/api/series/canon?seriesId=${activeSeries.id}`
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
          </section>
        )}

        {activeTab === "mystery" && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="text-xl font-semibold">Mystery Log</h2>
            <p className="text-sm text-zinc-400">
              Secrets and clues across the series.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-xs text-zinc-300">
                Secret title
                <input
                  value={mysteryTitle}
                  onChange={(event) => setMysteryTitle(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                />
              </label>
              <label className="text-xs text-zinc-300">
                Clue book #
                <input
                  type="number"
                  value={clueBook}
                  onChange={(event) => setClueBook(Number(event.target.value) || 1)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                />
              </label>
              <label className="text-xs text-zinc-300 md:col-span-2">
                Secret description
                <textarea
                  value={mysteryDescription}
                  onChange={(event) => setMysteryDescription(event.target.value)}
                  className="min-h-[90px] rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                />
              </label>
              <label className="text-xs text-zinc-300 md:col-span-2">
                Clue description
                <textarea
                  value={clueDescription}
                  onChange={(event) => setClueDescription(event.target.value)}
                  className="min-h-[90px] rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                />
              </label>
            </div>
            <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-xs text-zinc-300">
              Tip: Use consistent titles to connect clues with secrets (ex: "The Key" clue for "The Key" secret).
            </div>
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
              <button
                onClick={() => {
                  setMysterySearch("");
                  setMysteryBookFilter(0);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
              >
                Clear Filters
              </button>
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
                    }),
                  });
                  setMysteryTitle("");
                  setMysteryDescription("");
                  const response = await fetch(
                    `/api/series/mystery?seriesId=${activeSeries.id}`
                  );
                  const data = await response.json();
                  setSeriesMemory(data.secrets ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
              >
                Add Secret
              </button>
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
                      plantedInBook: clueBook,
                    }),
                  });
                  setClueDescription("");
                  const response = await fetch(
                    `/api/series/mystery?seriesId=${activeSeries.id}`
                  );
                  const data = await response.json();
                  setSeriesMemory(data.secrets ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
              >
                Add Clue
              </button>
              <button
                onClick={async () => {
                  if (!activeSeries) return;
                  const response = await fetch(
                    `/api/series/mystery?seriesId=${activeSeries.id}`
                  );
                  const data = await response.json();
                  setSeriesMemory(data.secrets ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm"
              >
                Refresh Mysteries
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {filteredMystery.map((secret) => (
                <div
                  key={String(secret.id)}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200"
                >
                  {editingSecretId === String(secret.id ?? "") ? (
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
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-zinc-100">
                        {String(secret.title ?? "Secret")}
                      </p>
                      <p className="mt-2 text-xs">{String(secret.description ?? "")}</p>
                      <p className="mt-2 text-[10px] text-zinc-500">
                        Status: {String(secret.status ?? "open")}
                      </p>
                    </>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {editingSecretId === String(secret.id ?? "") ? (
                      <button
                        onClick={async () => {
                          await fetch("/api/series/mystery/secret", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              id: String(secret.id ?? ""),
                              title: editingSecretTitle,
                              description: editingSecretDescription,
                            }),
                          });
                          setEditingSecretId(null);
                          const refreshed = await fetch(
                            `/api/series/mystery?seriesId=${activeSeries.id}`
                          );
                          const data = await refreshed.json();
                          setSeriesMemory(data.secrets ?? []);
                        }}
                        className="rounded-full border border-emerald-500/60 px-3 py-1 text-[10px] text-emerald-200"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingSecretId(String(secret.id ?? ""));
                          setEditingSecretTitle(String(secret.title ?? ""));
                          setEditingSecretDescription(String(secret.description ?? ""));
                        }}
                        className="rounded-full border border-zinc-700 px-3 py-1 text-[10px]"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setPendingDelete({
                          id: String(secret.id ?? ""),
                          endpoint: "/api/series/mystery/secret/delete",
                          refresh: async () => {
                            const refreshed = await fetch(
                              `/api/series/mystery?seriesId=${activeSeries.id}`
                            );
                            const data = await refreshed.json();
                            setSeriesMemory(data.secrets ?? []);
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
              {filteredMystery.map((clue) => (
                <div
                  key={`clue-${String(clue.id)}`}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200"
                >
                  {editingClueId === String(clue.id ?? "") ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingClueDescription}
                        onChange={(event) => setEditingClueDescription(event.target.value)}
                        className="min-h-[80px] w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                      />
                      <input
                        type="number"
                        value={editingClueBook}
                        onChange={(event) => setEditingClueBook(Number(event.target.value) || 1)}
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-zinc-400">Clue</p>
                      <p className="mt-2 text-xs">{String(clue.description ?? "")}</p>
                      <p className="mt-2 text-[10px] text-zinc-500">
                        Planted in book {String(clue.planted_in_book ?? "?")}
                      </p>
                    </>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {editingClueId === String(clue.id ?? "") ? (
                      <button
                        onClick={async () => {
                          await fetch("/api/series/mystery/clue", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              id: String(clue.id ?? ""),
                              description: editingClueDescription,
                              plantedInBook: editingClueBook,
                            }),
                          });
                          setEditingClueId(null);
                          const refreshed = await fetch(
                            `/api/series/mystery?seriesId=${activeSeries.id}`
                          );
                          const data = await refreshed.json();
                          setSeriesMemory(data.secrets ?? []);
                        }}
                        className="rounded-full border border-emerald-500/60 px-3 py-1 text-[10px] text-emerald-200"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingClueId(String(clue.id ?? ""));
                          setEditingClueDescription(String(clue.description ?? ""));
                          setEditingClueBook(Number(clue.planted_in_book ?? 1));
                        }}
                        className="rounded-full border border-zinc-700 px-3 py-1 text-[10px]"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setPendingDelete({
                          id: String(clue.id ?? ""),
                          endpoint: "/api/series/mystery/clue/delete",
                          refresh: async () => {
                            const refreshed = await fetch(
                              `/api/series/mystery?seriesId=${activeSeries.id}`
                            );
                            const data = await refreshed.json();
                            setSeriesMemory(data.secrets ?? []);
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
                      Book {String(thread.introduced_in_book ?? "?")}
                      {thread.resolved_in_book ? ` → Book ${thread.resolved_in_book}` : ""}
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
                  const { data } = await supabase
                    .from("series_books")
                    .select("*")
                    .eq("series_id", activeSeries.id)
                    .order("book_number", { ascending: true });
                  setSeriesBooks(data ?? []);
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
                      Book {String(book.book_number ?? "?")}: {String(
                        book.title ?? "Untitled"
                      )}
                    </p>
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
                          Book {Number(bookNumber) || "Unassigned"}
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
                                  Book {String(event.book_number ?? "?")}
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
