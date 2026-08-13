-- Add psychology / arc columns used by /api/series/characters and save-suite.
-- Idempotent: safe if already applied in production.

ALTER TABLE public.series_characters
  ADD COLUMN IF NOT EXISTS motivation text,
  ADD COLUMN IF NOT EXISTS conflict text,
  ADD COLUMN IF NOT EXISTS arc_stages jsonb;
