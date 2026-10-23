// app/components/cookie-consent.tsx
"use client";

import { useEffect, useState } from "react";
import { CookiePreferencesModal } from "./cookie-preferences-modal";

const STORAGE_KEY = "ntsp:cookie-consent";

export type ConsentCategories = {
  necessary: true; // always true, not toggleable
  analytics: boolean;
  marketing: boolean;
};

export type ConsentRecord = {
  consent: "accepted" | "rejected" | "custom";
  categories: ConsentCategories;
  timestamp: string; // ISO
};

function readStoredConsent(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentRecord;
    if (
      parsed &&
      (parsed.consent === "accepted" ||
        parsed.consent === "rejected" ||
        parsed.consent === "custom") &&
      parsed.categories
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function CookieConsent() {
  const [stored, setStored] = useState<ConsentRecord | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Read once on mount — SSR has no localStorage.
  useEffect(() => {
    setStored(readStoredConsent());
    setHydrated(true);
  }, []);

  // Escape closes the expanded panel
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  function persist(record: ConsentRecord) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
      /* private mode / storage disabled: fail silently */
    }
    setStored(record);
    setExpanded(false);
    setShowPreferences(false);
    // Optional: fire an event other code can listen for.
    window.dispatchEvent(
      new CustomEvent("ntsp:cookie-consent-changed", { detail: record })
    );
  }

  function acceptAll() {
    persist({
      consent: "accepted",
      categories: { necessary: true, analytics: true, marketing: true },
      timestamp: new Date().toISOString(),
    });
  }

  function rejectAll() {
    persist({
      consent: "rejected",
      categories: { necessary: true, analytics: false, marketing: false },
      timestamp: new Date().toISOString(),
    });
  }

  function saveCustom(categories: ConsentCategories) {
    persist({
      consent: "custom",
      categories,
      timestamp: new Date().toISOString(),
    });
  }

  // Before hydration, don't render anything — avoids a flash of the banner
  // on pages where the user already consented.
  if (!hydrated) return null;

  // No stored consent yet → show collapsed "new consent" icon.
  // Stored consent → show tiny "preferences" tab for later re-opening.
  const hasConsent = stored !== null;
  const visible = hasConsent ? expanded : true;

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-start p-4 sm:p-6"
        aria-live="polite"
      >
        <div className="pointer-events-auto w-full max-w-md">
          {/* Collapsed icon — always rendered when consent exists,
              replaces the panel until the user re-opens it. */}
          {hasConsent && !expanded && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="
                flex h-11 w-11 items-center justify-center
                rounded-full border border-deep-200 bg-cream-50
                text-deep-700 shadow-lg transition
                hover:bg-cream-100 hover:text-deep-900
                dark:border-deep-800 dark:bg-deep-900 dark:text-cream-300
                dark:hover:bg-deep-800 dark:hover:text-cream-100
              "
              aria-label="Open cookie preferences"
              title="Cookie preferences"
            >
              <CookieIcon />
            </button>
          )}

          {/* Expanded panel — full consent message */}
          {visible && (
            <div
              role="dialog"
              aria-modal="false"
              aria-labelledby="cookie-banner-title"
              className="
                rounded-2xl border border-deep-200 bg-cream-50 p-5 shadow-2xl
                dark:border-deep-800 dark:bg-deep-900
              "
            >
              <div className="flex items-start gap-3">
                <span
                  className="
                    flex h-9 w-9 shrink-0 items-center justify-center
                    rounded-lg bg-brand-100 text-brand-700
                    dark:bg-brand-950/60 dark:text-brand-300
                  "
                  aria-hidden
                >
                  <CookieIcon />
                </span>
                <div className="min-w-0">
                  <h2
                    id="cookie-banner-title"
                    className="text-sm font-semibold text-deep-900 dark:text-cream-100"
                  >
                    We use cookies
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-deep-600 dark:text-cream-400">
                    NTSP uses cookies to keep the site working, understand how
                    it&apos;s used, and improve your experience. You can accept
                    all, reject non-essential cookies, or manage preferences.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={acceptAll}
                  className="
                    rounded-lg bg-brand-400 px-4 py-2 text-xs font-semibold
                    text-deep-900 transition hover:bg-brand-500
                  "
                >
                  Accept all
                </button>
                <button
                  type="button"
                  onClick={rejectAll}
                  className="
                    rounded-lg border border-deep-200 bg-cream-100 px-4 py-2
                    text-xs font-semibold text-deep-700 transition
                    hover:bg-cream-200
                    dark:border-deep-800 dark:bg-deep-950 dark:text-cream-300
                    dark:hover:bg-deep-800
                  "
                >
                  Reject non-essential
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreferences(true)}
                  className="
                    text-xs font-semibold text-brand-700 underline-offset-2
                    hover:underline dark:text-brand-400
                  "
                >
                  Manage preferences
                </button>
                {hasConsent && (
                  <button
                    type="button"
                    onClick={() => setExpanded(false)}
                    className="
                      ml-auto text-xs text-deep-500 transition
                      hover:text-deep-700
                      dark:text-cream-500 dark:hover:text-cream-300
                    "
                    aria-label="Dismiss"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <CookiePreferencesModal
        open={showPreferences}
        initialCategories={
          stored?.categories ?? {
            necessary: true,
            analytics: false,
            marketing: false,
          }
        }
        onClose={() => setShowPreferences(false)}
        onSave={saveCustom}
        onAcceptAll={acceptAll}
        onRejectAll={rejectAll}
      />
    </>
  );
}

function CookieIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2a10 10 0 1 0 10 10c-2 0-2-2-2-2s0-2-2-2-2-2-2-2a4 4 0 0 1-4 4 4 4 0 0 1-4-4" />
      <circle cx="8.5" cy="9.5" r="0.75" fill="currentColor" />
      <circle cx="13" cy="14" r="0.75" fill="currentColor" />
      <circle cx="9" cy="15" r="0.75" fill="currentColor" />
    </svg>
  );
}