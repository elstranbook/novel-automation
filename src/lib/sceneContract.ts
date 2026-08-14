/**
 * Scene pressure contracts + lexical anti-echo.
 * Fail closed at scene generation; prose uses echo bans as soft warnings.
 */

export type SceneContract = {
  goal: string;
  obstacle: string;
  turn: string;
  cost: string;
  hook: string;
};

export type SceneWithContract = {
  scene_number?: number;
  summary: string;
  beat_reference?: string;
  cast?: string[];
} & Partial<SceneContract>;

export type ChapterSceneValidation = {
  ok: boolean;
  reason?: string;
  echoes?: Array<[number, number]>;
};

const STOPWORDS = new Set([
  "about",
  "after",
  "again",
  "against",
  "being",
  "could",
  "from",
  "into",
  "that",
  "their",
  "there",
  "this",
  "through",
  "under",
  "when",
  "where",
  "which",
  "while",
  "will",
  "with",
  "would",
  "have",
  "been",
  "were",
  "they",
  "them",
  "then",
  "than",
  "just",
  "only",
  "also",
  "must",
  "scene",
  "chapter",
]);

const CONTRACT_KEYS = ["goal", "obstacle", "turn", "cost", "hook"] as const;
const MIN_FIELD_LEN = 8;
export const ECHO_JACCARD_THRESHOLD = 0.42;

const normalize = (value: string) => value.toLowerCase().trim();

export function significantTokens(text: string): string[] {
  return normalize(text)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 3 && !STOPWORDS.has(token));
}

export function jaccard(a: string, b: string): number {
  const setA = new Set(significantTokens(a));
  const setB = new Set(significantTokens(b));
  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;
  let inter = 0;
  for (const token of setA) {
    if (setB.has(token)) inter += 1;
  }
  const union = setA.size + setB.size - inter;
  return union === 0 ? 0 : inter / union;
}

function asField(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

export function normalizeContract(raw: unknown): SceneContract | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const rec = raw as Record<string, unknown>;
  const nested =
    rec.contract && typeof rec.contract === "object" && !Array.isArray(rec.contract)
      ? (rec.contract as Record<string, unknown>)
      : rec;
  const contract: SceneContract = {
    goal: asField(nested.goal),
    obstacle: asField(nested.obstacle),
    turn: asField(nested.turn),
    cost: asField(nested.cost),
    hook: asField(nested.hook),
  };
  for (const key of CONTRACT_KEYS) {
    if (contract[key].length < MIN_FIELD_LEN) return null;
  }
  return contract;
}

function echoBlob(scene: SceneWithContract): string {
  return [scene.summary, scene.turn, scene.hook].filter(Boolean).join(" ");
}

export function scenesEcho(
  scenes: SceneWithContract[],
  threshold = ECHO_JACCARD_THRESHOLD
): Array<[number, number]> {
  const echoes: Array<[number, number]> = [];
  for (let i = 0; i < scenes.length; i += 1) {
    for (let j = i + 1; j < scenes.length; j += 1) {
      if (jaccard(echoBlob(scenes[i]), echoBlob(scenes[j])) >= threshold) {
        echoes.push([i, j]);
      }
    }
  }
  return echoes;
}

export function validateChapterScenes(
  scenes: SceneWithContract[]
): ChapterSceneValidation {
  if (!scenes.length) {
    return { ok: false, reason: "no_scenes" };
  }

  for (let i = 0; i < scenes.length; i += 1) {
    const contract = normalizeContract(scenes[i]);
    if (!contract) {
      return {
        ok: false,
        reason: `missing_contract:scene_${i + 1}`,
      };
    }
    scenes[i] = { ...scenes[i], ...contract };
  }

  const turns = scenes.map((s) => normalize(String(s.turn ?? "")));
  for (let i = 0; i < turns.length; i += 1) {
    for (let j = i + 1; j < turns.length; j += 1) {
      if (turns[i] && turns[i] === turns[j]) {
        return {
          ok: false,
          reason: `duplicate_turn:scene_${i + 1}_${j + 1}`,
          echoes: [[i, j]],
        };
      }
    }
  }

  const echoes = scenesEcho(scenes);
  if (echoes.length) {
    const [a, b] = echoes[0];
    return {
      ok: false,
      reason: `echo:scene_${a + 1}_${b + 1}`,
      echoes,
    };
  }

  return { ok: true };
}

function ngrams(tokens: string[], n: number): string[] {
  if (tokens.length < n) return [];
  const grams: string[] = [];
  for (let i = 0; i <= tokens.length - n; i += 1) {
    grams.push(tokens.slice(i, i + n).join(" "));
  }
  return grams;
}

/** Repeated 2–3 word image phrases from prior scene text. */
export function buildEchoBanList(
  priorSceneTexts: string[],
  max = 12
): string[] {
  const counts = new Map<string, number>();
  for (const text of priorSceneTexts) {
    const tokens = significantTokens(text);
    const seen = new Set<string>();
    for (const gram of [...ngrams(tokens, 2), ...ngrams(tokens, 3)]) {
      if (seen.has(gram)) continue;
      seen.add(gram);
      counts.set(gram, (counts.get(gram) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, max)
    .map(([gram]) => gram);
}

export function detectEchoBanHits(text: string, bans: string[]): string[] {
  const lower = normalize(text);
  return bans.filter((ban) => ban && lower.includes(ban.toLowerCase()));
}

export function formatPriorScenesForPrompt(priorScenes: unknown): string {
  if (!Array.isArray(priorScenes) || priorScenes.length === 0) return "";
  const lines = priorScenes
    .slice(-12)
    .map((item, index) => {
      if (typeof item === "string") {
        return `${index + 1}. ${item.slice(0, 220)}`;
      }
      if (item && typeof item === "object") {
        const rec = item as Record<string, unknown>;
        const summary = asField(rec.summary) || asField(item);
        const turn = asField(rec.turn);
        return `${index + 1}. ${summary.slice(0, 180)}${turn ? ` | Turn: ${turn.slice(0, 80)}` : ""}`;
      }
      return "";
    })
    .filter(Boolean);
  if (!lines.length) return "";
  return `Do not repeat these prior setups, locations+revelations, or thesis lines:\n${lines.join("\n")}`;
}
