import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Warning = { id: string; message: string; severity: string };

type MemoryEntry = {
  id: string;
  category: string | null;
  content: string;
};

const normalize = (value: string) => value.toLowerCase();

const inferWarnings = (entries: MemoryEntry[], totalBooks: number) => {
  const warnings: Warning[] = [];
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
        id: `foreshadow-payoff-${entry.id}`,
        message: `Foreshadowing payoff expected by book ${payoffBook} but no callback logged: ${entry.content}`,
        severity: "warning",
      });
    } else if (!hasCallback) {
      warnings.push({
        id: `foreshadow-${entry.id}`,
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

  const relationshipStates = new Map<string, Set<string>>();
  entries.forEach((entry) => {
    const match = entry.content.match(
      /(\w+(?:\s\w+)*)\s+(?:and|&)\s+(\w+(?:\s\w+)*)\s+(?:are|is)\s+(friends|enemies|romantic|family|allies|rivals)/i
    );
    if (match) {
      const pair = [normalize(match[1]), normalize(match[2])].sort().join("|");
      const type = normalize(match[3]);
      if (!relationshipStates.has(pair)) {
        relationshipStates.set(pair, new Set());
      }
      relationshipStates.get(pair)?.add(type);
    }
  });

  relationshipStates.forEach((types, pair) => {
    if (types.size > 1) {
      warnings.push({
        id: `relationship-${pair}`,
        message: `Relationship contradiction for ${pair.replace("|", " & ")}: ${Array.from(types).join(", ")}`,
        severity: "warning",
      });
    }
  });

  const secretEntries = entries.filter(
    (entry) => entry.category === "secret" || /secret|revealed/i.test(entry.content)
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

  if (canonEntries.length === 0) {
    warnings.push({
      id: "canon-empty",
      message: "No canon facts logged yet.",
      severity: "info",
    });
  }

  return warnings;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get("seriesId");

  if (!seriesId) {
    return NextResponse.json({ error: "seriesId required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("series_memory")
    .select("id,category,content")
    .eq("series_id", seriesId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: books } = await supabaseAdmin
    .from("series_books")
    .select("book_number")
    .eq("series_id", seriesId);

  const totalBooks = Math.max(
    1,
    ...(books ?? []).map((book) => Number(book.book_number) || 1)
  );

  const warnings = inferWarnings((data ?? []) as MemoryEntry[], totalBooks);
  return NextResponse.json({ warnings });
}
