# 📚 YA Series Generator - Remaining Frontend Components

## 4.9 Characters Tab

```typescript
// src/components/tabs/CharactersTab.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { 
  User, Heart, Zap, Shield, Users, Eye, MessageSquare, 
  Brain, Clock, Sparkles, ChevronRight
} from 'lucide-react';

interface Character {
  id: string;
  name: string;
  role: string;
  age: string | null;
  gender: string | null;
  appearance: string | null;
  personality: string | null;
  backstory: string | null;
  coreDesire: string | null;
  bigFear: string | null;
  hiddenSecret: string | null;
  startState: string | null;
  endState: string | null;
  growthArc: string | null;
  voiceProfile: string | null;
  emotionalMemory: string | null;
  introducedInBook: number | null;
}

interface CharactersTabProps {
  series: {
    characters: Character[];
  };
}

const roleColors: Record<string, string> = {
  protagonist: 'bg-green-100 text-green-800 border-green-200',
  antagonist: 'bg-red-100 text-red-800 border-red-200',
  supporting: 'bg-blue-100 text-blue-800 border-blue-200',
  minor: 'bg-gray-100 text-gray-800 border-gray-200',
};

const roleIcons: Record<string, React.ReactNode> = {
  protagonist: <Shield className="h-4 w-4" />,
  antagonist: <Zap className="h-4 w-4" />,
  supporting: <Users className="h-4 w-4" />,
  minor: <User className="h-4 w-4" />,
};

export default function CharactersTab({ series }: CharactersTabProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  const parseJson = (json: string | null, fallback: unknown = {}) => {
    if (!json) return fallback;
    try {
      return JSON.parse(json);
    } catch {
      return fallback;
    }
  };

  // Group characters by role
  const groupedCharacters = series.characters.reduce((acc, char) => {
    const role = char.role || 'minor';
    if (!acc[role]) acc[role] = [];
    acc[role].push(char);
    return acc;
  }, {} as Record<string, Character[]>);

  return (
    <div className="space-y-6">
      {/* Character Overview Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-700">
                {groupedCharacters.protagonist?.length || 0}
              </span>
            </div>
            <p className="text-sm text-green-600 mt-1">Protagonists</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-red-600" />
              <span className="text-2xl font-bold text-red-700">
                {groupedCharacters.antagonist?.length || 0}
              </span>
            </div>
            <p className="text-sm text-red-600 mt-1">Antagonists</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-700">
                {groupedCharacters.supporting?.length || 0}
              </span>
            </div>
            <p className="text-sm text-blue-600 mt-1">Supporting</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-2xl font-bold text-gray-700">
                {groupedCharacters.minor?.length || 0}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Minor</p>
          </CardContent>
        </Card>
      </div>

      {/* Character Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {series.characters.map((character) => {
          const personality = parseJson(character.personality, { traits: [], flaws: [] });
          const voiceProfile = parseJson(character.voiceProfile, null);

          return (
            <Card 
              key={character.id}
              className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
              onClick={() => setSelectedCharacter(character)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      roleColors[character.role]?.split(' ')[0] || 'bg-gray-100'
                    }`}>
                      {roleIcons[character.role] || <User className="h-5 w-5" />}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{character.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {character.age && `Age ${character.age}`}
                        {character.gender && ` • ${character.gender}`}
                      </p>
                    </div>
                  </div>
                  <Badge className={roleColors[character.role] || ''}>
                    {character.role}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Core Desire & Fear */}
                <div className="grid grid-cols-2 gap-2">
                  {character.coreDesire && (
                    <div className="p-2 rounded-lg bg-amber-50">
                      <div className="flex items-center gap-1 text-xs text-amber-600 mb-1">
                        <Heart className="h-3 w-3" /> Core Desire
                      </div>
                      <p className="text-xs text-amber-800 line-clamp-2">{character.coreDesire}</p>
                    </div>
                  )}
                  {character.bigFear && (
                    <div className="p-2 rounded-lg bg-rose-50">
                      <div className="flex items-center gap-1 text-xs text-rose-600 mb-1">
                        <Zap className="h-3 w-3" /> Big Fear
                      </div>
                      <p className="text-xs text-rose-800 line-clamp-2">{character.bigFear}</p>
                    </div>
                  )}
                </div>

                {/* Personality Traits */}
                {personality.traits?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {personality.traits.slice(0, 4).map((trait: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {trait}
                      </Badge>
                    ))}
                    {personality.traits.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{personality.traits.length - 4} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Voice Profile Indicator */}
                {voiceProfile && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    <span>Voice: {voiceProfile.speechStyle || 'Standard'}</span>
                  </div>
                )}

                {/* View Details Button */}
                <Button variant="ghost" size="sm" className="w-full">
                  View Full Profile <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Character Detail Dialog */}
      <CharacterDetailDialog 
        character={selectedCharacter} 
        onClose={() => setSelectedCharacter(null)} 
      />
    </div>
  );
}

// ========================================
// Character Detail Dialog
// ========================================

