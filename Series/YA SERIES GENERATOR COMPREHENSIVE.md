# 📚 YA SERIES GENERATOR - COMPREHENSIVE PLAN

## Complete Technical Specification for Building an AI-Powered Multi-Book Series Generator with Narrative Intelligence

---

# PART 1: PROJECT OVERVIEW

## 1.1 Vision Statement

Build a **YA Series Generator** that creates interconnected 3-7 book series where:
- Characters grow realistically across books
- Plot developments are foreshadowed (nothing comes from nowhere)
- Each book builds naturally on the previous
- Readers are hooked and compelled to continue

## 1.2 Core Philosophy

```
┌─────────────────────────────────────────────────────────────────┐
│                    THE THREE LAWS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. CONTINUITY LAW                                              │
│     Every book remembers the past and earns the future.        │
│     - No forgotten trauma                                       │
│     - No random knowledge                                       │
│     - No unearned revelations                                   │
│                                                                 │
│  2. GROWTH LAW                                                  │
│     Characters change because of what happens to them.         │
│     - Growth is earned through struggle                         │
│     - Changes are tracked per book                              │
│     - End state is planned from start                           │
│                                                                 │
│  3. ENGAGEMENT LAW                                              │
│     Every chapter gives readers a reason to continue.          │
│     - Hooks are intentional                                     │
│     - Tension is managed                                        │
│     - Payoffs are satisfying                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 1.3 Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui |
| State | Zustand |
| Database | Prisma ORM + SQLite |
| AI | z-ai-web-dev-sdk (GPT-4 class) |
| APIs | REST with streaming support |

---

# PART 2: SYSTEM ARCHITECTURE

## 2.1 Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │              LAYER 1: SERIES BRAIN (Long-term Memory)               │   │
│   │                                                                      │   │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│   │   │ SERIES BIBLE│  │  CANON LOG  │  │ WORLD RULES │                 │   │
│   │   │             │  │             │  │             │                 │   │
│   │   │ • Premise   │  │ • Facts     │  │ • Possible  │                 │   │
│   │   │ • Themes    │  │ • Events    │  │ • Impossible│                 │   │
│   │   │ • Arcs      │  │ • Rules     │  │ • Limits    │                 │   │
│   │   └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│   │                                                                      │   │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│   │   │ CHARACTERS  │  │ VOICE LOCKS │  │  MOMENTUM   │                 │   │
│   │   │             │  │             │  │             │                 │   │
│   │   │ • Core Desire│ │ • Speech    │  │ • Stakes    │                 │   │
│   │   │ • Big Fear  │  │ • Vocab     │  │ • Escalation│                 │   │
│   │   │ • Arcs      │  │ • Patterns  │  │ • Profile   │                 │   │
│   │   └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│                                      ▼                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │              LAYER 2: BOOK PLANNER (Mid-level Memory)               │   │
│   │                                                                      │   │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│   │   │BOOK PURPOSE │  │TENSION CURVE│  │BOOK MEMORY  │                 │   │
│   │   │             │  │             │  │             │                 │   │
│   │   │ • Stage     │  │ • Start     │  │ • Canon     │                 │   │
│   │   │ • Conflict  │  │ • Peaks     │  │ • Relations │                 │   │
│   │   │ • Progress  │  │ • Climax    │  │ • Mysteries │                 │   │
│   │   └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│   │                                                                      │   │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│   │   │ CHAR STATES │  │EMOTIONAL MEM│  │COMPRESSED CTX│                │   │
│   │   │             │  │             │  │             │                 │   │
│   │   │ • Knowledge │  │ • Trauma    │  │ • Key Events│                 │   │
│   │   │ • Location  │  │ • Intensity │  │ • Changes   │                 │   │
│   │   │ • Emotions  │  │ • Lingers   │  │ • Clues     │                 │   │
│   │   └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│                                      ▼                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │              LAYER 3: CHAPTER ENGINE (Short-term Execution)         │   │
│   │                                                                      │   │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│   │   │CHAPTER GOAL │  │TENSION POINT│  │ READER HOOK │                 │   │
│   │   │             │  │             │  │             │                 │   │
│   │   │ • Purpose   │  │ • Level 1-10│  │ • Type      │                 │   │
│   │   │ • Scenes    │  │ • Goal      │  │ • Payoff    │                 │   │
│   │   │ • Threads   │  │ • Validation│  │ • Impact    │                 │   │
│   │   └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│                                      ▼                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │           NARRATIVE INTELLIGENCE LAYER (Validation)                 │   │
│   │                                                                      │   │
│   │   ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐          │   │
│   │   │ TENSION   │ │ EMOTIONAL │ │ FORESHADOW│ │  VOICE    │          │   │
│   │   │ VALIDATE  │ │ TRIGGERS  │ │ VALIDATE  │ │  CHECK    │          │   │
│   │   └───────────┘ └───────────┘ └───────────┘ └───────────┘          │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2.2 Generation Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMPLETE GENERATION PIPELINE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  USER INPUT                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Title: "The Dream Weavers"                                           │   │
│  │ Premise: "In a world where dreams become reality, a 17-year-old     │   │
│  │          discovers she can enter others' dreams and must stop a     │   │
│  │          nightmare plague destroying her city."                      │   │
│  │ Genre: Fantasy                                                       │   │
│  │ Books: 5                                                             │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│                                      ▼                                       │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║  PHASE 1: SERIES BIBLE GENERATION                                     ║  │
│  ╠═══════════════════════════════════════════════════════════════════════╣  │
│  ║                                                                        ║  │
│  ║  Prompt 1: SERIES_BIBLE                                                ║  │
│  ║  ├── Generates: Overview, World Rules, Characters, Arcs               ║  │
│  ║  ├── Output: SeriesBible JSON                                         ║  │
│  ║  └── Save to: series_bible table                                      ║  │
│  ║                                                                        ║  │
│  ║  Prompt 2: SERIES_MOMENTUM                                            ║  │
│  ║  ├── Generates: Stakes escalation per book                            ║  │
│  ║  ├── Output: SeriesMomentum[] JSON                                    ║  │
│  ║  └── Save to: series.momentumProfile                                  ║  │
│  ║                                                                        ║  │
│  ║  Prompt 3: VOICE_PROFILES (per character)                             ║  │
│  ║  ├── Generates: Speech style, vocab, patterns                         ║  │
│  ║  ├── Output: VoiceProfile JSON                                        ║  │
│  ║  └── Save to: character.voiceProfile                                  ║  │
│  ║                                                                        ║  │
│  ║  System: Initialize Memory Logs                                       ║  │
│  ║  ├── CanonLog: World facts, rules, events                             ║  │
│  ║  ├── RelationshipLog: Initial relationships                           ║  │
│  ║  ├── MysteryLog: Secrets and clues from bible                         ║  │
│  ║  └── Callbacks: Plan cross-book payoffs                               ║  │
│  ║                                                                        ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                      │                                       │
│                                      ▼                                       │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║  PHASE 2: BOOK GENERATION (Repeat for each book)                      ║  │
│  ╠═══════════════════════════════════════════════════════════════════════╣  │
│  ║                                                                        ║  │
│  ║  Prompt 4: BOOK_OUTLINE                                                ║  │
│  ║  ├── Input: SeriesBible + Previous Books                              ║  │
│  ║  ├── Generates: Title, Purpose, Conflict, Progression, Chapters       ║  │
│  ║  ├── Output: BookPlan JSON                                            ║  │
│  ║  └── Save to: book table                                              ║  │
│  ║                                                                        ║  │
│  ║  Prompt 5: TENSION_CURVE                                               ║  │
│  ║  ├── Input: BookPlan + SeriesBible                                    ║  │
│  ║  ├── Generates: Tension curve + per-chapter levels                    ║  │
│  ║  ├── Output: { curve, chapterPoints }                                 ║  │
│  ║  └── Save to: tension_profile table                                   ║  │
│  ║                                                                        ║  │
│  ║  Prompt 6: READER_HOOKS (per chapter)                                  ║  │
│  ║  ├── Input: ChapterPlan + BookPlan                                    ║  │
│  ║  ├── Generates: Hook type, description, payoff                        ║  │
│  ║  ├── Output: ReaderHook JSON                                          ║  │
│  ║  └── Save to: chapter.hook* fields                                    ║  │
│  ║                                                                        ║  │
│  ║  System: Initialize Book Memory                                       ║  │
│  ║  ├── Build on previous book's memory (if exists)                      ║  │
│  ║  └── Create fresh memory (if first book)                              ║  │
│  ║                                                                        ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                      │                                       │
│                                      ▼                                       │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║  PHASE 3: CHAPTER GENERATION (Repeat for each chapter)                ║  │
│  ╠═══════════════════════════════════════════════════════════════════════╣  │
│  ║                                                                        ║  │
│  ║  Context Building:                                                     ║  │
│  ║  ├── Load SeriesBible, BookPlan, MemoryState                          ║  │
│  ║  ├── Load Previous Chapters (last 3 full)                             ║  │
│  ║  ├── Build Compressed Context (for older chapters)                    ║  │
│  ║  ├── Get Tension Level for this chapter                               ║  │
│  ║  └── Get Reader Hook for this chapter                                 ║  │
│  ║                                                                        ║  │
│  ║  Prompt 7: CHAPTER_WRITE                                               ║  │
│  ║  ├── Input: ChapterPlan + Context + VoiceProfile + Tension            ║  │
│  ║  ├── Generates: Full chapter content (2500-3500 words)                ║  │
│  ║  └── Output: Chapter text                                             ║  │
│  ║                                                                        ║  │
│  ║  ════════════════════════════════════════════════════════════════════ ║  │
│  ║  NARRATIVE INTELLIGENCE CHECKS:                                        ║  │
│  ║  ════════════════════════════════════════════════════════════════════ ║  │
│  ║                                                                        ║  │
│  ║  Check 1: TENSION_VALIDATION                                           ║  │
│  ║  ├── Compare content intensity vs expected tension level              ║  │
│  ║  └── Flag if mismatch (e.g., calm scene when should be tense)         ║  │
│  ║                                                                        ║  │
│  ║  Check 2: EMOTIONAL_TRIGGERS                                           ║  │
│  ║  ├── Scan for triggers (keywords from emotional memories)             ║  │
│  ║  └── Alert if triggered memory not reflected in scene                 ║  │
│  ║                                                                        ║  ║
│  ║  Check 3: VOICE_CONSISTENCY                                            ║  │
│  ║  ├── Extract dialogue for POV character                               ║  │
│  ║  └── Validate against voice profile                                   ║  │
│  ║                                                                        ║  │
│  ║  Check 4: HOOK_QUALITY                                                 ║  │
│  ║  ├── Score hook strength (1-10)                                       ║  │
│  ║  └── Suggest improvements if score < 6                                ║  │
│  ║                                                                        ║  │
│  ║  Prompt 8: MEMORY_UPDATE (CRITICAL)                                    ║  │
│  ║  ├── Input: Current Memory + Chapter Content                          ║  │
│  ║  ├── Updates: Canon, Relationships, Mysteries, Knowledge              ║  │
│  ║  └── Output: Updated MemoryState JSON                                 ║  │
│  ║                                                                        ║  │
│  ║  Prompt 9: COMPRESS_CONTEXT                                            ║  │
│  ║  ├── Input: Chapter Content                                           ║  │
│  ║  ├── Extracts: Key events, changes, clues                             ║  │
│  ║  └── Output: CompressedContext JSON                                   ║  │
│  ║                                                                        ║  │
│  ║  Save:                                                                 ║  │
│  ║  ├── chapter.content = generated text                                 ║  │
│  ║  ├── chapter.memorySnapshot = current memory                          ║  │
│  ║  ├── chapter.compressedSummary = compressed context                   ║  │
│  ║  └── bookMemory = updated memory                                      ║  │
│  ║                                                                        ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                      │                                       │
│                                      ▼                                       │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║  PHASE 4: VALIDATION & ENHANCEMENT (As needed)                        ║  │
│  ╠═══════════════════════════════════════════════════════════════════════╣  │
│  ║                                                                        ║  │
│  ║  Prompt 10: FORESHADOW_VALIDATE                                        ║  │
│  ║  ├── Input: Event + Existing hints                                    ║  │
│  ║  ├── Checks: requiredHints vs existingHints                           ║  │
│  ║  └── Action: Inject hint if validation fails                          ║  │
│  ║                                                                        ║  │
│  ║  Prompt 11: CONSISTENCY_CHECK                                          ║  │
│  ║  ├── Input: SeriesBible + Memory + Chapter                            ║  │
│  ║  ├── Checks: Character, Plot, World consistency                       ║  │
│  ║  └── Output: Issues + Fix suggestions                                 ║  │
│  ║                                                                        ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# PART 3: DATABASE SCHEMA

## 3.1 Complete Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE ENTITY RELATIONSHIPS                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐                                                            │
│  │   SERIES    │──────────────────────────────────────────────────────┐     │
│  └──────┬──────┘                                                      │     │
│         │                                                             │     │
│         │ 1:1                                                        │     │
│         ├──▶ ┌─────────────┐                                         │     │
│         │    │SERIES_BIBLE │                                         │     │
│         │    └─────────────┘                                         │     │
│         │                                                             │     │
│         │ 1:1                                                        │     │
│         ├──▶ ┌─────────────┐   ┌─────────────────┐                   │     │
│         │    │  CANON_LOG  │──▶│ CANON_LOG_ENTRY │                   │     │
│         │    └─────────────┘   └─────────────────┘                   │     │
│         │                                                             │     │
│         │ 1:1                                                        │     │
│         ├──▶ ┌──────────────┐   ┌───────────────────┐                │     │
│         │    │RELATIONSHIP_ │──▶│RELATIONSHIP_ENTRY │                │     │
│         │    │     LOG      │   └───────────────────┘                │     │
│         │    └──────────────┘                                        │     │
│         │                                                             │     │
│         │ 1:1                                                        │     │
│         ├──▶ ┌─────────────┐   ┌─────────┐   ┌─────────┐            │     │
│         │    │ MYSTERY_LOG │──▶│ SECRET  │──▶│  CLUE   │            │     │
│         │    └─────────────┘   └─────────┘   └─────────┘            │     │
│         │                                                             │     │
│         │ 1:N                                                        │     │
│         ├──▶ ┌─────────────┐                                         │     │
│         │    │   BOOK      │───┐                                     │     │
│         │    └─────────────┘   │                                     │     │
│         │                      │                                     │     │
│         │                      │ 1:1                                 │     │
│         │                      ├──▶ ┌────────────────┐               │     │
│         │                      │    │TENSION_PROFILE │               │     │
│         │                      │    └────────────────┘               │     │
│         │                      │                                     │     │
│         │                      │ 1:1                                 │     │
│         │                      ├──▶ ┌─────────────┐                  │     │
│         │                      │    │ BOOK_MEMORY │                  │     │
│         │                      │    └─────────────┘                  │     │
│         │                      │                                     │     │
│         │                      │ 1:N                                 │     │
│         │                      └──▶ ┌───────────┐                    │     │
│         │                           │  CHAPTER  │                    │     │
│         │                           └───────────┘                    │     │
│         │                                                             │     │
│         │ 1:N                                                        │     │
│         ├──▶ ┌─────────────┐   ┌─────────────────┐                  │     │
│         │    │ CHARACTER   │──▶│CHARACTER_STATE  │◀──┐              │     │
│         │    └─────────────┘   └─────────────────┘   │              │     │
│         │                                            │              │     │
│         │                                            │              │     │
│         │  ┌──────────────────────────────────────────┘              │     │
│         │  │  (CHARACTER_STATE also links to BOOK)                   │     │
│         │  │                                                          │     │
│         │  │                                                          │     │
│         │  │  1:N                                                    │     │
│         ├──┼──▶ ┌───────────────┐                                    │     │
│         │  │    │WORLD_ELEMENT  │                                    │     │
│         │  │    └───────────────┘                                    │     │
│         │  │                                                          │     │
│         │  │  1:N                                                    │     │
│         ├──┼──▶ ┌─────────────┐                                      │     │
│         │  │    │PLOT_THREAD  │                                      │     │
│         │  │    └─────────────┘                                      │     │
│         │  │                                                          │     │
│         │  │  1:N                                                    │     │
│         ├──┼──▶ ┌───────────────┐                                    │     │
│         │  │    │FORESHADOWING  │                                    │     │
│         │  │    └───────────────┘                                    │     │
│         │  │                                                          │     │
│         │  │  1:N                                                    │     │
│         ├──┼──▶ ┌─────────────┐                                      │     │
│         │  │    │  CALLBACK   │                                      │     │
│         │  │    └─────────────┘                                      │     │
│         │  │                                                          │     │
│         │  │  1:N                                                    │     │
│         ├──┴──▶ ┌────────────────┐                                   │     │
│         │       │GENERATION_LOG  │                                   │     │
│         │       └────────────────┘                                   │     │
│         │                                                             │     │
│         └─────────────────────────────────────────────────────────────┘     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 3.2 Complete Schema Definition

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// ============================================
// LAYER 1: SERIES BRAIN
// ============================================

model Series {
  id              String   @id @default(cuid())
  title           String
  premise         String
  genre           String
  themes          String   // JSON array
  tone            String?
  targetAudience  String?
  targetBooks     Int      @default(5)
  status          String   @default("planning")
  
  // World
  worldName       String?
  worldDescription String?
  worldRules      String?  // JSON
  worldLimits     String?  // JSON - IMPOSSIBLE things
  worldHistory    String?
  worldGeography  String?
  
  // Arc
  seriesArc       String?
  mainConflict    String?
  resolution      String?
  momentumProfile String?  // JSON
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  books           Book[]
  characters      Character[]
  worldElements   WorldElement[]
  plotThreads     PlotThread[]
  timeline        TimelineEvent[]
  generationLogs  GenerationLog[]
  canonLog        CanonLog?
  relationshipLog RelationshipLog?
  mysteryLog      MysteryLog?
  foreshadowing   Foreshadowing[]
  seriesBible     SeriesBible?
  callbacks       Callback[]
}

model SeriesBible {
  id              String   @id @default(cuid())
  seriesId        String   @unique
  
  overview        String?  // JSON
  worldRules      String?  // JSON
  characters      String?  // JSON
  seriesArc       String?  // JSON
  mysteryPlan     String?  // JSON
  relationshipMap String?  // JSON
  momentumPlan    String?  // JSON
  
  isGenerated     Boolean  @default(false)
  generatedAt     DateTime?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  series          Series   @relation(fields: [seriesId], references: [id], onDelete: Cascade)
}

model CanonLog {
  id              String   @id @default(cuid())
  seriesId        String   @unique
  
  worldFacts      String?  // JSON array
  characterFacts  String?  // JSON array
  eventFacts      String?  // JSON array
  rulesFacts      String?  // JSON array
  
  lastUpdated     DateTime @updatedAt
  createdAt       DateTime @default(now())
  
  series          Series   @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  logEntries      CanonLogEntry[]
}

model CanonLogEntry {
  id              String   @id @default(cuid())
  canonLogId      String
  
  category        String   // world, character, event, rule
  fact            String
  source          String?
  cannotChange    Boolean  @default(true)
  
  createdAt       DateTime @default(now())
  
  canonLog        CanonLog @relation(fields: [canonLogId], references: [id], onDelete: Cascade)
}

model RelationshipLog {
  id              String   @id @default(cuid())
  seriesId        String   @unique
  
  relationships   String?  // JSON
  lastUpdated     DateTime @updatedAt
  createdAt       DateTime @default(now())
  
  series          Series   @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  entries         RelationshipEntry[]
}

model RelationshipEntry {
  id                  String   @id @default(cuid())
  relationshipLogId   String
  
  characterAId        String
  characterBId        String
  characterAName      String
  characterBName      String
  
  relationshipType    String?
  trustLevel          Int      @default(50)
  tensionLevel        Int      @default(0)
  status              String   @default("neutral")
  
  aKnowsAboutB        String?  // JSON
  bKnowsAboutA        String?  // JSON
  keyMoments          String?  // JSON
  
  currentBook         Int?
  lastUpdated         DateTime @updatedAt
  createdAt           DateTime @default(now())
  
  relationshipLog     RelationshipLog @relation(fields: [relationshipLogId], references: [id], onDelete: Cascade)
}

model MysteryLog {
  id              String   @id @default(cuid())
  seriesId        String   @unique
  
  activeMysteries   String?  // JSON
  resolvedMysteries String?  // JSON
  lastUpdated       DateTime @updatedAt
  createdAt         DateTime @default(now())
  
  series          Series   @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  secrets         Secret[]
  clues           Clue[]
}

model Secret {
  id              String   @id @default(cuid())
  mysteryLogId    String
  
  title           String
  description     String
  
  whoKnows        String?  // JSON array
  whoDoesntKnow   String?  // JSON array
  
  revealedInBook    Int?
  revealedInChapter Int?
  revealMethod      String?
  
  status          String   @default("hidden")
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  mysteryLog      MysteryLog @relation(fields: [mysteryLogId], references: [id], onDelete: Cascade)
  clues           Clue[]
}

model Clue {
  id              String   @id @default(cuid())
  mysteryLogId    String
  secretId        String?
  
  description     String
  clueType        String
  
  plantedInBook   Int
  plantedInChapter Int?
  
  relatedSecretId String?
  
  isObvious       Boolean  @default(false)
  wasNoticed      Boolean  @default(false)
  
  createdAt       DateTime @default(now())
  
  mysteryLog      MysteryLog @relation(fields: [mysteryLogId], references: [id], onDelete: Cascade)
  secret          Secret?  @relation(fields: [secretId], references: [id], onDelete: SetNull)
}

model Foreshadowing {
  id              String   @id @default(cuid())
  seriesId        String
  
  eventType       String
  eventDescription String
  
  setupBook       Int
  setupChapter    Int?
  setupDescription String?
  setupSubtlety   String   @default("subtle")
  
  payoffBook      Int?
  payoffChapter   Int?
  payoffDescription String?
  
  requiredHints   Int      @default(2)
  existingHints   Int      @default(0)
  isValidated     Boolean  @default(false)
  validationNotes String?
  
  status          String   @default("setup")
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  series          Series   @relation(fields: [seriesId], references: [id], onDelete: Cascade)
}

model Callback {
  id              String   @id @default(cuid())
  seriesId        String
  
  originalBook    Int
  originalChapter Int?
  originalEvent   String
  emotionalWeight String?
  
  callbackBook    Int
  callbackChapter Int?
  callbackType    String
  callbackDescription String
  
  isExecuted      Boolean  @default(false)
  impact          String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  series          Series   @relation(fields: [seriesId], references: [id], onDelete: Cascade)
}

// ============================================
// LAYER 2: BOOK PLANNER
// ============================================

model Book {
  id              String   @id @default(cuid())
  seriesId        String
  bookNumber      Int
  title           String
  synopsis        String?
  status          String   @default("planned")
  
  bookPurpose     String?
  seriesStage     String?
  coreTheme       String?
  
  externalConflict String?
  internalConflict String?
  stakes          String?
  
  characterProgression String? // JSON
  
  reveals         String?  // JSON
  
  tensionCurve    String?  // JSON
  stakesLevel     String?  // personal, community, city, world, everything
  
  wordCount       Int      @default(0)
  chapterCount    Int      @default(0)
  generationProgress Float  @default(0)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  series          Series   @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  chapters        Chapter[]
  characterStates CharacterState[]
  bookMemory      BookMemory?
  tensionProfile  TensionProfile?
  
  @@unique([seriesId, bookNumber])
}

model TensionProfile {
  id              String   @id @default(cuid())
  bookId          String   @unique
  
  startTension    Int      @default(2)
  incitingIncident Int?
  firstComplication Int?
  midpointTension Int?
  falseHope       Int?
  climaxTension   Int?
  resolutionTension Int?
  
  currentTension  Int      @default(2)
  lastPeak        String?
  
  targetPacing    String?  // JSON
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  book            Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)
}

model BookMemory {
  id              String   @id @default(cuid())
  bookId          String   @unique
  
  canonState      String?  // JSON
  relationshipState String? // JSON
  mysteryState    String?  // JSON
  characterKnowledge String? // JSON
  
  emotionalMemories String? // JSON
  
  compressedSummary String? // JSON
  
  newFacts        String?  // JSON
  changedRelationships String? // JSON
  newClues        String?  // JSON
  resolvedMysteries String? // JSON
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  book            Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)
}

// ============================================
// CHARACTERS
// ============================================

model Character {
  id              String   @id @default(cuid())
  seriesId        String
  
  name            String
  role            String
  age             String?
  gender          String?
  
  appearance      String?
  personality     String?  // JSON
  backstory       String?
  
  coreDesire      String?
  bigFear         String?
  hiddenSecret    String?
  
  growthArc       String?  // JSON
  startState      String?
  endState        String?
  
  knowledgeTimeline String? // JSON
  
  relationships   String?  // JSON
  
  voiceProfile    String?  // JSON
  
  introducedInBook Int?
  introducedInChapter Int?
  
  emotionalMemory String?  // JSON
  
  isFullyDeveloped Boolean @default(false)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  series          Series   @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  states          CharacterState[]
}

model CharacterState {
  id              String   @id @default(cuid())
  characterId     String
  bookId          String
  
  age             String?
  location        String?
  emotionalState  String?
  
  knowledge       String?  // JSON
  dontKnow        String?  // JSON
  beliefs         String?  // JSON
  
  relationships   String?  // JSON
  skills          String?  // JSON
  possessions     String?  // JSON
  
  developments    String?  // JSON
  trauma          String?
  growth          String?
  losses          String?  // JSON
  gains           String?  // JSON
  
  internalConflict String?
  
  emotionalEvents String?  // JSON
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  character       Character @relation(fields: [characterId], references: [id], onDelete: Cascade)
  book            Book      @relation(fields: [bookId], references: [id], onDelete: Cascade)
  
  @@unique([characterId, bookId])
}

// ============================================
// WORLD & PLOT
// ============================================

model WorldElement {
  id              String   @id @default(cuid())
  seriesId        String
  
  type            String
  name            String
  description     String
  
  details         String?  // JSON
  rules           String?  // JSON
  history         String?
  
  introducedInBook  Int?
  expandedInBooks String?  // JSON
  secrets         String?  // JSON
  
  importance      String   @default("moderate")
  isPublic        Boolean  @default(true)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  series          Series   @relation(fields: [seriesId], references: [id], onDelete: Cascade)
}

model PlotThread {
  id              String   @id @default(cuid())
  seriesId        String
  
  name            String
  description     String
  type            String
  
  introducedInBook  Int
  resolvedInBook    Int?
  status          String   @default("setup")
  
  keyEvents       String?  // JSON
  secrets         String?  // JSON
  clues           String?  // JSON
  
  relatedCharacters String? // JSON
  relatedElements   String? // JSON
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  series          Series   @relation(fields: [seriesId], references: [id], onDelete: Cascade)
}

// ============================================
// LAYER 3: CHAPTER ENGINE
// ============================================

model Chapter {
  id              String   @id @default(cuid())
  bookId          String
  chapterNumber   Int
  
  title           String?
  synopsis        String?
  content         String?
  
  wordCount       Int      @default(0)
  pov             String?
  setting         String?
  timeMarker      String?
  
  chapterGoal     String?
  sceneBreakdown  String?  // JSON
  
  activeThreads   String?  // JSON
  threadDevelopments String? // JSON
  revelations     String?  // JSON
  
  foreshadowingSetup String? // JSON
  foreshadowingPayoff String? // JSON
  
  charactersPresent String? // JSON
  characterMoments String?  // JSON
  
  tensionLevel    Int      @default(5)
  tensionGoal     String?
  tensionNotes    String?
  
  hookType        String?
  hookDescription String?
  hookPayoffPlanned String?
  
  compressedSummary String? // JSON
  
  isGenerated     Boolean  @default(false)
  needsRevision   Boolean  @default(false)
  
  memorySnapshot  String?  // JSON
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  book            Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)
  
  @@unique([bookId, chapterNumber])
}

// ============================================
// TIMELINE & LOGS
// ============================================

model TimelineEvent {
  id              String   @id @default(cuid())
  seriesId        String
  
  eventName       String
  description     String
  eventType       String
  
  inWorldDate     String?
  bookId          String?
  chapterId       String?
  
  isMajor         Boolean  @default(false)
  affectsFuture   Boolean  @default(true)
  
  emotionalImpact String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  series          Series   @relation(fields: [seriesId], references: [id], onDelete: Cascade)
}

model GenerationLog {
  id              String   @id @default(cuid())
  seriesId        String
  
  type            String
  targetId        String?
  prompt          String?
  result          String?
  
  status          String   @default("pending")
  errorMessage    String?
  
  startedAt       DateTime @default(now())
  completedAt     DateTime?
  
  series          Series   @relation(fields: [seriesId], references: [id], onDelete: Cascade)
}
```

