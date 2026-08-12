import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type ValidationResult = {
  id: string;
  message: string;
  severity: string;
};

type MemoryEntry = {
  id: string;
  category: string | null;
  content: string;
};

const normalize = (value: string) => value.toLowerCase();

const inferMemoryWarnings = (entries: MemoryEntry[], totalBooks: number) => {
  const warnings: ValidationResult[] = [];
  const canonEntries = entries.filter((entry) => entry.category === "canon");
  const foreshadowEntries = entries.filter(
    (entry) => entry.category === "foreshadow"
  );
  const callbackEntries = entries.filter(
    (entry) => entry.category === "callback"
  );
  const clueEntries = entries.filter(
    (entry) => entry.category === "clue" || entry.category === "foreshadow"
  );

  const parsePayoffBook = (content: string) => {
    const match = content.match(/payoff(?:\s*book)?\s*[:#]?\s*(\d+)/i);
    return match ? Number(match[1]) : null;
  };

  foreshadowEntries.forEach((entry) => {
    const payoffBook = parsePayoffBook(entry.content);
    const hasCallback = callbackEntries.some((cb) =>
      normalize(cb.content).includes(normalize(entry.content).slice(0, 60))
    );

    if (payoffBook && payoffBook <= totalBooks && !hasCallback) {
      warnings.push({
        id: `memory-foreshadow-payoff-${entry.id}`,
        message: `Foreshadowing payoff expected by book ${payoffBook} but no callback logged: ${entry.content}`,
        severity: "warning",
      });
    } else if (!hasCallback) {
      warnings.push({
        id: `memory-foreshadow-${entry.id}`,
        message: `Foreshadowing has no callback: ${entry.content}`,
        severity: "warning",
      });
    }
  });

  const knowledgeStatements = new Map<string, Set<string>>();
  entries.forEach((entry) => {
    const lines = entry.content.split(/\n|\./);
    lines.forEach((line) => {
      const match = line.match(
        /(\w+(?:\s\w+)*)\s+(doesn't know|does not know|knows)\s+(.+)/i
      );
      if (match) {
        const character = normalize(match[1]);
        const status = normalize(match[2]).includes("does") ? "doesnt" : "knows";
        const fact = normalize(match[3]).trim();
        const key = `${character}|${fact}`;
        if (!knowledgeStatements.has(key)) {
          knowledgeStatements.set(key, new Set());
        }
        knowledgeStatements.get(key)?.add(status);
      }
    });
  });

  knowledgeStatements.forEach((states, key) => {
    if (states.has("knows") && states.has("doesnt")) {
      warnings.push({
        id: `knowledge-${key}`,
        message: `Character knowledge conflict detected for: ${key.replace("|", " about ")}`,
        severity: "warning",
      });
    }
  });

  if (canonEntries.length === 0) {
    warnings.push({
      id: "memory-canon-empty",
      message: "No canon facts logged in series memory yet.",
      severity: "info",
    });
  }

  const secretEntries = entries.filter(
    (entry) =>
      entry.category === "secret" || /secret|revealed/i.test(entry.content)
  );

  secretEntries.forEach((entry) => {
    const keyword = normalize(entry.content).split(/\s+/).slice(0, 6).join(" ");
    const hasClue = clueEntries.some((clue) =>
      normalize(clue.content).includes(keyword)
    );
    if (!hasClue) {
      warnings.push({
        id: `secret-${entry.id}`,
        message: `Secret revealed without clues: ${entry.content}`,
        severity: "warning",
      });
    }
  });

  return warnings;
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
    if (entry.status === "setup" && entry.payoff_book) {
      warnings.push({
        id: `foreshadow-payoff-${entry.event_description}`,
        message: `Foreshadowing payoff expected by book ${entry.payoff_book}.`,
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
    ...inferMemoryWarnings((memory ?? []) as MemoryEntry[], totalBooks)
  );

  return NextResponse.json({ warnings, blockers });
}