function CharacterDetailDialog({ 
  character, 
  onClose 
}: { 
  character: Character | null; 
  onClose: () => void;
}) {
  if (!character) return null;

  const parseJson = (json: string | null, fallback: unknown = {}) => {
    if (!json) return fallback;
    try {
      return JSON.parse(json);
    } catch {
      return fallback;
    }
  };

  const personality = parseJson(character.personality, { traits: [], flaws: [], strengths: [] });
  const appearance = parseJson(character.appearance, {});
  const voiceProfile = parseJson(character.voiceProfile, {});
  const growthArc = parseJson(character.growthArc, {});
  const emotionalMemory = parseJson(character.emotionalMemory, []);

  return (
    <Dialog open={!!character} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              roleColors[character.role]?.split(' ')[0] || 'bg-gray-100'
            }`}>
              {roleIcons[character.role] || <User className="h-8 w-8" />}
            </div>
            <div>
              <DialogTitle className="text-2xl">{character.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <Badge className={roleColors[character.role] || ''}>
                  {character.role}
                </Badge>
                {character.age && <span>Age {character.age}</span>}
                {character.gender && <span>• {character.gender}</span>}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Core Psychology */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                Core Psychology
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Core Desire</p>
                <p className="text-sm font-medium">{character.coreDesire || 'Not defined'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Biggest Fear</p>
                <p className="text-sm font-medium">{character.bigFear || 'Not defined'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Hidden Secret</p>
                <p className="text-sm font-medium">{character.hiddenSecret || 'Not defined'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Personality */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Personality</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Traits</p>
                <div className="flex flex-wrap gap-1">
                  {personality.traits?.map((trait: string, i: number) => (
                    <Badge key={i} variant="secondary">{trait}</Badge>
                  ))}
                </div>
              </div>
              {personality.flaws?.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Flaws</p>
                  <div className="flex flex-wrap gap-1">
                    {personality.flaws.map((flaw: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-rose-600 border-rose-200">
                        {flaw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Voice Profile */}
          {Object.keys(voiceProfile).length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  Voice Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Speech Style</p>
                    <p>{voiceProfile.speechStyle || 'Standard'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Vocabulary Level</p>
                    <p>{voiceProfile.vocabularyLevel || 'Standard'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Emotional Expression</p>
                    <p>{voiceProfile.emotionalExpression?.description || voiceProfile.emotionalExpression || 'Normal'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Dialogue Style</p>
                    <p>{voiceProfile.dialogueStyle || 'Standard'}</p>
                  </div>
                </div>
                {voiceProfile.sampleDialogues?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-muted-foreground">Sample Dialogue</p>
                    {voiceProfile.sampleDialogues.slice(0, 2).map((sample: { situation: string; dialogue: string }, i: number) => (
                      <div key={i} className="p-2 bg-muted rounded text-sm">
                        <p className="text-xs text-muted-foreground mb-1">{sample.situation}:</p>
                        <p className="italic">"{sample.dialogue}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Character Arc */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                Character Arc
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">Start State</p>
                  <p className="text-sm">{character.startState || 'Not defined'}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-xs text-amber-600 mb-1">Growth Arc</p>
                  <p className="text-sm">{character.growthArc || 'Not defined'}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600 mb-1">End State</p>
                  <p className="text-sm">{character.endState || 'Not defined'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emotional Memory */}
          {emotionalMemory.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Heart className="h-4 w-4 text-rose-500" />
                  Emotional Memory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {emotionalMemory.map((memory: { event: string; impact: string; intensity: number }, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-2 bg-muted rounded">
                    <div className="text-lg">💥</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{memory.event}</p>
                      <p className="text-xs text-muted-foreground">{memory.impact}</p>
                    </div>
                    <Badge variant="outline">Intensity: {memory.intensity}/10</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Backstory */}
          {character.backstory && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4 text-indigo-500" />
                  Backstory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{character.backstory}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 4.10 World Tab

```typescript
// src/components/tabs/WorldTab.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Map, Sparkles, BookOpen, Users, Clock, Shield, 
  Zap, TreePine, Building, Compass, Filter
} from 'lucide-react';

interface WorldElement {
  id: string;
  type: string;
  name: string;
  description: string;
  details: string | null;
  rules: string | null;
  history: string | null;
  importance: string;
  introducedInBook: number | null;
  isPublic: boolean;
}

interface WorldTabProps {
  series: {
    worldName: string | null;
    worldDescription: string | null;
    worldRules: string | null;
    worldLimits: string | null;
    worldElements: WorldElement[];
  };
}

const typeIcons: Record<string, React.ReactNode> = {
  location: <Map className="h-4 w-4" />,
  item: <Sparkles className="h-4 w-4" />,
  lore: <BookOpen className="h-4 w-4" />,
  magic: <Zap className="h-4 w-4" />,
  culture: <Users className="h-4 w-4" />,
  history: <Clock className="h-4 w-4" />,
  organization: <Building className="h-4 w-4" />,
  creature: <TreePine className="h-4 w-4" />,
};

const typeColors: Record<string, string> = {
  location: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  item: 'bg-amber-100 text-amber-800 border-amber-200',
  lore: 'bg-purple-100 text-purple-800 border-purple-200',
  magic: 'bg-blue-100 text-blue-800 border-blue-200',
  culture: 'bg-pink-100 text-pink-800 border-pink-200',
  history: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  organization: 'bg-slate-100 text-slate-800 border-slate-200',
  creature: 'bg-green-100 text-green-800 border-green-200',
};

const importanceColors: Record<string, string> = {
  critical: 'bg-red-500',
  major: 'bg-orange-500',
  moderate: 'bg-yellow-500',
  minor: 'bg-gray-400',
};

