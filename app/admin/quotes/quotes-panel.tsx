// app/admin/quotes/quotes-panel.tsx
"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { FileText, Plus, X } from "lucide-react";

import {
  listQuoteRequests,
  listQuotes,
  createQuote,
  updateQuoteStatus,
  deleteQuoteRequest,
  convertQuoteToInvoice,
  type QuoteRequestRow,
  type QuoteRow,
  type QuoteLineItem,
} from "../actions/quotes";

const inputClass =
  "w-full rounded-xl border border-deep-200 bg-cream-100 px-3.5 py-3 text-sm text-deep-800 outline-none transition placeholder:text-deep-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 dark:border-deep-800 dark:bg-deep-950 dark:text-cream-100 dark:placeholder:text-cream-500";

const STATUS_PILL: Record<string, string> = {
  NEW: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  REVIEWING: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  QUOTED: "bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-200",
  INVOICED: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
  PAID: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  CANCELLED: "bg-deep-200 text-deep-700 dark:bg-deep-800 dark:text-cream-300",
  DRAFT: "bg-deep-200 text-deep-700 dark:bg-deep-800 dark:text-cream-300",
  SENT: "bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-200",
  ACCEPTED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
};

type Tab = "requests" | "quotes";

export function QuotesPanel({ search = "" }: { search?: string }) {
  const [tab, setTab] = useState<Tab>("requests");
  const [requests, setRequests] = useState<QuoteRequestRow[]>([]);
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequestRow | null>(
    null,
  );

  async function refresh() {
    setLoading(true);
    try {
      const [r, q] = await Promise.all([listQuoteRequests(), listQuotes()]);
      setRequests(r);
      setQuotes(q);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const filteredRequests = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((r) =>
      [r.reference, r.customerName, r.customerEmail, r.company ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [requests, search]);

  const filteredQuotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return quotes;
    return quotes.filter((quote) =>
      [quote.reference, quote.quoteRequestReference]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [quotes, search]);

  function handleDelete(id: number) {
    if (!confirm("Delete this quote request? This cannot be undone.")) return;
    startTransition(async () => {
      try {
        await deleteQuoteRequest(id);
        await refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete");
      }
    });
  }

  function handleMarkSent(quoteId: number) {
    startTransition(async () => {
      await updateQuoteStatus(quoteId, "SENT");
      await refresh();
    });
  }

  function handleMarkAccepted(quoteId: number) {
    startTransition(async () => {
      await updateQuoteStatus(quoteId, "ACCEPTED");
      await refresh();
    });
  }

  function handleConvertToInvoice(quoteId: number) {
    startTransition(async () => {
      try {
        const result = await convertQuoteToInvoice(quoteId);
        if ("error" in result.prompt) {
          alert(
            `Invoice ${result.invoiceNumber} created, but the M-Pesa prompt failed: ${result.prompt.error}. Retry from Payments.`,
          );
        } else {
          alert(
            `Invoice ${result.invoiceNumber} created. STK Push sent to the customer's phone.`,
          );
        }
        await refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Conversion failed");
      }
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
              <FileText className="h-4 w-4" />
            </span>
            <h2 className="text-xl font-bold text-brand-700 dark:text-brand-300">
              Quotes
            </h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-deep-600 dark:text-cream-400">
            Inbound quote requests from the store. Price them, send the quote,
            and convert accepted quotes to invoices.
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-deep-200 dark:border-deep-800">
        {(["requests", "quotes"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={[
              "relative px-4 py-2.5 text-sm font-semibold capitalize transition",
              tab === t
                ? "text-brand-700 dark:text-brand-300"
                : "text-deep-500 hover:text-deep-700 dark:text-cream-500",
            ].join(" ")}
          >
            {t === "requests" ? "Quote Requests" : "Quotes"}
            {t === "requests" && requests.length > 0 && (
              <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                {requests.length}
              </span>
            )}
            {tab === t && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-600 dark:bg-brand-400" />
            )}
          </button>
        ))}
      </div>

      {loading && requests.length === 0 && (
        <div className="h-24 animate-pulse rounded-2xl bg-cream-50 dark:bg-deep-900" />
      )}

      {tab === "requests" && (
        <div className="space-y-3">
          {!loading && filteredRequests.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-deep-200 p-10 text-center text-sm text-deep-500 dark:border-deep-800 dark:text-cream-500">
              No quote requests yet. They appear here when visitors submit the
              cart form on /store.
            </div>
          )}
          {filteredRequests.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-deep-200 bg-cream-50 p-5 dark:border-deep-800 dark:bg-deep-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-deep-800 dark:text-cream-100">
                      {r.reference}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_PILL[r.status] ?? ""}`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-deep-500 dark:text-cream-500">
                    {r.customerName} · {r.customerEmail}
                    {r.company ? ` · ${r.company}` : ""}
                  </p>
                  <p className="mt-2 text-xs text-deep-500 dark:text-cream-500">
                    {r.items.length} item{r.items.length !== 1 ? "s" : ""}:{" "}
                    {r.items.map((i) => i.offeringName).join(", ")}
                  </p>
                  {r.notes && (
                    <p className="mt-2 rounded-lg bg-cream-100 p-2 text-xs text-deep-600 dark:bg-deep-950 dark:text-cream-400">
                      &ldquo;{r.notes}&rdquo;
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 text-xs">
                  <p className="text-deep-400 dark:text-cream-600">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    {r.status === "NEW" && (
                      <button
                        type="button"
                        onClick={() => setSelectedRequest(r)}
                        disabled={pending}
                        className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                      >
                        Price this
                      </button>
                    )}
                    {r.status === "QUOTED" && (
                      <span className="rounded-lg border border-brand-300 px-3 py-2 text-xs font-semibold text-brand-700 dark:border-brand-800 dark:text-brand-300">
                        Awaiting response
                      </span>
                    )}
                    {r.status === "INVOICED" && (
                      <span className="rounded-lg border border-violet-300 px-3 py-2 text-xs font-semibold text-violet-700 dark:border-violet-800 dark:text-violet-300">
                        Invoiced
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      disabled={pending}
                      className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60 dark:border-red-800 dark:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "quotes" && (
        <div className="space-y-3">
          {!loading && filteredQuotes.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-deep-200 p-10 text-center text-sm text-deep-500 dark:border-deep-800 dark:text-cream-500">
              No quotes yet. Price a request from the Quote Requests tab.
            </div>
          )}
          {filteredQuotes.map((q) => (
            <div
              key={q.id}
              className="rounded-2xl border border-deep-200 bg-cream-50 p-5 dark:border-deep-800 dark:bg-deep-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-deep-800 dark:text-cream-100">
                      {q.reference}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_PILL[q.status] ?? ""}`}
                    >
                      {q.status}
                    </span>
                    <span className="text-[10px] text-deep-400 dark:text-cream-600">
                      from {q.quoteRequestReference}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-0.5 text-xs text-deep-600 dark:text-cream-400">
                    {q.lineItems.map((li, i) => (
                      <li key={i}>
                        {li.qty} × {li.label} @ KES {li.unitPrice.toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-deep-800 dark:text-cream-100">
                    KES {q.total.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-deep-400 dark:text-cream-600">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {q.status === "DRAFT" && (
                  <button
                    type="button"
                    onClick={() => handleMarkSent(q.id)}
                    disabled={pending}
                    className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                  >
                    Mark sent
                  </button>
                )}
                {q.status === "SENT" && (
                  <button
                    type="button"
                    onClick={() => handleMarkAccepted(q.id)}
                    disabled={pending}
                    className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                  >
                    Mark accepted
                  </button>
                )}
                {q.status === "ACCEPTED" && (
                  <button
                    type="button"
                    onClick={() => handleConvertToInvoice(q.id)}
                    disabled={pending}
                    className="rounded-lg bg-violet-700 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-800 disabled:opacity-60"
                  >
                    {pending ? "Converting…" : "Convert to invoice & send M-Pesa"}
                  </button>
                )}
                {q.status === "INVOICED" && (
                  <span className="rounded-lg border border-violet-300 px-3 py-2 text-xs font-semibold text-violet-700 dark:border-violet-800 dark:text-violet-300">
                    Invoiced — see Payments module
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRequest && (
        <PriceDialog
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onCreated={async () => {
            setSelectedRequest(null);
            await refresh();
            setTab("quotes");
          }}
        />
      )}
    </div>
  );
}

// ─── Price dialog ─────────────────────────────────────────────────

function PriceDialog({
  request,
  onClose,
  onCreated,
}: {
  request: QuoteRequestRow;
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>(
    request.items.map((i) => ({
      label: i.offeringName,
      qty: i.quantity,
      unitPrice: 0,
    })),
  );
  const [taxRatePct, setTaxRatePct] = useState("0");
  const [validDays, setValidDays] = useState("30");
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();

  const subtotal = lineItems.reduce((s, li) => s + li.qty * li.unitPrice, 0);
  const taxRate = Number(taxRatePct) / 100 || 0;
  const taxAmount = Math.round(subtotal * taxRate);
  const total = subtotal + taxAmount;

  function updateLine(idx: number, patch: Partial<QuoteLineItem>) {
    setLineItems((prev) =>
      prev.map((li, i) => (i === idx ? { ...li, ...patch } : li)),
    );
  }

  function addLine() {
    setLineItems((prev) => [...prev, { label: "", qty: 1, unitPrice: 0 }]);
  }

  function removeLine(idx: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit() {
    startTransition(async () => {
      try {
        await createQuote({
          quoteRequestId: request.id,
          lineItems: lineItems.filter((li) => li.label.trim() && li.unitPrice >= 0),
          taxRate,
          validDays: Number(validDays) || undefined,
          notes: notes || undefined,
        });
        await onCreated();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to create quote");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-deep-950/40 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-3xl rounded-2xl border border-deep-200 bg-cream-50 shadow-2xl dark:border-deep-800 dark:bg-deep-900">
        <div className="flex items-center justify-between border-b border-deep-200 px-5 py-4 dark:border-deep-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">
              Price request · {request.reference}
            </p>
            <p className="mt-1 text-sm text-deep-500 dark:text-cream-500">
              {request.customerName} · {request.customerEmail}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-deep-500 hover:text-deep-800 dark:text-cream-500 dark:hover:text-cream-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-deep-500 dark:text-cream-500">
              Line items
            </p>
            <div className="space-y-2">
              {lineItems.map((li, i) => (
                <div key={i} className="grid grid-cols-12 gap-2">
                  <input
                    value={li.label}
                    onChange={(e) => updateLine(i, { label: e.target.value })}
                    placeholder="Description"
                    className={`${inputClass} col-span-6`}
                  />
                  <input
                    type="number"
                    min={1}
                    value={li.qty}
                    onChange={(e) =>
                      updateLine(i, { qty: Number(e.target.value) || 1 })
                    }
                    placeholder="Qty"
                    className={`${inputClass} col-span-2`}
                  />
                  <input
                    type="number"
                    min={0}
                    value={li.unitPrice}
                    onChange={(e) =>
                      updateLine(i, { unitPrice: Number(e.target.value) || 0 })
                    }
                    placeholder="Unit (KES)"
                    className={`${inputClass} col-span-3`}
                  />
                  <button
                    type="button"
                    onClick={() => removeLine(i)}
                    className="col-span-1 rounded-xl border border-deep-200 text-deep-500 hover:bg-red-50 hover:text-red-600 dark:border-deep-800 dark:text-cream-500"
                  >
                    <X size={14} className="mx-auto" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addLine}
              className="mt-2 inline-flex items-center gap-1 rounded-lg border border-deep-200 px-3 py-1.5 text-xs font-semibold text-deep-600 hover:bg-cream-100 dark:border-deep-800 dark:text-cream-400"
            >
              <Plus size={12} /> Add line
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-deep-700 dark:text-cream-300">
                Tax rate (%)
              </span>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={taxRatePct}
                onChange={(e) => setTaxRatePct(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-deep-700 dark:text-cream-300">
                Valid for (days)
              </span>
              <input
                type="number"
                min={1}
                value={validDays}
                onChange={(e) => setValidDays(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-deep-700 dark:text-cream-300">
                Notes (internal)
              </span>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <div className="rounded-xl border border-deep-200 bg-cream-100 p-4 dark:border-deep-800 dark:bg-deep-950">
            <div className="flex justify-between text-sm text-deep-600 dark:text-cream-400">
              <span>Subtotal</span>
              <span>KES {subtotal.toLocaleString()}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm text-deep-600 dark:text-cream-400">
              <span>Tax ({taxRatePct}%)</span>
              <span>KES {taxAmount.toLocaleString()}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-deep-200 pt-2 text-base font-bold text-deep-800 dark:border-deep-800 dark:text-cream-100">
              <span>Total</span>
              <span>KES {total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-deep-200 px-5 py-4 dark:border-deep-800">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-xl border border-deep-200 px-4 py-2.5 text-sm font-semibold text-deep-600 hover:bg-cream-100 dark:border-deep-800 dark:text-cream-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={pending || subtotal === 0}
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? "Creating…" : "Create quote"}
          </button>
        </div>
      </div>
    </div>
  );
}