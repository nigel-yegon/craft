// app/admin/actions/offerings.ts
"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ─── Types ────────────────────────────────────────────────────────

export type OfferingKind = "SUBSCRIPTION" | "PRODUCT" | "SERVICE";
export type OfferingPricingMode = "FIXED" | "RECURRING" | "QUOTE";
export type OfferingRecurringInterval = "WEEKLY" | "MONTHLY" | "YEARLY";

export type OfferingRow = {
  id: number;
  slug: string;
  name: string;
  description: string;
  kind: OfferingKind;
  category: string;
  pricingMode: OfferingPricingMode;
  fixedPrice: number | null;
  recurringInterval: OfferingRecurringInterval | null;
  imageUrl: string | null;
  active: boolean;
  featured: boolean;
  createdAt: string;
};

// ─── Input validation ─────────────────────────────────────────────

const offeringInputSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be kebab-case (e.g. logo-design)"),
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  kind: z.enum(["SUBSCRIPTION", "PRODUCT", "SERVICE"]),
  category: z.string().min(1).max(80),
  pricingMode: z.enum(["FIXED", "RECURRING", "QUOTE"]),
  fixedPrice: z.number().int().min(0).nullable().optional(),
  recurringInterval: z.enum(["WEEKLY", "MONTHLY", "YEARLY"]).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export type OfferingInput = z.infer<typeof offeringInputSchema>;

// ─── Retry helper (matches stats.ts pattern) ──────────────────────

function isConnectionDrop(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string; message?: string };
  if (e.code === "P1017") return true;
  if (typeof e.message === "string") {
    const m = e.message.toLowerCase();
    return (
      m.includes("server has closed the connection") ||
      m.includes("connection terminated") ||
      m.includes("econnreset")
    );
  }
  return false;
}

async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 2, backoffMs = 250): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isConnectionDrop(err) || attempt === maxAttempts) break;
      await new Promise((r) => setTimeout(r, backoffMs * attempt));
    }
  }
  throw lastErr;
}

function toRow(item: {
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
  active: boolean;
  featured: boolean;
  createdAt: Date;
}): OfferingRow {
  return {
    ...item,
    kind: item.kind as OfferingKind,
    pricingMode: item.pricingMode as OfferingPricingMode,
    recurringInterval: item.recurringInterval as OfferingRecurringInterval | null,
    createdAt: item.createdAt.toISOString(),
  };
}

// ─── Queries ──────────────────────────────────────────────────────

export async function listOfferings(opts: { search?: string } = {}): Promise<OfferingRow[]> {
  const where = opts.search?.trim()
    ? {
        OR: [
          { name: { contains: opts.search, mode: "insensitive" as const } },
          { description: { contains: opts.search, mode: "insensitive" as const } },
          { category: { contains: opts.search, mode: "insensitive" as const } },
          { slug: { contains: opts.search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const rows = await withRetry(() =>
    prisma.offering.findMany({
      where,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    })
  );

  return rows.map(toRow);
}

export async function getOffering(id: number): Promise<OfferingRow | null> {
  const row = await withRetry(() => prisma.offering.findUnique({ where: { id } }));
  return row ? toRow(row) : null;
}

// ─── Mutations ────────────────────────────────────────────────────

export async function createOffering(input: OfferingInput): Promise<OfferingRow> {
  const parsed = offeringInputSchema.parse(input);

  // Enforce: FIXED/RECURRING must have a price; QUOTE must not.
  if (parsed.pricingMode === "QUOTE" && parsed.fixedPrice != null) {
    throw new Error("QUOTE offerings must not have a fixed price");
  }
  if (parsed.pricingMode !== "QUOTE" && (parsed.fixedPrice == null || parsed.fixedPrice <= 0)) {
    throw new Error("FIXED/RECURRING offerings must have a positive price");
  }
  if (parsed.pricingMode === "RECURRING" && !parsed.recurringInterval) {
    throw new Error("RECURRING offerings must have a recurring interval");
  }
  if (parsed.pricingMode === "FIXED" && parsed.recurringInterval) {
    throw new Error("FIXED offerings must not have a recurring interval");
  }

  const row = await withRetry(() =>
    prisma.offering.create({
      data: {
        slug: parsed.slug,
        name: parsed.name,
        description: parsed.description,
        kind: parsed.kind,
        category: parsed.category,
        pricingMode: parsed.pricingMode,
        fixedPrice: parsed.fixedPrice ?? null,
        recurringInterval: parsed.recurringInterval ?? null,
        imageUrl: parsed.imageUrl ?? null,
        active: parsed.active,
        featured: parsed.featured,
      },
    })
  );
  return toRow(row);
}

export async function updateOffering(
  id: number,
  input: Partial<OfferingInput>
): Promise<OfferingRow> {
  const partial = offeringInputSchema.partial().parse(input);

  // If pricingMode is changing, re-validate cross-field rules
  if (partial.pricingMode || partial.fixedPrice !== undefined || partial.recurringInterval !== undefined) {
    const current = await prisma.offering.findUnique({ where: { id } });
    if (!current) throw new Error("Offering not found");

    const merged = {
      pricingMode: partial.pricingMode ?? current.pricingMode,
      fixedPrice: partial.fixedPrice !== undefined ? partial.fixedPrice : current.fixedPrice,
      recurringInterval:
        partial.recurringInterval !== undefined
          ? partial.recurringInterval
          : current.recurringInterval,
    };

    if (merged.pricingMode === "QUOTE" && merged.fixedPrice != null) {
      throw new Error("QUOTE offerings must not have a fixed price");
    }
    if (merged.pricingMode !== "QUOTE" && (merged.fixedPrice == null || merged.fixedPrice <= 0)) {
      throw new Error("FIXED/RECURRING offerings must have a positive price");
    }
    if (merged.pricingMode === "RECURRING" && !merged.recurringInterval) {
      throw new Error("RECURRING offerings must have a recurring interval");
    }
    if (merged.pricingMode === "FIXED" && merged.recurringInterval) {
      throw new Error("FIXED offerings must not have a recurring interval");
    }
  }

  const row = await withRetry(() =>
    prisma.offering.update({ where: { id }, data: partial })
  );
  return toRow(row);
}

export async function deleteOffering(id: number): Promise<void> {
  await withRetry(() => prisma.offering.delete({ where: { id } }));
}

export async function toggleOfferingActive(id: number, active: boolean): Promise<OfferingRow> {
  const row = await withRetry(() =>
    prisma.offering.update({ where: { id }, data: { active } })
  );
  return toRow(row);
}

export async function toggleOfferingFeatured(id: number, featured: boolean): Promise<OfferingRow> {
  const row = await withRetry(() =>
    prisma.offering.update({ where: { id }, data: { featured } })
  );
  return toRow(row);
}