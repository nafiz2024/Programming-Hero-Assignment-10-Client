import { z } from "zod";

import { formatCompactNumber, normalizePromptItem } from "@/lib/marketplace";

const defaultTrend = [280, 340, 460, 330, 520, 690, 590];
const defaultGrowth = [8, 12, 15, 18, 13];
const fallbackPerformance = [24.5, 18.3, 15.7, 10.2, 9.8, 8.6];
const fallbackStatuses = ["approved", "approved", "approved", "pending", "approved", "rejected"];

export const CREATOR_DRAFT_STORAGE_KEY = "pf-creator-prompt-draft";

export const creatorPromptFilters = {
  categories: ["All Categories", "Writing", "Marketing", "Development", "Design", "Business", "Education", "Productivity"],
  visibility: ["All Visibility", "Public", "Private"],
  status: ["All Status", "Approved", "Pending", "Rejected"],
  difficulty: ["Beginner", "Intermediate", "Advanced"],
  aiTools: ["ChatGPT", "Midjourney", "Claude", "Gemini", "DALL-E", "Copilot"],
};

export const creatorPromptSchema = z.object({
  title: z.string().trim().min(6, "Prompt title must be at least 6 characters.").max(80, "Prompt title must be 80 characters or less."),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters.")
    .max(200, "Description must be 200 characters or less."),
  category: z.string().min(1, "Please select a category."),
  aiTool: z.string().min(1, "Please select an AI tool."),
  tagsText: z.string().trim().optional().default(""),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  visibility: z.enum(["public", "private"]),
  thumbnail: z.union([z.literal(""), z.url("Please enter a valid thumbnail URL.")]).optional().default(""),
  content: z.string().trim().min(40, "Prompt content must be at least 40 characters.").max(4000, "Prompt content must be 4000 characters or less."),
});

export const creatorPromptDefaults = {
  title: "",
  description: "",
  category: "",
  aiTool: "",
  tagsText: "",
  difficulty: "Beginner",
  visibility: "public",
  thumbnail: "",
  content: "",
};

function parseNumber(value, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

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

function normalizeVisibility(value) {
  const normalized = String(value || "").toLowerCase();
  return normalized.includes("private") || normalized.includes("premium") ? "private" : "public";
}

function normalizeStatus(value, index) {
  const normalized = String(value || "").toLowerCase();

  if (normalized.includes("approve")) {
    return "approved";
  }

  if (normalized.includes("reject")) {
    return "rejected";
  }

  if (normalized.includes("pending") || normalized.includes("review")) {
    return "pending";
  }

  return fallbackStatuses[index % fallbackStatuses.length];
}

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function formatPromptDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function extractPromptItems(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.prompts)) {
    return payload.prompts;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.result)) {
    return payload.result;
  }

  return [];
}

export function isPromptOwnedByUser(item, user) {
  if (!user) {
    return false;
  }

  const userId = String(user.id || user._id || "").toLowerCase();
  const userEmail = String(user.email || "").toLowerCase();
  const userName = String(user.name || "").trim().toLowerCase();
  const candidateIds = [
    item?.userId,
    item?.ownerId,
    item?.creatorId,
    item?.authorId,
    item?.creator?._id,
    item?.creator?.id,
    item?.author?._id,
    item?.author?.id,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());
  const candidateEmails = [
    item?.creatorEmail,
    item?.authorEmail,
    item?.email,
    item?.creator?.email,
    item?.author?.email,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());
  const candidateNames = [
    item?.creatorName,
    item?.authorName,
    item?.creator?.name,
    item?.author?.name,
  ]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());

  return (
    Boolean(userId && candidateIds.includes(userId)) ||
    Boolean(userEmail && candidateEmails.includes(userEmail)) ||
    Boolean(userName && candidateNames.includes(userName))
  );
}

