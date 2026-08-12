/**
 * Shared helpers for B+ scene prose: parse payloads, infer pacing,
 * slim series context for a single scene, and build draft/revise prompts.
 */

import { formatCharactersForPrompt, formatPOVCharacterContext } from "@/lib/characterPrompt";
import { formatCanonForPrompt } from "@/lib/canonPrompt";
import { formatMysteryForPrompt } from "@/lib/mysteryPrompt";
import {
  formatWorldForPrompt,
  formatRelationshipsForPrompt,
  formatMemoryForPrompt,
  formatBookMemoryForPrompt,
  formatCharacterStatesForPrompt,
  formatTensionForPrompt,
} from "@/lib/seriesPrompt";
import type { SeriesContext } from "@/lib/seriesContext";

export type ScenePacing = "sprint" | "talky" | "linger" | "aftermath";

export type ParsedScene = {
  summary: string;
  beatReference: string | null;
  sceneNumber: number | null;
};

export type BeatLike = {
  beat_number?: number | string;
  action?: string;
  emotional_impact?: string;
  tension_hook?: string;
};

export const BAN_PHRASES = [
  "couldn't help but",
  "could not help but",
  "heart pounded",
  "heart was pounding",
  "breath I didn't know I was holding",
  "breath I did not know I was holding",
  "a single tear",
  "eyes twinkled",
  "I knew in that moment",
  "moved through the moment with a heavy heart",
  "smirked",
  "smirk playing",
];

export const DRAFT_TEMPERATURE = 0.85;
export const REVISE_TEMPERATURE = 0.4;

export function lastNWords(text: string, n = 200): string {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return "";
  const words = trimmed.split(/\s+/);
  if (words.length <= n) return trimmed;
  return words.slice(-n).join(" ");
}

export function parseScenePayload(scene: unknown): ParsedScene {
  if (scene == null) {
    return { summary: "", beatReference: null, sceneNumber: null };
  }

  if (typeof scene === "object" && !Array.isArray(scene)) {
    const record = scene as Record<string, unknown>;
    const summary = String(
      record.summary ?? record.scene ?? record.content ?? record.text ?? ""
    ).trim();
    const beatReference = record.beat_reference
      ? String(record.beat_reference)
      : null;
    const sceneNumber =
      record.scene_number != null ? Number(record.scene_number) : null;
    return {
      summary: summary || JSON.stringify(record),
      beatReference,
      sceneNumber: Number.isFinite(sceneNumber) ? sceneNumber : null,
    };
  }

  const asString = String(scene).trim();
  if (!asString) {
    return { summary: "", beatReference: null, sceneNumber: null };
  }

  // Try parse stringified JSON object/array element
  if (
    (asString.startsWith("{") && asString.endsWith("}")) ||
    (asString.startsWith("[") && asString.endsWith("]"))
  ) {
    try {
      const parsed = JSON.parse(asString);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parseScenePayload(parsed[0]);
      }
      return parseScenePayload(parsed);
    } catch {
      // fall through
    }
  }

  // Soft extract from pretty-printed JSON fragments
  const summaryMatch = asString.match(/"summary"\s*:\s*"((?:\\.|[^"\\])*)"/);
  if (summaryMatch?.[1]) {
    const beatMatch = asString.match(
      /"beat_reference"\s*:\s*"((?:\\.|[^"\\])*)"/
    );
    const numMatch = asString.match(/"scene_number"\s*:\s*(\d+)/);
    return {
      summary: summaryMatch[1].replace(/\\"/g, '"').replace(/\\n/g, "\n"),
      beatReference: beatMatch?.[1]
        ? beatMatch[1].replace(/\\"/g, '"')
        : null,
      sceneNumber: numMatch ? Number(numMatch[1]) : null,
    };
  }

  return { summary: asString, beatReference: null, sceneNumber: null };
}

