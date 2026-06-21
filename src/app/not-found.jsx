"use client";

import Link from "next/link";
import { ArrowRight, Bot, Home, Search, Sparkles } from "lucide-react";

import MarketingChrome from "@/components/layout/MarketingChrome";
import MotionReveal from "@/components/shared/MotionReveal";
import PageContainer from "@/components/shared/PageContainer";
import Button from "@/components/ui/Button";

function PromptIllustration() {
  return (
    <div className="pf-404-orbit pf-404-grid relative mx-auto flex aspect-square w-full max-w-[420px] items-center justify-center rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.2),transparent_35%),linear-gradient(180deg,rgba(12,18,36,0.96)_0%,rgba(7,11,24,0.98)_100%)] p-8 shadow-[0_30px_100px_rgba(2,6,23,0.56)]">
      <div className="absolute inset-x-10 bottom-0 h-24 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.24),transparent_68%)] blur-2xl" />

      <div className="absolute left-8 top-8 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/12 text-primary shadow-[0_0_40px_rgba(139,92,246,0.24)]">
        <Sparkles className="h-5 w-5" />
      </div>
      <div className="absolute right-10 top-16 flex h-10 w-10 items-center justify-center rounded-full border border-secondary/25 bg-secondary/10 text-secondary shadow-[0_0_34px_rgba(96,165,250,0.2)]">
        <Search className="h-4 w-4" />
      </div>
      <div className="absolute bottom-12 right-10 flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 shadow-[0_0_32px_rgba(52,211,153,0.18)]">
        <Bot className="h-5 w-5" />
      </div>

      <div className="relative z-10 w-full max-w-[320px] rounded-[30px] border border-white/12 bg-white/[0.04] p-5 backdrop-blur-xl">
        <div className="mb-5 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-400/90" />
          <span className="h-3 w-3 rounded-full bg-amber-300/90" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/90" />
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Lost Prompt
            </span>
            <span className="text-xs font-medium text-slate-400">AI Trace</span>
          </div>

          <div className="space-y-3 font-mono text-sm leading-6 text-slate-200">
            <p>{">"} route.lookup(&quot;/this-page&quot;)</p>
            <p className="text-rose-300">{">"} result: 404_not_found</p>
            <p className="text-emerald-300">{">"} suggestion: explore_prompts()</p>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="h-2.5 flex-1 rounded-full bg-white/8">
              <div className="h-full w-2/3 rounded-full bg-brand-gradient" />
            </div>
            <span className="text-xs font-medium text-slate-400">rerouting</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <MarketingChrome>
      <PageContainer className="flex min-h-[calc(100vh-180px)] items-center py-12 sm:py-16" size="xl">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
          <MotionReveal className="space-y-6" preset="staggerFadeUp">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary shadow-[0_0_30px_rgba(139,92,246,0.16)]">
              <Sparkles className="h-4 w-4" />
              PromptFlow Navigation Error
            </div>

            <div className="space-y-4">
              <p className="bg-brand-gradient bg-clip-text text-7xl font-semibold leading-none tracking-[-0.08em] text-transparent sm:text-8xl md:text-9xl">
                404
              </p>
              <h1 className="max-w-[12ch] text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Page Not Found
              </h1>
              <p className="max-w-2xl text-balance text-base leading-7 text-muted sm:text-lg">
                The page you&apos;re looking for has drifted outside the PromptFlow workspace. Let&apos;s get you back to the
                prompt library or home base.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button as={Link} href="/" size="lg">
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
              <Button
                as={Link}
                endIcon={<ArrowRight className="h-4 w-4" />}
                href="/prompts"
                size="lg"
                variant="secondary"
              >
                Explore Prompts
              </Button>
            </div>
          </MotionReveal>

          <MotionReveal className="mx-auto w-full" preset="viewportReveal">
            <PromptIllustration />
          </MotionReveal>
        </div>
      </PageContainer>
    </MarketingChrome>
  );
}
