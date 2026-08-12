-- APPLIED: 2026-08-12 (verified on thkfjbgkuxjslvrbnpkc — chapter_number present & writable)
-- Add chapter granularity to series timeline events used by the Series Timeline tab
alter table public.series_timeline_events
  add column if not exists chapter_number integer;