---

# PART 4: AI PROMPT SYSTEM

## 4.1 Prompt Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PROMPT SYSTEM OVERVIEW                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  SYSTEM MESSAGES (AI Personas)                                              │
│  ────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │ SERIES_PLANNER  │  │ BOOK_ARCHITECT  │  │ SCENE_PLANNER   │             │
│  │                 │  │                 │  │                 │             │
│  │ Long-term       │  │ Mid-level       │  │ Short-term      │             │
│  │ Consistency     │  │ Progression     │  │ Execution       │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   NOVELIST      │  │ MEMORY_KEEPER   │  │ PACING_EXPERT   │             │
│  │                 │  │                 │  │                 │             │
│  │ Voice & Style   │  │ Continuity      │  │ Tension &       │             │
│  │ Emotion         │  │ Tracking        │  │ Pacing          │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4.2 Complete Prompt Definitions

---

### PROMPT 1: SERIES BIBLE

```typescript
// ============================================
// PROMPT 1: SERIES BIBLE GENERATION
// ============================================

const SYSTEM_SERIES_PLANNER = `You are a professional YA novel series planner.

You create deeply connected, emotionally engaging multi-book series where:
- Characters grow realistically over time
- Plot developments are foreshadowed
- Nothing appears without setup
- Each book builds naturally on the previous one

