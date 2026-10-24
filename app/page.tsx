
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Box,
  Check,
  Layers3,
  Lightbulb,
  MoveUpRight,
  PanelsTopLeft,
  Shapes,
  Workflow,
} from "lucide-react";

const services = [
  {
    number: "01",
    title: "Spaces & Architecture",
    description:
      "Architectural concepts, spatial planning and considered interiors shaped around the way people live, work and connect.",
    tags: ["Architecture", "Interiors", "Space planning"],
    href: "/work/architecture",
    icon: PanelsTopLeft,
  },
  {
    number: "02",
    title: "Visuals & Art",
    description:
      "Visual identities, artwork, creative direction and compelling visual impressions that give ideas their own character.",
    tags: ["Art direction", "Visual design", "Artwork"],
    href: "/services",
    icon: Shapes,
  },
  {
    number: "03",
    title: "Software & Systems",
    description:
      "Bespoke software, digital products and practical business systems designed around real people and real workflows.",
    tags: ["Software", "Digital products", "Automation"],
    href: "/work/software",
    icon: Workflow,
  },
  {
    number: "04",
    title: "Solutions & Delivery",
    description:
      "From solution architecture and technical planning to project coordination, implementation and delivery.",
    tags: ["Consulting", "Project management", "Implementation"],
    href: "/work/delivery",
    icon: Layers3,
  },
];

const projects = [
  {
    number: "01",
    category: "SPATIAL DESIGN",
    title: "Spaces that make sense.",
    description:
      "Thoughtful environments, material choices and spatial experiences.",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85",
    alt: "Warm contemporary interior with considered furniture and natural materials",
    className: "md:col-span-7",
  },
  {
    number: "02",
    category: "DIGITAL SYSTEMS",
    title: "Complexity, made clear.",
    description:
      "Digital tools and bespoke systems designed for the way businesses work.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=85",
    alt: "Digital business analytics displayed on a computer screen",
    className: "md:col-span-5 md:mt-24",
  },
  {
    number: "03",
    category: "ARCHITECTURE",
    title: "Ideas with a footprint.",
    description:
      "Architectural thinking that connects function, form and context.",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85",
    alt: "Contemporary architecture with expansive glass and carefully composed forms",
    className: "md:col-span-5",
  },
  {
    number: "04",
    category: "CREATIVE DIRECTION",
    title: "Identity with intention.",
    description:
      "Visual decisions that create a coherent, recognisable experience.",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=85",
    alt: "Creative workspace with notebooks and design materials",
    className: "md:col-span-7 md:mt-24",
  },
];

