import { formatCompactNumber, normalizePromptPayload } from "@/lib/marketplace";
import { getUserImageSrc } from "@/lib/auth";
import {
  normalizeCreatorPrompt,
  normalizeCreatorPrompts,
  toCreatorPromptPayload,
} from "@/lib/creator";

const PROFILE_STORAGE_KEY = "pf-dashboard-profile";
const REVIEWS_STORAGE_KEY = "pf-dashboard-reviews";
export const DASHBOARD_REVIEWS_EVENT = "pf-dashboard-reviews-updated";

function toTitleCase(value) {
  if (!value) {
    return "";
  }

  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function parseNumber(value, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getStorageItem(key, fallback) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function setStorageItem(key, value) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage write failures and keep dashboard usable.
  }
}

export function notifyDashboardReviewsUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(DASHBOARD_REVIEWS_EVENT));
}

export function getProfileStorageKey() {
  return PROFILE_STORAGE_KEY;
}

export function getReviewsStorageKey() {
  return REVIEWS_STORAGE_KEY;
}

export function saveDashboardReviews(reviews) {
  setStorageItem(getReviewsStorageKey(), reviews);
  notifyDashboardReviewsUpdated();
}

export function normalizeDashboardUser(payload, profileOverrides = {}) {
  const user = payload?.user || payload?.data?.user || payload?.result?.user || payload?.data || payload || {};
  const baseName = profileOverrides.name || user.name || "PromptFlow User";
  const createdAt = user.createdAt || new Date().toISOString();
  const updatedAt = user.updatedAt || createdAt;
  const resolvedImage = profileOverrides.image || getUserImageSrc(user);

  return {
    id: user.id || user._id || "",
    name: baseName,
    email: user.email || "unknown@example.com",
    role: toTitleCase(user.role || "user"),
    subscription: toTitleCase(user.subscription || "free"),
    createdAt,
    updatedAt,
    bio:
      profileOverrides.bio ||
      user.bio ||
      "PromptFlow member exploring, saving, and refining high-quality prompts for better outcomes.",
    image: resolvedImage,
    picture: user.picture || user.image || user.photo || "",
    photoURL: user.photoURL || user.picture || user.image || "",
    avatar: user.avatar || user.picture || user.image || "",
    photo: user.photo || user.picture || user.image || "",
    initials: baseName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join(""),
  };
}

export function normalizeBookmarks(payload, promptCatalog = []) {
  const bookmarks = Array.isArray(payload?.bookmarks)
    ? payload.bookmarks
    : Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
    ? payload
    : [];

  return bookmarks
    .map((bookmark, index) => {
      const promptSource =
        bookmark?.prompt ||
        promptCatalog.find((prompt) => prompt.id === (bookmark?.promptId || bookmark?._id || bookmark?.id));

      if (!promptSource) {
        return null;
      }

      const prompt = Array.isArray(promptSource)
        ? promptSource[0]
        : normalizePromptPayload({ prompts: [promptSource] })[0];

      return {
        ...prompt,
        bookmarkId: bookmark?._id || `bookmark-${index}`,
        savedAt: bookmark?.createdAt || bookmark?.savedAt || bookmark?.updatedAt || promptSource?.createdAt,
        author:
          prompt.author ||
          promptSource?.creatorName ||
          promptSource?.author?.name ||
          "PromptFlow Creator",
      };
    })
    .filter(Boolean);
}

export function seedLocalReviews(user, bookmarks, promptCatalog) {
  const sourceItems = bookmarks.length > 0 ? bookmarks : promptCatalog.slice(0, 3);

  return sourceItems.slice(0, 3).map((item, index) => ({
    id: `local-review-${item.id || index}`,
    promptId: item.id,
    promptTitle: item.title,
    rating: 5 - index,
    comment: [
      "Clean structure and very easy to adapt for real client work.",
      "Helpful prompt with strong outputs after a couple of tweaks.",
      "Saved me time and gave me a solid first draft instantly.",
    ][index] || "Helpful PromptFlow review.",
    createdAt: new Date(Date.now() - index * 86400000).toISOString(),
    source: "local",
  }));
}

