// Transform and warp utilities for canvas rendering

export interface Transform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number; // in radians
}

export interface Point {
  x: number;
  y: number;
}

// Apply transform to canvas context
export function applyTransform(
  ctx: CanvasRenderingContext2D,
  transform: Transform,
  centerX: number,
  centerY: number
): void {
  ctx.translate(centerX, centerY);
  ctx.rotate(transform.rotation);
  ctx.scale(transform.scaleX, transform.scaleY);
  ctx.translate(-centerX, -centerY);
  ctx.translate(transform.x, transform.y);
}

// Convert degrees to radians
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Convert radians to degrees
export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

// Calculate bounding box after transform
export function getTransformedBounds(
  width: number,
  height: number,
  transform: Transform
): { x: number; y: number; width: number; height: number } {
  const corners = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ];
  
  const centerX = width / 2;
  const centerY = height / 2;
  
  const transformedCorners = corners.map(corner => {
    // Translate to center
    let x = corner.x - centerX;
    let y = corner.y - centerY;
    
    // Rotate
    const cos = Math.cos(transform.rotation);
    const sin = Math.sin(transform.rotation);
    const rx = x * cos - y * sin;
    const ry = x * sin + y * cos;
    
    // Scale
    const sx = rx * transform.scaleX;
    const sy = ry * transform.scaleY;
    
    // Translate back and apply position
    return {
      x: sx + centerX + transform.x,
      y: sy + centerY + transform.y,
    };
  });
  
  const xs = transformedCorners.map(p => p.x);
  const ys = transformedCorners.map(p => p.y);
  
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

// Check if a point is inside a transformed rectangle
export function isPointInTransformedRect(
  point: Point,
  rectWidth: number,
  rectHeight: number,
  transform: Transform
): boolean {
  const centerX = rectWidth / 2;
  const centerY = rectHeight / 2;
  
  // Inverse translate
  let x = point.x - transform.x - centerX;
  let y = point.y - transform.y - centerY;
  
  // Inverse rotate
  const cos = Math.cos(-transform.rotation);
  const sin = Math.sin(-transform.rotation);
  const rx = x * cos - y * sin;
  const ry = x * sin + y * cos;
  
  // Inverse scale
  const sx = rx / transform.scaleX;
  const sy = ry / transform.scaleY;
  
  // Check if in original rect
  return sx >= -centerX && sx <= centerX && sy >= -centerY && sy <= centerY;
}

// Constrain transform to bounds
export function constrainTransform(
  transform: Transform,
  canvasWidth: number,
  canvasHeight: number,
  designWidth: number,
  designHeight: number,
  padding: number = 20
): Transform {
  const bounds = getTransformedBounds(designWidth, designHeight, transform);
  
  let { x, y } = transform;
  
  // Constrain x
  if (bounds.x < padding) {
    x += padding - bounds.x;
  } else if (bounds.x + bounds.width > canvasWidth - padding) {
    x -= bounds.x + bounds.width - (canvasWidth - padding);
  }
  
  // Constrain y
  if (bounds.y < padding) {
    y += padding - bounds.y;
  } else if (bounds.y + bounds.height > canvasHeight - padding) {
    y -= bounds.y + bounds.height - (canvasHeight - padding);
  }
  
  return { ...transform, x, y };
}

// Get corner handles for transform UI
export function getTransformHandles(
  width: number,
  height: number,
  transform: Transform,
  handleSize: number = 8
): Array<{ position: Point; type: string; cursor: string }> {
  const centerX = width / 2;
  const centerY = height / 2;
  const cos = Math.cos(transform.rotation);
  const sin = Math.sin(transform.rotation);
  
  const corners = [
    { x: 0, y: 0, type: 'nw', cursor: 'nw-resize' },
    { x: width, y: 0, type: 'ne', cursor: 'ne-resize' },
    { x: width, y: height, type: 'se', cursor: 'se-resize' },
    { x: 0, y: height, type: 'sw', cursor: 'sw-resize' },
  ];
  
  return corners.map(corner => {
    // Apply transform
    let x = corner.x - centerX;
    let y = corner.y - centerY;
    
    const rx = x * cos - y * sin;
    const ry = x * sin + y * cos;
    
    return {
      position: {
        x: rx * transform.scaleX + centerX + transform.x,
        y: ry * transform.scaleY + centerY + transform.y,
      },
      type: corner.type,
      cursor: corner.cursor,
    };
  });
}

// Simple perspective warp (approximation using canvas transforms)
export function drawWithPerspective(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  srcX: number,
  srcY: number,
  srcWidth: number,
  srcHeight: number,
  dstPoints: [Point, Point, Point, Point] // top-left, top-right, bottom-right, bottom-left
): void {
  // This is a simplified perspective transform
  // For full perspective, we'd need WebGL or a library
  
  // Calculate bounding box
  const xs = dstPoints.map(p => p.x);
  const ys = dstPoints.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  // Draw with approximation (affine transform)
  const topLeft = dstPoints[0];
  const topRight = dstPoints[1];
  const bottomLeft = dstPoints[3];
  
  const scaleX = (topRight.x - topLeft.x) / srcWidth;
  const scaleY = (bottomLeft.y - topLeft.y) / srcHeight;
  const rotation = Math.atan2(topRight.y - topLeft.y, topRight.x - topLeft.x);
  
  ctx.save();
  ctx.translate(topLeft.x, topLeft.y);
  ctx.rotate(rotation);
  ctx.scale(scaleX, scaleY);
  ctx.drawImage(image, srcX, srcY, srcWidth, srcHeight, 0, 0, srcWidth, srcHeight);
  ctx.restore();
}