export function normalizeCreatorPrompt(item, index = 0, user = null) {
  const base = normalizePromptItem(item, index);
  const createdAt = item?.createdAt || item?.dateCreated || new Date(Date.now() - index * 86400000).toISOString();
  const updatedAt = item?.updatedAt || createdAt;
  const visibilityValue = normalizeVisibility(item?.visibility || item?.access || item?.plan || base.visibility);
  const statusValue = normalizeStatus(item?.status || item?.approvalStatus || item?.moderationStatus, index);
  const visibility = visibilityValue === "private" ? "Private" : "Public";
  const status = toTitleCase(statusValue);
  const rejectionReason =
    item?.rejectionReason ||
    item?.feedback ||
    item?.moderationNote ||
    (statusValue === "rejected" ? "Please improve clarity, add stronger output guidance, and resubmit." : "");
  const tags = normalizeTags(item?.tags || item?.keywords);
  const copies = parseNumber(item?.copyCount || item?.copies, base.copyCount);
  const bookmarks = parseNumber(item?.bookmarkCount || item?.bookmarks || item?.savedCount, Math.max(24, Math.round(copies * 0.42)));
  const views = parseNumber(item?.viewCount || item?.views, Math.max(120, copies * 4));
  const rating = parseNumber(item?.rating || item?.averageRating || item?.score, base.rating);
  const reviewCount = parseNumber(item?.reviewCount || item?.reviews, Math.max(12, Math.round(rating * 18)));
  const content =
    item?.content ||
    item?.promptContent ||
    item?.prompt ||
    item?.text ||
    `You are a senior AI specialist.\n\nTask: ${base.title}\n\nGoal:\n- Deliver a clear, usable output.\n- Follow the creator's requested structure.\n- Keep the final response practical and easy to adapt.`;
  const thumbnail = item?.thumbnail || item?.thumbnailUrl || item?.image || item?.coverImage || "";

  return {
    ...base,
    id: item?._id || item?.id || base.id,
    creatorId: item?.creatorId || item?.creator?._id || item?.creator?.id || user?.id || "",
    creatorEmail: item?.creatorEmail || item?.creator?.email || item?.author?.email || user?.email || "",
    author: item?.creatorName || item?.creator?.name || item?.author?.name || user?.name || base.author,
    createdAt,
    createdLabel: formatPromptDate(createdAt),
    updatedAt,
    thumbnail,
    tags,
    tagsText: tags.join(", "),
    content,
    difficulty: toTitleCase(item?.difficulty || item?.level || base.difficulty || "Beginner"),
    difficultyValue: toTitleCase(item?.difficulty || item?.level || base.difficulty || "Beginner"),
    visibility,
    visibilityValue,
    status,
    statusValue,
    rejectionReason,
    copyCount: copies,
    bookmarkCount: bookmarks,
    bookmarks,
    views,
    rating,
    reviewCount,
    performanceChange: parseNumber(item?.performanceChange || item?.growth, fallbackPerformance[index % fallbackPerformance.length]),
    source: item,
  };
}

export function normalizeCreatorPrompts(payload, user) {
  const items = extractPromptItems(payload);
  return items.filter((item) => isPromptOwnedByUser(item, user)).map((item, index) => normalizeCreatorPrompt(item, index, user));
}

