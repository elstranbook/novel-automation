import { parseScenePayload } from "@/lib/prosePrompt";
import {
  validateChapterScenes,
  type SceneWithContract,
} from "@/lib/sceneContract";

export const CLOSED_ENDING_MIN_CHARS = 40;

export function hasClosedEnding(
  premises: { chosen_ending?: unknown } | null | undefined
): boolean {
  const ending = String(premises?.chosen_ending ?? "").trim();
  return ending.length >= CLOSED_ENDING_MIN_CHARS;
}

export function parseChapterScenes(scenes: string[]): SceneWithContract[] {
  return scenes.map((scene, index) => {
    const parsed = parseScenePayload(scene);
    return {
      scene_number: parsed.sceneNumber ?? index + 1,
      summary: parsed.summary,
      beat_reference: parsed.beatReference ?? undefined,
      goal: parsed.goal ?? undefined,
      obstacle: parsed.obstacle ?? undefined,
      turn: parsed.turn ?? undefined,
      cost: parsed.cost ?? undefined,
      hook: parsed.hook ?? undefined,
    };
  });
}

export function assertChapterContracts(scenes: SceneWithContract[]): {
  ok: boolean;
  reason?: string;
  message: string;
} {
  const result = validateChapterScenes(scenes);
  if (result.ok) {
    return { ok: true, message: "" };
  }
  const reason = result.reason ?? "invalid_contracts";
  return {
    ok: false,
    reason,
    message: reason.replace(/_/g, " "),
  };
}

export function clearSpineApprovalsForChapter(
  approvals: Record<string, boolean> | null | undefined,
  chapterIndex: number
): Record<string, boolean> {
  const next: Record<string, boolean> = {};
  const prefix = `${chapterIndex}:`;
  for (const [key, value] of Object.entries(approvals ?? {})) {
    if (key.startsWith(prefix)) continue;
    next[key] = value;
  }
  return next;
}

export function clearAllSpineApprovals(): Record<string, boolean> {
  return {};
}

export function proseBlockedReason(input: {
  hasClosedEnding: boolean;
  chapterOneGate: { ok: boolean; message: string };
  pendingSpineLabels: string[];
}): string | null {
  if (!input.hasClosedEnding) {
    return "Lock a chosen ending (Premises & Endings) before generating scenes or prose. It must be a closed outcome, not a placeholder.";
  }
  if (!input.chapterOneGate.ok) {
    return `Chapter 1 scenes invalid: ${input.chapterOneGate.message}. Regenerate Chapter 1 scenes until each has a distinct turn.`;
  }
  if (input.pendingSpineLabels.length) {
    return `Approve spine scenes first:\n${input.pendingSpineLabels.map((l) => `- ${l}`).join("\n")}`;
  }
  return null;
}
