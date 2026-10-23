// app/studio/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "../components/page-header";

export const metadata: Metadata = { title: "Studio" };

const FACTS = [
  { label: "Founded", value: "2024" },
  { label: "Team", value: "12" },
  { label: "Disciplines", value: "4" },
  { label: "Based", value: "Nairobi" },
] as const;

const JOURNAL = [
  {
    date: "2024-09",
    title: "Why the studio keeps architects and engineers in the same room",
    href: "/studio/journal",
  },
  {
    date: "2024-07",
    title: "Materials as a system: a note on the Karura Trail",
    href: "/studio/journal",
  },
  {
    date: "2024-05",
    title: "What we learned building Formwork OS for our own practice",
    href: "/studio/journal",
  },
] as const;

export default function StudioPage() {
  return (
    <>
      <PageHeader
        eyebrow="Studio"
        title={
          <>
            A studio that
            <br />
            <span className="text-brand-700 dark:text-brand-300">
              builds what it draws.
            </span>
          </>
        }
        lede="Craft Studios was founded on a simple observation: the best projects happen when the people who draw them are also in the room when they're built. We organise the studio around that idea."
      />

      {/* Facts strip */}
      <section className="border-b border-deep-200 dark:border-deep-800">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-x-8 gap-y-10 px-4 py-12 sm:grid-cols-4 lg:px-8">
          {FACTS.map((f) => (
            <div key={f.label}>
              <dt className="text-[10px] font-mono uppercase tracking-[0.22em] text-deep-400 dark:text-cream-600">
                {f.label}
              </dt>
              <dd className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-deep-900 dark:text-cream-100">
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Manifesto */}
      <section className="border-b border-deep-200 dark:border-deep-800">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 lg:grid-cols-[0.4fr_1fr] lg:gap-20 lg:px-8 lg:py-28">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-deep-500 dark:text-cream-400">
            What we mean by integrated
          </h2>
          <div className="space-y-6 text-base leading-7 text-deep-700 dark:text-cream-300">
            <p>
              Most studios are structured around a single discipline and
              subcontract the rest. That works, until the point where the
              architect's drawings meet the engineer's constraints and the
              brand doesn't survive the website. We built the studio to
              eliminate that gap.
            </p>
            <p>
              Architecture, interiors, brand and software sit in the same
              room at Craft. Decisions travel in one direction — forward —
              and the person who drew a line knows who will build it.
            </p>
            <p>
              The result is not a larger studio. It's a shorter chain.
            </p>
          </div>
        </div>
      </section>

      {/* Journal teaser */}
      <section className="border-b border-deep-200 dark:border-deep-800">
        <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-deep-500 dark:text-cream-400">
                Journal
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-deep-900 dark:text-cream-100 sm:text-4xl">
                Notes from the practice.
              </h2>
            </div>
            <Link
              href="/studio/journal"
              className="text-sm font-medium text-deep-700 underline decoration-deep-300 decoration-1 underline-offset-4 transition hover:decoration-deep-800 dark:text-cream-300 dark:decoration-deep-600 dark:hover:decoration-cream-100"
            >
              All entries →
            </Link>
          </div>

          <ul className="mt-12 divide-y divide-deep-200 border-y border-deep-200 dark:divide-deep-800 dark:border-deep-800">
            {JOURNAL.map((entry) => (
              <li key={entry.title}>
                <Link
                  href={entry.href}
                  className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-6 py-6"
                >
                  <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-deep-400 dark:text-cream-600">
                    {entry.date}
                  </span>
                  <span className="text-base font-medium text-deep-900 group-hover:text-brand-700 dark:text-cream-100 dark:group-hover:text-brand-300">
                    {entry.title}
                  </span>
                  <span
                    aria-hidden
                    className="text-deep-300 transition group-hover:translate-x-1 group-hover:text-deep-800 dark:text-deep-600 dark:group-hover:text-cream-100"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-deep-800 dark:bg-deep-950">
        <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
          <h2 className="max-w-3xl text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-cream-100">
            If any of this sounds like your kind of practice,{" "}
            <span className="text-accent-mint">we'd like to hear from you.</span>
          </h2>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-md bg-cream-100 px-5 py-3 text-sm font-medium text-deep-900 transition hover:bg-accent-mint"
            >
              Start a project
            </Link>
            <Link
              href="/studio/team"
              className="inline-flex items-center gap-2 rounded-md border border-cream-100/25 px-5 py-3 text-sm font-medium text-cream-100 transition hover:border-accent-mint hover:text-accent-mint"
            >
              Meet the team
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}