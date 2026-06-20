"use client";

import Link from "next/link";
import { Bookmark, Copy, Star } from "lucide-react";

import Button from "@/components/ui/Button";
import { formatCompactNumber } from "@/lib/marketplace";

function toneClassForVisibility(visibility) {
  return visibility === "Premium"
    ? "border-primary/20 bg-primary/10 text-primary"
    : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
}

function toneClassForDifficulty(difficulty) {
  if (difficulty === "Advanced") {
    return "border-danger/20 bg-danger/10 text-danger";
  }

  if (difficulty === "Intermediate") {
    return "border-warning/20 bg-warning/10 text-warning";
  }

  return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
}

export default function PromptCard({
  author,
  category,
  copyCount,
  description,
  difficulty,
  aiTool,
  rating,
  title,
  visibility,
  accent,
}) {
  return (
    <article className="pf-card overflow-hidden rounded-xl p-3 md:p-4">
      <div className={`mb-4 h-36 rounded-xl bg-gradient-to-br ${accent}`} />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-pill border px-2.5 py-1 text-body-xs font-medium ${toneClassForVisibility(visibility)}`}>
          {visibility}
        </span>
        <span className="rounded-pill border border-white/10 bg-white/[0.05] px-2.5 py-1 text-body-xs text-primary">
          {category}
        </span>
        <span className={`rounded-pill border px-2.5 py-1 text-body-xs font-medium ${toneClassForDifficulty(difficulty)}`}>
          {difficulty}
        </span>
      </div>

      <div className="space-y-2">
        <h3 className="text-h3">{title}</h3>
        <p className="line-clamp-2 text-body-sm text-muted">{description}</p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-white/8 pt-4 text-body-xs text-muted">
        <span className="inline-flex items-center gap-1.5 text-foreground">
          <span className="rounded-pill border border-white/10 bg-white/[0.04] px-2 py-1">{aiTool}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-current text-warning" />
          {rating.toFixed(1)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Copy className="h-4 w-4" />
          {formatCompactNumber(copyCount)}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-body-sm font-medium text-foreground">{author}</p>
          <p className="text-body-xs text-muted">Prompt creator</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="pf-touch-target inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-muted transition hover:text-foreground"
            type="button"
          >
            <Bookmark className="h-4 w-4" />
          </button>
          <Button as={Link} href="/prompts" size="sm" variant="secondary">
            View Details
          </Button>
        </div>
      </div>
    </article>
  );
}
