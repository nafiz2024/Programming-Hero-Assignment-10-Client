"use client";

import { reviewApi } from "@/lib/api";
import { normalizeReviewsPayload } from "@/lib/prompt-details";

export const REVIEW_SYNC_EVENT = "pf-review-sync";

export function getReviewPromptId(review, fallbackPromptId = "") {
  return String(
    review?.promptId ||
      review?.prompt?._id ||
      review?.prompt?.id ||
      review?.prompt ||
      fallbackPromptId ||
      "",
  );
}

export function getReviewUserId(review) {
  return String(
    review?.userId ||
      review?.authorId ||
      review?.user?._id ||
      review?.user?.id ||
      review?.author?._id ||
      review?.author?.id ||
      review?.reviewerId ||
      "",
  );
}

export function reviewMatchesPrompt(review, promptId) {
  return getReviewPromptId(review, promptId) === String(promptId || "");
}

export function reviewBelongsToUser(review, user) {
  if (!review || !user) {
    return false;
  }

  const reviewUserId = getReviewUserId(review);
  const normalizedUserId = String(user?.id || "");

  if (reviewUserId && normalizedUserId && reviewUserId === normalizedUserId) {
    return true;
  }

  const reviewEmail = String(review?.authorEmail || review?.user?.email || review?.reviewerEmail || "").toLowerCase();
  const userEmail = String(user?.email || "").toLowerCase();

  return Boolean(reviewEmail && userEmail && reviewEmail === userEmail);
}

export function summarizeReviews(reviews = []) {
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? Number((reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / totalReviews).toFixed(2))
    : 0;
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((review) => Number(review.rating) === star).length,
  }));

  return {
    averageRating,
    totalReviews,
    distribution,
  };
}

export async function fetchPromptReviewSummary(promptId) {
  const payload = await reviewApi.getByPrompt(promptId);
  const normalized = normalizeReviewsPayload(payload, { promptId });
  return {
    promptId: String(promptId),
    ...summarizeReviews(normalized.items),
  };
}

export async function enrichPromptsWithReviewSummaries(prompts = []) {
  const promptIds = prompts
    .map((prompt) => String(prompt?.id || prompt?._id || ""))
    .filter(Boolean);

  if (promptIds.length === 0) {
    return prompts;
  }

  const results = await Promise.allSettled(
    promptIds.map((promptId) => fetchPromptReviewSummary(promptId)),
  );

  const summaryMap = new Map();

  results.forEach((result) => {
    if (result.status === "fulfilled") {
      summaryMap.set(result.value.promptId, result.value);
    }
  });

  return prompts.map((prompt) => {
    const promptId = String(prompt?.id || prompt?._id || "");
    const summary = summaryMap.get(promptId);

    if (!summary) {
      return prompt;
    }

    return {
      ...prompt,
      rating: summary.averageRating,
      reviewCount: summary.totalReviews,
    };
  });
}

export async function fetchUserReviewsForPrompts(prompts = [], user) {
  if (!user?.id && !user?.email) {
    return [];
  }

  const promptEntries = prompts
    .map((prompt) => ({
      id: String(prompt?.id || prompt?._id || ""),
      title: prompt?.title || "PromptFlow prompt",
    }))
    .filter((prompt) => prompt.id);

  const results = await Promise.allSettled(
    promptEntries.map(async (prompt) => {
      const payload = await reviewApi.getByPrompt(prompt.id);
      const normalized = normalizeReviewsPayload(payload, {
        promptId: prompt.id,
        promptTitle: prompt.title,
      });

      return normalized.items
        .filter((review) => reviewMatchesPrompt(review, prompt.id))
        .filter((review) => reviewBelongsToUser(review, user))
        .map((review) => ({
          ...review,
          promptId: prompt.id,
          promptTitle: prompt.title,
        }));
    }),
  );

  return results
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .sort((left, right) => new Date(right.updatedAt || right.createdAt || 0).getTime() - new Date(left.updatedAt || left.createdAt || 0).getTime());
}

export function dispatchReviewSync(promptId) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(REVIEW_SYNC_EVENT, {
      detail: {
        promptId: String(promptId || ""),
      },
    }),
  );
}
