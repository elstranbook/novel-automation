-- ============================================================
-- Migration: Fix Supabase Linter Warnings
-- 1. extension_in_public → Move vector extension to extensions schema
-- 2. function_search_path_mutable → SET search_path on match_novels
-- 3. public_bucket_allows_listing → Tighten novel-covers SELECT policy
--
-- IMPORTANT: Order matters — extension must move BEFORE the function
-- is recreated, so the vector type reference resolves correctly.
-- ============================================================

-- 1. Fix: Extension in Public
--    Move the vector extension from public schema to extensions schema.
--    Supabase recommends keeping extensions in a dedicated schema.
--    Must happen BEFORE recreating match_novels so the vector type
--    resolves from its new location.
create schema if not exists extensions;
alter extension vector set schema extensions;

-- 2. Fix: Function Search Path Mutable
--    Recreate match_novels with explicit search_path including extensions
--    so the vector type operator (<=>) can be resolved at runtime.
--    This prevents search_path injection attacks while keeping the function working.
create or replace function public.match_novels(
  query_embedding extensions.vector(1536),
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
set search_path = public, extensions
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

-- 3. Fix: Public Bucket Allows Listing
--    Remove the broad SELECT policy on novel-covers.
--    Public bucket files are accessible via their public URL without any
--    storage policy. The broad SELECT policy only exposed the file listing.
drop policy if exists "Anyone can view covers" on storage.objects;
