/*
  Warnings:

  - You are about to drop the `CoverDesign` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "CoverDesign";

-- CreateTable
CREATE TABLE "CoverDesignPrompts" (
    "id" TEXT NOT NULL,
    "novelId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "model" TEXT,
    "prompt" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoverDesignPrompts_pkey" PRIMARY KEY ("id")
);
