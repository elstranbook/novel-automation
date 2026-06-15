-- Migration: Fix series persistence and RLS policies
-- 1. Add defaults to novels NOT NULL columns so inserts from series page work
-- 2. Ensure RLS policies exist for series_book_maps, series_bibles, etc.
-- 3. Ensure RLS is enabled on all series-related tables
-- Safe to run multiple times (idempotent).

-- =============================================
-- Fix novels table: add defaults for NOT NULL columns
-- This prevents INSERT failures when creating novels from the series page
-- =============================================
ALTER TABLE public.novels ALTER COLUMN model SET DEFAULT 'gpt-4.1-mini';
ALTER TABLE public.novels ALTER COLUMN max_scene_length SET DEFAULT 2000;
ALTER TABLE public.novels ALTER COLUMN min_scene_length SET DEFAULT 500;

-- =============================================
-- Ensure RLS is enabled on series-related tables
-- =============================================
ALTER TABLE public.series_bibles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series_book_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series_character_evolution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series_book_blueprints ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Ensure RLS policies exist for series_bibles
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'series_bibles'
      AND policyname = 'series bibles owner'
  ) THEN
    CREATE POLICY "series bibles owner" ON public.series_bibles FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

-- =============================================
-- Ensure RLS policies exist for series_book_maps
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'series_book_maps'
      AND policyname = 'series book maps owner'
  ) THEN
    CREATE POLICY "series book maps owner" ON public.series_book_maps FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

-- =============================================
-- Ensure RLS policies exist for series_character_evolution
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'series_character_evolution'
      AND policyname = 'series character evolution owner'
  ) THEN
    CREATE POLICY "series character evolution owner" ON public.series_character_evolution FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

-- =============================================
-- Ensure RLS policies exist for series_book_blueprints
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'series_book_blueprints'
      AND policyname = 'series book blueprints owner'
  ) THEN
    CREATE POLICY "series book blueprints owner" ON public.series_book_blueprints FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

-- =============================================
-- Ensure RLS policy exists for series_books
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'series_books'
      AND policyname = 'series books owner'
  ) THEN
    CREATE POLICY "series books owner" ON public.series_books FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

-- =============================================
-- Ensure indexes exist for fast lookups
-- =============================================
CREATE INDEX IF NOT EXISTS idx_series_bibles_series_id ON public.series_bibles(series_id);
CREATE INDEX IF NOT EXISTS idx_series_book_maps_series_id ON public.series_book_maps(series_id);
CREATE INDEX IF NOT EXISTS idx_series_book_maps_series_book ON public.series_book_maps(series_id, book_number);
CREATE INDEX IF NOT EXISTS idx_series_character_evolution_series_id ON public.series_character_evolution(series_id);
CREATE INDEX IF NOT EXISTS idx_series_book_blueprints_series_id ON public.series_book_blueprints(series_id);
CREATE INDEX IF NOT EXISTS idx_series_book_blueprints_series_book ON public.series_book_blueprints(series_id, book_number);
