"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, MoonStar, Plus, Search } from "lucide-react";

import BottomNavigation from "@/components/layout/BottomNavigation";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import NotificationBell from "@/components/notifications/NotificationBell";
import FadeIn from "@/components/shared/FadeIn";
import Button from "@/components/ui/Button";
import ResponsiveDrawer from "@/components/ui/ResponsiveDrawer";
import UserAvatar from "@/components/ui/UserAvatar";
import { useDashboard } from "@/hooks/useDashboard";
import { mobileCreatorNavLinks, mobileDashboardNavLinks } from "@/lib/navigation";

export default function DashboardShell({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useDashboard();
  const isCreatorArea = pathname.startsWith("/creator");
  const isUserPromptArea = pathname.startsWith("/dashboard/prompts");
  const mobileLinks = isCreatorArea ? mobileCreatorNavLinks : mobileDashboardNavLinks;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08),transparent_24%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.08),transparent_20%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] pb-24 md:pb-0">
      <div className="mx-auto flex min-h-screen w-full max-w-[1560px] gap-6 px-4 py-4 sm:px-5 md:px-6 desktop:px-8">
        <div className="hidden w-[280px] shrink-0 desktop:block">
          <div className="sticky top-4 h-[calc(100vh-32px)]">
            <DashboardSidebar />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <header className="mb-6 rounded-[28px] border border-slate-200/80 bg-white/88 px-4 py-4 shadow-[0_25px_70px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:px-5">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                aria-label="Open navigation"
                className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 desktop:hidden"
                onPress={() => setIsSidebarOpen(true)}
                variant="secondary"
              >
                <Menu className="h-4 w-4" />
              </Button>

              <div className="min-w-0 flex-1">
                <div className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
                  <Search className="h-4 w-4 shrink-0 text-slate-400" />
                  <input
                    className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    placeholder="Search prompts, tools or tags..."
                    type="text"
                  />
                  <span className="hidden rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-400 sm:inline-flex">
                    ⌘ K
                  </span>
                </div>
              </div>

              <NotificationBell className="hidden md:block" />
              <button
                className="hidden h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 md:inline-flex"
                type="button"
              >
                <MoonStar className="h-4 w-4" />
              </button>

              {isCreatorArea ? (
                <Button as={Link} className="hidden md:inline-flex" href="/creator/prompts/new">
                  <Plus className="h-4 w-4" />
                  Add New Prompt
                </Button>
              ) : isUserPromptArea ? (
                <Button as={Link} className="hidden md:inline-flex" href="/dashboard/prompts/new">
                  <Plus className="h-4 w-4" />
                  Add New Prompt
                </Button>
              ) : null}

              <Link
                className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm"
                href="/dashboard/profile"
              >
                <UserAvatar
                  alt={user?.name || "PromptFlow User"}
                  className="h-10 w-10 bg-brand-gradient text-xs text-white"
                  fallback={user?.initials || "PF"}
                  src={user?.image || user?.picture || user?.photoURL || user?.avatar || user?.photo}
                />
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-slate-900">{user?.name || "PromptFlow User"}</p>
                  <p className="text-xs text-slate-500">{user?.role || "User"}</p>
                </div>
              </Link>
            </div>
          </header>

          <main>
            <FadeIn>{children}</FadeIn>
          </main>
        </div>
      </div>

      <ResponsiveDrawer isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} title="Dashboard Navigation">
        <DashboardSidebar onNavigate={() => setIsSidebarOpen(false)} />
      </ResponsiveDrawer>

      <BottomNavigation links={mobileLinks} />
    </div>
  );
}
