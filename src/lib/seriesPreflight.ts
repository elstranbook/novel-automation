/**
 * Series preflight helpers for studio gates before scenes/prose.
 */

export type PreflightItem = {
  id: string;
  message: string;
  severity: "info" | "warning" | "blocker" | string;
};

export type PreflightResult = {
  warnings: PreflightItem[];
  blockers: PreflightItem[];
};

export type SeriesContextLike = {
  world?: Record<string, unknown> | null;
  world_elements?: unknown[];
  characters?: unknown[];
  secrets?: unknown[];
  clues?: unknown[];
  canon_entries?: unknown[];
  foreshadowing?: unknown[];
  callbacks?: unknown[];
} | null;

function worldHasContent(ctx: SeriesContextLike): boolean {
  if (!ctx) return false;
  const world = ctx.world;
  if (world && typeof world === "object") {
    const overview = String(
      world.overview ??
        world.world_overview ??
        world.summary ??
        world.setting ??
        ""
    ).trim();
    if (overview) return true;
    for (const value of Object.values(world)) {
      if (typeof value === "string" && value.trim()) return true;
      if (value && typeof value === "object") {
        try {
          const asJson = JSON.stringify(value);
          if (asJson && asJson !== "{}" && asJson !== "[]" && asJson !== "null") {
            return true;
          }
        } catch {
          // ignore
        }
      }
    }
  }
  return Array.isArray(ctx.world_elements) && ctx.world_elements.length > 0;
}

export function assessSeriesContextGates(
  seriesId: string | null | undefined,
  ctx: SeriesContextLike
): PreflightResult {
  const warnings: PreflightItem[] = [];
  const blockers: PreflightItem[] = [];

  if (!seriesId) {
    return { warnings, blockers };
  }

  const hasCharacters =
    Array.isArray(ctx?.characters) && ctx!.characters!.length > 0;
  const hasWorld = worldHasContent(ctx);
  const hasSecrets = Array.isArray(ctx?.secrets) && ctx!.secrets!.length > 0;
  const hasCanon =
    Array.isArray(ctx?.canon_entries) && ctx!.canon_entries!.length > 0;
  const hasForeshadow =
    Array.isArray(ctx?.foreshadowing) && ctx!.foreshadowing!.length > 0;
  const hasCallbacks =
    Array.isArray(ctx?.callbacks) && ctx!.callbacks!.length > 0;

  if (!hasCharacters) {
    blockers.push({
      id: "characters-empty",
      message:
        "Series has no characters. Add cast in the Series Characters tab before scenes/prose.",
      severity: "blocker",
    });
  }

  if (!hasWorld) {
    blockers.push({
      id: "world-empty",
      message:
        "Series world is empty. Add a world overview or world elements before scenes/prose.",
      severity: "blocker",
    });
  }

  if (!hasCanon) {
    warnings.push({
      id: "canon-empty",
      message: "Canon log is empty. Continuity checks will be weak.",
      severity: "warning",
    });
  }

  if (!hasSecrets && (hasForeshadow || hasCallbacks)) {
    warnings.push({
      id: "mystery-empty-with-setup",
      message:
        "Foreshadowing/callbacks exist but mystery secrets are empty. Confirm before continuing.",
      severity: "warning",
    });
  } else if (!hasSecrets) {
    warnings.push({
      id: "mystery-empty",
      message: "No mystery secrets logged for this series.",
      severity: "info",
    });
  }

  return { warnings, blockers };
}

export function lastNWordsLocal(text: string, n = 200): string {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return "";
  const words = trimmed.split(/\s+/);
  if (words.length <= n) return trimmed;
  return words.slice(-n).join(" ");
}

export function countProseScenes(prose: Record<string, string[]> | null | undefined): number {
  if (!prose) return 0;
  return Object.values(prose).reduce((sum, scenes) => sum + (scenes?.length ?? 0), 0);
}

export function countPlannedScenes(
  scenes: Record<string, string[]> | null | undefined
): number {
  return countProseScenes(scenes);
}

export function isProsePartial(
  allScenes: Record<string, string[]> | null | undefined,
  proseScenes: Record<string, string[]> | null | undefined
): boolean {
  const planned = countPlannedScenes(allScenes);
  const done = countProseScenes(proseScenes);
  return planned > 0 && done > 0 && done < planned;
}

export async function fetchSeriesPreflight(
  seriesId: string
): Promise<PreflightResult> {
  const response = await fetch(
    `/api/series/validate?seriesId=${encodeURIComponent(seriesId)}`
  );
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      (body && typeof body.error === "string" && body.error) ||
        "Series validation failed"
    );
  }
  const data = await response.json();
  const warnings = Array.isArray(data.warnings) ? data.warnings : [];
  const blockers = Array.isArray(data.blockers) ? data.blockers : [];
  return { warnings, blockers };
}
