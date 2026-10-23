// app/services/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "../components/page-header";

export const metadata: Metadata = { title: "Services" };

const SERVICES = [
  {
    index: "01",
    title: "Architecture & spatial design",
    body: "Briefing, concept design, planning, technical drawings and construction oversight — for public, commercial and residential projects.",
    included: ["Concept & feasibility", "Planning submissions", "Technical drawing sets", "Site oversight"],
  },
  {
    index: "02",
    title: "Interior design",
    body: "Materials, furniture, lighting and joinery specified as one coordinated package, from first moodboard to handover.",
    included: ["Material palettes", "FF&E specification", "Joinery drawings", "Installation management"],
  },
  {
    index: "03",
    title: "Brand & graphic design",
    body: "Identity systems, print and signage that hold together across a facade and a screen.",
    included: ["Naming & identity", "Brand guidelines", "Print & signage", "Editorial design"],
  },
  {
    index: "04",
    title: "Software & product engineering",
    body: "Web apps, internal tools and design systems — built, shipped, and maintained.",
    included: ["Product design", "Web engineering", "Design systems", "Maintenance"],
  },
  {
    index: "05",
    title: "Delivery & project management",
    body: "Contracts, procurement, sequencing and handover. We stay on the ground until the work is running.",
    included: ["Procurement", "Site coordination", "QA & snagging", "Handover & training"],
  },
] as const;

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title={
          <>
            One practice,
            <br />
            <span className="text-brand-700 dark:text-brand-300">
              five services.
            </span>
          </>
        }
        lede="Each service can be engaged on its own, or bundled into an end-to-end project. Most clients start with one discipline and end up using three."
      />

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <ul className="divide-y divide-deep-200 border-b border-deep-200 dark:divide-deep-800 dark:border-deep-800">
          {SERVICES.map((s) => (
            <li key={s.index} className="py-14 lg:py-20">
              <div className="grid gap-10 lg:grid-cols-[0.35fr_1fr] lg:gap-20">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-deep-400 dark:text-cream-600">
                    {s.index}
                  </span>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-deep-900 dark:text-cream-100">
                    {s.title}
                  </h2>
                </div>
                <div>
                  <p className="max-w-2xl text-base leading-7 text-deep-600 dark:text-cream-400">
                    {s.body}
                  </p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {s.included.map((item) => (
                      <li
                        key={item}
                        className="rounded-full border border-deep-200 px-3 py-1 text-xs text-deep-600 dark:border-deep-800 dark:text-cream-400"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-4 py-16 lg:py-20">
          <p className="max-w-md text-sm leading-6 text-deep-600 dark:text-cream-400">
            Not sure which service fits? Send a short description of the
            project and we'll tell you where we'd start.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-md bg-deep-800 px-5 py-3 text-sm font-medium text-cream-100 transition hover:bg-brand-700 dark:bg-brand-500 dark:text-deep-900 dark:hover:bg-accent-mint"
          >
            Start a project
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </>
  );
}