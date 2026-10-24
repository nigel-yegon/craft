-- CreateTable
CREATE TABLE "Offering" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "pricingMode" TEXT NOT NULL,
    "fixedPrice" INTEGER,
    "recurringInterval" TEXT,
    "imageUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Offering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteRequest" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "company" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteRequestItem" (
    "id" SERIAL NOT NULL,
    "quoteRequestId" INTEGER NOT NULL,
    "offeringId" INTEGER,
    "offeringName" TEXT NOT NULL,
    "offeringKind" TEXT NOT NULL,
    "pricingMode" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,

    CONSTRAINT "QuoteRequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Offering_slug_key" ON "Offering"("slug");

-- CreateIndex
CREATE INDEX "Offering_kind_idx" ON "Offering"("kind");

-- CreateIndex
CREATE INDEX "Offering_category_idx" ON "Offering"("category");

-- CreateIndex
CREATE INDEX "Offering_active_idx" ON "Offering"("active");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteRequest_reference_key" ON "QuoteRequest"("reference");

-- CreateIndex
CREATE INDEX "QuoteRequest_status_idx" ON "QuoteRequest"("status");

-- CreateIndex
CREATE INDEX "QuoteRequest_customerEmail_idx" ON "QuoteRequest"("customerEmail");

-- CreateIndex
CREATE INDEX "QuoteRequestItem_quoteRequestId_idx" ON "QuoteRequestItem"("quoteRequestId");

-- AddForeignKey
ALTER TABLE "QuoteRequestItem" ADD CONSTRAINT "QuoteRequestItem_quoteRequestId_fkey" FOREIGN KEY ("quoteRequestId") REFERENCES "QuoteRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteRequestItem" ADD CONSTRAINT "QuoteRequestItem_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "Offering"("id") ON DELETE SET NULL ON UPDATE CASCADE;
