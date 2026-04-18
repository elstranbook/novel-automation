import { readPsd, Psd, Layer, initializeCanvas } from 'ag-psd';

let canvasInitialized = false;

/**
 * Essential: Initialize canvas for Node.js environment so ag-psd can parse files.
 */
async function setupCanvas() {
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
    const psd: Psd = readPsd(buffer, { skipThumbnail: true, skipLayerImages: true });
    
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
        
        // Handle perspective transforms (4 corners)
        // ag-psd provides this in placedLayer.transform (8 numbers: x,y of 4 corners)
        // Order: TL.x, TL.y, TR.x, TR.y, BR.x, BR.y, BL.x, BL.y
        const transformData = so.transform || (so as any).nonAffineTransform;
        
        if (Array.isArray(transformData) && transformData.length >= 8) {
          transform = {
            corners: [
              { x: transformData[0], y: transformData[1] },
              { x: transformData[2], y: transformData[3] },
              { x: transformData[4], y: transformData[5] },
              { x: transformData[6], y: transformData[7] },
            ]
          };
          console.log(`Extracted perspective transform for ${name}:`, transform.corners);
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
      resolution: 72,
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