export function buildDashboardStats({ bookmarks, promptCatalog, reviews, user }) {
  const savedCount = bookmarks.length;
  const reviewsCount = reviews.length;
  const copiesCount =
    bookmarks.reduce((total, bookmark) => total + parseNumber(bookmark.copyCount), 0) ||
    promptCatalog.slice(0, 3).reduce((total, prompt) => total + parseNumber(prompt.copyCount), 0);
  const recommendedCount = promptCatalog.filter((prompt) => !bookmarks.some((bookmark) => bookmark.id === prompt.id)).length;

  return [
    {
      id: "saved",
      label: "Saved Prompts",
      value: savedCount,
      meta: `${savedCount > 0 ? "+" : ""}${savedCount} in library`,
      accent: "from-violet-500 to-indigo-500",
    },
    {
      id: "reviews",
      label: "My Reviews",
      value: reviewsCount,
      meta: reviewsCount > 0 ? `${reviewsCount} feedback entries` : "Add your first review",
      accent: "from-amber-400 to-orange-500",
    },
    {
      id: "copies",
      label: "Copies Tracked",
      value: formatCompactNumber(copiesCount),
      meta: "Across saved and recommended prompts",
      accent: "from-sky-500 to-cyan-500",
    },
    {
      id: "member",
      label: "Member Since",
      value: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
        new Date(user.createdAt),
      ),
      meta: `${user.subscription} plan`,
      accent: "from-emerald-400 to-teal-500",
    },
    {
      id: "discover",
      label: "Recommended",
      value: recommendedCount,
      meta: "Fresh prompts to explore",
      accent: "from-fuchsia-500 to-violet-500",
    },
  ];
}

export function normalizeOwnedPrompts(payload, user) {
  return normalizeCreatorPrompts(payload, user);
}

export function buildDashboardPromptStats(ownedPrompts, bookmarks, reviews, user) {
  const promptCount = ownedPrompts.length;
  const savedCount = bookmarks.length;
  const reviewsCount = reviews.length;

  return [
    {
      id: "prompts",
      label: "Total Prompts",
      value: promptCount,
      meta: `+${Math.max(2, Math.round(promptCount * 0.24))} this month`,
      accent: "from-violet-500 to-indigo-500",
    },
    {
      id: "saved",
      label: "Saved Prompts",
      value: savedCount,
      meta: `+${Math.max(1, Math.round(savedCount * 0.18))} this month`,
      accent: "from-emerald-400 to-teal-500",
    },
    {
      id: "reviews",
      label: "My Reviews",
      value: reviewsCount,
      meta: `+${Math.max(1, Math.round(reviewsCount * 0.16))} this month`,
      accent: "from-amber-400 to-orange-500",
    },
    {
      id: "plan",
      label: "Account Status",
      value: toTitleCase(user.subscription || "Free"),
      meta: user.subscription?.toLowerCase() === "free" ? "Upgrade to Premium" : "Premium benefits active",
      accent: "from-sky-500 to-indigo-500",
    },
  ];
}

export function buildPromptPerformance(ownedPrompts) {
  const fallbackDates = ["May 5", "May 10", "May 15", "May 20", "May 25", "May 30"];
  const fallbackCopies = [320, 620, 430, 640, 580, 610];
  const fallbackEarnings = [140, 320, 260, 410, 360, 430];

  const topPrompts = [...ownedPrompts]
    .sort((left, right) => (right.copyCount || 0) - (left.copyCount || 0))
    .slice(0, 5)
    .map((prompt, index) => ({
      ...prompt,
      earnings: Math.max(0, Math.round((prompt.copyCount || 0) * 0.18) + 12 + index * 4),
    }));

  const series = fallbackDates.map((label, index) => ({
    label,
    copies: Math.max(120, fallbackCopies[index] + ownedPrompts.length * 4 - index * 5),
    earnings: Math.max(60, fallbackEarnings[index] + ownedPrompts.length * 3 - index * 6),
  }));

  return {
    topPrompts,
    series,
    totalCopies: ownedPrompts.reduce((sum, prompt) => sum + (prompt.copyCount || 0), 0),
    averageRating:
      ownedPrompts.length > 0
        ? ownedPrompts.reduce((sum, prompt) => sum + (prompt.rating || 0), 0) / ownedPrompts.length
        : 4.7,
    totalEarnings: topPrompts.reduce((sum, prompt) => sum + prompt.earnings, 0),
  };
}

