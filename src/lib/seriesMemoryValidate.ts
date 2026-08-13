export type MemoryValidationItem = {
  id: string;
  message: string;
  severity: string;
};

export type SeriesMemoryEntry = {
  id: string;
  category: string | null;
  content: string;
};

const normalize = (value: string) => value.toLowerCase();

const STOPWORDS = new Set([
  "about",
  "after",
  "alliances",
  "alter",
  "become",
  "becomes",
  "being",
  "books",
  "claims",
  "climax",
  "could",
  "dynamics",
  "eventually",
  "from",
  "future",
  "into",
  "later",
  "power",
  "revealed",
  "series",
  "that",
  "their",
  "there",
  "this",
  "through",
  "under",
  "upcoming",
  "when",
  "where",
  "which",
  "while",
  "will",
  "with",
  "would",
]);

const parsePayoffBook = (content: string) => {
  const match = content.match(/payoff(?:\s*book)?\s*[:#]?\s*(\d+)/i);
  return match ? Number(match[1]) : null;
};

const significantTokens = (text: string) =>
  normalize(text)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 3 && !STOPWORDS.has(token));

/** True when a callback looks like it pays off this foreshadow plant. */
export const callbackMatchesForeshadow = (
  foreshadow: string,
  callback: string
) => {
  const f = normalize(foreshadow).trim();
  const c = normalize(callback).trim();
  if (!f || !c) return false;

  const prefix = f.slice(0, 60);
  if (prefix.length >= 20 && c.includes(prefix)) return true;

  const tokens = significantTokens(f);
  if (tokens.length === 0) return false;
  const hits = tokens.filter((token) => c.includes(token));
  const needed = Math.min(3, Math.max(2, Math.ceil(tokens.length * 0.35)));
  return hits.length >= needed;
};

const isExplicitlyDeferred = (content: string) =>
  /later books?|series climax|future books?|upcoming books?|eventually|down the (?:line|road)|in (?:a )?later/i.test(
    content
  );

/**
 * Continuity heuristics for series_memory entries.
 * Open / future foreshadow plants do not warn until a payoff book is due.
 */
export function inferSeriesMemoryWarnings(
  entries: SeriesMemoryEntry[],
  totalBooks: number,
  options?: { includeRelationshipChecks?: boolean; idPrefix?: string }
): MemoryValidationItem[] {
  const warnings: MemoryValidationItem[] = [];
  const prefix = options?.idPrefix ?? "";
  const includeRelationships = options?.includeRelationshipChecks ?? false;

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

  foreshadowEntries.forEach((entry) => {
    const payoffBook = parsePayoffBook(entry.content);
    const hasCallback = callbackEntries.some((cb) =>
      callbackMatchesForeshadow(entry.content, cb.content)
    );
    if (hasCallback) return;

    if (payoffBook != null) {
      if (payoffBook <= totalBooks) {
        warnings.push({
          id: `${prefix}memory-foreshadow-payoff-${entry.id}`,
          message: `Foreshadowing payoff expected by book ${payoffBook} but no callback logged: ${entry.content}`,
          severity: "warning",
        });
      }
      // Scheduled for a book that does not exist yet — leave open.
      return;
    }

    // Explicitly deferred plants ("later books", "series climax") are normal.
    if (isExplicitlyDeferred(entry.content)) return;

    // Undated open plant: track as info only (does not trip studio confirm).
    warnings.push({
      id: `${prefix}memory-foreshadow-${entry.id}`,
      message: `Open foreshadowing (no callback yet): ${entry.content}`,
      severity: "info",
    });
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
        id: `${prefix}knowledge-${key}`,
        message: `Character knowledge conflict detected for: ${key.replace("|", " about ")}`,
        severity: "warning",
      });
    }
  });

  if (includeRelationships) {
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
          id: `${prefix}relationship-${pair}`,
          message: `Relationship contradiction for ${pair.replace("|", " & ")}: ${Array.from(types).join(", ")}`,
          severity: "warning",
        });
      }
    });
  }

  if (canonEntries.length === 0) {
    warnings.push({
      id: `${prefix}memory-canon-empty`,
      message: "No canon facts logged in series memory yet.",
      severity: "info",
    });
  }

  // Only treat explicit secret-category rows (or uncategorized reveal notes)
  // as secrets — foreshadow plants often say "secret" without being a reveal.
  const secretEntries = entries.filter((entry) => {
    if (entry.category === "secret") return true;
    if (
      entry.category === "foreshadow" ||
      entry.category === "clue" ||
      entry.category === "callback" ||
      entry.category === "canon" ||
      entry.category === "knowledge" ||
      entry.category === "relationship" ||
      entry.category === "warning"
    ) {
      return false;
    }
    return /secret (?:is |was )?revealed|revealed (?:the |a )?secret/i.test(
      entry.content
    );
  });

  secretEntries.forEach((entry) => {
    const keyword = normalize(entry.content).split(/\s+/).slice(0, 6).join(" ");
    const hasClue = clueEntries.some((clue) =>
      normalize(clue.content).includes(keyword)
    );
    if (!hasClue) {
      warnings.push({
        id: `${prefix}secret-${entry.id}`,
        message: `Secret revealed without clues: ${entry.content}`,
        severity: "warning",
      });
    }
  });

  return warnings;
}
