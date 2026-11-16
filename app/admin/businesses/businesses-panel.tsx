// app/admin/businesses/businesses-panel.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listBusinesses,
  getBusinessDetail,
  type BusinessSummary,
  type BusinessDetail,
} from "../actions/businesses";

const inputClass =
  "w-full rounded-xl border border-deep-200 bg-cream-100 px-3 py-2 text-sm " +
  "text-deep-800 outline-none transition placeholder:text-deep-400 " +
  "focus:bg-cream-50 focus:ring-2 focus:ring-cyan-500/20 " +
  "dark:border-deep-700 dark:bg-deep-950 dark:text-cream-100 " +
  "dark:placeholder:text-cream-400 dark:focus:bg-deep-950";

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function BusinessesPanel({ search = "" }: { search?: string }) {
  const [items, setItems] = useState<BusinessSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, BusinessDetail>>({});
  const [detailLoading, setDetailLoading] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listBusinesses({ search: search || undefined });
      setItems(rows);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load businesses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);

    // Fetch detail if not already cached
    if (!details[id]) {
      setDetailLoading(id);
      try {
        const detail = await getBusinessDetail(id);
        if (detail) {
          setDetails((prev) => ({ ...prev, [id]: detail }));
        }
      } catch (e) {
        console.error("Failed to load business detail:", e);
      } finally {
        setDetailLoading(null);
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
              <StoreIcon />
            </span>
            <h2 className="text-xl font-bold text-cyan-700 dark:text-cyan-300">
              Businesses
            </h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-deep-600 dark:text-cream-400">
            Every shop that has registered via the Flutter POS app. Click a row
            to see activity, backups, and notifications.
          </p>
        </div>
        <button
          onClick={refresh}
          className="rounded-xl border border-deep-200 px-4 py-2.5 text-sm font-semibold text-deep-700 transition hover:bg-cream-200 dark:border-deep-700 dark:text-cream-300 dark:hover:bg-deep-800"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-deep-500 dark:text-cream-400">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-deep-200 bg-cream-50 p-12 text-center dark:border-deep-800 dark:bg-deep-900">
          <p className="text-sm text-deep-500 dark:text-cream-400">
            No businesses registered yet. Once a shop completes setup in the
            Flutter app, it will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-deep-200 bg-cream-50 dark:border-deep-800 dark:bg-deep-900">
          <table className="w-full text-sm">
            <thead className="bg-cream-100 text-[10px] uppercase tracking-[0.14em] text-deep-500 dark:bg-deep-800 dark:text-cream-500">
              <tr>
                <th className="w-8 px-2 py-3"></th>
                <th className="px-4 py-3 text-left">Shop</th>
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-right">Notifications</th>
                <th className="px-4 py-3 text-right">Backups</th>
                <th className="px-4 py-3 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-deep-100 dark:divide-deep-800">
              {items.map((b) => {
                const expanded = expandedId === b.id;
                const detail = details[b.id];
                const loadingThis = detailLoading === b.id;

                return (
                  <>
                    <tr
                      key={b.id}
                      onClick={() => toggleExpand(b.id)}
                      className="cursor-pointer transition hover:bg-cream-100/50 dark:hover:bg-deep-800/50"
                    >
                      <td className="px-2 py-3 text-deep-400 dark:text-cream-600">
                        {expanded ? "▼" : "▶"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-deep-800 dark:text-cream-100">
                            {b.name}
                          </p>
                          <p className="truncate font-mono text-[10px] text-deep-400 dark:text-cream-500">
                            {b.id}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-deep-600 dark:text-cream-400">
                        {b.phone ?? b.email ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-deep-800 dark:text-cream-100">
                        {b.notificationCount}
                        {b.lastNotificationAt && (
                          <div className="text-[10px] text-deep-400 dark:text-cream-500">
                            {new Date(b.lastNotificationAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-deep-800 dark:text-cream-100">
                        {b.backupCount}
                        {b.lastBackupAt && (
                          <div className="text-[10px] text-deep-400 dark:text-cream-500">
                            {new Date(b.lastBackupAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-deep-600 dark:text-cream-400">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                    {expanded && (
                      <tr key={`${b.id}-detail`} className="bg-cream-100/30 dark:bg-deep-800/30">
                        <td colSpan={6} className="px-6 py-4">
                          {loadingThis ? (
                            <p className="text-xs text-deep-500 dark:text-cream-400">
                              Loading details…
                            </p>
                          ) : detail ? (
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <h4 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-deep-500 dark:text-cream-400">
                                  Recent notifications
                                </h4>
                                {detail.recentNotifications.length === 0 ? (
                                  <p className="mt-2 text-xs text-deep-500 dark:text-cream-500">
                                    No notifications yet.
                                  </p>
                                ) : (
                                  <ul className="mt-2 space-y-1">
                                    {detail.recentNotifications.map((n) => (
                                      <li
                                        key={n.id}
                                        className="rounded-lg bg-cream-50 px-3 py-2 text-xs dark:bg-deep-900"
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="truncate font-medium text-deep-800 dark:text-cream-100">
                                            {n.title}
                                          </span>
                                          <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                                            {n.type}
                                          </span>
                                        </div>
                                        <p className="mt-0.5 text-[10px] text-deep-400 dark:text-cream-500">
                                          {new Date(n.publishedAt).toLocaleString()}
                                        </p>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                              <div>
                                <h4 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-deep-500 dark:text-cream-400">
                                  Recent backups
                                </h4>
                                {detail.recentBackups.length === 0 ? (
                                  <p className="mt-2 text-xs text-deep-500 dark:text-cream-500">
                                    No backups yet.
                                  </p>
                                ) : (
                                  <ul className="mt-2 space-y-1">
                                    {detail.recentBackups.map((bk) => (
                                      <li
                                        key={bk.id}
                                        className="rounded-lg bg-cream-50 px-3 py-2 text-xs dark:bg-deep-900"
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="font-mono text-[10px] text-deep-700 dark:text-cream-300">
                                            {bk.filename}
                                          </span>
                                          <span className="text-[10px] text-deep-500 dark:text-cream-500">
                                            {fmtSize(bk.sizeBytes)}
                                          </span>
                                        </div>
                                        <p className="mt-0.5 text-[10px] text-deep-400 dark:text-cream-500">
                                          {new Date(bk.createdAt).toLocaleString()}
                                        </p>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-deep-500 dark:text-cream-400">
                              Failed to load details.
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StoreIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M3 9h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <path d="M3 9V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3" />
      <path d="M8 13h8" />
    </svg>
  );
}