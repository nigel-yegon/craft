// app/admin/actions/quotes.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createInvoice, sendPaymentPrompt } from "./payments";

// ─── Types ────────────────────────────────────────────────────────

export type QuoteRequestItemRow = {
  id: number;
  offeringName: string;
  offeringKind: string;
  pricingMode: string;
  quantity: number;
  notes: string | null;
};

export type QuoteRequestRow = {
  id: number;
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  company: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  items: QuoteRequestItemRow[];
};

export type QuoteLineItem = {
  label: string;
  qty: number;
  unitPrice: number;
};

export type QuoteRow = {
  id: number;
  reference: string;
  quoteRequestId: number;
  quoteRequestReference: string;
  lineItems: QuoteLineItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  validUntil: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
};

// ─── Helpers ──────────────────────────────────────────────────────

async function nextQuoteRequestReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `QR-${year}-`;
  const last = await prisma.quoteRequest.findFirst({
    where: { reference: { startsWith: prefix } },
    orderBy: { reference: "desc" },
    select: { reference: true },
  });
  const seq = last ? parseInt(last.reference.slice(prefix.length), 10) + 1 : 1;
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

async function nextQuoteReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `Q-${year}-`;
  const last = await prisma.quote.findFirst({
    where: { reference: { startsWith: prefix } },
    orderBy: { reference: "desc" },
    select: { reference: true },
  });
  const seq = last ? parseInt(last.reference.slice(prefix.length), 10) + 1 : 1;
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

// ─── Reads ────────────────────────────────────────────────────────

export async function listQuoteRequests(): Promise<QuoteRequestRow[]> {
  const rows = await prisma.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  return rows.map((r) => ({
    id: r.id,
    reference: r.reference,
    customerName: r.customerName,
    customerEmail: r.customerEmail,
    customerPhone: r.customerPhone,
    company: r.company,
    notes: r.notes,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    items: r.items.map((i) => ({
      id: i.id,
      offeringName: i.offeringName,
      offeringKind: i.offeringKind,
      pricingMode: i.pricingMode,
      quantity: i.quantity,
      notes: i.notes,
    })),
  }));
}

export async function listQuotes(): Promise<QuoteRow[]> {
  const rows = await prisma.quote.findMany({
    orderBy: { createdAt: "desc" },
    include: { quoteRequest: true },
  });
  return rows.map((r) => ({
    id: r.id,
    reference: r.reference,
    quoteRequestId: r.quoteRequestId,
    quoteRequestReference: r.quoteRequest.reference,
    lineItems: r.lineItems as QuoteLineItem[],
    subtotal: r.subtotal,
    taxAmount: r.taxAmount,
    total: r.total,
    currency: r.currency,
    validUntil: r.validUntil?.toISOString() ?? null,
    notes: r.notes,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));
}

// ─── Writes ───────────────────────────────────────────────────────

export async function createQuote(input: {
  quoteRequestId: number;
  lineItems: QuoteLineItem[];
  taxRate?: number;
  validDays?: number;
  notes?: string;
}) {
  const request = await prisma.quoteRequest.findUnique({
    where: { id: input.quoteRequestId },
  });
  if (!request) throw new Error("Quote request not found");
  if (request.status === "QUOTED" || request.status === "INVOICED") {
    throw new Error("This request has already been quoted");
  }

  const subtotal = input.lineItems.reduce(
    (sum, li) => sum + li.qty * li.unitPrice,
    0,
  );
  const taxAmount = Math.round(subtotal * (input.taxRate ?? 0));
  const total = subtotal + taxAmount;

  const reference = await nextQuoteReference();
  const validUntil = input.validDays
    ? new Date(Date.now() + input.validDays * 24 * 60 * 60 * 1000)
    : null;

  const quote = await prisma.quote.create({
    data: {
      reference,
      quoteRequestId: input.quoteRequestId,
      lineItems: input.lineItems,
      subtotal,
      taxAmount,
      total,
      currency: "KES",
      validUntil,
      notes: input.notes ?? null,
      status: "SENT",
    },
  });

  await prisma.quoteRequest.update({
    where: { id: input.quoteRequestId },
    data: { status: "QUOTED" },
  });

  revalidatePath("/admin");
  return { reference: quote.reference, id: quote.id };
}

export async function updateQuoteStatus(id: number, status: string) {
  await prisma.quote.update({ where: { id }, data: { status } });
  revalidatePath("/admin");
}

export async function deleteQuoteRequest(id: number) {
  await prisma.quoteRequest.delete({ where: { id } });
  revalidatePath("/admin");
}

// ─── Convert accepted quote → invoice + STK Push ─────────────────

export async function convertQuoteToInvoice(quoteId: number) {
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { quoteRequest: true, invoice: true },
  });
  if (!quote) throw new Error("Quote not found");
  if (quote.status !== "ACCEPTED") {
    throw new Error("Only accepted quotes can be converted to invoices");
  }
  if (quote.invoice) {
    throw new Error("This quote has already been invoiced");
  }

  const req = quote.quoteRequest;
  const lineItems = quote.lineItems as QuoteLineItem[];

  const description =
    lineItems.length === 1
      ? lineItems[0].label
      : `Quote ${quote.reference}: ${lineItems
          .map((li) => li.label)
          .slice(0, 3)
          .join(", ")}${lineItems.length > 3 ? ` +${lineItems.length - 3} more` : ""}`;

  const invoice = await createInvoice({
    customerName: req.customerName,
    customerPhone: req.customerPhone,
    customerEmail: req.customerEmail,
    amount: quote.total,
    description: description.slice(0, 200),
    quoteId: quote.id,
  });

  await prisma.$transaction([
    prisma.quote.update({
      where: { id: quote.id },
      data: { status: "INVOICED" },
    }),
    prisma.quoteRequest.update({
      where: { id: req.id },
      data: { status: "INVOICED" },
    }),
  ]);

  revalidatePath("/admin");

  let prompt:
    | { checkoutRequestId: string }
    | { error: string };

  try {
    prompt = await sendPaymentPrompt(invoice.id);
  } catch (err) {
    prompt = {
      error: err instanceof Error ? err.message : "STK Push failed",
    };
  }

  return {
    invoiceNumber: invoice.invoiceNumber,
    invoiceId: invoice.id,
    amount: invoice.amount,
    prompt,
  };
}