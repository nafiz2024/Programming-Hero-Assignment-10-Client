"use client";

import { ArrowRight } from "lucide-react";

import MotionReveal from "@/components/shared/MotionReveal";
import { MotionStagger, MotionStaggerItem } from "@/components/shared/MotionStagger";
import SectionHeader from "@/components/shared/SectionHeader";
import { featuredCategories } from "@/lib/homepage-data";

export default function CategorySection() {
  return (
    <section className="space-y-6" id="categories">
      <MotionReveal>
        <SectionHeader
          description="Browse curated categories tailored for the highest-leverage AI workflows across business, design, and development."
          eyebrow="Featured Categories"
          title="Explore By AI Category"
        />
      </MotionReveal>

      <MotionStagger className="grid gap-4 md:grid-cols-2 desktop:grid-cols-3" preset="staggerFadeUp">
        {featuredCategories.map(({ count, description, icon: Icon, title, tone }) => (
          <MotionStaggerItem key={title}>
            <article className="pf-card group relative overflow-hidden rounded-lg p-5">
              <div className={`absolute inset-0 bg-gradient-to-br ${tone} opacity-70 transition duration-300 group-hover:opacity-100`} />
              <div className="relative z-10">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-background/40 text-primary shadow-glow">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted transition duration-300 group-hover:translate-x-1 group-hover:text-foreground" />
                </div>
                <h3 className="text-h3">{title}</h3>
                <p className="mt-3 text-body-sm text-muted">{description}</p>
                <div className="mt-5 inline-flex rounded-pill border border-white/10 bg-white/[0.04] px-3 py-1.5 text-body-xs text-foreground">
                  {count}
                </div>
              </div>
            </article>
          </MotionStaggerItem>
        ))}
      </MotionStagger>
    </section>
  );
}
