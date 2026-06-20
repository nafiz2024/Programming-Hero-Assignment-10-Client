"use client";

import Link from "next/link";
import { CheckCircle2, Sparkles, Users } from "lucide-react";

import Button from "@/components/ui/Button";
import MotionReveal from "@/components/shared/MotionReveal";
import { creatorHighlights } from "@/lib/homepage-data";

export default function CreatorCtaSection() {
  return (
    <MotionReveal preset="contentFade">
      <section className="pf-card relative overflow-hidden rounded-[28px] px-6 py-8 md:px-8 md:py-10 desktop:px-12" id="creators">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.26),transparent_42%)] desktop:block" />
        <div className="absolute right-8 top-8 hidden h-24 w-24 rounded-[28px] border border-primary/20 bg-primary/14 shadow-glow desktop:flex desktop:items-center desktop:justify-center desktop:text-primary">
          <Sparkles className="h-8 w-8" />
        </div>

        <div className="relative z-10 grid gap-8 desktop:grid-cols-[minmax(0,1fr)_360px] desktop:items-center">
          <div className="max-w-2xl space-y-4">
            <p className="text-body-xs font-semibold uppercase tracking-[0.22em] text-primary">Creator Program</p>
            <h2 className="text-display-md text-balance">Have a prompt that produces great results?</h2>
            <p className="text-body text-muted">
              Join thousands of creators earning from their expertise and helping other teams succeed with better AI workflows.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {creatorHighlights.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-body-sm text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pf-card rounded-[24px] p-5">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-h2">Become a Creator</h3>
            <p className="mt-3 text-body-sm text-muted">
              Publish premium prompts, grow your audience, and turn your systems into revenue.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button as={Link} href="/register" showArrow size="lg">
                Become a Creator
              </Button>
              <Button as={Link} href="/register" size="lg" variant="secondary">
                View Creator Benefits
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MotionReveal>
  );
}
