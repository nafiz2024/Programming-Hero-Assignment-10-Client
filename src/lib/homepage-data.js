import {
  ArrowUpRight,
  BookOpenText,
  BriefcaseBusiness,
  Code2,
  GraduationCap,
  Layers3,
  Lightbulb,
  MessageSquareHeart,
  PenSquare,
  Rocket,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

export const heroChips = ["ChatGPT", "Midjourney", "Coding", "SEO", "Productivity"];

export const toolIcons = [
  { label: "ChatGPT", icon: Sparkles },
  { label: "Gemini", icon: Lightbulb },
  { label: "Claude", icon: BookOpenText },
  { label: "Midjourney", icon: PenSquare },
  { label: "Copilot", icon: Code2 },
];

export const featuredStats = [
  { label: "Total Prompts", value: "24.5K", note: "Curated across top AI workflows", icon: Sparkles },
  { label: "Active Users", value: "12.6K", note: "Building faster every week", icon: Users },
  { label: "Premium Creators", value: "980+", note: "Verified specialists and studios", icon: Rocket },
  { label: "Categories", value: "45", note: "From SEO to product strategy", icon: Layers3 },
];

export const featuredCategories = [
  {
    title: "Marketing",
    description: "Ads, landing pages, email sequences, and campaign strategy prompts.",
    icon: Target,
    count: "4.8K prompts",
    tone: "from-fuchsia-500/20 to-violet-500/5",
  },
  {
    title: "Coding",
    description: "Frontend, backend, debugging, documentation, and code review helpers.",
    icon: Code2,
    count: "5.2K prompts",
    tone: "from-sky-500/20 to-blue-500/5",
  },
  {
    title: "Writing",
    description: "Blog outlines, brand voice systems, scripts, and editorial workflows.",
    icon: PenSquare,
    count: "3.9K prompts",
    tone: "from-emerald-500/18 to-teal-500/5",
  },
  {
    title: "Business",
    description: "Strategy decks, client proposals, onboarding docs, and operations prompts.",
    icon: BriefcaseBusiness,
    count: "2.6K prompts",
    tone: "from-amber-500/18 to-orange-500/5",
  },
  {
    title: "Education",
    description: "Lesson plans, study aids, curriculum design, and classroom automation.",
    icon: GraduationCap,
    count: "1.7K prompts",
    tone: "from-indigo-500/20 to-violet-500/5",
  },
];

export const featuredPrompts = [
  {
    category: "Marketing",
    title: "AI Ad Framework Copy Generator",
    description: "Generate high-converting ad copy angles for SaaS launches and product campaigns.",
    model: "ChatGPT",
    rating: "4.8",
    copies: "2.3K",
    author: "Alex Morgan",
    accent: "from-fuchsia-500/30 via-violet-500/10 to-transparent",
  },
  {
    category: "Design",
    title: "Modern SaaS Landing Page UI",
    description: "Create premium section ideas, hierarchy, and UI direction for polished web apps.",
    model: "Midjourney",
    rating: "4.9",
    copies: "1.8K",
    author: "Sophia Lee",
    accent: "from-sky-500/30 via-indigo-500/10 to-transparent",
  },
  {
    category: "Development",
    title: "Python API Endpoint Generator",
    description: "Build typed endpoint scaffolds with validation, auth notes, and clean responses.",
    model: "Claude",
    rating: "4.7",
    copies: "1.5K",
    author: "David Kim",
    accent: "from-emerald-500/24 via-cyan-500/10 to-transparent",
  },
  {
    category: "Writing",
    title: "Cold Email That Gets Replies",
    description: "Personalized outbound messaging with better hooks, follow-ups, and CTA framing.",
    model: "Gemini",
    rating: "4.9",
    copies: "2.1K",
    author: "James Wilson",
    accent: "from-amber-500/24 via-orange-500/10 to-transparent",
  },
];

export const benefits = [
  {
    title: "Save Time",
    description: "Start from proven prompt systems instead of rebuilding workflows from scratch.",
    icon: Rocket,
  },
  {
    title: "Better Results",
    description: "Use tested prompt structures designed for clarity, quality, and consistency.",
    icon: Target,
  },
  {
    title: "Premium Library",
    description: "Access prompt packs built by specialists across design, writing, and coding.",
    icon: Layers3,
  },
  {
    title: "Community Driven",
    description: "Discover what power users are copying, saving, and refining right now.",
    icon: MessageSquareHeart,
  },
];

export const creatorHighlights = [
  "Monetize your best-performing prompt systems",
  "Grow your audience with verified creator visibility",
  "Share templates, workflows, and prompt bundles",
];

export const utilityLinks = [
  { href: "#categories", label: "Explore Categories" },
  { href: "#creators", label: "Top Creators" },
];

export const floatingMetrics = [
  { label: "Average Rating", value: "4.8" },
  { label: "Copies", value: "12.6K" },
];

export const heroPanelPrompts = [
  "Write a high-converting landing page for a SaaS product",
  "Create a detailed UX wireframe for a mobile banking app",
  "Write a Python function to analyze CSV data",
  "Generate SEO optimized blog outline for productivity tools",
];

export const heroPanelModels = ["ChatGPT", "Midjourney", "Claude", "Gemini"];

export const heroSectionStats = [
  { value: "500+", label: "Fresh prompts added weekly" },
  { value: "45", label: "Specialized AI categories" },
  { value: "3.5x", label: "Faster ideation for teams" },
];
