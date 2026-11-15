import { notFound } from "next/navigation";
import Link from "next/link";
import { getTeamMemberBySlug } from "@/app/actions/team";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const member = await getTeamMemberBySlug(slug);
  if (!member) return { title: "Not found — Craft Studios" };
  return {
    title: `${member.name} — ${member.role} — Craft Studios`,
    description: member.shortBio ?? `${member.name}, ${member.role} at Craft Studios.`,
  };
}

export default async function TeamMemberPage({ params }: Props) {
  const { slug } = await params;
  const member = await getTeamMemberBySlug(slug);
  if (!member) notFound();

  return (
    <div className="min-h-screen bg-cream-200 dark:bg-deep-950">
      <section className="border-b border-deep-200 bg-cream-100 py-16 dark:border-deep-800 dark:bg-deep-900">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <Link
            href="/studio/team"
            className="text-xs font-medium text-deep-500 hover:text-deep-800 dark:text-cream-500"
          >
            ← Back to team
          </Link>
          <div className="mt-6 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            {member.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.photoUrl}
                alt={member.name}
                className="h-32 w-32 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-brand-100 text-4xl font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                {member.name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-deep-800 dark:text-cream-100">
                {member.name}
              </h1>
              <p className="mt-1 text-base font-medium text-brand-600 dark:text-brand-400">
                {member.role}
              </p>
              {member.location && (
                <p className="mt-1 text-sm text-deep-500 dark:text-cream-500">
                  {member.location}
                </p>
              )}
              {member.yearsExperience && (
                <p className="text-sm text-deep-500 dark:text-cream-500">
                  {member.yearsExperience} years of experience
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <article className="prose prose-slate max-w-none lg:col-span-2 dark:prose-invert">
            <div className="whitespace-pre-wrap text-base leading-7 text-deep-700 dark:text-cream-300">
              {member.bio}
            </div>
          </article>

          <aside className="space-y-6">
            {member.expertise.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-deep-500 dark:text-cream-500">
                  Expertise
                </h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {member.expertise.map((e) => (
                    <span
                      key={e}
                      className="rounded-full bg-cream-100 px-2.5 py-1 text-xs font-medium text-deep-700 dark:bg-deep-900 dark:text-cream-300"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {member.disciplines.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-deep-500 dark:text-cream-500">
                  Disciplines
                </h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {member.disciplines.map((d) => (
                    <span
                      key={d}
                      className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-950/40 dark:text-brand-300"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(member.linkedinUrl || member.githubUrl || member.twitterUrl || member.websiteUrl) && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-deep-500 dark:text-cream-500">
                  Links
                </h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {member.linkedinUrl && (
                    <li><a href={member.linkedinUrl} target="_blank" rel="noreferrer" className="text-brand-600 underline">LinkedIn</a></li>
                  )}
                  {member.githubUrl && (
                    <li><a href={member.githubUrl} target="_blank" rel="noreferrer" className="text-brand-600 underline">GitHub</a></li>
                  )}
                  {member.twitterUrl && (
                    <li><a href={member.twitterUrl} target="_blank" rel="noreferrer" className="text-brand-600 underline">Twitter / X</a></li>
                  )}
                  {member.websiteUrl && (
                    <li><a href={member.websiteUrl} target="_blank" rel="noreferrer" className="text-brand-600 underline">Website</a></li>
                  )}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}