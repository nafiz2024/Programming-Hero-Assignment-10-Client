const creatorStatFallbacks = {
  totalPrompts: 98,
  totalCopies: 42700,
  averageRating: 4.8,
};

const reviewFallbackAuthors = [
  "Sophia Lee",
  "Daniel Martinez",
  "Olivia Carter",
  "James Wilson",
  "Emma Johnson",
];

export const reportReasonOptions = [
  "Inappropriate Content",
  "Spam",
  "Copyright Violation",
  "Misleading Prompt",
  "Other",
];

export const premiumBenefits = [
  "Access premium prompts",
  "Unlock full prompt content",
  "Priority support for creators",
];

export const promptUsageSteps = [
  {
    title: "Copy the prompt",
    description: "Use the copy button to grab the complete prompt format.",
  },
  {
    title: "Replace variables",
    description: "Swap placeholders with your product, task, or project context.",
  },
  {
    title: "Select the AI tool",
    description: "Use the recommended model for the cleanest response quality.",
  },
  {
    title: "Generate and refine",
    description: "Run the prompt, then iterate with examples and constraints.",
  },
];

const whyPromptWorksFallback = [
  "Well-structured for clear output",
  "Includes analysis and explanation",
  "Works on complex codebases",
  "Saves time and improves quality",
];

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

function buildInitials(name) {
  return String(name || "PF")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function buildCreatorBio(prompt) {
  if (prompt?.creator?.bio) {
    return prompt.creator.bio;
  }

  if (prompt?.creatorBio) {
    return prompt.creatorBio;
  }

  return "AI enthusiast and prompt creator focused on practical, high-quality workflows.";
}

function getPromptWhyWorks(prompt) {
  const candidate =
    prompt?.whyThisWorks ||
    prompt?.whyItWorks ||
    prompt?.tips ||
    prompt?.benefits ||
    prompt?.highlights ||
    [];

  if (Array.isArray(candidate) && candidate.length > 0) {
    return candidate
      .map((item) => toTitleCase(typeof item === "string" ? item : item?.label || item?.title || ""))
      .filter(Boolean);
  }

  return whyPromptWorksFallback;
}

function getPromptItem(payload) {
  return payload?.prompt || payload?.data || payload?.result || payload || {};
}

export function normalizePromptDetails(payload) {
  const prompt = getPromptItem(payload);
  const creatorName =
    prompt?.creator?.name ||
    prompt?.creatorName ||
    prompt?.author?.name ||
    "PromptFlow Creator";
  const creatorEmail =
    prompt?.creator?.email ||
    prompt?.creatorEmail ||
    prompt?.author?.email ||
    "";
  const visibilityValue = String(prompt?.visibility || prompt?.access || "public").toLowerCase();
  const visibility = visibilityValue.includes("premium") ? "Premium" : "Public";
  const difficulty = toTitleCase(prompt?.difficulty || prompt?.level || "Beginner");
  const category = toTitleCase(prompt?.category?.name || prompt?.categoryName || prompt?.category || "General");
  const aiTool = toTitleCase(prompt?.aiTool || prompt?.model || prompt?.tool || "ChatGPT");
  const reviewCount = parseNumber(prompt?.reviewCount || prompt?.totalReviews || prompt?.reviewsCount, 0);
  const averageRating = parseNumber(prompt?.rating || prompt?.averageRating || prompt?.score, 0);
  const copyCount = parseNumber(prompt?.copyCount || prompt?.copies || prompt?.downloads, 0);
  const totalPrompts = parseNumber(
    prompt?.creator?.totalPrompts || prompt?.creatorPromptCount || prompt?.author?.promptCount,
    creatorStatFallbacks.totalPrompts,
  );
  const totalCopies = parseNumber(
    prompt?.creator?.totalCopies || prompt?.creatorCopyCount || prompt?.author?.copyCount,
    Math.max(copyCount * 6, creatorStatFallbacks.totalCopies),
  );
  const creatorAverageRating = parseNumber(
    prompt?.creator?.averageRating || prompt?.creatorRating || prompt?.author?.averageRating,
    averageRating || creatorStatFallbacks.averageRating,
  );

  return {
    id: prompt?._id || prompt?.id || "",
    title: prompt?.title || "Untitled Prompt",
    description:
      prompt?.description ||
      "High-quality prompt details, creator context, and community feedback from PromptFlow.",
    content: prompt?.content || "Prompt content is not available yet.",
    category,
    aiTool,
    difficulty,
    visibility,
    status: toTitleCase(prompt?.status || "Approved"),
    rating: averageRating,
    reviewCount,
    copyCount,
    publishedAt: prompt?.createdAt || prompt?.publishedAt || prompt?.date,
    updatedAt: prompt?.updatedAt || prompt?.modifiedAt || prompt?.createdAt,
    locked: Boolean(prompt?.isLocked || prompt?.requiresPremium),
    requiresPremium: Boolean(prompt?.requiresPremium || visibility === "Premium"),
    thumbnail: prompt?.thumbnail || "",
    tags: Array.isArray(prompt?.tags) ? prompt.tags.map(toTitleCase) : [],
    creator: {
      id: prompt?.creator?._id || prompt?.creatorId || "",
      name: creatorName,
      email: creatorEmail,
      image:
        prompt?.creator?.image ||
        prompt?.creator?.picture ||
        prompt?.creator?.avatar ||
        prompt?.creatorImage ||
        prompt?.author?.image ||
        "",
      bio: buildCreatorBio(prompt),
      initials: buildInitials(creatorName),
      totalPrompts,
      totalCopies,
      averageRating: creatorAverageRating,
    },
    whyThisWorks: getPromptWhyWorks(prompt),
  };
}

function extractReviewItems(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.reviews)) {
    return payload.reviews;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.result)) {
    return payload.result;
  }

  return [];
}

