// app/admin/offerings/offerings-panel.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  listOfferings,
  createOffering,
  updateOffering,
  deleteOffering,
  toggleOfferingActive,
  toggleOfferingFeatured,
  type OfferingRow,
} from "../actions/offerings";
import { OfferingForm } from "./offering-form";

const KIND_LABEL: Record<string, string> = {
  SUBSCRIPTION: "Subscription",
  PRODUCT: "Product",
  SERVICE: "Service",
};

const KIND_TONE: Record<string, string> = {
  SUBSCRIPTION: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
  PRODUCT: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  SERVICE: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
};

function priceLabel(o: OfferingRow): string {
  if (o.pricingMode === "QUOTE") return "Quote on request";
  if (o.fixedPrice == null) return "—";
  const amount = `KES ${o.fixedPrice.toLocaleString()}`;
  if (o.pricingMode === "RECURRING" && o.recurringInterval) {
    return `${amount} / ${o.recurringInterval.toLowerCase()}`;
  }
  return amount;
}

type Filter = "all" | "active" | "inactive" | "featured" | "quote";

export function OfferingsPanel({ search = "" }: { search?: string }) {
  const [items, setItems] = useState<OfferingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<OfferingRow | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listOfferings({ search: search || undefined });
      setItems(rows);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load offerings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const filtered = items.filter((o) => {
    if (filter === "active") return o.active;
    if (filter === "inactive") return !o.active;
    if (filter === "featured") return o.featured;
    if (filter === "quote") return o.pricingMode === "QUOTE";
    return true;
  });

  const handleCreate = async (data: any) => {
    await createOffering(data);
    setShowForm(false);
    await refresh();
  };

  const handleUpdate = async (data: any) => {
    if (!editing) return;
    await updateOffering(editing.id, data);
    setEditing(null);
    await refresh();
  };

  const handleDelete = async (item: OfferingRow) => {
    if (!confirm(`Delete "${item.name}"? This will also remove it from /store.`)) return;
    try {
      await deleteOffering(item.id);
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete");
    }
  };

  const handleToggleActive = async (item: OfferingRow) => {
    try {
      await toggleOfferingActive(item.id, !item.active);
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? "Failed to update");
    }
  };

  const handleToggleFeatured = async (item: OfferingRow) => {
    try {
      await toggleOfferingFeatured(item.id, !item.featured);
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? "Failed to update");
    }
  };

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
    { key: "featured", label: "Featured" },
    { key: "quote", label: "Quote-based" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
              <StorefrontIcon />
            </span>
            <h2 className="text-xl font-bold text-brand-700 dark:text-brand-300">
              Storefront
            </h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-deep-600 dark:text-cream-400">
            Manage the offerings shown on{" "}
            <Link
              href="/store"
              target="_blank"
              className="font-medium text-brand-600 underline hover:text-brand-700 dark:text-brand-400"
            >
              /store
            </Link>
            . Changes go live immediately — customers can add new items to their
            cart and request a quote right away.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          + New offering
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={[
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
              filter === f.key
                ? "border-brand-500 bg-brand-600 text-white"
                : "border-deep-200 text-deep-600 hover:border-brand-400 hover:text-brand-700 dark:border-deep-800 dark:text-cream-400",
            ].join(" ")}
          >
            {f.label}
            {f.key !== "all" && (
              <span className="ml-1.5 opacity-70">
                {items.filter((o) => {
                  if (f.key === "active") return o.active;
                  if (f.key === "inactive") return !o.active;
                  if (f.key === "featured") return o.featured;
                  if (f.key === "quote") return o.pricingMode === "QUOTE";
                  return true;
                }).length}
              </span>
            )}
          </button>
        ))}
        <button
          onClick={refresh}
          className="rounded-full border border-deep-200 px-3 py-1.5 text-xs font-semibold text-deep-600 hover:bg-cream-200 dark:border-deep-800 dark:text-cream-400"
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
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-deep-200 bg-cream-50 p-12 text-center dark:border-deep-800 dark:bg-deep-900">
          <p className="text-sm text-deep-500 dark:text-cream-400">
            {items.length === 0
              ? "No offerings yet. Click + New offering to create the first one."
              : "No offerings match this filter."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={[
                "group flex flex-col overflow-hidden rounded-2xl border bg-cream-50 transition dark:bg-deep-900",
                item.active
                  ? "border-deep-200 hover:border-brand-400 dark:border-deep-800"
                  : "border-deep-200 opacity-60 dark:border-deep-800",
              ].join(" ")}
            >
              <div className="relative aspect-4/3 overflow-hidden bg-cream-200 dark:bg-deep-800">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-deep-400 dark:text-cream-600">
                    No image
                  </div>
                )}
                {item.featured && (
                  <span className="absolute left-3 top-3 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Featured
                  </span>
                )}
                {!item.active && (
                  <span className="absolute right-3 top-3 rounded-full bg-deep-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white dark:bg-cream-200 dark:text-deep-900">
                    Inactive
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${KIND_TONE[item.kind]}`}
                  >
                    {KIND_LABEL[item.kind]}
                  </span>
                  <span className="text-[10px] text-deep-500 dark:text-cream-500">
                    {item.category}
                  </span>
                </div>
                <h3 className="mt-2 text-base font-bold text-deep-800 dark:text-cream-100">
                  {item.name}
                </h3>
                <p className="mt-1 line-clamp-2 flex-1 text-xs text-deep-600 dark:text-cream-400">
                  {item.description}
                </p>
                <p className="mt-3 text-sm font-semibold text-deep-800 dark:text-cream-100">
                  {priceLabel(item)}
                </p>

                <div className="mt-3 flex flex-wrap gap-1 border-t border-deep-100 pt-3 dark:border-deep-800">
                  <button
                    onClick={() => setEditing(item)}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/40"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={[
                      "rounded-lg px-2 py-1 text-xs font-medium transition",
                      item.active
                        ? "text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40"
                        : "text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40",
                    ].join(" ")}
                  >
                    {item.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(item)}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-950/40"
                  >
                    {item.featured ? "Unfeature" : "Feature"}
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="ml-auto rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showForm || editing) && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-deep-950/40 p-6 backdrop-blur-sm">
          <div className="my-8 w-full max-w-lg rounded-2xl border border-deep-200 bg-cream-50 p-6 dark:border-deep-800 dark:bg-deep-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-deep-800 dark:text-cream-100">
                {editing ? "Edit offering" : "New offering"}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                className="text-deep-500 hover:text-deep-800 dark:text-cream-500"
              >
                ✕
              </button>
            </div>
            <OfferingForm
              initial={editing}
              onSubmit={editing ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditing(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StorefrontIcon() {
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