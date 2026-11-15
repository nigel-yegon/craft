"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export type TeamRow = {
  id: number;
  slug: string;
  name: string;
  role: string;
  bio: string;
  shortBio: string | null;
  photoUrl: string | null;
  email: string | null;
  phone: string | null;
  expertise: string[];
  disciplines: string[];
  linkedinUrl: string | null;
  githubUrl: string | null;
  twitterUrl: string | null;
  websiteUrl: string | null;
  joinedAt: string | null;
  location: string | null;
  yearsExperience: number | null;
  sortOrder: number;
  featured: boolean;
  published: boolean;
};

const teamInputSchema = z.object({
  slug: z.string().min(1).max(80).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  name: z.string().min(1).max(120),
  role: z.string().min(1).max(120),
  bio: z.string().min(1).max(8000),
  shortBio: z.string().max(300).nullable().optional(),
  photoUrl: z.string().url().nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  expertise: z.array(z.string()).default([]),
  disciplines: z.array(z.string()).default([]),
  linkedinUrl: z.string().url().nullable().optional(),
  githubUrl: z.string().url().nullable().optional(),
  twitterUrl: z.string().url().nullable().optional(),
  websiteUrl: z.string().url().nullable().optional(),
  joinedAt: z.string().datetime().nullable().optional(),
  location: z.string().max(120).nullable().optional(),
  yearsExperience: z.number().int().min(0).max(80).nullable().optional(),
  sortOrder: z.number().int().default(0),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
});

export type TeamInput = z.infer<typeof teamInputSchema>;

function toRow(r: any): TeamRow {
  return {
    ...r,
    joinedAt: r.joinedAt?.toISOString() ?? null,
  };
}

export async function listTeam(opts: { search?: string } = {}): Promise<TeamRow[]> {
  const where = opts.search?.trim()
    ? {
        OR: [
          { name: { contains: opts.search, mode: "insensitive" as const } },
          { role: { contains: opts.search, mode: "insensitive" as const } },
          { bio: { contains: opts.search, mode: "insensitive" as const } },
        ],
      }
    : {};
  const rows = await prisma.teamMember.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return rows.map(toRow);
}

export async function createTeamMember(input: TeamInput): Promise<TeamRow> {
  const data = teamInputSchema.parse(input);
  const row = await prisma.teamMember.create({
    data: {
      ...data,
      joinedAt: data.joinedAt ? new Date(data.joinedAt) : null,
    },
  });
  revalidatePath("/studio/team");
  revalidatePath(`/studio/team/${row.slug}`);
  return toRow(row);
}

export async function updateTeamMember(
  id: number,
  input: Partial<TeamInput>
): Promise<TeamRow> {
  const partial = teamInputSchema.partial().parse(input);
  const row = await prisma.teamMember.update({
    where: { id },
    data: {
      ...partial,
      joinedAt: partial.joinedAt !== undefined
        ? partial.joinedAt ? new Date(partial.joinedAt) : null
        : undefined,
    },
  });
  revalidatePath("/studio/team");
  revalidatePath(`/studio/team/${row.slug}`);
  return toRow(row);
}

export async function deleteTeamMember(id: number): Promise<void> {
  const row = await prisma.teamMember.delete({ where: { id } });
  revalidatePath("/studio/team");
  revalidatePath(`/studio/team/${row.slug}`);
}

export async function toggleTeamPublished(id: number, published: boolean): Promise<TeamRow> {
  const row = await prisma.teamMember.update({ where: { id }, data: { published } });
  revalidatePath("/studio/team");
  return toRow(row);
}

export async function toggleTeamFeatured(id: number, featured: boolean): Promise<TeamRow> {
  const row = await prisma.teamMember.update({ where: { id }, data: { featured } });
  revalidatePath("/studio/team");
  return toRow(row);
}