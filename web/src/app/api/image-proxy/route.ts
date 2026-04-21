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
 * Also handles PSD-to-PNG conversion: when the upstream returns
 * application/x-photoshop, the proxy converts the PSD to a PNG
 * image that browsers can render.
 *
 * Usage:  /api/image-proxy?url=https://mockups-assets.elstranbooks.com/psd/...
 */

// Allowed hostnames — only proxy URLs we trust
const ALLOWED_HOSTNAMES = [
  'mockups-assets.elstranbooks.com',
  '12aa18f2a65e739d78fb331d14b23161.r2.cloudflarestorage.com',
  'oaidalleapiprodscus.blob.core.windows.net',
];

// Maximum PSD size to attempt conversion (50 MB)
const MAX_PSD_CONVERSION_SIZE = 50 * 1024 * 1024;

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && ALLOWED_HOSTNAMES.includes(parsed.hostname);
  } catch {
    return false;
  }
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    console.warn('[image-proxy] Missing url parameter');
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  if (!isAllowedUrl(url)) {
    console.warn('[image-proxy] Hostname not allowed:', new URL(url).hostname);
    return NextResponse.json({ error: 'Hostname not allowed' }, { status: 403 });
  }

  try {
    console.log('[image-proxy] Fetching:', url.substring(0, 120));

    const upstream = await fetch(url, {
      headers: {
        // Some CDNs require a User-Agent and Accept header
        'User-Agent': 'Mozilla/5.0 (compatible; NovelAutomation/1.0)',
        'Accept': 'image/*,*/*;q=0.8',
      },
      // Don't follow redirects automatically for security — but allow for CDN
      redirect: 'follow',
    });

    console.log('[image-proxy] Upstream status:', upstream.status, 'Content-Type:', upstream.headers.get('content-type'));

    if (!upstream.ok) {
      console.error('[image-proxy] Upstream error:', upstream.status, url.substring(0, 100));
      return NextResponse.json(
        { error: `Upstream returned ${upstream.status}` },
        { status: upstream.status },
      );
    }

    const contentType = upstream.headers.get('content-type') || 'image/png';
    const contentLength = parseInt(upstream.headers.get('content-length') || '0', 10);

    // Handle PSD files: convert to PNG
    if (contentType === 'application/x-photoshop' || contentType === 'image/vnd.adobe.photoshop') {
      console.log('[image-proxy] PSD file detected, attempting conversion to PNG...');

      // Check size limit for conversion
      if (contentLength > MAX_PSD_CONVERSION_SIZE) {
        console.error(`[image-proxy] PSD too large for conversion: ${contentLength} bytes (max ${MAX_PSD_CONVERSION_SIZE})`);
        return NextResponse.json(
          { error: `PSD file too large for on-the-fly conversion (${Math.round(contentLength / 1024 / 1024)}MB). Please reprocess the template to generate PNG images.` },
          { status: 502 },
        );
      }

      try {
        const psdBuffer = Buffer.from(await upstream.arrayBuffer());

        if (psdBuffer.byteLength > MAX_PSD_CONVERSION_SIZE) {
          console.error(`[image-proxy] PSD buffer too large: ${psdBuffer.byteLength} bytes`);
          return NextResponse.json(
            { error: 'PSD file too large for on-the-fly conversion. Please reprocess the template.' },
            { status: 502 },
          );
        }

        // Dynamically import the PSD converter (avoids loading ag-psd for non-PSD requests)
        const { convertPsdToPng } = await import('@/lib/psd/parser');
        const pngBuffer = await convertPsdToPng(psdBuffer);

        if (pngBuffer) {
          console.log(`[image-proxy] PSD→PNG conversion successful: ${pngBuffer.byteLength} bytes for ${url.substring(0, 80)}`);
          return new NextResponse(new Uint8Array(pngBuffer), {
            status: 200,
            headers: {
              'Content-Type': 'image/png',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET',
              'Cache-Control': 'public, max-age=86400, s-maxage=3600',
            },
          });
        }

        console.error('[image-proxy] PSD→PNG conversion returned null');
        return NextResponse.json(
          { error: 'Failed to convert PSD to PNG. The file may be corrupted or use unsupported features.' },
          { status: 502 },
        );
      } catch (conversionError) {
        console.error('[image-proxy] PSD conversion error:', conversionError);
        return NextResponse.json(
          { error: 'PSD conversion failed. Please reprocess the template to generate PNG images.' },
          { status: 502 },
        );
      }
    }

    // Validate that the response is actually an image
    if (!contentType.startsWith('image/') && !contentType.startsWith('application/octet-stream')) {
      console.error('[image-proxy] Non-image response:', contentType, url.substring(0, 100));
      return NextResponse.json(
        { error: `Expected image but got ${contentType}` },
        { status: 502 },
      );
    }

    const body = await upstream.arrayBuffer();

    if (body.byteLength === 0) {
      console.error('[image-proxy] Empty response body for:', url.substring(0, 100));
      return NextResponse.json({ error: 'Empty image response' }, { status: 502 });
    }

    console.log('[image-proxy] Success:', url.substring(0, 80), body.byteLength, 'bytes');

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
    console.error('[image-proxy] Fetch failed:', error);
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
