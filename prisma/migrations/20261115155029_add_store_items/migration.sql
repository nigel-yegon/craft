-- CreateTable
CREATE TABLE "StoreItem" (
    "id" SERIAL NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT,
    "barcode" TEXT,
    "categoryName" TEXT,
    "sellingPriceMinor" INTEGER NOT NULL,
    "costPriceMinor" INTEGER,
    "stockMilli" INTEGER NOT NULL DEFAULT 0,
    "lowStockThresholdMilli" INTEGER NOT NULL DEFAULT 5000,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoreItem_businessId_idx" ON "StoreItem"("businessId");

-- CreateIndex
CREATE INDEX "StoreItem_businessId_isActive_idx" ON "StoreItem"("businessId", "isActive");

-- CreateIndex
CREATE INDEX "StoreItem_businessId_updatedAt_idx" ON "StoreItem"("businessId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "StoreItem_businessId_sku_key" ON "StoreItem"("businessId", "sku");
