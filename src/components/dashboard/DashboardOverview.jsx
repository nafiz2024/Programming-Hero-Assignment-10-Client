"use client";

import Link from "next/link";
import { BadgeCheck, Bookmark, Crown, Plus, Star } from "lucide-react";

import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { MotionStagger, MotionStaggerItem } from "@/components/shared/MotionStagger";
import MotionReveal from "@/components/shared/MotionReveal";
import Button from "@/components/ui/Button";
import DashboardSkeleton from "@/components/ui/DashboardSkeleton";
import ErrorState from "@/components/ui/ErrorState";
import { useDashboard } from "@/hooks/useDashboard";
import { formatDashboardDate } from "@/lib/dashboard";
import { formatCompactNumber } from "@/lib/marketplace";

function StatCard({ stat }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.accent} text-white shadow-md`}>
        <BadgeCheck className="h-5 w-5" />
      </div>
      <p className="mt-4 text-base font-medium text-slate-500">{stat.label}</p>
      <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">{stat.value}</p>
      <p className="mt-2 text-sm text-emerald-600">{stat.meta}</p>
    </div>
  );
}

function ActivityItem({ activity }) {
  const iconTone =
    activity.icon === "bookmark"
      ? "bg-violet-50 text-violet-500"
      : activity.icon === "star"
      ? "bg-amber-50 text-amber-500"
      : activity.icon === "plus"
      ? "bg-emerald-50 text-emerald-500"
      : "bg-sky-50 text-sky-500";

  return (
    <div className="flex items-start gap-4 border-b border-slate-100 py-4 last:border-b-0 first:pt-0">
      <div className={`flex h-11 w-11 items-center justify-center rounded-full ${iconTone}`}>
        {activity.icon === "bookmark" ? <Bookmark className="h-4 w-4" /> : activity.icon === "star" ? <Star className="h-4 w-4 fill-current" /> : activity.icon === "plus" ? <Plus className="h-4 w-4" /> : <BadgeCheck className="h-4 w-4" />}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{activity.description}</p>
      </div>
      <p className="ml-auto shrink-0 text-sm text-slate-400">
        {activity.timeAgo || formatDashboardDate(activity.date)}
      </p>
    </div>
  );
}

function RecommendedCard({ prompt }) {
  return (
    <div className="flex items-center gap-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
      <div className={`h-28 w-36 shrink-0 rounded-[20px] bg-gradient-to-br ${prompt.accent}`} />
      <div className="min-w-0 flex-1">
        <h3 className="text-xl font-semibold text-slate-950">{prompt.title}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">{prompt.aiTool}</span>
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-600">{prompt.category}</span>
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">{prompt.description}</p>
        <div className="mt-4 flex items-center gap-5 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-current text-amber-400" />
            {prompt.rating.toFixed(1)}
          </span>
          <span>{formatCompactNumber(prompt.copyCount)} copies</span>
        </div>
      </div>
      <button className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" type="button">
        <Bookmark className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function DashboardOverview() {
  const { error, freeUserRecommendations, promptStats, refreshDashboard, status, user, userActivity } = useDashboard();

  if (status === "loading") {
    return <DashboardSkeleton />;
  }

  if (status === "error") {
    return <ErrorState description={error} onRetry={refreshDashboard} title="Unable to load dashboard" />;
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        crumbs={["Dashboard"]}
        description="Here's what's happening in your account today."
        title={`Good Morning, ${user.name.split(" ")[0]}!`}
      />

      <MotionReveal preset="viewportReveal">
        <section className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Free Plan</h2>
                  <span className="text-base text-slate-500">You&apos;re on the Free Plan</span>
                </div>
                <p className="mt-2 text-base text-slate-500">Upgrade to unlock premium prompts and more features.</p>
              </div>
            </div>
            <Button as={Link} className="md:min-w-[180px]" href="/pricing">
              Upgrade for $5
            </Button>
          </div>
        </section>
      </MotionReveal>

      <MotionStagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" preset="dashboardCardStagger">
        {promptStats.map((stat) => (
          <MotionStaggerItem key={stat.id}>
            <StatCard stat={stat} />
          </MotionStaggerItem>
        ))}
      </MotionStagger>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.45fr]">
        <MotionReveal preset="viewportReveal">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Recent Activity</h2>
                <p className="mt-2 text-sm text-slate-500">A quick snapshot of your latest prompt actions.</p>
              </div>
              <Link className="text-sm font-semibold text-primary transition hover:text-secondary" href="/dashboard/prompts">
                View All
              </Link>
            </div>

            <div>
              {userActivity.map((item) => (
                <ActivityItem activity={item} key={item.id} />
              ))}
            </div>
          </section>
        </MotionReveal>

        <MotionReveal preset="viewportReveal">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Recommended for You</h2>
                <p className="mt-2 text-sm text-slate-500">Personalized prompts based on your activity.</p>
              </div>
              <Link className="text-sm font-semibold text-primary transition hover:text-secondary" href="/prompts">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {freeUserRecommendations.map((prompt) => (
                <RecommendedCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          </section>
        </MotionReveal>
      </div>

      <MotionReveal preset="viewportReveal">
        <section className="overflow-hidden rounded-[30px] bg-[radial-gradient(circle_at_top_right,rgba(167,139,250,0.22),transparent_22%),linear-gradient(135deg,#0f172a_0%,#151d3d_50%,#1d2351_100%)] p-6 text-white shadow-[0_26px_70px_rgba(15,23,42,0.24)] md:p-8">
          <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
            <div>
              <span className="inline-flex rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                Upgrade to Premium
              </span>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight">Unlock Every Premium Prompt for Only $5</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
                Get one-time access to all premium prompts, advanced features, and exclusive tools to supercharge your productivity.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
              <div className="space-y-3 text-sm text-white/80">
                {[
                  "Access all premium prompts",
                  "Copy premium prompts without limits",
                  "Submit reviews and earn trust",
                  "Premium account badge",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <BadgeCheck className="h-4 w-4 text-white" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <Button as={Link} className="w-full md:min-w-[220px]" href="/payment">
                  Upgrade Now - $5
                </Button>
                <Button
                  as={Link}
                  className="border-white/12 bg-white/8 text-white hover:bg-white/12"
                  href="/premium"
                  variant="secondary"
                >
                  Learn more about Premium
                </Button>
              </div>
            </div>
          </div>
        </section>
      </MotionReveal>
    </div>
  );
}
