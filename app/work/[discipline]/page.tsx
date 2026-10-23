
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PageHeader } from "../../components/page-header";

const PORTFOLIO = {
  architecture: {
    title: "Architecture",
    description:
      "Buildings and public spaces shaped by context, function and the people who use them.",
    projects: [
      {
        title: "Riverside Civic Hall",
        type: "Public building",
        location: "Nairobi",
        year: "2024",
        description:
          "A project entry for documenting civic space, architectural intent and delivery.",
      },
      {
        title: "Karura Trail",
        type: "Public realm",
        location: "Nairobi",
        year: "2023",
        description:
          "A project entry for exploring the relationship between landscape, movement and public experience.",
      },
      {
        title: "Mwitu House",
        type: "Private residence",
        location: "Naivasha",
        year: "2023",
        description:
          "A project entry for residential planning, material choices and spatial quality.",
      },
    ],
  },
  interiors: {
    title: "Interiors",
    description:
      "Interior environments where materials, light, function and atmosphere work together.",
    projects: [
      {
        title: "The Cut",
        type: "Retail & hospitality",
        location: "Mombasa",
        year: "2023",
        description:
          "A project entry for a space combining customer experience, practical operations and visual character.",
      },
      {
        title: "Kijani Workspace",
        type: "Workspace",
        location: "Nairobi",
        year: "2024",
        description:
          "A project entry for workplace planning, collaboration and everyday usability.",
      },
      {
        title: "Room & Reed",
        type: "Hospitality",
        location: "Lamu",
        year: "2022",
        description:
          "A project entry for hospitality interiors, material palettes and guest experience.",
      },
    ],
  },
  software: {
    title: "Software",
    description:
      "Digital products, web platforms and tools designed to connect people, information and work.",
    projects: [
      {
        title: "Formwork OS",
        type: "Digital platform",
        location: "Craft Studios",
        year: "2024",
        description:
          "A project entry for documenting the product problem, workflows, technical approach and delivered features.",
      },
      {
        title: "Studio Atlas",
        type: "Internal tool",
        location: "Craft Studios",
        year: "2023",
        description:
          "A project entry for internal workflows, operational tools and information management.",
      },
      {
        title: "Mtaa Map",
        type: "Web application",
        location: "Kenya",
        year: "2024",
        description:
          "A project entry for documenting the user needs, interface and functionality of a digital service.",
      },
    ],
  },
  delivery: {
    title: "Delivery",
    description:
      "Project coordination and implementation that connect the agreed plan to the finished outcome.",
    projects: [
      {
        title: "Kilifi Coastal Path",
        type: "Public realm",
        location: "Kilifi",
        year: "2023",
        description:
          "A project entry for documenting planning, coordination and implementation.",
      },
      {
        title: "Nairobi Design Week",
        type: "Event implementation",
        location: "Nairobi",
        year: "2023",
        description:
          "A project entry for production planning, site coordination and event delivery.",
      },
      {
        title: "Lamu Seafront Works",
        type: "Restoration",
        location: "Lamu",
        year: "2022",
        description:
          "A project entry for documenting coordination, implementation and handover.",
      },
    ],
  },
} as const;

type Discipline = keyof typeof PORTFOLIO;

export function generateStaticParams() {
  return Object.keys(PORTFOLIO).map((discipline) => ({
    discipline,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ discipline: string }>;
}): Promise<Metadata> {
  const { discipline } = await params;

  if (!Object.hasOwn(PORTFOLIO, discipline)) {
    return { title: "Work" };
  }

  const entry = PORTFOLIO[discipline as Discipline];

  return {
    title: `${entry.title} Work`,
    description: entry.description,
  };
}

export default async function DisciplinePage({
  params,
}: {
  params: Promise<{ discipline: string }>;
}) {
  const { discipline } = await params;

  if (!Object.hasOwn(PORTFOLIO, discipline)) {
    notFound();
  }

  const section = PORTFOLIO[discipline as Discipline];

  return (
    <>
      <PageHeader
        eyebrow="Selected work"
        title={
          <>
            {section.title}
            <br />
            <span className="text-[var(--accent)]">In practice.</span>
          </>
        }
        lede={section.description}
      />

      <section>
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-20">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            All work
          </Link>

          <div className="mt-10 grid gap-px border border-[var(--border)] bg-[var(--border)] md:grid-cols-2 xl:grid-cols-3">
            {section.projects.map((project, index) => (
              <article
                key={project.title}
                className="flex min-h-72 flex-col bg-[var(--surface)] p-6 sm:p-8"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-xs text-[var(--accent)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {project.year}
                  </span>
                </div>

                <div className="mt-12">
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    {project.type} · {project.location}
                  </p>
                  <h2 className="mt-3 text-2xl font-medium tracking-tight">
                    {project.title}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                    {project.description}
                  </p>
                </div>

                <div className="mt-auto flex justify-end pt-8">
                  <ArrowUpRight
                    size={18}
                    strokeWidth={1.5}
                    className="text-[var(--accent)]"
                    aria-hidden="true"
                  />
                </div>
              </article>
            ))}
          </div>

          <p className="mt-6 text-xs leading-6 text-[var(--text-muted)]">
            Portfolio entries are currently illustrative placeholders. Replace
            them with verified projects, approved descriptions and project
            imagery before publishing.
          </p>
        </div>
      </section>

      <section className="bg-[var(--charcoal-deep)] text-[var(--ivory)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-16 sm:px-8 md:flex-row md:items-end md:justify-between lg:py-20">
          <div>
            <p className="section-kicker">Have a project in mind?</p>
            <h2 className="mt-5 max-w-2xl text-3xl font-medium tracking-tight sm:text-4xl">
              Let's make the next one together.
            </h2>
          </div>

          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center gap-2 bg-[var(--olive-light)] px-5 py-3 text-sm font-medium text-[var(--charcoal-deep)] transition hover:bg-[var(--ivory)]"
          >
            Start a conversation
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
