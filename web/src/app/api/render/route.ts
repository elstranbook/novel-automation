import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateMockup } from '@/lib/render/server-render';
import { uploadToStorage, generateRenderKey } from '@/lib/cdn/r2-client';
import { addJob, getJob, getQueueStats, setJobProcessor } from '@/lib/queue/memory-queue';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Initialize the job processor
setJobProcessor(async (job) => {
  const { templateId, userImage, designX, designY, designScale, designRotation, colorSelections, exportWidth, exportHeight } = job.data;
  
  // Get template with layers for perspective-aware rendering
  const template = await db.template.findUnique({
    where: { id: templateId },
    include: { layers: true },
  });
  
  if (!template) {
    throw new Error('Template not found');
  }
  
  // Map layers to RenderLayerInfo format
  const renderLayers = template.layers.map(layer => ({
    name: layer.name,
    type: layer.type,
    boundsX: layer.boundsX,
    boundsY: layer.boundsY,
    boundsWidth: layer.boundsWidth,
    boundsHeight: layer.boundsHeight,
    transformX: layer.transformX,
    transformY: layer.transformY,
    transformScaleX: layer.transformScaleX,
    transformScaleY: layer.transformScaleY,
    warpData: layer.warpData,
    perspectiveData: layer.perspectiveData,
    blendMode: layer.blendMode,
    opacity: layer.opacity,
    compositeUrl: layer.compositeUrl,
  }));
  
  // Generate mockup with layer data for smart-object-aware rendering
  const imageBuffer = await generateMockup({
    templateBaseImage: template.baseImage,
    userImage,
    designX,
    designY,
    designScale,
    designRotation,
    colorSelections,
    outputWidth: exportWidth || 2048,
    outputHeight: exportHeight || 2048,
    layers: renderLayers,
    templateWidth: template.width,
    templateHeight: template.height,
    warpPreset: template.warpPreset,
    coverWidth: template.coverWidth,
    coverHeight: template.coverHeight,
    spineWidth: template.spineWidth,
  });
  
  // Upload to storage
  const key = generateRenderKey(templateId);
  const { url } = await uploadToStorage(imageBuffer, key, 'image/png');
  
  return {
    url,
    width: exportWidth || 2048,
    height: exportHeight || 2048,
  };
});

// GET /api/render - Check render status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const renderId = searchParams.get('id');
    const stats = searchParams.get('stats');
    
    // Return queue stats if requested
    if (stats === 'true') {
      const queueStats = getQueueStats();
      return NextResponse.json(queueStats);
    }
    
    if (!renderId) {
      return NextResponse.json(
        { error: 'Render ID is required' },
        { status: 400 }
      );
    }
    
    // Check in-memory queue first
    const queueJob = getJob(renderId);
    if (queueJob) {
      return NextResponse.json({
        id: queueJob.id,
        status: queueJob.status,
        progress: queueJob.progress,
        resultUrl: queueJob.result?.url || null,
        error: queueJob.error,
      });
    }
    
    // Check database
    const render = await db.render.findUnique({
      where: { id: renderId },
      include: {
        template: true,
      },
    });
    
    if (!render) {
      return NextResponse.json(
        { error: 'Render not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      id: render.id,
      status: render.status,
      progress: render.progress || 0,
      resultUrl: render.resultUrl,
    });
  } catch (error) {
    console.error('Error checking render status:', error);
    return NextResponse.json(
      { error: 'Failed to check render status' },
      { status: 500 }
    );
  }
}

