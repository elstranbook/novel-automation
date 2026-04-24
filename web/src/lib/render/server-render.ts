// Server-side rendering utility for mockups

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export interface RenderOptions {
  templateBaseImage: string;
  userImage: string;
  designX: number;
  designY: number;
  designScale: number;
  designRotation: number;
  colorSelections: Record<string, string>;
  outputWidth: number;
  outputHeight: number;
  /** Optional layer data for perspective-aware rendering */
  layers?: RenderLayerInfo[];
  /** Template dimensions (pixel width/height of the base image) */
  templateWidth?: number;
  templateHeight?: number;
}

export interface RenderLayerInfo {
  name: string;
  type: string;
  boundsX?: number | null;
  boundsY?: number | null;
  boundsWidth?: number | null;
  boundsHeight?: number | null;
  transformX?: number | null;
  transformY?: number | null;
  transformScaleX?: number | null;
  transformScaleY?: number | null;
  warpData?: any;
  perspectiveData?: any;
  blendMode?: string;
  opacity?: number;
  compositeUrl?: string | null;
}

export interface LayerInfo {
  type: string;
  blendMode: string;
  opacity: number;
  color?: string;
  transform?: {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
  };
}

/**
 * Get the smart object bounds for a layer, matching the client-side logic
 * in smart-object-helpers.ts
 */
function getSmartObjectBounds(
  layer: RenderLayerInfo,
  templateWidth: number,
  templateHeight: number
): { x: number; y: number; width: number; height: number } | null {
  // Priority 1: transformX/Y/ScaleX/ScaleY (normalized 0-1)
  if (layer.transformX != null && layer.transformY != null &&
      layer.transformScaleX != null && layer.transformScaleY != null) {
    const w = layer.transformScaleX * templateWidth;
    const h = layer.transformScaleY * templateHeight;
    const x = layer.transformX * templateWidth - w / 2;
    const y = layer.transformY * templateHeight - h / 2;
    return { x, y, width: w, height: h };
  }

  // Priority 2: boundsX/Y/Width/Height (absolute pixel coords from PSD)
  if (layer.boundsX != null && layer.boundsY != null &&
      layer.boundsWidth != null && layer.boundsHeight != null) {
    return {
      x: layer.boundsX,
      y: layer.boundsY,
      width: layer.boundsWidth,
      height: layer.boundsHeight,
    };
  }

  return null;
}

/**
 * Inverse bilinear interpolation: given a point (px, py) and a quad defined by 4 corners
 * [topLeft, topRight, bottomRight, bottomLeft], find the (u, v) parameters such that
 * bilinear(u, v) ≈ (px, py).
 *
 * Uses Newton's method with the Jacobian of the bilinear mapping.
 */
function inverseBilinear(
  px: number, py: number,
  tl: { x: number; y: number }, tr: { x: number; y: number },
  br: { x: number; y: number }, bl: { x: number; y: number }
): { u: number; v: number } | null {
  // Initial guess at center of quad
  let u = 0.5;
  let v = 0.5;

  for (let iter = 0; iter < 10; iter++) {
    // Forward bilinear: compute expected position at current (u, v)
    const x = (1 - u) * (1 - v) * tl.x + u * (1 - v) * tr.x + u * v * br.x + (1 - u) * v * bl.x;
    const y = (1 - u) * (1 - v) * tl.y + u * (1 - v) * tr.y + u * v * br.y + (1 - u) * v * bl.y;

    const dx = px - x;
    const dy = py - y;

    // Convergence check
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) break;

    // Jacobian partial derivatives
    const dxdu = -(1 - v) * tl.x + (1 - v) * tr.x + v * br.x - v * bl.x;
    const dxdv = -(1 - u) * tl.x - u * tr.x + u * br.x + (1 - u) * bl.x;
    const dydu = -(1 - v) * tl.y + (1 - v) * tr.y + v * br.y - v * bl.y;
    const dydv = -(1 - u) * tl.y - u * tr.y + u * br.y + (1 - u) * bl.y;

    const det = dxdu * dydv - dxdv * dydu;
    if (Math.abs(det) < 1e-10) return null;

    u += (dydv * dx - dxdv * dy) / det;
    v += (-dydu * dx + dxdu * dy) / det;

    // Clamp to slightly outside [0,1] to allow edge pixels
    u = Math.max(-0.02, Math.min(1.02, u));
    v = Math.max(-0.02, Math.min(1.02, v));
  }

  // Reject if clearly outside the quad
  if (u < -0.005 || u > 1.005 || v < -0.005 || v > 1.005) return null;
  return { u: Math.max(0, Math.min(1, u)), v: Math.max(0, Math.min(1, v)) };
}