/** Extract character name hints from a scene payload when present. */
export function extractSceneCastNames(scene: unknown): string[] {
  const names = new Set<string>();
  const collect = (value: unknown) => {
    if (typeof value === "string" && value.trim()) {
      value.split(/,|&|\band\b/i).forEach((part) => {
        const n = part.trim();
        if (n) names.add(n);
      });
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item === "string" && item.trim()) names.add(item.trim());
        else if (item && typeof item === "object") {
          const rec = item as Record<string, unknown>;
          const n = String(rec.name ?? rec.character ?? "").trim();
          if (n) names.add(n);
        }
      });
    }
  };

  let record: Record<string, unknown> | null = null;
  if (scene && typeof scene === "object" && !Array.isArray(scene)) {
    record = scene as Record<string, unknown>;
  } else if (typeof scene === "string") {
    const trimmed = scene.trim();
    if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          record = parsed as Record<string, unknown>;
        }
      } catch {
        // ignore
      }
    }
  }
  if (record) {
    collect(record.cast);
    collect(record.characters);
    collect(record.character_names);
    collect(record.cast_names);
    collect(record.participants);
  }
  return Array.from(names);
}

export function inferPacing(
  beat: BeatLike | null | undefined,
  chapterMeta?: {
    estimatedWordCount?: number;
    blueprintPosition?: "opening" | "midpoint" | "lowest" | "climax" | "ending" | "normal";
  }
): ScenePacing {
  const action = String(beat?.action ?? "").toLowerCase();
  const hook = String(beat?.tension_hook ?? "").toLowerCase();
  const impact = String(beat?.emotional_impact ?? "").toLowerCase();
  const blob = `${action} ${hook} ${impact}`;

  if (
    /chase|fight|run|flee|race|attack|explode|crash|sprint|gun|blade|escape|slam/.test(
      blob
    )
  ) {
    return "sprint";
  }
  if (
    /grief|aftermath|fallout|recover|mourn|numb|hollow|quiet after|process/.test(
      blob
    )
  ) {
    return "aftermath";
  }
  if (
    /talk|convers|confess|argue|negotiate|interview|whisper|tell|ask|admit/.test(
      blob
    )
  ) {
    return "talky";
  }

  const pos = chapterMeta?.blueprintPosition;
  if (pos === "climax" || pos === "midpoint") return "sprint";
  if (pos === "lowest" || pos === "ending") return "linger";
  if ((chapterMeta?.estimatedWordCount ?? 0) >= 1400) return "linger";

  return "linger";
}

export function parseNarrativeStyle(narrativeStyle?: string | null): {
  pov: string;
  tense: string;
} {
  const raw = String(narrativeStyle ?? "").toLowerCase();
  let pov = "first-person";
  let tense = "past";

  if (/third[\s-]?person\s+omniscient|omniscient/.test(raw)) {
    pov = "third-person omniscient";
  } else if (/third[\s-]?person/.test(raw)) {
    pov = "third-person limited";
  } else if (/second[\s-]?person/.test(raw)) {
    pov = "second-person";
  }

  if (/present/.test(raw)) tense = "present";
  if (/past/.test(raw)) tense = "past";

  return { pov, tense };
}

export function buildVoiceBlock(
  voiceSample: string | null | undefined,
  narrativeStyle: string | null | undefined,
  povName: string | null | undefined
): string {
  const { pov, tense } = parseNarrativeStyle(narrativeStyle);
  const lines = [
    `Narrative: ${pov}, ${tense} tense`,
    povName ? `POV character: ${povName}` : "",
  ].filter(Boolean);

  const sample = String(voiceSample ?? "").trim();
  if (sample) {
    lines.push(`VOICE SAMPLE (match this cadence, diction, and sentence length):\n"""\n${sample.slice(0, 900)}\n"""`);
  } else {
    lines.push(
      "VOICE SAMPLE: not provided — write clean, specific prose without purple lyricism or workshop padding."
    );
  }
  return lines.join("\n");
}

