// app/work/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "../components/page-header";

export const metadata: Metadata = { title: "Work" };

const SECTIONS = [
  {
    key: "architecture",
    title: "Architecture",
    lede: "Buildings, interiors and public spaces drawn with the same care at sketch scale as at construction scale.",
    entries: [
      { title: "Riverside Civic Hall", meta: "Public building · Nairobi, 2024" },
      { title: "Karura Trail", meta: "Public realm · Nairobi, 2023" },
      { title: "Mwitu House", meta: "Private residence · Naivasha, 2023" },
    ],
  },
  {
    key: "interiors",
    title: "Interiors",
    lede: "Hospitality, retail and workspace interiors — materials, light and rhythm treated as one system.",
    entries: [
      { title: "The Cut", meta: "Barbershop & gallery · Mombasa, 2023" },
      { title: "Kijani Workspace", meta: "Office fit-out · Nairobi, 2024" },
      { title: "Room & Reed", meta: "Boutique hotel · Lamu, 2022" },
    ],
  },
  {
    key: "software",
    title: "Software",
    lede: "Web, product and platform engineering. We build the systems that the studio's physical work runs on.",
    entries: [
      { title: "Formwork OS", meta: "Platform · 2024" },
      { title: "Studio Atlas", meta: "Internal tool · 2023" },
      { title: "Mtaa Map", meta: "Public web app · 2024" },
    ],
  },
  {
    key: "delivery",
    title: "Delivery",
    lede: "Project management and on-the-ground implementation. The studio stays through handover and the first six months.",
    entries: [
      { title: "Kilifi Coastal Path", meta: "Public realm · 2023" },
      { title: "Nairobi Design Week", meta: "Event build · 2024" },
      { title: "Lamu Seafront Works", meta: "Restoration · 2022" },
    ],
  },
] as const;

export default function WorkPage() {
  return (
    <>
      <PageHeader
        eyebrow="Selected work"
        title={
          <>
            Built, shipped,
            <br />
            <span className="text-brand-700 dark:text-brand-300">
              standing.
            </span>
          </>
        }
        lede="A single practice across four disciplines. Some of the work below is physical, some is digital, some is both — all of it was delivered by the same studio."
      />

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {SECTIONS.map((section, i) => (
          <section
            key={section.key}
            className="border-b border-deep-200 py-16 last:border-b-0 dark:border-deep-800 lg:py-24"
          >
            <div className="grid gap-10 lg:grid-cols-[0.4fr_1fr] lg:gap-20">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-deep-400 dark:text-cream-600">
                  0{i + 1}
                </span>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-deep-900 dark:text-cream-100 sm:text-3xl">
                  {section.title}
                </h2>
                <p className="mt-4 max-w-sm text-sm leading-6 text-deep-600 dark:text-cream-400">
                  {section.lede}
                </p>
              </div>

              <ul className="divide-y divide-deep-200 dark:divide-deep-800">
                {section.entries.map((entry) => (
                  <li key={entry.title}>
                    <Link
                      href={`/work/${section.key}`}
                      className="group flex items-baseline justify-between gap-6 py-5 transition"
                    >
                      <div>
                        <h3 className="text-lg font-medium text-deep-900 group-hover:text-brand-700 dark:text-cream-100 dark:group-hover:text-brand-300">
                          {entry.title}
                        </h3>
                        <p className="mt-0.5 text-sm text-deep-500 dark:text-cream-500">
                          {entry.meta}
                        </p>
                      </div>
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
        ))}
      </div>
    </>
  );
}