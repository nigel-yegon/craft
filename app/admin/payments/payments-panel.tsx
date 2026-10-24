"use client";

import { useEffect, useState, useTransition } from "react";
import {
  listInvoices,
  createInvoice,
  deleteInvoice,
  initiateStkPush,
  listTransactions,
  type InvoiceRow,
  type TransactionRow,
} from "../actions/payments";

const inputClass =
  "w-full rounded-xl border border-deep-200 bg-cream-100 px-3.5 py-3 text-sm text-deep-800 outline-none transition placeholder:text-deep-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 dark:border-deep-800 dark:bg-deep-950 dark:text-cream-100";

export function PaymentsPanel({ search }: { search: string }) {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  // New invoice form state
  const [showForm, setShowForm] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  async function refresh() {
    setLoading(true);
    try {
      const [inv, tx] = await Promise.all([listInvoices(), listTransactions()]);
      setInvoices(inv);
      setTransactions(tx);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const filtered = invoices.filter((i) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return [i.invoiceNumber, i.customerName, i.customerPhone].join(" ").toLowerCase().includes(q);
  });

  function handleCreate() {
    startTransition(async () => {
      try {
        await createInvoice({
          customerName,
          customerPhone,
          description: description || undefined,
          amount: Number(amount),
        });
        setShowForm(false);
        setCustomerName(""); setCustomerPhone(""); setDescription(""); setAmount("");
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

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-brand-700 dark:text-brand-300">Payments</h2>
          <p className="mt-1 text-sm text-deep-600 dark:text-cream-400">
            Create invoices and send M-Pesa payment requests to customer phones.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          disabled={pending}
        >
          {showForm ? "Cancel" : "New invoice"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-2xl border border-brand-300 bg-brand-50 p-5 dark:border-brand-800 dark:bg-brand-950/40">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-deep-700 dark:text-cream-300">Customer name</span>
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={inputClass} placeholder="Jane Doe" />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-deep-700 dark:text-cream-300">M-Pesa phone</span>
              <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className={inputClass} placeholder="0712345678 or 254712345678" />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-deep-700 dark:text-cream-300">Amount (KES)</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} placeholder="1500" />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-deep-700 dark:text-cream-300">Description (optional)</span>
              <input value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} placeholder="Safari deposit" />
            </label>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={pending || !customerName || !customerPhone || !amount}
            className="mt-4 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? "Creating…" : "Create invoice"}
          </button>
        </div>
      )}

      {/* Invoice list */}
      <div className="space-y-3">
        {loading && <div className="h-24 animate-pulse rounded-2xl bg-cream-50 dark:bg-deep-900" />}
        {!loading && filtered.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-deep-200 p-10 text-center text-sm text-deep-500 dark:border-deep-800 dark:text-cream-500">
            No invoices yet. Create one above.
          </div>
        )}
        {filtered.map((inv) => (
          <div
            key={inv.id}
            className="relative overflow-hidden rounded-2xl border border-deep-200 bg-cream-50 p-5 pl-6 dark:border-deep-800 dark:bg-deep-900"
          >
            <span className={`absolute inset-y-0 left-0 w-1 ${
              inv.status === "PAID" ? "bg-emerald-500" : inv.status === "CANCELLED" ? "bg-rose-500" : "bg-brand-500"
            }`} aria-hidden />
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-deep-800 dark:text-cream-100">{inv.invoiceNumber}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    inv.status === "PAID"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                      : "bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-200"
                  }`}>
                    {inv.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-deep-500 dark:text-cream-500">
                  {inv.customerName} · {inv.customerPhone}
                </p>
                {inv.description && (
                  <p className="mt-1 text-sm text-deep-600 dark:text-cream-400">{inv.description}</p>
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
            {inv.status !== "PAID" && (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleStkPush(inv.id)}
                  disabled={pending}
                  className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
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
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-deep-500 dark:text-cream-500">
          Recent M-Pesa transactions
        </h3>
        {transactions.length === 0 ? (
          <p className="text-xs text-deep-400 dark:text-cream-600">No transactions yet.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-deep-200 dark:border-deep-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-100 dark:bg-deep-800">
                <tr className="text-deep-500 dark:text-cream-500">
                  <th className="px-4 py-2 font-semibold">Receipt</th>
                  <th className="px-4 py-2 font-semibold">Phone</th>
                  <th className="px-4 py-2 font-semibold">Amount</th>
                  <th className="px-4 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-deep-100 bg-cream-50 dark:divide-deep-800 dark:bg-deep-900">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="text-deep-700 dark:text-cream-300">
                    <td className="px-4 py-2 font-mono">{tx.mpesaReceiptNumber ?? "—"}</td>
                    <td className="px-4 py-2">{tx.phoneNumber}</td>
                    <td className="px-4 py-2">KES {tx.amount.toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        tx.status === "SUCCESS"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                          : tx.status === "FAILED"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200"
                            : "bg-cream-200 text-deep-600 dark:bg-deep-800 dark:text-cream-400"
                      }`}>
                        {tx.status}
                      </span>
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