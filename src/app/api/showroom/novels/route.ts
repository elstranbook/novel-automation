import { NextResponse } from "next/server";
import { buildShowroomNovelsList } from "@/lib/showroomPayload";

function getBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

/**
 * GET /api/showroom/novels
 *
 * Returns a list of all novels in the pipeline with basic metadata.
 * Requires Bearer token matching SHOWROOM_SYNC_TOKEN env var.
 *
 * Response:
 * {
 *   source: "elstran-studio",
 *   generatedAt: string,
 *   novels: Array<{
 *     id: string,
 *     title: string,
 *     model: string,
 *     createdAt: string,
 *     seriesId: string | null,
 *     bookNumber: number | null,
 *     synopsis: string | null,
 *     coverUrl: string | null
 *   }>
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

    const novels = await buildShowroomNovelsList();

    return NextResponse.json({
      source: "elstran-studio",
      generatedAt: new Date().toISOString(),
      novels,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
