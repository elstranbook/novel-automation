import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  inferSeriesMemoryWarnings,
  type SeriesMemoryEntry,
} from "@/lib/seriesMemoryValidate";

type ValidationResult = {
  id: string;
  message: string;
  severity: string;
};

/**
 * Unified series preflight: canon, foreshadowing tables, world/characters,
 * plus series_memory continuity heuristics.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get("seriesId");
  if (!seriesId) {
    return NextResponse.json({ error: "seriesId required" }, { status: 400 });
  }

  const warnings: ValidationResult[] = [];
  const blockers: ValidationResult[] = [];

  const { data: canonLogs } = await supabaseAdmin
    .from("canon_log")
    .select("id")
    .eq("series_id", seriesId);

  const canonLogIds = (canonLogs ?? []).map((row) => row.id);
  const { data: canonEntries } = canonLogIds.length
    ? await supabaseAdmin
        .from("canon_log_entry")
        .select("*")
        .in("canon_log_id", canonLogIds)
    : { data: [] as Array<Record<string, unknown>> };

  const { data: foreshadowing } = await supabaseAdmin
    .from("foreshadowing")
    .select("*")
    .eq("series_id", seriesId);

  const { data: characters } = await supabaseAdmin
    .from("series_characters")
    .select("id,name")
    .eq("series_id", seriesId);

  const { data: world } = await supabaseAdmin
    .from("series_worlds")
    .select("*")
    .eq("series_id", seriesId)
    .maybeSingle();

  const { data: worldElements } = await supabaseAdmin
    .from("world_element")
    .select("id")
    .eq("series_id", seriesId);

  const { data: mysteryLog } = await supabaseAdmin
    .from("mystery_log")
    .select("id")
    .eq("series_id", seriesId)
    .maybeSingle();

  const { data: secrets } = mysteryLog?.id
    ? await supabaseAdmin
        .from("secret")
        .select("id")
        .eq("mystery_log_id", mysteryLog.id)
    : { data: [] as Array<{ id: string }> };

  const { data: memory } = await supabaseAdmin
    .from("series_memory")
    .select("*")
    .eq("series_id", seriesId);

  const { data: books } = await supabaseAdmin
    .from("series_books")
    .select("book_number")
    .eq("series_id", seriesId);

  const totalBooks = Math.max(
    1,
    ...(books ?? []).map((book) => Number(book.book_number) || 1)
  );

  if (!canonEntries?.length) {
    warnings.push({
      id: "canon-empty",
      message: "Canon log has no entries.",
      severity: "info",
    });
  }

  foreshadowing?.forEach((entry) => {
    if ((entry.existing_hints ?? 0) < (entry.required_hints ?? 2)) {
      warnings.push({
        id: `foreshadow-${entry.event_description}`,
        message: `Foreshadowing missing hints: ${entry.event_description}`,
        severity: "warning",
      });
    }
    const payoffBook = Number(entry.payoff_book) || null;
    if (
      entry.status === "setup" &&
      payoffBook != null &&
      payoffBook <= totalBooks
    ) {
      warnings.push({
        id: `foreshadow-payoff-${entry.event_description}`,
        message: `Foreshadowing payoff expected by book ${payoffBook}.`,
        severity: "warning",
      });
    }
  });

  const hasCharacters = (characters ?? []).length > 0;
  const worldText = world
    ? Object.values(world)
        .filter((v) => typeof v === "string")
        .join(" ")
        .trim()
    : "";
  const hasWorld = Boolean(worldText) || (worldElements ?? []).length > 0;

  if (!hasCharacters) {
    blockers.push({
      id: "characters-empty",
      message:
        "Series has no characters. Add cast before generating scenes or prose.",
      severity: "blocker",
    });
  }

  if (!hasWorld) {
    blockers.push({
      id: "world-empty",
      message:
        "Series world is empty. Add world overview or elements before generating scenes or prose.",
      severity: "blocker",
    });
  }

  if (!(secrets ?? []).length && (foreshadowing ?? []).length > 0) {
    warnings.push({
      id: "mystery-empty-with-setup",
      message:
        "Foreshadowing exists but mystery secrets are empty. Confirm before continuing.",
      severity: "warning",
    });
  }

  warnings.push(
    ...inferSeriesMemoryWarnings(
      (memory ?? []) as SeriesMemoryEntry[],
      totalBooks
    )
  );

  return NextResponse.json({ warnings, blockers });
}
