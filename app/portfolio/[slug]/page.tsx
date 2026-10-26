// app/portfolio/[slug]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectBySlug } from "@/app/admin/actions/projects";

export default function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className="min-h-screen bg-cream-200 dark:bg-deep-950">
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
        <Link
          href="/portfolio"
          className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600 hover:text-rose-700 dark:text-rose-400"
        >
          ← Back to portfolio
        </Link>

        <Suspense fallback={<ProjectSkeleton />}>
          <ProjectContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}

async function ProjectContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project || !project.published) notFound();

  const period =
    project.startDate && project.endDate
      ? `${new Date(project.startDate).toLocaleDateString()} — ${new Date(project.endDate).toLocaleDateString()}`
      : project.startDate
        ? `Started ${new Date(project.startDate).toLocaleDateString()}`
        : null;

  return (
    <article className="mt-6">
      {project.coverImage && (
        <div className="aspect-[16/9] overflow-hidden rounded-3xl bg-cream-200 dark:bg-deep-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.coverImage}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
          {project.category}
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-deep-800 dark:text-cream-100">
          {project.title}
        </h1>
        <p className="mt-3 text-lg text-deep-600 dark:text-cream-400">
          {project.summary}
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Fact label="Client" value={project.clientName} />
        <Fact label="Status" value={project.status.replace(/_/g, " ")} />
        {project.durationWeeks != null && (
          <Fact label="Duration" value={`${project.durationWeeks} weeks`} />
        )}
        {project.costKes != null && (
          <Fact label="Cost" value={`KES ${project.costKes.toLocaleString()}`} />
        )}
      </div>

      {period && (
        <p className="mt-2 text-xs text-deep-500 dark:text-cream-500">{period}</p>
      )}

      <div className="mt-10 space-y-8">
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-deep-500 dark:text-cream-500">
            About the project
          </h2>
          <p className="mt-3 whitespace-pre-line text-base leading-7 text-deep-700 dark:text-cream-300">
            {project.description}
          </p>
        </section>

        {project.processes.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-deep-500 dark:text-cream-500">
              Process
            </h2>
            <ol className="mt-3 space-y-2 text-base text-deep-700 dark:text-cream-300">
              {project.processes.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-mono text-xs text-rose-600 dark:text-rose-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {project.technologies.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-deep-500 dark:text-cream-500">
              Technology
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-deep-200 px-3 py-1 text-xs text-deep-700 dark:border-deep-800 dark:text-cream-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>
        )}

        {project.galleryImages.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-deep-500 dark:text-cream-500">
              Gallery
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {project.galleryImages.map((url, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] overflow-hidden rounded-xl bg-cream-200 dark:bg-deep-800"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`${project.title} — ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {project.clientContact && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-deep-500 dark:text-cream-500">
              Client contact
            </h2>
            <p className="mt-2 text-sm text-deep-700 dark:text-cream-300">
              {project.clientContact}
            </p>
          </section>
        )}
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-deep-200 bg-cream-50 p-4 dark:border-deep-800 dark:bg-deep-900">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-deep-500 dark:text-cream-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold capitalize text-deep-800 dark:text-cream-100">
        {value}
      </p>
    </div>
  );
}

function ProjectSkeleton() {
  return (
    <div className="mt-6 animate-pulse">
      <div className="aspect-[16/9] rounded-3xl bg-cream-100 dark:bg-deep-900" />
      <div className="mt-8 space-y-3">
        <div className="h-3 w-24 rounded bg-cream-100 dark:bg-deep-900" />
        <div className="h-10 w-3/4 rounded bg-cream-100 dark:bg-deep-900" />
        <div className="h-5 w-full rounded bg-cream-100 dark:bg-deep-900" />
      </div>
    </div>
  );
}