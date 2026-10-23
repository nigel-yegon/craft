// app/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Craft Studios — Ideas, Integrated.",
  description:
    "A fully integrated creative, design and technology studio. Spaces. Systems. Experiences. From concept to delivery.",
};

const DISCIPLINES = [
  {
    index: "01",
    title: "Architecture",
    body: "Buildings, interiors and spatial systems drawn with precision — from concept sketches to construction sets.",
  },
  {
    index: "02",
    title: "Design",
    body: "Identity, print and digital design that reads as clearly on a facade as it does on a screen.",
  },
  {
    index: "03",
    title: "Software",
    body: "Web, product and platform engineering — the systems that make the studio's work live and work.",
  },
  {
    index: "04",
    title: "Delivery",
    body: "Project management and implementation: the studio stays on the ground until the work is built, shipped and running.",
  },
] as const;

const WORK = [
  {
    tag: "Architecture",
    title: "Riverside Civic Hall",
    location: "Nairobi, 2024",
    detail: "Public building",
  },
  {
    tag: "Software",
    title: "Formwork OS",
    location: "Platform, 2024",
    detail: "Design system + app",
  },
  {
    tag: "Interiors",
    title: "The Cut",
    location: "Mombasa, 2023",
    detail: "Barbershop & gallery",
  },
  {
    tag: "Delivery",
    title: "Karura Trail",
    location: "Nairobi, 2023",
    detail: "Public realm",
  },
] as const;

const PROCESS = [
  {
    step: "01",
    label: "Frame",
    body: "We start with the problem, not the brief. What is this for, who is it for, and how will we know it worked?",
  },
  {
    step: "02",
    label: "Design",
    body: "Drawing, modelling, prototyping. Ideas get tested at the scale they will actually live at.",
  },
  {
    step: "03",
    label: "Engineer",
    body: "Details, systems, specs. The part where a sketch becomes something a contractor or a developer can build.",
  },
  {
    step: "04",
    label: "Deliver",
    body: "On the ground and on the screen. The studio stays through handover, launch and the first six months.",
  },
] as const;