/**
 * Apply perspective warp to a design image using inverse bilinear interpolation.
 * Creates a transparent canvas the same size as the base image, with the design
 * warped to fit the perspective quad defined by the corners.
 *
 * The design is first placed on a flat canvas matching the smart object bounds
 * (respecting designX/designY/designScale), then each pixel in the perspective
 * quad's bounding box is mapped back to the flat canvas via inverse bilinear.
 */
async function applyPerspectiveWarp(
  designBuffer: Buffer,
  corners: Array<{ x: number; y: number }>,
  baseWidth: number,
  baseHeight: number,
  templateWidth: number,
  templateHeight: number,
  bounds: { x: number; y: number; width: number; height: number },
  designX: number,
  designY: number,
  designScale: number
): Promise<Buffer> {
  const designImage = sharp(designBuffer);
  const designMeta = await designImage.metadata();
  const designW = designMeta.width!;
  const designH = designMeta.height!;

  // Scale corners from template coordinates to base image coordinates
  const scaleX = baseWidth / templateWidth;
  const scaleY = baseHeight / templateHeight;
  const scaledCorners = corners.map(c => ({
    x: Math.round(c.x * scaleX),
    y: Math.round(c.y * scaleY),
  }));

  const [tl, tr, br, bl] = scaledCorners;

  // Calculate bounding box of the perspective quad on the base image
  const xs = scaledCorners.map(c => c.x);
  const ys = scaledCorners.map(c => c.y);
  const minX = Math.max(0, Math.min(...xs));
  const minY = Math.max(0, Math.min(...ys));
  const maxX = Math.min(baseWidth, Math.max(...xs));
  const maxY = Math.min(baseHeight, Math.max(...ys));

  // --- Step 1: Create flat design canvas (bounds-sized) ---
  // This handles designX/designY/designScale positioning just like the flat renderer
  const scaledBounds = {
    x: bounds.x * scaleX,
    y: bounds.y * scaleY,
    width: bounds.width * scaleX,
    height: bounds.height * scaleY,
  };

  const imgAspect = designW / designH;
  const boundsAspect = scaledBounds.width / scaledBounds.height;
  let drawW: number, drawH: number;
  if (imgAspect > boundsAspect) {
    drawH = scaledBounds.height * designScale;
    drawW = drawH * imgAspect;
  } else {
    drawW = scaledBounds.width * designScale;
    drawH = drawW / imgAspect;
  }

  // Resize the design to the calculated draw dimensions
  const resizedDesignBuf = await sharp(designBuffer)
    .resize(Math.round(drawW), Math.round(drawH), { fit: 'cover' })
    .ensureAlpha()
    .raw()
    .toBuffer();

  const resizedW = Math.round(drawW);
  const resizedH = Math.round(drawH);

  // Position of the design within the flat bounds canvas
  const flatOffsetX = Math.round(scaledBounds.width * designX - drawW / 2);
  const flatOffsetY = Math.round(scaledBounds.height * designY - drawH / 2);

  // --- Step 2: Create the output canvas (base-image-sized, transparent) ---
  const outputChannels = 4;
  const output = Buffer.alloc(baseWidth * baseHeight * outputChannels, 0);

  // --- Step 3: For each pixel in the bounding box, use inverse bilinear ---
  // to find the corresponding (u, v) in [0,1] within the quad, then map to
  // the flat design canvas coordinates.
  for (let py = minY; py < maxY; py++) {
    for (let px = minX; px < maxX; px++) {
      const uv = inverseBilinear(px, py, tl, tr, br, bl);
      if (!uv) continue;

      const { u, v } = uv;

      // (u, v) maps to position within the smart object bounds
      // Convert to flat design canvas coordinates
      const flatX = u * scaledBounds.width - flatOffsetX;
      const flatY = v * scaledBounds.height - flatOffsetY;

      // Bilinear sampling from the resized design image
      const srcXf = flatX;
      const srcYf = flatY;
      const srcX0 = Math.floor(srcXf);
      const srcY0 = Math.floor(srcYf);
      const srcX1 = srcX0 + 1;
      const srcY1 = srcY0 + 1;

      // Skip if completely outside the design
      if (srcX1 < 0 || srcY1 < 0 || srcX0 >= resizedW || srcY0 >= resizedH) continue;

      // Fractional parts for bilinear interpolation
      const fx = srcXf - srcX0;
      const fy = srcYf - srcY0;

      // Helper to safely sample a pixel from the resized design
      const samplePixel = (sx: number, sy: number): [number, number, number, number] => {
        if (sx < 0 || sx >= resizedW || sy < 0 || sy >= resizedH) return [0, 0, 0, 0];
        const idx = (sy * resizedW + sx) * outputChannels;
        return [resizedDesignBuf[idx], resizedDesignBuf[idx + 1], resizedDesignBuf[idx + 2], resizedDesignBuf[idx + 3]];
      };

      const c00 = samplePixel(srcX0, srcY0);
      const c10 = samplePixel(srcX1, srcY0);
      const c01 = samplePixel(srcX0, srcY1);
      const c11 = samplePixel(srcX1, srcY1);

      // Bilinear interpolation
      const r = c00[0] * (1 - fx) * (1 - fy) + c10[0] * fx * (1 - fy) + c01[0] * (1 - fx) * fy + c11[0] * fx * fy;
      const g = c00[1] * (1 - fx) * (1 - fy) + c10[1] * fx * (1 - fy) + c01[1] * (1 - fx) * fy + c11[1] * fx * fy;
      const b = c00[2] * (1 - fx) * (1 - fy) + c10[2] * fx * (1 - fy) + c01[2] * (1 - fx) * fy + c11[2] * fx * fy;
      const a = c00[3] * (1 - fx) * (1 - fy) + c10[3] * fx * (1 - fy) + c01[3] * (1 - fx) * fy + c11[3] * fx * fy;

      // Only write if there's meaningful alpha
      if (a < 1) continue;

      const dstIdx = (py * baseWidth + px) * outputChannels;
      output[dstIdx] = Math.round(r);
      output[dstIdx + 1] = Math.round(g);
      output[dstIdx + 2] = Math.round(b);
      output[dstIdx + 3] = Math.round(a);
    }
  }

  return sharp(output, {
    raw: { width: baseWidth, height: baseHeight, channels: outputChannels as 4 },
  }).png().toBuffer();
}

