// app/admin/notifications/notifications-panel.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

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

type BusinessRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  createdAt: string;
};

const TYPES: { value: NotificationType; label: string; tone: string }[] = [
  {
    value: "subscription",
    label: "Subscription",
    tone:
      "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
  },
  {
    value: "code",
    label: "Activation code",
    tone:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  },
  {
    value: "alert",
    label: "Low stock / alert",
    tone:
      "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  },
  {
    value: "backup",
    label: "Backup status",
    tone: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  },
  {
    value: "system",
    label: "System",
    tone:
      "bg-cream-200 text-deep-700 dark:bg-deep-800 dark:text-cream-300",
  },
];

const inputClass =
  "w-full rounded-xl border border-deep-200 bg-cream-100 px-3 py-2 text-sm " +
  "text-deep-800 outline-none transition " +
  "placeholder:text-deep-400 " +
  "focus:bg-cream-50 focus:ring-2 focus:ring-violet-500/20 " +
  "dark:border-deep-700 dark:bg-deep-950 dark:text-cream-100 " +
  "dark:placeholder:text-cream-400 " +
  "dark:focus:bg-deep-950 dark:[color-scheme:dark]";

export function NotificationsPanel({ search = "" }: { search?: string }) {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter — empty string means "all businesses"
  const [filterBusinessId, setFilterBusinessId] = useState<string>("");

  // Form state
  const [businessId, setBusinessId] = useState("");
  const [type, setType] = useState<NotificationType>("system");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [actionRoute, setActionRoute] = useState("");

  // ⭐ Fetch registered businesses once on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/businesses", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const rows: BusinessRow[] = await res.json();
        setBusinesses(rows);
        // Auto-select the first shop if none chosen
        if (rows.length > 0 && !businessId) {
          setBusinessId(rows[0].id);
        }
      } catch {
        // Silent — the dropdown just stays empty if the endpoint fails
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ limit: "100" });
      if (filterBusinessId.trim()) {
        qs.set("businessId", filterBusinessId.trim());
      }

      const res = await fetch(`/api/admin/notifications?${qs.toString()}`, {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterBusinessId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (n) =>
        n.businessId.toLowerCase().includes(q) ||
        n.title.toLowerCase().includes(q) ||
        n.type.toLowerCase().includes(q),
    );
  }, [items, search]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) {
      setError("Pick a business first");
      return;
    }
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
      if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`);
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

  const selectedBusiness = businesses.find((b) => b.id === businessId);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
              <BellIcon />
            </span>
            <h2 className="text-xl font-bold text-violet-700 dark:text-violet-300">
              Notifications
            </h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-deep-600 dark:text-cream-400">
            Publish announcements, subscription reminders, and alerts to Craft
            POS devices. Each notification lands in the app on the next sync.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Compose form ───────────────────────────── */}
        <form
          onSubmit={submit}
          className="rounded-2xl border border-violet-200/60 bg-cream-50 p-5 dark:border-violet-800/60 dark:bg-deep-900"
        >
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-violet-700 dark:text-violet-300">
            Compose notification
          </h3>

          <div className="space-y-4">
            {/* ⭐ Business dropdown — populated from /api/admin/businesses */}
            <Field label="Business">
              {businesses.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                  No businesses registered yet. Once a shop completes setup,
                  it will appear here.
                </div>
              ) : (
                <select
                  required
                  value={businessId}
                  onChange={(e) => setBusinessId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Choose a shop…</option>
                  {businesses.map((b) => (
                    <option
                      key={b.id}
                      value={b.id}
                      className="bg-cream-100 text-deep-800 dark:bg-deep-900 dark:text-cream-100"
                    >
                      {b.name} — {b.id.slice(0, 8)}…
                    </option>
                  ))}
                </select>
              )}
              {selectedBusiness && (
                <p className="mt-1 text-[11px] text-deep-500 dark:text-cream-500">
                  {selectedBusiness.name}
                  {selectedBusiness.phone ? ` · ${selectedBusiness.phone}` : ""}
                </p>
              )}
            </Field>

            <Field label="Type">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as NotificationType)}
                className={inputClass}
              >
                {TYPES.map((t) => (
                  <option
                    key={t.value}
                    value={t.value}
                    className="bg-cream-100 text-deep-800 dark:bg-deep-900 dark:text-cream-100"
                  >
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
                className={inputClass}
              />
            </Field>

            <Field label="Body">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="Message shown in the app"
                className={`${inputClass} resize-y`}
              />
            </Field>

            <Field label="Action route (optional)">
              <input
                value={actionRoute}
                onChange={(e) => setActionRoute(e.target.value)}
                placeholder="/settings/subscription"
                className={inputClass}
              />
            </Field>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy || businesses.length === 0}
            className="mt-5 w-full rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:opacity-50"
          >
            {busy ? "Publishing…" : "Publish notification"}
          </button>
        </form>

        {/* ── Recent list ────────────────────────────── */}
        <section className="rounded-2xl border border-deep-200 bg-cream-50 p-5 dark:border-deep-800 dark:bg-deep-900">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-deep-500 dark:text-cream-400">
              Recent notifications
            </h3>
            <div className="flex gap-2">
              {/* ⭐ Filter dropdown — same businesses list */}
              {businesses.length > 0 && (
                <select
                  value={filterBusinessId}
                  onChange={(e) => setFilterBusinessId(e.target.value)}
                  className={`${inputClass} max-w-xs w-auto!`}
                >
                  <option value="">All businesses</option>
                  {businesses.map((b) => (
                    <option
                      key={b.id}
                      value={b.id}
                      className="bg-cream-100 text-deep-800 dark:bg-deep-900 dark:text-cream-100"
                    >
                      {b.name}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={refresh}
                className="rounded-lg px-2 text-xs font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400"
              >
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-deep-500 dark:text-cream-400">
              Loading…
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-deep-500 dark:text-cream-400">
              {items.length === 0
                ? "No notifications yet."
                : "No notifications match your search."}
            </p>
          ) : (
            <ul className="divide-y divide-deep-100 dark:divide-deep-800">
              {filtered.map((n) => {
                const tone = TYPES.find((t) => t.value === n.type)?.tone ?? "";
                const biz = businesses.find((b) => b.id === n.businessId);
                return (
                  <li key={n.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tone}`}
                          >
                            {n.type}
                          </span>
                          <span className="truncate text-xs text-deep-500 dark:text-cream-400">
                            {biz?.name ?? n.businessId}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-sm font-medium text-deep-800 dark:text-cream-100">
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-deep-600 dark:text-cream-300">
                            {n.body}
                          </p>
                        )}
                        <p className="mt-1 text-[11px] text-deep-400 dark:text-cream-500">
                          {new Date(n.publishedAt).toLocaleString()}
                          {n.actionRoute ? ` · → ${n.actionRoute}` : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => remove(n.id)}
                        className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
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
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-deep-500 dark:text-cream-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function BellIcon() {
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
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}