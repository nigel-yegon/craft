import { listTeamMembers } from "@/app/actions/team";
import Link from "next/link";

export const metadata = {
  title: "Team — Craft Studios",
  description: "The people behind the work.",
};

export default async function TeamPage() {
  const members = await listTeamMembers();

  return (
    <div className="min-h-screen bg-cream-200 dark:bg-deep-950">
      <section className="border-b border-deep-200 bg-cream-100 py-16 dark:border-deep-800 dark:bg-deep-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">
            Studio
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-deep-800 dark:text-cream-100">
            Our team
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-deep-600 dark:text-cream-400">
            Architects, designers, engineers, and makers — the people who
            deliver the work.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {members.length === 0 ? (
          <p className="text-sm text-deep-500 dark:text-cream-400">
            The team page is being prepared. Check back soon.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => (
              <Link
                key={m.id}
                href={`/studio/team/${m.slug}`}
                className="group rounded-2xl border border-deep-200 bg-cream-50 p-6 transition hover:border-brand-400 dark:border-deep-800 dark:bg-deep-900"
              >
                {m.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.photoUrl}
                    alt={m.name}
                    className="mx-auto h-40 w-40 rounded-full object-cover"
                  />
                ) : (
                  <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-brand-100 text-3xl font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                    {m.name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <h2 className="mt-4 text-center text-lg font-bold text-deep-800 group-hover:text-brand-700 dark:text-cream-100">
                  {m.name}
                </h2>
                <p className="text-center text-sm font-medium text-brand-600 dark:text-brand-400">
                  {m.role}
                </p>
                {m.shortBio && (
                  <p className="mt-3 text-center text-sm text-deep-600 dark:text-cream-400">
                    {m.shortBio}
                  </p>
                )}
                {m.expertise.length > 0 && (
                  <div className="mt-4 flex flex-wrap justify-center gap-1">
                    {m.expertise.slice(0, 4).map((e) => (
                      <span
                        key={e}
                        className="rounded-full bg-cream-200 px-2 py-0.5 text-[10px] font-medium text-deep-600 dark:bg-deep-800 dark:text-cream-400"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}