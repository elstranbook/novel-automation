"use client";

import { useState } from "react";
import Link from "next/link";

type IntroFormProps = {
  title?: string;
  about?: string;
};

export default function IntroForm({ title = "", about = "" }: IntroFormProps) {
  const [novelTitle, setNovelTitle] = useState(title);
  const [novelAbout, setNovelAbout] = useState(about);

  const query = new URLSearchParams();
  if (novelTitle.trim()) query.set("title", novelTitle.trim());
  if (novelAbout.trim()) query.set("about", novelAbout.trim());

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      <h2 className="text-xl font-semibold">Start your novel</h2>
      <p className="mt-2 text-sm text-zinc-300">
        Provide a title and a quick description so the generator knows your vision.
      </p>
      <div className="mt-4 grid gap-4">
        <label className="flex flex-col gap-2 text-sm">
          Novel title
          <input
            value={novelTitle}
            onChange={(event) => setNovelTitle(event.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
            placeholder="The Midnight Inheritors"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          What the novel is about
          <textarea
            value={novelAbout}
            onChange={(event) => setNovelAbout(event.target.value)}
            className="min-h-[120px] rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
            placeholder="Describe the premise, themes, or specific idea you want..."
          />
        </label>
        <Link
          href={`/studio?${query.toString()}`}
          className={`inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 ${
            !novelTitle.trim() ? "pointer-events-none opacity-50" : ""
          }`}
        >
          Open Studio
        </Link>
      </div>
    </div>
  );
}
