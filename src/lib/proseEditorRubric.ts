import { BAN_PHRASES } from "@/lib/prosePrompt";
import {
  detectEchoBanHits,
  jaccard,
  significantTokens,
} from "@/lib/sceneContract";

export type RubricScores = {
  turnPresent: boolean;
  thesisEcho: boolean;
  banHits: string[];
  echoBanHits: string[];
  dialogueRatio: number;
  warnings: string[];
};

function dialogueRatio(text: string): number {
  const lines = text.split(/\n+/).filter((l) => l.trim());
  if (!lines.length) return 0;
  const quoted = lines.filter((l) => /["“]/.test(l)).length;
  return quoted / lines.length;
}

export function scoreProseDraft(
  text: string,
  options?: {
    turn?: string | null;
    thesis?: string | null;
    echoBans?: string[];
    talkyBeat?: boolean;
  }
): RubricScores {
  const trimmed = String(text ?? "").trim();
  const turn = String(options?.turn ?? "").trim();
  const thesis = String(options?.thesis ?? "").trim();
  const echoBans = options?.echoBans ?? [];

  const turnTokens = significantTokens(turn);
  const draftLower = trimmed.toLowerCase();
  const turnPresent =
    !turn ||
    turnTokens.slice(0, 6).filter((t) => draftLower.includes(t)).length >=
      Math.min(2, turnTokens.length) ||
    (turn.length > 12 && draftLower.includes(turn.toLowerCase().slice(0, 24)));

  const thesisEcho =
    Boolean(thesis) && jaccard(thesis, trimmed.slice(0, 800)) >= 0.35;

  const banHits = BAN_PHRASES.filter((p) =>
    draftLower.includes(p.toLowerCase())
  );
  const echoBanHits = detectEchoBanHits(trimmed, echoBans);
  const ratio = dialogueRatio(trimmed);

  const warnings: string[] = [];
  if (turn && !turnPresent) warnings.push("turn_weak");
  if (thesisEcho) warnings.push("thesis_echo");
  if (banHits.length) warnings.push(`banned_phrase:${banHits[0]}`);
  if (echoBanHits.length) {
    warnings.push(`echo_ban:${echoBanHits.slice(0, 3).join("|")}`);
  }
  if (options?.talkyBeat && ratio < 0.08) warnings.push("dialogue_thin");

  return {
    turnPresent,
    thesisEcho,
    banHits,
    echoBanHits,
    dialogueRatio: ratio,
    warnings,
  };
}
