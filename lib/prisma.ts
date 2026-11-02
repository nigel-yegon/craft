// lib/prisma.ts
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/prisma/generated/prisma/client";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,                    // Maximum connections in the pool, adjusted based on database limits
  idleTimeoutMillis: 30_000,  // Idle connections are closed after 30 seconds
  connectionTimeoutMillis: 5_000, // Wait at most 5 seconds when acquiring a connection
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}