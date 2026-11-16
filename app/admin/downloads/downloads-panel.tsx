// app/admin/downloads/downloads-panel.tsx
"use client";

import { useEffect, useState } from "react";
import {
  listAllBackups,
  deleteBackup,
  type BackupRow,
} from "../actions/businesses";

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DownloadsPanel({ search = "" }: { search?: string }) {
  const [items, setItems] = useState<BackupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listAllBackups({ search: search || undefined });
      setItems(rows);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load backups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const download = (b: BackupRow) => {
    // Trigger a browser download via the API endpoint
    window.open(`/api/backups/${b.id}/download`, "_blank");
  };

  const remove = async (b: BackupRow) => {
    if (!confirm(`Delete backup "${b.filename}" for "${b.businessName}"?`)) {
      return;
    }
    setBusyId(b.id);
    try {
      await deleteBackup(b.id);
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
              <DownloadIcon />
            </span>
            <h2 className="text-xl font-bold text-teal-700 dark:text-teal-300">
              Downloads
            </h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-deep-600 dark:text-cream-400">
            Every cloud backup uploaded from the Flutter POS apps. Download any
            snapshot for inspection or restore.
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
            No backups uploaded yet. Once users tap "Backup to cloud" in the
            Flutter app, their snapshots appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-deep-200 bg-cream-50 dark:border-deep-800 dark:bg-deep-900">
          <table className="w-full text-sm">
            <thead className="bg-cream-100 text-[10px] uppercase tracking-[0.14em] text-deep-500 dark:bg-deep-800 dark:text-cream-500">
              <tr>
                <th className="px-4 py-3 text-left">Business</th>
                <th className="px-4 py-3 text-left">Filename</th>
                <th className="px-4 py-3 text-right">Size</th>
                <th className="px-4 py-3 text-right">Uploaded</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-deep-100 dark:divide-deep-800">
              {items.map((b) => (
                <tr
                  key={b.id}
                  className="transition hover:bg-cream-100/50 dark:hover:bg-deep-800/50"
                >
                  <td className="px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-deep-800 dark:text-cream-100">
                        {b.businessName}
                      </p>
                      <p className="truncate font-mono text-[10px] text-deep-400 dark:text-cream-500">
                        {b.businessId}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-deep-600 dark:text-cream-400">
                    {b.filename}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-deep-800 dark:text-cream-100">
                    {fmtSize(b.sizeBytes)}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-deep-600 dark:text-cream-400">
                    {new Date(b.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => download(b)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-950/40"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => remove(b)}
                        disabled={busyId === b.id}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
                      >
                        {busyId === b.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DownloadIcon() {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}