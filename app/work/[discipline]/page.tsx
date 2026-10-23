// app/work/[discipline]/page.tsx
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "../../components/page-header";

const VALID = new Set(["architecture", "interiors", "software", "delivery"]);

const TITLES: Record<string, string> = {
  architecture: "Architecture",
  interiors: "Interiors",
  software: "Software",
  delivery: "Delivery",
};

// Keep generateMetadata — it's allowed to read params
export async function generateMetadata({
  params,
}: {
  params: Promise<{ discipline: string }>;
}): Promise<Metadata> {
  const { discipline } = await params;
  return { title: TITLES[discipline] ?? "Work" };
}

// Main page — does NOT await params
export default function DisciplinePage({
  params,
}: {
  params: Promise<{ discipline: string }>;
}) {
  return (
    <>
      {/* Static header — renders immediately */}
      <PageHeader
        eyebrow="Work"
        title="Discipline"
        lede="Case studies are being collected. Individual project pages will live one level deeper."
      />

      {/* Dynamic content — streams in with the discipline name */}
      <Suspense fallback={<DisciplineSkeleton />}>
        <DisciplineContent params={params} />
      </Suspense>
    </>
  );
}

// Child component — awaits params inside its own boundary
async function DisciplineContent({
  params,
}: {
  params: Promise<{ discipline: string }>;
}) {
  const { discipline } = await params;
  if (!VALID.has(discipline)) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <h2 className="text-3xl font-semibold text-deep-900 dark:text-cream-100">
        {TITLES[discipline]}
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-deep-600 dark:text-cream-400">
        This section lists the practice area — individual project pages will live
        one level deeper at /work/{discipline}/[project].
      </p>
    </div>
  );
}

function DisciplineSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <div className="h-8 w-48 animate-pulse rounded bg-cream-200 dark:bg-deep-800" />
      <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded bg-cream-200 dark:bg-deep-800" />
      <div className="mt-2 h-4 w-3/4 max-w-md animate-pulse rounded bg-cream-200 dark:bg-deep-800" />
    </div>
  );
}