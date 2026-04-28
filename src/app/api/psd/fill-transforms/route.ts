import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * POST /api/psd/fill-transforms
 *
 * Computes and fills transformX/Y/ScaleX/ScaleY from existing boundsX/Y/Width/Height.
 * No PSD download needed — works purely from database data.
 *
 * Transform convention:
 *   transformX = center X of layer / template width  (normalized 0-1)
 *   transformY = center Y of layer / template height (normalized 0-1)
 *   transformScaleX = layer width / template width   (normalized 0-1)
 *   transformScaleY = layer height / template height (normalized 0-1)
 *
 * Body: { "all": true } or { "templateId": "uuid" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, all } = body;

    if (!all && !templateId) {
      return NextResponse.json({ error: 'Provide templateId or all=true' }, { status: 400 });
    }

    const where: any = {};
    if (!all && templateId) {
      where.id = templateId;
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
  } catch (error) {
    console.error('[Fill Transforms] Error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to fill transforms', details: message }, { status: 500 });
  }
}