/**
 * Select the best smart object layer for rendering the user's cover,
 * matching the client-side logic in smart-object-helpers.ts
 */
function selectSmartObjectLayer(layers: RenderLayerInfo[]): RenderLayerInfo | null {
  const smartObjectLayers = layers.filter(l => l.type === 'smart_object' && (l.opacity ?? 1) > 0);
  if (smartObjectLayers.length === 0) return null;

  // Priority 1: "Front cover", "Book cover", "Cover" (not back/color)
  let layer = smartObjectLayers.find(l => {
    const name = l.name.toLowerCase();
    return name.includes('front cover') || name.includes('book cover') ||
           (name.includes('cover') && !name.includes('back') && !name.includes('color'));
  });

  // Priority 2: "design", "mockup", "artwork", "placeholder"
  if (!layer) {
    layer = smartObjectLayers.find(l => {
      const name = l.name.toLowerCase();
      return name.includes('design') || name.includes('mockup') || name.includes('artwork') || name.includes('placeholder');
    });
  }

  // Priority 3: Any smart object that's NOT edge/glue/pages/spine
  if (!layer) {
    layer = smartObjectLayers.find(l => {
      const name = l.name.toLowerCase();
      return !name.includes('edge') && !name.includes('glue') && !name.includes('pages') && !name.includes('spine');
    });
  }

  // Fallback: first smart object
  if (!layer) {
    layer = smartObjectLayers[0];
  }

  return layer;
}

/**
 * Load an image from a URL or local path into a Buffer.
 * Handles data URLs, local paths, and remote URLs.
 */
