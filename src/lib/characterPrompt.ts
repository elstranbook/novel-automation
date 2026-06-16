/**
 * Utility for formatting series_characters data into prompt-friendly text
 * for use across the generation pipeline (prose, scenes, beats, etc.)
 */

interface CharacterRow {
  id?: string;
  name?: string | null;
  role?: string | null;
  age?: string | number | null;
  gender?: string | null;
  description?: string | null;
  backstory?: string | null;
  core_desire?: string | null;
  big_fear?: string | null;
  hidden_secret?: string | null;
  motivation?: string | null;
  conflict?: string | null;
  personality?: unknown;
  voice_profile?: unknown;
  appearance?: unknown;
  start_state?: string | null;
  end_state?: string | null;
  growth_arc?: unknown;
  arc_stages?: unknown[];
  emotional_memory?: unknown;
  relationships?: unknown;
  introduced_in_book?: number | null;
  [key: string]: unknown;
}

interface ParsedPersonality {
  traits?: string[];
  flaws?: string[];
  strengths?: string[];
  [key: string]: unknown;
}

interface ParsedVoiceProfile {
  speechStyle?: string;
  vocabularyLevel?: string;
  emotionalExpression?: string | { description?: string };
  dialogueStyle?: string;
  [key: string]: unknown;
}

/**
 * Safely parse a JSON field that might be stored as a string or object.
 */
function parseJsonField<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') {
    try { return JSON.parse(value) as T; } catch { return fallback; }
  }
  return value as T;
}

/**
 * Format a single character into a concise but information-rich text block.
 * Prioritizes the fields most useful for writing: voice, psychology, personality.
 */
function formatSingleCharacter(char: CharacterRow, maxLength?: number): string {
  const lines: string[] = [];
  const name = char.name || 'Unnamed';
  const role = char.role || 'Supporting';

  // Header line
  const header = `${name} (${role})`;
  const meta: string[] = [];
  if (char.age) meta.push(`Age ${char.age}`);
  if (char.gender) meta.push(char.gender);
  if (char.introduced_in_book) meta.push(`Book ${char.introduced_in_book}`);
  lines.push(meta.length > 0 ? `${header} — ${meta.join(', ')}` : header);

  // Description (brief)
  if (char.description) {
    lines.push(`  Description: ${String(char.description).slice(0, 200)}`);
  }

  // Core psychology — most important for writing
  if (char.core_desire) lines.push(`  Core Desire: ${char.core_desire}`);
  else if (char.motivation) lines.push(`  Motivation: ${char.motivation}`);
  if (char.big_fear) lines.push(`  Biggest Fear: ${char.big_fear}`);
  else if (char.conflict) lines.push(`  Conflict: ${char.conflict}`);
  if (char.hidden_secret) lines.push(`  Hidden Secret: ${char.hidden_secret}`);

  // Personality
  const personality = parseJsonField<ParsedPersonality>(char.personality, {});
  const traitParts: string[] = [];
  if (personality.traits?.length) traitParts.push(`Traits: ${personality.traits.join(', ')}`);
  if (personality.flaws?.length) traitParts.push(`Flaws: ${personality.flaws.join(', ')}`);
  if (personality.strengths?.length) traitParts.push(`Strengths: ${personality.strengths.join(', ')}`);
  if (traitParts.length) lines.push(`  Personality: ${traitParts.join(' | ')}`);

  // Voice profile — critical for prose
  const voice = parseJsonField<ParsedVoiceProfile>(char.voice_profile, {});
  const voiceParts: string[] = [];
  if (voice.speechStyle) voiceParts.push(`Speech: ${voice.speechStyle}`);
  if (voice.vocabularyLevel) voiceParts.push(`Vocab: ${voice.vocabularyLevel}`);
  if (voice.dialogueStyle) voiceParts.push(`Dialogue: ${voice.dialogueStyle}`);
  if (typeof voice.emotionalExpression === 'string') voiceParts.push(`Emotion: ${voice.emotionalExpression}`);
  else if (typeof voice.emotionalExpression === 'object' && voice.emotionalExpression?.description) {
    voiceParts.push(`Emotion: ${voice.emotionalExpression.description}`);
  }
  if (voiceParts.length) lines.push(`  Voice: ${voiceParts.join(' | ')}`);

  // Character arc (compact)
  if (char.start_state || char.end_state) {
    const arcParts: string[] = [];
    if (char.start_state) arcParts.push(`Start: ${char.start_state}`);
    if (char.end_state) arcParts.push(`End: ${char.end_state}`);
    lines.push(`  Arc: ${arcParts.join(' → ')}`);
  }

  const result = lines.join('\n');
  if (maxLength && result.length > maxLength) {
    return result.slice(0, maxLength) + '...';
  }
  return result;
}

/**
 * Format an array of series_characters into a prompt-ready text block.
 * 
 * @param characters - Array of character rows from series_characters table
 * @param options - Formatting options
 * @returns Formatted text block for inclusion in AI prompts
 */
