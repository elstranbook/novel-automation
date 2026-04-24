import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE /api/templates/[id] - Delete a template and all its associated data
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Check if template exists
    const template = await db.template.findUnique({
      where: { id },
      include: {
        layers: true,
        colorOptions: true,
        renders: true,
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Delete the template — cascading deletes handle layers, colorOptions, and renders
    await db.template.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      deleted: {
        id: template.id,
        name: template.name,
        layersCount: template.layers.length,
        colorOptionsCount: template.colorOptions.length,
        rendersCount: template.renders.length,
      },
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}

// GET /api/templates/[id] - Get a single template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const template = await db.template.findUnique({
      where: { id },
      include: {
        layers: {
          orderBy: { zIndex: 'asc' },
        },
        colorOptions: true,
      },
    });

    if (!template || !template.isActive) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    const formattedTemplate = {
      ...template,
      layers: template.layers.map(layer => ({
        ...layer,
        warpData: layer.warpData,
        perspectiveTransform: layer.perspectiveData,
        bounds:
          layer.boundsX != null && layer.boundsY != null &&
          layer.boundsWidth != null && layer.boundsHeight != null
            ? {
                x: layer.boundsX,
                y: layer.boundsY,
                width: layer.boundsWidth,
                height: layer.boundsHeight,
              }
            : null,
      })),
    };

    return NextResponse.json({ template: formattedTemplate });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}
