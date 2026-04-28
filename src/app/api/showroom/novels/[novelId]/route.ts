import { NextResponse } from "next/server";
import { buildShowroomPayload } from "@/lib/showroomPayload";

function getBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ novelId: string }> }
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

    const { novelId } = await params;
    const payload = await buildShowroomPayload(novelId);
    if (!payload) {
      return NextResponse.json({ error: "Novel not found" }, { status: 404 });
    }

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
