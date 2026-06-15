-- Add blueprint column to novels table for standalone book structural planning
ALTER TABLE public.novels
ADD COLUMN IF NOT EXISTS blueprint jsonb DEFAULT NULL;

-- Allow service role to read/write blueprints (RLS already covers novels table)
COMMENT ON COLUMN public.novels.blueprint IS 'Standalone book blueprint: opening_shift, midpoint_shock, lowest_point, climax, ending_change, relationship_changes, theme_pressure, full_outline';
