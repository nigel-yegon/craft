"use server";

import { prisma } from "@/lib/prisma";

export type PublicJournalPost = {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  galleryUrls: string[];
  category: string;
  tags: string[];
  readTimeMinutes: number | null;
  featured: boolean;
  publishedAt: string | null;
  author: {
    slug: string;
    name: string;
    role: string;
    photoUrl: string | null;
  } | null;
};

type RawPost = {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  galleryUrls: string[];
  category: string;
  tags: string[];
  readTimeMinutes: number | null;
  featured: boolean;
  publishedAt: Date | null;
  author: { slug: string; name: string; role: string; photoUrl: string | null } | null;
};

function toPost(p: RawPost): PublicJournalPost {
  return { ...p, publishedAt: p.publishedAt?.toISOString() ?? null };
}

export async function listJournalPosts(opts?: {
  category?: string;
  limit?: number;
}): Promise<PublicJournalPost[]> {
  const where: any = { published: true };
  if (opts?.category) where.category = opts.category;

  const rows = await prisma.journalPost.findMany({
    where,
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take: opts?.limit ?? 50,
    include: {
      author: { select: { slug: true, name: true, role: true, photoUrl: true } },
    },
  });
  return rows.map(toPost);
}

export async function getJournalPostBySlug(
  slug: string
): Promise<PublicJournalPost | null> {
  const row = await prisma.journalPost.findUnique({
    where: { slug },
    include: {
      author: { select: { slug: true, name: true, role: true, photoUrl: true } },
    },
  });
  return row && row.published ? toPost(row) : null;
}