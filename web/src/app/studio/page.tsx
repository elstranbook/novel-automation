"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

const modelOptions = ["gpt-4.1-mini", "gpt-4.1", "gpt-4o", "gpt-4"];

export default function StudioPage() {
  const supabase = createSupabaseBrowserClient();
  const [title, setTitle] = useState("");
  const [model, setModel] = useState(modelOptions[0]);
  const [storyDetails, setStoryDetails] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateStoryDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate/story-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, model }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate story details");
      }

      const data = await response.json();
      setStoryDetails(data);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("novels").insert({
          user_id: user.id,
          title,
          model,
          max_scene_length: 1000,
          min_scene_length: 300,
          story_details: data,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16">
        <header className="flex flex-col gap-3">
          <Link href="/" className="text-sm text-zinc-400">
            ← Back to home
          </Link>
          <h1 className="text-3xl font-semibold">Studio</h1>
          <p className="text-zinc-300">
            Begin with story details. Sign in to save output to Supabase.
          </p>
          <Link href="/login" className="text-sm text-zinc-400 underline">
            Sign in / create account
          </Link>
        </header>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              Novel title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100"
                placeholder="The Midnight Inheritors"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Model
              <select
                value={model}
                onChange={(event) => setModel(event.target.value)}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100"
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
            onClick={generateStoryDetails}
            disabled={!title || loading}
            className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate story details"}
          </button>
          {error && (
            <p className="mt-4 rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}
        </section>

        {storyDetails && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="text-xl font-semibold">Story details</h2>
            <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-zinc-950/60 p-4 text-sm text-zinc-200">
              {JSON.stringify(storyDetails, null, 2)}
            </pre>
          </section>
        )}
      </div>
    </div>
  );
}
