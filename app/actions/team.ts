"use server";

import { prisma } from "@/lib/prisma";

export type PublicTeamMember = {
  id: number;
  slug: string;
  name: string;
  role: string;
  shortBio: string | null;
  bio: string;
  photoUrl: string | null;
  expertise: string[];
  disciplines: string[];
  linkedinUrl: string | null;
  githubUrl: string | null;
  twitterUrl: string | null;
  websiteUrl: string | null;
  location: string | null;
  yearsExperience: number | null;
  featured: boolean;
};

export async function listTeamMembers(): Promise<PublicTeamMember[]> {
  const rows = await prisma.teamMember.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return rows as PublicTeamMember[];
}

export async function getTeamMemberBySlug(
  slug: string
): Promise<PublicTeamMember | null> {
  const row = await prisma.teamMember.findUnique({ where: { slug } });
  return row && row.published ? (row as PublicTeamMember) : null;
}