You think long-term and avoid contradictions.
You understand that YA readers want emotional authenticity, high stakes, 
and characters they can grow with.`;

function buildSeriesBiblePrompt(
  title: string,
  concept: string,
  numBooks: number
): string {
  return `Create a complete SERIES BIBLE for a Young Adult novel series.

Title: ${title}
Concept: ${concept}

The series should have ${numBooks} books (minimum 3, maximum 7).

Generate the following as a JSON object with EXACT structure:

{
  "overview": {
    "genre": "YA subgenre (fantasy, dystopian, romance, thriller, etc.)",
    "tone": "Overall tone (dark, hopeful, adventurous, emotional, etc.)",
    "themes": ["theme1", "theme2", "theme3-5"],
    "targetAudience": "Age range (e.g., '14-18')"
  },
  
  "worldRules": {
    "possible": [
      "What IS possible in this world",
      "Each rule as separate string"
    ],
    "impossible": [
      "CRITICAL: What is IMPOSSIBLE in this world",
      "These CANNOT be broken later",
      "At least 3 items"
    ],
    "magicSystem": "Description of magic/tech system or 'none'",
    "technology": "Technology level description",
    "society": "Social structure description",
    "limitations": [
      "Clear limits on power/abilities",
      "These create conflict potential"
    ]
  },
  
  "characters": [
    {
      "name": "Full Name",
      "role": "protagonist|antagonist|supporting",
      "personalityTraits": ["trait1", "trait2", "trait3-5"],
      "coreDesire": "What drives them fundamentally - CRITICAL for consistency",
      "biggestFear": "What they fear most - CRITICAL for emotional moments",
      "hiddenSecret": "A personal secret that affects their arc",
      "startingState": "Where they are emotionally/mentally at Book 1",
      "endingState": "Where they end up in final book - CRITICAL for arc planning",
      "growthArc": "Brief description of their transformation journey"
    }
    // 4-6 characters total
  ],
  
  "seriesArc": {
    "stages": [
      {
        "bookNumber": 1,
        "stage": "setup",
        "purpose": "What this book accomplishes in the series",
        "keyEvents": ["Event 1", "Event 2", "Event 3"]
      },
      // One stage per book
      // Stages: setup -> escalation -> midpoint_twist -> collapse -> resolution
    ]
  },
  
  "mysteryPlan": [
    {
      "secret": "The actual secret to be revealed",
      "revealedInBook": 3,
      "earlyHints": [
        { "book": 1, "hint": "Subtle clue planted early" },
        { "book": 2, "hint": "Another hint building toward reveal" }
      ]
    }
    // 3-5 major secrets
  ],
  
  "relationshipMap": [
    {
      "characterA": "Character Name",
      "characterB": "Other Character Name",
      "relationshipType": "family|friend|enemy|romantic|mentor|rival",
      "initialTrust": 50,
      "hiddenTension": "Any underlying tension not obvious at start"
    }
    // All major relationships
  ]
}

CRITICAL RULES:
1. IMPOSSIBLE list must have at least 3 items - these are world rules that CANNOT be broken
2. Each character must have coreDesire and biggestFear - these drive all their decisions
3. Series arc must cover ALL ${numBooks} books
4. Mystery plan must have hints planted BEFORE reveals
5. Output ONLY valid JSON, no additional text`;
}

// Output type
interface SeriesBible {
  overview: {
    genre: string;
    tone: string;
    themes: string[];
    targetAudience: string;
  };
  worldRules: {
    possible: string[];
    impossible: string[];
    magicSystem?: string;
    technology?: string;
    society?: string;
    limitations: string[];
  };
  characters: {
    name: string;
    role: 'protagonist' | 'antagonist' | 'supporting';
    personalityTraits: string[];
    coreDesire: string;
    biggestFear: string;
    hiddenSecret: string;
    startingState: string;
    endingState: string;
    growthArc: string;
  }[];
  seriesArc: {
    stages: {
      bookNumber: number;
      stage: 'setup' | 'escalation' | 'midpoint_twist' | 'collapse' | 'resolution';
      purpose: string;
      keyEvents: string[];
    }[];
  };
  mysteryPlan: {
    secret: string;
    revealedInBook: number;
    earlyHints: { book: number; hint: string }[];
  }[];
  relationshipMap: {
    characterA: string;
    characterB: string;
    relationshipType: string;
    initialTrust: number;
    hiddenTension?: string;
  }[];
}
```

---

### PROMPT 2: SERIES MOMENTUM

```typescript
// ============================================
// PROMPT 2: SERIES MOMENTUM TRACKER
// ============================================

const SYSTEM_MOMENTUM_EXPERT = `You are a series stakes expert. 
You ensure each book feels BIGGER than the last.
You understand that YA readers want escalating tension and stakes.`;

function buildMomentumPrompt(
  seriesBible: SeriesBible,
  numBooks: number
): string {
  return `Create a series momentum profile showing how stakes escalate.

SERIES OVERVIEW:
${JSON.stringify(seriesBible.overview, null, 2)}

SERIES ARC:
${JSON.stringify(seriesBible.seriesArc, null, 2)}

NUMBER OF BOOKS: ${numBooks}

Generate as JSON array with EXACT structure:

[
  {
    "bookNumber": 1,
    "stakesLevel": "personal",
    "description": "Only the protagonist is at risk - their safety, their dreams, their future"
  },
  {
    "bookNumber": 2,
    "stakesLevel": "community",
    "description": "Now friends and family are affected - the circle widens"
  },
  {
    "bookNumber": 3,
    "stakesLevel": "city",
    "description": "An entire city or region is threatened"
  },
  {
    "bookNumber": 4,
    "stakesLevel": "world",
    "description": "The entire world faces destruction"
  },
  {
    "bookNumber": 5,
    "stakesLevel": "everything",
    "description": "Multiple worlds, reality itself, all existence at stake"
  }
]

STAKES LEVELS (must escalate, never decrease):
- personal: Only affects main character
- community: Affects friends, family, neighborhood
- city: Affects a city or region
- world: Affects the entire world
- everything: All reality at risk

CRITICAL RULES:
1. Stakes MUST escalate over books (personal -> everything)
2. Stakes level can NEVER decrease
3. Final book should be "world" or "everything"
4. Midpoint books should show major escalation
5. Description should match the series arc
6. Output ONLY valid JSON array`;
}

// Output type
interface SeriesMomentum {
  bookNumber: number;
  stakesLevel: 'personal' | 'community' | 'city' | 'world' | 'everything';
  description: string;
}[]
```

---

### PROMPT 3: VOICE PROFILE

```typescript
// ============================================
// PROMPT 3: CHARACTER VOICE PROFILE
// ============================================

const SYSTEM_VOICE_EXPERT = `You are a dialogue expert who creates distinct, 
memorable character voices. Each character should sound UNIQUE and CONSISTENT.`;

function buildVoiceProfilePrompt(
  characterName: string,
  personalityTraits: string[],
  age: string,
  genre: string
): string {
  return `Create a distinct voice profile for a YA character.

NAME: ${characterName}
PERSONALITY: ${personalityTraits.join(', ')}
AGE: ${age}
GENRE: ${genre}

Generate as JSON with EXACT structure:

{
  "speechStyle": "How they talk (e.g., 'short sentences, sarcastic, guarded' or 'flowery, poetic, formal')",
  "vocabularyLevel": "casual teen|academic|slang-heavy|formal|mix",
  "emotionalExpression": "How they show or hide feelings (e.g., 'hides fear with anger' or 'expresses everything openly')",
  "catchphrases": [
    "Unique phrase they might repeat",
    "Another signature expression"
  ],
  "speechPatterns": [
    "Pattern like 'Starts sentences with So...'",
    "Another pattern like 'Trails off mid-sentence when emotional'",
    "Third pattern if applicable"
  ],
  "dialogueExamples": [
    "Example of casual dialogue showing their voice",
    "Example of emotional dialogue showing their voice",
    "Example of tense dialogue showing their voice"
  ]
}

This profile will be used to ensure the character sounds CONSISTENT across all books.
Every line of dialogue they speak should match this profile.

