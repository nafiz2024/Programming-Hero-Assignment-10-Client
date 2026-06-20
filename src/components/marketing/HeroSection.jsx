"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Search, Star } from "lucide-react";

import Button from "@/components/ui/Button";
import { MotionStagger, MotionStaggerItem } from "@/components/shared/MotionStagger";
import { heroChips, heroPanelModels, heroPanelPrompts, heroSectionStats, floatingMetrics, toolIcons } from "@/lib/homepage-data";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-10 pt-4 md:pb-14 desktop:pb-20">
      <div className="absolute inset-x-0 top-0 -z-10 h-[620px] bg-[radial-gradient(circle_at_20%_0%,rgba(139,92,246,0.22),transparent_38%),radial-gradient(circle_at_85%_18%,rgba(96,165,250,0.18),transparent_32%)]" />

      <div className="grid items-center gap-10 desktop:grid-cols-[minmax(0,1fr)_minmax(460px,560px)] desktop:gap-14">
        <MotionStagger className="space-y-7" preset="staggerFadeUp">
          <MotionStaggerItem>
            <div className="inline-flex items-center gap-2 rounded-pill border border-primary/20 bg-primary/10 px-4 py-2 text-body-xs font-semibold text-primary shadow-glow">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Discover. Create. Monetize.
            </div>
          </MotionStaggerItem>

          <MotionStaggerItem>
            <div className="max-w-3xl space-y-4">
              <h1 className="max-w-3xl text-display-md text-balance">
                Turn <span className="bg-brand-gradient bg-clip-text text-transparent">Better Prompts</span>
                <br />
                Into Better Results
              </h1>
              <p className="max-w-2xl text-body text-muted md:text-[1.0625rem]">
                Discover tested AI prompts for writing, design, development, marketing, and automation with a premium marketplace feel.
              </p>
            </div>
          </MotionStaggerItem>

          <MotionStaggerItem>
            <div className="pf-card flex max-w-2xl flex-col gap-3 rounded-xl p-3 md:flex-row md:items-center md:p-4">
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-pill border border-white/10 bg-background-alt/70 px-4 py-3">
                <Search className="h-4 w-4 shrink-0 text-muted" />
                <span className="truncate text-body-sm text-muted">Search prompts, tools or tags</span>
              </div>
              <Button as={Link} className="w-full md:w-auto" href="/prompts" showArrow size="lg">
                Search
              </Button>
            </div>
          </MotionStaggerItem>

          <MotionStaggerItem>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-body-xs font-medium uppercase tracking-[0.18em] text-muted">Trending:</span>
              {heroChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-pill border border-white/10 bg-white/6 px-3 py-1.5 text-body-xs font-medium text-foreground"
                >
                  {chip}
                </span>
              ))}
            </div>
          </MotionStaggerItem>

          <MotionStaggerItem>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button as={Link} href="/prompts" showArrow size="lg">
                Explore Prompts
              </Button>
              <Button as={Link} endIcon={<ArrowRight className="h-4 w-4" />} href="/register" size="lg" variant="secondary">
                Become a Creator
              </Button>
            </div>
          </MotionStaggerItem>

          <MotionStaggerItem>
            <div className="grid gap-3 sm:grid-cols-3">
              {heroSectionStats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-h3">{stat.value}</p>
                  <p className="mt-2 text-body-xs text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </MotionStaggerItem>
        </MotionStagger>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="relative mx-auto w-full max-w-[560px]"
          initial={{ opacity: 0, y: 28 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute -left-6 top-24 hidden h-40 w-40 rounded-full bg-primary/20 blur-3xl md:block" />
          <div className="absolute -right-8 bottom-12 hidden h-48 w-48 rounded-full bg-secondary/20 blur-3xl md:block" />

          <div className="mb-5 flex flex-wrap justify-center gap-3 md:justify-start">
            {toolIcons.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="pf-card flex h-16 w-16 items-center justify-center rounded-md p-0 text-primary md:h-[72px] md:w-[72px]"
              >
                <Icon className="h-6 w-6" />
              </div>
            ))}
          </div>

          <div className="relative">
            <div className="absolute -inset-2 rounded-[34px] bg-brand-gradient opacity-25 blur-2xl" />
            <div className="pf-card relative overflow-hidden rounded-[30px] p-5 md:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-success" />
                  <span className="text-body-xs font-semibold uppercase tracking-[0.18em] text-foreground">AI Command Center</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-white/20" />
                  <span className="h-2 w-2 rounded-full bg-white/20" />
                  <span className="h-2 w-2 rounded-full bg-white/20" />
                </div>
              </div>

              <div className="space-y-3">
                {heroPanelPrompts.map((prompt, index) => (
                  <div
                    key={prompt}
                    className="flex items-start justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.04] p-4"
                  >
                    <div className="min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-body-sm font-medium text-foreground">{prompt}</span>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-pill border border-white/10 bg-white/[0.06] px-3 py-1 text-body-xs text-muted">
                      {heroPanelModels[index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -right-4 top-10 hidden w-36 space-y-3 md:block">
              {floatingMetrics.map((metric) => (
                <div key={metric.label} className="pf-card rounded-lg p-4">
                  <div className="mb-2 flex items-center gap-2 text-warning">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-h3">{metric.value}</span>
                  </div>
                  <p className="text-body-xs text-muted">{metric.label}</p>
                </div>
              ))}
            </div>

            <div className="absolute -bottom-5 right-2 hidden items-center gap-3 rounded-pill border border-white/10 bg-background/88 px-4 py-3 shadow-card md:flex">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-gradient text-white">EJ</div>
              <div>
                <p className="text-body-sm font-semibold text-foreground">Emma Johnson</p>
                <p className="text-body-xs text-muted">Top Creator</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
