'use client';

import { useCallback, useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import type { Template, DesignState } from '@/types';
import { hexToRgb } from '@/lib/canvas/color-utils';
import { canvasBlendModes } from '@/lib/canvas/blend-modes';
import { 
  applyPerspectiveTransform, 
  QuadCorners
} from '@/lib/canvas/mesh-warp';
import { getSmartObjectBounds, getSmartObjectPerspective, selectSmartObjectLayer } from '@/lib/canvas/smart-object-helpers';
import { WebGLRenderer, WebGLRendererHandle } from './WebGLRenderer';
import { proxyImageUrl } from '@/lib/image-proxy';

interface CanvasEngineProps {
  template: Template | null;
  userImage: string | null;
  design: DesignState;
  colorSelections: Record<string, string>;
  finish?: 'matte' | 'glossy' | 'soft_touch';
  /** Book-specific controls */
  spineWidth?: number;
  pageColor?: string;
  showPages?: boolean;
  showShadow?: boolean;
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
  spineWidth = 0.375,
  pageColor = '#FFFAF0',
  showPages = true,
  showShadow = true,
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

  // Get the primary smart object layer from template (delegates to shared helper)
  const getSmartObjectLayer = useCallback(() => {
    if (!template) return null;
    return selectSmartObjectLayer(template);
  }, [template]);

  // ═══════════════════════════════════════════════════════════════════
  // PLACEIT-STYLE CANVAS 2D RENDERING PIPELINE (2D fallback)
  // ═══════════════════════════════════════════════════════════════════
  // This renders a book mockup by compositing layers in strict order:
  //   1. Base layer   — pre-rendered book photo (environment with blank cover)
  //   2. User design  — warped into the smart object area via perspective mesh
  //   3. Color overlays — luminosity-preserving tint for colorable layers (background, book body)
  //   4. Realism layers — shadows (multiply), highlights (screen) from PSD composite URLs
  //   5. Shadow overlay — base-image re-drawn with multiply for ambient shadow
  //   6. Page edges    — white/cream rectangle for visible book pages
  //
  // CRITICAL: Steps 3–6 must execute REGARDLESS of whether a user design
  // is loaded. Otherwise the mockup loses realism layers when no cover is set.
  // ═══════════════════════════════════════════════════════════════════
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

    // ── Step 1: Base layer — pre-rendered book photo (environment) ──
    if (baseImageRef.current) {
      ctx.drawImage(baseImageRef.current, 0, 0, canvas.width, canvas.height);
    }

    // ── Step 2: User design — warped into smart object area ──
    if (userImageRef.current && userImage) {
      const img = userImageRef.current;
      const smartObjectLayer = getSmartObjectLayer();

      if (smartObjectLayer) {
        // Try to get perspective transform
        const perspective = getSmartObjectPerspective(smartObjectLayer, template);

        if (perspective) {
          // Perspective warp using triangle subdivision
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
          // No perspective — draw flat within smart object bounds (rare after Priority 4 fallback)
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
    }

    // ── Step 3: Color overlays — luminosity-preserving tint for colorable layers ──
    // MUST run even without a user design so that background/body color changes are visible
    const colorLayers = template.layers.filter(
      (layer) => (layer.type === 'color_layer' || layer.isColorable)
    );
    colorLayers.forEach((layer) => {
      const color = colorSelections[layer.name];
      if (color && color !== '#FFFFFF') {
        const layerBounds = getSmartObjectBounds(layer, template.width, template.height);
        const scaledBounds = {
          x: layerBounds.x * scaleX,
          y: layerBounds.y * scaleY,
          width: layerBounds.width * scaleX,
          height: layerBounds.height * scaleY,
        };
        applyColorOverlay(ctx, canvas.width, canvas.height, color, scaledBounds);
      }
    });

    // ── Step 4: Realism layers — shadows (multiply), highlights (screen) from compositeUrl ──
    // MUST run even without a user design so shadows/highlights always appear
    const realismLayers = template.layers.filter(l => l.compositeUrl);
    realismLayers.forEach(layer => {
      const rlImg = realismLayersRef.current[layer.id];
      if (rlImg) {
        ctx.save();
        const bm = (layer.blendMode || 'normal').toLowerCase();
        const compositeOp = canvasBlendModes[bm as keyof typeof canvasBlendModes] || 'source-over';
        ctx.globalCompositeOperation = compositeOp;
        ctx.globalAlpha = layer.opacity || 1;
        const lx = (layer.boundsX || 0) * scaleX;
        const ly = (layer.boundsY || 0) * scaleY;
        const lw = (layer.boundsWidth || template.width) * scaleX;
        const lh = (layer.boundsHeight || template.height) * scaleY;
        ctx.drawImage(rlImg, lx, ly, lw, lh);
        ctx.restore();
      }
    });

    // ── Step 5: Shadow overlay — base image re-drawn with multiply for ambient shadow ──
    // MUST run even without a user design for consistent lighting
    if (showShadow) {
      const shadowLayers = template.layers.filter(l =>
        l.type === 'shadow' && !l.compositeUrl
      );
      shadowLayers.forEach(layer => {
        if (baseImageRef.current) {
          ctx.save();
          ctx.globalCompositeOperation = 'multiply';
          ctx.globalAlpha = layer.opacity || 0.25;
          ctx.drawImage(baseImageRef.current, 0, 0, canvas.width, canvas.height);
          ctx.restore();
        }
      });
    }

    // ── Step 6: Page edges — white/cream rectangle for visible book pages ──
    // MUST run even without a user design so page edges are always visible
    if (showPages) {
      const pagesLayer = template.layers.find(l =>
        l.type === 'smart_object' && l.name.toLowerCase().includes('page')
      );
      if (pagesLayer) {
        const pagesBounds = getSmartObjectBounds(pagesLayer, template.width, template.height);
        ctx.save();
        ctx.fillStyle = pageColor;
        ctx.fillRect(
          pagesBounds.x * scaleX,
          pagesBounds.y * scaleY,
          pagesBounds.width * scaleX,
          pagesBounds.height * scaleY
        );
        ctx.restore();
      }
    }
  }, [template, userImage, design, colorSelections, getSmartObjectLayer, activeEngine, showShadow, showPages, pageColor]);

  // Track base image load failure
  const baseImageFailedRef = useRef(false);

  // Load base images with detailed logging
  useEffect(() => {
    if (!template) return;
    baseImageFailedRef.current = false;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    const proxyUrl = proxyImageUrl(template.baseImage);
    console.log('[CanvasEngine] Loading base image:', {
      original: (template.baseImage || '').substring(0, 100),
      proxied: (proxyUrl || '').substring(0, 100),
      templateWidth: template.width,
      templateHeight: template.height,
      layerCount: template.layers.length,
      smartObjectLayers: template.layers.filter(l => l.type === 'smart_object').map(l => ({
        name: l.name,
        type: l.type,
        hasPerspective: !!l.perspectiveTransform,
        hasWarp: !!l.warpData,
        bounds: l.boundsX != null ? { x: l.boundsX, y: l.boundsY, w: l.boundsWidth, h: l.boundsHeight } : l.bounds,
      })),
    });
    img.onload = () => {
      console.log('[CanvasEngine] Base image loaded successfully:', img.width, 'x', img.height);
      baseImageRef.current = img;
      baseImageFailedRef.current = false;
      renderCanvas();
    };
    img.onerror = () => {
      console.warn('[CanvasEngine] Base image failed to load:', (template.baseImage || '').substring(0, 80));
      baseImageFailedRef.current = true;
      baseImageRef.current = null;
      renderCanvas();
    };
    img.src = proxyUrl || template.baseImage;

    const compositeLayers = template.layers.filter(l => l.compositeUrl);
    console.log('[CanvasEngine] Loading', compositeLayers.length, 'composite/realism layers');
    compositeLayers.forEach(layer => {
      const lImg = new Image();
      lImg.crossOrigin = 'anonymous';
      lImg.onload = () => {
        console.log('[CanvasEngine] Realism layer loaded:', layer.name, lImg.width, 'x', lImg.height);
        realismLayersRef.current[layer.id] = lImg;
        renderCanvas();
      };
      lImg.onerror = () => { console.warn('[CanvasEngine] Realism layer failed to load:', layer.name, layer.compositeUrl?.substring(0, 80)); };
      lImg.src = proxyImageUrl(layer.compositeUrl!) || layer.compositeUrl!;
    });
  }, [template, renderCanvas]);

  // Load user images with detailed logging
  useEffect(() => {
    if (!userImage) { userImageRef.current = null; renderCanvas(); return; }
    console.log('[CanvasEngine] Loading user image:', userImage.substring(0, 60) + '...');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      console.log('[CanvasEngine] User image loaded:', img.width, 'x', img.height, 'design:', design);
      userImageRef.current = img;
      renderCanvas();
    };
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

        // ═══════════════════════════════════════════════════════════════
        // PLACEIT-STYLE HIGH-RES CAPTURE PIPELINE
        // Same layer order as renderCanvas() for consistency:
        //   1. Base layer   2. User design  3. Color overlays
        //   4. Realism layers  5. Shadow overlay  6. Page edges
        // ═══════════════════════════════════════════════════════════════

        // Step 1: Draw base image at high res
        ctx.drawImage(baseImageRef.current, 0, 0, capWidth, capHeight);

        // Step 2: Draw user design at high res
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

        // Step 3: Color overlays — luminosity-preserving tint for colorable layers
        const colorLayers = template.layers.filter(
          (layer) => (layer.type === 'color_layer' || layer.isColorable)
        );
        colorLayers.forEach((layer) => {
          const color = colorSelections[layer.name];
          if (color && color !== '#FFFFFF') {
            const layerBounds = getSmartObjectBounds(layer, template.width, template.height);
            const scaledBounds = {
              x: layerBounds.x * hiScaleX,
              y: layerBounds.y * hiScaleY,
              width: layerBounds.width * hiScaleX,
              height: layerBounds.height * hiScaleY,
            };
            applyColorOverlay(ctx, capWidth, capHeight, color, scaledBounds);
          }
        });

        // Step 4: Realism layers — shadows/highlights from compositeUrl
        const realismLayers = template.layers.filter(l => l.compositeUrl);
        realismLayers.forEach(layer => {
          const rlImg = realismLayersRef.current[layer.id];
          if (rlImg) {
            ctx.save();
            const bm = (layer.blendMode || 'normal').toLowerCase();
            const compositeOp = canvasBlendModes[bm as keyof typeof canvasBlendModes] || 'source-over';
            ctx.globalCompositeOperation = compositeOp;
            ctx.globalAlpha = layer.opacity || 1;
            const lx = (layer.boundsX || 0) * hiScaleX;
            const ly = (layer.boundsY || 0) * hiScaleY;
            const lw = (layer.boundsWidth || template.width) * hiScaleX;
            const lh = (layer.boundsHeight || template.height) * hiScaleY;
            ctx.drawImage(rlImg, lx, ly, lw, lh);
            ctx.restore();
          }
        });

        // Step 5: Shadow overlay — base image re-drawn with multiply for ambient shadow
        if (showShadow) {
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
        }

        // Step 6: Page edges — white/cream rectangle for visible book pages
        if (showPages) {
          const pagesLayer = template.layers.find(l =>
            l.type === 'smart_object' && l.name.toLowerCase().includes('page')
          );
          if (pagesLayer) {
            const pagesBounds = getSmartObjectBounds(pagesLayer, template.width, template.height);
            ctx.save();
            ctx.fillStyle = pageColor;
            ctx.fillRect(
              pagesBounds.x * hiScaleX,
              pagesBounds.y * hiScaleY,
              pagesBounds.width * hiScaleX,
              pagesBounds.height * hiScaleY
            );
            ctx.restore();
          }
        }
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
  }), [activeEngine, template, userImage, design, colorSelections, getSmartObjectLayer, canvasSize, showShadow, showPages, pageColor]);

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
          spineWidth={spineWidth}
          pageColor={pageColor}
          showPages={showPages}
          showShadow={showShadow}
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

