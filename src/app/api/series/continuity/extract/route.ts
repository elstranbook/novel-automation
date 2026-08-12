import { NextResponse } from "next/server";
import { runChatCompletion } from "@/lib/openaiClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveModel, PipelineStep } from "@/lib/modelDefaults";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type ExtractRequest = {
  seriesId: string;
  bookNumber?: number;
  novelId?: string;
  proseText?: string;
  model?: string;
};

export type ContinuityCandidate = {
  id: string;
  kind: "canon" | "memory";
  category: string;
  content: string;
  source?: string;
  cannot_change?: boolean;
  speculative?: boolean;
};

function clipProse(text: string, maxChars = 28000): string {
  const trimmed = String(text ?? "").trim();
  if (trimmed.length <= maxChars) return trimmed;
  const head = trimmed.slice(0, Math.floor(maxChars * 0.55));
  const tail = trimmed.slice(-Math.floor(maxChars * 0.4));
  return `${head}\n\n[...middle omitted...]\n\n${tail}`;
}

function normalizeCandidates(raw: unknown): ContinuityCandidate[] {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object"
      ? Array.isArray((raw as { candidates?: unknown }).candidates)
        ? (raw as { candidates: unknown[] }).candidates
        : [
            ...(((raw as { canon_candidates?: unknown[] }).canon_candidates ??
              []) as unknown[]),
            ...(((raw as { memory_candidates?: unknown[] }).memory_candidates ??
              []) as unknown[]),
          ]
      : [];

  const out: ContinuityCandidate[] = [];
  list.forEach((item, index) => {
    if (!item || typeof item !== "object") return;
    const rec = item as Record<string, unknown>;
    const kindRaw = String(rec.kind ?? rec.type ?? "canon").toLowerCase();
    const kind: "canon" | "memory" =
      kindRaw === "memory" || kindRaw === "series_memory" ? "memory" : "canon";
    const content = String(
      rec.content ?? rec.fact ?? rec.text ?? ""
    ).trim();
    if (!content || content.length < 12) return;
    const category = String(
      rec.category ?? (kind === "canon" ? "fact" : "canon")
    ).trim() || (kind === "canon" ? "fact" : "canon");
    out.push({
      id: String(rec.id ?? `${kind}-${index + 1}`),
      kind,
      category,
      content,
      source: String(rec.source ?? "").trim() || undefined,
      cannot_change: rec.cannot_change === true,
      speculative: rec.speculative === true,
    });
  });
  return out.slice(0, 40);
}

async function loadProseFromNovel(novelId: string): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from("prose_scenes")
    .select("chapter_title,scene_content,chapter_order,scene_order")
    .eq("novel_id", novelId)
    .order("chapter_order", { ascending: true })
    .order("scene_order", { ascending: true });

  if (error) throw new Error(error.message);
  if (!data?.length) return "";

  const parts: string[] = [];
  let lastChapter = "";
  data.forEach((row) => {
    if (row.chapter_title !== lastChapter) {
      lastChapter = row.chapter_title;
      parts.push(`\n## ${row.chapter_title}\n`);
    }
    parts.push(String(row.scene_content ?? ""));
  });
  return parts.join("\n\n");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ExtractRequest;
    const { seriesId, bookNumber, novelId, proseText, model } = body;

    if (!seriesId) {
      return NextResponse.json({ error: "seriesId required" }, { status: 400 });
    }

    let prose = String(proseText ?? "").trim();
    if (!prose && novelId) {
      prose = await loadProseFromNovel(novelId);
    }
    if (!prose) {
      return NextResponse.json(
        { error: "proseText or novelId with prose_scenes required" },
        { status: 400 }
      );
    }

    const bookLabel = bookNumber ? `Book ${bookNumber}` : "this book";
    const clipped = clipProse(prose);

    const prompt = `
You extract CONTINUITY FACTS established by the finished prose of ${bookLabel} in a series.

Rules:
- Extract only concrete facts that are NOW true in-world because this prose established them.
- Do NOT invent facts that are only implied weakly.
- Do NOT repeat vague themes ("love matters"). Prefer names, places, rules, reveals, relationships, deaths, injuries, vows, ownership, timelines.
- Mark speculative=true only if the prose strongly hints but does not confirm.
- For locked canon (cannot_change=true), only use facts that are definitive and would break continuity if contradicted later.
- Prefer cannot_change=false for soft or character-state notes.

Return JSON ONLY:
{
  "canon_candidates": [
    {
      "category": "world|character|plot|timeline|relationship|other",
      "fact": "...",
      "source": "Chapter N / short cite",
      "cannot_change": false,
      "speculative": false
    }
  ],
  "memory_candidates": [
    {
      "category": "canon|knowledge|warning|secret|clue|callback",
      "content": "...",
      "speculative": false
    }
  ]
}

Aim for 5–20 high-value candidates total. Skip filler.

PROSE:
"""
${clipped}
"""
`;

    const system = `You are a continuity editor for a multi-book series.
Extract durable facts for the series bible. Never invent. Return valid JSON only.`;

    const response = await runChatCompletion({
      model: resolveModel(model, PipelineStep.CONTINUITY_EXTRACT),
      system,
      prompt,
      jsonResponse: true,
      maxTokens: 3500,
      temperature: 0.2,
      generationMeta: { seriesId, type: "continuity-extract" },
    });

    const canonRaw =
      response && typeof response === "object"
        ? (response as { canon_candidates?: unknown[] }).canon_candidates
        : [];
    const memoryRaw =
      response && typeof response === "object"
        ? (response as { memory_candidates?: unknown[] }).memory_candidates
        : [];

    const canon = normalizeCandidates(
      (Array.isArray(canonRaw) ? canonRaw : []).map((item, i) => ({
        ...(typeof item === "object" && item ? item : {}),
        kind: "canon",
        content:
          typeof item === "object" && item
            ? (item as Record<string, unknown>).fact ??
              (item as Record<string, unknown>).content
            : item,
        id: `canon-${i + 1}`,
      }))
    );

    const memory = normalizeCandidates(
      (Array.isArray(memoryRaw) ? memoryRaw : []).map((item, i) => ({
        ...(typeof item === "object" && item ? item : {}),
        kind: "memory",
        id: `memory-${i + 1}`,
      }))
    );

    const candidates = [...canon, ...memory];

    return NextResponse.json({
      candidates,
      canon_candidates: canon,
      memory_candidates: memory,
      stats: {
        proseChars: prose.length,
        clippedChars: clipped.length,
        candidateCount: candidates.length,
      },
    });
  } catch (error) {
    console.error("[continuity-extract]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to extract continuity candidates",
      },
      { status: 500 }
    );
  }
}
