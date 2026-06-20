"use client";

import { useState } from "react";
import { MessageSquare, PencilLine, Star, Trash2 } from "lucide-react";

import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import MotionReveal from "@/components/shared/MotionReveal";
import Button from "@/components/ui/Button";
import DashboardSkeleton from "@/components/ui/DashboardSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import ResponsiveDrawer from "@/components/ui/ResponsiveDrawer";
import { useDashboard } from "@/hooks/useDashboard";
import { formatDashboardDate } from "@/lib/dashboard";
import { toastSuccess } from "@/lib/toast";

function ReviewStars({ rating, onSelect }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: 5 }).map((_, index) => {
        const value = index + 1;

        return (
          <button
            key={`review-star-${value}`}
            className="text-amber-400"
            onClick={() => onSelect?.(value)}
            type="button"
          >
            <Star className={`h-5 w-5 ${rating >= value ? "fill-current" : ""}`} />
          </button>
        );
      })}
    </div>
  );
}

export default function DashboardReviews() {
  const { error, localReviews, refreshDashboard, status, updateReviewsLocally } = useDashboard();
  const [activeReview, setActiveReview] = useState(null);
  const [form, setForm] = useState({
    rating: 5,
    comment: "",
  });

  function openEditor(review) {
    setActiveReview(review);
    setForm({
      rating: review.rating,
      comment: review.comment,
    });
  }

  function handleSave() {
    const nextReviews = localReviews.map((review) =>
      review.id === activeReview.id
        ? {
            ...review,
            rating: form.rating,
            comment: form.comment,
            createdAt: new Date().toISOString(),
          }
        : review,
    );

    updateReviewsLocally(nextReviews);
    setActiveReview(null);
    toastSuccess("Review updated locally");
  }

  function handleDelete(reviewId) {
    const nextReviews = localReviews.filter((review) => review.id !== reviewId);
    updateReviewsLocally(nextReviews);
    toastSuccess("Review removed locally");
  }

  if (status === "loading") {
    return <DashboardSkeleton />;
  }

  if (status === "error") {
    return <ErrorState description={error} onRetry={refreshDashboard} title="Unable to load reviews" />;
  }

  return (
    <>
      <div className="space-y-6">
        <DashboardPageHeader crumbs={["Dashboard", "My Reviews"]} description="Your review history is managed locally until a user review endpoint is available." title="My Reviews" />

        <MotionReveal preset="viewportReveal">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
            {localReviews.length === 0 ? (
              <EmptyState
                description="No local review entries exist yet. Once user review APIs are available, this page can connect directly."
                title="No reviews to show"
              />
            ) : (
              <div className="space-y-4">
                {localReviews.map((review) => (
                  <div key={review.id} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-slate-950">{review.promptTitle}</h3>
                            <p className="text-sm text-slate-500">{formatDashboardDate(review.createdAt)}</p>
                          </div>
                        </div>
                        <ReviewStars rating={review.rating} />
                        <p className="max-w-3xl text-sm leading-7 text-slate-600">{review.comment}</p>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          onPress={() => openEditor(review)}
                          size="sm"
                          variant="secondary"
                        >
                          <PencilLine className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button onPress={() => handleDelete(review.id)} size="sm" variant="danger">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </MotionReveal>
      </div>

      <ResponsiveDrawer isOpen={Boolean(activeReview)} onClose={() => setActiveReview(null)} title="Edit Review">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700">Rating</p>
            <div className="mt-3">
              <ReviewStars rating={form.rating} onSelect={(rating) => setForm((currentForm) => ({ ...currentForm, rating }))} />
            </div>
          </div>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Comment</span>
            <textarea
              className="min-h-[160px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              onChange={(event) => setForm((currentForm) => ({ ...currentForm, comment: event.target.value }))}
              value={form.comment}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <Button
              className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              onPress={() => setActiveReview(null)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button onPress={handleSave}>Save Review</Button>
          </div>
        </div>
      </ResponsiveDrawer>
    </>
  );
}
