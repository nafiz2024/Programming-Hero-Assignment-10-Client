"use client";

import { motion, useReducedMotion } from "framer-motion";
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
  const shouldReduceMotion = useReducedMotion();

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
          return (
            <motion.span
              animate={rating >= value || index < rounded ? { scale: [1, 1.04, 1] } : undefined}
              key={`review-star-${value}`}
              transition={{ duration: 0.24, ease: "easeOut" }}
            >
              {icon}
            </motion.span>
          );
        }

        return (
          <motion.button
            key={`review-star-${value}`}
            aria-label={`Rate ${value} stars`}
            className="pf-touch-target inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-warning transition hover:border-primary/30"
            onClick={() => onChange?.(value)}
            type="button"
            whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.08 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
          >
            {icon}
          </motion.button>
        );
      })}
    </div>
  );
}
