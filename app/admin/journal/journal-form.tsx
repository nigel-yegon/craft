"use client";

import { useState } from "react";
import { JOURNAL_CATEGORIES } from "../actions/journal";
import type { JournalRow, JournalInput } from "../actions/journal";

const inputClass =
  "w-full rounded-xl border border-deep-200 bg-cream-100 px-3 py-2 text-sm " +
  "text-deep-800 outline-none transition placeholder:text-deep-400 " +
  "focus:bg-cream-50 focus:ring-2 focus:ring-brand-500/20 " +
  "dark:border-deep-700 dark:bg-deep-950 dark:text-cream-100 " +
  "dark:placeholder:text-cream-400 dark:focus:bg-deep-950 dark:[color-scheme:dark]";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function JournalForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: JournalRow | null;
  onSubmit: (data: JournalInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugLocked, setSlugLocked] = useState(!!initial);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl ?? "");
  const [galleryStr, setGalleryStr] = useState((initial?.galleryUrls ?? []).join("\n"));
  const [category, setCategory] = useState(initial?.category ?? "STUDIO");
  const [tagsStr, setTagsStr] = useState((initial?.tags ?? []).join(", "));
  const [readTime, setReadTime] = useState(initial?.readTimeMinutes?.toString() ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [published, setPublished] = useState(initial?.published ?? false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onSubmit({
        slug,
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        excerpt: excerpt.trim(),
        content: content.trim(),
        coverImageUrl: coverImageUrl.trim() || null,
        galleryUrls: galleryStr.split("\n").map((s) => s.trim()).filter(Boolean),
        category: category as any,
        tags: tagsStr.split(",").map((s) => s.trim()).filter(Boolean),
        readTimeMinutes: readTime ? parseInt(readTime, 10) : null,
        featured,
        published,
        publishedAt: published ? new Date().toISOString() : null,
      });
    } catch (e: any) {
      setError(e?.message ?? "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Title *">
        <input
          required
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slugLocked) setSlug(slugify(e.target.value));
          }}
          className={inputClass}
        />
      </Field>

      <Field label="Slug *">
        <input
          required
          value={slug}
          onChange={(e) => { setSlugLocked(true); setSlug(slugify(e.target.value)); }}
          className={`${inputClass} font-mono`}
        />
      </Field>

      <Field label="Subtitle (dek)">
        <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputClass} />
      </Field>

      <Field label="Excerpt (teaser shown on listing page) *">
        <textarea required value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} maxLength={500} className={`${inputClass} resize-y`} />
      </Field>

      <Field label="Content (markdown supported) *">
        <textarea required value={content} onChange={(e) => setContent(e.target.value)} rows={16} className={`${inputClass} resize-y font-mono`} />
      </Field>

      <Field label="Cover image URL">
        <input type="url" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} className={inputClass} />
      </Field>

      <Field label="Gallery image URLs (one per line)">
        <textarea value={galleryStr} onChange={(e) => setGalleryStr(e.target.value)} rows={3} className={`${inputClass} resize-y font-mono`} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Category *">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
            {JOURNAL_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.replace("_", " ")}</option>
            ))}
          </select>
        </Field>
        <Field label="Read time (minutes)">
          <input type="number" value={readTime} onChange={(e) => setReadTime(e.target.value)} className={inputClass} />
        </Field>
      </div>

      <Field label="Tags (comma-separated)">
        <input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} className={inputClass} />
      </Field>

      <div className="flex gap-4 pt-2">
        <label className="flex items-center gap-2 text-sm text-deep-700 dark:text-cream-300">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4" />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-deep-700 dark:text-cream-300">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4" />
          Publish
        </label>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} disabled={busy} className="rounded-xl border border-deep-200 px-4 py-2 text-sm font-semibold text-deep-700 hover:bg-cream-200 dark:border-deep-700 dark:text-cream-300 dark:hover:bg-deep-800">
          Cancel
        </button>
        <button type="submit" disabled={busy} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
          {busy ? "Saving…" : initial ? "Save changes" : "Create post"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-deep-500 dark:text-cream-400">
        {label}
      </span>
      {children}
    </label>
  );
}