-- ============================================================
-- Migration: Add cover image support to SEO articles
-- Feature: per-article blog cover image
--
-- The "blog" in this app is the SEO articles feature. Previously
-- the studio showed the *novel's* cover as a cosmetic preview on
-- every SEO-article card, but no cover was ever persisted to the
-- article itself, so the public showroom/blog had no cover to
-- render. This adds a real per-article cover_image_url column.
--
-- Safe to run multiple times (idempotent).
-- ============================================================

alter table public.seo_articles
  add column if not exists cover_image_url text;

comment on column public.seo_articles.cover_image_url is
  'Public URL of the cover/hero image displayed on the blog post. Set via the studio "Upload Cover" control on each SEO article.';
