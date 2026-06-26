"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Bookmark, Copy, Star } from "lucide-react";

import Button from "@/components/ui/Button";
import { usePromptBookmark } from "@/hooks/usePromptBookmark";
import { formatCompactNumber } from "@/lib/marketplace";
import { getPromptId } from "@/lib/prompt-id";

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

function PromptCardMedia({ accent, imageSrc, title }) {
  const [failedImageSrc, setFailedImageSrc] = useState("");
  const hasImageError = Boolean(imageSrc && failedImageSrc === imageSrc);

  if (imageSrc && !hasImageError) {
    return (
      <div className="relative mb-4 h-44 overflow-hidden rounded-xl border border-white/10 bg-slate-950/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={title}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setFailedImageSrc(imageSrc)}
          src={imageSrc}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/70 to-transparent" />
      </div>
    );
  }

  return (
    <div className={`relative mb-4 flex h-44 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${accent}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_28%)]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/75 to-transparent" />
      <div className="relative mt-auto p-4">
        <span className="inline-flex rounded-pill border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">
          Prompt Preview
        </span>
        <p className="mt-3 line-clamp-2 max-w-[18rem] text-sm font-semibold text-white">{title}</p>
      </div>
    </div>
  );
}

export default function PromptCard({
  author,
  category,
  copyCount,
  description,
  difficulty,
  id,
  _id,
  aiTool,
  thumbnail,
  image,
  coverImage,
  rating,
  title,
  visibility,
  accent,
}) {
  const promptId = getPromptId({ _id, id });
  const shouldReduceMotion = useReducedMotion();
  const imageSrc = useMemo(
    () => thumbnail || image || coverImage || "",
    [coverImage, image, thumbnail],
  );
  const prompt = {
    id: promptId,
    _id: promptId,
    title,
    category,
    aiTool,
    difficulty,
    visibility,
    rating,
    copyCount,
    author,
    description,
    thumbnail: imageSrc,
    accent,
  };
  const { handleBookmarkToggle, isBookmarked, isBookmarkLoading } = usePromptBookmark(prompt);

  return (
    <motion.article
      className="pf-card flex h-full min-h-[100%] flex-col overflow-hidden rounded-xl p-3 md:p-4"
      whileHover={shouldReduceMotion ? undefined : { y: -6, scale: 1.01 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
    >
      <PromptCardMedia accent={accent} imageSrc={imageSrc} title={title} />

      <div className="flex flex-1 flex-col">
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
          <h3 className="line-clamp-2 min-h-[3.5rem] text-h3">{title}</h3>
          <p className="line-clamp-3 min-h-[4.5rem] text-body-sm text-muted">{description}</p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-white/8 pt-4 text-body-xs text-muted">
          <span className="inline-flex items-center gap-1.5 text-foreground">
            <span className="rounded-pill border border-white/10 bg-white/[0.04] px-2 py-1">{aiTool}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-current text-warning" />
            {Number(rating || 0).toFixed(1)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Copy className="h-4 w-4" />
            {formatCompactNumber(copyCount)}
          </span>
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-body-sm font-medium text-foreground">{author}</p>
              <p className="text-body-xs text-muted">Prompt creator</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <motion.button
                aria-label={isBookmarked ? `Remove ${title} bookmark` : `Save ${title} bookmark`}
                className="pf-touch-target inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-muted transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isBookmarkLoading}
                onClick={handleBookmarkToggle}
                type="button"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.08 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current text-foreground" : ""}`} />
              </motion.button>
              <Button as={Link} href={`/prompts/${promptId}`} size="sm" variant="secondary">
                View Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
