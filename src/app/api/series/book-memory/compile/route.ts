import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { runChatCompletion } from "@/lib/openaiClient";
import { resolveModel, PipelineStep } from "@/lib/modelDefaults";
import { loadSeriesContext } from "@/lib/seriesContext";
import { formatSeriesContextForPrompt } from "@/lib/seriesPrompt";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type CompilePayload = {
  seriesId?: string;
  bookNumber?: number;
  model?: string;
};

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CompilePayload;
    const seriesId = typeof body.seriesId === "string" ? body.seriesId.trim() : "";
    const bookNumber = Number(body.bookNumber) || 0;
    if (!seriesId || bookNumber < 1) {
      return NextResponse.json(
        { error: "seriesId and bookNumber required" },
        { status: 400 }
      );
    }

    const { data: bookRow, error: bookError } = await supabaseAdmin
      .from("series_books")
      .select("*")
      .eq("series_id", seriesId)
      .eq("book_number", bookNumber)
      .maybeSingle();

    if (bookError || !bookRow?.id) {
      return NextResponse.json(
        { error: bookError?.message ?? "Series book not found" },
        { status: 404 }
      );
    }

    const context = await loadSeriesContext(seriesId, bookNumber);
    const contextText = formatSeriesContextForPrompt(context, {
      includeCharacters: true,
      priority: true,
      maxLength: 7000,
    });

    let synopsisText = "";
    if (bookRow.novel_id) {
      const { data: synopsis } = await supabaseAdmin
        .from("novel_synopsis")
        .select("synopsis")
        .eq("novel_id", bookRow.novel_id)
        .maybeSingle();
      synopsisText = asText(synopsis?.synopsis);

      const { data: proseRows } = await supabaseAdmin
        .from("prose_scenes")
        .select("scene_content,chapter_order,scene_order")
        .eq("novel_id", bookRow.novel_id)
        .order("chapter_order", { ascending: false })
        .order("scene_order", { ascending: false })
        .limit(3);
      if (proseRows?.length) {
        const ending = proseRows
          .map((row) => asText(row.scene_content))
          .filter(Boolean)
          .join("\n\n")
          .split(/\s+/)
          .slice(-400)
          .join(" ");
        if (ending) {
          synopsisText = `${synopsisText}\n\nLast prose excerpt:\n${ending}`.trim();
        }
      }
    }

    const characterList = (context.characters ?? [])
      .map((c) => `- ${asText(c.name)} (${asText(c.role) || "character"}) id=${c.id}`)
      .filter((line) => line.includes("id="))
      .slice(0, 20)
      .join("\n");

    const result = await runChatCompletion({
      model: resolveModel(body.model, PipelineStep.SERIES_BIBLE),
      system:
        "You are a series continuity editor. Return strict JSON only. Compress what must carry into the next book.",
      prompt: `Compile end-of-book continuity memory for Book ${bookNumber} ("${asText(bookRow.title)}").
This memory will be injected into Book ${bookNumber + 1} prompts.

SERIES CONTEXT:
${contextText}

BOOK SYNOPSIS / ENDING EXCERPT:
${synopsisText || "(none)"}

KNOWN CHARACTERS (use these ids when writing character_states):
${characterList || "(none)"}

Return JSON:
{
  "compressed_summary": string,
  "canon_state": object|array,
  "relationship_state": object|array,
  "mystery_state": object|array,
  "character_knowledge": object|array,
  "emotional_memories": object|array,
  "new_facts": array,
  "changed_relationships": array,
  "new_clues": array,
  "resolved_mysteries": array,
  "character_states": [
    {
      "character_id": "uuid from list when possible",
      "character_name": string,
      "location": string,
      "emotional_state": string,
      "knowledge": array|object,
      "trauma": string|array,
      "growth": string|array,
      "internal_conflict": string,
      "dont_know": array|object
    }
  ]
}

Rules:
- Prefer durable facts over scene-by-scene recap.
- Mark mysteries as resolved only if clearly resolved.
- character_states: 3–10 main cast members.`,
      jsonResponse: true,
      generationMeta: {
        seriesId,
        type: "book-memory-compile",
        targetId: String(bookRow.id),
      },
    });

    const payload =
      result && typeof result === "object" && !Array.isArray(result)
        ? (result as Record<string, unknown>)
        : {};

    const compressedSummary =
      payload.compressed_summary ??
      payload.summary ??
      `Book ${bookNumber} continuity pack`;

    const { data: memory, error: memoryError } = await supabaseAdmin
      .from("book_memory")
      .upsert(
        {
          book_id: bookRow.id,
          compressed_summary: compressedSummary,
          canon_state: payload.canon_state ?? null,
          relationship_state: payload.relationship_state ?? null,
          mystery_state: payload.mystery_state ?? null,
          character_knowledge: payload.character_knowledge ?? null,
          emotional_memories: payload.emotional_memories ?? null,
          new_facts: payload.new_facts ?? null,
          changed_relationships: payload.changed_relationships ?? null,
          new_clues: payload.new_clues ?? null,
          resolved_mysteries: payload.resolved_mysteries ?? null,
        },
        { onConflict: "book_id" }
      )
      .select("*")
      .single();

    if (memoryError) {
      return NextResponse.json({ error: memoryError.message }, { status: 500 });
    }

    const nameToId = new Map(
      (context.characters ?? []).map((c) => [
        asText(c.name).toLowerCase(),
        String(c.id),
      ])
    );

    const stateRows = asArray(payload.character_states)
      .map((row) => {
        const item = (row ?? {}) as Record<string, unknown>;
        const name = asText(item.character_name);
        const byId = asText(item.character_id);
        const idValid = (context.characters ?? []).some(
          (c) => String(c.id) === byId
        );
        const characterId = idValid
          ? byId
          : nameToId.get(name.toLowerCase()) ?? null;
        if (!characterId) return null;
        return {
          character_id: characterId,
          book_id: bookRow.id,
          location: asText(item.location) || null,
          emotional_state: asText(item.emotional_state) || null,
          knowledge: item.knowledge ?? null,
          dont_know: item.dont_know ?? null,
          trauma: item.trauma ?? null,
          growth: item.growth ?? null,
          internal_conflict: asText(item.internal_conflict) || null,
          beliefs: item.beliefs ?? null,
          relationships: item.relationships ?? null,
        };
      })
      .filter(Boolean) as Array<Record<string, unknown>>;

    let characterStates: Array<Record<string, unknown>> = [];
    if (stateRows.length > 0) {
      const { data, error } = await supabaseAdmin
        .from("character_state")
        .upsert(stateRows, { onConflict: "character_id,book_id" })
        .select("*");
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      characterStates = (data ?? []) as Array<Record<string, unknown>>;
    }

    // Mark book status when compiling after writing
    await supabaseAdmin
      .from("series_books")
      .update({ status: bookRow.status === "planned" ? "draft" : bookRow.status })
      .eq("id", bookRow.id);

    return NextResponse.json({
      memory,
      characterStates,
      inserted: 1 + characterStates.length,
      bookId: bookRow.id,
      bookNumber,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to compile book memory" },
      { status: 500 }
    );
  }
}
