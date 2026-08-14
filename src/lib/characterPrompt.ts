/**
 * Utility for formatting series_characters data into prompt-friendly text
 * for use across the generation pipeline (prose, scenes, beats, etc.)
 *
 * Design principle: ANY field the user can edit in the Characters tab should
 * be reachable from the pipeline. Nothing stored should be silently dropped.
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
  knowledge_timeline?: unknown;
  relationships?: unknown;
  public_mask?: string | null;
  private_want?: string | null;
  contradiction?: string | null;
  speech_tells?: string | null;
  introduced_in_book?: number | null;
  introduced_in_chapter?: number | null;
  is_fully_developed?: boolean | null;
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

interface ParsedAppearance {
  physical?: string;
  features?: string;
  style?: string;
  distinguishing?: string;
  height?: string;
  build?: string;
  hair?: string;
  eyes?: string;
  skin?: string;
  clothing?: string;
  [key: string]: unknown;
}

interface ParsedGrowthArc {
  description?: string;
  summary?: string;
  theme?: string;
  catalyst?: string;
  turningPoint?: string;
  resolution?: string;
  [key: string]: unknown;
}

interface ParsedArcStage {
  title?: string;
  name?: string;
  description?: string;
  stage?: string;
  state?: string;
  event?: string;
  [key: string]: unknown;
}

interface ParsedEmotionalMemory {
  event?: string;
  description?: string;
  emotion?: string;
  impact?: string;
  age?: string | number;
  [key: string]: unknown;
}

interface ParsedKnowledgeTimelineEntry {
  chapter?: string | number;
  book?: string | number;
  knows?: string;
  learns?: string;
  event?: string;
  [key: string]: unknown;
}

interface ParsedRelationshipEntry {
  name?: string;
  type?: string;
  status?: string;
  trust?: number;
  tension?: number;
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
 * Convert an arbitrary object/array to a compact "key: value" string,
 * skipping nulls/empty values. Used for fields without a known shape.
 */
function objectToCompactText(value: unknown, maxLen = 200): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed.slice(0, maxLen) : null;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    const items = value
      .map(item => (typeof item === 'string' ? item : objectToCompactText(item, maxLen)))
      .filter(Boolean)
      .slice(0, 8);
    return items.length > 0 ? items.join('; ') : null;
  }
  if (typeof value === 'object') {
    const parts: string[] = [];
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === null || v === undefined || v === '') continue;
      const vText = typeof v === 'string' ? v : (typeof v === 'object' ? objectToCompactText(v, 80) : String(v));
      if (vText) parts.push(`${k}: ${vText}`);
    }
    return parts.length > 0 ? parts.join('; ').slice(0, maxLen) : null;
  }
  return null;
}

/**
 * Format a single character into a concise but information-rich text block.
 * Includes every field the Characters tab can store, prioritized for writing.
 */
