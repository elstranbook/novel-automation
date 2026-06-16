-- Add summary column to series_worlds and convert rules/lore from jsonb to text
-- This migration is idempotent (safe to run multiple times)

-- 1. Add summary column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'series_worlds' AND column_name = 'summary'
  ) THEN
    ALTER TABLE public.series_worlds ADD COLUMN summary text;
  END IF;
END $$;

-- 2. Convert rules column from jsonb to text (preserving data)
-- First, convert existing jsonb data to formatted text strings
DO $$
BEGIN
  -- Only convert if the column is still jsonb type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'series_worlds' AND column_name = 'rules'
      AND data_type = 'jsonb'
  ) THEN
    -- Convert jsonb values to text
    UPDATE public.series_worlds SET rules = rules::text WHERE rules IS NOT NULL AND rules::text NOT LIKE '%[object%';
    ALTER TABLE public.series_worlds ALTER COLUMN rules TYPE text USING rules::text;
  END IF;
END $$;

-- 3. Convert lore column from jsonb to text (preserving data)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'series_worlds' AND column_name = 'lore'
      AND data_type = 'jsonb'
  ) THEN
    UPDATE public.series_worlds SET lore = lore::text WHERE lore IS NOT NULL AND lore::text NOT LIKE '%[object%';
    ALTER TABLE public.series_worlds ALTER COLUMN lore TYPE text USING lore::text;
  END IF;
END $$;
