import { NextRequest, NextResponse } from 'next/server';

/**
 * Image Proxy API Route
 *
 * Workaround for CORS restrictions when loading external images
 * (e.g. from R2 CDN at mockups-assets.elstranbooks.com) in WebGL
 * TextureLoader or Canvas 2D contexts.
 *
 * The server fetches the image and returns it with permissive CORS
 * headers, so the browser allows the client-side code to read the
 * pixel data.
 *
 * Usage:  /api/image-proxy?url=https://mockups-assets.elstranbooks.com/psd/...
 */

// Allowed hostnames — only proxy URLs we trust
const ALLOWED_HOSTNAMES = [
  'mockups-assets.elstranbooks.com',
  '12aa18f2a65e739d78fb331d14b23161.r2.cloudflarestorage.com',
  'oaidalleapiprodscus.blob.core.windows.net',
];

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && ALLOWED_HOSTNAMES.includes(parsed.hostname);
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  if (!isAllowedUrl(url)) {
    return NextResponse.json({ error: 'Hostname not allowed' }, { status: 403 });
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        // Some CDNs require a User-Agent
        'User-Agent': 'NovelAutomation-ImageProxy/1.0',
      },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${upstream.status}` },
        { status: upstream.status },
      );
    }

    const contentType = upstream.headers.get('content-type') || 'image/png';
    const body = await upstream.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        // Cache for 1 hour on the edge, 24 hours in the browser
        'Cache-Control': 'public, max-age=86400, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Image proxy fetch failed:', error);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Max-Age': '86400',
    },
  });
}
