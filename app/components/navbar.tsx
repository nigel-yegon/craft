// app/components/navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  LogIn,
  UserPlus,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  ChevronDown,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "./theme-toggle";

// ─── Navigation structure ───────────────────────────────────
const workSub = [
  { href: "/work/architecture", label: "Architecture" },
  { href: "/work/interiors", label: "Interiors" },
  { href: "/work/software", label: "Software" },
  { href: "/work/delivery", label: "Delivery" },
] as const;

const studioSub = [
  { href: "/studio/about", label: "About" },
  { href: "/studio/process", label: "Process" },
  { href: "/studio/team", label: "Team" },
  { href: "/studio/journal", label: "Journal" },
] as const;

const links = [
  { href: "/work", label: "Work", dropdown: workSub },
  { href: "/services", label: "Services" },
  { href: "/studio", label: "Studio", dropdown: studioSub },
  { href: "/contact", label: "Contact" },
] as const;

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrator",
  CLIENT: "Client",
  PARTNER: "Partner",
  TEAM: "Studio team",
};

type NavSession = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

function displayName(session: NavSession | null): string {
  return session?.name?.trim() || session?.email?.split("@")[0] || "Account";
}

// ─── Scroll direction hook ──────────────────────────────────
function useScrollDirection(threshold = 8) {
  const [direction, setDirection] = useState<"up" | "down">("up");
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    function onScroll() {
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (Math.abs(delta) < threshold) return;
      setDirection(delta > 0 ? "down" : "up");
      setScrolled(y > threshold);
      lastY.current = y;
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return { direction, scrolled };
}

// ─── Navbar ─────────────────────────────────────────────────
export function Navbar({ static: isStatic = false }: { static?: boolean }) {
  const pathname = usePathname();
  const { data: rawSession, status } = useSession();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState<null | "user" | "anon">(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const { direction, scrolled } = useScrollDirection(8);

  const session: NavSession | null =
    status === "authenticated" && rawSession?.user
      ? {
          name: rawSession.user.name ?? null,
          email: rawSession.user.email ?? null,
          role:
            (rawSession.user as { role?: string | null }).role ?? "CLIENT",
        }
      : null;

  const isAdminRoute = pathname.startsWith("/admin");
  const isDashboard =
    isStatic || isAdminRoute || pathname.startsWith("/dashboard");

  useEffect(() => {
    setOpen(false);
    setMenuOpen(null);
    setOpenDropdown(null);
  }, [pathname]);

  useEffect(() => {
    if (direction === "down" && scrolled && !isDashboard) {
      setOpenDropdown(null);
      setMenuOpen(null);
    }
  }, [direction, scrolled, isDashboard]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-user-menu]")) setMenuOpen(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(null);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!openDropdown) return;
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-dropdown-root]")) setOpenDropdown(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenDropdown(null);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [openDropdown]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const hideHeader =
    !isAdminRoute && !isDashboard && direction === "down" && scrolled;

  return (
    <>
      <header
        className={[
          "border-b",
          isAdminRoute
            ? "relative z-40 border-deep-200 bg-cream-100 dark:border-deep-800 dark:bg-deep-900"
            : [
                "sticky top-0 z-50",
                "transition-[transform,background-color,border-color] duration-200",
                hideHeader ? "-translate-y-full" : "translate-y-0",
                scrolled
                  ? "border-deep-200 bg-cream-100/95 backdrop-blur-md dark:border-deep-800 dark:bg-deep-950/95"
                  : "border-transparent bg-cream-100/60 backdrop-blur-sm dark:bg-deep-950/60",
              ].join(" "),
        ].join(" ")}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-8">
          {/* Wordmark */}
          <Link
            href="/"
            aria-label="Craft Studios home"
            className="flex shrink-0 items-baseline gap-2"
          >
            <span className="text-[15px] font-semibold uppercase tracking-[0.18em] text-deep-800 dark:text-cream-100">
              Craft
            </span>
            <span className="hidden text-[15px] font-light uppercase tracking-[0.18em] text-deep-500 sm:inline dark:text-cream-400">
              Studios
            </span>
            <span
              aria-hidden
              className="ml-1 h-1.5 w-1.5 rounded-full bg-accent-mint"
            />
          </Link>

          {/* Desktop links */}
          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((l) => {
              const hasDropdown = "dropdown" in l && l.dropdown;
              const dropdownActive =
                hasDropdown &&
                l.dropdown.some((sub: { href: string }) => isActive(sub.href));
              const active = isActive(l.href) || dropdownActive;

              if (!hasDropdown) {
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className={`relative rounded-md px-3 py-2 text-[13px] font-medium uppercase tracking-[0.14em] transition-colors ${
                        active
                          ? "text-deep-900 dark:text-cream-100"
                          : "text-deep-500 hover:text-deep-900 dark:text-cream-400 dark:hover:text-cream-100"
                      }`}
                    >
                      {l.label}
                      {active && (
                        <span className="absolute inset-x-3 -bottom-px h-px bg-deep-800 dark:bg-cream-100" />
                      )}
                    </Link>
                  </li>
                );
              }

              const isOpen = openDropdown === l.href;
              return (
                <li key={l.href} className="relative" data-dropdown-root>
                  <div
                    className={`flex items-center rounded-md transition-colors ${
                      active || isOpen
                        ? "text-deep-900 dark:text-cream-100"
                        : "text-deep-500 hover:text-deep-900 dark:text-cream-400 dark:hover:text-cream-100"
                    }`}
                  >
                    <Link
                      href={l.href}
                      className="relative rounded-l-md px-3 py-2 text-[13px] font-medium uppercase tracking-[0.14em]"
                    >
                      {l.label}
                      {active && (
                        <span className="absolute inset-x-3 -bottom-px h-px bg-deep-800 dark:bg-cream-100" />
                      )}
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDropdown((v) => (v === l.href ? null : l.href))
                      }
                      aria-expanded={isOpen}
                      aria-haspopup="menu"
                      aria-label={`Open ${l.label.toLowerCase()} menu`}
                      className="rounded-r-md py-2 pl-1 pr-2.5"
                    >
                      <ChevronDown
                        size={13}
                        aria-hidden
                        className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>

                  {isOpen && (
                    <div
                      role="menu"
                      aria-label={l.label}
                      className="absolute left-0 top-full z-50 mt-2 w-60 rounded-xl border border-deep-200 bg-cream-50 p-1.5 shadow-xl dark:border-deep-800 dark:bg-deep-950"
                    >
                      {l.dropdown.map(
                        (sub: { href: string; label: string }) => {
                          const subActive = isActive(sub.href);
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              role="menuitem"
                              onClick={() => setOpenDropdown(null)}
                              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
                                subActive
                                  ? "bg-brand-50 text-brand-800 dark:bg-brand-950/40 dark:text-brand-200"
                                  : "text-deep-700 hover:bg-cream-200 dark:text-cream-200 dark:hover:bg-deep-900"
                              }`}
                            >
                              <span>{sub.label}</span>
                              <span
                                aria-hidden
                                className="text-[10px] font-mono uppercase tracking-[0.18em] text-deep-400 dark:text-cream-600"
                              >
                                ↳
                              </span>
                            </Link>
                          );
                        },
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Right cluster */}
          <div className="flex shrink-0 items-center gap-2">
            <div className="relative" data-user-menu>
              {status === "loading" ? (
                <div
                  className="h-9 w-9 animate-pulse rounded-full border border-deep-300 bg-cream-100 dark:border-deep-700 dark:bg-deep-900"
                  aria-hidden
                />
              ) : session ? (
                <button
                  type="button"
                  onClick={() =>
                    setMenuOpen((v) => (v === "user" ? null : "user"))
                  }
                  aria-expanded={menuOpen === "user"}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 rounded-full border border-deep-300 bg-cream-100 py-1 pl-1 pr-2.5 text-sm text-deep-800 transition hover:border-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:border-deep-700 dark:bg-deep-900 dark:text-cream-100 dark:hover:border-brand-500"
                >
                  <Avatar name={session.name} email={session.email} />
                  <span className="hidden max-w-40 truncate sm:inline">
                    {displayName(session)}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setMenuOpen((v) => (v === "anon" ? null : "anon"))
                  }
                  aria-expanded={menuOpen === "anon"}
                  aria-haspopup="menu"
                  aria-label="Account"
                  className="flex items-center gap-2 rounded-full border border-deep-300 bg-cream-100 p-2 text-deep-800 transition hover:border-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:border-deep-700 dark:bg-deep-900 dark:text-cream-100 dark:hover:border-brand-500"
                >
                  <UserIcon size={18} aria-hidden="true" />
                </button>
              )}

              {session && menuOpen === "user" && (
                <UserMenuPanel
                  session={session}
                  onClose={() => setMenuOpen(null)}
                />
              )}

              {!session && menuOpen === "anon" && (
                <AnonMenuPanel onClose={() => setMenuOpen(null)} />
              )}
            </div>

            <ThemeToggle />

            <button
              onClick={() => setOpen(true)}
              className="rounded-md border border-deep-300 p-2 text-deep-700 lg:hidden dark:border-deep-700 dark:text-cream-200"
              aria-label="Open menu"
            >
              <Menu size={20} aria-hidden="true" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-deep-950/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <div className="absolute right-0 top-0 h-full w-80 max-w-[88vw] overflow-y-auto bg-cream-50 shadow-2xl dark:bg-deep-950">
            <div className="flex items-center justify-between border-b border-deep-200 px-4 py-4 dark:border-deep-800">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-2"
                aria-label="Craft Studios home"
              >
                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-deep-800 dark:text-cream-100">
                  Craft
                </span>
                <span className="text-sm font-light uppercase tracking-[0.18em] text-deep-500 dark:text-cream-400">
                  Studios
                </span>
              </Link>

              <button
                onClick={() => setOpen(false)}
                className="rounded-md border border-deep-300 p-1.5 text-deep-700 dark:border-deep-700 dark:text-cream-200"
                aria-label="Close menu"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <ul className="flex flex-col p-3">
              {links.map((l) => {
                const hasDropdown = "dropdown" in l && l.dropdown;
                const dropdownActive =
                  hasDropdown &&
                  l.dropdown.some((sub: { href: string }) =>
                    isActive(sub.href),
                  );
                const active = isActive(l.href) || dropdownActive;

                if (!hasDropdown) {
                  return (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className={`block rounded-md px-3 py-2.5 text-sm font-medium uppercase tracking-[0.12em] transition ${
                          active
                            ? "bg-deep-800 text-cream-100 dark:bg-brand-500 dark:text-deep-900"
                            : "text-deep-700 hover:bg-cream-200 dark:text-cream-300 dark:hover:bg-deep-900"
                        }`}
                      >
                        {l.label}
                      </Link>
                    </li>
                  );
                }

                return (
                  <li key={l.href} className="mt-1">
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className={`block rounded-md px-3 py-2.5 text-sm font-medium uppercase tracking-[0.12em] transition ${
                        active
                          ? "bg-deep-800 text-cream-100 dark:bg-brand-500 dark:text-deep-900"
                          : "text-deep-700 hover:bg-cream-200 dark:text-cream-300 dark:hover:bg-deep-900"
                      }`}
                    >
                      {l.label}
                    </Link>
                    <ul className="ml-3 mt-1 space-y-0.5 border-l border-deep-200 pl-3 dark:border-deep-800">
                      {l.dropdown.map(
                        (sub: { href: string; label: string }) => {
                          const subActive = isActive(sub.href);
                          return (
                            <li key={sub.href}>
                              <Link
                                href={sub.href}
                                onClick={() => setOpen(false)}
                                className={`block rounded-md px-3 py-2 text-sm transition ${
                                  subActive
                                    ? "bg-brand-50 text-brand-800 dark:bg-brand-950/40 dark:text-brand-200"
                                    : "text-deep-600 hover:bg-cream-200 dark:text-cream-300 dark:hover:bg-deep-900"
                                }`}
                              >
                                {sub.label}
                              </Link>
                            </li>
                          );
                        },
                      )}
                    </ul>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-deep-200 p-3 dark:border-deep-800">
              {session ? (
                <>
                  <div className="mb-3 flex items-center gap-3 rounded-md bg-cream-200/60 px-3 py-2.5 dark:bg-deep-900/60">
                    <Avatar name={session.name} email={session.email} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-deep-800 dark:text-cream-100">
                        {displayName(session)}
                      </p>
                      <p className="truncate text-xs text-deep-500 dark:text-cream-400">
                        {session.email}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="mb-2 flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-deep-700 hover:bg-cream-200 dark:text-cream-300 dark:hover:bg-deep-900"
                  >
                    <LayoutDashboard size={16} aria-hidden="true" />
                    My dashboard
                  </Link>

                  <MobileSignOutButton onClose={() => setOpen(false)} />
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="mb-2 flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-deep-700 hover:bg-cream-200 dark:text-cream-300 dark:hover:bg-deep-900"
                  >
                    <LogIn size={16} aria-hidden="true" />
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="mb-2 flex items-center gap-2 rounded-md bg-deep-800 px-3 py-2.5 text-sm font-medium text-cream-100 dark:bg-brand-500 dark:text-deep-900"
                  >
                    <UserPlus size={16} aria-hidden="true" />
                    Create account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Avatar ─────────────────────────────────────────────────
function Avatar({
  name,
  email,
}: {
  name?: string | null;
  email?: string | null;
}) {
  const source = name?.trim() || email?.split("@")[0] || "";
  const initials = source
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span
      className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800 ring-1 ring-brand-200/60 dark:bg-brand-950/60 dark:text-brand-200 dark:ring-brand-800/50"
      aria-hidden="true"
    >
      {initials || "?"}
    </span>
  );
}

// ─── User menu panel ────────────────────────────────────────
function UserMenuPanel({
  session,
  onClose,
}: {
  session: NavSession;
  onClose: () => void;
}) {
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut({ callbackUrl: "/" });
  }

  return (
    <div
      role="menu"
      aria-label="Account"
      className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-deep-200 bg-cream-50 p-1.5 shadow-xl dark:border-deep-800 dark:bg-deep-950"
    >
      <div className="px-3 py-2.5">
        <p className="truncate text-sm font-medium text-deep-800 dark:text-cream-100">
          {displayName(session)}
        </p>
        <p className="truncate text-xs text-deep-500 dark:text-cream-400">
          {session.email}
        </p>
        {session.role && (
          <p className="mt-1 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-800 dark:bg-brand-950/40 dark:text-brand-300">
            {ROLE_LABEL[session.role] ?? session.role}
          </p>
        )}
      </div>

      <div className="my-1 h-px bg-deep-200 dark:bg-deep-800" />

      {session.role === "ADMIN" && (
        <Link
          href="/admin"
          role="menuitem"
          onClick={onClose}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-deep-700 transition hover:bg-cream-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:text-cream-200 dark:hover:bg-deep-900"
        >
          <LayoutDashboard size={15} aria-hidden="true" />
          Admin dashboard
        </Link>
      )}

      <button
        type="button"
        role="menuitem"
        onClick={handleSignOut}
        disabled={signingOut}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-deep-700 transition hover:bg-cream-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-60 dark:text-cream-200 dark:hover:bg-deep-900"
      >
        <LogOut size={15} aria-hidden="true" />
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}

// ─── Mobile sign-out button ─────────────────────────────────
function MobileSignOutButton({ onClose }: { onClose: () => void }) {
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    onClose();
    await signOut({ callbackUrl: "/" });
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={signingOut}
      className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-deep-700 hover:bg-cream-200 disabled:opacity-60 dark:text-cream-300 dark:hover:bg-deep-900"
    >
      <LogOut size={16} aria-hidden="true" />
      {signingOut ? "Signing out…" : "Sign out"}
    </button>
  );
}

// ─── Anon menu panel ────────────────────────────────────────
function AnonMenuPanel({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="menu"
      aria-label="Account"
      className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-deep-200 bg-cream-50 p-1.5 shadow-xl dark:border-deep-800 dark:bg-deep-950"
    >
      <p className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-deep-500 dark:text-cream-400">
        Account
      </p>

      <Link
        href="/login"
        role="menuitem"
        onClick={onClose}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-deep-700 transition hover:bg-cream-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:text-cream-200 dark:hover:bg-deep-900"
      >
        <LogIn size={15} aria-hidden="true" />
        Sign in
      </Link>

      <Link
        href="/signup"
        role="menuitem"
        onClick={onClose}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:text-brand-300 dark:hover:bg-brand-950/40"
      >
        <UserPlus size={15} aria-hidden="true" />
        Create account
      </Link>
    </div>
  );
}