// app/actions/store.ts
"use server";

import { prisma } from "@/lib/prisma";

// ─── Types ────────────────────────────────────────────────────────

export type OfferingKind = "SUBSCRIPTION" | "PRODUCT" | "SERVICE";
export type PricingMode = "FIXED" | "QUOTE" | "RECURRING";

export type OfferingRow = {
  id: number;
  slug: string;
  name: string;
  description: string;
  kind: OfferingKind;
  category: string;
  pricingMode: PricingMode;
  fixedPrice: number | null;
  recurringInterval: string | null;
  imageUrl: string | null;
  featured: boolean;
};

// ─── Catalogue ────────────────────────────────────────────────────

export async function listOfferings(): Promise<OfferingRow[]> {
  const rows = await prisma.offering.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(toRow);
}

export async function getOfferingBySlug(slug: string): Promise<OfferingRow | null> {
  const row = await prisma.offering.findUnique({ where: { slug } });
  return row ? toRow(row) : null;
}

function toRow(r: {
  id: number;
  slug: string;
  name: string;
  description: string;
  kind: string;
  category: string;
  pricingMode: string;
  fixedPrice: number | null;
  recurringInterval: string | null;
  imageUrl: string | null;
  featured: boolean;
}): OfferingRow {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    kind: r.kind as OfferingKind,
    category: r.category,
    pricingMode: r.pricingMode as PricingMode,
    fixedPrice: r.fixedPrice,
    recurringInterval: r.recurringInterval,
    imageUrl: r.imageUrl,
    featured: r.featured,
  };
}

// ─── Quote requests ──────────────────────────────────────────────

export type QuoteRequestLine = {
  offeringId: number;
  quantity: number;
  notes?: string;
};

export type QuoteRequestInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  company?: string;
  notes?: string;
  lines: QuoteRequestLine[];
};

async function nextQuoteRequestReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `QR-${year}-`;
  const last = await prisma.quoteRequest.findFirst({
    where: { reference: { startsWith: prefix } },
    orderBy: { reference: "desc" },
    select: { reference: true },
  });
  const seq = last
    ? parseInt(last.reference.slice(prefix.length), 10) + 1
    : 1;
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

export async function createQuoteRequest(input: QuoteRequestInput) {
  if (!input.lines.length) throw new Error("Cart is empty");

  const offerings = await prisma.offering.findMany({
    where: {
      id: { in: input.lines.map((l) => l.offeringId) },
      active: true,
    },
  });
  if (offerings.length !== input.lines.length) {
    throw new Error("One or more items are no longer available");
  }

  const reference = await nextQuoteRequestReference();

  const request = await prisma.quoteRequest.create({
    data: {
      reference,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      company: input.company ?? null,
      notes: input.notes ?? null,
      status: "NEW",
      items: {
        create: input.lines.map((line) => {
          const off = offerings.find((o) => o.id === line.offeringId)!;
          return {
            offeringId: off.id,
            offeringName: off.name,
            offeringKind: off.kind,
            pricingMode: off.pricingMode,
            quantity: Math.max(1, Math.floor(line.quantity)),
            notes: line.notes ?? null,
          };
        }),
      },
    },
  });

  return { reference: request.reference, id: request.id };
}