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

const CANON_CATEGORIES = new Set(["world", "character", "event", "rule"]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FillBody;
    const seriesIdOrError = requireSeriesId(body);
    if (seriesIdOrError instanceof NextResponse) return seriesIdOrError;
    const seriesId = seriesIdOrError;

    const { context, contextText } = await loadFillContext(seriesId);
    const existing = context.canon_entries ?? [];

    const result = await runFillCompletion({
      seriesId,
      type: "canon-llm-fill",
      model: body.model,
      system:
        "You are a continuity editor for a multi-book novel series. Return strict JSON only.",
      prompt: `Append NEW canon facts for this series. Do not contradict locked canon or bible story rules.
Prefer foundations from the series bible, world, characters, blueprints, and book map.
Return 8–12 entries. About half should be locked (cannot_change: true) immutable foundations;
the rest soft suggestions (cannot_change: false) with source "LLM suggestion".
Categories must be one of: world, character, event, rule.
Avoid near-duplicates of existing facts.

EXISTING CANON:
${clipExistingList(existing, (e) => `- [${e.category}] ${e.fact}${e.cannot_change ? " [LOCKED]" : ""}`)}

SERIES CONTEXT:
${contextText}

Respond with JSON:
{ "entries": [{ "category": "world|character|event|rule", "fact": string, "source": string, "cannot_change": boolean }] }`,
    });

    const rawEntries = asArray(result.entries)
      .map((row) => {
        const item = (row ?? {}) as Record<string, unknown>;
        const category = asTrimmedString(item.category).toLowerCase();
        const fact = asTrimmedString(item.fact);
        if (!fact || !CANON_CATEGORIES.has(category)) return null;
        const cannotChange = item.cannot_change !== false;
        return {
          category,
          fact,
          source: asTrimmedString(item.source) || (cannotChange ? "LLM fill" : "LLM suggestion"),
          cannot_change: cannotChange,
        };
      })
      .filter(Boolean) as Array<{
      category: string;
      fact: string;
      source: string;
      cannot_change: boolean;
    }>;

    if (rawEntries.length === 0) {
      return NextResponse.json({ error: "No valid canon entries generated" }, { status: 502 });
    }

    const { data: log, error: logError } = await supabaseAdmin
      .from("canon_log")
      .upsert({ series_id: seriesId }, { onConflict: "series_id" })
      .select("id")
      .single();
    if (logError || !log?.id) {
      return NextResponse.json(
        { error: logError?.message ?? "Failed to ensure canon log" },
        { status: 500 }
      );
    }

    const { data: inserted, error } = await supabaseAdmin
      .from("canon_log_entry")
      .insert(rawEntries.map((entry) => ({ ...entry, canon_log_id: log.id })))
      .select("*");
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const locked = (inserted ?? []).filter((e) => e.cannot_change).length;
    const soft = (inserted ?? []).length - locked;
    return NextResponse.json({
      inserted: inserted?.length ?? 0,
      locked,
      soft,
      entries: inserted ?? [],
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to LLM-fill canon" }, { status: 500 });
  }
}
