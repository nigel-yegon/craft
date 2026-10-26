// app/admin/projects/projects-panel.tsx
"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Briefcase, Plus, X } from "lucide-react";

import {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
  type ProjectRow,
  type ProjectInput,
  type ProjectStatus,
} from "../actions/projects";

// ─── Styles ──────────────────────────────────────────────────────

const inputClass =
  "w-full rounded-xl border border-deep-200 bg-cream-100 px-3.5 py-3 text-sm text-deep-800 outline-none transition placeholder:text-deep-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15 dark:border-deep-800 dark:bg-deep-950 dark:text-cream-100 dark:placeholder:text-cream-500";

const STATUS_PILL: Record<ProjectStatus, string> = {
  PLANNED: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  IN_PROGRESS: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  ON_HOLD: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
  ARCHIVED: "bg-deep-200 text-deep-700 dark:bg-deep-800 dark:text-cream-300",
};

const STATUS_LABEL: Record<ProjectStatus, string> = {
  PLANNED: "Planned",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  ON_HOLD: "On hold",
  ARCHIVED: "Archived",
};

const CATEGORIES = ["Brand", "Digital", "Spaces", "Campaigns", "Print"];

// ─── Panel ────────────────────────────────────────────────────────

export function ProjectsPanel({ search = "" }: { search?: string }) {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<ProjectRow | null>(null);
  const [creating, setCreating] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      setProjects(await listProjects());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) =>
      [p.title, p.clientName, p.category, p.status, p.summary]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [projects, search]);

  function handleDelete(id: number) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    startTransition(async () => {
      try {
        await deleteProject(id);
        await refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete");
      }
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              <Briefcase className="h-4 w-4" />
            </span>
            <h2 className="text-xl font-bold text-rose-700 dark:text-rose-300">
              Portfolio
            </h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-deep-600 dark:text-cream-400">
            Projects shown on the public portfolio. Add projects, edit details,
            and control what&apos;s published.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:opacity-60"
        >
          <Plus size={16} />
          New project
        </button>
      </div>

      {/* Loading */}
      {loading && projects.length === 0 && (
        <div className="h-24 animate-pulse rounded-2xl bg-cream-50 dark:bg-deep-900" />
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-deep-200 p-10 text-center text-sm text-deep-500 dark:border-deep-800 dark:text-cream-500">
          {projects.length === 0
            ? "No projects yet. Add your first project above."
            : "No projects match your search."}
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl border border-deep-200 bg-cream-50 p-5 dark:border-deep-800 dark:bg-deep-900"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-deep-800 dark:text-cream-100">
                    {p.title}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_PILL[p.status]}`}
                  >
                    {STATUS_LABEL[p.status]}
                  </span>
                  {!p.published && (
                    <span className="rounded-full bg-deep-200 px-2 py-0.5 text-[10px] font-bold uppercase text-deep-600 dark:bg-deep-800 dark:text-cream-400">
                      Draft
                    </span>
                  )}
                  {p.featured && (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      Featured
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-deep-500 dark:text-cream-500">
                  {p.clientName} · {p.category}
                  {p.durationWeeks ? ` · ${p.durationWeeks} weeks` : ""}
                  {p.costKes ? ` · KES ${p.costKes.toLocaleString()}` : ""}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-deep-600 dark:text-cream-400">
                  {p.summary}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(p)}
                  disabled={pending}
                  className="rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  disabled={pending}
                  className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Editors */}
      {creating && (
        <ProjectEditor
          mode="create"
          onClose={() => setCreating(false)}
          onSaved={async () => {
            setCreating(false);
            await refresh();
          }}
        />
      )}

      {editing && (
        <ProjectEditor
          mode="edit"
          project={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await refresh();
          }}
        />
      )}
    </div>
  );
}

// ─── Editor dialog ────────────────────────────────────────────────

function ProjectEditor({
  mode,
  project,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  project?: ProjectRow;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState<ProjectInput>({
    title: project?.title ?? "",
    slug: project?.slug ?? "",
    summary: project?.summary ?? "",
    description: project?.description ?? "",
    status: project?.status ?? "PLANNED",
    category: project?.category ?? "Brand",
    clientName: project?.clientName ?? "",
    clientContact: project?.clientContact ?? "",
    clientIndustry: project?.clientIndustry ?? "",
    costKes: project?.costKes ?? undefined,
    durationWeeks: project?.durationWeeks ?? undefined,
    startDate: project?.startDate?.slice(0, 10) ?? "",
    endDate: project?.endDate?.slice(0, 10) ?? "",
    processes: project?.processes ?? [],
    technologies: project?.technologies ?? [],
    coverImage: project?.coverImage ?? "",
    galleryImages: project?.galleryImages ?? [],
    featured: project?.featured ?? false,
    published: project?.published ?? false,
  });

  const [pending, startTransition] = useTransition();

  function set<K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    startTransition(async () => {
      try {
        if (mode === "create") {
          await createProject(form);
        } else if (project) {
          await updateProject(project.id, form);
        }
        await onSaved();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-deep-950/40 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-3xl rounded-2xl border border-deep-200 bg-cream-50 shadow-2xl dark:border-deep-800 dark:bg-deep-900">
        <div className="flex items-center justify-between border-b border-deep-200 px-5 py-4 dark:border-deep-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
              {mode === "create" ? "New project" : "Edit project"}
            </p>
            <h3 className="mt-1 text-lg font-bold text-deep-800 dark:text-cream-100">
              {mode === "create" ? "Add to portfolio" : form.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-deep-500 transition hover:text-deep-800 dark:text-cream-500 dark:hover:text-cream-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {/* Identity */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Title">
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Slug">
              <input
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="mara-rebrand-2026"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Summary (listing teaser)">
            <textarea
              value={form.summary}
              onChange={(e) => set("summary", e.target.value)}
              rows={2}
              className={inputClass}
            />
          </Field>

          <Field label="Description (slug page body)">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={6}
              className={inputClass}
            />
          </Field>

          {/* Classification */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as ProjectStatus)}
                className={inputClass}
              >
                {(Object.keys(STATUS_LABEL) as ProjectStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Client */}
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Client name">
              <input
                value={form.clientName}
                onChange={(e) => set("clientName", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Client contact (optional)">
              <input
                value={form.clientContact}
                onChange={(e) => set("clientContact", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Client industry (optional)">
              <input
                value={form.clientIndustry}
                onChange={(e) => set("clientIndustry", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          {/* Commercial */}
          <div className="grid gap-3 sm:grid-cols-4">
            <Field label="Cost (KES)">
              <input
                type="number"
                value={form.costKes ?? ""}
                onChange={(e) =>
                  set(
                    "costKes",
                    e.target.value === "" ? undefined : Number(e.target.value),
                  )
                }
                className={inputClass}
              />
            </Field>
            <Field label="Duration (weeks)">
              <input
                type="number"
                value={form.durationWeeks ?? ""}
                onChange={(e) =>
                  set(
                    "durationWeeks",
                    e.target.value === "" ? undefined : Number(e.target.value),
                  )
                }
                className={inputClass}
              />
            </Field>
            <Field label="Start date">
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="End date">
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          {/* Narrative */}
          <Field label="Processes (one per line)">
            <textarea
              value={form.processes.join("\n")}
              onChange={(e) =>
                set(
                  "processes",
                  e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                )
              }
              rows={3}
              placeholder={"Discovery\nBrand strategy\nDesign system"}
              className={inputClass}
            />
          </Field>

          <Field label="Technologies (one per line)">
            <textarea
              value={form.technologies.join("\n")}
              onChange={(e) =>
                set(
                  "technologies",
                  e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                )
              }
              rows={3}
              placeholder={"Next.js\nFigma\nShopify"}
              className={inputClass}
            />
          </Field>

          {/* Media */}
          <Field label="Cover image URL">
            <input
              value={form.coverImage}
              onChange={(e) => set("coverImage", e.target.value)}
              placeholder="/images/projects/…"
              className={inputClass}
            />
          </Field>

          <Field label="Gallery images (one URL per line)">
            <textarea
              value={form.galleryImages.join("\n")}
              onChange={(e) =>
                set(
                  "galleryImages",
                  e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                )
              }
              rows={3}
              className={inputClass}
            />
          </Field>

          {/* Toggles */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-xl border border-deep-200 bg-cream-100 px-3.5 py-3 text-sm dark:border-deep-800 dark:bg-deep-950">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="h-4 w-4 rounded border-deep-300 focus:ring-2 focus:ring-rose-500/30"
              />
              <span className="text-deep-700 dark:text-cream-200">
                Featured on homepage
              </span>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-deep-200 bg-cream-100 px-3.5 py-3 text-sm dark:border-deep-800 dark:bg-deep-950">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => set("published", e.target.checked)}
                className="h-4 w-4 rounded border-deep-300 focus:ring-2 focus:ring-rose-500/30"
              />
              <span className="text-deep-700 dark:text-cream-200">
                Published (visible on public site)
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-deep-200 px-5 py-4 dark:border-deep-800">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-xl border border-deep-200 px-4 py-2.5 text-sm font-semibold text-deep-600 transition hover:bg-cream-100 disabled:opacity-60 dark:border-deep-800 dark:text-cream-400 dark:hover:bg-deep-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={pending || !form.title || !form.slug || !form.clientName}
            className="rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:opacity-60"
          >
            {pending
              ? "Saving…"
              : mode === "create"
                ? "Create project"
                : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-deep-700 dark:text-cream-300">
        {label}
      </span>
      {children}
    </label>
  );
}