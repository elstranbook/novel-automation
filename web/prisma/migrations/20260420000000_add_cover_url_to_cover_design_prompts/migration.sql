-- Add url, model, and is_active columns to cover_design_prompts table
-- These columns are needed to store generated cover image data alongside the prompt

-- Add url column (nullable since existing rows may not have a cover image)
ALTER TABLE public.cover_design_prompts ADD COLUMN IF NOT EXISTS url TEXT;

-- Add model column (nullable, stores the AI model used to generate the image)
ALTER TABLE public.cover_design_prompts ADD COLUMN IF NOT EXISTS model TEXT;

-- Add is_active column (identifies the currently selected cover for a novel)
ALTER TABLE public.cover_design_prompts ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.cover_design_prompts.url IS 'URL of the generated cover image (Supabase Storage public URL)';
COMMENT ON COLUMN public.cover_design_prompts.model IS 'AI model used to generate the cover image (e.g., gpt-image-1)';
COMMENT ON COLUMN public.cover_design_prompts.is_active IS 'Whether this is the currently selected cover for the novel';
