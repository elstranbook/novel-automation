/**
 * Utility for formatting mystery_log data (secrets + clues) into
 * prompt-friendly text for use across the generation pipeline.
 *
 * Design principle: mysteries are the *engine* of long-form series
 * tension. The LLM needs to know:
 *   - what secrets exist (and their reveal status)
 *   - who knows / doesn't know each secret
 *   - what clues have been planted (and where)
 *   - which clue points to which secret
 *
 * This formatter turns the raw DB rows into a readable, structured
 * block the LLM can reason about — never raw JSON dumps.
 */

interface Secret {
  id?: string;
  title?: string | null;
  description?: string | null;
  who_knows?: unknown;
  who_doesnt_know?: unknown;
  revealed_in_book?: number | null;
  revealed_in_chapter?: number | null;
  reveal_method?: string | null;
  status?: string | null; // hidden | partial | revealed
  created_at?: string | null;
  [key: string]: unknown;
}

interface Clue {
  id?: string;
  secret_id?: string | null;
  description?: string | null;
  clue_type?: string | null; // dialogue | object | event | description
  planted_in_book?: number | null;
  planted_in_chapter?: number | null;
  is_obvious?: boolean | null;
  was_noticed?: boolean | null;
  created_at?: string | null;
  [key: string]: unknown;
}

interface FormatOptions {
  /** Maximum total length of the output text (default: no limit) */
  maxLength?: number;
  /** Header label (default: "MYSTERY LOG — REVEAL DISCIPLINE") */
  headerLabel?: string;
  /** Include who-knows / who-doesn't lines per secret (default: true) */
  includeKnowledge?: boolean;
  /** Include reveal-planning fields per secret (default: true) */
  includeReveal?: boolean;
  /** Include clue → secret linkage (default: true) */
  includeLinks?: boolean;
  /** Include created_at timestamps (default: false) */
  includeTimestamps?: boolean;
}

/** Status badge → friendly label */
function statusLabel(status: string | null | undefined): string {
  const s = String(status ?? "hidden").toLowerCase().trim();
  switch (s) {
    case "revealed":
      return "REVEALED";
    case "partial":
      return "PARTIAL";
    case "hidden":
    default:
      return "HIDDEN";
  }
}

/** Serialize a JSONB-ish value (who_knows often comes back as array) */
function coerceList(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === "string" ? v : JSON.stringify(v)))
      .filter(Boolean)
      .join(", ");
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/** Compress "Book 1, Chapter 3" → "B1,C3" for compact output */
function compressLocation(book?: number | null, chapter?: number | null): string {
  const parts: string[] = [];
  if (book != null) parts.push(`B${book}`);
  if (chapter != null) parts.push(`C${chapter}`);
  return parts.join(",");
}

/**
 * Format a single secret into a readable multi-line block.
 *
 * Example output:
 *   - [HIDDEN] The Veil opens only on full moons.
 *       Knows: Mara, the Council
 *       Doesn't know: the general public
 *       Reveal: Book 2, Ch 7 — through Council confession
 */
function formatSecret(
  secret: Secret,
  opts: {
    includeKnowledge: boolean;
    includeReveal: boolean;
    includeTimestamps: boolean;
  }
): string {
  const title = String(secret.title ?? "").trim();
  const description = String(secret.description ?? "").trim();
  if (!title && !description) return "";

  const lines: string[] = [];
  const badge = statusLabel(secret.status);
  const head = title || "Untitled secret";
  lines.push(`- [${badge}] ${head}`);

  if (description) {
    lines.push(`    "${description}"`);
  }

  if (opts.includeKnowledge) {
    const knows = coerceList(secret.who_knows);
    const doesnt = coerceList(secret.who_doesnt_know);
    if (knows) lines.push(`    Knows: ${knows}`);
    if (doesnt) lines.push(`    Doesn't know: ${doesnt}`);
  }

  if (opts.includeReveal) {
    const loc = compressLocation(secret.revealed_in_book, secret.revealed_in_chapter);
    if (loc) {
      const method = secret.reveal_method ? String(secret.reveal_method).trim() : "";
      lines.push(method ? `    Reveal: ${loc} — ${method}` : `    Reveal: ${loc}`);
    }
  }

  if (opts.includeTimestamps && secret.created_at) {
    lines.push(`    (added: ${String(secret.created_at).slice(0, 10)})`);
  }

  return lines.join("\n");
}

/**
 * Format a single clue into a readable line.
 *
 * Example output:
 *   - [OBJECT | B1,C3 | NOTICED] A silver locket left on the sill. → "The Veil opens only on full moons."
 */
function formatClue(
  clue: Clue,
  secretLookup: Map<string, string>,
  opts: {
    includeLinks: boolean;
    includeTimestamps: boolean;
  }
): string {
  const description = String(clue.description ?? "").trim();
  if (!description) return "";

  const parts: string[] = [];
  const type = String(clue.clue_type ?? "clue").toUpperCase().trim();
  parts.push(type);

  const loc = compressLocation(clue.planted_in_book, clue.planted_in_chapter);
  if (loc) parts.push(loc);

  if (clue.was_noticed === true) parts.push("NOTICED");
  else if (clue.is_obvious === true) parts.push("OBVIOUS");
  else parts.push("UNNOTICED");

  let line = `- [${parts.join(" | ")}] ${description}`;

  // Link to parent secret
  if (opts.includeLinks && clue.secret_id) {
    const parentTitle = secretLookup.get(String(clue.secret_id));
    if (parentTitle) {
      line += ` → "${parentTitle}"`;
    }
  }

  if (opts.includeTimestamps && clue.created_at) {
    line += ` (added: ${String(clue.created_at).slice(0, 10)})`;
  }

  return line;
}

