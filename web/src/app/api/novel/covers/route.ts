import { NextResponse } from "next/server";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const novelId = searchParams.get("novelId");

    if (!novelId) {
      return NextResponse.json({ error: "novelId required" }, { status: 400 });
    }

    const covers = await prisma.coverDesign.findMany({
      where: { novelId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ covers });
  } catch (error) {
    console.error("Error fetching covers:", error);
    return NextResponse.json({ error: "Failed to fetch covers" }, { status: 500 });
  }
}