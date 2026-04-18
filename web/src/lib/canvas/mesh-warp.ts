/**
 * Mesh Warp Engine for Book Covers and Curved Surfaces
 * 
 * This module provides sophisticated mesh warping capabilities for:
 * - Perspective transforms for 3D book views
 * - Cylindrical warps for book spines
 * - Mesh-based deformation for complex surfaces
 */

export interface Point {
  x: number;
  y: number;
}

export interface QuadCorners {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
}

export interface MeshGrid {
  rows: number;
  cols: number;
  points: Point[][]; // Grid of control points
}

export interface PerspectiveQuadMapping {
  // Four corners defining the perspective warp
  src: QuadCorners;
  dst: QuadCorners;
}

export interface CylindricalWarp {
  // Cylindrical projection parameters
  centerX: number;
  centerY: number;
  radius: number;
  angle: number; // Total angle in radians
  direction: 'horizontal' | 'vertical';
}

export interface BookCoverWarp {
  frontCover?: PerspectiveQuadMapping;
  spine?: CylindricalWarp;
  backCover?: PerspectiveQuadMapping;
  pages?: CylindricalWarp;
}

/**
 * Apply a perspective transform to an image
 */
export function applyPerspectiveTransform(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | ImageData,
  srcQuad: QuadCorners,
  dstQuad: QuadCorners,
  subdivisions?: number
): void {
  // Get source and destination dimensions
  const srcWidth = image instanceof ImageData ? image.width : image.width;
  const srcHeight = image instanceof ImageData ? image.height : image.height;
  
  // Calculate destination bounding box
  const xs = [dstQuad.topLeft.x, dstQuad.topRight.x, dstQuad.bottomRight.x, dstQuad.bottomLeft.x];
  const ys = [dstQuad.topLeft.y, dstQuad.topRight.y, dstQuad.bottomRight.y, dstQuad.bottomLeft.y];
  
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  const dstWidth = Math.ceil(maxX - minX);
  const dstHeight = Math.ceil(maxY - minY);
  
  if (dstWidth <= 0 || dstHeight <= 0) return;
  
  // Create temporary canvas for the source image
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = srcWidth;
  tempCanvas.height = srcHeight;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;
  
  if (image instanceof ImageData) {
    tempCtx.putImageData(image, 0, 0);
  } else {
    tempCtx.drawImage(image, 0, 0);
  }
  
  // Use canvas 2D approximation (for full perspective, WebGL would be needed)
  drawQuad(ctx, tempCanvas, dstQuad, srcQuad, subdivisions);
}

/**
 * Draw a quad with perspective approximation using triangle strips
 */
function drawQuad(
  ctx: CanvasRenderingContext2D,
  image: HTMLCanvasElement,
  dst: QuadCorners,
  _src: QuadCorners,
  subdivisions: number = 12
): void {
  const { topLeft, topRight, bottomRight, bottomLeft } = dst;
  
  const imgW = image.width;
  const imgH = image.height;
  const invSub = 1 / subdivisions;
  
  for (let i = 0; i < subdivisions; i++) {
    const u0 = i * invSub;
    const u1 = (i + 1) * invSub;
    
    // Pre-calculate horizontal interpolations
    const t0x = topLeft.x + (topRight.x - topLeft.x) * u0;
    const t0y = topLeft.y + (topRight.y - topLeft.y) * u0;
    const t1x = topLeft.x + (topRight.x - topLeft.x) * u1;
    const t1y = topLeft.y + (topRight.y - topLeft.y) * u1;
    
    const b0x = bottomLeft.x + (bottomRight.x - bottomLeft.x) * u0;
    const b0y = bottomLeft.y + (bottomRight.y - bottomLeft.y) * u0;
    const b1x = bottomLeft.x + (bottomRight.x - bottomLeft.x) * u1;
    const b1y = bottomLeft.y + (bottomRight.y - bottomLeft.y) * u1;

    for (let j = 0; j < subdivisions; j++) {
      const v0 = j * invSub;
      const v1 = (j + 1) * invSub;
      
      // Interpolate destination points (bilinear)
      const p00_x = t0x + (b0x - t0x) * v0;
      const p00_y = t0y + (b0y - t0y) * v0;
      
      const p10_x = t1x + (b1x - t1x) * v0;
      const p10_y = t1y + (b1y - t1y) * v0;
      
      const p01_x = t0x + (b0x - t0x) * v1;
      const p01_y = t0y + (b0y - t0y) * v1;
      
      const p11_x = t1x + (b1x - t1x) * v1;
      const p11_y = t1y + (b1y - t1y) * v1;
      
      // Source texture coordinates
      const sx = u0 * imgW;
      const sy = v0 * imgH;
      const sw = (u1 - u0) * imgW;
      const sh = (v1 - v0) * imgH;
      
      // Draw Triangle 1 (p00, p10, p01)
      drawAffineTriangle(ctx, image, 
        sx, sy, sx + sw, sy, sx, sy + sh,
        p00_x, p00_y, p10_x, p10_y, p01_x, p01_y
      );
      
      // Draw Triangle 2 (p10, p11, p01)
      drawAffineTriangle(ctx, image,
        sx + sw, sy, sx + sw, sy + sh, sx, sy + sh,
        p10_x, p10_y, p11_x, p11_y, p01_x, p01_y
      );
    }
  }
}

