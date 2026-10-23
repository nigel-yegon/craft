// prisma/seed.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";
import { hash } from "bcryptjs";

// ─── Prisma client (adapter-based, matching lib/prisma.ts) ──
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

// ─── Seed data ──────────────────────────────────────────────
const SEED_PASSWORD = "password123";

const USERS = [
  {
    name: "Admin User",
    email: "admin@craft.studio",
    role: "ADMIN",
  },
  {
    name: "Nigel Yegon",
    email: "nigel@craft.studio",
    role: "TEAM",
  },
  {
    name: "Jane Client",
    email: "jane@example.com",
    role: "CLIENT",
  },
  {
    name: "Partner Co",
    email: "partner@example.com",
    role: "PARTNER",
  },
];

async function main() {
  console.log("→ Seeding database…\n");

  const passwordHash = await hash(SEED_PASSWORD, 12);

  for (const u of USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        // Keep name/role in sync if the seed data changes, but don't
        // overwrite a password the user may have changed after signup.
        name: u.name,
        role: u.role,
      },
      create: {
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
      },
    });

    console.log(`  ✓ ${user.email.padEnd(24)} ${user.role}`);
  }

  console.log(`\n✓ Seeded ${USERS.length} users.`);
  console.log(`\n  Password for all seeded accounts: ${SEED_PASSWORD}`);
  console.log("  Sign in at /login\n");
}

main()
  .catch((e) => {
    console.error("\n✗ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });