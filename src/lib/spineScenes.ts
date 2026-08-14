export type SpineScene = {
  key: string;
  role: "opening" | "midpoint" | "lowest" | "climax";
  chapterIndex: number;
  sceneIndex: number;
  label: string;
};

function sceneCount(allScenes: Record<string, string[]>, chapterIndex: number): number {
  const titles = Object.keys(allScenes);
  const title = titles[chapterIndex];
  return title ? (allScenes[title]?.length ?? 0) : 0;
}

/** Opening of Ch1, midpoint/lowest/climax first scenes by chapter ratio. */
export function detectSpineScenes(
  allScenes: Record<string, string[]> | null | undefined
): SpineScene[] {
  if (!allScenes) return [];
  const titles = Object.keys(allScenes);
  const n = titles.length;
  if (!n) return [];

  const pick = (
    role: SpineScene["role"],
    chapterIndex: number,
    label: string
  ): SpineScene | null => {
    const idx = Math.max(0, Math.min(n - 1, chapterIndex));
    if (!sceneCount(allScenes, idx)) return null;
    return {
      key: `${idx}:0`,
      role,
      chapterIndex: idx,
      sceneIndex: 0,
      label: `${label} — ${titles[idx]} scene 1`,
    };
  };

  const spines: SpineScene[] = [];
  const opening = pick("opening", 0, "Opening");
  if (opening) spines.push(opening);

  if (n >= 3) {
    const mid = pick("midpoint", Math.floor(n * 0.5), "Midpoint");
    if (mid && !spines.some((s) => s.key === mid.key)) spines.push(mid);
  }
  if (n >= 4) {
    const low = pick("lowest", Math.floor(n * 0.72), "Lowest point");
    if (low && !spines.some((s) => s.key === low.key)) spines.push(low);
  }
  if (n >= 5) {
    const climax = pick("climax", Math.floor(n * 0.86), "Climax");
    if (climax && !spines.some((s) => s.key === climax.key)) spines.push(climax);
  }

  return spines;
}

export function unapprovedSpineScenes(
  spines: SpineScene[],
  approvals: Record<string, boolean> | null | undefined
): SpineScene[] {
  const map = approvals ?? {};
  return spines.filter((s) => !map[s.key]);
}
