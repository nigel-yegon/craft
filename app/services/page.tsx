
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowDownRight, ArrowRight, Check } from "lucide-react";
import { PageHeader } from "../components/page-header";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore Craft Studios' integrated architecture, interior design, brand, software and project delivery services.",
};

const SERVICES = [
  {
    index: "01",
    title: "Architecture & spatial design",
    category: "Spaces",
    description:
      "From early concepts to technical coordination, we shape buildings and environments around their purpose, context and people.",
    included: [
      "Concept & feasibility",
      "Spatial planning",
      "Technical documentation",
      "Design coordination",
      "Site-stage support",
    ],
    work: "/work/architecture",
  },
  {
    index: "02",
    title: "Interior design",
    category: "Spaces",
    description:
      "We bring materials, lighting, furniture and detailing together to create interiors that feel considered and work beautifully.",
    included: [
      "Interior concepts",
      "Material palettes",
      "Furniture & finishes",
      "Joinery detailing",
      "Installation coordination",
    ],
    work: "/work/interiors",
  },
  {
    index: "03",
    title: "Brand & graphic design",
    category: "Experiences",
    description:
      "We create visual identities and communication systems that remain coherent across digital platforms, print and physical environments.",
    included: [
      "Visual identity",
      "Brand guidelines",
      "Graphic design",
      "Signage & wayfinding",
      "Digital communication",
    ],
    work: "/contact?service=brand",
  },
  {
    index: "04",
    title: "Software & product engineering",
    category: "Systems",
    description:
      "We design and build useful digital products, websites and internal tools, connecting thoughtful interfaces to dependable engineering.",
    included: [
      "Product discovery",
      "UX & interface design",
      "Web applications",
      "Systems integration",
      "Ongoing maintenance",
    ],
    work: "/work/software",
  },
  {
    index: "05",
    title: "Delivery & project management",
    category: "Implementation",
    description:
      "We coordinate the people, decisions, resources and practical details that move projects from an agreed direction to implementation.",
    included: [
      "Project planning",
      "Supplier coordination",
      "Programme tracking",
      "Quality reviews",
      "Handover coordination",
    ],
    work: "/work/delivery",
  },
] as const;

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="What we do"
        title={
          <>
            Different capabilities.
            <br />
            <span className="text-[var(--accent)]">
              One connected practice.
            </span>
          </>
        }
        lede="Craft Studios brings creative direction, design, technology and delivery into one coordinated process. Engage us for a focused service or bring us in to connect the parts of a larger project."
      />

      {/* Introduction */}
      <section className="border-b border-[var(--border)]">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-12 sm:px-8 md:grid-cols-[0.6fr_1fr] md:gap-16 md:py-16">
          <p className="section-kicker">Our capabilities</p>
          <p className="max-w-3xl text-xl leading-relaxed tracking-tight text-[var(--text-secondary)] sm:text-2xl">
            We start with what your project needs, bring the right disciplines
            together, and keep the intended outcome at the centre of the work.
          </p>
        </div>
      </section>

      {/* Service list */}
      <section>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {SERVICES.map((service) => (
            <article
              key={service.index}
              className="grid gap-8 border-b border-[var(--border)] py-12 first:pt-14 last:border-b-0 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:py-20"
            >
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-xs tracking-widest text-[var(--accent)]">
                    {service.index}
                  </span>
                  <span className="border border-[var(--border)] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    {service.category}
                  </span>
                </div>

                <h2 className="mt-6 max-w-xl text-2xl font-medium leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                  {service.title}
                </h2>

                <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                  {service.description}
                </p>

                <Link
                  href={service.work}
                  className="mt-7 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--accent)]"
                >
                  {service.index === "03"
                    ? "Discuss brand design"
                    : "Explore related work"}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>

              <div className="bg-[var(--surface)] p-6 sm:p-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  What this can include
                </p>

                <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                  {service.included.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-[var(--text-secondary)]"
                    >
                      <Check
                        size={16}
                        strokeWidth={1.5}
                        className="mt-0.5 shrink-0 text-[var(--accent)]"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Integrated engagement */}
      <section className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:py-24">
          <div>
            <p className="section-kicker">Working together</p>
            <h2 className="mt-6 max-w-xl text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
              One service, or the whole picture.
            </h2>
          </div>

          <div>
            <p className="text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
              Some projects need a specialist team for a defined task. Others
              benefit from coordinated creative, technical and delivery
              capabilities. We shape the engagement around the brief, scope,
              timeline and people involved.
            </p>

            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-3 bg-[var(--accent)] px-6 py-4 text-sm font-medium text-white transition hover:opacity-90"
            >
              Tell us what you need
              <ArrowDownRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
