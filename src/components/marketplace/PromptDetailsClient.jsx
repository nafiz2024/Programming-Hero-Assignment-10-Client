"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Bookmark,
  Bot,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  Eye,
  Expand,
  Flag,
  Gauge,
  Loader2,
  Lock,
  Share2,
  Sparkles,
  Star,
  UserPlus,
} from "lucide-react";
import clsx from "clsx";

import MotionReveal from "@/components/shared/MotionReveal";
import { MotionStagger, MotionStaggerItem } from "@/components/shared/MotionStagger";
import ReviewForm from "@/components/reviews/ReviewForm";
import ReviewList from "@/components/reviews/ReviewList";
import RatingSummary from "@/components/reviews/RatingSummary";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import PromptCard from "@/components/marketplace/PromptCard";
import PromptDetailsSkeleton from "@/components/marketplace/PromptDetailsSkeleton";
import SelectField from "@/components/ui/SelectField";
import UserAvatar from "@/components/ui/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { bookmarkApi, promptApi, reportApi, reviewApi } from "@/lib/api";
import {
  getReviewsStorageKey,
  getStorageItem,
  saveDashboardReviews,
} from "@/lib/dashboard";
import { formatCompactNumber } from "@/lib/marketplace";
import { recordPromptView } from "@/lib/notifications";
import { isPremiumSubscription } from "@/lib/payments";
import {
  normalizePromptDetails,
  normalizeReviewsPayload,
  premiumBenefits,
  promptUsageSteps,
  reportReasonOptions,
} from "@/lib/prompt-details";
import { toastError, toastSuccess, toastWarning } from "@/lib/toast";

function formatDate(value, options = { month: "short", day: "numeric", year: "numeric" }) {
  if (!value) {
    return "Not available";
  }

  try {
    return new Intl.DateTimeFormat("en-US", options).format(new Date(value));
  } catch {
    return "Not available";
  }
}

function getBookmarkIds(payload) {
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.bookmarks)
    ? payload.bookmarks
    : Array.isArray(payload?.data)
    ? payload.data
    : [];

  return new Set(
    items
      .map((item) => item?.prompt?._id || item?.promptId || item?._id || item?.id)
      .filter(Boolean),
  );
}

async function syncBookmarkMutation(promptId, shouldBookmark) {
  try {
    if (shouldBookmark) {
      return await promptApi.bookmark(promptId);
    }

    return await promptApi.unbookmark(promptId);
  } catch (primaryError) {
    if (shouldBookmark) {
      return bookmarkApi.create({ promptId });
    }

    return bookmarkApi.remove(promptId);
  }
}

async function submitPromptReport(promptId, payload) {
  try {
    return await reportApi.create(promptId, payload);
  } catch {
    return reportApi.createForPrompt(promptId, payload);
  }
}

function MetaStat({ icon: Icon, label, value }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-pill border border-white/10 bg-white/[0.05] px-3 py-2 text-body-sm text-muted">
      <Icon className="h-4 w-4 text-primary" />
      <span>{value}</span>
      <span className="text-muted/70">{label}</span>
    </div>
  );
}

