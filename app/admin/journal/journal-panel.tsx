"use client";

import { useEffect, useState } from "react";
import {
  listJournal,
  createJournal,
  updateJournal,
  deleteJournal,
  toggleJournalPublished,
  toggleJournalFeatured,
  type JournalRow,
} from "../actions/journal";
import { JournalForm } from "./journal-form";

const CAT_TONE: Record<string, string> = {
  STUDIO: "bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-200",
  PROCESS: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  TECH: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  CASE_STUDY: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
  CULTURE: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
  ANNOUNCEMENT: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
};

export function JournalPanel({ search = "" }: { search?: string }) {
  const [items, setItems] = useState<JournalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<JournalRow | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "featured">("all");

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listJournal({ search: search || undefined }));
    } catch (e: any) {
      setError(e?.message ?? "Failed to load journal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const filtered = items.filter((p) => {
    if (filter === "published") return p.published;
    if (filter === "draft") return !p.published;
    if (filter === "featured") return p.featured;
    return true;
  });

  const handleCreate = async (data: any) => {
    await createJournal(data);
    setShowForm(false);
    await refresh();
  };

  const handleUpdate = async (data: any) => {
    if (!editing) return;
    await updateJournal(editing.id, data);
    setEditing(null);
    await refresh();
  };

  const handleDelete = async (post: JournalRow) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    try {
      await deleteJournal(post.id);
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete");
    }
  };

  const filters = [
    { key: "all", label: "All" },
    { key: "published", label: "Published" },
    { key: "draft", label: "Drafts" },
    { key: "featured", label: "Featured" },
  ] as const;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
              <BookIcon />
            </span>
            <h2 className="text-xl font-bold text-sky-700 dark:text-sky-300">Journal</h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-deep-600 dark:text-cream-400">
            Long-form articles on{" "}
            <a href="/studio/journal" target="_blank" className="text-brand-600 underline">/studio/journal</a>.
            Write in markdown, publish when ready.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
        >
          + New post
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={[
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
              filter === f.key
                ? "border-sky-500 bg-sky-600 text-white"
                : "border-deep-200 text-deep-600 hover:border-sky-400 hover:text-sky-700 dark:border-deep-800 dark:text-cream-400",
            ].join(" ")}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-deep-500 dark:text-cream-400">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-deep-200 bg-cream-50 p-12 text-center dark:border-deep-800 dark:bg-deep-900">
          <p className="text-sm text-deep-500 dark:text-cream-400">
            No journal posts yet. Click + New post to write the first one.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-2xl border border-deep-200 bg-cream-50 p-4 hover:border-sky-400 dark:border-deep-800 dark:bg-deep-900">
              <div className="flex items-start gap-4">
                {p.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverImageUrl} alt="" className="h-20 w-28 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-20 w-28 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                    <BookIcon />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${CAT_TONE[p.category] ?? ""}`}>
                      {p.category.replace("_", " ")}
                    </span>
                    {!p.published && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-200">DRAFT</span>}
                    {p.featured && <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-800 dark:bg-brand-950 dark:text-brand-200">FEATURED</span>}
                    {p.readTimeMinutes && <span className="text-[10px] text-deep-500 dark:text-cream-500">{p.readTimeMinutes} min read</span>}
                  </div>
                  <h3 className="mt-1 truncate font-bold text-deep-800 dark:text-cream-100">{p.title}</h3>
                  <p className="line-clamp-2 text-sm text-deep-600 dark:text-cream-400">{p.excerpt}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <button onClick={() => setEditing(p)} className="rounded-lg px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/40">
                      Edit
                    </button>
                    <button onClick={() => toggleJournalPublished(p.id, !p.published).then(refresh)} className="rounded-lg px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40">
                      {p.published ? "Unpublish" : "Publish"}
                    </button>
                    <button onClick={() => toggleJournalFeatured(p.id, !p.featured).then(refresh)} className="rounded-lg px-2 py-1 text-xs font-medium text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-950/40">
                      {p.featured ? "Unfeature" : "Feature"}
                    </button>
                    <button onClick={() => handleDelete(p)} className="ml-auto rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showForm || editing) && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-deep-950/40 p-6 backdrop-blur-sm">
          <div className="my-8 w-full max-w-3xl rounded-2xl border border-deep-200 bg-cream-50 p-6 dark:border-deep-800 dark:bg-deep-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-deep-800 dark:text-cream-100">
                {editing ? "Edit post" : "New journal post"}
              </h3>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-deep-500 hover:text-deep-800 dark:text-cream-500">✕</button>
            </div>
            <JournalForm
              initial={editing}
              onSubmit={editing ? handleUpdate : handleCreate}
              onCancel={() => { setShowForm(false); setEditing(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}