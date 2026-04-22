import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * POST /api/psd/diagnose
 *
 * Returns current state of all templates and their layers (no changes made).
 * Body: { } or { "templateId": "uuid" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { templateId } = body;

    const where: any = {};
    if (templateId) {
      where.id = templateId;
    }

    const templates = await db.template.findMany({
      where,
      include: { layers: true },
    });

    const results = templates.map(t => ({
      templateId: t.id,
      name: t.name,
      width: t.width,
      height: t.height,
      baseImage: t.baseImage?.substring(0, 150),
      thumbnail: t.thumbnail?.substring(0, 150),
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
        hasWarpData: !!l.warpData,
        hasPerspectiveData: !!l.perspectiveData,
        compositeUrl: l.compositeUrl?.substring(0, 150),
        blendMode: l.blendMode,
        opacity: l.opacity,
      })),
    }));

    return NextResponse.json({ templates: results, total: results.length });
  } catch (error) {
    console.error('[Diagnose] Error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Diagnose failed', details: message }, { status: 500 });
  }
}
