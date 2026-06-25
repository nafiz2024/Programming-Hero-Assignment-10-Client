"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  ClipboardList,
  DollarSign,
  FileText,
  Flag,
  MessageSquare,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ErrorState from "@/components/ui/ErrorState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { adminApi } from "@/lib/api";
import { formatCompactNumber } from "@/lib/marketplace";
import {
  getStatusBadgeClass,
  normalizeAdminActivity,
  normalizeAdminReports,
  normalizeAdminStats,
} from "@/lib/admin";

const adminCardClassName =
  "rounded-[28px] border border-slate-200 bg-none bg-white text-slate-900 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-none";
const adminCardTitleClassName = "text-xl font-semibold tracking-[-0.02em] text-slate-950";
const adminCardDescriptionClassName = "text-sm leading-6 text-slate-500";
const adminCardBodyClassName = "space-y-3 text-slate-700";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function formatRelativeLabel(value) {
  if (!value) {
    return "Recently";
  }

  const diff = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 3600000));
  return diff < 24 ? `${diff} hour${diff > 1 ? "s" : ""} ago` : `${Math.round(diff / 24)} day(s) ago`;
}

function StatCard({ icon: Icon, label, value, meta, tone }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-[2rem] font-semibold tracking-[-0.04em] text-slate-950">{value}</p>
          <p className="mt-1 text-xs text-emerald-600">{meta}</p>
        </div>
      </div>
    </div>
  );
}

