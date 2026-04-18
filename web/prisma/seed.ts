import { db } from '../src/lib/db';

async function main() {
  console.log('Seeding database...');

  const existingTemplates = await db.template.count();
  if (existingTemplates > 0) {
    console.log(`Seed skipped: ${existingTemplates} templates already exist.`);
    return;
  }

  // Clear existing data (kept for safety if partial data exists)
  await db.render.deleteMany();
  await db.userImage.deleteMany();
  await db.colorOption.deleteMany();
  await db.templateLayer.deleteMany();
  await db.template.deleteMany();
  await db.bookTemplate.deleteMany();

  // ============ T-SHIRT TEMPLATE ============
  const tshirtTemplate = await db.template.create({
    data: {
      name: 'Classic T-Shirt',
      slug: 'classic-tshirt',
      description: 'A classic crew neck t-shirt mockup perfect for showcasing your designs. Features realistic fabric texture and natural drape.',
      category: 'tshirt',
      thumbnail: '/templates/tshirt-base.png',
      baseImage: '/templates/tshirt-base.png',
      width: 1024,
      height: 1024,
      isActive: true,
      layers: {
        create: [
          {
            name: 'base',
            type: 'base',
            zIndex: 0,
            blendMode: 'normal',
            opacity: 1.0,
          },
          {
            name: 'front_color',
            type: 'color_layer',
            zIndex: 1,
            blendMode: 'color',
            opacity: 1.0,
            defaultColor: '#FFFFFF',
            isColorable: true,
          },
          {
            name: 'design',
            type: 'smart_object',
            zIndex: 2,
            blendMode: 'normal',
            opacity: 1.0,
            transformX: 0.5,
            transformY: 0.45,
            transformScaleX: 0.35,
            transformScaleY: 0.35,
            transformRotation: 0,
          },
          {
            name: 'shadow',
            type: 'shadow',
            zIndex: 3,
            blendMode: 'multiply',
            opacity: 0.3,
          },
        ],
      },
      colorOptions: {
        create: {
          name: 'Shirt Color',
          layerName: 'front_color',
          colors: JSON.stringify([
            { name: 'White', hex: '#FFFFFF' },
            { name: 'Black', hex: '#1A1A1A' },
            { name: 'Navy', hex: '#1B2838' },
            { name: 'Red', hex: '#C41E3A' },
            { name: 'Forest Green', hex: '#228B22' },
            { name: 'Royal Blue', hex: '#4169E1' },
            { name: 'Purple', hex: '#6B3FA0' },
            { name: 'Orange', hex: '#FF6B35' },
            { name: 'Yellow', hex: '#FFD700' },
            { name: 'Pink', hex: '#FF69B4' },
            { name: 'Gray', hex: '#808080' },
            { name: 'Maroon', hex: '#800000' },
          ]),
        },
      },
    },
  });

  // ============ MUG TEMPLATE ============
  const mugTemplate = await db.template.create({
    data: {
      name: 'Ceramic Coffee Mug',
      slug: 'ceramic-mug',
      description: 'A standard 11oz ceramic mug mockup. Perfect for custom designs and branding presentations.',
      category: 'mug',
      thumbnail: '/templates/mug-base.png',
      baseImage: '/templates/mug-base.png',
      width: 1024,
      height: 1024,
      isActive: true,
      layers: {
        create: [
          {
            name: 'base',
            type: 'base',
            zIndex: 0,
            blendMode: 'normal',
            opacity: 1.0,
          },
          {
            name: 'mug_color',
            type: 'color_layer',
            zIndex: 1,
            blendMode: 'color',
            opacity: 1.0,
            defaultColor: '#FFFFFF',
            isColorable: true,
          },
          {
            name: 'design',
            type: 'smart_object',
            zIndex: 2,
            blendMode: 'normal',
            opacity: 1.0,
            transformX: 0.5,
            transformY: 0.5,
            transformScaleX: 0.25,
            transformScaleY: 0.25,
            transformRotation: 0,
          },
          {
            name: 'shadow',
            type: 'shadow',
            zIndex: 3,
            blendMode: 'multiply',
            opacity: 0.2,
          },
        ],
      },
      colorOptions: {
        create: {
          name: 'Mug Color',
          layerName: 'mug_color',
          colors: JSON.stringify([
            { name: 'White', hex: '#FFFFFF' },
            { name: 'Black', hex: '#1A1A1A' },
            { name: 'Navy', hex: '#1B2838' },
            { name: 'Red', hex: '#C41E3A' },
            { name: 'Forest Green', hex: '#228B22' },
            { name: 'Royal Blue', hex: '#4169E1' },
            { name: 'Purple', hex: '#6B3FA0' },
            { name: 'Orange', hex: '#FF6B35' },
            { name: 'Yellow', hex: '#FFD700' },
            { name: 'Pink', hex: '#FF69B4' },
          ]),
        },
      },
    },
  });

  // ============ PHONE CASE TEMPLATE ============
  const phoneTemplate = await db.template.create({
    data: {
      name: 'iPhone Case',
      slug: 'iphone-case',
      description: 'Modern iPhone case mockup with realistic details. Perfect for showcasing phone accessory designs.',
      category: 'phone',
      thumbnail: '/templates/phone-base.png',
      baseImage: '/templates/phone-base.png',
      width: 1024,
      height: 1024,
      isActive: true,
      layers: {
        create: [
          {
            name: 'base',
            type: 'base',
            zIndex: 0,
            blendMode: 'normal',
            opacity: 1.0,
          },
          {
            name: 'case_color',
            type: 'color_layer',
            zIndex: 1,
            blendMode: 'color',
            opacity: 1.0,
            defaultColor: '#FFFFFF',
            isColorable: true,
          },
          {
            name: 'design',
            type: 'smart_object',
            zIndex: 2,
            blendMode: 'normal',
            opacity: 1.0,
            transformX: 0.5,
            transformY: 0.5,
            transformScaleX: 0.4,
            transformScaleY: 0.4,
            transformRotation: 0,
          },
          {
            name: 'shadow',
            type: 'shadow',
            zIndex: 3,
            blendMode: 'multiply',
            opacity: 0.25,
          },
        ],
      },
      colorOptions: {
        create: {
          name: 'Case Color',
          layerName: 'case_color',
          colors: JSON.stringify([
            { name: 'White', hex: '#FFFFFF' },
            { name: 'Black', hex: '#1A1A1A' },
            { name: 'Clear', hex: '#F5F5F5' },
            { name: 'Rose Gold', hex: '#B76E79' },
            { name: 'Navy', hex: '#1B2838' },
            { name: 'Red', hex: '#C41E3A' },
            { name: 'Forest Green', hex: '#228B22' },
            { name: 'Purple', hex: '#6B3FA0' },
          ]),
        },
      },
    },
  });

  // ============ POSTER TEMPLATE ============
  const posterTemplate = await db.template.create({
    data: {
      name: 'Wall Poster Frame',
      slug: 'wall-poster',
      description: 'Elegant poster frame mockup for art prints and promotional materials. Perfect for wall art presentations.',
      category: 'poster',
      thumbnail: '/templates/poster-base.png',
      baseImage: '/templates/poster-base.png',
      width: 1024,
      height: 1024,
      isActive: true,
      layers: {
        create: [
          {
            name: 'base',
            type: 'base',
            zIndex: 0,
            blendMode: 'normal',
            opacity: 1.0,
          },
          {
            name: 'design',
            type: 'smart_object',
            zIndex: 1,
            blendMode: 'normal',
            opacity: 1.0,
            transformX: 0.5,
            transformY: 0.5,
            transformScaleX: 0.5,
            transformScaleY: 0.5,
            transformRotation: 0,
          },
          {
            name: 'shadow',
            type: 'shadow',
            zIndex: 2,
            blendMode: 'multiply',
            opacity: 0.15,
          },
        ],
      },
      colorOptions: {
        create: {
          name: 'Frame Color',
          layerName: 'frame_color',
          colors: JSON.stringify([
            { name: 'White', hex: '#FFFFFF' },
            { name: 'Black', hex: '#1A1A1A' },
            { name: 'Natural Wood', hex: '#D4A574' },
            { name: 'Dark Wood', hex: '#5C4033' },
          ]),
        },
      },
    },
  });

  // ============ NOVEL/BOOK TEMPLATES (5.5 x 8.5) ============
  
  // Hardcover Novel - Angled View
  const hardcoverAngled = await db.template.create({
    data: {
      name: 'Hardcover Novel - Angled View',
      slug: 'hardcover-novel-angled',
      description: 'Classic hardcover novel with visible spine, 3D angled view. Perfect for showcasing book cover designs for 5.5 x 8.5 inch hardcover books.',
      category: 'novel',
      thumbnail: '/templates/books/hardcover-angled.png',
      baseImage: '/templates/books/hardcover-angled.png',
      width: 1024,
      height: 1024,
      isActive: true,
      coverWidth: 5.5,
      coverHeight: 8.5,
      spineWidth: 0.5,
      warpPreset: 'angledWithSpine',
      layers: {
        create: [
          {
            name: 'base',
            type: 'base',
            zIndex: 0,
            blendMode: 'normal',
            opacity: 1.0,
          },
          {
            name: 'cover_color',
            type: 'color_layer',
            zIndex: 1,
            blendMode: 'color',
            opacity: 1.0,
            defaultColor: '#FFFFFF',
            isColorable: true,
          },
          {
            name: 'front_cover',
            type: 'smart_object',
            zIndex: 2,
            blendMode: 'normal',
            opacity: 1.0,
            transformX: 0.35,
            transformY: 0.5,
            transformScaleX: 0.45,
            transformScaleY: 0.7,
            transformRotation: 0,
            layerPart: 'front',
          },
          {
            name: 'spine',
            type: 'spine',
            zIndex: 3,
            blendMode: 'normal',
            opacity: 1.0,
            transformX: 0.08,
            transformY: 0.5,
            transformScaleX: 0.08,
            transformScaleY: 0.7,
            layerPart: 'spine',
          },
          {
            name: 'pages',
            type: 'pages',
            zIndex: 4,
            blendMode: 'normal',
            opacity: 1.0,
            defaultColor: '#FFFAF0',
          },
          {
            name: 'shadow',
            type: 'shadow',
            zIndex: 5,
            blendMode: 'multiply',
            opacity: 0.25,
          },
        ],
      },
      colorOptions: {
        create: {
          name: 'Cover Color',
          layerName: 'cover_color',
          colors: JSON.stringify([
            { name: 'White', hex: '#FFFFFF' },
            { name: 'Cream', hex: '#FFFAF0' },
            { name: 'Black', hex: '#1A1A1A' },
            { name: 'Navy', hex: '#1B2838' },
            { name: 'Burgundy', hex: '#800020' },
            { name: 'Forest Green', hex: '#228B22' },
            { name: 'Royal Blue', hex: '#4169E1' },
            { name: 'Purple', hex: '#6B3FA0' },
          ]),
        },
      },
    },
  });

  // Paperback Novel - Front View
  const paperbackFront = await db.template.create({
    data: {
      name: 'Paperback Novel - Front View',
      slug: 'paperback-novel-front',
      description: 'Standard paperback novel, flat front cover view. Perfect for showcasing book cover designs for 5.5 x 8.5 inch paperback books.',
      category: 'novel',
      thumbnail: '/templates/books/paperback-front.png',
      baseImage: '/templates/books/paperback-front.png',
      width: 1024,
      height: 1024,
      isActive: true,
      coverWidth: 5.5,
      coverHeight: 8.5,
      spineWidth: 0.375,
      warpPreset: 'flatFront',
      layers: {
        create: [
          {
            name: 'base',
            type: 'base',
            zIndex: 0,
            blendMode: 'normal',
            opacity: 1.0,
          },
          {
            name: 'cover_color',
            type: 'color_layer',
            zIndex: 1,
            blendMode: 'color',
            opacity: 1.0,
            defaultColor: '#FFFFFF',
            isColorable: true,
          },
          {
            name: 'front_cover',
            type: 'smart_object',
            zIndex: 2,
            blendMode: 'normal',
            opacity: 1.0,
            transformX: 0.5,
            transformY: 0.5,
            transformScaleX: 0.65,
            transformScaleY: 0.85,
            transformRotation: 0,
            layerPart: 'front',
          },
          {
            name: 'shadow',
            type: 'shadow',
            zIndex: 3,
            blendMode: 'multiply',
            opacity: 0.2,
          },
        ],
      },
      colorOptions: {
        create: {
          name: 'Cover Color',
          layerName: 'cover_color',
          colors: JSON.stringify([
            { name: 'White', hex: '#FFFFFF' },
            { name: 'Cream', hex: '#FFFAF0' },
            { name: 'Black', hex: '#1A1A1A' },
            { name: 'Navy', hex: '#1B2838' },
            { name: 'Red', hex: '#C41E3A' },
            { name: 'Forest Green', hex: '#228B22' },
            { name: 'Royal Blue', hex: '#4169E1' },
            { name: 'Purple', hex: '#6B3FA0' },
            { name: 'Orange', hex: '#FF6B35' },
          ]),
        },
      },
    },
  });

  // Stacked Books on Table
  const stackedTable = await db.template.create({
    data: {
      name: 'Novel Stack - Table View',
      slug: 'novel-stack-table',
      description: 'Stack of novels on a wooden table surface. Perfect for showcasing multiple book designs or creating lifestyle imagery.',
      category: 'novel',
      thumbnail: '/templates/books/stacked-table.png',
      baseImage: '/templates/books/stacked-table.png',
      width: 1024,
      height: 1024,
      isActive: true,
      coverWidth: 5.5,
      coverHeight: 8.5,
      spineWidth: 0.375,
      warpPreset: 'stackedOnTable',
      layers: {
        create: [
          {
            name: 'base',
            type: 'base',
            zIndex: 0,
            blendMode: 'normal',
            opacity: 1.0,
          },
          {
            name: 'top_book',
            type: 'smart_object',
            zIndex: 1,
            blendMode: 'normal',
            opacity: 1.0,
            transformX: 0.5,
            transformY: 0.3,
            transformScaleX: 0.4,
            transformScaleY: 0.35,
            layerPart: 'front',
          },
          {
            name: 'middle_book',
            type: 'smart_object',
            zIndex: 2,
            blendMode: 'normal',
            opacity: 1.0,
            transformX: 0.5,
            transformY: 0.5,
            transformScaleX: 0.4,
            transformScaleY: 0.35,
            layerPart: 'front',
          },
          {
            name: 'bottom_book',
            type: 'smart_object',
            zIndex: 3,
            blendMode: 'normal',
            opacity: 1.0,
            transformX: 0.5,
            transformY: 0.7,
            transformScaleX: 0.4,
            transformScaleY: 0.35,
            layerPart: 'front',
          },
          {
            name: 'shadow',
            type: 'shadow',
            zIndex: 4,
            blendMode: 'multiply',
            opacity: 0.3,
          },
        ],
      },
      colorOptions: {
        create: {
          name: 'Book Colors',
          layerName: 'book_colors',
          colors: JSON.stringify([
            { name: 'White', hex: '#FFFFFF' },
            { name: 'Black', hex: '#1A1A1A' },
            { name: 'Navy', hex: '#1B2838' },
            { name: 'Red', hex: '#C41E3A' },
          ]),
        },
      },
    },
  });

  // Open Book Spread
  const openSpread = await db.template.create({
    data: {
      name: 'Open Book - Spread View',
      slug: 'open-book-spread',
      description: 'Book opened flat showing both pages. Perfect for displaying interior page designs or creating reading lifestyle imagery.',
      category: 'novel',
      thumbnail: '/templates/books/open-spread.png',
      baseImage: '/templates/books/open-spread.png',
      width: 1024,
      height: 1024,
      isActive: true,
      coverWidth: 5.5,
      coverHeight: 8.5,
      spineWidth: 0.375,
      warpPreset: 'openSpread',
      layers: {
        create: [
          {
            name: 'base',
            type: 'base',
            zIndex: 0,
            blendMode: 'normal',
            opacity: 1.0,
          },
          {
            name: 'left_page',
            type: 'smart_object',
            zIndex: 1,
            blendMode: 'normal',
            opacity: 1.0,
            transformX: 0.25,
            transformY: 0.5,
            transformScaleX: 0.35,
            transformScaleY: 0.6,
            layerPart: 'front',
          },
          {
            name: 'right_page',
            type: 'smart_object',
            zIndex: 2,
            blendMode: 'normal',
            opacity: 1.0,
            transformX: 0.75,
            transformY: 0.5,
            transformScaleX: 0.35,
            transformScaleY: 0.6,
            layerPart: 'front',
          },
          {
            name: 'shadow',
            type: 'shadow',
            zIndex: 3,
            blendMode: 'multiply',
            opacity: 0.15,
          },
        ],
      },
      colorOptions: {
        create: {
          name: 'Page Color',
          layerName: 'page_color',
          colors: JSON.stringify([
            { name: 'White', hex: '#FFFFFF' },
            { name: 'Cream', hex: '#FFFAF0' },
            { name: 'Off-White', hex: '#F5F5DC' },
          ]),
        },
      },
    },
  });

  // Bookshelf Row
  const bookshelfRow = await db.template.create({
    data: {
      name: 'Bookshelf Row',
      slug: 'bookshelf-row',
      description: 'Books on a wooden shelf showing spines. Perfect for showcasing a book series or collection.',
      category: 'novel',
      thumbnail: '/templates/books/bookshelf-row.png',
      baseImage: '/templates/books/bookshelf-row.png',
      width: 1024,
      height: 1024,
      isActive: true,
      coverWidth: 5.5,
      coverHeight: 8.5,
      spineWidth: 0.375,
      warpPreset: 'bookshelf',
      layers: {
        create: [
          {
            name: 'base',
            type: 'base',
            zIndex: 0,
            blendMode: 'normal',
            opacity: 1.0,
          },
          {
            name: 'spine_design',
            type: 'spine',
            zIndex: 1,
            blendMode: 'normal',
            opacity: 1.0,
            transformX: 0.5,
            transformY: 0.5,
            transformScaleX: 0.15,
            transformScaleY: 0.7,
            layerPart: 'spine',
          },
          {
            name: 'shadow',
            type: 'shadow',
            zIndex: 2,
            blendMode: 'multiply',
            opacity: 0.2,
          },
        ],
      },
      colorOptions: {
        create: {
          name: 'Spine Color',
          layerName: 'spine_color',
          colors: JSON.stringify([
            { name: 'White', hex: '#FFFFFF' },
            { name: 'Black', hex: '#1A1A1A' },
            { name: 'Navy', hex: '#1B2838' },
            { name: 'Red', hex: '#C41E3A' },
            { name: 'Forest Green', hex: '#228B22' },
            { name: 'Burgundy', hex: '#800020' },
          ]),
        },
      },
    },
  });

  // Hand Held Book
  const handHeld = await db.template.create({
    data: {
      name: 'Hand Held Book',
      slug: 'hand-held-book',
      description: 'Book held in hands, lifestyle perspective. Perfect for creating authentic book marketing imagery.',
      category: 'novel',
      thumbnail: '/templates/books/hand-held.png',
      baseImage: '/templates/books/hand-held.png',
      width: 1024,
      height: 1024,
      isActive: true,
      coverWidth: 5.5,
      coverHeight: 8.5,
      spineWidth: 0.375,
      warpPreset: 'handHeld',
      layers: {
        create: [
          {
            name: 'base',
            type: 'base',
            zIndex: 0,
            blendMode: 'normal',
            opacity: 1.0,
          },
          {
            name: 'cover_color',
            type: 'color_layer',
            zIndex: 1,
            blendMode: 'color',
            opacity: 1.0,
            defaultColor: '#FFFFFF',
            isColorable: true,
          },
          {
            name: 'front_cover',
            type: 'smart_object',
            zIndex: 2,
            blendMode: 'normal',
            opacity: 1.0,
            transformX: 0.5,
            transformY: 0.45,
            transformScaleX: 0.55,
            transformScaleY: 0.65,
            transformRotation: 0,
            layerPart: 'front',
          },
        ],
      },
      colorOptions: {
        create: {
          name: 'Cover Color',
          layerName: 'cover_color',
          colors: JSON.stringify([
            { name: 'White', hex: '#FFFFFF' },
            { name: 'Cream', hex: '#FFFAF0' },
            { name: 'Black', hex: '#1A1A1A' },
            { name: 'Navy', hex: '#1B2838' },
            { name: 'Red', hex: '#C41E3A' },
          ]),
        },
      },
    },
  });

  console.log('Database seeded successfully!');
  console.log('Created templates:', {
    tshirt: tshirtTemplate.id,
    mug: mugTemplate.id,
    phone: phoneTemplate.id,
    poster: posterTemplate.id,
    hardcoverAngled: hardcoverAngled.id,
    paperbackFront: paperbackFront.id,
    stackedTable: stackedTable.id,
    openSpread: openSpread.id,
    bookshelfRow: bookshelfRow.id,
    handHeld: handHeld.id,
  });
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
