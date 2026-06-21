"use client";

import { useState } from "react";

import RatingStars from "@/components/reviews/RatingStars";
import Button from "@/components/ui/Button";

export default function ReviewForm({
  existingReview = null,
  isAuthenticated = false,
  isSubmitting = false,
  onSubmit,
}) {
  const [values, setValues] = useState(() => ({
    rating: existingReview?.rating || 0,
    comment: existingReview?.comment || "",
  }));
  const [errors, setErrors] = useState({});

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};

    if (!values.rating) {
      nextErrors.rating = "Please select a rating.";
    }

    if (!values.comment.trim()) {
      nextErrors.comment = "Please add a review comment.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onSubmit?.({
      rating: values.rating,
      comment: values.comment.trim(),
    });
  }

  return (
    <form className="rounded-xl border border-white/8 bg-white/[0.03] p-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <h3 className="text-h3">{existingReview ? "Update Review" : "Write a review"}</h3>
        <p className="text-body-sm text-muted">
          {existingReview
            ? "Update your review to reflect your latest experience."
            : "Share your experience to help other buyers."}
        </p>
      </div>

      <div className="mt-4">
        <RatingStars
          interactive
          onChange={(rating) => setValues((currentState) => ({ ...currentState, rating }))}
          rating={values.rating}
          size="md"
        />
        {errors.rating ? (
          <p className="mt-2 text-body-xs text-danger">{errors.rating}</p>
        ) : null}
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition focus-within:border-primary/50 focus-within:shadow-glow">
        <textarea
          className="min-h-[120px] w-full resize-none bg-transparent text-body-sm text-foreground outline-none placeholder:text-muted"
          maxLength={500}
          onChange={(event) =>
            setValues((currentState) => ({
              ...currentState,
              comment: event.target.value,
            }))
          }
          placeholder="Write your review here..."
          value={values.comment}
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          {errors.comment ? (
            <p className="text-body-xs text-danger">{errors.comment}</p>
          ) : (
            <p className="text-body-xs text-muted">
              {isAuthenticated
                ? "Your review will be visible to other users."
                : "Please log in to submit a review."}
            </p>
          )}
          <span className="text-body-xs text-muted">{values.comment.length}/500</span>
        </div>
      </div>

      <Button className="mt-5" isLoading={isSubmitting} size="lg" type="submit">
        {existingReview ? "Update Review" : "Submit Review"}
      </Button>
    </form>
  );
}
