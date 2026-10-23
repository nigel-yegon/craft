
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowDown, ArrowRight } from "lucide-react";
import { PageHeader } from "../../components/page-header";

export const metadata: Metadata = {
  title: "Our Process",
  description:
    "Explore how Craft Studios takes projects from discovery and integrated design through coordination, implementation and handover.",
};

const PHASES = [
  {
    number: "01",
    title: "Discover",
    label: "Understand the brief",
    description:
      "We start by understanding the problem, the people involved and what success should look like. We establish priorities, constraints and the questions that need answering before solutions take shape.",
    outputs: [
      "Project brief",
      "Goals and priorities",
      "Scope and constraints",
    ],
  },
  {
    number: "02",
    title: "Define",
    label: "Set the direction",
    description:
      "We translate the brief into a clear direction. Depending on the project, this may include spatial concepts, experience mapping, technical planning, visual references or a delivery roadmap.",
    outputs: [
      "Concept direction",
      "Project roadmap",
      "Initial recommendations",
    ],
  },
  {
    number: "03",
    title: "Design",
    label: "Connect the details",
    description:
      "We develop the chosen direction and coordinate the disciplines involved. Materials, interfaces, technical requirements, workflows and implementation needs are considered together rather than in isolation.",
    outputs: [
      "Design development",
      "Technical coordination",
      "Agreed specifications",
    ],
  },
  {
    number: "04",
    title: "Deliver",
    label: "Make it real",
    description:
      "We work through implementation with attention to quality, communication and practical decisions. The aim is to keep the original intent intact while responding thoughtfully to real-world conditions.",
    outputs: [
      "Implementation",
      "Progress coordination",
      "Quality reviews",
    ],
  },
  {
    number: "05",
    title: "Handover",
    label: "Prepare for what comes next",
    description:
      "We review the completed work, address outstanding items and help the client understand what has been delivered. Where agreed, this includes documentation, training and follow-up support.",
    outputs: [
      "Final review",
      "Documentation and handover",
      "Agreed follow-up support",
    ],
  },
];

export default function ProcessPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our process"
        title={
          <>
            From first question
            <br />
            <span className="text-[var(--accent)]">
              to finished work.
            </span>
          </>
        }
        lede="Every project is different, but good delivery needs a clear direction, open communication and thoughtful coordination. Our process provides structure without forcing every brief into the same shape."
      />

      <section className="border-b border-[var(--border)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.6fr_1fr] lg:gap-20 lg:py-20">
          <p className="section-kicker">The working principle</p>
          <div>
            <p className="text-2xl font-medium leading-relaxed tracking-tight sm:text-3xl">
              The earlier we connect the moving parts, the fewer surprises
              we leave for the end.
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
              We bring the right people into the conversation at the right
              time, make decisions visible, and keep design intent connected
              to the realities of delivery.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <p className="section-kicker">Five phases</p>
              <h2 className="mt-5 text-3xl font-medium tracking-tight sm:text-4xl">
                A clear path forward.
              </h2>
            </div>
            <ArrowDown
              size={24}
              strokeWidth={1.3}
              className="hidden text-[var(--accent)] sm:block"
              aria-hidden="true"
            />
          </div>

          <div className="border-t border-[var(--border)]">
            {PHASES.map((phase) => (
              <article
                key={phase.number}
                className="grid gap-6 border-b border-[var(--border)] py-10 md:grid-cols-[5rem_0.8fr_1.2fr] md:gap-10 md:py-14"
              >
                <span className="font-mono text-sm text-[var(--accent)]">
                  {phase.number}
                </span>

                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    {phase.label}
                  </p>
                  <h3 className="mt-3 text-2xl font-medium tracking-tight sm:text-3xl">
                    {phase.title}
                  </h3>
                </div>

                <div>
                  <p className="max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
                    {phase.description}
                  </p>

                  <ul className="mt-6 flex flex-wrap gap-2">
                    {phase.outputs.map((output) => (
                      <li
                        key={output}
                        className="border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-secondary)]"
                      >
                        {output}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--surface)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 md:grid-cols-2 lg:py-20">
          <div>
            <p className="section-kicker">Built around the brief</p>
            <h2 className="mt-5 max-w-lg text-3xl font-medium tracking-tight">
              Structure where it helps. Flexibility where it matters.
            </h2>
          </div>
          <div className="space-y-4 text-sm leading-7 text-[var(--text-secondary)]">
            <p>
              A software engagement may move through prototypes and testing.
              A spatial project may require approvals, procurement and site
              coordination. Some projects combine both.
            </p>
            <p>
              We adapt the depth and sequence of each phase to the project's
              scope, agreed deliverables and working requirements. The process
              is a framework for better decisions, not paperwork for its own
              sake.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[var(--charcoal-deep)] text-[var(--ivory)]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
          <p className="section-kicker">Your project starts here</p>
          <div className="mt-6 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <h2 className="max-w-3xl text-4xl font-medium tracking-tight sm:text-6xl">
              Let's work out the right first step.
            </h2>
            <Link
              href="/contact"
              className="inline-flex shrink-0 items-center gap-3 bg-[var(--olive-light)] px-6 py-4 text-sm font-medium text-[var(--charcoal-deep)] transition hover:bg-[var(--ivory)]"
            >
              Discuss a project
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
