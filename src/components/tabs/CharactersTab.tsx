'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  User,
  Heart,
  Zap,
  Shield,
  Users,
  Eye,
  MessageSquare,
  Brain,
  Clock,
  Search,
  RefreshCw,
  MapPin,
  BookOpen,
  Lock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Character {
  id: string;
  name: string;
  role: string;
  age?: string | null;
  gender?: string | null;
  appearance?: unknown | null;
  personality?: unknown | null;
  backstory?: string | null;
  description?: string | null;
  motivation?: string | null;
  conflict?: string | null;
  core_desire?: string | null;
  big_fear?: string | null;
  hidden_secret?: string | null;
  start_state?: string | null;
  end_state?: string | null;
  growth_arc?: unknown | null;
  arc?: unknown | null;
  arc_stages?: unknown[] | null;
  voice_profile?: unknown | null;
  emotional_memory?: unknown | null;
  knowledge_timeline?: unknown | null;
  relationships?: unknown | null;
  introduced_in_book?: number | null;
  introduced_in_chapter?: number | null;
  is_fully_developed?: boolean | null;
}

interface RelationshipEntry {
  id: string;
  character_a_name?: string;
  character_b_name?: string;
  relationship_type?: string;
  status?: string;
  trust_level?: number;
  tension_level?: number;
  [key: string]: unknown;
}

