// prisma/seed-payments.ts
//
// Seeds sample invoices and M-Pesa transactions for the Payments module.
//
// Usage:
//   npx tsx prisma/seed-payments.ts
//
// Or via package.json script:
//   npm run db:seed:payments

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./prisma/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

// ─── Sample data ──────────────────────────────────────────────────

type SeedInvoice = {
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  description: string | null;
  amount: number;
  status: "PENDING" | "PAID" | "CANCELLED" | "FAILED";
  dueDate: Date | null;
  paidAt: Date | null;
  createdAt: Date;
  transactions: SeedTransaction[];
};

type SeedTransaction = {
  checkoutRequestId: string;
  mpesaReceiptNumber: string | null;
  phoneNumber: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
  resultCode: string | null;
  resultDesc: string | null;
  createdAt: Date;
};

const now = Date.now();
const daysAgo = (n: number) => new Date(now - n * 24 * 60 * 60 * 1000);
const hoursAgo = (n: number) => new Date(now - n * 60 * 60 * 1000);

const SAMPLE_INVOICES: SeedInvoice[] = [
  {
    invoiceNumber: "INV-2026-0001",
    customerName: "Jane Wanjiku",
    customerPhone: "254712345678",
    description: "Mara Safari — 3 days, 2 people",
    amount: 45000,
    status: "PAID",
    dueDate: daysAgo(-2),
    paidAt: daysAgo(5),
    createdAt: daysAgo(10),
    transactions: [
      {
        checkoutRequestId: "ws_CO_SEED_001",
        mpesaReceiptNumber: "QAF4XYZ1AB",
        phoneNumber: "254712345678",
        amount: 45000,
        status: "SUCCESS",
        resultCode: "0",
        resultDesc: "The service request is processed successfully.",
        createdAt: daysAgo(5),
      },
    ],
  },
  {
    invoiceNumber: "INV-2026-0002",
    customerName: "Brian Otieno",
    customerPhone: "254798765432",
    description: "Diani Beach package — 5 days",
    amount: 82000,
    status: "PENDING",
    dueDate: daysAgo(-15),
    paidAt: null,
    createdAt: daysAgo(3),
    transactions: [
      {
        checkoutRequestId: "ws_CO_SEED_002",
        mpesaReceiptNumber: null,
        phoneNumber: "254798765432",
        amount: 82000,
        status: "PENDING",
        resultCode: null,
        resultDesc: null,
        createdAt: hoursAgo(4),
      },
    ],
  },
  {
    invoiceNumber: "INV-2026-0003",
    customerName: "Aisha Mohamed",
    customerPhone: "254711223344",
    description: "Amboseli day trip",
    amount: 15500,
    status: "PAID",
    dueDate: daysAgo(-1),
    paidAt: daysAgo(2),
    createdAt: daysAgo(6),
    transactions: [
      {
        checkoutRequestId: "ws_CO_SEED_003",
        mpesaReceiptNumber: "QAF8LMN3CD",
        phoneNumber: "254711223344",
        amount: 15500,
        status: "SUCCESS",
        resultCode: "0",
        resultDesc: "The service request is processed successfully.",
        createdAt: daysAgo(2),
      },
    ],
  },
  {
    invoiceNumber: "INV-2026-0004",
    customerName: "Peter Kariuki",
    customerPhone: "254722334455",
    description: "Tsavo West — 2 days",
    amount: 29000,
    status: "FAILED",
    dueDate: daysAgo(2),
    paidAt: null,
    createdAt: daysAgo(8),
    transactions: [
      {
        checkoutRequestId: "ws_CO_SEED_004",
        mpesaReceiptNumber: null,
        phoneNumber: "254722334455",
        amount: 29000,
        status: "FAILED",
        resultCode: "1032",
        resultDesc: "Request cancelled by user.",
        createdAt: daysAgo(7),
      },
    ],
  },
  {
    invoiceNumber: "INV-2026-0005",
    customerName: "Grace Muthoni",
    customerPhone: "254733445566",
    description: "Nairobi city tour (half day)",
    amount: 6500,
    status: "PAID",
    dueDate: daysAgo(0),
    paidAt: daysAgo(1),
    createdAt: daysAgo(5),
    transactions: [
      {
        checkoutRequestId: "ws_CO_SEED_005",
        mpesaReceiptNumber: "QAF9PQR5EF",
        phoneNumber: "254733445566",
        amount: 6500,
        status: "SUCCESS",
        resultCode: "0",
        resultDesc: "The service request is processed successfully.",
        createdAt: daysAgo(1),
      },
    ],
  },
  {
    invoiceNumber: "INV-2026-0006",
    customerName: "Daniel Kimani",
    customerPhone: "254744556677",
    description: "Naivasha boat ride + lunch",
    amount: 9800,
    status: "CANCELLED",
    dueDate: daysAgo(-4),
    paidAt: null,
    createdAt: daysAgo(4),
    transactions: [],
  },
  {
    invoiceNumber: "INV-2026-0007",
    customerName: "Sarah Nduta",
    customerPhone: "254755667788",
    description: "Lake Nakuru flamingo tour — 1 day",
    amount: 12500,
    status: "PAID",
    dueDate: daysAgo(3),
    paidAt: hoursAgo(6),
    createdAt: daysAgo(9),
    transactions: [
      {
        checkoutRequestId: "ws_CO_SEED_007",
        mpesaReceiptNumber: "QAF2TUV7GH",
        phoneNumber: "254755667788",
        amount: 12500,
        status: "SUCCESS",
        resultCode: "0",
        resultDesc: "The service request is processed successfully.",
        createdAt: hoursAgo(6),
      },
    ],
  },
];

// ─── Seed logic ───────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding payments (invoices + M-Pesa transactions)…");

  // Idempotent: skip invoices that already exist by invoiceNumber.
  let created = 0;
  let skipped = 0;

  for (const inv of SAMPLE_INVOICES) {
    const existing = await prisma.invoice.findUnique({
      where: { invoiceNumber: inv.invoiceNumber },
    });

    if (existing) {
      skipped += 1;
      continue;
    }

    const { transactions, ...invoiceData } = inv;

    await prisma.invoice.create({
      data: {
        ...invoiceData,
        transactions: {
          create: transactions.map((t) => ({
            ...t,
            rawCallback: undefined,
          })),
        },
      },
    });

    created += 1;
  }

  console.log(
    `✅ Done. Created ${created} invoice(s), skipped ${skipped} existing invoice(s).`,
  );
  console.log(
    `   Transaction records seeded alongside each invoice where applicable.`,
  );
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });