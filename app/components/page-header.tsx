// app/components/page-header.tsx
export function PageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: string;
}) {
  return (
    <header className="border-b border-deep-200 dark:border-deep-800">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 lg:px-8 lg:pb-24 lg:pt-28">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-accent-mint"
          />
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-deep-500 dark:text-cream-400">
            {eyebrow}
          </p>
        </div>
        <h1 className="mt-8 max-w-4xl text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[0.98] tracking-[-0.03em] text-deep-900 dark:text-cream-100">
          {title}
        </h1>
        {lede && (
          <p className="mt-8 max-w-2xl text-base leading-7 text-deep-600 dark:text-cream-400">
            {lede}
          </p>
        )}
      </div>
    </header>
  );
}