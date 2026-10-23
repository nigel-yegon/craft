// app/components/cookie-preferences-modal.tsx
"use client";

import { useEffect, useState } from "react";
import type { ConsentCategories } from "./cookie-consent";

type Props = {
  open: boolean;
  initialCategories: ConsentCategories;
  onClose: () => void;
  onSave: (categories: ConsentCategories) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
};

export function CookiePreferencesModal({
  open,
  initialCategories,
  onClose,
  onSave,
  onAcceptAll,
  onRejectAll,
}: Props) {
  const [analytics, setAnalytics] = useState(initialCategories.analytics);
  const [marketing, setMarketing] = useState(initialCategories.marketing);

  // Sync local toggles when the parent re-opens the modal with newer state.
  useEffect(() => {
    if (open) {
      setAnalytics(initialCategories.analytics);
      setMarketing(initialCategories.marketing);
    }
  }, [open, initialCategories.analytics, initialCategories.marketing]);

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-prefs-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-deep-950/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg rounded-2xl border border-deep-200 bg-cream-50 shadow-2xl dark:border-deep-800 dark:bg-deep-900">
        <div className="border-b border-deep-200 px-5 py-4 dark:border-deep-800">
          <h2
            id="cookie-prefs-title"
            className="text-base font-semibold text-deep-900 dark:text-cream-100"
          >
            Cookie preferences
          </h2>
          <p className="mt-1 text-xs text-deep-500 dark:text-cream-400">
            Choose which cookies NTSP can use. Necessary cookies are always on.
          </p>
        </div>

        <div className="space-y-3 px-5 py-4">
          <CategoryRow
            label="Necessary"
            description="Required for the site to work — sign-in, forms, security. Always enabled."
            checked
            locked
            onChange={() => {}}
          />
          <CategoryRow
            label="Analytics"
            description="Help us understand which pages are useful. No personal data collected."
            checked={analytics}
            onChange={setAnalytics}
          />
          <CategoryRow
            label="Marketing"
            description="Used to personalise offers and measure campaigns. Off by default."
            checked={marketing}
            onChange={setMarketing}
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-deep-200 px-5 py-4 dark:border-deep-800">
          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg border border-deep-200 bg-cream-100 px-4 py-2 text-xs font-semibold
              text-deep-700 transition hover:bg-cream-200
              dark:border-deep-800 dark:bg-deep-950 dark:text-cream-300
              dark:hover:bg-deep-800
            "
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onRejectAll}
            className="
              rounded-lg border border-deep-200 bg-cream-100 px-4 py-2 text-xs font-semibold
              text-deep-700 transition hover:bg-cream-200
              dark:border-deep-800 dark:bg-deep-950 dark:text-cream-300
              dark:hover:bg-deep-800
            "
          >
            Reject all
          </button>
          <button
            type="button"
            onClick={() =>
              onSave({ necessary: true, analytics, marketing })
            }
            className="
              rounded-lg bg-brand-400 px-4 py-2 text-xs font-semibold text-deep-900
              transition hover:bg-brand-500
            "
          >
            Save preferences
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryRow({
  label,
  description,
  checked,
  locked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  locked?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={[
        "flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition",
        locked
          ? "cursor-default border-deep-200 bg-cream-100 dark:border-deep-800 dark:bg-deep-950/60"
          : "border-deep-200 bg-cream-50 hover:bg-cream-100 dark:border-deep-800 dark:bg-deep-900 dark:hover:bg-deep-800",
      ].join(" ")}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={locked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-deep-300"
        style={{ accentColor: "var(--brand-500)" }}
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-deep-800 dark:text-cream-100">
          {label}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-deep-500 dark:text-cream-400">
          {description}
        </span>
      </span>
    </label>
  );
}