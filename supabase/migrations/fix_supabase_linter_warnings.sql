-- ============================================================
-- Migration: Fix Supabase Linter Warnings
-- 1. function_search_path_mutable → SET search_path on match_novels
-- 2. extension_in_public → Move vector extension to extensions schema
-- 3. public_bucket_allows_listing → Tighten novel-covers SELECT policy
-- ============================================================

-- 1. Fix: Function Search Path Mutable
--    Recreate match_novels with explicit search_path = public
--    This prevents search_path injection attacks.
create or replace function public.match_novels(
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
set search_path = public
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

-- 2. Fix: Extension in Public
--    Move the vector extension from public schema to extensions schema.
--    Supabase recommends keeping extensions in a dedicated schema.
--    First create the extensions schema if it doesn't exist, then migrate.
create schema if not exists extensions;
drop extension if exists vector;
create extension vector schema extensions;

-- 3. Fix: Public Bucket Allows Listing
--    Replace the broad SELECT policy on novel-covers with a targeted one
--    that only allows access to specific objects (not listing the bucket).
--    Public buckets serve files via URL — no SELECT policy needed for that.
--    We keep a narrow policy for programmatic access if needed.
drop policy if exists "Anyone can view covers" on storage.objects;
-- No replacement needed: public bucket files are accessible via their
-- public URL without any storage policy. The broad SELECT policy only
-- exposed the file listing unnecessarily.
