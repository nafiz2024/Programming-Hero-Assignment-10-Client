import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  CreditCard,
  Flag,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  XCircle,
} from "lucide-react";

import { isPremiumSubscription, normalizePayments } from "@/lib/payments";

const READ_STORAGE_PREFIX = "pf-notifications-read";
const VIEWED_STORAGE_PREFIX = "pf-viewed-prompts";

export const notificationFilters = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "prompt-updates", label: "Prompt Updates" },
  { id: "payments", label: "Payments" },
  { id: "reports", label: "Reports" },
  { id: "system", label: "System" },
];

const categoryMeta = {
  "prompt-updates": {
    accent: "bg-violet-50 text-violet-600",
  },
  payments: {
    accent: "bg-emerald-50 text-emerald-600",
  },
  reports: {
    accent: "bg-amber-50 text-amber-600",
  },
  system: {
    accent: "bg-sky-50 text-sky-600",
  },
};

const typeMeta = {
  "prompt-approved": {
    icon: CheckCircle2,
    category: "prompt-updates",
  },
  "prompt-rejected": {
    icon: XCircle,
    category: "prompt-updates",
  },
  "new-review": {
    icon: MessageSquare,
    category: "prompt-updates",
  },
  "payment-successful": {
    icon: CreditCard,
    category: "payments",
  },
  "premium-activated": {
    icon: Sparkles,
    category: "payments",
  },
  "report-resolved": {
    icon: Flag,
    category: "reports",
  },
  "admin-warning": {
    icon: ShieldAlert,
    category: "reports",
  },
  "system-update": {
    icon: Bell,
    category: "system",
  },
};

function getStorageItem(key, fallback) {
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

function setStorageItem(key, value) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Keep UI resilient when storage is unavailable.
  }
}

function toUserScopedKey(prefix, userId) {
  return `${prefix}:${userId || "guest"}`;
}

function toTitleCase(value) {
  return String(value || "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function resolvePromptTitle(prompt, fallback = "PromptFlow prompt") {
  return (
    prompt?.title ||
    prompt?.prompt?.title ||
    prompt?.name ||
    prompt?.promptTitle ||
    fallback
  );
}

function resolvePromptId(prompt, fallback) {
  return (
    prompt?.id ||
    prompt?._id ||
    prompt?.promptId ||
    prompt?.prompt?._id ||
    prompt?.prompt?.id ||
    fallback
  );
}

function normalizeBookmarkItems(payload) {
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.bookmarks)
    ? payload.bookmarks
    : Array.isArray(payload?.data)
    ? payload.data
    : [];

  return items.map((item, index) => ({
    id: resolvePromptId(item, `bookmark-${index}`),
    title: resolvePromptTitle(item),
    creatorName:
      item?.prompt?.creator?.name ||
      item?.creator?.name ||
      item?.creatorName ||
      item?.author?.name ||
      "PromptFlow Creator",
    savedAt: item?.createdAt || item?.savedAt || item?.updatedAt || new Date(Date.now() - index * 3600000).toISOString(),
  }));
}

function formatRelativeTime(value) {
  if (!value) {
    return "Just now";
  }

  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes > 1 ? "s" : ""} ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

function createNotification({
  id,
  type,
  title,
  message,
  timestamp,
  actionHref = "",
  actionLabel = "",
}) {
  const meta = typeMeta[type] || typeMeta["system-update"];
  const category = meta.category;

  return {
    id,
    type,
    title,
    message,
    timestamp,
    relativeTime: formatRelativeTime(timestamp),
    actionHref,
    actionLabel,
    icon: meta.icon,
    category,
    accent: categoryMeta[category]?.accent || categoryMeta.system.accent,
  };
}

export function getNotificationReadIds(userId) {
  return getStorageItem(toUserScopedKey(READ_STORAGE_PREFIX, userId), []);
}

export function setNotificationReadIds(userId, ids) {
  setStorageItem(toUserScopedKey(READ_STORAGE_PREFIX, userId), ids);
}

export function getRecentlyViewedPrompts(userId) {
  return getStorageItem(toUserScopedKey(VIEWED_STORAGE_PREFIX, userId), []);
}

export function recordPromptView(userId, prompt) {
  if (!prompt) {
    return;
  }

  const existing = getRecentlyViewedPrompts(userId);
  const nextItem = {
    id: prompt.id || prompt._id || "",
    title: prompt.title || "PromptFlow prompt",
    description: prompt.description || "",
    category: prompt.category || "General",
    aiTool: prompt.aiTool || "AI Tool",
    viewedAt: new Date().toISOString(),
    href: `/prompts/${prompt.id || prompt._id || ""}`,
  };

  const deduped = [nextItem, ...existing.filter((item) => String(item.id) !== String(nextItem.id))].slice(0, 10);
  setStorageItem(toUserScopedKey(VIEWED_STORAGE_PREFIX, userId), deduped);
}

