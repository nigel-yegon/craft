// app/admin/dashboard-client.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, House, Users as UsersIcon, FileText } from "lucide-react";

import FadeIn from "../components/fade-in";
import { Stagger } from "../components/stagger";
import { useScrollDirection } from "../components/use-scroll-direction";

// ─── Types ────────────────────────────────────────────────────────

type ModuleKey =
  | "overview"
  | "businesses"
  | "operators"
  | "incidents"
  | "inquiries"
  | "resources"
  | "destinations"
  | "experiences"
  | "packages"
  | "stay"
  | "events"
  | "blog"
  | "reports"
  | "users";

type ModuleTone = {
  ring: string;
  border: string;
  borderHover: string;
  bgSoft: string;
  bgActive: string;
  text: string;
  button: string;
  buttonHover: string;
  bar: string;
  pillBg: string;
  pillText: string;
  icon: React.ReactNode;
};

type ModuleDef = {
  key: ModuleKey;
  label: string;
  description: string;
  tone?: ModuleTone;
  icon: React.ReactNode;
};

type ModuleGroup = {
  key: string;
  label: string;
  modules: ModuleDef[];
};

// ─── Tones ────────────────────────────────────────────────────────

const TONES: Record<Exclude<ModuleKey, "overview">, ModuleTone> = {
  businesses: {
    ring: "ring-slate-500/20",
    border: "border-slate-300 dark:border-slate-800",
    borderHover: "hover:border-slate-500",
    bgSoft: "bg-slate-50 dark:bg-slate-950/40",
    bgActive: "bg-slate-100 dark:bg-slate-950/70",
    text: "text-slate-700 dark:text-slate-300",
    button: "bg-slate-700",
    buttonHover: "hover:bg-slate-800",
    bar: "bg-slate-600",
    pillBg: "bg-slate-100 dark:bg-slate-950",
    pillText: "text-slate-800 dark:text-slate-200",
    icon: <BoxIcon />,
  },
  operators: {
    ring: "ring-slate-500/20",
    border: "border-slate-300 dark:border-slate-800",
    borderHover: "hover:border-slate-500",
    bgSoft: "bg-slate-50 dark:bg-slate-950/40",
    bgActive: "bg-slate-100 dark:bg-slate-950/70",
    text: "text-slate-700 dark:text-slate-300",
    button: "bg-slate-700",
    buttonHover: "hover:bg-slate-800",
    bar: "bg-slate-600",
    pillBg: "bg-slate-100 dark:bg-slate-950",
    pillText: "text-slate-800 dark:text-slate-200",
    icon: <UsersIcon className="h-5 w-5" />,
  },
  incidents: {
    ring: "ring-rose-500/20",
    border: "border-rose-300 dark:border-rose-800",
    borderHover: "hover:border-rose-500",
    bgSoft: "bg-rose-50 dark:bg-rose-950/40",
    bgActive: "bg-rose-100 dark:bg-rose-950/70",
    text: "text-rose-700 dark:text-rose-300",
    button: "bg-rose-700",
    buttonHover: "hover:bg-rose-800",
    bar: "bg-rose-600",
    pillBg: "bg-rose-100 dark:bg-rose-950",
    pillText: "text-rose-800 dark:text-rose-200",
    icon: <ShieldIcon />,
  },
  inquiries: {
    ring: "ring-brand-500/20",
    border: "border-brand-300 dark:border-brand-800",
    borderHover: "hover:border-brand-500",
    bgSoft: "bg-brand-50 dark:bg-brand-950/40",
    bgActive: "bg-brand-100 dark:bg-brand-950/70",
    text: "text-brand-700 dark:text-brand-300",
    button: "bg-brand-600",
    buttonHover: "hover:bg-brand-700",
    bar: "bg-brand-500",
    pillBg: "bg-brand-100 dark:bg-brand-950",
    pillText: "text-brand-800 dark:text-brand-200",
    icon: <MailIcon />,
  },
  resources: {
    ring: "ring-brand-500/20",
    border: "border-brand-300 dark:border-brand-800",
    borderHover: "hover:border-brand-500",
    bgSoft: "bg-brand-50 dark:bg-brand-950/40",
    bgActive: "bg-brand-100 dark:bg-brand-950/70",
    text: "text-brand-700 dark:text-brand-300",
    button: "bg-brand-600",
    buttonHover: "hover:bg-brand-700",
    bar: "bg-brand-500",
    pillBg: "bg-brand-100 dark:bg-brand-950",
    pillText: "text-brand-800 dark:text-brand-200",
    icon: <FolderIcon />,
  },
  destinations: {
    ring: "ring-brand-500/20",
    border: "border-brand-300 dark:border-brand-800",
    borderHover: "hover:border-brand-500",
    bgSoft: "bg-brand-50 dark:bg-brand-950/40",
    bgActive: "bg-brand-100 dark:bg-brand-950/70",
    text: "text-brand-700 dark:text-brand-300",
    button: "bg-brand-600",
    buttonHover: "hover:bg-brand-700",
    bar: "bg-brand-500",
    pillBg: "bg-brand-100 dark:bg-brand-950",
    pillText: "text-brand-800 dark:text-brand-200",
    icon: <CompassIcon />,
  },
  experiences: {
    ring: "ring-emerald-500/20",
    border: "border-emerald-300 dark:border-emerald-800",
    borderHover: "hover:border-emerald-500",
    bgSoft: "bg-emerald-50 dark:bg-emerald-950/40",
    bgActive: "bg-emerald-100 dark:bg-emerald-950/70",
    text: "text-emerald-700 dark:text-emerald-300",
    button: "bg-emerald-700",
    buttonHover: "hover:bg-emerald-800",
    bar: "bg-emerald-600",
    pillBg: "bg-emerald-100 dark:bg-emerald-950",
    pillText: "text-emerald-800 dark:text-emerald-200",
    icon: <PawIcon />,
  },
  packages: {
    ring: "ring-indigo-500/20",
    border: "border-indigo-300 dark:border-indigo-800",
    borderHover: "hover:border-indigo-500",
    bgSoft: "bg-indigo-50 dark:bg-indigo-950/40",
    bgActive: "bg-indigo-100 dark:bg-indigo-950/70",
    text: "text-indigo-700 dark:text-indigo-300",
    button: "bg-indigo-700",
    buttonHover: "hover:bg-indigo-800",
    bar: "bg-indigo-600",
    pillBg: "bg-indigo-100 dark:bg-indigo-950",
    pillText: "text-indigo-800 dark:text-indigo-200",
    icon: <RouteIcon />,
  },
  stay: {
    ring: "ring-rose-500/20",
    border: "border-rose-300 dark:border-rose-800",
    borderHover: "hover:border-rose-500",
    bgSoft: "bg-rose-50 dark:bg-rose-950/40",
    bgActive: "bg-rose-100 dark:bg-rose-950/70",
    text: "text-rose-700 dark:text-rose-300",
    button: "bg-rose-700",
    buttonHover: "hover:bg-rose-800",
    bar: "bg-rose-600",
    pillBg: "bg-rose-100 dark:bg-rose-950",
    pillText: "text-rose-800 dark:text-rose-200",
    icon: <BedIcon />,
  },
  events: {
    ring: "ring-violet-500/20",
    border: "border-violet-300 dark:border-violet-800",
    borderHover: "hover:border-violet-500",
    bgSoft: "bg-violet-50 dark:bg-violet-950/40",
    bgActive: "bg-violet-100 dark:bg-violet-950/70",
    text: "text-violet-700 dark:text-violet-300",
    button: "bg-violet-700",
    buttonHover: "hover:bg-violet-800",
    bar: "bg-violet-600",
    pillBg: "bg-violet-100 dark:bg-violet-950",
    pillText: "text-violet-800 dark:text-violet-200",
    icon: <CalendarIcon />,
  },
  blog: {
    ring: "ring-sky-500/20",
    border: "border-sky-300 dark:border-sky-800",
    borderHover: "hover:border-sky-500",
    bgSoft: "bg-sky-50 dark:bg-sky-950/40",
    bgActive: "bg-sky-100 dark:bg-sky-950/70",
    text: "text-sky-700 dark:text-sky-300",
    button: "bg-sky-700",
    buttonHover: "hover:bg-sky-800",
    bar: "bg-sky-600",
    pillBg: "bg-sky-100 dark:bg-sky-950",
    pillText: "text-sky-800 dark:text-sky-200",
    icon: <PenIcon />,
  },
  reports: {
    ring: "ring-brand-500/20",
    border: "border-brand-300 dark:border-brand-800",
    borderHover: "hover:border-brand-500",
    bgSoft: "bg-brand-50 dark:bg-brand-950/40",
    bgActive: "bg-brand-100 dark:bg-brand-950/70",
    text: "text-brand-700 dark:text-brand-300",
    button: "bg-brand-600",
    buttonHover: "hover:bg-brand-700",
    bar: "bg-brand-500",
    pillBg: "bg-brand-100 dark:bg-brand-950",
    pillText: "text-brand-800 dark:text-brand-200",
    icon: <FileText className="h-5 w-5" />,
  },
  users: {
    ring: "ring-violet-500/20",
    border: "border-violet-300 dark:border-violet-800",
    borderHover: "hover:border-violet-500",
    bgSoft: "bg-violet-50 dark:bg-violet-950/40",
    bgActive: "bg-violet-100 dark:bg-violet-950/70",
    text: "text-violet-700 dark:text-violet-300",
    button: "bg-violet-700",
    buttonHover: "hover:bg-violet-800",
    bar: "bg-violet-600",
    pillBg: "bg-violet-100 dark:bg-violet-950",
    pillText: "text-violet-800 dark:text-violet-200",
    icon: <UsersIcon className="h-5 w-5" />,
  },
};