export function banPhrasesBlock(): string {
  return `Ban these phrases and patterns if they appear: ${BAN_PHRASES.join("; ")}. Also avoid naming emotions as labels ("I felt sad") — cause them.`;
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

function clip(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 3)}...`;
}

export type FilterSeriesOptions = {
  bookNumber?: number;
  chapterNumber?: number;
  totalChapters?: number;
  castNames?: string[];
  povCharacter?: string | null;
  maxLength?: number;
};

/**
 * Slim series pack for a single scene — not the full series dump.
 */
export function filterSeriesForScene(
  live: SeriesContext | Record<string, unknown> | null | undefined,
  options?: FilterSeriesOptions
): {
  block: string;
  characterBlock: string;
  hasCanon: boolean;
  hasMystery: boolean;
  hasPlots: boolean;
  hasTimeline: boolean;
} {
  if (!live) {
    return {
      block: "",
      characterBlock: "",
      hasCanon: false,
      hasMystery: false,
      hasPlots: false,
      hasTimeline: false,
    };
  }

  const ctx = live as SeriesContext;
  const bookNumber = Number(options?.bookNumber ?? ctx.book_number ?? 1);
  const chapterNumber = Number(options?.chapterNumber ?? 0);
  const totalChapters = Number(options?.totalChapters ?? 0);
  const castNames = (options?.castNames ?? [])
    .map((n) => n.toLowerCase().trim())
    .filter(Boolean);
  const povName = String(options?.povCharacter ?? "").trim();

  const characters = Array.isArray(ctx.characters) ? ctx.characters : [];
  let characterBlock = "";
  if (characters.length > 0) {
    const cast = characters as Parameters<typeof formatCharactersForPrompt>[0];
    if (povName) {
      const povBlock = formatPOVCharacterContext(cast, povName, {
        maxLength: 2200,
      });
      const others = cast.filter((c) => {
        const name = String(c.name ?? "").toLowerCase().trim();
        if (!name) return false;
        if (name === povName.toLowerCase() || name.includes(povName.toLowerCase())) {
          return false;
        }
        if (castNames.length === 0) return true;
        return castNames.some((n) => name.includes(n) || n.includes(name));
      });
      const otherBlock =
        others.length > 0
          ? formatCharactersForPrompt(others.slice(0, 4), {
              maxLength: 1600,
              headerLabel: "OTHER CHARACTERS IN THIS SCENE",
            })
          : "";
      characterBlock = [povBlock, otherBlock].filter(Boolean).join("\n\n");
    } else {
      characterBlock = formatCharactersForPrompt(cast.slice(0, 6), {
        maxLength: 2500,
      });
    }
  }

  const worldBlock = formatWorldForPrompt(ctx.world, ctx.world_elements, {
    maxLength: 1200,
  });

  const canonEntries = Array.isArray(ctx.canon_entries) ? ctx.canon_entries : [];
  const canonBlock = formatCanonForPrompt(canonEntries, { maxLength: 1000 });

  const secretsAll = Array.isArray(ctx.secrets) ? ctx.secrets : [];
  const activeSecrets = secretsAll.filter((s) => {
    const status = String(
      (s as Record<string, unknown>).status ?? "hidden"
    ).toLowerCase();
    const revealBook = Number(
      (s as Record<string, unknown>).revealed_in_book ?? 0
    );
    // Already revealed in a prior book → not an active mystery for this book
    if (status === "revealed" || (revealBook > 0 && revealBook < bookNumber)) {
      return false;
    }
    // Scheduled for a later book → keep as hidden for now (still constrain writing)
    return true;
  });
  const knownSecrets = secretsAll.filter((s) => {
    const status = String(
      (s as Record<string, unknown>).status ?? "hidden"
    ).toLowerCase();
    const revealBook = Number(
      (s as Record<string, unknown>).revealed_in_book ?? 0
    );
    return status === "revealed" || (revealBook > 0 && revealBook < bookNumber);
  });
  const clues = (Array.isArray(ctx.clues) ? ctx.clues : []).filter((c) => {
    const planted = Number((c as Record<string, unknown>).planted_in_book ?? 0);
    if (!planted) return true;
    if (planted > bookNumber) return false;
    if (planted < bookNumber) return true;
    const plantedCh = Number(
      (c as Record<string, unknown>).planted_in_chapter ?? 0
    );
    if (!chapterNumber || !plantedCh) return true;
    return plantedCh <= chapterNumber;
  });
  const mysteryBlock = formatMysteryForPrompt(activeSecrets, clues, {
    maxLength: 1200,
  });
  const knownBlock = knownSecrets.length
    ? `KNOWN TO READERS (already revealed — do not re-hide or contradict):\n${knownSecrets
        .slice(0, 8)
        .map((s) => {
          const title = asText((s as Record<string, unknown>).title) || "Secret";
          const desc = asText((s as Record<string, unknown>).description);
          return `- ${title}${desc ? `: ${clip(desc, 120)}` : ""}`;
        })
        .join("\n")}`
    : "";

  const threads = (Array.isArray(ctx.plot_threads) ? ctx.plot_threads : [])
    .filter((t) => {
      const resolved = (t as Record<string, unknown>).resolved_in_book;
      if (resolved != null && Number(resolved) < bookNumber) return false;
      return true;
    })
    .slice(0, 8)
    .map((t) => {
      const name = asText((t as Record<string, unknown>).name) || "Thread";
      const desc = asText((t as Record<string, unknown>).description);
      return `- ${name}${desc ? `: ${clip(desc, 120)}` : ""}`;
    })
    .filter(Boolean);

  const timeline = (Array.isArray(ctx.timeline) ? ctx.timeline : [])
    .filter((e) => {
      const bn = Number((e as Record<string, unknown>).book_number ?? 0);
      return !bn || bn <= bookNumber;
    })
    .slice(0, 10)
    .map((e) => {
      const title = asText((e as Record<string, unknown>).title) || "Event";
      const bn = (e as Record<string, unknown>).book_number;
      return `- [B${bn ?? "?"}] ${clip(title, 100)}`;
    });

  const nameHints = [
    ...castNames,
    ...(povName ? [povName.toLowerCase()] : []),
  ];
  const relationships = Array.isArray(ctx.relationships) ? ctx.relationships : [];
  const filteredRels =
    nameHints.length > 0
      ? relationships.filter((rel) => {
          const a = asText(rel.character_a_name).toLowerCase();
          const b = asText(rel.character_b_name).toLowerCase();
          return nameHints.some(
            (n) =>
              (a && (a.includes(n) || n.includes(a))) ||
              (b && (b.includes(n) || n.includes(b)))
          );
        })
      : relationships;
  const relationshipBlock = formatRelationshipsForPrompt(
    (filteredRels.length > 0 ? filteredRels : relationships).slice(0, 12),
    { maxLength: 600 }
  );

  const memory = Array.isArray(ctx.memory) ? ctx.memory : [];
  const memoryPriority = ["warning", "canon", "knowledge", "secret", "clue"];
  const sortedMemory = [...memory].sort((a, b) => {
    const ca = asText(a.category).toLowerCase();
    const cb = asText(b.category).toLowerCase();
    const ia = memoryPriority.indexOf(ca);
    const ib = memoryPriority.indexOf(cb);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  const memoryBlock = formatMemoryForPrompt(sortedMemory.slice(0, 12), {
    maxLength: 600,
  });

  const priorMemoryBlock = formatBookMemoryForPrompt(ctx.prior_book_memory, {
    maxLength: 500,
  });
  const characterStateBlock = formatCharacterStatesForPrompt(
    ctx.character_states,
    { maxLength: 500, castNames: nameHints }
  );
  const tensionBlock = formatTensionForPrompt(ctx.tension_profile, {
    maxLength: 220,
    chapterNumber,
    totalChapters,
  });

  const bible = (ctx as SeriesContext & { bible?: Record<string, unknown> })
    .bible;
  const bibleBits: string[] = [];
  if (bible) {
    const rules = bible.story_rules;
    const lock = bible.continuity_lockfile;
    const mysteries = bible.unanswered_mysteries;
    if (Array.isArray(rules) && rules.length) {
      bibleBits.push(
        `Story rules:\n${rules
          .slice(0, 8)
          .map((r) => `- ${clip(asText(r), 160)}`)
          .join("\n")}`
      );
    }
    if (Array.isArray(lock) && lock.length) {
      bibleBits.push(
        `Continuity lockfile:\n${lock
          .slice(0, 8)
          .map((r) => `- ${clip(asText(r), 160)}`)
          .join("\n")}`
      );
    }
    if (Array.isArray(mysteries) && mysteries.length) {
      bibleBits.push(
        `Unanswered mysteries:\n${mysteries
          .slice(0, 6)
          .map((r) => `- ${clip(asText(r), 160)}`)
          .join("\n")}`
      );
    }
  }

  const foreshadowing = (Array.isArray(ctx.foreshadowing) ? ctx.foreshadowing : [])
    .filter((f) => {
      const dueBook = Number(
        (f as Record<string, unknown>).payoff_book ??
          (f as Record<string, unknown>).due_book ??
          (f as Record<string, unknown>).book_number ??
          0
      );
      if (dueBook && dueBook > bookNumber) return false;
      return true;
    })
    .slice(0, 6)
    .map((f) => {
      const title =
        asText((f as Record<string, unknown>).title) ||
        asText((f as Record<string, unknown>).setup) ||
        "Foreshadow";
      const hint =
        asText((f as Record<string, unknown>).description) ||
        asText((f as Record<string, unknown>).hint);
      return `- ${title}${hint ? `: ${clip(hint, 120)}` : ""}`;
    });

  const callbacks = (Array.isArray(ctx.callbacks) ? ctx.callbacks : [])
    .slice(0, 6)
    .map((c) => {
      const title =
        asText((c as Record<string, unknown>).title) ||
        asText((c as Record<string, unknown>).reference) ||
        "Callback";
      const desc =
        asText((c as Record<string, unknown>).description) ||
        asText((c as Record<string, unknown>).payoff);
      return `- ${title}${desc ? `: ${clip(desc, 120)}` : ""}`;
    });

  const priorBooks = (Array.isArray(ctx.prior_books) ? ctx.prior_books : [])
    .slice(0, 4)
    .map((b) => {
      const title = asText((b as { title?: unknown }).title) || "Prior book";
      const synopsis = asText((b as { synopsis?: unknown }).synopsis);
      return `- ${title}${synopsis ? `: ${clip(synopsis, 160)}` : ""}`;
    });

  const blueprintText = asText(ctx.book_blueprint);
  const blueprintBlock =
    blueprintText && blueprintText !== "{}" && blueprintText !== "[]"
      ? `BOOK BLUEPRINT (honor structure):\n${clip(blueprintText, 800)}`
      : "";

  const evolutionText = asText(ctx.character_evolution);
  const evolutionBlock =
    evolutionText && evolutionText !== "{}" && evolutionText !== "[]"
      ? `CHARACTER EVOLUTION:\n${clip(evolutionText, 500)}`
      : "";

  // Critical constraints first; continuity enrichment after
  const sections = [
    worldBlock ? `WORLD (this scene):\n${worldBlock}` : "",
    canonBlock,
    mysteryBlock,
    knownBlock,
    priorMemoryBlock
      ? `PRIOR BOOK MEMORY (do not contradict):\n${priorMemoryBlock}`
      : "",
    characterStateBlock
      ? `CHARACTER STATES:\n${characterStateBlock}`
      : "",
    tensionBlock ? `TENSION:\n${tensionBlock}` : "",
    relationshipBlock
      ? `RELATIONSHIPS (honor dynamics):\n${relationshipBlock}`
      : "",
    memoryBlock ? `SERIES MEMORY:\n${memoryBlock}` : "",
    threads.length ? `OPEN PLOT THREADS:\n${threads.join("\n")}` : "",
    timeline.length ? `TIMELINE (so far):\n${timeline.join("\n")}` : "",
    bibleBits.length ? `SERIES BIBLE LAW:\n${bibleBits.join("\n\n")}` : "",
    foreshadowing.length
      ? `FORESHADOWING (plant or honor):\n${foreshadowing.join("\n")}`
      : "",
    callbacks.length
      ? `CALLBACKS (pay off when natural):\n${callbacks.join("\n")}`
      : "",
    priorBooks.length
      ? `PRIOR BOOKS (do not contradict):\n${priorBooks.join("\n")}`
      : "",
    blueprintBlock,
    evolutionBlock,
  ].filter(Boolean);

  let block = sections.join("\n\n");
  const maxLength = options?.maxLength ?? 5500;
  if (block.length > maxLength) {
    block = `${block.slice(0, maxLength - 3)}...`;
  }

  return {
    block,
    characterBlock,
    hasCanon: canonEntries.length > 0,
    hasMystery: activeSecrets.length > 0 || clues.length > 0 || knownSecrets.length > 0,
    hasPlots: threads.length > 0,
    hasTimeline: timeline.length > 0,
  };
}

export type SceneCardInput = {
  chapterTitle: string;
  sceneNumber: number | string;
  sceneCount?: number;
  summary: string;
  beat?: BeatLike | null;
  chapterSummary?: string;
  chapterGoal?: string;
  emotionalState?: string;
  keyConflict?: string;
  pacing: ScenePacing;
  maxSceneLength: number;
  narrativeStyle?: string | null;
  voiceSample?: string | null;
  povCharacter?: string | null;
  previousEnding?: string;
  sensory?: string[] | string | null;
  keyDialogue?: string[] | string | null;
  chosenEnding?: string | null;
  isLateBook?: boolean;
  characterBlock?: string;
  seriesBlock?: string;
  hasCanon?: boolean;
  hasMystery?: boolean;
  hasPlots?: boolean;
  hasTimeline?: boolean;
};

export function buildProseSystemPrompt(
  narrativeStyle?: string | null,
  povName?: string | null
): string {
  const { pov, tense } = parseNarrativeStyle(narrativeStyle);
  const who = povName ? ` Stay in ${povName}'s head.` : "";
  return `You are a novelist, not a writing coach. Write the scene in ${pov} ${tense} tense.${who} No headers, no analysis, no beat labels, no scene numbers. Return only the prose.`;
}