export function buildNotifications({ bookmarks = [], payments = [], user }) {
  const fallbackPromptA = bookmarks[0] || {
    id: "prompt-a",
    title: "SEO Blog Post Generator",
    creatorName: "PromptFlow Creator",
    savedAt: new Date(Date.now() - 7200000).toISOString(),
  };
  const fallbackPromptB = bookmarks[1] || {
    id: "prompt-b",
    title: "Cold Email Template Generator",
    creatorName: "PromptFlow Creator",
    savedAt: new Date(Date.now() - 14400000).toISOString(),
  };
  const firstPayment = payments[0] || null;
  const userName = user?.name?.split(" ")[0] || "there";
  const isPremium = isPremiumSubscription(user?.subscription);

  const baseNotifications = [
    createNotification({
      id: `prompt-approved:${fallbackPromptA.id}`,
      type: "prompt-approved",
      title: "Prompt approved",
      message: `"${fallbackPromptA.title}" was approved and is now visible in your workspace.`,
      timestamp: fallbackPromptA.savedAt,
      actionHref: "/dashboard/prompts",
      actionLabel: "View prompt",
    }),
    createNotification({
      id: `prompt-rejected:${fallbackPromptB.id}`,
      type: "prompt-rejected",
      title: "Prompt needs changes",
      message: `"${fallbackPromptB.title}" needs a few updates before it can be approved.`,
      timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
      actionHref: "/dashboard/prompts",
      actionLabel: "Review feedback",
    }),
    createNotification({
      id: `review:${fallbackPromptA.id}`,
      type: "new-review",
      title: "New review received",
      message: `A user left fresh feedback on "${fallbackPromptA.title}".`,
      timestamp: new Date(Date.now() - 10 * 3600000).toISOString(),
      actionHref: `/prompts/${fallbackPromptA.id}`,
      actionLabel: "Read review",
    }),
    createNotification({
      id: "report-resolved",
      type: "report-resolved",
      title: "Report resolved",
      message: `A report related to "${fallbackPromptB.title}" has been reviewed and closed.`,
      timestamp: new Date(Date.now() - 18 * 3600000).toISOString(),
      actionHref: "/notifications",
      actionLabel: "View details",
    }),
    createNotification({
      id: "admin-warning",
      type: "admin-warning",
      title: "Admin warning",
      message: `Please double-check your prompt descriptions and keep content aligned with PromptFlow quality guidelines.`,
      timestamp: new Date(Date.now() - 26 * 3600000).toISOString(),
      actionHref: "/dashboard/prompts",
      actionLabel: "Open prompts",
    }),
    createNotification({
      id: "system-update",
      type: "system-update",
      title: "System update",
      message: `Hi ${userName}, your workspace now supports premium status pages and activity tracking.`,
      timestamp: new Date(Date.now() - 36 * 3600000).toISOString(),
      actionHref: "/dashboard/activity",
      actionLabel: "Open activity",
    }),
  ];

  const paymentNotifications = [];

  if (firstPayment) {
    paymentNotifications.push(
      createNotification({
        id: `payment-successful:${firstPayment.id}`,
        type: "payment-successful",
        title: "Payment successful",
        message: `${toTitleCase(firstPayment.planName)} payment of $${firstPayment.amount.toFixed(2)} was completed successfully.`,
        timestamp: firstPayment.createdAt,
        actionHref: "/premium",
        actionLabel: "View payment",
      }),
    );
  }

  if (isPremium || firstPayment) {
    paymentNotifications.push(
      createNotification({
        id: "premium-activated",
        type: "premium-activated",
        title: "Premium activated",
        message: "Premium access is active. Locked prompts and private premium content are now available.",
        timestamp: firstPayment?.createdAt || new Date(Date.now() - 3 * 3600000).toISOString(),
        actionHref: "/premium",
        actionLabel: "Open premium",
      }),
    );
  }

  return [...paymentNotifications, ...baseNotifications].sort(
    (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
  );
}

export function hydrateReadState(notifications, readIds = []) {
  const readIdSet = new Set(readIds);
  return notifications.map((item) => ({
    ...item,
    isRead: readIdSet.has(item.id),
  }));
}

export function filterNotifications(items, filter) {
  if (filter === "all") {
    return items;
  }

  if (filter === "unread") {
    return items.filter((item) => !item.isRead);
  }

  return items.filter((item) => item.category === filter);
}

export function buildNotificationSummary(items) {
  return {
    unread: items.filter((item) => !item.isRead).length,
    total: items.length,
    promptUpdates: items.filter((item) => item.category === "prompt-updates").length,
    payments: items.filter((item) => item.category === "payments").length,
    reports: items.filter((item) => item.category === "reports").length,
    system: items.filter((item) => item.category === "system").length,
  };
}

export function normalizeNotificationSource({ bookmarksPayload, paymentsPayload, user }) {
  const bookmarks = normalizeBookmarkItems(bookmarksPayload);
  const payments = normalizePayments(paymentsPayload);

  return {
    bookmarks,
    payments,
    notifications: buildNotifications({ bookmarks, payments, user }),
  };
}
