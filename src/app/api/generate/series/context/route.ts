import { NextResponse } from "next/server";
import { loadSeriesContext } from "@/lib/seriesContext";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const { seriesId, bookNumber } = await request.json();

    if (!seriesId || !bookNumber) {
      return NextResponse.json(
        { error: "Series ID and book number are required" },
        { status: 400 }
      );
    }

    const context = await loadSeriesContext(seriesId, Number(bookNumber));
    return NextResponse.json({ context });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load series context" },
      { status: 500 }
    );
  }
}
