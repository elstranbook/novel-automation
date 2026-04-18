/**
 * Book Cover Warp Presets
 * 
 * Pre-configured warp settings for various book cover mockup views,
 * optimized for 5.5 x 8.5 standard novel dimensions.
 */

import type { BookCoverWarp, PerspectiveQuadMapping, QuadCorners } from '../canvas/mesh-warp';

// Standard novel dimensions (in inches)
export const NOVEL_DIMENSIONS = {
  standard: {
    width: 5.5,
    height: 8.5,
    spineWidthPaperback: 0.375, // ~200 pages
    spineWidthHardcover: 0.5,
  },
  trade: {
    width: 6,
    height: 9,
    spineWidthPaperback: 0.4,
    spineWidthHardcover: 0.6,
  },
  mass: {
    width: 4.25,
    height: 7,
    spineWidthPaperback: 0.3,
    spineWidthHardcover: 0.4,
  },
};

// DPI for print-quality exports
export const PRINT_DPI = 300;

/**
 * Calculate pixel dimensions from inches
 */
export function inchesToPixels(inches: number, dpi: number = PRINT_DPI): number {
  return Math.round(inches * dpi);
}

/**
 * Create a flat front cover transform (no perspective)
 */
export function flatFrontPreset(
  coverWidth: number,
  coverHeight: number
): BookCoverWarp {
  return {
    frontCover: {
      src: createRectQuad(0, 0, coverWidth, coverHeight),
      dst: createRectQuad(0, 0, coverWidth, coverHeight),
    },
  };
}

/**
 * Create an angled view with visible spine
 */
export function angledWithSpinePreset(
  coverWidth: number,
  coverHeight: number,
  spineWidth: number,
  angleDegrees: number = 30
): BookCoverWarp {
  const radians = (angleDegrees * Math.PI) / 180;
  const frontPerspective = Math.cos(radians);
  const spinePerspective = Math.sin(radians);
  
  const totalWidth = coverWidth * frontPerspective + spineWidth * spinePerspective;
  const offsetX = spineWidth * spinePerspective;
  
  return {
    frontCover: {
      src: createRectQuad(0, 0, coverWidth, coverHeight),
      dst: {
        topLeft: { x: offsetX, y: 0 },
        topRight: { x: offsetX + coverWidth * frontPerspective, y: 0 },
        bottomRight: { x: offsetX + coverWidth * frontPerspective, y: coverHeight },
        bottomLeft: { x: offsetX, y: coverHeight },
      },
    },
    spine: {
      centerX: 0,
      centerY: coverHeight / 2,
      radius: spineWidth * 2,
      angle: radians,
      direction: 'horizontal',
    },
  };
}

/**
 * Create a left-angled view with spine visible
 */
export function angledWithSpineLeftPreset(
  coverWidth: number,
  coverHeight: number,
  spineWidth: number,
  angleDegrees: number = 30
): BookCoverWarp {
  const radians = (angleDegrees * Math.PI) / 180;
  const frontPerspective = Math.cos(radians);
  const spinePerspective = Math.sin(radians);
  
  const offsetX = spineWidth * spinePerspective;
  
  return {
    frontCover: {
      src: createRectQuad(0, 0, coverWidth, coverHeight),
      dst: {
        topLeft: { x: spineWidth * spinePerspective, y: 0 },
        topRight: { x: spineWidth * spinePerspective + coverWidth * frontPerspective, y: 0 },
        bottomRight: { x: spineWidth * spinePerspective + coverWidth * frontPerspective, y: coverHeight },
        bottomLeft: { x: spineWidth * spinePerspective, y: coverHeight },
      },
    },
    spine: {
      centerX: spineWidth * spinePerspective,
      centerY: coverHeight / 2,
      radius: spineWidth * 2,
      angle: radians,
      direction: 'horizontal',
    },
  };
}

/**
 * Create a stacked books on table view
 */
