/**
 * Pipeline-step model defaults for the novel-automation system.
 *
 * Three tiers based on task requirements:
 *   1. PROSE   — qwen3-235b-a22b-instruct-2507  (best creative writing, human preference alignment)
 *   2. PLANNING — qwen3-235b-a22b-thinking-2507  (reasoning mode for narrative structure)
 *   3. MARKETING — qwen3-14b                     (fast & cheap for descriptions, keywords, snippets)
 *
 * To change the default model for any step, edit the values below.
 * Individual API routes still accept a `model` param from the client
 * which overrides these defaults.
 */

import { QWEN3_MODELS } from "./dashscopeClient";

// ─── Pipeline step enum ───────────────────────────────────────────────
export enum PipelineStep {
  // Prose writing
  PROSE = "prose",

  // Planning / reasoning tasks
  CHAPTER_OUTLINE = "chapter_outline",
  CHAPTER_GUIDE = "chapter_guide",
  CHAPTER_BEATS = "chapter_beats",
  NOVEL_PLAN = "novel_plan",
  SCENES = "scenes",
  SCENES_CHAPTER = "scenes_chapter",
  STORY_DETAILS = "story_details",
  CHARACTER_PROFILES = "character_profiles",
  PREMISES_ENDINGS = "premises_endings",
  EDITING_SUGGESTIONS = "editing_suggestions",
  SYNOPSIS = "synopsis",

  // Series planning
  SERIES_CREATE = "series_create",
  SERIES_BLUEPRINT = "series_blueprint",
  SERIES_EVOLUTION = "series_evolution",
  SERIES_BIBLE = "series_bible",
  SERIES_MAP = "series_map",

  // Marketing assets
  KEYWORDS = "keywords",
  BISAC = "bisac",
  PROMOTIONAL_ARTICLE = "promotional_article",
  SOCIAL_SNIPPETS = "social_snippets",
  BOOK_DESCRIPTION = "book_description",
  QUOTES = "quotes",
  COVER_PROMPT = "cover_prompt",
  DEDICATION = "dedication",
}

// ─── Default models per pipeline step ─────────────────────────────────
const STEP_MODEL_MAP: Record<PipelineStep, string> = {
  // Prose writing — best creative writing model
  [PipelineStep.PROSE]: QWEN3_MODELS.QWEN3_235B_INSTRUCT,

  // Planning / reasoning — thinking model for complex narrative structure
  [PipelineStep.CHAPTER_OUTLINE]: QWEN3_MODELS.QWEN3_235B_THINKING,
  [PipelineStep.CHAPTER_GUIDE]: QWEN3_MODELS.QWEN3_235B_THINKING,
  [PipelineStep.CHAPTER_BEATS]: QWEN3_MODELS.QWEN3_235B_THINKING,
  [PipelineStep.NOVEL_PLAN]: QWEN3_MODELS.QWEN3_235B_THINKING,
  [PipelineStep.SCENES]: QWEN3_MODELS.QWEN3_235B_THINKING,
  [PipelineStep.SCENES_CHAPTER]: QWEN3_MODELS.QWEN3_235B_THINKING,
  [PipelineStep.STORY_DETAILS]: QWEN3_MODELS.QWEN3_235B_THINKING,
  [PipelineStep.CHARACTER_PROFILES]: QWEN3_MODELS.QWEN3_235B_THINKING,
  [PipelineStep.PREMISES_ENDINGS]: QWEN3_MODELS.QWEN3_235B_THINKING,
  [PipelineStep.EDITING_SUGGESTIONS]: QWEN3_MODELS.QWEN3_235B_THINKING,
  [PipelineStep.SYNOPSIS]: QWEN3_MODELS.QWEN3_235B_THINKING,

  // Series planning — thinking model for long-term narrative coherence
  [PipelineStep.SERIES_CREATE]: QWEN3_MODELS.QWEN3_235B_THINKING,
  [PipelineStep.SERIES_BLUEPRINT]: QWEN3_MODELS.QWEN3_235B_THINKING,
  [PipelineStep.SERIES_EVOLUTION]: QWEN3_MODELS.QWEN3_235B_THINKING,
  [PipelineStep.SERIES_BIBLE]: QWEN3_MODELS.QWEN3_235B_THINKING,
  [PipelineStep.SERIES_MAP]: QWEN3_MODELS.QWEN3_235B_THINKING,

  // Marketing assets — fast & cheap
  [PipelineStep.KEYWORDS]: QWEN3_MODELS.QWEN3_14B,
  [PipelineStep.BISAC]: QWEN3_MODELS.QWEN3_14B,
  [PipelineStep.PROMOTIONAL_ARTICLE]: QWEN3_MODELS.QWEN3_14B,
  [PipelineStep.SOCIAL_SNIPPETS]: QWEN3_MODELS.QWEN3_14B,
  [PipelineStep.BOOK_DESCRIPTION]: QWEN3_MODELS.QWEN3_14B,
  [PipelineStep.QUOTES]: QWEN3_MODELS.QWEN3_14B,
  [PipelineStep.COVER_PROMPT]: QWEN3_MODELS.QWEN3_14B,
  [PipelineStep.DEDICATION]: QWEN3_MODELS.QWEN3_14B,
};

/**
 * Get the default model for a given pipeline step.
 * Falls back to the prose model if the step is unknown.
 */
export const getDefaultModel = (step: PipelineStep): string =>
  STEP_MODEL_MAP[step] ?? QWEN3_MODELS.QWEN3_235B_INSTRUCT;

/**
 * Resolve the model to use: client override > pipeline step default.
 * Use this in every API route to respect both user choice and pipeline defaults.
 */
export const resolveModel = (clientModel: string | undefined | null, step: PipelineStep): string =>
  clientModel || getDefaultModel(step);