interface CharactersTabProps {
  characters: Character[];
  relationships: RelationshipEntry[];
  onRefresh: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const roleColors: Record<string, string> = {
  protagonist: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  antagonist: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  supporting: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  minor: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  mentor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  love_interest: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
};

const roleIcons: Record<string, React.ReactNode> = {
  protagonist: <Shield className="h-4 w-4" />,
  antagonist: <Zap className="h-4 w-4" />,
  supporting: <Users className="h-4 w-4" />,
  minor: <User className="h-4 w-4" />,
  mentor: <BookOpen className="h-4 w-4" />,
  love_interest: <Heart className="h-4 w-4" />,
};

const roleStatConfig: Record<string, { iconColor: string; countColor: string; labelColor: string; borderColor: string; Icon: React.ComponentType<{ className?: string }> }> = {
  protagonist: { iconColor: 'text-emerald-500', countColor: 'text-emerald-300', labelColor: 'text-emerald-400', borderColor: 'border-emerald-500/20', Icon: Shield },
  antagonist: { iconColor: 'text-rose-500', countColor: 'text-rose-300', labelColor: 'text-rose-400', borderColor: 'border-rose-500/20', Icon: Zap },
  supporting: { iconColor: 'text-blue-500', countColor: 'text-blue-300', labelColor: 'text-blue-400', borderColor: 'border-blue-500/20', Icon: Users },
  other: { iconColor: 'text-zinc-500', countColor: 'text-zinc-300', labelColor: 'text-zinc-400', borderColor: 'border-zinc-500/20', Icon: User },
};

function parseJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

function getRoleKey(role: string): string {
  const r = (role || '').toLowerCase().trim();
  if (r.includes('protagonist') || r === 'hero' || r === 'main') return 'protagonist';
  if (r.includes('antagonist') || r === 'villain') return 'antagonist';
  if (r.includes('support') || r.includes('secondary') || r.includes('side')) return 'supporting';
  if (r.includes('mentor') || r.includes('guide')) return 'mentor';
  if (r.includes('love') || r.includes('romantic') || r.includes('interest')) return 'love_interest';
  if (r === 'minor' || r === 'extra' || r === 'background') return 'minor';
  return 'other';
}

function getRoleLabel(key: string): string {
  const labels: Record<string, string> = {
    protagonist: 'Protagonists',
    antagonist: 'Antagonists',
    supporting: 'Supporting',
    mentor: 'Mentors',
    love_interest: 'Love Interests',
    minor: 'Minor',
    other: 'Other',
  };
  return labels[key] || key;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CharactersTab({ characters, relationships, onRefresh }: CharactersTabProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [detailOpen, setDetailOpen] = useState(false);

  // Group characters by normalized role key
  const groupedCharacters = useMemo(() => {
    const groups: Record<string, Character[]> = {};
    characters.forEach((char) => {
      const key = getRoleKey(char.role || '');
      if (!groups[key]) groups[key] = [];
      groups[key].push(char);
    });
    return groups;
  }, [characters]);

  // Role counts for the stat cards (fixed 4 slots)
  const roleCounts = useMemo(() => {
    return {
      protagonist: groupedCharacters.protagonist?.length ?? 0,
      antagonist: groupedCharacters.antagonist?.length ?? 0,
      supporting: groupedCharacters.supporting?.length ?? 0,
      other: (groupedCharacters.other?.length ?? 0) +
             (groupedCharacters.minor?.length ?? 0) +
             (groupedCharacters.mentor?.length ?? 0) +
             (groupedCharacters.love_interest?.length ?? 0),
    };
  }, [groupedCharacters]);

  // Filter characters by search + role
  const filteredCharacters = useMemo(() => {
    return characters.filter((char) => {
      const matchesSearch =
        !searchQuery ||
        (char.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (char.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (char.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole =
        roleFilter === 'all' || getRoleKey(char.role || '') === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [characters, searchQuery, roleFilter]);

  // Filtered grouped characters for the list
  const filteredGrouped = useMemo(() => {
    const groups: Record<string, Character[]> = {};
    filteredCharacters.forEach((char) => {
      const key = getRoleKey(char.role || '');
      if (!groups[key]) groups[key] = [];
      groups[key].push(char);
    });
    return groups;
  }, [filteredCharacters]);

  // Relationships for the selected character
  const selectedRelationships = useMemo(() => {
    if (!selectedCharacter) return [];
    const name = (selectedCharacter.name || '').toLowerCase();
    if (!name) return [];
    return relationships.filter((rel) => {
      const a = (rel.character_a_name || '').toLowerCase();
      const b = (rel.character_b_name || '').toLowerCase();
      return a === name || b === name;
    });
  }, [relationships, selectedCharacter]);

  const openDetail = (char: Character) => {
    setSelectedCharacter(char);
    setDetailOpen(true);
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Characters</h2>
          <p className="text-sm text-zinc-400">
            Manage the characters across your series.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="rounded-full border-zinc-700"
        >
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Refresh Characters
        </Button>
      </div>

      {/* Role Summary Cards */}
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {Object.entries(roleStatConfig).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setRoleFilter(roleFilter === key ? 'all' : key)}
            className={`rounded-xl border p-4 text-left transition ${
              roleFilter === key
                ? `${cfg.borderColor} bg-zinc-800/80 ring-1 ring-zinc-600`
                : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-800/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <cfg.Icon className={`h-4 w-4 ${cfg.iconColor}`} />
              <span className={`text-2xl font-semibold ${cfg.countColor}`}>
                {roleCounts[key as keyof typeof roleCounts] ?? 0}
              </span>
            </div>
            <p className={`mt-1 text-xs ${cfg.labelColor}`}>
              {getRoleLabel(key)}
            </p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mt-4 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          placeholder="Search characters by name, role, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-zinc-950/60 border-zinc-800 text-sm"
        />
      </div>

      {/* Character Grid */}
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredCharacters.length === 0 && (
          <p className="col-span-full text-sm text-zinc-500 py-8 text-center">
            {characters.length === 0
              ? 'No characters yet. Generate a series bible to create characters.'
              : 'No characters match your search.'}
          </p>
        )}

        {filteredCharacters.map((character) => {
          const personality = parseJson<{ traits?: string[]; flaws?: string[]; strengths?: string[] }>(
            character.personality,
            { traits: [], flaws: [], strengths: [] }
          );
          const voiceProfile = parseJson<{ speechStyle?: string; vocabularyLevel?: string }>(
            character.voice_profile,
            {}
          );
          const roleKey = getRoleKey(character.role || '');

          return (
            <Card
              key={character.id}
              className="cursor-pointer border-zinc-800 bg-zinc-950/60 hover:border-zinc-600 hover:bg-zinc-900/80 transition-all"
              onClick={() => openDetail(character)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        (roleColors[roleKey] || roleColors.minor).split(' ')[0]
                      }`}
                    >
                      {roleIcons[roleKey] || <User className="h-5 w-5" />}
                    </div>
                    <div>
                      <CardTitle className="text-base text-zinc-100">
                        {character.name || 'Unnamed'}
                      </CardTitle>
                      <p className="text-xs text-zinc-400">
                        {character.age && `Age ${character.age}`}
                        {character.age && character.gender ? ' · ' : ''}
                        {character.gender || ''}
                        {character.introduced_in_book ? ` · Book ${character.introduced_in_book}` : ''}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={roleColors[roleKey] || roleColors.minor}
                  >
                    {character.role || 'Supporting'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Description */}
                {character.description && (
                  <p className="text-xs text-zinc-300 line-clamp-2">
                    {String(character.description)}
                  </p>
                )}

                {/* Core Desire & Fear */}
                <div className="grid grid-cols-2 gap-2">
                  {character.core_desire && (
                    <div className="rounded-lg bg-amber-500/10 p-2">
                      <div className="flex items-center gap-1 text-[10px] text-amber-400 mb-1">
                        <Heart className="h-3 w-3" /> Core Desire
                      </div>
                      <p className="text-xs text-amber-200 line-clamp-2">{character.core_desire}</p>
                    </div>
                  )}
                  {character.big_fear && (
                    <div className="rounded-lg bg-rose-500/10 p-2">
                      <div className="flex items-center gap-1 text-[10px] text-rose-400 mb-1">
                        <Zap className="h-3 w-3" /> Big Fear
                      </div>
                      <p className="text-xs text-rose-200 line-clamp-2">{character.big_fear}</p>
                    </div>
                  )}
                </div>

                {/* Motivation & Conflict (fallback if core_desire/big_fear not set) */}
                {!character.core_desire && character.motivation && (
                  <div className="rounded-lg bg-amber-500/10 p-2">
                    <div className="flex items-center gap-1 text-[10px] text-amber-400 mb-1">
                      <Heart className="h-3 w-3" /> Motivation
                    </div>
                    <p className="text-xs text-amber-200 line-clamp-2">{character.motivation}</p>
                  </div>
                )}
                {!character.big_fear && character.conflict && (
                  <div className="rounded-lg bg-rose-500/10 p-2">
                    <div className="flex items-center gap-1 text-[10px] text-rose-400 mb-1">
                      <Zap className="h-3 w-3" /> Conflict
                    </div>
                    <p className="text-xs text-rose-200 line-clamp-2">{character.conflict}</p>
                  </div>
                )}

                {/* Personality Traits */}
                {personality.traits && personality.traits.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {personality.traits.slice(0, 5).map((trait, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] border-zinc-700 text-zinc-300">
                        {trait}
                      </Badge>
                    ))}
                    {personality.traits.length > 5 && (
                      <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400">
                        +{personality.traits.length - 5} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Voice Profile Indicator */}
                {voiceProfile.speechStyle && (
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <MessageSquare className="h-3 w-3" />
                    <span>Voice: {voiceProfile.speechStyle}</span>
                  </div>
                )}

                {/* View Details */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-zinc-400 hover:text-zinc-200"
                >
                  View Full Profile <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Character Detail Dialog */}
      <CharacterDetailDialog
        character={selectedCharacter}
        relationships={selectedRelationships}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedCharacter(null);
        }}
      />
    </section>
  );
}

// ─── Detail Dialog ────────────────────────────────────────────────────────────

function CharacterDetailDialog({
  character,
  relationships,
  open,
  onClose,
}: {
  character: Character | null;
  relationships: RelationshipEntry[];
  open: boolean;
  onClose: () => void;
}) {
  if (!character) return null;

  const personality = parseJson<{
    traits?: string[];
    flaws?: string[];
    strengths?: string[];
  }>(character.personality, { traits: [], flaws: [], strengths: [] });
  const appearance = parseJson<{
    physical?: string;
    features?: string;
    style?: string;
    distinguishing?: string;
    [key: string]: unknown;
  }>(character.appearance, {});
  const voiceProfile = parseJson<{
    speechStyle?: string;
    vocabularyLevel?: string;
    emotionalExpression?: string | { description?: string };
    dialogueStyle?: string;
    sampleDialogues?: Array<{ situation: string; dialogue: string }>;
    [key: string]: unknown;
  }>(character.voice_profile, {});
  const growthArc = parseJson<{
    stages?: Array<{ stage: string; description: string }>;
    [key: string]: unknown;
  }>(character.growth_arc, {});
  const emotionalMemory = parseJson<
    Array<{ event: string; impact: string; intensity?: number }>
  >(character.emotional_memory, []);
  const arcData = parseJson<{
    stages?: Array<{ stage: string; description: string }>;
    [key: string]: unknown;
  }>(character.arc, {});
  const knowledgeTimeline = parseJson<unknown>(character.knowledge_timeline, null);
  const charRelationships = parseJson<unknown>(character.relationships, null);

  // Merge arc stages from multiple possible sources
  const arcStages = useMemo(() => {
    const stages: Array<{ label: string; description: string }> = [];
    // From arc_stages column
    if (Array.isArray(character.arc_stages)) {
      character.arc_stages.forEach((stage, i) => {
        if (typeof stage === 'string') {
          stages.push({ label: `Stage ${i + 1}`, description: stage });
        } else if (typeof stage === 'object' && stage !== null) {
          const s = stage as Record<string, unknown>;
          stages.push({
            label: String(s.label || s.stage || s.name || `Stage ${i + 1}`),
            description: String(s.description || s.detail || JSON.stringify(stage)),
          });
        }
      });
    }
    // From growth_arc.stages
    if (stages.length === 0 && Array.isArray(growthArc.stages)) {
      growthArc.stages.forEach((stage, i) => {
        if (typeof stage === 'string') {
          stages.push({ label: `Stage ${i + 1}`, description: stage });
        } else if (typeof stage === 'object' && stage !== null) {
          const s = stage as Record<string, unknown>;
          stages.push({
            label: String(s.stage || s.label || s.name || `Stage ${i + 1}`),
            description: String(s.description || s.detail || JSON.stringify(stage)),
          });
        }
      });
    }
    // From arc.stages
    if (stages.length === 0 && Array.isArray(arcData.stages)) {
      arcData.stages.forEach((stage, i) => {
        if (typeof stage === 'string') {
          stages.push({ label: `Stage ${i + 1}`, description: stage });
        } else if (typeof stage === 'object' && stage !== null) {
          const s = stage as Record<string, unknown>;
          stages.push({
            label: String(s.stage || s.label || s.name || `Stage ${i + 1}`),
            description: String(s.description || s.detail || JSON.stringify(stage)),
          });
        }
      });
    }
    return stages;
  }, [character.arc_stages, growthArc, arcData]);

  const roleKey = getRoleKey(character.role || '');

  // Appearance as readable text
  const appearanceText = useMemo(() => {
    if (!appearance || Object.keys(appearance).length === 0) return null;
    const parts: string[] = [];
    if (typeof appearance.physical === 'string') parts.push(appearance.physical);
    if (typeof appearance.features === 'string') parts.push(appearance.features);
    if (typeof appearance.style === 'string') parts.push(appearance.style);
    if (typeof appearance.distinguishing === 'string') parts.push(appearance.distinguishing);
    // Fallback: stringify any remaining keys
    if (parts.length === 0) {
      Object.entries(appearance).forEach(([key, val]) => {
        if (typeof val === 'string') parts.push(`${key}: ${val}`);
        else if (val) parts.push(`${key}: ${JSON.stringify(val)}`);
      });
    }
    return parts.join('\n');
  }, [appearance]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] border-zinc-800 bg-zinc-950 text-zinc-100">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full ${
                (roleColors[roleKey] || roleColors.minor).split(' ')[0]
              }`}
            >
              {roleIcons[roleKey] || <User className="h-7 w-7" />}
            </div>
            <div>
              <DialogTitle className="text-xl">{character.name || 'Unnamed'}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className={roleColors[roleKey] || roleColors.minor}
                >
                  {character.role || 'Supporting'}
                </Badge>
                {character.age && <span className="text-zinc-400">Age {character.age}</span>}
                {character.gender && <span className="text-zinc-400">· {character.gender}</span>}
                {character.introduced_in_book && (
                  <span className="text-zinc-400">· Book {character.introduced_in_book}</span>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-2">
          <div className="space-y-4 pb-4">
            {/* Description */}
            {(character.description != null || character.backstory != null) ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-xs font-semibold uppercase text-zinc-400 mb-2">Overview</p>
                {character.description != null && (
                  <p className="text-sm text-zinc-200 mb-2">{String(character.description)}</p>
                )}
                {character.backstory != null && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-zinc-500 mt-3 mb-1 flex items-center gap-1">
                      <Eye className="h-3 w-3 text-indigo-400" /> Backstory
                    </p>
                    <p className="text-sm text-zinc-300">{character.backstory}</p>
                  </div>
                )}
              </div>
            ) : null}

            {/* Core Psychology */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
              <p className="text-xs font-semibold uppercase text-zinc-400 mb-3 flex items-center gap-1">
                <Brain className="h-3.5 w-3.5 text-purple-400" /> Core Psychology
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-amber-500/10 p-3">
                  <p className="text-[10px] text-amber-400 mb-1 flex items-center gap-1">
                    <Heart className="h-3 w-3" /> Core Desire
                  </p>
                  <p className="text-xs text-amber-200">
                    {String(character.core_desire ?? character.motivation ?? 'Not defined')}
                  </p>
                </div>
                <div className="rounded-lg bg-rose-500/10 p-3">
                  <p className="text-[10px] text-rose-400 mb-1 flex items-center gap-1">
                    <Zap className="h-3 w-3" /> Biggest Fear
                  </p>
                  <p className="text-xs text-rose-200">
                    {String(character.big_fear ?? character.conflict ?? 'Not defined')}
                  </p>
                </div>
                <div className="rounded-lg bg-indigo-500/10 p-3">
                  <p className="text-[10px] text-indigo-400 mb-1 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Hidden Secret
                  </p>
                  <p className="text-xs text-indigo-200">
                    {String(character.hidden_secret ?? 'Not defined')}
                  </p>
                </div>
              </div>
            </div>

            {/* Personality */}
            {((personality.traits?.length ?? 0) > 0 || (personality.flaws?.length ?? 0) > 0 || (personality.strengths?.length ?? 0) > 0) && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-xs font-semibold uppercase text-zinc-400 mb-3">Personality</p>
                <div className="space-y-2">
                  {personality.traits && personality.traits.length > 0 && (
                    <div>
                      <p className="text-[10px] text-zinc-500 mb-1">Traits</p>
                      <div className="flex flex-wrap gap-1">
                        {personality.traits.map((trait, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] bg-zinc-800 text-zinc-300">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {personality.flaws && personality.flaws.length > 0 && (
                    <div>
                      <p className="text-[10px] text-zinc-500 mb-1">Flaws</p>
                      <div className="flex flex-wrap gap-1">
                        {personality.flaws.map((flaw, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] border-rose-500/30 text-rose-300">
                            {flaw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {personality.strengths && personality.strengths.length > 0 && (
                    <div>
                      <p className="text-[10px] text-zinc-500 mb-1">Strengths</p>
                      <div className="flex flex-wrap gap-1">
                        {personality.strengths.map((strength, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-300">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fallback: raw personality string if no parsed traits */}
            {!(personality.traits?.length) && !(personality.flaws?.length) && character.personality != null ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-xs font-semibold uppercase text-zinc-400 mb-2">Personality</p>
                <p className="text-sm text-zinc-200">
                  {typeof character.personality === 'string'
                    ? character.personality
                    : JSON.stringify(character.personality, null, 2)}
                </p>
              </div>
            ) : null}

            {/* Appearance */}
            {appearanceText != null && appearanceText.length > 0 && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-xs font-semibold uppercase text-zinc-400 mb-2 flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5 text-blue-400" /> Appearance
                </p>
                <p className="text-sm text-zinc-200 whitespace-pre-line">{appearanceText}</p>
              </div>
            )}

            {/* Voice Profile */}
            {Object.keys(voiceProfile).length > 0 ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-xs font-semibold uppercase text-zinc-400 mb-3 flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5 text-blue-400" /> Voice Profile
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {voiceProfile.speechStyle && (
                    <div>
                      <p className="text-[10px] text-zinc-500">Speech Style</p>
                      <p className="text-sm text-zinc-200">{voiceProfile.speechStyle}</p>
                    </div>
                  )}
                  {voiceProfile.vocabularyLevel && (
                    <div>
                      <p className="text-[10px] text-zinc-500">Vocabulary Level</p>
                      <p className="text-sm text-zinc-200">{voiceProfile.vocabularyLevel}</p>
                    </div>
                  )}
                  {voiceProfile.emotionalExpression && (
                    <div>
                      <p className="text-[10px] text-zinc-500">Emotional Expression</p>
                      <p className="text-sm text-zinc-200">
                        {typeof voiceProfile.emotionalExpression === 'object'
                          ? (voiceProfile.emotionalExpression as { description?: string }).description || JSON.stringify(voiceProfile.emotionalExpression)
                          : String(voiceProfile.emotionalExpression)}
                      </p>
                    </div>
                  )}
                  {voiceProfile.dialogueStyle && (
                    <div>
                      <p className="text-[10px] text-zinc-500">Dialogue Style</p>
                      <p className="text-sm text-zinc-200">{voiceProfile.dialogueStyle}</p>
                    </div>
                  )}
                </div>
                {voiceProfile.sampleDialogues && voiceProfile.sampleDialogues.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-[10px] text-zinc-500">Sample Dialogue</p>
                    {voiceProfile.sampleDialogues.slice(0, 2).map((sample, i) => (
                      <div key={i} className="rounded-lg bg-zinc-800/60 p-2">
                        <p className="text-[10px] text-zinc-500 mb-0.5">{sample.situation}:</p>
                        <p className="text-xs text-zinc-200 italic">&ldquo;{sample.dialogue}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {/* Character Arc */}
            {(character.start_state != null || character.end_state != null || character.growth_arc != null || arcStages.length > 0) ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-xs font-semibold uppercase text-zinc-400 mb-3 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-green-400" /> Character Arc
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {character.start_state != null && (
                    <div className="rounded-lg bg-blue-500/10 p-3">
                      <p className="text-[10px] text-blue-400 mb-1">Start State</p>
                      <p className="text-xs text-blue-200">{character.start_state}</p>
                    </div>
                  )}
                  {character.growth_arc != null && (
                    <div className="rounded-lg bg-amber-500/10 p-3">
                      <p className="text-[10px] text-amber-400 mb-1">Growth Arc</p>
                      <p className="text-xs text-amber-200">
                        {typeof character.growth_arc === 'string'
                          ? String(character.growth_arc)
                          : (growthArc.description != null ? String(growthArc.description) : JSON.stringify(character.growth_arc, null, 1))}
                      </p>
                    </div>
                  )}
                  {character.end_state != null && (
                    <div className="rounded-lg bg-emerald-500/10 p-3">
                      <p className="text-[10px] text-emerald-400 mb-1">End State</p>
                      <p className="text-xs text-emerald-200">{character.end_state}</p>
                    </div>
                  )}
                </div>

                {/* Arc Stages Timeline */}
                {arcStages.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-[10px] text-zinc-500">Arc Stages</p>
                    <div className="relative pl-4 border-l border-zinc-700">
                      {arcStages.map((stage, i) => (
                        <div key={i} className="relative mb-3 last:mb-0">
                          <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-zinc-600 border-2 border-zinc-800" />
                          <p className="text-xs font-medium text-zinc-300">{stage.label}</p>
                          <p className="text-[11px] text-zinc-400">{stage.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Emotional Memory */}
            {emotionalMemory.length > 0 && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-xs font-semibold uppercase text-zinc-400 mb-3 flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5 text-rose-400" /> Emotional Memory
                </p>
                <div className="space-y-2">
                  {emotionalMemory.map((memory, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg bg-zinc-800/60 p-3">
                      <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-200">{memory.event}</p>
                        <p className="text-[11px] text-zinc-400">{memory.impact}</p>
                      </div>
                      {memory.intensity != null && (
                        <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400">
                          {memory.intensity}/10
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback: raw emotional memory if not an array */}
            {emotionalMemory.length === 0 && character.emotional_memory != null && typeof character.emotional_memory === 'object' && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-xs font-semibold uppercase text-zinc-400 mb-2 flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5 text-rose-400" /> Emotional Memory
                </p>
                <pre className="whitespace-pre-wrap rounded-lg bg-zinc-800/60 p-3 text-[11px] text-zinc-300">
                  {JSON.stringify(character.emotional_memory, null, 2)}
                </pre>
              </div>
            )}

            {/* Relationships */}
            {relationships.length > 0 && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-xs font-semibold uppercase text-zinc-400 mb-3 flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-blue-400" /> Relationships
                </p>
                <div className="space-y-2">
                  {relationships.slice(0, 6).map((rel) => {
                    const isCharA = (rel.character_a_name || '').toLowerCase() === (character.name || '').toLowerCase();
                    const otherName = isCharA ? rel.character_b_name : rel.character_a_name;
                    return (
                      <div key={String(rel.id)} className="flex items-center gap-3 rounded-lg bg-zinc-800/60 p-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700">
                          <User className="h-4 w-4 text-zinc-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-zinc-200">{otherName || '?'}</p>
                          <p className="text-[11px] text-zinc-400">
                            {rel.relationship_type || 'Unknown relationship'}
                            {rel.status && ` · ${rel.status}`}
                          </p>
                        </div>
                        {rel.trust_level != null && (
                          <div className="text-right">
                            <p className="text-[10px] text-zinc-500">Trust</p>
                            <p className="text-xs text-zinc-300">{rel.trust_level}%</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Character Relationships from JSONB column */}
            {charRelationships != null && !relationships.length && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-xs font-semibold uppercase text-zinc-400 mb-2 flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-blue-400" /> Relationships
                </p>
                <pre className="whitespace-pre-wrap rounded-lg bg-zinc-800/60 p-3 text-[11px] text-zinc-300">
                  {JSON.stringify(charRelationships, null, 2)}
                </pre>
              </div>
            )}

            {/* Knowledge Timeline */}
            {knowledgeTimeline != null && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-xs font-semibold uppercase text-zinc-400 mb-2 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" /> Knowledge Timeline
                </p>
                <pre className="whitespace-pre-wrap rounded-lg bg-zinc-800/60 p-3 text-[11px] text-zinc-300">
                  {JSON.stringify(knowledgeTimeline, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
