// app/store/page.tsx
import { listOfferings } from "@/app/actions/store";
import { StoreClient } from "./store-client";

export const metadata = {
  title: "Offerings — Craft Studios",
  description:
    "Subscriptions, products, and services from Craft Studios. Request a quote or subscribe.",
};

export default async function StorePage() {
  const offerings = await listOfferings();

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

      <StoreClient offerings={offerings} />
    </div>
  );
}