function applyColorOverlay(
  ctx: CanvasRenderingContext2D, 
  canvasWidth: number, 
  canvasHeight: number, 
  colorHex: string,
  layerBounds?: { x: number; y: number; width: number; height: number } | null
) {
  const rgb = hexToRgb(colorHex);
  
  // If we have layer bounds, only apply the color overlay within those bounds
  // to avoid painting the entire canvas
  const bx = layerBounds?.x ?? 0;
  const by = layerBounds?.y ?? 0;
  const bw = layerBounds?.width ?? canvasWidth;
  const bh = layerBounds?.height ?? canvasHeight;
  
  // Clamp to canvas bounds
  const startX = Math.max(0, Math.floor(bx));
  const startY = Math.max(0, Math.floor(by));
  const endX = Math.min(canvasWidth, Math.ceil(bx + bw));
  const endY = Math.min(canvasHeight, Math.ceil(by + bh));
  
  if (startX >= endX || startY >= endY) return;
  
  const imageData = ctx.getImageData(startX, startY, endX - startX, endY - startY);
  const data = imageData.data;
  const width = imageData.width;
  
  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] === 0) continue;
      const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
      data[i] = Math.round(rgb.r * lum);
      data[i + 1] = Math.round(rgb.g * lum);
      data[i + 2] = Math.round(rgb.b * lum);
    }
  }
  ctx.putImageData(imageData, startX, startY);
}
