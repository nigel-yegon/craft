// app/admin/dashboard-client.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import { useEffect } from "react";   // add to the existing react import line
import { getOverviewStats, type OverviewStats } from "./actions/stats";

import FadeIn from "../components/fade-in";
import { Stagger } from "../components/stagger";
import { useScrollDirection } from "../components/use-scroll-direction";

import { PaymentsPanel } from "./payments/payments-panel";
import { QuotesPanel } from "./quotes/quotes-panel";
import { ProjectsPanel } from "./projects/projects-panel";
import { AccountingPanel } from "./accounting/accounting-panel";

// ─── Types ────────────────────────────────────────────────────────

type ModuleKey = "overview" | "quotes" | "payments" | "projects" | "accounting";

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
  projects: {
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
    icon: <BriefcaseIcon />,
  },
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
  accounting: {
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
    icon: <CalculatorIcon />,
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
    key: "content",
    label: "Content",
    modules: [
      { key: "projects", label: "Portfolio", description: "Projects & case studies", icon: TONES.projects.icon, tone: TONES.projects },
    ],
  },
  {
    key: "operations",
    label: "Operations",
    modules: [
      { key: "quotes", label: "Quotes", description: "Requests → quotes", icon: TONES.quotes.icon, tone: TONES.quotes },
      { key: "payments", label: "Payments", description: "Invoices & M-Pesa", icon: TONES.payments.icon, tone: TONES.payments },
      { key: "accounting", label: "Accounting", description: "Revenue, expenses, reports", icon: TONES.accounting.icon, tone: TONES.accounting },
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
              {activeModule === "projects" && <ProjectsPanel search={search} />}
              {activeModule === "accounting" && <AccountingPanel />}
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
            "flex items-center border-b border-deep-200 px-6 dark:border-deep-800",
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
    projects: "Portfolio",
    accounting: "Accounting",
  };

  const searchable = activeModule !== "overview" && activeModule !== "accounting";

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

// app/admin/dashboard-client.tsx — replace the Overview function
// and add these imports at the top:

// import { useEffect } from "react";     ← add this to existing react imports
// import { getOverviewStats, type OverviewStats } from "./actions/stats";

function Overview({ onNavigate }: { onNavigate: (m: ModuleKey) => void }) {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getOverviewStats();
        if (!cancelled) setStats(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* KPI strip */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Projects"
          value={stats?.projects.total ?? 0}
          secondary={
            stats
              ? `${stats.projects.published} published · ${stats.projects.featured} featured`
              : undefined
          }
          loading={loading}
          tone="projects"
          onClick={() => onNavigate("projects")}
        />
        <Kpi
          label="Quotes"
          value={stats?.quotes.quotes ?? 0}
          secondary={
            stats
              ? `${stats.quotes.pendingRequests} new requests · ${stats.quotes.acceptedQuotes} accepted`
              : undefined
          }
          loading={loading}
          tone="quotes"
          onClick={() => onNavigate("quotes")}
        />
        <Kpi
          label="Invoices"
          value={stats?.payments.invoices ?? 0}
          secondary={
            stats
              ? `${stats.payments.paid} paid · ${stats.payments.pending} pending`
              : undefined
          }
          loading={loading}
          tone="payments"
          onClick={() => onNavigate("payments")}
        />
        <Kpi
          label="Revenue"
          value={stats?.accounting.revenue ?? 0}
          secondary={
            stats
              ? `Expenses KES ${stats.accounting.expenses.toLocaleString()}`
              : undefined
          }
          loading={loading}
          tone="accounting"
          onClick={() => onNavigate("accounting")}
          isCurrency
        />
      </section>

      {/* Financial summary */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-deep-200 bg-cream-50 p-5 dark:border-deep-800 dark:bg-deep-900">
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-deep-500 dark:text-cream-500">
            Financial position
          </h3>
          {loading || !stats ? (
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 animate-pulse rounded bg-cream-100 dark:bg-deep-800" />
              ))}
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <Row label="Revenue (paid)" value={stats.accounting.revenue} tone="emerald" />
              <Row label="Expenses (approved)" value={stats.accounting.expenses} tone="rose" />
              <div className="border-t border-deep-200 pt-3 dark:border-deep-800">
                <Row
                  label="Net profit"
                  value={stats.accounting.profit}
                  tone={stats.accounting.profit >= 0 ? "emerald" : "rose"}
                  bold
                />
              </div>
              <div className="border-t border-deep-200 pt-3 dark:border-deep-800">
                <Row label="Receivables (pending invoices)" value={stats.accounting.receivables} tone="amber" />
                <Row label="Payables (pending expenses)" value={stats.accounting.payables} tone="amber" />
              </div>
            </div>
          )}
        </div>

        {/* Pipeline breakdown */}
        <div className="rounded-2xl border border-deep-200 bg-cream-50 p-5 dark:border-deep-800 dark:bg-deep-900">
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-deep-500 dark:text-cream-500">
            Pipeline
          </h3>
          {loading || !stats ? (
            <div className="mt-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-6 animate-pulse rounded bg-cream-100 dark:bg-deep-800" />
              ))}
            </div>
          ) : (
            <div className="mt-4 space-y-3 text-sm">
              <PipelineRow
                label="Quote requests"
                value={stats.quotes.requests}
                sub={`${stats.quotes.pendingRequests} awaiting pricing`}
                tone="quotes"
                onClick={() => onNavigate("quotes")}
              />
              <PipelineRow
                label="Quotes issued"
                value={stats.quotes.quotes}
                sub={`KES ${stats.quotes.totalQuotedValue.toLocaleString()} total value`}
                tone="quotes"
                onClick={() => onNavigate("quotes")}
              />
              <PipelineRow
                label="Invoices"
                value={stats.payments.invoices}
                sub={`KES ${stats.payments.totalOutstanding.toLocaleString()} outstanding`}
                tone="payments"
                onClick={() => onNavigate("payments")}
              />
              <PipelineRow
                label="Projects"
                value={stats.projects.total}
                sub={`${stats.projects.byStatus.IN_PROGRESS ?? 0} in progress · ${stats.projects.byStatus.COMPLETED ?? 0} completed`}
                tone="projects"
                onClick={() => onNavigate("projects")}
              />
            </div>
          )}
        </div>
      </section>

      {/* Recent activity */}
      <section className="grid gap-4 md:grid-cols-2">
        <ActivityCard
          title="Recent projects"
          loading={loading}
          items={(stats?.recentActivity.projects ?? []).map((p) => ({
            id: p.title,
            primary: p.title,
            secondary: p.status,
            meta: new Date(p.createdAt).toLocaleDateString(),
          }))}
          empty="No projects yet"
          onViewAll={() => onNavigate("projects")}
        />
        <ActivityCard
          title="Recent invoices"
          loading={loading}
          items={(stats?.recentActivity.invoices ?? []).map((i) => ({
            id: i.invoiceNumber,
            primary: i.invoiceNumber,
            secondary: `${i.customerName} · KES ${i.amount.toLocaleString()}`,
            meta: i.status,
          }))}
          empty="No invoices yet"
          onViewAll={() => onNavigate("payments")}
        />
      </section>
    </div>
  );
}

