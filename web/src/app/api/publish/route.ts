import { NextResponse } from "next/server";
import { PublishingService } from "@/lib/publishingService";

export async function POST(req: Request) {
  try {
    const { novelId } = await req.json();
    const result = await PublishingService.publishNovel(novelId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
