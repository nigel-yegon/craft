// app/admin/payments/payments-panel.tsx
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  FileText,
  Pencil,
} from "lucide-react";

import {
  listInvoices,
  createInvoice,
  deleteInvoice,
  sendPaymentPrompt,
  reconcileInvoice,
  updateInvoiceNote,
  type InvoiceRow,
} from "../actions/payments";

const inputClass =
  "w-full rounded-lg border border-deep-200 bg-cream-100 px-3 py-2 text-sm " +
  "text-deep-800 outline-none transition placeholder:text-deep-400 " +
  "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 " +
  "dark:border-deep-800 dark:bg-deep-950 dark:text-cream-100 " +
  "dark:placeholder:text-cream-500";

// ─── Toast system ─────────────────────────────────────────────────

type Toast = {
  id: number;
  kind: "success" | "error" | "info";
  message: string;
};

function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  function push(kind: Toast["kind"], message: string) {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }

  function dismiss(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return { toasts, push, dismiss };
}

function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-80 flex-col gap-2">
      {toasts.map((t) => {
        const styles =
          t.kind === "success"
            ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100"
            : t.kind === "error"
              ? "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
              : "border-deep-200 bg-cream-50 text-deep-800 dark:border-deep-800 dark:bg-deep-900 dark:text-cream-100";

        const icon =
          t.kind === "success" ? (
            <CheckCircle2 size={14} />
          ) : t.kind === "error" ? (
            <AlertCircle size={14} />
          ) : (
            <Clock size={14} />
          );

        return (
          <div
            key={t.id}
            className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs shadow-lg ${styles}`}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/50 dark:bg-black/20">
              {icon}
            </span>
            <span className="flex-1 leading-snug">{t.message}</span>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="text-current opacity-50 transition hover:opacity-100"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────

export function PaymentsPanel({ search = "" }: { search?: string }) {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const { toasts, push, dismiss } = useToasts();

  const [activeAction, setActiveAction] = useState<{
    id: number;
    kind: "prompt" | "reconcile" | "delete";
  } | null>(null);

  const [awaitingIds, setAwaitingIds] = useState<Set<number>>(new Set());
  const pollTimers = useRef<Map<number, ReturnType<typeof setInterval>>>(
    new Map(),
  );

  const [expanded, setExpanded] = useState<Set<number>>(new Set());

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
    return () => {
      for (const timer of pollTimers.current.values()) clearInterval(timer);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter((inv) =>
      [
        inv.invoiceNumber,
        inv.customerName,
        inv.customerPhone,
        inv.description ?? "",
        inv.mpesaReceipt ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [invoices, search]);

  function toggleExpanded(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ─── Actions ───────────────────────────────────────────────────

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
        push("success", "Invoice created");
        await refresh();
      } catch (err) {
        push("error", err instanceof Error ? err.message : "Create failed");
      }
    });
  }

  function handlePrompt(inv: InvoiceRow) {
    setActiveAction({ id: inv.id, kind: "prompt" });
    startTransition(async () => {
      try {
        await sendPaymentPrompt(inv.id);
        push(
          "success",
          `STK prompt sent to ${inv.customerPhone}. Awaiting PIN entry.`,
        );
        setExpanded((prev) => new Set(prev).add(inv.id));
        setAwaitingIds((prev) => new Set(prev).add(inv.id));
        startPolling(inv.id);
        await refresh();
      } catch (err) {
        push("error", err instanceof Error ? err.message : "STK failed");
      } finally {
        setActiveAction(null);
      }
    });
  }

  function startPolling(invoiceId: number) {
    if (pollTimers.current.has(invoiceId)) return;

    let attempts = 0;
    const maxAttempts = 24;

    const timer = setInterval(async () => {
      attempts++;
      try {
        const result = await reconcileInvoice(invoiceId);
        if (result.status === "PAID") {
          stopPolling(invoiceId);
          push("success", "Payment confirmed! Invoice is now PAID.");
          await refresh();
        } else if (result.status === "FAILED") {
          stopPolling(invoiceId);
          push(
            "error",
            `Payment failed: ${result.message ?? "User cancelled or timed out"}`,
          );
          await refresh();
        } else if (attempts >= maxAttempts) {
          stopPolling(invoiceId);
          push(
            "info",
            "Payment status unknown after 2 min. Check Safaricom SMS or click Refresh.",
          );
          await refresh();
        }
      } catch {
        // Silent — try again next tick
      }
    }, 5000);

    pollTimers.current.set(invoiceId, timer);
  }

  function stopPolling(invoiceId: number) {
    const timer = pollTimers.current.get(invoiceId);
    if (timer) {
      clearInterval(timer);
      pollTimers.current.delete(invoiceId);
    }
    setAwaitingIds((prev) => {
      const next = new Set(prev);
      next.delete(invoiceId);
      return next;
    });
  }

  function handleReconcile(inv: InvoiceRow) {
    setActiveAction({ id: inv.id, kind: "reconcile" });
    startTransition(async () => {
      try {
        const result = await reconcileInvoice(inv.id);
        if (result.status === "PAID") {
          push("success", "Payment confirmed — invoice marked PAID");
          stopPolling(inv.id);
        } else if (result.status === "FAILED") {
          push(
            "error",
            `Payment failed: ${result.message ?? "User cancelled or timed out"}`,
          );
          stopPolling(inv.id);
        } else if (result.status === "PENDING") {
          push("info", "Still pending on Safaricom. Check back in a minute.");
        } else {
          push("info", "No pending transaction found for this invoice");
        }
        await refresh();
      } catch (err) {
        push("error", err instanceof Error ? err.message : "Reconcile failed");
      } finally {
        setActiveAction(null);
      }
    });
  }

  function handleDelete(inv: InvoiceRow) {
    if (!confirm(`Delete invoice ${inv.invoiceNumber}?`)) return;
    setActiveAction({ id: inv.id, kind: "delete" });
    startTransition(async () => {
      try {
        await deleteInvoice(inv.id);
        push("success", "Invoice deleted");
        await refresh();
      } catch (err) {
        push("error", err instanceof Error ? err.message : "Delete failed");
      } finally {
        setActiveAction(null);
      }
    });
  }

  // ─── Render ────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
            Invoices
          </h2>
          <p className="mt-0.5 text-xs text-deep-600 dark:text-cream-400">
            Create an invoice, then send an M-Pesa prompt to the customer's
            phone.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
          disabled={pending}
        >
          {showForm ? "Cancel" : "+ New invoice"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="grid gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-3 sm:grid-cols-[1fr_1fr_120px_auto] dark:border-emerald-800 dark:bg-emerald-950/40">
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
            placeholder="KES"
            className={inputClass}
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={pending || !name || !phone || !amount}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
          >
            {pending ? "Creating…" : "Create"}
          </button>
        </div>
      )}

      {/* Empty state */}
      {loading && invoices.length === 0 && (
        <div className="h-32 animate-pulse rounded-xl bg-cream-50 dark:bg-deep-900" />
      )}

      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-deep-200 px-6 py-12 text-center dark:border-deep-800">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-deep-100 dark:bg-deep-800">
            <span className="text-lg text-deep-400 dark:text-cream-500">
              📄
            </span>
          </div>
          <p className="text-sm text-deep-500 dark:text-cream-500">
            {invoices.length === 0
              ? "No invoices yet. Click “New invoice” to get started."
              : "No invoices match your search."}
          </p>
        </div>
      )}

      {/* Invoice list */}
      <div className="space-y-2">
        {filtered.map((inv) => {
          const isPaid = inv.status === "PAID";
          const isAwaiting = awaitingIds.has(inv.id);
          const isOpen = expanded.has(inv.id);
          const actionForThis = activeAction?.id === inv.id;
          const isPendingPrompt =
            actionForThis && activeAction?.kind === "prompt";
          const isPendingReconcile =
            actionForThis && activeAction?.kind === "reconcile";
          const isPendingDelete =
            actionForThis && activeAction?.kind === "delete";

          return (
            <div
              key={inv.id}
              className={[
                "overflow-hidden rounded-xl border bg-cream-50 transition dark:bg-deep-900",
                isOpen
                  ? "border-emerald-400 shadow-sm dark:border-emerald-700"
                  : "border-deep-200 hover:border-deep-300 dark:border-deep-800 dark:hover:border-deep-700",
              ].join(" ")}
            >
              {/* ─── Collapsed row ─────────────────────────── */}
              <button
                type="button"
                onClick={() => toggleExpanded(inv.id)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left"
              >
                <span className="mt-0.5 text-deep-400 dark:text-cream-500">
                  {isOpen ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  {/* Row 1: invoice # + status pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-deep-800 dark:text-cream-100">
                      {inv.invoiceNumber}
                    </span>
                    <StatusPill status={inv.status} isAwaiting={isAwaiting} />
                    {inv.quoteId && (
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                        Quote
                      </span>
                    )}
                  </div>

                  {/* Row 2: customer */}
                  <p className="mt-0.5 truncate text-xs text-deep-500 dark:text-cream-500">
                    {inv.customerName} · {inv.customerPhone}
                  </p>

                  {/* Row 3: receipt chip (if paid) */}
                  {inv.mpesaReceipt && (
                    <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                      <CheckCircle2 size={10} />
                      {inv.mpesaReceipt}
                    </div>
                  )}

                  {/* Row 4: note (if any) */}
                  {inv.description && (
                    <p className="mt-1 line-clamp-1 text-[11px] italic text-deep-500 dark:text-cream-500">
                      <FileText size={10} className="mr-1 inline" />
                      {inv.description}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-deep-800 dark:text-cream-100">
                    KES {inv.amount.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-deep-400 dark:text-cream-500">
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </button>

              {/* ─── Expanded detail ───────────────────────── */}
              {isOpen && (
                <div className="border-t border-deep-200 px-4 pb-4 pt-3 dark:border-deep-800">
                  {/* Receipt (expanded, with copy button) */}
                  {inv.mpesaReceipt && (
                    <div className="mb-3">
                      <ReceiptChip
                        receipt={inv.mpesaReceipt}
                        onCopy={push}
                      />
                    </div>
                  )}

                  {/* Note editor */}
                  <div className="mb-3">
                    <NoteEditor
                      invoiceId={inv.id}
                      initialNote={inv.description}
                      onSaved={refresh}
                      onToast={push}
                    />
                  </div>

                  {/* Awaiting PIN banner */}
                  {isAwaiting && !isPaid && (
                    <div className="mb-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                      <Clock size={14} className="mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold">Waiting for PIN entry</p>
                        <p className="mt-0.5 opacity-80">
                          Prompt sent to {inv.customerPhone}. Auto-checking
                          every 5 seconds…
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  {!isPaid && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handlePrompt(inv)}
                        disabled={pending}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
                      >
                        {isPendingPrompt ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <Send size={14} />
                        )}
                        {isPendingPrompt ? "Sending…" : "Send STK Push"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReconcile(inv)}
                        disabled={pending}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-deep-200 bg-white px-3 py-2 text-xs font-semibold text-deep-700 transition hover:bg-cream-100 disabled:opacity-50 dark:border-deep-700 dark:bg-deep-950 dark:text-cream-300 dark:hover:bg-deep-800"
                      >
                        {isPendingReconcile ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <RefreshCw size={14} />
                        )}
                        {isPendingReconcile ? "Checking…" : "Refresh status"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(inv)}
                        disabled={pending}
                        className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
                      >
                        {isPendingDelete ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        {isPendingDelete ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  )}

                  {/* Paid banner */}
                  {isPaid && (
                    <div className="flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold">Payment received</p>
                        <p className="mt-0.5 opacity-80">
                          {inv.paidAt
                            ? `Paid on ${new Date(inv.paidAt).toLocaleString()}`
                            : "Invoice marked as paid."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    <div>
                      <dt className="text-deep-400 dark:text-cream-500">
                        Created
                      </dt>
                      <dd className="font-medium text-deep-700 dark:text-cream-300">
                        {new Date(inv.createdAt).toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-deep-400 dark:text-cream-500">
                        Status
                      </dt>
                      <dd className="font-medium text-deep-700 dark:text-cream-300">
                        {inv.status}
                      </dd>
                    </div>
                    {inv.paidAt && (
                      <div className="col-span-2">
                        <dt className="text-deep-400 dark:text-cream-500">
                          Paid at
                        </dt>
                        <dd className="font-medium text-deep-700 dark:text-cream-300">
                          {new Date(inv.paidAt).toLocaleString()}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────

function ReceiptChip({
  receipt,
  onCopy,
}: {
  receipt: string;
  onCopy: (kind: Toast["kind"], msg: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(receipt);
      setCopied(true);
      onCopy("success", "Receipt copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onCopy("error", "Could not copy — copy manually");
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs dark:border-emerald-800 dark:bg-emerald-950/40">
      <FileText
        size={14}
        className="shrink-0 text-emerald-700 dark:text-emerald-300"
      />
      <span className="text-emerald-700 dark:text-emerald-300">
        M-Pesa receipt:
      </span>
      <code className="flex-1 truncate font-mono text-[11px] font-bold text-emerald-900 dark:text-emerald-100">
        {receipt}
      </code>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded p-1 text-emerald-700 transition hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900"
        aria-label="Copy receipt"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </button>
    </div>
  );
}

function NoteEditor({
  invoiceId,
  initialNote,
  onSaved,
  onToast,
}: {
  invoiceId: number;
  initialNote: string | null;
  onSaved: () => void;
  onToast: (kind: Toast["kind"], msg: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialNote ?? "");
  const [saving, setSaving] = useState(false);
  const [pending, startTransition] = useTransition();

  function startEdit() {
    setValue(initialNote ?? "");
    setEditing(true);
  }

  function cancel() {
    setValue(initialNote ?? "");
    setEditing(false);
  }

  function save() {
    setSaving(true);
    startTransition(async () => {
      try {
        await updateInvoiceNote(invoiceId, value.trim() || null);
        setEditing(false);
        onToast("success", "Note saved");
        onSaved();
      } catch (err) {
        onToast("error", err instanceof Error ? err.message : "Save failed");
      } finally {
        setSaving(false);
      }
    });
  }
  if (!editing) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-deep-200 bg-white px-3 py-2 text-xs dark:border-deep-800 dark:bg-deep-950">
        <FileText
          size={14}
          className="mt-0.5 shrink-0 text-deep-400 dark:text-cream-500"
        />
        <span className="flex-1 italic text-deep-600 dark:text-cream-400">
          {initialNote || "No note"}
        </span>
        <button
          type="button"
          onClick={startEdit}
          className="shrink-0 rounded p-1 text-deep-500 transition hover:bg-cream-100 dark:text-cream-400 dark:hover:bg-deep-800"
          aria-label="Edit note"
        >
          <Pencil size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-2 dark:border-emerald-800 dark:bg-emerald-950/40">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a note for this invoice…"
        rows={2}
        maxLength={500}
        className="w-full resize-none rounded border border-deep-200 bg-white px-2 py-1.5 text-xs text-deep-800 outline-none focus:border-emerald-500 dark:border-deep-800 dark:bg-deep-950 dark:text-cream-100"
        autoFocus
      />
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="text-[10px] text-deep-400 dark:text-cream-500">
          {value.length}/500
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={cancel}
            disabled={saving}
            className="rounded px-2 py-1 text-[11px] font-semibold text-deep-600 transition hover:bg-cream-200 dark:text-cream-400 dark:hover:bg-deep-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || pending}
            className="rounded bg-emerald-700 px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}   // ⭐ CRITICAL — this closes the NoteEditor function

function StatusPill({
  status,
  isAwaiting,
}: {
  status: string;
  isAwaiting: boolean;
}) {
  if (status === "PAID") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
        <CheckCircle2 size={10} />
        Paid
      </span>
    );
  }
  if (isAwaiting) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-950 dark:text-amber-200">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
        Awaiting PIN
      </span>
    );
  }
  return (
        <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-950 dark:text-amber-200">
      <Clock size={10} />
      Pending
    </span>
  );
}