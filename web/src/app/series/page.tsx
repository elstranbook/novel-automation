"use client";

import { useEffect, useState } from "react";
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
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [suiteTone, setSuiteTone] = useState("Emotional, dramatic, hopeful");
  const [suiteSetting, setSuiteSetting] = useState("Contemporary");
  const [suiteCharacters, setSuiteCharacters] = useState("");
  const [suiteThemes, setSuiteThemes] = useState(
    "Coming of age, identity, relationships"
  );
  const [suiteCoreConflict, setSuiteCoreConflict] = useState("");
  const [suiteBookNumber, setSuiteBookNumber] = useState(1);

  const loadSeries = async (userIdValue: string) => {
    const { data } = await supabase
      .from("series")
      .select("id,title,description,num_books")
      .eq("user_id", userIdValue)
      .order("created_at", { ascending: false });

    if (data) {
      setSeriesList(data as SeriesSummary[]);
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

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-xl font-semibold">Your series</h2>
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
