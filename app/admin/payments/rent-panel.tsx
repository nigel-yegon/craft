// app/admin/payments/rent-panel.tsx
"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  RefreshCw,
  Trash2,
} from "lucide-react";

import {
  listRentInvoices,
  sendRentPrompt,
  reconcileRentInvoice,
  deleteRentInvoice,
  type RentInvoiceRow,
} from "../actions/rent";

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
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      5000,
    );
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

export function RentPanel({ search = "" }: { search?: string }) {
  const [rows, setRows] = useState<RentInvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const { toasts, push, dismiss } = useToasts();
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [awaitingIds, setAwaitingIds] = useState<Set<number>>(new Set());
  const pollTimers = useRef<Map<number, ReturnType<typeof setInterval>>>(
    new Map(),
  );
  const [activeAction, setActiveAction] = useState<{
    id: number;
    kind: "prompt" | "reconcile" | "delete";
  } | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      setRows(await listRentInvoices());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    return () => {
      for (const t of pollTimers.current.values()) clearInterval(t);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [
        r.unitNumber,
        r.propertyName,
        r.tenantName,
        r.tenantPhone,
        r.forMonth,
        r.mpesaReceipt ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [rows, search]);

  function toggleExpanded(id: number) {
    setExpanded((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function handlePrompt(inv: RentInvoiceRow) {
    setActiveAction({ id: inv.id, kind: "prompt" });
    startTransition(async () => {
      try {
        await sendRentPrompt(inv.id);
        push("success", `STK sent to ${inv.tenantPhone}. Awaiting PIN.`);
        setExpanded((prev) => new Set(prev).add(inv.id));
        setAwaitingIds((prev) => new Set(prev).add(inv.id));
        startPolling(inv.id);
        await refresh();
      } catch (err) {
        push(
          "error",
          err instanceof Error ? err.message : "STK failed",
        );
      } finally {
        setActiveAction(null);
      }
    });
  }

  function startPolling(id: number) {
    if (pollTimers.current.has(id)) return;
    let attempts = 0;
    const maxAttempts = 24;
    const timer = setInterval(async () => {
      attempts++;
      try {
        const result = await reconcileRentInvoice(id);
        if (result.status === "PAID") {
          stopPolling(id);
          push("success", "Payment confirmed! Rent invoice is now PAID.");
          await refresh();
        } else if (result.status === "FAILED") {
          stopPolling(id);
          push("error", result.message ?? "Payment failed");
          await refresh();
        } else if (attempts >= maxAttempts) {
          stopPolling(id);
          push(
            "info",
            "Status unknown after 2 min. Check Safaricom SMS.",
          );
          await refresh();
        }
      } catch {
        // retry next tick
      }
    }, 5000);
    pollTimers.current.set(id, timer);
  }

  function stopPolling(id: number) {
    const t = pollTimers.current.get(id);
    if (t) clearInterval(t);
    pollTimers.current.delete(id);
    setAwaitingIds((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  }

  function handleReconcile(inv: RentInvoiceRow) {
    setActiveAction({ id: inv.id, kind: "reconcile" });
    startTransition(async () => {
      try {
        const r = await reconcileRentInvoice(inv.id);
        if (r.status === "PAID") {
          push("success", "Payment confirmed — invoice marked PAID");
          stopPolling(inv.id);
        } else if (r.status === "FAILED") {
          push("error", r.message ?? "Payment failed");
          stopPolling(inv.id);
        } else if (r.status === "PENDING") {
          push("info", "Still pending on Safaricom.");
        } else {
          push("info", "No pending transaction for this invoice");
        }
        await refresh();
      } catch (err) {
        push(
          "error",
          err instanceof Error ? err.message : "Reconcile failed",
        );
      } finally {
        setActiveAction(null);
      }
    });
  }

  function handleDelete(inv: RentInvoiceRow) {
    if (
      !confirm(
        `Delete rent invoice for unit ${inv.unitNumber} (${inv.forMonth})?`,
      )
    )
      return;
    setActiveAction({ id: inv.id, kind: "delete" });
    startTransition(async () => {
      try {
        await deleteRentInvoice(inv.id);
        push("success", "Rent invoice deleted");
        await refresh();
      } catch (err) {
        push(
          "error",
          err instanceof Error ? err.message : "Delete failed",
        );
      } finally {
        setActiveAction(null);
      }
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div>
        <h2 className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
          Rent Invoices
        </h2>
        <p className="mt-0.5 text-xs text-deep-600 dark:text-cream-400">
          Monthly rent invoices across all units. Send STK prompt, reconcile,
          or delete.
        </p>
      </div>

      {loading && rows.length === 0 && (
        <div className="h-32 animate-pulse rounded-xl bg-cream-50 dark:bg-deep-900" />
      )}

      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-deep-200 px-6 py-12 text-center dark:border-deep-800">
          <p className="text-sm text-deep-500 dark:text-cream-500">
            {rows.length === 0
              ? "No rent invoices yet. They'll appear here once the monthly cron runs or units are synced."
              : "No rent invoices match your search."}
          </p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((inv) => {
          const isPaid = inv.status === "PAID";
          const isOverdue =
            inv.status === "PENDING" && new Date(inv.dueDate) < new Date();
          const isAwaiting = awaitingIds.has(inv.id);
          const isOpen = expanded.has(inv.id);
          const actionForThis = activeAction?.id === inv.id;

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
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-deep-800 dark:text-cream-100">
                      Unit {inv.unitNumber} · {inv.forMonth}
                    </span>
                    <RentStatusPill
                      status={inv.status}
                      isAwaiting={isAwaiting}
                      isOverdue={isOverdue}
                    />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-deep-500 dark:text-cream-500">
                    {inv.tenantName} · {inv.tenantPhone} ·{" "}
                    {inv.propertyName}
                  </p>
                  <p className="mt-1 text-[11px] text-deep-400 dark:text-cream-500">
                    Due {new Date(inv.dueDate).toLocaleDateString()}
                  </p>
                  {inv.mpesaReceipt && (
                    <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                      <CheckCircle2 size={10} />
                      {inv.mpesaReceipt}
                    </div>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-deep-800 dark:text-cream-100">
                    KES {inv.amount.toLocaleString()}
                  </p>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-deep-200 px-4 pb-4 pt-3 dark:border-deep-800">
                  {isAwaiting && !isPaid && (
                    <div className="mb-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                      <Clock size={14} className="mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold">
                          Waiting for PIN entry
                        </p>
                        <p className="mt-0.5 opacity-80">
                          Sent to {inv.tenantPhone}. Checking every 5
                          seconds…
                        </p>
                      </div>
                    </div>
                  )}

                  {!isPaid && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handlePrompt(inv)}
                        disabled={pending}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
                      >
                        {actionForThis &&
                        activeAction?.kind === "prompt" ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <Send size={14} />
                        )}
                        Send STK Push
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReconcile(inv)}
                        disabled={pending}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-deep-200 bg-white px-3 py-2 text-xs font-semibold text-deep-700 transition hover:bg-cream-100 disabled:opacity-50 dark:border-deep-700 dark:bg-deep-950 dark:text-cream-300 dark:hover:bg-deep-800"
                      >
                        {actionForThis &&
                        activeAction?.kind === "reconcile" ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <RefreshCw size={14} />
                        )}
                        Refresh status
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(inv)}
                        disabled={pending}
                        className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
                      >
                        {actionForThis &&
                        activeAction?.kind === "delete" ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        Delete
                      </button>
                    </div>
                  )}

                  {isPaid && (
                    <div className="flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 shrink-0"
                      />
                      <div>
                        <p className="font-semibold">Rent received</p>
                        <p className="mt-0.5 opacity-80">
                          {inv.paidAt
                            ? `Paid on ${new Date(inv.paidAt).toLocaleString()}`
                            : "Marked as paid."}
                        </p>
                      </div>
                    </div>
                  )}

                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    <div>
                      <dt className="text-deep-400 dark:text-cream-500">
                        Unit
                      </dt>
                      <dd className="font-medium text-deep-700 dark:text-cream-300">
                        {inv.unitNumber}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-deep-400 dark:text-cream-500">
                        Property
                      </dt>
                      <dd className="font-medium text-deep-700 dark:text-cream-300">
                        {inv.propertyName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-deep-400 dark:text-cream-500">
                        For month
                      </dt>
                      <dd className="font-medium text-deep-700 dark:text-cream-300">
                        {inv.forMonth}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-deep-400 dark:text-cream-500">
                        Created
                      </dt>
                      <dd className="font-medium text-deep-700 dark:text-cream-300">
                        {new Date(inv.createdAt).toLocaleString()}
                      </dd>
                    </div>
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

function RentStatusPill({
  status,
  isAwaiting,
  isOverdue,
}: {
  status: string;
  isAwaiting: boolean;
  isOverdue: boolean;
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
  if (isOverdue) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-800 dark:bg-red-950 dark:text-red-200">
        <AlertCircle size={10} />
        Overdue
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