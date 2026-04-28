'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import type { Template, DesignState } from '@/types';
import { getSmartObjectBounds, getSmartObjectPerspective, selectSmartObjectLayer } from '@/lib/canvas/smart-object-helpers';
import { proxyImageUrl } from '@/lib/image-proxy';

// GLSL Shader for realistic ink-on-paper blending
const RealismShader = {
  uniforms: {
    tDiffuse: { value: null },      // User design
    tShadow: { value: null },       // Multiply layer (Shadows/Grain)
    tHighlight: { value: null },    // Screen layer (Highlights/Gloss)
    opacity: { value: 1.0 },
    shadowOpacity: { value: 1.0 },
    highlightOpacity: { value: 1.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform sampler2D tShadow;
    uniform sampler2D tHighlight;
    uniform float opacity;
    uniform float shadowOpacity;
    uniform float highlightOpacity;
    varying vec2 vUv;

    void main() {
      vec4 design = texture2D(tDiffuse, vUv);
      vec4 shadow = texture2D(tShadow, vUv);
      vec4 highlight = texture2D(tHighlight, vUv);

      vec3 color = design.rgb;

      // Apply Multiply Blend (Shadows)
      vec3 multiply = color * shadow.rgb;
      color = mix(color, multiply, shadowOpacity * shadow.a);

      // Apply Screen/Linear Dodge Blend (Highlights)
      vec3 screen = 1.0 - (1.0 - color) * (1.0 - highlight.rgb);
      color = mix(color, screen, highlightOpacity * highlight.a);

      gl_FragColor = vec4(color, design.a * opacity);
    }
  `
};

interface WebGLRendererProps {
  template: Template | null;
  userImage: string | null;
  design: DesignState;
  colorSelections: Record<string, string>;
  width: number;
  height: number;
  finish?: 'matte' | 'glossy' | 'soft_touch';
  /** Book-specific controls */
  spineWidth?: number;
  pageColor?: string;
  showPages?: boolean;
  showShadow?: boolean;
  onWebGLError?: () => void;
  onWebGLReady?: (handle: WebGLRendererHandle) => void;
}

export interface WebGLRendererHandle {
  getCanvas: () => HTMLCanvasElement | null;
  capture: (width?: number, height?: number) => Promise<string>;
}

/**
 * Create a 1x1 white pixel texture as a fallback placeholder.
 * Used when realism layer textures (shadow/highlight) fail to load.
 */
function createWhitePlaceholderTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1, 1);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export const WebGLRenderer = forwardRef<WebGLRendererHandle, WebGLRendererProps>(({
  template,
  userImage,
  design,
  colorSelections,
  width,
  height,
  finish = 'matte',
  spineWidth = 0.375,
  pageColor = '#FFFAF0',
  showPages = true,
  showShadow = true,
  onWebGLError,
  onWebGLReady,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const textureLoaderRef = useRef<THREE.TextureLoader | null>(null);
  
  const texturesCache = useRef<Map<string, THREE.Texture>>(new Map());
  const meshesRef = useRef<THREE.Group>(new THREE.Group());
  const whitePlaceholderRef = useRef<THREE.Texture | null>(null);
  const [webGLError, setWebGLError] = useState(false);

  // Maximum cached textures to prevent unbounded memory growth
  const MAX_TEXTURE_CACHE_SIZE = 20;

  useEffect(() => {
    if (!containerRef.current) return;

    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.warn('WebGL not supported in this browser');
      setWebGLError(true);
      onWebGLError?.();
      return;
    }

    try {
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        preserveDrawingBuffer: true 
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;
    } catch (err) {
      console.error('WebGL initialization failed:', err);
      setWebGLError(true);
      onWebGLError?.();
      return;
    }

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.add(meshesRef.current);

    const camera = new THREE.OrthographicCamera(0, width, 0, height, 0.1, 1000);
    camera.position.z = 10;
    cameraRef.current = camera;
    textureLoaderRef.current = new THREE.TextureLoader();
    textureLoaderRef.current.setCrossOrigin('anonymous');

    // Parallax interaction
    const mouse = new THREE.Vector2();
    const targetRotation = new THREE.Vector2();

    const onPointerMove = (event: PointerEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      targetRotation.x = mouse.y * 0.05;
      targetRotation.y = mouse.x * 0.05;
    };

    window.addEventListener('pointermove', onPointerMove);

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        meshesRef.current.rotation.x += (targetRotation.x - meshesRef.current.rotation.x) * 0.05;
        meshesRef.current.rotation.y += (targetRotation.y - meshesRef.current.rotation.y) * 0.05;
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('pointermove', onPointerMove);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (containerRef.current && rendererRef.current.domElement) {
          try {
            containerRef.current.removeChild(rendererRef.current.domElement);
          } catch (e) {}
        }
      }
      texturesCache.current.forEach(t => t.dispose());
      texturesCache.current.clear();
      // Dispose the cached white placeholder texture to prevent GPU memory leak
      if (whitePlaceholderRef.current) {
        whitePlaceholderRef.current.dispose();
        whitePlaceholderRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (rendererRef.current && cameraRef.current) {
      rendererRef.current.setSize(width, height);
      cameraRef.current.right = width;
      cameraRef.current.bottom = height;
      cameraRef.current.updateProjectionMatrix();
    }
  }, [width, height]);

  const updateScene = useCallback(async () => {
    if (!template || !sceneRef.current || !textureLoaderRef.current) return;

    // Clear stale cached textures when template changes (dispose textures not from current template)
    const currentTemplateUrls = new Set<string>();
    if (template.baseImage) currentTemplateUrls.add(proxyImageUrl(template.baseImage) || template.baseImage);
    template.layers.forEach(l => {
      if (l.compositeUrl) currentTemplateUrls.add(proxyImageUrl(l.compositeUrl) || l.compositeUrl);
    });
    // Remove cached textures that don't belong to the current template
    for (const [key, texture] of texturesCache.current) {
      if (!currentTemplateUrls.has(key)) {
        texture.dispose();
        texturesCache.current.delete(key);
      }
    }

    console.log('[WebGLRenderer] updateScene:', {
      templateName: template.name,
      templateSize: `${template.width}x${template.height}`,
      hasBaseImage: !!template.baseImage,
      baseImageUrl: (template.baseImage || '').substring(0, 100),
      hasUserImage: !!userImage,
      userImagePrefix: (userImage || '').substring(0, 60),
      layers: template.layers.length,
      smartObjectLayers: template.layers.filter(l => l.type === 'smart_object').map(l => ({
        name: l.name,
        hasPerspective: !!l.perspectiveTransform,
        hasWarp: !!l.warpData,
        blendMode: l.blendMode,
        compositeUrl: l.compositeUrl ? (l.compositeUrl as string).substring(0, 60) : null,
      })),
      compositeLayers: template.layers.filter(l => l.compositeUrl).length,
      design: { x: design.x, y: design.y, scale: design.scale, rotation: design.rotation },
    });

    // Clear existing meshes
    while(meshesRef.current.children.length > 0) {
      const child = meshesRef.current.children[0] as THREE.Mesh;
      if (child.geometry) child.geometry.dispose();
      if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
      else child.material.dispose();
      meshesRef.current.remove(child);
    }

    const loader = textureLoaderRef.current;
    const scaleX = width / template.width;
    const scaleY = height / template.height;

    const getTexture = async (rawUrl: string): Promise<THREE.Texture | null> => {
      const proxied = proxyImageUrl(rawUrl) || rawUrl;
      const candidates = proxied !== rawUrl ? [proxied, rawUrl] : [rawUrl];

      for (const candidate of candidates) {
        if (texturesCache.current.has(candidate)) {
          return texturesCache.current.get(candidate)!;
        }
      }

      const ensureCacheCapacity = () => {
        while (texturesCache.current.size >= MAX_TEXTURE_CACHE_SIZE) {
          const firstKey = texturesCache.current.keys().next().value;
          if (!firstKey) break;
          const oldTexture = texturesCache.current.get(firstKey);
          oldTexture?.dispose();
          texturesCache.current.delete(firstKey);
        }
      };

      for (const candidate of candidates) {
        ensureCacheCapacity();

        const texture = await new Promise<THREE.Texture | null>((resolve) => {
          loader.load(
            candidate,
            (t) => {
              t.minFilter = THREE.LinearFilter;
              t.magFilter = THREE.LinearFilter;
              if (rendererRef.current) {
                t.anisotropy = rendererRef.current.capabilities.getMaxAnisotropy();
              }
              resolve(t);
            },
            undefined,
            (err) => {
              console.warn('Texture failed to load:', candidate.substring(0, 80), err);
              resolve(null);
            }
          );
        });

        if (texture) {
          texturesCache.current.set(candidate, texture);
          return texture;
        }
      }

      return null;
    };

    // 1. Base Layer (pre-rendered book photo with shadows/creases baked in)
    {
      const baseCandidates = [template.baseImage, template.thumbnail].filter(Boolean) as string[];
      let baseTexture: THREE.Texture | null = null;
      for (const candidate of baseCandidates) {
        baseTexture = await getTexture(candidate);
        if (baseTexture) break;
      }
      if (baseTexture) {
        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshBasicMaterial({ map: baseTexture, transparent: true });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(width / 2, height / 2, 0);
        meshesRef.current.add(mesh);
      }
    }

    // Find the best smart object layer for the user's cover design
    const smartObjectLayer = selectSmartObjectLayer(template);
    console.log(`[WebGLRenderer] Selected smart object: ${smartObjectLayer?.name || 'none'} (from ${template.layers.filter(l => l.type === 'smart_object' && l.opacity > 0).length} smart objects)`);
    if (smartObjectLayer && userImage) {
      const designTexture = await getTexture(userImage);
      if (!designTexture) return;
      
      // Get perspective data
      const perspective = getSmartObjectPerspective(smartObjectLayer, template);
      console.log('[WebGLRenderer] Perspective data:', perspective ? {
        corners: perspective.corners,
        hasWarpData: !!smartObjectLayer.warpData,
        hasPerspectiveTransform: !!smartObjectLayer.perspectiveTransform,
        hasWarpPreset: !!template.warpPreset,
        hasBounds: !!smartObjectLayer.bounds,
      } : 'null (no perspective data)');
      
      if (perspective) {
        // Render with perspective/warp using a 4x4 vertex grid
        const corners = perspective.corners;
        const geometry = new THREE.PlaneGeometry(1, 1, 3, 3); // 4x4 grid
        
        // Bilinearly interpolate 4 corners to 16 vertices
        const pts: { x: number; y: number }[] = [];
        for (let j = 0; j <= 3; j++) {
          for (let i = 0; i <= 3; i++) {
            const u = i / 3;
            const v = j / 3;
            const x = (1-u)*(1-v)*corners[0].x + u*(1-v)*corners[1].x + u*v*corners[2].x + (1-u)*v*corners[3].x;
            const y_coord = (1-u)*(1-v)*corners[0].y + u*(1-v)*corners[1].y + u*v*corners[2].y + (1-u)*v*corners[3].y;
            pts.push({ x, y: y_coord });
          }
        }

        const pos = geometry.attributes.position;
        for (let i = 0; i < 16; i++) {
          pos.setXY(i, pts[i].x * scaleX, pts[i].y * scaleY);
        }
        pos.needsUpdate = true;

        // Fix UV mapping: PlaneGeometry(1,1,3,3) default UVs have v=1 at top, v=0 at bottom.
        // Our camera has top=0, bottom=height (y-down), so j=0 maps to top edge (smaller y)
        // and j=3 maps to bottom edge (larger y).
        // In texture coordinates, (0,0) is bottom-left and (1,1) is top-right.
        // So j=0 (top of quad) → v=1 (top of texture), j=3 (bottom of quad) → v=0 (bottom of texture).
        const uv = geometry.attributes.uv;
        for (let j = 0; j <= 3; j++) {
          for (let i = 0; i <= 3; i++) {
            const idx = j * 4 + i;
            uv.setXY(idx, i / 3, 1 - j / 3); // Flip v: j=0 → v=1 (top), j=3 → v=0 (bottom)
          }
        }
        uv.needsUpdate = true;

        // Look for realism maps
        const shadowLayer = template.layers.find(l => l.compositeUrl && l.blendMode.toLowerCase().includes('multiply'));
        const highlightLayer = template.layers.find(l => l.compositeUrl && (l.blendMode.toLowerCase().includes('screen') || l.blendMode.toLowerCase().includes('linear dodge')));
        const shadowTexture = shadowLayer ? await getTexture(shadowLayer.compositeUrl!) : null;
        const highlightTexture = highlightLayer ? await getTexture(highlightLayer.compositeUrl!) : null;

        // If both realism textures failed AND base image failed, use simple material
        const hasAnyRealism = shadowTexture || highlightTexture;

        // Create placeholder white textures for any missing realism maps
        // (the shader will multiply by white = no change, screen with white = no change)
        // Cache the placeholder texture to avoid GPU memory leak on repeated template changes
        const getWhitePlaceholder = () => {
          if (!whitePlaceholderRef.current) {
            whitePlaceholderRef.current = createWhitePlaceholderTexture();
          }
          return whitePlaceholderRef.current;
        };
        const shadowTex = shadowTexture || getWhitePlaceholder();
        const highlightTex = highlightTexture || getWhitePlaceholder();

        // Shader material with realism
        const material = new THREE.ShaderMaterial({
          uniforms: THREE.UniformsUtils.clone(RealismShader.uniforms),
          vertexShader: RealismShader.vertexShader,
          fragmentShader: RealismShader.fragmentShader,
          transparent: true,
          side: THREE.DoubleSide
        });

        material.uniforms.tDiffuse.value = designTexture;
        material.uniforms.tShadow.value = shadowTex;
        material.uniforms.tHighlight.value = highlightTex;
        
        const shadowBase = shadowTexture ? (shadowLayer?.opacity || 0.8) : 0;
        const highlightBase = highlightTexture ? (highlightLayer?.opacity || 0.5) : 0;

        switch (finish) {
          case 'glossy':
            material.uniforms.shadowOpacity.value = shadowBase * 1.1;
            material.uniforms.highlightOpacity.value = highlightBase * 1.8;
            break;
          case 'soft_touch':
            material.uniforms.shadowOpacity.value = shadowBase * 0.9;
            material.uniforms.highlightOpacity.value = highlightBase * 0.2;
            break;
          case 'matte':
          default:
            material.uniforms.shadowOpacity.value = shadowBase;
            material.uniforms.highlightOpacity.value = highlightBase * 0.5;
            break;
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.z = 0.5;
        meshesRef.current.add(mesh);
      } else {
        // No perspective — draw flat within smart object bounds, applying design transforms
        const bounds = getSmartObjectBounds(smartObjectLayer, template.width, template.height);
        
        // Calculate draw size with design.scale (cover mode)
        const texImage = designTexture.image as HTMLImageElement | undefined;
        const imgAspect = texImage ? texImage.width / texImage.height : 1;
        const boundsAspect = bounds.width / bounds.height;
        let drawW: number, drawH: number;
        
        if (imgAspect > boundsAspect) {
          drawH = bounds.height * scaleY * design.scale;
          drawW = drawH * imgAspect;
        } else {
          drawW = bounds.width * scaleX * design.scale;
          drawH = drawW / imgAspect;
        }
        
        const geometry = new THREE.PlaneGeometry(drawW, drawH);
        const material = new THREE.MeshBasicMaterial({ 
          map: designTexture, 
          transparent: true,
        });
        const mesh = new THREE.Mesh(geometry, material);
        
        // Apply design.x/y positioning (normalized 0-1 relative to bounds)
        const centerX = (bounds.x + bounds.width * design.x) * scaleX;
        const centerY = (bounds.y + bounds.height * design.y) * scaleY;
        mesh.position.set(centerX, centerY, 0.5);
        
        // Apply design.rotation
        if (design.rotation) {
          mesh.rotation.z = -design.rotation * Math.PI / 180;
        }
        
        meshesRef.current.add(mesh);
      }
    }

    // 3. Independent Realism Layers
    for (const layer of template.layers) {
      if (layer.compositeUrl && layer.type !== 'smart_object') {
        const isAlreadyProcessed = (layer.blendMode.toLowerCase().includes('multiply') || layer.blendMode.toLowerCase().includes('screen'));
        if (isAlreadyProcessed && template.layers.some(l => l.type === 'smart_object')) continue;

        try {
          const texture = await getTexture(layer.compositeUrl!);
          const geometry = new THREE.PlaneGeometry(width, height);
          const material = new THREE.MeshBasicMaterial({ 
            map: texture, 
            transparent: true,
            opacity: layer.opacity || 1,
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(width / 2, height / 2, 1);
          meshesRef.current.add(mesh);
        } catch (e) {
          console.warn('Failed to load realism layer:', e);
        }
      }
    }

    // 4. Re-apply shadow overlay from base image for realistic compositing
    // Only apply if showShadow is enabled
    if (showShadow) {
      const shadowLayers = template.layers.filter(l => l.type === 'shadow' && !l.compositeUrl);
      if (shadowLayers.length > 0 && template.baseImage && smartObjectLayer && userImage) {
        try {
          const baseTexture = await getTexture(template.baseImage);
          for (const layer of shadowLayers) {
            const geometry = new THREE.PlaneGeometry(width, height);
            const material = new THREE.MeshBasicMaterial({ 
              map: baseTexture, 
              transparent: true,
              opacity: layer.opacity || 0.25,
              blending: THREE.MultiplyBlending,
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(width / 2, height / 2, 2);
            meshesRef.current.add(mesh);
          }
        } catch (e) {
          console.warn('Failed to apply shadow overlay:', e);
        }
      }
    }
    
    // 5. Draw page edges if enabled and template has a pages layer
    if (showPages) {
      const pagesLayer = template.layers.find(l => 
        l.type === 'smart_object' && l.name.toLowerCase().includes('page')
      );
      if (pagesLayer) {
        const pagesBounds = getSmartObjectBounds(pagesLayer, template.width, template.height);
        const scaleX = width / template.width;
        const scaleY = height / template.height;
        // Create a colored rectangle for the page edges
        const pagesCanvas = document.createElement('canvas');
        pagesCanvas.width = Math.round(pagesBounds.width * scaleX);
        pagesCanvas.height = Math.round(pagesBounds.height * scaleY);
        const pagesCtx = pagesCanvas.getContext('2d')!;
        pagesCtx.fillStyle = pageColor;
        pagesCtx.fillRect(0, 0, pagesCanvas.width, pagesCanvas.height);
        const pagesTexture = new THREE.CanvasTexture(pagesCanvas);
        pagesTexture.needsUpdate = true;
        const pagesGeometry = new THREE.PlaneGeometry(pagesBounds.width * scaleX, pagesBounds.height * scaleY);
        const pagesMaterial = new THREE.MeshBasicMaterial({ 
          map: pagesTexture, 
          transparent: true,
          opacity: 0.9,
        });
        const pagesMesh = new THREE.Mesh(pagesGeometry, pagesMaterial);
        pagesMesh.position.set(
          (pagesBounds.x + pagesBounds.width / 2) * scaleX,
          (pagesBounds.y + pagesBounds.height / 2) * scaleY,
          0.3
        );
        meshesRef.current.add(pagesMesh);
      }
    }

  }, [template, userImage, design, colorSelections, width, height, finish, spineWidth, pageColor, showPages, showShadow]);

  useEffect(() => {
    updateScene();
  }, [updateScene]);

  useImperativeHandle(ref, () => ({
    getCanvas: () => rendererRef.current?.domElement || null,
    capture: async (capWidth = 3840, capHeight = 3840) => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !template) return '';
      
      const renderer = rendererRef.current;
      const camera = cameraRef.current;
      const originalSize = new THREE.Vector2();
      renderer.getSize(originalSize);
      
      renderer.setSize(capWidth, capHeight, false);
      camera.right = capWidth;
      camera.bottom = capHeight;
      camera.updateProjectionMatrix();

      renderer.render(sceneRef.current, camera);
      const dataUrl = renderer.domElement.toDataURL('image/png', 1.0);
      
      renderer.setSize(originalSize.x, originalSize.y, false);
      camera.right = width;
      camera.bottom = height;
      camera.updateProjectionMatrix();
      
      return dataUrl;
    }
  }));

  // If WebGL failed, return null — the parent CanvasEngine will fall back to canvas 2D
  if (webGLError) {
    return null;
  }

  return <div ref={containerRef} className="w-full h-full" style={{ overflow: 'hidden' }} />;
});

WebGLRenderer.displayName = 'WebGLRenderer';
