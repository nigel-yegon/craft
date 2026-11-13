-- AlterTable
ALTER TABLE "MpesaTransaction" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'invoice',
ADD COLUMN     "subscriptionPlan" TEXT;

-- CreateIndex
CREATE INDEX "MpesaTransaction_source_idx" ON "MpesaTransaction"("source");
