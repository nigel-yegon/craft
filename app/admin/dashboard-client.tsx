// app/admin/dashboard-client.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import FadeIn from "../components/fade-in";
import { Stagger } from "../components/stagger";
import { useScrollDirection } from "../components/use-scroll-direction";

import { PaymentsPanel } from "./payments/payments-panel";
import { QuotesPanel } from "./quotes/quotes-panel";

// ─── Types ────────────────────────────────────────────────────────

type ModuleKey = "overview" | "quotes" | "payments";

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

const HEADER_HEIGHT = "lg:min-h-24";

// ─── Tones ────────────────────────────────────────────────────────

const TONES: Record<Exclude<ModuleKey, "overview">, ModuleTone> = {
  quotes: {
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
    icon: <QuoteIcon />,
  },
  payments: {
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
    icon: <WalletIcon />,
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
    key: "operations",
    label: "Operations",
    modules: [
      { key: "quotes", label: "Quotes", description: "Requests → quotes", icon: TONES.quotes.icon, tone: TONES.quotes },
      { key: "payments", label: "Payments", description: "Invoices & M-Pesa", icon: TONES.payments.icon, tone: TONES.payments },
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
              {activeModule === "quotes" && <QuotesPanel search={search} />}
              {activeModule === "payments" && <PaymentsPanel search={search} />}
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
    <aside className="sticky top-0 z-20 hidden h-screen w-72 shrink-0 lg:block">
      <div className="flex h-full flex-col border-r border-deep-200 bg-cream-100 dark:border-deep-800 dark:bg-deep-900">
        <div
          className={[
            "sticky top-0 z-20 flex items-center border-b bg-cream-100 dark:bg-deep-900 border-deep-200 px-6 dark:border-deep-800",
            HEADER_HEIGHT,
          ].join(" ")}
        >
          <Link href="/" className="group flex w-full items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-deep-500 dark:text-cream-500">
                Welcome back
              </div>
              <h2 className="truncate text-2xl font-bold tracking-tight text-deep-800 dark:text-cream-100">
                Hello, {userName}.
              </h2>
            </div>
          </Link>
        </div>

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
    quotes: "Quotes",
    payments: "Payments",
  };

  const searchable = activeModule !== "overview";

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
      <div
        className={[
          "flex flex-col gap-5 px-6 py-5",
          "lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-0",
          HEADER_HEIGHT,
        ].join(" ")}
      >
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

// ─── Overview ────────────────────────────────────────────────────

function Overview({ onNavigate }: { onNavigate: (m: ModuleKey) => void }) {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { key: "quotes" as const, label: "Quotes", value: 0 },
          { key: "payments" as const, label: "Payments", value: 0 },
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
          Overview stats, charts and activity lists go here.
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
function SearchIcon() { return (<svg {...iconBase} className="h-4 w-4"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>); }
function ArrowLeftIcon() { return (<svg {...iconBase} className="h-4 w-4"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>); }
function WalletIcon() {
  return (
    <svg {...iconBase}>
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}
function QuoteIcon() {
  return (
    <svg {...iconBase}>
      <path d="M6 2h9l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
      <path d="M14 2v4h4" />
      <path d="M8 12h8M8 16h5" />
    </svg>
  );
}