import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  asArray,
  asOptionalInt,
  asTrimmedString,
  clipExistingList,
  loadFillContext,
  requireSeriesId,
  runFillCompletion,
  type FillBody,
} from "@/lib/seriesLlmFill";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FillBody;
    const seriesIdOrError = requireSeriesId(body);
    if (seriesIdOrError instanceof NextResponse) return seriesIdOrError;
    const seriesId = seriesIdOrError;

    const { context, contextText } = await loadFillContext(seriesId);
    const existing = context.plot_threads ?? [];

    const result = await runFillCompletion({
      seriesId,
      type: "plot-threads-llm-fill",
      model: body.model,
      system:
        "You are a plot continuity editor for a multi-book series. Return strict JSON only.",
      prompt: `Append NEW plot threads. Avoid near-duplicates of existing threads.
Use types like main, subplot, mystery, romance, or arc. Prefer 4–8 threads.
Set introduced_in_book; set resolved_in_book only when clearly implied, else null.

EXISTING PLOT THREADS:
${clipExistingList(
  existing,
  (t) =>
    `- ${t.name}: ${t.description} [${t.type ?? "main"}] B${t.introduced_in_book ?? "?"}${
      t.resolved_in_book != null ? `→B${t.resolved_in_book}` : ""
    }`
)}

SERIES CONTEXT:
${contextText}

Respond with JSON:
{ "threads": [{ "name": string, "description": string, "type": string, "introduced_in_book": number, "resolved_in_book": number|null }] }`,
    });

    const rows = asArray(result.threads)
      .map((row) => {
        const item = (row ?? {}) as Record<string, unknown>;
        const name = asTrimmedString(item.name);
        const description = asTrimmedString(item.description);
        if (!name || !description) return null;
        return {
          series_id: seriesId,
          name,
          description,
          type: asTrimmedString(item.type) || "main",
          introduced_in_book: asOptionalInt(item.introduced_in_book) ?? 1,
          resolved_in_book: asOptionalInt(item.resolved_in_book),
          status: "setup",
        };
      })
      .filter(Boolean) as Array<Record<string, unknown>>;

    if (rows.length === 0) {
      return NextResponse.json({ error: "No valid plot threads generated" }, { status: 502 });
    }

    const { data: inserted, error } = await supabaseAdmin
      .from("plot_thread")
      .insert(rows)
      .select("*");
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      inserted: inserted?.length ?? 0,
      threads: inserted ?? [],
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to LLM-fill plot threads" }, { status: 500 });
  }
}
