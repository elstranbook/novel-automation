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

-- =============================================
-- IMPORTANT: Create the novel-covers storage bucket
-- =============================================
-- Storage buckets cannot be created via SQL in Supabase.
-- Either:
-- 1. The API route will auto-create the bucket on first cover generation, OR
-- 2. Create it manually: Supabase Dashboard → Storage → New Bucket → name: "novel-covers", toggle "Public"
--
-- After creating the bucket, run these storage policies in the SQL editor:
--
-- CREATE POLICY "Authenticated users can upload covers" ON storage.objects
--   FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'novel-covers' AND auth.role() = 'authenticated');
--
-- CREATE POLICY "Anyone can view covers" ON storage.objects
--   FOR SELECT TO public
--   USING (bucket_id = 'novel-covers');
--
-- CREATE POLICY "Authenticated users can update their covers" ON storage.objects
--   FOR UPDATE TO authenticated
--   USING (bucket_id = 'novel-covers' AND auth.role() = 'authenticated');
--
-- CREATE POLICY "Authenticated users can delete their covers" ON storage.objects
--   FOR DELETE TO authenticated
--   USING (bucket_id = 'novel-covers' AND auth.role() = 'authenticated');