export function stackedOnTablePreset(
  coverWidth: number,
  coverHeight: number,
  stackOffset: number = 20,
  bookCount: number = 3
): BookCoverWarp[] {
  const warps: BookCoverWarp[] = [];
  
  for (let i = 0; i < bookCount; i++) {
    const yOffset = i * stackOffset;
    const perspective = 0.95 - i * 0.02; // Slightly more angled books on top
    
    warps.push({
      frontCover: {
        src: createRectQuad(0, 0, coverWidth, coverHeight),
        dst: {
          topLeft: { x: 0, y: yOffset },
          topRight: { x: coverWidth * perspective, y: yOffset },
          bottomRight: { x: coverWidth * perspective, y: coverHeight + yOffset },
          bottomLeft: { x: 0, y: coverHeight + yOffset },
        },
      },
    });
  }
  
  return warps;
}

/**
 * Create an open book spread view
 */
export function openSpreadPreset(
  coverWidth: number,
  coverHeight: number,
  spineWidth: number,
  openAngle: number = 160 // degrees
): BookCoverWarp {
  const halfAngle = ((180 - openAngle / 2) * Math.PI) / 180;
  const perspective = Math.cos(halfAngle);
  
  // Left page (front cover reversed)
  const leftOffset = coverWidth * perspective;
  
  // Right page (back cover)
  const rightOffset = spineWidth;
  
  return {
    frontCover: {
      src: createRectQuad(0, 0, coverWidth, coverHeight),
      dst: {
        topLeft: { x: 0, y: 0 },
        topRight: { x: leftOffset, y: 0 },
        bottomRight: { x: leftOffset, y: coverHeight },
        bottomLeft: { x: 0, y: coverHeight },
      },
    },
    backCover: {
      src: createRectQuad(0, 0, coverWidth, coverHeight),
      dst: {
        topLeft: { x: rightOffset, y: 0 },
        topRight: { x: rightOffset + coverWidth * perspective, y: 0 },
        bottomRight: { x: rightOffset + coverWidth * perspective, y: coverHeight },
        bottomLeft: { x: rightOffset, y: coverHeight },
      },
    },
  };
}

/**
 * Create a bookshelf row view
 */
export function bookshelfPreset(
  coverWidth: number,
  coverHeight: number,
  spineWidth: number,
  bookIndex: number = 0,
  totalBooks: number = 5
): BookCoverWarp {
  // Vary the slight rotation for natural look
  const rotationVariation = Math.sin(bookIndex * 0.7) * 3; // degrees
  const radians = (rotationVariation * Math.PI) / 180;
  const perspective = Math.cos(radians);
  
  const xPosition = bookIndex * (spineWidth + 5);
  
  return {
    spine: {
      centerX: xPosition + spineWidth / 2,
      centerY: coverHeight / 2,
      radius: spineWidth,
      angle: Math.PI / 8,
      direction: 'horizontal',
    },
    frontCover: {
      src: createRectQuad(0, 0, coverWidth, coverHeight),
      dst: {
        topLeft: { x: xPosition, y: 0 },
        topRight: { x: xPosition + coverWidth * perspective, y: 0 },
        bottomRight: { x: xPosition + coverWidth * perspective, y: coverHeight },
        bottomLeft: { x: xPosition, y: coverHeight },
      },
    },
  };
}

/**
 * Create a hand-held book view
 */
export function handHeldPreset(
  coverWidth: number,
  coverHeight: number
): BookCoverWarp {
  // Slight angle as if held in hand
  const tiltAngle = 10; // degrees
  const radians = (tiltAngle * Math.PI) / 180;
  
  // Slight perspective
  const perspectiveTop = 0.92;
  const perspectiveBottom = 1.0;
  
  return {
    frontCover: {
      src: createRectQuad(0, 0, coverWidth, coverHeight),
      dst: {
        topLeft: { x: coverWidth * (1 - perspectiveTop) / 2, y: 0 },
        topRight: { x: coverWidth * perspectiveTop + coverWidth * (1 - perspectiveTop) / 2, y: 0 },
        bottomRight: { x: coverWidth * perspectiveBottom + coverWidth * (1 - perspectiveBottom) / 2, y: coverHeight },
        bottomLeft: { x: coverWidth * (1 - perspectiveBottom) / 2, y: coverHeight },
      },
    },
  };
}