/**
 * Fast affine triangle drawing without save/restore overhead where possible
 */
function drawAffineTriangle(
  ctx: CanvasRenderingContext2D,
  image: HTMLCanvasElement,
  sx0: number, sy0: number, sx1: number, sy1: number, sx2: number, sy2: number,
  dx0: number, dy0: number, dx1: number, dy1: number, dx2: number, dy2: number
): void {
  // Solve for affine transform: [dx, dy, 1] = [m11, m12, tx; m21, m22, ty; 0, 0, 1] * [sx, sy, 1]
  const denom = (sx0 * (sy1 - sy2) - sy0 * (sx1 - sx2) + (sx1 * sy2 - sx2 * sy1));
  if (Math.abs(denom) < 0.0001) return;
  
  const m11 = (dx0 * (sy1 - sy2) + dx1 * (sy2 - sy0) + dx2 * (sy0 - sy1)) / denom;
  const m12 = (dx0 * (sx2 - sx1) + dx1 * (sx0 - sx2) + dx2 * (sx1 - sx0)) / denom;
  const dx = (dx0 * (sx1 * sy2 - sx2 * sy1) + dx1 * (sx2 * sy0 - sx0 * sy2) + dx2 * (sx0 * sy1 - sx1 * sy0)) / denom;
  
  const m21 = (dy0 * (sy1 - sy2) + dy1 * (sy2 - sy0) + dy2 * (sy0 - sy1)) / denom;
  const m22 = (dy0 * (sx2 - sx1) + dy1 * (sx0 - sx2) + dy2 * (sx1 - sx0)) / denom;
  const dy = (dy0 * (sx1 * sy2 - sx2 * sy1) + dy1 * (sx2 * sy0 - sx0 * sy2) + dy2 * (sx0 * sy1 - sx1 * sy0)) / denom;
  
  ctx.save();
  ctx.beginPath();
  // We use clipping to only draw the triangle
  ctx.moveTo(dx0, dy0);
  ctx.lineTo(dx1, dy1);
  ctx.lineTo(dx2, dy2);
  ctx.closePath();
  ctx.clip();
  
  // Apply transform and draw
  ctx.setTransform(m11, m21, m12, m22, dx, dy);
  ctx.drawImage(image, 0, 0);
  ctx.restore();
}

/**
 * Interpolate a point within a quad
 */
function interpolateQuad(quad: QuadCorners, u: number, v: number): Point {
  const { topLeft, topRight, bottomRight, bottomLeft } = quad;
  
  // Bilinear interpolation
  const top = {
    x: topLeft.x + (topRight.x - topLeft.x) * u,
    y: topLeft.y + (topRight.y - topLeft.y) * u,
  };
  
  const bottom = {
    x: bottomLeft.x + (bottomRight.x - bottomLeft.x) * u,
    y: bottomLeft.y + (bottomRight.y - bottomLeft.y) * u,
  };
  
  return {
    x: top.x + (bottom.x - top.x) * v,
    y: top.y + (bottom.y - top.y) * v,
  };
}

/**
 * Apply cylindrical warp for book spines
 */
