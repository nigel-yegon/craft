// app/admin/payments/payments-panel.tsx
"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { WalletIcon } from "lucide-react";

import FadeIn from "../../components/fade-in";
import { Stagger } from "../../components/stagger";

import {
  listInvoices,
  listTransactions,
  createInvoice,
  deleteInvoice,
  initiateStkPush,
  type InvoiceRow,
  type TransactionRow,
} from "../actions/payments";

// ─── Status helpers ───────────────────────────────────────────────

type InvoiceStatus = "PENDING" | "PAID" | "CANCELLED" | "FAILED";
type TransactionStatus = "PENDING" | "SUCCESS" | "FAILED";

const STATUS_PILL: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  SUCCESS: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  FAILED: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
  CANCELLED: "bg-deep-200 text-deep-700 dark:bg-deep-800 dark:text-cream-300",
};

function statusBar(status: string): string {
  switch (status) {
    case "PAID":
    case "SUCCESS":
      return "bg-emerald-500";
    case "PENDING":
      return "bg-amber-500";
    case "FAILED":
      return "bg-rose-500";
    default:
      return "bg-deep-400";
  }
}

// ─── Component ────────────────────────────────────────────────────

export function PaymentsPanel({ search }: { search: string }) {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | InvoiceStatus>("all");
  const [showForm, setShowForm] = useState(false);
  const [pending, startTransition] = useTransition();

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  // ─── Data loading ─────────────────────────────────────────────

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [inv, tx] = await Promise.all([listInvoices(), listTransactions()]);
      setInvoices(inv);
      setTransactions(tx);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  // ─── Derived data ─────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (statusFilter !== "all" && inv.status !== statusFilter) return false;
      if (!q) return true;
      return [
        inv.invoiceNumber,
        inv.customerName,
        inv.customerPhone,
        inv.description ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [invoices, search, statusFilter]);

  const totals = useMemo(() => {
    const sum = (status: InvoiceStatus) =>
      invoices
        .filter((i) => i.status === status)
        .reduce((a, i) => a + i.amount, 0);
    return {
      all: invoices.length,
      pending: invoices.filter((i) => i.status === "PENDING").length,
      paid: invoices.filter((i) => i.status === "PAID").length,
      failed: invoices.filter((i) => i.status === "FAILED").length,
      paidAmount: sum("PAID"),
      pendingAmount: sum("PENDING"),
    };
  }, [invoices]);

  // ─── Handlers ─────────────────────────────────────────────────

  function handleCreate() {
    if (!customerName || !customerPhone || !amount) return;
    startTransition(async () => {
      try {
        await createInvoice({
          customerName,
          customerPhone,
          description: description || undefined,
          amount: Number(amount),
        });
        setCustomerName("");
        setCustomerPhone("");
        setDescription("");
        setAmount("");
        setShowForm(false);
        await refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to create invoice");
      }
    });
  }

  function handleStkPush(invoiceId: number) {
    startTransition(async () => {
      try {
        await initiateStkPush(invoiceId);
        alert("STK Push sent. Ask the customer to enter their M-Pesa PIN.");
        await refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "STK Push failed");
      }
    });
  }

  function handleDelete(invoiceId: number) {
    if (!confirm("Delete this invoice?")) return;
    startTransition(async () => {
      try {
        await deleteInvoice(invoiceId);
        await refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete");
      }
    });
  }

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <WalletIcon className="h-4 w-4" />
              </span>
              <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                Payments
              </h2>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-deep-600 dark:text-cream-400">
              Create invoices and send M-Pesa STK Push requests to customer
              phones. Payments confirm asynchronously via M-Pesa callback.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={refresh}
              disabled={loading || pending}
              className="rounded-xl border border-deep-200 px-4 py-2.5 text-sm font-semibold text-deep-700 transition hover:bg-cream-100 disabled:opacity-60 dark:border-deep-800 dark:text-cream-300 dark:hover:bg-deep-800"
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
              disabled={pending}
            >
              {showForm ? "Cancel" : "New invoice"}
            </button>
          </div>
        </div>
      </FadeIn>

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* KPI strip */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile label="Total invoices" value={totals.all} tone="brand" />
        <KpiTile label="Pending" value={totals.pending} tone="amber" />
        <KpiTile label="Paid" value={totals.paid} tone="emerald" />
        <KpiTile label="Failed" value={totals.failed} tone="rose" />
      </section>

      {/* Revenue summary */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/40">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
            Collected (paid)
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-800 dark:text-emerald-200">
            KES {totals.paidAmount.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/40">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">
            Outstanding (pending)
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-800 dark:text-amber-200">
            KES {totals.pendingAmount.toLocaleString()}
          </p>
        </div>
      </section>

      {/* Create form */}
      {showForm && (
        <FadeIn>
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-950/40">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-deep-700 dark:text-cream-300">
                  Customer name
                </span>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={inputClass}
                  placeholder="Jane Doe"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-deep-700 dark:text-cream-300">
                  M-Pesa phone
                </span>
                <input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className={inputClass}
                  placeholder="0712345678 or 254712345678"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-deep-700 dark:text-cream-300">
                  Amount (KES)
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={inputClass}
                  placeholder="1500"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-deep-700 dark:text-cream-300">
                  Description (optional)
                </span>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={inputClass}
                  placeholder="Safari deposit"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={handleCreate}
              disabled={pending || !customerName || !customerPhone || !amount}
              className="mt-4 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
            >
              {pending ? "Creating…" : "Create invoice"}
            </button>
          </div>
        </FadeIn>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "PENDING", "PAID", "FAILED", "CANCELLED"] as const).map((s) => {
          const active = statusFilter === s;
          const label =
            s === "all" ? "All" : s.charAt(0) + s.slice(1).toLowerCase();
          return (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              aria-pressed={active}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                active
                  ? "border-emerald-500 bg-emerald-600 text-white"
                  : "border-deep-200 text-deep-600 hover:border-emerald-400 hover:text-emerald-700 dark:border-deep-800 dark:text-cream-400",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Invoice list */}
      <div className="space-y-3">
        {loading && invoices.length === 0 && (
          <div className="h-24 animate-pulse rounded-2xl bg-cream-50 dark:bg-deep-900" />
        )}
        {!loading && filtered.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-deep-200 p-10 text-center text-sm text-deep-500 dark:border-deep-800 dark:text-cream-500">
            No invoices match your filters.
          </div>
        )}
        <Stagger delayStart={0.05} delayStep={0.04} maxDelay={0.4}>
          {filtered.map((inv) => (
            <div
              key={inv.id}
              className="relative overflow-hidden rounded-2xl border border-deep-200 bg-cream-50 p-5 pl-6 transition hover:border-emerald-400 dark:border-deep-800 dark:bg-deep-900"
            >
              <span
                className={`absolute inset-y-0 left-0 w-1 ${statusBar(inv.status)}`}
                aria-hidden
              />
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-deep-800 dark:text-cream-100">
                      {inv.invoiceNumber}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_PILL[inv.status]}`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-deep-500 dark:text-cream-500">
                    {inv.customerName} · {inv.customerPhone}
                  </p>
                  {inv.description && (
                    <p className="mt-1 text-sm text-deep-600 dark:text-cream-400">
                      {inv.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-deep-800 dark:text-cream-100">
                    KES {inv.amount.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-deep-400 dark:text-cream-600">
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {inv.status !== "PAID" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStkPush(inv.id)}
                      disabled={pending}
                      className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
                    >
                      Send M-Pesa request
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(inv.id)}
                      disabled={pending}
                      className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-800 dark:text-red-400"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </Stagger>
      </div>

      {/* Transactions table */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-deep-500 dark:text-cream-500">
          Recent M-Pesa transactions
        </h3>
        {transactions.length === 0 ? (
          <p className="text-xs text-deep-400 dark:text-cream-600">
            No transactions yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-deep-200 dark:border-deep-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-100 dark:bg-deep-800">
                <tr className="text-deep-500 dark:text-cream-500">
                  <th className="px-4 py-2 font-semibold">Receipt</th>
                  <th className="px-4 py-2 font-semibold">Phone</th>
                  <th className="px-4 py-2 font-semibold">Amount</th>
                  <th className="px-4 py-2 font-semibold">Status</th>
                  <th className="px-4 py-2 font-semibold">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-deep-100 bg-cream-50 dark:divide-deep-800 dark:bg-deep-900">
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="text-deep-700 dark:text-cream-300"
                  >
                    <td className="px-4 py-2 font-mono">
                      {tx.mpesaReceiptNumber ?? "—"}
                    </td>
                    <td className="px-4 py-2">{tx.phoneNumber}</td>
                    <td className="px-4 py-2">
                      KES {tx.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_PILL[tx.status]}`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-deep-400 dark:text-cream-600">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Local helpers ────────────────────────────────────────────────

function KpiTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "brand" | "amber" | "emerald" | "rose";
}) {
  const bar = {
    brand: "bg-brand-500",
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
  }[tone];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-deep-200 bg-cream-50 p-4 dark:border-deep-800 dark:bg-deep-900">
      <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${bar}`} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-500 dark:text-cream-500">
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-bold text-deep-800 dark:text-cream-100">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-deep-200 bg-cream-100 px-3.5 py-3 text-sm text-deep-800 outline-none transition placeholder:text-deep-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 dark:border-deep-800 dark:bg-deep-950 dark:text-cream-100 dark:placeholder:text-cream-500";