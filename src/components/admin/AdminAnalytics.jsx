"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  ClipboardList,
  DollarSign,
  Download,
  FileText,
  Flag,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";

import ErrorState from "@/components/ui/ErrorState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import UserAvatar from "@/components/ui/UserAvatar";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { adminApi } from "@/lib/api";
import { normalizeAdminReports, normalizeAdminStats } from "@/lib/admin";
import { formatCompactNumber } from "@/lib/marketplace";
import { normalizePayments } from "@/lib/payments";
import { toastSuccess } from "@/lib/toast";

const CHART_COLORS = ["#7c3aed", "#10b981", "#f59e0b", "#3b82f6", "#d946ef", "#c084fc", "#818cf8", "#14b8a6"];
const SUCCESS_PAYMENT_STATUSES = new Set(["paid", "completed", "succeeded"]);

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

function formatDayLabel(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
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

function getSafeDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function isSuccessfulPayment(payment) {
  return SUCCESS_PAYMENT_STATUSES.has(String(payment?.statusValue || payment?.paymentStatus || payment?.status || "").toLowerCase());
}

function formatRelativeTime(value) {
  const date = getSafeDate(value);

  if (!date) {
    return "Recently";
  }

  const diff = Date.now() - date.getTime();
  const hours = Math.max(1, Math.round(diff / 3600000));

  if (hours < 24) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  const days = Math.max(1, Math.round(hours / 24));
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function getRoleLabel(user) {
  const normalized = String(user?.role || "user").toLowerCase();

  if (normalized.includes("admin")) {
    return "Admin";
  }

  if (normalized.includes("creator")) {
    return "Creator";
  }

  return "User";
}

function normalizeUsers(payload) {
  const items = Array.isArray(payload?.users)
    ? payload.users
    : Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
    ? payload
    : [];

  return items.map((item, index) => ({
    id: item?._id || item?.id || `user-${index}`,
    name: item?.name || item?.fullName || item?.username || "PromptFlow User",
    email: item?.email || "Email unavailable",
    role: getRoleLabel(item),
    createdAt: item?.createdAt || item?.joinedAt || item?.updatedAt || new Date().toISOString(),
  }));
}

function buildSevenDaySeries(items, getDateValue, getMetricValue = () => 1) {
  const today = startOfDay(new Date());
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return date;
  });

  return days.map((date) => {
    const dayStart = startOfDay(date).getTime();
    const dayEnd = dayStart + 86400000;
    const value = items.reduce((sum, item) => {
      const itemDate = getSafeDate(getDateValue(item));

      if (!itemDate) {
        return sum;
      }

      const itemTime = itemDate.getTime();
      return itemTime >= dayStart && itemTime < dayEnd ? sum + getMetricValue(item) : sum;
    }, 0);

    return {
      label: formatDayLabel(date),
      value,
    };
  });
}

function buildPromptCategoryDistribution(prompts) {
  const categoryMap = new Map();

  prompts.forEach((prompt) => {
    const label = String(prompt?.category || "Uncategorized").trim() || "Uncategorized";
    categoryMap.set(label, (categoryMap.get(label) || 0) + 1);
  });

  const totalPrompts = prompts.length;

  return [...categoryMap.entries()]
    .map(([label, count]) => ({
      label,
      count,
      percent: totalPrompts > 0 ? Number(((count / totalPrompts) * 100).toFixed(1)) : 0,
    }))
    .filter((item) => item.count > 0)
    .sort((left, right) => right.count - left.count);
}

function buildAiToolUsage(prompts) {
  const toolMap = new Map();

  prompts.forEach((prompt) => {
    const label = String(prompt?.aiTool || prompt?.model || "Other").trim() || "Other";
    toolMap.set(label, (toolMap.get(label) || 0) + 1);
  });

  const totalPrompts = prompts.length;

  return [...toolMap.entries()]
    .map(([label, count]) => ({
      label,
      count,
      percent: totalPrompts > 0 ? Number(((count / totalPrompts) * 100).toFixed(1)) : 0,
    }))
    .filter((item) => item.count > 0)
    .sort((left, right) => right.count - left.count)
    .slice(0, 6);
}

function buildRecentUsers(users) {
  return [...users]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 5)
    .map((user) => ({
      ...user,
      timeAgo: formatRelativeTime(user.createdAt),
    }));
}

function buildRecentPayments(payments) {
  return payments
    .filter(isSuccessfulPayment)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 5)
    .map((payment) => ({
      id: payment.id,
      title: `${String(payment.planName || payment.plan || "Premium").replace(/[-_]/g, " ")} payment`,
      subtitle: payment.userName
        ? `${payment.userName}${payment.userEmail ? ` • ${payment.userEmail}` : ""}`
        : payment.userEmail || "PromptFlow customer",
      amount: formatCurrency(payment.amount),
      status: payment.status,
      createdAt: payment.createdAt,
      createdLabel: payment.createdLabel,
    }));
}

