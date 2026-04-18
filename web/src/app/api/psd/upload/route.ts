import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parsePSD, validatePSDStructure, createTemplateConfig } from '@/lib/psd/parser';
import { uploadToStorage } from '@/lib/cdn/r2-client';
import { v4 as uuidv4 } from 'uuid';
import PSD from 'psd.js';

// Configure API route for large file uploads
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes timeout (max for Vercel Hobby plan)
export const dynamic = 'force-dynamic';

// POST /api/psd/upload - Upload and parse a PSD file
export async function POST(request: NextRequest) {
  try {
    const sharp = (await import('sharp')).default;
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string || 'Uploaded Template';
    const category = formData.get('category') as string || 'custom';
    
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const psdId = uuidv4();
    
    // 1. Upload original PSD to R2
    const psdUpload = await uploadToStorage(buffer, `psd/${psdId}.psd`, 'application/x-photoshop');
    
    // 2. Parse PSD
    const parsed = await parsePSD(buffer);
    const validation = validatePSDStructure(parsed);
    if (!validation.valid) return NextResponse.json({ error: 'Invalid PSD structure', details: validation.errors }, { status: 400 });
    
    // 3. Extract and upload composite + realism layers
    let baseImageUrl = '';
    let thumbnailUrl = '';
    
    try {
      const psdForImage = new PSD(buffer.buffer);
      await psdForImage.parse();
      const psdLayers = psdForImage.tree().descendants();
      
      for (let i = 0; i < parsed.layers.length; i++) {
        const layer = parsed.layers[i];
        const psdLayer = psdLayers[i];
        
        if (psdLayer && (layer.type === 'shadow' || layer.blendMode === 'screen' || layer.blendMode === 'linear dodge')) {
          try {
            if (psdLayer.image?.pixelData) {
              const pixelBuffer = await sharp(Buffer.from(psdLayer.image.pixelData), {
                raw: { width: psdLayer.width, height: psdLayer.height, channels: 4 }
              }).png().toBuffer();
              
              const layerUpload = await uploadToStorage(pixelBuffer, `layers/${uuidv4()}.png`);
              layer.compositeUrl = layerUpload.url;
            }
          } catch (e) { console.warn(`Layer ${layer.name} export failed`, e); }
        }
      }

      if (psdForImage.image?.pixelData) {
        const pixelData = psdForImage.image.pixelData;
        const w = psdForImage.image.width();
        const h = psdForImage.image.height();
        
        const baseBuffer = await sharp(Buffer.from(pixelData), {
          raw: { width: w, height: h, channels: 4 }
        }).png().toBuffer();
        const baseUpload = await uploadToStorage(baseBuffer, `templates/${psdId}.png`);
        baseImageUrl = baseUpload.url;
        
        const thumbBuffer = await sharp(baseBuffer)
          .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
          .png().toBuffer();
        const thumbUpload = await uploadToStorage(thumbBuffer, `thumbnails/${psdId}.png`);
        thumbnailUrl = thumbUpload.url;
      }
    } catch (e) { console.error('Image extraction failed', e); }
    
    const templateConfig = createTemplateConfig(parsed, name, `${category}-${psdId.slice(0, 8)}`);
    
    const psdTemplate = await db.pSDTemplate.create({
      data: {
        name,
        originalFile: psdUpload.url,
        parsedData: parsed as any,
        width: parsed.width,
        height: parsed.height,
      },
    });
    
    const template = await db.template.create({
      data: {
        name,
        slug: templateConfig.slug,
        description: `Uploaded PSD template with ${parsed.smartObjects.length} design placeholder(s)`,
        category,
        thumbnail: thumbnailUrl || baseImageUrl,
        baseImage: baseImageUrl,
        width: parsed.width,
        height: parsed.height,
        isActive: true,
        layers: {
          create: templateConfig.layers.map((layer, index) => ({
            name: layer.name,
            type: layer.type as any,
            zIndex: index,
            blendMode: layer.blendMode,
            opacity: layer.opacity,
            transformX: layer.transform?.x || null,
            transformY: layer.transform?.y || null,
            transformScaleX: layer.transform?.scaleX || null,
            transformScaleY: layer.transform?.scaleY || null,
            transformRotation: layer.transform?.rotation || null,
            boundsX: layer.bounds?.x || null,
            boundsY: layer.bounds?.y || null,
            boundsWidth: layer.bounds?.width || null,
            boundsHeight: layer.bounds?.height || null,
            warpData: layer.warpData as any || null,
            perspectiveData: (layer.perspectiveTransform as any) || null,
            isColorable: layer.isColorable,
            defaultColor: layer.defaultColor,
            compositeUrl: layer.compositeUrl || null,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, templateId: template.id });
  } catch (error) {
    console.error('PSD Upload Error:', error);
    return NextResponse.json({ error: 'Failed to process PSD' }, { status: 500 });
  }
}

// GET /api/psd/upload - Get upload info
export async function GET() {
  return NextResponse.json({
    maxFileSize: '100MB',
    supportedFormats: ['PSD'],
    features: [
      'Layer extraction',
      'Smart object detection',
      'Color layer identification',
      'Transform matrix extraction',
      'Warp data parsing',
    ],
  });
}
