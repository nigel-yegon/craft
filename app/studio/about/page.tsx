
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowDownRight, ArrowRight, Compass, Layers3, Workflow } from "lucide-react";
import { PageHeader } from "../../components/page-header";

export const metadata: Metadata = {
  title: "About the Studio",
  description:
    "Discover Craft Studios, an integrated creative, design and technology practice connecting spaces, systems and experiences.",
};

const PRINCIPLES = [
  {
    number: "01",
    title: "Think across disciplines.",
    description:
      "We look beyond individual deliverables to understand how spaces, digital products, visual identity and operational systems influence one another.",
    icon: Layers3,
  },
  {
    number: "02",
    title: "Design for the real world.",
    description:
      "Ideas matter when they can be implemented. We consider materials, budgets, technical constraints, people and long-term use from the beginning.",
    icon: Compass,
  },
  {
    number: "03",
    title: "Stay through delivery.",
    description:
      "We connect the thinking to the doing, working through decisions, coordination and implementation instead of leaving the final details to chance.",
    icon: Workflow,
  },
];

const DISCIPLINES = [
  {
    number: "01",
    title: "Spaces",
    description:
      "Architecture, spatial planning and interiors shaped around people, place and purpose.",
  },
  {
    number: "02",
    title: "Systems",
    description:
      "Software, digital products and connected infrastructure designed to make work better.",
  },
  {
    number: "03",
    title: "Experiences",
    description:
      "Visual identity, communication and the details that shape how people encounter a place or a product.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About Craft Studios"
        title={
          <>
            Different disciplines.
            <br />
            <span className="text-accent">
              One connected vision.
            </span>
          </>
        }
        lede="Craft Studios is an integrated creative, design and technology practice. We bring spatial thinking, digital capability and thoughtful execution together to help ideas work in the real world."
      />

      {/* Studio introduction */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.65fr_1fr] lg:gap-24 lg:py-28">
          <div>
            <p className="section-kicker">Our point of view</p>
            <h2 className="mt-6 max-w-md text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
              Good ideas deserve to make it all the way.
            </h2>
          </div>

          <div className="space-y-6 text-base leading-8 text-text-secondary">
            <p>
              A building is more than its drawings. A digital product is more
              than its interface. A brand is more than a mark. Each exists
              within a larger experience, shaped by the people, spaces and
              systems around it.
            </p>
            <p>
              Craft Studios brings these connected parts into the same
              conversation. We combine creative thinking with technical
              understanding and practical delivery, helping clients move from
              an early idea to something useful, considered and real.
            </p>
            <p>
              Our approach is collaborative by design. We ask questions early,
              make decisions with the wider picture in mind, and pay attention
              to the details that determine whether a good concept becomes a
              successful outcome.
            </p>
          </div>
        </div>
      </section>

      {/* The three connected disciplines */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="max-w-2xl">
            <p className="section-kicker">What connects our work</p>
            <h2 className="mt-6 text-3xl font-medium tracking-tight sm:text-5xl">
              Spaces. Systems. Experiences.
            </h2>
            <p className="mt-6 max-w-xl leading-7 text-text-secondary">
              Three perspectives, brought together around the same brief.
              Each can stand on its own. Together, they open up a more
              integrated way to solve problems.
            </p>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
            {DISCIPLINES.map((discipline) => (
              <article
                key={discipline.number}
                className="flex min-h-64 flex-col bg-surface p-7 sm:p-9"
              >
                <span className="font-mono text-xs tracking-widest text-text-muted">
                  {discipline.number}
                </span>

                <h3 className="mt-12 text-2xl font-medium">
                  {discipline.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-text-secondary">
                  {discipline.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="border-y border-border">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1fr] lg:gap-24">
            <div>
              <p className="section-kicker">How we think</p>
              <h2 className="mt-6 max-w-sm text-3xl font-medium tracking-tight sm:text-4xl">
                Integration is a way of working, not a slogan.
              </h2>
              <Link
                href="/studio/process"
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-accent"
              >
                Explore our process
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <div className="divide-y divide-border border-y border-border">
              {PRINCIPLES.map((principle) => {
                const Icon = principle.icon;

                return (
                  <article
                    key={principle.number}
                    className="grid gap-4 py-8 sm:grid-cols-[3rem_1fr] sm:gap-6"
                  >
                    <span className="font-mono text-xs text-text-muted">
                      {principle.number}
                    </span>

                    <div>
                      <div className="flex items-center gap-3">
                        <Icon
                          size={19}
                          strokeWidth={1.5}
                          className="text-accent"
                          aria-hidden="true"
                        />
                        <h3 className="text-lg font-medium">
                          {principle.title}
                        </h3>
                      </div>

                      <p className="mt-4 max-w-xl text-sm leading-7 text-text-secondary">
                        {principle.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-(--charcoal-deep) text-(--ivory)">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-20 sm:px-8 lg:flex-row lg:items-end lg:py-24">
          <div className="max-w-3xl">
            <p className="section-kicker">A good place to begin</p>
            <h2 className="mt-6 text-4xl font-medium leading-tight tracking-tight sm:text-6xl">
              Have an idea that needs more than one perspective?
            </h2>
            <p className="mt-6 max-w-xl leading-7 text-white/65">
              Tell us what you are trying to create, improve or bring to life.
              We can work out the right starting point together.
            </p>
          </div>

          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center gap-3 bg-(--olive-light) px-6 py-4 text-sm font-medium text-(--charcoal-deep) transition hover:bg-(--ivory)"
          >
            Start a conversation
            <ArrowDownRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