export function buildSceneCardPrompt(input: SceneCardInput): string {
  const beat = input.beat;
  const goal =
    input.chapterGoal ||
    beat?.action ||
    "Advance the chapter's conflict through this scene.";
  const conflict =
    input.keyConflict ||
    beat?.tension_hook ||
    input.emotionalState ||
    "Rising pressure on the POV character.";
  const turn =
    beat?.tension_hook ||
    beat?.emotional_impact ||
    "Something concrete must be different by the last paragraph.";
  const mustHappen = beat?.action || input.summary.slice(0, 400);
  const wordTarget = input.maxSceneLength;
  const hardCap = Math.ceil(wordTarget * 1.15);

  const sensory = Array.isArray(input.sensory)
    ? input.sensory.slice(0, 3).join("; ")
    : String(input.sensory ?? "").slice(0, 400);
  const keyDialogue = Array.isArray(input.keyDialogue)
    ? input.keyDialogue.slice(0, 2).join(" | ")
    : String(input.keyDialogue ?? "").slice(0, 300);

  const endingGuard =
    input.chosenEnding && !input.isLateBook
      ? `Do NOT land or spoil this ending yet: ${clip(String(input.chosenEnding), 280)}`
      : input.chosenEnding && input.isLateBook
        ? `You may build toward this ending: ${clip(String(input.chosenEnding), 280)}`
        : "";

  const continuity = input.previousEnding?.trim()
    ? `The previous passage ended here. Do not repeat it. Continue as if the reader just finished it:\n"""\n${clip(input.previousEnding.trim(), 1400)}\n"""`
    : "No previous passage — open cleanly.";

  const constraintLines = [
    input.hasCanon
      ? "Respect locked canon facts. Do not contradict them."
      : "",
    input.hasMystery
      ? "Honor mystery reveal discipline: HIDDEN secrets stay hidden; subtle clues only if planted; PARTIAL may deepen a hint; REVEALED may be discussed."
      : "",
    input.hasPlots
      ? "Advance open plot threads when they fit; do not drop them without cause."
      : "",
    input.hasTimeline
      ? "Respect timeline order — do not jump ahead of events that have not happened."
      : "",
    endingGuard,
  ].filter(Boolean);

  return `${buildVoiceBlock(input.voiceSample, input.narrativeStyle, input.povCharacter)}

THIS SCENE
- Chapter: ${input.chapterTitle}
- Scene: ${input.sceneNumber}${input.sceneCount ? ` of ${input.sceneCount}` : ""}
- Goal: ${goal}
- Conflict: ${conflict}
- Turn (what is different at the end): ${turn}
- Landing line job: leave a hook, breath, reveal, or decision
- Pacing: ${input.pacing}
- Must happen: ${mustHappen}
- Must not happen: inventing future timeline events; summarizing instead of enacting; ${input.hasMystery ? "revealing HIDDEN secrets; " : ""}generic workshop filler
- Word target: ${wordTarget} (hard cap ${hardCap})
${input.chapterSummary ? `- Chapter summary: ${clip(input.chapterSummary, 500)}` : ""}
${sensory ? `- Sensory cues (use, do not list): ${sensory}` : ""}
${keyDialogue ? `- Dialogue flavor (do not copy verbatim unless natural): ${keyDialogue}` : ""}

CONTINUITY
${continuity}

${input.characterBlock ? `${input.characterBlock}\n` : ""}${input.seriesBlock ? `${input.seriesBlock}\n` : ""}
SCENE SUMMARY
${input.summary}

CRAFT RULES
- One concrete location. Name it when possible.
- Dialogue must be distinguishable if you strip the tags. No "As you know, Name…" dialogue.
- Interiority is specific thought, not mood labels.
- ${banPhrasesBlock()}
- Do not summarize the beat. Enact it.
- End on the turn, not a recap.
${constraintLines.length ? `\nCONSTRAINTS\n${constraintLines.map((l) => `- ${l}`).join("\n")}` : ""}

Write only the prose for this scene.`;
}

