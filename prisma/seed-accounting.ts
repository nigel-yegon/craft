// prisma/seed-accounting.ts
//
// Populates the database with sample invoices, M-Pesa transactions, and
// expenses to demonstrate the Accounting module's revenue, expense,
// balance-sheet, and project-profitability views.
//
// Run standalone:
//   npx tsx prisma/seed-accounting.ts
//
// Or as part of the master seed (imported and called from prisma/seed.ts).

import type { PrismaClient } from "./prisma/generated/prisma/client";

// ─── Helpers ──────────────────────────────────────────────────────

const now = Date.now();
const daysAgo = (n: number) => new Date(now - n * 24 * 60 * 60 * 1000);
const hoursAgo = (n: number) => new Date(now - n * 60 * 60 * 1000);

// ─── Seed invoices & transactions ─────────────────────────────────
//
// These are separate from any quote-generated invoices so they don't
// collide with the `quoteId @unique` constraint. They represent direct
// billing outside the quote pipeline — corporate clients, retainers,
// and ad-hoc project work.

type SeedInvoice = {
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  description: string;
  amount: number;
  status: "PAID" | "PENDING" | "FAILED" | "CANCELLED";
  dueDate: Date | null;
  paidAt: Date | null;
  createdAt: Date;
  transactions: Array<{
    checkoutRequestId: string;
    mpesaReceiptNumber: string | null;
    phoneNumber: string;
    amount: number;
    status: "SUCCESS" | "PENDING" | "FAILED";
    resultCode: string | null;
    resultDesc: string | null;
    createdAt: Date;
  }>;
};

