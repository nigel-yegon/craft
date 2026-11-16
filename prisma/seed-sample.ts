// prisma/seed-sample.ts

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ═══ Business ═══
const BUSINESS_ID = "demo-business-001";
const BUSINESS_NAME = "Wanjiku General Store";

async function seedBusiness() {
  const existing = await prisma.business.findUnique({
    where: { id: BUSINESS_ID },
  });

  if (existing) {
    console.log("✓ Business already exists:", existing.id);
    return;
  }

  await prisma.business.create({
    data: {
      id: BUSINESS_ID,
      name: BUSINESS_NAME,
      phone: "+254712345678",
      email: "wanjiku@example.com",
    },
  });

  console.log("✓ Created business:", BUSINESS_ID);
}

// ═══ Notifications ═══
async function seedNotifications() {
  const count = await prisma.notification.count({
    where: { businessId: BUSINESS_ID },
  });

  if (count > 0) {
    console.log(`✓ Already ${count} notifications for this business — skipping`);
    return;
  }

  const now = Date.now();
  const notifications = [
    {
      type: "system",
      title: "Welcome to Craft POS",
      body: "Your shop is ready. Start by adding a few products, then make your first sale.",
      actionRoute: "/products",
      publishedAt: new Date(now - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    },
    {
      type: "alert",
      title: "Low stock detected",
      body: "3 products are running low. Restock soon to avoid missing sales.",
      actionRoute: "/inventory",
      publishedAt: new Date(now - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    },
    {
      type: "subscription",
      title: "4 days left in your trial",
      body: "You have 4 days left to explore all Pro features. Upgrade anytime to keep them forever.",
      actionRoute: "/settings/subscription",
      publishedAt: new Date(now - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      type: "backup",
      title: "Back up your data",
      body: "It's been a week since your last backup. Protect your products and sales by creating a new one.",
      actionRoute: "/settings/backup",
      publishedAt: new Date(now - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      type: "subscription",
      title: "Only 1 day left",
      body: "Your trial ends tomorrow. Subscribe now to keep unlimited products, reports, and cloud sync.",
      actionRoute: "/settings/subscription",
      publishedAt: new Date(now - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
  ];

  for (const n of notifications) {
    await prisma.notification.create({
      data: {
        businessId: BUSINESS_ID,
        type: n.type,
        title: n.title,
        body: n.body,
        actionRoute: n.actionRoute,
        publishedAt: n.publishedAt,
      },
    });
  }

  console.log(`✓ Created ${notifications.length} notifications`);
}

// ═══ BusinessBackups ═══
async function seedBackups() {
  const count = await prisma.businessBackup.count({
    where: { businessId: BUSINESS_ID },
  });

  if (count > 0) {
    console.log(`✓ Already ${count} backups for this business — skipping`);
    return;
  }

  const now = Date.now();
  const backups = [
    {
      filename: "demo-backup-2026-11-10.sqlite",
      sizeBytes: 48210,
      createdAt: new Date(now - 6 * 24 * 60 * 60 * 1000),
    },
    {
      filename: "demo-backup-2026-11-14.sqlite",
      sizeBytes: 51022,
      createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
    },
  ];

  // Ensure the uploads directory exists
  const { mkdir, writeFile } = await import("fs/promises");
  const { join } = await import("path");
  const dir = join(process.cwd(), "uploads", "backups", BUSINESS_ID);
  await mkdir(dir, { recursive: true });

  // Create fake .sqlite files so download doesn't 404
  for (const b of backups) {
    const filePath = join(dir, b.filename);
    const stub = `SQLite format 3\0FAKE BACKUP for demo purposes (${b.sizeBytes} bytes)`;
    await writeFile(filePath, stub, "utf8");
  }

  for (const b of backups) {
    await prisma.businessBackup.create({
      data: {
        businessId: BUSINESS_ID,
        filename: b.filename,
        sizeBytes: b.sizeBytes,
        createdAt: b.createdAt,
      },
    });
  }

  console.log(`✓ Created ${backups.length} backups (with stub files on disk)`);
}

// ═══ Optional: Team + Journal ═══
async function seedTeamAndJournal() {
  const teamCount = await prisma.teamMember.count();
  if (teamCount > 0) {
    console.log(`✓ Already ${teamCount} team members — skipping`);
  } else {
    await prisma.teamMember.create({
      data: {
        slug: "jane-wanjiku",
        name: "Jane Wanjiku",
        role: "Founder & Design Lead",
        bio: "Jane founded Wanjiku General Store in 2020 with a focus on locally-sourced goods. She handles product curation, supplier relationships, and daily operations.",
        shortBio: "Runs the shop, picks the products, knows every customer by name.",
        expertise: ["Retail", "Sourcing", "Customer Relations"],
        disciplines: ["operations", "curation"],
        location: "Nairobi, Kenya",
        yearsExperience: 8,
        published: true,
        featured: true,
      },
    });
    console.log("✓ Created 1 team member");
  }

  const journalCount = await prisma.journalPost.count();
  if (journalCount > 0) {
    console.log(`✓ Already ${journalCount} journal posts — skipping`);
  } else {
    const author = await prisma.teamMember.findFirst();
    await prisma.journalPost.create({
      data: {
        slug: "how-we-use-craft-pos",
        title: "How we use Craft POS to run a paperless shop",
        subtitle: "A shop owner's honest look at going digital",
        excerpt: "Six months ago we were drowning in receipts and notebooks. Here's how Craft POS changed our daily operations — for better and worse.",
        content: `When we started Wanjiku General Store, everything lived in a notebook. Sales were recorded on scraps of paper. Stock counts were a weekly guessing game.

Then we discovered Craft POS. Six months later, we've gone fully digital — and while it wasn't painless, I can't imagine going back.

## What works

Sales tracking is instant. Every sale updates our stock, our daily totals, and our reports — no manual tallying. The dashboard shows today's revenue, profit, and top sellers at a glance.

Offline-first means we never lose data. Even when M-Pesa is down, we keep selling. Sales sync up when we reconnect.

## What we're still learning

Reports took a few weeks to get used to. The numbers are right, but I had to unlearn some spreadsheet habits.

Overall, the switch paid for itself in the first month. If you're on the fence — jump.`,
        category: "CASE_STUDY",
        tags: ["operations", "case-study", "retail"],
        authorId: author?.id,
        readTimeMinutes: 5,
        published: true,
        featured: true,
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    });
    console.log("✓ Created 1 journal post");
  }
}

// ═══ Main ═══
async function main() {
  console.log("🌱 Seeding sample data...\n");

  await seedBusiness();
  await seedNotifications();
  await seedBackups();
  await seedTeamAndJournal();

  console.log("\n✅ Seed complete");

  // Print summary
  const [bizCount, notifCount, backupCount, teamCount, journalCount] =
    await Promise.all([
      prisma.business.count(),
      prisma.notification.count(),
      prisma.businessBackup.count(),
      prisma.teamMember.count(),
      prisma.journalPost.count(),
    ]);

  console.log("\n📊 Current counts:");
  console.log(`  Businesses:     ${bizCount}`);
  console.log(`  Notifications:  ${notifCount}`);
  console.log(`  Backups:        ${backupCount}`);
  console.log(`  Team members:   ${teamCount}`);
  console.log(`  Journal posts:  ${journalCount}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (e) => {
  console.error("❌ Seed failed:", e);
  await prisma.$disconnect();
  await pool.end();
  process.exit(1);
});