export function buildRevisePrompt(input: {
  draft: string;
  voiceSample?: string | null;
  narrativeStyle?: string | null;
  povCharacter?: string | null;
  summary: string;
  beat?: BeatLike | null;
  pacing: ScenePacing;
  maxSceneLength: number;
  previousEnding?: string;
  hasMystery?: boolean;
  hasCanon?: boolean;
  hasPlots?: boolean;
  hasTimeline?: boolean;
  seriesBlock?: string;
}): string {
  const turn =
    input.beat?.tension_hook ||
    input.beat?.emotional_impact ||
    "Ensure a concrete change by the end.";
  const wordTarget = input.maxSceneLength;
  const continuityBits = [
    input.hasCanon ? "Respect locked canon; do not contradict it." : "",
    input.hasMystery
      ? "Mystery: do not reveal HIDDEN secrets."
      : "Keep established facts consistent.",
    input.hasPlots
      ? "Honor open plot threads; do not drop them without cause."
      : "",
    input.hasTimeline
      ? "Respect timeline order — do not jump ahead of unhappened events."
      : "",
  ].filter(Boolean);

  return `${buildVoiceBlock(input.voiceSample, input.narrativeStyle, input.povCharacter)}

SCENE GOAL / TURN: ${turn}
PACING: ${input.pacing}
SCENE SUMMARY (plot facts to keep): ${clip(input.summary, 600)}
${input.previousEnding ? `PREVIOUS ENDING (do not repeat):\n"""\n${clip(input.previousEnding, 800)}\n"""\n` : ""}
${input.seriesBlock ? `SERIES CONSTRAINTS:\n${clip(input.seriesBlock, 2200)}\n` : ""}
DRAFT:
"""
${input.draft}
"""

Rewrite in the same POV/tense. Checklist:
1. Cut any sentence that names an emotion instead of causing it.
2. Make each speaker sound distinct; if two lines could swap speakers, rewrite them.
3. Replace generic setting with a named location and one physical interaction with it.
4. Kill banned phrases if they appear (${BAN_PHRASES.slice(0, 6).join("; ")}…).
5. Ensure the turn happens; if the draft only mood-wanders, force the beat's action: ${clip(String(input.beat?.action ?? input.summary), 240)}
6. Continuity: do not contradict or repeat the previous ending.
7. ${continuityBits.join(" ")}
8. Length: stay within about 35% of ${wordTarget} words (not a sparse stub, not a runaway dump).

Return only the rewritten scene.`;
}

export function validateProseDraft(
  text: string,
  summary?: string,
  options?: { maxSceneLength?: number }
): { ok: boolean; reason?: string } {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return { ok: false, reason: "empty" };
  if (trimmed.length < 200) return { ok: false, reason: "too_short" };
  if (/moved through the moment with a heavy heart/i.test(trimmed)) {
    return { ok: false, reason: "stub_pattern" };
  }
  const lower = trimmed.toLowerCase();
  for (const phrase of BAN_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) {
      return { ok: false, reason: `banned_phrase:${phrase}` };
    }
  }
  if (
    summary &&
    trimmed.replace(/\s+/g, " ").toLowerCase() ===
      summary.replace(/\s+/g, " ").toLowerCase()
  ) {
    return { ok: false, reason: "equals_summary" };
  }
  // Reject obvious JSON dumps
  if (
    (trimmed.startsWith("{") || trimmed.startsWith("[")) &&
    /"summary"\s*:/.test(trimmed)
  ) {
    return { ok: false, reason: "json_dump" };
  }

  const target = Number(options?.maxSceneLength) || 0;
  if (target > 0) {
    const words = trimmed.split(/\s+/).filter(Boolean).length;
    const low = Math.floor(target * 0.65);
    const high = Math.ceil(target * 1.35);
    if (words < low) return { ok: false, reason: "too_short_words" };
    if (words > high) return { ok: false, reason: "too_long_words" };
  }

  return { ok: true };
}

export function proseMaxTokens(maxSceneLength: number): number {
  return Math.max(1500, Math.ceil((maxSceneLength || 1000) * 1.6));
}
