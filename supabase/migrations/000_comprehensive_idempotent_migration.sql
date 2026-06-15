-- =============================================================================
-- COMPREHENSIVE IDEMPOTENT MIGRATION
-- =============================================================================
-- This migration creates ALL tables, policies, and indexes needed by the
-- series feature. It is safe to run on an existing database — it will skip
-- anything that already exists.
--
-- Run this in the Supabase SQL Editor if you get "policy already exists" or
-- "relation already exists" errors from the schema.sql file.
-- =============================================================================

-- Enable UUIDs
create extension if not exists "pgcrypto";

-- =============================================================================
-- TABLES
-- =============================================================================
-- All tables use IF NOT EXISTS so this is safe to re-run.

-- Core series table
create table if not exists public.series (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  num_books integer default 1,
  premise text,
  genre text,
  themes jsonb,
  tone text,
  target_audience text,
  target_books integer default 5,
  status text default 'planning',
  world_name text,
  world_description text,
  world_rules jsonb,
  world_limits jsonb,
  world_history jsonb,
  world_geography jsonb,
  series_arc jsonb,
  main_conflict text,
  resolution text,
  momentum_profile jsonb,
  created_at timestamptz default now()
);

create table if not exists public.series_arcs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  series_id uuid references public.series(id) on delete cascade,
  overall_arc text not null,
  character_arcs jsonb not null,
  themes jsonb not null,
  continuity_notes text,
  created_at timestamptz default now()
);

create table if not exists public.series_books (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  novel_id uuid references public.novels(id) on delete set null,
  book_number integer not null,
  title text,
  status text default 'draft',
  summary text,
  synopsis text,
  book_purpose text,
  series_stage text,
  core_theme text,
  external_conflict text,
  internal_conflict text,
  stakes text,
  character_progression jsonb,
  reveals jsonb,
  tension_curve jsonb,
  stakes_level text,
  word_count integer default 0,
  chapter_count integer default 0,
  generation_progress numeric default 0,
  created_at timestamptz default now()
);

create table if not exists public.series_characters (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  name text not null,
  role text,
  description text,
  arc jsonb,
  age text,
  gender text,
  appearance jsonb,
  personality jsonb,
  backstory text,
  core_desire text,
  big_fear text,
  hidden_secret text,
  growth_arc jsonb,
  start_state text,
  end_state text,
  knowledge_timeline jsonb,
  relationships jsonb,
  voice_profile jsonb,
  introduced_in_book integer,
  introduced_in_chapter integer,
  emotional_memory jsonb,
  is_fully_developed boolean default false,
  created_at timestamptz default now()
);

-- Used by: /api/series/world (GET/POST)
create table if not exists public.series_worlds (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete cascade unique,
  setting text,
  rules jsonb,
  lore jsonb,
  created_at timestamptz default now()
);

create table if not exists public.series_memory (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  category text,
  content text not null,
  created_at timestamptz default now()
);

create table if not exists public.series_timeline (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  event_order integer not null,
  description text not null,
  created_at timestamptz default now()
);

-- Used by: /api/series/timeline (GET/POST)
create table if not exists public.series_timeline_events (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  book_number integer,
  event_order integer not null,
  title text,
  description text,
  created_at timestamptz default now()
);

-- Used by: /api/series/chapters (GET/POST) — chapters within series books
create table if not exists public.chapter (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references public.series_books(id) on delete cascade,
  chapter_number integer not null,
  title text,
  synopsis text,
  content text,
  word_count integer default 0,
  pov text,
  setting text,
  time_marker text,
  chapter_goal text,
  scene_breakdown jsonb,
  active_threads jsonb,
  thread_developments jsonb,
  revelations jsonb,
  foreshadowing_setup jsonb,
  foreshadowing_payoff jsonb,
  characters_present jsonb,
  character_moments jsonb,
  tension_level integer default 5,
  tension_goal text,
  tension_notes text,
  hook_type text,
  hook_description text,
  hook_payoff_planned text,
  compressed_summary jsonb,
  is_generated boolean default false,
  needs_revision boolean default false,
  memory_snapshot jsonb,
  created_at timestamptz default now()
);