const SEED_INVOICES: SeedInvoice[] = [
  // ── Paid (revenue) ──────────────────────────────────────────────
  {
    invoiceNumber: "INV-2026-1001",
    customerName: "Sarova Hotels & Resorts",
    customerPhone: "254722110011",
    customerEmail: "accounts@sarovahotels.com",
    description: "Seasonal campaign — Q1 2026",
    amount: 420000,
    status: "PAID",
    dueDate: daysAgo(-5),
    paidAt: daysAgo(8),
    createdAt: daysAgo(20),
    transactions: [
      {
        checkoutRequestId: "ws_CO_ACC_1001",
        mpesaReceiptNumber: "QAF7ACC1001",
        phoneNumber: "254722110011",
        amount: 420000,
        status: "SUCCESS",
        resultCode: "0",
        resultDesc: "The service request is processed successfully.",
        createdAt: daysAgo(8),
      },
    ],
  },
  {
    invoiceNumber: "INV-2026-1002",
    customerName: "Kenya Breweries Limited",
    customerPhone: "254733220022",
    customerEmail: "finance@kbl.co.ke",
    description: "Portfolio brand refresh — milestone 2",
    amount: 680000,
    status: "PAID",
    dueDate: daysAgo(-12),
    paidAt: daysAgo(15),
    createdAt: daysAgo(35),
    transactions: [
      {
        checkoutRequestId: "ws_CO_ACC_1002",
        mpesaReceiptNumber: "QAF7ACC1002",
        phoneNumber: "254733220022",
        amount: 680000,
        status: "SUCCESS",
        resultCode: "0",
        resultDesc: "The service request is processed successfully.",
        createdAt: daysAgo(15),
      },
    ],
  },
  {
    invoiceNumber: "INV-2026-1003",
    customerName: "Wilcom Group",
    customerPhone: "254744330033",
    customerEmail: "accounts@wilcom.co.ke",
    description: "Corporate website — final delivery",
    amount: 295000,
    status: "PAID",
    dueDate: daysAgo(-3),
    paidAt: daysAgo(5),
    createdAt: daysAgo(25),
    transactions: [
      {
        checkoutRequestId: "ws_CO_ACC_1003",
        mpesaReceiptNumber: "QAF7ACC1003",
        phoneNumber: "254744330033",
        amount: 295000,
        status: "SUCCESS",
        resultCode: "0",
        resultDesc: "The service request is processed successfully.",
        createdAt: daysAgo(5),
      },
    ],
  },
  {
    invoiceNumber: "INV-2026-1004",
    customerName: "Baridi Ltd",
    customerPhone: "254755440044",
    customerEmail: "hello@baridi.co.ke",
    description: "Brand identity & e-commerce — launch",
    amount: 380000,
    status: "PAID",
    dueDate: daysAgo(-8),
    paidAt: hoursAgo(36),
    createdAt: daysAgo(30),
    transactions: [
      {
        checkoutRequestId: "ws_CO_ACC_1004",
        mpesaReceiptNumber: "QAF7ACC1004",
        phoneNumber: "254755440044",
        amount: 380000,
        status: "SUCCESS",
        resultCode: "0",
        resultDesc: "The service request is processed successfully.",
        createdAt: hoursAgo(36),
      },
    ],
  },
  {
    invoiceNumber: "INV-2026-1005",
    customerName: "Strathmore University",
    customerPhone: "254766550055",
    customerEmail: "finance@strathmore.edu",
    description: "Student hub wayfinding — installation complete",
    amount: 340000,
    status: "PAID",
    dueDate: daysAgo(-2),
    paidAt: daysAgo(4),
    createdAt: daysAgo(22),
    transactions: [
      {
        checkoutRequestId: "ws_CO_ACC_1005",
        mpesaReceiptNumber: "QAF7ACC1005",
        phoneNumber: "254766550055",
        amount: 340000,
        status: "SUCCESS",
        resultCode: "0",
        resultDesc: "The service request is processed successfully.",
        createdAt: daysAgo(4),
      },
    ],
  },
  {
    invoiceNumber: "INV-2026-1006",
    customerName: "Greenspoon Kenya",
    customerPhone: "254777660066",
    customerEmail: "finance@greenspoon.co.ke",
    description: "Farm to table campaign",
    amount: 210000,
    status: "PAID",
    dueDate: daysAgo(-1),
    paidAt: hoursAgo(48),
    createdAt: daysAgo(18),
    transactions: [
      {
        checkoutRequestId: "ws_CO_ACC_1006",
        mpesaReceiptNumber: "QAF7ACC1006",
        phoneNumber: "254777660066",
        amount: 210000,
        status: "SUCCESS",
        resultCode: "0",
        resultDesc: "The service request is processed successfully.",
        createdAt: hoursAgo(48),
      },
    ],
  },
  {
    invoiceNumber: "INV-2026-1007",
    customerName: "Java House Africa",
    customerPhone: "254788770077",
    customerEmail: "product@javahouseafrica.com",
    description: "Loyalty redesign — discovery phase",
    amount: 560000,
    status: "PAID",
    dueDate: daysAgo(-6),
    paidAt: daysAgo(9),
    createdAt: daysAgo(40),
    transactions: [
      {
        checkoutRequestId: "ws_CO_ACC_1007",
        mpesaReceiptNumber: "QAF7ACC1007",
        phoneNumber: "254788770077",
        amount: 560000,
        status: "SUCCESS",
        resultCode: "0",
        resultDesc: "The service request is processed successfully.",
        createdAt: daysAgo(9),
      },
    ],
  },

  // ── Pending (receivables) ───────────────────────────────────────
  {
    invoiceNumber: "INV-2026-1008",
    customerName: "Kenya Tourism Board",
    customerPhone: "254799880088",
    customerEmail: "finance@ktb.go.ke",
    description: "Tour Kenya portal — annual support retainer",
    amount: 1200000,
    status: "PENDING",
    dueDate: daysAgo(-30),
    paidAt: null,
    createdAt: daysAgo(7),
    transactions: [
      {
        checkoutRequestId: "ws_CO_ACC_1008",
        mpesaReceiptNumber: null,
        phoneNumber: "254799880088",
        amount: 1200000,
        status: "PENDING",
        resultCode: null,
        resultDesc: null,
        createdAt: hoursAgo(12),
      },
    ],
  },
  {
    invoiceNumber: "INV-2026-1009",
    customerName: "Uasin Gishu County",
    customerPhone: "254710990099",
    customerEmail: "finance@eldoretcity.go.ke",
    description: "Eldoret city portal — Q1 milestone",
    amount: 950000,
    status: "PENDING",
    dueDate: daysAgo(-20),
    paidAt: null,
    createdAt: daysAgo(3),
    transactions: [
      {
        checkoutRequestId: "ws_CO_ACC_1009",
        mpesaReceiptNumber: null,
        phoneNumber: "254710990099",
        amount: 950000,
        status: "PENDING",
        resultCode: null,
        resultDesc: null,
        createdAt: hoursAgo(6),
      },
    ],
  },
  {
    invoiceNumber: "INV-2026-1010",
    customerName: "Craft Studios (internal)",
    customerPhone: "254711001100",
    customerEmail: "accounts@craftstudios.co.ke",
    description: "Craft Labs design system — phase 2",
    amount: 75000,
    status: "PENDING",
    dueDate: daysAgo(-15),
    paidAt: null,
    createdAt: daysAgo(2),
    transactions: [],
  },

  // ── Failed (write-off candidates) ───────────────────────────────
  {
    invoiceNumber: "INV-2026-1011",
    customerName: "Kigali Coffee Cooperative",
    customerPhone: "254722003300",
    customerEmail: "finance@kigalicoffee.rw",
    description: "E-commerce platform — deposit",
    amount: 180000,
    status: "FAILED",
    dueDate: daysAgo(10),
    paidAt: null,
    createdAt: daysAgo(25),
    transactions: [
      {
        checkoutRequestId: "ws_CO_ACC_1011",
        mpesaReceiptNumber: null,
        phoneNumber: "254722003300",
        amount: 180000,
        status: "FAILED",
        resultCode: "1032",
        resultDesc: "Request cancelled by user.",
        createdAt: daysAgo(14),
      },
    ],
  },

  // ── Cancelled ───────────────────────────────────────────────────
  {
    invoiceNumber: "INV-2026-1012",
    customerName: "Heritage Foundation",
    customerPhone: "254733004400",
    customerEmail: "grants@heritagefoundation.co.ke",
    description: "Nakumatt archive — paused",
    amount: 90000,
    status: "CANCELLED",
    dueDate: daysAgo(-8),
    paidAt: null,
    createdAt: daysAgo(45),
    transactions: [],
  },
];

