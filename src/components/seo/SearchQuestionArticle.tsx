"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Trash2,
  Eye,
  Edit3,
  Check,
  X,
  RefreshCw,
  Star,
  ExternalLink,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────

type SearchIntent = {
  intent: string;
  themes: string[];
  topics: string[];
  emotions: string[];
  audience: string[];
  genreFit: string[];
  searchSummary: string;
};

type BookCandidate = {
  id: string;
  title: string;
  genre: string[];
  themes: string[];
  topics: string[];
  emotions: string[];
  audience: string[];
  synopsis: string;
  marketingSummary: string;
  popularityScore: number;
  similarity: number;
  relevanceScore: number;
};

type SeoArticle = {
  id?: string;
  question: string;
  title?: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  excerpt?: string;
  articleHtml?: string;
  articleMarkdown?: string;
  faq?: Array<{ question: string; answer: string }>;
  promotedBooks?: string[];
  promotionReason?: string;
  status?: string;
  generationTimeMs?: number;
};

type GenerationSettings = {
  tone: "thoughtful" | "exciting" | "academic";
  wordCount: number;
  promotionIntensity: 0 | 25 | 50 | 75 | 100;
  targetAudience: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  internalLinks: string[];
  readingGrade: number;
};

type PipelinePhase = "idle" | "intent" | "matching" | "generating" | "completed";

// ─── Helpers ─────────────────────────────────────────────────────────

const downloadText = (filename: string, content: string, mime = "text/plain") => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const DEFAULT_SETTINGS: GenerationSettings = {
  tone: "thoughtful",
  wordCount: 1800,
  promotionIntensity: 50,
  targetAudience: "",
  primaryKeyword: "",
  secondaryKeywords: [],
  internalLinks: [],
  readingGrade: 0,
};

const PROMOTION_LABELS: Record<number, { label: string; desc: string }> = {
  0: { label: "None", desc: "No book promotion" },
  25: { label: "Subtle", desc: "Brief mention" },
  50: { label: "Natural", desc: "Contextual integration" },
  75: { label: "Thematic", desc: "Dedicated section" },
  100: { label: "Strong", desc: "Recommendation + CTA" },
};

// ─── Component ───────────────────────────────────────────────────────

type SearchQuestionArticleProps = {
  userId: string | null;
  supabase: any;
};

