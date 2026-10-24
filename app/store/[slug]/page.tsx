// app/store/[slug]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getOfferingBySlug } from "@/app/actions/store";
import { OfferingDetailActions } from "./offering-detail-actions";

export default function OfferingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className="min-h-screen bg-cream-200 dark:bg-deep-950">
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
        <Link
          href="/store"
          className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          ← Back to offerings
        </Link>

        <Suspense fallback={<OfferingSkeleton />}>
          <OfferingContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}

async function OfferingContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const offering = await getOfferingBySlug(slug);
  if (!offering) notFound();

  const priceText =
    offering.pricingMode === "FIXED" && offering.fixedPrice != null
      ? `KES ${offering.fixedPrice.toLocaleString()}`
      : offering.pricingMode === "RECURRING" && offering.fixedPrice != null
        ? `KES ${offering.fixedPrice.toLocaleString()} / ${(offering.recurringInterval ?? "MONTHLY").toLowerCase()}`
        : "Quote on request";

  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-deep-200 bg-cream-50 dark:border-deep-800 dark:bg-deep-900">
      {offering.imageUrl && (
        <div className="aspect-video overflow-hidden bg-cream-200 dark:bg-deep-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={offering.imageUrl}
            alt={offering.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="p-8 lg:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">
          {offering.kind} · {offering.category}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-deep-800 dark:text-cream-100">
          {offering.name}
        </h1>
        <p className="mt-4 text-base leading-7 text-deep-700 dark:text-cream-300">
          {offering.description}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <p className="text-2xl font-bold text-deep-800 dark:text-cream-100">
            {priceText}
          </p>
          <OfferingDetailActions offering={offering} />
        </div>
      </div>
    </div>
  );
}

function OfferingSkeleton() {
  return (
    <div className="mt-6 animate-pulse overflow-hidden rounded-3xl border border-deep-200 bg-cream-50 dark:border-deep-800 dark:bg-deep-900">
      <div className="aspect-video bg-cream-200 dark:bg-deep-800" />
      <div className="space-y-4 p-8 lg:p-10">
        <div className="h-3 w-32 rounded bg-cream-200 dark:bg-deep-800" />
        <div className="h-8 w-3/4 rounded bg-cream-200 dark:bg-deep-800" />
        <div className="h-4 w-full rounded bg-cream-200 dark:bg-deep-800" />
        <div className="h-4 w-5/6 rounded bg-cream-200 dark:bg-deep-800" />
        <div className="mt-6 h-10 w-40 rounded bg-cream-200 dark:bg-deep-800" />
      </div>
    </div>
  );
}