export function buildUserDashboardActivity({ bookmarks, reviews, user, ownedPrompts }) {
  const promptActivities = ownedPrompts.slice(0, 2).map((prompt, index) => ({
    id: `prompt-${prompt.id}`,
    icon: index % 2 === 0 ? "plus" : "copy",
    title: `${prompt.statusValue === "approved" ? "Created" : "Updated"} prompt "${prompt.title}"`,
    description:
      prompt.statusValue === "approved"
        ? `${prompt.title} is now part of your workspace activity.`
        : `${prompt.title} is currently ${prompt.status.toLowerCase()}.`,
    date: prompt.updatedAt || prompt.createdAt,
  }));

  const bookmarkActivities = bookmarks.slice(0, 2).map((bookmark, index) => ({
    id: `bookmark-${bookmark.id}-${index}`,
    icon: "bookmark",
    title: `Bookmarked "${bookmark.title}"`,
    description: `Saved ${bookmark.title} for quick access later.`,
    date: bookmark.savedAt || bookmark.createdAt,
  }));

  const reviewActivities = reviews.slice(0, 2).map((review) => ({
    id: `review-${review.id}`,
    icon: "star",
    title: `Reviewed "${review.promptTitle}"`,
    description: `Left a ${review.rating}-star review for ${review.promptTitle}.`,
    date: review.createdAt,
  }));

  return [
    ...promptActivities,
    ...bookmarkActivities,
    ...reviewActivities,
    {
      id: "joined",
      icon: "user",
      title: `Welcome to PromptFlow, ${user.name.split(" ")[0]}`,
      description: "Your workspace is ready for discovering, saving, and submitting prompts.",
      date: user.createdAt,
    },
  ]
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    .slice(0, 5);
}

export function buildRecommendedForFreeUser(promptCatalog, bookmarks, ownedPrompts) {
  const bookmarkedIds = new Set(bookmarks.map((bookmark) => bookmark.id));
  const ownedIds = new Set(ownedPrompts.map((prompt) => prompt.id));
  return promptCatalog
    .filter((prompt) => !bookmarkedIds.has(prompt.id) && !ownedIds.has(prompt.id))
    .slice(0, 3);
}

export function toDashboardPromptPayload(values, user, existingPrompt) {
  return toCreatorPromptPayload(values, user, existingPrompt);
}

export function normalizeDashboardPromptResponse(response, user, existingPrompt) {
  return normalizeCreatorPrompt(
    response?.prompt || response?.data || response || existingPrompt || {},
    0,
    user,
  );
}

export function buildRecentActivity({ user, bookmarks, reviews }) {
  const activities = [
    {
      id: "joined",
      title: "Joined PromptFlow",
      description: "Your account is ready for discovering and saving prompts.",
      date: user.createdAt,
    },
    ...bookmarks.slice(0, 2).map((bookmark, index) => ({
      id: `bookmark-${bookmark.bookmarkId || index}`,
      title: "Saved a prompt",
      description: `Added "${bookmark.title}" to your saved collection.`,
      date: bookmark.savedAt || new Date().toISOString(),
    })),
    ...reviews.slice(0, 2).map((review) => ({
      id: `review-${review.id}`,
      title: "Updated a review",
      description: `Shared feedback on "${review.promptTitle}".`,
      date: review.createdAt,
    })),
  ];

  return activities
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    .slice(0, 5);
}

export function formatDashboardDate(value, options = { month: "short", day: "numeric", year: "numeric" }) {
  if (!value) {
    return "Not available";
  }

  try {
    return new Intl.DateTimeFormat("en-US", options).format(new Date(value));
  } catch {
    return "Not available";
  }
}

export function buildRecommendedPrompts(promptCatalog, bookmarks) {
  const bookmarkedIds = new Set(bookmarks.map((bookmark) => bookmark.id));
  return promptCatalog.filter((prompt) => !bookmarkedIds.has(prompt.id)).slice(0, 4);
}
