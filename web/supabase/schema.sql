-- Supabase schema for Novel Automation (full parity)
-- Enable UUIDs
create extension if not exists "pgcrypto";

-- Core tables
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

create table if not exists public.novels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  model text not null,
  max_scene_length integer not null,
  min_scene_length integer not null,
  story_details jsonb,
  series_id uuid references public.series(id) on delete set null,
  book_number integer default 1,
  created_at timestamptz default now()
);

create table if not exists public.chapter_outlines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  novel_id uuid references public.novels(id) on delete cascade,
  outline jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.chapter_guides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  novel_id uuid references public.novels(id) on delete cascade,
  guide jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.chapter_beats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  novel_id uuid references public.novels(id) on delete cascade,
  beats jsonb not null,
  beats_raw jsonb,
  created_at timestamptz default now()
);

create table if not exists public.scenes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  novel_id uuid references public.novels(id) on delete cascade,
  chapter_title text not null,
  scene_content text not null,
  scene_order integer not null,
  scene_raw jsonb,
  created_at timestamptz default now()
);

create table if not exists public.novel_formats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  novel_id uuid references public.novels(id) on delete cascade,
  format_name text not null,
  content text not null,
  prose_raw jsonb,
  created_at timestamptz default now()
);

create table if not exists public.premises_and_endings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  novel_id uuid references public.novels(id) on delete cascade,
  premises jsonb not null,
  chosen_premise text not null,
  potential_endings jsonb not null,
  chosen_ending text,
  created_at timestamptz default now()
);

create table if not exists public.novel_synopsis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  novel_id uuid references public.novels(id) on delete cascade,
  synopsis text not null,
  created_at timestamptz default now()
);

create table if not exists public.character_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  novel_id uuid references public.novels(id) on delete cascade,
  profiles text not null,
  created_at timestamptz default now()
);

create table if not exists public.novel_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  novel_id uuid references public.novels(id) on delete cascade,
  plan text not null,
  created_at timestamptz default now()
);

create table if not exists public.cover_design_prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  novel_id uuid references public.novels(id) on delete cascade,
  title text,
  prompt text not null,
  url text,
  model text,
  is_active boolean not null default false,
  created_at timestamptz default now()
);

create table if not exists public.editing_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  novel_id uuid references public.novels(id) on delete cascade,
  content_id text not null,
  content_type text not null,
  original_text text not null,
  overall_assessment text not null,
  strengths jsonb not null,
  weaknesses jsonb not null,
  suggestions jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.novel_keywords (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  novel_id uuid references public.novels(id) on delete cascade,
  keywords jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.novel_bisac (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  novel_id uuid references public.novels(id) on delete cascade,
  categories jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.book_descriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  novel_id uuid references public.novels(id) on delete cascade,
  description_type text not null default 'marketing',
  content text not null,
  length_type text not null default 'standard',
  created_at timestamptz default now()
);

create table if not exists public.novel_quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  novel_id uuid references public.novels(id) on delete cascade,
  quotes jsonb not null,
  source text,
  created_at timestamptz default now()
);

create table if not exists public.promotional_articles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  novel_id uuid references public.novels(id) on delete cascade,
  article_type text not null default 'theme_analysis',
  length_type text not null default 'medium',
  tone text not null default 'formal',
  cta_type text not null default 'medium',
  title text not null,
  content text not null,
  created_at timestamptz default now()
);

create table if not exists public.social_snippets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  novel_id uuid references public.novels(id) on delete cascade,
  content text not null,
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

