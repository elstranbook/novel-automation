import { NextResponse } from "next/server";
import { MockupManager } from "@/lib/mockupManager";

export async function GET() {
  const templates = await MockupManager.getTemplates();
  return NextResponse.json({ templates });
}

export async function POST(req: Request) {
  try {
    const { novelId, coverId, coverUrl, templateId, options } = await req.json();
    const jobId = await MockupManager.submitRender(
      novelId,
      coverId,
      coverUrl,
      templateId,
      options
    );
    return NextResponse.json({ jobId });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
