// app/store/store-client.tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ShoppingCart, X } from "lucide-react";
import { createQuoteRequest, type OfferingRow } from "@/app/actions/store";

type CartLine = { offeringId: number; quantity: number; notes?: string };

const KIND_LABEL: Record<string, string> = {
  SUBSCRIPTION: "Subscription",
  PRODUCT: "Product",
  SERVICE: "Service",
};

function priceLabel(o: OfferingRow): string {
  if (o.pricingMode === "FIXED" && o.fixedPrice != null) {
    return `KES ${o.fixedPrice.toLocaleString()}`;
  }
  if (o.pricingMode === "RECURRING" && o.fixedPrice != null) {
    const interval = (o.recurringInterval ?? "MONTHLY").toLowerCase();
    return `KES ${o.fixedPrice.toLocaleString()} / ${interval}`;
  }
  return "Quote on request";
}

export function StoreClient({ offerings }: { offerings: OfferingRow[] }) {
  const [kindFilter, setKindFilter] = useState<"ALL" | "SUBSCRIPTION" | "PRODUCT" | "SERVICE">("ALL");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");

  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<
    | { kind: "success"; reference: string }
    | { kind: "error"; message: string }
    | null
  >(null);

  const filtered =
    kindFilter === "ALL"
      ? offerings
      : offerings.filter((o) => o.kind === kindFilter);

  const detailed = useMemo(() => {
    return cart
      .map((line) => {
        const off = offerings.find((o) => o.id === line.offeringId);
        return off ? { ...line, offering: off } : null;
      })
      .filter(Boolean) as Array<CartLine & { offering: OfferingRow }>;
  }, [cart, offerings]);

  function addToCart(offering: OfferingRow) {
    setCart((prev) => {
      const existing = prev.find((l) => l.offeringId === offering.id);
      if (existing) {
        return prev.map((l) =>
          l.offeringId === offering.id ? { ...l, quantity: l.quantity + 1 } : l,
        );
      }
      return [...prev, { offeringId: offering.id, quantity: 1 }];
    });
  }

  function updateQuantity(offeringId: number, qty: number) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((l) => l.offeringId !== offeringId));
    } else {
      setCart((prev) =>
        prev.map((l) => (l.offeringId === offeringId ? { ...l, quantity: qty } : l)),
      );
    }
  }

  function submitRequest() {
    if (!customerName || !customerEmail || !customerPhone || cart.length === 0) return;
    startTransition(async () => {
      try {
        const res = await createQuoteRequest({
          customerName,
          customerEmail,
          customerPhone,
          company: company || undefined,
          notes: notes || undefined,
          lines: cart,
        });
        setResult({ kind: "success", reference: res.reference });
        setCart([]);
        setCustomerName("");
        setCustomerEmail("");
        setCustomerPhone("");
        setCompany("");
        setNotes("");
      } catch (err) {
        setResult({
          kind: "error",
          message: err instanceof Error ? err.message : "Submission failed",
        });
      }
    });
  }

  const cartCount = cart.reduce((a, l) => a + l.quantity, 0);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      {/* Kind filters */}
      <div className="mb-8 flex flex-wrap gap-2">
        {(["ALL", "SUBSCRIPTION", "PRODUCT", "SERVICE"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKindFilter(k)}
            className={[
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
              kindFilter === k
                ? "border-brand-500 bg-brand-600 text-white"
                : "border-deep-200 text-deep-600 hover:border-brand-400 hover:text-brand-700 dark:border-deep-800 dark:text-cream-400",
            ].join(" ")}
          >
            {k === "ALL" ? "All" : KIND_LABEL[k]}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((o) => (
          <div
            key={o.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-deep-200 bg-cream-50 transition hover:border-brand-400 dark:border-deep-800 dark:bg-deep-900"
          >
            <Link href={`/store/${o.slug}`} className="block">
              <div className="relative aspect-4/3 overflow-hidden bg-cream-200 dark:bg-deep-800">
                {o.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={o.imageUrl}
                    alt={o.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-deep-400 dark:text-cream-600">
                    No image
                  </div>
                )}
                {o.featured && (
                  <span className="absolute left-3 top-3 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Featured
                  </span>
                )}
              </div>
            </Link>
            <div className="flex flex-1 flex-col p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">
                {KIND_LABEL[o.kind]} · {o.category}
              </p>
              <Link href={`/store/${o.slug}`}>
                <h3 className="mt-1 text-lg font-bold text-deep-800 hover:text-brand-700 dark:text-cream-100 dark:hover:text-brand-300">
                  {o.name}
                </h3>
              </Link>
              <p className="mt-2 line-clamp-3 flex-1 text-sm text-deep-600 dark:text-cream-400">
                {o.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-deep-800 dark:text-cream-100">
                  {priceLabel(o)}
                </p>
                <button
                  type="button"
                  onClick={() => addToCart(o)}
                  className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
                >
                  Add to cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart button */}
      {cartCount > 0 && (
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-700"
        >
          <ShoppingCart size={18} />
          {cartCount} item{cartCount !== 1 ? "s" : ""}
        </button>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-deep-950/40 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />
          <div className="relative flex h-full w-full max-w-md flex-col bg-cream-50 shadow-xl dark:bg-deep-900">
            <div className="flex items-center justify-between border-b border-deep-200 px-5 py-4 dark:border-deep-800">
              <h2 className="text-lg font-bold text-deep-800 dark:text-cream-100">
                Request a quote
              </h2>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="text-deep-500 hover:text-deep-800 dark:text-cream-500 dark:hover:text-cream-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {detailed.length === 0 ? (
                <p className="text-center text-sm text-deep-500 dark:text-cream-500">
                  Your cart is empty.
                </p>
              ) : (
                <ul className="space-y-3">
                  {detailed.map((line) => (
                    <li
                      key={line.offeringId}
                      className="rounded-xl border border-deep-200 bg-cream-100 p-3 dark:border-deep-800 dark:bg-deep-950"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-deep-800 dark:text-cream-100">
                            {line.offering.name}
                          </p>
                          <p className="text-xs text-deep-500 dark:text-cream-500">
                            {KIND_LABEL[line.offering.kind]} · {priceLabel(line.offering)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateQuantity(line.offeringId, 0)}
                          className="text-xs text-red-600 hover:underline dark:text-red-400"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(line.offeringId, line.quantity - 1)}
                          className="h-7 w-7 rounded border border-deep-200 text-sm text-deep-700 dark:border-deep-800 dark:text-cream-300"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm text-deep-800 dark:text-cream-100">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(line.offeringId, line.quantity + 1)}
                          className="h-7 w-7 rounded border border-deep-200 text-sm text-deep-700 dark:border-deep-800 dark:text-cream-300"
                        >
                          +
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5 space-y-2">
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-deep-200 bg-cream-100 px-3.5 py-3 text-sm dark:border-deep-800 dark:bg-deep-950 dark:text-cream-100"
                />
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full rounded-xl border border-deep-200 bg-cream-100 px-3.5 py-3 text-sm dark:border-deep-800 dark:bg-deep-950 dark:text-cream-100"
                />
                <input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone (0712345678)"
                  className="w-full rounded-xl border border-deep-200 bg-cream-100 px-3.5 py-3 text-sm dark:border-deep-800 dark:bg-deep-950 dark:text-cream-100"
                />
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company (optional)"
                  className="w-full rounded-xl border border-deep-200 bg-cream-100 px-3.5 py-3 text-sm dark:border-deep-800 dark:bg-deep-950 dark:text-cream-100"
                />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything we should know? (optional)"
                  rows={3}
                  className="w-full rounded-xl border border-deep-200 bg-cream-100 px-3.5 py-3 text-sm dark:border-deep-800 dark:bg-deep-950 dark:text-cream-100"
                />
              </div>
            </div>

            <div className="border-t border-deep-200 p-5 dark:border-deep-800">
              <button
                type="button"
                onClick={submitRequest}
                disabled={
                  pending ||
                  detailed.length === 0 ||
                  !customerName ||
                  !customerEmail ||
                  !customerPhone
                }
                className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
              >
                {pending ? "Submitting…" : "Submit quote request"}
              </button>

              {result?.kind === "error" && (
                <p className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                  {result.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success panel */}
      {result?.kind === "success" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-emerald-300 bg-cream-50 p-8 text-center dark:border-emerald-800 dark:bg-deep-900">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              ✓
            </div>
            <h3 className="text-lg font-bold text-deep-800 dark:text-cream-100">
              Quote request submitted
            </h3>
            <p className="mt-2 text-sm text-deep-600 dark:text-cream-400">
              Your reference is{" "}
              <span className="font-mono font-semibold text-deep-800 dark:text-cream-100">
                {result.reference}
              </span>
              . We&apos;ll review it and send you a priced quote shortly.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setCartOpen(false);
                }}
                className="flex-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Continue browsing
              </button>
              <Link
                href="/store"
                onClick={() => setResult(null)}
                className="rounded-xl border border-deep-200 px-4 py-2.5 text-sm font-semibold text-deep-600 dark:border-deep-800 dark:text-cream-300"
              >
                Done
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}