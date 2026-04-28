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

function normalizeCornerOrder(
  corners: Array<{ x: number; y: number }>
): PerspectiveCorners['corners'] {
  if (corners.length < 4) {
    const c = corners[0] || { x: 0, y: 0 };
    return [c, c, c, c];
  }

  // Normalize arbitrary corner order into TL, TR, BR, BL.
  // Many PSD exports keep corners in different orderings.
  const sortedByY = [...corners].sort((a, b) => a.y - b.y);
  const top = sortedByY.slice(0, 2).sort((a, b) => a.x - b.x);
  const bottom = sortedByY.slice(2, 4).sort((a, b) => a.x - b.x);
  const topLeft = top[0];
  const topRight = top[1];
  const bottomLeft = bottom[0];
  const bottomRight = bottom[1];
  return [topLeft, topRight, bottomRight, bottomLeft];
}

function parseJsonLike(value: unknown): any | null {
  if (value == null) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (typeof value === 'object') {
    return value;
  }
  return null;
}

function toCorners(data: unknown): PerspectiveCorners | null {
  const parsed = parseJsonLike(data);
  if (!parsed) return null;

  // Preferred shape: { corners: [{x,y}, ...4] }
  if (Array.isArray(parsed.corners) && parsed.corners.length >= 4) {
    const ordered = normalizeCornerOrder([
      { x: parsed.corners[0].x, y: parsed.corners[0].y },
      { x: parsed.corners[1].x, y: parsed.corners[1].y },
      { x: parsed.corners[2].x, y: parsed.corners[2].y },
      { x: parsed.corners[3].x, y: parsed.corners[3].y },
    ]);
    return {
      corners: ordered,
    };
  }

  // Legacy shape: { topLeft, topRight, bottomRight, bottomLeft }
  if (parsed.topLeft && parsed.topRight && parsed.bottomRight && parsed.bottomLeft) {
    const ordered = normalizeCornerOrder([
      { x: parsed.topLeft.x, y: parsed.topLeft.y },
      { x: parsed.topRight.x, y: parsed.topRight.y },
      { x: parsed.bottomRight.x, y: parsed.bottomRight.y },
      { x: parsed.bottomLeft.x, y: parsed.bottomLeft.y },
    ]);
    return {
      corners: ordered,
    };
  }

  return null;
}

function hasWarpOrPerspective(layer: TemplateLayer): boolean {
  return !!toCorners(layer.perspectiveTransform) || !!parseJsonLike(layer.warpData);
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
  const explicitCorners = toCorners(layer.perspectiveTransform);
  if (explicitCorners) {
    return explicitCorners;
  }
  
  // Priority 2: Warp data with control points
  if (layer.warpData) {
    try {
      const warp = parseJsonLike(layer.warpData);
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
          const ordered = normalizeCornerOrder([
            { x: pts[0].x + (pts[0].offsetX || 0), y: pts[0].y + (pts[0].offsetY || 0) },
            { x: pts[cols - 1].x + (pts[cols - 1].offsetX || 0), y: pts[cols - 1].y + (pts[cols - 1].offsetY || 0) },
            { x: pts[rows * cols - 1].x + (pts[rows * cols - 1].offsetX || 0), y: pts[rows * cols - 1].y + (pts[rows * cols - 1].offsetY || 0) },
            { x: pts[(rows - 1) * cols].x + (pts[(rows - 1) * cols].offsetX || 0), y: pts[(rows - 1) * cols].y + (pts[(rows - 1) * cols].offsetY || 0) },
          ]);
          return { corners: ordered };
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

  // Score all smart-object layers and pick the highest. This avoids cases where
  // only edge/spine has perspective metadata and front-cover gets ignored.
  const scored = smartObjectLayers.map((layer) => {
    const name = layer.name.toLowerCase();
    let score = 0;

    // Strong semantic preference for front-cover target layers
    if (name.includes('front cover')) score += 1000;
    if (name.includes('book cover')) score += 950;
    if (name.includes('cover') && !name.includes('back') && !name.includes('color')) score += 900;
    if (name.includes('design') || name.includes('mockup') || name.includes('artwork') || name.includes('placeholder')) score += 700;

    // Penalize non-front targets
    if (name.includes('edge')) score -= 800;
    if (name.includes('spine')) score -= 700;
    if (name.includes('pages')) score -= 600;
    if (name.includes('glue')) score -= 500;
    if (name.includes('back')) score -= 300;

    // Mapping metadata is useful, but should not override semantic intent.
    if (hasWarpOrPerspective(layer)) score += 150;

    // Slight boost for larger bounds to prefer main face over tiny helper layers.
    const bounds = getSmartObjectBounds(layer, template.width, template.height);
    score += (bounds.width * bounds.height) / Math.max(template.width * template.height, 1);

    return { layer, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.layer ?? smartObjectLayers[0];
}