CRITICAL RULES:
1. Speech style should match personality traits
2. Catchphrases should feel natural, not forced
3. Speech patterns should be unique to this character
4. Vocabulary level should match their background/age
5. Output ONLY valid JSON`;
}

// Output type
interface VoiceProfile {
  speechStyle: string;
  vocabularyLevel: string;
  emotionalExpression: string;
  catchphrases: string[];
  speechPatterns: string[];
  dialogueExamples: string[];
}
```

---

## PROMPT 4: BOOK OUTLINE 

---

```typescript
// ============================================
// PROMPT 4: BOOK OUTLINE
// ============================================

const SYSTEM_BOOK_ARCHITECT = `You are a YA story architect.

You expand a series into individual books while maintaining continuity, 
emotional growth, and narrative tension.

Each book must:
- Progress the main arc significantly
- Develop characters further with clear emotional beats
- Reveal only what is earned through proper setup
- Have its own satisfying arc while serving the series
- Escalate stakes appropriately for its position in series
- Follow the tension curve: setup → rise → peak → release

You understand:
- Book 1 establishes, Book 2 complicates, Book 3 twists, Book 4 breaks, Book 5 resolves
- Each book needs its own emotional journey
- Cliffhangers must be earned, not arbitrary
- Middle books need clear forward momentum`;

const USER_BOOK_OUTLINE = `Create a detailed outline for Book {bookNumber} using the SERIES BIBLE below.

═══════════════════════════════════════════════════════════════════════════════
SERIES BIBLE
═══════════════════════════════════════════════════════════════════════════════

OVERVIEW:
{seriesBible.overview}

WORLD RULES:
- Possible: {seriesBible.worldRules.possible}
- IMPOSSIBLE: {seriesBible.worldRules.impossible}
- Limitations: {seriesBible.worldRules.limitations}

CHARACTERS:
{seriesBible.characters.map(c => `
NAME: {c.name}
Role: {c.role}
Core Desire: {c.coreDesire}
Biggest Fear: {c.biggestFear}
Hidden Secret: {c.hiddenSecret}
Starting State: {c.startingState}
Ending State: {c.endingState}
Voice Profile: {c.voiceProfile}
`).join('\n')}

SERIES ARC:
{seriesBible.seriesArc.stages.map(s => `
Book {s.bookNumber} ({s.stage}): {s.purpose}
Key Events: {s.keyEvents}
`).join('\n')}

MYSTERY PLAN:
{seriesBible.mysteryPlan.map(m => `
Secret: {m.secret}
Revealed In: Book {m.revealedInBook}
Early Hints: {m.earlyHints}
`).join('\n')}

RELATIONSHIP MAP:
{seriesBible.relationshipMap.map(r => `
{r.characterA} ↔ {r.characterB}: {r.relationshipType}
Initial Trust: {r.initialTrust}/100
Hidden Tension: {r.hiddenTension}
`).join('\n')}

═══════════════════════════════════════════════════════════════════════════════
PREVIOUS BOOKS SUMMARY (for continuity)
═══════════════════════════════════════════════════════════════════════════════
{previousBooks.map(b => `
BOOK {b.bookNumber}: {b.title}
Purpose Accomplished: {b.bookPurpose}
Key Events: {b.keyPlotPoints}
Character Changes: {b.characterProgression}
Ending State: {b.ending.closing}
New Tension Created: {b.ending.newTension}
`).join('\n\n')}

═══════════════════════════════════════════════════════════════════════════════
SERIES MOMENTUM (Stakes Escalation)
═══════════════════════════════════════════════════════════════════════════════
Current Book {bookNumber} Stakes: {momentum.stakesLevel}
Description: {momentum.description}

═══════════════════════════════════════════════════════════════════════════════

Generate the following as a JSON object:

{
  "bookOverview": {
    "bookNumber": {bookNumber},
    "title": "Creative, genre-appropriate title",
    "coreTheme": "The central theme of THIS book",
    "seriesStage": "setup|escalation|midpoint_twist|collapse|resolution",
    "bookPurpose": "What changes/accomplishes in this book",
    "stakesLevel": "personal|community|city|world|everything",
    "wordCountTarget": 75000
  },

  "tensionCurve": {
    "start": 2,
    "incitingIncident": 4,
    "firstComplication": 6,
    "midpoint": 8,
    "falseHope": 5,
    "climax": 10,
    "resolution": 3,
    "pacingNotes": "How tension should flow through the book"
  },

  "characterProgression": [
    {
      "name": "Character Name",
      "startState": "Emotional/mental state at book start",
      "keyStruggles": ["struggle 1", "struggle 2"],
      "growthMoment": "When/how they change",
      "endState": "How they've changed by the end",
      "emotionalBeats": [
        {"chapter": 5, "beat": "Learns truth about mother"},
        {"chapter": 12, "beat": "Confronts fear of abandonment"}
      ]
    }
  ],

  "conflicts": {
    "external": {
      "description": "The external plot conflict",
      "antagonist": "Who/what opposes the protagonist",
      "obstacles": ["obstacle 1", "obstacle 2", "obstacle 3"],
      "resolution": "How this conflict resolves"
    },
    "internal": {
      "description": "The internal emotional conflict",
      "coreWound": "The deep fear/wound being confronted",
      "growthRequired": "What the character must learn",
      "resolution": "How they overcome internally"
    }
  },

  "keyPlotPoints": [
    {
      "beatNumber": 1,
      "chapterRange": "1-2",
      "beatType": "opening_image",
      "description": "Establish normal world and protagonist's flaw"
    },
    {
      "beatNumber": 2,
      "chapterRange": "3-4",
      "beatType": "inciting_incident",
      "description": "Event that disrupts the status quo"
    },
    {
      "beatNumber": 3,
      "chapterRange": "5-6",
      "beatType": "first_threshold",
      "description": "Protagonist commits to the journey"
    },
    {
      "beatNumber": 4,
      "chapterRange": "7-9",
      "beatType": "tests_allies_enemies",
      "description": "New world exploration, relationships form"
    },
    {
      "beatNumber": 5,
      "chapterRange": "10-11",
      "beatType": "midpoint",
      "description": "Major revelation or twist, stakes raised"
    },
    {
      "beatNumber": 6,
      "chapterRange": "12-13",
      "beatType": "all_is_lost",
      "description": "Lowest point, hope seems lost"
    },
    {
      "beatNumber": 7,
      "chapterRange": "14-15",
      "beatType": "dark_night_of_soul",
      "description": "Character finds inner strength"
    },
    {
      "beatNumber": 8,
      "chapterRange": "16-18",
      "beatType": "climax",
      "description": "Final confrontation, internal and external"
    },
    {
      "beatNumber": 9,
      "chapterRange": "19-20",
      "beatType": "resolution",
      "description": "New normal established, hooks for next book"
    }
  ],

  "reveals": [
    {
      "secret": "What is revealed",
      "chapterRevealed": 10,
      "revealMethod": "How it's discovered",
      "impactOnPlot": "How this changes everything",
      "impactOnCharacters": ["Character 1: reaction", "Character 2: reaction"],
      "requiredHints": 2,
      "plannedHints": [
        {"chapter": 3, "hint": "Subtle clue planted"},
        {"chapter": 7, "hint": "Another hint"}
      ]
    }
  ],

  "newElements": [
    {
      "type": "character|location|item|lore|organization",
      "name": "Element name",
      "introductionChapter": 5,
      "description": "What it is",
      "significance": "Why it matters to the story",
      "feelsNaturalBecause": "How it connects to existing elements"
    }
  ],

  "foreshadowing": [
    {
      "eventForeshadowed": "Major event in later book",
      "setupInThisBook": "How it's hinted",
      "subtlety": "subtle|moderate|obvious",
      "payoffBook": 4,
      "payoffChapter": 15
    }
  ],

  "callbacks": [
    {
      "originalEvent": "Event from previous book",
      "originalBook": 1,
      "originalChapter": 12,
      "callbackType": "emotional_payoff|callback|contrast|parallel",
      "callbackDescription": "How it's referenced/paid off",
      "callbackChapter": 8
    }
  ],

  "hooks": [
    {
      "chapter": 1,
      "hookType": "mystery|emotional|danger|romance|cliffhanger",
      "description": "What hooks the reader",
      "payoffPlanned": "When this resolves"
    }
  ],

  "ending": {
    "closingImage": "Final scene that mirrors/contrasts opening",
    "resolution": "How the book's main conflict resolves",
    "characterArcComplete": "How the protagonist has changed",
    "newTension": "What new question/danger is introduced",
    "cliffhanger": "If applicable, what leaves readers wanting more"
  },

  "chapters": [
    {
      "chapterNumber": 1,
      "title": "Chapter title (creative, thematic)",
      "chapterGoal": "What this chapter must accomplish for the story",
      "pov": "POV character name",
      "setting": "Where this takes place",
      "tensionLevel": 3,
      "tensionGoal": "increase|decrease|maintain",
      
      "scenes": [
        {
          "sceneNumber": 1,
          "setting": "Specific location",
          "timeOfDay": "morning|afternoon|evening|night",
          "characters": ["Character 1", "Character 2"],
          "whatHappens": "What occurs in this scene",
          "conflict": "The tension or conflict in this scene",
          "emotionalShift": "How characters feel before → after",
          "sensoryDetails": "Key sights, sounds, smells to include",
          "dialogue": {
            "keyLines": ["Important line 1", "Important line 2"],
            "tone": "emotional tone of dialogue"
          }
        }
      ],

      "activePlotThreads": ["Thread 1", "Thread 2"],
      "threadDevelopments": [
        {"thread": "Thread name", "development": "How it advances"}
      ],

      "characterMoments": [
        {
          "character": "Character name",
          "moment": "What happens to/with them",
          "emotionalBeat": "How they feel/react",
          "growth": "Any character development"
        }
      ],

      "foreshadowing": [
        {
          "hint": "The subtle clue or hint",
          "forEvent": "What it's hinting at",
          "subtlety": "subtle|moderate|obvious"
        }
      ],

      "hook": {
        "type": "mystery|emotional|danger|romance|cliffhanger",
        "description": "What makes reader want to continue",
        "payoffPlanned": "When/how this resolves"
      },

      "continuityCheck": [
        "Connects to Book 1, Chapter 5: previous similar situation",
        "Character remembers X from earlier book"
      ],

      "secretsRevealed": [],
      "secretsHinted": []
    }
  ]
}

═══════════════════════════════════════════════════════════════════════════════
CRITICAL RULES FOR BOOK OUTLINE
═══════════════════════════════════════════════════════════════════════════════

1. CONTINUITY ENFORCEMENT
   - Every character state must match where they ended in previous book
   - No "resetting" character growth
   - Reference specific events from previous books

2. TENSION CURVE ADHERENCE
   - Early chapters: lower tension, building
   - Mid chapters: escalate toward midpoint peak
   - Late chapters: build to climax, then resolution
   - Never flat-line at same tension throughout

3. FORESHADOWING REQUIREMENTS
   - Every major reveal must have at least 2 hints planted before
   - Hints should be subtle enough that readers don't immediately guess
   - Track hints in "foreshadowing" array

4. HOOK PLACEMENT
   - Every chapter must have a hook at or near the end
   - Vary hook types (not always cliffhangers)
   - Emotional hooks often more effective than action hooks

5. CHARACTER VOICE CONSISTENCY
   - Note character's voice profile in scene planning
   - POV character's internal monologue matches their established voice
   - Dialogue should feel distinct per character

6. NOTHING FROM NOWHERE
   - Every new element must connect to something established
   - No sudden new powers without prior hint
   - No character acting "out of character" without trauma/growth reason

7. SERIES STAGE APPROPRIATENESS
   - Book 1: Setup, discovery, forming relationships
   - Book 2: Complication, deepening, first major tests
   - Book 3: Midpoint twist, paradigm shift, stakes raise
   - Book 4: Collapse, lowest point, seems impossible
   - Book 5: Resolution, mastery, final confrontation

Output ONLY valid JSON. No additional text before or after.`;
```

---

## PROMPT 5: TENSION CURVE GENERATION

---

```typescript
// ============================================
// PROMPT 5: TENSION CURVE GENERATION
// ============================================

const SYSTEM_TENSION_EXPERT = `You are a YA fiction pacing expert.

You understand that:

1. TENSION IS NOT LINEAR
   - Real stories breathe - tension rises and falls
   - Readers need moments of relief before next escalation
   - Constant high tension becomes exhausting and meaningless

2. PACING VARIES BY BOOK POSITION
   - Book 1: Slower start, gentle escalation
   - Middle books: Faster start, more complications
   - Finale: High tension throughout, briefest relief

