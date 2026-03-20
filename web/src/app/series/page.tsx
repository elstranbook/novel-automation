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
  const [arc, setArc] = useState<Record<string, unknown> | null>(null);

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
        await loadSeries(user.id);
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
          <Link href="/" className="text-sm text-zinc-400">
            ← Back to home
          </Link>
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