/**
 * Create a floating book view with shadow
 */
export function floatingPreset(
  coverWidth: number,
  coverHeight: number,
  floatAngle: number = 15
): BookCoverWarp {
  const radians = (floatAngle * Math.PI) / 180;
  const perspective = Math.cos(radians);
  
  return {
    frontCover: {
      src: createRectQuad(0, 0, coverWidth, coverHeight),
      dst: {
        topLeft: { x: 0, y: 0 },
        topRight: { x: coverWidth * perspective, y: -10 },
        bottomRight: { x: coverWidth * perspective, y: coverHeight - 10 },
        bottomLeft: { x: 0, y: coverHeight },
      },
    },
  };
}

/**
 * Preset configurations for easy access
 */
export const BOOK_WARPS = {
  flatFront: {
    name: 'Flat Front Cover',
    description: 'Standard flat front view with no perspective',
    create: flatFrontPreset,
  },
  
  angledWithSpine: {
    name: 'Angled with Spine',
    description: '3D angled view showing front cover and spine',
    create: angledWithSpinePreset,
  },
  
  angledWithSpineLeft: {
    name: 'Angled with Spine (Left)',
    description: '3D angled view from the left showing spine',
    create: angledWithSpineLeftPreset,
  },
  
  stackedOnTable: {
    name: 'Stacked on Table',
    description: 'Multiple books stacked on a table surface',
    create: stackedOnTablePreset,
  },
  
  openSpread: {
    name: 'Open Book Spread',
    description: 'Book opened flat showing both pages',
    create: openSpreadPreset,
  },
  
  bookshelf: {
    name: 'Bookshelf Row',
    description: 'Books on a shelf showing spines',
    create: bookshelfPreset,
  },
  
  handHeld: {
    name: 'Hand Held',
    description: 'Book held in hand perspective',
    create: handHeldPreset,
  },
  
  floating: {
    name: 'Floating Book',
    description: 'Book floating with subtle angle',
    create: floatingPreset,
  },
};

/**
 * Helper function to create a rectangular quad
 */
function createRectQuad(x: number, y: number, width: number, height: number): QuadCorners {
  return {
    topLeft: { x, y },
    topRight: { x: x + width, y },
    bottomRight: { x: x + width, y: y + height },
    bottomLeft: { x, y: y + height },
  };
}

/**
 * Get warp preset by name
 */
export function getWarpPreset(name: keyof typeof BOOK_WARPS) {
  return BOOK_WARPS[name];
}

/**
 * Get all available warp preset names
 */
export function getWarpPresetNames(): string[] {
  return Object.keys(BOOK_WARPS);
}

/**
 * Calculate design placement bounds for a book cover
 */
export function calculateDesignBounds(
  coverWidth: number,
  coverHeight: number,
  warpPreset: keyof typeof BOOK_WARPS,
  margins: { top: number; right: number; bottom: number; left: number } = { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 }
): { x: number; y: number; width: number; height: number } {
  // Margins are in inches
  const designX = margins.left;
  const designY = margins.top;
  const designWidth = coverWidth - margins.left - margins.right;
  const designHeight = coverHeight - margins.top - margins.bottom;
  
  return {
    x: designX,
    y: designY,
    width: designWidth,
    height: designHeight,
  };
}

/**
 * Standard book cover design areas (in inches)
 */
