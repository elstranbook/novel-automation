import { NextResponse } from "next/server";
import { buildShowroomSeoArticlesList } from "@/lib/showroomPayload";

function getBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

/**
 * GET /api/showroom/seo-articles
 *
 * Returns a list of all published SEO articles for a given user.
 * Requires Bearer token matching SHOWROOM_SYNC_TOKEN env var.
 * Requires `userId` query parameter.
 *
 * Response:
 * {
 *   source: "elstran-studio",
 *   generatedAt: string,
 *   articles: Array<ShowroomSeoArticleListItem>
 * }
 */
export async function GET(req: Request) {
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

    const articles = await buildShowroomSeoArticlesList(userId);

    return NextResponse.json({
      source: "elstran-studio",
      generatedAt: new Date().toISOString(),
      articles,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
