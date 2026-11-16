-- CreateTable
CREATE TABLE "BusinessBackup" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessBackup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessBackup_businessId_createdAt_idx" ON "BusinessBackup"("businessId", "createdAt");
