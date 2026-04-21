'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import type { Template, DesignState, TemplateLayer } from '@/types';
import { BOOK_WARPS } from '@/lib/templates/book-warps';

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
  onWebGLError?: () => void;
  onWebGLReady?: (handle: WebGLRendererHandle) => void;
}

export interface WebGLRendererHandle {
  getCanvas: () => HTMLCanvasElement | null;
  capture: (width?: number, height?: number) => Promise<string>;
}

/**
 * Compute pixel bounds for a smart object layer.
 */
function getSmartObjectBounds(
  layer: TemplateLayer,
  templateWidth: number,
  templateHeight: number
): { x: number; y: number; width: number; height: number } {
  if (layer.transformX != null && layer.transformY != null && 
      layer.transformScaleX != null && layer.transformScaleY != null) {
    const w = layer.transformScaleX * templateWidth;
    const h = layer.transformScaleY * templateHeight;
    const x = layer.transformX * templateWidth - w / 2;
    const y = layer.transformY * templateHeight - h / 2;
    return { x, y, width: w, height: h };
  }
  if (layer.boundsX != null && layer.boundsY != null && 
      layer.boundsWidth != null && layer.boundsHeight != null) {
    return { x: layer.boundsX, y: layer.boundsY, width: layer.boundsWidth, height: layer.boundsHeight };
  }
  if (layer.bounds && layer.bounds.width && layer.bounds.height) {
    return { x: layer.bounds.x || 0, y: layer.bounds.y || 0, width: layer.bounds.width, height: layer.bounds.height };
  }
  return { x: 0, y: 0, width: templateWidth, height: templateHeight };
}

/**
 * Get perspective transform corners for a smart object layer.
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

export const WebGLRenderer = forwardRef<WebGLRendererHandle, WebGLRendererProps>(({
  template,
  userImage,
  design,
  colorSelections,
  width,
  height,
  finish = 'matte',
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
  const [webGLError, setWebGLError] = useState(false);

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

    const getTexture = (url: string): Promise<THREE.Texture> => {
      if (texturesCache.current.has(url)) return Promise.resolve(texturesCache.current.get(url)!);
      return new Promise((resolve, reject) => {
        loader.load(
          url,
          (t) => {
            t.minFilter = THREE.LinearFilter;
            t.magFilter = THREE.LinearFilter;
            if (rendererRef.current) {
              t.anisotropy = rendererRef.current.capabilities.getMaxAnisotropy();
            }
            texturesCache.current.set(url, t);
            resolve(t);
          },
          undefined,
          (err) => {
            console.error("TextureLoader error:", url.substring(0, 60), err);
            reject(err);
          }
        );
      });
    };

    // 1. Base Layer (pre-rendered book photo with shadows/creases baked in)
    if (template.baseImage) {
      const texture = await getTexture(template.baseImage);
      const geometry = new THREE.PlaneGeometry(width, height);
      const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(width / 2, height / 2, 0);
      meshesRef.current.add(mesh);
    }

    // 2. Find the smart object layer
    const smartObjectLayer = template.layers.find(l => l.type === 'smart_object');
    if (smartObjectLayer && userImage) {
      const designTexture = await getTexture(userImage);
      
      // Get perspective data
      const perspective = getSmartObjectPerspective(smartObjectLayer, template);
      
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
          pos.setXY(i, pts[i].x * scaleX, height - pts[i].y * scaleY);
        }
        pos.needsUpdate = true;

        // Look for realism maps
        const shadowLayer = template.layers.find(l => l.compositeUrl && l.blendMode.toLowerCase().includes('multiply'));
        const highlightLayer = template.layers.find(l => l.compositeUrl && (l.blendMode.toLowerCase().includes('screen') || l.blendMode.toLowerCase().includes('linear dodge')));
        const shadowTexture = shadowLayer ? await getTexture(shadowLayer.compositeUrl!).catch(() => null) : null;
        const highlightTexture = highlightLayer ? await getTexture(highlightLayer.compositeUrl!).catch(() => null) : null;

        // Shader material with realism
        const material = new THREE.ShaderMaterial({
          uniforms: THREE.UniformsUtils.clone(RealismShader.uniforms),
          vertexShader: RealismShader.vertexShader,
          fragmentShader: RealismShader.fragmentShader,
          transparent: true,
          side: THREE.DoubleSide
        });

        material.uniforms.tDiffuse.value = designTexture;
        material.uniforms.tShadow.value = shadowTexture;
        material.uniforms.tHighlight.value = highlightTexture;
        
        const shadowBase = shadowLayer?.opacity || 0.8;
        const highlightBase = highlightLayer?.opacity || 0.5;

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
        // No perspective — draw flat within smart object bounds
        const bounds = getSmartObjectBounds(smartObjectLayer, template.width, template.height);
        
        const geometry = new THREE.PlaneGeometry(bounds.width * scaleX, bounds.height * scaleY);
        const material = new THREE.MeshBasicMaterial({ 
          map: designTexture, 
          transparent: true,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
          (bounds.x + bounds.width / 2) * scaleX,
          height - (bounds.y + bounds.height / 2) * scaleY,
          0.5
        );
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
    // This overlays the base image (which has baked-in shadows) with multiply blend
    // on top of the user design to add realistic creases and shadows
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

  }, [template, userImage, colorSelections, width, height, finish]);

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
