# 📚 YA Series Generator - Complete Technical Documentation

## Part 2: Database Schema, API Architecture & Frontend Components

---

# 2. DATABASE ARCHITECTURE

## 2.1 Complete Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              YA SERIES GENERATOR - DATABASE SCHEMA                        │
└─────────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌─────────────────┐
                                    │     SERIES      │
                                    │─────────────────│
                                    │ id (PK)         │
                                    │ title           │
                                    │ premise         │
                                    │ genre           │
                                    │ themes          │
                                    │ tone            │
                                    │ targetBooks     │
                                    │ status          │
                                    │ worldName       │
                                    │ worldDescription│
                                    │ worldRules      │
                                    │ worldLimits     │
                                    │ mainConflict    │
                                    │ resolution      │
                                    │ momentumProfile │
                                    └────────┬────────┘
                                             │
           ┌─────────────────────────────────┼─────────────────────────────────┐
           │                                 │                                 │
           │                                 │                                 │
           ▼                                 ▼                                 ▼
    ┌──────────────┐              ┌──────────────────┐              ┌──────────────┐
    │SERIES BIBLE  │              │    CHARACTER     │              │ WORLD ELEMENT│
    │──────────────│              │──────────────────│              │──────────────│
    │ id (PK)      │              │ id (PK)          │              │ id (PK)      │
    │ seriesId(FK) │              │ seriesId (FK)    │              │ seriesId(FK) │
    │ overview     │              │ name             │              │ type         │
    │ worldRules   │              │ role             │              │ name         │
    │ characters   │              │ age              │              │ description  │
    │ seriesArc    │              │ gender           │              │ details      │
    │ mysteryPlan  │              │ appearance       │              │ importance   │
    │ relationship │              │ personality      │              │ introducedIn │
    │ momentumPlan │              │ coreDesire       │              └──────────────┘
    │ isGenerated  │              │ bigFear          │
    └──────────────┘              │ hiddenSecret     │
                                  │ startState       │              ┌──────────────┐
                                  │ endState         │              │ PLOT THREAD  │
                                  │ growthArc        │              │──────────────│
                                  │ voiceProfile     │              │ id (PK)      │
                                  │ knowledgeTimeline│              │ seriesId(FK) │
                                  │ emotionalMemory  │              │ name         │
                                  └────────┬─────────┘              │ description  │
                                           │                        │ type         │
                                           │                        │ introducedIn │
                                           │                        │ resolvedIn   │
                                           │                        │ status       │
                                           │                        │ keyEvents    │
                                           │                        └──────────────┘
                                           │
                                           ▼
    ┌──────────────┐              ┌──────────────────┐              ┌──────────────┐
    │CHARACTER     │              │   BOOK           │              │TIMELINE EVENT│
    │STATE         │              │──────────────────│              │──────────────│
    │──────────────│              │ id (PK)          │              │ id (PK)      │
    │ id (PK)      │◄─────────────│ seriesId (FK)    │─────────────►│ seriesId(FK) │
    │ characterId  │              │ bookNumber       │              │ eventName    │
    │ bookId (FK)  │─────────────►│ title            │              │ description  │
    │ age          │              │ synopsis         │              │ eventType    │
    │ location     │              │ status           │              │ inWorldDate  │
    │ emotionalState              │ seriesStage      │              │ bookId       │
    │ knowledge    │              │ bookPurpose      │              │ chapterId    │
    │ dontKnow     │              │ coreTheme        │              │ isMajor      │
    │ beliefs      │              │ externalConflict │              └──────────────┘
    │ relationships│              │ internalConflict │
    │ skills       │              │ tensionCurve     │
    │ developments │              │ stakesLevel      │
    │ emotionalEven│              │ wordCount        │
    └──────────────┘              │ chapterCount     │
                                  └────────┬─────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
           ┌────────────────┐     ┌─────────────────┐    ┌────────────────┐
           │  CHAPTER       │     │  BOOK MEMORY    │    │TENSION PROFILE │
           │────────────────│     │─────────────────│    │────────────────│
           │ id (PK)        │     │ id (PK)         │    │ id (PK)        │
           │ bookId (FK)    │     │ bookId (FK)     │    │ bookId (FK)    │
           │ chapterNumber  │     │ canonState      │    │ startTension   │
           │ title          │     │ relationshipStat│    │ incitingIncid  │
           │ synopsis       │     │ mysteryState    │    │ firstComplic   │
           │ content        │     │ characterKnowled│    │ midpointTens   │
           │ wordCount      │     │ emotionalMemorie│    │ falseHope      │
           │ pov            │     │ compressedSummar│    │ climaxTension  │
           │ setting        │     │ newFacts        │    │ resolutionTens │
           │ chapterGoal    │     │ changedRelation │    │ currentTension │
           │ sceneBreakdown │     └─────────────────┘    │ targetPacing   │
           │ tensionLevel   │                            └────────────────┘
           │ tensionGoal    │
           │ hookType       │
           │ hookDescription│
           │ foreshadowSet  │
           │ foreshadowPay  │
           │ charactersPres │
           │ memorySnapshot │
           │ compressedSum  │
           │ isGenerated    │
           │ needsRevision  │
           └────────────────┘

    ┌──────────────────────────────────────────────────────────────────────────┐
    │                          MEMORY SYSTEM TABLES                            │
    ├──────────────────────────────────────────────────────────────────────────┤
    │                                                                           │
    │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐       │
    │  │   CANON LOG     │    │RELATIONSHIP LOG │    │   MYSTERY LOG   │       │
    │  │─────────────────│    │─────────────────│    │─────────────────│       │
    │  │ id (PK)         │    │ id (PK)         │    │ id (PK)         │       │
    │  │ seriesId (FK)   │    │ seriesId (FK)   │    │ seriesId (FK)   │       │
    │  │ worldFacts      │    │ relationships   │    │ activeMysteries │       │
    │  │ characterFacts  │    │ lastUpdated     │    │ resolvedMysterie│       │
    │  │ eventFacts      │    └────────┬────────┘    │ lastUpdated     │       │
    │  │ rulesFacts      │             │             └────────┬────────┘       │
    │  │ lastUpdated     │             │                      │                │
    │  └────────┬────────┘             │                      │                │
    │           │                      ▼                      ▼                │
    │           │         ┌─────────────────────┐  ┌─────────────────┐         │
    │           │         │RELATIONSHIP ENTRY   │  │     SECRET      │         │
    │           │         │─────────────────────│  │─────────────────│         │
    │           │         │ id (PK)             │  │ id (PK)         │         │
    │           │         │ relationshipLogId   │  │ mysteryLogId    │         │
    │           │         │ characterAId        │  │ title           │         │
    │           │         │ characterBId        │  │ description     │         │
    │           │         │ relationshipType    │  │ whoKnows        │         │
    │           │         │ trustLevel          │  │ whoDoesntKnow   │         │
    │           │         │ tensionLevel        │  │ revealedInBook  │         │
    │           │         │ status              │  │ revealedInChap  │         │
    │           │         │ keyMoments          │  │ status          │         │
    │           │         └─────────────────────┘  └────────┬────────┘         │
    │           │                                             │                  │
    │           ▼                                             ▼                  │
    │  ┌─────────────────────┐                    ┌─────────────────┐          │
    │  │  CANON LOG ENTRY    │                    │      CLUE       │          │
    │  │─────────────────────│                    │─────────────────│          │
    │  │ id (PK)             │                    │ id (PK)         │          │
    │  │ canonLogId          │                    │ mysteryLogId    │          │
    │  │ category            │                    │ secretId        │          │
    │  │ fact                │                    │ description     │          │
    │  │ source              │                    │ clueType        │          │
    │  │ cannotChange        │                    │ plantedInBook   │          │
    │  └─────────────────────┘                    │ plantedInChap   │          │
    │                                             │ isObvious       │          │
    │                                             │ wasNoticed      │          │
    │                                             └─────────────────┘          │
    └──────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────────────────────────────────────────────────┐
    │                       NARRATIVE INTELLIGENCE TABLES                      │
    ├──────────────────────────────────────────────────────────────────────────┤
    │                                                                           │
    │  ┌─────────────────────┐    ┌─────────────────────┐                      │
    │  │   FORESHADOWING     │    │      CALLBACK       │                      │
    │  │─────────────────────│    │─────────────────────│                      │
    │  │ id (PK)             │    │ id (PK)             │                      │
    │  │ seriesId (FK)       │    │ seriesId (FK)       │                      │
    │  │ eventType           │    │ originalBook        │                      │
    │  │ eventDescription    │    │ originalChapter     │                      │
    │  │ setupBook           │    │ originalEvent       │                      │
    │  │ setupChapter        │    │ emotionalWeight     │                      │
    │  │ setupDescription    │    │ callbackBook        │                      │
    │  │ setupSubtlety       │    │ callbackChapter     │                      │
    │  │ payoffBook          │    │ callbackType        │                      │
    │  │ payoffChapter       │    │ callbackDescription │                      │
    │  │ payoffDescription   │    │ isExecuted          │                      │
    │  │ requiredHints       │    │ impact              │                      │
    │  │ existingHints       │    └─────────────────────┘                      │
    │  │ isValidated         │                                                 │
    │  │ validationNotes     │                                                 │
    │  │ status              │                                                 │
    │  └─────────────────────┘                                                 │
    │                                                                           │
    │  ┌─────────────────────┐                                                 │
    │  │  GENERATION LOG     │                                                 │
    │  │─────────────────────│                                                 │
    │  │ id (PK)             │                                                 │
    │  │ seriesId (FK)       │                                                 │
    │  │ type                │                                                 │
    │  │ targetId            │                                                 │
    │  │ prompt              │                                                 │
    │  │ result              │                                                 │
    │  │ status              │                                                 │
    │  │ errorMessage        │                                                 │
    │  │ startedAt           │                                                 │
    │  │ completedAt         │                                                 │
    │  └─────────────────────┘                                                 │
    └──────────────────────────────────────────────────────────────────────────┘
