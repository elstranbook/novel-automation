/**
 * Utility for formatting canon_log_entry data into prompt-friendly text
 * for use across the generation pipeline.
 *
 * Design principle: canon entries are immutable facts that anchor the
 * series continuity. They MUST be passed to the LLM in a readable,
 * structured form — not raw JSON — so the model can reason about them
 * and respect them while writing.
 */

interface CanonEntry {
  id?: string;
  category?: string | null;
  fact?: string | null;
  source?: string | null;
  cannot_change?: boolean | null;
  created_at?: string | null;
  [key: string]: unknown;
}

interface FormatOptions {
  /** Maximum total length of the output text (default: no limit) */
  maxLength?: number;
  /** Label for the section header (default: "CANON FACTS — MUST NOT CONTRADICT") */
  headerLabel?: string;
  /** Include the source line per entry (default: true) */
  includeSource?: boolean;
  /** Include the "locked" indicator per entry (default: true) */
  includeLock?: boolean;
  /** Include the category label per entry (default: true) */
  includeCategory?: boolean;
}

/**
 * Format a single canon entry into a compact, LLM-readable line.
 *
 * Example output:
 *   [WORLD | LOCKED] The Veil opens only on full moons. (src: Book 1, Ch 3)
 */
function formatSingleEntry(
  entry: CanonEntry,
  opts: Required<Pick<FormatOptions, 'includeSource' | 'includeLock' | 'includeCategory'>>
): string {
  const parts: string[] = [];

  // Category tag (uppercase for emphasis)
  if (opts.includeCategory) {
    const category = (entry.category || 'fact').toUpperCase().trim();
    parts.push(category);
  }

  // Lock indicator
  if (opts.includeLock && entry.cannot_change !== false && entry.cannot_change !== null) {
    parts.push('LOCKED');
  } else if (opts.includeLock && entry.cannot_change === false) {
    parts.push('soft');
  }

  const prefix = parts.length > 0 ? `[${parts.join(' | ')}] ` : '';

  // The fact itself
  const fact = String(entry.fact ?? '').trim();
  if (!fact) return '';

  let line = `${prefix}${fact}`;

  // Source attribution
  if (opts.includeSource && entry.source && String(entry.source).trim()) {
    line += ` (src: ${String(entry.source).trim()})`;
  }

  return line;
}

/**
 * Format an array of canon_log_entry rows into a prompt-ready text block.
 *
 * The output is grouped by category (world, character, event, rule, then others)
 * so the LLM can quickly find relevant facts. The header explicitly tells the
 * model these are immutable.
 *
 * @param entries - Array of canon_log_entry rows
 * @param options - Formatting options
 * @returns Formatted text block for inclusion in AI prompts
 */
export function formatCanonForPrompt(
  entries: CanonEntry[] | null | undefined,
  options?: FormatOptions
): string {
  if (!entries || !Array.isArray(entries) || entries.length === 0) return '';

  const {
    maxLength,
    headerLabel = 'CANON FACTS — MUST NOT CONTRADICT',
    includeSource = true,
    includeLock = true,
    includeCategory = true,
  } = options ?? {};

  const opts = { includeSource, includeLock, includeCategory };

  // Group by category for readability
  const categoryOrder = ['world', 'character', 'event', 'rule'] as const;
  const groups: Record<string, CanonEntry[]> = {};
  const otherCategories: string[] = [];

  for (const entry of entries) {
    const cat = (entry.category || 'other').toLowerCase().trim();
    if (!groups[cat]) {
      groups[cat] = [];
      if (!categoryOrder.includes(cat as typeof categoryOrder[number])) {
        if (!otherCategories.includes(cat)) otherCategories.push(cat);
      }
    }
    groups[cat].push(entry);
  }

  // Sort categories: known order first, then others alphabetically
  const orderedCategories = [
    ...categoryOrder.filter((c) => groups[c]?.length),
    ...otherCategories.sort().filter((c) => groups[c]?.length),
  ];

  // Build grouped output
  const sections: string[] = [];
  for (const cat of orderedCategories) {
    const lines = groups[cat]
      .map((entry) => formatSingleEntry(entry, opts))
      .filter(Boolean);
    if (lines.length) {
      sections.push(`${cat.toUpperCase()}:\n${lines.map((l) => `  - ${l}`).join('\n')}`);
    }
  }

  if (sections.length === 0) return '';

  let result = `${headerLabel}:\n${sections.join('\n\n')}`;

  if (maxLength && result.length > maxLength) {
    // Truncate while preserving the header
    const headerEnd = result.indexOf(':\n') + 2;
    const header = result.slice(0, headerEnd);
    const body = result.slice(headerEnd);
    const bodyBudget = maxLength - header.length - 20; // 20 chars for "...\n[truncated]"
    if (bodyBudget > 100) {
      result = header + body.slice(0, bodyBudget) + '...\n[truncated]';
    } else {
      result = (header + body).slice(0, maxLength) + '...';
    }
  }
  return result;
}

/**
 * Compact one-liner format, useful when canon needs to fit alongside
 * many other context blocks in a tight prompt budget.
 *
 * Example: "WORLD: Veil opens on full moons (B1,C3); CHARACTER: Mara has a scar over left eye (B1,C1)"
 */
export function formatCanonCompact(
  entries: CanonEntry[] | null | undefined,
  maxLength = 600
): string {
  if (!entries || !Array.isArray(entries) || entries.length === 0) return '';

  const parts: string[] = [];
  for (const entry of entries) {
    const category = (entry.category || 'fact').toUpperCase().trim();
    const fact = String(entry.fact ?? '').trim();
    if (!fact) continue;
    let part = `${category}: ${fact}`;
    if (entry.source && String(entry.source).trim()) {
      const src = String(entry.source).trim();
      // Compress "Book 1, Chapter 3" -> "B1,C3"
      const compressed = src
        .replace(/Book\s*(\d+)/gi, 'B$1')
        .replace(/Chapter\s*(\d+)/gi, 'C$1')
        .replace(/Ch\s*(\d+)/gi, 'C$1');
      part += ` (${compressed})`;
    }
    parts.push(part);
  }

  if (parts.length === 0) return '';

  let result = parts.join('; ');
  if (result.length > maxLength) {
    result = result.slice(0, maxLength - 3) + '...';
  }
  return result;
}
