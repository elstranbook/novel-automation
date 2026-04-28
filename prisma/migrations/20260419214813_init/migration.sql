-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "baseImage" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "coverWidth" DOUBLE PRECISION,
    "coverHeight" DOUBLE PRECISION,
    "spineWidth" DOUBLE PRECISION,
    "warpPreset" TEXT,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateLayer" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "zIndex" INTEGER NOT NULL,
    "transformX" DOUBLE PRECISION,
    "transformY" DOUBLE PRECISION,
    "transformScaleX" DOUBLE PRECISION,
    "transformScaleY" DOUBLE PRECISION,
    "transformRotation" DOUBLE PRECISION,
    "boundsX" DOUBLE PRECISION,
    "boundsY" DOUBLE PRECISION,
    "boundsWidth" DOUBLE PRECISION,
    "boundsHeight" DOUBLE PRECISION,
    "warpData" JSONB,
    "perspectiveData" JSONB,
    "maskPath" TEXT,
    "blendMode" TEXT NOT NULL DEFAULT 'normal',
    "opacity" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "defaultColor" TEXT,
    "isColorable" BOOLEAN NOT NULL DEFAULT false,
    "layerPart" TEXT,
    "compositeUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateLayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColorOption" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "layerName" TEXT NOT NULL,
    "colors" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ColorOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Render" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "userImage" TEXT NOT NULL,
    "designX" DOUBLE PRECISION NOT NULL,
    "designY" DOUBLE PRECISION NOT NULL,
    "designScale" DOUBLE PRECISION NOT NULL,
    "designRotation" DOUBLE PRECISION NOT NULL,
    "colorSelections" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "resultUrl" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Render_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserImage" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "processedUrl" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PSDTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "originalFile" TEXT NOT NULL,
    "parsedData" JSONB NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PSDTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "coverWidth" DOUBLE PRECISION NOT NULL DEFAULT 5.5,
    "coverHeight" DOUBLE PRECISION NOT NULL DEFAULT 8.5,
    "spineWidth" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "thumbnail" TEXT NOT NULL,
    "previewImage" TEXT NOT NULL,
    "baseImage" TEXT NOT NULL,
    "warpPreset" TEXT NOT NULL,
    "bookType" TEXT NOT NULL DEFAULT 'paperback',
    "showPages" BOOLEAN NOT NULL DEFAULT true,
    "pageColor" TEXT NOT NULL DEFAULT '#FFFAF0',
    "showShadow" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoverDesign" (
    "id" TEXT NOT NULL,
    "novelId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "model" TEXT,
    "prompt" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoverDesign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Template_slug_key" ON "Template"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BookTemplate_slug_key" ON "BookTemplate"("slug");

-- AddForeignKey
ALTER TABLE "TemplateLayer" ADD CONSTRAINT "TemplateLayer_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColorOption" ADD CONSTRAINT "ColorOption_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Render" ADD CONSTRAINT "Render_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