// ─── Module groups ────────────────────────────────────────────────

const MODULE_GROUPS: ModuleGroup[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    modules: [
      { key: "overview", label: "Overview", description: "Dashboard summary", icon: <GridIcon /> },
    ],
  },
  {
    key: "directory",
    label: "Directory",
    modules: [
      { key: "businesses", label: "Businesses", description: "Manage businesses", icon: TONES.businesses.icon, tone: TONES.businesses },
      { key: "operators", label: "Tour Operators", description: "Verify TRA licenses", icon: TONES.operators.icon, tone: TONES.operators },
      { key: "destinations", label: "Destinations", description: "Manage destinations", icon: TONES.destinations.icon, tone: TONES.destinations },
    ],
  },
  {
    key: "offering",
    label: "Offering",
    modules: [
      { key: "experiences", label: "Experiences", description: "Manage experiences", icon: TONES.experiences.icon, tone: TONES.experiences },
      { key: "packages", label: "Packages", description: "Manage packages", icon: TONES.packages.icon, tone: TONES.packages },
      { key: "stay", label: "Stay", description: "Manage accommodation", icon: TONES.stay.icon, tone: TONES.stay },
      { key: "events", label: "Events", description: "Manage events", icon: TONES.events.icon, tone: TONES.events },
    ],
  },
  {
    key: "operations",
    label: "Operations",
    modules: [
      { key: "incidents", label: "Incidents", description: "Manage incidents", icon: TONES.incidents.icon, tone: TONES.incidents },
      { key: "inquiries", label: "Inquiries", description: "Investor inquiries", icon: TONES.inquiries.icon, tone: TONES.inquiries },
      { key: "resources", label: "Resources", description: "Documents & downloads", icon: TONES.resources.icon, tone: TONES.resources },
      { key: "blog", label: "Blog", description: "Manage blog posts", icon: TONES.blog.icon, tone: TONES.blog },
    ],
  },
  {
    key: "admin",
    label: "Administration",
    modules: [
      { key: "reports", label: "Reports", description: "Review & generate reports", icon: TONES.reports.icon, tone: TONES.reports },
      { key: "users", label: "Users & Groups", description: "Manage roles and access", icon: TONES.users.icon, tone: TONES.users },
    ],
  },
];