create table if not exists public.series_relationships (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  character_a_id uuid references public.series_characters(id) on delete cascade,
  character_b_id uuid references public.series_characters(id) on delete cascade,
  relationship_type text,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.series_lore_entries (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  title text,
  category text,
  content text,
  created_at timestamptz default now()
);

create table if not exists public.series_world_locations (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  name text,
  description text,
  details jsonb,
  created_at timestamptz default now()
);

create table if not exists public.series_rulesets (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  category text,
  rules jsonb,
  created_at timestamptz default now()
);

create table if not exists public.series_continuity_checks (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  book_number integer,
  status text,
  issues jsonb,
  created_at timestamptz default now()
);

create table if not exists public.series_consistency_flags (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  severity text,
  message text,
  resolved boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.series_book_arcs (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  book_number integer not null,
  arc jsonb,
  created_at timestamptz default now()
);

create table if not exists public.series_chapter_beats (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  book_number integer not null,
  chapter_number integer not null,
  beats jsonb,
  created_at timestamptz default now()
);

create table if not exists public.series_memory_nodes (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  memory_type text,
  content text,
  metadata jsonb,
  created_at timestamptz default now()
);

create table if not exists public.series_memory_links (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  source_node_id uuid references public.series_memory_nodes(id) on delete cascade,
  target_node_id uuid references public.series_memory_nodes(id) on delete cascade,
  link_type text,
  created_at timestamptz default now()
);

create table if not exists public.series_memory_embeddings (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  node_id uuid references public.series_memory_nodes(id) on delete cascade,
  embedding jsonb,
  created_at timestamptz default now()
);

create table if not exists public.canon_log (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  world_facts jsonb,
  character_facts jsonb,
  event_facts jsonb,
  rules_facts jsonb,
  created_at timestamptz default now()
);

create table if not exists public.canon_log_entry (
  id uuid primary key default gen_random_uuid(),
  canon_log_id uuid references public.canon_log(id) on delete cascade,
  category text,
  fact text not null,
  source text,
  cannot_change boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.relationship_log (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  relationships jsonb,
  created_at timestamptz default now()
);

create table if not exists public.relationship_entry (
  id uuid primary key default gen_random_uuid(),
  relationship_log_id uuid references public.relationship_log(id) on delete cascade,
  character_a_id uuid references public.series_characters(id) on delete cascade,
  character_b_id uuid references public.series_characters(id) on delete cascade,
  character_a_name text,
  character_b_name text,
  relationship_type text,
  trust_level integer default 50,
  tension_level integer default 0,
  status text default 'neutral',
  a_knows_about_b jsonb,
  b_knows_about_a jsonb,
  key_moments jsonb,
  current_book integer,
  created_at timestamptz default now()
);

create table if not exists public.mystery_log (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  active_mysteries jsonb,
  resolved_mysteries jsonb,
  created_at timestamptz default now()
);

create table if not exists public.secret (
  id uuid primary key default gen_random_uuid(),
  mystery_log_id uuid references public.mystery_log(id) on delete cascade,
  title text,
  description text,
  who_knows jsonb,
  who_doesnt_know jsonb,
  revealed_in_book integer,
  revealed_in_chapter integer,
  reveal_method text,
  status text default 'hidden',
  created_at timestamptz default now()
);

create table if not exists public.clue (
  id uuid primary key default gen_random_uuid(),
  mystery_log_id uuid references public.mystery_log(id) on delete cascade,
  secret_id uuid references public.secret(id) on delete set null,
  description text,
  clue_type text,
  planted_in_book integer,
  planted_in_chapter integer,
  related_secret_id uuid,
  is_obvious boolean default false,
  was_noticed boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.foreshadowing (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  event_type text,
  event_description text,
  setup_book integer,
  setup_chapter integer,
  setup_description text,
  setup_subtlety text default 'subtle',
  payoff_book integer,
  payoff_chapter integer,
  payoff_description text,
  required_hints integer default 2,
  existing_hints integer default 0,
  is_validated boolean default false,
  validation_notes text,
  status text default 'setup',
  created_at timestamptz default now()
);

create table if not exists public.callback (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  original_book integer,
  original_chapter integer,
  original_event text,
  emotional_weight text,
  callback_book integer,
  callback_chapter integer,
  callback_type text,
  callback_description text,
  is_executed boolean default false,
  impact text,
  created_at timestamptz default now()
);

create table if not exists public.plot_thread (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  name text,
  description text,
  type text,
  introduced_in_book integer,
  resolved_in_book integer,
  status text default 'setup',
  key_events jsonb,
  secrets jsonb,
  clues jsonb,
  related_characters jsonb,
  related_elements jsonb,
  created_at timestamptz default now()
);

create table if not exists public.world_element (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  type text,
  name text,
  description text,
  details jsonb,
  rules jsonb,
  history text,
  introduced_in_book integer,
  expanded_in_books jsonb,
  secrets jsonb,
  importance text default 'moderate',
  is_public boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.book_memory (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references public.series_books(id) on delete cascade,
  canon_state jsonb,
  relationship_state jsonb,
  mystery_state jsonb,
  character_knowledge jsonb,
  emotional_memories jsonb,
  compressed_summary jsonb,
  new_facts jsonb,
  changed_relationships jsonb,
  new_clues jsonb,
  resolved_mysteries jsonb,
  created_at timestamptz default now()
);

create table if not exists public.tension_profile (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references public.series_books(id) on delete cascade,
  start_tension integer default 2,
  inciting_incident integer,
  first_complication integer,
  midpoint_tension integer,
  false_hope integer,
  climax_tension integer,
  resolution_tension integer,
  current_tension integer default 2,
  last_peak text,
  target_pacing jsonb,
  created_at timestamptz default now()
);

create table if not exists public.character_state (
  id uuid primary key default gen_random_uuid(),
  character_id uuid references public.series_characters(id) on delete cascade,
  book_id uuid references public.series_books(id) on delete cascade,
  age text,
  location text,
  emotional_state text,
  knowledge jsonb,
  dont_know jsonb,
  beliefs jsonb,
  relationships jsonb,
  skills jsonb,
  possessions jsonb,
  developments jsonb,
  trauma jsonb,
  growth jsonb,
  losses jsonb,
  gains jsonb,
  internal_conflict text,
  emotional_events jsonb,
  created_at timestamptz default now()
);

create table if not exists public.timeline_event (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  event_name text,
  description text,
  event_type text,
  in_world_date text,
  book_id uuid references public.series_books(id) on delete set null,
  chapter_id uuid references public.chapter(id) on delete set null,
  is_major boolean default false,
  affects_future boolean default true,
  emotional_impact text,
  created_at timestamptz default now()
);

create table if not exists public.generation_log (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  type text,
  target_id uuid,
  prompt text,
  result text,
  status text default 'pending',
  error_message text,
  started_at timestamptz default now(),
  completed_at timestamptz
);

-- Series generation output tables
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

create table if not exists public.series_book_maps (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete cascade,
  book_number integer not null default 1,
  map_data jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.series_character_evolution (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete cascade unique,
  evolution jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.series_book_blueprints (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete cascade,
  book_number integer not null default 1,
  blueprint jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================================================
-- UNIQUE INDEX for series_worlds upsert support
-- =============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_series_worlds_series_id_unique
  ON public.series_worlds (series_id);

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY (idempotent — re-enabling is a no-op)
-- =============================================================================
alter table public.series enable row level security;
alter table public.series_arcs enable row level security;
alter table public.series_books enable row level security;
alter table public.series_characters enable row level security;
alter table public.series_worlds enable row level security;
alter table public.series_memory enable row level security;
alter table public.series_timeline enable row level security;
alter table public.series_timeline_events enable row level security;
alter table public.series_relationships enable row level security;
alter table public.series_lore_entries enable row level security;
alter table public.series_world_locations enable row level security;
alter table public.series_rulesets enable row level security;
alter table public.series_continuity_checks enable row level security;
alter table public.series_consistency_flags enable row level security;
alter table public.series_book_arcs enable row level security;
alter table public.series_chapter_beats enable row level security;
alter table public.series_memory_nodes enable row level security;
alter table public.series_memory_links enable row level security;
alter table public.series_memory_embeddings enable row level security;
alter table public.canon_log enable row level security;
alter table public.canon_log_entry enable row level security;
alter table public.relationship_log enable row level security;
alter table public.relationship_entry enable row level security;
alter table public.mystery_log enable row level security;
alter table public.secret enable row level security;
alter table public.clue enable row level security;
alter table public.foreshadowing enable row level security;
alter table public.callback enable row level security;
alter table public.plot_thread enable row level security;
alter table public.world_element enable row level security;
alter table public.book_memory enable row level security;
alter table public.tension_profile enable row level security;
alter table public.character_state enable row level security;
alter table public.chapter enable row level security;
alter table public.timeline_event enable row level security;
alter table public.generation_log enable row level security;
alter table public.series_bibles enable row level security;
alter table public.series_book_maps enable row level security;
alter table public.series_character_evolution enable row level security;
alter table public.series_book_blueprints enable row level security;

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES (all idempotent — IF NOT EXISTS)
-- =============================================================================

-- Helper: owner-based policies (auth.uid() = user_id on the row itself)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='series' AND policyname='series owner') THEN
    CREATE POLICY "series owner" ON public.series FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='series_arcs' AND policyname='series arcs owner') THEN
    CREATE POLICY "series arcs owner" ON public.series_arcs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Series-subtable policies: owner via join to series.user_id
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='series_books' AND policyname='series books owner') THEN
    CREATE POLICY "series books owner" ON public.series_books FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='series_characters' AND policyname='series characters owner') THEN
    CREATE POLICY "series characters owner" ON public.series_characters FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='series_worlds' AND policyname='series worlds owner') THEN
    CREATE POLICY "series worlds owner" ON public.series_worlds FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='series_memory' AND policyname='series memory owner') THEN
    CREATE POLICY "series memory owner" ON public.series_memory FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='series_timeline' AND policyname='series timeline owner') THEN
    CREATE POLICY "series timeline owner" ON public.series_timeline FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='series_relationships' AND policyname='series relationships owner') THEN
    CREATE POLICY "series relationships owner" ON public.series_relationships FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='series_lore_entries' AND policyname='series lore owner') THEN
    CREATE POLICY "series lore owner" ON public.series_lore_entries FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='series_world_locations' AND policyname='series locations owner') THEN
    CREATE POLICY "series locations owner" ON public.series_world_locations FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='series_rulesets' AND policyname='series rulesets owner') THEN
    CREATE POLICY "series rulesets owner" ON public.series_rulesets FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='series_timeline_events' AND policyname='series timeline events owner') THEN
    CREATE POLICY "series timeline events owner" ON public.series_timeline_events FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='series_continuity_checks' AND policyname='series continuity owner') THEN
    CREATE POLICY "series continuity owner" ON public.series_continuity_checks FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='series_consistency_flags' AND policyname='series consistency flags owner') THEN
    CREATE POLICY "series consistency flags owner" ON public.series_consistency_flags FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='series_book_arcs' AND policyname='series book arcs owner') THEN
    CREATE POLICY "series book arcs owner" ON public.series_book_arcs FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='series_chapter_beats' AND policyname='series chapter beats owner') THEN
    CREATE POLICY "series chapter beats owner" ON public.series_chapter_beats FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='series_memory_nodes' AND policyname='series memory nodes owner') THEN
    CREATE POLICY "series memory nodes owner" ON public.series_memory_nodes FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='series_memory_links' AND policyname='series memory links owner') THEN
    CREATE POLICY "series memory links owner" ON public.series_memory_links FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='series_memory_embeddings' AND policyname='series memory embeddings owner') THEN
    CREATE POLICY "series memory embeddings owner" ON public.series_memory_embeddings FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='canon_log' AND policyname='canon log owner') THEN
    CREATE POLICY "canon log owner" ON public.canon_log FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='canon_log_entry' AND policyname='canon log entry owner') THEN
    CREATE POLICY "canon log entry owner" ON public.canon_log_entry FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = (select series_id from public.canon_log where id = canon_log_id)))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = (select series_id from public.canon_log where id = canon_log_id)));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='relationship_log' AND policyname='relationship log owner') THEN
    CREATE POLICY "relationship log owner" ON public.relationship_log FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='relationship_entry' AND policyname='relationship entry owner') THEN
    CREATE POLICY "relationship entry owner" ON public.relationship_entry FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = (select series_id from public.relationship_log where id = relationship_log_id)))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = (select series_id from public.relationship_log where id = relationship_log_id)));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='mystery_log' AND policyname='mystery log owner') THEN
    CREATE POLICY "mystery log owner" ON public.mystery_log FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='secret' AND policyname='secret owner') THEN
    CREATE POLICY "secret owner" ON public.secret FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = (select series_id from public.mystery_log where id = mystery_log_id)))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = (select series_id from public.mystery_log where id = mystery_log_id)));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='clue' AND policyname='clue owner') THEN
    CREATE POLICY "clue owner" ON public.clue FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = (select series_id from public.mystery_log where id = mystery_log_id)))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = (select series_id from public.mystery_log where id = mystery_log_id)));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='foreshadowing' AND policyname='foreshadowing owner') THEN
    CREATE POLICY "foreshadowing owner" ON public.foreshadowing FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='callback' AND policyname='callback owner') THEN
    CREATE POLICY "callback owner" ON public.callback FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='plot_thread' AND policyname='plot thread owner') THEN
    CREATE POLICY "plot thread owner" ON public.plot_thread FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='world_element' AND policyname='world element owner') THEN
    CREATE POLICY "world element owner" ON public.world_element FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

