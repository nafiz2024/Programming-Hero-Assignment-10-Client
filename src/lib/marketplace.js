import {
  BookOpen,
  Bot,
  Eye,
  Gauge,
  Grid2x2,
  Layers3,
  Sparkles,
} from "lucide-react";

export const marketplaceFilterOptions = {
  category: ["All Categories", "Writing", "Marketing", "Development", "Design", "Business", "Education", "Productivity"],
  difficulty: ["All Levels", "Beginner", "Intermediate", "Advanced"],
  aiTool: ["All Tools", "ChatGPT", "Midjourney", "Claude", "Gemini", "DALL-E", "Copilot"],
  visibility: ["All Visibility", "Public Prompts", "Premium Prompts"],
  sortBy: ["Most Popular", "Highest Rated", "Most Copied", "Newest"],
};

export const marketplaceFilterSections = [
  { key: "category", label: "Category", icon: Grid2x2 },
  { key: "aiTool", label: "AI Tool", icon: Bot },
  { key: "difficulty", label: "Difficulty", icon: Gauge },
  { key: "visibility", label: "Visibility", icon: Eye },
];

export const marketplaceHeroStats = [
  { label: "Explore AI Prompts", icon: Sparkles },
  { label: "High quality prompt systems", icon: BookOpen },
  { label: "Curated marketplace discovery", icon: Layers3 },
];

const fallbackPrompts = [
  {
    id: "mock-1",
    title: "SEO Blog Post Generator",
    category: "Writing",
    aiTool: "ChatGPT",
    difficulty: "Beginner",
    visibility: "Public",
    rating: 4.8,
    copyCount: 12600,
    author: "Alex Morgan",
    description: "Generate SEO-optimized blog posts with keywords, meta descriptions, and structured outlines.",
    accent: "from-sky-500/30 via-cyan-500/12 to-transparent",
  },
  {
    id: "mock-2",
    title: "Midjourney Landscape Prompt",
    category: "Design",
    aiTool: "Midjourney",
    difficulty: "Intermediate",
    visibility: "Premium",
    rating: 4.9,
    copyCount: 8700,
    author: "Sophia Lee",
    description: "Create cinematic landscape concepts with color guidance, lighting details, and composition notes.",
    accent: "from-fuchsia-500/28 via-violet-500/12 to-transparent",
  },
  {
    id: "mock-3",
    title: "Python Function Docstring Writer",
    category: "Development",
    aiTool: "ChatGPT",
    difficulty: "Advanced",
    visibility: "Public",
    rating: 4.7,
    copyCount: 9300,
    author: "David Kim",
    description: "Generate polished Python docstrings with examples, parameter notes, and return value descriptions.",
    accent: "from-indigo-500/30 via-blue-500/10 to-transparent",
  },
  {
    id: "mock-4",
    title: "Social Media Post Ideas",
    category: "Marketing",
    aiTool: "ChatGPT",
    difficulty: "Beginner",
    visibility: "Public",
    rating: 4.6,
    copyCount: 6200,
    author: "Olivia Carter",
    description: "Generate creative social content ideas, hooks, and caption variants for any niche.",
    accent: "from-pink-500/28 via-orange-500/12 to-transparent",
  },
  {
    id: "mock-5",
    title: "Business Plan Outline Generator",
    category: "Business",
    aiTool: "Claude",
    difficulty: "Intermediate",
    visibility: "Premium",
    rating: 4.8,
    copyCount: 7100,
    author: "James Wilson",
    description: "Build a clear business plan outline with sections, prompts, and action items for founders.",
    accent: "from-amber-500/28 via-orange-500/12 to-transparent",
  },
  {
    id: "mock-6",
    title: "Daily Planner & To-Do Generator",
    category: "Productivity",
    aiTool: "ChatGPT",
    difficulty: "Beginner",
    visibility: "Public",
    rating: 4.7,
    copyCount: 5400,
    author: "Emma Johnson",
    description: "Create structured daily plans and to-do systems based on goals, priorities, and focus windows.",
    accent: "from-cyan-500/26 via-sky-500/12 to-transparent",
  },
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

function getPromptItems(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.prompts)) {
    return payload.prompts;
  }

  if (Array.isArray(payload?.result)) {
    return payload.result;
  }

  return [];
}

