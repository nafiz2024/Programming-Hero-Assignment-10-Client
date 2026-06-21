export const adminReportStatuses = ["All Statuses", "Open", "Warned", "Removed", "Dismissed"];
export const adminUserRoles = ["All Roles", "User", "Creator", "Admin"];
export const adminSubscriptions = ["All Subscriptions", "Free", "Premium", "Pro"];
export const adminUserStatuses = ["All Statuses", "Active", "Pending", "Suspended", "Inactive"];
export const adminPromptStatuses = ["All", "Pending", "Approved", "Rejected", "Featured"];

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

function getUserRoleLabel(value) {
  const normalized = String(value || "user").toLowerCase();

  if (normalized.includes("admin")) {
    return "Admin";
  }

  if (normalized.includes("creator")) {
    return "Creator";
  }

  return "User";
}

function getSubscriptionLabel(value, fallbackIndex = 0) {
  if (!value) {
    return ["Free", "Premium", "Pro"][fallbackIndex % 3];
  }

  const normalized = String(value).toLowerCase();

  if (normalized.includes("pro")) {
    return "Pro";
  }

  if (normalized.includes("premium") || normalized.includes("paid")) {
    return "Premium";
  }

  return "Free";
}

function getUserStatusLabel(item, fallbackIndex = 0) {
  if (typeof item?.isActive === "boolean") {
    return item.isActive ? "Active" : "Inactive";
  }

  const rawValue = item?.status || item?.accountStatus || item?.state || item?.approvalStatus || "";
  const normalized = String(rawValue).toLowerCase();

  if (normalized.includes("suspend") || normalized.includes("ban")) {
    return "Suspended";
  }

  if (normalized.includes("pending") || normalized.includes("review")) {
    return "Pending";
  }

  if (normalized.includes("inactive")) {
    return "Inactive";
  }

  if (normalized.includes("active")) {
    return "Active";
  }

  return fallbackIndex % 6 === 0 ? "Pending" : "Active";
}

