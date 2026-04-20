'use client';

import { useCallback, useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import type { Template, DesignState } from '@/types';
import { hexToRgb } from '@/lib/canvas/color-utils';
import { 
  applyPerspectiveTransform, 
  calculateBookWarp,
  QuadCorners
} from '@/lib/canvas/mesh-warp';
import { BOOK_WARPS } from '@/lib/templates/book-warps';
import { WebGLRenderer, WebGLRendererHandle } from './WebGLRenderer';

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
  
  // Auto-fallback: start with the prop, switch to canvas if WebGL fails
  const [activeEngine, setActiveEngine] = useState<'canvas' | 'webgl'>(engineProp);
  
  // Track loaded images
  const baseImageRef = useRef<HTMLImageElement | null>(null);
  const userImageRef = useRef<HTMLImageElement | null>(null);
  const realismLayersRef = useRef<Record<string, HTMLImageElement>>({});

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
    
    // 1. Highest priority: Layer with explicit warpData (the actual 3D cover)
    let layer = template.layers.find(
      (l) => l.type === 'smart_object' && l.warpData
    );
    
    // 2. Second priority: Layer with explicit bounds but marked as smart_object
    if (!layer) {
      layer = template.layers.find(
        (l) => l.type === 'smart_object' && (l as any).boundsX !== null
      );
    }
    
    // 3. Third priority: Any smart object at all
    if (!layer) {
      layer = template.layers.find((l) => l.type === 'smart_object');
    }
    
    // 4. Fallback: search by name keywords
    if (!layer) {
      layer = template.layers.find((l) => {
        const name = l.name.toLowerCase();
        return (name.includes('design') || name.includes('cover') || name.includes('mockup') || name.includes('artwork') || name.includes('placeholder')) && !template.layers.some(other => other.name === name && other.id !== l.id);
      });
    }
    
    return layer;
  }, [template]);

  // Render canvas function (Legacy 2D)
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
    
    // 1. Draw base image (Background)
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
    
    // 2. Draw user design at smart object position with warping
    if (userImageRef.current && userImage) {
      const img = userImageRef.current;
      const smartObjectLayer = getSmartObjectLayer();
      
      if (smartObjectLayer) {
        // Handle Warping if perspectiveTransform, warpData or preset exists
        let warped = false;
        
        // 1. Priority: Explicit Perspective Transform (4 corners from PSD)
        if (smartObjectLayer.perspectiveTransform) {
          const pt = smartObjectLayer.perspectiveTransform;
          
          const src: QuadCorners = {
            topLeft: { x: 0, y: 0 },
            topRight: { x: img.width, y: 0 },
            bottomRight: { x: img.width, y: img.height },
            bottomLeft: { x: 0, y: img.height },
          };
          
          const dst: QuadCorners = {
            topLeft: { x: pt.corners[0].x * scaleX, y: pt.corners[0].y * scaleY },
            topRight: { x: pt.corners[1].x * scaleX, y: pt.corners[1].y * scaleY },
            bottomRight: { x: pt.corners[2].x * scaleX, y: pt.corners[2].y * scaleY },
            bottomLeft: { x: pt.corners[3].x * scaleX, y: pt.corners[3].y * scaleY },
          };
          
          applyPerspectiveTransform(ctx, img, src, dst);
          warped = true;
        }
        
        // 2. Secondary: PSD Warp Data (Mesh deformation)
        if (!warped && smartObjectLayer.warpData) {
          try {
            const warp = typeof smartObjectLayer.warpData === 'string' 
              ? JSON.parse(smartObjectLayer.warpData) 
              : smartObjectLayer.warpData;
            
            // Helper to safely get mesh corners
            const getMeshCorners = (points: any[], rows: number, cols: number) => {
              return {
                topLeft: points[0],
                topRight: points[cols - 1],
                bottomLeft: points[(rows - 1) * cols],
                bottomRight: points[rows * cols - 1],
              };
            };

            // For a 4x4 grid (16 points)
            if (warp && warp.controlPoints && warp.controlPoints.length >= 16) {
              const corners = getMeshCorners(warp.controlPoints, 4, 4);
              const src: QuadCorners = {
                topLeft: { x: 0, y: 0 },
                topRight: { x: img.width, y: 0 },
                bottomRight: { x: img.width, y: img.height },
                bottomLeft: { x: 0, y: img.height },
              };
              const dst: QuadCorners = {
                topLeft: { x: corners.topLeft.x * scaleX, y: corners.topLeft.y * scaleY },
                topRight: { x: corners.topRight.x * scaleX, y: corners.topRight.y * scaleY },
                bottomRight: { x: corners.bottomRight.x * scaleX, y: corners.bottomRight.y * scaleY },
                bottomLeft: { x: corners.bottomLeft.x * scaleX, y: corners.bottomLeft.y * scaleY },
              };
              applyPerspectiveTransform(ctx, img, src, dst);
              warped = true;
            }
          } catch (e) {
            console.warn('Failed to apply PSD warp:', e);
          }
        }
        
        // 3. Realism Layers (Shadows/Highlights)
        const realismLayers = template.layers.filter(l => l.compositeUrl);
        realismLayers.forEach(layer => {
          const img = realismLayersRef.current[layer.id];
          if (img) {
            ctx.save();
            const bm = (layer.blendMode || 'normal').toLowerCase();
            if (bm.includes('multiply')) ctx.globalCompositeOperation = 'multiply';
            else if (bm.includes('screen')) ctx.globalCompositeOperation = 'screen';
            else if (bm.includes('overlay')) ctx.globalCompositeOperation = 'overlay';
            
            ctx.globalAlpha = layer.opacity || 1;
            const lx = ((layer as any).boundsX || 0) * scaleX;
            const ly = ((layer as any).boundsY || 0) * scaleY;
            const lw = ((layer as any).boundsWidth || template.width) * scaleX;
            const lh = ((layer as any).boundsHeight || template.height) * scaleY;
            ctx.drawImage(img, lx, ly, lw, lh);
            ctx.restore();
          }
        });
      }
    }
  }, [template, userImage, design, colorSelections, getSmartObjectLayer, activeEngine]);

  // Load images
  useEffect(() => {
    if (!template) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { baseImageRef.current = img; renderCanvas(); };
    img.src = template.baseImage;

    template.layers.filter(l => l.compositeUrl).forEach(layer => {
      const lImg = new Image();
      lImg.crossOrigin = 'anonymous';
      lImg.onload = () => { realismLayersRef.current[layer.id] = lImg; renderCanvas(); };
      lImg.src = layer.compositeUrl!;
    });
  }, [template, renderCanvas]);

  useEffect(() => {
    if (!userImage) { userImageRef.current = null; renderCanvas(); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { userImageRef.current = img; renderCanvas(); };
    img.src = userImage;
  }, [userImage, renderCanvas]);

  useEffect(() => { renderCanvas(); }, [renderCanvas, design, colorSelections]);

  // Handle WebGL ready — use a callback pattern that works with timing
  const handleWebGLReady = useCallback((handle: WebGLRendererHandle) => {
    webglRef.current = handle;
    onWebGLReady?.(handle);
  }, [onWebGLReady]);

  // Handle WebGL error — auto-fallback to canvas 2D
  const handleWebGLError = useCallback(() => {
    console.log('🔄 WebGL unavailable — falling back to canvas 2D rendering');
    setActiveEngine('canvas');
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

      // Canvas 2D fallback capture
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error('No canvas available for capture');
        return '';
      }

      // For canvas 2D, we can scale up by drawing to a larger offscreen canvas
      const offscreen = document.createElement('canvas');
      offscreen.width = capWidth;
      offscreen.height = capHeight;
      const ctx = offscreen.getContext('2d');
      if (!ctx) return '';

      // Draw scaled version
      ctx.drawImage(canvas, 0, 0, capWidth, capHeight);
      return offscreen.toDataURL('image/png', 1.0);
    },
    getCanvas: () => {
      if (activeEngine === 'webgl') {
        return webglRef.current?.getCanvas() || null;
      }
      return canvasRef.current;
    },
  }), [activeEngine]);

  // Interaction (Simple drag fallback)
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
