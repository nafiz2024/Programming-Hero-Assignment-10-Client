"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

function buildPages(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "...", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

export default function Pagination({ currentPage, onPageChange, totalPages }) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = buildPages(currentPage, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        className="pf-touch-target inline-flex h-11 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-4 text-body-sm text-muted transition hover:border-white/16 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        type="button"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>

      {pages.map((page, index) =>
        page === "..." ? (
          <span
            key={`ellipsis-${index}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <button
            key={page}
            className={clsx(
              "pf-touch-target inline-flex h-11 w-11 items-center justify-center rounded-md border text-body-sm font-medium transition",
              currentPage === page
                ? "border-primary/30 bg-brand-gradient text-white shadow-glow"
                : "border-white/10 bg-white/[0.04] text-foreground hover:border-white/16 hover:bg-white/[0.08]",
            )}
            onClick={() => onPageChange(page)}
            type="button"
          >
            {page}
          </button>
        ),
      )}

      <button
        className="pf-touch-target inline-flex h-11 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-4 text-body-sm text-foreground transition hover:border-white/16 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        type="button"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
