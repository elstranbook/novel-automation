import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export async function GET(req: Request) {
  const prisma = globalForPrisma.prisma || new PrismaClient();
  
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

    console.log("Found covers:", covers.length);
    return NextResponse.json({ covers });
  } catch (error) {
    console.error("Error fetching covers:", error);
    return NextResponse.json({ error: "Failed to fetch covers" }, { status: 500 });
  }
}