const process = [
  {
    number: "01",
    title: "Discover",
    text: "Understand the people, the problem and the opportunity.",
  },
  {
    number: "02",
    title: "Conceptualise",
    text: "Explore ideas, test possibilities and define the direction.",
  },
  {
    number: "03",
    title: "Design & engineer",
    text: "Bring creative thinking and technical rigour together.",
  },
  {
    number: "04",
    title: "Deliver",
    text: "Coordinate implementation and bring the solution into the real world.",
  },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-background text-foreground">
      {/* HERO */}
      <section className="relative isolate min-h-170 overflow-hidden bg-[#20221e] text-[#f4f0e7] lg:min-h-190">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2400&q=90')",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-r from-[#171915]/95 via-[#171915]/75 to-[#171915]/20"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-t from-[#171915]/70 via-transparent to-[#171915]/10"
        />

        <div className="mx-auto flex min-h-170 max-w-7xl flex-col justify-between px-5 pb-8 pt-20 sm:px-8 lg:min-h-190 lg:px-12 lg:pb-10 lg:pt-28">
          <div className="max-w-4xl">
            <p className="mb-7 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-[#c2cf9c] sm:text-xs">
              <span className="h-px w-8 bg-[#a9b77d]" />
              An integrated creative & technology studio
            </p>

            <h1 className="max-w-4xl text-5xl font-light leading-[0.98] tracking-[-0.065em] sm:text-7xl lg:text-[100px]">
              Spaces.
              <br />
              Systems.
              <br />
              <span className="font-normal text-brand-300">
                Experiences.
              </span>
            </h1>

            <div className="mt-8 grid max-w-2xl gap-7 sm:grid-cols-[1fr_auto] sm:items-end">
              <p className="max-w-md text-sm leading-7 text-white/75 sm:text-base">
                We bring creative thinking, spatial design and intelligent
                technology together to turn ambitious ideas into meaningful,
                real-world solutions.
              </p>

              <div className="flex flex-wrap gap-3 sm:flex-col">
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center justify-center gap-3 bg-brand-300 px-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#20221e] transition hover:bg-[#d0dbb3] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-300"
                >
                  Start a project
                  <ArrowUpRight size={16} />
                </Link>
                <Link
                  href="/work"
                  className="inline-flex min-h-12 items-center justify-center gap-3 border border-white/30 px-5 text-xs font-medium uppercase tracking-[0.12em] text-white transition hover:border-white hover:bg-white/10"
                >
                  Explore our work
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-wrap items-end justify-between gap-6 border-t border-white/20 pt-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
              Independent thinking. Integrated delivery.
            </p>
            <a
              href="#studio"
              className="inline-flex items-center gap-2 text-xs text-white/80 transition hover:text-[#c2cf9c]"
            >
              Discover the studio
              <ArrowDownRight size={15} />
            </a>
          </div>
        </div>
      </section>

      {/* STUDIO INTRODUCTION */}
      <section
        id="studio"
        className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-12 lg:gap-16 lg:px-12"
      >
        <div className="lg:col-span-5">
          <p className="section-kicker">01 / The studio</p>
          <h2 className="mt-6 max-w-lg text-4xl font-light leading-[1.08] tracking-tighter sm:text-5xl lg:text-6xl">
            Different disciplines.
            <br />
            <span className="text-olive">One clear vision.</span>
          </h2>
        </div>

        <div className="flex flex-col justify-between gap-8 lg:col-span-6 lg:col-start-7">
          <p className="max-w-2xl text-base leading-8 text-foreground/75 sm:text-lg sm:leading-9">
            Craft Studios is a fully integrated creative studio working across
            spaces, visual expression and technology. We connect the dots
            between an initial idea, a considered design, an engineered
            solution and its implementation.
          </p>
          <p className="max-w-2xl text-sm leading-7 text-foreground/65">
            Rather than treating every discipline as a separate destination,
            we bring them together around what the project actually needs.
            One connected process. A more coherent result.
          </p>
          <Link
            href="/studio"
            className="inline-flex w-fit items-center gap-3 border-b border-olive pb-2 text-sm font-medium transition hover:gap-5"
          >
            Get to know Craft Studios
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-cream-200 py-20 text-[#292a25] sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="section-kicker">02 / What we do</p>
              <h2 className="mt-5 max-w-2xl text-4xl font-light leading-tight tracking-tighter sm:text-5xl lg:text-6xl">
                Made to work
                <br />
                <span className="text-olive">better together.</span>
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-[#292a25]/70">
              Four connected disciplines. One adaptable team, from the first
              sketch to the final handover.
            </p>
          </div>

          <div className="grid border-l border-t border-[#292a25]/15 sm:grid-cols-2">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <Link
                  key={service.number}
                  href={service.href}
                  className="group flex min-h-75 flex-col border-b border-r border-[#292a25]/15 p-6 transition-colors hover:bg-[#f4f0e7] sm:p-8 lg:min-h-82.5 lg:p-10"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-xs text-[#292a25]/50">
                      {service.number}
                    </span>
                    <Icon
                      size={23}
                      strokeWidth={1.4}
                      className="text-olive transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>

                  <h3 className="mt-12 text-2xl font-medium tracking-tight sm:text-3xl">
                    {service.title}
                  </h3>
                  <p className="mt-4 max-w-md text-sm leading-7 text-[#292a25]/70">
                    {service.description}
                  </p>

                  <div className="mt-auto flex flex-wrap gap-2 pt-7">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-[#292a25]/15 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.08em] text-[#292a25]/70"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="ml-auto flex items-center text-olive transition-transform group-hover:translate-x-1">
                      <ArrowUpRight size={19} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* PORTFOLIO */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="mb-14 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="section-kicker">03 / Selected perspectives</p>
            <h2 className="mt-5 text-4xl font-light tracking-tighter sm:text-5xl lg:text-6xl">
              Ideas, made tangible.
            </h2>
          </div>
          <Link
            href="/work"
            className="inline-flex w-fit items-center gap-3 border-b border-olive pb-2 text-sm transition hover:gap-5"
          >
            View all work
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-12 md:gap-y-20">
          {projects.map((project) => (
            <article key={project.number} className={project.className}>
              <Link
                href="/work"
                className="group block"
                aria-label={`Explore work: ${project.title}`}
              >
                <div className="relative aspect-5/4 overflow-hidden bg-cream-200">
                  {/* Remote images are used here so no image-host configuration is needed. */}
                  <img
                    src={project.image}
                    alt={project.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
                  />
                  <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f0e7] text-[#292a25] transition group-hover:bg-olive group-hover:text-white">
                    <MoveUpRight size={18} />
                  </span>
                </div>

                <div className="mt-5 flex items-start justify-between gap-5">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.15em] text-olive">
                      {project.category}
                    </p>
                    <h3 className="mt-2 text-2xl font-medium tracking-tight sm:text-3xl">
                      {project.title}
                    </h3>
                    <p className="mt-2 max-w-md text-sm leading-6 text-foreground/65">
                      {project.description}
                    </p>
                  </div>
                  <span className="pt-1 font-mono text-xs text-foreground/40">
                    {project.number}
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>

        <p className="mt-12 max-w-xl text-xs leading-6 text-foreground/50">
          The imagery above is illustrative. Replace it with verified studio
          projects as your portfolio is ready to publish.
        </p>
      </section>

      {/* PROCESS */}
      <section className="bg-[#242620] py-20 text-[#f4f0e7] sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-300">
                04 / How we work
              </p>
              <h2 className="mt-6 text-4xl font-light leading-[1.08] tracking-tighter sm:text-5xl lg:text-6xl">
                From first thought
                <br />
                to final form.
              </h2>
              <p className="mt-6 max-w-md text-sm leading-7 text-white/60">
                Good work needs more than a good idea. We connect discovery,
                design, engineering and delivery into one thoughtful process.
              </p>
              <Link
                href="/studio/process"
                className="mt-8 inline-flex items-center gap-3 border-b border-brand-300 pb-2 text-sm text-[#f4f0e7] transition hover:gap-5"
              >
                Explore our process
                <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              {process.map((step, index) => (
                <div
                  key={step.number}
                  className="grid grid-cols-[48px_1fr] gap-4 border-t border-white/15 py-6 sm:grid-cols-[60px_1fr] sm:py-8"
                >
                  <span className="font-mono text-xs text-brand-300">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="text-xl font-medium sm:text-2xl">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-md text-sm leading-7 text-white/60">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
              <div className="mt-4 flex items-center gap-2 text-xs text-brand-300">
                <Check size={15} />
                <span>One connected process, shaped around your project.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND PRINCIPLE */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="grid gap-8 border-b border-foreground/15 pb-12 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="section-kicker">05 / Our guiding principle</p>
            <h2 className="mt-6 max-w-4xl text-5xl font-light leading-[1.02] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
              Ideas,
              <br />
              <span className="text-olive">Integrated.</span>
            </h2>
          </div>
          <div className="max-w-xs">
            <p className="text-sm leading-7 text-foreground/70">
              Creative vision meets practical thinking. Every detail has a
              purpose, every discipline has a place, and every solution is
              designed to work in the real world.
            </p>
          </div>
        </div>
      </section>

      {/* PROJECT ENQUIRY */}
      <section className="px-5 pb-20 sm:px-8 sm:pb-28 lg:px-12">
        <div className="relative mx-auto max-w-7xl overflow-hidden bg-[#dfe4d1] px-6 py-12 text-[#252720] sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-24 h-72 w-72 rounded-full border border-[#65734b]/20 sm:h-96 sm:w-96"
          />
          <div
            aria-hidden="true"
            className="absolute -right-4 -top-12 h-56 w-56 rounded-full border border-[#65734b]/20 sm:h-72 sm:w-72"
          />

          <div className="relative max-w-3xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#65734b]">
              Have something in mind?
            </p>
            <h2 className="mt-6 text-4xl font-light leading-[1.05] tracking-tighter sm:text-6xl lg:text-7xl">
              Let&apos;s make
              <br />
              something meaningful.
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-7 text-[#252720]/70 sm:text-base">
              Tell us what you are imagining, building or trying to solve.
              We&apos;ll help connect the ideas to a way forward.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex min-h-12 items-center gap-4 bg-[#252720] px-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#f4f0e7] transition hover:bg-[#424638] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#252720]"
            >
              Start a conversation
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER BRAND STRIP */}
      <div className="border-t border-foreground/10 px-5 py-5 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-[10px] uppercase tracking-[0.16em] text-foreground/50 sm:flex-row sm:items-center sm:justify-between">
          <span>Craft Studios</span>
          <span>Spaces. Systems. Experiences.</span>
          <Link href="/contact" className="inline-flex items-center gap-2 hover:text-foreground">
            Have a project? <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>
    </main>
  );
}
