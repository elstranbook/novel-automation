import { NextRequest, NextResponse } from 'next/server';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  PageBreak,
  AlignmentType,
  BorderStyle,
  NumberFormat,
  PageNumber,
  Footer,
  Header,
  TableOfContents,
  FileChild,
} from 'docx';
import JSZip from 'jszip';
import { convert as libreofficeConvert } from 'libreoffice-convert';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const PAGE_WIDTH = 7937;   // 5.51"
const PAGE_HEIGHT = 12240; // 8.50"
const MARGIN = 864;        // 0.60"
const GUTTER = 288;        // 0.20"
const HEADER_DIST = 720;   // 0.50"
const FOOTER_DIST = 576;   // 0.40"

const DEFAULT_AUTHOR = 'Elstran Books';
const DEFAULT_PUBLISHER = 'Elstran Books';

const DEFAULT_ABOUT_AUTHOR = `At Elstran Books, stories aren't just words on a page\u2014they're the sparks that light up young hearts and minds. We're a team of indie authors who know what it's like to get lost in a book and come out a little different on the other side. That's why we write Young Adult novels that dive deep into love, identity, courage, and the tough choices that shape who we become.

From messy first loves to twisty mysteries and wild adventures through new worlds, every story we create is built to leave a mark. We write for the dreamers who stay up too late turning pages, the rebels who believe in something bigger, and the quiet souls looking for a voice that gets it.

We choose to stay indie because we believe stories should come from the heart, not a boardroom. Every book we write carries that love\u2014because before we were writers, we were readers too.

Come along for the ride. One story. One spark. One journey at a time.`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ChapterInput {
  number: number;
  title: string;
  content: string;
}

interface ExportRequestBody {
  bookTitle: string;
  authorName?: string;
  publisherName?: string;
  dedication?: string;
  aboutAuthor?: string;
  chapters: ChapterInput[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Sanitize a file name so it is safe for Content-Disposition. */
function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_');
}

/** Create an empty paragraph (optionally centered). */
function emptyPara(center = false): Paragraph {
  return new Paragraph({
    alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
    children: [],
  });
}

/** Create a centered empty paragraph. */
function emptyCenteredPara(): Paragraph {
  return emptyPara(true);
}

/** Paragraph containing only a PageBreak. */
function pageBreak(): Paragraph {
  return new Paragraph({ children: [new PageBreak()] });
}

/**
 * Blank page after current content:
 * PageBreak → empty para → PageBreak
 * (pushes content after this to a recto page)
 */
function addBlankPageAfter(): FileChild[] {
  return [
    new Paragraph({ children: [new PageBreak()] }),
    emptyPara(),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

/**
 * Blank page at end of section:
 * PageBreak → empty para
 */
function addBlankPageEndOfSection(): FileChild[] {
  return [
    new Paragraph({ children: [new PageBreak()] }),
    emptyPara(),
  ];
}

/**
 * Parse markdown-style bold/italic from a string and return TextRun[].
 * Supports: ***bold italic***, **bold**, *italic*
 */
function parseMarkdownRuns(text: string, baseOptions: Record<string, unknown> = {}): TextRun[] {
  const runs: TextRun[] = [];
  // Pattern: ***bold italic***, **bold**, or *italic*
  const regex = /(\*{3})(.+?)\1|(\*{2})(.+?)\3|(\*)(.+?)\5/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text before the match
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index);
      if (before) {
        runs.push(new TextRun({ text: before, ...baseOptions }));
      }
    }

    if (match[1]) {
      // ***bold italic***
      runs.push(new TextRun({ text: match[2], bold: true, italics: true, ...baseOptions }));
    } else if (match[3]) {
      // **bold**
      runs.push(new TextRun({ text: match[4], bold: true, ...baseOptions }));
    } else if (match[5]) {
      // *italic*
      runs.push(new TextRun({ text: match[6], italics: true, ...baseOptions }));
    }

    lastIndex = regex.lastIndex;
  }

  // Remaining text after last match
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    if (remaining) {
      runs.push(new TextRun({ text: remaining, ...baseOptions }));
    }
  }

  // If no markdown was found, return the plain text run
  if (runs.length === 0) {
    runs.push(new TextRun({ text, ...baseOptions }));
  }

  return runs;
}

/**
 * Build body paragraphs for a chapter.
 * Splits content by double newline for paragraph breaks, single newline within.
 * Parses markdown bold/italic within each paragraph.
 */
