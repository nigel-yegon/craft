// app/components/footer.tsx
import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";

// Lucide doesn't ship an X (Twitter) glyph — here's the official mark as
// a small inline SVG so the row stays visually consistent with the others.
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const SOCIALS = [
  {
    label: "Facebook",
    href: "https://facebook.com/craftstudios",
    icon: Facebook,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/craftstudios",
    icon: Instagram,
  },
  {
    label: "X",
    href: "https://x.com/craftstudios",
    icon: XIcon,
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@craftstudios",
    icon: Youtube,
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-deep-200 bg-cream-100 dark:border-deep-800 dark:bg-deep-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row lg:px-8">
        <p className="text-xs text-deep-500 dark:text-cream-500">
          © {new Date().getFullYear()} Craft Studios. Ideas, integrated.
        </p>

        <ul className="flex items-center gap-1">
          {SOCIALS.map(({ label, href, icon: Icon }) => (
            <li key={label}>
              <Link
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-8 w-8 items-center justify-center rounded-md text-deep-500 transition hover:bg-cream-200 hover:text-deep-900 dark:text-cream-500 dark:hover:bg-deep-800 dark:hover:text-cream-100"
              >
                <Icon className="h-4 w-4" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}