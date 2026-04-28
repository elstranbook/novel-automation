-- Fill transformX/Y/ScaleX/ScaleY from existing boundsX/Y/Width/Height
-- Run this in Supabase SQL Editor to populate the transform fields
-- for existing templates that have bounds but not transforms.
--
-- Transform convention:
--   transformX = (boundsX + boundsWidth/2) / template.width  (center X, normalized 0-1)
--   transformY = (boundsY + boundsHeight/2) / template.height (center Y, normalized 0-1)
--   transformScaleX = boundsWidth / template.width   (normalized 0-1)
--   transformScaleY = boundsHeight / template.height (normalized 0-1)

BEGIN;

-- Update all TemplateLayer rows that have bounds but missing transforms
UPDATE "TemplateLayer" tl
SET
  "transformX" = (tl."boundsX" + tl."boundsWidth" / 2.0) / t.width,
  "transformY" = (tl."boundsY" + tl."boundsHeight" / 2.0) / t.height,
  "transformScaleX" = tl."boundsWidth" / t.width,
  "transformScaleY" = tl."boundsHeight" / t.height,
  "transformRotation" = 0
FROM "Template" t
WHERE tl."templateId" = t.id
  AND tl."boundsX" IS NOT NULL
  AND tl."boundsY" IS NOT NULL
  AND tl."boundsWidth" IS NOT NULL
  AND tl."boundsHeight" IS NOT NULL
  AND t.width > 0
  AND t.height > 0
  AND (
    tl."transformX" IS NULL
    OR tl."transformY" IS NULL
    OR tl."transformScaleX" IS NULL
    OR tl."transformScaleY" IS NULL
  );

-- Verify the update
SELECT
  t.name AS template_name,
  tl.name AS layer_name,
  tl.type AS layer_type,
  tl."boundsX", tl."boundsY", tl."boundsWidth", tl."boundsHeight",
  tl."transformX", tl."transformY", tl."transformScaleX", tl."transformScaleY"
FROM "TemplateLayer" tl
JOIN "Template" t ON tl."templateId" = t.id
WHERE tl.type = 'smart_object'
ORDER BY t.name, tl."zIndex";

COMMIT;
