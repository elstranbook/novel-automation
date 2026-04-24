import { readPsd, Psd, Layer, initializeCanvas } from 'ag-psd';

let canvasInitialized = false;

/**
 * Essential: Initialize canvas for Node.js environment so ag-psd can parse files.
 */
export async function setupCanvas() {
  if (canvasInitialized) return;
  try {
    const canvas = await import('canvas');
    if (canvas && canvas.createCanvas) {
      initializeCanvas(canvas.createCanvas as any);
      canvasInitialized = true;
    }
  } catch (e) {
    console.warn('Canvas initialization failed - upload might fail:', e);
  }
}

// Type definitions for parsed PSD data
export interface ParsedPSD {
  width: number;
  height: number;
  layers: ParsedLayer[];
  smartObjects: SmartObject[];
  colorLayers: ColorLayer[];
  resolution: number;
}

export interface ParsedLayer {
  name: string;
  type: 'smart_object' | 'color_layer' | 'shadow' | 'texture' | 'adjustment' | 'group' | 'base';
  bounds: { x: number; y: number; width: number; height: number };
  transform?: PerspectiveTransform;
  warpData?: WarpMesh;
  blendMode: string;
  opacity: number;
  mask?: MaskData;
  effects?: any[];
  visible: boolean;
  isColorable?: boolean;
  compositeUrl?: string; 
}

export interface PerspectiveTransform {
  corners: [
    { x: number; y: number }, // TL
    { x: number; y: number }, // TR
    { x: number; y: number }, // BR
    { x: number; y: number }  // BL
  ];
}

export interface WarpMesh {
  type: 'perspective' | 'mesh' | 'arc' | 'custom' | 'none';
  gridSize: { rows: number; cols: number };
  controlPoints: Array<{ x: number; y: number; offsetX: number; offsetY: number }>;
}

export interface SmartObject {
  id: string;
  name: string;
  bounds: { x: number; y: number; width: number; height: number };
  internalWidth?: number;
  internalHeight?: number;
  transform?: PerspectiveTransform;
  warp?: WarpMesh;
  linkedFile?: string;
  layerId: number;
}

export interface ColorLayer {
  name: string;
  color: string;
  bounds: { x: number; y: number; width: number; height: number };
  blendMode: string;
  opacity: number;
}

export interface MaskData {
  type: 'pixel' | 'vector';
  bounds: { x: number; y: number; width: number; height: number };
  path?: string;
  data?: Uint8Array;
}

/**
 * Parse a PSD file using ag-psd for high-fidelity metadata extraction
 */
