import Link from "next/link";
import { listJournalPosts } from "@/app/actions/journal";

export const metadata = {
  title: "Journal — Craft Studios",
  description: "Notes from the studio.",
};

export default async function JournalPage() {
  const posts = await listJournalPosts();
  const featured = posts.find((p) => p.featured);
  const rest = posts.filter((p) => p.id !== featured?.id);

  return (
    <div className="min-h-screen bg-cream-200 dark:bg-deep-950">
      <section className="border-b border-deep-200 bg-cream-100 py-16 dark:border-deep-800 dark:bg-deep-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">
            Studio
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-deep-800 dark:text-cream-100">
            Journal
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-deep-600 dark:text-cream-400">
            Long-form articles on process, projects, tools, and studio life.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {posts.length === 0 ? (
          <p className="text-sm text-deep-500 dark:text-cream-400">
            No posts yet. Check back soon.
          </p>
        ) : (
          <>
            {featured && (
              <Link
                href={`/studio/journal/${featured.slug}`}
                className="group mb-12 block overflow-hidden rounded-3xl border border-deep-200 bg-cream-50 transition hover:border-brand-400 dark:border-deep-800 dark:bg-deep-900"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  {featured.coverImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featured.coverImageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                  <div className="p-8">
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-800 dark:bg-brand-950 dark:text-brand-200">
                      Featured · {featured.category.replace("_", " ")}
                    </span>
                    <h2 className="mt-3 text-2xl font-bold text-deep-800 group-hover:text-brand-700 dark:text-cream-100">
                      {featured.title}
                    </h2>
                    {featured.subtitle && (
                      <p className="mt-2 text-base text-deep-600 dark:text-cream-400">
                        {featured.subtitle}
                      </p>
                    )}
                    <p className="mt-3 text-sm text-deep-600 dark:text-cream-400">
                      {featured.excerpt}
                    </p>
                    <p className="mt-4 text-xs text-deep-500 dark:text-cream-500">
                      {featured.author?.name} · {featured.publishedAt && new Date(featured.publishedAt).toLocaleDateString()}
                      {featured.readTimeMinutes && ` · ${featured.readTimeMinutes} min read`}
                    </p>
                  </div>
                </div>
              </Link>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p) => (
                <Link
                  key={p.id}
                  href={`/studio/journal/${p.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-deep-200 bg-cream-50 transition hover:border-brand-400 dark:border-deep-800 dark:bg-deep-900"
                >
                  {p.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.coverImageUrl} alt="" className="aspect-4/3 w-full object-cover transition group-hover:scale-105" />
                  ) : (
                    <div className="flex aspect-4/3 items-center justify-center bg-cream-200 text-xs text-deep-400 dark:bg-deep-800 dark:text-cream-600">
                      No image
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <span className="rounded-full bg-cream-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-deep-600 dark:bg-deep-800 dark:text-cream-400 self-start">
                      {p.category.replace("_", " ")}
                    </span>
                    <h3 className="mt-2 line-clamp-2 font-bold text-deep-800 group-hover:text-brand-700 dark:text-cream-100">
                      {p.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 flex-1 text-sm text-deep-600 dark:text-cream-400">
                      {p.excerpt}
                    </p>
                    <p className="mt-3 text-xs text-deep-500 dark:text-cream-500">
                      {p.author?.name} · {p.publishedAt && new Date(p.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}