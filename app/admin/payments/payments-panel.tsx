// app/admin/payments/payments-panel.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import { WalletIcon } from "lucide-react";

import {
  listInvoices,
  createInvoice,
  deleteInvoice,
  sendPaymentPrompt,
  type InvoiceRow,
} from "../actions/payments";

const inputClass =
  "w-full rounded-xl border border-deep-200 bg-cream-100 px-3.5 py-3 text-sm text-deep-800 outline-none transition placeholder:text-deep-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 dark:border-deep-800 dark:bg-deep-950 dark:text-cream-100 dark:placeholder:text-cream-500";

export function PaymentsPanel() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");

  async function refresh() {
    setLoading(true);
    try {
      setInvoices(await listInvoices());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleCreate() {
    startTransition(async () => {
      try {
        await createInvoice({
          customerName: name,
          customerPhone: phone,
          amount: Number(amount),
        });
        setName("");
        setPhone("");
        setAmount("");
        setShowForm(false);
        await refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to create invoice");
      }
    });
  }

  function handlePrompt(id: number) {
    startTransition(async () => {
      try {
        await sendPaymentPrompt(id);
        alert("STK Push sent. Customer should receive a PIN prompt.");
        await refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "STK failed");
      }
    });
  }

  function handleDelete(id: number) {
    if (!confirm("Delete invoice?")) return;
    startTransition(async () => {
      try {
        await deleteInvoice(id);
        await refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete");
      }
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
            Payments
          </h2>
          <p className="mt-1 text-sm text-deep-600 dark:text-cream-400">
            Create an invoice, then send an M-Pesa Paybill prompt.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
          disabled={pending}
        >
          {showForm ? "Cancel" : "New invoice"}
        </button>
      </div>

      {showForm && (
        <div className="grid gap-4 rounded-2xl border border-emerald-300 bg-emerald-50 p-5 sm:grid-cols-3 dark:border-emerald-800 dark:bg-emerald-950/40">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Customer name"
            className={inputClass}
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0712345678"
            className={inputClass}
          />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            placeholder="Amount (KES)"
            className={inputClass}
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={pending || !name || !phone || !amount}
            className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
          >
            {pending ? "Creating…" : "Create invoice"}
          </button>
        </div>
      )}

      {loading && invoices.length === 0 && (
        <div className="h-24 animate-pulse rounded-2xl bg-cream-50 dark:bg-deep-900" />
      )}

      <div className="space-y-3">
        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="rounded-2xl border border-deep-200 bg-cream-50 p-5 dark:border-deep-800 dark:bg-deep-900"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-deep-800 dark:text-cream-100">
                    {inv.invoiceNumber}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      inv.status === "PAID"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-deep-500 dark:text-cream-500">
                  {inv.customerName} · {inv.customerPhone}
                </p>
              </div>
              <p className="text-lg font-bold text-deep-800 dark:text-cream-100">
                KES {inv.amount.toLocaleString()}
              </p>
            </div>
            {inv.status !== "PAID" && (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => handlePrompt(inv.id)}
                  disabled={pending}
                  className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
                >
                  Send Payment Prompt
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
    </div>
  );
}
