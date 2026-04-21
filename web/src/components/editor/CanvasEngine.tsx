'use client';

import { useCallback, useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import type { Template, TemplateLayer, DesignState } from '@/types';
import { hexToRgb } from '@/lib/canvas/color-utils';
import { 
  applyPerspectiveTransform, 
  QuadCorners
} from '@/lib/canvas/mesh-warp';
import { BOOK_WARPS } from '@/lib/templates/book-warps';
import { WebGLRenderer, WebGLRendererHandle } from './WebGLRenderer';
import { proxyImageUrl } from '@/lib/image-proxy';

interface CanvasEngineProps {
  template: Template | null;
  userImage: string | null;
  design: DesignState;
  colorSelections: Record<string, string>;
  finish?: 'matte' | 'glossy' | 'soft_touch';
  engine?: 'canvas' | 'webgl';
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
  onWebGLReady?: (handle: WebGLRendererHandle) => void;
  onDesignChange?: (updates: Partial<DesignState>) => void;
}

export interface CanvasEngineHandle {
  capture: (width?: number, height?: number) => Promise<string>;
  getCanvas: () => HTMLCanvasElement | null;
}

/**
 * Compute the pixel bounds for a smart object layer on a template.
 * Uses transformX/Y/ScaleX/ScaleY (normalized 0-1) when available,
 * falls back to boundsX/Y/Width/Height (pixel coords from PSD).
 */
function getSmartObjectBounds(
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
function getSmartObjectPerspective(
  layer: TemplateLayer,
  template: Template
): { corners: [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }, { x: number; y: number }] } | null {
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
        return {
          corners: [
            { x: pts[0].x, y: pts[0].y },
            { x: pts[cols - 1].x, y: pts[cols - 1].y },
            { x: pts[rows * cols - 1].x, y: pts[rows * cols - 1].y },
            { x: pts[(rows - 1) * cols].x, y: pts[(rows - 1) * cols].y },
          ]
        };
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
        // Convert inch-based coordinates to pixel coordinates
        // The front cover area on the template image
        const bounds = getSmartObjectBounds(layer, template.width, template.height);
        const pixelsPerInchW = bounds.width / coverWidth;
        const pixelsPerInchH = bounds.height / coverHeight;
        
        return {
          corners: [
            { x: bounds.x + dst.topLeft.x * pixelsPerInchW, y: bounds.y + dst.topLeft.y * pixelsPerInchH },
            { x: bounds.x + dst.topRight.x * pixelsPerInchW, y: bounds.y + dst.topRight.y * pixelsPerInchH },
            { x: bounds.x + dst.bottomRight.x * pixelsPerInchW, y: bounds.y + dst.bottomRight.y * pixelsPerInchH },
            { x: bounds.x + dst.bottomLeft.x * pixelsPerInchW, y: bounds.y + dst.bottomLeft.y * pixelsPerInchH },
          ]
        };
      }
    } catch (e) {
      console.warn('Failed to compute warp preset:', e);
    }
  }
  
  return null;
}

