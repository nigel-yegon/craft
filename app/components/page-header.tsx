
type PageHeaderProps = {
  eyebrow: string;
  title: React.ReactNode;
  lede?: string;
};

export function PageHeader({
  eyebrow,
  title,
  lede,
}: PageHeaderProps) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-20 sm:px-8 lg:pb-24 lg:pt-28">
        <p className="section-kicker">{eyebrow}</p>

        <h1 className="mt-8 max-w-5xl text-[clamp(2.5rem,6vw,5.5rem)] font-medium leading-[0.98] tracking-[-0.055em]">
          {title}
        </h1>

        {lede && (
          <p className="mt-8 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
            {lede}
          </p>
        )}
      </div>
    </header>
  );
}