export function applyCylindricalWarp(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | ImageData,
  params: CylindricalWarp
): void {
  const srcWidth = image instanceof ImageData ? image.width : image.width;
  const srcHeight = image instanceof ImageData ? image.height : image.height;
  
  // Create temporary canvas if needed to get image data
  let srcData: Uint8ClampedArray;
  if (image instanceof ImageData) {
    srcData = image.data;
  } else {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = srcWidth;
    tempCanvas.height = srcHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    tempCtx.drawImage(image, 0, 0);
    srcData = tempCtx.getImageData(0, 0, srcWidth, srcHeight).data;
  }
  
  const srcPixels = new Uint32Array(srcData.buffer);
  
  // Apply cylindrical projection
  const outputWidth = Math.ceil(params.radius * Math.abs(params.angle));
  const outputHeight = srcHeight;
  
  if (outputWidth <= 0 || outputHeight <= 0) return;
  
  const dstImageData = ctx.createImageData(outputWidth, outputHeight);
  const dstPixels = new Uint32Array(dstImageData.data.buffer);
  
  // Pre-calculate constants
  const halfOutputWidth = outputWidth / 2;
  const invOutputWidth = 1 / outputWidth;
  const radius = params.radius;
  const angle = params.angle;
  const invTwoRadius = 1 / (2 * radius);
  
  for (let x = 0; x < outputWidth; x++) {
    // Calculate angle for this x position
    const theta = (x * invOutputWidth - 0.5) * angle;
    
    // Project onto cylinder
    const srcX = Math.floor(((Math.sin(theta) * radius + radius) * invTwoRadius) * srcWidth);
    
    if (srcX >= 0 && srcX < srcWidth) {
      for (let y = 0; y < outputHeight; y++) {
        dstPixels[y * outputWidth + x] = srcPixels[y * srcWidth + srcX];
      }
    }
  }
  
  // Create a temporary canvas to draw the warped image data with transparency support
  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = outputWidth;
  resultCanvas.height = outputHeight;
  resultCanvas.getContext('2d')?.putImageData(dstImageData, 0, 0);
  
  ctx.drawImage(
    resultCanvas, 
    Math.round(params.centerX - outputWidth / 2), 
    Math.round(params.centerY - outputHeight / 2)
  );
}

/**
 * Apply mesh-based warp using control points
 */
export function applyMeshWarp(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | ImageData,
  srcGrid: MeshGrid,
  dstGrid: MeshGrid
): void {
  if (srcGrid.rows !== dstGrid.rows || srcGrid.cols !== dstGrid.cols) {
    throw new Error('Source and destination grids must have the same dimensions');
  }
  
  const { rows, cols } = srcGrid;
  
  // Use a small number of subdivisions within each mesh cell because the mesh itself
  // already provides the necessary granularity for the warp.
  const cellSubdivisions = 1; 
  
  // Process each cell in the mesh
  for (let i = 0; i < rows - 1; i++) {
    for (let j = 0; j < cols - 1; j++) {
      // Get source quad
      const srcQuad: QuadCorners = {
        topLeft: srcGrid.points[i][j],
        topRight: srcGrid.points[i][j + 1],
        bottomRight: srcGrid.points[i + 1][j + 1],
        bottomLeft: srcGrid.points[i + 1][j],
      };
      
      // Get destination quad
      const dstQuad: QuadCorners = {
        topLeft: dstGrid.points[i][j],
        topRight: dstGrid.points[i][j + 1],
        bottomRight: dstGrid.points[i + 1][j + 1],
        bottomLeft: dstGrid.points[i + 1][j],
      };
      
      // Apply transform for this cell
      applyPerspectiveTransform(ctx, image, srcQuad, dstQuad, cellSubdivisions);
    }
  }
}

/**
 * Create a uniform mesh grid
 */
export function createUniformGrid(
  width: number,
  height: number,
  rows: number,
  cols: number
): MeshGrid {
  const points: Point[][] = [];
  const cellWidth = width / (cols - 1);
  const cellHeight = height / (rows - 1);
  
  for (let i = 0; i < rows; i++) {
    const row: Point[] = [];
    for (let j = 0; j < cols; j++) {
      row.push({
        x: j * cellWidth,
        y: i * cellHeight,
      });
    }
    points.push(row);
  }
  
  return { rows, cols, points };
}

/**
 * Create a perspective-distorted mesh grid
 */
export function createPerspectiveGrid(
  width: number,
  height: number,
  rows: number,
  cols: number,
  corners: QuadCorners
): MeshGrid {
  const points: Point[][] = [];
  
  for (let i = 0; i < rows; i++) {
    const row: Point[] = [];
    const v = i / (rows - 1);
    
    for (let j = 0; j < cols; j++) {
      const u = j / (cols - 1);
      
      // Interpolate within the distorted quad
      const point = interpolateQuad(corners, u, v);
      row.push(point);
    }
    points.push(row);
  }
  
  return { rows, cols, points };
}

/**
 * Create a cylindrical mesh grid for book spines
 */
export function createCylindricalGrid(
  width: number,
  height: number,
  rows: number,
  cols: number,
  radius: number,
  angle: number,
  offsetX: number = 0,
  offsetY: number = 0
): MeshGrid {
  const points: Point[][] = [];
  
  for (let i = 0; i < rows; i++) {
    const row: Point[] = [];
    const v = i / (rows - 1);
    const y = v * height + offsetY;
    
    for (let j = 0; j < cols; j++) {
      const u = j / (cols - 1);
      const theta = (u - 0.5) * angle;
      
      // Project onto cylinder
      const x = Math.sin(theta) * radius + offsetX;
      const z = Math.cos(theta) * radius; // Depth (used for shading)
      
      row.push({ x, y });
    }
    points.push(row);
  }
  
  return { rows, cols, points };
}

