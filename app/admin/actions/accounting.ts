// app/admin/actions/accounting.ts
"use server";

import { prisma } from "@/lib/prisma";

// ─── Types ────────────────────────────────────────────────────────

export type AccountingPeriod = {
  from: string; // ISO date
  to: string;
};

export type RevenueRow = {
  invoiceId: number;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  paidAt: string;
  quoteReference: string | null;
  projectTitle: string | null;
};

export type ExpenseRow = {
  expenseId: number;
  reference: string;
  description: string;
  category: string;
  amount: number;
  incurredAt: string;
  paidAt: string | null;
  vendorName: string | null;
  projectTitle: string | null;
};

export type AccountingSummary = {
  period: AccountingPeriod;
  revenue: {
    total: number;
    byMonth: { month: string; amount: number }[];
    rows: RevenueRow[];
  };
  expenses: {
    total: number;
    byCategory: { category: string; amount: number }[];
    byMonth: { month: string; amount: number }[];
    rows: ExpenseRow[];
  };
  profit: {
    gross: number; // revenue - expenses
    margin: number; // percentage
  };
  balanceSheet: {
    receivables: number; // invoices PENDING
    payables: number; // expenses PENDING
    netPosition: number; // receivables - payables
  };
  projectProfitability: {
    projectTitle: string;
    revenue: number;
    expenses: number;
    profit: number;
  }[];
};

// ─── Summary query ───────────────────────────────────────────────

export async function getAccountingSummary(
  from: string,
  to: string,
): Promise<AccountingSummary> {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  // ── Revenue: paid invoices in period ───────────────────────────
  const paidInvoices = await prisma.invoice.findMany({
    where: {
      status: "PAID",
      paidAt: { gte: fromDate, lte: toDate },
    },
    include: {
      quote: {
        include: {
          project: true,
        },
      },
    },
    orderBy: { paidAt: "asc" },
  });

  const revenueRows: RevenueRow[] = paidInvoices.map((inv) => ({
    invoiceId: inv.id,
    invoiceNumber: inv.invoiceNumber,
    customerName: inv.customerName,
    amount: inv.amount,
    paidAt: inv.paidAt!.toISOString(),
    quoteReference: inv.quote?.reference ?? null,
    projectTitle: inv.quote?.project?.title ?? null,
  }));

  const revenueTotal = revenueRows.reduce((s, r) => s + r.amount, 0);

  // ── Expenses: approved in period ────────────────────────────────
  const approvedExpenses = await prisma.expense.findMany({
    where: {
      status: "APPROVED",
      incurredAt: { gte: fromDate, lte: toDate },
    },
    include: { project: true },
    orderBy: { incurredAt: "asc" },
  });

  const expenseRows: ExpenseRow[] = approvedExpenses.map((e) => ({
    expenseId: e.id,
    reference: e.reference,
    description: e.description,
    category: e.category,
    amount: e.amount,
    incurredAt: e.incurredAt.toISOString(),
    paidAt: e.paidAt?.toISOString() ?? null,
    vendorName: e.vendorName,
    projectTitle: e.project?.title ?? null,
  }));

  const expenseTotal = expenseRows.reduce((s, e) => s + e.amount, 0);

  // ── Group by month ─────────────────────────────────────────────
  const revenueByMonth = groupByMonth(revenueRows, "paidAt", "amount");
  const expenseByMonth = groupByMonth(expenseRows, "incurredAt", "amount");

  // ── Group by category ──────────────────────────────────────────
  const expensesByCategory = Object.entries(
    expenseRows.reduce(
      (acc, e) => {
        acc[e.category] = (acc[e.category] ?? 0) + e.amount;
        return acc;
      },
      {} as Record<string, number>,
    ),
  ).map(([category, amount]) => ({ category, amount }));

  // ── Balance sheet ─────────────────────────────────────────────
  const receivables = await prisma.invoice.aggregate({
    where: { status: "PENDING" },
    _sum: { amount: true },
  });

  const payables = await prisma.expense.aggregate({
    where: { status: "PENDING" },
    _sum: { amount: true },
  });

  const receivableTotal = receivables._sum.amount ?? 0;
  const payableTotal = payables._sum.amount ?? 0;

  // ── Project profitability ──────────────────────────────────────
  const projects = await prisma.project.findMany({
    include: {
      quote: { include: { invoice: true } },
      expenses: { where: { status: "APPROVED" } },
    },
  });

  const projectProfitability = projects.map((p) => {
    const revenue = p.quote?.invoice?.status === "PAID"
      ? p.quote.invoice.amount
      : 0;
    const expenses = p.expenses.reduce((s, e) => s + e.amount, 0);
    return {
      projectTitle: p.title,
      revenue,
      expenses,
      profit: revenue - expenses,
    };
  });

  return {
    period: { from, to },
    revenue: {
      total: revenueTotal,
      byMonth: revenueByMonth,
      rows: revenueRows,
    },
    expenses: {
      total: expenseTotal,
      byCategory: expensesByCategory,
      byMonth: expenseByMonth,
      rows: expenseRows,
    },
    profit: {
      gross: revenueTotal - expenseTotal,
      margin: revenueTotal > 0
        ? Math.round(((revenueTotal - expenseTotal) / revenueTotal) * 100)
        : 0,
    },
    balanceSheet: {
      receivables: receivableTotal,
      payables: payableTotal,
      netPosition: receivableTotal - payableTotal,
    },
    projectProfitability,
  };
}

function groupByMonth<T extends Record<string, any>>(
  rows: T[],
  dateField: keyof T,
  amountField: keyof T,
): { month: string; amount: number }[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const date = new Date(row[dateField] as string);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, (map.get(key) ?? 0) + (row[amountField] as number));
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({ month, amount }));
}

// ─── Expense CRUD ─────────────────────────────────────────────────

export async function listExpenses(): Promise<ExpenseRow[]> {
  const rows = await prisma.expense.findMany({
    orderBy: { incurredAt: "desc" },
    include: { project: true },
  });
  return rows.map((e) => ({
    expenseId: e.id,
    reference: e.reference,
    description: e.description,
    category: e.category,
    amount: e.amount,
    incurredAt: e.incurredAt.toISOString(),
    paidAt: e.paidAt?.toISOString() ?? null,
    vendorName: e.vendorName,
    projectTitle: e.project?.title ?? null,
  }));
}

export async function createExpense(input: {
  description: string;
  category: string;
  amount: number;
  incurredAt: string;
  vendorName?: string;
  projectId?: number;
}) {
  const year = new Date().getFullYear();
  const prefix = `EXP-${year}-`;
  const last = await prisma.expense.findFirst({
    where: { reference: { startsWith: prefix } },
    orderBy: { reference: "desc" },
    select: { reference: true },
  });
  const seq = last ? parseInt(last.reference.slice(prefix.length), 10) + 1 : 1;
  const reference = `${prefix}${String(seq).padStart(4, "0")}`;

  return prisma.expense.create({
    data: {
      reference,
      description: input.description,
      category: input.category,
      amount: Math.ceil(input.amount),
      incurredAt: new Date(input.incurredAt),
      vendorName: input.vendorName ?? null,
      projectId: input.projectId ?? null,
    },
  });
}

export async function updateExpenseStatus(id: number, status: string) {
  return prisma.expense.update({
    where: { id },
    data: {
      status,
      paidAt: status === "APPROVED" ? new Date() : null,
    },
  });
}