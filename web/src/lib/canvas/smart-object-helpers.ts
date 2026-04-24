/**
 * Shared helpers for smart object layer detection and perspective calculation.
 * Used by both CanvasEngine and WebGLRenderer to avoid code duplication.
 */

import type { Template, TemplateLayer } from '@/types';
import { BOOK_WARPS } from '@/lib/templates/book-warps';

export interface PerspectiveCorners {
  corners: [
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number }
  ];
}

/**
 * Compute the pixel bounds for a smart object layer on a template.
 * Uses transformX/Y/ScaleX/ScaleY (normalized 0-1) when available,
 * falls back to boundsX/Y/Width/Height (pixel coords from PSD).
 */
export function getSmartObjectBounds(
  layer: TemplateLayer,
  templateWidth: number,
  templateHeight: number
): { x: number; y: number; width: number; height: number } {
  // Priority 1: transformX/Y/ScaleX/ScaleY (normalized 0-1 relative positioning)
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

  // Priority 3: bounds object (from API response)
  if (layer.bounds && layer.bounds.width && layer.bounds.height) {
    return {
      x: layer.bounds.x || 0,
      y: layer.bounds.y || 0,
      width: layer.bounds.width,
      height: layer.bounds.height,
    };
  }
  
  // Fallback: full template area
  return { x: 0, y: 0, width: templateWidth, height: templateHeight };
}

/**
 * Get perspective transform corners for a smart object layer.
 * Uses explicit perspectiveData/warpData if available, otherwise 
 * computes from the template's warpPreset using BOOK_WARPS.
 */
export function getSmartObjectPerspective(
  layer: TemplateLayer,
  template: Template
): PerspectiveCorners | null {
  // Priority 1: Explicit perspectiveTransform from PSD
  if (layer.perspectiveTransform && layer.perspectiveTransform.corners) {
    return layer.perspectiveTransform;
  }
  
  // Priority 2: Warp data with control points
  if (layer.warpData) {
    try {
      const warp = typeof layer.warpData === 'string' ? JSON.parse(layer.warpData) : layer.warpData;
      if (warp?.controlPoints?.length >= 4) {
        const cols = warp.gridSize?.cols || 4;
        const rows = warp.gridSize?.rows || 4;
        const pts = warp.controlPoints;
        // Validate we have enough points for the grid
        const needed = rows * cols;
        if (pts.length >= needed) {
          // Use DESTINATION coordinates (source + offset), not source coordinates.
          // Seed stores: { x: srcX, y: srcY, offsetX: dstX - srcX, offsetY: dstY - srcY }
          // PSD parser stores: { x, y, offsetX: 0, offsetY: 0 } (x,y already in dest space)
          return {
            corners: [
              { x: pts[0].x + (pts[0].offsetX || 0), y: pts[0].y + (pts[0].offsetY || 0) },
              { x: pts[cols - 1].x + (pts[cols - 1].offsetX || 0), y: pts[cols - 1].y + (pts[cols - 1].offsetY || 0) },
              { x: pts[rows * cols - 1].x + (pts[rows * cols - 1].offsetX || 0), y: pts[rows * cols - 1].y + (pts[rows * cols - 1].offsetY || 0) },
              { x: pts[(rows - 1) * cols].x + (pts[(rows - 1) * cols].offsetX || 0), y: pts[(rows - 1) * cols].y + (pts[(rows - 1) * cols].offsetY || 0) },
            ]
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse warpData:', e);
    }
  }
  
  // Priority 3: Compute from warpPreset using BOOK_WARPS
  if (template.warpPreset && BOOK_WARPS[template.warpPreset as keyof typeof BOOK_WARPS]) {
    const preset = BOOK_WARPS[template.warpPreset as keyof typeof BOOK_WARPS];
    const coverWidth = template.coverWidth || 5.5;
    const coverHeight = template.coverHeight || 8.5;
    const spineWidth = template.spineWidth || 0.375;
    
    try {
      const warpResult = preset.create(coverWidth, coverHeight, spineWidth);
      // Handle both single warp and array of warps (e.g., stackedOnTable)
      const warp = Array.isArray(warpResult) ? warpResult[0] : warpResult;
      if (warp?.frontCover?.dst) {
        const dst = warp.frontCover.dst;
        // Convert inch-based coordinates to pixel coordinates.
        // PPI = template pixels / cover inches gives us the correct scale.
        const ppiX = template.width / coverWidth;
        const ppiY = template.height / coverHeight;
        
        // Offset corners by the smart object bounds position so the warp
        // is positioned where the book actually is in the template image
        const boundsOffset = getSmartObjectBounds(layer, template.width, template.height);
        
        return {
          corners: [
            { x: dst.topLeft.x * ppiX + boundsOffset.x, y: dst.topLeft.y * ppiY + boundsOffset.y },
            { x: dst.topRight.x * ppiX + boundsOffset.x, y: dst.topRight.y * ppiY + boundsOffset.y },
            { x: dst.bottomRight.x * ppiX + boundsOffset.x, y: dst.bottomRight.y * ppiY + boundsOffset.y },
            { x: dst.bottomLeft.x * ppiX + boundsOffset.x, y: dst.bottomLeft.y * ppiY + boundsOffset.y },
          ]
        };
      }
    } catch (e) {
      console.warn('Failed to compute warp preset:', e);
    }
  }
  
  // Priority 4: Smart object bounds as flat rectangle (no perspective)
  // This is the fallback when there's no perspective data at all
  const bounds = getSmartObjectBounds(layer, template.width, template.height);
  if (bounds.width > 0 && bounds.height > 0) {
    return {
      corners: [
        { x: bounds.x, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
        { x: bounds.x, y: bounds.y + bounds.height },
      ]
    };
  }
  
  return null;
}

/**
 * Select the best smart object layer from a template for rendering the user's cover.
 * Priority: "Front cover"/"Book cover"/"Cover" > "design"/"mockup"/"artwork" > non-edge layers > first smart object
 */
export function selectSmartObjectLayer(template: Template): TemplateLayer | null {
  const smartObjectLayers = template.layers.filter(l => l.type === 'smart_object' && l.opacity > 0);
  if (smartObjectLayers.length === 0) return null;

  // 1. Highest priority: Layer named "Front cover", "Book cover", or "Cover" (not back/color)
  let layer = smartObjectLayers.find(l => {
    const name = l.name.toLowerCase();
    return name.includes('front cover') || name.includes('book cover') || 
           (name.includes('cover') && !name.includes('back') && !name.includes('color'));
  });
  
  // 2. Second priority: Layer named "design", "mockup", "artwork", "placeholder"
  if (!layer) {
    layer = smartObjectLayers.find(l => {
      const name = l.name.toLowerCase();
      return name.includes('design') || name.includes('mockup') || name.includes('artwork') || name.includes('placeholder');
    });
  }
  
  // 3. Third priority: Any smart object that's NOT edge/glue/pages/spine
  if (!layer) {
    layer = smartObjectLayers.find(l => {
      const name = l.name.toLowerCase();
      return !name.includes('edge') && !name.includes('glue') && !name.includes('pages') && !name.includes('spine');
    });
  }
  
  // 4. Fallback: first smart object
  if (!layer) {
    layer = smartObjectLayers[0];
  }
  
  return layer;
}
