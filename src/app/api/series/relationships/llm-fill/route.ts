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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FillBody;
    const seriesIdOrError = requireSeriesId(body);
    if (seriesIdOrError instanceof NextResponse) return seriesIdOrError;
    const seriesId = seriesIdOrError;

    const { context, contextText } = await loadFillContext(seriesId);
    const existing = context.relationships ?? [];
    const characterNames = (context.characters ?? [])
      .map((c) => asTrimmedString(c.name))
      .filter(Boolean);

    const result = await runFillCompletion({
      seriesId,
      type: "relationships-llm-fill",
      model: body.model,
      system:
        "You are a character-relationship continuity editor. Return strict JSON only.",
      prompt: `Append NEW relationship entries between known characters.
Only use character names from the known list when available. Avoid near-duplicates.
Return 6–12 entries with relationship_type and status (e.g. allies, rivals, family, romantic, mentor; status neutral/strained/close/hostile).

KNOWN CHARACTERS:
${characterNames.length ? characterNames.map((n) => `- ${n}`).join("\n") : "(none listed — invent sparingly from context)"}

EXISTING RELATIONSHIPS:
${clipExistingList(
  existing,
  (e) =>
    `- ${e.character_a_name} ↔ ${e.character_b_name}: ${e.relationship_type} (${e.status ?? "neutral"})`
)}

SERIES CONTEXT:
${contextText}

Respond with JSON:
{ "entries": [{ "character_a_name": string, "character_b_name": string, "relationship_type": string, "status": string }] }`,
    });

    const rows = asArray(result.entries)
      .map((row) => {
        const item = (row ?? {}) as Record<string, unknown>;
        const a = asTrimmedString(item.character_a_name);
        const b = asTrimmedString(item.character_b_name);
        const type = asTrimmedString(item.relationship_type);
        if (!a || !b || !type || a.toLowerCase() === b.toLowerCase()) return null;
        return {
          character_a_name: a,
          character_b_name: b,
          relationship_type: type,
          status: asTrimmedString(item.status) || "neutral",
        };
      })
      .filter(Boolean) as Array<{
      character_a_name: string;
      character_b_name: string;
      relationship_type: string;
      status: string;
    }>;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No valid relationship entries generated" },
        { status: 502 }
      );
    }

    const { data: log, error: logError } = await supabaseAdmin
      .from("relationship_log")
      .upsert({ series_id: seriesId }, { onConflict: "series_id" })
      .select("id")
      .single();
    if (logError || !log?.id) {
      return NextResponse.json(
        { error: logError?.message ?? "Failed to ensure relationship log" },
        { status: 500 }
      );
    }

    const { data: inserted, error } = await supabaseAdmin
      .from("relationship_entry")
      .insert(rows.map((r) => ({ ...r, relationship_log_id: log.id })))
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
    return NextResponse.json(
      { error: "Failed to LLM-fill relationships" },
      { status: 500 }
    );
  }
}
