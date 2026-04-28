# YA Series Generator - Memory Tab Implementation Plan

## Executive Summary

The Memory Tab is the **core continuity system** for the YA Series Generator. It provides visibility into the three-layer memory architecture that ensures story consistency across all books in a series. This document outlines the complete implementation plan, architecture, and future enhancements.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Database Schema](#2-database-schema)
3. [API Layer](#3-api-layer)
4. [Frontend Components](#4-frontend-components)
5. [Data Flow](#5-data-flow)
6. [Implementation Checklist](#6-implementation-checklist)
7. [Future Enhancements](#7-future-enhancements)

---

## 1. Architecture Overview

### 1.1 Three-Layer Memory System

```
┌─────────────────────────────────────────────────────────────────┐
│                     MEMORY TAB ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    SERIES BRAIN                          │    │
│  │              (Long-term Memory Layer)                    │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │    │
│  │  │  CanonLog   │  │  Relation   │  │  Mystery    │      │    │
│  │  │             │  │  shipLog    │  │  Log        │      │    │
│  │  │ Immutable   │  │             │  │             │      │    │
│  │  │ Facts       │  │ Trust/      │  │ Secrets &   │      │    │
│  │  │             │  │ Tension     │  │ Clues       │      │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   NARRATIVE INTELLIGENCE                 │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │    │
│  │  │Fore-shadow  │  │  Callbacks  │  │  Emotional  │      │    │
│  │  │  ing        │  │             │  │  Memory     │      │    │
│  │  │             │  │ Original    │  │             │      │    │
│  │  │ Setup→Payoff│  │ →Callback   │  │ Trauma Track│      │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Memory Log Types

| Log Type | Purpose | Update Frequency | Mutability |
|----------|---------|------------------|------------|
| **CanonLog** | World facts, rules, events | Once established | **Immutable** |
| **RelationshipLog** | Character dynamics | After key scenes | Mutable |
| **MysteryLog** | Secrets, clues, reveals | After reveals | Mutable |

### 1.3 Key Principles

1. **Nothing Comes From Nowhere** - Every major event must have foreshadowing
2. **Canon Cannot Be Changed** - Established facts are locked
3. **Knowledge States Matter** - Characters can only act on what they know
4. **Relationships Evolve** - Trust and tension change over time

---

## 2. Database Schema

### 2.1 CanonLog Tables

```sql
-- CanonLog: Main container for immutable facts
CanonLog {
  id              String   @id
  seriesId        String   @unique
  
  -- JSON fields for quick access
  worldFacts      String?  -- JSON array
  characterFacts  String?  -- JSON array
  eventFacts      String?  -- JSON array
  rulesFacts      String?  -- JSON array
  
  -- Metadata
  lastUpdated     DateTime @updatedAt
  createdAt       DateTime @default(now())
}

-- CanonLogEntry: Individual immutable facts
CanonLogEntry {
  id              String   @id
  canonLogId      String
  
  category        String   -- world, character, event, rule
  fact            String   -- The actual fact
  source          String?  -- Where established (Book 1, Ch 3)
  cannotChange    Boolean  @default(true)
  
  createdAt       DateTime @default(now())
}
```

### 2.2 RelationshipLog Tables

```sql
-- RelationshipLog: Main container for relationships
RelationshipLog {
  id              String   @id
  seriesId        String   @unique
  relationships   String?  -- JSON summary
  lastUpdated     DateTime @updatedAt
}

-- RelationshipEntry: Individual relationship state
RelationshipEntry {
  id              String   @id
  relationshipLogId String
  
  -- Characters involved
  characterAId    String
  characterBId    String
  characterAName  String   -- Denormalized for display
  characterBName  String
  
  -- Relationship state
  relationshipType String? -- family, friend, enemy, romantic
  trustLevel      Int      @default(50)  -- 0-100
  tensionLevel    Int      @default(0)   -- 0-100
  status          String   @default("neutral")
  
  -- Knowledge asymmetry
  aKnowsAboutB    String?  -- What A knows about B
  bKnowsAboutA    String?  -- What B knows about A
  keyMoments      String?  -- JSON array of key moments
  
  -- Tracking
  currentBook     Int?
  lastUpdated     DateTime @updatedAt
}
```

### 2.3 MysteryLog Tables

```sql
-- MysteryLog: Main container for mysteries
MysteryLog {
  id              String   @id
  seriesId        String   @unique
  activeMysteries String?  -- JSON array
  resolvedMysteries String? -- JSON array
  lastUpdated     DateTime @updatedAt
}

-- Secret: Hidden truths
Secret {
  id              String   @id
  mysteryLogId    String
  
  title           String
  description     String
  
  -- Knowledge tracking
  whoKnows        String?  -- Who knows this secret
  whoDoesntKnow   String?  -- Who doesn't know
  
  -- Reveal planning
  revealedInBook  Int?
  revealedInChapter Int?
  revealMethod    String?
  
  status          String   @default("hidden") -- hidden, partial, revealed
}

-- Clue: Hints planted in story
Clue {
  id              String   @id
  mysteryLogId    String
  secretId        String?  -- Optional link to secret
  
  description     String
  clueType        String   -- dialogue, object, event, description
  
  -- Placement
  plantedInBook   Int
  plantedInChapter Int?
  
  -- Detection
  isObvious       Boolean  @default(false)
  wasNoticed      Boolean  @default(false)
}
```

### 2.4 Foreshadowing Table

```sql
Foreshadowing {
  id              String   @id
  seriesId        String
  
  -- Event being set up
  eventType       String   -- plot_twist, character_death, reveal, etc.
  eventDescription String
  
  -- Setup (the hint)
  setupBook       Int
  setupChapter    Int?
  setupDescription String?
  setupSubtlety   String   @default("subtle") -- subtle, moderate, obvious
  
  -- Payoff (the event)
  payoffBook      Int?
  payoffChapter   Int?
  payoffDescription String?
  
  -- Validation
  requiredHints   Int      @default(2)
  existingHints   Int      @default(0)
  isValidated     Boolean  @default(false)
  validationNotes String?
  
  status          String   @default("setup") -- setup, payoff, complete
}
```

### 2.5 Callback Table

```sql
Callback {
  id              String   @id
  seriesId        String
  
  -- Original event
  originalBook    Int
  originalChapter Int?
  originalEvent   String
  emotionalWeight String?  -- How impactful was original
  
  -- Callback
  callbackBook    Int
  callbackChapter Int?
  callbackType    String   -- emotional_payoff, callback, contrast, parallel
  callbackDescription String
  
  -- Execution
  isExecuted      Boolean  @default(false)
  impact          String?  -- How the callback lands
}
```

---

## 3. API Layer

### 3.1 Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/series/[id]` | Get series with all memory data |
| GET | `/api/memory?seriesId=xxx` | Get memory state for a series |
| GET | `/api/memory?seriesId=xxx&bookNumber=1` | Get memory state at specific book |
| POST | `/api/memory/canon` | Add new canon entry |
| PUT | `/api/memory/relationship/[id]` | Update relationship |
| POST | `/api/memory/clue` | Add new clue |

### 3.2 Series Detail API Response

```typescript
// GET /api/series/[id]
interface SeriesWithMemory {
  // ... basic series fields
  
  canonLog: {
    id: string;
    worldFacts: string | null;      // JSON
    characterFacts: string | null;  // JSON
    eventFacts: string | null;      // JSON
    rulesFacts: string | null;      // JSON
    logEntries: CanonLogEntry[];
  } | null;
  
  relationshipLog: {
    id: string;
    relationships: string | null;   // JSON
    entries: RelationshipEntry[];
  } | null;
  
  mysteryLog: {
    id: string;
    activeMysteries: string | null;   // JSON
    resolvedMysteries: string | null; // JSON
    secrets: Secret[];
    clues: Clue[];
  } | null;
  
  foreshadowing: Foreshadowing[];
  callbacks: Callback[];
}
```

### 3.3 Memory State API

```typescript
// GET /api/memory?seriesId=xxx
interface MemoryStateResponse {
  canonLog: {
    entries: {
      category: string;
      fact: string;
      source: string | null;
      cannotChange: boolean;
    }[];
  };
  
  relationshipLog: {
    entries: {
      characterA: string;
      characterB: string;
      relationshipType: string;
      trustLevel: number;
      tensionLevel: number;
      status: string;
    }[];
  };
  
  mysteryLog: {
    activeMysteries: string[];
    resolvedMysteries: string[];
    secrets: {
      title: string;
      status: string;
      revealedInBook: number | null;
    }[];
    clues: {
      description: string;
      plantedIn: string;
      wasNoticed: boolean;
    }[];
  };
}
```

---

## 4. Frontend Components

### 4.1 Component Hierarchy

```
MemoryTab/
├── MemoryStatsCards/
│   ├── CanonStatsCard
│   ├── RelationshipStatsCard
│   ├── MysteryStatsCard
│   └── ForeshadowingStatsCard
│
├── MemorySubTabs/
│   ├── CanonLogTab/
│   │   ├── CanonEntryList
│   │   ├── CanonEntry
│   │   └── WorldRulesCard
│   │
│   ├── RelationshipsTab/
│   │   ├── RelationshipGrid
│   │   ├── RelationshipCard
│   │   └── TrustTensionBars
│   │
│   ├── MysteriesTab/
│   │   ├── SecretsPanel/
│   │   │   ├── SecretList
│   │   │   └── SecretCard
│   │   │
│   │   └── CluesPanel/
│   │       ├── ClueList
│   │       └── ClueCard
│   │
│   └── ForeshadowingTab/
│       ├── ForeshadowingList/
│       │   ├── ForeshadowingCard
│       │   └── SetupPayoffDisplay
│       │
│       └── CallbacksList/
│           └── CallbackCard
```

### 4.2 Component Specifications

#### 4.2.1 MemoryStatsCards

```tsx
// Four gradient cards showing memory counts
<div className="grid grid-cols-4 gap-4">
  <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
    <CardContent>
      <Database icon + count + label />
    </CardContent>
  </Card>
  // ... pink (relationships), purple (mysteries), amber (foreshadowing)
</div>
```

#### 4.2.2 CanonLogTab

```tsx
// Canon entries with lock indicators
{canonLog?.logEntries?.map(entry => (
  <div className="flex items-start gap-3">
    {entry.cannotChange ? <Lock /> : <Unlock />}
    <Badge color={categoryColor}>{entry.category}</Badge>
    <p>{entry.fact}</p>
    {entry.source && <span>Source: {entry.source}</span>}
  </div>
))}
```

**Category Colors:**
- `world` → blue
- `character` → green
- `event` → purple
- `rule` → amber

#### 4.2.3 RelationshipCard

```tsx
// Character pair with trust/tension bars
<Card>
  <div className="flex justify-between">
    <span>{characterA} ↔ {characterB}</span>
    <Badge status={status} />
  </div>
  
  {/* Trust Bar */}
  <div className="flex items-center gap-2">
    <span className="w-12">Trust</span>
    <ProgressBar 
      value={trustLevel} 
      color="green-gradient"
    />
    <span className="w-8">{trustLevel}%</span>
  </div>
  
  {/* Tension Bar */}
  <div className="flex items-center gap-2">
    <span className="w-12">Tension</span>
    <ProgressBar 
      value={tensionLevel} 
      color="amber-to-red-gradient"
    />
    <span className="w-8">{tensionLevel}%</span>
  </div>
  
  {keyMoments && <div>Key Moments: {keyMoments}</div>}
</Card>
```

**Status Colors:**
- `friendly` → green
- `hostile` → red
- `romantic` → pink
- `strained` → amber
- `neutral` → gray

#### 4.2.4 SecretCard

```tsx
<div className={`p-3 rounded-lg ${statusColors[secret.status]}`}>
  <div className="flex justify-between">
    <h4>{secret.title}</h4>
    <Badge status={secret.status} />
  </div>
  <p>{secret.description}</p>
  
  <div className="grid grid-cols-2">
    {secret.whoKnows && (
      <div><Eye /> Knows: {secret.whoKnows}</div>
    )}
    {secret.whoDoesntKnow && (
      <div><EyeOff /> Doesn't: {secret.whoDoesntKnow}</div>
    )}
  </div>
  
  {secret.revealedInBook && (
    <div>Revealed: Book {secret.revealedInBook}</div>
  )}
</div>
```

**Status Styles:**
- `hidden` → purple background
- `partial` → amber background
- `revealed` → green background

#### 4.2.5 ForeshadowingCard

```tsx
<div className={`p-4 rounded-lg ${statusColors[item.status]}`}>
  <div className="flex justify-between">
    <Badge>{item.eventType}</Badge>
    <Badge status={item.status} />
  </div>
  <h4>{item.eventDescription}</h4>
  
  <div className="grid grid-cols-2 gap-4">
    {/* Setup Panel */}
    <div className="p-2 bg-white/50">
      <div className="text-xs">SETUP</div>
      <div>Book {item.setupBook}</div>
      {item.setupDescription && <p>{item.setupDescription}</p>}
      <Badge>{item.setupSubtlety}</Badge>
    </div>
    
    {/* Payoff Panel */}
    <div className="p-2 bg-white/50">
      <div className="text-xs">PAYOFF</div>
      {item.payoffBook ? (
        <div>Book {item.payoffBook}</div>
      ) : (
        <div className="text-muted">Pending</div>
      )}
    </div>
  </div>
  
  {/* Validation Status */}
  <div className="flex items-center gap-4">
    <span>Hints: {item.existingHints}/{item.requiredHints}</span>
    {item.isValidated ? (
      <Badge><CheckCircle /> Validated</Badge>
    ) : (
      <Badge><AlertTriangle /> Needs More Hints</Badge>
    )}
  </div>
</div>
```

#### 4.2.6 CallbackCard

```tsx
<div className={`p-3 ${isExecuted ? 'bg-green-50' : 'bg-slate-50'}`}>
  <div className="flex items-center gap-2">
    <Badge>{callbackType}</Badge>
    {isExecuted ? <CheckCircle /> : <Clock />}
  </div>
  
  <div className="space-y-2">
    <div>
      <span className="text-xs">Original:</span>
      Book {originalBook}: {originalEvent}
    </div>
    <div>
      <span className="text-xs">Callback:</span>
      Book {callbackBook}: {callbackDescription}
    </div>
  </div>
  
  {emotionalWeight && (
    <div className="text-xs">Weight: {emotionalWeight}</div>
  )}
</div>
```

---

## 5. Data Flow

### 5.1 Memory Update Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    MEMORY UPDATE PIPELINE                        │
└─────────────────────────────────────────────────────────────────┘

Chapter Generation Complete
         │
         ▼
┌─────────────────────┐
│   Extract Events    │
│   from Chapter      │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   AI Memory Update  │◄── Uses MEMORY_UPDATER prompt
│   (Low Temp: 0.3)   │
└─────────────────────┘
         │
         ├──────────────┬──────────────┬──────────────┐
         ▼              ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Update      │ │ Update      │ │ Update      │ │ Create      │
│ CanonLog    │ │ RelationLog │ │ MysteryLog  │ │ Foreshadow  │
│ (ADD only)  │ │ (mutate)    │ │ (mutate)    │ │ if needed   │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
         │              │              │              │
         └──────────────┴──────────────┴──────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Save to Database│
                    │ (Prisma)        │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Update Book     │
                    │ Memory Snapshot │
                    └─────────────────┘
```

### 5.2 Memory Query Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    MEMORY QUERY FLOW                             │
└─────────────────────────────────────────────────────────────────┘

User Opens Memory Tab
         │
         ▼
┌─────────────────────┐
│   GET /api/series/  │
│   [id]              │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   Prisma Query      │
│   with Includes     │
└─────────────────────┘
         │
         ├──────────────┬──────────────┬──────────────┐
         ▼              ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ canonLog    │ │ relationLog │ │ mysteryLog  │ │ foreshadow  │
│ .include()  │ │ .include()  │ │ .include()  │ │ .findMany() │
│ logEntries  │ │ entries     │ │ secrets     │ │             │
│             │ │             │ │ clues       │ │             │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
         │              │              │              │
         └──────────────┴──────────────┴──────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ JSON Response   │
                    │ to Frontend     │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Parse JSON      │
                    │ fields safely   │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Render Memory   │
                    │ Tab Components  │
                    └─────────────────┘
```

### 5.3 Safe JSON Parsing

```typescript
// Utility function used in MemoryTab
const parseJsonSafe = <T,>(json: string | null, fallback: T): T => {
  if (!json) return fallback;
  try {
    return JSON.parse(json);
  } catch {
    console.warn('Failed to parse JSON:', json);
    return fallback;
  }
};

// Usage
const worldFacts = parseJsonSafe(canonLog?.worldFacts ?? null, []);
const characterFacts = parseJsonSafe(canonLog?.characterFacts ?? null, []);
```

---

## 6. Implementation Checklist

### Phase 1: Database Setup ✅

- [x] Create Prisma schema for CanonLog
- [x] Create Prisma schema for CanonLogEntry
- [x] Create Prisma schema for RelationshipLog
- [x] Create Prisma schema for RelationshipEntry
- [x] Create Prisma schema for MysteryLog
- [x] Create Prisma schema for Secret
- [x] Create Prisma schema for Clue
- [x] Create Prisma schema for Foreshadowing
- [x] Create Prisma schema for Callback
- [x] Run Prisma migration

### Phase 2: API Layer ✅

- [x] Update `/api/series/[id]` to include memory data
- [x] Create `/api/memory` endpoint
- [x] Add memory state to book generation flow
- [x] Implement memory update after chapter generation

### Phase 3: Frontend Components ✅

- [x] Create MemoryTab component
- [x] Create MemoryStatsCards
- [x] Create CanonLogTab with entries display
- [x] Create RelationshipsTab with trust/tension bars
- [x] Create MysteriesTab with secrets and clues
- [x] Create ForeshadowingTab with callbacks
- [x] Add Memory tab to navigation (7 tabs total)
- [x] Add TypeScript interfaces for all memory types

### Phase 4: Testing & Polish 🔄

- [ ] Test with real generated series data
- [ ] Add empty state displays
- [ ] Add loading states
- [ ] Add error handling for JSON parsing
- [ ] Test responsive design on mobile

### Phase 5: Future Enhancements 📋

- [ ] Add inline editing for relationships
- [ ] Add manual clue creation
- [ ] Add foreshadowing validation button
- [ ] Create memory timeline visualization
- [ ] Add export memory state feature
- [ ] Add memory diff between books

---

## 7. Future Enhancements

### 7.1 Inline Editing

```tsx
// Allow editing trust/tension levels directly
<Slider
  value={[trustLevel]}
  onValueChange={(value) => {
    updateRelationship(id, { trustLevel: value[0] });
  }}
  min={0}
  max={100}
/>
```

### 7.2 Memory Timeline Visualization

```
Book 1 ────────────────────────────────────────►
       │    │         │           │
       ▼    ▼         ▼           ▼
      [Fact1] [Rel1] [Secret1]  [Clue1]
                            │
                            ▼ (resolved)
Book 2 ────────────────────────────────────────►
       │              │              │
       ▼              ▼              ▼
      [Fact2]      [Secret1 ✓]    [Clue2]
```

### 7.3 Memory Diff View

```
┌─────────────────────────────────────────────────────┐
│              Memory Changes: Book 1 → Book 2        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  CANON (+3 new facts)                              │
│  + "Maya discovers her powers in Chapter 3"        │
│  + "The Council meets on the full moon"            │
│  + "Elena is Maya's half-sister"                   │
│                                                     │
│  RELATIONSHIPS (2 changed)                         │
│  Maya ↔ Alex: Trust 50→75 (+25)                    │
│  Maya ↔ Elena: Status neutral→hostile              │
│                                                     │
│  MYSTERIES                                         │
│  Secret "Council's betrayal" → REVEALED            │
│  +3 new clues planted                              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 7.4 Export Memory State

```typescript
// Export as JSON for backup/analysis
interface MemoryExport {
  exportedAt: Date;
  seriesId: string;
  canonLog: CanonLogEntry[];
  relationshipLog: RelationshipEntry[];
  mysteryLog: {
    secrets: Secret[];
    clues: Clue[];
  };
  foreshadowing: Foreshadowing[];
  callbacks: Callback[];
}
```

### 7.5 Validation Warnings

```tsx
// Show warnings when memory has issues
{memoryWarnings.length > 0 && (
  <Alert variant="warning">
    <AlertTriangle />
    <AlertTitle>Memory Issues Detected</AlertTitle>
    <AlertDescription>
      <ul>
        {memoryWarnings.map(w => (
          <li key={w.id}>{w.message}</li>
        ))}
      </ul>
    </AlertDescription>
  </Alert>
)}
```

**Warning Types:**
- Unresolved foreshadowing past payoff book
- Character knows something they shouldn't
- Relationship contradicts established canon
- Secret revealed but clues not noticed

---

## Appendix A: File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── series/
│   │   │   └── [id]/
│   │   │       └── route.ts        # Updated with memory includes
│   │   └── memory/
│   │       └── route.ts            # Memory state endpoint
│   │
│   └── page.tsx                    # MemoryTab component
│
├── lib/
│   ├── ai-generator-enhanced.ts    # Memory prompts
│   ├── generation-orchestration.ts # Memory update flow
│   └── narrative-intelligence.ts   # Foreshadowing validation
│
└── types/
    └── memory.ts                   # TypeScript interfaces (optional)

prisma/
└── schema.prisma                   # Memory tables
```

---

## Appendix B: Key Code Snippets

### B.1 Memory Update Prompt (Critical)

```typescript
const USER_MEMORY_UPDATE = `Update the story memory after Chapter ${chapterNumber}.

PREVIOUS MEMORY:
${JSON.stringify(currentMemory, null, 2)}

CHAPTER CONTENT:
${chapterContent.substring(0, 3000)}

CRITICAL RULES:
1. CanonLog: ONLY ADD new facts, NEVER remove or change
2. RelationshipLog: Update trust/tension based on interactions
3. MysteryLog: Add clues, mark secrets revealed if shown
4. Character States: Move items from "doesntKnow" to "knows" ONLY if explicitly learned

Output complete updated memory as JSON.`;
```

### B.2 Trust/Tension Bar Component

```tsx
function TrustTensionBars({ trustLevel, tensionLevel }: { 
  trustLevel: number; 
  tensionLevel: number;
}) {
  return (
    <div className="space-y-2">
      {/* Trust */}
      <div className="flex items-center gap-2">
        <span className="text-xs w-12">Trust</span>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
            style={{ width: `${trustLevel}%` }}
          />
        </div>
        <span className="text-xs w-8">{trustLevel}%</span>
      </div>
      
      {/* Tension */}
      <div className="flex items-center gap-2">
        <span className="text-xs w-12">Tension</span>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 to-red-500 transition-all"
            style={{ width: `${tensionLevel}%` }}
          />
        </div>
        <span className="text-xs w-8">{tensionLevel}%</span>
      </div>
    </div>
  );
}
```

### B.3 Status Badge Colors

```typescript
const statusColors = {
  // Relationship status
  friendly: 'bg-green-100 text-green-800',
  hostile: 'bg-red-100 text-red-800',
  romantic: 'bg-pink-100 text-pink-800',
  strained: 'bg-amber-100 text-amber-800',
  neutral: 'bg-gray-100 text-gray-800',
  
  // Secret status
  hidden: 'bg-purple-100 text-purple-800',
  partial: 'bg-amber-100 text-amber-800',
  revealed: 'bg-green-100 text-green-800',
  
  // Foreshadowing status
  setup: 'bg-amber-100 text-amber-800',
  payoff: 'bg-green-100 text-green-800',
  complete: 'bg-blue-100 text-blue-800',
};
```

---

## Appendix C: Testing Scenarios

### C.1 Canon Log Tests

| Test | Input | Expected |
|------|-------|----------|
| New fact added | Chapter establishes "Maya has blue eyes" | Canon entry created |
| Duplicate fact | Same fact mentioned again | No duplicate entry |
| Immutable change | Try to modify existing fact | Error/ignored |
| Category sorting | Facts in different categories | Sorted by category |

### C.2 Relationship Tests

| Test | Input | Expected |
|------|-------|----------|
| Trust increase | Characters have positive interaction | Trust +10-20 |
| Trust decrease | Characters have conflict | Trust -10-20 |
| Tension spike | Major conflict scene | Tension +30-50 |
| Status change | Relationship evolves | Status updated |
| Bidirectional | A→B trust changes | B→A may or may not change |

### C.3 Mystery Tests

| Test | Input | Expected |
|------|-------|----------|
| Clue planted | Hint in dialogue | Clue created |
| Clue noticed | Character reacts to clue | wasNoticed = true |
| Secret revealed | Full truth exposed | status = revealed |
| Knowledge update | Secret revealed to character | whoKnows updated |

### C.4 Foreshadowing Tests

| Test | Input | Expected |
|------|-------|----------|
| Hints sufficient | 2+ hints before event | isValidated = true |
| Hints insufficient | < 2 hints before event | isValidated = false |
| Payoff marked | Event occurs | status = payoff |
| Callback executed | Reference to past event | isExecuted = true |

---

*Document Version: 1.0*
*Last Updated: 2025*
*Author: YA Series Generator System*
