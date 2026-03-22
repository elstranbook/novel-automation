"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function Home() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    };
    void loadUser();
  }, []);

  const handleNavigate = (href: string) => {
    if (!userId) {
      router.push("/login");
      return;
    }
    router.push(href);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16">
        <header className="flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
            Write by Elstran Books
          </p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            YA Novel Generator
          </h1>
          <p className="max-w-2xl text-lg text-zinc-300">
            Generate full young adult novels, series arcs, marketing assets, and
            export-ready formats with AI + Supabase.
          </p>
        </header>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8">
          <h2 className="text-2xl font-semibold">What do you want to do?</h2>
          <p className="mt-2 text-zinc-300">
            Choose a workflow to start building your novel. You&apos;ll be asked to
            sign in first.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <button
              onClick={() => handleNavigate("/studio")}
              className="flex w-full flex-col items-start gap-2 rounded-2xl border border-emerald-500/60 bg-emerald-500/10 px-6 py-6 text-left text-zinc-100 transition hover:border-emerald-400"
            >
              <span className="text-lg font-semibold">Studio</span>
              <span className="text-sm text-zinc-300">
                Generate a full novel with outlines, scenes, prose, and exports.
              </span>
            </button>
            <button
              onClick={() => handleNavigate("/series")}
              className="flex w-full flex-col items-start gap-2 rounded-2xl border border-sky-500/60 bg-sky-500/10 px-6 py-6 text-left text-zinc-100 transition hover:border-sky-400"
            >
              <span className="text-lg font-semibold">Series Mode</span>
              <span className="text-sm text-zinc-300">
                Plan a multi-book series with shared arcs and continuity.
              </span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
