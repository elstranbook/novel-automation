import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractLayerImages, convertPsdToPng } from '@/lib/psd/parser';
import { getFromStorage, uploadToStorage } from '@/lib/cdn/r2-client';

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
 * Reprocess an existing template that has PSD URLs instead of PNG URLs.
 * Downloads the PSD from R2, extracts layer images as PNGs, uploads them,
 * and updates the database with PNG URLs.
 *
 * Body: { templateId: string }  OR  { all: true } to reprocess all templates with PSD URLs
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, all } = body;

    if (all) {
      // Reprocess ALL templates that have PSD URLs
      return await reprocessAll();
    }

    if (!templateId) {
      return NextResponse.json({ error: 'Provide templateId or set all=true' }, { status: 400 });
    }

    const result = await reprocessTemplate(templateId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[PSD Reprocess] Error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to reprocess', details: message }, { status: 500 });
  }
}

async function reprocessAll() {
  // Find all templates with PSD URLs in baseImage or thumbnail
  const templates = await db.template.findMany({
    where: {
      OR: [
        { baseImage: { contains: '.psd' } },
        { thumbnail: { contains: '.psd' } },
        { baseImage: { contains: 'mockups-assets' } },
      ],
    },
    include: { layers: true },
  });

  console.log(`[PSD Reprocess] Found ${templates.length} templates with PSD URLs`);

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

  // 2. Determine the PSD key from the baseImage URL
  // baseImage might be: https://mockups-assets.elstranbooks.com/psd/{uuid}/filename.psd
  // Or it might be just a directory path without filename
  let psdKey: string | null = null;
  const baseUrl = (process.env.R2_PUBLIC_BASE_URL || '').replace(/\/$/, '');

  if (template.baseImage) {
    if (template.baseImage.includes('.psd')) {
      // Extract the key from the full URL
      psdKey = template.baseImage.replace(`${baseUrl}/`, '');
    } else if (template.baseImage.includes('/psd/')) {
      // Directory path without filename — try to find the PSD in R2
      // The key pattern is psd/{uuid}/filename.psd
      const prefix = template.baseImage.replace(`${baseUrl}/`, '');
      console.log(`[PSD Reprocess] Looking for PSD under prefix: ${prefix}`);
      // We'll try common filenames
      const possibleKeys = [
        `${prefix}/1_stack.psd`,
        `${prefix}/template.psd`,
        `${prefix}/${template.name}.psd`,
      ];
      for (const key of possibleKeys) {
        const exists = await getFromStorage(key);
        if (exists) {
          psdKey = key;
          break;
        }
      }
    }
  }

  if (!psdKey) {
    return { success: false, error: 'Could not determine PSD key from template baseImage' };
  }

  console.log(`[PSD Reprocess] Processing template ${templateId}, PSD key: ${psdKey}`);

  // 3. Download PSD from R2
  const buffer = await getFromStorage(psdKey);
  if (!buffer) {
    return { success: false, error: `PSD not found in storage: ${psdKey}` };
  }

  console.log(`[PSD Reprocess] Downloaded PSD: ${buffer.byteLength} bytes`);

  // 4. Extract layer images
  const extracted = await extractLayerImages(buffer);

  // 5. Upload composite image
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

  // 5b. Fallback: try convertPsdToPng if extractLayerImages didn't produce a composite
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

  // 6. Upload individual layer PNGs
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

  // 7. Update template in database
  const updateData: any = {};
  if (baseImageUrl) {
    updateData.baseImage = baseImageUrl;
    updateData.thumbnail = thumbnailUrl;
  }

  await db.template.update({
    where: { id: templateId },
    data: updateData,
  });

  // 8. Update layer compositeUrls
  let updatedLayers = 0;
  for (const layer of template.layers) {
    let pngUrl = layerUrlMap.get(layer.zIndex);
    if (!pngUrl && layerNameMap.has(layer.name)) {
      pngUrl = layerNameMap.get(layer.name);
    }
    
    if (pngUrl) {
      const updateFields: any = { compositeUrl: pngUrl };
      
      if (layer.transformX == null && layer.boundsX != null && layer.boundsY != null && 
          layer.boundsWidth != null && layer.boundsHeight != null && 
          template.width > 0 && template.height > 0) {
        updateFields.transformScaleX = layer.boundsWidth / template.width;
        updateFields.transformScaleY = layer.boundsHeight / template.height;
        updateFields.transformX = (layer.boundsX + layer.boundsWidth / 2) / template.width;
        updateFields.transformY = (layer.boundsY + layer.boundsHeight / 2) / template.height;
        updateFields.transformRotation = 0;
      }
      
      await db.templateLayer.update({
        where: { id: layer.id },
        data: updateFields,
      });
      updatedLayers++;
    }
  }

  console.log(`[PSD Reprocess] Template ${templateId} updated: baseImage=${baseImageUrl.substring(0, 80)}, layers with PNGs: ${updatedLayers}`);

  return {
    success: true,
    templateId,
    baseImageUpdated: !!baseImageUrl,
    newBaseImageUrl: baseImageUrl,
    layersWithPngs: updatedLayers,
    totalExtractedLayers: extracted.layers.length,
  };
}
