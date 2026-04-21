/**
 * Seed Script: Book Mockup Templates
 *
 * Populates the database with book mockup templates that have proper layers,
 * warp data, perspective data, and base images. Idempotent — safe to run
 * multiple times (skips templates whose slug already exists).
 *
 * Usage:
 *   npx tsx prisma/seed-templates.ts
 *   npm run seed:templates
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PerspectiveCorners {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
}

interface WarpControlPoint {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
}

interface TemplateSeedDef {
  name: string;
  slug: string;
  description: string;
  category: string;
  baseImage: string;
  width: number;
  height: number;
  coverWidth: number;
  coverHeight: number;
  spineWidth: number;
  warpPreset: string;
  showPages: boolean;
  showShadow: boolean;
  perspectiveData: PerspectiveCorners;
  warpGridSize: { rows: number; cols: number };
}

// ---------------------------------------------------------------------------
// Perspective data per warp preset (pixel-space, based on print-DPI canvas)
// ---------------------------------------------------------------------------

const PERSPECTIVE_DATA: Record<string, PerspectiveCorners> = {
  flatFront: {
    topLeft: { x: 100, y: 100 },
    topRight: { x: 1550, y: 100 },
    bottomRight: { x: 1550, y: 2450 },
    bottomLeft: { x: 100, y: 2450 },
  },
  angledWithSpine: {
    topLeft: { x: 350, y: 50 },
    topRight: { x: 1700, y: 50 },
    bottomRight: { x: 1700, y: 2500 },
    bottomLeft: { x: 350, y: 2500 },
  },
  handHeld: {
    topLeft: { x: 120, y: 50 },
    topRight: { x: 1580, y: 80 },
    bottomRight: { x: 1560, y: 2480 },
    bottomLeft: { x: 140, y: 2450 },
  },
  stackedOnTable: {
    topLeft: { x: 100, y: 100 },
    topRight: { x: 1550, y: 100 },
    bottomRight: { x: 1550, y: 2450 },
    bottomLeft: { x: 100, y: 2450 },
  },
  openSpread: {
    topLeft: { x: 50, y: 100 },
    topRight: { x: 1450, y: 100 },
    bottomRight: { x: 1450, y: 2450 },
    bottomLeft: { x: 50, y: 2450 },
  },
  bookshelf: {
    topLeft: { x: 10, y: 50 },
    topRight: { x: 390, y: 50 },
    bottomRight: { x: 390, y: 2500 },
    bottomLeft: { x: 10, y: 2500 },
  },
};

// ---------------------------------------------------------------------------
// Generate warp mesh control-points from perspective corners
//
// The warp mesh is an 8×8 grid whose control-points start at the perspective
// corners and are bilinearly interpolated across the grid.  This gives the
// renderer enough data to reconstruct a smooth warp without needing the
// runtime book-warps module.
// ---------------------------------------------------------------------------

function generateWarpControlPoints(
  corners: PerspectiveCorners,
  gridSize: { rows: number; cols: number },
): WarpControlPoint[] {
  const { rows, cols } = gridSize;
  const points: WarpControlPoint[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const u = c / (cols - 1);
      const v = r / (rows - 1);

      // Bilinear interpolation across the corners
      const topX = corners.topLeft.x + (corners.topRight.x - corners.topLeft.x) * u;
      const topY = corners.topLeft.y + (corners.topRight.y - corners.topLeft.y) * u;
      const botX = corners.bottomLeft.x + (corners.bottomRight.x - corners.bottomLeft.x) * u;
      const botY = corners.bottomLeft.y + (corners.bottomRight.y - corners.bottomLeft.y) * u;

      const dstX = topX + (botX - topX) * v;
      const dstY = topY + (botY - topY) * v;

      // Source coordinates (normalised grid position mapped to a 1650×2550 cover)
      const srcX = u * 1650;
      const srcY = v * 2550;

      points.push({
        x: srcX,
        y: srcY,
        offsetX: dstX - srcX,
        offsetY: dstY - srcY,
      });
    }
  }

  return points;
}

// ---------------------------------------------------------------------------
// Template definitions
// ---------------------------------------------------------------------------

const BOOK_TEMPLATES: TemplateSeedDef[] = [
  {
    name: 'Hardcover Angled',
    slug: 'hardcover-novel-angled',
    description:
      'Classic hardcover novel with visible spine, 3D angled view. Perfect for showcasing book cover designs for 5.5 x 8.5 inch hardcover books.',
    category: 'novel',
    baseImage: '/templates/books/hardcover-angled.png',
    width: 2000,
    height: 2550,
    coverWidth: 5.5,
    coverHeight: 8.5,
    spineWidth: 0.5,
    warpPreset: 'angledWithSpine',
    showPages: true,
    showShadow: true,
    perspectiveData: PERSPECTIVE_DATA.angledWithSpine,
    warpGridSize: { rows: 8, cols: 8 },
  },
  {
    name: 'Paperback Front',
    slug: 'paperback-novel-front',
    description:
      'Standard paperback novel, flat front cover view. Perfect for showcasing book cover designs for 5.5 x 8.5 inch paperback books.',
    category: 'novel',
    baseImage: '/templates/books/paperback-front.png',
    width: 1650,
    height: 2550,
    coverWidth: 5.5,
    coverHeight: 8.5,
    spineWidth: 0.375,
    warpPreset: 'flatFront',
    showPages: false,
    showShadow: true,
    perspectiveData: PERSPECTIVE_DATA.flatFront,
    warpGridSize: { rows: 8, cols: 8 },
  },
  {
    name: 'Stacked on Table',
    slug: 'novel-stack-table',
    description:
      'Stack of novels on a wooden table surface. Perfect for showcasing multiple book designs or creating lifestyle imagery.',
    category: 'novel',
    baseImage: '/templates/books/stacked-table.png',
    width: 1650,
    height: 2550,
    coverWidth: 5.5,
    coverHeight: 8.5,
    spineWidth: 0.375,
    warpPreset: 'stackedOnTable',
    showPages: true,
    showShadow: true,
    perspectiveData: PERSPECTIVE_DATA.stackedOnTable,
    warpGridSize: { rows: 8, cols: 8 },
  },
  {
    name: 'Open Spread',
    slug: 'open-book-spread',
    description:
      'Book opened flat showing both pages. Perfect for displaying interior page designs or creating reading lifestyle imagery.',
    category: 'novel',
    baseImage: '/templates/books/open-spread.png',
    width: 3000,
    height: 2550,
    coverWidth: 5.5,
    coverHeight: 8.5,
    spineWidth: 0.375,
    warpPreset: 'openSpread',
    showPages: false,
    showShadow: true,
    perspectiveData: PERSPECTIVE_DATA.openSpread,
    warpGridSize: { rows: 8, cols: 8 },
  },
  {
    name: 'Bookshelf Row',
    slug: 'bookshelf-row',
    description:
      'Books on a wooden shelf showing spines. Perfect for showcasing a book series or collection.',
    category: 'novel',
    baseImage: '/templates/books/bookshelf-row.png',
    width: 400,
    height: 2550,
    coverWidth: 5.5,
    coverHeight: 8.5,
    spineWidth: 0.375,
    warpPreset: 'bookshelf',
    showPages: false,
    showShadow: true,
    perspectiveData: PERSPECTIVE_DATA.bookshelf,
    warpGridSize: { rows: 8, cols: 8 },
  },
  {
    name: 'Hand Held',
    slug: 'hand-held-book',
    description:
      'Book held in hands, lifestyle perspective. Perfect for creating authentic book marketing imagery.',
    category: 'novel',
    baseImage: '/templates/books/hand-held.png',
    width: 1650,
    height: 2550,
    coverWidth: 5.5,
    coverHeight: 8.5,
    spineWidth: 0.375,
    warpPreset: 'handHeld',
    showPages: false,
    showShadow: false,
    perspectiveData: PERSPECTIVE_DATA.handHeld,
    warpGridSize: { rows: 8, cols: 8 },
  },
];

// ---------------------------------------------------------------------------
// Seed logic
// ---------------------------------------------------------------------------

async function seedTemplates() {
  console.log('🌱 Seeding book mockup templates...\n');

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const tmpl of BOOK_TEMPLATES) {
    // ---- Build warp data JSON ----
    const controlPoints = generateWarpControlPoints(tmpl.perspectiveData, tmpl.warpGridSize);

    const warpDataJson: any = {
      type: 'mesh' as const,
      gridSize: { rows: tmpl.warpGridSize.rows, cols: tmpl.warpGridSize.cols },
      controlPoints,
    };

    const perspectiveDataJson = {
      corners: [
        tmpl.perspectiveData.topLeft,
        tmpl.perspectiveData.topRight,
        tmpl.perspectiveData.bottomRight,
        tmpl.perspectiveData.bottomLeft,
      ],
    };

    // ---- Check if slug already exists ----
    const existing = await db.template.findUnique({
      where: { slug: tmpl.slug },
      include: { layers: true },
    });

    if (existing) {
      // Update existing template's smart_object layers with warp/perspective data
      const smartLayers = existing.layers.filter(l => l.type === 'smart_object');

      if (smartLayers.length > 0) {
        for (const layer of smartLayers) {
          if (!layer.warpData || !layer.perspectiveData) {
            await db.templateLayer.update({
              where: { id: layer.id },
              data: {
                warpData: warpDataJson,
                perspectiveData: perspectiveDataJson,
              },
            });
            console.log(`  ✏️  Updated warp/perspective data for "${tmpl.name}" layer "${layer.name}"`);
            updated++;
          } else {
            console.log(`  ⏭  "${tmpl.name}" layer "${layer.name}" already has warp data — skipping.`);
            skipped++;
          }
        }
      } else {
        // No smart_object layer exists — create one
        await db.templateLayer.create({
          data: {
            templateId: existing.id,
            name: 'Cover Design',
            type: 'smart_object',
            zIndex: 2,
            blendMode: 'normal',
            opacity: 1.0,
            warpData: warpDataJson,
            perspectiveData: perspectiveDataJson,
            layerPart: 'front',
          },
        });
        console.log(`  ✏️  Created smart_object layer for "${tmpl.name}"`);
        updated++;
      }
      continue;
    }

    // ---- Build layers for new template ----
    // biome-ignore lint/suspicious/noExplicitAny: Prisma nested-create types are complex
    const layersData: any[] = [];

    // 1. Smart Object layer — where the cover design is placed
    layersData.push({
      name: 'Cover Design',
      type: 'smart_object',
      zIndex: 2,
      blendMode: 'normal',
      opacity: 1.0,
      warpData: warpDataJson,
      perspectiveData: perspectiveDataJson,
      layerPart: 'front',
    });

    // 2. Shadow & Creases layer
    if (tmpl.showShadow) {
      layersData.push({
        name: 'Shadow & Creases',
        type: 'shadow',
        zIndex: 3,
        blendMode: 'multiply',
        opacity: 0.6,
      });
    }

    // 3. Page Edges layer (only for templates that show pages)
    if (tmpl.showPages) {
      layersData.push({
        name: 'Page Edges',
        type: 'pages',
        zIndex: 1,
        blendMode: 'normal',
        opacity: 1.0,
        defaultColor: '#FFFAF0',
        layerPart: 'pages',
      });
    }

    // ---- Create template with nested layers ----
    const record = await db.template.create({
      data: {
        name: tmpl.name,
        slug: tmpl.slug,
        description: tmpl.description,
        category: tmpl.category,
        thumbnail: tmpl.baseImage,
        baseImage: tmpl.baseImage,
        width: tmpl.width,
        height: tmpl.height,
        isActive: true,
        coverWidth: tmpl.coverWidth,
        coverHeight: tmpl.coverHeight,
        spineWidth: tmpl.spineWidth,
        warpPreset: tmpl.warpPreset,
        layers: {
          create: layersData,
        },
      },
      include: { layers: true },
    });

    created++;
    console.log(
      `  ✅ "${tmpl.name}" — id: ${record.id}, layers: ${record.layers.length}`,
    );
  }

  console.log(`\n🏁 Done. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}`);

  // ---- Summary ----
  const allTemplates = await db.template.findMany({
    where: { category: 'novel' },
    include: { layers: true },
  });

  console.log(`\n📚 Novel templates in DB: ${allTemplates.length}`);
  for (const t of allTemplates) {
    const smartLayer = t.layers.find((l) => l.type === 'smart_object');
    const hasPerspective = smartLayer?.perspectiveData !== null;
    const hasWarp = smartLayer?.warpData !== null;
    console.log(
      `   • ${t.slug}  warpPreset=${t.warpPreset}  layers=${t.layers.length}  perspective=${hasPerspective}  warp=${hasWarp}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  try {
    await seedTemplates();
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main();