function formatSingleCharacter(char: CharacterRow, maxLength?: number): string {
  const lines: string[] = [];
  const name = char.name || 'Unnamed';
  const role = char.role || 'Supporting';

  // Header line with metadata
  const header = `${name} (${role})`;
  const meta: string[] = [];
  if (char.age) meta.push(`Age ${char.age}`);
  if (char.gender) meta.push(char.gender);
  if (char.introduced_in_book) meta.push(`Book ${char.introduced_in_book}`);
  if (char.introduced_in_chapter) meta.push(`Ch ${char.introduced_in_chapter}`);
  lines.push(meta.length > 0 ? `${header} — ${meta.join(', ')}` : header);

  // Description (brief)
  if (char.description) {
    lines.push(`  Description: ${String(char.description).slice(0, 200)}`);
  }

  // Appearance — physical features & style (essential for prose description)
  const appearance = parseJsonField<ParsedAppearance>(char.appearance, {});
  const appearanceParts: string[] = [];
  if (appearance.physical) appearanceParts.push(String(appearance.physical));
  if (appearance.features) appearanceParts.push(String(appearance.features));
  if (appearance.distinguishing) appearanceParts.push(String(appearance.distinguishing));
  if (appearance.height) appearanceParts.push(`Height: ${appearance.height}`);
  if (appearance.build) appearanceParts.push(`Build: ${appearance.build}`);
  if (appearance.hair) appearanceParts.push(`Hair: ${appearance.hair}`);
  if (appearance.eyes) appearanceParts.push(`Eyes: ${appearance.eyes}`);
  if (appearance.skin) appearanceParts.push(`Skin: ${appearance.skin}`);
  if (appearance.style) appearanceParts.push(`Style: ${appearance.style}`);
  if (appearance.clothing) appearanceParts.push(`Clothing: ${appearance.clothing}`);
  // Catch-all for unknown appearance keys
  const knownAppearanceKeys = new Set(['physical', 'features', 'distinguishing', 'height', 'build', 'hair', 'eyes', 'skin', 'style', 'clothing']);
  for (const [k, v] of Object.entries(appearance)) {
    if (knownAppearanceKeys.has(k) || v === null || v === undefined || v === '') continue;
    const vText = objectToCompactText(v, 80);
    if (vText) appearanceParts.push(`${k}: ${vText}`);
  }
  if (appearanceParts.length) lines.push(`  Appearance: ${appearanceParts.join(' | ').slice(0, 250)}`);

  // Core psychology — motivation, desire, fear, secret, conflict (ALL shown together, not as fallbacks)
  const psycheParts: string[] = [];
  if (char.core_desire) psycheParts.push(`Desire: ${char.core_desire}`);
  if (char.motivation) psycheParts.push(`Motivation: ${char.motivation}`);
  if (char.big_fear) psycheParts.push(`Fear: ${char.big_fear}`);
  if (char.conflict) psycheParts.push(`Conflict: ${char.conflict}`);
  if (char.hidden_secret) psycheParts.push(`Secret: ${char.hidden_secret}`);
  if (char.public_mask) psycheParts.push(`Mask: ${char.public_mask}`);
  if (char.private_want) psycheParts.push(`Private want: ${char.private_want}`);
  if (char.contradiction) psycheParts.push(`Contradiction: ${char.contradiction}`);
  if (psycheParts.length) lines.push(`  Psychology: ${psycheParts.join(' | ')}`);

  // Personality
  const personality = parseJsonField<ParsedPersonality>(char.personality, {});
  const traitParts: string[] = [];
  if (personality.traits?.length) traitParts.push(`Traits: ${personality.traits.join(', ')}`);
  if (personality.flaws?.length) traitParts.push(`Flaws: ${personality.flaws.join(', ')}`);
  if (personality.strengths?.length) traitParts.push(`Strengths: ${personality.strengths.join(', ')}`);
  // Catch-all for unknown personality keys
  const knownPersonalityKeys = new Set(['traits', 'flaws', 'strengths']);
  for (const [k, v] of Object.entries(personality)) {
    if (knownPersonalityKeys.has(k) || v === null || v === undefined) continue;
    const vText = objectToCompactText(v, 80);
    if (vText) traitParts.push(`${k}: ${vText}`);
  }
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
  // Catch-all for unknown voice keys
  const knownVoiceKeys = new Set(['speechStyle', 'vocabularyLevel', 'dialogueStyle', 'emotionalExpression']);
  for (const [k, v] of Object.entries(voice)) {
    if (knownVoiceKeys.has(k) || v === null || v === undefined) continue;
    const vText = objectToCompactText(v, 80);
    if (vText) voiceParts.push(`${k}: ${vText}`);
  }
  if (voiceParts.length) lines.push(`  Voice: ${voiceParts.join(' | ')}`);
  if (char.speech_tells) lines.push(`  Speech tells: ${char.speech_tells}`);

  // Character arc (compact) — start/end states PLUS growth_arc description
  const arcParts: string[] = [];
  if (char.start_state) arcParts.push(`Start: ${char.start_state}`);
  if (char.end_state) arcParts.push(`End: ${char.end_state}`);
  if (arcParts.length) lines.push(`  Arc: ${arcParts.join(' → ')}`);

  // Growth arc — high-level description / theme
  const growthArc = parseJsonField<ParsedGrowthArc>(char.growth_arc, {});
  const growthParts: string[] = [];
  if (growthArc.description) growthParts.push(String(growthArc.description));
  else if (growthArc.summary) growthParts.push(String(growthArc.summary));
  if (growthArc.theme) growthParts.push(`Theme: ${growthArc.theme}`);
  if (growthArc.catalyst) growthParts.push(`Catalyst: ${growthArc.catalyst}`);
  if (growthArc.turningPoint) growthParts.push(`Turning Point: ${growthArc.turningPoint}`);
  if (growthArc.resolution) growthParts.push(`Resolution: ${growthArc.resolution}`);
  // Fallback: if growth_arc is a string or unrecognized object, dump compact
  if (growthParts.length === 0 && char.growth_arc != null) {
    const fallback = objectToCompactText(char.growth_arc, 200);
    if (fallback) growthParts.push(fallback);
  }
  if (growthParts.length) lines.push(`  Growth Arc: ${growthParts.join(' | ').slice(0, 300)}`);

  // Arc stages — discrete milestones
  if (Array.isArray(char.arc_stages) && char.arc_stages.length > 0) {
    const stages = char.arc_stages
      .map((s, i) => {
        const stage = parseJsonField<ParsedArcStage>(s, {});
        const label = stage.title || stage.name || stage.stage || `Stage ${i + 1}`;
        const desc = stage.description || stage.state || stage.event;
        return desc ? `${label}: ${String(desc).slice(0, 80)}` : String(label).slice(0, 80);
      })
      .slice(0, 5);
    if (stages.length) lines.push(`  Arc Stages: ${stages.join(' → ')}`);
  }

  // Emotional memory — past touchstones that shape reactions
  const emotionalMemory = parseJsonField<ParsedEmotionalMemory | ParsedEmotionalMemory[]>(
    char.emotional_memory, Array.isArray(char.emotional_memory) ? [] : {}
  );
  const memParts: string[] = [];
  if (Array.isArray(emotionalMemory)) {
    for (const m of emotionalMemory.slice(0, 4)) {
      const parts: string[] = [];
      if (m.event) parts.push(m.event);
      else if (m.description) parts.push(m.description);
      if (m.emotion) parts.push(`[${m.emotion}]`);
      if (m.age !== undefined && m.age !== null) parts.push(`(age ${m.age})`);
      if (parts.length) memParts.push(parts.join(' '));
    }
  } else if (emotionalMemory && typeof emotionalMemory === 'object') {
    const m = emotionalMemory as ParsedEmotionalMemory;
    if (m.event || m.description) {
      const parts: string[] = [];
      if (m.event) parts.push(m.event);
      else if (m.description) parts.push(m.description);
      if (m.emotion) parts.push(`[${m.emotion}]`);
      if (m.age !== undefined && m.age !== null) parts.push(`(age ${m.age})`);
      if (parts.length) memParts.push(parts.join(' '));
    }
  }
  // Fallback for non-array/object emotional_memory
  if (memParts.length === 0 && char.emotional_memory != null && typeof char.emotional_memory === 'string') {
    memParts.push(char.emotional_memory.slice(0, 150));
  }
  if (memParts.length) lines.push(`  Emotional Memory: ${memParts.join('; ').slice(0, 250)}`);

  // Knowledge timeline — what the character knows at various points
  if (char.knowledge_timeline != null) {
    const kt = char.knowledge_timeline;
    let ktText: string | null = null;
    if (Array.isArray(kt)) {
      const items = kt
        .map(item => {
          const entry = parseJsonField<ParsedKnowledgeTimelineEntry>(item, {});
          const parts: string[] = [];
          if (entry.chapter) parts.push(`Ch ${entry.chapter}`);
          else if (entry.book) parts.push(`Book ${entry.book}`);
          if (entry.knows) parts.push(`knows: ${entry.knows}`);
          else if (entry.learns) parts.push(`learns: ${entry.learns}`);
          else if (entry.event) parts.push(entry.event);
          return parts.length ? parts.join(' ') : null;
        })
        .filter(Boolean)
        .slice(0, 5);
      if (items.length) ktText = items.join('; ');
    } else {
      ktText = objectToCompactText(kt, 200);
    }
    if (ktText) lines.push(`  Knowledge Timeline: ${ktText}`);
  }

  // Relationships — connections to other characters
  const rels = parseJsonField<ParsedRelationshipEntry[] | Record<string, unknown>>(
    char.relationships, Array.isArray(char.relationships) ? [] : {}
  );
  const relParts: string[] = [];
  if (Array.isArray(rels)) {
    for (const r of rels.slice(0, 5)) {
      const parts: string[] = [];
      if (r.name) parts.push(r.name);
      if (r.type) parts.push(`(${r.type})`);
      if (r.status) parts.push(`[${r.status}]`);
      if (typeof r.trust === 'number') parts.push(`trust: ${r.trust}`);
      if (typeof r.tension === 'number') parts.push(`tension: ${r.tension}`);
      if (parts.length) relParts.push(parts.join(' '));
    }
  } else if (rels && typeof rels === 'object') {
    for (const [name, type] of Object.entries(rels).slice(0, 5)) {
      const typeStr = typeof type === 'string' ? type : objectToCompactText(type, 60);
      if (typeStr) relParts.push(`${name} (${typeStr})`);
    }
  }
  if (relParts.length) lines.push(`  Relationships: ${relParts.join('; ').slice(0, 250)}`);

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
    /** Include backstory in output (default: true with 200 char budget per character) */
    includeBackstory?: boolean;
    /** Label for the section header (default: "CHARACTER PROFILES") */
    headerLabel?: string;
  }
): string {
  if (!characters || characters.length === 0) return '';

  const {
    maxLength,
    includeBackstory = true,
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

    // Optionally include backstory (default: yes, truncated)
    if (includeBackstory && char.backstory) {
      const backstoryLine = `\n  Backstory: ${String(char.backstory).slice(0, 250)}`;
      // If we have a per-character budget, make room for backstory
      if (perCharBudget && entry.length + backstoryLine.length > perCharBudget) {
        const room = Math.max(0, perCharBudget - entry.length - 10);
        if (room > 50) {
          entry += `\n  Backstory: ${String(char.backstory).slice(0, room)}...`;
        }
      } else {
        entry += backstoryLine;
      }
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
 * relevant relationship info — with full detail on every stored field.
 */
export function formatPOVCharacterContext(
  characters: CharacterRow[],
  povCharacterName: string,
  options?: {
    /** Maximum length (default: 2500) */
    maxLength?: number;
  }
): string {
  if (!characters || !povCharacterName) return '';

  const { maxLength = 2500 } = options ?? {};
  const nameLower = povCharacterName.toLowerCase().trim();

  // Find the POV character
  const povChar = characters.find(c =>
    (c.name || '').toLowerCase().trim() === nameLower ||
    (c.name || '').toLowerCase().trim().includes(nameLower)
  );

  if (!povChar) return '';

  const lines: string[] = [];
  lines.push(`POV CHARACTER: ${povChar.name || 'Unknown'} (${povChar.role || 'Unknown role'})`);

  // Metadata
  const metaParts: string[] = [];
  if (povChar.age) metaParts.push(`Age ${povChar.age}`);
  if (povChar.gender) metaParts.push(povChar.gender);
  if (povChar.introduced_in_book) metaParts.push(`Book ${povChar.introduced_in_book}`);
  if (povChar.introduced_in_chapter) metaParts.push(`Ch ${povChar.introduced_in_chapter}`);
  if (metaParts.length) lines.push(`  (${metaParts.join(', ')})`);

  // Description
  if (povChar.description) {
    lines.push(`Description: ${String(povChar.description).slice(0, 250)}`);
  }

  // Appearance — POV character's physical presence matters for narration
  const appearance = parseJsonField<ParsedAppearance>(povChar.appearance, {});
  const appearanceParts: string[] = [];
  if (appearance.physical) appearanceParts.push(String(appearance.physical));
  if (appearance.features) appearanceParts.push(String(appearance.features));
  if (appearance.distinguishing) appearanceParts.push(String(appearance.distinguishing));
  if (appearance.height) appearanceParts.push(`Height: ${appearance.height}`);
  if (appearance.build) appearanceParts.push(`Build: ${appearance.build}`);
  if (appearance.hair) appearanceParts.push(`Hair: ${appearance.hair}`);
  if (appearance.eyes) appearanceParts.push(`Eyes: ${appearance.eyes}`);
  if (appearance.skin) appearanceParts.push(`Skin: ${appearance.skin}`);
  if (appearance.style) appearanceParts.push(`Style: ${appearance.style}`);
  if (appearance.clothing) appearanceParts.push(`Clothing: ${appearance.clothing}`);
  const knownAppearanceKeys = new Set(['physical', 'features', 'distinguishing', 'height', 'build', 'hair', 'eyes', 'skin', 'style', 'clothing']);
  for (const [k, v] of Object.entries(appearance)) {
    if (knownAppearanceKeys.has(k) || v === null || v === undefined || v === '') continue;
    const vText = objectToCompactText(v, 80);
    if (vText) appearanceParts.push(`${k}: ${vText}`);
  }
  if (appearanceParts.length) lines.push(`Appearance: ${appearanceParts.join(' | ').slice(0, 300)}`);

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
    // Unknown voice keys
    const knownVoiceKeys = new Set(['speechStyle', 'vocabularyLevel', 'dialogueStyle', 'emotionalExpression']);
    for (const [k, v] of Object.entries(voice)) {
      if (knownVoiceKeys.has(k) || v === null || v === undefined) continue;
      const vText = objectToCompactText(v, 80);
      if (vText) lines.push(`  ${k}: ${vText}`);
    }
  }

  // Psychology — ALL fields shown together
  const psycheParts: string[] = [];
  if (povChar.core_desire) psycheParts.push(`Core Desire: ${povChar.core_desire}`);
  if (povChar.motivation) psycheParts.push(`Motivation: ${povChar.motivation}`);
  if (povChar.big_fear) psycheParts.push(`Biggest Fear: ${povChar.big_fear}`);
  if (povChar.conflict) psycheParts.push(`Conflict: ${povChar.conflict}`);
  if (povChar.hidden_secret) psycheParts.push(`Hidden Secret: ${povChar.hidden_secret}`);
  if (psycheParts.length) lines.push(`Psychology:`);
  for (const p of psycheParts) lines.push(`  ${p}`);

  // Personality
  const personality = parseJsonField<ParsedPersonality>(povChar.personality, {});
  const pParts: string[] = [];
  if (personality.traits?.length) pParts.push(`Traits: ${personality.traits.join(', ')}`);
  if (personality.flaws?.length) pParts.push(`Flaws: ${personality.flaws.join(', ')}`);
  if (personality.strengths?.length) pParts.push(`Strengths: ${personality.strengths.join(', ')}`);
  const knownPersonalityKeys = new Set(['traits', 'flaws', 'strengths']);
  for (const [k, v] of Object.entries(personality)) {
    if (knownPersonalityKeys.has(k) || v === null || v === undefined) continue;
    const vText = objectToCompactText(v, 80);
    if (vText) pParts.push(`${k}: ${vText}`);
  }
  if (pParts.length) lines.push(`Personality: ${pParts.join(' | ')}`);

  // Character arc
  if (povChar.start_state) lines.push(`Arc Start State: ${povChar.start_state}`);
  if (povChar.end_state) lines.push(`Arc End State: ${povChar.end_state}`);

  // Growth arc — full description
  const growthArc = parseJsonField<ParsedGrowthArc>(povChar.growth_arc, {});
  const growthParts: string[] = [];
  if (growthArc.description) growthParts.push(String(growthArc.description));
  else if (growthArc.summary) growthParts.push(String(growthArc.summary));
  if (growthArc.theme) growthParts.push(`Theme: ${growthArc.theme}`);
  if (growthArc.catalyst) growthParts.push(`Catalyst: ${growthArc.catalyst}`);
  if (growthArc.turningPoint) growthParts.push(`Turning Point: ${growthArc.turningPoint}`);
  if (growthArc.resolution) growthParts.push(`Resolution: ${growthArc.resolution}`);
  if (growthParts.length === 0 && povChar.growth_arc != null) {
    const fallback = objectToCompactText(povChar.growth_arc, 250);
    if (fallback) growthParts.push(fallback);
  }
  if (growthParts.length) lines.push(`Growth Arc: ${growthParts.join(' | ')}`);

  // Arc stages — milestones
  if (Array.isArray(povChar.arc_stages) && povChar.arc_stages.length > 0) {
    const stages = povChar.arc_stages
      .map((s, i) => {
        const stage = parseJsonField<ParsedArcStage>(s, {});
        const label = stage.title || stage.name || stage.stage || `Stage ${i + 1}`;
        const desc = stage.description || stage.state || stage.event;
        return desc ? `${label}: ${String(desc).slice(0, 100)}` : String(label).slice(0, 100);
      })
      .slice(0, 6);
    if (stages.length) lines.push(`Arc Stages: ${stages.join(' → ')}`);
  }

  // Emotional memory — essential for POV character's reactions
  const emotionalMemory = parseJsonField<ParsedEmotionalMemory | ParsedEmotionalMemory[]>(
    povChar.emotional_memory, Array.isArray(povChar.emotional_memory) ? [] : {}
  );
  const memParts: string[] = [];
  if (Array.isArray(emotionalMemory)) {
    for (const m of emotionalMemory.slice(0, 5)) {
      const parts: string[] = [];
      if (m.event) parts.push(m.event);
      else if (m.description) parts.push(m.description);
      if (m.emotion) parts.push(`[${m.emotion}]`);
      if (m.age !== undefined && m.age !== null) parts.push(`(age ${m.age})`);
      if (parts.length) memParts.push(parts.join(' '));
    }
  } else if (emotionalMemory && typeof emotionalMemory === 'object') {
    const m = emotionalMemory as ParsedEmotionalMemory;
    if (m.event || m.description) {
      const parts: string[] = [];
      if (m.event) parts.push(m.event);
      else if (m.description) parts.push(m.description);
      if (m.emotion) parts.push(`[${m.emotion}]`);
      if (m.age !== undefined && m.age !== null) parts.push(`(age ${m.age})`);
      if (parts.length) memParts.push(parts.join(' '));
    }
  }
  if (memParts.length === 0 && typeof povChar.emotional_memory === 'string') {
    memParts.push(povChar.emotional_memory.slice(0, 200));
  }
  if (memParts.length) lines.push(`Emotional Memory: ${memParts.join('; ')}`);

  // Knowledge timeline — what this character knows at this point in the story
  if (povChar.knowledge_timeline != null) {
    const kt = povChar.knowledge_timeline;
    let ktText: string | null = null;
    if (Array.isArray(kt)) {
      const items = kt
        .map(item => {
          const entry = parseJsonField<ParsedKnowledgeTimelineEntry>(item, {});
          const parts: string[] = [];
          if (entry.chapter) parts.push(`Ch ${entry.chapter}`);
          else if (entry.book) parts.push(`Book ${entry.book}`);
          if (entry.knows) parts.push(`knows: ${entry.knows}`);
          else if (entry.learns) parts.push(`learns: ${entry.learns}`);
          else if (entry.event) parts.push(entry.event);
          return parts.length ? parts.join(' ') : null;
        })
        .filter(Boolean)
        .slice(0, 6);
      if (items.length) ktText = items.join('; ');
    } else {
      ktText = objectToCompactText(kt, 250);
    }
    if (ktText) lines.push(`Knowledge Timeline: ${ktText}`);
  }

  // Key relationships (compact)
  const relationships = parseJsonField<Array<{ name?: string; type?: string; status?: string; trust?: number; tension?: number }>>(
    povChar.relationships, []
  );
  if (Array.isArray(relationships) && relationships.length > 0) {
    const relParts = relationships.slice(0, 6).map(r =>
      `${r.name || '?'} (${r.type || 'unknown'}${r.status ? `, ${r.status}` : ''}${typeof r.trust === 'number' ? `, trust ${r.trust}` : ''}${typeof r.tension === 'number' ? `, tension ${r.tension}` : ''})`
    );
    lines.push(`Key Relationships: ${relParts.join('; ')}`);
  } else if (povChar.relationships && typeof povChar.relationships === 'object' && !Array.isArray(povChar.relationships)) {
    const relObj = povChar.relationships as Record<string, unknown>;
    const relParts = Object.entries(relObj).slice(0, 6).map(([name, type]) => {
      const typeStr = typeof type === 'string' ? type : objectToCompactText(type, 60);
      return `${name} (${typeStr || 'unknown'})`;
    });
    if (relParts.length) lines.push(`Key Relationships: ${relParts.join('; ')}`);
  }

  let result = lines.join('\n');
  if (result.length > maxLength) {
    result = result.slice(0, maxLength) + '...';
  }
  return result;
}
