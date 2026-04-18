// Blend mode implementations for canvas rendering

export type BlendModeKey = 'normal' | 'multiply' | 'screen' | 'overlay' | 'color' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'luminosity';

// Map our blend mode names to Canvas globalCompositeOperation
export const canvasBlendModes: Record<BlendModeKey, GlobalCompositeOperation> = {
  normal: 'source-over',
  multiply: 'multiply',
  screen: 'screen',
  overlay: 'overlay',
  color: 'source-over', // Custom implementation needed
  darken: 'darken',
  lighten: 'lighten',
  'color-dodge': 'color-dodge',
  'color-burn': 'color-burn',
  'hard-light': 'hard-light',
  'soft-light': 'soft-light',
  difference: 'difference',
  exclusion: 'exclusion',
  hue: 'source-over', // Custom implementation needed
  saturation: 'source-over', // Custom implementation needed
  luminosity: 'source-over', // Custom implementation needed
};

// Custom color blend mode that preserves luminosity
export function applyColorBlend(
  ctx: CanvasRenderingContext2D,
  sourceCanvas: HTMLCanvasElement,
  colorHex: string,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  // Get the source image data
  const sourceCtx = sourceCanvas.getContext('2d');
  if (!sourceCtx) return;
  
  const sourceData = sourceCtx.getImageData(0, 0, width, height);
  const pixels = sourceData.data;
  
  // Parse the color
  const r = parseInt(colorHex.slice(1, 3), 16);
  const g = parseInt(colorHex.slice(3, 5), 16);
  const b = parseInt(colorHex.slice(5, 7), 16);
  
  // Apply color blend - preserve luminosity from source
  for (let i = 0; i < pixels.length; i += 4) {
    const sr = pixels[i];
    const sg = pixels[i + 1];
    const sb = pixels[i + 2];
    const sa = pixels[i + 3];
    
    if (sa === 0) continue; // Skip transparent pixels
    
    // Calculate luminosity from source
    const luminosity = 0.2126 * sr + 0.7152 * sg + 0.0722 * sb;
    
    // Apply color with preserved luminosity
    const lr = luminosity / 255;
    
    // Blend the color with the luminosity
    pixels[i] = Math.round(r * lr);
    pixels[i + 1] = Math.round(g * lr);
    pixels[i + 2] = Math.round(b * lr);
    // Keep the alpha channel
  }
  
  // Create a temporary canvas for the result
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;
  
  tempCtx.putImageData(sourceData, 0, 0);
  
  // Draw the result onto the main canvas
  ctx.drawImage(tempCanvas, x, y);
}

// HSL to RGB conversion
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// RGB to HSL conversion
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  return [h, s, l];
}

// Hex to RGB
export function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

// RGB to Hex
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}
