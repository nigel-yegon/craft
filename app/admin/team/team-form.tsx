"use client";

import { useState } from "react";
import type { TeamRow, TeamInput } from "../actions/team";

const inputClass =
  "w-full rounded-xl border border-deep-200 bg-cream-100 px-3 py-2 text-sm " +
  "text-deep-800 outline-none transition placeholder:text-deep-400 " +
  "focus:bg-cream-50 focus:ring-2 focus:ring-brand-500/20 " +
  "dark:border-deep-700 dark:bg-deep-950 dark:text-cream-100 " +
  "dark:placeholder:text-cream-400 dark:focus:bg-deep-950";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function TeamForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: TeamRow | null;
  onSubmit: (data: TeamInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugLocked, setSlugLocked] = useState(!!initial);
  const [name, setName] = useState(initial?.name ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [shortBio, setShortBio] = useState(initial?.shortBio ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [expertiseStr, setExpertiseStr] = useState((initial?.expertise ?? []).join(", "));
  const [disciplinesStr, setDisciplinesStr] = useState((initial?.disciplines ?? []).join(", "));
  const [linkedinUrl, setLinkedinUrl] = useState(initial?.linkedinUrl ?? "");
  const [githubUrl, setGithubUrl] = useState(initial?.githubUrl ?? "");
  const [twitterUrl, setTwitterUrl] = useState(initial?.twitterUrl ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(initial?.websiteUrl ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [yearsExperience, setYearsExperience] = useState(
    initial?.yearsExperience?.toString() ?? ""
  );
  const [joinedAt, setJoinedAt] = useState(initial?.joinedAt?.slice(0, 10) ?? "");
  const [sortOrder, setSortOrder] = useState((initial?.sortOrder ?? 0).toString());
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [published, setPublished] = useState(initial?.published ?? true);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onSubmit({
        slug,
        name: name.trim(),
        role: role.trim(),
        bio: bio.trim(),
        shortBio: shortBio.trim() || null,
        photoUrl: photoUrl.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        expertise: expertiseStr.split(",").map((s) => s.trim()).filter(Boolean),
        disciplines: disciplinesStr.split(",").map((s) => s.trim()).filter(Boolean),
        linkedinUrl: linkedinUrl.trim() || null,
        githubUrl: githubUrl.trim() || null,
        twitterUrl: twitterUrl.trim() || null,
        websiteUrl: websiteUrl.trim() || null,
        joinedAt: joinedAt ? new Date(joinedAt).toISOString() : null,
        location: location.trim() || null,
        yearsExperience: yearsExperience ? parseInt(yearsExperience, 10) : null,
        sortOrder: parseInt(sortOrder, 10) || 0,
        featured,
        published,
      });
    } catch (e: any) {
      setError(e?.message ?? "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Name *">
        <input
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugLocked) setSlug(slugify(e.target.value));
          }}
          className={inputClass}
        />
      </Field>

      <Field label="Slug *">
        <input
          required
          value={slug}
          onChange={(e) => {
            setSlugLocked(true);
            setSlug(slugify(e.target.value));
          }}
          className={`${inputClass} font-mono`}
        />
      </Field>

      <Field label="Role *">
        <input
          required
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Design Lead"
          className={inputClass}
        />
      </Field>

      <Field label="Short bio (teaser, 1–2 sentences)">
        <input
          value={shortBio}
          onChange={(e) => setShortBio(e.target.value)}
          maxLength={300}
          className={inputClass}
        />
      </Field>

      <Field label="Full bio (markdown supported) *">
        <textarea
          required
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={6}
          className={`${inputClass} resize-y`}
        />
      </Field>

      <Field label="Photo URL">
        <input
          type="url"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Phone">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Expertise (comma-separated)">
        <input
          value={expertiseStr}
          onChange={(e) => setExpertiseStr(e.target.value)}
          placeholder="Brand strategy, Typography, Motion design"
          className={inputClass}
        />
      </Field>

      <Field label="Disciplines (comma-separated)">
        <input
          value={disciplinesStr}
          onChange={(e) => setDisciplinesStr(e.target.value)}
          placeholder="architecture, interiors, software, delivery"
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="LinkedIn URL">
          <input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className={inputClass} />
        </Field>
        <Field label="GitHub URL">
          <input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Twitter/X URL">
          <input value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Personal website">
          <input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className={inputClass} />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Location">
          <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Years experience">
          <input type="number" value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Joined at">
          <input type="date" value={joinedAt} onChange={(e) => setJoinedAt(e.target.value)} className={inputClass} />
        </Field>
      </div>

      <Field label="Sort order (lower = first)">
        <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className={inputClass} />
      </Field>

      <div className="flex gap-4 pt-2">
        <label className="flex items-center gap-2 text-sm text-deep-700 dark:text-cream-300">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4" />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-deep-700 dark:text-cream-300">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4" />
          Published
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
          {busy ? "Saving…" : initial ? "Save changes" : "Create member"}
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