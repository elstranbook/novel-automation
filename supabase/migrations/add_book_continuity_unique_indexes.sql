-- Unique continuity tables keyed by book / character+book

-- book_memory: keep newest per book_id
DELETE FROM public.book_memory bm
USING (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY book_id
             ORDER BY created_at DESC NULLS LAST, id DESC
           ) AS rn
    FROM public.book_memory
    WHERE book_id IS NOT NULL
  ) ranked
  WHERE ranked.rn > 1
) d
WHERE bm.id = d.id;

CREATE UNIQUE INDEX IF NOT EXISTS book_memory_book_id_uidx
  ON public.book_memory (book_id);

-- tension_profile: keep newest per book_id
DELETE FROM public.tension_profile tp
USING (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY book_id
             ORDER BY created_at DESC NULLS LAST, id DESC
           ) AS rn
    FROM public.tension_profile
    WHERE book_id IS NOT NULL
  ) ranked
  WHERE ranked.rn > 1
) d
WHERE tp.id = d.id;

CREATE UNIQUE INDEX IF NOT EXISTS tension_profile_book_id_uidx
  ON public.tension_profile (book_id);

-- character_state: keep newest per (character_id, book_id)
DELETE FROM public.character_state cs
USING (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY character_id, book_id
             ORDER BY created_at DESC NULLS LAST, id DESC
           ) AS rn
    FROM public.character_state
    WHERE character_id IS NOT NULL AND book_id IS NOT NULL
  ) ranked
  WHERE ranked.rn > 1
) d
WHERE cs.id = d.id;

CREATE UNIQUE INDEX IF NOT EXISTS character_state_character_book_uidx
  ON public.character_state (character_id, book_id);
