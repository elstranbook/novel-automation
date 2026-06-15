-- Migration: Add missing columns to the series table
-- These columns are defined in schema.sql but may not exist in production yet.
-- Uses IF NOT EXISTS / additive pattern so it's safe to run multiple times.

-- Add premise column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'series' AND column_name = 'premise'
  ) THEN
    ALTER TABLE public.series ADD COLUMN premise text;
  END IF;
END $$;

-- Add genre column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'series' AND column_name = 'genre'
  ) THEN
    ALTER TABLE public.series ADD COLUMN genre text;
  END IF;
END $$;

-- Add themes column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'series' AND column_name = 'themes'
  ) THEN
    ALTER TABLE public.series ADD COLUMN themes jsonb;
  END IF;
END $$;

-- Add tone column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'series' AND column_name = 'tone'
  ) THEN
    ALTER TABLE public.series ADD COLUMN tone text;
  END IF;
END $$;

-- Add target_audience column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'series' AND column_name = 'target_audience'
  ) THEN
    ALTER TABLE public.series ADD COLUMN target_audience text;
  END IF;
END $$;

-- Add target_books column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'series' AND column_name = 'target_books'
  ) THEN
    ALTER TABLE public.series ADD COLUMN target_books integer default 5;
  END IF;
END $$;

-- Add status column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'series' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.series ADD COLUMN status text default 'planning';
  END IF;
END $$;

-- Add world_name column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'series' AND column_name = 'world_name'
  ) THEN
    ALTER TABLE public.series ADD COLUMN world_name text;
  END IF;
END $$;

-- Add world_description column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'series' AND column_name = 'world_description'
  ) THEN
    ALTER TABLE public.series ADD COLUMN world_description text;
  END IF;
END $$;

-- Add world_rules column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'series' AND column_name = 'world_rules'
  ) THEN
    ALTER TABLE public.series ADD COLUMN world_rules jsonb;
  END IF;
END $$;

-- Add world_limits column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'series' AND column_name = 'world_limits'
  ) THEN
    ALTER TABLE public.series ADD COLUMN world_limits jsonb;
  END IF;
END $$;

-- Add world_history column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'series' AND column_name = 'world_history'
  ) THEN
    ALTER TABLE public.series ADD COLUMN world_history jsonb;
  END IF;
END $$;

-- Add world_geography column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'series' AND column_name = 'world_geography'
  ) THEN
    ALTER TABLE public.series ADD COLUMN world_geography jsonb;
  END IF;
END $$;

-- Add series_arc column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'series' AND column_name = 'series_arc'
  ) THEN
    ALTER TABLE public.series ADD COLUMN series_arc jsonb;
  END IF;
END $$;

-- Add main_conflict column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'series' AND column_name = 'main_conflict'
  ) THEN
    ALTER TABLE public.series ADD COLUMN main_conflict text;
  END IF;
END $$;

-- Add resolution column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'series' AND column_name = 'resolution'
  ) THEN
    ALTER TABLE public.series ADD COLUMN resolution text;
  END IF;
END $$;

-- Add momentum_profile column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'series' AND column_name = 'momentum_profile'
  ) THEN
    ALTER TABLE public.series ADD COLUMN momentum_profile jsonb;
  END IF;
END $$;
