-- Migration: Add chapter_order column to scenes and prose_scenes tables
-- This fixes the bug where chapters are loaded out of order from the database.
-- The chapter_order column stores the chapter's position in the book (0, 1, 2...)
-- so that ORDER BY chapter_order, scene_order returns rows in the correct sequence.

-- Add chapter_order to scenes table
ALTER TABLE public.scenes
  ADD COLUMN IF NOT EXISTS chapter_order integer NOT NULL DEFAULT 0;

-- Add chapter_order to prose_scenes table
ALTER TABLE public.prose_scenes
  ADD COLUMN IF NOT EXISTS chapter_order integer NOT NULL DEFAULT 0;

-- Backfill chapter_order for existing scenes rows based on chapter_title ordering
-- This uses the natural sort of chapter titles (e.g., "Chapter 1", "Chapter 2")
-- If your chapter titles don't sort naturally, you may need to manually adjust.
WITH ranked_chapters AS (
  SELECT DISTINCT novel_id, chapter_title,
    ROW_NUMBER() OVER (
      PARTITION BY novel_id ORDER BY chapter_title
    )::integer - 1 AS chapter_idx
  FROM public.scenes
)
UPDATE public.scenes s
SET chapter_order = rc.chapter_idx
FROM ranked_chapters rc
WHERE s.novel_id = rc.novel_id
  AND s.chapter_title = rc.chapter_title;

-- Backfill chapter_order for existing prose_scenes rows
WITH ranked_chapters AS (
  SELECT DISTINCT novel_id, chapter_title,
    ROW_NUMBER() OVER (
      PARTITION BY novel_id ORDER BY chapter_title
    )::integer - 1 AS chapter_idx
  FROM public.prose_scenes
)
UPDATE public.prose_scenes ps
SET chapter_order = rc.chapter_idx
FROM ranked_chapters rc
WHERE ps.novel_id = rc.novel_id
  AND ps.chapter_title = rc.chapter_title;
