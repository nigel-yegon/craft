// app/admin/actions/rent.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type RentInvoiceRow = {
  id: number;
  businessId: string;
  unitId: string;
  unitNumber: string;
  propertyName: string;
  tenantName: string;
  tenantPhone: string;
  amount: number;
  forMonth: string;
  dueDate: string;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  paidAt: string | null;
  paymentId: number | null;
  createdAt: string;
  mpesaReceipt: string | null;
};

export async function listRentInvoices(): Promise<RentInvoiceRow[]> {
  const rows = await prisma.rentInvoice.findMany({
    orderBy: [{ forMonth: "desc" }, { createdAt: "desc" }],
    take: 500,
  });

  // Get receipts from MpesaTransaction for paid invoices
  const paymentIds = rows.map((r) => r.paymentId).filter((x): x is number => !!x);
  const payments = paymentIds.length
    ? await prisma.mpesaTransaction.findMany({
        where: { id: { in: paymentIds } },
        select: { id: true, mpesaReceiptNumber: true },
      })
    : [];
  const receiptMap = new Map(payments.map((p) => [p.id, p.mpesaReceiptNumber]));

  return rows.map((r) => ({
    id: r.id,
    businessId: r.businessId,
    unitId: r.unitId,
    unitNumber: r.unitNumber,
    propertyName: r.propertyName,
    tenantName: r.tenantName,
    tenantPhone: r.tenantPhone,
    amount: r.amount,
    forMonth: r.forMonth,
    dueDate: r.dueDate.toISOString(),
    status: r.status as RentInvoiceRow["status"],
    paidAt: r.paidAt?.toISOString() ?? null,
    paymentId: r.paymentId,
    createdAt: r.createdAt.toISOString(),
    mpesaReceipt: r.paymentId ? receiptMap.get(r.paymentId) ?? null : null,
  }));
}

export async function createRentInvoice(input: {
  businessId: string;
  unitId: string;
  unitNumber: string;
  propertyName: string;
  tenantName: string;
  tenantPhone: string;
  amount: number;
  forMonth: string;
  dueDay: number;
}): Promise<RentInvoiceRow> {
  if (!/^254(7|1)\d{8}$/.test(input.tenantPhone)) {
    throw new Error("Phone must be 2547XXXXXXXX or 2541XXXXXXXX");
  }
  if (!/^\d{4}-\d{2}$/.test(input.forMonth)) {
    throw new Error("forMonth must be YYYY-MM");
  }
  const [y, m] = input.forMonth.split("-").map(Number);
  const dueDate = new Date(Date.UTC(y, m - 1, input.dueDay ?? 5));

  const created = await prisma.rentInvoice.create({
    data: {
      businessId: input.businessId,
      unitId: input.unitId,
      unitNumber: input.unitNumber,
      propertyName: input.propertyName,
      tenantName: input.tenantName,
      tenantPhone: input.tenantPhone,
      amount: input.amount,
      forMonth: input.forMonth,
      dueDate,
      status: "PENDING",
    },
  });
  revalidatePath("/admin");
  return listRentInvoices().then((rows) => rows.find((r) => r.id === created.id)!);
}

export async function sendRentPrompt(rentInvoiceId: number): Promise<{
  checkoutRequestId: string;
  message: string;
}> {
  const inv = await prisma.rentInvoice.findUnique({
    where: { id: rentInvoiceId },
  });
  if (!inv) throw new Error("Rent invoice not found");
  if (inv.status === "PAID") throw new Error("Already paid");

  // Call the existing /api/mpesa/rent via fetch (reuse your deployed endpoint)
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://craft.co.ke";
  const res = await fetch(`${base}/api/mpesa/rent`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      phone: inv.tenantPhone,
      amount: inv.amount,
      tenantName: inv.tenantName,
      unitNumber: inv.unitNumber,
      forMonth: inv.forMonth,
      rentInvoiceId: inv.id, 
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `STK failed (${res.status})`);
  }
  const data = await res.json();

  // The /api/mpesa/rent route already created an Invoice and MpesaTransaction.
  // Link the latest PENDING transaction to the rent invoice.
  const tx = await prisma.mpesaTransaction.findFirst({
    where: {
      checkoutRequestId: data.checkoutRequestId,
    },
  });
  if (tx) {
    // If the route created a fresh Invoice, link it too
    await prisma.rentInvoice.update({
      where: { id: rentInvoiceId },
      data: { paymentId: tx.id },
    });
    if (tx.invoiceId) {
      // We have an Invoice (not RentInvoice). To keep reconciliation simple,
      // also mark the RentInvoice with the corresponding Invoice link by
      // copying the invoice ID into a comment for now. In a future schema,
      // add `invoiceRef Int?` to RentInvoice.
    }
  }

  revalidatePath("/admin");
  return { checkoutRequestId: data.checkoutRequestId, message: data.customerMessage ?? "STK sent" };
}

/**
 * Reconcile a rent invoice by checking the latest MpesaTransaction.
 * If SUCCESS, mark invoice PAID and set paidAt.
 */
export async function reconcileRentInvoice(rentInvoiceId: number): Promise<{
  status: "PAID" | "PENDING" | "FAILED" | "NONE";
  message?: string;
}> {
  const inv = await prisma.rentInvoice.findUnique({
    where: { id: rentInvoiceId },
  });
  if (!inv) throw new Error("Rent invoice not found");
  if (inv.status === "PAID") return { status: "PAID" };
  if (!inv.paymentId) return { status: "NONE" };

  const tx = await prisma.mpesaTransaction.findUnique({
    where: { id: inv.paymentId },
  });
  if (!tx) return { status: "NONE" };

  if (tx.status === "SUCCESS") {
    await prisma.rentInvoice.update({
      where: { id: rentInvoiceId },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
    });
    revalidatePath("/admin");
    return { status: "PAID" };
  }
  if (tx.status === "FAILED" || tx.status === "TIMEOUT") {
    return { status: "FAILED", message: tx.resultDesc ?? "Payment failed" };
  }
  return { status: "PENDING" };
}

export async function deleteRentInvoice(rentInvoiceId: number): Promise<void> {
  await prisma.rentInvoice.delete({ where: { id: rentInvoiceId } });
  revalidatePath("/admin");
}