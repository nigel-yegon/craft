// app/portfolio/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import { listPublicProjects } from "@/app/admin/actions/projects";

export const metadata = {
  title: "Portfolio — Craft Studios",
  description:
    "Selected projects from Craft Studios. Brand, digital, spaces, campaigns, and print.",
};

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-cream-200 dark:bg-deep-950">
      <section className="border-b border-deep-200 bg-cream-100 py-16 dark:border-deep-800 dark:bg-deep-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">
            Work
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-deep-800 dark:text-cream-100">
            Portfolio
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-deep-600 dark:text-cream-400">
            Selected engagements across brand, digital, spaces, campaigns, and
            print. Each project carries the full story — client, scope, cost,
            process, and technology.
          </p>
        </div>
      </section>

      <Suspense fallback={<PortfolioSkeleton />}>
        <PortfolioGrid />
      </Suspense>
    </div>
  );
}

async function PortfolioGrid() {
  const projects = await listPublicProjects();

  if (projects.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center text-sm text-deep-500 dark:text-cream-500 lg:px-8">
        No projects published yet.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/portfolio/${p.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-deep-200 bg-cream-50 transition hover:border-rose-400 dark:border-deep-800 dark:bg-deep-900"
          >
            <div className="relative aspect-4/3 overflow-hidden bg-cream-200 dark:bg-deep-800">
              {p.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.coverImage}
                  alt={p.title}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-deep-400 dark:text-cream-600">
                  No image
                </div>
              )}
              {p.featured && (
                <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Featured
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                {p.category}
              </p>
              <h3 className="mt-1 text-lg font-bold text-deep-800 group-hover:text-rose-700 dark:text-cream-100">
                {p.title}
              </h3>
              <p className="mt-1 text-xs text-deep-500 dark:text-cream-500">
                {p.clientName}
              </p>
              <p className="mt-2 line-clamp-3 flex-1 text-sm text-deep-600 dark:text-cream-400">
                {p.summary}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function PortfolioSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
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