export default function WorldTab({ series }: WorldTabProps) {
  const [selectedElement, setSelectedElement] = useState<WorldElement | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const parseJson = (json: string | null, fallback: unknown = {}) => {
    if (!json) return fallback;
    try {
      return JSON.parse(json);
    } catch {
      return fallback;
    }
  };

  const worldRules = parseJson(series.worldRules, { possible: [], impossible: [], limitations: [] });
  const worldLimits = parseJson(series.worldLimits, []);

  // Group elements by type
  const elementTypes = [...new Set(series.worldElements.map(e => e.type))];
  
  // Filter elements
  const filteredElements = series.worldElements.filter(element => {
    const matchesType = filterType === 'all' || element.type === filterType;
    const matchesSearch = !searchQuery || 
      element.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      element.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Group filtered elements by type
  const groupedElements = filteredElements.reduce((acc, element) => {
    const type = element.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(element);
    return acc;
  }, {} as Record<string, WorldElement[]>);

  return (
    <div className="space-y-6">
      {/* World Overview Card */}
      <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-indigo-500" />
            {series.worldName || 'World Overview'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {series.worldDescription || 'World description not yet generated'}
          </p>

          {/* World Rules */}
          <div className="grid md:grid-cols-2 gap-4">
            {worldRules.possible?.length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" /> What IS Possible
                </h4>
                <ul className="text-sm text-green-700 space-y-1">
                  {worldRules.possible.map((rule: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(worldRules.impossible?.length > 0 || worldLimits.length > 0) && (
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4" /> What is IMPOSSIBLE
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {worldRules.impossible?.map((rule: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-500">✕</span>
                      {rule}
                    </li>
                  ))}
                  {worldLimits?.map((limit: string, i: number) => (
                    <li key={`limit-${i}`} className="flex items-start gap-2">
                      <span className="text-red-500">⚠</span>
                      {limit}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search world elements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Compass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-1">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
            >
              All
            </Button>
            {elementTypes.map((type) => (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType(type)}
                className="capitalize"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Elements by Type */}
      {Object.entries(groupedElements).map(([type, elements]) => (
        <div key={type} className="space-y-3">
          <h3 className="text-lg font-semibold capitalize flex items-center gap-2">
            {typeIcons[type]}
            {type}s ({elements.length})
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {elements.map((element) => (
              <Card 
                key={element.id}
                className="cursor-pointer hover:shadow-md transition-all"
                onClick={() => setSelectedElement(element)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {typeIcons[element.type]}
                      {element.name}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${importanceColors[element.importance]}`} 
                           title={`${element.importance} importance`} />
                    </div>
                  </div>
                  <Badge className={`${typeColors[element.type]} w-fit capitalize`}>
                    {element.type}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {element.description}
                  </p>
                  {element.introducedInBook && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Introduced in Book {element.introducedInBook}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {filteredElements.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No world elements found</p>
          </CardContent>
        </Card>
      )}

      {/* Element Detail Dialog */}
      <Dialog open={!!selectedElement} onOpenChange={() => setSelectedElement(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedElement && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    typeColors[selectedElement.type]?.split(' ')[0] || 'bg-gray-100'
                  }`}>
                    {typeIcons[selectedElement.type]}
                  </div>
                  {selectedElement.name}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={`${typeColors[selectedElement.type]} capitalize`}>
                    {selectedElement.type}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {selectedElement.importance} importance
                  </Badge>
                  {selectedElement.introducedInBook && (
                    <Badge variant="secondary">
                      Book {selectedElement.introducedInBook}
                    </Badge>
                  )}
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedElement.description}</p>
                </div>

                {selectedElement.details && (
                  <div>
                    <h4 className="font-medium mb-2">Details</h4>
                    <div className="p-4 bg-muted rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(JSON.parse(selectedElement.details), null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedElement.rules && (
                  <div>
                    <h4 className="font-medium mb-2">Rules & Constraints</h4>
                    <p className="text-muted-foreground">{selectedElement.rules}</p>
                  </div>
                )}

                {selectedElement.history && (
                  <div>
                    <h4 className="font-medium mb-2">History</h4>
                    <p className="text-muted-foreground">{selectedElement.history}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

## 4.11 Plots Tab

```typescript
// src/components/tabs/PlotsTab.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { 
  GitBranch, Eye, Sparkles, Heart, AlertTriangle, 
  Clock, BookOpen, ChevronRight, Circle, CheckCircle
} from 'lucide-react';

interface PlotThread {
  id: string;
  name: string;
  description: string;
  type: string;
  introducedInBook: number;
  resolvedInBook: number | null;
  status: string;
  keyEvents: string | null;
  secrets: string | null;
  clues: string | null;
  relatedCharacters: string | null;
}

interface PlotsTabProps {
  series: {
    targetBooks: number;
    plotThreads: PlotThread[];
  };
}

const typeIcons: Record<string, React.ReactNode> = {
  main: <GitBranch className="h-4 w-4" />,
  subplot: <BookOpen className="h-4 w-4" />,
  mystery: <Eye className="h-4 w-4" />,
  romance: <Heart className="h-4 w-4" />,
  conflict: <AlertTriangle className="h-4 w-4" />,
};

const typeColors: Record<string, string> = {
  main: 'bg-amber-100 text-amber-800 border-amber-200',
  subplot: 'bg-blue-100 text-blue-800 border-blue-200',
  mystery: 'bg-purple-100 text-purple-800 border-purple-200',
  romance: 'bg-pink-100 text-pink-800 border-pink-200',
  conflict: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons: Record<string, React.ReactNode> = {
  setup: <Circle className="h-4 w-4" />,
  active: <Sparkles className="h-4 w-4" />,
  dormant: <Clock className="h-4 w-4" />,
  resolved: <CheckCircle className="h-4 w-4" />,
};

const statusColors: Record<string, string> = {
  setup: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  dormant: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-blue-100 text-blue-800',
};

export default function PlotsTab({ series }: PlotsTabProps) {
  const [selectedThread, setSelectedThread] = useState<PlotThread | null>(null);

  const parseJson = (json: string | null, fallback: unknown = []) => {
    if (!json) return fallback;
    try {
      return JSON.parse(json);
    } catch {
      return fallback;
    }
  };

  // Group threads by type
  const groupedThreads = series.plotThreads.reduce((acc, thread) => {
    const type = thread.type || 'subplot';
    if (!acc[type]) acc[type] = [];
    acc[type].push(thread);
    return acc;
  }, {} as Record<string, PlotThread[]>);

  // Calculate thread progress
  const getThreadProgress = (thread: PlotThread) => {
    if (thread.status === 'resolved') return 100;
    if (!thread.resolvedInBook) return 0;
    const startBook = thread.introducedInBook;
    const endBook = thread.resolvedInBook;
    const totalBooks = endBook - startBook + 1;
    return Math.round(((series.targetBooks - startBook) / totalBooks) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold">{groupedThreads.main?.length || 0}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Main Plots</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold">{groupedThreads.mystery?.length || 0}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Mysteries</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              <span className="text-2xl font-bold">{groupedThreads.romance?.length || 0}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Romance Threads</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">
                {series.plotThreads.filter(t => t.status === 'resolved').length}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Thread Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Book Headers */}
              <div className="flex border-b pb-2 mb-4">
                <div className="w-40 shrink-0 text-sm font-medium">Thread</div>
                {Array.from({ length: series.targetBooks }, (_, i) => (
                  <div key={i} className="flex-1 text-center text-sm font-medium">
                    Book {i + 1}
                  </div>
                ))}
              </div>

              {/* Thread Rows */}
              {series.plotThreads.map((thread) => {
                const progress = getThreadProgress(thread);
                return (
                  <div key={thread.id} className="flex items-center py-2 border-b last:border-0">
                    <div className="w-40 shrink-0">
                      <button
                        className="text-sm text-left hover:text-primary truncate w-full"
                        onClick={() => setSelectedThread(thread)}
                      >
                        {thread.name}
                      </button>
                    </div>
                    {Array.from({ length: series.targetBooks }, (_, i) => {
                      const bookNum = i + 1;
                      const isIntro = bookNum === thread.introducedInBook;
                      const isResolved = bookNum === thread.resolvedInBook;
                      const isActive = bookNum >= thread.introducedInBook && 
                                      (!thread.resolvedInBook || bookNum <= thread.resolvedInBook);
                      
                      return (
                        <div key={i} className="flex-1 flex justify-center">
                          <div className={`w-full h-6 mx-1 rounded flex items-center justify-center text-xs
                            ${isIntro ? 'bg-green-200 text-green-800' : ''}
                            ${isResolved ? 'bg-blue-200 text-blue-800' : ''}
                            ${isActive && !isIntro && !isResolved ? 'bg-amber-100' : ''}
                          `}>
                            {isIntro && '▶'}
                            {isResolved && '◀'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Threads by Type */}
      {Object.entries(groupedThreads).map(([type, threads]) => (
        <div key={type} className="space-y-3">
          <h3 className="text-lg font-semibold capitalize flex items-center gap-2">
            {typeIcons[type]}
            {type} Threads ({threads.length})
          </h3>

          <div className="grid gap-4">
            {threads.map((thread) => {
              const keyEvents = parseJson(thread.keyEvents, []);
              const progress = getThreadProgress(thread);

              return (
                <Card 
                  key={thread.id}
                  className="cursor-pointer hover:shadow-md transition-all"
                  onClick={() => setSelectedThread(thread)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          {thread.name}
                          <Badge className={`${statusColors[thread.status]} text-xs`}>
                            {statusIcons[thread.status]}
                            <span className="ml-1 capitalize">{thread.status}</span>
                          </Badge>
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Books {thread.introducedInBook} → {thread.resolvedInBook || 'ongoing'}
                        </p>
                      </div>
                      <Badge className={`${typeColors[type]} capitalize`}>
                        {thread.type}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {thread.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Thread Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Key Events Preview */}
                    {keyEvents.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Key Events:</p>
                        <div className="flex flex-wrap gap-1">
                          {keyEvents.slice(0, 3).map((event: { book: number; event: string }, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              Book {event.book}: {event.event?.substring(0, 20)}...
                            </Badge>
                          ))}
                          {keyEvents.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{keyEvents.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {series.plotThreads.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No plot threads generated yet</p>
          </CardContent>
        </Card>
      )}

      {/* Thread Detail Dialog */}
      <Dialog open={!!selectedThread} onOpenChange={() => setSelectedThread(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedThread && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    typeColors[selectedThread.type]?.split(' ')[0] || 'bg-gray-100'
                  }`}>
                    {typeIcons[selectedThread.type]}
                  </div>
                  {selectedThread.name}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={`${typeColors[selectedThread.type]} capitalize`}>
                    {selectedThread.type}
                  </Badge>
                  <Badge className={`${statusColors[selectedThread.status]} capitalize`}>
                    {selectedThread.status}
                  </Badge>
                  <Badge variant="outline">
                    Books {selectedThread.introducedInBook} → {selectedThread.resolvedInBook || 'ongoing'}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedThread.description}</p>
                </div>

                {/* Key Events */}
                {selectedThread.keyEvents && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" /> Key Events
                    </h4>
                    <div className="space-y-2">
                      {parseJson(selectedThread.keyEvents, []).map((event: { book: number; event: string }, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-muted rounded">
                          <Badge variant="outline">Book {event.book}</Badge>
                          <p className="text-sm flex-1">{event.event}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Secrets */}
                {selectedThread.secrets && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Eye className="h-4 w-4" /> Secrets
                    </h4>
                    <div className="space-y-2">
                      {parseJson(selectedThread.secrets, []).map((secret: { hint: string; revealedInBook: number; revelation: string }, i: number) => (
                        <div key={i} className="p-3 bg-purple-50 rounded border border-purple-100">
                          <p className="text-sm font-medium text-purple-800">{secret.hint}</p>
                          <p className="text-xs text-purple-600 mt-1">
                            Revealed in Book {secret.revealedInBook}: {secret.revelation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Characters */}
                {selectedThread.relatedCharacters && (
                  <div>
                    <h4 className="font-medium mb-2">Related Characters</h4>
                    <div className="flex flex-wrap gap-2">
                      {parseJson(selectedThread.relatedCharacters, []).map((charId: string, i: number) => (
                        <Badge key={i} variant="secondary">{charId}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

## 4.12 Memory Tab

```typescript
// src/components/tabs/MemoryTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, BookOpen, Users, Eye, AlertTriangle, 
  CheckCircle, Clock, Database, RefreshCw
} from 'lucide-react';

interface MemoryTabProps {
  series: {
    id: string;
    canonLog: {
      worldFacts: string | null;
      characterFacts: string | null;
      eventFacts: string | null;
      rulesFacts: string | null;
      logEntries: Array<{
        id: string;
        category: string;
        fact: string;
        source: string | null;
        cannotChange: boolean;
      }>;
    } | null;
    relationshipLog: {
      entries: Array<{
        id: string;
        characterAName: string;
        characterBName: string;
        relationshipType: string;
        trustLevel: number;
        tensionLevel: number;
        status: string;
      }>;
    } | null;
    mysteryLog: {
      secrets: Array<{
        id: string;
        title: string;
        description: string;
        status: string;
        revealedInBook: number | null;
      }>;
      clues: Array<{
        id: string;
        description: string;
        plantedInBook: number;
        isObvious: boolean;
      }>;
    } | null;
  };
}

export default function MemoryTab({ series }: MemoryTabProps) {
  const [activeMemoryTab, setActiveMemoryTab] = useState('canon');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const parseJson = (json: string | null, fallback: unknown = []) => {
    if (!json) return fallback;
    try {
      return JSON.parse(json);
    } catch {
      return fallback;
    }
  };

  const refreshMemory = async () => {
    setIsRefreshing(true);
    // Could fetch latest memory from API
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const worldFacts = parseJson(series.canonLog?.worldFacts, []);
  const characterFacts = parseJson(series.canonLog?.characterFacts, []);
  const eventFacts = parseJson(series.canonLog?.eventFacts, []);
  const rulesFacts = parseJson(series.canonLog?.rulesFacts, []);

  return (
    <div className="space-y-6">
      {/* Memory System Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          <h2 className="text-lg font-semibold">Memory System</h2>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={refreshMemory}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Memory Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold text-purple-700">
                {series.canonLog?.logEntries?.length || 0}
              </span>
            </div>
            <p className="text-sm text-purple-600 mt-1">Canon Facts</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-700">
                {series.relationshipLog?.entries?.length || 0}
              </span>
            </div>
            <p className="text-sm text-blue-600 mt-1">Relationships</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-amber-600" />
              <span className="text-2xl font-bold text-amber-700">
                {series.mysteryLog?.secrets?.length || 0}
              </span>
            </div>
            <p className="text-sm text-amber-600 mt-1">Secrets</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-700">
                {series.mysteryLog?.clues?.length || 0}
              </span>
            </div>
            <p className="text-sm text-green-600 mt-1">Clues Planted</p>
          </CardContent>
        </Card>
      </div>

      {/* Memory Tabs */}
      <Tabs value={activeMemoryTab} onValueChange={setActiveMemoryTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="canon">
            <Database className="h-4 w-4 mr-1" /> Canon Log
          </TabsTrigger>
          <TabsTrigger value="relationships">
            <Users className="h-4 w-4 mr-1" /> Relationships
          </TabsTrigger>
          <TabsTrigger value="mysteries">
            <Eye className="h-4 w-4 mr-1" /> Mysteries
          </TabsTrigger>
          <TabsTrigger value="entries">
            <BookOpen className="h-4 w-4 mr-1" /> All Entries
          </TabsTrigger>
        </TabsList>

        {/* Canon Log Tab */}
        <TabsContent value="canon" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* World Facts */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="h-4 w-4 text-emerald-500" />
                  World Facts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {worldFacts.length > 0 ? worldFacts.map((fact: { fact: string; establishedIn: string }, i: number) => (
                      <div key={i} className="p-3 bg-emerald-50 rounded border border-emerald-100">
                        <p className="text-sm">{fact.fact}</p>
                        <p className="text-xs text-emerald-600 mt-1">
                          Source: {fact.establishedIn}
                        </p>
                      </div>
                    )) : (
                      <p className="text-muted-foreground text-sm">No world facts recorded</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Character Facts */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  Character Facts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {characterFacts.length > 0 ? characterFacts.map((fact: { fact: string; establishedIn: string; character?: string }, i: number) => (
                      <div key={i} className="p-3 bg-blue-50 rounded border border-blue-100">
                        {fact.character && (
                          <Badge variant="outline" className="mb-1">{fact.character}</Badge>
                        )}
                        <p className="text-sm">{fact.fact}</p>
                        <p className="text-xs text-blue-600 mt-1">
                          Source: {fact.establishedIn}
                        </p>
                      </div>
                    )) : (
                      <p className="text-muted-foreground text-sm">No character facts recorded</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Event Facts */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  Event Facts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {eventFacts.length > 0 ? eventFacts.map((fact: { fact: string; establishedIn: string }, i: number) => (
                      <div key={i} className="p-3 bg-purple-50 rounded border border-purple-100">
                        <p className="text-sm">{fact.fact}</p>
                        <p className="text-xs text-purple-600 mt-1">
                          Source: {fact.establishedIn}
                        </p>
                      </div>
                    )) : (
                      <p className="text-muted-foreground text-sm">No event facts recorded</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Rules Facts */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Rules & Limitations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {rulesFacts.length > 0 ? rulesFacts.map((fact: { fact: string; establishedIn: string }, i: number) => (
                      <div key={i} className="p-3 bg-amber-50 rounded border border-amber-100">
                        <p className="text-sm">{fact.fact}</p>
                        <p className="text-xs text-amber-600 mt-1">
                          LOCKED - Cannot be changed
                        </p>
                      </div>
                    )) : (
                      <p className="text-muted-foreground text-sm">No rules facts recorded</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Relationships Tab */}
        <TabsContent value="relationships">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Relationship Dynamics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {series.relationshipLog?.entries?.map((entry) => (
                  <Card key={entry.id} className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{entry.characterAName}</span>
                          <span className="text-muted-foreground">↔</span>
                          <span className="font-medium">{entry.characterBName}</span>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {entry.relationshipType}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Trust Level</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded">
                              <div 
                                className="h-full bg-green-500 rounded"
                                style={{ width: `${entry.trustLevel}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{entry.trustLevel}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Tension Level</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded">
                              <div 
                                className="h-full bg-red-500 rounded"
                                style={{ width: `${entry.tensionLevel}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{entry.tensionLevel}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <Badge className={`
                          ${entry.status === 'friendly' ? 'bg-green-100 text-green-800' : ''}
                          ${entry.status === 'hostile' ? 'bg-red-100 text-red-800' : ''}
                          ${entry.status === 'romantic' ? 'bg-pink-100 text-pink-800' : ''}
                          ${entry.status === 'strained' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${entry.status === 'neutral' ? 'bg-gray-100 text-gray-800' : ''}
                        `}>
                          {entry.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )) || <p className="text-muted-foreground">No relationships tracked</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mysteries Tab */}
        <TabsContent value="mysteries">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Secrets */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4 text-amber-500" />
                  Secrets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {series.mysteryLog?.secrets?.map((secret) => (
                      <div key={secret.id} className="p-3 border rounded">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{secret.title}</h4>
                          <Badge variant={secret.status === 'hidden' ? 'secondary' : 'default'}>
                            {secret.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {secret.description}
                        </p>
                        {secret.revealedInBook && (
                          <p className="text-xs text-amber-600 mt-2">
                            Revealed in Book {secret.revealedInBook}
                          </p>
                        )}
                      </div>
                    )) || <p className="text-muted-foreground text-sm">No secrets tracked</p>}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Clues */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Clues Planted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {series.mysteryLog?.clues?.map((clue) => (
                      <div key={clue.id} className="p-3 bg-muted rounded">
                        <div className="flex items-start justify-between">
                          <p className="text-sm">{clue.description}</p>
                          <Badge variant={clue.isObvious ? 'default' : 'outline'}>
                            {clue.isObvious ? 'Obvious' : 'Subtle'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Planted in Book {clue.plantedInBook}
                        </p>
                      </div>
                    )) || <p className="text-muted-foreground text-sm">No clues tracked</p>}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* All Entries Tab */}
        <TabsContent value="entries">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">All Canon Log Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {series.canonLog?.logEntries?.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 p-3 bg-muted rounded">
                      <Badge 
                        variant="outline"
                        className={`
                          ${entry.category === 'world' ? 'border-emerald-500 text-emerald-700' : ''}
                          ${entry.category === 'character' ? 'border-blue-500 text-blue-700' : ''}
                          ${entry.category === 'event' ? 'border-purple-500 text-purple-700' : ''}
                          ${entry.category === 'rule' ? 'border-amber-500 text-amber-700' : ''}
                        `}
                      >
                        {entry.category}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm">{entry.fact}</p>
                        {entry.source && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Source: {entry.source}
                          </p>
                        )}
                      </div>
                      {entry.cannotChange && (
                        <Badge variant="secondary" className="text-xs">LOCKED</Badge>
                      )}
                    </div>
                  )) || <p className="text-muted-foreground">No entries recorded</p>}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 4.13 Timeline Tab

```typescript
// src/components/tabs/TimelineTab.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Star, MapPin, Users, Zap } from 'lucide-react';

interface TimelineEvent {
  id: string;
  eventName: string;
  description: string;
  eventType: string;
  inWorldDate: string | null;
  isMajor: boolean;
  bookId: string | null;
  chapterId: string | null;
}

interface TimelineTabProps {
  series: {
    timeline: TimelineEvent[];
    books: Array<{ id: string; bookNumber: number; title: string }>;
  };
}

const eventTypeIcons: Record<string, React.ReactNode> = {
  plot: <Zap className="h-4 w-4" />,
  character: <Users className="h-4 w-4" />,
  world: <MapPin className="h-4 w-4" />,
  background: <Clock className="h-4 w-4" />,
};

const eventTypeColors: Record<string, string> = {
  plot: 'bg-amber-100 text-amber-800 border-amber-200',
  character: 'bg-blue-100 text-blue-800 border-blue-200',
  world: 'bg-green-100 text-green-800 border-green-200',
  background: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function TimelineTab({ series }: TimelineTabProps) {
  // Group events by book
  const eventsByBook = series.timeline.reduce((acc, event) => {
    const book = series.books.find(b => b.id === event.bookId);
    const bookKey = book ? `book-${book.bookNumber}` : 'series-level';
    
    if (!acc[bookKey]) {
      acc[bookKey] = {
        book: book || null,
        events: []
      };
    }
    acc[bookKey].events.push(event);
    return acc;
  }, {} as Record<string, { book: { bookNumber: number; title: string } | null; events: TimelineEvent[] }>);

  // Sort books
  const sortedBooks = Object.entries(eventsByBook).sort(([a], [b]) => {
    if (a === 'series-level') return -1;
    if (b === 'series-level') return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Series Timeline</h2>
        <Badge variant="secondary">{series.timeline.length} Events</Badge>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

        <ScrollArea className="h-[600px]">
          <div className="space-y-8 pl-12 pr-4">
            {sortedBooks.map(([key, { book, events }]) => (
              <div key={key}>
                {/* Book Header */}
                <div className="relative mb-4">
                  <div className="absolute -left-10 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Star className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">
                    {book ? `Book ${book.bookNumber}: ${book.title}` : 'Series-Level Events'}
                  </h3>
                </div>

                {/* Events in this book */}
                <div className="space-y-3">
                  {events.map((event, index) => (
                    <div key={event.id} className="relative">
                      {/* Event Dot */}
                      <div className={`absolute -left-8 w-4 h-4 rounded-full border-2 border-background ${
                        event.isMajor ? 'bg-primary' : 'bg-muted-foreground'
                      }`} />

                      <Card className={`${event.isMajor ? 'border-primary/50' : ''}`}>
                        <CardContent className="py-3">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium flex items-center gap-2">
                              {event.eventName}
                              {event.isMajor && (
                                <Badge variant="default" className="text-xs">
                                  Major
                                </Badge>
                              )}
                            </h4>
                            <Badge className={`${eventTypeColors[event.eventType]} capitalize`}>
                              {eventTypeIcons[event.eventType]}
                              <span className="ml-1">{event.eventType}</span>
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {event.description}
                          </p>

                          {event.inWorldDate && (
                            <p className="text-xs text-muted-foreground mt-2">
                              In-World Date: {event.inWorldDate}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {series.timeline.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No timeline events recorded yet</p>
                  <p className="text-sm text-muted-foreground">
                    Events will be added as content is generated
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
```

---

## 4.14 Book View

```typescript
// src/components/views/BookView.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSeriesStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, BookOpen, Layers, FileText, Brain,
  Wand2, ChevronRight, CheckCircle, AlertCircle
} from 'lucide-react';
import TensionCurveChart from '@/components/TensionCurveChart';

interface BookData {
  id: string;
  bookNumber: number;
  title: string;
  synopsis: string | null;
  status: string;
  seriesStage: string | null;
  bookPurpose: string | null;
  coreTheme: string | null;
  externalConflict: string | null;
  internalConflict: string | null;
  stakesLevel: string | null;
  wordCount: number;
  chapterCount: number;
  generationProgress: number;
  chapters: Array<{
    id: string;
    chapterNumber: number;
    title: string | null;
    synopsis: string | null;
    tensionLevel: number;
    hookType: string | null;
    hookDescription: string | null;
    isGenerated: boolean;
    wordCount: number;
  }>;
  tensionProfile: {
    startTension: number;
    incitingIncident: number | null;
    firstComplication: number | null;
    midpointTension: number | null;
    falseHope: number | null;
    climaxTension: number | null;
    resolutionTension: number | null;
  } | null;
  bookMemory: {
    emotionalMemories: string | null;
    compressedSummary: string | null;
  } | null;
}

export default function BookView() {
  const { selectedBookId, setCurrentView, selectSeries, selectedSeriesId } = useSeriesStore();
  const [book, setBook] = useState<BookData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingChapter, setGeneratingChapter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('chapters');

  const fetchBook = useCallback(async () => {
    if (!selectedBookId) return;
    
    try {
      const response = await fetch(`/api/books/${selectedBookId}`);
      const data = await response.json();
      setBook(data);
    } catch (error) {
      console.error('Failed to fetch book:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBookId]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  const generateChapter = async (chapterId: string, chapterNumber: number) => {
    if (!selectedSeriesId || !selectedBookId) return;
    
    setGeneratingChapter(chapterId);
    try {
      const response = await fetch('/api/chapters/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          seriesId: selectedSeriesId, 
          bookNumber: book?.bookNumber,
          chapterNumber 
        }),
      });
      
      // Handle streaming response
      const reader = response.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          // Process progress updates
          decoder.decode(value);
        }
      }
      
      // Refresh book data
      await fetchBook();
    } finally {
      setGeneratingChapter(null);
    }
  };

  if (isLoading || !book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading book...</div>
      </div>
    );
  }

  // Build tension points for chart
  const tensionPoints = book.chapters.map(ch => ({
    chapterNumber: ch.chapterNumber,
    tensionLevel: ch.tensionLevel,
    tensionGoal: 'maintain',
    description: ch.synopsis || ''
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setCurrentView('series')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                <span className="text-amber-500">Book {book.bookNumber}:</span> {book.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{book.wordCount.toLocaleString()} words</span>
                <span>•</span>
                <span>{book.chapterCount} chapters</span>
                {book.stakesLevel && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="capitalize">{book.stakesLevel} stakes</Badge>
                  </>
                )}
              </div>
            </div>
            <Badge variant={book.status === 'complete' ? 'default' : 'secondary'}>
              {book.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Book Overview */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* Synopsis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Synopsis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {book.synopsis || 'No synopsis generated yet.'}
              </p>
            </CardContent>
          </Card>

          {/* Book Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Book Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {book.bookPurpose && (
                <div>
                  <p className="text-xs text-muted-foreground">Purpose</p>
                  <p className="text-sm">{book.bookPurpose}</p>
                </div>
              )}
              {book.coreTheme && (
                <div>
                  <p className="text-xs text-muted-foreground">Core Theme</p>
                  <p className="text-sm">{book.coreTheme}</p>
                </div>
              )}
              {book.externalConflict && (
                <div>
                  <p className="text-xs text-muted-foreground">External Conflict</p>
                  <p className="text-sm">{book.externalConflict}</p>
                </div>
              )}
              {book.internalConflict && (
                <div>
                  <p className="text-xs text-muted-foreground">Internal Conflict</p>
                  <p className="text-sm">{book.internalConflict}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Generation Progress */}
        {book.generationProgress > 0 && book.generationProgress < 100 && (
          <Card className="mb-6">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Generation Progress</span>
                <Progress value={book.generationProgress} className="flex-1" />
                <span className="text-sm text-muted-foreground">
                  {Math.round(book.generationProgress)}%
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="chapters">
              <FileText className="h-4 w-4 mr-1" /> Chapters
            </TabsTrigger>
            <TabsTrigger value="tension">
              <Layers className="h-4 w-4 mr-1" /> Tension Curve
            </TabsTrigger>
            <TabsTrigger value="memory">
              <Brain className="h-4 w-4 mr-1" /> Book Memory
            </TabsTrigger>
          </TabsList>

          {/* Chapters Tab */}
          <TabsContent value="chapters">
            <div className="grid gap-3">
              {book.chapters.map((chapter) => (
                <Card 
                  key={chapter.id}
                  className="hover:shadow-md transition-all"
                >
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            Chapter {chapter.chapterNumber}
                          </span>
                          {chapter.title && (
                            <span className="text-muted-foreground">
                              : {chapter.title}
                            </span>
                          )}
                          {chapter.isGenerated ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {chapter.synopsis || 'No synopsis'}
                        </p>

                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            Tension: {chapter.tensionLevel}/10
                          </Badge>
                          {chapter.hookType && (
                            <Badge variant="outline" className="text-xs capitalize">
                              {chapter.hookType} hook
                            </Badge>
                          )}
                          {chapter.wordCount > 0 && (
                            <span>{chapter.wordCount} words</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {!chapter.isGenerated && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => generateChapter(chapter.id, chapter.chapterNumber)}
                            disabled={generatingChapter === chapter.id}
                          >
                            {generatingChapter === chapter.id ? (
                              <Wand2 className="h-4 w-4 animate-pulse" />
                            ) : (
                              <Wand2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        {chapter.isGenerated && (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => {
                              // View chapter
                            }}
                          >
                            Read <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tension Curve Tab */}
          <TabsContent value="tension">
            <div className="space-y-6">
              <TensionCurveChart 
                tensionPoints={tensionPoints}
              />

              {/* Tension Profile Details */}
              {book.tensionProfile && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tension Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {book.tensionProfile.startTension}
                        </div>
                        <p className="text-xs text-muted-foreground">Start</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">
                          {book.tensionProfile.midpointTension || '-'}
                        </div>
                        <p className="text-xs text-muted-foreground">Midpoint</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {book.tensionProfile.climaxTension || '-'}
                        </div>
                        <p className="text-xs text-muted-foreground">Climax</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {book.tensionProfile.resolutionTension || '-'}
                        </div>
                        <p className="text-xs text-muted-foreground">Resolution</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Memory Tab */}
          <TabsContent value="memory">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Emotional Memories</CardTitle>
                </CardHeader>
                <CardContent>
                  {book.bookMemory?.emotionalMemories ? (
                    <pre className="text-sm whitespace-pre-wrap">
                      {JSON.stringify(JSON.parse(book.bookMemory.emotionalMemories), null, 2)}
                    </pre>
                  ) : (
                    <p className="text-muted-foreground">No emotional memories recorded</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Compressed Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {book.bookMemory?.compressedSummary ? (
                    <pre className="text-sm whitespace-pre-wrap">
                      {JSON.stringify(JSON.parse(book.bookMemory.compressedSummary), null, 2)}
                    </pre>
                  ) : (
                    <p className="text-muted-foreground">No compressed summary yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
```

---

## 4.15 Generation Progress Overlay

```typescript
// src/components/GenerationProgressOverlay.tsx
'use client';

import { useSeriesStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Wand2, CheckCircle, BookOpen, Users, Globe, GitBranch } from 'lucide-react';

export default function GenerationProgressOverlay() {
  const { generationProgress } = useSeriesStore();

  if (!generationProgress.isGenerating) return null;

  const steps = [
    { threshold: 5, label: 'Series Bible', icon: <BookOpen className="h-4 w-4" /> },
    { threshold: 15, label: 'Voice Profiles', icon: <Users className="h-4 w-4" /> },
    { threshold: 25, label: 'Memory System', icon: <Globe className="h-4 w-4" /> },
    { threshold: 50, label: 'Book Outlines', icon: <GitBranch className="h-4 w-4" /> },
    { threshold: 80, label: 'Tension Profiles', icon: <Wand2 className="h-4 w-4" /> },
    { threshold: 100, label: 'Complete', icon: <CheckCircle className="h-4 w-4" /> },
  ];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
              <Wand2 className="h-8 w-8 text-amber-500 animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Creating Your Series</h3>
            <p className="text-muted-foreground">{generationProgress.step}</p>
          </div>

          <Progress value={generationProgress.progress} className="mb-6" />

          <div className="space-y-2">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`flex items-center gap-3 text-sm ${
                  generationProgress.progress >= step.threshold 
                    ? 'text-green-600' 
                    : 'text-muted-foreground'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  generationProgress.progress >= step.threshold 
                    ? 'bg-green-100' 
                    : 'bg-muted'
                }`}>
                  {generationProgress.progress >= step.threshold ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span>{step.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

This completes the comprehensive documentation for the YA Series Generator, including:

1. ✅ **Complete Database Schema** with ERD and Prisma models (25+ models)
2. ✅ **Full API Architecture** with all endpoints
3. ✅ **Complete Frontend Components**:
   - Zustand Store
   - Series List View
   - Create Series Dialog
   - Series Detail View
   - All Tabs: Overview, Characters, World, Plots, Memory, Timeline
   - Book View with chapters and tension curve
   - Generation Progress Overlay
   - Tension Curve Chart visualization

The system is now complete with:
- **Memory System** (Canon, Relationships, Mysteries)
- **Narrative Intelligence** (Tension, Hooks, Foreshadowing, Voice, Callbacks)
- **Complete UI** for managing and viewing all generated content