export function normalizeReviewsPayload(payload) {
  const items = extractReviewItems(payload).map((review, index) => {
    const authorName =
      review?.user?.name ||
      review?.author?.name ||
      review?.reviewerName ||
      review?.name ||
      reviewFallbackAuthors[index % reviewFallbackAuthors.length];
    const rating = Math.min(5, Math.max(1, parseNumber(review?.rating, 5)));

    return {
      id: review?._id || review?.id || `review-${index}`,
      authorId:
        review?.user?._id ||
        review?.user?.id ||
        review?.author?._id ||
        review?.author?.id ||
        review?.userId ||
        review?.reviewerId ||
        "",
      authorName,
      authorEmail:
        review?.user?.email ||
        review?.author?.email ||
        review?.reviewerEmail ||
        "",
      rating,
      comment:
        review?.comment ||
        review?.review ||
        review?.description ||
        "Helpful review feedback from the PromptFlow community.",
      image:
        review?.user?.image ||
        review?.user?.picture ||
        review?.author?.image ||
        review?.reviewerImage ||
        "",
      createdAt: review?.createdAt || review?.date,
      updatedAt: review?.updatedAt || review?.createdAt || review?.date,
      initials: buildInitials(authorName),
    };
  });

  const totalReviews = parseNumber(payload?.totalReviews || payload?.count || items.length, items.length);
  const averageRating =
    parseNumber(payload?.averageRating || payload?.avgRating || payload?.rating, 0) ||
    (items.length > 0 ? items.reduce((sum, item) => sum + item.rating, 0) / items.length : 0);
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count:
      parseNumber(payload?.distribution?.[star] || payload?.ratingDistribution?.[star], -1) >= 0
        ? parseNumber(payload?.distribution?.[star] || payload?.ratingDistribution?.[star], 0)
        : items.filter((item) => item.rating === star).length,
  }));

  return {
    items,
    averageRating,
    totalReviews,
    distribution,
  };
}