```

---

## 2.2 Complete Prisma Schema with Comments

```prisma
// ============================================
// YA SERIES GENERATOR - COMPLETE DATABASE SCHEMA
// Version: 2.0
// Last Updated: 2024
// ============================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// ========================================
// CORE ENTITIES
// ========================================

/// Main series container - the "Series Brain"
/// Stores all long-term memory and foundational elements
model Series {
  id              String   @id @default(cuid())
  
  // Basic Info
  title           String
  premise         String   // User-provided core concept
  genre           String   // YA subgenre (fantasy, dystopian, etc.)
  themes          String   // JSON array of major themes
  tone            String?  // dark, funny, emotional, adventurous
  targetAudience  String?  // YA age range
  targetBooks     Int      @default(5)
  status          String   @default("planning") // planning, generating, complete
  
  // World Building (Canon)
  worldName       String?
  worldDescription String?
  worldRules      String?  // JSON - what IS possible
  worldLimits     String?  // JSON - what is IMPOSSIBLE (critical)
  worldHistory    String?  // JSON - key historical events
  worldGeography  String?  // JSON - locations, regions
  
  // Series Arc
  seriesArc       String?  // JSON - stages across all books
  mainConflict    String?  // The overarching conflict
  resolution      String?  // How the series ends
  
  // Narrative Intelligence
  momentumProfile String?  // JSON - stakes escalation per book
  
  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  books           Book[]
  characters      Character[]
  worldElements   WorldElement[]
  plotThreads     PlotThread[]
  timeline        TimelineEvent[]
  generationLogs  GenerationLog[]
  
  // Memory System
  canonLog        CanonLog?
  relationshipLog RelationshipLog?
  mysteryLog      MysteryLog?
  foreshadowing   Foreshadowing[]
  seriesBible     SeriesBible?
  callbacks       Callback[]
  
  @@map("series")
}

/// The complete series bible - foundation document
model SeriesBible {
  id              String   @id @default(cuid())
  seriesId        String   @unique
  
  // Complete Bible Content
  overview        String?  // JSON - genre, tone, themes, audience
  worldRules      String?  // JSON - possible/impossible, magic, limits
  characters      String?  // JSON - all character details with arcs
  seriesArc       String?  // JSON - full series plot breakdown
  mysteryPlan     String?  // JSON - secrets with reveal timing
  relationshipMap String?  // JSON - initial relationships
  momentumPlan    String?  // JSON - stakes progression
  
  // Generation metadata
  isGenerated     Boolean  @default(false)
  generatedAt     DateTime?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  series          Series   @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  
  @@map("series_bible")
}

// ========================================
// MEMORY SYSTEM
// ========================================

/// Canon Log - Facts that CANNOT change
/// This is the source of truth for story consistency
model CanonLog {
  id              String   @id @default(cuid())
  seriesId        String   @unique
  
  // Categorized Facts (JSON arrays)
  worldFacts      String?  // Facts about the world
  characterFacts  String?  // Facts about characters
  eventFacts      String?  // Facts about past events
  rulesFacts      String?  // Facts about rules/laws
  
  lastUpdated     DateTime @updatedAt
  createdAt       DateTime @default(now())
  
  series          Series   @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  logEntries      CanonLogEntry[]
  
  @@map("canon_log")
}

/// Individual canon entries for granular tracking
model CanonLogEntry {
  id              String   @id @default(cuid())
  canonLogId      String
  
  category        String   // world, character, event, rule
  fact            String   // The established fact
  source          String?  // Where established (book/chapter)
  cannotChange    Boolean  @default(true) // LOCKED
  
  createdAt       DateTime @default(now())
  
  canonLog        CanonLog @relation(fields: [canonLogId], references: [id], onDelete: Cascade)
  
  @@map("canon_log_entry")
}

/// Relationship Log - Dynamic relationship tracking
model RelationshipLog {
  id              String   @id @default(cuid())
  seriesId        String   @unique
  
  relationships   String?  // JSON array of all relationships
  lastUpdated     DateTime @updatedAt
  createdAt       DateTime @default(now())
  
  series          Series   @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  entries         RelationshipEntry[]
  
  @@map("relationship_log")
}

/// Individual relationship entry with detailed tracking
model RelationshipEntry {
  id                String   @id @default(cuid())
  relationshipLogId String
  
  // Characters involved
  characterAId      String
  characterBId      String
  characterAName    String   // Denormalized for easy access
  characterBName    String
  
  // Relationship state
  relationshipType  String?  // family, friend, enemy, romantic, mentor
  trustLevel        Int      @default(50)  // 0-100
  tensionLevel      Int      @default(0)   // 0-100
  status            String   @default("neutral") // friendly, hostile, romantic, strained
  
  // What they know about each other
  aKnowsAboutB      String?  // JSON - what A knows about B
  bKnowsAboutA      String?  // JSON - what B knows about A
  
  // History
  keyMoments        String?  // JSON - important relationship events
  
  currentBook       Int?
  lastUpdated       DateTime @updatedAt
  createdAt         DateTime @default(now())
  
  relationshipLog   RelationshipLog @relation(fields: [relationshipLogId], references: [id], onDelete: Cascade)
  
  @@map("relationship_entry")
}

/// Mystery Log - Secrets, clues, and reveals
model MysteryLog {
  id              String   @id @default(cuid())
  seriesId        String   @unique
  
  activeMysteries   String? // JSON - ongoing mysteries
  resolvedMysteries String? // JSON - solved mysteries
  lastUpdated       DateTime @updatedAt
  createdAt         DateTime @default(now())
  
  series          Series   @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  secrets         Secret[]
  clues           Clue[]
  
  @@map("mystery_log")
}

/// A secret that can be revealed
model Secret {
  id              String   @id @default(cuid())
  mysteryLogId    String
  
  // The Secret
  title           String
  description     String   // The actual secret content
  
  // Who knows
  whoKnows        String?  // JSON array - character IDs who know
  whoDoesntKnow   String?  // JSON array - character IDs who don't know
  
  // Reveal planning
  revealedInBook  Int?
  revealedInChapter Int?
  revealMethod    String?  // How it gets revealed
  
  // Status
  status          String   @default("hidden") // hidden, partially_revealed, revealed
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  mysteryLog      MysteryLog @relation(fields: [mysteryLogId], references: [id], onDelete: Cascade)
  clues           Clue[]
  
  @@map("secret")
}

