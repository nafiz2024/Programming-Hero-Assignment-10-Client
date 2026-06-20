"use client";

import Link from "next/link";
import { Bookmark, Clock3, Copy, Star, Sparkles, TrendingUp } from "lucide-react";

import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { MotionStagger, MotionStaggerItem } from "@/components/shared/MotionStagger";
import MotionReveal from "@/components/shared/MotionReveal";
import Button from "@/components/ui/Button";
import DashboardSkeleton from "@/components/ui/DashboardSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { useDashboard } from "@/hooks/useDashboard";
import { formatDashboardDate } from "@/lib/dashboard";
import { formatCompactNumber } from "@/lib/marketplace";

function StatCard({ stat }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.accent} text-white shadow-md`}>
        <TrendingUp className="h-5 w-5" />
      </div>
      <p className="mt-5 text-sm font-medium uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{stat.value}</p>
      <p className="mt-2 text-sm text-slate-500">{stat.meta}</p>
    </div>
  );
}

function ActivityItem({ activity }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Clock3 className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{activity.description}</p>
        <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          {formatDashboardDate(activity.date)}
        </p>
      </div>
    </div>
  );
}

function BookmarkCard({ bookmark }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
      <div className={`mb-4 h-32 rounded-[20px] bg-gradient-to-br ${bookmark.accent}`} />
      <h3 className="text-lg font-semibold text-slate-950">{bookmark.title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">{bookmark.aiTool}</span>
        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-600">{bookmark.category}</span>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>Saved {formatDashboardDate(bookmark.savedAt)}</span>
        <span className="inline-flex items-center gap-1.5">
          <Copy className="h-4 w-4" />
          {formatCompactNumber(bookmark.copyCount)}
        </span>
      </div>
    </div>
  );
}

function RecommendedCard({ prompt }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
      <div className={`mb-4 h-32 rounded-[20px] bg-gradient-to-br ${prompt.accent}`} />
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-950">{prompt.title}</h3>
        <p className="line-clamp-2 text-sm leading-6 text-slate-500">{prompt.description}</p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-current text-amber-400" />
            {prompt.rating.toFixed(1)}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{prompt.aiTool}</span>
        </div>
        <Button
          as={Link}
          className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          href={`/prompts/${prompt.id}`}
          size="sm"
          variant="secondary"
        >
          View
        </Button>
      </div>
    </div>
  );
}

export default function DashboardOverview() {
  const { activity, bookmarks, error, recommendedPrompts, refreshDashboard, stats, status, user } = useDashboard();

  if (status === "loading") {
    return <DashboardSkeleton />;
  }

  if (status === "error") {
    return <ErrorState description={error} onRetry={refreshDashboard} title="Unable to load dashboard" />;
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        crumbs={["Dashboard", "Overview"]}
        description="Keep track of your saved prompts, reviews, and recent account activity."
        title={`Welcome back, ${user.name.split(" ")[0]}`}
      />

      <MotionReveal preset="viewportReveal">
        <div className="overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,rgba(139,92,246,0.92),rgba(99,102,241,0.88),rgba(56,189,248,0.82))] p-6 text-white shadow-[0_26px_70px_rgba(99,102,241,0.24)] md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/70 bg-white/15 text-2xl font-semibold shadow-lg">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt={user.name} className="h-full w-full rounded-full object-cover" src={user.image} />
                ) : (
                  user.initials
                )}
              </div>
              <div>
                <h2 className="text-3xl font-semibold tracking-tight">{user.name}</h2>
                <p className="mt-2 text-base text-white/85">{user.email}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/18 px-3 py-1 text-sm font-medium">{user.role}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-900">
                    {user.subscription} plan
                  </span>
                </div>
              </div>
            </div>
            <Button as={Link} className="bg-slate-950 text-white hover:bg-slate-900" href="/dashboard/profile" variant="secondary">
              Edit Profile
            </Button>
          </div>
        </div>
      </MotionReveal>

      <MotionStagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-5" preset="dashboardCardStagger">
        {stats.map((stat) => (
          <MotionStaggerItem key={stat.id}>
            <StatCard stat={stat} />
          </MotionStaggerItem>
        ))}
      </MotionStagger>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <MotionReveal preset="viewportReveal">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Recent Activity</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">What happened lately</h2>
              </div>
            </div>
            <div className="space-y-3">
              {activity.map((item) => (
                <ActivityItem activity={item} key={item.id} />
              ))}
            </div>
          </section>
        </MotionReveal>

        <MotionReveal preset="viewportReveal">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Recent Bookmarks</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Saved prompts</h2>
              </div>
              <Button
                as={Link}
                className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                href="/dashboard/saved"
                size="sm"
                variant="secondary"
              >
                View All
              </Button>
            </div>
            {bookmarks.length === 0 ? (
              <EmptyState
                actionLabel="Browse Prompts"
                description="You haven't saved any prompts yet. Explore the marketplace and start bookmarking."
                onAction={() => window.location.assign("/prompts")}
                title="No saved prompts yet"
              />
            ) : (
              <div className="space-y-4">
                {bookmarks.slice(0, 3).map((bookmark) => (
                  <BookmarkCard bookmark={bookmark} key={bookmark.bookmarkId} />
                ))}
              </div>
            )}
          </section>
        </MotionReveal>
      </div>

      <MotionReveal preset="viewportReveal">
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Recommended Prompts</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Suggested for you</h2>
            </div>
            <Link className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-secondary" href="/prompts">
              <Sparkles className="h-4 w-4" />
              Explore all prompts
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {recommendedPrompts.map((prompt) => (
              <RecommendedCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        </section>
      </MotionReveal>
    </div>
  );
}
