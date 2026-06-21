"use client";

import Link from "next/link";
import { Bookmark, CreditCard, Eye, FileText, MessageSquare, Sparkles } from "lucide-react";

import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import MotionReveal from "@/components/shared/MotionReveal";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Skeleton from "@/components/ui/Skeleton";
import { useDashboard } from "@/hooks/useDashboard";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDashboardDate } from "@/lib/dashboard";

function ActivitySection({ ctaHref = "", ctaLabel = "", description, icon: Icon, items, title }) {
  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
            <p className="mt-2 text-sm text-slate-500">{description}</p>
          </div>
        </div>
        {ctaHref ? (
          <Link className="text-sm font-semibold text-primary transition hover:text-secondary" href={ctaHref}>
            {ctaLabel}
          </Link>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 p-6 text-sm text-slate-500">
          Nothing to show here yet.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-[24px] border border-slate-100 px-4 py-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
                </div>
                <div className="shrink-0 text-sm text-slate-400">{formatDashboardDate(item.date, { month: "short", day: "numeric" })}</div>
              </div>
              {item.href ? (
                <Link className="mt-3 inline-flex text-sm font-semibold text-primary transition hover:text-secondary" href={item.href}>
                  Open
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={`activity-skeleton-${index}`} className="rounded-[28px] border border-slate-200 bg-white p-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="mt-5 space-y-3">
            {Array.from({ length: 3 }).map((__, rowIndex) => (
              <div key={`activity-row-${rowIndex}`} className="rounded-[24px] border border-slate-100 p-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="mt-3 h-3 w-full" />
                <Skeleton className="mt-2 h-3 w-4/5" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SummaryTile({ label, value }) {
  return (
    <div className="rounded-[22px] border border-slate-100 px-4 py-3">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">{value}</p>
    </div>
  );
}

export default function DashboardActivity() {
  const { bookmarks, error, localReviews, ownedPrompts, refreshDashboard, status } = useDashboard();
  const { payments, recentlyViewed, refreshViewedPrompts, status: notificationStatus } = useNotifications();

  const recentlyViewedItems = recentlyViewed.slice(0, 5).map((item) => ({
    id: `viewed-${item.id}`,
    title: item.title,
    description: `${item.category} · ${item.aiTool}`,
    date: item.viewedAt,
    href: item.href,
  }));

  const savedPromptItems = bookmarks.slice(0, 5).map((item) => ({
    id: `saved-${item.id}`,
    title: item.title,
    description: `Saved from ${item.author || item.creatorName || "PromptFlow Creator"}`,
    date: item.savedAt || item.createdAt,
    href: `/prompts/${item.id}`,
  }));

  const reviewItems = localReviews.slice(0, 5).map((item) => ({
    id: `review-${item.id}`,
    title: item.promptTitle,
    description: `${item.rating}-star review submitted`,
    date: item.createdAt,
    href: "/dashboard/reviews",
  }));

  const promptItems = ownedPrompts.slice(0, 5).map((item) => ({
    id: `prompt-${item.id}`,
    title: item.title,
    description: `${item.status} · ${item.visibility}`,
    date: item.updatedAt || item.createdAt,
    href: "/dashboard/prompts",
  }));

  const paymentItems = payments.slice(0, 5).map((item) => ({
    id: `payment-${item.id}`,
    title: item.planName,
    description: `${item.status} · Transaction ${item.transactionId}`,
    date: item.createdAt,
    href: "/premium",
  }));

  if (status === "loading" || notificationStatus === "loading") {
    return <ActivitySkeleton />;
  }

  if (status === "error") {
    return (
      <ErrorState
        description={error || "Unable to load activity feed."}
        onRetry={refreshDashboard}
        title="Unable to load activity feed"
      />
    );
  }

  const hasAnyActivity =
    recentlyViewedItems.length > 0 ||
    savedPromptItems.length > 0 ||
    reviewItems.length > 0 ||
    promptItems.length > 0 ||
    paymentItems.length > 0;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        crumbs={["Dashboard", "Activity"]}
        description="Review everything you've viewed, saved, reviewed, created, and paid for."
        title="Activity Feed"
      />

      {!hasAnyActivity ? (
        <section className="rounded-[28px] border border-dashed border-slate-200 bg-white/80 px-6 py-12 text-center shadow-[0_20px_60px_rgba(15,23,42,0.04)]">
          <EmptyState
            actionLabel="Refresh activity"
            description="Your activity will appear here once you start exploring PromptFlow."
            onAction={refreshViewedPrompts}
            title="No activity yet"
          />
          <Button as={Link} className="mt-5" href="/prompts">
            Browse Prompts
          </Button>
        </section>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <MotionReveal preset="viewportReveal">
              <ActivitySection
                ctaHref="/prompts"
                ctaLabel="Browse"
                description="Prompts you've opened most recently."
                icon={Eye}
                items={recentlyViewedItems}
                title="Recently Viewed Prompts"
              />
            </MotionReveal>

            <MotionReveal preset="viewportReveal">
              <ActivitySection
                ctaHref="/dashboard/saved"
                ctaLabel="Open saved"
                description="Bookmarks you're keeping close."
                icon={Bookmark}
                items={savedPromptItems}
                title="Saved Prompts"
              />
            </MotionReveal>

            <MotionReveal preset="viewportReveal">
              <ActivitySection
                ctaHref="/dashboard/reviews"
                ctaLabel="Open reviews"
                description="Your recent feedback and ratings."
                icon={MessageSquare}
                items={reviewItems}
                title="Reviews Submitted"
              />
            </MotionReveal>

            <MotionReveal preset="viewportReveal">
              <ActivitySection
                ctaHref="/dashboard/prompts"
                ctaLabel="Open prompts"
                description="Prompts you created or updated."
                icon={FileText}
                items={promptItems}
                title="Prompts Created"
              />
            </MotionReveal>

            <MotionReveal preset="viewportReveal">
              <ActivitySection
                ctaHref="/premium"
                ctaLabel="View premium"
                description="Recent payment and premium activation milestones."
                icon={CreditCard}
                items={paymentItems}
                title="Payment Activity"
              />
            </MotionReveal>
          </div>

          <MotionReveal preset="viewportReveal">
            <aside className="space-y-5">
              <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Summary</p>
                <div className="mt-4 grid gap-3">
                  <SummaryTile label="Viewed" value={recentlyViewedItems.length} />
                  <SummaryTile label="Saved" value={savedPromptItems.length} />
                  <SummaryTile label="Reviews" value={reviewItems.length} />
                  <SummaryTile label="Created" value={promptItems.length} />
                  <SummaryTile label="Payments" value={paymentItems.length} />
                </div>
              </section>

              <section className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(135deg,#0f172a_0%,#1d2351_100%)] p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight">Keep momentum going</h2>
                <p className="mt-3 text-sm leading-6 text-white/76">
                  Your activity feed helps you jump back into prompts, reviews, and premium actions without losing context.
                </p>
                <Button as={Link} className="mt-5" href="/prompts" variant="secondary">
                  Explore More Prompts
                </Button>
              </section>
            </aside>
          </MotionReveal>
        </div>
      )}
    </div>
  );
}
