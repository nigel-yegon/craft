// app/admin/actions/projects.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ─── Types ────────────────────────────────────────────────────────

export type ProjectStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ON_HOLD"
  | "ARCHIVED";

export type ProjectRow = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  description: string;
  status: ProjectStatus;
  category: string;
  clientName: string;
  clientContact: string | null;
  clientIndustry: string | null;
  costKes: number | null;
  durationWeeks: number | null;
  startDate: string | null;
  endDate: string | null;
  processes: string[];
  technologies: string[];
  coverImage: string | null;
  galleryImages: string[];
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProjectInput = {
  title: string;
  slug: string;
  summary: string;
  description: string;
  status: ProjectStatus;
  category: string;
  clientName: string;
  clientContact?: string;
  clientIndustry?: string;
  costKes?: number;
  durationWeeks?: number;
  startDate?: string;
  endDate?: string;
  processes: string[];
  technologies: string[];
  coverImage?: string;
  galleryImages: string[];
  featured: boolean;
  published: boolean;
};

// ─── Reads ────────────────────────────────────────────────────────

function toRow(p: {
  id: number;
  slug: string;
  title: string;
  summary: string;
  description: string;
  status: string;
  category: string;
  clientName: string;
  clientContact: string | null;
  clientIndustry: string | null;
  costKes: number | null;
  durationWeeks: number | null;
  startDate: Date | null;
  endDate: Date | null;
  processes: string[];
  technologies: string[];
  coverImage: string | null;
  galleryImages: string[];
  featured: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}): ProjectRow {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    description: p.description,
    status: p.status as ProjectStatus,
    category: p.category,
    clientName: p.clientName,
    clientContact: p.clientContact,
    clientIndustry: p.clientIndustry,
    costKes: p.costKes,
    durationWeeks: p.durationWeeks,
    startDate: p.startDate?.toISOString() ?? null,
    endDate: p.endDate?.toISOString() ?? null,
    processes: p.processes,
    technologies: p.technologies,
    coverImage: p.coverImage,
    galleryImages: p.galleryImages,
    featured: p.featured,
    published: p.published,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export async function listProjects(): Promise<ProjectRow[]> {
  const rows = await prisma.project.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(toRow);
}

export async function listPublicProjects(): Promise<ProjectRow[]> {
  const rows = await prisma.project.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(toRow);
}

export async function getProjectBySlug(slug: string): Promise<ProjectRow | null> {
  const row = await prisma.project.findUnique({ where: { slug } });
  return row ? toRow(row) : null;
}

// ─── Writes ───────────────────────────────────────────────────────

export async function createProject(input: ProjectInput) {
  const project = await prisma.project.create({
    data: {
      slug: input.slug,
      title: input.title,
      summary: input.summary,
      description: input.description,
      status: input.status,
      category: input.category,
      clientName: input.clientName,
      clientContact: input.clientContact ?? null,
      clientIndustry: input.clientIndustry ?? null,
      costKes: input.costKes ?? null,
      durationWeeks: input.durationWeeks ?? null,
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null,
      processes: input.processes,
      technologies: input.technologies,
      coverImage: input.coverImage ?? null,
      galleryImages: input.galleryImages,
      featured: input.featured,
      published: input.published,
    },
  });
  revalidatePath("/admin");
  revalidatePath("/portfolio");
  revalidatePath(`/portfolio/${project.slug}`);
  return toRow(project);
}

export async function updateProject(id: number, input: ProjectInput) {
  const project = await prisma.project.update({
    where: { id },
    data: {
      slug: input.slug,
      title: input.title,
      summary: input.summary,
      description: input.description,
      status: input.status,
      category: input.category,
      clientName: input.clientName,
      clientContact: input.clientContact ?? null,
      clientIndustry: input.clientIndustry ?? null,
      costKes: input.costKes ?? null,
      durationWeeks: input.durationWeeks ?? null,
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null,
      processes: input.processes,
      technologies: input.technologies,
      coverImage: input.coverImage ?? null,
      galleryImages: input.galleryImages,
      featured: input.featured,
      published: input.published,
    },
  });
  revalidatePath("/admin");
  revalidatePath("/portfolio");
  revalidatePath(`/portfolio/${project.slug}`);
  return toRow(project);
}

export async function deleteProject(id: number) {
  const project = await prisma.project.findUnique({ where: { id } });
  await prisma.project.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/portfolio");
  if (project) revalidatePath(`/portfolio/${project.slug}`);
}