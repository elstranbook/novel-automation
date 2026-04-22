import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractLayerImages, convertPsdToPng, parsePSD } from '@/lib/psd/parser';
import { getFromStorage, uploadToStorage, listStorage } from '@/lib/cdn/r2-client';

export const runtime = 'nodejs';
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * Sanitize a layer name for use as a filename component.
 */
function sanitizeLayerName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 60);
}

/**
 * POST /api/psd/reprocess
 *
 * Reprocess existing templates to:
 *  - Populate transformX/Y/ScaleX/ScaleY from bounds
 *  - Extract and upload layer PNG images
 *  - Convert PSD baseImage URLs to PNG
 *
 * Body options:
 *   { "all": true }                     — reprocess all templates
 *   { "templateId": "uuid" }            — reprocess one template
 *   { "diagnose": true }                — return current state of all templates (no changes)
 *   { "fillTransforms": true }          — only fill transform fields from existing bounds (no PSD needed)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, all, diagnose, fillTransforms } = body;

    // Diagnose mode: return current state without changes
    if (diagnose) {
      return await diagnoseTemplates();
    }

    // Fill transforms mode: only compute transforms from existing bounds (no PSD download)
    if (fillTransforms) {
      return await fillTransformsFromBounds(all ? undefined : templateId);
    }

    if (all) {
      return await reprocessAll();
    }

    if (!templateId) {
      return NextResponse.json({ error: 'Provide templateId, all=true, diagnose=true, or fillTransforms=true' }, { status: 400 });
    }

    const result = await reprocessTemplate(templateId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[PSD Reprocess] Error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to reprocess', details: message }, { status: 500 });
  }
}

/**
 * Diagnose mode: return current state of all templates and their layers
 */
async function diagnoseTemplates() {
  const templates = await db.template.findMany({
    include: { layers: true },
  });

  const results = templates.map(t => ({
    templateId: t.id,
    name: t.name,
    width: t.width,
    height: t.height,
    baseImage: t.baseImage?.substring(0, 120),
    thumbnail: t.thumbnail?.substring(0, 120),
    layers: t.layers.map(l => ({
      name: l.name,
      type: l.type,
      zIndex: l.zIndex,
      boundsX: l.boundsX,
      boundsY: l.boundsY,
      boundsWidth: l.boundsWidth,
      boundsHeight: l.boundsHeight,
      transformX: l.transformX,
      transformY: l.transformY,
      transformScaleX: l.transformScaleX,
      transformScaleY: l.transformScaleY,
      transformRotation: l.transformRotation,
      warpData: l.warpData ? String(l.warpData).substring(0, 80) + '...' : null,
      perspectiveData: l.perspectiveData ? String(l.perspectiveData).substring(0, 80) + '...' : null,
      compositeUrl: l.compositeUrl?.substring(0, 120),
      blendMode: l.blendMode,
      opacity: l.opacity,
    })),
  }));

  return NextResponse.json({ templates: results, total: results.length });
}

/**
 * Fill transform fields from existing bounds data (no PSD download needed)
 */
async function fillTransformsFromBounds(specificTemplateId?: string) {
  const where: any = {};
  if (specificTemplateId) {
    where.id = specificTemplateId;
  }

  const templates = await db.template.findMany({
    where,
    include: { layers: true },
  });

  const results = [];
  let totalUpdated = 0;

  for (const template of templates) {
    let templateUpdated = 0;

    for (const layer of template.layers) {
      // Skip if transforms already populated
      if (layer.transformX != null && layer.transformScaleX != null) continue;

      const bx = layer.boundsX;
      const by = layer.boundsY;
      const bw = layer.boundsWidth;
      const bh = layer.boundsHeight;

      if (bx == null || by == null || bw == null || bh == null) continue;
      if (template.width <= 0 || template.height <= 0) continue;

      const transformX = (bx + bw / 2) / template.width;
      const transformY = (by + bh / 2) / template.height;
      const transformScaleX = bw / template.width;
      const transformScaleY = bh / template.height;

      await db.templateLayer.update({
        where: { id: layer.id },
        data: {
          transformX,
          transformY,
          transformScaleX,
          transformScaleY,
          transformRotation: 0,
        },
      });

      templateUpdated++;
      totalUpdated++;
    }

    results.push({
      templateId: template.id,
      name: template.name,
      layersUpdated: templateUpdated,
      totalLayers: template.layers.length,
    });
  }

  return NextResponse.json({
    success: true,
    totalUpdated,
    templates: results,
  });
}

