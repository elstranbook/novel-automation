-- Ensure one parent log row per series for canon / mystery / relationships.
-- Deduplicate keeping the newest parent; re-point children; then unique index.

-- canon_log
WITH ranked AS (
  SELECT id, series_id,
         ROW_NUMBER() OVER (PARTITION BY series_id ORDER BY created_at DESC NULLS LAST, id DESC) AS rn
  FROM public.canon_log
  WHERE series_id IS NOT NULL
),
keeper AS (
  SELECT id AS keep_id, series_id FROM ranked WHERE rn = 1
),
dupes AS (
  SELECT r.id AS dupe_id, k.keep_id
  FROM ranked r
  JOIN keeper k ON k.series_id = r.series_id
  WHERE r.rn > 1
)
UPDATE public.canon_log_entry e
SET canon_log_id = d.keep_id
FROM dupes d
WHERE e.canon_log_id = d.dupe_id;

DELETE FROM public.canon_log c
USING (
  SELECT r.id AS dupe_id
  FROM (
    SELECT id, series_id,
           ROW_NUMBER() OVER (PARTITION BY series_id ORDER BY created_at DESC NULLS LAST, id DESC) AS rn
    FROM public.canon_log
    WHERE series_id IS NOT NULL
  ) r
  WHERE r.rn > 1
) d
WHERE c.id = d.dupe_id;

CREATE UNIQUE INDEX IF NOT EXISTS canon_log_series_id_uidx
  ON public.canon_log (series_id);

-- mystery_log
WITH ranked AS (
  SELECT id, series_id,
         ROW_NUMBER() OVER (PARTITION BY series_id ORDER BY created_at DESC NULLS LAST, id DESC) AS rn
  FROM public.mystery_log
  WHERE series_id IS NOT NULL
),
keeper AS (
  SELECT id AS keep_id, series_id FROM ranked WHERE rn = 1
),
dupes AS (
  SELECT r.id AS dupe_id, k.keep_id
  FROM ranked r
  JOIN keeper k ON k.series_id = r.series_id
  WHERE r.rn > 1
)
UPDATE public.secret s
SET mystery_log_id = d.keep_id
FROM dupes d
WHERE s.mystery_log_id = d.dupe_id;

WITH ranked AS (
  SELECT id, series_id,
         ROW_NUMBER() OVER (PARTITION BY series_id ORDER BY created_at DESC NULLS LAST, id DESC) AS rn
  FROM public.mystery_log
  WHERE series_id IS NOT NULL
),
keeper AS (
  SELECT id AS keep_id, series_id FROM ranked WHERE rn = 1
),
dupes AS (
  SELECT r.id AS dupe_id, k.keep_id
  FROM ranked r
  JOIN keeper k ON k.series_id = r.series_id
  WHERE r.rn > 1
)
UPDATE public.clue c
SET mystery_log_id = d.keep_id
FROM dupes d
WHERE c.mystery_log_id = d.dupe_id;

DELETE FROM public.mystery_log m
USING (
  SELECT r.id AS dupe_id
  FROM (
    SELECT id, series_id,
           ROW_NUMBER() OVER (PARTITION BY series_id ORDER BY created_at DESC NULLS LAST, id DESC) AS rn
    FROM public.mystery_log
    WHERE series_id IS NOT NULL
  ) r
  WHERE r.rn > 1
) d
WHERE m.id = d.dupe_id;

CREATE UNIQUE INDEX IF NOT EXISTS mystery_log_series_id_uidx
  ON public.mystery_log (series_id);

-- relationship_log
WITH ranked AS (
  SELECT id, series_id,
         ROW_NUMBER() OVER (PARTITION BY series_id ORDER BY created_at DESC NULLS LAST, id DESC) AS rn
  FROM public.relationship_log
  WHERE series_id IS NOT NULL
),
keeper AS (
  SELECT id AS keep_id, series_id FROM ranked WHERE rn = 1
),
dupes AS (
  SELECT r.id AS dupe_id, k.keep_id
  FROM ranked r
  JOIN keeper k ON k.series_id = r.series_id
  WHERE r.rn > 1
)
UPDATE public.relationship_entry e
SET relationship_log_id = d.keep_id
FROM dupes d
WHERE e.relationship_log_id = d.dupe_id;

DELETE FROM public.relationship_log rl
USING (
  SELECT r.id AS dupe_id
  FROM (
    SELECT id, series_id,
           ROW_NUMBER() OVER (PARTITION BY series_id ORDER BY created_at DESC NULLS LAST, id DESC) AS rn
    FROM public.relationship_log
    WHERE series_id IS NOT NULL
  ) r
  WHERE r.rn > 1
) d
WHERE rl.id = d.dupe_id;

CREATE UNIQUE INDEX IF NOT EXISTS relationship_log_series_id_uidx
  ON public.relationship_log (series_id);
