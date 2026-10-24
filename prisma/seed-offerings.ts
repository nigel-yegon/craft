// prisma/seed-offerings.ts

import type { PrismaClient } from "./prisma/generated/prisma/client";

type SeedOffering = {
  slug: string;
  name: string;
  description: string;
  kind: "SUBSCRIPTION" | "PRODUCT" | "SERVICE";
  category: string;
  pricingMode: "FIXED" | "QUOTE" | "RECURRING";
  fixedPrice?: number;
  recurringInterval?: "MONTHLY" | "QUARTERLY" | "ANNUAL";
  imageUrl?: string;
  featured?: boolean;
};

const SEED_OFFERINGS: SeedOffering[] = [
  // ─── SUBSCRIPTIONS (recurring) ────────────────────────────────
  {
    slug: "brand-retainer-monthly",
    name: "Brand Retainer — Monthly",
    description:
      "Ongoing brand stewardship: design updates, asset production, and monthly strategic reviews. Ideal for teams shipping continuously.",
    kind: "SUBSCRIPTION",
    category: "Retainers",
    pricingMode: "RECURRING",
    recurringInterval: "MONTHLY",
    fixedPrice: 85000,
    featured: true,
  },
  {
    slug: "digital-maintenance-quarterly",
    name: "Digital Maintenance — Quarterly",
    description:
      "Quarterly maintenance for websites and design systems: dependency updates, visual QA, and performance tuning.",
    kind: "SUBSCRIPTION",
    category: "Retainers",
    pricingMode: "RECURRING",
    recurringInterval: "QUARTERLY",
    fixedPrice: 120000,
  },
  {
    slug: "content-studio-annual",
    name: "Content Studio — Annual",
    description:
      "Annual content partnership: monthly photo/video production, copywriting, and channel management for a full year.",
    kind: "SUBSCRIPTION",
    category: "Retainers",
    pricingMode: "RECURRING",
    recurringInterval: "ANNUAL",
    fixedPrice: 960000,
  },

  // ─── PRODUCTS (fixed-price physical) ─────────────────────────
  {
    slug: "brand-guidelines-print-set",
    name: "Brand Guidelines — Print Set",
    description:
      "Boxed, printed brand guidelines: 120-page book, colour proof cards, and a USB with editable source files.",
    kind: "PRODUCT",
    category: "Printed Matter",
    pricingMode: "FIXED",
    fixedPrice: 42000,
    featured: true,
  },
  {
    slug: "signage-kit",
    name: "Signage Kit",
    description:
      "Modular interior signage kit — wayfinding panels, doorplates, and reception totem. Includes installation guides.",
    kind: "PRODUCT",
    category: "Physical Kits",
    pricingMode: "FIXED",
    fixedPrice: 65000,
  },
  {
    slug: "stationery-box",
    name: "Stationery Box",
    description:
      "Complete brand stationery set: letterheads, business cards, envelopes, and notecards on premium stock.",
    kind: "PRODUCT",
    category: "Printed Matter",
    pricingMode: "FIXED",
    fixedPrice: 18500,
  },

  // ─── SERVICES (quote-based) ─────────────────────────────────
  {
    slug: "brand-identity-system",
    name: "Brand Identity System",
    description:
      "Full identity engagement: discovery, positioning, wordmark, type system, colour system, and application kit.",
    kind: "SERVICE",
    category: "Brand",
    pricingMode: "QUOTE",
    featured: true,
  },
  {
    slug: "website-design-build",
    name: "Website — Design & Build",
    description:
      "End-to-end website: content strategy, design system, responsive build, CMS, and launch support.",
    kind: "SERVICE",
    category: "Digital",
    pricingMode: "QUOTE",
    featured: true,
  },
  {
    slug: "integrated-campaign",
    name: "Integrated Campaign",
    description:
      "Multi-channel campaign: strategy, creative, media plan, and production across print, digital, and OOH.",
    kind: "SERVICE",
    category: "Campaigns",
    pricingMode: "QUOTE",
  },
  {
    slug: "space-branding",
    name: "Space Branding",
    description:
      "Environmental design: wayfinding, signage, and interior branding for offices, retail, and hospitality.",
    kind: "SERVICE",
    category: "Spaces",
    pricingMode: "QUOTE",
  },
  {
    slug: "packaging-system",
    name: "Packaging System",
    description:
      "Packaging identity and system design — structural concepts, labels, and print-ready mechanicals.",
    kind: "SERVICE",
    category: "Print",
    pricingMode: "QUOTE",
  },
  {
    slug: "motion-reel",
    name: "Motion Reel",
    description:
      "Brand-level motion design: intro sequence, lower thirds, and a 30-second reel tailored for social and events.",
    kind: "SERVICE",
    category: "Digital",
    pricingMode: "QUOTE",
  },
];

export async function seedOfferings(prisma: PrismaClient) {
  console.log("🎨 Seeding offerings…");

  let created = 0;
  let skipped = 0;

  for (const o of SEED_OFFERINGS) {
    const existing = await prisma.offering.findUnique({
      where: { slug: o.slug },
    });
    if (existing) {
      skipped += 1;
      continue;
    }

    await prisma.offering.create({
      data: {
        slug: o.slug,
        name: o.name,
        description: o.description,
        kind: o.kind,
        category: o.category,
        pricingMode: o.pricingMode,
        fixedPrice: o.fixedPrice ?? null,
        recurringInterval: o.recurringInterval ?? null,
        imageUrl: o.imageUrl ?? null,
        featured: o.featured ?? false,
        active: true,
      },
    });
    created += 1;
  }

  console.log(`   created ${created}, skipped ${skipped} existing`);
}