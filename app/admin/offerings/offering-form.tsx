// app/admin/offerings/offering-form.tsx
"use client";

import { useState } from "react";
import type { OfferingRow, OfferingInput } from "../actions/offerings";

const inputClass =
  "w-full rounded-xl border border-deep-200 bg-cream-100 px-3 py-2 text-sm " +
  "text-deep-800 outline-none transition placeholder:text-deep-400 " +
  "focus:bg-cream-50 focus:ring-2 focus:ring-brand-500/20 " +
  "dark:border-deep-700 dark:bg-deep-950 dark:text-cream-100 " +
  "dark:placeholder:text-cream-400 dark:focus:bg-deep-950 dark:[color-scheme:dark]";

type Props = {
  initial?: OfferingRow | null;
  onSubmit: (data: OfferingInput) => Promise<void>;
  onCancel: () => void;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function OfferingForm({ initial, onSubmit, onCancel }: Props) {
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugLocked, setSlugLocked] = useState(!!initial);
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [kind, setKind] = useState<"SUBSCRIPTION" | "PRODUCT" | "SERVICE">(
    (initial?.kind as any) ?? "SERVICE"
  );
  const [category, setCategory] = useState(initial?.category ?? "");
  const [pricingMode, setPricingMode] = useState<"FIXED" | "RECURRING" | "QUOTE">(
    (initial?.pricingMode as any) ?? "FIXED"
  );
  const [fixedPrice, setFixedPrice] = useState(
    initial?.fixedPrice != null ? initial.fixedPrice.toString() : ""
  );
  const [recurringInterval, setRecurringInterval] = useState<
    "WEEKLY" | "MONTHLY" | "YEARLY" | ""
  >((initial?.recurringInterval as any) ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [featured, setFeatured] = useState(initial?.featured ?? false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (v: string) => {
    setName(v);
    if (!slugLocked) setSlug(slugify(v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const price = fixedPrice ? parseInt(fixedPrice, 10) : null;

      await onSubmit({
        slug: slug.trim(),
        name: name.trim(),
        description: description.trim(),
        kind,
        category: category.trim(),
        pricingMode,
        fixedPrice: pricingMode === "QUOTE" ? null : price,
        recurringInterval: pricingMode === "RECURRING" ? (recurringInterval as any) : null,
        imageUrl: imageUrl.trim() || null,
        active,
        featured,
      });
    } catch (e: any) {
      setError(e?.message ?? "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Name *">
        <input
          required
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g. Logo Design"
          className={inputClass}
        />
      </Field>

      <Field label="Slug *">
        <input
          required
          value={slug}
          onChange={(e) => {
            setSlugLocked(true);
            setSlug(slugify(e.target.value));
          }}
          placeholder="logo-design"
          className={`${inputClass} font-mono`}
        />
      </Field>

      <Field label="Description *">
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="What customers get, what's included, etc."
          className={`${inputClass} resize-y`}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Kind *">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as any)}
            className={inputClass}
          >
            <option value="SERVICE">Service</option>
            <option value="PRODUCT">Product</option>
            <option value="SUBSCRIPTION">Subscription</option>
          </select>
        </Field>
        <Field label="Category *">
          <input
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Branding, Retainer…"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Pricing mode *">
        <select
          value={pricingMode}
          onChange={(e) => setPricingMode(e.target.value as any)}
          className={inputClass}
        >
          <option value="FIXED">Fixed price</option>
          <option value="RECURRING">Recurring (subscription)</option>
          <option value="QUOTE">Quote on request</option>
        </select>
      </Field>

      {pricingMode !== "QUOTE" && (
        <Field label="Fixed price (KES) *">
          <input
            required
            type="number"
            min="0"
            step="1"
            value={fixedPrice}
            onChange={(e) => setFixedPrice(e.target.value)}
            placeholder="15000"
            className={inputClass}
          />
        </Field>
      )}

      {pricingMode === "RECURRING" && (
        <Field label="Billing interval *">
          <select
            required
            value={recurringInterval}
            onChange={(e) => setRecurringInterval(e.target.value as any)}
            className={inputClass}
          >
            <option value="">Choose…</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </Field>
      )}

      <Field label="Image URL">
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://…"
          className={inputClass}
        />
      </Field>

      <div className="flex gap-4 pt-2">
        <label className="flex items-center gap-2 text-sm text-deep-700 dark:text-cream-300">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 rounded border-deep-300"
          />
          Active (visible on /store)
        </label>
        <label className="flex items-center gap-2 text-sm text-deep-700 dark:text-cream-300">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4 rounded border-deep-300"
          />
          Featured
        </label>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-xl border border-deep-200 px-4 py-2 text-sm font-semibold text-deep-700 transition hover:bg-cream-200 disabled:opacity-50 dark:border-deep-700 dark:text-cream-300 dark:hover:bg-deep-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {busy ? "Saving…" : initial ? "Save changes" : "Create offering"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-deep-500 dark:text-cream-400">
        {label}
      </span>
      {children}
    </label>
  );
}