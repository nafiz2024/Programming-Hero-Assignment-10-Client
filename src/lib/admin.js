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

  if (normalized.includes("resolve")) {
    return "Resolved";
  }

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

function getUserStatusLabel(item) {
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

  return "Active";
}

function formatDateString(value) {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function derivePromptCount(item) {
  return parseNumber(
    item?.totalPrompts ||
      item?.promptCount ||
      item?.promptsCount ||
      item?.stats?.totalPrompts ||
      item?.analytics?.totalPrompts ||
      item?.metrics?.totalPrompts ||
      item?.myPromptsCount ||
      item?.submittedPrompts,
    0,
  );
}

function deriveApprovedPromptCount(item, totalPrompts) {
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

  return totalPrompts;
}

function deriveCopiesCount(item) {
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

  return 0;
}

function deriveAverageRating(item) {
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

  return 0;
}

function deriveTotalReviews(item) {
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

  return 0;
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
    case "Resolved":
      return "bg-sky-50 text-sky-600";
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
    totalUsers: parseNumber(data.totalUsers, 0),
    totalCreators: parseNumber(data.totalCreators, 0),
    totalPrompts: parseNumber(data.totalPrompts, 0),
    totalReviews: parseNumber(data.totalReviews, 0),
    totalCopies: parseNumber(data.totalCopies, 0),
    totalRevenue: parseNumber(data.totalRevenue, 0),
    totalPayments: parseNumber(data.totalPayments || data.totalTransactions, 0),
    pendingPrompts: parseNumber(data.pendingPrompts || data.pendingReviewPrompts, 0),
    openReports: parseNumber(data.openReports, openReports),
    removedPrompts: parseNumber(data.removedPrompts, removedReports),
    warningsSent: parseNumber(data.warningsSent, warnedReports),
    dismissedReports: parseNumber(data.dismissedReports, dismissedReports),
    categories: parseNumber(data.categories, 0),
    activeAiTools: parseNumber(data.activeAiTools || data.aiTools, 0),
    totalBookmarks: parseNumber(data.totalBookmarks, 0),
    averageRating: parseNumber(data.averageRating, 0),
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
  const latestPayments = Array.isArray(payload?.latestPayments)
    ? payload.latestPayments.map((item) => ({
        ...item,
        type: item?.type || "payment",
        title: item?.title || `${toTitleCase(item?.plan || "premium")} payment`,
        subtitle:
          item?.subtitle ||
          (item?.userName
            ? `by ${item.userName}${item?.userEmail ? ` (${item.userEmail})` : ""}`
            : item?.userEmail || "PromptFlow customer"),
        status: item?.status || item?.paymentStatus || "Completed",
        amount: item?.amount ? `$${parseNumber(item.amount, 0).toFixed(2)}` : "",
        createdAt: item?.createdAt || item?.paidAt || item?.date,
      }))
    : [];
  const items = Array.isArray(payload?.activities)
    ? payload.activities
    : latestPayments.length > 0
    ? latestPayments
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
    const totalPrompts = derivePromptCount(item);
    const approvedPrompts = deriveApprovedPromptCount(item, totalPrompts);
    const totalCopies = deriveCopiesCount(item);
    const averageRating = deriveAverageRating(item);
    const totalReviews = deriveTotalReviews(item);
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
    const status = getUserStatusLabel(item);
    const joinedSource = item?.createdAt || item?.joinedAt || item?.memberSince || item?.dateJoined;

    return {
      id: String(item?._id || item?.id || `user-${index}`),
      _id: String(item?._id || item?.id || `user-${index}`),
      name,
      email,
      role,
      subscription,
      status,
      joinedAt: joinedSource || "",
      joinedLabel: formatDateString(joinedSource),
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