function buildBodyParagraphs(content: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  // Split on double newline for paragraph separation
  const rawParagraphs = content.split(/\n{2,}/);

  for (const raw of rawParagraphs) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    // Within a paragraph, treat single newlines as part of the same paragraph
    const normalizedText = trimmed.replace(/\n/g, ' ');
    const runs = parseMarkdownRuns(normalizedText, {
      font: 'Times New Roman',
      size: 24, // 12pt
    });

    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 180, after: 120, line: 252 },
        children: runs,
      })
    );
  }

  return paragraphs;
}

/** Common page size / margin properties shared by every section. */
function sectionPageProps() {
  return {
    page: {
      size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
      margin: {
        top: MARGIN,
        bottom: MARGIN,
        left: MARGIN,
        right: MARGIN,
        header: HEADER_DIST,
        footer: FOOTER_DIST,
        gutter: GUTTER,
      },
    },
  };
}

// ---------------------------------------------------------------------------
// DOCX generation
// ---------------------------------------------------------------------------

function buildDocx(body: ExportRequestBody): Document {
  const bookTitle = body.bookTitle;
  const authorName = body.authorName || DEFAULT_AUTHOR;
  const publisherName = body.publisherName || DEFAULT_PUBLISHER;
  const dedication = body.dedication || '';
  const aboutAuthor = body.aboutAuthor || DEFAULT_ABOUT_AUTHOR;
  const chapters = body.chapters;
  const currentYear = new Date().getFullYear().toString();

  // ========================================================================
  // SECTION 1 — Title Page + Copyright Page
  // ========================================================================
  const section1Children: FileChild[] = [
    // Title page: 6 empty centered paragraphs
    ...Array.from({ length: 6 }, () => emptyCenteredPara()),

    // Book title — 36pt Bold ALL CAPS centered
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: bookTitle.toUpperCase(),
          bold: true,
          size: 72, // 36pt
          font: 'Times New Roman',
        }),
      ],
    }),

    // 4 empty paragraphs
    ...Array.from({ length: 4 }, () => emptyCenteredPara()),

    // "By" — 10pt italic centered
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'By',
          italics: true,
          size: 20, // 10pt
          font: 'Times New Roman',
        }),
      ],
    }),

    // 2 empty paragraphs
    ...Array.from({ length: 2 }, () => emptyCenteredPara()),

    // Publisher name — 19pt centered
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: publisherName,
          size: 38, // 19pt
          font: 'Times New Roman',
        }),
      ],
    }),

    // PageBreak to copyright page
    pageBreak(),

    // Blank page (empty para + PageBreak)
    emptyPara(),
    pageBreak(),

    // ---- Copyright page ----
    // 8 empty lines for vertical centering
    ...Array.from({ length: 8 }, () => emptyCenteredPara()),

    // "COPYRIGHT © {year} BY {AUTHOR NAME}" — 9pt bold centered
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `COPYRIGHT \u00A9 ${currentYear} BY ${authorName.toUpperCase()}`,
          bold: true,
          size: 18, // 9pt
          font: 'Times New Roman',
        }),
      ],
    }),

    // Copyright notice — 9pt italic centered
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'All rights reserved. No part of this publication may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the publisher, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.',
          italics: true,
          size: 18,
          font: 'Times New Roman',
        }),
      ],
    }),

    // ֍ separator — centered
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: '\u058D',
          size: 18,
          font: 'Times New Roman',
        }),
      ],
    }),

    // Fiction disclaimer — 9pt italic centered
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'This is a work of fiction. Names, characters, places, and incidents either are the product of the author\u2019s imagination or are used fictitiously. Any resemblance to actual persons, living or dead, events, or locales is entirely coincidental.',
          italics: true,
          size: 18,
          font: 'Times New Roman',
        }),
      ],
    }),

    // "By:" + publisher name — 9pt bold centered
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `By: ${publisherName}`,
          bold: true,
          size: 18,
          font: 'Times New Roman',
        }),
      ],
    }),

    // "First Printing Edition, {year}" — 9pt bold centered
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `First Printing Edition, ${currentYear}`,
          bold: true,
          size: 18,
          font: 'Times New Roman',
        }),
      ],
    }),

    // Blank page at end of section
    ...addBlankPageEndOfSection(),
  ];

  // ========================================================================
  // SECTION 2 — Dedication + TOC
  // ========================================================================
  const section2Children: FileChild[] = [];

  // Dedication (if provided)
  if (dedication) {
    // 8 empty lines for vertical centering
    section2Children.push(...Array.from({ length: 8 }, () => emptyCenteredPara()));

    // Dedication text — 12pt italic centered
    section2Children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: dedication,
            italics: true,
            size: 24, // 12pt
            font: 'Times New Roman',
          }),
        ],
      })
    );

    // Blank page after dedication
    section2Children.push(...addBlankPageAfter());
  }

  // TOC — "Contents" header
  section2Children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'Contents',
          bold: true,
          italics: true,
          size: 18, // 9pt
          font: 'Times New Roman',
        }),
      ],
    })
  );

  // TableOfContents with cached entries and dot leaders
  const tocEntries: { title: string; level: number }[] = [];
  if (aboutAuthor.trim()) {
    tocEntries.push({ title: 'About the Author', level: 2 });
  }
  for (const ch of chapters) {
    tocEntries.push({ title: `Chapter ${ch.number}`, level: 2 });
  }

  section2Children.push(
    new TableOfContents('Table of Contents', {
      hyperlink: true,
      useAppliedParagraphOutlineLevel: true,
      stylesWithLevels: [
        {
          styleName: 'Heading2',
          level: 2,
        },
      ],
      cachedEntries: tocEntries.map((entry) => ({
        title: entry.title,
        level: entry.level,
      })),
    })
  );

  // Blank page after TOC (1 blank page; next section starts on fresh page automatically)
  section2Children.push(...addBlankPageAfter());

  // Section 2 footer — Roman numeral page numbers centered 9pt
  const section2Footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            children: [PageNumber.CURRENT],
            size: 18, // 9pt
            font: 'Times New Roman',
          }),
        ],
      }),
    ],
  });

  // Section 2 header — empty
  const section2Header = new Header({ children: [emptyPara()] });

  // ========================================================================
  // SECTION 3 — About the Author (own section guarantees fresh page)
  // ========================================================================
  const section3Children: FileChild[] = [];

  if (aboutAuthor.trim()) {
    // 4 empty lines above heading (consistent with chapter layout)
    section3Children.push(...Array.from({ length: 4 }, () => emptyCenteredPara()));

    // About the Author heading — 16pt bold centered with outlineLevel
    section3Children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 40 },
        outlineLevel: 1,
        children: [
          new TextRun({
            text: 'ABOUT THE AUTHOR',
            bold: true,
            size: 32, // 16pt
            font: 'Times New Roman',
          }),
        ],
      })
    );

    // About author body paragraphs — 12pt justified
    const aboutAuthorParagraphs = aboutAuthor
      .split(/\n{2,}/)
      .filter((p) => p.trim())
      .map(
        (p) =>
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 120, after: 120 },
            children: [
              new TextRun({
                text: p.trim().replace(/\n/g, ' '),
                size: 24, // 12pt
                font: 'Times New Roman',
              }),
            ],
          })
      );

    section3Children.push(...aboutAuthorParagraphs);

    // Blank page at end of section 3
    section3Children.push(...addBlankPageEndOfSection());
  }

  // Section 3 footer — same Roman numeral style
  const section3Footer = section2Footer;
  const section3Header = section2Header;

  // ========================================================================
  // SECTIONS 4+ — One per chapter
  // ========================================================================
  const chapterSections = chapters.map((chapter, idx) => {
    const chapterChildren: FileChild[] = [];

    // 4 empty centered paragraphs before chapter number
    chapterChildren.push(
      ...Array.from({ length: 4 }, () => emptyCenteredPara())
    );

    // "CHAPTER N" — 14pt centered with bookmark
    chapterChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 40 },
        children: [
          new TextRun({
            text: `CHAPTER ${chapter.number}`,
            size: 28, // 14pt
            font: 'Times New Roman',
          }),
        ],
      })
    );

    // Horizontal divider line — centered paragraph with bottom border SINGLE size 5
    chapterChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 5, color: '000000', space: 1 },
        },
        spacing: { after: 200 },
        children: [],
      })
    );

    // Chapter title — 20pt Bold ALL CAPS centered, outlineLevel 1 (NOT HeadingLevel to preserve center alignment)
    chapterChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 920 },
        keepNext: true,
        keepLines: true,
        outlineLevel: 1,
        children: [
          new TextRun({
            text: chapter.title.toUpperCase(),
            bold: true,
            size: 40, // 20pt
            font: 'Times New Roman',
          }),
        ],
      })
    );

    // Body paragraphs
    chapterChildren.push(...buildBodyParagraphs(chapter.content));

    // Blank page at end of section (end of chapter)
    chapterChildren.push(...addBlankPageEndOfSection());

    // Even header — book title 9pt centered
    const evenHeader = new Header({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: bookTitle,
              size: 18, // 9pt
              font: 'Times New Roman',
            }),
          ],
        }),
      ],
    });

    // Odd/default header — chapter title 9pt centered
    const defaultHeader = new Header({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: chapter.title,
              size: 18, // 9pt
              font: 'Times New Roman',
            }),
          ],
        }),
      ],
    });

    // First page header — empty
    const firstHeader = new Header({ children: [emptyPara()] });

    // Footer — Arabic page numbers centered 9pt
    const chapterFooter = new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              children: [PageNumber.CURRENT],
              size: 18, // 9pt
              font: 'Times New Roman',
            }),
          ],
        }),
      ],
    });

    return {
      properties: {
        ...sectionPageProps(),
        titlePage: true,
        page: {
          ...sectionPageProps().page,
          pageNumbers: {
            formatType: NumberFormat.DECIMAL,
            ...(idx === 0 ? { start: 1 } : {}),
          },
        },
      },
      footers: {
        default: chapterFooter,
      },
      headers: {
        default: defaultHeader,
        even: evenHeader,
        first: firstHeader,
      },
      children: chapterChildren,
    };
  });

  // ========================================================================
  // Assemble document
  // ========================================================================
  const doc = new Document({
    evenAndOddHeaderAndFooters: true,
    features: {
      updateFields: true,
    },
    styles: {
      default: {
        document: {
          run: {
            font: 'Times New Roman',
            size: 22, // 11pt
          },
          paragraph: {
            spacing: { line: 336 },
          },
        },
        heading2: {
          run: {
            font: 'Times New Roman',
            size: 24, // 12pt
          },
          paragraph: {
            spacing: { before: 40, after: 40 },
          },
        },
      },
    },
    sections: [
      // Section 1: Title Page + Copyright
      {
        properties: {
          ...sectionPageProps(),
          titlePage: true,
        },
        headers: {
          default: new Header({ children: [emptyPara()] }),
          first: new Header({ children: [emptyPara()] }),
          even: new Header({ children: [emptyPara()] }),
        },
        footers: {
          default: new Footer({ children: [emptyPara()] }),
          first: new Footer({ children: [emptyPara()] }),
          even: new Footer({ children: [emptyPara()] }),
        },
        children: section1Children,
      },
      // Section 2: Dedication + TOC
      {
        properties: {
          ...sectionPageProps(),
          titlePage: true,
          page: {
            ...sectionPageProps().page,
            pageNumbers: {
              formatType: NumberFormat.LOWER_ROMAN,
              start: 1,
            },
          },
        },
        headers: {
          default: section2Header,
          first: new Header({ children: [emptyPara()] }),
          even: section2Header,
        },
        footers: {
          default: section2Footer,
          first: new Footer({ children: [emptyPara()] }),
        },
        children: section2Children,
      },
      // Section 3: About the Author (own section guarantees fresh page)
      ...(aboutAuthor.trim()
        ? [
            {
              properties: {
                ...sectionPageProps(),
              },
              headers: {
                default: section3Header,
                even: section3Header,
              },
              footers: {
                default: section3Footer,
              },
              children: section3Children,
            },
          ]
        : []),
      // Chapter sections
      ...chapterSections,
    ],
  });

  return doc;
}

