// app/admin/notifications/notifications-client.tsx
"use client";

import { useEffect, useState } from "react";

type NotificationType =
  | "subscription"
  | "code"
  | "alert"
  | "backup"
  | "system";

type NotificationRow = {
  id: string;
  businessId: string;
  type: NotificationType;
  title: string;
  body: string;
  actionRoute: string | null;
  payload: unknown;
  publishedAt: string;
};

const TYPES: { value: NotificationType; label: string }[] = [
  { value: "subscription", label: "Subscription" },
  { value: "code", label: "Activation code" },
  { value: "alert", label: "Low stock / alert" },
  { value: "backup", label: "Backup status" },
  { value: "system", label: "System" },
];

export default function NotificationsClient() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [businessId, setBusinessId] = useState("");
  const [type, setType] = useState<NotificationType>("system");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [actionRoute, setActionRoute] = useState("");
  

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/notifications?limit=50", {
        cache: "no-store",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      setItems(await res.json());
    } catch (e: any) {
      setError(e?.message ?? "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: businessId.trim(),
          type,
          title: title.trim(),
          body: body.trim(),
          actionRoute: actionRoute.trim() || null,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      // Reset the form but keep businessId for convenience
      setTitle("");
      setBody("");
      setActionRoute("");
      refresh();
    } catch (e: any) {
      setError(e?.message ?? "Failed to publish notification");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this notification?")) return;
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      setItems((prev) => prev.filter((n) => n.id !== id));
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete notification");
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* ── Publish form ───────────────────────────── */}
      <form
        onSubmit={submit}
        className="rounded-xl border border-cream-300 bg-white p-6 shadow-sm dark:border-deep-800 dark:bg-deep-900"
      >
        <h2 className="mb-4 text-lg font-semibold text-deep-900 dark:text-cream-100">
          Compose notification
        </h2>

        <div className="space-y-4">
          <Field label="Business ID">
            <input
              required
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              placeholder="UUID of the shop, or 'default-business-id'"
              className="w-full rounded-md border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-deep-900 focus:border-deep-500 focus:outline-none dark:border-deep-700 dark:bg-deep-800 dark:text-cream-100"
            />
          </Field>

          <Field label="Type">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as NotificationType)}
              className="w-full rounded-md border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-deep-900 focus:border-deep-500 focus:outline-none dark:border-deep-700 dark:bg-deep-800 dark:text-cream-100"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Title">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="e.g. Subscription Expiring Soon"
              className="w-full rounded-md border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-deep-900 focus:border-deep-500 focus:outline-none dark:border-deep-700 dark:bg-deep-800 dark:text-cream-100"
            />
          </Field>

          <Field label="Body">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Message shown in the app"
              className="w-full rounded-md border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-deep-900 focus:border-deep-500 focus:outline-none dark:border-deep-700 dark:bg-deep-800 dark:text-cream-100"
            />
          </Field>

          <Field label="Action route (optional)">
            <input
              value={actionRoute}
              onChange={(e) => setActionRoute(e.target.value)}
              placeholder="/settings/subscription"
              className="w-full rounded-md border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-deep-900 focus:border-deep-500 focus:outline-none dark:border-deep-700 dark:bg-deep-800 dark:text-cream-100"
            />
          </Field>
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-md bg-deep-900 px-4 py-2.5 text-sm font-medium text-cream-50 transition hover:bg-deep-800 disabled:opacity-50 dark:bg-cream-100 dark:text-deep-900 dark:hover:bg-cream-200"
        >
          {busy ? "Publishing…" : "Publish notification"}
        </button>
      </form>

      {/* ── Recent list ────────────────────────────── */}
      <section className="rounded-xl border border-cream-300 bg-white p-6 shadow-sm dark:border-deep-800 dark:bg-deep-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-deep-900 dark:text-cream-100">
            Recent notifications
          </h2>
          <button
            onClick={refresh}
            className="text-xs font-medium text-deep-500 hover:text-deep-900 dark:text-cream-500 dark:hover:text-cream-100"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-deep-500 dark:text-cream-500">
            Loading…
          </p>
        ) : items.length === 0 ? (
          <p className="text-sm text-deep-500 dark:text-cream-500">
            No notifications yet.
          </p>
        ) : (
          <ul className="divide-y divide-cream-200 dark:divide-deep-800">
            {items.map((n) => (
              <li key={n.id} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-cream-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-deep-700 dark:bg-deep-800 dark:text-cream-300">
                        {n.type}
                      </span>
                      <span className="text-xs text-deep-500 dark:text-cream-500">
                        {n.businessId}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-deep-900 dark:text-cream-100">
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-deep-600 dark:text-cream-400">
                        {n.body}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-deep-400 dark:text-cream-600">
                      {new Date(n.publishedAt).toLocaleString()}
                      {n.actionRoute ? ` · → ${n.actionRoute}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => remove(n.id)}
                    className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-deep-500 dark:text-cream-500">
        {label}
      </span>
      {children}
    </label>
  );
}