export default function Home() {
  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="border-b border-deep-200 dark:border-deep-800">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-20 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:px-8 lg:pb-28 lg:pt-32">
          {/* Left: title block */}
          <div>
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-accent-mint"
              />
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-deep-500 dark:text-cream-400">
                Creative · Design · Technology
              </p>
            </div>

            <h1 className="mt-8 text-[clamp(2.75rem,7vw,6rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-deep-900 dark:text-cream-100">
              Ideas,
              <br />
              <span className="text-brand-700 dark:text-brand-300">
                integrated.
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-base leading-7 text-deep-600 dark:text-cream-400">
              Craft Studios is a single practice bringing architecture, design,
              software and delivery under one roof. One studio. Multiple
              disciplines. Seamlessly integrated.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-md bg-deep-800 px-5 py-3 text-sm font-medium text-cream-100 transition hover:bg-brand-700 dark:bg-brand-500 dark:text-deep-900 dark:hover:bg-accent-mint"
              >
                Start a project
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/work"
                className="inline-flex items-center gap-2 rounded-md border border-deep-300 px-5 py-3 text-sm font-medium text-deep-700 transition hover:border-deep-800 dark:border-deep-700 dark:text-cream-300 dark:hover:border-cream-100"
              >
                See the work
              </Link>
            </div>

            {/* Discipline strip */}
            <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-deep-200 pt-8 sm:grid-cols-4 dark:border-deep-800">
              {DISCIPLINES.map((d) => (
                <div key={d.title}>
                  <dt className="text-[10px] font-mono uppercase tracking-[0.22em] text-deep-400 dark:text-cream-600">
                    {d.index}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-deep-800 dark:text-cream-200">
                    {d.title}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Right: three plain word panels — architectural diagram feel */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-deep-200 bg-deep-200 dark:border-deep-800 dark:bg-deep-800">
              <div className="col-span-2 flex aspect-4/3 flex-col justify-between bg-cream-50 p-6 dark:bg-deep-900">
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-deep-400 dark:text-cream-600">
                  Craft — Diagram 01
                </p>
                <p className="text-3xl font-semibold leading-[1.05] tracking-[-0.02em] text-deep-800 dark:text-cream-100">
                  Spaces.
                  <br />
                  Systems.
                  <br />
                  Experiences.
                </p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-deep-500 dark:text-cream-500">
                  From concept to delivery
                </p>
              </div>
              <div className="flex aspect-square flex-col justify-between bg-brand-500 p-5 text-cream-50 dark:bg-brand-600">
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-cream-100/70">
                  Integrated
                </p>
                <p className="text-sm font-medium leading-5">
                  One studio, four disciplines, no hand-offs.
                </p>
              </div>
              <div className="flex aspect-square flex-col justify-between bg-deep-800 p-5 text-cream-100 dark:bg-deep-950">
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-cream-100/60">
                  Est.
                </p>
                <p className="text-4xl font-semibold tabular-nums tracking-[-0.02em]">
                  2024
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DISCIPLINES ─────────────────────────────────── */}
      <section className="border-b border-deep-200 dark:border-deep-800">
        <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.5fr_1fr] lg:gap-20">
            <header>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-deep-500 dark:text-cream-400">
                What we do
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-deep-900 dark:text-cream-100 sm:text-4xl">
                Four disciplines.
                <br />
                One practice.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-deep-600 dark:text-cream-400">
                Most studios pick a lane. We deliberately don't. Architecture,
                design, software and delivery sit in the same room so decisions
                travel in one direction: forward.
              </p>
            </header>

            <ul className="divide-y divide-deep-200 dark:divide-deep-800">
              {DISCIPLINES.map((d) => (
                <li
                  key={d.title}
                  className="grid grid-cols-[auto_1fr] gap-6 py-7 first:pt-0 last:pb-0"
                >
                  <span className="pt-1 text-[11px] font-mono uppercase tracking-[0.22em] text-deep-400 dark:text-cream-600">
                    {d.index}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-deep-900 dark:text-cream-100">
                      {d.title}
                    </h3>
                    <p className="mt-1.5 max-w-xl text-sm leading-6 text-deep-600 dark:text-cream-400">
                      {d.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─── PROCESS ─────────────────────────────────────── */}
      <section className="border-b border-deep-200 bg-cream-100 dark:border-deep-800 dark:bg-deep-900">
        <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-deep-500 dark:text-cream-400">
              How we work
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-deep-900 dark:text-cream-100 sm:text-4xl">
              A method, not a mood.
            </h2>
          </div>

          <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-deep-200 bg-deep-200 sm:grid-cols-2 lg:grid-cols-4 dark:border-deep-800 dark:bg-deep-800">
            {PROCESS.map((p) => (
              <li
                key={p.step}
                className="flex flex-col gap-4 bg-cream-50 p-6 dark:bg-deep-950"
              >
                <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-brand-700 dark:text-brand-300">
                  {p.step}
                </span>
                <h3 className="text-lg font-semibold text-deep-900 dark:text-cream-100">
                  {p.label}
                </h3>
                <p className="text-sm leading-6 text-deep-600 dark:text-cream-400">
                  {p.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── SELECTED WORK ───────────────────────────────── */}
      <section className="border-b border-deep-200 dark:border-deep-800">
        <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-deep-500 dark:text-cream-400">
                Selected work
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-deep-900 dark:text-cream-100 sm:text-4xl">
                Built, shipped, standing.
              </h2>
            </div>
            <Link
              href="/work"
              className="text-sm font-medium text-deep-700 underline decoration-deep-300 decoration-1 underline-offset-4 transition hover:decoration-deep-800 dark:text-cream-300 dark:decoration-deep-600 dark:hover:decoration-cream-100"
            >
              All work →
            </Link>
          </div>

          <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-deep-200 bg-deep-200 sm:grid-cols-2 dark:border-deep-800 dark:bg-deep-800">
            {WORK.map((w) => (
              <li key={w.title} className="bg-cream-50 dark:bg-deep-950">
                <Link
                  href="/work"
                  className="group flex h-full flex-col justify-between gap-12 p-8 transition hover:bg-cream-100 dark:hover:bg-deep-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-deep-400 dark:text-cream-600">
                      {w.tag}
                    </span>
                    <span
                      aria-hidden
                      className="text-deep-300 transition group-hover:translate-x-1 group-hover:text-deep-800 dark:text-deep-600 dark:group-hover:text-cream-100"
                    >
                      →
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold tracking-[-0.01em] text-deep-900 dark:text-cream-100">
                      {w.title}
                    </h3>
                    <p className="mt-1 text-sm text-deep-500 dark:text-cream-500">
                      {w.detail} · {w.location}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── STATEMENT / QUOTE ───────────────────────────── */}
      <section className="border-b border-deep-200 dark:border-deep-800">
        <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
          <figure className="grid gap-12 lg:grid-cols-[0.4fr_1fr] lg:gap-20">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-deep-500 dark:text-cream-400">
              Principle
            </p>
            <blockquote>
              <p className="text-[clamp(1.5rem,3.2vw,2.5rem)] font-medium leading-[1.15] tracking-[-0.015em] text-deep-900 dark:text-cream-100">
                “The work is one thing. Architecture, design, software and
                delivery are not stages of a process — they are the same
                practice seen from four angles.”
              </p>
              <figcaption className="mt-8 flex items-center gap-3">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-accent-coral"
                />
                <span className="text-sm font-medium text-deep-700 dark:text-cream-300">
                  Craft Studios
                </span>
                <span className="text-sm text-deep-400 dark:text-cream-600">
                  — studio note, 2024
                </span>
              </figcaption>
            </blockquote>
          </figure>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────── */}
      <section className="bg-deep-800 dark:bg-deep-950">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 lg:grid-cols-[1fr_auto] lg:items-end lg:px-8 lg:py-28">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-cream-400">
              Next
            </p>
            <h2 className="mt-4 text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-cream-100">
              Have a project in mind?
              <br />
              <span className="text-accent-mint">
                Let's draw the first line.
              </span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-md bg-cream-100 px-5 py-3 text-sm font-medium text-deep-900 transition hover:bg-accent-mint"
            >
              Start a project →
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-md border border-cream-100/25 px-5 py-3 text-sm font-medium text-cream-100 transition hover:border-accent-mint hover:text-accent-mint"
            >
              View services
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}