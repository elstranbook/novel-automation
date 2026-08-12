import { formatCanonForPrompt } from "@/lib/canonPrompt";
import { formatMysteryForPrompt } from "@/lib/mysteryPrompt";
import { formatCharactersForPrompt } from "@/lib/characterPrompt";
import type { SeriesContext } from "@/lib/seriesContext";

function clip(value: string, maxLength?: number): string {
  if (!maxLength || value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3)}...`;
}

function asText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function section(title: string, body: string): string {
  const trimmed = body.trim();
  if (!trimmed) return "";
  return `${title}\n${trimmed}`;
}

export function formatWorldForPrompt(
  world: Record<string, unknown> | null | undefined,
  worldElements?: unknown,
  options?: { maxLength?: number }
): string {
  if (!world && !worldElements) return "";
  const lines: string[] = [];
  const summary = asText(world?.summary);
  const setting = asText(world?.setting);
  const rules = asText(world?.rules);
  const lore = asText(world?.lore);
  if (summary) lines.push(`Summary: ${clip(summary, 600)}`);
  if (setting) lines.push(`Setting: ${clip(setting, 600)}`);
  if (rules) lines.push(`Rules: ${clip(rules, 600)}`);
  if (lore) lines.push(`Lore: ${clip(lore, 600)}`);
  if (worldElements) {
    const elements = asText(worldElements);
    if (elements && elements !== "[]" && elements !== "{}") {
      lines.push(`Elements: ${clip(elements, 800)}`);
    }
  }
  return clip(lines.join("\n"), options?.maxLength);
}

export function formatRelationshipsForPrompt(
  relationships: Array<Record<string, unknown>> | null | undefined,
  options?: { maxLength?: number }
): string {
  if (!relationships || relationships.length === 0) return "";
  const lines = relationships
    .map((rel) => {
      const a = asText(rel.character_a_name);
      const b = asText(rel.character_b_name);
      if (!a && !b) return "";
      const type = asText(rel.relationship_type) || "related";
      const status = asText(rel.status) || "neutral";
      const trust = rel.trust_level != null ? ` trust ${rel.trust_level}` : "";
      const tension = rel.tension_level != null ? ` tension ${rel.tension_level}` : "";
      return `- ${a} & ${b}: ${type} (${status}${trust}${tension})`;
    })
    .filter(Boolean);
  if (lines.length === 0) return "";
  return clip(lines.join("\n"), options?.maxLength ?? 800);
}

export function formatTimelineForPrompt(
  timeline: Array<Record<string, unknown>> | null | undefined,
  options?: { maxLength?: number }
): string {
  if (!timeline || timeline.length === 0) return "";
  const sorted = [...timeline].sort(
    (a, b) => Number(a.event_order ?? 0) - Number(b.event_order ?? 0)
  );
  const lines = sorted
    .map((event) => {
      const title = asText(event.title) || "Untitled event";
      const description = asText(event.description);
      const book = event.book_number != null ? `B${event.book_number}` : "?";
      const chapter = event.chapter_number != null ? `C${event.chapter_number}` : "";
      const order = event.event_order != null ? `#${event.event_order}` : "";
      const loc = [book, chapter, order].filter(Boolean).join(" ");
      return `- [${loc}] ${title}${description ? `: ${description}` : ""}`;
    })
    .filter(Boolean);
  return clip(lines.join("\n"), options?.maxLength ?? 800);
}

export function formatMemoryForPrompt(
  memory: Array<Record<string, unknown>> | null | undefined,
  options?: { maxLength?: number }
): string {
  if (!memory || memory.length === 0) return "";
  const lines = memory
    .map((entry) => {
      const content = asText(entry.content);
      if (!content) return "";
      const category = (asText(entry.category) || "note").toUpperCase();
      return `- [${category}] ${content}`;
    })
    .filter(Boolean);
  if (lines.length === 0) return "";
  return clip(lines.join("\n"), options?.maxLength ?? 800);
}

export function formatPlotThreadsForPrompt(
  threads: Array<Record<string, unknown>> | null | undefined,
  options?: { maxLength?: number }
): string {
  if (!threads || threads.length === 0) return "";
  const lines = threads
    .map((thread) => {
      const name = asText(thread.name);
      const description = asText(thread.description);
      if (!name && !description) return "";
      const type = asText(thread.type) || "main";
      const start = thread.introduced_in_book != null ? `B${thread.introduced_in_book}` : "?";
      const end =
        thread.resolved_in_book != null ? `→B${thread.resolved_in_book}` : " (open)";
      return `- [${type}] ${name || "Untitled"} (${start}${end})${description ? `: ${description}` : ""}`;
    })
    .filter(Boolean);
  return clip(lines.join("\n"), options?.maxLength ?? 800);
}

