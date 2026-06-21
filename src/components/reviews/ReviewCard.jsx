"use client";

import { Pencil, Trash2 } from "lucide-react";

import RatingStars from "@/components/reviews/RatingStars";
import Button from "@/components/ui/Button";
import UserAvatar from "@/components/ui/UserAvatar";

function formatReviewDate(value) {
  if (!value) {
    return "Not available";
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "Not available";
  }
}

export default function ReviewCard({
  canDelete = false,
  canEdit = false,
  isDeleting = false,
  onDelete,
  onEdit,
  review,
}) {
  return (
    <article className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <UserAvatar
            alt={review.authorName}
            className="h-12 w-12 bg-brand-gradient text-body-sm font-semibold text-white shadow-glow"
            fallback={review.initials}
            src={review.image}
          />
          <div className="space-y-1">
            <p className="text-body font-medium text-foreground">{review.authorName}</p>
            <p className="text-body-xs text-muted">{formatReviewDate(review.updatedAt || review.createdAt)}</p>
          </div>
        </div>
        <div className="space-y-2 text-right">
          <RatingStars rating={review.rating} />
          <p className="text-body-xs text-muted">{review.rating.toFixed(1)} / 5</p>
        </div>
      </div>

      <p className="text-body-sm leading-7 text-muted">{review.comment}</p>

      {canEdit || canDelete ? (
        <div className="mt-4 flex flex-wrap gap-3">
          {canEdit ? (
            <Button onPress={() => onEdit?.(review)} size="sm" variant="secondary">
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          ) : null}
          {canDelete ? (
            <Button isLoading={isDeleting} onPress={() => onDelete?.(review)} size="sm" variant="danger">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
