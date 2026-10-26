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

// ─── Main query ───────────────────────────────────────────────────

export async function getOverviewStats(): Promise<OverviewStats> {
  const [
    projectTotal,
    projectPublished,
    projectFeatured,
    projectsByStatus,
    quoteRequestCount,
    pendingRequests,
    quoteCount,
    acceptedQuotes,
    quotedValue,
    invoiceCounts,
    paidInvoices,
    pendingInvoices,
    failedInvoices,
    approvedExpenses,
    pendingExpenses,
    recentProjects,
    recentInvoices,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { published: true } }),
    prisma.project.count({ where: { featured: true } }),
    prisma.project.groupBy({ by: ["status"], _count: true }),
    prisma.quoteRequest.count(),
    prisma.quoteRequest.count({ where: { status: "NEW" } }),
    prisma.quote.count(),
    prisma.quote.count({ where: { status: "ACCEPTED" } }),
    prisma.quote.aggregate({ _sum: { total: true } }),
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
  ]);

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