"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  DollarSign,
  Download,
  FileText,
  Flag,
  MessageSquare,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

import ErrorState from "@/components/ui/ErrorState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import UserAvatar from "@/components/ui/UserAvatar";
import { adminApi } from "@/lib/api";
import {
  buildAdminAnalyticsData,
  normalizeAdminActivity,
  normalizeAdminStats,
} from "@/lib/admin";
import { formatCompactNumber } from "@/lib/marketplace";
import { toastSuccess } from "@/lib/toast";

function parseNumber(value, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function getInitials(name) {
  return String(name || "PF")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function StatCard({ icon: Icon, label, meta, tone, value }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-[2rem] font-semibold tracking-[-0.04em] text-slate-950">{value}</p>
          <p className="mt-1 text-xs text-emerald-600">{meta}</p>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ children, controlLabel = "Last 7 Days", title }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
          {controlLabel}
        </span>
      </div>
      {children}
    </section>
  );
}

function LineChart({ points, tone = "violet" }) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const gradientClass =
    tone === "emerald"
      ? "bg-[linear-gradient(180deg,rgba(16,185,129,0.14)_0%,rgba(16,185,129,0.34)_100%)]"
      : "bg-[linear-gradient(180deg,rgba(124,58,237,0.16)_0%,rgba(99,102,241,0.4)_100%)]";
  const dotClass = tone === "emerald" ? "bg-emerald-500" : "bg-violet-500";

  return (
    <div className="grid grid-cols-7 gap-3">
      {points.map((point) => (
        <div key={point.label} className="flex flex-col items-center gap-3">
          <div className="relative flex h-52 w-full items-end">
            <div className={`w-full rounded-t-[24px] ${gradientClass}`} style={{ height: `${Math.max(18, (point.value / maxValue) * 100)}%` }}>
              <span className={`mx-auto mt-2 block h-2.5 w-2.5 rounded-full ${dotClass}`} />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-900">{formatCompactNumber(point.value)}</p>
            <p className="mt-1 text-xs text-slate-400">{point.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function BarChart({ bars }) {
  const maxValue = Math.max(...bars.map((item) => item.value), 1);

  return (
    <div className="grid grid-cols-7 gap-4">
      {bars.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-3">
          <div className="flex h-52 w-full items-end justify-center">
            <div
              className="w-10 rounded-t-[18px] bg-[linear-gradient(180deg,#8b5cf6_0%,#6366f1_100%)] shadow-[0_16px_30px_rgba(99,102,241,0.2)]"
              style={{ height: `${Math.max(18, (item.value / maxValue) * 100)}%` }}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-900">{formatCompactNumber(item.value)}</p>
            <p className="mt-1 text-xs text-slate-400">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ items }) {
  const gradient = `conic-gradient(${items
    .map((item, index) => {
      const start = items.slice(0, index).reduce((sum, current) => sum + current.percent, 0);
      const end = start + item.percent;
      return `var(--slice-${index}) ${start}% ${end}%`;
    })
    .join(", ")})`;

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-center">
      <div
        className="mx-auto h-44 w-44 rounded-full"
        style={{
          background: gradient,
          "--slice-0": "#7c3aed",
          "--slice-1": "#10b981",
          "--slice-2": "#f59e0b",
          "--slice-3": "#3b82f6",
          "--slice-4": "#d946ef",
          "--slice-5": "#c084fc",
          "--slice-6": "#818cf8",
        }}
      >
        <div className="mx-auto mt-[22px] flex h-32 w-32 items-center justify-center rounded-full bg-white text-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Categories</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{items.length}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.label} className="flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: ["#7c3aed", "#10b981", "#f59e0b", "#3b82f6", "#d946ef", "#c084fc", "#818cf8"][index],
                }}
              />
              <span className="text-sm text-slate-600">{item.label}</span>
            </div>
            <span className="text-sm font-semibold text-slate-900">{item.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HorizontalUsageChart({ items }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label} className="grid gap-2 md:grid-cols-[140px_minmax(0,1fr)_72px] md:items-center">
          <span className="text-sm text-slate-600">{item.label}</span>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#3b82f6_0%,#2563eb_100%)]"
              style={{ width: `${item.percent}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-slate-900">{item.percent}%</span>
        </div>
      ))}
    </div>
  );
}

function ListPanel({ actionLabel = "View All", children, title }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
        <button
          className="text-sm font-semibold text-primary transition hover:text-secondary"
          onClick={() => toastSuccess(`${title} details can be connected next.`)}
          type="button"
        >
          {actionLabel}
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function RecentUserRow({ item }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 px-3 py-3">
      <UserAvatar
        alt={item.name}
        className="h-11 w-11 bg-brand-gradient text-xs text-white"
        fallback={getInitials(item.name)}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
        <p className="truncate text-xs text-slate-500">{item.email}</p>
      </div>
      <span className="text-xs text-slate-400">{item.timeAgo}</span>
    </div>
  );
}

function PaymentRow({ item }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 px-3 py-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
        <DollarSign className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
        <p className="mt-1 text-xs text-slate-500">{item.subtitle}</p>
      </div>
      <div className="space-y-2 text-right">
        <p className="text-sm font-semibold text-slate-900">{item.amount}</p>
        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
          {item.status}
        </span>
      </div>
    </div>
  );
}

function AlertRow({ item }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 px-3 py-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-amber-600">{item.title}</p>
        <p className="mt-1 text-xs text-slate-500">{item.subtitle}</p>
      </div>
      <span className="text-xs text-slate-400">{item.timeAgo}</span>
    </div>
  );
}

export default function AdminAnalytics() {
  const [state, setState] = useState({
    status: "loading",
    error: "",
    stats: null,
    analytics: null,
  });
  const [range, setRange] = useState("May 24 - May 30, 2024");

  async function loadAnalytics() {
    setState((current) => ({
      ...current,
      status: current.stats ? "refreshing" : "loading",
      error: "",
    }));

    try {
      const [statsResult, revenueResult, activityResult] = await Promise.all([
        adminApi.getStats(),
        adminApi.getRevenue(),
        adminApi.getRecentActivity(),
      ]);

      const activity = normalizeAdminActivity(activityResult);
      const rawRevenue =
        revenueResult?.totalRevenue ||
        revenueResult?.revenue ||
        revenueResult?.data?.totalRevenue ||
        revenueResult?.data?.revenue ||
        revenueResult?.result?.totalRevenue ||
        revenueResult?.result?.revenue;
      const normalizedStats = normalizeAdminStats(
        {
          ...(statsResult?.stats || statsResult?.data || statsResult?.result || statsResult || {}),
          totalRevenue: parseNumber(rawRevenue, undefined) || undefined,
        },
      );

      setState({
        status: "success",
        error: "",
        stats: normalizedStats,
        analytics: buildAdminAnalyticsData({ activity, stats: normalizedStats }),
      });
    } catch (error) {
      setState({
        status: "error",
        error: error.message || "Unable to load analytics overview.",
        stats: null,
        analytics: null,
      });
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadAnalytics();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const statCards = useMemo(() => {
    if (!state.stats) {
      return [];
    }

    return [
      { id: "users", label: "Total Users", value: formatCompactNumber(state.stats.totalUsers), meta: "↑ 12.5% vs last 30 days", icon: Users, tone: "bg-violet-50 text-violet-500" },
      { id: "creators", label: "Total Creators", value: formatCompactNumber(state.stats.totalCreators), meta: "↑ 8.4% vs last 30 days", icon: Sparkles, tone: "bg-emerald-50 text-emerald-500" },
      { id: "prompts", label: "Total Prompts", value: formatCompactNumber(state.stats.totalPrompts), meta: "↑ 15.3% vs last 30 days", icon: FileText, tone: "bg-amber-50 text-amber-500" },
      { id: "reviews", label: "Total Reviews", value: formatCompactNumber(state.stats.totalReviews), meta: "↑ 10.7% vs last 30 days", icon: MessageSquare, tone: "bg-fuchsia-50 text-fuchsia-500" },
      { id: "copies", label: "Total Copies", value: formatCompactNumber(state.stats.totalCopies), meta: "↑ 18.9% vs last 30 days", icon: ClipboardList, tone: "bg-blue-50 text-blue-500" },
      { id: "revenue", label: "Total Revenue", value: formatCurrency(state.stats.totalRevenue), meta: "↑ 22.6% vs last 30 days", icon: DollarSign, tone: "bg-emerald-50 text-emerald-500" },
    ];
  }, [state.stats]);

  if (state.status === "loading") {
    return <LoadingSpinner className="min-h-[50vh]" label="Loading analytics overview" />;
  }

  if (state.status === "error" || !state.stats || !state.analytics) {
    return (
      <ErrorState
        description={state.error || "Unable to load analytics overview."}
        onRetry={loadAnalytics}
        title="Unable to load analytics overview"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[2rem] font-semibold tracking-[-0.04em] text-slate-950 md:text-[2.35rem]">
            Analytics Overview
          </h1>
          <p className="mt-2 text-base text-slate-500">
            Track platform performance and key metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex min-h-[52px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            <span>{range}</span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </div>
          <button
            className="inline-flex min-h-[52px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            onClick={() => toastSuccess("Analytics export UI is ready for a future download flow.")}
            type="button"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {statCards.map((card) => (
          <StatCard key={card.id} {...card} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <ChartCard title="User Growth">
          <LineChart points={state.analytics.userGrowth} />
        </ChartCard>
        <ChartCard title="Prompt Submissions">
          <BarChart bars={state.analytics.promptSubmissions} />
        </ChartCard>
        <ChartCard title="Revenue (USD)">
          <LineChart points={state.analytics.revenue} tone="emerald" />
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.6fr]">
        <ChartCard title="Prompt Category Distribution">
          <DonutChart items={state.analytics.categoryDistribution} />
        </ChartCard>
        <ChartCard title="AI Tool Usage">
          <HorizontalUsageChart items={state.analytics.aiToolUsage} />
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <ListPanel title="Recent Users">
          {state.analytics.recentUsers.map((item) => (
            <RecentUserRow key={item.id} item={item} />
          ))}
        </ListPanel>

        <ListPanel title="Recent Payments">
          {state.analytics.recentPayments.map((item) => (
            <PaymentRow key={item.id} item={item} />
          ))}
        </ListPanel>

        <ListPanel title="Pending Moderation Alerts">
          {state.analytics.pendingModerationAlerts.map((item) => (
            <AlertRow key={item.id} item={item} />
          ))}
          <button
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
            onClick={() => toastSuccess("Moderation queue entry point is ready.")}
            type="button"
          >
            <Flag className="h-4 w-4" />
            Moderation Queue
          </button>
        </ListPanel>
      </section>
    </div>
  );
}
