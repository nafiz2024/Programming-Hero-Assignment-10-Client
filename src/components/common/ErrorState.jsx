"use client";

import Link from "next/link";
import { AlertTriangle, Home, RefreshCcw, Sparkles } from "lucide-react";

import MotionReveal from "@/components/shared/MotionReveal";
import PageContainer from "@/components/shared/PageContainer";
import Button from "@/components/ui/Button";

function ErrorIllustration() {
  return (
    <div className="pf-error-orbit relative mx-auto flex aspect-square w-full max-w-[360px] items-center justify-center rounded-[32px] border border-slate-200/80 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(244,247,255,0.98)_100%)] p-8 shadow-[0_28px_90px_rgba(15,23,42,0.12)]">
      <div className="absolute inset-x-10 bottom-2 h-20 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.14),transparent_70%)] blur-2xl" />

      <div className="absolute left-7 top-8 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary shadow-[0_0_28px_rgba(139,92,246,0.12)]">
        <Sparkles className="h-5 w-5" />
      </div>
      <div className="absolute right-9 top-12 flex h-10 w-10 items-center justify-center rounded-full border border-secondary/15 bg-secondary/10 text-secondary shadow-[0_0_24px_rgba(96,165,250,0.12)]">
        <AlertTriangle className="h-4 w-4" />
      </div>

      <div className="relative z-10 w-full max-w-[280px] rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-400/90" />
          <span className="h-3 w-3 rounded-full bg-amber-300/90" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/90" />
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8faff_100%)] p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-500">
              System Alert
            </span>
            <span className="text-xs font-medium text-slate-400">PromptFlow</span>
          </div>

          <div className="mt-5 space-y-3">
            <div className="h-3 rounded-full bg-slate-100" />
            <div className="h-3 w-4/5 rounded-full bg-slate-100" />
            <div className="flex items-center gap-3 rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-500">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Unexpected exception caught
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ErrorState({
  code = "ERR-PROMPTFLOW-500",
  description = "We’re sorry, but something unexpected happened.",
  onRetry,
  retryLabel = "Try Again",
  title = "Something went wrong",
}) {
  return (
    <PageContainer className="flex min-h-[calc(100vh-180px)] items-center py-12 sm:py-16" size="xl">
      <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
        <MotionReveal className="space-y-6" preset="staggerFadeUp">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-4 py-2 text-sm font-semibold text-primary shadow-[0_0_24px_rgba(139,92,246,0.1)]">
            <Sparkles className="h-4 w-4" />
            PromptFlow Recovery Center
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 rounded-[22px] border border-slate-200 bg-white/88 px-5 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-tight text-slate-950">PromptFlow</p>
                <p className="text-xs uppercase tracking-[0.22em] text-primary">Error Boundary</p>
              </div>
            </div>

            <h1 className="max-w-[13ch] text-balance text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl md:text-6xl">
              {title}
            </h1>
            <p className="max-w-2xl text-balance text-base leading-7 text-slate-500 sm:text-lg">
              {description}
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-rose-400" />
            Error reference
            <span className="font-semibold tracking-[0.18em] text-slate-900">{code}</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              endIcon={<RefreshCcw className="h-4 w-4" />}
              onPress={onRetry}
              size="lg"
            >
              {retryLabel}
            </Button>
            <Button
              as={Link}
              endIcon={<Home className="h-4 w-4" />}
              href="/"
              size="lg"
              variant="secondary"
            >
              Back to Home
            </Button>
          </div>
        </MotionReveal>

        <MotionReveal className="mx-auto w-full" preset="viewportReveal">
          <ErrorIllustration />
        </MotionReveal>
      </div>
    </PageContainer>
  );
}
