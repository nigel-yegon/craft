// app/store/page.tsx
import { Suspense } from "react";
import { listOfferings } from "@/app/actions/store";
import { StoreClient } from "./store-client";

export const metadata = {
  title: "Offerings — Craft Studios",
  description:
    "Subscriptions, products, and services from Craft Studios. Request a quote or subscribe.",
};

export default function StorePage() {
  return (
    <div className="min-h-screen bg-cream-200 dark:bg-deep-950">
      <section className="border-b border-deep-200 bg-cream-100 py-16 dark:border-deep-800 dark:bg-deep-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">
            Craft Studios
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-deep-800 dark:text-cream-100">
            Offerings
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-deep-600 dark:text-cream-400">
            Retainers, printed matter, and design engagements. Add what you
            need to your cart, then request a quote — we&apos;ll price it and
            send you an invoice.
          </p>
        </div>
      </section>

      <Suspense fallback={<StoreSkeleton />}>
        <StoreOfferings />
      </Suspense>
    </div>
  );
}

async function StoreOfferings() {
  const offerings = await listOfferings();
  return <StoreClient offerings={offerings} />;
}

function StoreSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="mb-8 flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-8 w-20 animate-pulse rounded-full bg-cream-100 dark:bg-deep-800"
          />
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-80 animate-pulse rounded-2xl bg-cream-100 dark:bg-deep-900"
          />
        ))}
      </div>
    </div>
  );
}