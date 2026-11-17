-- CreateTable
CREATE TABLE "RentInvoice" (
    "id" SERIAL NOT NULL,
    "businessId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "unitNumber" TEXT NOT NULL,
    "propertyName" TEXT NOT NULL,
    "tenantName" TEXT NOT NULL,
    "tenantPhone" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "forMonth" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "paymentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegisteredUnit" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "propertyName" TEXT NOT NULL,
    "unitNumber" TEXT NOT NULL,
    "monthlyRent" INTEGER NOT NULL,
    "dueDay" INTEGER NOT NULL DEFAULT 5,
    "tenantName" TEXT,
    "tenantPhone" TEXT,
    "isOccupied" BOOLEAN NOT NULL DEFAULT false,
    "syncedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegisteredUnit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RentInvoice_businessId_forMonth_idx" ON "RentInvoice"("businessId", "forMonth");

-- CreateIndex
CREATE INDEX "RentInvoice_status_idx" ON "RentInvoice"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RentInvoice_unitId_forMonth_key" ON "RentInvoice"("unitId", "forMonth");

-- CreateIndex
CREATE INDEX "RegisteredUnit_businessId_isOccupied_idx" ON "RegisteredUnit"("businessId", "isOccupied");