// ─── Overview helpers ────────────────────────────────────────────

function Kpi({
  label,
  value,
  secondary,
  loading,
  tone,
  onClick,
  isCurrency,
}: {
  label: string;
  value: number;
  secondary?: string;
  loading: boolean;
  tone: keyof typeof TONES;
  onClick: () => void;
  isCurrency?: boolean;
}) {
  const meta = TONES[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-cream-50 px-4 py-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-deep-900 ${meta.border}`}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${meta.bar}`} aria-hidden />
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-500 dark:text-cream-500">
        {label}
      </span>
      <div className="mt-2 text-2xl font-bold tracking-tight text-deep-800 dark:text-cream-100">
        {loading ? (
          <span className="inline-block h-7 w-16 animate-pulse rounded bg-cream-100 dark:bg-deep-800" />
        ) : isCurrency ? (
          `KES ${value.toLocaleString()}`
        ) : (
          value.toLocaleString()
        )}
      </div>
      {secondary && !loading && (
        <span className="mt-1 text-[10px] text-deep-400 dark:text-cream-600">
          {secondary}
        </span>
      )}
    </button>
  );
}

function Row({
  label,
  value,
  tone,
  bold,
}: {
  label: string;
  value: number;
  tone: "emerald" | "rose" | "amber";
  bold?: boolean;
}) {
  const colors = {
    emerald: "text-emerald-700 dark:text-emerald-300",
    rose: "text-rose-700 dark:text-rose-300",
    amber: "text-amber-700 dark:text-amber-300",
  };
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-deep-600 dark:text-cream-400">{label}</span>
      <span
        className={`font-mono text-sm ${colors[tone]} ${bold ? "font-bold" : ""}`}
      >
        KES {value.toLocaleString()}
      </span>
    </div>
  );
}

function PipelineRow({
  label,
  value,
  sub,
  tone,
  onClick,
}: {
  label: string;
  value: number;
  sub: string;
  tone: keyof typeof TONES;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left transition hover:bg-cream-100 dark:hover:bg-deep-800"
    >
      <div>
        <p className="text-sm font-medium text-deep-800 dark:text-cream-100">
          {label}
        </p>
        <p className="text-[10px] text-deep-500 dark:text-cream-500">{sub}</p>
      </div>
      <span className={`font-mono text-lg font-bold ${TONES[tone].text}`}>
        {value}
      </span>
    </button>
  );
}

function ActivityCard({
  title,
  items,
  empty,
  loading,
  onViewAll,
}: {
  title: string;
  items: { id: string; primary: string; secondary: string; meta: string }[];
  empty: string;
  loading: boolean;
  onViewAll: () => void;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-deep-200 bg-cream-50 dark:border-deep-800 dark:bg-deep-900">
      <div className="flex items-center justify-between border-b border-deep-200 px-4 py-3 dark:border-deep-800">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-deep-500 dark:text-cream-500">
          {title}
        </h3>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          View all →
        </button>
      </div>
      {loading ? (
        <div className="space-y-2 p-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded bg-cream-100 dark:bg-deep-800"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-4 py-8 text-xs text-deep-400 dark:text-cream-600">
          {empty}
        </div>
      ) : (
        <ul className="divide-y divide-deep-100 dark:divide-deep-800">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-2 px-4 py-2.5 text-xs"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-deep-800 dark:text-cream-100">
                  {item.primary}
                </p>
                <p className="truncate text-deep-500 dark:text-cream-500">
                  {item.secondary}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-cream-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-deep-600 dark:bg-deep-800 dark:text-cream-400">
                {item.meta}
              </span>
            </li>
          ))}
        </ul>
      )}
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
function BriefcaseIcon() {
  return (
    <svg {...iconBase}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <path d="M2 13h20" />
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
function CalculatorIcon() {
  return (
    <svg {...iconBase}>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8" />
      <path d="M8 10h2M12 10h2M16 10h2" />
      <path d="M8 14h2M12 14h2M16 14h2" />
      <path d="M8 18h2M12 18h2M16 18h2" />
    </svg>
  );
}