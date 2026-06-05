-- Migration: Create prose_scenes table (mirrors scenes, stores generated prose)
-- Required for Studio prose generation and showroom chapter sync.

CREATE TABLE IF NOT EXISTS public.prose_scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  novel_id uuid REFERENCES public.novels(id) ON DELETE CASCADE,
  chapter_title text NOT NULL,
  scene_content text NOT NULL,
  scene_order integer NOT NULL,
  chapter_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.prose_scenes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'prose_scenes'
      AND policyname = 'prose_scenes owner'
  ) THEN
    CREATE POLICY "prose_scenes owner"
      ON public.prose_scenes
      FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS prose_scenes_novel_id_chapter_order_idx
  ON public.prose_scenes (novel_id, chapter_order, scene_order);