3. TENSION TYPES
   - Physical danger (character at risk)
   - Emotional danger (heart at risk)
   - Mystery tension (need to know)
   - Relational tension (will they/won't they)
   - Time tension (deadline approaching)

4. THE FALSE HOPE
   - After midpoint, give characters (and readers) hope
   - Then crush it for the "all is lost" moment
   - This contrast makes the climax more powerful

You create tension profiles that make books IMPOSSIBLE to put down.`;

const USER_TENSION_CURVE = `Create a tension curve for Book {bookNumber} of a YA series.

═══════════════════════════════════════════════════════════════════════════════
BOOK CONTEXT
═══════════════════════════════════════════════════════════════════════════════

Title: {bookTitle}
Purpose: {bookPurpose}
Series Stage: {seriesStage}
Stakes Level: {stakesLevel}

External Conflict: {externalConflict}
Internal Conflict: {internalConflict}

Key Plot Points:
{keyPlotPoints.map(p => `- ${p.beatType}: ${p.description}`).join('\n')}

Total Chapters: {chapterCount}

═══════════════════════════════════════════════════════════════════════════════

Generate as JSON:

{
  "tensionCurve": {
    "start": 2,
    "incitingIncident": 4,
    "firstComplication": 6,
    "midpoint": 8,
    "falseHope": 5,
    "climax": 10,
    "resolution": 3,
    "pacingExplanation": "Why this curve works for this book"
  },

  "chapterTensionPoints": [
    {
      "chapterNumber": 1,
      "tensionLevel": 2,
      "tensionGoal": "maintain",
      "tensionType": "emotional",
      "description": "Establish normal, hint at protagonist's want/flaw",
      "readerFeeling": "Curious about character, invested in their normal life"
    },
    {
      "chapterNumber": 2,
      "tensionLevel": 3,
      "tensionGoal": "increase",
      "tensionType": "mystery",
      "description": "Something slightly off, questions raised",
      "readerFeeling": "Intrigued, wondering what's wrong"
    },
    // ... for ALL chapters
  ],

  "tensionBeats": {
    "lowestPoint": {
      "chapter": 1,
      "description": "Opening calm before storm"
    },
    "firstMajorSpike": {
      "chapter": 4,
      "description": "Inciting incident hits"
    },
    "midpointSpike": {
      "chapter": 10,
      "description": "Major twist/revelation"
    },
    "lowestAfterMidpoint": {
      "chapter": 12,
      "description": "False hope - calm before real storm"
    },
    "climaxPeak": {
      "chapter": 17,
      "description": "Maximum tension - everything on the line"
    },
    "resolutionLevel": {
      "chapter": 20,
      "description": "Emotional release, but changed forever"
    }
  },

  "breathingRooms": [
    {
      "afterChapter": 6,
      "chapter": 7,
      "type": "character_moment",
      "description": "Quiet conversation, relationship deepens"
    },
    {
      "afterChapter": 12,
      "chapter": 13,
      "type": "false_hope",
      "description": "Characters think they've won, brief celebration"
    }
  ],

  "escalationPattern": "Description of how stakes escalate through the book"
}

═══════════════════════════════════════════════════════════════════════════════
TENSION RULES
═══════════════════════════════════════════════════════════════════════════════

1. TENSION VALUES: 1-10 scale
   - 1-2: Calm, normal, safe
   - 3-4: Unease, questions, mild concern
   - 5-6: Real danger, emotional weight, stakes clear
   - 7-8: High danger, racing heart, can't put down
   - 9-10: Peak tension, everything at stake, maximum engagement

2. RESOLUTION TENSION
   - Should be 2-4 (never 1)
   - Character is changed, some tension remains
   - Hooks for next book should maintain mild tension

3. BREATHING ROOMS
   - Every 3-5 chapters needs a lower-tension moment
   - These make the high-tension moments hit harder
   - Use for character development, relationship building

4. SERIES STAGE IMPACT
   - Setup books (1-2): Start lower, more breathing room
   - Midpoint (3): Higher average tension, biggest twist
   - Collapse (4): Sustained high tension, briefest relief
   - Resolution (5): High throughout, emotional release at end

Output ONLY valid JSON.`;
```

---

## PROMPT 6: MEMORY INITIALIZATION

---

```typescript
// ============================================
// PROMPT 6: MEMORY INITIALIZATION
// ============================================

const SYSTEM_MEMORY_KEEPER = `You are a story continuity expert.

You track and maintain the "memory" of a story across books and chapters:

1. CANON LOG
   - Facts that CANNOT change once established
   - World rules, character traits, past events
   - Breaking canon destroys reader trust

2. RELATIONSHIP LOG
   - Dynamic tracking of how characters relate
   - Trust levels, tensions, history
   - Changes over time based on events

3. MYSTERY LOG
   - Secrets, clues, revelations
   - What's hidden, what's revealed, what's hinted
   - When each mystery is resolved

4. CHARACTER KNOWLEDGE STATE
   - What each character KNOWS at this point
   - What they DON'T KNOW (critical for preventing out-of-character knowledge)
   - What they BELIEVE (may be wrong, creates dramatic irony)

You are meticulous about consistency and prevent contradictions.
You understand that characters can only act on what THEY know, not what the author knows.`;

const USER_MEMORY_INIT = `Initialize story memory for Book {bookNumber}.

═══════════════════════════════════════════════════════════════════════════════
SERIES BIBLE
═══════════════════════════════════════════════════════════════════════════════

{seriesBible}

═══════════════════════════════════════════════════════════════════════════════
BOOK OUTLINE
═══════════════════════════════════════════════════════════════════════════════

{bookOutline}

═══════════════════════════════════════════════════════════════════════════════
PREVIOUS BOOK MEMORY (if Book 2+)
═══════════════════════════════════════════════════════════════════════════════

{previousBookMemory}

═══════════════════════════════════════════════════════════════════════════════

Generate as JSON:

{
  "canonLog": {
    "worldFacts": [
      {
        "fact": "The dream realm exists parallel to the waking world",
        "category": "world",
        "establishedIn": "Series Bible",
        "cannotChange": true,
        "impactOnStory": "Magic system foundation"
      }
    ],
    "characterFacts": [
      {
        "fact": "Maya's mother was a dream weaver",
        "category": "character",
        "character": "Maya",
        "establishedIn": "Book 1, Chapter 8",
        "cannotChange": true,
        "impactOnStory": "Maya's heritage, connection to antagonist"
      }
    ],
    "eventFacts": [
      {
        "fact": "Maya nearly died in the dream realm in Book 1",
        "category": "event",
        "establishedIn": "Book 1, Chapter 15",
        "cannotChange": true,
        "impactOnStory": "Maya's lingering fear of dream walking"
      }
    ],
    "rulesFacts": [
      {
        "fact": "Dream weavers cannot enter their own dreams",
        "category": "rule",
        "establishedIn": "Series Bible",
        "cannotChange": true,
        "impactOnStory": "Maya's limitation in using her power"
      }
    ]
  },

  "relationshipLog": [
    {
      "characterA": "Maya",
      "characterB": "Kai",
      "relationshipType": "romantic_interest",
      "trustLevel": 75,
      "tensionLevel": 20,
      "status": "growing_closer",
      "keyMoments": [
        {"event": "Kai saved Maya from nightmare", "impact": "Trust increased"},
        {"event": "Maya kept secret from Kai", "impact": "Mild tension"}
      ],
      "hiddenFeelings": {
        "characterA": "Falling in love but scared",
        "characterB": "In love, waiting for right moment"
      }
    }
  ],

  "mysteryLog": {
    "activeMysteries": [
      {
        "mystery": "Who is The Weaver really?",
        "importance": "critical",
        "cluesPlanted": [
          {"clue": "Knows too much about dream weaving", "book": 1, "chapter": 10},
          {"clue": "Has connection to Maya's mother", "book": 1, "chapter": 15}
        ],
        "cluesRemaining": 2,
        "revealedInBook": 4,
        "currentTheory": "Readers suspect connection to Maya's past"
      }
    ],
    "resolvedMysteries": [],
    "pendingRevelations": [
      {
        "secret": "The Weaver was Maya's mother's apprentice",
        "importance": "major",
        "revealedInBook": 4,
        "setupRequired": 2,
        "setupsCompleted": 1
      }
    ]
  },

  "characterKnowledgeStates": [
    {
      "character": "Maya",
      "age": "17",
      "location": "The Veiled City",
      "emotionalState": "Determined but haunted by Book 1 events",
      
      "knows": [
        "She is a dream weaver",
        "Her mother was a dream weaver",
        "The Weaver is a threat to the city",
        "Kai cares about her",
        "She nearly died in the dream realm"
      ],
      
      "doesNOTKnow": [
        "The Weaver's true identity",
        "Her mother's full history",
        "The source of the nightmare plague",
        "Kai's true feelings for her",
        "The deeper conspiracy in the city"
      ],
      
      "believes": [
        "The Weaver is just an enemy to defeat",
        "Her mother abandoned her",
        "She can learn to control her power alone",
        "The nightmare plague is The Weaver's doing"
      ],
      
      "wrongBeliefs": [
        "Her mother abandoned her (WRONG: mother was protecting her)",
        "The Weaver is purely evil (WRONG: complex motivation)"
      ],
      
      "emotionalMemories": [
        {
          "event": "Nearly lost in dream realm",
          "impact": "Fear of losing control",
          "intensity": 8,
          "lingersUntil": 4,
          "triggeredBy": "deep dream walking, losing control"
        }
      ],
      
      "currentGoals": [
        "Master her dream walking ability",
        "Protect the city from nightmares",
        "Find out more about her mother"
      ],
      
      "currentFears": [
        "Losing control in the dream realm",
        "Someone she cares about getting hurt",
        "Becoming like The Weaver"
      ]
    }
  ],

  "worldStateAtBookStart": {
    "locationStates": [
      {
        "location": "The Veiled City",
        "status": "Increasing nightmare incidents",
        "changesFromPreviousBook": "More people affected by plague"
      }
    ],
    "ongoingThreats": [
      {
        "threat": "Nightmare plague",
        "currentStatus": "Spreading slowly",
        "urgency": "moderate"
      }
    ],
    "activeOrganizations": [
      {
        "organization": "Dream Guard",
        "status": "Struggling to contain threat",
        "relationshipToProtagonist": "Allies, but Maya isn't fully trusted"
      }
    ]
  }
}

═══════════════════════════════════════════════════════════════════════════════
MEMORY INITIALIZATION RULES
═══════════════════════════════════════════════════════════════════════════════

1. KNOWLEDGE ASYMMETRY
   - Characters should have different knowledge states
   - Some things only the reader knows (dramatic irony)
   - Some things only certain characters know (secrets)

2. EMOTIONAL MEMORY
   - Major events from previous books should have emotional weight
   - Intensity 1-10 determines how much it affects current behavior
   - lingersUntil = when the character fully processes/heals

3. WRONG BELIEFS
   - Characters can believe things that are FALSE
   - These create opportunities for revelation and growth
   - Track what they believe wrong for payoff moments

4. RELATIONSHIP TRACKING
   - Trust and tension are NOT inverses
   - You can trust someone AND have tension with them
   - Key moments should update these values

5. WORLD STATE
   - Track changes to locations, threats, organizations
   - Previous books' events should have visible impact
   - Don't reset the world between books

Output ONLY valid JSON.`;
```

---

## PROMPT 7: CHAPTER WRITING

---

```typescript
// ============================================
// PROMPT 7: CHAPTER WRITING
// ============================================

const SYSTEM_NOVELIST = `You are a YA novelist with expertise in:

1. IMMERSIVE PROSE
   - Strong sensory detail (sight, sound, smell, touch, taste)
   - Active verbs, minimal passive voice
   - Varied sentence length for rhythm

2. CHARACTER VOICE
   - Each character has distinct speech patterns
   - Internal monologue matches character's personality
   - Dialogue reveals character without exposition

3. SHOW DON'T TELL
   - Emotions through actions, not labels
   - Setting through interaction, not description dumps
   - Relationships through behavior, not statements

4. PACING
   - Short sentences for action/tension
   - Longer sentences for reflection/atmosphere
   - Scene breaks for time jumps

5. YA SPECIFICS
   - Authentic teen voice (not how adults think teens talk)
   - High emotional stakes (everything feels like the end of the world)
   - Hope even in darkness (YA needs light at the end)

Write prose that readers cannot put down.
Every sentence should earn its place.
Every paragraph should do double duty (advance plot AND develop character).`;

const USER_CHAPTER_WRITE = `Write Chapter {chapterNumber} for Book {bookNumber}: "{bookTitle}"

═══════════════════════════════════════════════════════════════════════════════
CHAPTER PLAN
═══════════════════════════════════════════════════════════════════════════════

Title: {chapter.title}
Goal: {chapter.chapterGoal}
POV Character: {chapter.pov}
Setting: {chapter.setting}
Tension Level: {chapter.tensionLevel}/10
Tension Goal: {chapter.tensionGoal}

Scenes:
{chapter.scenes.map(s => `
SCENE {s.sceneNumber}
Setting: {s.setting} ({s.timeOfDay})
Characters: {s.characters.join(', ')}
What Happens: {s.whatHappens}
Conflict: {s.conflict}
Emotional Shift: {s.emotionalShift}
Sensory Focus: {s.sensoryDetails}
Key Dialogue: {s.dialogue.keyLines}
`).join('\n')}

Foreshadowing to Plant:
{chapter.foreshadowing.map(f => `- {f.hint} (for: {f.forEvent}, subtlety: {f.subtlety})').join('\n')}

Hook at Chapter End:
Type: {chapter.hook.type}
Description: {chapter.hook.description}

═══════════════════════════════════════════════════════════════════════════════
POV CHARACTER: {povCharacter.name}
═══════════════════════════════════════════════════════════════════════════════

Core Desire: {povCharacter.coreDesire}
Biggest Fear: {povCharacter.biggestFear}
Personality: {povCharacter.personality}

VOICE PROFILE:
- Speech Style: {povCharacter.voiceProfile.speechStyle}
- Vocabulary: {povCharacter.voiceProfile.vocabularyLevel}
- Emotional Expression: {povCharacter.voiceProfile.emotionalExpression}
- Speech Patterns: {povCharacter.voiceProfile.speechPatterns}

CURRENT STATE:
- Emotional State: {characterKnowledge.emotionalState}
- Current Goals: {characterKnowledge.currentGoals}
- Current Fears: {characterKnowledge.currentFears}
- Emotional Memories Affecting Them: {characterKnowledge.emotionalMemories}

═══════════════════════════════════════════════════════════════════════════════
WHAT {povCharacter.name.toUpperCase()} KNOWS RIGHT NOW
═══════════════════════════════════════════════════════════════════════════════

KNOWS:
{characterKnowledge.knows.map(k => `✓ ${k}`).join('\n')}

DOES NOT KNOW (CRITICAL - CHARACTER CANNOT ACT ON THIS):
{characterKnowledge.doesNOTKnow.map(d => `✗ ${d}`).join('\n')}

BELIEVES (may be wrong):
{characterKnowledge.believes.map(b => `? ${b}`).join('\n')}

═══════════════════════════════════════════════════════════════════════════════
WORLD RULES (CANNOT BE BROKEN)
═══════════════════════════════════════════════════════════════════════════════

POSSIBLE:
{worldRules.possible.map(p => `• ${p}`).join('\n')}

IMPOSSIBLE (STRICTLY FORBIDDEN):
{worldRules.impossible.map(i => `✕ ${i}`).join('\n')}

LIMITATIONS:
{worldRules.limitations.map(l => `⚠ ${l}`).join('\n')}

═══════════════════════════════════════════════════════════════════════════════
CONTEXT FROM PREVIOUS CHAPTERS
═══════════════════════════════════════════════════════════════════════════════

COMPRESSED SUMMARY (older chapters):
{compressedSummary}

RECENT CHAPTERS (last 2-3, full text):
{recentChapters}

═══════════════════════════════════════════════════════════════════════════════
OTHER CHARACTERS IN THIS CHAPTER
═══════════════════════════════════════════════════════════════════════════════

{otherCharacters.map(c => `
{c.name}:
- Relationship to {povCharacter.name}: {c.relationship}
- Voice: {c.voiceProfile.speechStyle}
- What {povCharacter.name} knows about them: {c.knownByPOV}
`).join('\n')}

═══════════════════════════════════════════════════════════════════════════════
EMOTIONAL TRIGGERS TO CONSIDER
═══════════════════════════════════════════════════════════════════════════════

{emotionalTriggers.map(t => `
EVENT: {t.event}
Impact on {povCharacter.name}: {t.impact}
Intensity: {t.intensity}/10
Might be triggered by: {t.triggeredBy}
`).join('\n')}

═══════════════════════════════════════════════════════════════════════════════
CALLBACKS TO INCLUDE
═══════════════════════════════════════════════════════════════════════════════

{callbacks.map(cb => `
Original (Book {cb.originalBook}, Ch {cb.originalChapter}): {cb.originalEvent}
Callback Type: {cb.callbackType}
How to Reference: {cb.callbackDescription}
`).join('\n')}

═══════════════════════════════════════════════════════════════════════════════

Write the complete chapter (2500-3500 words).

REQUIREMENTS:
1. Start directly with action/scene - no chapter number or title in output
2. Follow the scene breakdown closely
3. POV character's internal monologue matches their voice profile
4. Other characters speak in their established voices
5. Include ALL foreshadowing hints naturally
6. End with the specified hook type
7. Maintain tension level throughout
8. Show emotional triggers affecting POV character where appropriate
9. Include callbacks naturally, not forced
10. NO knowledge the POV character doesn't have

DIALOGUE RULES:
- Each character speaks distinctly
- Avoid speech attribution beyond "said" unless necessary
- Use action beats for attribution
- Subtext over on-the-nose dialogue

PROSE RULES:
- Strong verbs, minimal adverbs
- Sensory details in every scene
- Vary sentence length for rhythm
- End paragraphs with hooks when possible

Start writing now.`;
```

---

## PROMPT 8: MEMORY UPDATE (CRITICAL)

---

```typescript
// ============================================
// PROMPT 8: MEMORY UPDATE (CRITICAL)
// ============================================

const SYSTEM_MEMORY_UPDATER = `You are a story continuity expert updating memory after a chapter.

This is the MOST CRITICAL step for series consistency.

You must:
1. Preserve ALL existing memory (only ADD, never DELETE from canon)
2. Update character knowledge ONLY based on what explicitly happened in the chapter
3. Track relationship changes based on interactions
4. Note any new facts, clues, or mysteries introduced
5. Update emotional states based on events

IMPORTANT RULES:
- Characters can only learn what they EXPERIENCED or were TOLD
- Off-screen learning is FORBIDDEN
- If a character wasn't present for information, they DON'T know it
- Emotional impacts must match event intensity
- Relationship changes need cause-and-effect`;

const USER_MEMORY_UPDATE = `Update story memory after Chapter {chapterNumber}.

═══════════════════════════════════════════════════════════════════════════════
PREVIOUS MEMORY STATE
═══════════════════════════════════════════════════════════════════════════════

{previousMemory}

═══════════════════════════════════════════════════════════════════════════════
NEW CHAPTER CONTENT
═══════════════════════════════════════════════════════════════════════════════

{chapterContent}

═══════════════════════════════════════════════════════════════════════════════
CHAPTER PLAN (what was supposed to happen)
═══════════════════════════════════════════════════════════════════════════════

{chapterPlan}

═══════════════════════════════════════════════════════════════════════════════
CHARACTERS PRESENT IN THIS CHAPTER
═══════════════════════════════════════════════════════════════════════════════

{charactersPresent}

═══════════════════════════════════════════════════════════════════════════════

Generate the UPDATED memory as JSON:

{
  "canonLog": {
    "worldFacts": [
      // PRESERVE ALL EXISTING + ADD NEW
      {"fact": "existing fact", "preserved": true},
      {"fact": "NEW fact from this chapter", "establishedIn": "Book {bookNumber}, Chapter {chapterNumber}", "new": true}
    ],
    "characterFacts": [
      // PRESERVE ALL + ADD NEW character facts revealed
    ],
    "eventFacts": [
      // PRESERVE ALL + ADD NEW events that occurred
    ],
    "rulesFacts": [
      // PRESERVE ALL + ADD NEW rules established
    ]
  },

  "relationshipLog": [
    {
      "characterA": "Maya",
      "characterB": "Kai",
      "relationshipType": "romantic_interest",
      "trustLevel": 78, // UPDATED based on chapter
      "tensionLevel": 25, // UPDATED based on chapter
      "status": "growing_closer",
      "changesThisChapter": [
        {"event": "Maya almost told Kai her secret", "impact": "Trust +3, Tension +5"}
      ],
      "keyMoments": [
        // PRESERVE ALL + ADD NEW moments from this chapter
      ]
    }
  ],

  "mysteryLog": {
    "activeMysteries": [
      {
        "mystery": "Who is The Weaver?",
        "cluesPlanted": [
          // PRESERVE ALL + ADD NEW clues from this chapter
        ],
        "cluesRevealedThisChapter": ["new clue if any"],
        "readerUnderstanding": "How close readers are to solving"
      }
    ],
    "resolvedMysteries": [
      // Move here if solved this chapter
    ],
    "newMysteriesIntroduced": [
      // Any NEW mysteries introduced this chapter
    ]
  },

  "characterKnowledgeStates": [
    {
      "character": "Maya",
      
      "newlyLearned": [
        "Something she learned this chapter"
      ],
      
      "knows": [
        // PREVIOUS KNOWLEDGE + NEWLY LEARNED
      ],
      
      "doesNOTKnow": [
        // REMOVE items she learned, KEEP everything else
        // DO NOT add things she didn't learn this chapter
      ],
      
      "believes": [
        // PRESERVE unless chapter changed belief
      ],
      
      "wrongBeliefs": [
        // PRESERVE unless chapter corrected a wrong belief
      ],
      
      "emotionalState": "Updated based on chapter events",
      
      "newEmotionalMemories": [
        {
          "event": "Something significant from this chapter",
          "impact": "How it affects them emotionally",
          "intensity": 7,
          "lingersUntil": 4,
          "triggeredBy": "what might trigger this memory"
        }
      ],
      
      "currentGoals": [
        // UPDATE if chapter changed goals
      ],
      
      "currentFears": [
        // UPDATE if chapter changed fears
      ]
    }
  ],

  "chapterSummary": {
    "keyEvents": ["Event 1", "Event 2", "Event 3"],
    "characterChanges": ["Maya: more trusting of Kai"],
    "newClues": ["Clue introduced"],
    "emotionalShifts": ["Maya: scared → determined"],
    "tensionState": 6,
    "hookState": "Mystery introduced about the necklace"
  },

  "continuityValidation": {
    "noContradictionsFound": true,
    "potentialIssues": [],
    "notesForFutureChapters": [
      "Remember: Maya now knows X but not Y",
      "The necklace detail should pay off in Book 3"
    ]
  }
}

═══════════════════════════════════════════════════════════════════════════════
UPDATE RULES
═══════════════════════════════════════════════════════════════════════════════

1. KNOWLEDGE UPDATES
   - ONLY add to "knows" if character directly experienced/learned it
   - ONLY remove from "doesNOTKnow" if they learned it
   - DO NOT give characters knowledge they weren't present for

2. EMOTIONAL MEMORY
   - Only add if event was emotionally significant (intensity 6+)
   - Include triggers for when this memory might resurface

3. RELATIONSHIPS
   - Trust/Tension should change by small amounts (1-10 points)
   - Major changes need corresponding events

4. MYSTERIES
   - Add clues only if explicitly mentioned
   - Mark as resolved only if fully answered

5. PRESERVATION
   - NEVER remove from canon unless contradicted by new canon
   - Build UP memory, don't replace it

Output ONLY valid JSON with the COMPLETE updated memory state.`;
```

---

## PROMPT 9: CONSISTENCY CHECK

---

```typescript
// ============================================
// PROMPT 9: CONSISTENCY CHECK
// ============================================

const SYSTEM_CONSISTENCY_CHECKER = `You are a strict story consistency auditor.

Your job is to find ANY issues that would break reader immersion:

1. CHARACTER INCONSISTENCIES
   - Acting against established personality
   - Knowing things they shouldn't know
   - Forgetting things they should know
   - Wrong emotional state for their journey

2. PLOT HOLES
   - Events that contradict earlier events
   - Solutions that come from nowhere
   - Forgotten plot threads

4. WORLD RULE VIOLATIONS
   - Breaking established "impossible" rules
   - Magic working differently than established
   - Characters defying established limitations

5. FORESHADOWING ISSUES
   - Major events without setup
   - Payoffs without earlier hints
   - Mysteries solved without clues

You are the reader's advocate. Be strict.
Every issue you catch prevents a reader from throwing the book across the room.`;

const USER_CONSISTENCY_CHECK = `Review this chapter for inconsistencies.

═══════════════════════════════════════════════════════════════════════════════
SERIES BIBLE
═══════════════════════════════════════════════════════════════════════════════

{seriesBible}

═══════════════════════════════════════════════════════════════════════════════
CURRENT MEMORY STATE
═══════════════════════════════════════════════════════════════════════════════

{memoryState}

═══════════════════════════════════════════════════════════════════════════════
CHAPTER TO CHECK
═══════════════════════════════════════════════════════════════════════════════

{chapterContent}

═══════════════════════════════════════════════════════════════════════════════
CHAPTER PLAN
═══════════════════════════════════════════════════════════════════════════════

{chapterPlan}

═══════════════════════════════════════════════════════════════════════════════

Check for issues and output as JSON:

{
  "overallStatus": "pass|minor_issues|major_issues|fail",
  "summary": "Brief overall assessment",

  "characterInconsistencies": [
    {
      "character": "Maya",
      "issue": "Knows about the underground tunnel but wasn't present when it was discovered",
      "severity": "major",
      "how_to_fix": "Remove her knowledge, or add a scene where someone tells her"
    }
  ],

  "knowledgeViolations": [
    {
      "character": "Maya",
      "knowsButShouldnt": "The Weaver's identity",
      "reason": "This information hasn't been revealed to her yet",
      "severity": "critical"
    }
  ],

  "worldRuleViolations": [
    {
      "rule": "Dream weavers cannot enter their own dreams",
      "violation": "Maya enters her own dream to confront her fear",
      "severity": "critical",
      "how_to_fix": "She should enter someone else's dream, or find another solution"
    }
  ],

  "plotHoles": [
    {
      "description": "Character suddenly has a weapon that wasn't established",
      "severity": "minor",
      "how_to_fix": "Add earlier mention of them carrying it, or remove the weapon"
    }
  ],

  "foreshadowingIssues": [
    {
      "event": "Sudden revelation about mother's diary",
      "issue": "Diary never mentioned before this chapter",
      "severity": "moderate",
      "how_to_fix": "Plant mention of diary in earlier chapter"
    }
  ],

  "voiceIssues": [
    {
      "character": "Kai",
      "issue": "Speaking too formally, not matching his casual teen voice profile",
      "examples": ["'I shall accompany you' instead of 'I'll come with you'"],
      "severity": "minor"
    }
  ],

  "tensionIssues": {
    "expectedLevel": 7,
    "actualFeeling": 4,
    "issue": "Chapter feels too calm for where it should be in tension curve",
    "suggestions": ["Add time pressure", "Raise stakes in dialogue"]
  },

  "emotionalContinuityIssues": [
    {
      "character": "Maya",
      "issue": "Doesn't react to entering dream realm despite near-death trauma from Book 1",
      "severity": "moderate",
      "emotionalMemoryTriggered": "Almost died in dream realm",
      "suggestedFix": "Add moment of hesitation, flashback, or physical reaction"
    }
  ],

  "continuityErrors": [
    {
      "error": "Chapter says it's morning but previous chapter ended at midnight",
      "severity": "minor"
    }
  ],

  "positiveFindings": [
    "Character voices are distinct and consistent",
    "Foreshadowing planted naturally",
    "Emotional callbacks work well"
  ],

  "requiredChanges": [
    {
      "priority": "critical",
      "issue": "...",
      "fix": "..."
    }
  ],

  "suggestedImprovements": [
    {
      "suggestion": "Add more sensory detail in the cave scene",
      "impact": "Will increase immersion"
    }
  ]
}

═══════════════════════════════════════════════════════════════════════════════
SEVERITY LEVELS
═══════════════════════════════════════════════════════════════════════════════

critical: Must fix before publication - breaks story logic
major: Should fix - noticeable to attentive readers  
moderate: Fix if possible - may bother some readers
minor: Optional fix - polish level

Be strict but fair. Not everything needs to be perfect, but story-breaking issues must be caught.

Output ONLY valid JSON.`;
```

---

## PROMPT 10: VOICE PROFILE GENERATION

---

```typescript
// ============================================
// PROMPT 10: VOICE PROFILE GENERATION
// ============================================

const SYSTEM_VOICE_EXPERT = `You are a dialogue expert who creates distinct, memorable character voices.

You understand that voice is MORE than just vocabulary:

1. SPEECH PATTERNS
   - Sentence length preferences
   - How they start/end sentences
   - Pause patterns (ellipses, dashes)
   - Questions vs statements ratio

2. EMOTIONAL EXPRESSION
   - How they show anger
   - How they show vulnerability
   - How they hide feelings
   - What they NEVER say

3. VOCABULARY
   - Education level
   - Slang usage
   - Technical terms they'd use
   - Words they'd NEVER use

4. UNIQUE ELEMENTS
   - Catchphrases (but not overused)
   - Verbal tics
   - Topics they always return to
   - Humor style

Each character should be identifiable from dialogue alone.`;

const USER_VOICE_PROFILE = `Create a distinct voice profile for a YA character.

═══════════════════════════════════════════════════════════════════════════════
CHARACTER INFO
═══════════════════════════════════════════════════════════════════════════════

Name: {characterName}
Age: {age}
Role: {role}

Personality Traits: {personalityTraits}
Core Desire: {coreDesire}
Biggest Fear: {biggestFear}
Backstory: {backstory}

Genre: {genre}

═══════════════════════════════════════════════════════════════════════════════

Generate as JSON:

{
  "voiceProfile": {
    "speechStyle": "One-line description of HOW they talk (e.g., 'Short, clipped sentences. Sarcastic deflection. Rarely says what they mean.')",
    
    "vocabularyLevel": "casual teen|academic|slang-heavy|formal|mixed",
    
    "emotionalExpression": {
      "showsAngerBy": "How they act when angry (e.g., 'Gets quiet, speaks in short sentences, avoids eye contact')",
      "showsVulnerabilityBy": "How they show softer emotions (e.g., 'Changes subject, makes jokes, physically distances')",
      "hidesFeelingsBy": "Their defense mechanisms",
      "neverShows": "Emotions they never display"
    },
    
    "sentencePatterns": {
      "typicalLength": "short|medium|long|varied",
      "oftenBeginsWith": ["Common sentence starters"],
      "oftenEndsWith": ["Common sentence enders"],
      "usesPauseMarkers": "often|sometimes|rarely",
      "examples": [
        "Example sentence 1 showing their voice",
        "Example sentence 2 showing their voice"
      ]
    },
    
    "catchphrases": {
      "common": ["Phrase they say often (max 2-3)"],
      "whenStressed": "What they say under pressure",
      "whenHappy": "What they say when things are good",
      "underBreath": "What they mutter"
    },
    
    "vocabulary": {
      "usesSlang": true|false,
      "slangExamples": ["slang word 1", "slang word 2"],
      "neverSays": ["Words/phrases they'd never use"],
      "favoriteWords": ["Words they use more than average"],
      "technicalTerms": ["Any specialized vocabulary they'd use"]
    },
    
    "dialogueStyle": {
      "asksQuestions": "often|sometimes|rarely",
      "givesCommands": "often|sometimes|rarely",
      "usesSarcasm": "often|sometimes|rarely|never",
      "interruptsOthers": "often|sometimes|rarely",
      "trailsOff": "often|sometimes|rarely"
    },
    
    "internalMonologueStyle": {
      "description": "How their thoughts sound vs their speech",
      "moreHonestThanSpeech": true|false,
      "moreEmotionalThanSpeech": true|false,
      "example": "Example of their internal thought process"
    },
    
    "uniqueIdentifiers": [
      "Unique thing 1 about their speech",
      "Unique thing 2 about their speech"
    ],
    
    "sampleDialogues": [
      {
        "situation": "Under stress",
        "dialogue": "\"Line showing their voice under stress.\""
      },
      {
        "situation": "Happy moment",
        "dialogue": "\"Line showing their voice when happy.\""
      },
      {
        "situation": "Confrontation",
        "dialogue": "\"Line showing their voice in conflict.\""
      },
      {
        "situation": "Tender moment",
        "dialogue": "\"Line showing their voice when vulnerable.\""
      }
    ]
  }
}

═══════════════════════════════════════════════════════════════════════════════
VOICE RULES
═══════════════════════════════════════════════════════════════════════════════

1. Avoid clichés like "always says 'like'" for teens
2. Voice should reflect personality and backstory
3. Give each character a distinct rhythm
4. Consider how their core desire/fear affects speech
5. Make sure voice fits genre and setting

Output ONLY valid JSON.`;
```

---

## PROMPT 11: READER HOOK GENERATION

---

```typescript
// ============================================
// PROMPT 11: READER HOOK GENERATION
// ============================================

const SYSTEM_HOOK_EXPERT = `You are an expert at creating reader hooks that make people say "just one more chapter."

You understand that hooks are not just cliffhangers:

1. HOOK TYPES
   - MYSTERY: An unanswered question
   - EMOTIONAL: A character moment readers care about
   - DANGER: Immediate threat to someone we love
   - ROMANCE: Relationship tension
   - CLIFFHANGER: Scene interrupted at critical moment

2. HOOK PLACEMENT
   - Every chapter should have a hook near the end
   - Vary types throughout the book
   - Not every hook needs to be a cliffhanger
   - Sometimes the best hook is emotional, not action

3. HOOK PAYOFF
   - Hooks must be paid off eventually
   - Tracking when each hook resolves is critical
   - Unresolved hooks create reader frustration

4. BINGE PSYCHOLOGY
   - Readers need a reason to continue
   - The question "what happens next?" drives pages
   - Emotional investment > plot twists

You create hooks that keep readers up past their bedtime.`;

const USER_HOOK_GENERATION = `Create reader hooks for Chapter {chapterNumber}.

═══════════════════════════════════════════════════════════════════════════════
CHAPTER CONTEXT
═══════════════════════════════════════════════════════════════════════════════

Chapter Goal: {chapterGoal}
Chapter Events: {chapterEvents}
Tension Level: {tensionLevel}

Characters Involved: {characters}
Current Plot Threads: {plotThreads}

Previous Chapter Hook: {previousHook}
Hooks Already Used in Book: {hooksUsed}

═══════════════════════════════════════════════════════════════════════════════
SERIES CONTEXT
═══════════════════════════════════════════════════════════════════════════════

Active Mysteries: {activeMysteries}
Character Relationships: {relationships}
Upcoming Reveals: {upcomingReveals}

═══════════════════════════════════════════════════════════════════════════════

Generate as JSON:

{
  "primaryHook": {
    "type": "mystery|emotional|danger|romance|cliffhanger",
    "description": "The hook to place at chapter end",
    "exactPlacement": "How to end the chapter with this hook",
    "exampleLines": ["Example last line 1", "Example last line 2"],
    "whyItWorks": "Why this will make readers continue",
    "payoffPlanned": {
      "chapter": 5,
      "howItResolves": "How this hook is paid off"
    }
  },

  "secondaryHooks": [
    {
      "type": "mystery",
      "description": "Smaller hook earlier in chapter",
      "placement": "After scene 2",
      "exampleLine": "Example line"
    }
  ],

  "emotionalBeats": [
    {
      "moment": "Character revelation",
      "readerFeeling": "Aww, finally!",
      "keepsReadingBecause": "Want to see how this develops"
    }
  ],

  "questionsRaised": [
    {
      "question": "What did she mean by that?",
      "importance": "moderate",
      "answeredIn": "Chapter 8"
    }
  ],

  "tensionElements": [
    {
      "element": "Time pressure",
      "description": "They only have until midnight",
      "introducedIn": "Scene 1"
    }
  ],

  "hookVariety": {
    "previousHooks": ["mystery", "danger", "mystery"],
    "thisHook": "emotional",
    "varietyScore": "Good - different from recent hooks"
  }
}

═══════════════════════════════════════════════════════════════════════════════
HOOK RULES
═══════════════════════════════════════════════════════════════════════════════

1. VARY HOOK TYPES
   - Don't use same type 2 chapters in a row
   - Emotional hooks often more effective than action
   - Mystery hooks work best when reader cares about answer

2. PAYOFF PLANNING
   - Every hook MUST be paid off
   - Track when each resolves
   - Don't leave hooks dangling past reasonable time

3. NATURAL PLACEMENT
   - Hook should feel organic to the scene
   - Not every chapter needs a cliffhanger
   - Sometimes quiet hooks are more powerful

4. EMOTIONAL INVESTMENT
   - Readers continue because they CARE
   - Hook should tap into emotional investment
   - Character stakes > plot stakes

Output ONLY valid JSON.`;
```

---

## PROMPT 12: FORESHADOWING VALIDATION

---

```typescript
// ============================================
// PROMPT 12: FORESHADOWING VALIDATION
// ============================================

const SYSTEM_FORESHADOW_VALIDATOR = `You are a foreshadowing quality control expert.

Your job is to enforce the "NOTHING COMES FROM NOWHERE" rule.

Every major event in a story should have:
1. At least 2-3 subtle hints planted BEFORE it happens
2. Hints that are noticeable on reread but not obvious on first read
3. Setup that creates "aha!" moments, not "huh?" moments

You classify events by foreshadowing requirement:

MINIMUM HINTS BY EVENT TYPE:
- Character death: 2+ hints
- Plot twist: 3+ hints  
- Major reveal: 2+ hints
- New power/ability: 2+ hints
- Betrayal: 3+ hints
- Love confession: 1-2 hints
- Sudden danger: 1 hint

You catch the "deus ex machina" moments that ruin stories.`;

const USER_FORESHADOW_VALIDATION = `Validate foreshadowing for a major event.

═══════════════════════════════════════════════════════════════════════════════
EVENT TO VALIDATE
═══════════════════════════════════════════════════════════════════════════════

Event: {event}
EventType: {eventType} // reveal, twist, death, betrayal, power, etc.
PlannedFor: Book {bookNumber}, Chapter {chapterNumber}

═══════════════════════════════════════════════════════════════════════════════
EXISTING HINTS
═══════════════════════════════════════════════════════════════════════════════

{existingHints.map(h => `
Book {h.book}, Chapter {h.chapter}: "{h.hint}"
Subtlety: {h.subtlety}
How it connects: {h.connection}
`).join('\n')}

═══════════════════════════════════════════════════════════════════════════════
SERIES CONTEXT
═══════════════════════════════════════════════════════════════════════════════

{seriesContext}

═══════════════════════════════════════════════════════════════════════════════

Generate validation as JSON:

{
  "validationResult": {
    "isValid": true|false,
    "status": "approved|needs_hints|critical_failure",
    "requiredHints": {requiredNumber},
    "existingHints": {existingNumber},
    "deficit": {numberNeeded}
  },

  "existingHintAnalysis": [
    {
      "hint": "The hint text",
      "quality": "subtle|moderate|obvious",
      "effectiveness": "strong|moderate|weak",
      "noticeable": "Would readers catch this?",
      "ahaMoment": "How it pays off",
      "issues": "Any problems with this hint"
    }
  ],

  "missingHintTypes": [
    "What kind of hint is still needed"
  ],

  "suggestedHints": [
    {
      "type": "dialogue|description|action|object|dream",
      "placement": {
        "book": 1,
        "chapter": 5,
        "scene": 2
      },
      "hint": "The actual hint to plant",
      "subtlety": "subtle|moderate",
      "connectionToEvent": "How this hints at the event",
      "exampleImplementation": "\"Example line of how this would appear\""
    }
  ],

  "retroactiveFixes": [
    {
      "location": "Where to add hint",
      "fix": "What to add",
      "reason": "Why this helps"
    }
  ],

  "qualityAssessment": {
    "currentScore": 7, // 1-10
    "afterFixes": 9,
    "readerExperience": "How readers will experience this event",
    "firstReadImpact": "How it hits on first read",
    "rereadImpact": "How it hits on reread when hints are visible"
  },

  "recommendation": {
    "action": "approve|add_hints|needs_rewrite",
    "priority": "critical|high|medium|low",
    "notes": "Final recommendation notes"
  }
}

═══════════════════════════════════════════════════════════════════════════════
VALIDATION RULES
═══════════════════════════════════════════════════════════════════════════════

1. HINT COUNT
   - Must meet minimum for event type
   - More is better for major twists
   - Fewer acceptable for smaller events

2. HINT QUALITY
   - Hints should be subtle but present
   - Obvious hints are better than no hints
   - Variety in hint types is good

3. HINT DISTRIBUTION
   - Hints spread across multiple chapters is best
   - At least one hint should be earlier in the book
   - Don't cluster all hints right before event

4. "AHA" FACTOR
   - Reader should think "I should have seen that!"
   - Not "That came out of nowhere"
   - Best hints are clear only in retrospect

Output ONLY valid JSON.`;
```

---

# Complete Generation Pipeline

## Full Step-by-Step Process

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMPLETE GENERATION PIPELINE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║ PHASE 1: SERIES FOUNDATION                                            ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                                                              │
│  Step 1.1: Generate Series Bible                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ INPUT: User premise, genre, book count                               │    │
│  │ PROMPT: SYSTEM_SERIES_PLANNER + USER_SERIES_BIBLE                   │    │
│  │ OUTPUT: Complete SeriesBible object                                  │    │
│  │                                                                       │    │
│  │ Includes:                                                             │    │
│  │ • Overview (genre, tone, themes)                                     │    │
│  │ • World Rules (possible, IMPOSSIBLE, limitations)                   │    │
│  │ • Characters (with core desire, fear, secret, arc)                  │    │
│  │ • Series Arc (stages across all books)                               │    │
│  │ • Mystery Plan (secrets with reveal timing)                          │    │
│  │ • Relationship Map (initial dynamics)                                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                          ↓                                                   │
│  Step 1.2: Generate Voice Profiles                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ FOR EACH CHARACTER:                                                  │    │
│  │ INPUT: Character info, personality, core desire/fear                │    │
│  │ PROMPT: SYSTEM_VOICE_EXPERT + USER_VOICE_PROFILE                    │    │
│  │ OUTPUT: VoiceProfile for character                                   │    │
│  │                                                                       │    │
│  │ Save to: Character.voiceProfile                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                          ↓                                                   │
│  Step 1.3: Generate Series Momentum                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ INPUT: Series Bible, book count                                      │    │
│  │ OUTPUT: SeriesMomentum[] (stakes escalation per book)               │    │
│  │                                                                       │    │
│  │ Example output:                                                       │    │
│  │ Book 1: personal stakes                                              │    │
│  │ Book 2: community stakes                                              │    │
│  │ Book 3: city stakes                                                   │    │
│  │ Book 4: world stakes                                                  │    │
│  │ Book 5: everything at stake                                           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                          ↓                                                   │
│  Step 1.4: Initialize Memory Logs                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Create:                                                               │    │
│  │ • CanonLog (world facts, character facts, rules facts)               │    │
│  │ • RelationshipLog (initial relationships)                            │    │
│  │ • MysteryLog (active mysteries from mystery plan)                    │    │
│  │ • CharacterKnowledgeStates (what each character knows at start)      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                          ↓                                                   │
│  Step 1.5: Plan Callbacks                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ FOR major events in series arc:                                       │    │
│  │ Plan callbacks to earlier/later books                                │    │
│  │ Save to: Callback[]                                                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║ PHASE 2: BOOK GENERATION (repeat for each book)                       ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                                                              │
│  Step 2.1: Generate Book Outline                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ INPUT:                                                               │    │
│  │ • Series Bible                                                       │    │
│  │ • Previous books summary (if Book 2+)                               │    │
│  │ • Series momentum for this book                                      │    │
│  │                                                                       │    │
│  │ PROMPT: SYSTEM_BOOK_ARCHITECT + USER_BOOK_OUTLINE                   │    │
│  │ OUTPUT: Complete BookPlan                                            │    │
│  │                                                                       │    │
│  │ Includes:                                                             │    │
│  │ • Book overview (title, theme, purpose, stakes)                      │    │
│  │ • Tension curve                                                      │    │
│  │ • Character progression                                              │    │
│  │ • Key plot points                                                    │    │
│  │ • Reveals planned                                                    │    │
│  │ • Foreshadowing to plant                                             │    │
│  │ • Callbacks to include                                               │    │
│  │ • Chapter breakdown (15-20 chapters)                                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                          ↓                                                   │
│  Step 2.2: Generate Tension Curve                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ INPUT: Book outline, series stage                                    │    │
│  │ PROMPT: SYSTEM_TENSION_EXPERT + USER_TENSION_CURVE                  │    │
│  │ OUTPUT: TensionPoint[] for each chapter                             │    │
│  │                                                                       │    │
│  │ Creates:                                                              │    │
│  │ • Tension level per chapter (1-10)                                   │    │
│  │ • Tension goal per chapter                                           │    │
│  │ • Breathing room placement                                           │    │
│  │ • Tension beats                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                          ↓                                                   │
│  Step 2.3: Generate Hooks for Each Chapter                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ FOR EACH CHAPTER:                                                     │    │
│  │ INPUT: Chapter plan, previous hooks used                             │    │
│  │ PROMPT: SYSTEM_HOOK_EXPERT + USER_HOOK_GENERATION                   │    │
│  │ OUTPUT: ReaderHook for chapter                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                          ↓                                                   │
│  Step 2.4: Initialize Book Memory                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ INPUT: Series Bible, Book Outline, Previous book memory (if any)    │    │
│  │ PROMPT: SYSTEM_MEMORY_KEEPER + USER_MEMORY_INIT                     │    │
│  │ OUTPUT: Initial MemoryState for this book                            │    │
│  │                                                                       │    │
│  │ Creates:                                                              │    │
│  │ • Canon state at book start                                          │    │
│  │ • Relationship state at book start                                   │    │
│  │ • Mystery state at book start                                        │    │
│  │ • Character knowledge states at book start                           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║ PHASE 3: CHAPTER GENERATION (repeat for each chapter)                 ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                                                              │
│  Step 3.1: Build Chapter Context                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Gather:                                                               │    │
│  │ • Chapter plan                                                        │    │
│  │ • POV character info + voice profile                                  │    │
│  │ • POV character knowledge state                                       │    │
│  │ • World rules (possible/impossible)                                   │    │
│  │ • Compressed summary of older chapters                               │    │
│  │ • Full text of last 2-3 chapters                                      │    │
│  │ • Emotional triggers to consider                                      │    │
│  │ • Callbacks to include                                                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                          ↓                                                   │
│  Step 3.2: Generate Chapter Content                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ INPUT: All context from 3.1                                          │    │
│  │ PROMPT: SYSTEM_NOVELIST + USER_CHAPTER_WRITE                        │    │
│  │ OUTPUT: Full chapter text (2500-3500 words)                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                          ↓                                                   │
│  Step 3.3: Run Consistency Check                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ INPUT: Chapter content, memory state, series bible                  │    │
│  │ PROMPT: SYSTEM_CONSISTENCY_CHECKER + USER_CONSISTENCY_CHECK         │    │
│  │ OUTPUT: Issues list + fixes                                          │    │
│  │                                                                       │    │
│  │ Checks:                                                               │    │
│  │ • Character inconsistencies                                          │    │
│  │ • Knowledge violations                                               │    │
│  │ • World rule violations                                              │    │
│  │ • Plot holes                                                         │    │
│  │ • Foreshadowing issues                                               │    │
│  │ • Voice issues                                                       │    │
│  │ • Tension issues                                                     │    │
│  │ • Emotional continuity issues                                        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                          ↓                                                   │
│  Step 3.4: Fix Issues (if any)                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ IF issues found:                                                      │    │
│  │ • Regenerate chapter with fix instructions                           │    │
│  │ • OR manually edit problematic sections                              │    │
│  │ • Re-run consistency check                                           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                          ↓                                                   │
│  Step 3.5: Update Memory (CRITICAL)                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ INPUT:                                                               │    │
│  │ • Previous memory state                                              │    │
│  │ • Chapter content                                                    │    │
│  │ • Characters present in chapter                                      │    │
│  │                                                                       │    │
│  │ PROMPT: SYSTEM_MEMORY_UPDATER + USER_MEMORY_UPDATE                  │    │
│  │ OUTPUT: Updated MemoryState                                          │    │
│  │                                                                       │    │
│  │ Updates:                                                              │    │
│  │ • Canon log (new facts)                                              │    │
│  │ • Relationship log (changes)                                         │    │
│  │ • Mystery log (clues, reveals)                                       │    │
│  │ • Character knowledge (learned, still unknown)                       │    │
│  │ • Emotional memories (new impacts)                                   │    │
│  │ • Chapter summary (compressed)                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                          ↓                                                   │
│  Step 3.6: Validate Foreshadowing                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ FOR each major event planned in this chapter:                        │    │
│  │ INPUT: Event, existing hints, series context                        │    │
│  │ PROMPT: SYSTEM_FORESHADOW_VALIDATOR + USER_FORESHADOW_VALIDATION   │    │
│  │ OUTPUT: Validation result                                            │    │
│  │                                                                       │    │
│  │ IF invalid:                                                           │    │
│  │ • Inject additional hints                                            │    │
│  │ • Update earlier chapters                                            │    │
│  │ • Or delay event to later chapter                                    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                          ↓                                                   │
│  Step 3.7: Save Chapter                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Save to database:                                                     │    │
│  │ • Chapter content                                                     │    │
│  │ • Word count                                                          │    │
│  │ • Memory snapshot                                                     │    │
│  │ • Compressed summary                                                  │    │
│  │ • Tension notes                                                       │    │
│  │ • Hook info                                                           │    │
│  │ • Consistency check results                                          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║ PHASE 4: POST-GENERATION                                               ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                                                              │
│  Step 4.1: Update Book Memory                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ After all chapters generated:                                         │    │
│  │ • Compile book-end memory state                                       │    │
│  │ • Summarize character progression                                     │    │
│  │ • Update series-level memory                                          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                          ↓                                                   │
│  Step 4.2: Validate Series Continuity                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Cross-book validation:                                                │    │
│  │ • All plot threads resolved or continued                             │    │
│  │ • All mysteries have proper clues                                    │    │
│  │ • All callbacks executed                                              │    │
│  │ • Character arcs progressing                                          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                          ↓                                                   │
│  Step 4.3: Generate Next Book (return to Phase 2)                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

This is the complete prompt system and generation pipeline. Would you like me to continue with the database schema details, API architecture, or frontend components?
