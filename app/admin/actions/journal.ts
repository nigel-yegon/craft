"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { JOURNAL_CATEGORIES, type JournalCategory } from "./journal-constants";

export type JournalRow = {
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
  authorId: number | null;
  readTimeMinutes: number | null;
  featured: boolean;
  published: boolean;
  publishedAt: string | null;
};

const journalInputSchema = z.object({
  slug: z.string().min(1).max(120).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300).nullable().optional(),
  excerpt: z.string().min(1).max(500),
  content: z.string().min(1),
  coverImageUrl: z.string().url().nullable().optional(),
  galleryUrls: z.array(z.string().url()).default([]),
  category: z.enum(JOURNAL_CATEGORIES),
  tags: z.array(z.string()).default([]),
  authorId: z.number().int().nullable().optional(),
  readTimeMinutes: z.number().int().min(1).max(300).nullable().optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  publishedAt: z.string().datetime().nullable().optional(),
});

export type JournalInput = z.infer<typeof journalInputSchema>;

function toRow(r: any): JournalRow {
  return { ...r, publishedAt: r.publishedAt?.toISOString() ?? null };
}

export async function listJournal(opts: { search?: string } = {}): Promise<JournalRow[]> {
  const where = opts.search?.trim()
    ? {
        OR: [
          { title: { contains: opts.search, mode: "insensitive" as const } },
          { excerpt: { contains: opts.search, mode: "insensitive" as const } },
          { slug: { contains: opts.search, mode: "insensitive" as const } },
        ],
      }
    : {};
  const rows = await prisma.journalPost.findMany({
    where,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(toRow);
}

export async function getJournal(id: number): Promise<JournalRow | null> {
  const row = await prisma.journalPost.findUnique({ where: { id } });
  return row ? toRow(row) : null;
}

export async function createJournal(input: JournalInput): Promise<JournalRow> {
  const data = journalInputSchema.parse(input);
  const row = await prisma.journalPost.create({
    data: {
      ...data,
      authorId: data.authorId ?? null,
      publishedAt: data.publishedAt
        ? new Date(data.publishedAt)
        : data.published ? new Date() : null,
    },
  });
  revalidatePath("/studio/journal");
  revalidatePath(`/studio/journal/${row.slug}`);
  return toRow(row);
}

export async function updateJournal(
  id: number,
  input: Partial<JournalInput>
): Promise<JournalRow> {
  const partial = journalInputSchema.partial().parse(input);
  const row = await prisma.journalPost.update({
    where: { id },
    data: {
      ...partial,
      authorId: partial.authorId !== undefined ? partial.authorId ?? null : undefined,
      publishedAt: partial.publishedAt !== undefined
        ? partial.publishedAt ? new Date(partial.publishedAt) : null
        : undefined,
    },
  });
  revalidatePath("/studio/journal");
  revalidatePath(`/studio/journal/${row.slug}`);
  return toRow(row);
}

export async function deleteJournal(id: number): Promise<void> {
  const row = await prisma.journalPost.delete({ where: { id } });
  revalidatePath("/studio/journal");
  revalidatePath(`/studio/journal/${row.slug}`);
}

export async function toggleJournalPublished(id: number, published: boolean): Promise<JournalRow> {
  const row = await prisma.journalPost.update({
    where: { id },
    data: {
      published,
      publishedAt: published && !(await prisma.journalPost.findUnique({ where: { id } }))?.publishedAt
        ? new Date()
        : undefined,
    },
  });
  revalidatePath("/studio/journal");
  return toRow(row);
}

export async function toggleJournalFeatured(id: number, featured: boolean): Promise<JournalRow> {
  const row = await prisma.journalPost.update({ where: { id }, data: { featured } });
  revalidatePath("/studio/journal");
  return toRow(row);
}

export { JOURNAL_CATEGORIES };