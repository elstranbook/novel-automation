import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parsePSD, validatePSDStructure } from '@/lib/psd/parser';
import { getFromStorage } from '@/lib/cdn/r2-client';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

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
    
    // 2. Parse PSD locally
    const parsed = await parsePSD(buffer);
    const validation = validatePSDStructure(parsed);
    if (!validation.valid) {
      return NextResponse.json({ 
        error: 'Invalid PSD structure', 
        details: validation.errors 
      }, { status: 400 });
    }
    
    // 3. Create template - use PSD URL as thumbnail for now
    const baseUrl = (process.env.R2_PUBLIC_BASE_URL || '').replace(/\/$/, '');
    const psdPublicUrl = baseUrl ? `${baseUrl}/${psdKey}` : '';
    
    // 4. Save template
    const template = await db.template.create({
      data: {
        id: psdId,
        name: name || 'Uploaded Template',
        slug: `${psdId}-${Date.now()}`,
        category: category || 'custom',
        thumbnail: psdPublicUrl,
        baseImage: psdPublicUrl,
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
    
    return NextResponse.json({ 
      success: true, 
      templateId: template.id,
      template,
      layers: parsed.layers.length,
      colorLayers: parsed.colorLayers.length,
    });
  } catch (error) {
    console.error('PSD Process Error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to process PSD', details: message }, { status: 500 });
  }
}