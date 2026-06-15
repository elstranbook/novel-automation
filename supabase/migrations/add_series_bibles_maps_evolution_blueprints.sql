-- Migration: Add series_bibles, series_book_maps, series_character_evolution, series_book_blueprints
-- Plus: add unique constraint on series_worlds.series_id so upsert works.
-- All policy creation is idempotent (uses DO $$ IF NOT EXISTS $$).

-- =============================================
-- Fix series_worlds: add unique constraint for upsert support
-- =============================================
-- The world route does upsert/insert-or-update which requires a unique key on series_id.
CREATE UNIQUE INDEX IF NOT EXISTS idx_series_worlds_series_id_unique
  ON public.series_worlds (series_id);

-- =============================================
-- series_bibles
-- =============================================
-- Used by: bible/route.ts (upsert), map/route.ts (select), evolution/route.ts (select), blueprint/route.ts (select)
-- Columns derived from bible/route.ts upsert payload:
--   world_overview, world_rules, history_lore, character_files (jsonb),
--   relationship_map (jsonb), series_arc_summary, themes_symbols (jsonb),
--   story_rules (jsonb), continuity_lockfile (jsonb), unanswered_mysteries (jsonb)

create table if not exists public.series_bibles (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete cascade unique,
  world_overview text default '',
  world_rules text default '',
  history_lore text default '',
  character_files jsonb default '{}'::jsonb,
  relationship_map jsonb default '{}'::jsonb,
  series_arc_summary text default '',
  themes_symbols jsonb default '[]'::jsonb,
  story_rules jsonb default '[]'::jsonb,
  continuity_lockfile jsonb default '[]'::jsonb,
  unanswered_mysteries jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.series_bibles enable row level security;

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
-- series_book_maps
-- =============================================
-- Used by: map/route.ts (delete + insert), blueprint/route.ts (select)
-- Columns derived from map/route.ts insert:
--   series_id, book_number (int), map_data (jsonb)

create table if not exists public.series_book_maps (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete cascade,
  book_number integer not null default 1,
  map_data jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.series_book_maps enable row level security;

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
-- series_character_evolution
-- =============================================
-- Used by: evolution/route.ts (upsert), blueprint/route.ts (select)
-- Columns derived from evolution/route.ts upsert:
--   series_id, evolution (jsonb)

create table if not exists public.series_character_evolution (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete cascade unique,
  evolution jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.series_character_evolution enable row level security;

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
-- series_book_blueprints
-- =============================================
-- Used by: blueprint/route.ts (upsert)
-- Columns derived from blueprint/route.ts upsert:
--   series_id, book_number (int), blueprint (jsonb)

create table if not exists public.series_book_blueprints (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete cascade,
  book_number integer not null default 1,
  blueprint jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.series_book_blueprints enable row level security;

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
-- Indexes for fast lookups
-- =============================================
create index if not exists idx_series_bibles_series_id on public.series_bibles(series_id);
create index if not exists idx_series_book_maps_series_id on public.series_book_maps(series_id);
create index if not exists idx_series_book_maps_series_book on public.series_book_maps(series_id, book_number);
create index if not exists idx_series_character_evolution_series_id on public.series_character_evolution(series_id);
create index if not exists idx_series_book_blueprints_series_id on public.series_book_blueprints(series_id);
create index if not exists idx_series_book_blueprints_series_book on public.series_book_blueprints(series_id, book_number);
