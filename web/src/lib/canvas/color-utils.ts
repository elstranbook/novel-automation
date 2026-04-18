// Color utility functions

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

// Parse hex color to RGB
export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 255, g: 255, b: 255 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

// Convert RGB to hex
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Convert RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): HSL {
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
  
  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Convert HSL to RGB
export function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360;
  s /= 100;
  l /= 100;
  
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
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// Calculate relative luminance (for contrast calculations)
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Get contrasting text color (black or white)
export function getContrastColor(hexBg: string): string {
  const { r, g, b } = hexToRgb(hexBg);
  const luminance = getLuminance(r, g, b);
  return luminance > 0.179 ? '#000000' : '#FFFFFF';
}

// Lighten or darken a color
export function adjustBrightness(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const adjustment = Math.round(2.55 * percent);
  return rgbToHex(
    Math.max(0, Math.min(255, r + adjustment)),
    Math.max(0, Math.min(255, g + adjustment)),
    Math.max(0, Math.min(255, b + adjustment))
  );
}

// Generate a color palette from a base color
export function generatePalette(baseHex: string, steps: number = 5): string[] {
  const { r, g, b } = hexToRgb(baseHex);
  const { h, s, l } = rgbToHsl(r, g, b);
  
  const palette: string[] = [];
  const stepSize = 80 / (steps - 1); // Range from 10% to 90% lightness
  
  for (let i = 0; i < steps; i++) {
    const newL = 10 + stepSize * i;
    const rgb = hslToRgb(h, s, newL);
    palette.push(rgbToHex(rgb.r, rgb.g, rgb.b));
  }
  
  return palette;
}

// Predefined color swatches for mockups
export const predefinedColors = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#000000' },
  { name: 'Navy', hex: '#1B2838' },
  { name: 'Red', hex: '#E53935' },
  { name: 'Royal Blue', hex: '#1E88E5' },
  { name: 'Forest Green', hex: '#2E7D32' },
  { name: 'Purple', hex: '#7B1FA2' },
  { name: 'Orange', hex: '#F57C00' },
  { name: 'Yellow', hex: '#FDD835' },
  { name: 'Pink', hex: '#EC407A' },
  { name: 'Teal', hex: '#00897B' },
  { name: 'Gray', hex: '#757575' },
  { name: 'Light Gray', hex: '#BDBDBD' },
  { name: 'Maroon', hex: '#880E4F' },
  { name: 'Brown', hex: '#5D4037' },
  { name: 'Beige', hex: '#D7CCC8' },
];
