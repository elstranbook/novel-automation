import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Legacy bulk scenes route (wrote full YA first-person prose into "scenes").
 * Disabled — use /api/generate/scenes/chapter for structured scene summaries.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "This endpoint is retired. Use /api/generate/scenes/chapter for structured scene summaries.",
    },
    { status: 410 }
  );
}