// ─── Seed expenses ────────────────────────────────────────────────
//
// Mix of categories, mostly linked to projects so project
// profitability has data to show.

type SeedExpense = {
  reference: string;
  description: string;
  category: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  incurredAt: Date;
  paidAt: Date | null;
  vendorName: string;
  projectSlug: string | null;
};

const SEED_EXPENSES: SeedExpense[] = [
  // ── Linked to Tour Kenya / NTSP ──────────────────────────────────
  {
    reference: "EXP-2026-0001",
    description: "Figma team seats — 12 months",
    category: "Software",
    amount: 180000,
    status: "APPROVED",
    incurredAt: daysAgo(90),
    paidAt: daysAgo(90),
    vendorName: "Figma Inc.",
    projectSlug: "tour-kenya-ntsp",
  },
  {
    reference: "EXP-2026-0002",
    description: "Photography commission — Mara & Amboseli",
    category: "Contractor",
    amount: 450000,
    status: "APPROVED",
    incurredAt: daysAgo(75),
    paidAt: daysAgo(70),
    vendorName: "Nairobi Visuals Ltd",
    projectSlug: "tour-kenya-ntsp",
  },
  {
    reference: "EXP-2026-0003",
    description: "Cloudinary CDN — annual plan",
    category: "Software",
    amount: 60000,
    status: "APPROVED",
    incurredAt: daysAgo(60),
    paidAt: daysAgo(60),
    vendorName: "Cloudinary",
    projectSlug: "tour-kenya-ntsp",
  },

  // ── Linked to Eldoret City ──────────────────────────────────────
  {
    reference: "EXP-2026-0004",
    description: "Contract developer — 8 weeks",
    category: "Contractor",
    amount: 640000,
    status: "APPROVED",
    incurredAt: daysAgo(50),
    paidAt: daysAgo(48),
    vendorName: "John Mwangi",
    projectSlug: "eldoret-city-portal",
  },
  {
    reference: "EXP-2026-0005",
    description: "Sentry — team plan",
    category: "Software",
    amount: 45000,
    status: "APPROVED",
    incurredAt: daysAgo(40),
    paidAt: daysAgo(38),
    vendorName: "Sentry.io",
    projectSlug: "eldoret-city-portal",
  },

  // ── Linked to Baridi ────────────────────────────────────────────
  {
    reference: "EXP-2026-0006",
    description: "Packaging print run — 5,000 units",
    category: "Equipment",
    amount: 320000,
    status: "APPROVED",
    incurredAt: daysAgo(70),
    paidAt: daysAgo(65),
    vendorName: "PrintWorks Nairobi",
    projectSlug: "baridi-brand-identity",
  },
  {
    reference: "EXP-2026-0007",
    description: "E-commerce Shopify subscription",
    category: "Software",
    amount: 36000,
    status: "APPROVED",
    incurredAt: daysAgo(55),
    paidAt: daysAgo(55),
    vendorName: "Shopify",
    projectSlug: "baridi-brand-identity",
  },

  // ── Linked to Wilcom ────────────────────────────────────────────
  {
    reference: "EXP-2026-0008",
    description: "Photography — corporate portfolio shoot",
    category: "Contractor",
    amount: 185000,
    status: "APPROVED",
    incurredAt: daysAgo(85),
    paidAt: daysAgo(80),
    vendorName: "Peter Kariuki Photography",
    projectSlug: "wilcom-corporate-site",
  },
  {
    reference: "EXP-2026-0009",
    description: "Sanity CMS — Pro plan",
    category: "Software",
    amount: 24000,
    status: "APPROVED",
    incurredAt: daysAgo(65),
    paidAt: daysAgo(65),
    vendorName: "Sanity.io",
    projectSlug: "wilcom-corporate-site",
  },

  // ── Linked to Sarova ────────────────────────────────────────────
  {
    reference: "EXP-2026-0010",
    description: "Print production — OOH + in-property collateral",
    category: "Equipment",
    amount: 380000,
    status: "APPROVED",
    incurredAt: daysAgo(45),
    paidAt: daysAgo(42),
    vendorName: "ColorPrint Kenya",
    projectSlug: "sarova-digital-campaign",
  },

  // ── Linked to Strathmore ────────────────────────────────────────
  {
    reference: "EXP-2026-0011",
    description: "Signage fabrication & installation",
    category: "Equipment",
    amount: 220000,
    status: "APPROVED",
    incurredAt: daysAgo(35),
    paidAt: daysAgo(30),
    vendorName: "SignAge Ltd",
    projectSlug: "strathmore-student-hub-signage",
  },
  {
    reference: "EXP-2026-0012",
    description: "AutoCAD licence — annual",
    category: "Software",
    amount: 52000,
    status: "APPROVED",
    incurredAt: daysAgo(100),
    paidAt: daysAgo(100),
    vendorName: "Autodesk",
    projectSlug: "strathmore-student-hub-signage",
  },

  // ── Linked to Greenspoon ────────────────────────────────────────
  {
    reference: "EXP-2026-0013",
    description: "Short film production",
    category: "Contractor",
    amount: 145000,
    status: "APPROVED",
    incurredAt: daysAgo(28),
    paidAt: daysAgo(25),
    vendorName: "Frame Studio",
    projectSlug: "greenspoon-farm-to-table",
  },

  // ── Linked to Java House ────────────────────────────────────────
  {
    reference: "EXP-2026-0014",
    description: "React Native contract developer — 4 weeks",
    category: "Contractor",
    amount: 320000,
    status: "PENDING",
    incurredAt: daysAgo(5),
    paidAt: null,
    vendorName: "Alice Njeri",
    projectSlug: "java-house-loyalty-redesign",
  },
  {
    reference: "EXP-2026-0015",
    description: "Storybook — no cost (open source)",
    category: "Software",
    amount: 0,
    status: "APPROVED",
    incurredAt: daysAgo(6),
    paidAt: daysAgo(6),
    vendorName: "Open source",
    projectSlug: "java-house-loyalty-redesign",
  },

  // ── Unlinked overhead ───────────────────────────────────────────
  {
    reference: "EXP-2026-0016",
    description: "Office rent — Q1 2026",
    category: "Office",
    amount: 450000,
    status: "APPROVED",
    incurredAt: daysAgo(20),
    paidAt: daysAgo(18),
    vendorName: "Riverside Square",
    projectSlug: null,
  },
  {
    reference: "EXP-2026-0017",
    description: "Team travel — Eldoret site visit",
    category: "Travel",
    amount: 85000,
    status: "APPROVED",
    incurredAt: daysAgo(15),
    paidAt: daysAgo(12),
    vendorName: "Kenya Airways",
    projectSlug: "eldoret-city-portal",
  },
  {
    reference: "EXP-2026-0018",
    description: "Internet & utilities — Q1 2026",
    category: "Office",
    amount: 38000,
    status: "APPROVED",
    incurredAt: daysAgo(10),
    paidAt: daysAgo(8),
    vendorName: "Safaricom Business",
    projectSlug: null,
  },
  {
    reference: "EXP-2026-0019",
    description: "Team lunch — launch celebration",
    category: "Other",
    amount: 18000,
    status: "PENDING",
    incurredAt: daysAgo(2),
    paidAt: null,
    vendorName: "The Alchemist",
    projectSlug: null,
  },
  {
    reference: "EXP-2026-0020",
    description: "Vercel Pro plan — monthly",
    category: "Software",
    amount: 28000,
    status: "APPROVED",
    incurredAt: daysAgo(3),
    paidAt: daysAgo(3),
    vendorName: "Vercel",
    projectSlug: null,
  },
];

