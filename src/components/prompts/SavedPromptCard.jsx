"use client";

import Link from "next/link";
import { BookmarkMinus, Copy, Star } from "lucide-react";

import Button from "@/components/ui/Button";
import { formatDashboardDate } from "@/lib/dashboard";
import { formatCompactNumber } from "@/lib/marketplace";

function Thumbnail({ accent, title, thumbnailUrl }) {
  if (thumbnailUrl) {
    return (
      <div className="mb-4 overflow-hidden rounded-[22px] border border-slate-200/70">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={title}
          className="h-40 w-full object-cover"
          loading="lazy"
          src={thumbnailUrl}
        />
      </div>
    );
  }

  return (
    <div className={`mb-4 flex h-40 items-end overflow-hidden rounded-[22px] bg-gradient-to-br ${accent} p-4`}>
      <div className="rounded-2xl border border-white/20 bg-slate-950/20 px-3 py-2 backdrop-blur-sm">
        <p className="line-clamp-2 text-sm font-semibold text-white">{title}</p>
      </div>
    </div>
  );
}

export default function SavedPromptCard({ prompt, onRemove }) {
  const creatorName = prompt.creatorName || prompt.author || "PromptFlow Creator";

  return (
    <article className="rounded-[28px] border border-slate-200/80 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_70px_rgba(98,91,246,0.12)] md:p-5">
      <Thumbnail accent={prompt.accent} thumbnailUrl={prompt.thumbnail || prompt.thumbnailUrl} title={prompt.title} />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#16B8A6]/12 px-3 py-1 text-xs font-semibold text-[#16B8A6]">
            {prompt.aiTool}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {prompt.category}
          </span>
        </div>

        <div>
          <h3 className="line-clamp-2 text-xl font-semibold tracking-[-0.03em] text-slate-950">
            {prompt.title}
          </h3>
          <p className="mt-2 text-sm text-slate-600">By {creatorName}</p>
          <p className="mt-1 text-sm text-slate-500">
            Saved on {formatDashboardDate(prompt.savedAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 pt-3 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-current text-[#FFB547]" />
            {prompt.rating.toFixed(1)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Copy className="h-4 w-4 text-[#625BF6]" />
            {formatCompactNumber(prompt.copyCount)}
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Button
          as={Link}
          className="flex-1 border border-slate-200 bg-white text-[#625BF6] hover:bg-slate-50"
          href={`/prompts/${prompt.id}`}
          variant="secondary"
        >
          View Details
        </Button>
        <button
          aria-label={`Remove ${prompt.title} bookmark`}
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-500 transition hover:bg-rose-100"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onRemove();
          }}
          type="button"
        >
          <BookmarkMinus className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
