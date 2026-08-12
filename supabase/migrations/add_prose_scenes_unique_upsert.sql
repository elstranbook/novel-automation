-- Ensure prose_scenes can be upserted per scene without wiping siblings.
-- Deduplicate any existing collisions keeping the newest row, then add UNIQUE.

DELETE FROM public.prose_scenes a
USING public.prose_scenes b
WHERE a.novel_id = b.novel_id
  AND a.chapter_order = b.chapter_order
  AND a.scene_order = b.scene_order
  AND a.created_at < b.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS prose_scenes_novel_chapter_scene_uidx
  ON public.prose_scenes (novel_id, chapter_order, scene_order);
