"use client";

import RatingStars from "@/components/reviews/RatingStars";

function RatingBar({ count, star, totalReviews }) {
  const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

  return (
    <div className="grid grid-cols-[52px_minmax(0,1fr)_64px] items-center gap-3 text-body-sm text-muted">
      <span>{star} star</span>
      <div className="h-2 rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-brand-gradient"
          style={{ width: `${Math.max(percentage, count > 0 ? 6 : 0)}%` }}
        />
      </div>
      <span className="text-right">{count}</span>
    </div>
  );
}

export default function RatingSummary({
  averageRating = 0,
  distribution = [],
  totalReviews = 0,
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
      <p className="text-display-sm">
        {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
      </p>
      <div className="mt-3">
        <RatingStars rating={averageRating} size="lg" />
      </div>
      <p className="mt-3 text-body-sm text-muted">
        {totalReviews > 0
          ? `${totalReviews} total reviews`
          : "No reviews yet. Be the first to review this prompt."}
      </p>

      <div className="mt-5 space-y-3">
        {distribution.map((entry) => (
          <RatingBar
            key={entry.star}
            count={entry.count}
            star={entry.star}
            totalReviews={Math.max(totalReviews, 1)}
          />
        ))}
      </div>
    </div>
  );
}