function buildPendingModerationAlerts(prompts, reports) {
  const pendingPromptAlerts = prompts
    .filter((prompt) => String(prompt?.status || "").toLowerCase() === "pending")
    .map((prompt) => ({
      id: `prompt-${prompt.id || prompt._id}`,
      title: prompt.title || "Pending prompt",
      subtitle: prompt.creatorName || prompt.creatorEmail || "Prompt creator",
      createdAt: prompt.createdAt,
      href: "/admin/prompts",
      source: "prompt",
    }));

  const openReportAlerts = reports
    .filter((report) => {
      const normalized = String(report?.status || "").toLowerCase();
      return normalized === "open" || normalized === "pending";
    })
    .map((report) => ({
      id: `report-${report.id}`,
      title: report.promptTitle || report.reason || "Reported prompt",
      subtitle: report.creatorName || report.reportedByName || "Prompt creator",
      createdAt: report.reportDate,
      href: "/admin/reports",
      source: "report",
    }));

  const uniqueAlerts = [...pendingPromptAlerts, ...openReportAlerts].filter((item, index, items) => {
    const itemKey = `${item.title}::${item.subtitle}`;
    return items.findIndex((candidate) => `${candidate.title}::${candidate.subtitle}` === itemKey) === index;
  });

  return uniqueAlerts
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 5)
    .map((item) => ({
      ...item,
      timeAgo: formatRelativeTime(item.createdAt),
    }));
}

function buildAnalyticsState({ payments, prompts, reports, users }) {
  const categoryDistribution = buildPromptCategoryDistribution(prompts);
  const aiToolUsage = buildAiToolUsage(prompts);

  return {
    userGrowth: buildSevenDaySeries(users, (item) => item.createdAt),
    promptSubmissions: buildSevenDaySeries(prompts, (item) => item.createdAt),
    revenue: buildSevenDaySeries(
      payments.filter(isSuccessfulPayment),
      (item) => item.createdAt,
      (item) => parseNumber(item.amount, 0),
    ),
    categoryDistribution,
    aiToolUsage,
    recentUsers: buildRecentUsers(users),
    recentPayments: buildRecentPayments(payments),
    pendingModerationAlerts: buildPendingModerationAlerts(prompts, reports),
  };
}

function buildRangeLabel() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);

  return `${formatDayLabel(start)} - ${formatDayLabel(end)}`;
}