function formatBookMapForPrompt(
  bookMap: Array<Record<string, unknown>> | null | undefined,
  bookNumber: number,
  options?: { maxLength?: number }
): string {
  if (!bookMap || bookMap.length === 0) return "";
  const lines = bookMap.map((book) => {
    const num = Number(book.book_number ?? 0);
    const marker = num === Number(bookNumber) ? "CURRENT" : "book";
    const title = asText(book.title) || `Book ${num || "?"}`;
    const parts = [
      asText(book.summary) ? `summary: ${clip(asText(book.summary), 140)}` : "",
      asText(book.book_purpose) ? `purpose: ${clip(asText(book.book_purpose), 120)}` : "",
      asText(book.external_conflict)
        ? `external: ${clip(asText(book.external_conflict), 100)}`
        : "",
      asText(book.internal_conflict)
        ? `internal: ${clip(asText(book.internal_conflict), 100)}`
        : "",
      asText(book.stakes) ? `stakes: ${clip(asText(book.stakes), 100)}` : "",
      asText(book.reveals) ? `reveals: ${clip(asText(book.reveals), 100)}` : "",
      asText(book.character_progression)
        ? `progression: ${clip(asText(book.character_progression), 100)}`
        : "",
    ].filter(Boolean);
    return `- [${marker} ${num}] ${title}${parts.length ? ` — ${parts.join("; ")}` : ""}`;
  });
  return clip(lines.join("\n"), options?.maxLength ?? 900);
}

export function formatBookMemoryForPrompt(
  memory: Record<string, unknown> | null | undefined,
  options?: { maxLength?: number }
): string {
  if (!memory) return "";
  const lines: string[] = [];
  const summary = asText(memory.compressed_summary);
  if (summary && summary !== "{}" && summary !== "[]") {
    lines.push(`Summary: ${clip(summary, 400)}`);
  }
  const deltas = [
    ["New facts", memory.new_facts],
    ["Changed relationships", memory.changed_relationships],
    ["New clues", memory.new_clues],
    ["Resolved mysteries", memory.resolved_mysteries],
    ["Mystery state", memory.mystery_state],
    ["Relationship state", memory.relationship_state],
    ["Emotional memories", memory.emotional_memories],
  ] as const;
  for (const [label, value] of deltas) {
    const text = asText(value);
    if (text && text !== "{}" && text !== "[]" && text !== "null") {
      lines.push(`${label}: ${clip(text, 220)}`);
    }
  }
  if (lines.length === 0) return "";
  return clip(lines.join("\n"), options?.maxLength ?? 800);
}

export function formatTensionForPrompt(
  tension: Record<string, unknown> | null | undefined,
  options?: { maxLength?: number; chapterNumber?: number; totalChapters?: number }
): string {
  if (!tension) return "";
  const start = tension.start_tension ?? 2;
  const mid = tension.midpoint_tension ?? "?";
  const climax = tension.climax_tension ?? "?";
  const resolution = tension.resolution_tension ?? "?";
  const lines = [
    `Curve: start ${start} → mid ${mid} → climax ${climax} → resolution ${resolution}`,
  ];
  if (tension.last_peak) lines.push(`Last peak: ${asText(tension.last_peak)}`);
  const chapterNumber = Number(options?.chapterNumber ?? 0);
  const totalChapters = Number(options?.totalChapters ?? 0);
  if (chapterNumber > 0 && totalChapters > 0) {
    const ratio = chapterNumber / totalChapters;
    let target: unknown = start;
    if (ratio >= 0.9) target = resolution;
    else if (ratio >= 0.75) target = climax;
    else if (ratio >= 0.45) target = mid;
    lines.push(
      `Chapter ${chapterNumber}/${totalChapters}: aim near tension ${target}`
    );
  }
  return clip(lines.join("\n"), options?.maxLength ?? 300);
}