export function SearchQuestionArticle({ userId, supabase }: SearchQuestionArticleProps) {
  // State
  const [question, setQuestion] = useState("");
  const [phase, setPhase] = useState<PipelinePhase>("idle");
  const [error, setError] = useState<string | null>(null);

  // Phase results
  const [intent, setIntent] = useState<SearchIntent | null>(null);
  const [candidates, setCandidates] = useState<BookCandidate[]>([]);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [selectionReason, setSelectionReason] = useState<string>("");

  // Article
  const [article, setArticle] = useState<SeoArticle | null>(null);
  const [articleId, setArticleId] = useState<string>("");

  // Settings
  const [settings, setSettings] = useState<GenerationSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [showArticleLibrary, setShowArticleLibrary] = useState(false);

  // Saved articles
  const [savedArticles, setSavedArticles] = useState<any[]>([]);

  // Edit mode
  const [editingMarkdown, setEditingMarkdown] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  // UI state
  const [showIntentDetails, setShowIntentDetails] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // ─── Pipeline Functions ──────────────────────────────────────────

  const runPipeline = useCallback(async () => {
    if (!question.trim() || !userId) return;

    setError(null);
    setIntent(null);
    setCandidates([]);
    setSelectedBookIds([]);
    setSelectionReason("");
    setArticle(null);
    setArticleId("");
    setPhase("intent");

    try {
      // Full pipeline in one call
      setPhase("intent");

      const response = await fetch("/api/generate/seo-article", {
        method: "POST",
        signal: AbortSignal.timeout(300000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          userId,
          settings: {
            tone: settings.tone,
            wordCount: settings.wordCount,
            promotionIntensity: settings.promotionIntensity,
            targetAudience: settings.targetAudience || undefined,
            primaryKeyword: settings.primaryKeyword || undefined,
            secondaryKeywords: settings.secondaryKeywords.length > 0 ? settings.secondaryKeywords : undefined,
            readingGrade: settings.readingGrade || undefined,
          },
          overrideBookIds: selectedBookIds.length > 0 ? selectedBookIds : undefined,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Generation failed");
      }

      const data = await response.json();

      setIntent(data.intent);
      setCandidates(data.candidates || []);
      if (data.selected?.length > 0) {
        setSelectedBookIds(data.selected.map((b: BookCandidate) => b.id));
      }
      setSelectionReason(data.selected?.[0] ? "" : data.reason || "");
      setArticle(data.article);
      setArticleId(data.articleId || "");
      setPhase("completed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setPhase("idle");
    }
  }, [question, userId, settings, selectedBookIds]);

  const runIntentOnly = useCallback(async () => {
    if (!question.trim() || !userId) return;

    setError(null);
    setPhase("intent");

    try {
      const response = await fetch("/api/generate/seo-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });

      if (!response.ok) throw new Error("Intent analysis failed");

      const data = await response.json();
      setIntent(data.intent);
      setPhase("idle");

      // Auto-proceed to book matching
      await matchBooks(data.intent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Intent analysis failed");
      setPhase("idle");
    }
  }, [question, userId]);

  const matchBooks = useCallback(async (searchIntent?: SearchIntent) => {
    if (!question.trim() || !userId) return;

    setPhase("matching");

    try {
      const response = await fetch("/api/generate/seo-match-books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          intent: searchIntent || intent,
          userId,
        }),
      });

      if (!response.ok) throw new Error("Book matching failed");

      const data = await response.json();
      setCandidates(data.candidates || []);

      // Auto-select based on rules
      if (data.selected?.length > 0) {
        setSelectedBookIds(data.selected.map((b: BookCandidate) => b.id));
      }
      setSelectionReason(data.reason || "");
      setPhase("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Book matching failed");
      setPhase("idle");
    }
  }, [question, userId, intent]);

  const toggleBookSelection = (bookId: string) => {
    setSelectedBookIds((prev: string[]) => {
      if (prev.includes(bookId)) {
        return prev.filter((id: string) => id !== bookId);
      }
      return [...prev, bookId];
    });
  };

  const loadSavedArticles = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/seo-articles?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSavedArticles(data.articles || []);
      }
    } catch {
      // ignore
    }
  }, [userId]);

  const publishArticle = async (id: string) => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/seo-articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: "published" }),
      });

      if (response.ok) {
        await loadSavedArticles();
      }
    } catch {
      // ignore
    }
  };

  const deleteArticle = async (id: string) => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/seo-articles/${id}?userId=${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadSavedArticles();
      }
    } catch {
      // ignore
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      // ignore
    }
  };

  const saveEditedMarkdown = () => {
    if (article) {
      setArticle({ ...article, articleMarkdown: editingMarkdown });
      setIsEditing(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────

  const isRunning = phase !== "idle" && phase !== "completed";

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold">Search Question → Article</h2>
            <Search className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-sm text-zinc-400">
            Paste a search question people ask on Google. Get an SEO article that answers it while naturally promoting a relevant book.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setShowArticleLibrary((prev) => !prev);
              if (!showArticleLibrary) loadSavedArticles();
            }}
            className="rounded-full border border-zinc-700 px-4 py-2 text-xs"
          >
            {showArticleLibrary ? "Hide Library" : "Article Library"}
          </button>
          <button
            onClick={() => setShowSettings((prev) => !prev)}
            className="rounded-full border border-zinc-700 px-4 py-2 text-xs"
          >
            {showSettings ? "Hide Settings" : "Settings"}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <h3 className="text-sm font-semibold text-zinc-200 mb-3">Generation Settings</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <label className="text-xs text-zinc-300">
              Tone
              <select
                value={settings.tone}
                onChange={(e) => setSettings((s) => ({ ...s, tone: e.target.value as any }))}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              >
                <option value="thoughtful">Thoughtful</option>
                <option value="exciting">Exciting</option>
                <option value="academic">Academic</option>
              </select>
            </label>
            <label className="text-xs text-zinc-300">
              Word Count
              <select
                value={settings.wordCount}
                onChange={(e) => setSettings((s) => ({ ...s, wordCount: parseInt(e.target.value) }))}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              >
                <option value={800}>Short (800 words)</option>
                <option value={1200}>Medium (1200 words)</option>
                <option value={1800}>Long (1800 words)</option>
                <option value={2500}>In-depth (2500 words)</option>
              </select>
            </label>
            <label className="text-xs text-zinc-300">
              Promotion Intensity
              <select
                value={settings.promotionIntensity}
                onChange={(e) => setSettings((s) => ({ ...s, promotionIntensity: parseInt(e.target.value) as any }))}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              >
                <option value={0}>0 — None</option>
                <option value={25}>25 — Subtle</option>
                <option value={50}>50 — Natural</option>
                <option value={75}>75 — Thematic</option>
                <option value={100}>100 — Strong</option>
              </select>
            </label>
            <label className="text-xs text-zinc-300">
              Primary Keyword
              <input
                type="text"
                value={settings.primaryKeyword}
                onChange={(e) => setSettings((s) => ({ ...s, primaryKeyword: e.target.value }))}
                placeholder="e.g. teen isolation"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              />
            </label>
            <label className="text-xs text-zinc-300">
              Target Audience
              <input
                type="text"
                value={settings.targetAudience}
                onChange={(e) => setSettings((s) => ({ ...s, targetAudience: e.target.value }))}
                placeholder="e.g. parents of teens"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              />
            </label>
            <label className="text-xs text-zinc-300">
              Reading Grade Level
              <select
                value={settings.readingGrade}
                onChange={(e) => setSettings((s) => ({ ...s, readingGrade: parseInt(e.target.value) }))}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              >
                <option value={0}>Auto</option>
                <option value={6}>6th Grade</option>
                <option value={8}>8th Grade</option>
                <option value={10}>10th Grade</option>
                <option value={12}>12th Grade</option>
              </select>
            </label>
          </div>
          {settings.promotionIntensity > 0 && (
            <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
              <p className="text-xs text-emerald-200">
                <strong>{PROMOTION_LABELS[settings.promotionIntensity]?.label}</strong>:{" "}
                {PROMOTION_LABELS[settings.promotionIntensity]?.desc}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Article Library */}
      {showArticleLibrary && (
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-zinc-200">Saved Articles</h3>
            <button
              onClick={loadSavedArticles}
              className="rounded-full border border-zinc-700 px-3 py-1 text-xs"
            >
              Refresh
            </button>
          </div>
          {savedArticles.length > 0 ? (
            <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
              {savedArticles.map((a: any) => (
                <div
                  key={a.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-zinc-100 truncate">{a.title || "Untitled"}</p>
                      <p className="text-xs text-zinc-400 truncate">&ldquo;{a.question}&rdquo;</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs ${
                          a.status === "published"
                            ? "border-emerald-400/60 text-emerald-200"
                            : a.status === "draft"
                            ? "border-amber-500/40 text-amber-200"
                            : "border-zinc-600 text-zinc-400"
                        }`}
                      >
                        {a.status}
                      </span>
                      {a.status === "draft" && (
                        <button
                          onClick={() => publishArticle(a.id)}
                          className="rounded-full border border-emerald-500/40 px-2 py-1 text-xs text-emerald-200 hover:bg-emerald-500/10"
                        >
                          Publish
                        </button>
                      )}
                      <button
                        onClick={() => deleteArticle(a.id)}
                        className="rounded-full border border-red-500/30 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-zinc-500">No saved articles yet.</p>
          )}
        </div>
      )}

      {/* Question Input */}
      <div className="mt-6">
        <label className="text-xs text-zinc-300">Search Question</label>
        <div className="mt-1 flex gap-2">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Why do teens feel disconnected from society?"
            rows={2}
            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-zinc-100 resize-none"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
          <button
            onClick={runPipeline}
            disabled={!question.trim() || !userId || isRunning}
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                {phase === "intent" && "Analyzing intent…"}
                {phase === "matching" && "Matching books…"}
                {phase === "generating" && "Generating article…"}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Article
              </>
            )}
          </button>

          {candidates.length > 0 && !isRunning && (
            <button
              onClick={() => {
                setSelectedBookIds([]);
                runPipeline();
              }}
              disabled={isRunning}
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm inline-flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-400 hover:text-red-200"
          >
            <X className="h-4 w-4 inline" />
          </button>
        </div>
      )}

      {/* Phase: Search Intent Results */}
      {intent && (
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <div
            className="flex items-center justify-between gap-2 cursor-pointer"
            onClick={() => setShowIntentDetails(!showIntentDetails)}
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-semibold text-zinc-100">Search Intent</span>
              <span className="rounded-full border border-emerald-400/40 px-2 py-0.5 text-xs text-emerald-200">
                {intent.intent}
              </span>
            </div>
            {showIntentDetails ? (
              <ChevronUp className="h-4 w-4 text-zinc-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            )}
          </div>

          {showIntentDetails && (
            <div className="mt-3 space-y-3 text-xs">
              <p className="text-zinc-300">{intent.searchSummary}</p>
              <div className="grid gap-3 md:grid-cols-2">
                {intent.themes.length > 0 && (
                  <div>
                    <p className="text-zinc-400 mb-1">Themes</p>
                    <div className="flex flex-wrap gap-1">
                      {intent.themes.map((t) => (
                        <span key={t} className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {intent.topics.length > 0 && (
                  <div>
                    <p className="text-zinc-400 mb-1">Topics</p>
                    <div className="flex flex-wrap gap-1">
                      {intent.topics.map((t) => (
                        <span key={t} className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {intent.emotions.length > 0 && (
                  <div>
                    <p className="text-zinc-400 mb-1">Emotions</p>
                    <div className="flex flex-wrap gap-1">
                      {intent.emotions.map((e) => (
                        <span key={e} className="rounded-full border border-amber-500/30 px-2 py-0.5 text-xs text-amber-200">
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {intent.audience.length > 0 && (
                  <div>
                    <p className="text-zinc-400 mb-1">Audience</p>
                    <div className="flex flex-wrap gap-1">
                      {intent.audience.map((a) => (
                        <span key={a} className="rounded-full border border-emerald-500/30 px-2 py-0.5 text-xs text-emerald-200">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Phase: Book Candidates */}
      {candidates.length > 0 && (
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold text-zinc-100">Book Matches</span>
            <span className="text-xs text-zinc-400">— Click to toggle selection</span>
          </div>

          <div className="space-y-2">
            {candidates.slice(0, 5).map((book) => {
              const isSelected = selectedBookIds.includes(book.id);
              return (
                <div
                  key={book.id}
                  onClick={() => toggleBookSelection(book.id)}
                  className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                    isSelected
                      ? "border-emerald-500/50 bg-emerald-500/10"
                      : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? "border-emerald-500 bg-emerald-500" : "border-zinc-600"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-zinc-900" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-100 truncate">{book.title}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {book.themes.slice(0, 3).map((t) => (
                            <span key={t} className="rounded-full border border-zinc-700 px-1.5 py-0.5 text-[10px]">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-400" />
                        <span className={`text-sm font-bold ${
                          book.relevanceScore > 85
                            ? "text-emerald-300"
                            : book.relevanceScore > 60
                            ? "text-amber-300"
                            : "text-zinc-400"
                        }`}>
                          {book.relevanceScore}%
                        </span>
                      </div>
                      {book.similarity > 0 && (
                        <p className="text-[10px] text-zinc-500">Vector: {(book.similarity * 100).toFixed(0)}%</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectionReason && (
            <p className="mt-3 text-xs text-zinc-400">{selectionReason}</p>
          )}

          {selectedBookIds.length === 0 && settings.promotionIntensity > 0 && (
            <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="text-xs text-amber-200">
                No books selected. Article will be informational only (no promotion).
              </p>
            </div>
          )}
        </div>
      )}

      {/* Phase: Article Result */}
      {article && phase === "completed" && (
        <div className="mt-6 space-y-4">
          {/* Article Header */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-zinc-100">{article.metaTitle || article.title || "SEO Article"}</h3>
                {article.metaDescription && (
                  <p className="text-sm text-zinc-400 mt-1">{article.metaDescription}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {articleId && (
                  <span className="rounded-full border border-emerald-400/40 px-2 py-0.5 text-xs text-emerald-200">
                    Saved
                  </span>
                )}
                {article.generationTimeMs && (
                  <span className="text-xs text-zinc-500">{(article.generationTimeMs / 1000).toFixed(1)}s</span>
                )}
              </div>
            </div>

            {/* SEO Metadata */}
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {article.slug && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-2">
                  <p className="text-[10px] text-zinc-500 uppercase">Slug</p>
                  <p className="text-xs text-zinc-300 flex items-center gap-1">
                    /{article.slug}
                    <button
                      onClick={() => copyToClipboard(article.slug!, "slug")}
                      className="text-zinc-500 hover:text-zinc-300"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </p>
                </div>
              )}
              {article.promotedBooks && article.promotedBooks.length > 0 && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-2">
                  <p className="text-[10px] text-zinc-500 uppercase">Promoted</p>
                  <p className="text-xs text-emerald-300">{article.promotedBooks.join(", ")}</p>
                </div>
              )}
              {article.promotionReason && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-2">
                  <p className="text-[10px] text-zinc-500 uppercase">Reason</p>
                  <p className="text-xs text-zinc-300">{article.promotionReason}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs inline-flex items-center gap-1"
              >
                {isEditing ? <Eye className="h-3 w-3" /> : <Edit3 className="h-3 w-3" />}
                {isEditing ? "Preview" : "Edit Markdown"}
              </button>
              <button
                onClick={() => copyToClipboard(article.articleHtml || "", "html")}
                className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs inline-flex items-center gap-1"
              >
                <Copy className="h-3 w-3" />
                {copiedField === "html" ? "Copied!" : "Copy HTML"}
              </button>
              <button
                onClick={() => copyToClipboard(article.articleMarkdown || "", "md")}
                className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs inline-flex items-center gap-1"
              >
                <Copy className="h-3 w-3" />
                {copiedField === "md" ? "Copied!" : "Copy Markdown"}
              </button>
              <button
                onClick={() =>
                  downloadText(
                    `${article.slug || "seo-article"}.html`,
                    article.articleHtml || "",
                    "text/html"
                  )
                }
                className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs inline-flex items-center gap-1"
              >
                <Download className="h-3 w-3" /> HTML
              </button>
              <button
                onClick={() =>
                  downloadText(
                    `${article.slug || "seo-article"}.md`,
                    article.articleMarkdown || "",
                    "text/markdown"
                  )
                }
                className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs inline-flex items-center gap-1"
              >
                <Download className="h-3 w-3" /> Markdown
              </button>
              {articleId && (
                <button
                  onClick={async () => {
                    if (!userId) return;
                    await fetch(`/api/seo-articles/${articleId}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        userId,
                        article_markdown: article.articleMarkdown,
                      }),
                    });
                  }}
                  className="rounded-full border border-emerald-500/40 px-3 py-1.5 text-xs text-emerald-200 inline-flex items-center gap-1"
                >
                  <Check className="h-3 w-3" /> Save Edits
                </button>
              )}
            </div>
          </div>

          {/* Article Content */}
          {isEditing ? (
            <div>
              <textarea
                value={editingMarkdown || article.articleMarkdown || ""}
                onChange={(e) => setEditingMarkdown(e.target.value)}
                className="w-full min-h-[500px] rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-zinc-100 font-mono"
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={saveEditedMarkdown}
                  className="rounded-full bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-500"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            article.articleHtml && (
              <div
                className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-6 prose prose-invert prose-sm max-w-none text-zinc-200 prose-headings:text-zinc-100 prose-a:text-emerald-400 prose-blockquote:border-emerald-500/50 prose-blockquote:text-zinc-300 prose-strong:text-zinc-100 prose-li:text-zinc-300"
                dangerouslySetInnerHTML={{ __html: article.articleHtml }}
              />
            )
          )}

          {/* FAQ Section */}
          {article.faq && article.faq.length > 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
              <button
                onClick={() => setShowFaq(!showFaq)}
                className="flex items-center justify-between w-full"
              >
                <span className="text-sm font-semibold text-zinc-100">FAQ Schema ({article.faq.length} questions)</span>
                {showFaq ? (
                  <ChevronUp className="h-4 w-4 text-zinc-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-zinc-400" />
                )}
              </button>
              {showFaq && (
                <div className="mt-3 space-y-3">
                  {article.faq.map((faqItem, i) => (
                    <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                      <p className="text-sm font-semibold text-zinc-100">{faqItem.question}</p>
                      <p className="text-xs text-zinc-300 mt-1">{faqItem.answer}</p>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(faqItem),
                            `faq-${i}`
                          )
                        }
                        className="mt-1 text-[10px] text-zinc-500 hover:text-zinc-300"
                      >
                        {copiedField === `faq-${i}` ? "Copied!" : "Copy JSON"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!article && !isRunning && !error && (
        <div className="mt-6 rounded-xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-400 text-center">
          Enter a search question above and click Generate Article to create an SEO-optimized article
          that answers the question while naturally promoting a relevant book from your catalog.
        </div>
      )}
    </section>
  );
}
