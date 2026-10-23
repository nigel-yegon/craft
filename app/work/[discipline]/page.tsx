// app/work/[discipline]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "../../components/page-header";

const VALID = new Set(["architecture", "interiors", "software", "delivery"]);

const TITLES: Record<string, string> = {
  architecture: "Architecture",
  interiors: "Interiors",
  software: "Software",
  delivery: "Delivery",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ discipline: string }>;
}): Promise<Metadata> {
  const { discipline } = await params;
  return { title: TITLES[discipline] ?? "Work" };
}

export default async function DisciplinePage({
  params,
}: {
  params: Promise<{ discipline: string }>;
}) {
  const { discipline } = await params;
  if (!VALID.has(discipline)) notFound();

  return (
    <PageHeader
      eyebrow="Work"
      title={TITLES[discipline]}
      lede="Case studies are being collected. In the meantime, this section lists the practice area — individual project pages will live one level deeper at /work/[discipline]/[project]."
    />
  );
}