export function formatCharactersForPrompt(
  characters: CharacterRow[],
  options?: {
    /** Maximum total length of the output text (default: no limit) */
    maxLength?: number;
    /** Include backstory in output (default: false — usually too long) */
    includeBackstory?: boolean;
    /** Label for the section header (default: "CHARACTER PROFILES") */
    headerLabel?: string;
  }
): string {
  if (!characters || characters.length === 0) return '';

  const {
    maxLength,
    includeBackstory = false,
    headerLabel = 'CHARACTER PROFILES',
  } = options ?? {};

  // Sort: protagonists first, then antagonists, then supporting, then others
  const roleOrder: Record<string, number> = {
    protagonist: 0, hero: 0, main: 0,
    antagonist: 1, villain: 1,
    supporting: 2, secondary: 2, side: 2,
    mentor: 3, guide: 3,
    love_interest: 4, romantic: 4,
    minor: 5, extra: 5, background: 5,
  };

  const getSortKey = (role: string): number => {
    const r = (role || '').toLowerCase().trim();
    for (const [key, order] of Object.entries(roleOrder)) {
      if (r.includes(key)) return order;
    }
    return 6;
  };

  const sorted = [...characters].sort((a, b) =>
    getSortKey(a.role || '') - getSortKey(b.role || '')
  );

  // Budget per character based on total count
  const perCharBudget = maxLength
    ? Math.floor(maxLength / sorted.length)
    : undefined;

  const entries: string[] = [];
  for (const char of sorted) {
    let entry = formatSingleCharacter(char, perCharBudget);

    // Optionally include backstory
    if (includeBackstory && char.backstory) {
      const backstoryLine = `\n  Backstory: ${String(char.backstory).slice(0, 300)}`;
      entry += backstoryLine;
    }

    entries.push(entry);
  }

  const result = `${headerLabel}:\n${entries.join('\n\n')}`;

  if (maxLength && result.length > maxLength) {
    return result.slice(0, maxLength) + '...';
  }
  return result;
}

/**
 * Format character context specifically for a POV character in prose generation.
 * Returns a focused block with just the POV character's voice, psychology, and
 * relevant relationship info.
 */
export function formatPOVCharacterContext(
  characters: CharacterRow[],
  povCharacterName: string,
  options?: {
    /** Maximum length (default: 1200) */
    maxLength?: number;
  }
): string {
  if (!characters || !povCharacterName) return '';

  const { maxLength = 1200 } = options ?? {};
  const nameLower = povCharacterName.toLowerCase().trim();

  // Find the POV character
  const povChar = characters.find(c =>
    (c.name || '').toLowerCase().trim() === nameLower ||
    (c.name || '').toLowerCase().trim().includes(nameLower)
  );

  if (!povChar) return '';

  const lines: string[] = [];
  lines.push(`POV CHARACTER: ${povChar.name || 'Unknown'}`);

  // Voice is the most critical for prose
  const voice = parseJsonField<ParsedVoiceProfile>(povChar.voice_profile, {});
  if (voice.speechStyle || voice.dialogueStyle || voice.vocabularyLevel) {
    lines.push('Voice & Dialogue Style:');
    if (voice.speechStyle) lines.push(`  Speech: ${voice.speechStyle}`);
    if (voice.dialogueStyle) lines.push(`  Dialogue: ${voice.dialogueStyle}`);
    if (voice.vocabularyLevel) lines.push(`  Vocabulary: ${voice.vocabularyLevel}`);
    if (typeof voice.emotionalExpression === 'string') lines.push(`  Emotional Expression: ${voice.emotionalExpression}`);
    else if (typeof voice.emotionalExpression === 'object' && voice.emotionalExpression?.description) {
      lines.push(`  Emotional Expression: ${voice.emotionalExpression.description}`);
    }
  }

  // Psychology
  if (povChar.core_desire) lines.push(`Core Desire: ${povChar.core_desire}`);
  if (povChar.big_fear) lines.push(`Biggest Fear: ${povChar.big_fear}`);
  if (povChar.hidden_secret) lines.push(`Hidden Secret: ${povChar.hidden_secret}`);

  // Personality
  const personality = parseJsonField<ParsedPersonality>(povChar.personality, {});
  const pParts: string[] = [];
  if (personality.traits?.length) pParts.push(personality.traits.join(', '));
  if (personality.flaws?.length) pParts.push(`Flaws: ${personality.flaws.join(', ')}`);
  if (personality.strengths?.length) pParts.push(`Strengths: ${personality.strengths.join(', ')}`);
  if (pParts.length) lines.push(`Personality: ${pParts.join(' | ')}`);

  // Current arc state
  if (povChar.start_state) lines.push(`Arc Start State: ${povChar.start_state}`);
  if (povChar.end_state) lines.push(`Arc End State: ${povChar.end_state}`);

  // Key relationships (compact)
  const relationships = parseJsonField<Array<{ name?: string; type?: string; status?: string }>>(
    povChar.relationships, []
  );
  if (Array.isArray(relationships) && relationships.length > 0) {
    const relParts = relationships.slice(0, 5).map(r =>
      `${r.name || '?'} (${r.type || 'unknown'}${r.status ? `, ${r.status}` : ''})`
    );
    lines.push(`Key Relationships: ${relParts.join('; ')}`);
  }

  let result = lines.join('\n');
  if (result.length > maxLength) {
    result = result.slice(0, maxLength) + '...';
  }
  return result;
}
