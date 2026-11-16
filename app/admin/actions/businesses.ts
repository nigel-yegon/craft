// app/admin/actions/businesses.ts
"use server";

import { prisma } from "@/lib/prisma";

export type BusinessSummary = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  createdAt: string;
  notificationCount: number;
  backupCount: number;
  lastNotificationAt: string | null;
  lastBackupAt: string | null;
};

export type BusinessDetail = BusinessSummary & {
  recentNotifications: Array<{
    id: string;
    type: string;
    title: string;
    publishedAt: string;
  }>;
  recentBackups: Array<{
    id: string;
    filename: string;
    sizeBytes: number;
    createdAt: string;
  }>;
};

export type BackupRow = {
  id: string;
  businessId: string;
  businessName: string;
  filename: string;
  sizeBytes: number;
  createdAt: string;
};

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

async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 2,
  backoffMs = 250
): Promise<T> {
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

/// Lists all registered businesses with summary counts.
export async function listBusinesses(
  opts: { search?: string } = {}
): Promise<BusinessSummary[]> {
  const q = opts.search?.trim().toLowerCase() ?? "";

  const businesses = await withRetry(() =>
    prisma.business.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        createdAt: true,
      },
    })
  );

  const results: BusinessSummary[] = await Promise.all(
    businesses.map(async (b) => {
      const [notifCount, backupCount, lastNotif, lastBackup] =
        await Promise.all([
          prisma.notification.count({ where: { businessId: b.id } }),
          prisma.businessBackup.count({ where: { businessId: b.id } }),
          prisma.notification.findFirst({
            where: { businessId: b.id },
            orderBy: { publishedAt: "desc" },
            select: { publishedAt: true },
          }),
          prisma.businessBackup.findFirst({
            where: { businessId: b.id },
            orderBy: { createdAt: "desc" },
            select: { createdAt: true },
          }),
        ]);

      return {
        id: b.id,
        name: b.name,
        phone: b.phone,
        email: b.email,
        createdAt: b.createdAt.toISOString(),
        notificationCount: notifCount,
        backupCount,
        lastNotificationAt:
          lastNotif?.publishedAt.toISOString() ?? null,
        lastBackupAt: lastBackup?.createdAt.toISOString() ?? null,
      };
    })
  );

  if (!q) return results;
  return results.filter(
    (b) =>
      b.id.toLowerCase().includes(q) ||
      b.name.toLowerCase().includes(q) ||
      (b.phone?.toLowerCase().includes(q) ?? false) ||
      (b.email?.toLowerCase().includes(q) ?? false)
  );
}

/// Fetches a single business with recent activity.
///
/// Counts are fetched separately (not via _count) because Prisma's
/// generated `_count` type is truncated in some versions (7.10.1 +
/// Turbopack). Separate `.count()` queries are equivalent and stable.
export async function getBusinessDetail(
  id: string
): Promise<BusinessDetail | null> {
  const business = await withRetry(() =>
    prisma.business.findUnique({ where: { id } })
  );

  if (!business) return null;

  const [notifCount, backupCount, recentNotifications, recentBackups] =
    await Promise.all([
      prisma.notification.count({ where: { businessId: id } }),
      prisma.businessBackup.count({ where: { businessId: id } }),
      prisma.notification.findMany({
        where: { businessId: id },
        orderBy: { publishedAt: "desc" },
        take: 3,
        select: { id: true, type: true, title: true, publishedAt: true },
      }),
      prisma.businessBackup.findMany({
        where: { businessId: id },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, filename: true, sizeBytes: true, createdAt: true },
      }),
    ]);

  return {
    id: business.id,
    name: business.name,
    phone: business.phone,
    email: business.email,
    createdAt: business.createdAt.toISOString(),
    notificationCount: notifCount,
    backupCount,
    lastNotificationAt:
      recentNotifications[0]?.publishedAt.toISOString() ?? null,
    lastBackupAt: recentBackups[0]?.createdAt.toISOString() ?? null,
    recentNotifications: recentNotifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      publishedAt: n.publishedAt.toISOString(),
    })),
    recentBackups: recentBackups.map((b) => ({
      id: b.id,
      filename: b.filename,
      sizeBytes: b.sizeBytes,
      createdAt: b.createdAt.toISOString(),
    })),
  };
}

/// Lists all cloud backups across all businesses.
export async function listAllBackups(
  opts: { search?: string } = {}
): Promise<BackupRow[]> {
  const backups = await withRetry(() =>
    prisma.businessBackup.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    })
  );

  // Fetch business names in one query
  const businessIds = Array.from(new Set(backups.map((b) => b.businessId)));
  const businesses = await prisma.business.findMany({
    where: { id: { in: businessIds } },
    select: { id: true, name: true },
  });
  const nameMap = new Map(businesses.map((b) => [b.id, b.name]));

  const q = opts.search?.trim().toLowerCase() ?? "";

  const rows: BackupRow[] = backups.map((b) => ({
    id: b.id,
    businessId: b.businessId,
    businessName: nameMap.get(b.businessId) ?? b.businessId,
    filename: b.filename,
    sizeBytes: b.sizeBytes,
    createdAt: b.createdAt.toISOString(),
  }));

  if (!q) return rows;
  return rows.filter(
    (r) =>
      r.businessName.toLowerCase().includes(q) ||
      r.businessId.toLowerCase().includes(q) ||
      r.filename.toLowerCase().includes(q)
  );
}

/// Deletes a backup (file + DB row).
export async function deleteBackup(id: string): Promise<void> {
  const backup = await withRetry(() =>
    prisma.businessBackup.findUnique({ where: { id } })
  );
  if (!backup) return;

  // Delete the file (best-effort)
  try {
    const { unlink } = await import("fs/promises");
    const { join } = await import("path");
    const filePath = join(
      process.cwd(),
      "uploads",
      "backups",
      backup.businessId,
      backup.filename
    );
    await unlink(filePath);
  } catch (e) {
    console.warn("File delete skipped:", e);
  }

  await prisma.businessBackup.delete({ where: { id } });
}