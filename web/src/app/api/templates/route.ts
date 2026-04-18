import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/templates - List all templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    const where: {
      isActive: boolean;
      category?: string;
      OR?: Array<{
        name: { contains: string };
        description: { contains: string };
      }>;
    } = {
      isActive: true,
    };
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }
    
    const templates = await db.template.findMany({
      where,
      include: {
        layers: {
          orderBy: {
            zIndex: 'asc',
          },
        },
        colorOptions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Format templates
    const formattedTemplates = templates.map(template => ({
      ...template,
      colorOptions: template.colorOptions.map(option => ({
        ...option,
        colors: option.colors, // Now natively a Json object
      })),
      layers: template.layers.map(layer => ({
        ...layer,
        warpData: layer.warpData, // Now natively a Json object
        perspectiveTransform: layer.perspectiveData, // Now natively a Json object
        // Include bounds from database columns
        bounds: layer.boundsX != null && layer.boundsY != null && 
                layer.boundsWidth != null && layer.boundsHeight != null
          ? {
              x: layer.boundsX,
              y: layer.boundsY,
              width: layer.boundsWidth,
              height: layer.boundsHeight,
            }
          : null,
      })),
    }));
    
    return NextResponse.json({
      templates: formattedTemplates,
      total: templates.length,
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