async function reprocessAll() {
  // Find ALL templates (not just ones with PSD URLs)
  const templates = await db.template.findMany({
    include: { layers: true },
  });

  console.log(`[PSD Reprocess] Found ${templates.length} templates to reprocess`);

  const results = [];
  for (const template of templates) {
    try {
      const result = await reprocessTemplate(template.id);
      results.push({ templateId: template.id, ...result });
    } catch (e) {
      console.error(`[PSD Reprocess] Failed for template ${template.id}:`, e);
      results.push({
        templateId: template.id,
        success: false,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return NextResponse.json({
    processed: results.length,
    results,
  });
}

async function reprocessTemplate(templateId: string) {
  // 1. Load the template from the database
  const template = await db.template.findUnique({
    where: { id: templateId },
    include: { layers: true },
  });

  if (!template) {
    return { success: false, error: 'Template not found' };
  }

  console.log(`[PSD Reprocess] Template: ${template.name}, baseImage: ${template.baseImage?.substring(0, 100)}`);

  // 2. Try to find the original PSD file in R2
  let psdKey: string | null = null;
  const baseUrl = (process.env.R2_PUBLIC_BASE_URL || '').replace(/\/$/, '');

  // Strategy A: baseImage contains .psd
  if (template.baseImage && template.baseImage.includes('.psd')) {
    psdKey = template.baseImage.replace(`${baseUrl}/`, '');
    console.log(`[PSD Reprocess] Strategy A: Found PSD URL directly: ${psdKey}`);
  }

  // Strategy B: List R2 objects under psd/{templateId}/ to find the PSD
  if (!psdKey) {
    try {
      const prefix = `psd/${templateId}/`;
      console.log(`[PSD Reprocess] Strategy B: Listing R2 under prefix: ${prefix}`);
      const keys = await listStorage(prefix);
      console.log(`[PSD Reprocess] Found ${keys.length} objects under ${prefix}:`, keys);

      // Look for a .psd file
      psdKey = keys.find(k => k.toLowerCase().endsWith('.psd')) || null;

      // If no .psd, we might have already extracted everything
      if (!psdKey && keys.length > 0) {
        console.log(`[PSD Reprocess] No PSD found, but found extracted files: ${keys.join(', ')}`);
      }
    } catch (e) {
      console.warn(`[PSD Reprocess] Strategy B failed (listStorage):`, e);
    }
  }

  // Strategy C: Try common PSD key patterns
  if (!psdKey) {
    const possibleKeys = [
      `psd/${templateId}/template.psd`,
      `psd/${templateId}/1_stack.psd`,
      `psd/${templateId}/${template.name}.psd`,
      `uploads/${templateId}.psd`,
      `templates/${templateId}.psd`,
    ];

    for (const key of possibleKeys) {
      const buffer = await getFromStorage(key);
      if (buffer) {
        psdKey = key;
        console.log(`[PSD Reprocess] Strategy C: Found PSD at: ${key}`);
        break;
      }
    }
  }

  // If we still can't find the PSD, just fill transforms from existing bounds
  if (!psdKey) {
    console.warn(`[PSD Reprocess] No PSD found for template ${templateId}. Filling transforms from existing bounds.`);

    let updated = 0;
    for (const layer of template.layers) {
      if (layer.transformX != null && layer.transformScaleX != null) continue;

      const bx = layer.boundsX;
      const by = layer.boundsY;
      const bw = layer.boundsWidth;
      const bh = layer.boundsHeight;

      if (bx == null || by == null || bw == null || bh == null) continue;
      if (template.width <= 0 || template.height <= 0) continue;

      await db.templateLayer.update({
        where: { id: layer.id },
        data: {
          transformX: (bx + bw / 2) / template.width,
          transformY: (by + bh / 2) / template.height,
          transformScaleX: bw / template.width,
          transformScaleY: bh / template.height,
          transformRotation: 0,
        },
      });

      updated++;
    }

    return {
      success: true,
      templateId,
      name: template.name,
      mode: 'bounds_only',
      layersUpdated: updated,
      message: 'No PSD found. Filled transforms from existing bounds data.',
    };
  }

  // 3. Download PSD from R2
  const buffer = await getFromStorage(psdKey);
  if (!buffer) {
    return { success: false, error: `PSD not found in storage: ${psdKey}` };
  }

  console.log(`[PSD Reprocess] Downloaded PSD: ${buffer.byteLength} bytes from ${psdKey}`);

  // 4. Parse PSD metadata
  const parsed = await parsePSD(buffer);
  console.log(`[PSD Reprocess] Parsed PSD: ${parsed.width}x${parsed.height}, ${parsed.layers.length} layers, ${parsed.smartObjects.length} smart objects`);

  // 5. Extract layer images
  const extracted = await extractLayerImages(buffer);

  // 6. Upload composite image
  let baseImageUrl = '';
  let thumbnailUrl = '';

  if (extracted.composite) {
    const compositeKey = `psd/${templateId}/composite.png`;
    try {
      const result = await uploadToStorage(extracted.composite, compositeKey, 'image/png');
      baseImageUrl = result.url;
      thumbnailUrl = result.url;
      console.log(`[PSD Reprocess] Uploaded composite: ${result.url}`);
    } catch (e) {
      console.warn('[PSD Reprocess] Failed to upload composite:', e);
    }
  }

  // 6b. Fallback: try convertPsdToPng if extractLayerImages didn't produce a composite
  if (!baseImageUrl) {
    try {
      console.log('[PSD Reprocess] No composite from extractLayerImages, trying convertPsdToPng...');
      const pngBuffer = await convertPsdToPng(buffer);
      if (pngBuffer) {
        const compositeKey = `psd/${templateId}/composite.png`;
        const result = await uploadToStorage(pngBuffer, compositeKey, 'image/png');
        baseImageUrl = result.url;
        thumbnailUrl = result.url;
        console.log(`[PSD Reprocess] Uploaded composite via convertPsdToPng: ${result.url}`);
      }
    } catch (e) {
      console.warn('[PSD Reprocess] convertPsdToPng fallback failed:', e);
    }
  }

  // 7. Upload individual layer PNGs
  const layerUrlMap = new Map<number, string>();
  const layerNameMap = new Map<string, string>();
  for (const layerImage of extracted.layers) {
    const safeName = sanitizeLayerName(layerImage.name);
    const layerKey = `psd/${templateId}/layer_${layerImage.layerIndex}_${safeName}.png`;
    try {
      const result = await uploadToStorage(layerImage.buffer, layerKey, 'image/png');
      layerUrlMap.set(layerImage.layerIndex, result.url);
      layerNameMap.set(layerImage.name, result.url);
    } catch (e) {
      console.warn(`[PSD Reprocess] Failed to upload layer "${layerImage.name}":`, e);
    }
  }

  // 8. Update template in database
  const updateData: any = {};
  if (baseImageUrl) {
    updateData.baseImage = baseImageUrl;
    updateData.thumbnail = thumbnailUrl;
  }

  if (Object.keys(updateData).length > 0) {
    await db.template.update({
      where: { id: templateId },
      data: updateData,
    });
  }

  // 9. Update layer data: compositeUrls, transforms, warpData, perspectiveData
  let updatedLayers = 0;

  // Match PSD parsed layers to DB layers by name or index
  for (const layer of template.layers) {
    // Find matching parsed layer
    let psdLayer = parsed.layers.find((pl: any) => pl.name === layer.name);
    if (!psdLayer) {
      const idx = template.layers.findIndex(l => l.id === layer.id);
      if (idx >= 0 && idx < parsed.layers.length) {
        psdLayer = parsed.layers[idx];
      }
    }

    const updateFields: any = {};

    // Update composite URL
    let pngUrl = layerUrlMap.get(layer.zIndex);
    if (!pngUrl && layerNameMap.has(layer.name)) {
      pngUrl = layerNameMap.get(layer.name);
    }
    if (pngUrl) {
      updateFields.compositeUrl = pngUrl;
    }

    // Update from parsed PSD data
    if (psdLayer) {
      const bx = psdLayer.bounds?.x ?? null;
      const by = psdLayer.bounds?.y ?? null;
      const bw = psdLayer.bounds?.width ?? null;
      const bh = psdLayer.bounds?.height ?? null;
      const tw = parsed.width || 1;
      const th = parsed.height || 1;

      if (bx != null && by != null && bw != null && bh != null) {
        updateFields.boundsX = bx;
        updateFields.boundsY = by;
        updateFields.boundsWidth = bw;
        updateFields.boundsHeight = bh;
        updateFields.transformX = (bx + bw / 2) / tw;
        updateFields.transformY = (by + bh / 2) / th;
        updateFields.transformScaleX = bw / tw;
        updateFields.transformScaleY = bh / th;
        updateFields.transformRotation = 0;
      }

      // Store warp data
      if (psdLayer.warpData) {
        updateFields.warpData = JSON.stringify(psdLayer.warpData);
      }

      // Store perspective data
      if (psdLayer.transform) {
        updateFields.perspectiveData = JSON.stringify(psdLayer.transform);
      }
    } else if (layer.transformX == null && layer.boundsX != null) {
      // No PSD layer match — compute transforms from existing bounds
      const bx = layer.boundsX;
      const by = layer.boundsY;
      const bw = layer.boundsWidth;
      const bh = layer.boundsHeight;

      if (bx != null && by != null && bw != null && bh != null && template.width > 0 && template.height > 0) {
        updateFields.transformX = (bx + bw / 2) / template.width;
        updateFields.transformY = (by + bh / 2) / template.height;
        updateFields.transformScaleX = bw / template.width;
        updateFields.transformScaleY = bh / template.height;
        updateFields.transformRotation = 0;
      }
    }

    if (Object.keys(updateFields).length > 0) {
      await db.templateLayer.update({
        where: { id: layer.id },
        data: updateFields,
      });
      updatedLayers++;
    }
  }

  console.log(`[PSD Reprocess] Template ${templateId} done: baseImage=${baseImageUrl.substring(0, 80)}, layers updated: ${updatedLayers}`);

  return {
    success: true,
    templateId,
    name: template.name,
    mode: 'full_reprocess',
    baseImageUpdated: !!baseImageUrl,
    newBaseImageUrl: baseImageUrl,
    layersUpdated: updatedLayers,
    totalExtractedLayers: extracted.layers.length,
  };
}
