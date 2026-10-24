// prisma/seed.ts
//
// Populates the database with sample data for local development.
//
// Usage (Prisma-native):
//   npx prisma db seed
//
// Also triggered automatically by:
//   npx prisma migrate reset
//
// Idempotent: re-running will not duplicate rows.

import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./prisma/generated/prisma/client";
import { seedOfferings } from "./seed-offerings";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

// ─── Helpers ──────────────────────────────────────────────────────

const now = Date.now();
const daysAgo = (n: number) => new Date(now - n * 24 * 60 * 60 * 1000);
const hoursAgo = (n: number) => new Date(now - n * 60 * 60 * 1000);

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

// ─── Users ────────────────────────────────────────────────────────

type SeedUser = {
  email: string;
  name: string;
  role: string;
  password: string;
};

const SEED_USERS: SeedUser[] = [
  { email: "admin@test.local", name: "Admin User", role: "ADMIN", password: "password123" },
  { email: "customer1@demo.local", name: "Traveller One", role: "CLIENT", password: "password123" },
  { email: "mara@business.local", name: "Mara Business Owner", role: "BUSINESS", password: "password123" },
  { email: "peruser1@demo.local", name: "Peruser One", role: "CLIENT", password: "password123" },
  { email: "verifier1@demo.local", name: "Verifier One", role: "VERIFIER", password: "password123" },
  { email: "committee1@demo.local", name: "Committee One", role: "COMMITTEE", password: "password123" },
  { email: "ps1@demo.local", name: "PS One", role: "PS", password: "password123" },
];

async function seedUsers() {
  console.log("👥 Seeding users…");
  let created = 0;
  let skipped = 0;

  for (const u of SEED_USERS) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      skipped += 1;
      continue;
    }
    await prisma.user.create({
      data: {
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash: await hash(u.password),
        emailVerified: new Date(),
        createdAt: daysAgo(30),
      },
    });
    created += 1;
  }

  console.log(`   created ${created}, skipped ${skipped} existing`);
}

// ─── Invoices & M-Pesa transactions ───────────────────────────────

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
  transactions: Array<{
    checkoutRequestId: string;
    mpesaReceiptNumber: string | null;
    phoneNumber: string;
    amount: number;
    status: "PENDING" | "SUCCESS" | "FAILED";
    resultCode: string | null;
    resultDesc: string | null;
    createdAt: Date;
  }>;
};

const SEED_INVOICES: SeedInvoice[] = [
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

async function seedPayments() {
  console.log("💳 Seeding invoices and M-Pesa transactions…");
  let created = 0;
  let skipped = 0;

  for (const inv of SEED_INVOICES) {
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
          create: transactions.map((t) => ({ ...t })),
        },
      },
    });
    created += 1;
  }

  console.log(`   created ${created}, skipped ${skipped} existing`);
}

// ─── Auth artifacts ───────────────────────────────────────────────

async function seedAuthArtifacts() {
  console.log("🔐 Seeding auth artifacts (session + account for admin)…");

  const admin = await prisma.user.findUnique({
    where: { email: "admin@test.local" },
  });
  if (!admin) {
    console.log("   admin user missing — skipping");
    return;
  }

  const existingAccount = await prisma.account.findFirst({
    where: { userId: admin.id, provider: "credentials" },
  });
  if (!existingAccount) {
    await prisma.account.create({
      data: {
        userId: admin.id,
        type: "credentials",
        provider: "credentials",
        providerAccountId: admin.id,
      },
    });
  }

  const existingSession = await prisma.session.findFirst({
    where: { userId: admin.id },
  });
  if (!existingSession) {
    await prisma.session.create({
      data: {
        sessionToken: "test-session-token-admin",
        userId: admin.id,
        expires: new Date(now + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log("   done");
}

// ─── Main ─────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱 Seeding database…\n");

  await seedUsers();
  await seedAuthArtifacts();
  await seedPayments();
  await seedOfferings(prisma);

  console.log("\n✅ All done.\n");
  console.log("Sample logins:");
  for (const u of SEED_USERS) {
    console.log(`   ${u.role.padEnd(9)}  ${u.email.padEnd(28)}  password: ${u.password}`);
  }
  console.log();
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });