"use client";

import Link from "next/link";
import { Check, Crown, Lock, ShieldCheck, Sparkles, Zap } from "lucide-react";

import MotionReveal from "@/components/shared/MotionReveal";
import PageContainer from "@/components/shared/PageContainer";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { FREE_PLAN, isPremiumSubscription, PREMIUM_PLAN } from "@/lib/payments";

function PlanCard({ accent, ctaHref, ctaLabel, features, highlighted = false, icon: Icon, priceLabel, subtitle, title }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[30px] border p-6 shadow-[0_24px_70px_rgba(15,23,42,0.1)] md:p-7 ${
        highlighted
          ? "border-primary/30 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.22),transparent_28%),linear-gradient(180deg,#081122_0%,#10182c_100%)] text-white"
          : "border-slate-200 bg-white text-slate-950"
      }`}
    >
      {highlighted ? (
        <span className="absolute right-5 top-5 rounded-full border border-white/14 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
          Recommended
        </span>
      ) : null}

      <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${accent}`}>
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="mt-5 text-3xl font-semibold tracking-tight">{title}</h2>
      <p className={`mt-3 text-sm leading-6 ${highlighted ? "text-white/72" : "text-slate-500"}`}>{subtitle}</p>

      <div className="mt-6 flex items-end gap-2">
        <span className="text-5xl font-semibold tracking-tight">{priceLabel}</span>
      </div>

      <div className={`mt-6 space-y-3 rounded-[24px] border p-4 ${highlighted ? "border-white/10 bg-white/6" : "border-slate-200 bg-slate-50/90"}`}>
        {features.map((feature) => (
          <div key={feature} className={`flex items-center gap-3 text-sm ${highlighted ? "text-white/84" : "text-slate-600"}`}>
            <span className={`flex h-8 w-8 items-center justify-center rounded-full ${highlighted ? "bg-white/12 text-white" : "bg-primary/10 text-primary"}`}>
              <Check className="h-4 w-4" />
            </span>
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <Button
        as={Link}
        className={`mt-6 w-full justify-center ${highlighted ? "border-white/0" : ""}`}
        href={ctaHref}
        size="lg"
        variant={highlighted ? "solid" : "secondary"}
      >
        {ctaLabel}
      </Button>
    </div>
  );
}

function ComparisonRow({ free, label, premium }) {
  return (
    <div className="grid gap-3 border-b border-slate-200 py-4 text-sm text-slate-600 md:grid-cols-[1.2fr_0.7fr_0.7fr] md:items-center">
      <div className="font-medium text-slate-900">{label}</div>
      <div>{free}</div>
      <div className="font-medium text-primary">{premium}</div>
    </div>
  );
}

export default function PricingPage() {
  const { user } = useAuth();
  const isPremiumUser = isPremiumSubscription(user?.subscription);

  return (
    <PageContainer className="space-y-8 py-10 md:py-14" size="xl">
      <MotionReveal preset="contentFade">
        <section className="overflow-hidden rounded-[34px] border border-primary/15 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.26),transparent_26%),linear-gradient(135deg,#081122_0%,#131d3a_55%,#1f2d57_100%)] px-6 py-8 text-white shadow-[0_26px_90px_rgba(15,23,42,0.24)] md:px-8 md:py-10">
          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
            <div>
              <span className="inline-flex rounded-full border border-white/14 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/82">
                Premium Access
              </span>
              <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight md:text-6xl">
                Unlock every premium prompt for just $5
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/74 md:text-lg">
                PromptFlow premium is a one-time upgrade designed to keep checkout simple while giving you access to private prompts, unlimited copying, and stronger creator tools.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button as={Link} href={isPremiumUser ? "/premium" : "/payment"} size="lg">
                  {isPremiumUser ? "View Premium Status" : "Upgrade Now - $5"}
                </Button>
                <Button as={Link} href="/prompts" size="lg" variant="secondary">
                  Explore Marketplace
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Lock, title: "Premium prompt access", body: "Open private and paid creator prompts across the marketplace." },
                { icon: Sparkles, title: "Unlimited premium copying", body: "Use premium prompts without the free-tier lock overlay." },
                { icon: Zap, title: "Faster creator workflows", body: "Unlock deeper systems, higher-quality templates, and better outcomes." },
                { icon: ShieldCheck, title: "Secure checkout feel", body: "Clear billing summary, lightweight form UI, and visible trust indicators." },
              ].map((item) => (
                <div key={item.title} className="rounded-[24px] border border-white/12 bg-white/8 p-5 backdrop-blur-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/72">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </MotionReveal>

      <MotionReveal preset="viewportReveal">
        <section className="grid gap-6 xl:grid-cols-2">
          <PlanCard
            accent="bg-slate-100 text-slate-700"
            ctaHref="/prompts"
            ctaLabel="Stay on Free"
            features={FREE_PLAN.features}
            icon={Sparkles}
            priceLabel="$0"
            subtitle="A great starting point for exploring public prompts and getting familiar with PromptFlow."
            title={FREE_PLAN.name}
          />
          <PlanCard
            accent="bg-white/10 text-white"
            ctaHref={isPremiumUser ? "/premium" : "/payment"}
            ctaLabel={isPremiumUser ? "Manage Premium" : PREMIUM_PLAN.ctaLabel}
            features={PREMIUM_PLAN.features}
            highlighted
            icon={Crown}
            priceLabel="$5"
            subtitle="One-time upgrade for premium prompts, better creator content, and a smoother workflow."
            title={PREMIUM_PLAN.name}
          />
        </section>
      </MotionReveal>

      <MotionReveal preset="viewportReveal">
        <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] md:p-7">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Comparison</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Plan feature comparison</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-500">
              The premium plan is intentionally simple: one secure $5 upgrade to unlock the best PromptFlow experience.
            </p>
          </div>

          <div>
            <div className="hidden grid-cols-[1.2fr_0.7fr_0.7fr] gap-3 pb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 md:grid">
              <span>Feature</span>
              <span>Free</span>
              <span>Premium</span>
            </div>
            <ComparisonRow free="Public only" label="Prompt access" premium="Public + private premium" />
            <ComparisonRow free="Limited" label="Premium prompt copying" premium="Unlimited" />
            <ComparisonRow free="Standard" label="Creator quality templates" premium="Advanced library" />
            <ComparisonRow free="Basic" label="Support priority" premium="Priority support" />
            <ComparisonRow free="Standard badge" label="Account status" premium="Premium badge" />
          </div>
        </section>
      </MotionReveal>
    </PageContainer>
  );
}
