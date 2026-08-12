/**
 * Blueprint ↔ chapter-outline structural alignment checks.
 */

export type BlueprintLike = {
  opening_shift?: unknown;
  midpoint_shock?: unknown;
  lowest_point?: unknown;
  climax?: unknown;
  ending_change?: unknown;
  relationship_changes?: unknown;
  theme_pressure?: unknown;
  full_outline?: unknown;
} | null;

export type OutlineChapter = {
  number?: number;
  title?: string;
  summary?: string;
  events?: string[];
  emotional_development?: string;
  theme_focus?: string;
};

export type AlignmentIssue = {
  role: string;
  expectedBand: string;
  foundChapter: number | null;
  message: string;
  severity: "warning" | "info";
};

export type AlignmentResult = {
  ok: boolean;
  issues: AlignmentIssue[];
  placements: Record<string, number | null>;
};

function asText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);
}

function overlapScore(a: string, b: string): number {
  const ta = new Set(tokenize(a));
  const tb = tokenize(b);
  if (!ta.size || !tb.length) return 0;
  let hits = 0;
  tb.forEach((w) => {
    if (ta.has(w)) hits += 1;
  });
  return hits / Math.max(ta.size, 8);
}

function chapterBlob(chapter: OutlineChapter): string {
  return [
    chapter.title,
    chapter.summary,
    chapter.emotional_development,
    chapter.theme_focus,
    ...(Array.isArray(chapter.events) ? chapter.events : []),
  ]
    .map((x) => String(x ?? ""))
    .join(" ");
}

function bandIndices(
  total: number,
  startPct: number,
  endPct: number
): number[] {
  if (total <= 0) return [];
  const start = Math.max(0, Math.floor((startPct / 100) * total));
  const end = Math.min(total - 1, Math.ceil((endPct / 100) * total) - 1);
  const indices: number[] = [];
  for (let i = start; i <= Math.max(start, end); i += 1) indices.push(i);
  return indices;
}

type RoleSpec = {
  role: string;
  key: keyof NonNullable<BlueprintLike>;
  band: [number, number];
  expectedBand: string;
};

const ROLE_SPECS: RoleSpec[] = [
  {
    role: "opening_shift",
    key: "opening_shift",
    band: [0, 15],
    expectedBand: "chapters 1–early (~0–15%)",
  },
  {
    role: "midpoint_shock",
    key: "midpoint_shock",
    band: [40, 60],
    expectedBand: "midpoint (~40–60%)",
  },
  {
    role: "lowest_point",
    key: "lowest_point",
    band: [65, 80],
    expectedBand: "late middle (~65–80%)",
  },
  {
    role: "climax",
    key: "climax",
    band: [85, 95],
    expectedBand: "late (~85–95%)",
  },
  {
    role: "ending_change",
    key: "ending_change",
    band: [90, 100],
    expectedBand: "final chapters (~90–100%)",
  },
];

/**
 * Score each blueprint beat against chapter summaries in the expected band.
 * Returns issues when the best match is weak or outside the band.
 */
export function alignBlueprintToOutline(
  blueprint: BlueprintLike,
  outline: OutlineChapter[]
): AlignmentResult {
  const chapters = Array.isArray(outline) ? outline : [];
  const total = chapters.length;
  const issues: AlignmentIssue[] = [];
  const placements: Record<string, number | null> = {};

  if (!blueprint || total < 4) {
    return {
      ok: true,
      issues: blueprint
        ? []
        : [
            {
              role: "blueprint",
              expectedBand: "n/a",
              foundChapter: null,
              message: "No book blueprint available to validate against.",
              severity: "info",
            },
          ],
      placements,
    };
  }

  for (const spec of ROLE_SPECS) {
    const beatText = asText(blueprint[spec.key]);
    if (!beatText || beatText === "{}" || beatText === "[]") {
      placements[spec.role] = null;
      continue;
    }

    // Best match in expected band
    const band = bandIndices(total, spec.band[0], spec.band[1]);
    let bestInBand = { index: -1, score: 0 };
    band.forEach((idx) => {
      const score = overlapScore(beatText, chapterBlob(chapters[idx] ?? {}));
      if (score > bestInBand.score) bestInBand = { index: idx, score };
    });

    // Global best (to detect misplacement)
    let bestGlobal = { index: -1, score: 0 };
    chapters.forEach((ch, idx) => {
      const score = overlapScore(beatText, chapterBlob(ch));
      if (score > bestGlobal.score) bestGlobal = { index: idx, score };
    });

    const chapterNumber = (idx: number) =>
      Number(chapters[idx]?.number ?? idx + 1);

    if (bestInBand.score < 0.08 && bestGlobal.score < 0.08) {
      placements[spec.role] = null;
      issues.push({
        role: spec.role,
        expectedBand: spec.expectedBand,
        foundChapter: null,
        message: `Weak or missing alignment for ${spec.role.replace(/_/g, " ")} in ${spec.expectedBand}.`,
        severity: "warning",
      });
      continue;
    }

    if (bestInBand.score >= 0.08) {
      placements[spec.role] = chapterNumber(bestInBand.index);
      continue;
    }

    // Stronger match elsewhere than in-band
    placements[spec.role] = chapterNumber(bestGlobal.index);
    issues.push({
      role: spec.role,
      expectedBand: spec.expectedBand,
      foundChapter: chapterNumber(bestGlobal.index),
      message: `${spec.role.replace(/_/g, " ")} best matches Chapter ${chapterNumber(bestGlobal.index)}, outside ${spec.expectedBand}.`,
      severity: "warning",
    });
  }

  return {
    ok: issues.filter((i) => i.severity === "warning").length === 0,
    issues,
    placements,
  };
}
