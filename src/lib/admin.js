export const adminReportStatuses = ["All Statuses", "Open", "Warned", "Removed", "Dismissed"];

const reportAccentPalette = [
  "from-sky-500/30 via-cyan-500/12 to-transparent",
  "from-fuchsia-500/28 via-violet-500/12 to-transparent",
  "from-indigo-500/30 via-blue-500/10 to-transparent",
  "from-pink-500/28 via-orange-500/12 to-transparent",
  "from-amber-500/28 via-orange-500/12 to-transparent",
  "from-cyan-500/26 via-sky-500/12 to-transparent",
];

function parseNumber(value, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(String(value ?? "").replace(/[^\d.]/g, ""));
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

function formatEmailFromName(name) {
  return `${String(name || "user")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/(^\.|\.$)/g, "")}@example.com`;
}

function getStatusLabel(value) {
  const normalized = String(value || "open").toLowerCase();

  if (normalized.includes("dismiss")) {
    return "Dismissed";
  }

  if (normalized.includes("warn")) {
    return "Warned";
  }

  if (normalized.includes("remove")) {
    return "Removed";
  }

  return "Open";
}

export function getStatusBadgeClass(status) {
  switch (status) {
    case "Dismissed":
      return "bg-emerald-50 text-emerald-600";
    case "Warned":
      return "bg-amber-50 text-amber-600";
    case "Removed":
      return "bg-rose-50 text-rose-600";
    case "Open":
    default:
      return "bg-orange-50 text-orange-600";
  }
}

export function normalizeAdminStats(payload, reports = []) {
  const data = payload?.stats || payload?.data || payload?.result || payload || {};
  const openReports = reports.filter((report) => report.status === "Open").length;
  const removedReports = reports.filter((report) => report.status === "Removed").length;
  const warnedReports = reports.filter((report) => report.status === "Warned").length;
  const dismissedReports = reports.filter((report) => report.status === "Dismissed").length;

  return {
    totalUsers: parseNumber(data.totalUsers, 12458),
    totalCreators: parseNumber(data.totalCreators, 1245),
    totalPrompts: parseNumber(data.totalPrompts, 8756),
    totalReviews: parseNumber(data.totalReviews, 5432),
    totalCopies: parseNumber(data.totalCopies, 98765),
    totalRevenue: parseNumber(data.totalRevenue, 28450.75),
    pendingPrompts: parseNumber(data.pendingPrompts || data.pendingReviewPrompts, 12),
    openReports: parseNumber(data.openReports, openReports || 24),
    removedPrompts: parseNumber(data.removedPrompts, removedReports || 18),
    warningsSent: parseNumber(data.warningsSent, warnedReports || 32),
    dismissedReports: parseNumber(data.dismissedReports, dismissedReports || 56),
    categories: parseNumber(data.categories, 24),
    activeAiTools: parseNumber(data.activeAiTools || data.aiTools, 8),
    totalBookmarks: parseNumber(data.totalBookmarks, 15678),
    averageRating: parseNumber(data.averageRating, 4.6),
  };
}

export function normalizeAdminReports(payload) {
  const items = Array.isArray(payload?.reports)
    ? payload.reports
    : Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
    ? payload
    : [];

  return items.map((item, index) => {
    const promptTitle = item?.prompt?.title || item?.promptTitle || item?.promptName || `Reported Prompt ${index + 1}`;
    const creatorName = item?.creator?.name || item?.prompt?.creator?.name || item?.creatorName || "Prompt Creator";
    const reporterName = item?.reportedBy?.name || item?.reporter?.name || item?.user?.name || item?.reporterName || "Community User";
    const reason = item?.reason || item?.reportReason || item?.category || "Inappropriate Content";
    const status = getStatusLabel(item?.status || item?.resolutionStatus || item?.actionStatus);

    return {
      id: item?._id || item?.id || `report-${index}`,
      promptId: item?.prompt?._id || item?.prompt?.id || item?.promptId || "",
      promptTitle,
      promptCategory: toTitleCase(item?.prompt?.category?.name || item?.promptCategory || item?.prompt?.category || "AI Writing"),
      promptThumbnail: item?.prompt?.thumbnail || item?.prompt?.image || item?.thumbnail || "",
      promptAccent: reportAccentPalette[index % reportAccentPalette.length],
      reason: toTitleCase(reason),
      reportedByName: reporterName,
      reportedByEmail:
        item?.reportedBy?.email || item?.reporter?.email || item?.user?.email || formatEmailFromName(reporterName),
      creatorName,
      creatorEmail: item?.creator?.email || item?.prompt?.creator?.email || formatEmailFromName(creatorName),
      description:
        item?.description ||
        item?.details ||
        item?.message ||
        "Moderator context was not included with this report.",
      reportDate: item?.createdAt || item?.reportedAt || item?.date || new Date().toISOString(),
      status,
      warningTitle: item?.warningTitle || "Policy Violation Warning",
      warningMessage:
        item?.warningMessage ||
        "Hello {{creator_name}},\n\nOur team has reviewed your prompt and found that it may violate PromptFlow community guidelines. Please review and update the content to stay compliant.\n\nContinued violations may result in restrictions on your account.",
    };
  });
}

export function normalizeAdminActivity(payload) {
  const items = Array.isArray(payload?.activities)
    ? payload.activities
    : Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
    ? payload
    : [];

  return items.map((item, index) => ({
    id: item?._id || item?.id || `activity-${index}`,
    type: String(item?.type || item?.kind || "activity").toLowerCase(),
    title: item?.title || item?.label || "Admin activity",
    subtitle: item?.subtitle || item?.description || "",
    status: item?.status || "",
    amount: item?.amount || "",
    date: item?.createdAt || item?.date || new Date().toISOString(),
  }));
}

export function filterAdminReports(reports, { query = "", status = adminReportStatuses[0] }) {
  const normalizedQuery = query.trim().toLowerCase();

  return reports.filter((report) => {
    const matchesQuery =
      !normalizedQuery ||
      [
        report.promptTitle,
        report.reason,
        report.reportedByName,
        report.creatorName,
        report.description,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);

    const matchesStatus = status === adminReportStatuses[0] || report.status === status;

    return matchesQuery && matchesStatus;
  });
}

export function paginateItems(items, page, pageSize) {
  const startIndex = (page - 1) * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
}

export function buildAdminSummaryCards(stats) {
  return [
    {
      id: "open-reports",
      label: "Open Reports",
      value: stats.openReports,
      accent: "bg-rose-50 text-rose-500",
      trend: "+14",
      trendTone: "text-rose-500",
    },
    {
      id: "removed-prompts",
      label: "Removed Prompts",
      value: stats.removedPrompts,
      accent: "bg-rose-50 text-rose-500",
      trend: "+7",
      trendTone: "text-rose-500",
    },
    {
      id: "warnings-sent",
      label: "Warnings Sent",
      value: stats.warningsSent,
      accent: "bg-amber-50 text-amber-500",
      trend: "+11",
      trendTone: "text-rose-500",
    },
    {
      id: "dismissed",
      label: "Dismissed Reports",
      value: stats.dismissedReports,
      accent: "bg-emerald-50 text-emerald-500",
      trend: "+9",
      trendTone: "text-emerald-500",
    },
  ];
}