/// A clue leading to a secret
model Clue {
  id              String   @id @default(cuid())
  mysteryLogId    String
  secretId        String?
  
  // The Clue
  description     String   // The hint itself
  clueType        String   // dialogue, object, event, dream, etc.
  
  // Placement
  plantedInBook   Int
  plantedInChapter Int?
  
  // Connection
  relatedSecretId String?
  
  // Visibility
  isObvious       Boolean  @default(false) // Meant to be noticed?
  wasNoticed      Boolean  @default(false) // Reader reaction tracked
  
  createdAt       DateTime @default(now())
  
  mysteryLog      MysteryLog @relation(fields: [mysteryLogId], references: [id], onDelete: Cascade)
  secret          Secret?  @relation(fields: [secretId], references: [id], onDelete: SetNull)
  
  @@map("clue")
}

// ========================================
// NARRATIVE INTELLIGENCE
// ========================================

/// Foreshadowing with validation
model Foreshadowing {
  id              String   @id @default(cuid())
  seriesId        String
  
  // What is being foreshadowed
  eventType       String   // plot_twist, character_death, revelation, etc.
  eventDescription String
  
  // Setup (the hint)
  setupBook       Int
  setupChapter    Int?
  setupDescription String?
  setupSubtlety   String   @default("subtle") // subtle, moderate, obvious
  
  // Payoff (when it happens)
  payoffBook      Int?
  payoffChapter   Int?
  payoffDescription String?
  
  // Validation (NEW)
  requiredHints   Int      @default(2)
  existingHints   Int      @default(0)
  isValidated     Boolean  @default(false)
  validationNotes String?
  
  status          String   @default("setup") // setup, paid_off, abandoned
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  series          Series   @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  
  @@map("foreshadowing")
}

/// Callback system for cross-book connections
model Callback {
  id              String   @id @default(cuid())
  seriesId        String
  
  // Original Event
  originalBook    Int
  originalChapter Int?
  originalEvent   String
  emotionalWeight String?  // How impactful was original
  
  // Callback
  callbackBook    Int
  callbackChapter Int?
  callbackType    String   // emotional_payoff, callback, contrast, parallel
  callbackDescription String
  
  // Execution
  isExecuted      Boolean  @default(false)
  impact          String?  // How the callback lands
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  series          Series   @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  
  @@map("callback")
}

// ========================================
// BOOKS
// ========================================

/// Individual book in the series
model Book {
  id              String   @id @default(cuid())
  seriesId        String
  bookNumber      Int
  title           String
  synopsis        String?
  status          String   @default("planned") // planned, outlining, drafting, complete
  
  // Book Purpose
  bookPurpose     String?  // What changes in this book
  seriesStage     String?  // setup, escalation, midpoint_twist, collapse, resolution
  coreTheme       String?  // This book's specific theme
  
  // Conflict
  externalConflict String?
  internalConflict String?
  stakes          String?  // What's at stake
  
  // Character Development
  characterProgression String? // JSON - how each character changes
  
  // Reveals
  reveals         String?  // JSON - what gets revealed
  
  // Tension
  tensionCurve    String?  // JSON - pacing profile
  
  // Stakes Level (Momentum)
  stakesLevel     String?  // personal, community, city, world, everything
  
  // Generation tracking
  wordCount       Int      @default(0)
  chapterCount    Int      @default(0)
  generationProgress Float  @default(0) // 0-100
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  series          Series   @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  chapters        Chapter[]
  characterStates CharacterState[]
  bookMemory      BookMemory?
  tensionProfile  TensionProfile?
  
  @@unique([seriesId, bookNumber])
  @@map("book")
}

/// Tension profile per book - pacing control
model TensionProfile {
  id              String   @id @default(cuid())
  bookId          String   @unique
  
  // Tension Curve Points (1-10 scale)
  startTension    Int      @default(2)
  incitingIncident Int?
  firstComplication Int?
  midpointTension Int?
  falseHope       Int?
  climaxTension   Int?
  resolutionTension Int?
  
  // Current state
  currentTension  Int      @default(2)
  lastPeak        String?  // Description of last tension peak
  
  // Pacing rules
  targetPacing    String?  // JSON - desired tension per chapter
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  book            Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)
  
  @@map("tension_profile")
}

/// Book memory - state snapshot after each book
model BookMemory {
  id              String   @id @default(cuid())
  bookId          String   @unique
  
  // State at end of this book
  canonState      String?  // JSON - canon facts at this point
  relationshipState String? // JSON - relationships at this point
  mysteryState    String?  // JSON - mysteries at this point
  characterKnowledge String? // JSON - what each character knows
  
  // Emotional Memory Layer
  emotionalMemories String? // JSON - impactful events that linger
  
  // Compressed Context (for token efficiency)
  compressedSummary String? // JSON - key events, changes, clues
  
  // Changes in this book
  newFacts        String?  // JSON - facts established
  changedRelationships String? // JSON - relationship changes
  newClues        String?  // JSON - clues planted
  resolvedMysteries String? // JSON - mysteries solved
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  book            Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)
  
  @@map("book_memory")
}

// ========================================
// CHARACTERS
// ========================================

/// Character with full development tracking
model Character {
  id              String   @id @default(cuid())
  seriesId        String
  
  // Basic Info
  name            String
  role            String   // protagonist, antagonist, supporting, minor
  age             String?
  gender          String?
  
  // Physical Description
  appearance      String?  // JSON - physical traits
  
  // Character Depth
  personality     String?  // JSON - traits, quirks, flaws
  backstory       String?
  
  // CORE DESIRE & FEAR (Critical for consistency)
  coreDesire      String?  // What drives them fundamentally
  bigFear         String?  // What they fear most
  hiddenSecret    String?  // Their personal secret
  
  // Growth Arc
  growthArc       String?  // JSON - how character changes over books
  startState      String?
  endState        String?
  
  // Knowledge tracking
  knowledgeTimeline String? // JSON - what they know at each book
  
  // Relationships
  relationships   String?
  
  // Voice Profile (prevents drift)
  voiceProfile    String?  // JSON - speech style, vocabulary, patterns
  
  // Introduction
  introducedInBook Int?
  introducedInChapter Int?
  
  // Emotional Memory (personal)
  emotionalMemory String?  // JSON - impactful events for THIS character
  
  isFullyDeveloped Boolean @default(false)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  series          Series   @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  states          CharacterState[]
  
  @@map("character")
}

/// Character state at each book - tracks growth and knowledge
model CharacterState {
  id              String   @id @default(cuid())
  characterId     String
  bookId          String
  
  // State at this book
  age             String?
  location        String?
  emotionalState  String?
  
  // Knowledge tracking (CRITICAL)
  knowledge       String?  // JSON - What they know
  dontKnow        String?  // JSON - What they DON'T know
  beliefs         String?  // JSON - What they believe (may be wrong)
  
  relationships   String?  // JSON - relationship states
  skills          String?  // JSON - abilities developed
  possessions     String?  // JSON - important items
  
  // Changes in this book
  developments    String?  // JSON - key changes
  trauma          String?  // Any trauma experienced
  growth          String?  // Personal growth achieved
  losses          String?  // JSON - what they lost
  gains           String?  // JSON - what they gained
  
  // Internal conflict
  internalConflict String?
  
  // Emotional events
  emotionalEvents String?  // JSON - impactful events this book
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  character       Character @relation(fields: [characterId], references: [id], onDelete: Cascade)
  book            Book      @relation(fields: [bookId], references: [id], onDelete: Cascade)
  
  @@unique([characterId, bookId])
  @@map("character_state")
}

// ========================================
// WORLD BUILDING
// ========================================

/// World elements - locations, items, lore, etc.
model WorldElement {
  id              String   @id @default(cuid())
  seriesId        String
  
  type            String   // location, item, lore, magic, culture, history, organization, creature
  name            String
  description     String
  
  details         String?  // JSON - expanded information
  rules           String?  // JSON - rules/constraints
  history         String?  // History of this element
  
  // Revelation planning
  introducedInBook  Int?
  expandedInBooks String?  // JSON - which books expand
  secrets         String?  // JSON - hidden aspects
  
  importance      String   @default("moderate") // critical, major, moderate, minor
  isPublic        Boolean  @default(true) // Known to readers
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  series          Series   @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  
  @@map("world_element")
}