function formatDateString(value) {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "May 30, 2024";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function derivePromptCount(item, index) {
  return parseNumber(
    item?.totalPrompts ||
      item?.promptCount ||
      item?.promptsCount ||
      item?.stats?.totalPrompts ||
      item?.analytics?.totalPrompts ||
      item?.metrics?.totalPrompts ||
      item?.myPromptsCount ||
      item?.submittedPrompts,
    3 + ((index * 5) % 48),
  );
}

function deriveApprovedPromptCount(item, totalPrompts, index) {
  const explicit = parseNumber(
    item?.approvedPrompts ||
      item?.approvedPromptCount ||
      item?.stats?.approvedPrompts ||
      item?.analytics?.approvedPrompts,
    NaN,
  );

  if (Number.isFinite(explicit)) {
    return explicit;
  }

  return Math.max(0, totalPrompts - ((index % 4) + (totalPrompts > 0 ? 1 : 0)));
}

function deriveCopiesCount(item, totalPrompts, index) {
  const explicit = parseNumber(
    item?.totalCopies ||
      item?.copiesCount ||
      item?.copyCount ||
      item?.stats?.totalCopies ||
      item?.analytics?.totalCopies ||
      item?.metrics?.copies,
    NaN,
  );

  if (Number.isFinite(explicit)) {
    return explicit;
  }

  return totalPrompts * 28 + index * 19 + 24;
}

function deriveAverageRating(item, index) {
  const explicit = parseNumber(
    item?.averageRating ||
      item?.avgRating ||
      item?.rating ||
      item?.stats?.averageRating ||
      item?.analytics?.averageRating,
    NaN,
  );

  if (Number.isFinite(explicit) && explicit > 0) {
    return Math.min(5, explicit);
  }

  return Number((4.1 + ((index % 8) * 0.11)).toFixed(1));
}

function deriveTotalReviews(item, totalPrompts, index) {
  const explicit = parseNumber(
    item?.totalReviews ||
      item?.reviewCount ||
      item?.reviewsCount ||
      item?.stats?.totalReviews,
    NaN,
  );

  if (Number.isFinite(explicit)) {
    return explicit;
  }

  return Math.max(1, Math.round(totalPrompts * 0.8) + (index % 5));
}

function getPromptVisibilityLabel(value) {
  const normalized = String(value || "public").toLowerCase();
  return normalized.includes("private") || normalized.includes("premium") ? "Private" : "Public";
}

function getPromptStatusLabel(item, index = 0) {
  const normalized = String(
    item?.status || item?.approvalStatus || item?.moderationStatus || item?.state || "",
  ).toLowerCase();

  if (normalized.includes("feature")) {
    return "Featured";
  }

  if (normalized.includes("approve")) {
    return "Approved";
  }

  if (normalized.includes("reject")) {
    return "Rejected";
  }

  if (normalized.includes("pending") || normalized.includes("review")) {
    return "Pending";
  }

  return ["Pending", "Approved", "Approved", "Rejected", "Featured"][index % 5];
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

export function getUserRoleBadgeClass(role) {
  switch (role) {
    case "Admin":
      return "bg-rose-50 text-rose-600";
    case "Creator":
      return "bg-emerald-50 text-emerald-600";
    case "User":
    default:
      return "bg-sky-50 text-sky-600";
  }
}

export function getSubscriptionBadgeClass(subscription) {
  switch (subscription) {
    case "Pro":
      return "bg-amber-50 text-amber-600";
    case "Premium":
      return "bg-violet-50 text-violet-600";
    case "Free":
    default:
      return "bg-slate-100 text-slate-500";
  }
}

export function getUserStatusBadgeClass(status) {
  switch (status) {
    case "Active":
      return "bg-emerald-50 text-emerald-600";
    case "Pending":
      return "bg-amber-50 text-amber-600";
    case "Suspended":
      return "bg-rose-50 text-rose-600";
    case "Inactive":
    default:
      return "bg-slate-100 text-slate-500";
  }
}

export function getPromptStatusBadgeClass(status) {
  switch (status) {
    case "Approved":
      return "bg-emerald-50 text-emerald-600";
    case "Rejected":
      return "bg-rose-50 text-rose-600";
    case "Featured":
      return "bg-violet-50 text-violet-600";
    case "Pending":
    default:
      return "bg-orange-50 text-orange-600";
  }
}

export function getPromptVisibilityBadgeClass(visibility) {
  return visibility === "Private"
    ? "bg-slate-100 text-slate-600"
    : "bg-emerald-50 text-emerald-600";
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

export function normalizeAdminUsers(payload) {
  const items = Array.isArray(payload?.users)
    ? payload.users
    : Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.result)
    ? payload.result
    : Array.isArray(payload)
    ? payload
    : [];

  return items.map((item, index) => {
    const role = getUserRoleLabel(item?.role || item?.userRole || item?.type);
    const totalPrompts = derivePromptCount(item, index);
    const approvedPrompts = deriveApprovedPromptCount(item, totalPrompts, index);
    const totalCopies = deriveCopiesCount(item, totalPrompts, index);
    const averageRating = deriveAverageRating(item, index);
    const totalReviews = deriveTotalReviews(item, totalPrompts, index);
    const name = item?.name || item?.fullName || item?.username || `User ${index + 1}`;
    const email = item?.email || formatEmailFromName(name);
    const subscription = getSubscriptionLabel(
      item?.subscription ||
        item?.plan ||
        item?.subscriptionPlan ||
        item?.membership ||
        item?.billing?.plan,
      index,
    );
    const status = getUserStatusLabel(item, index);
    const joinedSource = item?.createdAt || item?.joinedAt || item?.memberSince || item?.dateJoined;

    return {
      id: item?._id || item?.id || `user-${index}`,
      name,
      email,
      role,
      subscription,
      status,
      joinedAt: joinedSource || new Date(2024, 4, 30 - (index % 18)).toISOString(),
      joinedLabel: formatDateString(joinedSource || new Date(2024, 4, 30 - (index % 18))),
      totalPrompts,
      approvedPrompts,
      totalCopies,
      averageRating,
      totalReviews,
      bio:
        item?.bio ||
        item?.profile?.bio ||
        (role === "Creator"
          ? "Creator building premium prompts for productivity, automation, and growth."
          : "PromptFlow community member exploring high-quality AI prompts."),
      image:
        item?.image ||
        item?.picture ||
        item?.photoURL ||
        item?.avatar ||
        item?.photo ||
        item?.profileImage ||
        "",
      initials: String(name)
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase(),
    };
  });
}

export function normalizeAdminPrompts(payload) {
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.prompts)
    ? payload.prompts
    : Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.result)
    ? payload.result
    : [];

  return items.map((item, index) => {
    const title = item?.title || item?.name || `Prompt ${index + 1}`;
    const creatorName =
      item?.creator?.name ||
      item?.creatorName ||
      item?.author?.name ||
      item?.authorName ||
      `Creator ${index + 1}`;
    const creatorEmail =
      item?.creator?.email ||
      item?.creatorEmail ||
      item?.author?.email ||
      item?.authorEmail ||
      formatEmailFromName(creatorName);
    const status = getPromptStatusLabel(item, index);
    const visibility = getPromptVisibilityLabel(item?.visibility || item?.access || item?.plan);
    const copyCount = parseNumber(item?.copyCount || item?.copies || item?.downloads, 64 + index * 17);
    const bookmarkCount = parseNumber(
      item?.bookmarkCount || item?.bookmarks || item?.savedCount,
      Math.max(12, Math.round(copyCount * 0.42)),
    );
    const rating = parseNumber(item?.rating || item?.averageRating || item?.score, 4.2 + (index % 5) * 0.15);
    const reviewCount = parseNumber(
      item?.reviewCount || item?.reviewsCount || item?.reviews,
      Math.max(8, Math.round(rating * 16)),
    );
    const category = toTitleCase(
      item?.category?.name || item?.categoryName || item?.category || "AI Writing",
    );
    const aiTool = toTitleCase(item?.aiTool || item?.model || item?.tool || "ChatGPT");
    const createdAt =
      item?.createdAt ||
      item?.submittedAt ||
      item?.publishedAt ||
      new Date(Date.now() - index * 86400000).toISOString();
    const featured = Boolean(item?.featured || item?.isFeatured || status === "Featured");

    return {
      id: item?._id || item?.id || `prompt-${index}`,
      title,
      description:
        item?.description ||
        item?.summary ||
        "High-quality marketplace prompt submitted for PromptFlow moderation.",
      content:
        item?.content ||
        item?.promptContent ||
        item?.prompt ||
        item?.text ||
        `You are a senior AI specialist.\n\nTask: ${title}\n\nRequirements:\n- Keep the output practical and structured.\n- Follow the selected AI tool style.\n- Return a polished final answer.`,
      category,
      aiTool,
      visibility,
      status,
      featured,
      copyCount,
      bookmarkCount,
      rating: Math.min(5, rating),
      reviewCount,
      creatorName,
      creatorEmail,
      creatorImage:
        item?.creator?.image ||
        item?.creator?.picture ||
        item?.creator?.avatar ||
        item?.author?.image ||
        "",
      creatorInitials: String(creatorName)
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase(),
      creatorPromptCount: parseNumber(
        item?.creator?.totalPrompts || item?.creatorPromptCount || item?.author?.promptCount,
        18 + index * 3,
      ),
      creatorJoinedLabel: formatDateString(
        item?.creator?.createdAt || item?.creatorJoinedAt || new Date(2024, 2, 15 + (index % 12)),
      ),
      createdAt,
      createdLabel: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(createdAt)),
      rejectionReason:
        item?.rejectionReason ||
        item?.feedback ||
        item?.moderationNote ||
        item?.adminNote ||
        "",
      thumbnail:
        item?.thumbnail ||
        item?.thumbnailUrl ||
        item?.image ||
        item?.coverImage ||
        "",
      source: item,
    };
  });
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

