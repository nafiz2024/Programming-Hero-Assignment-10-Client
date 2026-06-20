"use client";

import Link from "next/link";
import { ArrowUpRight, Copy, MessageSquareText, Sparkles, Star } from "lucide-react";

import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { MotionStagger, MotionStaggerItem } from "@/components/shared/MotionStagger";
import MotionReveal from "@/components/shared/MotionReveal";
import Button from "@/components/ui/Button";
import DashboardSkeleton from "@/components/ui/DashboardSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { useCreator } from "@/hooks/useCreator";
import { formatCompactNumber } from "@/lib/marketplace";

function StatCard({ stat }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.accent} text-white shadow-md`}>
        <Sparkles className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm font-medium uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{stat.value}</p>
      <p className="mt-2 text-sm text-emerald-600">{stat.meta}</p>
    </div>
  );
}

function ChartCard({ bars = [], lines = [], title, subtitle, type = "line" }) {
  const maxValue = Math.max(...(type === "line" ? lines.map((item) => item.value) : bars.map((item) => item.value)), 1);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
          Last 7 Days
        </span>
      </div>

      {type === "line" ? (
        <div className="grid grid-cols-7 gap-3">
          {lines.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-3">
              <div className="flex h-52 w-full items-end">
                <div
                  className="w-full rounded-t-[24px] bg-[linear-gradient(180deg,rgba(124,58,237,0.18)_0%,rgba(99,102,241,0.6)_100%)]"
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
      ) : (
        <div className="grid grid-cols-5 gap-4">
          {bars.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-3">
              <div className="flex h-52 w-full items-end justify-center">
                <div
                  className="w-10 rounded-t-[18px] bg-[linear-gradient(180deg,#8b5cf6_0%,#6366f1_100%)] shadow-[0_16px_30px_rgba(99,102,241,0.2)]"
                  style={{ height: `${Math.max(18, (item.value / maxValue) * 100)}%` }}
                />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-900">{item.value}</p>
                <p className="mt-1 text-xs text-slate-400">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function TopPromptRow({ prompt }) {
  return (
    <div className="grid gap-4 border-t border-slate-100 py-4 md:grid-cols-[minmax(0,1.8fr)_0.7fr_0.7fr_0.7fr_0.8fr] md:items-center">
      <div className="flex items-center gap-3">
        <div className={`h-14 w-16 rounded-2xl bg-gradient-to-br ${prompt.accent}`} />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-slate-950">{prompt.title}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">{prompt.aiTool}</span>
            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-600">{prompt.category}</span>
          </div>
        </div>
      </div>
      <p className="text-sm font-medium text-slate-600">{formatCompactNumber(prompt.copyCount)}</p>
      <p className="text-sm font-medium text-slate-600">{formatCompactNumber(prompt.bookmarkCount)}</p>
      <p className="inline-flex items-center gap-1 text-sm font-medium text-slate-600">
        {prompt.rating.toFixed(1)}
        <Star className="h-4 w-4 fill-current text-amber-400" />
      </p>
      <span className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600">
        +{prompt.performanceChange.toFixed(1)}%
      </span>
    </div>
  );
}

export default function CreatorOverview() {
  const { analytics, error, prompts, refreshCreator, stats, status } = useCreator();

  if (status === "loading") {
    return <DashboardSkeleton />;
  }

  if (status === "error") {
    return <ErrorState description={error} onRetry={refreshCreator} title="Unable to load creator dashboard" />;
  }

  if (prompts.length === 0) {
    return (
      <div className="space-y-6">
        <DashboardPageHeader
          crumbs={["Creator", "Dashboard"]}
          description="Start publishing prompts to unlock analytics, reviews, and creator insights."
          title={`Welcome back, ${analytics.greetingName}!`}
        />
        <EmptyState
          actionLabel="Create Your First Prompt"
          description="No creator prompts were found yet. Add your first prompt to start building your PromptFlow presence."
          onAction={() => window.location.assign("/creator/prompts/new")}
          title="Your creator dashboard is waiting for content"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        crumbs={["Creator", "Dashboard"]}
        description="Here's what's happening with your prompts today."
        title={`Welcome back, ${analytics.greetingName}!`}
      />

      <MotionStagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" preset="dashboardCardStagger">
        {stats.map((stat) => (
          <MotionStaggerItem key={stat.id}>
            <StatCard stat={stat} />
          </MotionStaggerItem>
        ))}
      </MotionStagger>

      <div className="grid gap-6 xl:grid-cols-2">
        <MotionReveal preset="viewportReveal">
          <ChartCard lines={analytics.copiesTrend} subtitle="Track copy activity from your published prompt catalog." title="Copies Overview" type="line" />
        </MotionReveal>
        <MotionReveal preset="viewportReveal">
          <ChartCard bars={analytics.promptGrowth} subtitle="Prompt additions and publishing momentum across recent weeks." title="Prompt Growth" type="bars" />
        </MotionReveal>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <MotionReveal preset="viewportReveal">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Top Performing Prompts</h2>
                <p className="mt-2 text-sm text-slate-500">Your strongest marketplace performers based on copies, bookmarks, and ratings.</p>
              </div>
              <Button as={Link} href="/creator/prompts" variant="secondary">
                View All Prompts
              </Button>
            </div>

            <div className="hidden gap-4 px-1 pb-3 pt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 md:grid md:grid-cols-[minmax(0,1.8fr)_0.7fr_0.7fr_0.7fr_0.8fr]">
              <span>Prompt</span>
              <span>Copies</span>
              <span>Bookmarks</span>
              <span>Rating</span>
              <span>Performance</span>
            </div>

            <div>
              {analytics.topPrompts.map((prompt) => (
                <TopPromptRow key={prompt.id} prompt={prompt} />
              ))}
            </div>
          </section>
        </MotionReveal>

        <div className="space-y-6">
          <MotionReveal preset="viewportReveal">
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Recent Reviews</h2>
                  <p className="mt-2 text-sm text-slate-500">What buyers are saying about your recent prompt releases.</p>
                </div>
                <Button as={Link} href="/dashboard/reviews" variant="secondary">
                  View Reviews
                </Button>
              </div>

              <div className="space-y-4">
                {analytics.recentReviews.map((review) => (
                  <article key={review.id} className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-slate-950">{review.author}</p>
                        <div className="mt-2 flex items-center gap-1 text-amber-400">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star key={`${review.id}-${index}`} className={`h-4 w-4 ${index < review.rating ? "fill-current" : ""}`} />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{review.timeAgo}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{review.body}</p>
                    <span className="mt-3 inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-600">
                      {review.promptTitle}
                    </span>
                  </article>
                ))}
              </div>
            </section>
          </MotionReveal>

          <MotionReveal preset="viewportReveal">
            <section className="rounded-[28px] bg-[linear-gradient(135deg,rgba(99,102,241,0.96),rgba(139,92,246,0.92),rgba(56,189,248,0.88))] p-6 text-white shadow-[0_26px_70px_rgba(99,102,241,0.26)]">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/85">
                <ArrowUpRight className="h-3.5 w-3.5" />
                Creator Pro
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">Unlock deeper analytics and private prompt earnings</h2>
              <p className="mt-3 text-sm leading-6 text-white/80">
                Get premium creator insights, higher visibility placements, and stronger monetization controls as PromptFlow grows.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] bg-white/12 p-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/16">
                    <Copy className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-lg font-semibold">Private prompt access</p>
                  <p className="mt-2 text-sm text-white/75">Restrict top-tier prompts for premium buyers only.</p>
                </div>
                <div className="rounded-[22px] bg-white/12 p-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/16">
                    <MessageSquareText className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-lg font-semibold">Advanced feedback tracking</p>
                  <p className="mt-2 text-sm text-white/75">Understand which prompt structures drive stronger review sentiment.</p>
                </div>
              </div>

              <Button className="mt-6 border-0 bg-white text-slate-950 hover:bg-white/90" variant="secondary">
                Upgrade to Premium
              </Button>
            </section>
          </MotionReveal>
        </div>
      </div>
    </div>
  );
}