// ========================================
// PLOT THREADS
// ========================================

/// Plot threads spanning multiple books
model PlotThread {
  id              String   @id @default(cuid())
  seriesId        String
  
  name            String
  description     String
  type            String   // main, subplot, mystery, romance, conflict
  
  // Scope
  introducedInBook  Int
  resolvedInBook    Int?
  status          String   @default("setup") // setup, active, dormant, resolved
  
  // Key Information
  keyEvents       String?  // JSON - major events
  secrets         String?  // JSON - hidden information
  clues           String?  // JSON - clues planted
  
  // Related Elements
  relatedCharacters String? // JSON - character IDs
  relatedElements   String? // JSON - world element IDs
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  series          Series   @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  
  @@map("plot_thread")
}

// ========================================
// CHAPTERS
// ========================================

/// Individual chapter with full narrative tracking
model Chapter {
  id              String   @id @default(cuid())
  bookId          String
  chapterNumber   Int
  
  // Content
  title           String?
  synopsis        String?
  content         String?
  
  // Structure
  wordCount       Int      @default(0)
  pov             String?  // POV character
  setting         String?  // Where it takes place
  timeMarker      String?  // When it takes place
  
  // Chapter Purpose
  chapterGoal     String?  // What this chapter accomplishes
  sceneBreakdown  String?  // JSON - scenes in this chapter
  
  // Plot Management
  activeThreads   String?  // JSON - active plot threads
  threadDevelopments String? // JSON - how threads develop
  revelations     String?  // JSON - information revealed
  
  // Foreshadowing
  foreshadowingSetup String? // JSON - hints planted
  foreshadowingPayoff String? // JSON - hints paid off
  
  // Character Tracking
  charactersPresent String? // JSON - character IDs
  characterMoments String?  // JSON - key character moments
  
  // Tension Tracking
  tensionLevel    Int      @default(5)  // 1-10
  tensionGoal     String?  // increase, decrease, maintain
  tensionNotes    String?
  
  // Reader Hook
  hookType        String?  // mystery, emotional, danger, romance
  hookDescription String?
  hookPayoffPlanned String?
  
  // Compressed Summary
  compressedSummary String? // JSON - keyEvents, characterChanges, newClues
  
  // Generation
  isGenerated     Boolean  @default(false)
  needsRevision   Boolean  @default(false)
  
  // Memory
  memorySnapshot  String?  // JSON - memory state at this chapter
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  book            Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)
  
  @@unique([bookId, chapterNumber])
  @@map("chapter")
}

// ========================================
// TIMELINE
// ========================================

/// Timeline events across the series
model TimelineEvent {
  id              String   @id @default(cuid())
  seriesId        String
  
  eventName       String
  description     String
  eventType       String   // plot, character, world, background
  
  inWorldDate     String?  // Date in story world
  bookId          String?
  chapterId       String?
  
  isMajor         Boolean  @default(false)
  affectsFuture   Boolean  @default(true)
  emotionalImpact String?  // How this affects characters
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  series          Series   @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  
  @@map("timeline_event")
}

// ========================================
// GENERATION LOGGING
// ========================================

/// Logs for tracking AI generation
model GenerationLog {
  id              String   @id @default(cuid())
  seriesId        String
  
  type            String   // series_plan, character, world, book_outline, chapter
  targetId        String?  // ID of what was generated
  
  prompt          String?  // The prompt used
  result          String?  // The generated content
  
  status          String   @default("pending") // pending, success, failed
  errorMessage    String?
  
  startedAt       DateTime @default(now())
  completedAt     DateTime?
  
  series          Series   @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  
  @@map("generation_log")
}
```

---

# 3. API ARCHITECTURE

## 3.1 Complete API Endpoints

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         API ROUTES                                     │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │                                                                        │  │
│  │  /api/series                                                          │  │
│  │  ├── GET    - List all series                                         │  │
│  │  ├── POST   - Create new series                                       │  │
│  │  │                                                                    │  │
│  │  /api/series/[id]                                                     │  │
│  │  ├── GET    - Get series with all relations                          │  │
│  │  ├── PUT    - Update series                                          │  │
│  │  ├── DELETE - Delete series                                          │  │
│  │  │                                                                    │  │
│  │  /api/series/generate                                                 │  │
│  │  ├── POST   - Generate complete series (streaming)                   │  │
│  │  │                                                                    │  │
│  │  /api/books/[id]                                                      │  │
│  │  ├── GET    - Get book with chapters, memory, tension               │  │
│  │  ├── PUT    - Update book                                            │  │
│  │  │                                                                    │  │
│  │  /api/books/generate-outline                                          │  │
│  │  ├── POST   - Generate book outline                                  │  │
│  │  │                                                                    │  │
│  │  /api/chapters/[id]                                                   │  │
│  │  ├── GET    - Get chapter with content                               │  │
│  │  ├── PUT    - Update chapter                                         │  │
│  │  ├── DELETE - Delete chapter                                         │  │
│  │  │                                                                    │  │
│  │  /api/chapters/generate                                               │  │
│  │  ├── POST   - Generate chapter content (streaming)                   │  │
│  │  ├── PUT    - Validate foreshadowing                                 │  │
│  │  │                                                                    │  │
│  │  /api/memory                                                          │  │
│  │  ├── GET    - Get memory state (series or book specific)             │  │
│  │  │                                                                    │  │
│  │  /api/narrative                                                       │  │
│  │  ├── GET    - Get narrative intelligence context                     │  │
│  │  │                                                                    │  │
│  │  /api/characters                                                      │  │
│  │  ├── POST   - Create character                                       │  │
│  │  │                                                                    │  │
│  │  /api/characters/[id]                                                 │  │
│  │  ├── PUT    - Update character                                       │  │
│  │  ├── DELETE - Delete character                                       │  │
│  │  │                                                                    │  │
│  │  /api/world-elements                                                  │  │
│  │  ├── POST   - Create world element                                   │  │
│  │  │                                                                    │  │
│  │  /api/plot-threads                                                    │  │
│  │  ├── POST   - Create plot thread                                     │  │
│  │  │                                                                    │  │
│  │  /api/export/[seriesId]                                               │  │
│  │  ├── GET    - Export series as downloadable format                   │  │
│  │                                                                        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3.2 API Route Implementations

### `/api/series/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/series
 * List all series with basic stats
 */
