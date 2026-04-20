"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import {
  BookOpen,
  Layers,
  Wand2,
  FileText,
  Sparkles,
  ArrowRight,
  Users,
  Palette,
  Share2,
  Download,
} from "lucide-react";

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
      const redirectTo = encodeURIComponent(href);
      router.push(`/login?redirect=${redirectTo}`);
      return;
    }
    router.push(href);
  };

  const features = [
    {
      icon: Wand2,
      title: "AI Writing Assistant",
      description: "Generate story premises, character profiles, chapter outlines, and full prose with GPT-4",
      color: "emerald",
    },
    {
      icon: Layers,
      title: "Series Planning",
      description: "Plan multi-book series with shared world-building, plot threads, and continuity tracking",
      color: "sky",
    },
    {
      icon: BookOpen,
      title: "Full Novel Generation",
      description: "From concept to complete manuscript with scenes, chapters, and export-ready formats",
      color: "violet",
    },
    {
      icon: FileText,
      title: "Marketing Assets",
      description: "Auto-generate book descriptions, BISAC categories, keywords, and promotional articles",
      color: "amber",
    },
    {
      icon: Share2,
      title: "Social Snippets",
      description: "Create ready-to-post content for Twitter, Instagram, TikTok, Facebook, and newsletters",
      color: "rose",
    },
    {
      icon: Download,
      title: "Multiple Exports",
      description: "Download your novel as DOCX, PDF, HTML, or Markdown for publishing",
      color: "cyan",
    },
  ];

  const workflows = [
    {
      id: "studio",
      title: "Studio",
      description: "Generate a complete novel from scratch",
      details: [
        "Story concept & premise generation",
        "Character profiles",
        "Chapter-by-chapter outlines & prose",
        "Marketing descriptions & keywords",
        "Social media snippets",
        "Export to DOCX/PDF/HTML",
      ],
      color: "emerald",
    },
    {
      id: "series",
      title: "Series Mode",
      description: "Plan a multi-book series",
      details: [
        "Series bible & world-building",
        "Multi-book arc planning",
        "Plot thread tracking",
        "Canon management",
        "Per-book generation",
        "Continuity enforcement",
      ],
      color: "sky",
    },
  ];

  const colorClasses: Record<string, { bg: string; border: string; text: string; hover: string }> = {
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/60", text: "text-emerald-400", hover: "hover:border-emerald-400" },
    sky: { bg: "bg-sky-500/10", border: "border-sky-500/60", text: "text-sky-400", hover: "hover:border-sky-400" },
    violet: { bg: "bg-violet-500/10", border: "border-violet-500/60", text: "text-violet-400", hover: "hover:border-violet-400" },
    amber: { bg: "bg-amber-500/10", border: "border-amber-500/60", text: "text-amber-400", hover: "hover:border-amber-400" },
    rose: { bg: "bg-rose-500/10", border: "border-rose-500/60", text: "text-rose-400", hover: "hover:border-rose-400" },
    cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/60", text: "text-cyan-400", hover: "hover:border-cyan-400" },
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <header className="mb-16 flex flex-col gap-6">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Write by Elstran Books
          </p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            AI-Powered Novel Studio
          </h1>
          <p className="max-w-2xl text-lg text-zinc-400 sm:text-xl">
            Generate complete young adult novels, plan multi-book series, and create marketing assets with AI.
            From concept to published manuscript in one place.
          </p>
        </header>

        <section className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const colors = colorClasses[feature.color];
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`rounded-2xl border ${colors.border} ${colors.bg} p-5 transition ${colors.hover}`}
              >
                <Icon className={`mb-3 h-5 w-5 ${colors.text}`} />
                <h3 className="mb-1 text-base font-semibold text-zinc-100">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-400">{feature.description}</p>
              </div>
            );
          })}
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8">
          <h2 className="mb-2 text-2xl font-semibold">Start Creating</h2>
          <p className="mb-6 text-zinc-400">
            Choose a workflow to begin building your novel.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {workflows.map((workflow) => {
              const colors = colorClasses[workflow.color];
              return (
                <button
                  key={workflow.id}
                  onClick={() => handleNavigate(`/${workflow.id}`)}
                  className={`group flex w-full flex-col items-start gap-3 rounded-xl border ${colors.border} ${colors.bg} p-5 text-left transition ${colors.hover}`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-lg font-semibold text-zinc-100">
                      {workflow.title}
                    </span>
                    <ArrowRight className={`h-4 w-4 ${colors.text} transition-transform group-hover:translate-x-1`} />
                  </div>
                  <p className="mb-2 text-sm text-zinc-400">{workflow.description}</p>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-500">
                    {workflow.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
        </section>

        <footer className="mt-16 border-t border-zinc-800 pt-8">
          <p className="text-sm text-zinc-500">
            Already have an account?{" "}
            <button
              onClick={() => handleNavigate("/studio")}
              className="text-emerald-400 hover:underline"
            >
              Continue creating
            </button>
          </p>
        </footer>
      </div>
    </div>
  );
}