export function formatCharacterStatesForPrompt(
  states: Array<Record<string, unknown>> | null | undefined,
  options?: { maxLength?: number; castNames?: string[] }
): string {
  if (!states || states.length === 0) return "";
  const cast = (options?.castNames ?? []).map((n) => n.toLowerCase().trim()).filter(Boolean);
  const filtered =
    cast.length > 0
      ? states.filter((s) => {
          const name = asText(s.character_name).toLowerCase();
          return !name || cast.some((n) => name.includes(n) || n.includes(name));
        })
      : states;
  const list = (filtered.length ? filtered : states).slice(0, 8);
  const lines = list
    .map((s) => {
      const name = asText(s.character_name) || "Character";
      const bits = [
        asText(s.location) ? `at ${asText(s.location)}` : "",
        asText(s.emotional_state) ? `mood ${asText(s.emotional_state)}` : "",
        asText(s.knowledge) ? `knows ${clip(asText(s.knowledge), 80)}` : "",
        asText(s.trauma) ? `trauma ${clip(asText(s.trauma), 60)}` : "",
        asText(s.growth) ? `growth ${clip(asText(s.growth), 60)}` : "",
        asText(s.internal_conflict)
          ? `conflict ${clip(asText(s.internal_conflict), 60)}`
          : "",
      ].filter(Boolean);
      return `- ${name}: ${bits.join("; ") || "state recorded"}`;
    })
    .filter(Boolean);
  if (lines.length === 0) return "";
  return clip(lines.join("\n"), options?.maxLength ?? 700);
}

function formatCurrentBookMapDetail(
  mapData: Record<string, unknown> | null | undefined,
  options?: { maxLength?: number }
): string {
  if (!mapData) return "";
  const lines = [
    asText(mapData.central_conflict)
      ? `Conflict: ${clip(asText(mapData.central_conflict), 180)}`
      : "",
    asText(mapData.emotional_journey)
      ? `Emotional journey: ${clip(asText(mapData.emotional_journey), 140)}`
      : "",
    asText(mapData.character_growth)
      ? `Growth: ${clip(asText(mapData.character_growth), 140)}`
      : "",
    asText(mapData.twist_reveal)
      ? `Reveal: ${clip(asText(mapData.twist_reveal), 140)}`
      : "",
    asText(mapData.stakes_escalation)
      ? `Stakes: ${clip(asText(mapData.stakes_escalation), 140)}`
      : "",
    asText(mapData.foreshadowing_seeds)
      ? `Foreshadow seeds: ${clip(asText(mapData.foreshadowing_seeds), 140)}`
      : "",
    asText(mapData.final_state)
      ? `Final state: ${clip(asText(mapData.final_state), 140)}`
      : "",
  ].filter(Boolean);
  if (lines.length === 0) return "";
  return clip(lines.join("\n"), options?.maxLength ?? 700);
}

function formatEvolutionForPrompt(evolution: unknown, maxLength = 800): string {
  const text = asText(evolution);
  if (!text || text === "{}" || text === "[]") return "";
  return clip(text, maxLength);
}

