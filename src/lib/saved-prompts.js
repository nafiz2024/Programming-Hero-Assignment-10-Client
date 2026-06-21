import { normalizePromptPayload } from "@/lib/marketplace";

const thumbnailPalette = [
  "from-[#1e3a8a] via-[#2563eb] to-[#16b8a6]",
  "from-[#625BF6] via-[#7c3aed] to-[#16B8A6]",
  "from-[#111827] via-[#1f2937] to-[#374151]",
  "from-[#7c2d12] via-[#c2410c] to-[#FFB547]",
  "from-[#0f766e] via-[#14b8a6] to-[#5eead4]",
  "from-[#312e81] via-[#625BF6] to-[#60a5fa]",
];

export const savedPromptSortOptions = [
  "Recently Saved",
  "Most Popular",
  "Highest Rated",
];

export const mockSavedPrompts = [
  {
    id: "saved-mock-1",
    bookmarkId: "saved-bookmark-1",
    title: "SEO Blog Post Generator",
    aiTool: "ChatGPT",
    category: "Writing",
    author: "Jane Cooper",
    savedAt: "2024-05-30T10:15:00.000Z",
    rating: 4.8,
    copyCount: 2300,
    accent: thumbnailPalette[0],
  },
  {
    id: "saved-mock-2",
    bookmarkId: "saved-bookmark-2",
    title: "Midjourney Landscape Prompt",
    aiTool: "Midjourney",
    category: "Design",
    author: "Michael Brown",
    savedAt: "2024-05-29T09:30:00.000Z",
    rating: 4.9,
    copyCount: 1800,
    accent: thumbnailPalette[1],
  },
  {
    id: "saved-mock-3",
    bookmarkId: "saved-bookmark-3",
    title: "Python Function Docstring Writer",
    aiTool: "ChatGPT",
    category: "Development",
    author: "Sarah Wilson",
    savedAt: "2024-05-28T13:00:00.000Z",
    rating: 4.7,
    copyCount: 1200,
    accent: thumbnailPalette[2],
  },
  {
    id: "saved-mock-4",
    bookmarkId: "saved-bookmark-4",
    title: "Cold Email Template Generator",
    aiTool: "ChatGPT",
    category: "Marketing",
    author: "Alex Morgan",
    savedAt: "2024-05-27T08:45:00.000Z",
    rating: 4.8,
    copyCount: 990,
    accent: thumbnailPalette[3],
  },
  {
    id: "saved-mock-5",
    bookmarkId: "saved-bookmark-5",
    title: "Social Media Post Ideas",
    aiTool: "ChatGPT",
    category: "Marketing",
    author: "Olivia Martinez",
    savedAt: "2024-05-26T15:20:00.000Z",
    rating: 4.6,
    copyCount: 840,
    accent: thumbnailPalette[4],
  },
  {
    id: "saved-mock-6",
    bookmarkId: "saved-bookmark-6",
    title: "Linux Command Explainer",
    aiTool: "ChatGPT",
    category: "Development",
    author: "Daniel Thomas",
    savedAt: "2024-05-25T12:10:00.000Z",
    rating: 4.7,
    copyCount: 760,
    accent: thumbnailPalette[2],
  },
  {
    id: "saved-mock-7",
    bookmarkId: "saved-bookmark-7",
    title: "Product Description Generator",
    aiTool: "ChatGPT",
    category: "Business",
    author: "Emma Davis",
    savedAt: "2024-05-24T11:25:00.000Z",
    rating: 4.8,
    copyCount: 910,
    accent: thumbnailPalette[5],
  },
  {
    id: "saved-mock-8",
    bookmarkId: "saved-bookmark-8",
    title: "Cover Letter Generator",
    aiTool: "ChatGPT",
    category: "Writing",
    author: "James Anderson",
    savedAt: "2024-05-23T16:40:00.000Z",
    rating: 4.5,
    copyCount: 680,
    accent: thumbnailPalette[0],
  },
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

function createFallbackSavedPrompt(prompt, index) {
  return {
    ...prompt,
    bookmarkId: `mock-bookmark-${index + 1}`,
    savedAt: new Date(Date.now() - index * 86400000).toISOString(),
    accent: prompt.accent || thumbnailPalette[index % thumbnailPalette.length],
  };
}

export function createSavedPromptFallbacks(promptCatalog = []) {
  const prompts = Array.isArray(promptCatalog) && promptCatalog.length > 0
    ? promptCatalog.slice(0, 8)
    : normalizePromptPayload([]).slice(0, 8);

  return prompts.map(createFallbackSavedPrompt);
}

export function normalizeSavedPrompts(payload, promptCatalog = []) {
  const bookmarks = Array.isArray(payload?.bookmarks)
    ? payload.bookmarks
    : Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
    ? payload
    : [];

  return bookmarks
    .map((bookmark, index) => {
      const promptId = bookmark?.promptId || bookmark?._id || bookmark?.id;
      const promptSource =
        bookmark?.prompt ||
        promptCatalog.find((prompt) => prompt.id === promptId || prompt._id === promptId);

      if (!promptSource) {
        return null;
      }

      const prompt = normalizePromptPayload({ prompts: [promptSource] })[0];
      const visibility = bookmark?.visibility || promptSource?.visibility || prompt.visibility || "Public";

      return {
        ...prompt,
        id: prompt.id || promptId || `saved-prompt-${index + 1}`,
        bookmarkId: bookmark?._id || bookmark?.id || `bookmark-${index + 1}`,
        title: prompt.title || promptSource?.title || `Saved Prompt ${index + 1}`,
        category: toTitleCase(prompt.category || promptSource?.category?.name || promptSource?.category || "General"),
        aiTool: toTitleCase(prompt.aiTool || promptSource?.aiTool || promptSource?.tool || "ChatGPT"),
        author:
          prompt.author ||
          promptSource?.creator?.name ||
          promptSource?.author?.name ||
          promptSource?.creatorName ||
          "PromptFlow Creator",
        savedAt: bookmark?.createdAt || bookmark?.savedAt || bookmark?.updatedAt || promptSource?.createdAt,
        rating: parseNumber(bookmark?.rating || prompt.rating || promptSource?.averageRating, 4.8),
        copyCount: parseNumber(bookmark?.copyCount || prompt.copyCount || promptSource?.copies, 0),
        visibility: String(visibility).toLowerCase().includes("private") ? "Private" : "Public",
        thumbnailUrl:
          bookmark?.thumbnail ||
          promptSource?.thumbnail ||
          promptSource?.thumbnailUrl ||
          promptSource?.image ||
          promptSource?.coverImage ||
          "",
        accent: prompt.accent || thumbnailPalette[index % thumbnailPalette.length],
      };
    })
    .filter(Boolean);
}

export function filterSavedPrompts(prompts, searchValue) {
  const query = searchValue.trim().toLowerCase();

  if (!query) {
    return prompts;
  }

  return prompts.filter((prompt) =>
    [prompt.title, prompt.aiTool, prompt.author, prompt.category]
      .join(" ")
      .toLowerCase()
      .includes(query),
  );
}

export function sortSavedPrompts(prompts, sortBy) {
  const nextPrompts = [...prompts];

  switch (sortBy) {
    case "Highest Rated":
      return nextPrompts.sort((left, right) => right.rating - left.rating);
    case "Most Popular":
      return nextPrompts.sort((left, right) => right.copyCount - left.copyCount);
    case "Recently Saved":
    default:
      return nextPrompts.sort(
        (left, right) => new Date(right.savedAt || 0).getTime() - new Date(left.savedAt || 0).getTime(),
      );
  }
}

export function paginateSavedPrompts(prompts, page, pageSize) {
  const startIndex = (page - 1) * pageSize;
  return prompts.slice(startIndex, startIndex + pageSize);
}
