"use client";

import { useEffect, useState } from "react";
import {
  listTeam,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  toggleTeamPublished,
  toggleTeamFeatured,
  type TeamRow,
} from "../actions/team";
import { TeamForm } from "./team-form";

export function TeamPanel({ search = "" }: { search?: string }) {
  const [items, setItems] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TeamRow | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "featured">("all");

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listTeam({ search: search || undefined }));
    } catch (e: any) {
      setError(e?.message ?? "Failed to load team");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const filtered = items.filter((m) => {
    if (filter === "published") return m.published;
    if (filter === "draft") return !m.published;
    if (filter === "featured") return m.featured;
    return true;
  });

  const handleCreate = async (data: any) => {
    await createTeamMember(data);
    setShowForm(false);
    await refresh();
  };

  const handleUpdate = async (data: any) => {
    if (!editing) return;
    await updateTeamMember(editing.id, data);
    setEditing(null);
    await refresh();
  };

  const handleDelete = async (member: TeamRow) => {
    if (!confirm(`Delete ${member.name}? This removes their profile and unlinks any journal posts.`)) return;
    try {
      await deleteTeamMember(member.id);
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
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              <UsersIcon />
            </span>
            <h2 className="text-xl font-bold text-rose-700 dark:text-rose-300">Team</h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-deep-600 dark:text-cream-400">
            Manage team member profiles shown on{" "}
            <a href="/studio/team" target="_blank" className="text-brand-600 underline">/studio/team</a>.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
        >
          + New member
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
                ? "border-rose-500 bg-rose-600 text-white"
                : "border-deep-200 text-deep-600 hover:border-rose-400 hover:text-rose-700 dark:border-deep-800 dark:text-cream-400",
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
            No team members yet. Click + New member to add the first one.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <div key={m.id} className="group rounded-2xl border border-deep-200 bg-cream-50 p-4 transition hover:border-rose-400 dark:border-deep-800 dark:bg-deep-900">
              <div className="flex items-start gap-3">
                {m.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photoUrl} alt={m.name} className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                    {m.name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-deep-800 dark:text-cream-100">{m.name}</p>
                  <p className="text-xs text-deep-600 dark:text-cream-400">{m.role}</p>
                  {m.location && <p className="mt-1 text-[11px] text-deep-500 dark:text-cream-500">{m.location}</p>}
                </div>
              </div>

              {m.expertise.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {m.expertise.slice(0, 3).map((e) => (
                    <span key={e} className="rounded-full bg-cream-200 px-2 py-0.5 text-[10px] text-deep-600 dark:bg-deep-800 dark:text-cream-400">
                      {e}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-deep-100 pt-3 dark:border-deep-800">
                {!m.published && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-200">DRAFT</span>}
                {m.featured && <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-800 dark:bg-brand-950 dark:text-brand-200">FEATURED</span>}
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                <button onClick={() => setEditing(m)} className="rounded-lg px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/40">
                  Edit
                </button>
                <button onClick={() => toggleTeamPublished(m.id, !m.published).then(refresh)} className="rounded-lg px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40">
                  {m.published ? "Unpublish" : "Publish"}
                </button>
                <button onClick={() => toggleTeamFeatured(m.id, !m.featured).then(refresh)} className="rounded-lg px-2 py-1 text-xs font-medium text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-950/40">
                  {m.featured ? "Unfeature" : "Feature"}
                </button>
                <button onClick={() => handleDelete(m)} className="ml-auto rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showForm || editing) && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-deep-950/40 p-6 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl rounded-2xl border border-deep-200 bg-cream-50 p-6 dark:border-deep-800 dark:bg-deep-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-deep-800 dark:text-cream-100">
                {editing ? "Edit member" : "New team member"}
              </h3>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-deep-500 hover:text-deep-800 dark:text-cream-500">✕</button>
            </div>
            <TeamForm
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

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}