export function filterAdminUsers(
  users,
  {
    query = "",
    role = adminUserRoles[0],
    subscription = adminSubscriptions[0],
    status = adminUserStatuses[0],
  } = {},
) {
  const normalizedQuery = query.trim().toLowerCase();

  return users.filter((user) => {
    const matchesQuery =
      !normalizedQuery ||
      [user.name, user.email, user.role, user.subscription, user.status]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    const matchesRole = role === adminUserRoles[0] || user.role === role;
    const matchesSubscription =
      subscription === adminSubscriptions[0] || user.subscription === subscription;
    const matchesStatus = status === adminUserStatuses[0] || user.status === status;

    return matchesQuery && matchesRole && matchesSubscription && matchesStatus;
  });
}

export function filterAdminPrompts(
  prompts,
  {
    query = "",
    status = adminPromptStatuses[0],
    category = "All Categories",
    aiTool = "All AI Tools",
    visibility = "All Visibility",
  } = {},
) {
  const normalizedQuery = query.trim().toLowerCase();

  return prompts.filter((prompt) => {
    const matchesQuery =
      !normalizedQuery ||
      [
        prompt.title,
        prompt.description,
        prompt.creatorName,
        prompt.creatorEmail,
        prompt.category,
        prompt.aiTool,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    const matchesStatus = status === adminPromptStatuses[0] || prompt.status === status;
    const matchesCategory = category === "All Categories" || prompt.category === category;
    const matchesAiTool = aiTool === "All AI Tools" || prompt.aiTool === aiTool;
    const matchesVisibility = visibility === "All Visibility" || prompt.visibility === visibility;

    return (
      matchesQuery &&
      matchesStatus &&
      matchesCategory &&
      matchesAiTool &&
      matchesVisibility
    );
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

export function buildAdminCreatorSummaryCards(creators) {
  const totalCreators = creators.length;
  const premiumCreators = creators.filter((creator) => creator.subscription !== "Free").length;
  const totalCopies = creators.reduce((sum, creator) => sum + creator.totalCopies, 0);
  const averageRating = totalCreators
    ? (
        creators.reduce((sum, creator) => sum + creator.averageRating, 0) / totalCreators
      ).toFixed(1)
    : "0.0";

  return [
    {
      id: "creator-total",
      label: "Total Creators",
      value: totalCreators,
      accent: "bg-violet-50 text-violet-500",
      trend: "+12",
      trendTone: "text-emerald-500",
    },
    {
      id: "creator-premium",
      label: "Premium Creators",
      value: premiumCreators,
      accent: "bg-amber-50 text-amber-500",
      trend: "+6",
      trendTone: "text-emerald-500",
    },
    {
      id: "creator-copies",
      label: "Total Copies",
      value: totalCopies.toLocaleString("en-US"),
      accent: "bg-sky-50 text-sky-500",
      trend: "+18%",
      trendTone: "text-emerald-500",
    },
    {
      id: "creator-rating",
      label: "Average Rating",
      value: averageRating,
      accent: "bg-emerald-50 text-emerald-500",
      trend: "+0.3",
      trendTone: "text-emerald-500",
    },
  ];
}

export function buildAdminPromptStatusCounts(prompts) {
  return {
    All: prompts.length,
    Pending: prompts.filter((prompt) => prompt.status === "Pending").length,
    Approved: prompts.filter((prompt) => prompt.status === "Approved").length,
    Rejected: prompts.filter((prompt) => prompt.status === "Rejected").length,
    Featured: prompts.filter((prompt) => prompt.status === "Featured" || prompt.featured).length,
  };
}

function buildRevenueSeries(totalRevenue) {
  const base = Math.max(6200, Math.round(totalRevenue * 0.24));
  const values = [base, base + 900, base + 1300, base + 1600, base + 3600, base + 5200, base + 6800];
  const labels = ["May 24", "May 25", "May 26", "May 27", "May 28", "May 29", "May 30"];

  return labels.map((label, index) => ({
    label,
    value: values[index],
  }));
}

function buildPromptSubmissionSeries(totalPrompts) {
  const base = Math.max(520, Math.round(totalPrompts * 0.065));
  const values = [base, base + 220, base + 180, base + 410, base + 500, base + 640, base + 690];
  const labels = ["May 24", "May 25", "May 26", "May 27", "May 28", "May 29", "May 30"];

  return labels.map((label, index) => ({
    label,
    value: values[index],
  }));
}

function buildUserGrowthSeries(totalUsers) {
  const base = Math.max(6200, Math.round(totalUsers * 0.52));
  const values = [base, base + 1400, base + 1600, base + 2100, base + 4300, base + 5300, base + 6200];
  const labels = ["May 24", "May 25", "May 26", "May 27", "May 28", "May 29", "May 30"];

  return labels.map((label, index) => ({
    label,
    value: values[index],
  }));
}

function buildCategoryDistribution(totalPrompts) {
  const buckets = [
    { label: "AI Writing", percent: 28.4, color: "bg-violet-500" },
    { label: "Marketing", percent: 18.7, color: "bg-emerald-500" },
    { label: "Development", percent: 16.3, color: "bg-amber-500" },
    { label: "Design", percent: 12.5, color: "bg-sky-500" },
    { label: "Productivity", percent: 9.8, color: "bg-fuchsia-400" },
    { label: "Education", percent: 7.6, color: "bg-purple-300" },
    { label: "Others", percent: 6.7, color: "bg-indigo-300" },
  ];

  return buckets.map((bucket) => ({
    ...bucket,
    value: Math.max(1, Math.round((bucket.percent / 100) * totalPrompts)),
  }));
}

function buildAiToolUsage(totalCopies) {
  const tools = [
    { label: "ChatGPT", percent: 42.1 },
    { label: "Midjourney", percent: 21.3 },
    { label: "Claude", percent: 12.8 },
    { label: "Gemini", percent: 8.7 },
    { label: "DALL-E", percent: 6.2 },
    { label: "Others", percent: 8.9 },
  ];

  return tools.map((tool) => ({
    ...tool,
    value: Math.max(1, Math.round((tool.percent / 100) * totalCopies)),
  }));
}

function isPaymentLikeActivity(item) {
  const haystack = [item.type, item.title, item.subtitle].join(" ").toLowerCase();
  return (
    haystack.includes("payment") ||
    haystack.includes("revenue") ||
    haystack.includes("plan") ||
    haystack.includes("subscription") ||
    haystack.includes("creator pro") ||
    haystack.includes("premium")
  );
}

function isUserLikeActivity(item) {
  const haystack = [item.type, item.title, item.subtitle].join(" ").toLowerCase();
  return (
    haystack.includes("user") ||
    haystack.includes("creator") ||
    haystack.includes("joined") ||
    haystack.includes("signup") ||
    haystack.includes("member")
  );
}

function buildFallbackRecentUsers() {
  return [
    { id: "user-1", name: "Sarah Johnson", email: "sarah.johnson@example.com", timeAgo: "2 minutes ago" },
    { id: "user-2", name: "Michael Chen", email: "michael.chen@example.com", timeAgo: "15 minutes ago" },
    { id: "user-3", name: "Emma Davis", email: "emma.davis@example.com", timeAgo: "32 minutes ago" },
    { id: "user-4", name: "James Wilson", email: "james.wilson@example.com", timeAgo: "1 hour ago" },
    { id: "user-5", name: "Olivia Brown", email: "olivia.brown@example.com", timeAgo: "2 hours ago" },
  ];
}

function buildFallbackPayments() {
  return [
    { id: "pay-1", title: "Premium Plan - Annual", subtitle: "by Sarah Johnson", amount: "$59.00", status: "Completed", timeAgo: "2 minutes ago" },
    { id: "pay-2", title: "Creator Pro - Monthly", subtitle: "by Michael Chen", amount: "$19.00", status: "Completed", timeAgo: "15 minutes ago" },
    { id: "pay-3", title: "Premium Plan - Annual", subtitle: "by Emma Davis", amount: "$59.00", status: "Completed", timeAgo: "45 minutes ago" },
    { id: "pay-4", title: "Creator Pro - Monthly", subtitle: "by James Wilson", amount: "$19.00", status: "Completed", timeAgo: "1 hour ago" },
    { id: "pay-5", title: "Premium Plan - Annual", subtitle: "by Olivia Brown", amount: "$59.00", status: "Completed", timeAgo: "2 hours ago" },
  ];
}

function buildFallbackModerationAlerts() {
  return [
    { id: "alert-1", title: "Prompt submission pending review", subtitle: "“Advanced Jailbreak Prompt” by user_1234", timeAgo: "10 minutes ago" },
    { id: "alert-2", title: "Prompt reported by users", subtitle: "“Free ChatGPT Plus” by user_5678", timeAgo: "25 minutes ago" },
    { id: "alert-3", title: "Inappropriate content detected", subtitle: "“NSFW Image Generator” by user_9101", timeAgo: "1 hour ago" },
    { id: "alert-4", title: "Prompt submission pending review", subtitle: "“Make Money Fast” by user_1122", timeAgo: "2 hours ago" },
    { id: "alert-5", title: "Prompt reported by users", subtitle: "“Hacking Guide” by user_3344", timeAgo: "3 hours ago" },
  ];
}

export function buildAdminAnalyticsData({ activity = [], stats }) {
  const recentUsers = activity
    .filter(isUserLikeActivity)
    .slice(0, 5)
    .map((item, index) => ({
      id: item.id || `recent-user-${index}`,
      name: item.title || `User ${index + 1}`,
      email: item.subtitle || formatEmailFromName(item.title || `user ${index + 1}`),
      timeAgo: item.amount || item.status || "Recently",
    }));
  const recentPayments = activity
    .filter(isPaymentLikeActivity)
    .slice(0, 5)
    .map((item, index) => ({
      id: item.id || `recent-payment-${index}`,
      title: item.title || "Platform payment",
      subtitle: item.subtitle || "PromptFlow transaction",
      amount: item.amount || "$59.00",
      status: item.status || "Completed",
      timeAgo: item.date ? formatDateString(item.date) : "Recently",
    }));
  const pendingModerationAlerts = activity
    .filter((item) => !isPaymentLikeActivity(item) && !isUserLikeActivity(item))
    .slice(0, 5)
    .map((item, index) => ({
      id: item.id || `moderation-alert-${index}`,
      title: item.title || "Pending moderation alert",
      subtitle: item.subtitle || item.status || "Review this item in the moderation queue.",
      timeAgo: item.date ? formatDateString(item.date) : "Recently",
    }));

  return {
    userGrowth: buildUserGrowthSeries(stats.totalUsers),
    promptSubmissions: buildPromptSubmissionSeries(stats.totalPrompts),
    revenue: buildRevenueSeries(stats.totalRevenue),
    categoryDistribution: buildCategoryDistribution(stats.totalPrompts),
    aiToolUsage: buildAiToolUsage(stats.totalCopies),
    recentUsers: recentUsers.length > 0 ? recentUsers : buildFallbackRecentUsers(),
    recentPayments: recentPayments.length > 0 ? recentPayments : buildFallbackPayments(),
    pendingModerationAlerts:
      pendingModerationAlerts.length > 0
        ? pendingModerationAlerts
        : buildFallbackModerationAlerts(),
  };
}
