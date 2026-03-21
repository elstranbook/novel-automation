import Link from "next/link";
import IntroForm from "./studio/intro-form";

export default function Home() {
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

        <section className="grid gap-6 sm:grid-cols-2">
          <IntroForm />
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-3">
            <h2 className="text-xl font-semibold">Series mode</h2>
            <p className="text-zinc-300">
              Build multi-book series with shared arcs, continuity notes, and
              book-specific outputs.
            </p>
            <Link
              href="/series"
              className="inline-flex items-center justify-center rounded-full border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-100"
            >
              Manage Series
            </Link>
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-3">
          {["Story engine", "Marketing pack", "Exports"].map((title) => (
            <div
              key={title}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
            >
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-zinc-300">
                Full pipeline support from concept to formatted manuscript.
              </p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