/**
 * Calculate perspective transform for book cover at an angle
 */
export function calculateBookPerspective(
  coverWidth: number,
  coverHeight: number,
  viewAngle: number = 30, // degrees
  viewDirection: 'right' | 'right' = 'right'
): PerspectiveQuadMapping {
  const radians = (viewAngle * Math.PI) / 180;
  const perspectiveScale = Math.cos(radians);
  
  // Converge the far side to create a true 3D perspective effect
  const convergence = Math.sin(radians) * 0.1 * coverHeight;
  
  // Source is the flat cover
  const src: QuadCorners = {
    topLeft: { x: 0, y: 0 },
    topRight: { x: coverWidth, y: 0 },
    bottomRight: { x: coverWidth, y: coverHeight },
    bottomLeft: { x: 0, y: coverHeight },
  };
  
  // Destination is the angled view
  let dst: QuadCorners;
  
  if (viewDirection === 'right') {
    // Front cover is angled to the right, so right side is "further"
    dst = {
      topLeft: { x: 0, y: 0 },
      topRight: { x: coverWidth * perspectiveScale, y: convergence },
      bottomRight: { x: coverWidth * perspectiveScale, y: coverHeight - convergence },
      bottomLeft: { x: 0, y: coverHeight },
    };
  } else {
    // Front cover is angled to the left, so left side is "further"
    const offsetX = coverWidth * (1 - perspectiveScale);
    dst = {
      topLeft: { x: offsetX, y: convergence },
      topRight: { x: coverWidth, y: 0 },
      bottomRight: { x: coverWidth, y: coverHeight },
      bottomLeft: { x: offsetX, y: coverHeight - convergence },
    };
  }
  
  return { src, dst };
}

/**
 * Calculate complete book cover warp for 3D view with spine
 */
export function calculateBookWarp(
  coverWidth: number,
  coverHeight: number,
  spineWidth: number,
  viewAngle: number = 30,
  includeBackCover: boolean = false
): BookCoverWarp {
  const radians = (viewAngle * Math.PI) / 180;
  const frontPerspective = Math.cos(radians);
  const spinePerspective = Math.sin(radians);
  
  // Converge the far side
  const convergence = Math.sin(radians) * 0.08 * coverHeight;
  
  const result: BookCoverWarp = {};
  
  // Front cover perspective (angled away)
  const offsetX = spineWidth * spinePerspective;
  
  result.frontCover = {
    src: {
      topLeft: { x: 0, y: 0 },
      topRight: { x: coverWidth, y: 0 },
      bottomRight: { x: coverWidth, y: coverHeight },
      bottomLeft: { x: 0, y: coverHeight },
    },
    dst: {
      topLeft: { x: offsetX, y: 0 },
      topRight: { x: offsetX + coverWidth * frontPerspective, y: convergence },
      bottomRight: { x: offsetX + coverWidth * frontPerspective, y: coverHeight - convergence },
      bottomLeft: { x: offsetX, y: coverHeight },
    },
  };
  
  // Spine perspective (angled towards viewer)
  result.spine = {
    centerX: offsetX / 2,
    centerY: coverHeight / 2,
    radius: spineWidth,
    angle: radians,
    direction: 'horizontal',
  };
  
  return result;
}

/**
 * Warp an image to fit a book cover
 */
export function warpToBookCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | ImageData,
  warp: BookCoverWarp,
  options: {
    drawSpine?: boolean;
    drawPages?: boolean;
    spineImage?: HTMLImageElement | ImageData | null;
    pagesColor?: string;
  } = {}
): void {
  // Draw front cover
  if (warp.frontCover) {
    applyPerspectiveTransform(ctx, image, warp.frontCover.src, warp.frontCover.dst);
  }
  
  // Draw spine
  if (options.drawSpine && warp.spine && options.spineImage) {
    applyCylindricalWarp(ctx, options.spineImage, warp.spine);
  }
  
  // Draw pages edge
  if (options.drawPages && warp.pages && options.pagesColor) {
    const pagesCanvas = document.createElement('canvas');
    pagesCanvas.width = 50;
    pagesCanvas.height = image instanceof ImageData ? image.height : image.height;
    const pagesCtx = pagesCanvas.getContext('2d');
    if (pagesCtx) {
      pagesCtx.fillStyle = options.pagesColor;
      pagesCtx.fillRect(0, 0, pagesCanvas.width, pagesCanvas.height);
      applyCylindricalWarp(ctx, pagesCanvas, warp.pages);
    }
  }
}