create table if not exists public.series_worlds (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
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

create table if not exists public.generation_logs (
  id uuid primary key default gen_random_uuid(),
  step text not null,
  attempt integer not null,
  success boolean not null,
  used_fallback boolean not null,
  created_at timestamptz default now()
);

create table if not exists public.series_timeline (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  event_order integer not null,
  description text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.series enable row level security;
alter table public.series_arcs enable row level security;
alter table public.novels enable row level security;
alter table public.chapter_outlines enable row level security;
alter table public.chapter_guides enable row level security;
alter table public.chapter_beats enable row level security;
alter table public.scenes enable row level security;
alter table public.novel_formats enable row level security;
alter table public.premises_and_endings enable row level security;
alter table public.novel_synopsis enable row level security;
alter table public.character_profiles enable row level security;
alter table public.novel_plans enable row level security;
alter table public.cover_design_prompts enable row level security;
alter table public.editing_suggestions enable row level security;
alter table public.novel_keywords enable row level security;
alter table public.novel_bisac enable row level security;
alter table public.book_descriptions enable row level security;
alter table public.novel_quotes enable row level security;
alter table public.promotional_articles enable row level security;
alter table public.social_snippets enable row level security;
alter table public.series_books enable row level security;
alter table public.series_characters enable row level security;
alter table public.series_worlds enable row level security;
alter table public.series_memory enable row level security;
alter table public.series_timeline enable row level security;
alter table public.generation_logs enable row level security;
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

create table if not exists public.series_timeline_events (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade,
  book_number integer,
  event_order integer not null,
  title text,
  description text,
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

-- Policies: users can manage their own rows
create policy "series owner" on public.series for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "series arcs owner" on public.series_arcs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "novels owner" on public.novels for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "chapter outlines owner" on public.chapter_outlines for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "chapter guides owner" on public.chapter_guides for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "chapter beats owner" on public.chapter_beats for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "scenes owner" on public.scenes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "novel formats owner" on public.novel_formats for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "premises owner" on public.premises_and_endings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "synopsis owner" on public.novel_synopsis for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "profiles owner" on public.character_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "plans owner" on public.novel_plans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cover owner" on public.cover_design_prompts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "editing owner" on public.editing_suggestions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "keywords owner" on public.novel_keywords for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "bisac owner" on public.novel_bisac for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "descriptions owner" on public.book_descriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "quotes owner" on public.novel_quotes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "promotional articles owner" on public.promotional_articles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "social snippets owner" on public.social_snippets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "series books owner" on public.series_books for all using (
  auth.uid() = (select user_id from public.series where id = series_id)
) with check (
  auth.uid() = (select user_id from public.series where id = series_id)
);
create policy "series characters owner" on public.series_characters for all using (
  auth.uid() = (select user_id from public.series where id = series_id)
) with check (
  auth.uid() = (select user_id from public.series where id = series_id)
);
create policy "series worlds owner" on public.series_worlds for all using (
  auth.uid() = (select user_id from public.series where id = series_id)
) with check (
  auth.uid() = (select user_id from public.series where id = series_id)
);
create policy "series memory owner" on public.series_memory for all using (
  auth.uid() = (select user_id from public.series where id = series_id)
) with check (
  auth.uid() = (select user_id from public.series where id = series_id)
);
create policy "series timeline owner" on public.series_timeline for all using (
  auth.uid() = (select user_id from public.series where id = series_id)
) with check (
  auth.uid() = (select user_id from public.series where id = series_id)
);
create policy "series relationships owner" on public.series_relationships for all using (
  auth.uid() = (select user_id from public.series where id = series_id)
) with check (
  auth.uid() = (select user_id from public.series where id = series_id)
);
create policy "series lore owner" on public.series_lore_entries for all using (
  auth.uid() = (select user_id from public.series where id = series_id)
) with check (
  auth.uid() = (select user_id from public.series where id = series_id)
);
create policy "series locations owner" on public.series_world_locations for all using (
  auth.uid() = (select user_id from public.series where id = series_id)
) with check (
  auth.uid() = (select user_id from public.series where id = series_id)
);
create policy "series rulesets owner" on public.series_rulesets for all using (
  auth.uid() = (select user_id from public.series where id = series_id)
) with check (
  auth.uid() = (select user_id from public.series where id = series_id)
);
create policy "series timeline events owner" on public.series_timeline_events for all using (
  auth.uid() = (select user_id from public.series where id = series_id)
) with check (
  auth.uid() = (select user_id from public.series where id = series_id)
);
create policy "series continuity owner" on public.series_continuity_checks for all using (
  auth.uid() = (select user_id from public.series where id = series_id)
) with check (
  auth.uid() = (select user_id from public.series where id = series_id)
);
create policy "series consistency flags owner" on public.series_consistency_flags for all using (
  auth.uid() = (select user_id from public.series where id = series_id)
) with check (
  auth.uid() = (select user_id from public.series where id = series_id)
);
create policy "series book arcs owner" on public.series_book_arcs for all using (
  auth.uid() = (select user_id from public.series where id = series_id)
) with check (
  auth.uid() = (select user_id from public.series where id = series_id)
);
create policy "series chapter beats owner" on public.series_chapter_beats for all using (
  auth.uid() = (select user_id from public.series where id = series_id)
) with check (
  auth.uid() = (select user_id from public.series where id = series_id)
);
create policy "series memory nodes owner" on public.series_memory_nodes for all using (
  auth.uid() = (select user_id from public.series where id = series_id)
) with check (
  auth.uid() = (select user_id from public.series where id = series_id)
);
create policy "series memory links owner" on public.series_memory_links for all using (
  auth.uid() = (select user_id from public.series where id = series_id)
) with check (
  auth.uid() = (select user_id from public.series where id = series_id)
);
create policy "series memory embeddings owner" on public.series_memory_embeddings for all using (
  auth.uid() = (select user_id from public.series where id = series_id)
) with check (
  auth.uid() = (select user_id from public.series where id = series_id)
);
create policy "canon log owner" on public.canon_log for all using (
  auth.uid() = (select user_id from public.series where id = series_id)
) with check (
  auth.uid() = (select user_id from public.series where id = series_id)
);
create policy "canon log entry owner" on public.canon_log_entry for all using (
  auth.uid() = (select user_id from public.series where id = (select series_id from public.canon_log where id = canon_log_id))
) with check (
  auth.uid() = (select user_id from public.series where id = (select series_id from public.canon_log where id = canon_log_id))
);
create policy "relationship log owner" on public.relationship_log for all using (
  auth.uid() = (select user_id from public.series where id = series_id)
) with check (
  auth.uid() = (select user_id from public.series where id = series_id)
);
create policy "relationship entry owner" on public.relationship_entry for all using (
  auth.uid() = (select user_id from public.series where id = (select series_id from public.relationship_log where id = relationship_log_id))
) with check (
  auth.uid() = (select user_id from public.series where id = (select series_id from public.relationship_log where id = relationship_log_id))
);
create policy "mystery log owner" on public.mystery_log for all using (
  auth.uid() = (select user_id from public.series where id = series_id)
) with check (
  auth.uid() = (select user_id from public.series where id = series_id)
);
create policy "secret owner" on public.secret for all using (
  auth.uid() = (select user_id from public.series where id = (select series_id from public.mystery_log where id = mystery_log_id))
) with check (
  auth.uid() = (select user_id from public.series where id = (select series_id from public.mystery_log where id = mystery_log_id))
);
create policy "clue owner" on public.clue for all using (
  auth.uid() = (select user_id from public.series where id = (select series_id from public.mystery_log where id = mystery_log_id))
) with check (
  auth.uid() = (select user_id from public.series where id = (select series_id from public.mystery_log where id = mystery_log_id))
);
create policy "foreshadowing owner" on public.foreshadowing for all using (
  auth.uid() = (select user_id from public.series where id = series_id)
) with check (
  auth.uid() = (select user_id from public.series where id = series_id)
);
create policy "callback owner" on public.callback for all using (
  auth.uid() = (select user_id from public.series where id = series_id)
) with check (
  auth.uid() = (select user_id from public.series where id = series_id)
);
create policy "plot thread owner" on public.plot_thread for all using (
  auth.uid() = (select user_id from public.series where id = series_id)
) with check (
  auth.uid() = (select user_id from public.series where id = series_id)
);
create policy "world element owner" on public.world_element for all using (
  auth.uid() = (select user_id from public.series where id = series_id)
) with check (
  auth.uid() = (select user_id from public.series where id = series_id)
);
create policy "book memory owner" on public.book_memory for all using (
  auth.uid() = (select user_id from public.series where id = (select series_id from public.series_books where id = book_id))
) with check (
  auth.uid() = (select user_id from public.series where id = (select series_id from public.series_books where id = book_id))
);
create policy "tension profile owner" on public.tension_profile for all using (
  auth.uid() = (select user_id from public.series where id = (select series_id from public.series_books where id = book_id))
) with check (
  auth.uid() = (select user_id from public.series where id = (select series_id from public.series_books where id = book_id))
);
create policy "character state owner" on public.character_state for all using (
  auth.uid() = (select user_id from public.series where id = (select series_id from public.series_books where id = book_id))
) with check (
  auth.uid() = (select user_id from public.series where id = (select series_id from public.series_books where id = book_id))
);
create policy "chapter owner" on public.chapter for all using (
  auth.uid() = (select user_id from public.series where id = (select series_id from public.series_books where id = book_id))
) with check (
  auth.uid() = (select user_id from public.series where id = (select series_id from public.series_books where id = book_id))
);
create policy "timeline event owner" on public.timeline_event for all using (
  auth.uid() = (select user_id from public.series where id = series_id)
) with check (
  auth.uid() = (select user_id from public.series where id = series_id)
);
create policy "generation log owner" on public.generation_log for all using (
  auth.uid() = (select user_id from public.series where id = series_id)
) with check (
  auth.uid() = (select user_id from public.series where id = series_id)
);

-- =============================================
-- Storage: novel-covers bucket for cover images
-- =============================================
-- Note: Storage buckets are managed via the Supabase API, not SQL.
-- The cover-image API route auto-creates the bucket if missing.
-- If you prefer to create it manually, go to:
--   Supabase Dashboard → Storage → New Bucket → name: "novel-covers", Public: Yes
-- Then set the storage policy to allow authenticated uploads:
--
-- INSERT INTO storage.objects (bucket_id, name, owner)
-- VALUES ('novel-covers', 'test.txt', 'system');
--
-- Policy: Allow authenticated users to upload covers for their novels
CREATE POLICY "Authenticated users can upload covers" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'novel-covers' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view covers" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'novel-covers');

CREATE POLICY "Authenticated users can update their covers" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'novel-covers' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete their covers" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'novel-covers' AND auth.role() = 'authenticated');