export function filterCreatorPrompts(prompts, filters) {
  const search = filters.search.trim().toLowerCase();

  return prompts.filter((prompt) => {
    const matchesSearch =
      !search ||
      [
        prompt.title,
        prompt.description,
        prompt.category,
        prompt.aiTool,
        prompt.visibility,
        prompt.status,
        prompt.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(search);

    const matchesCategory =
      filters.category === creatorPromptFilters.categories[0] || prompt.category === filters.category;
    const matchesVisibility =
      filters.visibility === creatorPromptFilters.visibility[0] || prompt.visibility === filters.visibility;
    const matchesStatus = filters.status === creatorPromptFilters.status[0] || prompt.status === filters.status;

    return matchesSearch && matchesCategory && matchesVisibility && matchesStatus;
  });
}

export function buildCreatorStats(prompts) {
  const approved = prompts.filter((prompt) => prompt.statusValue === "approved");
  const totalCopies = prompts.reduce((sum, prompt) => sum + parseNumber(prompt.copyCount), 0);
  const totalBookmarks = prompts.reduce((sum, prompt) => sum + parseNumber(prompt.bookmarkCount), 0);

  return [
    {
      id: "total",
      label: "Total Prompts",
      value: prompts.length,
      meta: `+${Math.max(3, Math.round(prompts.length * 0.24))} in last 30 days`,
      accent: "from-violet-500 to-indigo-500",
    },
    {
      id: "approved",
      label: "Approved Prompts",
      value: approved.length,
      meta: `+${Math.max(2, Math.round(approved.length * 0.18))} in last 30 days`,
      accent: "from-emerald-400 to-teal-500",
    },
    {
      id: "copies",
      label: "Total Copies",
      value: formatCompactNumber(totalCopies),
      meta: `+${formatCompactNumber(Math.max(42, Math.round(totalCopies * 0.16)))} vs last 30 days`,
      accent: "from-sky-500 to-cyan-500",
    },
    {
      id: "bookmarks",
      label: "Total Bookmarks",
      value: formatCompactNumber(totalBookmarks),
      meta: `+${formatCompactNumber(Math.max(28, Math.round(totalBookmarks * 0.2)))} vs last 30 days`,
      accent: "from-amber-400 to-orange-500",
    },
  ];
}

export function buildCreatorAnalytics(prompts, user) {
  const sortedByCopies = [...prompts].sort((left, right) => right.copyCount - left.copyCount);
  const topPrompts = sortedByCopies.slice(0, 5);
  const approved = prompts.filter((prompt) => prompt.statusValue === "approved");
  const ratingAverage =
    approved.length > 0
      ? approved.reduce((sum, prompt) => sum + prompt.rating, 0) / approved.length
      : 4.7;

  const categoryMap = prompts.reduce((accumulator, prompt) => {
    accumulator[prompt.category] = (accumulator[prompt.category] || 0) + 1;
    return accumulator;
  }, {});

  const categoryDistribution = Object.entries(categoryMap)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value }));

  const aiToolMap = prompts.reduce((accumulator, prompt) => {
    accumulator[prompt.aiTool] = (accumulator[prompt.aiTool] || 0) + prompt.copyCount;
    return accumulator;
  }, {});
  const aiToolTotal = Object.values(aiToolMap).reduce((sum, value) => sum + value, 0) || 1;
  const aiToolUsage = Object.entries(aiToolMap)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value, percent: Math.round((value / aiToolTotal) * 1000) / 10 }));

  const trendLabels = ["May 24", "May 25", "May 26", "May 27", "May 28", "May 29", "May 30"];
  const copiesTrend = defaultTrend.map((value, index) => ({
    label: trendLabels[index],
    value: prompts.length > 0 ? Math.round(value + prompts.length * 3.5 + index * 6) : value,
  }));
  const growthLabels = ["Apr 28 - May 4", "May 5 - May 11", "May 12 - May 18", "May 19 - May 25", "May 26 - May 30"];
  const promptGrowth = defaultGrowth.map((value, index) => ({
    label: growthLabels[index],
    value: prompts.length > 0 ? Math.max(2, Math.round(value + prompts.length * 0.2) - (index === 4 ? 1 : 0)) : value,
  }));

  const recentReviews = topPrompts.slice(0, 3).map((prompt, index) => ({
    id: `review-${prompt.id}-${index}`,
    author: ["Sarah Johnson", "Michael Chen", "Emily Davis"][index] || "PromptFlow User",
    rating: Math.max(4, Math.round(prompt.rating)),
    promptTitle: prompt.title,
    body: [
      "This prompt is amazing. It generates exactly what I needed and feels production-ready.",
      "Great prompt. The output quality is impressive and saved me a lot of time on client work.",
      "Very helpful structure and clean formatting. Easy to adapt for different use cases.",
    ][index],
    timeAgo: index === 0 ? "2 hours ago" : index === 1 ? "1 day ago" : "2 days ago",
  }));

  const recentActivity = prompts.slice(0, 4).map((prompt, index) => ({
    id: `activity-${prompt.id}`,
    title:
      prompt.statusValue === "rejected"
        ? "Prompt needs revision"
        : prompt.statusValue === "pending"
        ? "Prompt pending review"
        : "Prompt approved",
    description:
      prompt.statusValue === "rejected"
        ? `${prompt.title} was returned with moderator feedback.`
        : prompt.statusValue === "pending"
        ? `${prompt.title} is waiting for moderation.`
        : `${prompt.title} is performing well in the marketplace.`,
    timeAgo: `${index + 1} day${index === 0 ? "" : "s"} ago`,
  }));

  const checklistHints = [
    "Title is clear and descriptive",
    "Description explains the value",
    "Prompt content is well-structured",
    "Uses markdown formatting",
    "Includes relevant tags",
    "Set access type (Public/Private)",
  ];

  return {
    ratingAverage,
    topPrompts,
    recentReviews,
    recentActivity,
    categoryDistribution,
    aiToolUsage,
    copiesTrend,
    promptGrowth,
    checklistHints,
    greetingName: user?.name?.split(" ")[0] || "Creator",
  };
}

export function toCreatorPromptPayload(values, user, existingPrompt) {
  const tags = normalizeTags(values.tagsText);

  return {
    title: values.title.trim(),
    description: values.description.trim(),
    category: values.category,
    aiTool: values.aiTool,
    tags,
    difficulty: values.difficulty,
    visibility: values.visibility === "private" ? "private" : "public",
    thumbnail: values.thumbnail?.trim() || undefined,
    content: values.content.trim(),
    status: existingPrompt?.statusValue || "pending",
    creatorId: existingPrompt?.creatorId || user?.id,
    creatorEmail: existingPrompt?.creatorEmail || user?.email,
    creatorName: user?.name,
  };
}

export function buildPromptQualityChecklist(values) {
  const tags = normalizeTags(values.tagsText);
  const items = [
    { id: "title", label: "Title is clear and descriptive", complete: values.title.trim().length >= 10 },
    { id: "description", label: "Description explains the value", complete: values.description.trim().length >= 40 },
    { id: "content", label: "Prompt content is well-structured", complete: values.content.trim().length >= 80 },
    { id: "markdown", label: "Uses markdown formatting", complete: /[#*\-\d]/.test(values.content) },
    { id: "tags", label: "Includes relevant tags", complete: tags.length >= 2 },
    { id: "visibility", label: "Set access type (Public/Private)", complete: Boolean(values.visibility) },
  ];

  return {
    items,
    completedCount: items.filter((item) => item.complete).length,
  };
}
