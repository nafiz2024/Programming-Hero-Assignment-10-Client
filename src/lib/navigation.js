import {
  Grid2x2,
  Heart,
  Home,
  LayoutDashboard,
  Layers3,
  LogIn,
  LogOut,
  MessageSquare,
  Sparkles,
  UserRound,
  UserRoundPlus,
  Bookmark,
  FileText,
  PlusSquare,
} from "lucide-react";

export const primaryNavLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/prompts", label: "All Prompts", icon: Sparkles },
  { href: "/#categories", label: "Explore Categories", icon: Layers3 },
  { href: "/#creators", label: "Top Creators", icon: UserRound },
];

export const authNavLinks = [
  { href: "/login", label: "Login", icon: LogIn },
  { href: "/register", label: "Create Account", icon: UserRoundPlus },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export const dashboardNavLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Grid2x2 },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
  { href: "/dashboard/saved", label: "Saved Prompts", icon: Heart },
  { href: "/dashboard/reviews", label: "My Reviews", icon: MessageSquare },
  { action: "logout", label: "Logout", icon: LogOut },
];

export const mobileDashboardNavLinks = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/saved", label: "Saved", icon: Bookmark },
  { href: "/dashboard/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
];

export const creatorDashboardNavLinks = [
  { href: "/creator", label: "Creator Dashboard", icon: LayoutDashboard },
  { href: "/creator/prompts", label: "My Prompts", icon: FileText },
  { href: "/creator/prompts/new", label: "Add New Prompt", icon: PlusSquare },
  { href: "/dashboard/profile", label: "Profile Settings", icon: UserRound },
  { action: "logout", label: "Logout", icon: LogOut },
];

export const mobileCreatorNavLinks = [
  { href: "/creator", label: "Home", icon: Home },
  { href: "/creator/prompts", label: "Prompts", icon: FileText },
  { href: "/creator/prompts/new", label: "Create", icon: PlusSquare },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
];
