"use client";

import { useState } from "react";
import { Menu, CalendarDays, ChevronDown } from "lucide-react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import NotificationBell from "@/components/notifications/NotificationBell";
import FadeIn from "@/components/shared/FadeIn";
import ResponsiveDrawer from "@/components/ui/ResponsiveDrawer";
import UserAvatar from "@/components/ui/UserAvatar";
import { useAuth } from "@/hooks/useAuth";

export default function AdminShell({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const todayLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-6 px-4 py-4 sm:px-5 md:px-6 desktop:px-8">
        <div className="hidden w-[272px] shrink-0 desktop:block">
          <div className="sticky top-4 h-[calc(100vh-32px)]">
            <AdminSidebar />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <header className="relative z-20 mb-6 flex flex-col gap-4 overflow-visible rounded-[28px] border border-slate-200 bg-white px-4 py-4 shadow-[0_25px_70px_rgba(15,23,42,0.08)] sm:px-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <button
                aria-label="Open admin navigation"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 desktop:hidden"
                onClick={() => setIsSidebarOpen(true)}
                type="button"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                <p className="text-[1.9rem] font-semibold tracking-[-0.04em] text-slate-950 md:text-[2.35rem]">
                  Admin Dashboard
                </p>
                <p className="mt-1 text-sm text-slate-500 md:text-base">
                  Welcome back, Super Admin. Here&apos;s what&apos;s happening on your platform.
                </p>
              </div>
            </div>

            <div className="flex w-full flex-wrap items-center justify-end gap-3 lg:w-auto lg:flex-nowrap">
              <NotificationBell className="shrink-0" />
              <div className="inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700">
                <CalendarDays className="h-4 w-4 text-slate-400" />
                <span>{todayLabel}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>
              <div className="inline-flex h-11 min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 shadow-sm">
                <span className="hidden text-sm font-medium text-slate-700 sm:inline-flex">
                  Hello, Super Admin
                </span>
                <UserAvatar
                  alt={user?.name || "Admin User"}
                  className="h-10 w-10 bg-brand-gradient text-xs text-white"
                  fallback={(user?.name || "Admin User")
                    .split(" ")
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase()}
                  src={user?.image || user?.picture || user?.photoURL || user?.avatar || user?.photo}
                />
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </header>

          <main>
            <FadeIn>{children}</FadeIn>
          </main>
        </div>
      </div>

      <ResponsiveDrawer isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} title="Admin Navigation">
        <AdminSidebar onNavigate={() => setIsSidebarOpen(false)} />
      </ResponsiveDrawer>
    </div>
  );
}