export function normalizePromptItem(item, index = 0) {
  const promptId = String(item?._id || item?.id || `prompt-${index}`);
  const category = item?.category?.name || item?.categoryName || item?.category || "General";
  const aiTool = item?.aiTool || item?.model || item?.tool || "ChatGPT";
  const difficulty = toTitleCase(item?.difficulty || item?.level || "Beginner");
  const visibilityRaw = item?.visibility || item?.access || item?.plan || "Public";
  const visibility = String(visibilityRaw).toLowerCase().includes("premium") ? "Premium" : "Public";
  const accentPalette = [
    "from-sky-500/30 via-cyan-500/12 to-transparent",
    "from-fuchsia-500/28 via-violet-500/12 to-transparent",
    "from-indigo-500/30 via-blue-500/10 to-transparent",
    "from-pink-500/28 via-orange-500/12 to-transparent",
    "from-amber-500/28 via-orange-500/12 to-transparent",
    "from-cyan-500/26 via-sky-500/12 to-transparent",
  ];

  return {
    id: promptId,
    _id: promptId,
    title: item?.title || item?.name || `Prompt ${index + 1}`,
    category: toTitleCase(category),
    aiTool: toTitleCase(aiTool),
    difficulty,
    visibility,
    rating: parseNumber(item?.rating || item?.averageRating || item?.score, 4.8),
    copyCount: parseNumber(item?.copyCount || item?.copies || item?.downloads, 0),
    author: item?.author?.name || item?.creator?.name || item?.creatorName || item?.authorName || "PromptFlow Creator",
    description:
      item?.description ||
      item?.summary ||
      item?.excerpt ||
      "High-quality prompt content preview from the PromptFlow marketplace.",
    accent: accentPalette[index % accentPalette.length],
  };
}

export function normalizePromptPayload(payload) {
  const items = getPromptItems(payload).map(normalizePromptItem);
  return items.length > 0 ? items : fallbackPrompts;
}

export function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

export function filterPrompts(prompts, filters) {
  const searchValue = filters.search.trim().toLowerCase();

  return prompts.filter((prompt) => {
    const matchesSearch =
      !searchValue ||
      [prompt.title, prompt.description, prompt.category, prompt.aiTool, prompt.author]
        .join(" ")
        .toLowerCase()
        .includes(searchValue);

    const matchesCategory =
      filters.category === marketplaceFilterOptions.category[0] || prompt.category === filters.category;

    const matchesDifficulty =
      filters.difficulty === marketplaceFilterOptions.difficulty[0] || prompt.difficulty === filters.difficulty;

    const matchesTool =
      filters.aiTool === marketplaceFilterOptions.aiTool[0] || prompt.aiTool === filters.aiTool;

    const matchesVisibility =
      filters.visibility === marketplaceFilterOptions.visibility[0] ||
      `${prompt.visibility} Prompts` === filters.visibility;

    return matchesSearch && matchesCategory && matchesDifficulty && matchesTool && matchesVisibility;
  });
}

export function sortPrompts(prompts, sortBy) {
  const nextPrompts = [...prompts];

  switch (sortBy) {
    case "Highest Rated":
      return nextPrompts.sort((left, right) => right.rating - left.rating);
    case "Most Copied":
      return nextPrompts.sort((left, right) => right.copyCount - left.copyCount);
    case "Newest":
      return nextPrompts.reverse();
    case "Most Popular":
    default:
      return nextPrompts.sort((left, right) => right.rating * right.copyCount - left.rating * left.copyCount);
  }
}

export function getPaginatedPrompts(prompts, page, pageSize) {
  const startIndex = (page - 1) * pageSize;
  return prompts.slice(startIndex, startIndex + pageSize);
}

export const defaultMarketplaceFilters = {
  search: "",
  category: marketplaceFilterOptions.category[0],
  difficulty: marketplaceFilterOptions.difficulty[0],
  aiTool: marketplaceFilterOptions.aiTool[0],
  visibility: marketplaceFilterOptions.visibility[0],
  sortBy: marketplaceFilterOptions.sortBy[0],
};