// POST /api/render - Submit render job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      templateId,
      userImage,
      designX,
      designY,
      designScale,
      designRotation,
      colorSelections,
      exportWidth,
      exportHeight,
      useQueue = true, // Use queue by default
    } = body;
    
    // Get template with layers for perspective-aware rendering
    const template = await db.template.findUnique({
      where: { id: templateId },
      include: { layers: true },
    });
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }
    
    // Create render job in database
    const render = await db.render.create({
      data: {
        templateId,
        userImage,
        designX: designX || 0.5,
        designY: designY || 0.5,
        designScale: designScale || 1.0,
        designRotation: designRotation || 0,
        colorSelections: JSON.stringify(colorSelections || {}),
        status: 'pending',
        progress: 0,
      },
    });
    
    if (useQueue) {
      // Add to queue for background processing
      const job = await addJob({
        templateId,
        userImage,
        designX: designX || 0.5,
        designY: designY || 0.5,
        designScale: designScale || 1.0,
        designRotation: designRotation || 0,
        colorSelections: colorSelections || {},
        exportWidth: exportWidth || 2048,
        exportHeight: exportHeight || 2048,
      });
      
      // Update database job ID
      await db.render.update({
        where: { id: render.id },
        data: {
          status: 'pending',
          progress: 0,
        },
      });
      
      return NextResponse.json({
        id: job.id,
        status: 'pending',
        progress: 0,
        message: 'Render job queued for processing',
      });
    } else {
      // Process synchronously (for smaller renders)
      await db.render.update({
        where: { id: render.id },
        data: {
          status: 'processing',
          progress: 10,
        },
      });
      
      try {
        // Map layers to RenderLayerInfo format
        const renderLayers = template.layers.map(layer => ({
          name: layer.name,
          type: layer.type,
          boundsX: layer.boundsX,
          boundsY: layer.boundsY,
          boundsWidth: layer.boundsWidth,
          boundsHeight: layer.boundsHeight,
          transformX: layer.transformX,
          transformY: layer.transformY,
          transformScaleX: layer.transformScaleX,
          transformScaleY: layer.transformScaleY,
          warpData: layer.warpData,
          perspectiveData: layer.perspectiveData,
          blendMode: layer.blendMode,
          opacity: layer.opacity,
          compositeUrl: layer.compositeUrl,
        }));
        
        const imageBuffer = await generateMockup({
          templateBaseImage: template.baseImage,
          userImage,
          designX: designX || 0.5,
          designY: designY || 0.5,
          designScale: designScale || 1.0,
          designRotation: designRotation || 0,
          colorSelections: colorSelections || {},
          outputWidth: exportWidth || 2048,
          outputHeight: exportHeight || 2048,
          layers: renderLayers,
          templateWidth: template.width,
          templateHeight: template.height,
          warpPreset: template.warpPreset,
          coverWidth: template.coverWidth,
          coverHeight: template.coverHeight,
          spineWidth: template.spineWidth,
        });
        
        // Try to upload to CDN (works on Vercel)
        let resultUrl = '';
        try {
          const key = generateRenderKey(templateId);
          const uploadResult = await uploadToStorage(imageBuffer, key, 'image/png');
          resultUrl = uploadResult.url;
        } catch {
          // Fallback: save locally (only works locally, not on Vercel)
          try {
            const rendersDir = path.join(process.cwd(), 'public', 'renders');
            if (!existsSync(rendersDir)) {
              await mkdir(rendersDir, { recursive: true });
            }
            const filename = `${render.id}.png`;
            const filepath = path.join(rendersDir, filename);
            await writeFile(filepath, imageBuffer);
            resultUrl = `/renders/${filename}`;
          } catch {
            // No storage available, will return without URL
          }
        }
        
        // Update render status
        const updatedRender = await db.render.update({
          where: { id: render.id },
          data: {
            status: 'completed',
            resultUrl,
            progress: 100,
            completedAt: new Date(),
          },
        });
        
        return NextResponse.json({
          id: updatedRender.id,
          status: updatedRender.status,
          progress: 100,
          resultUrl: updatedRender.resultUrl,
        });
      } catch (renderError) {
        console.error('Render processing error:', renderError);
        
        await db.render.update({
          where: { id: render.id },
          data: {
            status: 'failed',
            progress: 0,
          },
        });
        
        return NextResponse.json(
          { error: 'Render processing failed' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Error creating render:', error);
    return NextResponse.json(
      { error: 'Failed to create render' },
      { status: 500 }
    );
  }
}

// DELETE /api/render - Cancel a render job
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const renderId = searchParams.get('id');
    
    if (!renderId) {
      return NextResponse.json(
        { error: 'Render ID is required' },
        { status: 400 }
      );
    }
    
    // Cancel from queue
    const { cancelJob } = await import('@/lib/queue/memory-queue');
    const cancelled = cancelJob(renderId);
    
    if (cancelled) {
      return NextResponse.json({
        id: renderId,
        status: 'cancelled',
        message: 'Render job cancelled',
      });
    }
    
    // Check database
    const render = await db.render.findUnique({
      where: { id: renderId },
    });
    
    if (!render) {
      return NextResponse.json(
        { error: 'Render not found' },
        { status: 404 }
      );
    }
    
    if (render.status === 'processing') {
      return NextResponse.json(
        { error: 'Cannot cancel a processing job' },
        { status: 400 }
      );
    }
    
    // Update status to failed
    await db.render.update({
      where: { id: renderId },
      data: {
        status: 'failed',
      },
    });
    
    return NextResponse.json({
      id: renderId,
      status: 'cancelled',
      message: 'Render job cancelled',
    });
  } catch (error) {
    console.error('Error cancelling render:', error);
    return NextResponse.json(
      { error: 'Failed to cancel render' },
      { status: 500 }
    );
  }
}
