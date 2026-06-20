"use client";

import MotionReveal from "@/components/shared/MotionReveal";
import { MotionStagger, MotionStaggerItem } from "@/components/shared/MotionStagger";
import { benefits } from "@/lib/homepage-data";

export default function BenefitsSection() {
  return (
    <section className="space-y-6">
      <MotionReveal>
        <div className="max-w-2xl space-y-3">
          <p className="text-body-xs font-semibold uppercase tracking-[0.22em] text-primary">Why PromptFlow</p>
          <h2 className="text-h2">A faster path from idea to high-quality AI output</h2>
          <p className="text-body text-muted">
            Every section of the platform is designed to help users discover trusted prompts, repeat winning workflows, and ship stronger work.
          </p>
        </div>
      </MotionReveal>

      <MotionStagger className="grid gap-4 md:grid-cols-2 desktop:grid-cols-4" preset="staggerFadeUp">
        {benefits.map(({ description, icon: Icon, title }) => (
          <MotionStaggerItem key={title}>
            <div className="pf-card rounded-lg p-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-primary/12 text-primary shadow-glow">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-h3">{title}</h3>
              <p className="mt-3 text-body-sm text-muted">{description}</p>
            </div>
          </MotionStaggerItem>
        ))}
      </MotionStagger>
    </section>
  );
}
