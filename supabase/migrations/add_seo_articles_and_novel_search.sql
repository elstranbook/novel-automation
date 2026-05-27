-- ============================================================
-- Migration: SEO Articles + Novel Search Metadata
-- Feature: Search Question → Promotional Article
-- ============================================================

-- 1. Enable pgvector extension
create extension if not exists vector;

-- 2. Add search metadata columns to novels table
alter table public.novels
  add column if not exists themes text[],
  add column if not exists topics text[],
  add column if not exists emotions text[],
  add column if not exists audience text[],
  add column if not exists marketing_summary text,
  add column if not exists search_text text,
  add column if not exists embedding vector(1536),
  add column if not exists popularity_score numeric default 50,
  add column if not exists metadata_enriched_at timestamptz;

-- 3. Create seo_articles table
create table if not exists public.seo_articles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,

  -- Input
  question text not null,

  -- Book matching results
  selected_books uuid[],
  relevance_scores jsonb,
  search_intent jsonb,

  -- Article content
  title text,
  slug text,
  meta_title text,
  meta_description text,
  excerpt text,
  article_html text,
  article_markdown text,
  faq jsonb,

  -- Promotion metadata
  promoted_books jsonb,
  promotion_reason text,

  -- Generation settings
  tone text default 'thoughtful',
  word_count integer default 1800,
  promotion_intensity integer default 50,
  target_audience text,
  primary_keyword text,
  secondary_keywords text[],
  internal_links text[],
  reading_grade integer,
  generation_settings jsonb,
  generation_time_ms integer,

  -- Status
  status text default 'draft',
  published_at timestamptz,

  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Enable RLS on seo_articles
alter table public.seo_articles enable row level security;

-- 5. RLS policy: users can only manage their own seo_articles
create policy "seo articles owner" on public.seo_articles
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 6. Create index on novels.embedding for vector similarity search
create index if not exists novels_embedding_idx on public.novels
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- 7. Create index on novels.user_id for filtering
create index if not exists novels_user_id_idx on public.novels (user_id);

-- 8. Create GIN index on novels.themes for array containment queries
create index if not exists novels_themes_idx on public.novels using gin (themes);
create index if not exists novels_topics_idx on public.novels using gin (topics);
create index if not exists novels_audience_idx on public.novels using gin (audience);

-- 9. Create index on seo_articles for common queries
create index if not exists seo_articles_user_id_idx on public.seo_articles (user_id);
create index if not exists seo_articles_status_idx on public.seo_articles (status);
create index if not exists seo_articles_slug_idx on public.seo_articles (slug);

-- 10. Create a function for vector similarity search (used by the app)
create or replace function match_novels(
  query_embedding vector(1536),
  match_user_id uuid,
  match_threshold float default 0.5,
  match_count int default 10
)
returns table (
  id uuid,
  title text,
  themes text[],
  topics text[],
  emotions text[],
  audience text[],
  marketing_summary text,
  popularity_score numeric,
  similarity float
)
language sql stable
as $$
  select
    n.id,
    n.title,
    n.themes,
    n.topics,
    n.emotions,
    n.audience,
    n.marketing_summary,
    n.popularity_score,
    1 - (n.embedding <=> query_embedding) as similarity
  from public.novels n
  where n.user_id = match_user_id
    and n.embedding is not null
    and 1 - (n.embedding <=> query_embedding) >= match_threshold
  order by n.embedding <=> query_embedding
  limit match_count;
$$;