function EmptyListState({ description, title }) {
  return (
    <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, meta, tone, value }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
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
            <div
              className={`w-full rounded-t-[24px] ${gradientClass}`}
              style={{ height: `${Math.max(18, (point.value / maxValue) * 100)}%` }}
            >
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
  if (items.length === 0) {
    return (
      <EmptyListState
        description="Add prompts with categories to populate the distribution chart."
        title="No category data available"
      />
    );
  }

  const gradient = `conic-gradient(${items
    .map((item, index) => {
      const start = items.slice(0, index).reduce((sum, current) => sum + current.percent, 0);
      const end = start + item.percent;
      return `${CHART_COLORS[index % CHART_COLORS.length]} ${start}% ${end}%`;
    })
    .join(", ")})`;

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_minmax(260px,1fr)] lg:items-center">
      <div className="mx-auto">
        <div
          className="h-44 w-44 rounded-full"
          style={{
            background: gradient,
          }}
        >
          <div className="mx-auto mt-[22px] flex h-32 w-32 items-center justify-center rounded-full bg-white text-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Categories</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{items.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="min-w-0">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {items.map((item, index) => (
            <div key={item.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-slate-100 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{
                    backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                  }}
                />
                <span className="truncate text-sm text-slate-600">{item.label}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{item.percent}%</p>
                <p className="text-xs text-slate-400">{item.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HorizontalUsageChart({ items }) {
  if (items.length === 0) {
    return (
      <EmptyListState
        description="AI tool usage will appear here after prompts are created."
        title="No AI tool usage available"
      />
    );
  }

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

function ListPanel({ actionHref, actionLabel = "View All", children, title }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
        <Link className="text-sm font-semibold text-primary transition hover:text-secondary" href={actionHref}>
          {actionLabel}
        </Link>
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
      <div className="text-right">
        <p className="text-xs font-medium text-slate-500">{item.role}</p>
        <p className="mt-1 text-xs text-slate-400">{item.timeAgo}</p>
      </div>
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
        <p className="text-xs text-slate-400">{item.createdLabel}</p>
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
  const { authLoading, canLoadAdminData, isAdmin } = useAdminAccess();
  const [state, setState] = useState({
    status: "loading",
    error: "",
    stats: null,
    analytics: null,
  });

  async function loadAnalytics() {
    setState((current) => ({
      ...current,
      status: current.stats ? "refreshing" : "loading",
      error: "",
    }));

    try {
      const [statsResult, revenueResult, usersResult, paymentsResult, reportsResult, promptsResult] = await Promise.all([
        adminApi.getStats(),
        adminApi.getRevenue(),
        adminApi.getUsers(),
        adminApi.getPayments(),
        adminApi.getReports(),
        adminApi.getPrompts(),
      ]);

      const users = normalizeUsers(usersResult);
      const payments = normalizePayments(paymentsResult).sort(
        (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      );
      const reports = normalizeAdminReports(reportsResult);
      const prompts = Array.isArray(promptsResult?.prompts)
        ? promptsResult.prompts
        : Array.isArray(promptsResult?.data)
        ? promptsResult.data
        : Array.isArray(promptsResult)
        ? promptsResult
        : [];
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
          totalUsers: users.length,
          totalPrompts: prompts.length,
          totalPayments: payments.filter(isSuccessfulPayment).length,
        },
        reports,
      );

      setState({
        status: "success",
        error: "",
        stats: normalizedStats,
        analytics: buildAnalyticsState({ payments, prompts, reports, users }),
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
    if (!canLoadAdminData) {
      return;
    }

    const timer = window.setTimeout(() => {
      loadAnalytics();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [canLoadAdminData]);

  const rangeLabel = useMemo(() => buildRangeLabel(), []);

  const statCards = useMemo(() => {
    if (!state.stats || !state.analytics) {
      return [];
    }

    const payments = state.analytics.recentPayments.length;

    return [
      {
        id: "users",
        label: "Total Users",
        value: formatCompactNumber(state.stats.totalUsers),
        meta: `${state.analytics.userGrowth.reduce((sum, item) => sum + item.value, 0)} joined in the last 7 days`,
        icon: Users,
        tone: "bg-violet-50 text-violet-500",
      },
      {
        id: "creators",
        label: "Total Creators",
        value: formatCompactNumber(state.stats.totalCreators),
        meta: `${state.analytics.categoryDistribution.length} active prompt categories`,
        icon: Sparkles,
        tone: "bg-emerald-50 text-emerald-500",
      },
      {
        id: "prompts",
        label: "Total Prompts",
        value: formatCompactNumber(state.stats.totalPrompts),
        meta: `${state.analytics.promptSubmissions.reduce((sum, item) => sum + item.value, 0)} created in the last 7 days`,
        icon: FileText,
        tone: "bg-amber-50 text-amber-500",
      },
      {
        id: "reviews",
        label: "Total Reviews",
        value: formatCompactNumber(state.stats.totalReviews),
        meta: `${state.stats.averageRating.toFixed(1)} average rating across reviews`,
        icon: MessageSquare,
        tone: "bg-fuchsia-50 text-fuchsia-500",
      },
      {
        id: "copies",
        label: "Total Copies",
        value: formatCompactNumber(state.stats.totalCopies),
        meta: `${state.analytics.aiToolUsage.length} AI tools currently in use`,
        icon: ClipboardList,
        tone: "bg-blue-50 text-blue-500",
      },
      {
        id: "revenue",
        label: "Total Revenue",
        value: formatCurrency(state.stats.totalRevenue),
        meta: `${payments} recent successful payments loaded`,
        icon: DollarSign,
        tone: "bg-emerald-50 text-emerald-500",
      },
    ];
  }, [state.analytics, state.stats]);

  if (authLoading) {
    return <LoadingSpinner className="min-h-[50vh]" label="Checking admin access" />;
  }

  if (!isAdmin) {
    return null;
  }

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
            <span>{rangeLabel}</span>
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
        <ListPanel actionHref="/admin/users" title="Recent Users">
          {state.analytics.recentUsers.length > 0 ? (
            state.analytics.recentUsers.map((item) => (
              <RecentUserRow key={item.id} item={item} />
            ))
          ) : (
            <EmptyListState
              description="Newly registered users will appear here once accounts are created."
              title="No recent users"
            />
          )}
        </ListPanel>

        <ListPanel actionHref="/admin/payments" title="Recent Payments">
          {state.analytics.recentPayments.length > 0 ? (
            state.analytics.recentPayments.map((item) => (
              <PaymentRow key={item.id} item={item} />
            ))
          ) : (
            <EmptyListState
              description="Successful payments will appear here after premium purchases complete."
              title="No recent payments"
            />
          )}
        </ListPanel>

        <ListPanel actionHref="/admin/reports" title="Pending Moderation Alerts">
          {state.analytics.pendingModerationAlerts.length > 0 ? (
            state.analytics.pendingModerationAlerts.map((item) => (
              <AlertRow key={item.id} item={item} />
            ))
          ) : (
            <EmptyListState
              description="Pending prompts and open reports will appear here when moderation needs attention."
              title="No pending moderation alerts"
            />
          )}
          {state.analytics.pendingModerationAlerts.length > 0 ? (
            <Link
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
              href="/admin/reports"
            >
              <Flag className="h-4 w-4" />
              Moderation Queue
            </Link>
          ) : null}
        </ListPanel>
      </section>
    </div>
  );
}
