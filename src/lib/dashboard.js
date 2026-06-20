import { formatCompactNumber, normalizePromptPayload } from "@/lib/marketplace";
import { getUserImageSrc } from "@/lib/auth";

const PROFILE_STORAGE_KEY = "pf-dashboard-profile";
const REVIEWS_STORAGE_KEY = "pf-dashboard-reviews";

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

export function getProfileStorageKey() {
  return PROFILE_STORAGE_KEY;
}

export function getReviewsStorageKey() {
  return REVIEWS_STORAGE_KEY;
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