export const CanvasEngine = forwardRef<CanvasEngineHandle, CanvasEngineProps>(({
  template,
  userImage,
  design,
  colorSelections,
  finish = 'matte',
  engine: engineProp = 'webgl',
  onCanvasReady,
  onWebGLReady,
  onDesignChange,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const webglRef = useRef<WebGLRendererHandle>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 600 });
  
  // Auto-fallback: start with canvas, upgrade to WebGL if available
  const [activeEngine, setActiveEngine] = useState<'canvas' | 'webgl'>('canvas');
  const [webglChecked, setWebglChecked] = useState(false);
  
  // Track loaded images
  const baseImageRef = useRef<HTMLImageElement | null>(null);
  const userImageRef = useRef<HTMLImageElement | null>(null);
  const realismLayersRef = useRef<Record<string, HTMLImageElement>>({});

  // Try to upgrade to WebGL after mount
  useEffect(() => {
    if (engineProp === 'webgl' && !webglChecked) {
      try {
        const testCanvas = document.createElement('canvas');
        const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
        if (gl) {
          setActiveEngine('webgl');
        }
      } catch (e) {
        // Stay on canvas 2D
      }
      setWebglChecked(true);
    }
  }, [engineProp, webglChecked]);

  // Handle canvas resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const size = Math.min(rect.width, rect.height, 800);
        setCanvasSize({ width: size, height: size });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Get the primary smart object layer from template
  const getSmartObjectLayer = useCallback(() => {
    if (!template) return null;
    
    // 1. Highest priority: Layer with explicit warpData or perspectiveTransform
    let layer = template.layers.find(
      (l) => l.type === 'smart_object' && (l.warpData || l.perspectiveTransform)
    );
    
    // 2. Second priority: Layer with transform positioning (transformX/Y)
    if (!layer) {
      layer = template.layers.find(
        (l) => l.type === 'smart_object' && l.transformX != null
      );
    }
    
    // 3. Third priority: Layer with bounds
    if (!layer) {
      layer = template.layers.find(
        (l) => l.type === 'smart_object' && (l.boundsX != null || l.bounds != null)
      );
    }
    
    // 4. Fourth priority: Any smart object at all
    if (!layer) {
      layer = template.layers.find((l) => l.type === 'smart_object');
    }
    
    // 5. Fallback: search by name keywords
    if (!layer) {
      layer = template.layers.find((l) => {
        const name = l.name.toLowerCase();
        return name.includes('design') || name.includes('cover') || name.includes('mockup') || name.includes('artwork') || name.includes('placeholder');
      });
    }
    
    return layer;
  }, [template]);

  // Render canvas function (2D fallback)
  const renderCanvas = useCallback(() => {
    if (activeEngine !== 'canvas') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw checkerboard background for transparency
    drawCheckerboard(ctx, canvas.width, canvas.height);
    
    if (!template) return;
    
    // Scale for canvas
    const scaleX = canvas.width / template.width;
    const scaleY = canvas.height / template.height;
    
    // 1. Draw base image (the pre-rendered book photo with shadows/creases)
    if (baseImageRef.current) {
      ctx.drawImage(baseImageRef.current, 0, 0, canvas.width, canvas.height);
      
      // Apply color overlay for colorable layers
      const colorLayers = template.layers.filter(
        (layer) => (layer.type === 'color_layer' || layer.isColorable)
      );
      
      colorLayers.forEach((layer) => {
        const color = colorSelections[layer.name];
        if (color && color !== '#FFFFFF') {
          applyColorOverlay(ctx, canvas.width, canvas.height, color);
        }
      });
    }
    
    // 2. Draw user design at smart object position
    if (userImageRef.current && userImage) {
      const img = userImageRef.current;
      const smartObjectLayer = getSmartObjectLayer();
      
      if (smartObjectLayer) {
        // Try to get perspective transform
        const perspective = getSmartObjectPerspective(smartObjectLayer, template);
        
        if (perspective) {
          // Apply perspective transform
          const src: QuadCorners = {
            topLeft: { x: 0, y: 0 },
            topRight: { x: img.width, y: 0 },
            bottomRight: { x: img.width, y: img.height },
            bottomLeft: { x: 0, y: img.height },
          };
          
          const dst: QuadCorners = {
            topLeft: { x: perspective.corners[0].x * scaleX, y: perspective.corners[0].y * scaleY },
            topRight: { x: perspective.corners[1].x * scaleX, y: perspective.corners[1].y * scaleY },
            bottomRight: { x: perspective.corners[2].x * scaleX, y: perspective.corners[2].y * scaleY },
            bottomLeft: { x: perspective.corners[3].x * scaleX, y: perspective.corners[3].y * scaleY },
          };
          
          applyPerspectiveTransform(ctx, img, src, dst);
        } else {
          // No perspective — draw flat within smart object bounds
          const bounds = getSmartObjectBounds(smartObjectLayer, template.width, template.height);
          
          ctx.save();
          // Clip to smart object bounds
          ctx.beginPath();
          ctx.rect(bounds.x * scaleX, bounds.y * scaleY, bounds.width * scaleX, bounds.height * scaleY);
          ctx.clip();
          
          // Draw image to fill the bounds (cover mode)
          const imgAspect = img.width / img.height;
          const boundsAspect = bounds.width / bounds.height;
          let drawW: number, drawH: number;
          
          if (imgAspect > boundsAspect) {
            // Image is wider — fit height, crop width
            drawH = bounds.height * scaleY * design.scale;
            drawW = drawH * imgAspect;
          } else {
            // Image is taller — fit width, crop height
            drawW = bounds.width * scaleX * design.scale;
            drawH = drawW / imgAspect;
          }
          
          const drawX = (bounds.x + bounds.width * design.x) * scaleX - drawW / 2;
          const drawY = (bounds.y + bounds.height * design.y) * scaleY - drawH / 2;
          
          if (design.rotation) {
            const centerX = (bounds.x + bounds.width / 2) * scaleX;
            const centerY = (bounds.y + bounds.height / 2) * scaleY;
            ctx.translate(centerX, centerY);
            ctx.rotate(design.rotation * Math.PI / 180);
            ctx.translate(-centerX, -centerY);
          }
          
          ctx.drawImage(img, drawX, drawY, drawW, drawH);
          ctx.restore();
        }
      } else {
        // No smart object layer — draw user image as full-canvas overlay
        ctx.save();
        const imgAspect = img.width / img.height;
        const canvasAspect = canvas.width / canvas.height;
        let drawW: number, drawH: number;
        
        if (imgAspect > canvasAspect) {
          drawH = canvas.height * design.scale;
          drawW = drawH * imgAspect;
        } else {
          drawW = canvas.width * design.scale;
          drawH = drawW / imgAspect;
        }
        
        ctx.drawImage(img, canvas.width * design.x - drawW / 2, canvas.height * design.y - drawH / 2, drawW, drawH);
        ctx.restore();
      }
      
      // 3. Draw realism layers (shadows/highlights from compositeUrl)
      const realismLayers = template.layers.filter(l => l.compositeUrl);
      realismLayers.forEach(layer => {
        const rlImg = realismLayersRef.current[layer.id];
        if (rlImg) {
          ctx.save();
          const bm = (layer.blendMode || 'normal').toLowerCase();
          if (bm.includes('multiply')) ctx.globalCompositeOperation = 'multiply';
          else if (bm.includes('screen')) ctx.globalCompositeOperation = 'screen';
          else if (bm.includes('overlay')) ctx.globalCompositeOperation = 'overlay';
          
          ctx.globalAlpha = layer.opacity || 1;
          const lx = (layer.boundsX || 0) * scaleX;
          const ly = (layer.boundsY || 0) * scaleY;
          const lw = (layer.boundsWidth || template.width) * scaleX;
          const lh = (layer.boundsHeight || template.height) * scaleY;
          ctx.drawImage(rlImg, lx, ly, lw, lh);
          ctx.restore();
        }
      });
      
      // 4. Re-draw the base image shadow layers on top of the user design
      // The base image contains pre-baked shadows; we overlay the shadow-type layers
      // from the template on top for realistic compositing
      const shadowLayers = template.layers.filter(l => 
        l.type === 'shadow' && !l.compositeUrl
      );
      shadowLayers.forEach(layer => {
        // Shadow layers reference the same baseImage but with multiply blend
        // The base image already has these baked in, so we apply a subtle multiply pass
        if (baseImageRef.current) {
          ctx.save();
          ctx.globalCompositeOperation = 'multiply';
          ctx.globalAlpha = layer.opacity || 0.25;
          ctx.drawImage(baseImageRef.current, 0, 0, canvas.width, canvas.height);
          ctx.restore();
        }
      });
    }
  }, [template, userImage, design, colorSelections, getSmartObjectLayer, activeEngine]);

  // Track base image load failure
  const baseImageFailedRef = useRef(false);

  // Load images
  useEffect(() => {
    if (!template) return;
    baseImageFailedRef.current = false;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { baseImageRef.current = img; baseImageFailedRef.current = false; renderCanvas(); };
    img.onerror = () => {
      console.warn('[CanvasEngine] Base image failed to load:', (template.baseImage || '').substring(0, 80));
      baseImageFailedRef.current = true;
      baseImageRef.current = null;
      renderCanvas();
    };
    img.src = proxyImageUrl(template.baseImage) || template.baseImage;

    template.layers.filter(l => l.compositeUrl).forEach(layer => {
      const lImg = new Image();
      lImg.crossOrigin = 'anonymous';
      lImg.onload = () => { realismLayersRef.current[layer.id] = lImg; renderCanvas(); };
      lImg.onerror = () => { console.warn('[CanvasEngine] Realism layer failed to load:', layer.name); };
      lImg.src = proxyImageUrl(layer.compositeUrl!) || layer.compositeUrl!;
    });
  }, [template, renderCanvas]);

  useEffect(() => {
    if (!userImage) { userImageRef.current = null; renderCanvas(); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { userImageRef.current = img; renderCanvas(); };
    img.onerror = () => { console.warn('[CanvasEngine] User image failed to load:', (userImage || '').substring(0, 80)); };
    img.src = proxyImageUrl(userImage) || userImage;
  }, [userImage, renderCanvas]);

  useEffect(() => { renderCanvas(); }, [renderCanvas, design, colorSelections]);

  // Handle WebGL ready
  const handleWebGLReady = useCallback((handle: WebGLRendererHandle) => {
    webglRef.current = handle;
    onWebGLReady?.(handle);
  }, [onWebGLReady]);

  // Handle WebGL error — auto-fallback to canvas 2D
  const handleWebGLError = useCallback(() => {
    console.log('🔄 WebGL unavailable — falling back to canvas 2D rendering');
    setActiveEngine('canvas');
    setWebglChecked(true);
  }, []);

  // Notify canvas ready
  useEffect(() => {
    if (activeEngine === 'canvas' && canvasRef.current && onCanvasReady) {
      onCanvasReady(canvasRef.current);
    }
  }, [activeEngine, onCanvasReady]);

  // Expose unified capture method via ref
  useImperativeHandle(ref, () => ({
    capture: async (capWidth = 3840, capHeight = 3840): Promise<string> => {
      // Try WebGL capture first
      if (activeEngine === 'webgl' && webglRef.current) {
        try {
          const dataUrl = await webglRef.current.capture(capWidth, capHeight);
          if (dataUrl) return dataUrl;
        } catch (err) {
          console.warn('WebGL capture failed, trying canvas fallback:', err);
        }
      }

      // Canvas 2D capture
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error('No canvas available for capture');
        return '';
      }

      // Render at high resolution directly to offscreen canvas
      const offscreen = document.createElement('canvas');
      offscreen.width = capWidth;
      offscreen.height = capHeight;
      const ctx = offscreen.getContext('2d');
      if (!ctx) return '';

      if (template && baseImageRef.current) {
        const hiScaleX = capWidth / template.width;
        const hiScaleY = capHeight / template.height;

        // Draw base image at high res
        ctx.drawImage(baseImageRef.current, 0, 0, capWidth, capHeight);

        // Draw user image at high res
        if (userImageRef.current && userImage) {
          const img = userImageRef.current;
          const smartObjectLayer = getSmartObjectLayer();
          
          if (smartObjectLayer) {
            const perspective = getSmartObjectPerspective(smartObjectLayer, template);
            
            if (perspective) {
              const src: QuadCorners = {
                topLeft: { x: 0, y: 0 },
                topRight: { x: img.width, y: 0 },
                bottomRight: { x: img.width, y: img.height },
                bottomLeft: { x: 0, y: img.height },
              };
              const dst: QuadCorners = {
                topLeft: { x: perspective.corners[0].x * hiScaleX, y: perspective.corners[0].y * hiScaleY },
                topRight: { x: perspective.corners[1].x * hiScaleX, y: perspective.corners[1].y * hiScaleY },
                bottomRight: { x: perspective.corners[2].x * hiScaleX, y: perspective.corners[2].y * hiScaleY },
                bottomLeft: { x: perspective.corners[3].x * hiScaleX, y: perspective.corners[3].y * hiScaleY },
              };
              applyPerspectiveTransform(ctx, img, src, dst);
            } else {
              const bounds = getSmartObjectBounds(smartObjectLayer, template.width, template.height);
              ctx.save();
              ctx.beginPath();
              ctx.rect(bounds.x * hiScaleX, bounds.y * hiScaleY, bounds.width * hiScaleX, bounds.height * hiScaleY);
              ctx.clip();
              
              const imgAspect = img.width / img.height;
              const boundsAspect = bounds.width / bounds.height;
              let drawW: number, drawH: number;
              if (imgAspect > boundsAspect) {
                drawH = bounds.height * hiScaleY * design.scale;
                drawW = drawH * imgAspect;
              } else {
                drawW = bounds.width * hiScaleX * design.scale;
                drawH = drawW / imgAspect;
              }
              ctx.drawImage(img, (bounds.x + bounds.width * design.x) * hiScaleX - drawW / 2, (bounds.y + bounds.height * design.y) * hiScaleY - drawH / 2, drawW, drawH);
              ctx.restore();
            }
          } else {
            ctx.drawImage(img, 0, 0, capWidth, capHeight);
          }
        }

        // Draw realism layers at high res
        const realismLayers = template.layers.filter(l => l.compositeUrl);
        realismLayers.forEach(layer => {
          const rlImg = realismLayersRef.current[layer.id];
          if (rlImg) {
            ctx.save();
            const bm = (layer.blendMode || 'normal').toLowerCase();
            if (bm.includes('multiply')) ctx.globalCompositeOperation = 'multiply';
            else if (bm.includes('screen')) ctx.globalCompositeOperation = 'screen';
            else if (bm.includes('overlay')) ctx.globalCompositeOperation = 'overlay';
            ctx.globalAlpha = layer.opacity || 1;
            ctx.drawImage(rlImg, 0, 0, capWidth, capHeight);
            ctx.restore();
          }
        });

        // Re-apply shadow overlay from base image for realistic compositing
        const shadowLayers = template.layers.filter(l => l.type === 'shadow' && !l.compositeUrl);
        shadowLayers.forEach(layer => {
          if (baseImageRef.current) {
            ctx.save();
            ctx.globalCompositeOperation = 'multiply';
            ctx.globalAlpha = layer.opacity || 0.25;
            ctx.drawImage(baseImageRef.current, 0, 0, capWidth, capHeight);
            ctx.restore();
          }
        });
      } else {
        // No template — just scale up the existing canvas
        ctx.drawImage(canvas, 0, 0, capWidth, capHeight);
      }
      
      return offscreen.toDataURL('image/png', 1.0);
    },
    getCanvas: () => {
      if (activeEngine === 'webgl') {
        return webglRef.current?.getCanvas() || null;
      }
      return canvasRef.current;
    },
  }), [activeEngine, template, userImage, design, getSmartObjectLayer, canvasSize]);

  // Interaction (drag to reposition)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!userImage || !onDesignChange) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setIsDragging(true);
    setDragStart({ x: (e.clientX - rect.left) / canvasSize.width - design.x, y: (e.clientY - rect.top) / canvasSize.height - design.y });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !onDesignChange) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    onDesignChange({ x: (e.clientX - rect.left) / canvasSize.width - dragStart.x, y: (e.clientY - rect.top) / canvasSize.height - dragStart.y });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={() => setIsDragging(false)}
    >
      {activeEngine === 'webgl' ? (
        <WebGLRenderer
          ref={webglRef}
          template={template}
          userImage={userImage}
          design={design}
          colorSelections={colorSelections}
          width={canvasSize.width}
          height={canvasSize.height}
          finish={finish}
          onWebGLError={handleWebGLError}
          onWebGLReady={handleWebGLReady}
        />
      ) : (
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="rounded-lg shadow-lg"
        />
      )}
      
      {!template && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <p>Select a template to get started</p>
        </div>
      )}
    </div>
  );
});

CanvasEngine.displayName = 'CanvasEngine';

function drawCheckerboard(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const size = 10;
  for (let y = 0; y < height; y += size) {
    for (let x = 0; x < width; x += size) {
      ctx.fillStyle = ((x / size) + (y / size)) % 2 === 0 ? '#f0f0f0' : '#e0e0e0';
      ctx.fillRect(x, y, size, size);
    }
  }
}

function applyColorOverlay(ctx: CanvasRenderingContext2D, width: number, height: number, colorHex: string) {
  const rgb = hexToRgb(colorHex);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
    data[i] = Math.round(rgb.r * lum);
    data[i + 1] = Math.round(rgb.g * lum);
    data[i + 2] = Math.round(rgb.b * lum);
  }
  ctx.putImageData(imageData, 0, 0);
}
