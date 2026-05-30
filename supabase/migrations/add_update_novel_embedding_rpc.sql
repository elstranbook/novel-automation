-- ============================================================
-- Migration: Add update_novel_embedding RPC function
-- Required by seoArticleService.ts → generateNovelEmbedding()
-- ============================================================

-- This function safely updates the embedding column on a novel
-- using the service role (bypasses RLS) and properly casts the
-- array parameter to the vector type that PostgREST / the JS
-- client cannot serialize directly.

create or replace function public.update_novel_embedding(
  p_novel_id uuid,
  p_user_id uuid,
  p_embedding vector(1536)
)
returns void
language sql
security definer
set search_path = public, extensions
as $$
  update public.novels
  set embedding = p_embedding,
      updated_at = now()
  where id = p_novel_id
    and user_id = p_user_id;
$$;

-- Grant execute to authenticated users (service role already has access)
grant execute on function public.update_novel_embedding(uuid, uuid, vector(1536)) to authenticated;
grant execute on function public.update_novel_embedding(uuid, uuid, vector(1536)) to service_role;