function ListRow({ badgeClass, badgeLabel, icon: Icon, subtitle, title, trailing }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 px-3 py-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-500">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>
      <div className="space-y-2 text-right">
        <p className="text-xs text-slate-400">{trailing}</p>
        {badgeLabel ? (
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}>
            {badgeLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function DashboardEmptyState({ description, title }) {
  return (
    <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

const quickModerationCards = [
  { label: "Review Pending Prompts", meta: "12 pending", icon: ClipboardList, href: "/admin/prompts" },
  { label: "View Reports", meta: "24 open", icon: Flag, href: "/admin/reports" },
  { label: "Manage Users", meta: "12,458 total", icon: Users, href: "/admin/users" },
  { label: "Content Guidelines", meta: "View guidelines", icon: Shield, href: "/admin" },
];

export default function AdminDashboard() {
  const [state, setState] = useState({
    status: "loading",
    error: "",
    stats: null,
    reports: [],
    activity: [],
  });

  async function loadAdminDashboard() {
    setState((current) => ({
      ...current,
      status: current.stats ? "refreshing" : "loading",
      error: "",
    }));

    try {
      const [statsResult, reportsResult, activityResult] = await Promise.all([
        adminApi.getStats(),
        adminApi.getReports(),
        adminApi.getRecentActivity(),
      ]);

      const reports = normalizeAdminReports(reportsResult);
      setState({
        status: "success",
        error: "",
        stats: normalizeAdminStats(statsResult, reports),
        reports,
        activity: normalizeAdminActivity(activityResult),
      });
    } catch (error) {
      setState({
        status: "error",
        error: error.message || "Unable to load admin dashboard.",
        stats: null,
        reports: [],
        activity: [],
      });
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadAdminDashboard();
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
      { id: "reviews", label: "Total Reviews", value: formatCompactNumber(state.stats.totalReviews), meta: "↑ 10.7% vs last 30 days", icon: MessageSquare, tone: "bg-sky-50 text-sky-500" },
      { id: "copies", label: "Total Copies", value: formatCompactNumber(state.stats.totalCopies), meta: "↑ 18.9% vs last 30 days", icon: ClipboardList, tone: "bg-indigo-50 text-indigo-500" },
      { id: "revenue", label: "Total Revenue", value: formatCurrency(state.stats.totalRevenue), meta: "↑ 22.6% vs last 30 days", icon: DollarSign, tone: "bg-emerald-50 text-emerald-500" },
    ];
  }, [state.stats]);

  const recentReports = state.reports.slice(0, 5);
  const paymentActivities = state.activity.filter((item) => item.type.includes("payment")).slice(0, 5);
  const pendingPromptItems = recentReports.slice(0, 5);

  if (state.status === "loading") {
    return <LoadingSpinner className="min-h-[50vh]" label="Loading admin dashboard" />;
  }

  if (state.status === "error") {
    return (
      <ErrorState
        description={state.error}
        onRetry={loadAdminDashboard}
        title="Unable to load admin dashboard"
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <p className="font-semibold">
              Priority Alert: {state.stats.pendingPrompts} prompts are waiting for your approval.
            </p>
            <p className="text-sm text-amber-700">
              Review pending prompts to keep the platform content quality high.
            </p>
          </div>
        </div>
        <Button as={Link} href="/admin/prompts">
          Review Pending Prompts
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {statCards.map((card) => (
          <StatCard key={card.id} {...card} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card
          bodyClassName={adminCardBodyClassName}
          className={adminCardClassName}
          description="Items that likely need immediate moderation."
          descriptionClassName={adminCardDescriptionClassName}
          icon={ClipboardList}
          title="Pending Prompts Requiring Review"
          titleClassName={adminCardTitleClassName}
        >
          {pendingPromptItems.length > 0 ? (
            pendingPromptItems.map((report) => (
              <ListRow
                badgeClass="bg-orange-50 text-orange-600"
                badgeLabel="Pending"
                icon={FileText}
                key={report.id}
                subtitle={`by ${report.creatorName}`}
                title={report.promptTitle}
                trailing={formatRelativeLabel(report.reportDate)}
              />
            ))
          ) : (
            <DashboardEmptyState
              description="There are no pending prompts in the current moderation queue."
              title="No prompts require review right now"
            />
          )}
        </Card>

        <Card
          bodyClassName={adminCardBodyClassName}
          className={adminCardClassName}
          description="Latest moderation signals from users."
          descriptionClassName={adminCardDescriptionClassName}
          icon={Flag}
          title="Recent Reports"
          titleClassName={adminCardTitleClassName}
        >
          {recentReports.length > 0 ? (
            recentReports.map((report) => (
              <ListRow
                badgeClass={getStatusBadgeClass(report.status)}
                badgeLabel={report.status}
                icon={Flag}
                key={report.id}
                subtitle={`Reported by ${report.reportedByName}`}
                title={report.reason}
                trailing={formatRelativeLabel(report.reportDate)}
              />
            ))
          ) : (
            <DashboardEmptyState
              description="No new reports have been submitted recently."
              title="No reports to review"
            />
          )}
          <Button
            as={Link}
            className="mt-3 w-full border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
            href="/admin/reports"
            variant="secondary"
          >
            View All Reports
          </Button>
        </Card>

        <Card
          bodyClassName={adminCardBodyClassName}
          className={adminCardClassName}
          description="Recent transactions and admin activity."
          descriptionClassName={adminCardDescriptionClassName}
          icon={DollarSign}
          title="Recent Payments"
          titleClassName={adminCardTitleClassName}
        >
          {paymentActivities.length > 0 ? (
            paymentActivities.map((item) => (
              <ListRow
                badgeClass="bg-emerald-50 text-emerald-600"
                badgeLabel={item.status || "Completed"}
                icon={DollarSign}
                key={item.id}
                subtitle={item.subtitle || "Platform transaction"}
                title={item.title}
                trailing={item.amount || formatRelativeLabel(item.date)}
              />
            ))
          ) : (
            <DashboardEmptyState
              description="Payment activity will appear here once new transactions are processed."
              title="No recent payments"
            />
          )}
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card
          bodyClassName="space-y-4 text-slate-700"
          className={adminCardClassName}
          description="Take quick actions to keep the platform safe and high quality."
          descriptionClassName={adminCardDescriptionClassName}
          icon={Shield}
          title="Quick Moderation"
          titleClassName={adminCardTitleClassName}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {quickModerationCards.map((item) => (
              <Link
                key={item.label}
                className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-primary/30 hover:bg-primary/5"
                href={item.href}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="mt-1 text-xs text-slate-500">{item.meta}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                  Open
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card
          bodyClassName="space-y-4 text-slate-700"
          className={adminCardClassName}
          description="Platform level moderation overview."
          descriptionClassName={adminCardDescriptionClassName}
          icon={Sparkles}
          title="Platform Overview"
          titleClassName={adminCardTitleClassName}
        >
          <div className="space-y-3">
            {[
              { label: "Active AI Tools", value: state.stats.activeAiTools },
              { label: "Categories", value: state.stats.categories },
              { label: "Total Bookmarks", value: formatCompactNumber(state.stats.totalBookmarks) },
              { label: "Total Reviews", value: formatCompactNumber(state.stats.totalReviews) },
              { label: "Average Rating", value: `${state.stats.averageRating.toFixed(1)} / 5` },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
                <span className="text-sm text-slate-500">{item.label}</span>
                <span className="text-sm font-semibold text-slate-950">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