-- Book-subtable policies: owner via join to series_books → series.user_id
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='book_memory' AND policyname='book memory owner') THEN
    CREATE POLICY "book memory owner" ON public.book_memory FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = (select series_id from public.series_books where id = book_id)))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = (select series_id from public.series_books where id = book_id)));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tension_profile' AND policyname='tension profile owner') THEN
    CREATE POLICY "tension profile owner" ON public.tension_profile FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = (select series_id from public.series_books where id = book_id)))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = (select series_id from public.series_books where id = book_id)));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='character_state' AND policyname='character state owner') THEN
    CREATE POLICY "character state owner" ON public.character_state FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = (select series_id from public.series_books where id = book_id)))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = (select series_id from public.series_books where id = book_id)));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='chapter' AND policyname='chapter owner') THEN
    CREATE POLICY "chapter owner" ON public.chapter FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = (select series_id from public.series_books where id = book_id)))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = (select series_id from public.series_books where id = book_id)));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='timeline_event' AND policyname='timeline event owner') THEN
    CREATE POLICY "timeline event owner" ON public.timeline_event FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='generation_log' AND policyname='generation log owner') THEN
    CREATE POLICY "generation log owner" ON public.generation_log FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

-- Series generation output policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='series_bibles' AND policyname='series bibles owner') THEN
    CREATE POLICY "series bibles owner" ON public.series_bibles FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='series_book_maps' AND policyname='series book maps owner') THEN
    CREATE POLICY "series book maps owner" ON public.series_book_maps FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='series_character_evolution' AND policyname='series character evolution owner') THEN
    CREATE POLICY "series character evolution owner" ON public.series_character_evolution FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='series_book_blueprints' AND policyname='series book blueprints owner') THEN
    CREATE POLICY "series book blueprints owner" ON public.series_book_blueprints FOR ALL
      USING (auth.uid() = (select user_id from public.series where id = series_id))
      WITH CHECK (auth.uid() = (select user_id from public.series where id = series_id));
  END IF;
END $$;

-- =============================================================================
-- INDEXES
-- =============================================================================
create index if not exists idx_series_bibles_series_id on public.series_bibles(series_id);
create index if not exists idx_series_book_maps_series_id on public.series_book_maps(series_id);
create index if not exists idx_series_book_maps_series_book on public.series_book_maps(series_id, book_number);
create index if not exists idx_series_character_evolution_series_id on public.series_character_evolution(series_id);
create index if not exists idx_series_book_blueprints_series_id on public.series_book_blueprints(series_id);
create index if not exists idx_series_book_blueprints_series_book on public.series_book_blueprints(series_id, book_number);
