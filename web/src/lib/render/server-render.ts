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

// Generate mockup render
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
  } = options;
  
  // Load template base image
  const basePath = path.join(process.cwd(), 'public', templateBaseImage.replace(/^\//, ''));
  const baseBuffer = fs.readFileSync(basePath);
  const baseImage = sharp(baseBuffer);
  const baseMeta = await baseImage.metadata();
  
  // Load user design
  let designBuffer: Buffer;
  if (userImage.startsWith('data:')) {
    // Base64 data URL
    const base64Data = userImage.split(',')[1];
    designBuffer = Buffer.from(base64Data, 'base64');
  } else {
    // File path
    const designPath = path.join(process.cwd(), 'public', userImage.replace(/^\//, ''));
    designBuffer = fs.readFileSync(designPath);
  }
  
  const designImage = sharp(designBuffer);
  const designMeta = await designImage.metadata();
  
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
  const basePath = path.join(process.cwd(), 'public', templateBaseImage.replace(/^\//, ''));
  const baseBuffer = fs.readFileSync(basePath);
  
  let resultBuffer = baseBuffer;
  
  // If we have a color layer, apply color tint
  if (colorLayerImage) {
    const colorLayerPath = path.join(process.cwd(), 'public', colorLayerImage.replace(/^\//, ''));
    if (fs.existsSync(colorLayerPath)) {
      const colorLayerBuffer = fs.readFileSync(colorLayerPath);
      resultBuffer = await applyBlendMode(baseBuffer, colorLayerBuffer, 'color', 1.0);
    }
  }
  
  // Load and process user design
  let designBuffer: Buffer;
  if (userDesign.startsWith('data:')) {
    const base64Data = userDesign.split(',')[1];
    designBuffer = Buffer.from(base64Data, 'base64');
  } else {
    const designPath = path.join(process.cwd(), 'public', userDesign.replace(/^\//, ''));
    designBuffer = fs.readFileSync(designPath);
  }
  
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
