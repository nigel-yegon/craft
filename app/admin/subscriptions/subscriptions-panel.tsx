// app/admin/payments/subscriptions-panel.tsx
"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { listSubscriptions, type SubscriptionRow } from "../actions/subscriptions";

export function SubscriptionsPanel({ search = "" }: { search?: string }) {
  const [transactions, setTransactions] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      setTransactions(await listSubscriptions());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter((tx) =>
      [tx.phone, tx.receipt, tx.plan, tx.status]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [transactions, search]);

  if (loading && transactions.length === 0) {
    return <div className="h-24 animate-pulse rounded-2xl bg-cream-50 dark:bg-deep-900" />;
  }

  return (
    <div className="space-y-4">
      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-deep-200 p-10 text-center text-sm text-deep-500 dark:border-deep-800 dark:text-cream-500">
          No subscription transactions found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-deep-200 bg-cream-50 dark:border-deep-800 dark:bg-deep-900">
          <table className="w-full text-left text-sm text-deep-800 dark:text-cream-100">
            <thead className="border-b border-deep-200 bg-deep-50/50 text-xs uppercase text-deep-500 dark:border-deep-800 dark:bg-deep-950 dark:text-cream-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-deep-200 dark:divide-deep-800">
              {filtered.map((tx) => (
                <Fragment key={tx.id}>
                  <tr
                    onClick={() => setExpandedId(expandedId === tx.id ? null : tx.id)}
                    className="cursor-pointer transition hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium">{tx.phone}</td>
                    <td className="px-4 py-3 capitalize text-brand-600 dark:text-brand-400 font-semibold">
                      {tx.plan || "N/A"}
                    </td>
                    <td className="px-4 py-3 font-semibold">KES {tx.amount}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          tx.status === "SUCCESS"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                            : tx.status === "PENDING"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                            : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {expandedId === tx.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </td>
                  </tr>
                  
                  {expandedId === tx.id && (
                    <tr className="bg-emerald-50/30 dark:bg-deep-950/50">
                      <td colSpan={6} className="px-4 py-4 text-xs">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-deep-500 dark:text-cream-500">Checkout Request ID</p>
                            <p className="font-mono text-deep-800 dark:text-cream-200 break-all">
                              {tx.checkoutRequestId || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-deep-500 dark:text-cream-500">M-Pesa Receipt</p>
                            <p className="font-mono text-emerald-600 dark:text-emerald-400">
                              {tx.receipt || "Awaiting confirmation"}
                            </p>
                          </div>
                          <div>
                            <p className="text-deep-500 dark:text-cream-500">Last Updated</p>
                            <p>{new Date(tx.updatedAt).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-deep-500 dark:text-cream-500">Result Description</p>
                            <p>{tx.resultDesc || "N/A"}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}