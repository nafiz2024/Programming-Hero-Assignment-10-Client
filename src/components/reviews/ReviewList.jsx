"use client";

import ReviewCard from "@/components/reviews/ReviewCard";
import Button from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";

export default function ReviewList({
  currentUserEmail = "",
  currentUserId = "",
  error = "",
  isAdmin = false,
  isDeleting = false,
  onDelete,
  onEdit,
  onLoadMore,
  onRetry,
  reviews = [],
  status = "success",
  visibleCount = 3,
}) {
  if (status === "error") {
    return (
      <ErrorState
        description={error || "Unable to load reviews."}
        onRetry={onRetry}
        title="Unable to load reviews"
      />
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center">
        <h3 className="text-h3">No reviews yet</h3>
        <p className="mt-3 text-body-sm text-muted">
          Be the first to review this prompt.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.slice(0, visibleCount).map((review) => {
        const isOwnReview =
          (currentUserId && review.authorId && String(currentUserId) === String(review.authorId)) ||
          (currentUserEmail &&
            review.authorEmail &&
            String(currentUserEmail).toLowerCase() === String(review.authorEmail).toLowerCase());

        return (
          <ReviewCard
            canDelete={isAdmin || isOwnReview}
            canEdit={isOwnReview}
            isDeleting={isDeleting}
            key={review.id}
            onDelete={onDelete}
            onEdit={onEdit}
            review={review}
          />
        );
      })}

      {reviews.length > visibleCount ? (
        <Button className="w-full" onPress={onLoadMore} size="lg" variant="secondary">
          Load More Reviews
        </Button>
      ) : null}
    </div>
  );
}
