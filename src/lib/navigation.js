import {
  ClipboardList,
  Grid2x2,
  Heart,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageSquare,
  PlusSquare,
  Shield,
  Sparkles,
  UserRound,
  UserRoundPlus,
  WalletCards,
} from "lucide-react";

export const primaryNavLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/prompts", label: "All Prompts", icon: Sparkles },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/login", label: "Login", icon: LogIn },
  { href: "/register", label: "Register", icon: UserRoundPlus },
];

export const dashboardNavLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Grid2x2 },
  { href: "/dashboard?tab=my-prompts", label: "My Prompts", icon: ClipboardList },
  { href: "/dashboard?tab=add-prompt", label: "Add Prompt", icon: PlusSquare },
  { href: "/dashboard?tab=saved-prompts", label: "Saved Prompts", icon: Heart },
  { href: "/dashboard?tab=reviews", label: "Reviews", icon: MessageSquare },
  { href: "/dashboard?tab=profile", label: "Profile", icon: UserRound },
  { href: "/admin", label: "Admin", icon: Shield },
  { href: "/login", label: "Logout", icon: LogOut },
];

export const mobileDashboardNavLinks = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/prompts", label: "Prompts", icon: Sparkles },
  { href: "/dashboard?tab=add-prompt", label: "Create", icon: PlusSquare },
  { href: "/dashboard?tab=saved-prompts", label: "Saved", icon: Heart },
  { href: "/dashboard?tab=profile", label: "Profile", icon: WalletCards },
];
