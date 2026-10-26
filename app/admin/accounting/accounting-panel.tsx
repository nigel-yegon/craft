// app/admin/accounting/accounting-panel.tsx
"use client";

import { useState, useTransition } from "react";
import { Calculator, Download, Plus } from "lucide-react";
import {
  getAccountingSummary,
  createExpense,
  updateExpenseStatus,
  type AccountingSummary,
} from "../actions/accounting";

const inputClass =
  "w-full rounded-xl border border-deep-200 bg-cream-100 px-3.5 py-3 text-sm dark:border-deep-800 dark:bg-deep-950 dark:text-cream-100";

export function AccountingPanel() {
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [summary, setSummary] = useState<AccountingSummary | null>(null);
  const [pending, startTransition] = useTransition();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expDesc, setExpDesc] = useState("");
  const [expCategory, setExpCategory] = useState("Software");
  const [expAmount, setExpAmount] = useState("");
  const [expDate, setExpDate] = useState(to);

  function load() {
    startTransition(async () => {
      const data = await getAccountingSummary(from, to);
      setSummary(data);
    });
  }

  function handleCreateExpense() {
    startTransition(async () => {
      await createExpense({
        description: expDesc,
        category: expCategory,
        amount: Number(expAmount),
        incurredAt: expDate,
      });
      setShowExpenseForm(false);
      setExpDesc("");
      setExpAmount("");
      load();
    });
  }

  function handleApprove(id: number) {
    startTransition(async () => {
      await updateExpenseStatus(id, "APPROVED");
      load();
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
              <Calculator className="h-4 w-4" />
            </span>
            <h2 className="text-xl font-bold text-violet-700 dark:text-violet-300">
              Accounting
            </h2>
          </div>
          <p className="mt-2 text-sm text-deep-600 dark:text-cream-400">
            Revenue, expenses, balance sheet, and PDF export.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase text-deep-500">From</span>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase text-deep-500">To</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputClass} />
          </label>
          <button
            type="button"
            onClick={load}
            disabled={pending}
            className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-60"
          >
            {pending ? "Loading…" : "Load"}
          </button>
          <a
            href={`/api/accounting/export?from=${from}&to=${to}`}
            className="inline-flex items-center gap-2 rounded-xl border border-violet-300 px-4 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-300"
          >
            <Download size={16} /> Export PDF
          </a>
          <button
            type="button"
            onClick={() => setShowExpenseForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-800"
          >
            <Plus size={16} /> Expense
          </button>
        </div>
      </div>

      {showExpenseForm && (
        <div className="grid gap-3 rounded-2xl border border-violet-300 bg-violet-50 p-5 sm:grid-cols-4 dark:border-violet-800 dark:bg-violet-950/40">
          <input value={expDesc} onChange={(e) => setExpDesc(e.target.value)} placeholder="Description" className={inputClass} />
          <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)} className={inputClass}>
            {["Software", "Contractor", "Equipment", "Travel", "Office", "Other"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input type="number" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} placeholder="Amount (KES)" className={inputClass} />
          <input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} className={inputClass} />
          <button
            type="button"
            onClick={handleCreateExpense}
            disabled={pending || !expDesc || !expAmount}
            className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-60"
          >
            Create
          </button>
        </div>
      )}

      {!summary && !pending && (
        <div className="rounded-2xl border-2 border-dashed border-deep-200 p-10 text-center text-sm text-deep-500 dark:border-deep-800 dark:text-cream-500">
          Pick a date range and click Load.
        </div>
      )}

      {summary && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi label="Revenue" value={summary.revenue.total} tone="emerald" />
            <Kpi label="Expenses" value={summary.expenses.total} tone="rose" />
            <Kpi label="Gross profit" value={summary.profit.gross} tone="violet" hint={`${summary.profit.margin}% margin`} />
            <Kpi label="Net position" value={summary.balanceSheet.netPosition} tone="brand" hint="Receivables − payables" />
          </div>

          <div className="rounded-2xl border border-deep-200 bg-cream-50 p-5 dark:border-deep-800 dark:bg-deep-900">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-deep-500">Balance sheet</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <Stat label="Receivables (pending invoices)" value={summary.balanceSheet.receivables} tone="amber" />
              <Stat label="Payables (pending expenses)" value={summary.balanceSheet.payables} tone="rose" />
              <Stat label="Net position" value={summary.balanceSheet.netPosition} tone="emerald" />
            </div>
          </div>

          <div className="rounded-2xl border border-deep-200 bg-cream-50 p-5 dark:border-deep-800 dark:bg-deep-900">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-deep-500">Project profitability</h3>
            <div className="mt-3 space-y-2">
              {summary.projectProfitability.filter((p) => p.revenue > 0 || p.expenses > 0).map((p) => (
                <div key={p.projectTitle} className="flex items-center justify-between rounded-xl border border-deep-100 px-4 py-2 text-sm dark:border-deep-800">
                  <span className="font-medium text-deep-800 dark:text-cream-100">{p.projectTitle}</span>
                  <span className="flex gap-4 font-mono text-xs">
                    <span className="text-emerald-700 dark:text-emerald-300">+{p.revenue.toLocaleString()}</span>
                    <span className="text-rose-700 dark:text-rose-300">−{p.expenses.toLocaleString()}</span>
                    <span className="font-bold text-deep-800 dark:text-cream-100">{p.profit.toLocaleString()}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-deep-500">Expenses</h3>
            <div className="space-y-2">
              {summary.expenses.rows.map((e) => (
                <div key={e.expenseId} className="flex items-center justify-between rounded-xl border border-deep-200 bg-cream-50 px-4 py-2 text-sm dark:border-deep-800 dark:bg-deep-900">
                  <div>
                    <span className="font-mono text-xs text-deep-500">{e.reference}</span>
                    <span className="ml-2 text-deep-800 dark:text-cream-100">{e.description}</span>
                    {e.projectTitle && <span className="ml-2 text-[10px] text-violet-600">· {e.projectTitle}</span>}
                  </div>
                  <span className="font-bold text-rose-700 dark:text-rose-300">KES {e.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, tone, hint }: { label: string; value: number; tone: string; hint?: string }) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
    violet: "bg-violet-500",
    brand: "bg-brand-500",
    amber: "bg-amber-500",
  };
  return (
    <div className="relative overflow-hidden rounded-2xl border border-deep-200 bg-cream-50 p-4 dark:border-deep-800 dark:bg-deep-900">
      <span className={`absolute inset-y-0 left-0 w-1 ${colors[tone]}`} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-deep-800 dark:text-cream-100">KES {value.toLocaleString()}</p>
      {hint && <p className="text-[10px] text-deep-400">{hint}</p>}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  const colors: Record<string, string> = {
    amber: "text-amber-700 dark:text-amber-300",
    rose: "text-rose-700 dark:text-rose-300",
    emerald: "text-emerald-700 dark:text-emerald-300",
  };
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase text-deep-500">{label}</p>
      <p className={`mt-1 text-lg font-bold ${colors[tone]}`}>KES {value.toLocaleString()}</p>
    </div>
  );
}