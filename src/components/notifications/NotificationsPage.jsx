"use client";

import { useMemo, useState } from "react";
import { Bell, CreditCard, Flag, MessageSquare, Sparkles } from "lucide-react";

import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import NotificationCard from "@/components/notifications/NotificationCard";
import MotionReveal from "@/components/shared/MotionReveal";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Skeleton from "@/components/ui/Skeleton";
import { useNotifications } from "@/hooks/useNotifications";
import {
  filterNotifications,
  notificationFilters,
} from "@/lib/notifications";
import { toastSuccess } from "@/lib/toast";

function NotificationListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={`notification-skeleton-${index}`} className="rounded-[26px] border border-slate-200 bg-white p-5">
          <div className="flex gap-4">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, tone, value }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950">{value}</p>
    </div>
  );
}

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const {
    error,
    items,
    markAllAsRead,
    markAsRead,
    payments,
    promptUpdates,
    refreshNotifications,
    reports,
    status,
    system,
    unread,
  } = useNotifications();

  const filteredItems = useMemo(
    () => filterNotifications(items, activeFilter),
    [activeFilter, items],
  );

  if (status === "loading") {
    return <NotificationListSkeleton />;
  }

  if (status === "error") {
    return (
      <ErrorState
        description={error || "Unable to load notifications."}
        onRetry={refreshNotifications}
        title="Unable to load notifications"
      />
    );
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        crumbs={["Dashboard", "Notifications"]}
        description="Track prompt updates, payments, reports, and system notices in one place."
        title="Notifications"
      />

      <MotionReveal preset="viewportReveal">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard icon={Bell} label="Unread" tone="bg-violet-50 text-violet-600" value={unread} />
          <SummaryCard icon={MessageSquare} label="Prompt Updates" tone="bg-emerald-50 text-emerald-600" value={promptUpdates} />
          <SummaryCard icon={CreditCard} label="Payments" tone="bg-sky-50 text-sky-600" value={payments.length} />
          <SummaryCard icon={Flag} label="Reports & System" tone="bg-amber-50 text-amber-600" value={reports + system} />
        </section>
      </MotionReveal>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <MotionReveal preset="viewportReveal">
          <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2 overflow-x-auto">
                {notificationFilters.map((filter) => (
                  <button
                    key={filter.id}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      activeFilter === filter.id
                        ? "bg-brand-gradient text-white shadow-[0_14px_32px_rgba(99,102,241,0.24)]"
                        : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                    onClick={() => setActiveFilter(filter.id)}
                    type="button"
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                {unread > 0 ? (
                  <Button
                    onPress={() => {
                      markAllAsRead();
                      toastSuccess("All notifications marked as read");
                    }}
                    variant="secondary"
                  >
                    Mark all as read
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {filteredItems.length === 0 ? (
                <EmptyState
                  actionLabel="Show all"
                  description="There are no notifications in this filter right now."
                  onAction={() => setActiveFilter("all")}
                  title="Nothing to show"
                />
              ) : (
                filteredItems.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkRead={(id) => {
                      markAsRead(id);
                      toastSuccess("Notification marked as read");
                    }}
                  />
                ))
              )}
            </div>
          </section>
        </MotionReveal>

        <MotionReveal preset="viewportReveal">
          <aside className="space-y-5">
            <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Inbox Summary</p>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Total notifications", value: items.length },
                  { label: "Unread", value: unread },
                  { label: "Prompt updates", value: promptUpdates },
                  { label: "Reports", value: reports },
                  { label: "System", value: system },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
                    <span className="text-sm text-slate-500">{item.label}</span>
                    <span className="text-sm font-semibold text-slate-950">{item.value}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(135deg,#0f172a_0%,#1d2351_100%)] p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight">Stay in the loop</h2>
              <p className="mt-3 text-sm leading-6 text-white/76">
                Notifications surface prompt approvals, payment milestones, moderation updates, and platform changes.
              </p>
            </section>
          </aside>
        </MotionReveal>
      </div>
    </div>
  );
}