// ─── Seed function ────────────────────────────────────────────────

export async function seedAccounting(prisma: PrismaClient) {
  console.log("💼 Seeding accounting (invoices + expenses)…");

  // Map project slugs → IDs so expenses can link correctly
  const projects = await prisma.project.findMany({
    select: { id: true, slug: true },
  });
  const projectBySlug = new Map(projects.map((p) => [p.slug, p.id]));

  // ── Invoices ────────────────────────────────────────────────────
  let invCreated = 0;
  let invSkipped = 0;

  for (const inv of SEED_INVOICES) {
    const existing = await prisma.invoice.findUnique({
      where: { invoiceNumber: inv.invoiceNumber },
    });
    if (existing) {
      invSkipped += 1;
      continue;
    }

    const { transactions, ...invoiceData } = inv;

    await prisma.invoice.create({
      data: {
        ...invoiceData,
        transactions: {
          create: transactions,
        },
      },
    });
    invCreated += 1;
  }

  console.log(`   invoices: created ${invCreated}, skipped ${invSkipped} existing`);

  // ── Expenses ────────────────────────────────────────────────────
  let expCreated = 0;
  let expSkipped = 0;

  for (const exp of SEED_EXPENSES) {
    const existing = await prisma.expense.findUnique({
      where: { reference: exp.reference },
    });
    if (existing) {
      expSkipped += 1;
      continue;
    }

    const projectId = exp.projectSlug
      ? projectBySlug.get(exp.projectSlug) ?? null
      : null;

    if (exp.projectSlug && !projectId) {
      console.warn(
        `   ⚠ expense ${exp.reference}: project slug "${exp.projectSlug}" not found — creating unlinked`,
      );
    }

    await prisma.expense.create({
      data: {
        reference: exp.reference,
        description: exp.description,
        category: exp.category,
        amount: exp.amount,
        status: exp.status,
        incurredAt: exp.incurredAt,
        paidAt: exp.paidAt,
        vendorName: exp.vendorName,
        projectId,
      },
    });
    expCreated += 1;
  }

  console.log(`   expenses: created ${expCreated}, skipped ${expSkipped} existing`);

  // ── Summary ─────────────────────────────────────────────────────
  const [paidTotal, pendingTotal, expenseApproved, expensePending] =
    await Promise.all([
      prisma.invoice.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
      prisma.invoice.aggregate({
        where: { status: "PENDING" },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { status: "APPROVED" },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { status: "PENDING" },
        _sum: { amount: true },
      }),
    ]);

  console.log(
    `   revenue (paid):     KES ${(paidTotal._sum.amount ?? 0).toLocaleString()}`,
  );
  console.log(
    `   receivables (pend): KES ${(pendingTotal._sum.amount ?? 0).toLocaleString()}`,
  );
  console.log(
    `   expenses (appr):    KES ${(expenseApproved._sum.amount ?? 0).toLocaleString()}`,
  );
  console.log(
    `   payables (pend):    KES ${(expensePending._sum.amount ?? 0).toLocaleString()}`,
  );
}