export async function parsePSD(buffer: Buffer): Promise<ParsedPSD> {
  try {
    // 1. Prepare environment
    await setupCanvas();
    
    // 2. Read PSD metadata (skipping images for speed and memory efficiency)
    const psd: Psd = readPsd(buffer, { skipThumbnail: true, skipLayerImageData: true });
    
    const width = psd.width || 0;
    const height = psd.height || 0;
    
    const layers: ParsedLayer[] = [];
    const smartObjects: SmartObject[] = [];
    const colorLayers: ColorLayer[] = [];
    
    let layerCounter = 0;

    const processLayer = async (layer: Layer) => {
      const id = layerCounter++;
      const name = layer.name || `Layer ${id}`;
      const nameLower = name.toLowerCase();
      
      // Determine type
      let type: ParsedLayer['type'] = 'base';
      const isSmartObject = !!layer.placedLayer;
      const isGroup = !!layer.children && layer.children.length > 0;
      const isShadow = nameLower.includes('shadow') || nameLower.includes('shade') || layer.blendMode === 'multiply';
      const isHighlight = nameLower.includes('highlight') || nameLower.includes('light') || layer.blendMode === 'screen' || layer.blendMode === 'linear dodge';
      
      // A layer is a design placeholder if it's an actual Smart Object 
      // OR it's a leaf layer (no children) with a matching name
      if (isSmartObject || (!isGroup && (
        nameLower.includes('design') || 
        nameLower.includes('mockup') || 
        nameLower.includes('cover') || 
        nameLower.includes('your design') || 
        nameLower.includes('artwork') || 
        nameLower.includes('placeholder')
      ))) {
        type = 'smart_object';
      } else if (isShadow) {
        type = 'shadow';
      } else if (nameLower.includes('color') || nameLower.includes('fill')) {
        type = 'color_layer';
      } else if (nameLower.includes('texture') || nameLower.includes('pattern')) {
        type = 'texture';
      }

      // Bounds
      const bounds = {
        x: layer.left || 0,
        y: layer.top || 0,
        width: Math.max(0, (layer.right || 0) - (layer.left || 0)),
        height: Math.max(0, (layer.bottom || 0) - (layer.top || 0)),
      };

      let warpData: WarpMesh | undefined = undefined;
      let transform: PerspectiveTransform | undefined = undefined;
      let internalWidth = bounds.width;
      let internalHeight = bounds.height;

      // Extract Smart Object mapping data
      if (layer.placedLayer) {
        const so = layer.placedLayer;
        
        // Handle perspective transforms from smart object
        // Priority 1: nonAffineTransform (8 numbers: x,y of 4 corners — true perspective)
        // Priority 2: transform (affine matrix {xx,xy,yx,yy,tx,ty}) — compute corners
        const nonAffine = (so as any).nonAffineTransform;
        
        if (Array.isArray(nonAffine) && nonAffine.length >= 8) {
          // True perspective: 4 corner points as [TL.x, TL.y, TR.x, TR.y, BR.x, BR.y, BL.x, BL.y]
          transform = {
            corners: [
              { x: nonAffine[0], y: nonAffine[1] },
              { x: nonAffine[2], y: nonAffine[3] },
              { x: nonAffine[4], y: nonAffine[5] },
              { x: nonAffine[6], y: nonAffine[7] },
            ]
          };
          console.log(`Extracted non-affine perspective transform for ${name}:`, transform.corners);
        } else if (so.transform) {
          // Affine transform: ag-psd stores as {xx, xy, yx, yy, tx, ty} or as array [xx, xy, yx, yy, tx, ty]
          // Matrix: | xx yx tx |   Applied to internal dimensions (so.width × so.height)
          //         | xy yy ty |
          //         |  0  0  1 |
          const soTr = so.transform as any;
          let xx: number, xy: number, yx: number, yy: number, tx: number, ty: number;
          
          if (Array.isArray(soTr) && soTr.length >= 6) {
            // Array format: [xx, xy, yx, yy, tx, ty]
            [xx, xy, yx, yy, tx, ty] = soTr;
          } else if (soTr && typeof soTr === 'object' && 'xx' in soTr) {
            // Object format: {xx, xy, yx, yy, tx, ty}
            xx = soTr.xx; xy = soTr.xy; yx = soTr.yx; yy = soTr.yy; tx = soTr.tx; ty = soTr.ty;
          } else {
            xx = xy = yx = yy = tx = ty = 0;
          }
          
          // Use the smart object's internal dimensions to compute the 4 corners
          const soW = so.width || internalWidth || bounds.width;
          const soH = so.height || internalHeight || bounds.height;
          
          // Apply affine matrix to the 4 corners of the internal rectangle (0,0)→(soW,soH)
          // Corner = M * [x, y, 1]^T
          const cTL = { x: tx + xx * 0 + yx * 0, y: ty + xy * 0 + yy * 0 };           // (0,0)
          const cTR = { x: tx + xx * soW + yx * 0, y: ty + xy * soW + yy * 0 };         // (soW,0)
          const cBR = { x: tx + xx * soW + yx * soH, y: ty + xy * soW + yy * soH };     // (soW,soH)
          const cBL = { x: tx + xx * 0 + yx * soH, y: ty + xy * 0 + yy * soH };         // (0,soH)
          
          transform = {
            corners: [cTL, cTR, cBR, cBL]
          };
          console.log(`Extracted affine transform for ${name}:`, { matrix: { xx, xy, yx, yy, tx, ty }, soW, soH, corners: transform.corners });
        }

        // Handle native PSD warps
        if (so.warp) {
          const w = so.warp;
          const meshPoints = (w as any).meshPoints || (w as any).vertices;
          
          if (meshPoints && Array.isArray(meshPoints)) {
            // gridSize is often 4x4 (16 points) for PSD warps
            const rows = 4;
            const cols = 4;
            
            warpData = {
              type: (w.style as any) || 'custom',
              gridSize: { rows, cols },
              controlPoints: meshPoints.map((p: any) => ({
                x: p.x || 0,
                y: p.y || 0,
                offsetX: 0,
                offsetY: 0
              }))
            };

            // If we don't have an explicit transform, extract corners from the mesh
            if (!transform && meshPoints.length >= rows * cols) {
              transform = {
                corners: [
                  { x: meshPoints[0].x, y: meshPoints[0].y }, // TL
                  { x: meshPoints[cols - 1].x, y: meshPoints[cols - 1].y }, // TR
                  { x: meshPoints[rows * cols - 1].x, y: meshPoints[rows * cols - 1].y }, // BR
                  { x: meshPoints[(rows - 1) * cols].x, y: meshPoints[(rows - 1) * cols].y } // BL
                ]
              };
              console.log(`Extracted perspective transform from mesh for ${name}`);
            }
            console.log(`Extracted mesh warp for ${name}`);
          }
        }

        if (so.width && so.height) {
          internalWidth = so.width;
          internalHeight = so.height;
        }
      }

      const parsedLayer: ParsedLayer = {
        name,
        type,
        bounds,
        blendMode: (layer.blendMode || 'normal').toLowerCase(),
        opacity: layer.opacity !== undefined ? layer.opacity : 1,
        visible: layer.hidden !== true,
        isColorable: type === 'color_layer',
        warpData,
        transform,
      };

      layers.push(parsedLayer);

      if (type === 'smart_object') {
        smartObjects.push({
          id: `so-${Date.now()}-${id}`,
          name,
          bounds,
          internalWidth,
          internalHeight,
          transform,
          warp: warpData,
          layerId: id
        });
      }

      if (type === 'color_layer') {
        colorLayers.push({
          name,
          color: '#FFFFFF',
          bounds,
          blendMode: parsedLayer.blendMode,
          opacity: parsedLayer.opacity
        });
      }

      if (layer.children) {
        for (const child of layer.children) {
          await processLayer(child);
        }
      }
    };

    if (psd.children) {
      for (const child of psd.children) {
        await processLayer(child);
      }
    }

    return {
      width,
      height,
      layers,
      smartObjects,
      colorLayers,
      resolution: psd.imageResources?.resolutionInfo?.horizontalResolution || 72,
    };
  } catch (error) {
    console.error('PSD Processing error:', error);
    throw new Error(`Failed to parse PSD: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function validatePSDStructure(parsed: ParsedPSD): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (parsed.width < 100 || parsed.height < 100) errors.push('Template dimensions too small.');
  if (parsed.layers.length === 0) errors.push('No layers found.');
  return { valid: errors.length === 0, errors };
}

export function createTemplateConfig(parsed: ParsedPSD, name: string, slug: string) {
  return {
    name,
    slug,
    width: parsed.width,
    height: parsed.height,
    layers: parsed.layers.map((layer, index) => {
      return {
        name: layer.name,
        type: layer.type,
        zIndex: index,
        blendMode: layer.blendMode,
        opacity: layer.opacity,
        bounds: layer.bounds,
        transform: {
          x: layer.bounds.x / parsed.width,
          y: layer.bounds.y / parsed.height,
          scaleX: layer.bounds.width / parsed.width,
          scaleY: layer.bounds.height / parsed.height,
          rotation: 0,
        },
        perspectiveTransform: layer.transform || null,
        warpData: layer.warpData || null,
        isColorable: layer.isColorable,
        defaultColor: layer.isColorable ? '#FFFFFF' : null,
        compositeUrl: layer.compositeUrl || null,
      };
    }),
    smartObjects: parsed.smartObjects.map(so => ({
      id: so.id,
      name: so.name,
      bounds: so.bounds,
      internalWidth: so.internalWidth,
      internalHeight: so.internalHeight,
    })),
  };
}

/**
 * Extract layer images from a PSD file as PNG buffers.
 *
 * Reads the PSD with full image data enabled, then exports:
 * - The composite (flattened) view as a PNG buffer
 * - Each relevant layer as an individual PNG buffer
 *
 * These PNG buffers can be uploaded to R2 CDN to provide
 * browser-renderable images instead of raw PSD URLs.
 */
export interface ExtractedImage {
  /** Layer name or 'composite' for the flattened view */
  name: string;
  /** PNG image buffer */
  buffer: Buffer;
  /** The layer index in the PSD (for mapping back to parsed layers) */
  layerIndex: number;
}

export interface ExtractedImages {
  /** The flattened composite view of the entire PSD */
  composite: Buffer | null;
  /** Individual layer images (shadows, highlights, textures, etc.) */
  layers: ExtractedImage[];
}

export async function extractLayerImages(buffer: Buffer): Promise<ExtractedImages> {
  await setupCanvas();

  const psd: Psd = readPsd(buffer, {
    skipThumbnail: false,
    skipLayerImageData: false,
  });

  // 1. Extract composite (flattened) image
  let composite: Buffer | null = null;
  if (psd.canvas) {
    try {
      composite = (psd.canvas as any).toBuffer('image/png') as Buffer;
      console.log(`[PSD] Extracted composite image: ${composite.byteLength} bytes`);
    } catch (e) {
      console.warn('[PSD] Failed to extract composite image:', e);
    }
  }

  // 2. Extract individual layer images
  const layers: ExtractedImage[] = [];
  let layerIndex = 0;

  const processLayer = (layer: Layer) => {
    const name = layer.name || `Layer ${layerIndex}`;

    if (layer.canvas) {
      try {
        const pngBuffer = (layer.canvas as any).toBuffer('image/png') as Buffer;
        // Only include layers that have actual visible content
        if (pngBuffer.byteLength > 100) {
          layers.push({
            name,
            buffer: pngBuffer,
            layerIndex,
          });
          console.log(`[PSD] Extracted layer "${name}": ${pngBuffer.byteLength} bytes`);
        }
      } catch (e) {
        console.warn(`[PSD] Failed to extract layer "${name}":`, e);
      }
    }

    layerIndex++;

    // Process child layers (groups)
    if (layer.children) {
      for (const child of layer.children) {
        processLayer(child);
      }
    }
  };

  if (psd.children) {
    for (const child of psd.children) {
      processLayer(child);
    }
  }

  return { composite, layers };
}

/**
 * Convert a PSD buffer to a PNG buffer (composite/flat view).
 * Used by the image proxy to convert PSD responses on-the-fly.
 */
export async function convertPsdToPng(psdBuffer: Buffer): Promise<Buffer | null> {
  await setupCanvas();

  try {
    const psd: Psd = readPsd(psdBuffer, {
      skipThumbnail: false,
      skipLayerImageData: true, // We only need the composite, not individual layers
    });

    if (psd.canvas) {
      return (psd.canvas as any).toBuffer('image/png') as Buffer;
    }

    // Fallback: try the thumbnail
    if ((psd as any).thumbnailCanvas) {
      return ((psd as any).thumbnailCanvas as any).toBuffer('image/png') as Buffer;
    }

    return null;
  } catch (e) {
    console.error('[PSD] Failed to convert PSD to PNG:', e);
    return null;
  }
}