export async function GET() {
  try {
    const series = await db.series.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { 
            books: true, 
            characters: true,
            worldElements: true,
            plotThreads: true,
          },
        },
      },
    });
    
    return NextResponse.json(series);
  } catch (error) {
    console.error('Failed to fetch series:', error);
    return NextResponse.json(
      { error: 'Failed to fetch series' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/series
 * Create a new series (placeholder, generation happens via /generate)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, premise, genre, targetBooks } = body;
    
    // Validate input
    if (!title || !premise || !genre || !targetBooks) {
      return NextResponse.json(
        { error: 'Missing required fields: title, premise, genre, targetBooks' },
        { status: 400 }
      );
    }
    
    // Create series
    const series = await db.series.create({
      data: {
        title,
        premise,
        genre,
        targetBooks,
        themes: '[]',
        status: 'planning',
      },
    });
    
    // Create placeholder books
    for (let i = 1; i <= targetBooks; i++) {
      await db.book.create({
        data: {
          seriesId: series.id,
          bookNumber: i,
          title: `Book ${i}`,
          status: 'planned',
        },
      });
    }
    
    return NextResponse.json(series, { status: 201 });
  } catch (error) {
    console.error('Failed to create series:', error);
    return NextResponse.json(
      { error: 'Failed to create series' },
      { status: 500 }
    );
  }
}
```

### `/api/series/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/series/[id]
 * Get complete series with all relations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const series = await db.series.findUnique({
      where: { id },
      include: {
        seriesBible: true,
        books: {
          orderBy: { bookNumber: 'asc' },
          include: {
            chapters: {
              orderBy: { chapterNumber: 'asc' },
              select: {
                id: true,
                chapterNumber: true,
                title: true,
                synopsis: true,
                tensionLevel: true,
                hookType: true,
                hookDescription: true,
                isGenerated: true,
                wordCount: true,
              },
            },
            tensionProfile: true,
            bookMemory: true,
          },
        },
        characters: {
          orderBy: [{ role: 'asc' }, { name: 'asc' }],
        },
        worldElements: {
          orderBy: [{ importance: 'desc' }, { name: 'asc' }],
        },
        plotThreads: {
          orderBy: { introducedInBook: 'asc' },
        },
        canonLog: {
          include: { logEntries: true },
        },
        relationshipLog: {
          include: { entries: true },
        },
        mysteryLog: {
          include: {
            secrets: { include: { clues: true } },
            clues: true,
          },
        },
        foreshadowing: true,
        callbacks: true,
        timeline: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    
    if (!series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }
    
    return NextResponse.json(series);
  } catch (error) {
    console.error('Failed to fetch series:', error);
    return NextResponse.json(
      { error: 'Failed to fetch series' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/series/[id]
 * Update series
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const series = await db.series.update({
      where: { id },
      data: body,
    });
    
    return NextResponse.json(series);
  } catch (error) {
    console.error('Failed to update series:', error);
    return NextResponse.json(
      { error: 'Failed to update series' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/series/[id]
 * Delete series and all related data
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.series.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete series:', error);
    return NextResponse.json(
      { error: 'Failed to delete series' },
      { status: 500 }
    );
  }
}
```

### `/api/series/generate/route.ts`

```typescript
import { NextRequest } from 'next/server';
import { 
  initializeSeriesComplete, 
  generateBookComplete 
} from '@/lib/generation-orchestration';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/series/generate
 * Generate complete series with streaming progress
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { premise, genre, targetBooks, title } = body;

  // Validate input
  if (!premise || !genre || !targetBooks) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields' }),
      { status: 400 }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendProgress = (step: string, progress: number) => {
        controller.enqueue(
          encoder.encode(JSON.stringify({ step, progress }) + '\n')
        );
      };

      const sendError = (error: string) => {
        controller.enqueue(
          encoder.encode(JSON.stringify({ error }) + '\n')
        );
      };

      try {
        // Phase 1: Series Foundation
        sendProgress('Initializing series...', 0);
        
        const { seriesId, seriesBible, momentum } = await initializeSeriesComplete(
          title || genre,
          premise,
          targetBooks,
          (step, progress) => sendProgress(step, progress * 0.3) // 0-30%
        );

        sendProgress('Series Bible created!', 30);

        // Phase 2: Generate each book
        for (let i = 1; i <= targetBooks; i++) {
          sendProgress(`Generating Book ${i} outline...`, 30 + ((i - 1) / targetBooks) * 40);
          
          await generateBookComplete(seriesId, i, (step, progress) => {
            sendProgress(
              `Book ${i}: ${step}`,
              30 + ((i - 1) / targetBooks) * 40 + (progress / targetBooks) * 0.4
            );
          });
          
          sendProgress(`Book ${i} complete!`, 30 + (i / targetBooks) * 40);
        }

        // Phase 3: Finalize
        sendProgress('Finalizing series...', 95);
        
        // Update series status
        // await db.series.update({ where: { id: seriesId }, data: { status: 'ready' } });

        // Send completion
        controller.enqueue(
          encoder.encode(JSON.stringify({
            seriesId,
            complete: true,
            stats: {
              books: targetBooks,
              characters: seriesBible.characters?.length || 0,
              mysteries: seriesBible.mysteryPlan?.length || 0,
              momentumLevels: momentum?.length || 0,
            }
          }) + '\n')
        );

        controller.close();
      } catch (error) {
        console.error('Generation failed:', error);
        sendError(error instanceof Error ? error.message : 'Generation failed');
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### `/api/chapters/generate/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateChapterComplete } from '@/lib/generation-orchestration';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/chapters/generate
 * Generate a chapter with full narrative intelligence
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { seriesId, bookNumber, chapterNumber } = body;

  if (!seriesId || !bookNumber || !chapterNumber) {
    return NextResponse.json(
      { error: 'Missing required fields: seriesId, bookNumber, chapterNumber' },
      { status: 400 }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendProgress = (step: string, progress: number) => {
        controller.enqueue(
          encoder.encode(JSON.stringify({ step, progress }) + '\n')
        );
      };

      try {
        const result = await generateChapterComplete(
          seriesId,
          bookNumber,
          chapterNumber,
          sendProgress
        );

        controller.enqueue(
          encoder.encode(JSON.stringify({
            success: true,
            chapterNumber,
            wordCount: result.wordCount,
            narrativeCheck: result.narrativeCheck,
          }) + '\n')
        );

        controller.close();
      } catch (error) {
        controller.enqueue(
          encoder.encode(JSON.stringify({
            error: error instanceof Error ? error.message : 'Generation failed'
          }) + '\n')
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

/**
 * PUT /api/chapters/generate
 * Validate foreshadowing for an event
 */
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { seriesId, event, currentBook } = body;

  if (!seriesId || !event || !currentBook) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  try {
    const { validateEventForeshadowing } = await import('@/lib/generation-orchestration');
    const validation = await validateEventForeshadowing(seriesId, event, currentBook);
    return NextResponse.json(validation);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Validation failed' },
      { status: 500 }
    );
  }
}
```

### `/api/memory/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/memory?seriesId=xxx&bookNumber=1
 * Get memory state for a series or specific book
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get('seriesId');
  const bookNumber = searchParams.get('bookNumber');

  if (!seriesId) {
    return NextResponse.json(
      { error: 'seriesId is required' },
      { status: 400 }
    );
  }

  try {
    if (bookNumber) {
      // Get memory for specific book
      const book = await db.book.findFirst({
        where: { 
          seriesId, 
          bookNumber: parseInt(bookNumber) 
        },
        include: { bookMemory: true },
      });

      if (!book?.bookMemory) {
        return NextResponse.json(
          { error: 'Book memory not found' },
          { status: 404 }
        );
      }

      const memory = {
        canonState: JSON.parse(book.bookMemory.canonState || '{}'),
        relationshipState: JSON.parse(book.bookMemory.relationshipState || '[]'),
        mysteryState: JSON.parse(book.bookMemory.mysteryState || '{}'),
        characterKnowledge: JSON.parse(book.bookMemory.characterKnowledge || '[]'),
        emotionalMemories: JSON.parse(book.bookMemory.emotionalMemories || '[]'),
        compressedSummary: JSON.parse(book.bookMemory.compressedSummary || '{}'),
        newFacts: JSON.parse(book.bookMemory.newFacts || '[]'),
        changedRelationships: JSON.parse(book.bookMemory.changedRelationships || '[]'),
        newClues: JSON.parse(book.bookMemory.newClues || '[]'),
        resolvedMysteries: JSON.parse(book.bookMemory.resolvedMysteries || '[]'),
      };

      return NextResponse.json({ bookNumber, memory });
    }

    // Get all memory logs for series
    const [canonLog, relationshipLog, mysteryLog, foreshadowing] = await Promise.all([
      db.canonLog.findFirst({
        where: { seriesId },
        include: { logEntries: { take: 50 } },
      }),
      db.relationshipLog.findFirst({
        where: { seriesId },
        include: { entries: true },
      }),
      db.mysteryLog.findFirst({
        where: { seriesId },
        include: {
          secrets: { include: { clues: true } },
          clues: { take: 50 },
        },
      }),
      db.foreshadowing.findMany({ where: { seriesId } }),
    ]);

    return NextResponse.json({
      canonLog: canonLog ? {
        worldFacts: JSON.parse(canonLog.worldFacts || '[]'),
        characterFacts: JSON.parse(canonLog.characterFacts || '[]'),
        eventFacts: JSON.parse(canonLog.eventFacts || '[]'),
        rulesFacts: JSON.parse(canonLog.rulesFacts || '[]'),
        entries: canonLog.logEntries,
      } : null,
      relationshipLog: relationshipLog ? {
        relationships: JSON.parse(relationshipLog.relationships || '[]'),
        entries: relationshipLog.entries,
      } : null,
      mysteryLog: mysteryLog ? {
        activeMysteries: JSON.parse(mysteryLog.activeMysteries || '[]'),
        resolvedMysteries: JSON.parse(mysteryLog.resolvedMysteries || '[]'),
        secrets: mysteryLog.secrets,
        clues: mysteryLog.clues,
      } : null,
      foreshadowing,
    });
  } catch (error) {
    console.error('Failed to fetch memory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memory' },
      { status: 500 }
    );
  }
}
```

### `/api/narrative/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getNarrativeContext } from '@/lib/generation-orchestration';

/**
 * GET /api/narrative?seriesId=xxx&bookNumber=1
 * Get narrative intelligence context for display
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get('seriesId');
  const bookNumber = searchParams.get('bookNumber');

  if (!seriesId) {
    return NextResponse.json(
      { error: 'seriesId is required' },
      { status: 400 }
    );
  }

  try {
    const context = await getNarrativeContext(
      seriesId,
      bookNumber ? parseInt(bookNumber) : undefined
    );

    return NextResponse.json(context);
  } catch (error) {
    console.error('Failed to fetch narrative context:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch context' },
      { status: 500 }
    );
  }
}
```

---

# 4. FRONTEND COMPONENTS

## 4.1 Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         PAGE STRUCTURE                                 │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │                                                                        │  │
│  │  src/app/page.tsx (Main Entry)                                        │  │
│  │  ├── SeriesListView                                                   │  │
│  │  │   ├── SeriesCard[]                                                 │  │
│  │  │   └── CreateSeriesDialog                                           │  │
│  │  │                                                                    │  │
│  │  ├── SeriesDetailView                                                 │  │
│  │  │   ├── SeriesHeader                                                 │  │
│  │  │   ├── TabNavigation                                                │  │  │
│  │  │   │   ├── OverviewTab                                              │  │
│  │  │   │   ├── BooksTab                                                 │  │
│  │  │   │   ├── CharactersTab                                            │  │
│  │  │   │   ├── WorldTab                                                 │  │
│  │  │   │   ├── PlotsTab                                                 │  │
│  │  │   │   ├── MemoryTab                                                │  │
│  │  │  │   └── TimelineTab                                               │  │
│  │  │   └── NarrativeIntelligencePanel                                   │  │
│  │  │                                                                    │  │
│  │  ├── BookView                                                         │  │
│  │  │   ├── BookHeader                                                   │  │
│  │  │   ├── TensionCurveVisualization                                    │  │
│  │  │   ├── ChapterList                                                  │  │
│  │  │   │   └── ChapterCard[]                                            │  │
│  │  │   └── BookMemoryPanel                                              │  │
│  │  │                                                                    │  │
│  │  └── ChapterView                                                      │  │
│  │      ├── ChapterHeader                                                │  │
│  │      ├── ChapterContent                                               │  │
│  │      ├── NarrativeCheckPanel                                          │  │
│  │      └── MemorySnapshotViewer                                         │  │
│  │                                                                        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         STATE MANAGEMENT                               │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │                                                                        │  │
│  │  Zustand Store (src/lib/store.ts)                                     │  │
│  │  ├── currentView: 'list' | 'series' | 'book' | 'chapter'              │  │
│  │  ├── selectedSeriesId: string | null                                  │  │
│  │  ├── selectedBookId: string | null                                    │  │
│  │  ├── selectedChapterId: string | null                                 │  │
│  │  ├── activeTab: string                                                │  │
│  │  ├── generationProgress: { step, progress, isGenerating }             │  │
│  │  └── Actions: setCurrentView, selectSeries, selectBook, etc.          │  │
│  │                                                                        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                           SHARED COMPONENTS                            │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │                                                                        │  │
│  │  UI Components (shadcn/ui based):                                     │  │
│  │  ├── Card, CardHeader, CardContent, CardFooter                        │  │
│  │  ├── Button, Input, Textarea, Select                                  │  │
│  │  ├── Tabs, TabsList, TabsTrigger, TabsContent                         │  │
│  │  ├── Dialog, DialogTrigger, DialogContent                             │  │
│  │  ├── Progress, Badge, Avatar                                          │  │
│  │  ├── ScrollArea, Separator                                            │  │
│  │  └── Alert, Toast                                                     │  │
│  │                                                                        │  │
│  │  Custom Components:                                                    │  │
│  │  ├── TensionCurveChart                                                │  │
│  │  ├── CharacterVoiceProfile                                            │  │
│  │  ├── MemoryStateViewer                                                │  │
│  │  ├── ForeshadowingTracker                                             │  │
│  │  ├── CallbackVisualizer                                               │  │
│  │  ├── HookTypeBadge                                                    │  │
│  │  └── GenerationProgressOverlay                                        │  │
│  │                                                                        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4.2 Zustand Store

```typescript
// src/lib/store.ts
import { create } from 'zustand';

export type ViewMode = 'list' | 'series' | 'book' | 'chapter';

interface GenerationProgress {
  step: string;
  progress: number;
  isGenerating: boolean;
}

interface SeriesState {
  // Navigation State
  currentView: ViewMode;
  selectedSeriesId: string | null;
  selectedBookId: string | null;
  selectedChapterId: string | null;
  activeTab: string;

  // Generation State
  generationProgress: GenerationProgress;

  // UI State
  sidebarOpen: boolean;
  theme: 'light' | 'dark';

  // Actions
  setCurrentView: (view: ViewMode) => void;
  selectSeries: (seriesId: string | null) => void;
  selectBook: (bookId: string | null) => void;
  selectChapter: (chapterId: string | null) => void;
  setActiveTab: (tab: string) => void;
  setGenerationProgress: (progress: Partial<GenerationProgress>) => void;
  resetGeneration: () => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useSeriesStore = create<SeriesState>((set) => ({
  // Navigation
  currentView: 'list',
  selectedSeriesId: null,
  selectedBookId: null,
  selectedChapterId: null,
  activeTab: 'overview',

  // Generation
  generationProgress: {
    step: '',
    progress: 0,
    isGenerating: false,
  },

  // UI
  sidebarOpen: true,
  theme: 'light',

  // Actions
  setCurrentView: (view) => set({ currentView: view }),
  
  selectSeries: (seriesId) => set({ 
    selectedSeriesId: seriesId, 
    selectedBookId: null, 
    selectedChapterId: null,
    currentView: seriesId ? 'series' : 'list',
    activeTab: 'overview',
  }),
  
  selectBook: (bookId) => set({ 
    selectedBookId: bookId, 
    selectedChapterId: null,
    currentView: bookId ? 'book' : 'series',
  }),
  
  selectChapter: (chapterId) => set({ 
    selectedChapterId: chapterId,
    currentView: chapterId ? 'chapter' : 'book',
  }),
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setGenerationProgress: (progress) => set((state) => ({
    generationProgress: { ...state.generationProgress, ...progress },
  })),
  
  resetGeneration: () => set({
    generationProgress: { step: '', progress: 0, isGenerating: false },
  }),
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setTheme: (theme) => set({ theme }),
}));
```

---

## 4.3 Main Page Component

```typescript
// src/app/page.tsx
'use client';

import { useSeriesStore } from '@/lib/store';
import SeriesListView from '@/components/views/SeriesListView';
import SeriesDetailView from '@/components/views/SeriesDetailView';
import BookView from '@/components/views/BookView';
import ChapterView from '@/components/views/ChapterView';
import GenerationProgressOverlay from '@/components/GenerationProgressOverlay';

export default function YASeriesGenerator() {
  const { currentView } = useSeriesStore();

  return (
    <main className="min-h-screen bg-background">
      {currentView === 'list' && <SeriesListView />}
      {currentView === 'series' && <SeriesDetailView />}
      {currentView === 'book' && <BookView />}
      {currentView === 'chapter' && <ChapterView />}
      <GenerationProgressOverlay />
    </main>
  );
}
```

---

## 4.4 Series List View

```typescript
// src/components/views/SeriesListView.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSeriesStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Globe, Plus, Wand2 } from 'lucide-react';
import CreateSeriesDialog from '@/components/CreateSeriesDialog';

interface SeriesSummary {
  id: string;
  title: string;
  premise: string;
  genre: string;
  targetBooks: number;
  status: string;
  _count: {
    books: number;
    characters: number;
  };
}

export default function SeriesListView() {
  const [seriesList, setSeriesList] = useState<SeriesSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { selectSeries } = useSeriesStore();

  const fetchSeries = useCallback(async () => {
    try {
      const response = await fetch('/api/series');
      const data = await response.json();
      setSeriesList(data);
    } catch (error) {
      console.error('Failed to fetch series:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent">
              YA Series Generator
            </h1>
            <p className="text-muted-foreground mt-2">
              Create interconnected book series with AI-powered continuity and narrative intelligence
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600"
          >
            <Plus className="mr-2 h-4 w-4" /> New Series
          </Button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : seriesList.length === 0 ? (
          /* Empty State */
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Series Yet</h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                Start by creating your first YA series. Our AI will help you plan characters, 
                world-building, plot threads, and ensure continuity across all books.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Wand2 className="mr-2 h-4 w-4" /> Create Your First Series
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Series Grid */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {seriesList.map((series) => (
              <Card 
                key={series.id} 
                className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
                onClick={() => selectSeries(series.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{series.title}</CardTitle>
                    <Badge variant={series.status === 'complete' ? 'default' : 'secondary'}>
                      {series.status}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <span className="capitalize">{series.genre}</span>
                    <span>•</span>
                    <span>{series.targetBooks} Books</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {series.premise}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{series._count?.characters || 0} Characters</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{series._count?.books || 0} Books</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <CreateSeriesDialog 
          open={showCreateDialog} 
          onOpenChange={setShowCreateDialog} 
          onSuccess={fetchSeries} 
        />
      </div>
    </div>
  );
}
```

---

## 4.5 Create Series Dialog

```typescript
// src/components/CreateSeriesDialog.tsx
'use client';

import { useState } from 'react';
import { useSeriesStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Wand2, CheckCircle, Sparkles } from 'lucide-react';

const GENRES = [
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'dystopian', label: 'Dystopian' },
  { value: 'science-fiction', label: 'Science Fiction' },
  { value: 'paranormal', label: 'Paranormal' },
  { value: 'contemporary', label: 'Contemporary' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'romance', label: 'Romance' },
  { value: 'thriller', label: 'Thriller' },
];

interface CreateSeriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateSeriesDialog({ open, onOpenChange, onSuccess }: CreateSeriesDialogProps) {
  const [step, setStep] = useState<'form' | 'generating' | 'complete'>('form');
  const [title, setTitle] = useState('');
  const [premise, setPremise] = useState('');
  const [genre, setGenre] = useState('fantasy');
  const [targetBooks, setTargetBooks] = useState(5);
  const [progress, setProgress] = useState({ step: '', progress: 0 });
  const [generatedSeriesId, setGeneratedSeriesId] = useState<string | null>(null);
  
  const { selectSeries, setGenerationProgress } = useSeriesStore();

  const handleGenerate = async () => {
    setStep('generating');
    setGenerationProgress({ isGenerating: true });
    setProgress({ step: 'Starting generation...', progress: 0 });

    try {
      const response = await fetch('/api/series/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, premise, genre, targetBooks }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split('\n').filter(Boolean);

          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              
              if (data.step) {
                setProgress({ step: data.step, progress: data.progress });
                setGenerationProgress({ step: data.step, progress: data.progress });
              }
              
              if (data.seriesId) {
                setGeneratedSeriesId(data.seriesId);
              }
              
              if (data.complete) {
                setStep('complete');
                setGenerationProgress({ isGenerating: false });
                
                setTimeout(() => {
                  onSuccess();
                  if (data.seriesId) {
                    selectSeries(data.seriesId);
                  }
                  onOpenChange(false);
                  resetForm();
                }, 1500);
              }
              
              if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              // Skip invalid JSON
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }
    } catch (error) {
      console.error('Generation failed:', error);
      setStep('form');
      setGenerationProgress({ isGenerating: false });
      // Show error toast
    }
  };

  const resetForm = () => {
    setTitle('');
    setPremise('');
    setGenre('fantasy');
    setTargetBooks(5);
    setProgress({ step: '', progress: 0 });
    setStep('form');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (step !== 'generating') {
        onOpenChange(isOpen);
        if (!isOpen) resetForm();
      }
    }}>
      <DialogContent className="sm:max-w-[600px]">
        {step === 'form' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Create New YA Series
              </DialogTitle>
              <DialogDescription>
                Describe your series premise and let AI build the world, characters, and plot threads
                with full narrative intelligence and continuity tracking.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Series Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., The Dreamweaver Chronicles"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="premise">Series Premise</Label>
                <Textarea
                  id="premise"
                  placeholder="In a world where dreams become reality, a young girl discovers she can enter other people's dreams..."
                  value={premise}
                  onChange={(e) => setPremise(e.target.value)}
                  className="min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground">
                  Describe the core concept of your series. The more detail, the better the AI can plan.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Select value={genre} onValueChange={setGenre}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GENRES.map((g) => (
                        <SelectItem key={g.value} value={g.value}>
                          {g.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="books">Number of Books</Label>
                  <Select 
                    value={targetBooks.toString()} 
                    onValueChange={(v) => setTargetBooks(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 4, 5, 6, 7].map((n) => (
                        <SelectItem key={n} value={n.toString()}>
                          {n} Books
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Features Preview */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-medium">Will be generated:</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Series Bible</Badge>
                  <Badge variant="secondary">Voice Profiles</Badge>
                  <Badge variant="secondary">Tension Curves</Badge>
                  <Badge variant="secondary">Memory System</Badge>
                  <Badge variant="secondary">Foreshadowing Plan</Badge>
                  <Badge variant="secondary">Callback Registry</Badge>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleGenerate} 
                disabled={!premise.trim()}
                className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600"
              >
                <Wand2 className="mr-2 h-4 w-4" /> Generate Series
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'generating' && (
          <div className="py-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
                <Wand2 className="h-8 w-8 text-amber-500 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Creating Your Series</h3>
              <p className="text-muted-foreground">{progress.step}</p>
            </div>
            
            <Progress value={progress.progress} className="mb-4" />
            
            <div className="space-y-2 text-sm">
              {progress.progress >= 5 && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Series Bible generated</span>
                </div>
              )}
              {progress.progress >= 10 && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Voice profiles created</span>
                </div>
              )}
              {progress.progress >= 25 && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Memory system initialized</span>
                </div>
              )}
              {progress.progress >= 50 && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Book outlines generated</span>
                </div>
              )}
              {progress.progress >= 80 && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Tension profiles created</span>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Series Created!</h3>
            <p className="text-muted-foreground">Taking you to your new series...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

---

## 4.6 Series Detail View with Tabs

```typescript
// src/components/views/SeriesDetailView.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSeriesStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Users, Globe, GitBranch, Brain, Clock, Settings } from 'lucide-react';
import OverviewTab from '@/components/tabs/OverviewTab';
import BooksTab from '@/components/tabs/BooksTab';
import CharactersTab from '@/components/tabs/CharactersTab';
import WorldTab from '@/components/tabs/WorldTab';
import PlotsTab from '@/components/tabs/PlotsTab';
import MemoryTab from '@/components/tabs/MemoryTab';
import TimelineTab from '@/components/tabs/TimelineTab';

interface SeriesData {
  id: string;
  title: string;
  premise: string;
  genre: string;
  themes: string;
  targetBooks: number;
  status: string;
  worldName: string | null;
  worldDescription: string | null;
  seriesBible: { isGenerated: boolean } | null;
  books: Array<{
    id: string;
    bookNumber: number;
    title: string;
    status: string;
    chapters: Array<{ id: string }>;
  }>;
  characters: Array<{ id: string; name: string; role: string }>;
  worldElements: Array<{ id: string; type: string; name: string }>;
  plotThreads: Array<{ id: string; name: string; status: string }>;
  canonLog: { logEntries: unknown[] } | null;
  relationshipLog: { entries: unknown[] } | null;
  mysteryLog: { secrets: unknown[] } | null;
  foreshadowing: unknown[];
  callbacks: unknown[];
}

export default function SeriesDetailView() {
  const { selectedSeriesId, selectSeries, activeTab, setActiveTab } = useSeriesStore();
  const [series, setSeries] = useState<SeriesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSeries = useCallback(async () => {
    if (!selectedSeriesId) return;
    
    try {
      const response = await fetch(`/api/series/${selectedSeriesId}`);
      const data = await response.json();
      setSeries(data);
    } catch (error) {
      console.error('Failed to fetch series:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSeriesId]);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  if (isLoading || !series) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading series...</div>
      </div>
    );
  }

  const themes = JSON.parse(series.themes || '[]');

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => selectSeries(null)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{series.title}</h1>
              <p className="text-sm text-muted-foreground capitalize">
                {series.genre} • {series.targetBooks} Books
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {series.seriesBible?.isGenerated && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <Brain className="h-3 w-3 mr-1" /> AI Enhanced
                </Badge>
              )}
              <Badge variant={series.status === 'complete' ? 'default' : 'secondary'}>
                {series.status}
              </Badge>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="books">Books</TabsTrigger>
            <TabsTrigger value="characters">Characters</TabsTrigger>
            <TabsTrigger value="world">World</TabsTrigger>
            <TabsTrigger value="plots">Plots</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab series={series} themes={themes} onRefresh={fetchSeries} />
          </TabsContent>

          <TabsContent value="books">
            <BooksTab series={series} onRefresh={fetchSeries} />
          </TabsContent>

          <TabsContent value="characters">
            <CharactersTab series={series} />
          </TabsContent>

          <TabsContent value="world">
            <WorldTab series={series} />
          </TabsContent>

          <TabsContent value="plots">
            <PlotsTab series={series} />
          </TabsContent>

          <TabsContent value="memory">
            <MemoryTab series={series} />
          </TabsContent>

          <TabsContent value="timeline">
            <TimelineTab series={series} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
```

---

## 4.7 Overview Tab

```typescript
// src/components/tabs/OverviewTab.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Users, Globe, GitBranch, Brain, Sparkles, Wand2 } from 'lucide-react';

interface OverviewTabProps {
  series: {
    id: string;
    title: string;
    premise: string;
    genre: string;
    targetBooks: number;
    status: string;
    worldName: string | null;
    worldDescription: string | null;
    mainConflict?: string | null;
    books: Array<{ id: string; status: string; chapters: Array<{ id: string; isGenerated: boolean }> }>;
    characters: Array<{ id: string }>;
    worldElements: Array<{ id: string }>;
    plotThreads: Array<{ id: string }>;
    canonLog: { logEntries: unknown[] } | null;
    relationshipLog: { entries: unknown[] } | null;
    mysteryLog: { secrets: unknown[] } | null;
    foreshadowing: unknown[];
    callbacks: unknown[];
    seriesBible: { isGenerated: boolean } | null;
  };
  themes: string[];
  onRefresh: () => void;
}

export default function OverviewTab({ series, themes, onRefresh }: OverviewTabProps) {
  // Calculate generation progress
  const totalChapters = series.books.reduce((sum, book) => sum + book.chapters.length, 0);
  const generatedChapters = series.books.reduce(
    (sum, book) => sum + book.chapters.filter(c => c.isGenerated).length,
    0
  );
  const progress = totalChapters > 0 ? (generatedChapters / totalChapters) * 100 : 0;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Premise Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Series Premise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{series.premise}</p>
        </CardContent>
      </Card>

      {/* Themes Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Themes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {themes.length > 0 ? (
              themes.map((theme, i) => (
                <Badge key={i} variant="secondary" className="text-sm">
                  {theme}
                </Badge>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No themes generated yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* World Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            World
          </CardTitle>
        </CardHeader>
        <CardContent>
          {series.worldName ? (
            <>
              <h4 className="font-semibold mb-2">{series.worldName}</h4>
              <p className="text-sm text-muted-foreground">
                {series.worldDescription || 'World description not generated'}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">World not generated yet</p>
          )}
        </CardContent>
      </Card>

      {/* Main Conflict Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-rose-500" />
            Main Conflict
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {series.mainConflict || 'Main conflict not generated yet'}
          </p>
        </CardContent>
      </Card>

      {/* Statistics Card */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Series Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center mb-6">
            <div>
              <div className="text-3xl font-bold text-amber-600">{series.books.length}</div>
              <div className="text-sm text-muted-foreground">Books</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-rose-600">{series.characters.length}</div>
              <div className="text-sm text-muted-foreground">Characters</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">{series.worldElements.length}</div>
              <div className="text-sm text-muted-foreground">World Elements</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">{series.plotThreads.length}</div>
              <div className="text-sm text-muted-foreground">Plot Threads</div>
            </div>
          </div>
          
          {totalChapters > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Chapter Generation Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground">
                {generatedChapters} of {totalChapters} chapters generated
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Narrative Intelligence Card */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Narrative Intelligence Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${series.canonLog?.logEntries?.length ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Canon Log</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${series.relationshipLog?.entries?.length ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Relationship Log</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${series.mysteryLog?.secrets?.length ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Mystery Log</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${series.foreshadowing?.length ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Foreshadowing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${series.callbacks?.length ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Callbacks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${series.seriesBible?.isGenerated ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Series Bible</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 4.8 Tension Curve Visualization Component

```typescript
// src/components/TensionCurveChart.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TensionPoint {
  chapterNumber: number;
  tensionLevel: number;
  tensionGoal: string;
  description: string;
}

interface TensionCurveChartProps {
  tensionPoints: TensionPoint[];
  currentChapter?: number;
}

export default function TensionCurveChart({ tensionPoints, currentChapter }: TensionCurveChartProps) {
  const maxTension = 10;
  const chartHeight = 200;
  const chartWidth = 600;
  const padding = 40;

  // Calculate points for the line
  const points = tensionPoints.map((point, index) => {
    const x = padding + (index / (tensionPoints.length - 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - (point.tensionLevel / maxTension) * (chartHeight - padding * 2);
    return { x, y, ...point };
  });

  // Create path for the line
  const linePath = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');

  // Create path for the area fill
  const areaPath = `${linePath} L ${points[points.length - 1]?.x || 0} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tension Curve</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <svg 
            width={chartWidth} 
            height={chartHeight} 
            className="w-full min-w-[500px]"
          >
            {/* Grid lines */}
            {[0, 2, 4, 6, 8, 10].map((level) => (
              <g key={level}>
                <line
                  x1={padding}
                  y1={chartHeight - padding - (level / maxTension) * (chartHeight - padding * 2)}
                  x2={chartWidth - padding}
                  y2={chartHeight - padding - (level / maxTension) * (chartHeight - padding * 2)}
                  stroke="#e5e7eb"
                  strokeDasharray="4"
                />
                <text
                  x={padding - 10}
                  y={chartHeight - padding - (level / maxTension) * (chartHeight - padding * 2)}
                  textAnchor="end"
                  className="text-xs fill-gray-400"
                >
                  {level}
                </text>
              </g>
            ))}

            {/* Area fill */}
            <path
              d={areaPath}
              fill="url(#tensionGradient)"
              opacity="0.3"
            />

            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Points */}
            {points.map((point, index) => (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={currentChapter === point.chapterNumber ? 8 : 5}
                  fill={currentChapter === point.chapterNumber ? '#ef4444' : '#f59e0b'}
                  stroke="white"
                  strokeWidth="2"
                />
                {/* Chapter label */}
                <text
                  x={point.x}
                  y={chartHeight - padding + 20}
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  {point.chapterNumber}
                </text>
              </g>
            ))}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="tensionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fef3c7" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Tension Level</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Current Chapter</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

This comprehensive documentation covers:

1. **Complete Database Schema** with ERD and Prisma models
2. **Full API Architecture** with all endpoints
3. **Frontend Components** including:
   - Zustand state management
   - Series List View
   - Create Series Dialog with streaming
   - Series Detail View with tabs
   - Overview Tab
   - Tension Curve Visualization

Would you like me to continue with the remaining tabs (Characters, World, Plots, Memory, Timeline) or cover the Book View and Chapter View components?
