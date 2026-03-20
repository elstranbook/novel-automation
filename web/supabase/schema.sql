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
  created_at timestamptz default now()
);

create table if not exists public.scenes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  novel_id uuid references public.novels(id) on delete cascade,
  chapter_title text not null,
  scene_content text not null,
  scene_order integer not null,
  created_at timestamptz default now()
);

create table if not exists public.novel_formats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  novel_id uuid references public.novels(id) on delete cascade,
  format_name text not null,
  content text not null,
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
  prompt text not null,
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
