/**
 * Structured book character profiles — shared shape with series_characters.
 */

import { formatCharactersForPrompt } from "@/lib/characterPrompt";

export type StructuredCharacter = {
  name: string;
  role?: string;
  description?: string;
  age?: string | null;
  gender?: string | null;
  appearance?: Record<string, unknown> | string | null;
  personality?: Record<string, unknown> | string | null;
  backstory?: string | null;
  motivation?: string | null;
  conflict?: string | null;
  core_desire?: string | null;
  big_fear?: string | null;
  hidden_secret?: string | null;
  growth_arc?: Record<string, unknown> | string | null;
  start_state?: string | null;
  end_state?: string | null;
  relationships?: Record<string, unknown> | string | null;
  voice_profile?: Record<string, unknown> | string | null;
  introduced_in_book?: number | null;
  introduced_in_chapter?: number | null;
};

function asObjectOrWrap(
  value: unknown,
  wrapKey: string
): Record<string, unknown> | null {
  if (value == null) return null;
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === "string" && value.trim()) {
    return { [wrapKey]: value.trim() };
  }
  return null;
}

export function normalizeStructuredCharacter(
  raw: unknown
): StructuredCharacter | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const rec = raw as Record<string, unknown>;
  const name = String(rec.name ?? rec.full_name ?? "").trim();
  if (!name) return null;

  return {
    name,
    role: String(rec.role ?? "").trim() || undefined,
    description: String(rec.description ?? rec.summary ?? "").trim() || undefined,
    age: rec.age != null ? String(rec.age) : null,
    gender: rec.gender != null ? String(rec.gender) : null,
    appearance: asObjectOrWrap(rec.appearance ?? rec.physical_description, "notes"),
    personality: asObjectOrWrap(rec.personality ?? rec.traits, "traits"),
    backstory:
      rec.backstory != null ? String(rec.backstory) : null,
    motivation:
      rec.motivation != null
        ? String(rec.motivation)
        : rec.motivations != null
          ? String(rec.motivations)
          : null,
    conflict: rec.conflict != null ? String(rec.conflict) : null,
    core_desire:
      rec.core_desire != null
        ? String(rec.core_desire)
        : rec.desires != null
          ? String(rec.desires)
          : null,
    big_fear:
      rec.big_fear != null
        ? String(rec.big_fear)
        : rec.fears != null
          ? String(rec.fears)
          : null,
    hidden_secret:
      rec.hidden_secret != null ? String(rec.hidden_secret) : null,
    growth_arc: asObjectOrWrap(rec.growth_arc ?? rec.arc ?? rec.character_arc, "summary"),
    start_state: rec.start_state != null ? String(rec.start_state) : null,
    end_state: rec.end_state != null ? String(rec.end_state) : null,
    relationships: asObjectOrWrap(rec.relationships, "notes"),
    voice_profile: asObjectOrWrap(
      rec.voice_profile ?? rec.voice ?? rec.dialogue_style,
      "style"
    ),
    introduced_in_book:
      rec.introduced_in_book != null
        ? Number(rec.introduced_in_book)
        : null,
    introduced_in_chapter:
      rec.introduced_in_chapter != null
        ? Number(rec.introduced_in_chapter)
        : null,
  };
}

export function parseCharacterProfilesPayload(
  profiles: unknown
): StructuredCharacter[] {
  if (!profiles) return [];

  if (Array.isArray(profiles)) {
    return profiles
      .map(normalizeStructuredCharacter)
      .filter(Boolean) as StructuredCharacter[];
  }

  if (typeof profiles === "string") {
    const trimmed = profiles.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .map(normalizeStructuredCharacter)
            .filter(Boolean) as StructuredCharacter[];
        }
        if (parsed && typeof parsed === "object") {
          const chars =
            (parsed as { characters?: unknown }).characters ??
            (parsed as { profiles?: unknown }).profiles;
          if (Array.isArray(chars)) {
            return chars
              .map(normalizeStructuredCharacter)
              .filter(Boolean) as StructuredCharacter[];
          }
          const one = normalizeStructuredCharacter(parsed);
          return one ? [one] : [];
        }
      } catch {
        return [];
      }
    }
    return [];
  }

  if (typeof profiles === "object") {
    const rec = profiles as Record<string, unknown>;
    if (Array.isArray(rec.characters)) {
      return rec.characters
        .map(normalizeStructuredCharacter)
        .filter(Boolean) as StructuredCharacter[];
    }
  }

  return [];
}

export function stringifyCharacterProfiles(
  characters: StructuredCharacter[]
): string {
  return JSON.stringify(characters, null, 2);
}

export function formatCharacterProfilesForDisplay(
  profiles: string | null | undefined
): string {
  const chars = parseCharacterProfilesPayload(profiles);
  if (chars.length) {
    return formatCharactersForPrompt(
      chars as Parameters<typeof formatCharactersForPrompt>[0],
      { maxLength: 12000 }
    );
  }
  return String(profiles ?? "");
}

export function toSeriesCharacterPayload(
  seriesId: string,
  character: StructuredCharacter,
  bookNumber?: number
): Record<string, unknown> {
  return {
    seriesId,
    name: character.name,
    role: character.role ?? "",
    description: character.description ?? "",
    age: character.age ?? null,
    gender: character.gender ?? null,
    appearance: character.appearance ?? null,
    personality: character.personality ?? null,
    backstory: character.backstory ?? null,
    motivation: character.motivation ?? null,
    conflict: character.conflict ?? null,
    core_desire: character.core_desire ?? null,
    big_fear: character.big_fear ?? null,
    hidden_secret: character.hidden_secret ?? null,
    growth_arc: character.growth_arc ?? null,
    start_state: character.start_state ?? null,
    end_state: character.end_state ?? null,
    relationships: character.relationships ?? null,
    voice_profile: character.voice_profile ?? null,
    introduced_in_book:
      character.introduced_in_book ?? bookNumber ?? null,
    introduced_in_chapter: character.introduced_in_chapter ?? null,
    is_fully_developed: true,
  };
}