function PromptContentRenderer({ content }) {
  const segments = String(content || "")
    .split(/```/)
    .map((segment, index) => ({
      id: `segment-${index}`,
      type: index % 2 === 1 ? "code" : "text",
      value: segment,
    }));

  return (
    <div className="space-y-4">
      {segments.map((segment) =>
        segment.type === "code" ? (
          <pre
            key={segment.id}
            className="overflow-x-auto rounded-xl border border-white/8 bg-[#060d1d] px-4 py-4 font-mono text-[13px] leading-7 text-slate-100"
          >
            <code>{segment.value.replace(/^\w+\n/, "")}</code>
          </pre>
        ) : (
          <div key={segment.id} className="space-y-3">
            {segment.value.split("\n").map((line, lineIndex) => {
              const trimmed = line.trim();

              if (!trimmed) {
                return null;
              }

              if (/^#{1,3}\s/.test(trimmed)) {
                return (
                  <h3 key={`${segment.id}-${lineIndex}`} className="text-base font-semibold text-white">
                    {trimmed.replace(/^#{1,3}\s/, "")}
                  </h3>
                );
              }

              return (
                <p key={`${segment.id}-${lineIndex}`} className="font-mono text-[13px] leading-7 text-slate-100">
                  {trimmed}
                </p>
              );
            })}
          </div>
        ),
      )}
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/8 py-3 last:border-b-0 last:pb-0 first:pt-0">
      <div className="inline-flex items-center gap-2 text-body-sm text-muted">
        <Icon className="mt-0.5 h-4 w-4 text-primary" />
        <span>{label}</span>
      </div>
      <span className="max-w-[60%] text-right text-body-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function UsageCard({ index, title, description }) {
  return (
    <div className="pf-card rounded-xl p-4">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-body-sm font-semibold text-white shadow-glow">
        {index}
      </div>
      <h3 className="text-body font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-body-sm text-muted">{description}</p>
    </div>
  );
}

export default function PromptDetailsClient({ promptId }) {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { refreshViewedPrompts } = useNotifications();
  const pathname = usePathname();
  const [promptState, setPromptState] = useState({
    status: "loading",
    item: null,
    error: "",
  });
  const [reviewState, setReviewState] = useState({
    status: "loading",
    items: [],
    averageRating: 0,
    totalReviews: 0,
    distribution: [],
    error: "",
  });
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkReady, setIsBookmarkReady] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [actionState, setActionState] = useState({
    copy: false,
    bookmark: false,
    review: false,
    report: false,
    deleteReview: false,
  });
  const [reportForm, setReportForm] = useState({
    reason: "",
    description: "",
  });
  const [relatedState, setRelatedState] = useState({
    status: "loading",
    items: [],
    error: "",
  });
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [pendingReviewDeletion, setPendingReviewDeletion] = useState(null);
  const reviewFormRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const prompt = promptState.item;
  const isPremiumUser = isPremiumSubscription(user?.subscription);
  const isPromptLocked = Boolean(prompt?.locked && !isPremiumUser);
  const paymentHref = `/payment?returnTo=${encodeURIComponent(pathname || `/prompts/${promptId}`)}`;
  const [feedbackPulse, setFeedbackPulse] = useState({
    copy: 0,
    bookmark: 0,
  });

  function syncDashboardReviewsLocally(nextReviews) {
    const storedReviews = getStorageItem(getReviewsStorageKey(), []);
    const filteredReviews = Array.isArray(storedReviews)
      ? storedReviews.filter((review) => String(review.promptId) !== String(promptId))
      : [];
    const latestForPrompt = nextReviews
      .filter((review) => String(review.promptId) === String(promptId))
      .map((review) => ({
        id: review.id,
        promptId: review.promptId || promptId,
        promptTitle: review.promptTitle || prompt?.title || "PromptFlow prompt",
        rating: Number(review.rating || 0),
        comment: review.comment || "",
        createdAt: review.createdAt || new Date().toISOString(),
        authorId: review.authorId || user?.id || "",
        authorEmail: review.authorEmail || user?.email || "",
        source: review.source || "api",
      }));

    saveDashboardReviews([...latestForPrompt, ...filteredReviews]);
  }

  async function loadPrompt() {
    setPromptState((currentState) => ({
      ...currentState,
      status: "loading",
      error: "",
    }));

    try {
      const response = await promptApi.getById(promptId);

      setPromptState({
        status: "success",
        item: normalizePromptDetails(response),
        error: "",
      });
    } catch (error) {
      setPromptState({
        status: "error",
        item: null,
        error: error.message || "Unable to load prompt details.",
      });
    }
  }

  async function loadReviews() {
    setReviewState((currentState) => ({
      ...currentState,
      status: currentState.items.length > 0 ? "success" : "loading",
      error: "",
    }));

    try {
      const response = await reviewApi.getByPrompt(promptId);
      const normalized = normalizeReviewsPayload(response);

      setReviewState({
        status: "success",
        ...normalized,
        error: "",
      });
    } catch (error) {
      setReviewState({
        status: "error",
        items: [],
        averageRating: 0,
        totalReviews: 0,
        distribution: [],
        error: error.message || "Unable to load prompt reviews.",
      });
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadPageData() {
      const [promptResult, reviewResult] = await Promise.allSettled([
        promptApi.getById(promptId),
        reviewApi.getByPrompt(promptId),
      ]);

      if (!isMounted) {
        return;
      }

      if (promptResult.status === "fulfilled") {
        setPromptState({
          status: "success",
          item: normalizePromptDetails(promptResult.value),
          error: "",
        });
      } else {
        setPromptState({
          status: "error",
          item: null,
          error: promptResult.reason?.message || "Unable to load prompt details.",
        });
      }

      if (reviewResult.status === "fulfilled") {
        setReviewState({
          status: "success",
          ...normalizeReviewsPayload(reviewResult.value),
          error: "",
        });
      } else {
        setReviewState({
          status: "error",
          items: [],
          averageRating: 0,
          totalReviews: 0,
          distribution: [5, 4, 3, 2, 1].map((star) => ({ star, count: 0 })),
          error: reviewResult.reason?.message || "Unable to load prompt reviews.",
        });
      }
    }

    loadPageData();

    return () => {
      isMounted = false;
    };
  }, [promptId]);

  useEffect(() => {
    let isMounted = true;

    async function loadRelatedPrompts() {
      try {
        const response = await promptApi.getAll();
        const items = Array.isArray(response?.prompts)
          ? response.prompts
          : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        const accents = [
          "from-sky-500/30 via-cyan-500/12 to-transparent",
          "from-fuchsia-500/28 via-violet-500/12 to-transparent",
          "from-indigo-500/30 via-blue-500/10 to-transparent",
          "from-pink-500/28 via-orange-500/12 to-transparent",
          "from-amber-500/28 via-orange-500/12 to-transparent",
          "from-cyan-500/26 via-sky-500/12 to-transparent",
        ];

        const related = items
          .filter((item) => String(item?._id || item?.id) !== String(promptId))
          .map((item, index) => ({
            id: item?._id || item?.id || `related-${index}`,
            title: item?.title || "Prompt",
            category: item?.category?.name || item?.categoryName || item?.category || "General",
            aiTool: item?.aiTool || item?.model || item?.tool || "ChatGPT",
            difficulty: item?.difficulty || item?.level || "Beginner",
            visibility: String(item?.visibility || "public").toLowerCase().includes("private") ? "Premium" : "Public",
            accent: accents[index % accents.length],
            rating: Number(item?.rating || item?.averageRating || 4.8),
            copyCount: Number(item?.copyCount || item?.copies || 0),
            author: item?.creatorName || item?.creator?.name || item?.author?.name || "PromptFlow Creator",
            description: item?.description || item?.summary || "Related prompt from the PromptFlow marketplace.",
          }))
          .sort((left, right) => {
            const leftScore =
              (left.category === prompt?.category ? 2 : 0) +
              (left.aiTool === prompt?.aiTool ? 1 : 0) +
              left.rating / 10;
            const rightScore =
              (right.category === prompt?.category ? 2 : 0) +
              (right.aiTool === prompt?.aiTool ? 1 : 0) +
              right.rating / 10;
            return rightScore - leftScore;
          })
          .slice(0, 6);

        if (isMounted) {
          setRelatedState({
            status: "success",
            items: related,
            error: "",
          });
        }
      } catch (error) {
        if (isMounted) {
          setRelatedState({
            status: "error",
            items: [],
            error: error.message || "Unable to load related prompts.",
          });
        }
      }
    }

    loadRelatedPrompts();

    return () => {
      isMounted = false;
    };
  }, [prompt?.aiTool, prompt?.category, promptId]);

  useEffect(() => {
    let isMounted = true;

    async function loadBookmarks() {
      if (authLoading) {
        return;
      }

      if (!isAuthenticated) {
        if (isMounted) {
          setIsBookmarked(false);
          setIsBookmarkReady(true);
        }
        return;
      }

      try {
        const response = await bookmarkApi.getAll();
        const bookmarkIds = getBookmarkIds(response);

        if (isMounted) {
          setIsBookmarked(bookmarkIds.has(promptId));
          setIsBookmarkReady(true);
        }
      } catch {
        if (isMounted) {
          setIsBookmarked(false);
          setIsBookmarkReady(true);
        }
      }
    }

    loadBookmarks();

    return () => {
      isMounted = false;
    };
  }, [authLoading, isAuthenticated, promptId]);

  useEffect(() => {
    if (!prompt?.id) {
      return;
    }

    recordPromptView(user?.id, {
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      category: prompt.category,
      aiTool: prompt.aiTool,
    });
    refreshViewedPrompts();
  }, [prompt?.aiTool, prompt?.category, prompt?.description, prompt?.id, prompt?.title, refreshViewedPrompts, user?.id]);

  const reviewSummary = useMemo(
    () => ({
      averageRating:
        reviewState.totalReviews > 0 ? reviewState.averageRating : prompt?.rating || 0,
      totalReviews:
        reviewState.totalReviews > 0 ? reviewState.totalReviews : prompt?.reviewCount || 0,
      distribution: reviewState.distribution,
    }),
    [prompt?.rating, prompt?.reviewCount, reviewState],
  );
  const currentUserReview =
    reviewState.items.find(
      (review) =>
        (user?.id && review.authorId && String(user.id) === String(review.authorId)) ||
        (user?.email &&
          review.authorEmail &&
          String(user.email).toLowerCase() === String(review.authorEmail).toLowerCase()),
    ) || null;

  async function handleCopy() {
    if (!prompt || isPromptLocked) {
      toastWarning("Upgrade to unlock this premium prompt.");
      return;
    }

    if (!navigator?.clipboard?.writeText) {
      toastError("Clipboard access is not available in this browser.");
      return;
    }

    setActionState((currentState) => ({ ...currentState, copy: true }));

    try {
      await navigator.clipboard.writeText(prompt.content);
      toastSuccess("Prompt copied successfully");
      setFeedbackPulse((currentState) => ({ ...currentState, copy: currentState.copy + 1 }));

      try {
        await promptApi.copyPublic(prompt.id);
        setPromptState((currentState) => ({
          ...currentState,
          item: currentState.item
            ? {
                ...currentState.item,
                copyCount: currentState.item.copyCount + 1,
              }
            : currentState.item,
        }));
      } catch {
        // Keep copy UX successful even if analytics/counter update is unavailable.
      }
    } catch (error) {
      toastError(error.message || "Unable to copy this prompt right now.");
    } finally {
      setActionState((currentState) => ({ ...currentState, copy: false }));
    }
  }

  async function handleBookmarkToggle() {
    if (!prompt) {
      return;
    }

    if (!isAuthenticated) {
      toastWarning("Please log in to bookmark prompts.");
      return;
    }

    setActionState((currentState) => ({ ...currentState, bookmark: true }));
    const nextValue = !isBookmarked;
    setIsBookmarked(nextValue);

    try {
      await syncBookmarkMutation(prompt.id, nextValue);
      toastSuccess(isBookmarked ? "Bookmark removed" : "Prompt bookmarked");
      setFeedbackPulse((currentState) => ({ ...currentState, bookmark: currentState.bookmark + 1 }));
    } catch (error) {
      setIsBookmarked(!nextValue);
      toastError(error.message || "Unable to update your bookmark.");
    } finally {
      setActionState((currentState) => ({ ...currentState, bookmark: false }));
    }
  }

  async function handleShare() {
    if (!prompt) {
      return;
    }

    const shareUrl = typeof window !== "undefined" ? window.location.href : "";

    try {
      if (navigator?.share) {
        await navigator.share({
          title: prompt.title,
          text: prompt.description,
          url: shareUrl,
        });
      } else if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }

      toastSuccess("Prompt link ready to share");
    } catch (error) {
      if (error?.name !== "AbortError") {
        toastError("Unable to share this prompt right now.");
      }
    }
  }

  async function handleReviewSubmit(values) {
    if (!isAuthenticated) {
      toastWarning("Please log in to submit a review.");
      return;
    }

    setActionState((currentState) => ({ ...currentState, review: true }));

    try {
      await reviewApi.createOrUpdate(promptId, {
        rating: Number(values.rating),
        comment: values.comment.trim(),
      });
      const nextReviewResponse = await reviewApi.getByPrompt(promptId);
      const normalized = normalizeReviewsPayload(nextReviewResponse);
      setReviewState({
        status: "success",
        ...normalized,
        error: "",
      });
      syncDashboardReviewsLocally(normalized.items);
      toastSuccess(currentUserReview ? "Review updated" : "Review submitted");
    } catch (error) {
      toastError(error.message || "Unable to submit your review.");
    } finally {
      setActionState((currentState) => ({ ...currentState, review: false }));
    }
  }

  async function handleReviewDelete() {
    if (!pendingReviewDeletion) {
      return;
    }

    setActionState((currentState) => ({ ...currentState, deleteReview: true }));

    try {
      await reviewApi.removeForPrompt(promptId, {
        reviewId: pendingReviewDeletion.id,
      });
      const nextReviewResponse = await reviewApi.getByPrompt(promptId);
      const normalized = normalizeReviewsPayload(nextReviewResponse);
      setReviewState({
        status: "success",
        ...normalized,
        error: "",
      });
      syncDashboardReviewsLocally(normalized.items);
      setPendingReviewDeletion(null);
      toastSuccess("Review deleted");
    } catch (error) {
      toastError(error.message || "Unable to delete this review.");
    } finally {
      setActionState((currentState) => ({ ...currentState, deleteReview: false }));
    }
  }

  async function handleReportSubmit(event) {
    event.preventDefault();

    if (!isAuthenticated) {
      toastWarning("Please log in to report this prompt.");
      return;
    }

    if (!reportForm.reason) {
      toastWarning("Please select a reason for reporting.");
      return;
    }

    setActionState((currentState) => ({ ...currentState, report: true }));

    try {
      await submitPromptReport(promptId, {
        reason: reportForm.reason,
        description: reportForm.description.trim(),
      });
      setReportForm({
        reason: "",
        description: "",
      });
      setIsReportOpen(false);
      toastSuccess("Report submitted successfully");
    } catch (error) {
      toastError(error.message || "Unable to submit your report.");
    } finally {
      setActionState((currentState) => ({ ...currentState, report: false }));
    }
  }

  if (promptState.status === "loading") {
    return <PromptDetailsSkeleton />;
  }

  if (promptState.status === "error" || !prompt) {
    return (
      <ErrorState
        description={promptState.error || "Unable to load prompt details."}
        onRetry={loadPrompt}
        title="Unable to load prompt details"
      />
    );
  }

  return (
    <>
      <div className="space-y-6 md:space-y-8">
        <MotionReveal preset="contentFade">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-body-xs text-muted">
              <Link className="text-primary transition hover:text-secondary" href="/">
                Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link className="text-primary transition hover:text-secondary" href="/prompts">
                All Prompts
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span>{prompt.category}</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span>{prompt.aiTool}</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground">{prompt.title}</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <h1 className="max-w-4xl text-display-sm md:text-display-md">{prompt.title}</h1>
                <p className="max-w-3xl text-body md:text-lg">{prompt.description}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge color="primary" icon={Bot}>
                  {prompt.aiTool}
                </Badge>
                <Badge
                  color={prompt.difficulty === "Advanced" ? "danger" : prompt.difficulty === "Intermediate" ? "warning" : "success"}
                  icon={Gauge}
                >
                  {prompt.difficulty}
                </Badge>
                <Badge color={prompt.visibility === "Premium" ? "primary" : "success"} icon={Eye}>
                  {prompt.visibility}
                </Badge>
                <Badge color="default" icon={Sparkles}>
                  {prompt.category}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-3">
                <MetaStat
                  icon={Star}
                  label={`(${reviewSummary.totalReviews} reviews)`}
                  value={reviewSummary.averageRating > 0 ? reviewSummary.averageRating.toFixed(1) : "New"}
                />
                <MetaStat icon={Copy} label="copies" value={formatCompactNumber(prompt.copyCount)} />
                <MetaStat icon={CalendarDays} label="published" value={formatDate(prompt.publishedAt)} />
              </div>

              <div className="flex flex-wrap gap-3">
                <motion.div
                  animate={feedbackPulse.copy ? { scale: [1, 1.04, 1] } : undefined}
                  key={`copy-cta-${feedbackPulse.copy}`}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <Button
                    isDisabled={isPromptLocked}
                    isLoading={actionState.copy}
                    onPress={handleCopy}
                    size="lg"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Prompt
                  </Button>
                </motion.div>
                <motion.div
                  animate={feedbackPulse.bookmark ? { scale: [1, 1.05, 1] } : undefined}
                  key={`bookmark-cta-${feedbackPulse.bookmark}-${isBookmarked ? "on" : "off"}`}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                >
                  <Button
                    isDisabled={!isBookmarkReady}
                    isLoading={actionState.bookmark}
                    onPress={handleBookmarkToggle}
                    size="lg"
                    variant="secondary"
                  >
                    <Bookmark className={clsx("h-4 w-4", isBookmarked ? "fill-current" : "")} />
                    {isBookmarked ? "Bookmarked" : "Bookmark"}
                  </Button>
                </motion.div>
                <Button onPress={handleShare} size="lg" variant="secondary">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button onPress={() => setIsReportOpen(true)} size="lg" variant="secondary">
                  <Flag className="h-4 w-4" />
                  Report
                </Button>
              </div>
            </div>
          </div>
        </MotionReveal>

        <div className="grid gap-6 desktop:grid-cols-[minmax(0,1.4fr)_360px]">
          <div className="space-y-6">
            <MotionReveal preset="viewportReveal">
              <section className="pf-card rounded-xl p-5 md:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-body-xs font-semibold uppercase tracking-[0.2em] text-primary">
                      Prompt Content
                    </p>
                    <h2 className="mt-2 text-h2">Ready-to-use prompt structure</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      animate={feedbackPulse.copy ? { scale: [1, 1.08, 1] } : undefined}
                      aria-label="Copy prompt"
                      className="pf-touch-target inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-muted transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={isPromptLocked}
                      key={`content-copy-${feedbackPulse.copy}`}
                      onClick={handleCopy}
                      type="button"
                      transition={{ duration: 0.26, ease: "easeOut" }}
                      whileHover={shouldReduceMotion ? undefined : { scale: 1.06 }}
                      whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
                    >
                      {actionState.copy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
                    </motion.button>
                    <button
                      aria-label="Expand prompt"
                      className="pf-touch-target inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-muted transition hover:text-foreground"
                      onClick={() => setIsExpanded((currentValue) => !currentValue)}
                      type="button"
                    >
                      <Expand className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div
                  className={clsx(
                    "relative overflow-hidden rounded-xl border border-white/10 bg-[#091122] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
                    isExpanded ? "min-h-[560px]" : "min-h-[420px]",
                  )}
                >
                  <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
                    <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                    <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                    <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                    <span className="ml-3 text-body-xs uppercase tracking-[0.2em] text-muted">
                      PromptFlow prompt
                    </span>
                  </div>
                  <div
                    className={clsx(
                      "overflow-x-auto whitespace-pre-wrap px-4 py-5 font-mono text-[13px] leading-7 text-slate-100 md:px-5 md:text-sm",
                      isPromptLocked ? "blur-md select-none" : "",
                    )}
                  >
                    <PromptContentRenderer content={prompt.content} />
                  </div>

                  {isPromptLocked ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 p-6 backdrop-blur-md">
                      <div className="max-w-md rounded-xl border border-primary/20 bg-background-alt/92 p-6 text-center shadow-glow">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/14 text-primary">
                          <Lock className="h-6 w-6" />
                        </div>
                        <h3 className="mt-4 text-h3">Premium prompt locked</h3>
                        <p className="mt-3 text-body-sm text-muted">
                          Upgrade to reveal the full prompt content, copy access, and premium creator tools.
                        </p>
                        <Button as={Link} className="mt-5" href={paymentHref}>
                          Unlock Premium
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>
            </MotionReveal>

            <MotionStagger className="grid gap-4 md:grid-cols-2 desktop:grid-cols-4" preset="dashboardCardStagger">
              {promptUsageSteps.map((step, index) => (
                <MotionStaggerItem key={step.title}>
                  <UsageCard
                    description={step.description}
                    index={index + 1}
                    title={step.title}
                  />
                </MotionStaggerItem>
              ))}
            </MotionStagger>

            <MotionReveal preset="viewportReveal">
              <section className="pf-card rounded-xl p-5 md:p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <UserAvatar
                      alt={prompt.creator.name}
                      className="h-16 w-16 bg-brand-gradient text-body font-semibold text-white shadow-glow"
                      fallback={prompt.creator.initials}
                      src={prompt.creator.image}
                    />
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-h2">{prompt.creator.name}</h2>
                        <Badge color="success" icon={Check}>
                          Top Creator
                        </Badge>
                      </div>
                      <p className="max-w-2xl text-body-sm text-muted">{prompt.creator.bio}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button as={Link} href="/creator" variant="secondary">
                      View Profile
                    </Button>
                    <Button onPress={() => toastSuccess("Follow UI is ready for a future API integration.")} variant="secondary">
                      <UserPlus className="h-4 w-4" />
                      Follow
                    </Button>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-body-xs uppercase tracking-[0.18em] text-muted">Total Prompts</p>
                    <p className="mt-3 text-h2">{formatCompactNumber(prompt.creator.totalPrompts)}</p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-body-xs uppercase tracking-[0.18em] text-muted">Total Copies</p>
                    <p className="mt-3 text-h2">{formatCompactNumber(prompt.creator.totalCopies)}</p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-body-xs uppercase tracking-[0.18em] text-muted">Average Rating</p>
                    <p className="mt-3 text-h2">{prompt.creator.averageRating.toFixed(1)}</p>
                  </div>
                </div>
              </section>
            </MotionReveal>

            <MotionReveal preset="viewportReveal">
              <section className="pf-card rounded-xl p-5 md:p-6">
                <div className="mb-5">
                  <p className="text-body-xs font-semibold uppercase tracking-[0.2em] text-primary">Why This Prompt Works</p>
                  <h2 className="mt-2 text-h2">What makes this prompt effective</h2>
                </div>
                <div className="grid gap-3">
                  {prompt.whyThisWorks?.length > 0 ? (
                    prompt.whyThisWorks.map((reason) => (
                      <div key={reason} className="inline-flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-body-sm text-foreground">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success/14 text-success">
                          <Check className="h-4 w-4" />
                        </span>
                        <span>{reason}</span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] p-5 text-body-sm text-muted">
                      No extra prompt guidance was provided for this submission yet.
                    </div>
                  )}
                </div>
              </section>
            </MotionReveal>

            <MotionReveal preset="viewportReveal">
              <section className="pf-card rounded-xl p-5 md:p-6">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-body-xs font-semibold uppercase tracking-[0.2em] text-primary">Reviews</p>
                    <h2 className="mt-2 text-h2">Community feedback</h2>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-pill border border-white/10 bg-white/[0.04] px-4 py-2 text-body-sm text-muted">
                    <Star className="h-4 w-4 fill-current text-warning" />
                    <span>{reviewSummary.averageRating > 0 ? reviewSummary.averageRating.toFixed(1) : "No ratings yet"}</span>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                  <div className="space-y-5">
                    <RatingSummary
                      averageRating={reviewSummary.averageRating}
                      distribution={reviewSummary.distribution}
                      totalReviews={reviewSummary.totalReviews}
                    />

                    <div ref={reviewFormRef}>
                      <ReviewForm
                        key={currentUserReview ? `${currentUserReview.id}-${currentUserReview.updatedAt || currentUserReview.comment}` : "new-review"}
                        existingReview={currentUserReview}
                        isAuthenticated={isAuthenticated}
                        isSubmitting={actionState.review}
                        onSubmit={handleReviewSubmit}
                      />
                    </div>
                  </div>

                  <ReviewList
                    currentUserEmail={user?.email || ""}
                    currentUserId={user?.id || ""}
                    error={reviewState.error}
                    isAdmin={String(user?.role || "").toLowerCase() === "admin"}
                    isDeleting={actionState.deleteReview}
                    onDelete={setPendingReviewDeletion}
                    onEdit={() => {
                      reviewFormRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                    onLoadMore={() => setVisibleReviews((currentValue) => currentValue + 3)}
                    onRetry={loadReviews}
                    reviews={reviewState.items}
                    status={reviewState.status}
                    visibleCount={visibleReviews}
                  />
                </div>
              </section>
            </MotionReveal>

            <MotionReveal preset="viewportReveal">
              <section className="pf-card rounded-xl p-5 md:p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-body-xs font-semibold uppercase tracking-[0.2em] text-primary">Related Prompts</p>
                    <h2 className="mt-2 text-h2">More prompts you may like</h2>
                  </div>
                  <Link className="text-body-sm font-semibold text-primary transition hover:text-secondary" href="/prompts">
                    Explore all
                  </Link>
                </div>

                {relatedState.status === "error" ? (
                  <ErrorState
                    description={relatedState.error || "Unable to load related prompts."}
                    title="Unable to load related prompts"
                  />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {relatedState.items.map((relatedPrompt) => (
                      <PromptCard key={relatedPrompt.id} {...relatedPrompt} />
                    ))}
                  </div>
                )}
              </section>
            </MotionReveal>
          </div>

          <div className="space-y-5">
            <MotionReveal preset="viewportReveal">
              <aside className="pf-card rounded-xl p-5">
                <p className="text-body-xs font-semibold uppercase tracking-[0.2em] text-primary">About the Creator</p>
                <div className="mt-4 flex items-center gap-4">
                  <UserAvatar
                    alt={prompt.creator.name}
                    className="h-16 w-16 bg-brand-gradient text-body font-semibold text-white shadow-glow"
                    fallback={prompt.creator.initials}
                    src={prompt.creator.image}
                  />
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-h3">{prompt.creator.name}</h2>
                      <Badge color="success" icon={Check}>
                        Top Creator
                      </Badge>
                    </div>
                    <p className="text-body-sm text-muted">{prompt.creator.bio}</p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-body-xs uppercase tracking-[0.18em] text-muted">Prompts</p>
                    <p className="mt-2 text-h3">{formatCompactNumber(prompt.creator.totalPrompts)}</p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-body-xs uppercase tracking-[0.18em] text-muted">Copies</p>
                    <p className="mt-2 text-h3">{formatCompactNumber(prompt.creator.totalCopies)}</p>
                  </div>
                </div>
                <Button as={Link} className="mt-5 w-full" href="/creator" variant="secondary">
                  View Profile
                </Button>
              </aside>
            </MotionReveal>

            <MotionReveal preset="viewportReveal">
              <aside className="pf-card rounded-xl p-5">
                <p className="text-body-xs font-semibold uppercase tracking-[0.2em] text-primary">Details</p>
                <div className="mt-4">
                  <DetailRow icon={Sparkles} label="Category" value={prompt.category} />
                  <DetailRow icon={Bot} label="AI Tool" value={prompt.aiTool} />
                  <DetailRow icon={Gauge} label="Difficulty" value={prompt.difficulty} />
                  <DetailRow icon={Eye} label="Visibility" value={prompt.visibility} />
                  <DetailRow icon={CalendarDays} label="Published" value={formatDate(prompt.publishedAt)} />
                  <DetailRow icon={Clock3} label="Updated" value={formatDate(prompt.updatedAt)} />
                </div>
              </aside>
            </MotionReveal>

            <MotionReveal preset="viewportReveal">
              <aside className="overflow-hidden rounded-xl border border-primary/20 bg-brand-gradient p-[1px] shadow-glow">
                <div className="h-full rounded-[inherit] bg-background-alt/96 p-5">
                  <p className="text-body-xs font-semibold uppercase tracking-[0.2em] text-primary">Premium Access</p>
                  <h2 className="mt-3 text-h2">Unlock premium prompts</h2>
                  <p className="mt-3 text-body-sm text-muted">
                    Get deeper prompt systems, faster workflows, and premium creator content as PromptFlow expands.
                  </p>

                  <div className="mt-5 space-y-3">
                    {premiumBenefits.map((benefit) => (
                      <div key={benefit} className="inline-flex w-full items-center gap-3 text-body-sm text-foreground">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/14 text-primary">
                          <Check className="h-4 w-4" />
                        </span>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    as={Link}
                    className="mt-6 w-full"
                    href={paymentHref}
                    size="lg"
                  >
                    Upgrade Now
                  </Button>
                </div>
              </aside>
            </MotionReveal>
          </div>
        </div>
      </div>

      {pendingReviewDeletion ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_36px_120px_rgba(15,23,42,0.18)]">
            <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
              Delete Review?
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              This will remove the review from the prompt details page. You can submit a new review later if needed.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                onPress={() => setPendingReviewDeletion(null)}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button isLoading={actionState.deleteReview} onPress={handleReviewDelete} variant="danger">
                Delete
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {isReportOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_36px_120px_rgba(15,23,42,0.18)]">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                Report Prompt
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Help us keep PromptFlow high quality by reporting problematic prompts.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleReportSubmit}>
              <SelectField
                label="Reason for reporting"
                onChange={(event) =>
                  setReportForm((currentState) => ({
                    ...currentState,
                    reason: event.target.value === "Select reason" ? "" : event.target.value,
                  }))
                }
                options={["Select reason", ...reportReasonOptions]}
                value={reportForm.reason || "Select reason"}
              />

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition focus-within:border-primary/50 focus-within:shadow-glow">
                <label className="mb-3 block text-body-xs font-medium text-slate-500">
                  Description (optional)
                </label>
                <textarea
                  className="min-h-[160px] w-full resize-none bg-transparent text-body-sm text-slate-900 outline-none placeholder:text-slate-400"
                  maxLength={300}
                  onChange={(event) =>
                    setReportForm((currentState) => ({
                      ...currentState,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Provide more details about the issue..."
                  value={reportForm.description}
                />
                <div className="mt-3 text-right text-body-xs text-slate-500">
                  {reportForm.description.length}/300
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  onPress={() => {
                    setIsReportOpen(false);
                    setReportForm({
                      reason: "",
                      description: "",
                    });
                  }}
                  type="button"
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button isLoading={actionState.report} type="submit" variant="danger">
                  Submit Report
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
