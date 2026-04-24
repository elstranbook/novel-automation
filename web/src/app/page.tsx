"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  Layers,
  Wand2,
  FileText,
  Sparkles,
  ArrowRight,
  Share2,
  Download,
  Loader2,
  KeyRound,
  PenTool,
  Library,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showOwnerReset, setShowOwnerReset] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const ownerEmail = "elstranbooks@gmail.com";

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
      setAuthChecked(true);
    };
    void loadUser();
  }, []);

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Signed in! Redirecting...");
      setUserId("just-logged-in");
      router.push("/studio");
    }
  };

  const handlePasswordReset = async () => {
    setResetLoading(true);
    setMessage(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email || ownerEmail, {
      redirectTo: `${window.location.origin}/login`,
    });
    setResetLoading(false);
    setShowOwnerReset(false);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password reset email sent.");
    }
  };

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
      description: "Generate premises, character profiles, outlines, and full prose with GPT-4",
      color: "emerald",
    },
    {
      icon: Layers,
      title: "Series Planning",
      description: "Plan multi-book series with shared world-building and continuity tracking",
      color: "sky",
    },
    {
      icon: BookOpen,
      title: "Full Novel Generation",
      description: "From concept to complete manuscript with scenes, chapters, and export formats",
      color: "violet",
    },
    {
      icon: FileText,
      title: "Marketing Assets",
      description: "Auto-generate book descriptions, BISAC categories, keywords, and articles",
      color: "amber",
    },
    {
      icon: Share2,
      title: "Social Snippets",
      description: "Create ready-to-post content for Twitter, Instagram, TikTok, and more",
      color: "rose",
    },
    {
      icon: Download,
      title: "Multiple Exports",
      description: "Download your novel as DOCX, PDF, HTML, or Markdown for publishing",
      color: "cyan",
    },
  ];

  const colorMap: Record<string, { dot: string; icon: string; glow: string }> = {
    emerald: { dot: "bg-emerald-400", icon: "text-emerald-400", glow: "group-hover:shadow-emerald-500/20" },
    sky: { dot: "bg-sky-400", icon: "text-sky-400", glow: "group-hover:shadow-sky-500/20" },
    violet: { dot: "bg-violet-400", icon: "text-violet-400", glow: "group-hover:shadow-violet-500/20" },
    amber: { dot: "bg-amber-400", icon: "text-amber-400", glow: "group-hover:shadow-amber-500/20" },
    rose: { dot: "bg-rose-400", icon: "text-rose-400", glow: "group-hover:shadow-rose-500/20" },
    cyan: { dot: "bg-cyan-400", icon: "text-cyan-400", glow: "group-hover:shadow-cyan-500/20" },
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <PenTool className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <span className="font-semibold text-zinc-100 text-sm">Write</span>
              <span className="text-zinc-500 text-sm ml-1.5">by Elstran Books</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {userId && authChecked ? (
              <Button
                onClick={() => router.push("/studio")}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg gap-2"
              >
                <Library className="h-4 w-4" />
                Open Studio
              </Button>
            ) : (
              <a
                href="#login"
                className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Sign in →
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section — no scroll needed */}
      <section className="flex-1 relative overflow-hidden">
        {/* Background atmosphere */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-800/20 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Hero content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 mb-6">
                <Sparkles className="h-3 w-3 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">AI-Powered Novel Studio</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
                Write novels{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400">
                  from concept
                </span>{" "}
                to manuscript
              </h1>

              <p className="text-lg text-zinc-400 mb-8 max-w-lg">
                Generate complete young adult novels, plan multi-book series, and create marketing assets — all powered by AI. From first spark to published book.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Button
                  onClick={() => handleNavigate("/studio")}
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg gap-2 h-12 px-6"
                >
                  <Wand2 className="h-4 w-4" />
                  Start Writing
                </Button>
                <Button
                  onClick={() => handleNavigate("/series")}
                  variant="outline"
                  size="lg"
                  className="border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:border-zinc-500 rounded-lg gap-2 h-12 px-6"
                >
                  <Layers className="h-4 w-4" />
                  Series Mode
                </Button>
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2">
                {features.slice(0, 4).map((f) => {
                  const colors = colorMap[f.color];
                  const Icon = f.icon;
                  return (
                    <div
                      key={f.title}
                      className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5"
                    >
                      <Icon className={`h-3 w-3 ${colors.icon}`} />
                      <span className="text-xs text-zinc-400">{f.title}</span>
                    </div>
                  );
                })}
                <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5">
                  <span className="text-xs text-zinc-500">+2 more</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Login card */}
            <motion.div
              id="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="scroll-mt-24"
            >
              {userId && authChecked ? (
                /* Already logged in card */
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm p-8 shadow-2xl">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30">
                      <Library className="h-7 w-7 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold mb-1">Welcome back</h2>
                      <p className="text-sm text-zinc-400">You&apos;re signed in and ready to create.</p>
                    </div>
                    <Button
                      onClick={() => router.push("/studio")}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg gap-2 h-11"
                    >
                      Open Studio
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => router.push("/series")}
                      variant="outline"
                      className="w-full border-zinc-700 text-zinc-300 hover:text-zinc-100 rounded-lg gap-2 h-11"
                    >
                      <Layers className="h-4 w-4" />
                      Series Mode
                    </Button>
                  </div>
                </div>
              ) : (
                /* Login form card */
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm p-8 shadow-2xl">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-1">Sign in to Write</h2>
                    <p className="text-sm text-zinc-400">
                      Access your novel studio and continue creating.
                    </p>
                  </div>

                  <form onSubmit={handleSignIn} className="flex flex-col gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm text-zinc-300">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 rounded-lg h-11 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/60"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm text-zinc-300">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 rounded-lg h-11 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/60"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg h-11 gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign in
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Owner reset link — only shown when owner's email is entered */}
                  {email.trim().toLowerCase() === ownerEmail && (
                    <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-800/30 p-3">
                      {showOwnerReset ? (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-zinc-400">Send reset link to owner?</span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handlePasswordReset}
                              disabled={resetLoading}
                              className="text-xs text-zinc-300 hover:text-zinc-100 h-7 px-2"
                            >
                              {resetLoading ? "Sending..." : "Yes"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setShowOwnerReset(false)}
                              className="text-xs text-zinc-500 h-7 px-2"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowOwnerReset(true)}
                          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                          <KeyRound className="h-3 w-3" />
                          Forgot password?
                        </button>
                      )}
                    </div>
                  )}

                  {message && (
                    <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
                      message.includes("Signed in") || message.includes("reset email sent")
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                    }`}>
                      {message}
                    </div>
                  )}

                  <p className="mt-4 text-xs text-zinc-600 text-center">
                    New accounts are by invitation only. Contact the site owner for access.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features section — below the fold, adds depth */}
      <section className="border-t border-zinc-800/50 bg-zinc-900/20">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold mb-2">Everything you need to publish</h2>
            <p className="text-zinc-400">From first draft to final export, all in one place.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => {
              const colors = colorMap[feature.color];
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/60 hover:shadow-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900`}>
                      <Icon className={`h-4 w-4 ${colors.icon}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-200 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-zinc-500 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow cards */}
      <section className="border-t border-zinc-800/50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Studio",
                subtitle: "Generate a complete novel from scratch",
                details: [
                  "Story concept & premise generation",
                  "Character profiles & arcs",
                  "Chapter-by-chapter outlines & prose",
                  "Marketing descriptions & keywords",
                  "Social media snippets",
                  "Export to DOCX/PDF/HTML",
                ],
                color: "emerald" as const,
                href: "/studio",
              },
              {
                title: "Series Mode",
                subtitle: "Plan a multi-book series",
                details: [
                  "Series bible & world-building",
                  "Multi-book arc planning",
                  "Plot thread tracking",
                  "Canon management",
                  "Per-book generation",
                  "Continuity enforcement",
                ],
                color: "sky" as const,
                href: "/series",
              },
            ].map((workflow) => {
              const colors = colorMap[workflow.color];
              return (
                <motion.button
                  key={workflow.title}
                  onClick={() => handleNavigate(workflow.href)}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4 }}
                  className="group flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-left transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/60 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
                      <h3 className="text-lg font-semibold text-zinc-100">{workflow.title}</h3>
                    </div>
                    <ArrowRight className={`h-4 w-4 ${colors.icon} transition-transform group-hover:translate-x-1`} />
                  </div>
                  <p className="text-sm text-zinc-400">{workflow.subtitle}</p>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {workflow.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Sparkles className={`h-3 w-3 ${colors.icon} opacity-60`} />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <PenTool className="h-4 w-4 text-zinc-600" />
            <span className="text-sm text-zinc-600">Write by Elstran Books</span>
          </div>
          <p className="text-xs text-zinc-700">
            © {new Date().getFullYear()} Elstran Books. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