// ─── Root ─────────────────────────────────────────────────────────

export function DashboardClient({ userName }: { userName: string }) {
  const [activeModule, setActiveModule] = useState<ModuleKey>("overview");
  const [search, setSearch] = useState("");
  const { scrolled } = useScrollDirection(8);

  return (
    <div className="min-h-screen bg-cream-200 dark:bg-deep-950">
      {/*
        Layout notes for sticky sidebar:
        - The flex parent must NOT have `min-h-screen` — it must grow with
          `main` so the sticky `aside` has scroll range.
        - `main` carries `lg:min-h-screen` so even short module pages make
          the flex parent ≥ viewport height (sticky needs *some* range).
      */}
      <div className="flex">
        <DashboardSidebar
          activeModule={activeModule}
          onNavigate={setActiveModule}
          userName={userName}
        />

        <main className="min-w-0 flex-1 lg:min-h-screen">
          <DashboardHeader
            activeModule={activeModule}
            search={search}
            setSearch={setSearch}
            tone={activeModule !== "overview" ? TONES[activeModule] : undefined}
            scrolled={scrolled}
          />

          <div className="p-6 lg:p-8">
            <div key={activeModule}>
              {activeModule === "overview" && <Overview onNavigate={setActiveModule} />}

              {activeModule !== "overview" && (
                <ModulePlaceholder
                  title={activeModule}
                  tone={TONES[activeModule as Exclude<ModuleKey, "overview">]}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────

function DashboardSidebar({
  activeModule,
  onNavigate,
  userName,
}: {
  activeModule: ModuleKey;
  onNavigate: (m: ModuleKey) => void;
  userName: string;
}) {
  const activeGroupKey = useMemo(
    () => MODULE_GROUPS.find((g) => g.modules.some((m) => m.key === activeModule))?.key,
    [activeModule],
  );

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const g of MODULE_GROUPS) initial[g.key] = g.key === activeGroupKey;
    return initial;
  });

  const [lastActiveGroup, setLastActiveGroup] = useState(activeGroupKey);
  if (activeGroupKey && activeGroupKey !== lastActiveGroup) {
    setLastActiveGroup(activeGroupKey);
    if (!openGroups[activeGroupKey]) {
      setOpenGroups((prev) => ({ ...prev, [activeGroupKey]: true }));
    }
  }

  const toggleGroup = (key: string) =>
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    /*
      Sticky sidebar:
      - `sticky top-0 h-screen` makes the whole aside pin to the viewport.
      - Parent flex div has no min-h-screen, and `main` carries
        `lg:min-h-screen`, so the parent is always ≥ viewport height and
        the sticky has scroll range to work against.
    */
    <aside className=" hidden h-screen w-72 shrink-0 lg:block">
      <div className="flex h-full flex-col border-r border-deep-200 bg-cream-100 dark:border-deep-800 dark:bg-deep-900">
        {/*
          Greeting header — mirrors DashboardHeader's height.
          Same px-6 py-5 + two-line stack (text-xs kicker + text-2xl primary)
          so both columns resolve to identical computed heights.
        */}
        <div className="sticky top-0 z-20 border-b border-deep-200 px-6 py-5 bg-cream-100 dark:bg-deep-900 dark:border-deep-800">
          <Link href="/" className="group block">
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-deep-500 dark:text-cream-500">
              Welcome back
            </div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="truncate text-2xl font-bold tracking-tight text-deep-800 dark:text-cream-100">
                Hello, {userName}.
              </h2>
              {/* <span className="flex shrink-0 items-center gap-1.5 text-xs text-deep-500 dark:text-cream-500">
                <House size={14} strokeWidth={1.75} aria-hidden className="shrink-0" />
                <span className="hidden xl:inline">Home</span>
              </span> */}
            </div>
          </Link>
        </div>

        {/* Scrollable module groups */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
          <Stagger delayStart={0.05} delayStep={0.04} maxDelay={0.4}>
            {MODULE_GROUPS.map((group) => {
              const isOpen = !!openGroups[group.key];
              const hasActive = group.modules.some((m) => m.key === activeModule);

              return (
                <div key={group.key} className="mb-2">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.key)}
                    aria-expanded={isOpen}
                    className={[
                      "group flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition",
                      hasActive
                        ? "text-deep-900 dark:text-cream-100"
                        : "text-deep-500 hover:text-deep-800 dark:text-cream-500 dark:hover:text-cream-200",
                    ].join(" ")}
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                      {group.label}
                    </span>
                    <ChevronDown
                      size={16}
                      strokeWidth={2}
                      aria-hidden
                      className={[
                        "shrink-0 transition-transform duration-200",
                        isOpen ? "rotate-0" : "-rotate-90",
                      ].join(" ")}
                    />
                  </button>

                  {isOpen && (
                    <div className="mt-1 space-y-1">
                      {group.modules.map((m) => {
                        const active = activeModule === m.key;
                        const tone = m.tone;
                        return (
                          <button
                            key={m.key}
                            type="button"
                            onClick={() => onNavigate(m.key)}
                            className={[
                              "group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-left transition",
                              active && tone
                                ? `${tone.bgActive} ${tone.text}`
                                : active
                                  ? "bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                                  : "text-deep-600 hover:bg-cream-200 hover:text-deep-900 dark:text-cream-400 dark:hover:bg-deep-800 dark:hover:text-cream-100",
                            ].join(" ")}
                          >
                            {active && tone && (
                              <span aria-hidden className={`absolute inset-y-1 left-0 w-1 rounded-full ${tone.bar}`} />
                            )}
                            <span
                              className={[
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition",
                                active && tone
                                  ? tone.bgSoft
                                  : "bg-cream-200 text-deep-500 group-hover:bg-cream-300 dark:bg-deep-800 dark:text-cream-500 dark:group-hover:bg-deep-700",
                              ].join(" ")}
                            >
                              <span className={active && tone ? tone.text : "text-deep-500 dark:text-cream-500"}>
                                {m.icon}
                              </span>
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold">{m.label}</span>
                              <span
                                className={[
                                  "block truncate text-xs",
                                  active ? "text-current opacity-70" : "text-deep-500 dark:text-cream-500",
                                ].join(" ")}
                              >
                                {m.description}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </Stagger>
        </div>

        {/* Footer — pinned at bottom of the sticky sidebar */}
        <div className="border-t border-deep-200 p-4 dark:border-deep-800">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl bg-cream-200 px-4 py-3 text-xs text-deep-600 transition hover:bg-cream-300 dark:bg-deep-800 dark:text-cream-400 dark:hover:bg-deep-700"
          >
            <ArrowLeftIcon />
            <span>View public site</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}

// ─── Header ───────────────────────────────────────────────────────

function DashboardHeader({
  activeModule,
  search,
  setSearch,
  tone,
  scrolled,
}: {
  activeModule: ModuleKey;
  search: string;
  setSearch: (v: string) => void;
  tone?: ModuleTone;
  scrolled?: boolean;
}) {
  const titles: Record<ModuleKey, string> = {
    overview: "Dashboard",
    businesses: "Businesses",
    operators: "Tour Operators",
    incidents: "Reported Incidents",
    inquiries: "Investor inquiries",
    resources: "Resources",
    destinations: "Destinations",
    experiences: "Experiences",
    packages: "Packages",
    stay: "Stay",
    events: "Events",
    blog: "Blog",
    reports: "Reports",
    users: "Users",
  };

  const searchable = activeModule !== "overview" && activeModule !== "reports";

  return (
    <header
      className={[
        "sticky top-0 z-30 border-b",
        "transition-[background-color,border-color,box-shadow,backdrop-filter] duration-200",
        scrolled
          ? "border-deep-200 bg-cream-100/95 shadow-sm backdrop-blur-md dark:border-deep-800 dark:bg-deep-900/95"
          : "border-deep-200 bg-cream-100/90 backdrop-blur-sm dark:border-deep-800 dark:bg-deep-900/90",
      ].join(" ")}
    >
      <div className="flex flex-col gap-5 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <FadeIn key={`title-${activeModule}`} duration={400}>
          <div>
            <div className={`text-xs font-medium uppercase tracking-[0.16em] ${tone?.text ?? "text-brand-600 dark:text-brand-400"}`}>
              Admin
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-deep-800 dark:text-cream-100">
              {titles[activeModule]}
            </h1>
          </div>
        </FadeIn>

        {searchable && tone && (
          <FadeIn key={`search-${activeModule}`} delay={0.1} duration={400}>
            <div className="relative w-full lg:w-80">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-deep-400 dark:text-cream-500">
                <SearchIcon />
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${titles[activeModule].toLowerCase()}...`}
                className={`w-full rounded-xl border ${tone.border} bg-cream-50 py-2.5 pl-10 pr-4 text-sm text-deep-800 outline-none transition placeholder:text-deep-400 focus:bg-cream-100 focus:ring-2 ${tone.ring} dark:bg-deep-950 dark:text-cream-100 dark:placeholder:text-cream-500 dark:focus:bg-deep-950`}
              />
            </div>
          </FadeIn>
        )}
      </div>
    </header>
  );
}

// ─── Overview stub ────────────────────────────────────────────────

function Overview({ onNavigate }: { onNavigate: (m: ModuleKey) => void }) {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { key: "businesses" as const, label: "Businesses", value: 0 },
          { key: "operators" as const, label: "Tour operators", value: 0 },
          { key: "incidents" as const, label: "Incidents", value: 0 },
          { key: "inquiries" as const, label: "Inquiries", value: 0 },
        ].map((kpi) => (
          <button
            key={kpi.key}
            type="button"
            onClick={() => onNavigate(kpi.key)}
            className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-cream-50 px-4 py-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-deep-900 ${TONES[kpi.key].border}`}
          >
            <span className={`absolute inset-y-0 left-0 w-1 ${TONES[kpi.key].bar}`} aria-hidden />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-500 dark:text-cream-500">
              {kpi.label}
            </span>
            <div className="mt-2 text-2xl font-bold tracking-tight text-deep-800 dark:text-cream-100">
              {kpi.value.toLocaleString()}
            </div>
          </button>
        ))}
      </section>

      <div className="rounded-2xl border-2 border-dashed border-deep-200 bg-cream-50 p-10 text-center dark:border-deep-800 dark:bg-deep-900">
        <h3 className="text-sm font-semibold text-deep-800 dark:text-cream-100">
          Wire up your data
        </h3>
        <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-deep-500 dark:text-cream-500">
          Overview stats, charts and activity lists go here. Add server actions
          under <code className="rounded bg-cream-200 px-1 py-0.5 dark:bg-deep-800">app/admin/actions/</code> and
          pass the results in as props from the server component, or fetch them
          client-side inside an effect.
        </p>
      </div>
    </div>
  );
}

// ─── Module placeholder ───────────────────────────────────────────

function ModulePlaceholder({ title, tone }: { title: string; tone: ModuleTone }) {
  return (
    <div className="mx-auto max-w-7xl">
      <FadeIn>
        <div className="mb-6 flex items-start gap-3">
          <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone.bgSoft} ${tone.text}`} aria-hidden>
            {tone.icon}
          </span>
          <div>
            <h2 className={`text-xl font-bold capitalize ${tone.text}`}>{title.replace(/_/g, " ")}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-deep-600 dark:text-cream-400">
              Module placeholder — add your list and editor here.
            </p>
          </div>
        </div>
      </FadeIn>

      <div className={`rounded-2xl border-2 border-dashed ${tone.border} ${tone.bgSoft} p-10 text-center`}>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-deep-500 dark:text-cream-500">
          Coming together
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-deep-600 dark:text-cream-400">
          Drop in a <code className="rounded bg-cream-200 px-1 py-0.5 dark:bg-deep-800">ModuleLayout</code>,
          a list of <code className="rounded bg-cream-200 px-1 py-0.5 dark:bg-deep-800">RowCard</code>s, and
          an <code className="rounded bg-cream-200 px-1 py-0.5 dark:bg-deep-800">EditorShell</code> — the
          tone tokens are already wired for this module.
        </p>
      </div>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────

const iconBase = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  className: "h-5 w-5",
};

function GridIcon() { return (<svg {...iconBase}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>); }
function BoxIcon() { return (<svg {...iconBase}><path d="M21 8v8a2 2 0 0 1-1 1.73l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8a2 2 0 0 1 1-1.73l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 8Z" /><path d="m3.3 7 8.7 5 8.7-5M12 22V12" /></svg>); }
function ShieldIcon() { return (<svg {...iconBase}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" /></svg>); }
function MailIcon() { return (<svg {...iconBase}><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" /><path d="m3 8 9 6 9-6" /></svg>); }
function FolderIcon() { return (<svg {...iconBase}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" /></svg>); }
function CompassIcon() { return (<svg {...iconBase}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></svg>); }
function PawIcon() { return (<svg {...iconBase}><circle cx="7" cy="9" r="2" /><circle cx="12" cy="6.5" r="2" /><circle cx="17" cy="9" r="2" /><circle cx="5.5" cy="14" r="2" /><path d="M9.5 20c1.5-2 4.5-2.5 6-1 1.5 1 3.5 1 5-1" /></svg>); }
function RouteIcon() { return (<svg {...iconBase}><circle cx="6" cy="19" r="2" /><circle cx="18" cy="5" r="2" /><path d="M8 19h9a3 3 0 0 0 0-6H7a3 3 0 0 1 0-6h9" /></svg>); }
function BedIcon() { return (<svg {...iconBase}><path d="M3 20V8m0 5h18v7M21 20v-4a3 3 0 0 0-3-3H9v7" /><path d="M6.5 11.5a1.5 1.5 0 1 0 0-.01" /></svg>); }
function CalendarIcon() { return (<svg {...iconBase}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>); }
function PenIcon() { return (<svg {...iconBase}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z" /></svg>); }
function SearchIcon() { return (<svg {...iconBase} className="h-4 w-4"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>); }
function ArrowLeftIcon() { return (<svg {...iconBase} className="h-4 w-4"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>); }