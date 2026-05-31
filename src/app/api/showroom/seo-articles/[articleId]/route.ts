import { NextResponse } from "next/server";
import { buildShowroomSeoArticlePayload } from "@/lib/showroomPayload";

function getBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

/**
 * GET /api/showroom/seo-articles/[articleId]
 *
 * Returns the full payload for a single published SEO article.
 * Requires Bearer token matching SHOWROOM_SYNC_TOKEN env var.
 * Requires `userId` query parameter.
 *
 * Response: ShowroomSeoArticle object
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const expectedToken = process.env.SHOWROOM_SYNC_TOKEN;
    if (!expectedToken) {
      return NextResponse.json(
        { error: "SHOWROOM_SYNC_TOKEN is not configured" },
        { status: 500 }
      );
    }

    const bearerToken = getBearerToken(req.headers.get("authorization"));
    if (!bearerToken || bearerToken !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    const { articleId } = await params;
    const payload = await buildShowroomSeoArticlePayload(articleId, userId);
    if (!payload) {
      return NextResponse.json(
        { error: "SEO article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