/**
 * Format secrets + clues into a single prompt-ready block.
 *
 * Output structure:
 *   MYSTERY LOG — REVEAL DISCIPLINE:
 *
 *   SECRETS:
 *     - [HIDDEN] Title
 *         description...
 *         Knows: ...
 *
 *   CLUES (planted):
 *     - [OBJECT | B1,C3 | UNNOTICED] ...
 *
 * @param secrets - Array of secret rows
 * @param clues   - Array of clue rows
 * @param options - Formatting options
 */
export function formatMysteryForPrompt(
  secrets: Secret[] | null | undefined,
  clues: Clue[] | null | undefined,
  options?: FormatOptions
): string {
  const safeSecrets = Array.isArray(secrets) ? secrets : [];
  const safeClues = Array.isArray(clues) ? clues : [];
  if (safeSecrets.length === 0 && safeClues.length === 0) return "";

  const {
    maxLength,
    headerLabel = "MYSTERY LOG — REVEAL DISCIPLINE",
    includeKnowledge = true,
    includeReveal = true,
    includeLinks = true,
    includeTimestamps = false,
  } = options ?? {};

  // Build a secret id → title lookup for clue linking
  const secretLookup = new Map<string, string>();
  for (const s of safeSecrets) {
    if (s.id && s.title) secretLookup.set(String(s.id), String(s.title).trim());
  }

  const sections: string[] = [];

  // Group secrets by status: hidden → partial → revealed
  const statusOrder = ["hidden", "partial", "revealed"] as const;
  const groupedSecrets: Record<string, Secret[]> = {};
  for (const s of safeSecrets) {
    const status = String(s.status ?? "hidden").toLowerCase().trim() || "hidden";
    if (!groupedSecrets[status]) groupedSecrets[status] = [];
    groupedSecrets[status].push(s);
  }

  if (safeSecrets.length > 0) {
    const secretLines: string[] = [];
    for (const status of statusOrder) {
      const group = groupedSecrets[status];
      if (!group || group.length === 0) continue;
      const block = group
        .map((s) =>
          formatSecret(s, { includeKnowledge, includeReveal, includeTimestamps })
        )
        .filter(Boolean);
      if (block.length) {
        secretLines.push(`  ${status.toUpperCase()} (${block.length}):`);
        secretLines.push(...block.map((b) => `  ${b}`));
      }
    }
    // Any non-standard statuses
    for (const status of Object.keys(groupedSecrets)) {
      if (statusOrder.includes(status as typeof statusOrder[number])) continue;
      const block = groupedSecrets[status]
        .map((s) =>
          formatSecret(s, { includeKnowledge, includeReveal, includeTimestamps })
        )
        .filter(Boolean);
      if (block.length) {
        secretLines.push(`  ${status.toUpperCase()} (${block.length}):`);
        secretLines.push(...block.map((b) => `  ${b}`));
      }
    }
    if (secretLines.length) {
      sections.push(`SECRETS:\n${secretLines.join("\n")}`);
    }
  }

  if (safeClues.length > 0) {
    const clueLines = safeClues
      .map((c) => formatClue(c, secretLookup, { includeLinks, includeTimestamps }))
      .filter(Boolean);
    if (clueLines.length) {
      sections.push(`CLUES (planted in story):\n${clueLines.map((l) => `  ${l}`).join("\n")}`);
    }
  }

  if (sections.length === 0) return "";

  let result = `${headerLabel}:\n\n${sections.join("\n\n")}`;

  if (maxLength && result.length > maxLength) {
    const headerEnd = result.indexOf(":\n\n") + 3;
    const header = result.slice(0, headerEnd);
    const body = result.slice(headerEnd);
    const bodyBudget = maxLength - header.length - 20;
    if (bodyBudget > 100) {
      result = header + body.slice(0, bodyBudget) + "...\n[truncated]";
    } else {
      result = (header + body).slice(0, maxLength) + "...";
    }
  }
  return result;
}

/**
 * Compact one-liner format, useful when mysteries need to fit alongside
 * many other context blocks in a tight prompt budget.
 *
 * Example: "SECRET [HIDDEN]: The Veil opens on full moons (B2,C7); CLUE [OBJECT | B1,C3]: A silver locket on the sill"
 */
export function formatMysteryCompact(
  secrets: Secret[] | null | undefined,
  clues: Clue[] | null | undefined,
  maxLength = 800
): string {
  const safeSecrets = Array.isArray(secrets) ? secrets : [];
  const safeClues = Array.isArray(clues) ? clues : [];
  if (safeSecrets.length === 0 && safeClues.length === 0) return "";

  const parts: string[] = [];
  for (const s of safeSecrets) {
    const title = String(s.title ?? "").trim();
    if (!title) continue;
    const badge = statusLabel(s.status);
    const loc = compressLocation(s.revealed_in_book, s.revealed_in_chapter);
    let part = `SECRET [${badge}]: ${title}`;
    if (loc) part += ` (${loc})`;
    parts.push(part);
  }
  for (const c of safeClues) {
    const description = String(c.description ?? "").trim();
    if (!description) continue;
    const type = String(c.clue_type ?? "clue").toUpperCase().trim();
    const loc = compressLocation(c.planted_in_book, c.planted_in_chapter);
    const part = `CLUE [${type}${loc ? " | " + loc : ""}]: ${description}`;
    parts.push(part);
  }

  if (parts.length === 0) return "";

  let result = parts.join("; ");
  if (result.length > maxLength) {
    result = result.slice(0, maxLength - 3) + "...";
  }
  return result;
}
