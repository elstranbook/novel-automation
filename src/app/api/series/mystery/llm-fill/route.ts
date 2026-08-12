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
    const existingSecrets = context.secrets ?? [];
    const existingClues = context.clues ?? [];

    const result = await runFillCompletion({
      seriesId,
      type: "mystery-llm-fill",
      model: body.model,
      system:
        "You are a mystery continuity editor for a multi-book series. Return strict JSON only.",
      prompt: `Append NEW secrets and clues. Do not reveal or contradict hidden mysteries already listed.
Default secret status to "hidden". Clues may set planted_in_book / planted_in_chapter when implied.
Link each clue to a secret via secret_title matching a secret title in this response (or an existing one).
Avoid near-duplicates. Prefer 3–6 secrets and 4–10 clues.

EXISTING SECRETS:
${clipExistingList(existingSecrets, (s) => `- ${s.title}: ${s.description} [${s.status ?? "hidden"}]`)}

EXISTING CLUES:
${clipExistingList(existingClues, (c) => `- ${c.description} (B${c.planted_in_book ?? "?"})`)}

SERIES CONTEXT:
${contextText}

Respond with JSON:
{
  "secrets": [{ "title": string, "description": string, "status": "hidden"|"partial"|"revealed", "who_knows": string[], "who_doesnt_know": string[] }],
  "clues": [{ "description": string, "secret_title": string, "planted_in_book": number, "planted_in_chapter": number|null, "clue_type": "dialogue"|"object"|"event"|"description", "is_obvious": boolean }]
}`,
    });

    const secretsRaw = asArray(result.secrets)
      .map((row) => {
        const item = (row ?? {}) as Record<string, unknown>;
        const title = asTrimmedString(item.title);
        const description = asTrimmedString(item.description);
        if (!title || !description) return null;
        const status = asTrimmedString(item.status).toLowerCase() || "hidden";
        return {
          title,
          description,
          status: ["hidden", "partial", "revealed"].includes(status) ? status : "hidden",
          who_knows: Array.isArray(item.who_knows) ? item.who_knows : null,
          who_doesnt_know: Array.isArray(item.who_doesnt_know) ? item.who_doesnt_know : null,
        };
      })
      .filter(Boolean) as Array<{
      title: string;
      description: string;
      status: string;
      who_knows: unknown;
      who_doesnt_know: unknown;
    }>;

    const cluesRaw = asArray(result.clues)
      .map((row) => {
        const item = (row ?? {}) as Record<string, unknown>;
        const description = asTrimmedString(item.description);
        const planted = asOptionalInt(item.planted_in_book) ?? 1;
        if (!description) return null;
        return {
          description,
          secret_title: asTrimmedString(item.secret_title),
          planted_in_book: planted,
          planted_in_chapter: asOptionalInt(item.planted_in_chapter),
          clue_type: asTrimmedString(item.clue_type) || "event",
          is_obvious: item.is_obvious === true,
        };
      })
      .filter(Boolean) as Array<{
      description: string;
      secret_title: string;
      planted_in_book: number;
      planted_in_chapter: number | null;
      clue_type: string;
      is_obvious: boolean;
    }>;

    if (secretsRaw.length === 0 && cluesRaw.length === 0) {
      return NextResponse.json({ error: "No valid mystery rows generated" }, { status: 502 });
    }

    const { data: log, error: logError } = await supabaseAdmin
      .from("mystery_log")
      .upsert({ series_id: seriesId }, { onConflict: "series_id" })
      .select("id")
      .single();
    if (logError || !log?.id) {
      return NextResponse.json(
        { error: logError?.message ?? "Failed to ensure mystery log" },
        { status: 500 }
      );
    }

    let insertedSecrets: Array<Record<string, unknown>> = [];
    if (secretsRaw.length > 0) {
      const { data, error } = await supabaseAdmin
        .from("secret")
        .insert(
          secretsRaw.map((s) => ({
            mystery_log_id: log.id,
            title: s.title,
            description: s.description,
            status: s.status,
            who_knows: s.who_knows,
            who_doesnt_know: s.who_doesnt_know,
          }))
        )
        .select("*");
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      insertedSecrets = (data ?? []) as Array<Record<string, unknown>>;
    }

    const titleToId = new Map<string, string>();
    for (const s of existingSecrets) {
      const title = asTrimmedString(s.title).toLowerCase();
      const id = asTrimmedString(s.id);
      if (title && id) titleToId.set(title, id);
    }
    for (const s of insertedSecrets) {
      const title = asTrimmedString(s.title).toLowerCase();
      const id = asTrimmedString(s.id);
      if (title && id) titleToId.set(title, id);
    }

    let insertedClues: Array<Record<string, unknown>> = [];
    if (cluesRaw.length > 0) {
      const { data, error } = await supabaseAdmin
        .from("clue")
        .insert(
          cluesRaw.map((c) => ({
            mystery_log_id: log.id,
            description: c.description,
            secret_id: c.secret_title
              ? titleToId.get(c.secret_title.toLowerCase()) ?? null
              : null,
            planted_in_book: c.planted_in_book,
            planted_in_chapter: c.planted_in_chapter,
            clue_type: c.clue_type,
            is_obvious: c.is_obvious,
            was_noticed: false,
          }))
        )
        .select("*");
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      insertedClues = (data ?? []) as Array<Record<string, unknown>>;
    }

    return NextResponse.json({
      inserted: insertedSecrets.length + insertedClues.length,
      secrets: insertedSecrets,
      clues: insertedClues,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to LLM-fill mystery" }, { status: 500 });
  }
}
