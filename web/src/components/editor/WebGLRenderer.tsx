'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import * as THREE from 'three';
import type { Template, DesignState, TemplateLayer } from '@/types';

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

      // 1. Start with the user design
      vec3 color = design.rgb;

      // 2. Apply Multiply Blend (Shadows)
      // Math: Result = Design * Shadow
      vec3 multiply = color * shadow.rgb;
      color = mix(color, multiply, shadowOpacity * shadow.a);

      // 3. Apply Screen/Linear Dodge Blend (Highlights)
      // Math: Result = 1 - (1-Design) * (1-Highlight)
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
}

export interface WebGLRendererHandle {
  getCanvas: () => HTMLCanvasElement | null;
  capture: (width?: number, height?: number) => Promise<string>;
}

export const WebGLRenderer = forwardRef<WebGLRendererHandle, WebGLRendererProps>(({
  template,
  userImage,
  design,
  colorSelections,
  width,
  height,
  finish = 'matte',
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const textureLoaderRef = useRef<THREE.TextureLoader | null>(null);
  
  const texturesCache = useRef<Map<string, THREE.Texture>>(new Map());
  const meshesRef = useRef<THREE.Group>(new THREE.Group());

  useEffect(() => {
    if (!containerRef.current) return;

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

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.add(meshesRef.current);

    const camera = new THREE.OrthographicCamera(0, width, 0, height, 0.1, 1000);
    camera.position.z = 10;
    cameraRef.current = camera;
textureLoaderRef.current = new THREE.TextureLoader();

// Interaction State for Parallax
const mouse = new THREE.Vector2();
const targetRotation = new THREE.Vector2();

const onPointerMove = (event: PointerEvent) => {
  // Normalize mouse coords (-1 to 1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Target rotation (subtle: max 5 degrees)
  targetRotation.x = mouse.y * 0.05;
  targetRotation.y = mouse.x * 0.05;
};

window.addEventListener('pointermove', onPointerMove);

// Animation loop
let animationId: number;
const animate = () => {
  animationId = requestAnimationFrame(animate);
  if (rendererRef.current && sceneRef.current && cameraRef.current) {
    // Smoothly interpolate rotation for "organic" feel
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
        if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
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

    // Clear
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
        loader.load(url, (t) => {
          t.minFilter = THREE.LinearFilter;
          t.magFilter = THREE.LinearFilter;
          // Enable Anisotropy for sharp angles (Realism Anchor #3)
          if (rendererRef.current) {
            t.anisotropy = rendererRef.current.capabilities.getMaxAnisotropy();
          }
          texturesCache.current.set(url, t);
          resolve(t);
        }, undefined, reject);
      });
    };

    // 1. Base Layer
    if (template.baseImage) {
      const texture = await getTexture(template.baseImage);
      const geometry = new THREE.PlaneGeometry(width, height);
      const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(width / 2, height / 2, 0);
      meshesRef.current.add(mesh);
    }

    // 2. Integrated Smart Object Layer
    const smartObjectLayer = template.layers.find(l => l.type === 'smart_object');
    if (smartObjectLayer && userImage) {
      const designTexture = await getTexture(userImage);
      
      // Look for realism maps (extracted shadow/highlight layers from the same area)
      const shadowLayer = template.layers.find(l => l.compositeUrl && l.blendMode.toLowerCase().includes('multiply'));
      const highlightLayer = template.layers.find(l => l.compositeUrl && (l.blendMode.toLowerCase().includes('screen') || l.blendMode.toLowerCase().includes('linear dodge')));

      const shadowTexture = shadowLayer ? await getTexture(shadowLayer.compositeUrl!) : null;
      const highlightTexture = highlightLayer ? await getTexture(highlightLayer.compositeUrl!) : null;

      // GEOMETRY (Realism Anchor #1: 16-Point Mesh)
      let geometry;
      let pts: any[] = [];

      if (smartObjectLayer.perspectiveTransform) {
        // We simulate a 4x4 grid even for 4-point transforms for consistency
        const corners = smartObjectLayer.perspectiveTransform.corners;
        geometry = new THREE.PlaneGeometry(1, 1, 3, 3); // 4x4 grid of vertices
        // Interpolate grid points based on 4 corners
        for (let y = 0; j <= 3; j++) {
          for (let i = 0; i <= 3; i++) {
            const u = i / 3;
            const v = j / 3;
            // Bilinear interpolation
            const x = (1-u)*(1-v)*corners[0].x + u*(1-v)*corners[1].x + u*v*corners[2].x + (1-u)*v*corners[3].x;
            const y_coord = (1-u)*(1-v)*corners[0].y + u*(1-v)*corners[1].y + u*v*corners[2].y + (1-u)*v*corners[3].y;
            pts.push({ x, y: y_coord });
          }
        }
      } else if (smartObjectLayer.warpData) {
        const warp = typeof smartObjectLayer.warpData === 'string' ? JSON.parse(smartObjectLayer.warpData) : smartObjectLayer.warpData;
        if (warp.controlPoints && warp.controlPoints.length === 16) {
          geometry = new THREE.PlaneGeometry(1, 1, 3, 3);
          pts = warp.controlPoints;
        }
      }

      if (geometry && pts.length === 16) {
        const pos = geometry.attributes.position;
        // Map 16 vertices to 16 control points
        for (let i = 0; i < 16; i++) {
          pos.setXY(i, pts[i].x * scaleX, height - pts[i].y * scaleY);
        }
        pos.needsUpdate = true;

        // MATERIAL (Realism Anchor #2: Ink-on-Paper Shader)
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
        
        // Dynamic Finish Logic (Phase 4 Polish)
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
      }
    }

    // 3. Independent Realism Layers (those not handled by shader)
    template.layers.forEach((layer, i) => {
      if (layer.compositeUrl && layer.type !== 'smart_object') {
        // Skip if already used in the integrated shader
        const isAlreadyProcessed = (layer.blendMode.toLowerCase().includes('multiply') || layer.blendMode.toLowerCase().includes('screen'));
        if (isAlreadyProcessed && template.layers.some(l => l.type === 'smart_object')) return;

        // Draw standard realism layer
        // ... (standard logic)
      }
    });

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
      
      // 1. Scale up for High-Res
      renderer.setSize(capWidth, capHeight, false);
      camera.right = capWidth;
      camera.bottom = capHeight;
      camera.updateProjectionMatrix();

      // 2. Re-render at new resolution
      // We must wait for a frame or ensure scene is updated
      renderer.render(sceneRef.current, camera);
      const dataUrl = renderer.domElement.toDataURL('image/png', 1.0);
      
      // 3. Restore original resolution
      renderer.setSize(originalSize.x, originalSize.y, false);
      camera.right = width;
      camera.bottom = height;
      camera.updateProjectionMatrix();
      
      return dataUrl;
    }
  }));

  return <div ref={containerRef} className="w-full h-full" style={{ overflow: 'hidden' }} />;
});

WebGLRenderer.displayName = 'WebGLRenderer';
