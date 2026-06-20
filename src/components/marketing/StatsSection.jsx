"use client";

import { MotionStagger, MotionStaggerItem } from "@/components/shared/MotionStagger";
import { featuredStats } from "@/lib/homepage-data";

export default function StatsSection() {
  return (
    <MotionStagger className="grid gap-4 sm:grid-cols-2 desktop:grid-cols-4" preset="dashboardCardStagger">
      {featuredStats.map(({ icon: Icon, label, note, value }) => (
        <MotionStaggerItem key={label}>
          <div className="pf-card rounded-lg p-5">
            <div className="mb-6 flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-primary/12 text-primary shadow-glow">
                <Icon className="h-5 w-5" />
              </div>
              <span className="rounded-pill border border-success/20 bg-success/10 px-2.5 py-1 text-body-xs font-medium text-success">
                Live
              </span>
            </div>
            <p className="text-body-xs font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
            <p className="mt-2 text-display-md leading-none">{value}</p>
            <p className="mt-3 text-body-sm text-muted">{note}</p>
          </div>
        </MotionStaggerItem>
      ))}
    </MotionStagger>
  );
}
