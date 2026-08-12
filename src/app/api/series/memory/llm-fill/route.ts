import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  asArray,
  asTrimmedString,
  clipExistingList,
  loadFillContext,
  requireSeriesId,
  runFillCompletion,
  type FillBody,
} from "@/lib/seriesLlmFill";

const MEMORY_CATEGORIES = new Set([
  "canon",
  "callback",
  "foreshadow",
  "clue",
  "secret",
  "relationship",
  "knowledge",
  "warning",
]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FillBody;
    const seriesIdOrError = requireSeriesId(body);
    if (seriesIdOrError instanceof NextResponse) return seriesIdOrError;
    const seriesId = seriesIdOrError;

    const { context, contextText } = await loadFillContext(seriesId);
    const existing = context.memory ?? [];

    const result = await runFillCompletion({
      seriesId,
      type: "memory-llm-fill",
      model: body.model,
      system:
        "You are a series memory continuity editor. Return strict JSON only.",
      prompt: `Append NEW short memory notes writers should not forget.
Categories must be one of: canon, callback, foreshadow, clue, secret, relationship, knowledge, warning.
Prefer 6–12 concise notes. Avoid near-duplicates of existing memory.

EXISTING MEMORY:
${clipExistingList(existing, (e) => `- [${e.category}] ${e.content}`)}

SERIES CONTEXT:
${contextText}

Respond with JSON:
{ "entries": [{ "category": "canon|callback|foreshadow|clue|secret|relationship|knowledge|warning", "content": string }] }`,
    });

    const rows = asArray(result.entries)
      .map((row) => {
        const item = (row ?? {}) as Record<string, unknown>;
        const category = asTrimmedString(item.category).toLowerCase();
        const content = asTrimmedString(item.content);
        if (!content || !MEMORY_CATEGORIES.has(category)) return null;
        return {
          series_id: seriesId,
          category,
          content,
        };
      })
      .filter(Boolean) as Array<Record<string, unknown>>;

    if (rows.length === 0) {
      return NextResponse.json({ error: "No valid memory entries generated" }, { status: 502 });
    }

    const { data: inserted, error } = await supabaseAdmin
      .from("series_memory")
      .insert(rows)
      .select("*");
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      inserted: inserted?.length ?? 0,
      entries: inserted ?? [],
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to LLM-fill memory" }, { status: 500 });
  }
}
