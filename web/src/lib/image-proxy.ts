/**
 * Image Proxy Utility
 *
 * Rewrites external image URLs to go through our server-side API proxy,
 * which bypasses CORS restrictions when loading images from CDNs
 * (e.g. mockups-assets.elstranbooks.com) in WebGL TextureLoader or
 * Canvas 2D contexts.
 *
 * Local paths (e.g. /templates/books/...) and data URLs are returned
 * unchanged — they don't need proxying.
 */

const PROXY_ROUTE = '/api/image-proxy';

/**
 * Hostnames that require proxying because they don't return CORS headers.
 * Only these hostnames are allowed by the proxy route.
 */
const CORS_BLOCKED_HOSTNAMES = [
  'mockups-assets.elstranbooks.com',
  '12aa18f2a65e739d78fb331d14b23161.r2.cloudflarestorage.com',
];

/**
 * Rewrite an image URL to go through our CORS proxy if needed.
 *
 * - Local paths like `/templates/books/...` → returned as-is
 * - Data URLs like `data:image/png;base64,...` → returned as-is
 * - Supabase URLs (thkfjbgkuxjslvrbnpkc.supabase.co) → returned as-is
 *   (Supabase already sets CORS headers)
 * - External CDN URLs on CORS-blocked hostnames → proxied via /api/image-proxy
 */
export function proxyImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // Data URLs don't need proxying
  if (url.startsWith('data:')) return url;

  // Local/relative paths don't need proxying
  if (url.startsWith('/')) return url;

  // Same-origin URLs don't need proxying
  if (typeof window !== 'undefined' && url.startsWith(window.location.origin)) return url;

  try {
    const parsed = new URL(url);

    // Supabase Storage already sets CORS headers — no proxy needed
    if (parsed.hostname.endsWith('.supabase.co')) return url;

    // Check if the hostname is one that blocks CORS
    if (CORS_BLOCKED_HOSTNAMES.some(h => parsed.hostname === h || parsed.hostname.endsWith('.' + h))) {
      return `${PROXY_ROUTE}?url=${encodeURIComponent(url)}`;
    }

    // Unknown external host — proxy it just in case
    // (the proxy route will reject if the hostname isn't allowed)
    return `${PROXY_ROUTE}?url=${encodeURIComponent(url)}`;
  } catch {
    // Not a valid URL — return as-is
    return url;
  }
}

/**
 * Check if a URL needs proxying (useful for logging/debugging)
 */
export function needsProxy(url: string | null | undefined): boolean {
  if (!url) return false;
  if (url.startsWith('data:') || url.startsWith('/')) return false;

  try {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith('.supabase.co')) return false;
    return CORS_BLOCKED_HOSTNAMES.some(h => parsed.hostname === h || parsed.hostname.endsWith('.' + h));
  } catch {
    return false;
  }
}