export const DESIGN_AREAS = {
  fullCover: {
    name: 'Full Cover',
    margins: { top: 0.25, right: 0.25, bottom: 0.75, left: 0.25 },
  },
  centered: {
    name: 'Centered Design',
    margins: { top: 1.5, right: 0.75, bottom: 2, left: 0.75 },
  },
  topThird: {
    name: 'Top Third',
    margins: { top: 0.5, right: 0.5, bottom: 5.5, left: 0.5 },
  },
  bottomThird: {
    name: 'Bottom Third',
    margins: { top: 5.5, right: 0.5, bottom: 0.5, left: 0.5 },
  },
  spineOnly: {
    name: 'Spine Only',
    margins: { top: 0.5, right: 0, bottom: 0.5, left: 0 },
  },
};

/**
 * Export type for book template configuration
 */
export interface BookTemplateConfig {
  name: string;
  slug: string;
  description: string;
  dimensions: {
    width: number;
    height: number;
    spineWidth: number;
  };
  warpPreset: keyof typeof BOOK_WARPS;
  bookType: 'hardcover' | 'paperback' | 'dust_jacket';
  showPages: boolean;
  pageColor: string;
  showShadow: boolean;
}

/**
 * Default book template configurations
 */
export const DEFAULT_BOOK_TEMPLATES: BookTemplateConfig[] = [
  {
    name: 'Hardcover Novel - Angled View',
    slug: 'hardcover-novel-angled',
    description: 'Classic hardcover novel with visible spine, angled 3D view',
    dimensions: { width: 5.5, height: 8.5, spineWidth: 0.5 },
    warpPreset: 'angledWithSpine',
    bookType: 'hardcover',
    showPages: true,
    pageColor: '#FFFAF0',
    showShadow: true,
  },
  {
    name: 'Paperback Novel - Front View',
    slug: 'paperback-novel-front',
    description: 'Standard paperback novel, flat front cover view',
    dimensions: { width: 5.5, height: 8.5, spineWidth: 0.375 },
    warpPreset: 'flatFront',
    bookType: 'paperback',
    showPages: false,
    pageColor: '#FFFAF0',
    showShadow: true,
  },
  {
    name: 'Novel Stack - Table View',
    slug: 'novel-stack-table',
    description: 'Stack of novels on a table surface',
    dimensions: { width: 5.5, height: 8.5, spineWidth: 0.375 },
    warpPreset: 'stackedOnTable',
    bookType: 'paperback',
    showPages: true,
    pageColor: '#FFFAF0',
    showShadow: true,
  },
  {
    name: 'Open Book - Spread View',
    slug: 'open-book-spread',
    description: 'Book opened flat showing both pages',
    dimensions: { width: 5.5, height: 8.5, spineWidth: 0.375 },
    warpPreset: 'openSpread',
    bookType: 'paperback',
    showPages: false,
    pageColor: '#FFFAF0',
    showShadow: true,
  },
  {
    name: 'Bookshelf Row',
    slug: 'bookshelf-row',
    description: 'Books on a shelf showing spines',
    dimensions: { width: 5.5, height: 8.5, spineWidth: 0.375 },
    warpPreset: 'bookshelf',
    bookType: 'hardcover',
    showPages: false,
    pageColor: '#FFFAF0',
    showShadow: true,
  },
  {
    name: 'Hand Held Book',
    slug: 'hand-held-book',
    description: 'Book held in hand perspective',
    dimensions: { width: 5.5, height: 8.5, spineWidth: 0.375 },
    warpPreset: 'handHeld',
    bookType: 'paperback',
    showPages: false,
    pageColor: '#FFFAF0',
    showShadow: false,
  },
  {
    name: 'Floating Book',
    slug: 'floating-book',
    description: 'Book floating with subtle angle and shadow',
    dimensions: { width: 5.5, height: 8.5, spineWidth: 0.375 },
    warpPreset: 'floating',
    bookType: 'hardcover',
    showPages: false,
    pageColor: '#FFFAF0',
    showShadow: true,
  },
];