async function loadImageBuffer(imageUrl: string): Promise<Buffer> {
  if (imageUrl.startsWith('data:')) {
    const base64Data = imageUrl.split(',')[1];
    return Buffer.from(base64Data, 'base64');
  }

  // Try local path first
  const localPath = path.join(process.cwd(), 'public', imageUrl.replace(/^\//, ''));
  if (fs.existsSync(localPath)) {
    return fs.readFileSync(localPath);
  }

  // Try fetching from URL
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
    return Buffer.from(await response.arrayBuffer());
  } catch (err) {
    throw new Error(`Cannot load image: ${imageUrl}`);
  }
}

// Apply blend mode using pixel manipulation
async function applyBlendMode(
  baseBuffer: Buffer,
  overlayBuffer: Buffer,
  blendMode: string,
  opacity: number
): Promise<Buffer> {
  const baseImage = sharp(baseBuffer);
  const overlayImage = sharp(overlayBuffer);
  
  const baseMeta = await baseImage.metadata();
  const overlayMeta = await overlayImage.metadata();
  
  const baseData = await baseImage.raw().toBuffer();
  const overlayData = await overlayImage.raw().toBuffer();
  
  const width = baseMeta.width!;
  const height = baseMeta.height!;
  const channels = baseMeta.channels!;
  
  const result = Buffer.alloc(baseData.length);
  
  for (let i = 0; i < baseData.length; i += channels) {
    let baseR = baseData[i];
    let baseG = baseData[i + 1];
    let baseB = baseData[i + 2];
    let baseA = channels === 4 ? baseData[i + 3] : 255;
    
    let overlayR = overlayData[i] || 0;
    let overlayG = overlayData[i + 1] || 0;
    let overlayB = overlayData[i + 2] || 0;
    let overlayA = (channels === 4 ? overlayData[i + 3] : 255) * opacity;
    
    if (overlayA === 0) {
      result[i] = baseR;
      result[i + 1] = baseG;
      result[i + 2] = baseB;
      if (channels === 4) result[i + 3] = baseA;
      continue;
    }
    
    let r, g, b;
    
    switch (blendMode) {
      case 'multiply':
        r = (baseR * overlayR) / 255;
        g = (baseG * overlayG) / 255;
        b = (baseB * overlayB) / 255;
        break;
      case 'screen':
        r = 255 - ((255 - baseR) * (255 - overlayR)) / 255;
        g = 255 - ((255 - baseG) * (255 - overlayG)) / 255;
        b = 255 - ((255 - baseB) * (255 - overlayB)) / 255;
        break;
      case 'overlay':
        r = baseR < 128 ? (2 * baseR * overlayR) / 255 : 255 - (2 * (255 - baseR) * (255 - overlayR)) / 255;
        g = baseG < 128 ? (2 * baseG * overlayG) / 255 : 255 - (2 * (255 - baseG) * (255 - overlayG)) / 255;
        b = baseB < 128 ? (2 * baseB * overlayB) / 255 : 255 - (2 * (255 - baseB) * (255 - overlayB)) / 255;
        break;
      case 'color':
        // Preserve luminosity, apply color
        const lum = 0.2126 * baseR + 0.7152 * baseG + 0.0722 * baseB;
        r = (overlayR * lum) / 255;
        g = (overlayG * lum) / 255;
        b = (overlayB * lum) / 255;
        break;
      default: // normal
        const alpha = overlayA / 255;
        r = baseR * (1 - alpha) + overlayR * alpha;
        g = baseG * (1 - alpha) + overlayG * alpha;
        b = baseB * (1 - alpha) + overlayB * alpha;
    }
    
    result[i] = Math.max(0, Math.min(255, Math.round(r)));
    result[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
    result[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
    if (channels === 4) result[i + 3] = baseA;
  }
  
  return sharp(result, {
    raw: {
      width,
      height,
      channels: channels as 3 | 4,
    },
  }).png().toBuffer();
}

// Generate mockup render — now with perspective-aware smart object layer support
export async function generateMockup(options: RenderOptions): Promise<Buffer> {
  const {
    templateBaseImage,
    userImage,
    designX,
    designY,
    designScale,
    designRotation,
    outputWidth,
    outputHeight,
    layers,
    templateWidth,
    templateHeight,
  } = options;
  
  // Load template base image
  const baseBuffer = await loadImageBuffer(templateBaseImage);
  const baseImage = sharp(baseBuffer);
  const baseMeta = await baseImage.metadata();
  const baseW = baseMeta.width!;
  const baseH = baseMeta.height!;

  // Load user design
  const designBuffer = await loadImageBuffer(userImage);
  const designImage = sharp(designBuffer);
  const designMeta = await designImage.metadata();

  // If we have layer data, use smart-object-aware rendering
  if (layers && layers.length > 0 && templateWidth && templateHeight) {
    const smartObjectLayer = selectSmartObjectLayer(layers);
    
    if (smartObjectLayer) {
      const bounds = getSmartObjectBounds(smartObjectLayer, templateWidth, templateHeight);
      
      if (bounds) {
        const scaleX = baseW / templateWidth;
        const scaleY = baseH / templateHeight;
        
        // Scale bounds to actual base image dimensions
        const scaledBounds = {
          x: bounds.x * scaleX,
          y: bounds.y * scaleY,
          width: bounds.width * scaleX,
          height: bounds.height * scaleY,
        };

        // Calculate cover-mode sizing (fill the smart object bounds)
        const imgAspect = designMeta.width! / designMeta.height!;
        const boundsAspect = scaledBounds.width / scaledBounds.height;
        let drawW: number, drawH: number;

        if (imgAspect > boundsAspect) {
          drawH = scaledBounds.height * designScale;
          drawW = drawH * imgAspect;
        } else {
          drawW = scaledBounds.width * designScale;
          drawH = drawW / imgAspect;
        }

        // Check if this smart object layer has perspective data for warping
        const perspectiveCorners = smartObjectLayer.perspectiveData?.corners;
        const hasPerspective = Array.isArray(perspectiveCorners) && perspectiveCorners.length === 4;

        let designCanvas: Buffer;

        if (hasPerspective) {
          // Perspective-aware rendering: warp the design to match the template's perspective
          designCanvas = await applyPerspectiveWarp(
            designBuffer,
            perspectiveCorners,
            baseW,
            baseH,
            templateWidth,
            templateHeight,
            bounds,
            designX,
            designY,
            designScale
          );
        } else {
          // Flat rendering (original behavior): place design at the smart object bounds position
          const resizedDesign = await sharp(designBuffer)
            .resize(Math.round(drawW), Math.round(drawH), { fit: 'cover' })
            .png()
            .toBuffer();

          const posX = Math.round(scaledBounds.x + scaledBounds.width * designX - drawW / 2);
          const posY = Math.round(scaledBounds.y + scaledBounds.height * designY - drawH / 2);

          designCanvas = await sharp({
            create: {
              width: baseW,
              height: baseH,
              channels: 4,
              background: { r: 0, g: 0, b: 0, alpha: 0 },
            },
          })
            .composite([
              {
                input: resizedDesign,
                left: Math.max(0, posX),
                top: Math.max(0, posY),
                blend: 'over',
              },
            ])
            .png()
            .toBuffer();
        }

        // Composite: base image → user design → realism layers
        let result = baseBuffer;
        
        // Apply user design on top of base
        result = await sharp(result)
          .composite([
            {
              input: designCanvas,
              blend: 'over',
            },
          ])
          .png()
          .toBuffer();

        // Apply composite/realism layers (shadows, highlights) with proper blend modes
        const compositeLayers = layers.filter(l => l.compositeUrl);
        for (const layer of compositeLayers) {
          try {
            const layerBuffer = await loadImageBuffer(layer.compositeUrl!);
            const blendMode = (layer.blendMode || 'normal').toLowerCase();
            const layerOpacity = layer.opacity ?? 1;
            
            if (blendMode === 'multiply' || blendMode === 'screen' || blendMode === 'overlay' || blendMode === 'color') {
              result = await applyBlendMode(result, layerBuffer, blendMode, layerOpacity);
            } else {
              // For normal and other blend modes, use sharp's composite
              const resizedLayer = await sharp(layerBuffer)
                .resize(baseW, baseH, { fit: 'fill' })
                .ensureAlpha()
                .png()
                .toBuffer();
              
              result = await sharp(result)
                .composite([
                  {
                    input: resizedLayer,
                    blend: 'over',
                    // Apply opacity via premultiplied alpha
                    top: 0,
                    left: 0,
                  },
                ])
                .png()
                .toBuffer();
            }
          } catch (err) {
            console.warn(`Failed to apply composite layer "${layer.name}":`, err);
          }
        }

        // Final resize to output dimensions
        return sharp(result)
          .resize(outputWidth, outputHeight, { fit: 'contain' })
          .png()
          .toBuffer();
      }
    }
  }

  // Fallback: Original flat compositing (for templates without layer data)
  // Calculate design dimensions based on scale
  const designWidth = Math.round(baseMeta.width! * designScale);
  const designHeight = Math.round(designWidth * (designMeta.height! / designMeta.width!));
  
  // Resize design
  const resizedDesign = await sharp(designBuffer)
    .resize(designWidth, designHeight, { fit: 'contain' })
    .toBuffer();
  
  // Calculate position (centered based on normalized coords)
  const posX = Math.round(designX * baseMeta.width! - designWidth / 2);
  const posY = Math.round(designY * baseMeta.height! - designHeight / 2);
  
  // Create composite
  const compositeImage = await sharp(baseBuffer)
    .composite([
      {
        input: resizedDesign,
        left: posX,
        top: posY,
        blend: 'over',
      },
    ])
    .resize(outputWidth, outputHeight, { fit: 'contain' })
    .png()
    .toBuffer();
  
  return compositeImage;
}

// Generate mockup with color changes
export async function generateMockupWithColors(
  templateBaseImage: string,
  colorLayerImage: string | null,
  color: string,
  userDesign: string,
  designX: number,
  designY: number,
  designScale: number,
  outputWidth: number = 1024,
  outputHeight: number = 1024
): Promise<Buffer> {
  // Load base image
  const baseBuffer = await loadImageBuffer(templateBaseImage);
  
  let resultBuffer = baseBuffer;
  
  // If we have a color layer, apply color tint
  if (colorLayerImage) {
    try {
      const colorLayerBuffer = await loadImageBuffer(colorLayerImage);
      resultBuffer = await applyBlendMode(baseBuffer, colorLayerBuffer, 'color', 1.0);
    } catch (err) {
      console.warn('Failed to load color layer, skipping:', err);
    }
  }
  
  // Load and process user design
  const designBuffer = await loadImageBuffer(userDesign);
  const baseImage = sharp(resultBuffer);
  const baseMeta = await baseImage.metadata();
  const designImage = sharp(designBuffer);
  const designMeta = await designImage.metadata();
  
  // Calculate design dimensions
  const designWidth = Math.round(baseMeta.width! * designScale);
  const designHeight = Math.round(designWidth * (designMeta.height! / designMeta.width!));
  
  // Resize design
  const resizedDesign = await sharp(designBuffer)
    .resize(designWidth, designHeight, { fit: 'contain' })
    .toBuffer();
  
  // Calculate position
  const posX = Math.round(designX * baseMeta.width! - designWidth / 2);
  const posY = Math.round(designY * baseMeta.height! - designHeight / 2);
  
  // Create final composite
  const finalImage = await sharp(resultBuffer)
    .composite([
      {
        input: resizedDesign,
        left: Math.max(0, posX),
        top: Math.max(0, posY),
        blend: 'over',
      },
    ])
    .resize(outputWidth, outputHeight, { fit: 'contain' })
    .png()
    .toBuffer();
  
  return finalImage;
}

// Apply color tint to an image (preserving texture)
export async function applyColorTint(
  imageBuffer: Buffer,
  colorHex: string
): Promise<Buffer> {
  const image = sharp(imageBuffer);
  const meta = await image.metadata();
  const { width, height, channels } = meta;
  
  // Parse color
  const r = parseInt(colorHex.slice(1, 3), 16);
  const g = parseInt(colorHex.slice(3, 5), 16);
  const b = parseInt(colorHex.slice(5, 7), 16);
  
  // Get raw pixel data
  const rawData = await image.raw().toBuffer();
  
  // Apply color with luminosity preservation
  for (let i = 0; i < rawData.length; i += channels!) {
    const sr = rawData[i];
    const sg = rawData[i + 1];
    const sb = rawData[i + 2];
    
    // Calculate luminosity
    const luminosity = 0.2126 * sr + 0.7152 * sg + 0.0722 * sb;
    const lr = luminosity / 255;
    
    // Apply color
    rawData[i] = Math.round(r * lr);
    rawData[i + 1] = Math.round(g * lr);
    rawData[i + 2] = Math.round(b * lr);
  }
  
  // Convert back to image
  return sharp(rawData, {
    raw: {
      width: width!,
      height: height!,
      channels: channels as 3 | 4,
    },
  }).png().toBuffer();
}
