"use client";

import Link from "next/link";
import { Bookmark, Copy, Star } from "lucide-react";

import Button from "@/components/ui/Button";
import MotionReveal from "@/components/shared/MotionReveal";
import { MotionStagger, MotionStaggerItem } from "@/components/shared/MotionStagger";
import SectionHeader from "@/components/shared/SectionHeader";
import { featuredPrompts } from "@/lib/homepage-data";

function PromptPreviewCard({ author, category, copies, description, model, rating, title, accent }) {
  return (
    <article className="pf-card overflow-hidden rounded-lg p-4">
      <div className={`mb-4 h-36 rounded-xl bg-gradient-to-br ${accent}`} />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-pill border border-warning/20 bg-warning/10 px-2.5 py-1 text-body-xs font-medium text-warning">
          Featured
        </span>
        <span className="rounded-pill border border-primary/20 bg-primary/10 px-2.5 py-1 text-body-xs font-medium text-primary">
          {model}
        </span>
      </div>
      <p className="text-body-xs font-semibold uppercase tracking-[0.18em] text-muted">{category}</p>
      <h3 className="mt-2 text-h3">{title}</h3>
      <p className="mt-3 text-body-sm text-muted">{description}</p>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/8 pt-4">
        <div className="flex items-center gap-4 text-body-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-current text-warning" />
            {rating}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Copy className="h-4 w-4" />
            {copies}
          </span>
        </div>
        <button className="pf-touch-target inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-muted transition hover:text-foreground">
          <Bookmark className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-body-sm font-medium text-foreground">{author}</p>
          <p className="text-body-xs text-muted">Creator spotlight</p>
        </div>
        <Button as={Link} href="/prompts" size="sm" variant="secondary">
          View Details
        </Button>
      </div>
    </article>
  );
}

export default function PromptPreviewSection() {
  return (
    <section className="space-y-6">
      <MotionReveal>
        <SectionHeader
          action={<Button as={Link} href="/prompts" size="sm" variant="ghost">View all prompts</Button>}
          description="A quick preview of polished prompt listings using mock marketplace data only."
          eyebrow="Prompt Previews"
          title="Prompts People Are Using Right Now"
        />
      </MotionReveal>

      <MotionStagger className="grid gap-4 md:grid-cols-2 desktop:grid-cols-4" preset="dashboardCardStagger">
        {featuredPrompts.map((prompt) => (
          <MotionStaggerItem key={prompt.title}>
            <PromptPreviewCard {...prompt} />
          </MotionStaggerItem>
        ))}
      </MotionStagger>
    </section>
  );
}
