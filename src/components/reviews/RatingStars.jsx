"use client";

import { Star } from "lucide-react";
import clsx from "clsx";

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export default function RatingStars({
  className,
  interactive = false,
  onChange,
  rating = 0,
  size = "sm",
}) {
  const resolvedSize = sizeMap[size] || sizeMap.sm;
  const rounded = Math.round(rating);

  return (
    <div className={clsx("flex items-center gap-1 text-warning", className)}>
      {Array.from({ length: 5 }).map((_, index) => {
        const value = index + 1;
        const icon = (
          <Star
            className={clsx(
              resolvedSize,
              rating >= value || (!interactive && index < rounded)
                ? "fill-current"
                : "text-white/15",
            )}
          />
        );

        if (!interactive) {
          return <span key={`review-star-${value}`}>{icon}</span>;
        }

        return (
          <button
            key={`review-star-${value}`}
            aria-label={`Rate ${value} stars`}
            className="pf-touch-target inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-warning transition hover:border-primary/30"
            onClick={() => onChange?.(value)}
            type="button"
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}