export function formatSeriesContextForPrompt(
  context: SeriesContext | Record<string, unknown> | null | undefined,
  options?: {
    includeCharacters?: boolean;
    maxLength?: number;
    /** When true, emit continuity-critical sections first and stop at maxLength. */
    priority?: boolean;
  }
): string {
  if (!context) return "";
  const includeCharacters = options?.includeCharacters !== false;
  const priority = options?.priority === true;
  const maxLength = options?.maxLength;
  const ctx = context as SeriesContext;

  const headerParts = [
    asText(ctx.series_title) ? `Series: ${asText(ctx.series_title)}` : "",
    ctx.book_number
      ? `This is Book ${ctx.book_number}${ctx.total_books ? ` of ${ctx.total_books}` : ""}`
      : "",
    asText(ctx.series_description)
      ? `Description: ${clip(asText(ctx.series_description), 400)}`
      : "",
    asText(ctx.series_arc) ? `Series arc: ${clip(asText(ctx.series_arc), 600)}` : "",
    asText(ctx.themes) ? `Themes: ${clip(asText(ctx.themes), 400)}` : "",
    asText(ctx.continuity_notes)
      ? `Continuity notes: ${clip(asText(ctx.continuity_notes), 400)}`
      : "",
  ].filter(Boolean);

  const bible = (ctx as SeriesContext).bible;
  const bibleLines: string[] = [];
  if (bible) {
    if (bible.series_arc_summary) {
      bibleLines.push(`Arc: ${clip(asText(bible.series_arc_summary), 400)}`);
    }
    if (Array.isArray(bible.story_rules) && bible.story_rules.length) {
      bibleLines.push(
        `Story rules:\n${bible.story_rules
          .slice(0, 12)
          .map((r) => `- ${clip(asText(r), 180)}`)
          .join("\n")}`
      );
    }
    if (
      Array.isArray(bible.continuity_lockfile) &&
      bible.continuity_lockfile.length
    ) {
      bibleLines.push(
        `Continuity lockfile:\n${bible.continuity_lockfile
          .slice(0, 12)
          .map((r) => `- ${clip(asText(r), 180)}`)
          .join("\n")}`
      );
    }
    if (
      Array.isArray(bible.unanswered_mysteries) &&
      bible.unanswered_mysteries.length
    ) {
      bibleLines.push(
        `Unanswered mysteries:\n${bible.unanswered_mysteries
          .slice(0, 10)
          .map((r) => `- ${clip(asText(r), 180)}`)
          .join("\n")}`
      );
    }
    if (bible.themes_symbols) {
      bibleLines.push(
        `Themes/symbols: ${clip(asText(bible.themes_symbols), 400)}`
      );
    }
  }

  const lockedCanon = (ctx.canon_entries ?? []).filter(
    (e) => e.cannot_change !== false
  );
  const softCanon = (ctx.canon_entries ?? []).filter(
    (e) => e.cannot_change === false
  );

  // Priority order for continuity-critical packing
  const prioritySections: string[] = [
    headerParts.length ? headerParts.join("\n") : "",
    section("SERIES BIBLE LAW", bibleLines.join("\n\n")),
    formatCanonForPrompt(
      lockedCanon.length ? lockedCanon : ctx.canon_entries,
      { maxLength: 1200 }
    ),
    softCanon.length && lockedCanon.length
      ? formatCanonForPrompt(softCanon, { maxLength: 600 })
      : "",
    formatMysteryForPrompt(ctx.secrets, ctx.clues, { maxLength: 1500 }),
    section(
      "PRIOR BOOK MEMORY",
      formatBookMemoryForPrompt(ctx.prior_book_memory, { maxLength: 800 })
    ),
    section(
      "CHARACTER STATES",
      formatCharacterStatesForPrompt(ctx.character_states, { maxLength: 700 })
    ),
    section(
      "TENSION PROFILE",
      formatTensionForPrompt(ctx.tension_profile, { maxLength: 300 })
    ),
    section(
      "CURRENT BOOK MAP DETAIL",
      formatCurrentBookMapDetail(ctx.current_book_map, { maxLength: 700 })
    ),
    section(
      "RELATIONSHIPS",
      formatRelationshipsForPrompt(ctx.relationships, { maxLength: 800 })
    ),
    section("SERIES MEMORY", formatMemoryForPrompt(ctx.memory, { maxLength: 800 })),
    section(
      "PLOT THREADS",
      formatPlotThreadsForPrompt(ctx.plot_threads, { maxLength: 800 })
    ),
    section("TIMELINE", formatTimelineForPrompt(ctx.timeline, { maxLength: 800 })),
    section(
      "WORLD",
      formatWorldForPrompt(ctx.world as Record<string, unknown> | null, ctx.world_elements, {
        maxLength: priority ? 1200 : 2200,
      })
    ),
    includeCharacters && Array.isArray(ctx.characters) && ctx.characters.length > 0
      ? formatCharactersForPrompt(
          ctx.characters as Parameters<typeof formatCharactersForPrompt>[0],
          {
            maxLength: priority ? 1800 : 3000,
            headerLabel: "CHARACTER PROFILES",
          }
        )
      : "",
    section(
      "BOOK MAP",
      formatBookMapForPrompt(ctx.book_map, Number(ctx.book_number ?? 1), {
        maxLength: priority ? 900 : 1100,
      })
    ),
    ctx.book_blueprint
      ? section("BOOK BLUEPRINT", clip(asText(ctx.book_blueprint), priority ? 1200 : 2000))
      : "",
    ctx.prior_books?.length
      ? section(
          "PRIOR BOOKS",
          ctx.prior_books
            .map((book) => `- ${book.title}: ${clip(asText(book.synopsis), 220)}`)
            .join("\n")
        )
      : "",
    section(
      "CHARACTER EVOLUTION",
      formatEvolutionForPrompt(ctx.character_evolution, priority ? 400 : 800)
    ),
    section(
      "CALLBACKS",
      ctx.callbacks?.length ? clip(asText(ctx.callbacks), 600) : ""
    ),
    section(
      "FORESHADOWING",
      ctx.foreshadowing?.length ? clip(asText(ctx.foreshadowing), 600) : ""
    ),
  ].filter(Boolean);

  if (!priority || !maxLength) {
    const full = prioritySections.join("\n\n");
    return maxLength ? clip(full, maxLength) : full;
  }

  const packed: string[] = [];
  let used = 0;
  for (const part of prioritySections) {
    const nextLen = used === 0 ? part.length : used + 2 + part.length;
    if (nextLen > maxLength) {
      const remaining = maxLength - used - (used === 0 ? 0 : 2);
      if (remaining > 80) {
        packed.push(clip(part, remaining));
      }
      break;
    }
    packed.push(part);
    used = nextLen;
  }
  return packed.join("\n\n");
}
