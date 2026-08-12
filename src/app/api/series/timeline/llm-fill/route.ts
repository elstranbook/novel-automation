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
    const existing = context.timeline ?? [];

    const result = await runFillCompletion({
      seriesId,
      type: "timeline-llm-fill",
      model: body.model,
      system:
        "You are a series timeline continuity editor. Return strict JSON only.",
      prompt: `Append NEW timeline events across books. Avoid near-duplicates.
Set chapter_number when blueprint/outline implies a chapter; otherwise null.
Prefer 6–12 events with sensible event_order within each book.

EXISTING TIMELINE:
${clipExistingList(
  existing,
  (e) =>
    `- [B${e.book_number ?? "?"}${e.chapter_number != null ? ` C${e.chapter_number}` : ""} #${e.event_order ?? "?"}] ${e.title}: ${e.description}`
)}

SERIES CONTEXT:
${contextText}

Respond with JSON:
{ "events": [{ "title": string, "description": string, "book_number": number, "chapter_number": number|null, "event_order": number }] }`,
    });

    const rows = asArray(result.events)
      .map((row) => {
        const item = (row ?? {}) as Record<string, unknown>;
        const title = asTrimmedString(item.title);
        const description = asTrimmedString(item.description);
        if (!title && !description) return null;
        if (!description) return null;
        return {
          series_id: seriesId,
          title: title || "Untitled event",
          description,
          book_number: asOptionalInt(item.book_number),
          chapter_number: asOptionalInt(item.chapter_number),
          event_order: asOptionalInt(item.event_order) ?? 1,
        };
      })
      .filter(Boolean) as Array<Record<string, unknown>>;

    if (rows.length === 0) {
      return NextResponse.json({ error: "No valid timeline events generated" }, { status: 502 });
    }

    const { data: inserted, error } = await supabaseAdmin
      .from("series_timeline_events")
      .insert(rows)
      .select("*");
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      inserted: inserted?.length ?? 0,
      events: inserted ?? [],
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to LLM-fill timeline" }, { status: 500 });
  }
}
