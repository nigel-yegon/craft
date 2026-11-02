// app/admin/actions/stats.ts
"use server";

import { prisma } from "@/lib/prisma";

// ─── Types ────────────────────────────────────────────────────────

export type OverviewStats = {
  projects: {
    total: number;
    published: number;
    featured: number;
    byStatus: Record<string, number>;
  };
  quotes: {
    requests: number;
    pendingRequests: number;
    quotes: number;
    acceptedQuotes: number;
    totalQuotedValue: number;
  };
  payments: {
    invoices: number;
    paid: number;
    pending: number;
    failed: number;
    totalCollected: number;
    totalOutstanding: number;
  };
  accounting: {
    revenue: number;
    expenses: number;
    profit: number;
    receivables: number;
    payables: number;
    netPosition: number;
  };
  recentActivity: {
    projects: Array<{
      title: string;
      status: string;
      createdAt: string;
    }>;
    invoices: Array<{
      invoiceNumber: string;
      customerName: string;
      amount: number;
      status: string;
      createdAt: string;
    }>;
  };
};

// ─── Retry helper ─────────────────────────────────────────────────
// Prisma does NOT automatically retry on P1017 ("Server has closed
// the connection"). When running on a pooled endpoint (Supabase,
// Neon, PgBouncer, etc.) a connection can be recycled mid-flight.
// Retry the affected batch once with a short backoff.

function isConnectionDrop(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string; message?: string };
  if (e.code === "P1017") return true;
  if (typeof e.message === "string") {
    const m = e.message.toLowerCase();
    return (
      m.includes("server has closed the connection") ||
      m.includes("connection terminated") ||
      m.includes("econnreset") ||
      m.includes("epipe")
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

// ─── Main query ───────────────────────────────────────────────────

export async function getOverviewStats(): Promise<OverviewStats> {
  // Batched in groups of 4–5 to stay well under the Prisma `pg` pool
  // `max` (default 10). The previous version fired all 17 queries at
  // once via a single Promise.all, which could exhaust the pool and
  // trigger P1017 ("Server has closed the connection") on hosted
  // Postgres endpoints. Each batch is independently retried.

  // ── Batch 1: projects ──────────────────────────────────────────
  const [projectTotal, projectPublished, projectFeatured, projectsByStatus] =
    await withRetry(() =>
      Promise.all([
        prisma.project.count(),
        prisma.project.count({ where: { published: true } }),
        prisma.project.count({ where: { featured: true } }),
        prisma.project.groupBy({ by: ["status"], _count: true }),
      ])
    );

  // ── Batch 2: quote requests + quotes ───────────────────────────
  const [
    quoteRequestCount,
    pendingRequests,
    quoteCount,
    acceptedQuotes,
    quotedValue,
  ] = await withRetry(() =>
    Promise.all([
      prisma.quoteRequest.count(),
      prisma.quoteRequest.count({ where: { status: "NEW" } }),
      prisma.quote.count(),
      prisma.quote.count({ where: { status: "ACCEPTED" } }),
      prisma.quote.aggregate({ _sum: { total: true } }),
    ])
  );

  // ── Batch 3: invoices ──────────────────────────────────────────
  const [invoiceCounts, paidInvoices, pendingInvoices, failedInvoices] =
    await withRetry(() =>
      Promise.all([
        prisma.invoice.count(),
        prisma.invoice.aggregate({
          where: { status: "PAID" },
          _sum: { amount: true },
          _count: true,
        }),
        prisma.invoice.aggregate({
          where: { status: "PENDING" },
          _sum: { amount: true },
          _count: true,
        }),
        prisma.invoice.aggregate({
          where: { status: "FAILED" },
          _sum: { amount: true },
          _count: true,
        }),
      ])
    );

  // ── Batch 4: expenses + recent activity ────────────────────────
  const [
    approvedExpenses,
    pendingExpenses,
    recentProjects,
    recentInvoices,
  ] = await withRetry(() =>
    Promise.all([
      prisma.expense.aggregate({
        where: { status: "APPROVED" },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { status: "PENDING" },
        _sum: { amount: true },
      }),
      prisma.project.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { title: true, status: true, createdAt: true },
      }),
      prisma.invoice.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          invoiceNumber: true,
          customerName: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      }),
    ])
  );

  // ── Aggregation ────────────────────────────────────────────────

  const byStatus: Record<string, number> = {};
  for (const row of projectsByStatus) {
    byStatus[row.status] = row._count;
  }

  const revenue = paidInvoices._sum.amount ?? 0;
  const expenses = approvedExpenses._sum.amount ?? 0;
  const receivables = pendingInvoices._sum.amount ?? 0;
  const payables = pendingExpenses._sum.amount ?? 0;

  return {
    projects: {
      total: projectTotal,
      published: projectPublished,
      featured: projectFeatured,
      byStatus,
    },
    quotes: {
      requests: quoteRequestCount,
      pendingRequests,
      quotes: quoteCount,
      acceptedQuotes,
      totalQuotedValue: quotedValue._sum.total ?? 0,
    },
    payments: {
      invoices: invoiceCounts,
      paid: paidInvoices._count,
      pending: pendingInvoices._count,
      failed: failedInvoices._count,
      totalCollected: revenue,
      totalOutstanding: receivables,
    },
    accounting: {
      revenue,
      expenses,
      profit: revenue - expenses,
      receivables,
      payables,
      netPosition: receivables - payables,
    },
    recentActivity: {
      projects: recentProjects.map((p) => ({
        title: p.title,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
      })),
      invoices: recentInvoices.map((i) => ({
        invoiceNumber: i.invoiceNumber,
        customerName: i.customerName,
        amount: i.amount,
        status: i.status,
        createdAt: i.createdAt.toISOString(),
      })),
    },
  };
}