// ---------------------------------------------------------------------------
// Post-processing: Fix evenAndOddHeaders bug + add updateFields
// ---------------------------------------------------------------------------

async function postProcessDocx(buffer: Buffer): Promise<Buffer> {
  const zip = await JSZip.loadAsync(buffer);

  const settingsFile = zip.file('word/settings.xml');
  if (!settingsFile) {
    throw new Error('word/settings.xml not found in DOCX archive');
  }

  let settingsXml = await settingsFile.async('string');

  // 1. Fix evenAndOddHeaders bug — docx-js outputs false instead of true
  settingsXml = settingsXml.replace(
    /<w:evenAndOddHeaders w:val="false"\/>/g,
    '<w:evenAndOddHeaders w:val="true"/>'
  );

  // 2. Add updateFields if not present (forces TOC update on open)
  if (!settingsXml.includes('w:updateFields')) {
    settingsXml = settingsXml.replace(
      /<\/w:settings>/,
      '<w:updateFields w:val="true"/>\n</w:settings>'
    );
  }

  zip.file('word/settings.xml', settingsXml);

  const newBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  return Buffer.from(newBuffer);
}

// ---------------------------------------------------------------------------
// PDF conversion
// ---------------------------------------------------------------------------

function docxToPdf(docxBuffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    libreofficeConvert(docxBuffer, '.pdf', undefined, (err: Error | null, pdfBuffer: Buffer) => {
      if (err) return reject(err);
      resolve(Buffer.from(pdfBuffer));
    });
  });
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // Parse format from query params
    const format = request.nextUrl.searchParams.get('format') || 'docx';
    if (format !== 'docx' && format !== 'pdf') {
      return NextResponse.json(
        { error: 'Invalid format. Use "docx" or "pdf".' },
        { status: 400 }
      );
    }

    // Parse body
    let body: ExportRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body.' },
        { status: 400 }
      );
    }

    // Validate required fields
    console.log('[export] Received body:', JSON.stringify({ bookTitle: body.bookTitle, authorName: body.authorName, chapterCount: body.chapters?.length, firstChapter: body.chapters?.[0] ? { number: body.chapters[0].number, title: body.chapters[0].title, contentType: typeof body.chapters[0].content, contentLength: typeof body.chapters[0].content === 'string' ? body.chapters[0].content.length : 'N/A' } : 'none' }));

    if (!body.bookTitle || typeof body.bookTitle !== 'string' || !body.bookTitle.trim()) {
      console.log('[export] Validation failed: bookTitle missing or empty');
      return NextResponse.json(
        { error: 'bookTitle is required.' },
        { status: 400 }
      );
    }

    if (!body.authorName || typeof body.authorName !== 'string' || !body.authorName.trim()) {
      console.log('[export] Validation failed: authorName missing or empty');
      return NextResponse.json(
        { error: 'authorName is required.' },
        { status: 400 }
      );
    }

    if (!body.chapters || !Array.isArray(body.chapters) || body.chapters.length === 0) {
      console.log('[export] Validation failed: chapters missing or empty array');
      return NextResponse.json(
        { error: 'At least 1 chapter is required.' },
        { status: 400 }
      );
    }

    // Validate each chapter — content can be empty (chapter not yet generated)
    for (let i = 0; i < body.chapters.length; i++) {
      const ch = body.chapters[i];
      if (typeof ch.number !== 'number') {
        return NextResponse.json(
          { error: `Chapter ${i + 1}: "number" must be a number.` },
          { status: 400 }
        );
      }
      if (!ch.title || typeof ch.title !== 'string') {
        return NextResponse.json(
          { error: `Chapter ${i + 1}: "title" must be a non-empty string.` },
          { status: 400 }
        );
      }
      // Coerce content to string (allow empty or missing)
      if (ch.content == null) ch.content = '';
      if (typeof ch.content !== 'string') {
        return NextResponse.json(
          { error: `Chapter ${i + 1} ("${ch.title}"): "content" must be a string.` },
          { status: 400 }
        );
      }
    }

    // Build DOCX
    const doc = buildDocx(body);
    const rawBuffer = await Packer.toBuffer(doc);

    // Post-process: fix evenAndOddHeaders + add updateFields
    const fixedBuffer = await postProcessDocx(rawBuffer);

    // Convert to PDF if requested
    let outputBuffer: Buffer;
    let contentType: string;
    let extension: string;

    if (format === 'pdf') {
      outputBuffer = await docxToPdf(fixedBuffer);
      contentType = 'application/pdf';
      extension = 'pdf';
    } else {
      outputBuffer = fixedBuffer;
      contentType =
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      extension = 'docx';
    }

    const safeName = safeFileName(body.bookTitle);

    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${safeName}_Formatted.${extension}"`,
      },
    });
  } catch (error) {
    console.error('[export] Error generating document:', error);
    return NextResponse.json(
      { error: 'Failed to generate document.' },
      { status: 500 }
    );
  }
}
