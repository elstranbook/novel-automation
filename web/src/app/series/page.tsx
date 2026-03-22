"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

const modelOptions = ["gpt-4.1-mini", "gpt-4.1", "gpt-4o", "gpt-4"];

type SeriesSummary = {
  id: string;
  title: string;
  description: string | null;
  num_books: number;
};

export default function SeriesPage() {
  const supabase = createSupabaseBrowserClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [seriesList, setSeriesList] = useState<SeriesSummary[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [numBooks, setNumBooks] = useState(3);
  const [model, setModel] = useState(modelOptions[0]);
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
  const [suiteTone, setSuiteTone] = useState("Emotional, dramatic, hopeful");
  const [suiteSetting, setSuiteSetting] = useState("Contemporary");
  const [suiteCharacters, setSuiteCharacters] = useState("");
  const [suiteThemes, setSuiteThemes] = useState(
    "Coming of age, identity, relationships"
  );
  const [suiteCoreConflict, setSuiteCoreConflict] = useState("");
  const [suiteBookNumber, setSuiteBookNumber] = useState(1);
  const [activeTab, setActiveTab] = useState("overview");
  const [seriesCharacters, setSeriesCharacters] = useState<
    Array<Record<string, unknown>>
  >([]);
  const [seriesWorld, setSeriesWorld] = useState<Record<string, unknown> | null>(null);
  const [seriesMemory, setSeriesMemory] = useState<Array<Record<string, unknown>>>([]);
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
  const [newMemoryContent, setNewMemoryContent] = useState("");
  const [newMemoryCategory, setNewMemoryCategory] = useState("canon");
  const [memoryStatus, setMemoryStatus] = useState<string | null>(null);
  const [memoryWarnings, setMemoryWarnings] = useState<
    Array<{ id: string; message: string; severity: string }>
  >([]);

  const loadSeries = async (userIdValue: string) => {
    const { data } = await supabase
      .from("series")
      .select("id,title,description,num_books")
      .eq("user_id", userIdValue)
      .order("created_at", { ascending: false });

    if (data) {
      setSeriesList(data as SeriesSummary[]);
      if (data[0]) {
        const { data: bookRows } = await supabase
          .from("series_books")
          .select("id,series_id,book_number,title,status,summary,novel_id")
          .eq("series_id", data[0].id)
          .order("book_number", { ascending: true });
        setSeriesBooks(bookRows ?? []);
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
        window.location.href = "/login";
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
      await loadSeries(user.id);
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
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-900"
              >
                Delete
              </button>
              <button
                onClick={() => setPendingDelete(null)}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="text-sm text-zinc-400">
              ← Back to home
            </Link>
            {authEmail && (
              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <span>{authEmail}</span>
                <button
                  onClick={async () => {
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
          <h1 className="text-3xl font-semibold">Series Mode</h1>
          <p className="text-zinc-300">
            Create series arcs and jump directly into book generation.
          </p>
          {userId ? (
            <span className="text-xs text-zinc-400">Signed in</span>
          ) : (
            <Link href="/login" className="text-xs underline text-zinc-400">
              Sign in to save series
            </Link>
          )}
        </header>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-xl font-semibold">Create new series</h2>
          <div className="mt-4 grid gap-4">
            <label className="flex flex-col gap-2 text-sm">
              Series title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm">
                Number of books
                <input
                  type="number"
                  value={numBooks}
                  onChange={(event) => setNumBooks(Number(event.target.value))}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
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
            </div>
            <button
              onClick={createSeries}
              disabled={!title || loading}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create series & arc"}
            </button>
            <p className="text-xs text-zinc-500">
              The series suite uses the most recent series in your list.
            </p>
          </div>
        </section>

        {arc && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="text-xl font-semibold">Latest series arc</h2>
            <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-zinc-950/60 p-4 text-xs text-zinc-200">
              {JSON.stringify(arc, null, 2)}
            </pre>
          </section>
        )}

        <div className="flex flex-wrap gap-2">
          {[
            { id: "overview", label: "Overview" },
            { id: "characters", label: "Characters" },
            { id: "world", label: "World" },
            { id: "canon", label: "Canon" },
            { id: "mystery", label: "Mystery" },
            { id: "relationships", label: "Relationships" },
            { id: "memory", label: "Memory" },
            { id: "timeline", label: "Timeline" },
            { id: "logs", label: "Generation Logs" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
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
              Tone / Vibe
              <input
                value={suiteTone}
                onChange={(event) => setSuiteTone(event.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                placeholder="Emotional, dramatic, hopeful"
              />
            </label>
            <label className="text-xs text-zinc-300">
              Setting
              <input
                value={suiteSetting}
                onChange={(event) => setSuiteSetting(event.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                placeholder="Contemporary"
              />
            </label>
            <label className="text-xs text-zinc-300 md:col-span-2">
              Main Characters (comma-separated)
              <input
                value={suiteCharacters}
                onChange={(event) => setSuiteCharacters(event.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                placeholder="Character 1, Character 2"
              />
            </label>
            <label className="text-xs text-zinc-300 md:col-span-2">
              Core Conflict
              <input
                value={suiteCoreConflict}
                onChange={(event) => setSuiteCoreConflict(event.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                placeholder="A secret threatens to unravel everything"
              />
            </label>
            <label className="text-xs text-zinc-300 md:col-span-2">
              Themes
              <input
                value={suiteThemes}
                onChange={(event) => setSuiteThemes(event.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
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
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
              />
            </label>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <button
              onClick={async () => {
                setLoadingStep("bible");
                setError(null);
                try {
                  if (!seriesList[0]) throw new Error("Create a series first");
                  const response = await fetch("/api/generate/series/bible", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      seriesId: seriesList[0].id,
                      title: seriesList[0].title,
                      genre: "Young Adult Fiction",
                      targetAge: "13-18",
                      tone: suiteTone,
                      setting: suiteSetting || description || "Contemporary",
                      mainCharacters: suiteCharacters,
                      coreConflict: suiteCoreConflict || description || "",
                      themes: suiteThemes,
                      numBooks: seriesList[0].num_books,
                      model,
                    }),
                  });
                  if (!response.ok) throw new Error("Failed to generate series bible");
                  const data = await response.json();
                  setSeriesBible(data.bible ?? null);
                  if (seriesList[0]) {
                    await supabase.from("series_worlds").upsert({
                      series_id: seriesList[0].id,
                      setting: suiteSetting,
                      rules: data.bible?.world_rules ?? null,
                      lore: data.bible?.history_lore ?? null,
                    });
                    const characterFiles = data.bible?.character_files ?? {};
                    await supabase.from("series_characters").delete().eq("series_id", seriesList[0].id);
                    const rows = Object.entries(characterFiles).map(([name, info]) => ({
                      series_id: seriesList[0].id,
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
              className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
            >
              {loadingStep === "bible" ? "Generating..." : "Generate Series Bible"}
            </button>
            <button
              onClick={async () => {
                setLoadingStep("map");
                setError(null);
                try {
                  if (!seriesList[0]) throw new Error("Create a series first");
                  if (!userId) throw new Error("Please sign in");
                  const response = await fetch("/api/generate/series/map", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      seriesId: seriesList[0].id,
                      title: seriesList[0].title,
                      numBooks: seriesList[0].num_books,
                      model,
                    }),
                  });
                  if (!response.ok) throw new Error("Failed to generate series map");
                  const data = await response.json();
                  setSeriesMap(data.maps ?? null);
                  if (seriesList[0] && Array.isArray(data.maps)) {
                    await supabase.from("series_books").delete().eq("series_id", seriesList[0].id);
                    const rows = data.maps.map((book: Record<string, unknown>) => ({
                      series_id: seriesList[0].id,
                      book_number: Number(book.book_number ?? 1),
                      title: String(book.title ?? `Book ${book.book_number ?? 1}`),
                      status: "planned",
                      summary: String(book.central_conflict ?? ""),
                    }));
                    if (rows.length) {
                      const { data: inserted } = await supabase
                        .from("series_books")
                        .insert(rows)
                        .select("id,series_id,book_number,title,status,summary");
                      if (inserted) {
                        const novelRows = inserted.map((bookRow) => ({
                          user_id: userId,
                          title: bookRow.title ?? `Book ${bookRow.book_number}`,
                          series_id: bookRow.series_id,
                          book_number: bookRow.book_number,
                        }));
                        const { data: novelsInserted } = await supabase
                          .from("novels")
                          .insert(novelRows)
                          .select("id,series_id,book_number");
                        if (novelsInserted) {
                          await Promise.all(
                            novelsInserted.map((novelRow) =>
                              supabase
                                .from("series_books")
                                .update({ novel_id: novelRow.id })
                                .eq("series_id", novelRow.series_id)
                                .eq("book_number", novelRow.book_number)
                            )
                          );
                        }
                        setSeriesBooks(
                          inserted.map((bookRow) => ({
                            ...bookRow,
                            novel_id:
                              novelsInserted?.find(
                                (novelRow) =>
                                  novelRow.series_id === bookRow.series_id &&
                                  novelRow.book_number === bookRow.book_number
                              )?.id ?? null,
                          }))
                        );
                      }
                    }
                  }
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Unknown error");
                } finally {
                  setLoadingStep(null);
                }
              }}
              className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
            >
              {loadingStep === "map" ? "Generating..." : "Generate Series Map"}
            </button>
            <button
              onClick={async () => {
                setLoadingStep("evolution");
                setError(null);
                try {
                  if (!seriesList[0]) throw new Error("Create a series first");
                  const response = await fetch("/api/generate/series/evolution", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      seriesId: seriesList[0].id,
                      numBooks: seriesList[0].num_books,
                      characters: suiteCharacters
                        ? suiteCharacters.split(",").map((name) => name.trim())
                        : ["Main Character"],
                      model,
                    }),
                  });
                  if (!response.ok) throw new Error("Failed to generate evolution");
                  const data = await response.json();
                  setCharacterEvolution(data.evolution ?? null);
                  if (seriesList[0]) {
                    await supabase.from("series_memory").insert({
                      series_id: seriesList[0].id,
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
              className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
            >
              {loadingStep === "evolution" ? "Generating..." : "Generate Character Evolution"}
            </button>
            <button
              onClick={async () => {
                setLoadingStep("blueprint");
                setError(null);
                try {
                  if (!seriesList[0]) throw new Error("Create a series first");
                  const response = await fetch("/api/generate/series/blueprint", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      seriesId: seriesList[0].id,
                      title: seriesList[0].title,
                      numBooks: seriesList[0].num_books,
                      bookNumber: suiteBookNumber,
                      model,
                    }),
                  });
                  if (!response.ok) throw new Error("Failed to generate blueprint");
                  const data = await response.json();
                  setBookBlueprint(data.blueprint ?? null);
                  if (seriesList[0]) {
                    await supabase.from("series_memory").insert({
                      series_id: seriesList[0].id,
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
              className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
            >
              {loadingStep === "blueprint" ? "Generating..." : "Generate Book Blueprint"}
            </button>
          </div>
          <div className="mt-6 space-y-4">
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
                      {book.summary && (
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
            <h2 className="text-xl font-semibold">Characters</h2>
            <p className="text-sm text-zinc-400">
              Manage the characters across your series.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={async () => {
                  if (!seriesList[0]) return;
                  const response = await fetch(
                    `/api/series/characters?seriesId=${seriesList[0].id}`
                  );
                  const data = await response.json();
                  setSeriesCharacters(data.characters ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
              >
                Refresh Characters
              </button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {seriesCharacters.map((character) => (
                <div
                  key={String(character.id)}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200"
                >
                  <p className="text-sm font-semibold text-zinc-100">
                    {String(character.name ?? "Unnamed")}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {String(character.role ?? "")}
                  </p>
                  <p className="mt-2 text-xs">
                    {String(character.description ?? "")}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "world" && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="text-xl font-semibold">World</h2>
            <p className="text-sm text-zinc-400">
              Track world rules, lore, and settings.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={async () => {
                  if (!seriesList[0]) return;
                  const response = await fetch(
                    `/api/series/world?seriesId=${seriesList[0].id}`
                  );
                  const data = await response.json();
                  setSeriesWorld(data.world ?? null);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
              >
                Refresh World
              </button>
            </div>
            {seriesWorld ? (
              <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-zinc-950/60 p-4 text-xs text-zinc-200">
                {JSON.stringify(seriesWorld, null, 2)}
              </pre>
            ) : (
              <p className="mt-4 text-xs text-zinc-500">No world data yet.</p>
            )}
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
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
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
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                  placeholder="Book 1, Chapter 3"
                />
              </label>
              <label className="text-xs text-zinc-300 md:col-span-2">
                Canon fact
                <textarea
                  value={canonFact}
                  onChange={(event) => setCanonFact(event.target.value)}
                  className="min-h-[100px] rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="text-xs text-zinc-300">
                Filter
                <select
                  value={canonFilter}
                  onChange={(event) => setCanonFilter(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
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
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                />
              </label>
              <button
                onClick={async () => {
                  if (!seriesList[0] || !canonFact) return;
                  await fetch("/api/series/canon", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      seriesId: seriesList[0].id,
                      category: canonCategory,
                      fact: canonFact,
                      source: canonSource,
                    }),
                  });
                  setCanonFact("");
                  const response = await fetch(
                    `/api/series/canon?seriesId=${seriesList[0].id}`
                  );
                  const data = await response.json();
                  setSeriesMemory(data.entries ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
              >
                Add Canon Fact
              </button>
              <button
                onClick={() => {
                  setCanonFilter("all");
                  setCanonSearch("");
                }}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
              >
                Clear Filters
              </button>
              <button
                onClick={async () => {
                  if (!seriesList[0]) return;
                  const response = await fetch(
                    `/api/series/canon?seriesId=${seriesList[0].id}`
                  );
                  const data = await response.json();
                  setSeriesMemory(data.entries ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
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
                  {editingCanonId === entry.id ? (
                    <div className="mt-2 space-y-2">
                      <select
                        value={editingCanonCategory}
                        onChange={(event) => setEditingCanonCategory(event.target.value)}
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                      >
                        <option value="world">World</option>
                        <option value="character">Character</option>
                        <option value="event">Event</option>
                        <option value="rule">Rule</option>
                      </select>
                      <textarea
                        value={editingCanonFact}
                        onChange={(event) => setEditingCanonFact(event.target.value)}
                        className="min-h-[80px] w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                      />
                    </div>
                  ) : (
                    <p className="mt-2 text-xs">{String(entry.fact ?? "")}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {editingCanonId === entry.id ? (
                      <button
                        onClick={async () => {
                          await fetch("/api/series/canon/update", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              id: entry.id,
                              fact: editingCanonFact,
                              category: editingCanonCategory,
                            }),
                          });
                          setEditingCanonId(null);
                          const refreshed = await fetch(
                            `/api/series/canon?seriesId=${seriesList[0].id}`
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
                          setEditingCanonId(entry.id);
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
                          id: entry.id,
                          endpoint: "/api/series/canon/delete",
                          refresh: async () => {
                            const refreshed = await fetch(
                              `/api/series/canon?seriesId=${seriesList[0].id}`
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
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                />
              </label>
              <label className="text-xs text-zinc-300">
                Clue book #
                <input
                  type="number"
                  value={clueBook}
                  onChange={(event) => setClueBook(Number(event.target.value) || 1)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                />
              </label>
              <label className="text-xs text-zinc-300 md:col-span-2">
                Secret description
                <textarea
                  value={mysteryDescription}
                  onChange={(event) => setMysteryDescription(event.target.value)}
                  className="min-h-[90px] rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                />
              </label>
              <label className="text-xs text-zinc-300 md:col-span-2">
                Clue description
                <textarea
                  value={clueDescription}
                  onChange={(event) => setClueDescription(event.target.value)}
                  className="min-h-[90px] rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="text-xs text-zinc-300">
                Search
                <input
                  value={mysterySearch}
                  onChange={(event) => setMysterySearch(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                />
              </label>
              <label className="text-xs text-zinc-300">
                Book #
                <input
                  type="number"
                  value={mysteryBookFilter || ""}
                  onChange={(event) => setMysteryBookFilter(Number(event.target.value) || 0)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                />
              </label>
              <button
                onClick={() => {
                  setMysterySearch("");
                  setMysteryBookFilter(0);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
              >
                Clear Filters
              </button>
              <button
                onClick={async () => {
                  if (!seriesList[0] || !mysteryTitle || !mysteryDescription) return;
                  await fetch("/api/series/mystery", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      type: "secret",
                      seriesId: seriesList[0].id,
                      title: mysteryTitle,
                      description: mysteryDescription,
                    }),
                  });
                  setMysteryTitle("");
                  setMysteryDescription("");
                  const response = await fetch(
                    `/api/series/mystery?seriesId=${seriesList[0].id}`
                  );
                  const data = await response.json();
                  setSeriesMemory(data.secrets ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
              >
                Add Secret
              </button>
              <button
                onClick={async () => {
                  if (!seriesList[0] || !clueDescription) return;
                  await fetch("/api/series/mystery", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      type: "clue",
                      seriesId: seriesList[0].id,
                      description: clueDescription,
                      plantedInBook: clueBook,
                    }),
                  });
                  setClueDescription("");
                  const response = await fetch(
                    `/api/series/mystery?seriesId=${seriesList[0].id}`
                  );
                  const data = await response.json();
                  setSeriesMemory(data.secrets ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
              >
                Add Clue
              </button>
              <button
                onClick={async () => {
                  if (!seriesList[0]) return;
                  const response = await fetch(
                    `/api/series/mystery?seriesId=${seriesList[0].id}`
                  );
                  const data = await response.json();
                  setSeriesMemory(data.secrets ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
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
                  {editingSecretId === secret.id ? (
                    <div className="space-y-2">
                      <input
                        value={editingSecretTitle}
                        onChange={(event) => setEditingSecretTitle(event.target.value)}
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                      />
                      <textarea
                        value={editingSecretDescription}
                        onChange={(event) => setEditingSecretDescription(event.target.value)}
                        className="min-h-[80px] w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-zinc-100">
                        {String(secret.title ?? "Secret")}
                      </p>
                      <p className="mt-2 text-xs">{String(secret.description ?? "")}</p>
                    </>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {editingSecretId === secret.id ? (
                      <button
                        onClick={async () => {
                          await fetch("/api/series/mystery/secret", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              id: secret.id,
                              title: editingSecretTitle,
                              description: editingSecretDescription,
                            }),
                          });
                          setEditingSecretId(null);
                          const refreshed = await fetch(
                            `/api/series/mystery?seriesId=${seriesList[0].id}`
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
                          setEditingSecretId(secret.id);
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
                          id: secret.id,
                          endpoint: "/api/series/mystery/secret/delete",
                          refresh: async () => {
                            const refreshed = await fetch(
                              `/api/series/mystery?seriesId=${seriesList[0].id}`
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
                  {editingClueId === clue.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingClueDescription}
                        onChange={(event) => setEditingClueDescription(event.target.value)}
                        className="min-h-[80px] w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                      />
                      <input
                        type="number"
                        value={editingClueBook}
                        onChange={(event) => setEditingClueBook(Number(event.target.value) || 1)}
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-zinc-400">Clue</p>
                      <p className="mt-2 text-xs">{String(clue.description ?? "")}</p>
                    </>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {editingClueId === clue.id ? (
                      <button
                        onClick={async () => {
                          await fetch("/api/series/mystery/clue", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              id: clue.id,
                              description: editingClueDescription,
                              plantedInBook: editingClueBook,
                            }),
                          });
                          setEditingClueId(null);
                          const refreshed = await fetch(
                            `/api/series/mystery?seriesId=${seriesList[0].id}`
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
                          setEditingClueId(clue.id);
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
                          id: clue.id,
                          endpoint: "/api/series/mystery/clue/delete",
                          refresh: async () => {
                            const refreshed = await fetch(
                              `/api/series/mystery?seriesId=${seriesList[0].id}`
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
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                />
              </label>
              <label className="text-xs text-zinc-300">
                Character B
                <input
                  value={relationshipB}
                  onChange={(event) => setRelationshipB(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                />
              </label>
              <label className="text-xs text-zinc-300">
                Relationship type
                <select
                  value={relationshipType}
                  onChange={(event) => setRelationshipType(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
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
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
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
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
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
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                />
              </label>
              <button
                onClick={() => {
                  setRelationshipsStatusFilter("all");
                  setRelationshipsSearch("");
                }}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
              >
                Clear Filters
              </button>
              <button
                onClick={async () => {
                  if (!seriesList[0] || !relationshipA || !relationshipB) return;
                  await fetch("/api/series/relationships/entries", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      seriesId: seriesList[0].id,
                      characterAName: relationshipA,
                      characterBName: relationshipB,
                      relationshipType,
                      status: relationshipStatus,
                    }),
                  });
                  setRelationshipA("");
                  setRelationshipB("");
                  const response = await fetch(
                    `/api/series/relationships/entries?seriesId=${seriesList[0].id}`
                  );
                  const data = await response.json();
                  setSeriesMemory(data.entries ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
              >
                Add Relationship
              </button>
              <button
                onClick={async () => {
                  if (!seriesList[0]) return;
                  const response = await fetch(
                    `/api/series/relationships/entries?seriesId=${seriesList[0].id}`
                  );
                  const data = await response.json();
                  setSeriesMemory(data.entries ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
              >
                Refresh Relationships
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {filteredRelationships.map((relationship) => (
                <div
                  key={String(relationship.id)}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200"
                >
                  {editingRelationshipId === relationship.id ? (
                    <div className="grid gap-2 md:grid-cols-2">
                      <input
                        value={editingRelationshipA}
                        onChange={(event) => setEditingRelationshipA(event.target.value)}
                        className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                      />
                      <input
                        value={editingRelationshipB}
                        onChange={(event) => setEditingRelationshipB(event.target.value)}
                        className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                      />
                      <select
                        value={editingRelationshipType}
                        onChange={(event) => setEditingRelationshipType(event.target.value)}
                        className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
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
                        className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
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
                    {editingRelationshipId === relationship.id ? (
                      <button
                        onClick={async () => {
                          await fetch("/api/series/relationships/entries", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              seriesId: seriesList[0].id,
                              relationshipLogId: relationship.relationship_log_id,
                              characterAName: editingRelationshipA,
                              characterBName: editingRelationshipB,
                              relationshipType: editingRelationshipType,
                              status: editingRelationshipStatus,
                            }),
                          });
                          setEditingRelationshipId(null);
                          const response = await fetch(
                            `/api/series/relationships/entries?seriesId=${seriesList[0].id}`
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
                          setEditingRelationshipId(relationship.id);
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
                          id: relationship.id,
                          endpoint: "/api/series/relationships/entries/delete",
                          refresh: async () => {
                            const refreshed = await fetch(
                              `/api/series/relationships/entries?seriesId=${seriesList[0].id}`
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

        {activeTab === "memory" && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="text-xl font-semibold">Memory</h2>
            <p className="text-sm text-zinc-400">
              Capture canon updates, callbacks, and continuity notes.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-xs text-zinc-300">
                Category
                <select
                  value={newMemoryCategory}
                  onChange={(event) => setNewMemoryCategory(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
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
              <label className="text-xs text-zinc-300 md:col-span-2">
                Memory entry
                <textarea
                  value={newMemoryContent}
                  onChange={(event) => setNewMemoryContent(event.target.value)}
                  className="min-h-[120px] rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={async () => {
                  if (!seriesList[0] || !newMemoryContent) return;
                  const response = await fetch("/api/series/memory", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      seriesId: seriesList[0].id,
                      category: newMemoryCategory,
                      content: newMemoryContent,
                    }),
                  });
                  if (response.ok) {
                    setMemoryStatus("Saved memory entry.");
                    setNewMemoryContent("");
                    const refreshed = await fetch(
                      `/api/series/memory?seriesId=${seriesList[0].id}`
                    );
                    const data = await refreshed.json();
                    setSeriesMemory(data.entries ?? []);
                    const warningsResponse = await fetch(
                      `/api/series/memory/validate?seriesId=${seriesList[0].id}`
                    );
                    const warningsData = await warningsResponse.json();
                    setMemoryWarnings(warningsData.warnings ?? []);
                  }
                }}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
              >
                Save Memory
              </button>
              <button
                onClick={async () => {
                  if (!seriesList[0]) return;
                  const response = await fetch(
                    `/api/series/memory?seriesId=${seriesList[0].id}`
                  );
                  const data = await response.json();
                  setSeriesMemory(data.entries ?? []);
                  const warningsResponse = await fetch(
                    `/api/series/memory/validate?seriesId=${seriesList[0].id}`
                  );
                  const warningsData = await warningsResponse.json();
                  setMemoryWarnings(warningsData.warnings ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
              >
                Refresh Memory
              </button>
              {memoryStatus && (
                <span className="text-xs text-emerald-400">{memoryStatus}</span>
              )}
            </div>
            {memoryWarnings.length > 0 && (
              <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-200">
                <p className="text-sm font-semibold">Memory issues detected</p>
                <ul className="mt-2 list-disc pl-5">
                  {memoryWarnings.map((warning) => (
                    <li key={warning.id}>{warning.message}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-4 space-y-3">
              {seriesMemory.map((entry) => (
                <div
                  key={String(entry.id)}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200"
                >
                  <p className="text-xs text-zinc-400">
                    {String(entry.category ?? "canon")} • {String(entry.created_at ?? "")}
                  </p>
                  <p className="mt-2 text-xs">{String(entry.content ?? "")}</p>
                </div>
              ))}
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
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                />
              </label>
              <label className="text-xs text-zinc-300">
                Book #
                <input
                  type="number"
                  value={timelineBook}
                  onChange={(event) => setTimelineBook(Number(event.target.value) || 1)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                />
              </label>
              <label className="text-xs text-zinc-300">
                Order
                <input
                  type="number"
                  value={timelineOrder}
                  onChange={(event) => setTimelineOrder(Number(event.target.value) || 1)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                />
              </label>
              <label className="text-xs text-zinc-300 md:col-span-2">
                Description
                <textarea
                  value={timelineDescription}
                  onChange={(event) => setTimelineDescription(event.target.value)}
                  className="min-h-[100px] rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={async () => {
                  if (!seriesList[0]) return;
                  if (!timelineTitle || !timelineDescription) {
                    setFormError("Title and description are required.");
                    return;
                  }
                  setFormError(null);
                  await fetch("/api/series/timeline", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      seriesId: seriesList[0].id,
                      eventOrder: timelineOrder,
                      title: timelineTitle,
                      description: timelineDescription,
                      bookNumber: timelineBook,
                    }),
                  });
                  setTimelineTitle("");
                  setTimelineDescription("");
                  const response = await fetch(
                    `/api/series/timeline?seriesId=${seriesList[0].id}`
                  );
                  const data = await response.json();
                  setSeriesTimeline(data.events ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
              >
                Add Event
              </button>
              <button
                onClick={async () => {
                  if (!seriesList[0]) return;
                  const response = await fetch(
                    `/api/series/timeline?seriesId=${seriesList[0].id}`
                  );
                  const data = await response.json();
                  setSeriesTimeline(data.events ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
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
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                />
              </label>
              <label className="text-xs text-zinc-300">
                Book #
                <input
                  type="number"
                  value={timelineBookFilter || ""}
                  onChange={(event) => setTimelineBookFilter(Number(event.target.value) || 0)}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                />
              </label>
              <button
                onClick={() => {
                  setTimelineSearch("");
                  setTimelineBookFilter(0);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
              >
                Clear Filters
              </button>
              <button
                onClick={async () => {
                  if (!seriesList[0]) return;
                  const response = await fetch(
                    `/api/series/timeline?seriesId=${seriesList[0].id}`
                  );
                  const data = await response.json();
                  setSeriesTimeline(data.events ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
              >
                Refresh Timeline
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {filteredTimeline.map((event) => (
                <div
                  key={String(event.id)}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200"
                >
                  {editingTimelineId === event.id ? (
                    <div className="space-y-2">
                      <input
                        value={editingTimelineTitle}
                        onChange={(eventInput) => setEditingTimelineTitle(eventInput.target.value)}
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                      />
                      <textarea
                        value={editingTimelineDescription}
                        onChange={(eventInput) => setEditingTimelineDescription(eventInput.target.value)}
                        className="min-h-[80px] w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                      />
                      <div className="grid gap-2 md:grid-cols-2">
                        <input
                          type="number"
                          value={editingTimelineBook}
                          onChange={(eventInput) =>
                            setEditingTimelineBook(Number(eventInput.target.value) || 1)
                          }
                          className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
                        />
                        <input
                          type="number"
                          value={editingTimelineOrder}
                          onChange={(eventInput) =>
                            setEditingTimelineOrder(Number(eventInput.target.value) || 1)
                          }
                          className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
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
                      </p>
                      <p className="mt-2 text-xs">{String(event.description ?? "")}</p>
                    </>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {editingTimelineId === event.id ? (
                      <button
                        onClick={async () => {
                          await fetch("/api/series/timeline-events/update", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              id: event.id,
                              eventName: editingTimelineTitle,
                              description: editingTimelineDescription,
                              eventType: "plot",
                            }),
                          });
                          setEditingTimelineId(null);
                          const response = await fetch(
                            `/api/series/timeline?seriesId=${seriesList[0].id}`
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
                          setEditingTimelineId(event.id);
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
                          id: event.id,
                          endpoint: "/api/series/timeline-events/delete",
                          refresh: async () => {
                            const response = await fetch(
                              `/api/series/timeline?seriesId=${seriesList[0].id}`
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
              ))}
            </div>
          </section>
        )}

        {activeTab === "logs" && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="text-xl font-semibold">Generation Logs</h2>
            <p className="text-sm text-zinc-400">
              Track model calls and outputs for this series.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={async () => {
                  if (!seriesList[0]) return;
                  const response = await fetch(
                    `/api/series/generation-log?seriesId=${seriesList[0].id}`
                  );
                  const data = await response.json();
                  setSeriesMemory(data.logs ?? []);
                }}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
              >
                Refresh Logs
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {seriesMemory.slice(0, 10).map((log) => (
                <div
                  key={String(log.id)}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-200"
                >
                  <p className="text-xs text-zinc-400">
                    {String(log.type ?? "")}
                  </p>
                  <p className="mt-2 text-xs">{String(log.status ?? "")}</p>
                  <p className="mt-2 text-xs text-zinc-400">
                    {String(log.started_at ?? "")}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Your series</h2>
            <button
              onClick={async () => {
                if (!seriesList[0]) return;
                await fetch("/api/series/migrate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ seriesId: seriesList[0].id }),
                });
              }}
              className="rounded-full border border-zinc-700 px-4 py-2 text-xs"
            >
              Run Legacy Migration
            </button>
          </div>
          <div className="mt-4 grid gap-4">
            {seriesList.length === 0 && (
              <span className="text-sm text-zinc-500">No series yet.</span>
            )}
            {seriesList.map((series) => (
              <div
                key={series.id}
                className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4"
              >
                <h3 className="text-lg font-semibold text-zinc-100">
                  {series.title}
                </h3>
                <p className="text-sm text-zinc-400">
                  {series.description || "No description provided."}
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  {series.num_books} books
                </p>
                <Link
                  href={`/studio?seriesId=${series.id}&bookNumber=1`}
                  className="mt-3 inline-flex rounded-full border border-zinc-700 px-4 py-2 text-xs"
                >
                  Start book 1
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
