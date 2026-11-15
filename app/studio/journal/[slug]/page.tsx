import { notFound } from "next/navigation";
import Link from "next/link";
import { getJournalPostBySlug } from "@/app/actions/journal";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getJournalPostBySlug(slug);
  if (!post) return { title: "Not found — Craft Studios" };
  return {
    title: `${post.title} — Craft Studios`,
    description: post.excerpt,
  };
}

export default async function JournalPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getJournalPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-cream-200 dark:bg-deep-950">
      <article className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
        <Link
          href="/studio/journal"
          className="text-xs font-medium text-deep-500 hover:text-deep-800 dark:text-cream-500"
        >
          ← Back to journal
        </Link>

        <header className="mt-8">
          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-800 dark:bg-brand-950 dark:text-brand-200">
            {post.category.replace("_", " ")}
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-deep-800 dark:text-cream-100">
            {post.title}
          </h1>
          {post.subtitle && (
            <p className="mt-3 text-xl text-deep-600 dark:text-cream-400">
              {post.subtitle}
            </p>
          )}
          <p className="mt-6 text-sm text-deep-500 dark:text-cream-500">
            {post.author && (
              <>
                By{" "}
                <Link href={`/studio/team/${post.author.slug}`} className="text-brand-600 underline">
                  {post.author.name}
                </Link>{" "}
                ·{" "}
              </>
            )}
            {post.publishedAt && new Date(post.publishedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
            {post.readTimeMinutes && ` · ${post.readTimeMinutes} min read`}
          </p>
        </header>

        {post.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImageUrl}
            alt=""
            className="mt-8 w-full rounded-2xl object-cover"
          />
        )}

        <div className="prose prose-lg mt-10 max-w-none whitespace-pre-wrap text-deep-700 dark:text-cream-300">
          {post.content}
        </div>

        {post.galleryUrls.length > 0 && (
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {post.galleryUrls.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="" className="w-full rounded-xl" />
            ))}
          </div>
        )}

        {post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span key={t} className="rounded-full bg-cream-100 px-3 py-1 text-xs text-deep-600 dark:bg-deep-900 dark:text-cream-400">
                #{t}
              </span>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}