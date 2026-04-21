import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parsePSD, validatePSDStructure, extractLayerImages } from '@/lib/psd/parser';
import { getFromStorage, uploadToStorage } from '@/lib/cdn/r2-client';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * Sanitize a layer name for use as a filename component.
 * Replaces non-alphanumeric characters with underscores and collapses duplicates.
 */
function sanitizeLayerName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 60);
}

// POST /api/psd/process - Process a PSD that was uploaded to R2
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { psdKey, name, category } = body;
    
    if (!psdKey) return NextResponse.json({ error: 'No PSD key provided' }, { status: 400 });
    
    // 1. Download PSD from R2
    const buffer = await getFromStorage(psdKey);
    if (!buffer) {
      return NextResponse.json({ error: 'PSD not found in storage' }, { status: 404 });
    }
    
    const psdId = uuidv4();
    
    // 2. Parse PSD metadata (fast — skips image data)
    const parsed = await parsePSD(buffer);
    const validation = validatePSDStructure(parsed);
    if (!validation.valid) {
      return NextResponse.json({ 
        error: 'Invalid PSD structure', 
        details: validation.errors 
      }, { status: 400 });
    }
    
    // 3. Extract layer images as PNGs (slower — includes image data)
    console.log(`[PSD Process] Extracting layer images for template ${psdId}...`);
    const extracted = await extractLayerImages(buffer);
    
    // 4. Upload composite (flattened) image to R2
    let baseImageUrl = '';
    let thumbnailUrl = '';
    
    if (extracted.composite) {
      const compositeKey = `psd/${psdId}/composite.png`;
      try {
        const result = await uploadToStorage(extracted.composite, compositeKey, 'image/png');
        baseImageUrl = result.url;
        thumbnailUrl = result.url;
        console.log(`[PSD Process] Uploaded composite image: ${result.url} (${extracted.composite.byteLength} bytes, ${result.storageType})`);
      } catch (e) {
        console.warn('[PSD Process] Failed to upload composite image:', e);
      }
    }
    
    // 5. Upload individual layer PNGs to R2
    const layerUrlMap = new Map<number, string>(); // layerIndex -> PNG URL
    for (const layerImage of extracted.layers) {
      const safeName = sanitizeLayerName(layerImage.name);
      const layerKey = `psd/${psdId}/layer_${layerImage.layerIndex}_${safeName}.png`;
      try {
        const result = await uploadToStorage(layerImage.buffer, layerKey, 'image/png');
        layerUrlMap.set(layerImage.layerIndex, result.url);
        console.log(`[PSD Process] Uploaded layer "${layerImage.name}": ${result.url} (${result.storageType})`);
      } catch (e) {
        console.warn(`[PSD Process] Failed to upload layer "${layerImage.name}":`, e);
      }
    }
    
    // 6. Fallback: if no composite was extracted, use PSD URL as base (still not ideal but better than nothing)
    if (!baseImageUrl) {
      const baseUrl = (process.env.R2_PUBLIC_BASE_URL || '').replace(/\/$/, '');
      baseImageUrl = baseUrl ? `${baseUrl}/${psdKey}` : '';
      thumbnailUrl = baseImageUrl;
      console.warn(`[PSD Process] No composite image extracted, falling back to PSD URL: ${baseImageUrl}`);
    }
    
    // 7. Create template with PNG URLs
    const template = await db.template.create({
      data: {
        id: psdId,
        name: name || 'Uploaded Template',
        slug: `${psdId}-${Date.now()}`,
        category: category || 'custom',
        thumbnail: thumbnailUrl,
        baseImage: baseImageUrl,
        width: parsed.width,
        height: parsed.height,
        isActive: true,
        layers: {
          create: parsed.layers.map((layer: any, idx: number) => ({
            name: layer.name,
            type: layer.type,
            zIndex: idx,
            blendMode: layer.blendMode,
            opacity: layer.opacity,
            boundsX: layer.bounds?.x,
            boundsY: layer.bounds?.y,
            boundsWidth: layer.bounds?.width,
            boundsHeight: layer.bounds?.height,
            isColorable: layer.isColorable || layer.type === 'color_layer',
            // Save warp and perspective data extracted from PSD
            warpData: layer.warpData || undefined,
            perspectiveData: layer.transform || undefined,
            // Use the PNG URL from extracted images, or undefined
            compositeUrl: layerUrlMap.get(idx) || undefined,
          })),
        },
        colorOptions: {
          create: parsed.colorLayers.map((cl: any) => ({
            name: cl.name,
            layerName: cl.name,
            colors: cl.color ? [{ name: cl.name, hex: cl.color }] : [],
          })),
        },
      },
      include: {
        layers: true,
        colorOptions: true,
      },
    });
    
    console.log(`[PSD Process] Template created: ${template.id}, baseImage=${baseImageUrl.substring(0, 80)}, layers with PNGs: ${layerUrlMap.size}/${parsed.layers.length}`);
    
    return NextResponse.json({ 
      success: true, 
      templateId: template.id,
      template,
      layers: parsed.layers.length,
      colorLayers: parsed.colorLayers.length,
      extractedLayerImages: layerUrlMap.size,
      hasCompositeImage: !!extracted.composite,
    });
  } catch (error) {
    console.error('PSD Process Error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to process PSD', details: message }, { status: 500 });
  }
}
