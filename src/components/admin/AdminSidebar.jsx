"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, LogOut } from "lucide-react";
import clsx from "clsx";

import Button from "@/components/ui/Button";
import UserAvatar from "@/components/ui/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { adminNavLinks } from "@/lib/navigation";
import { toastError, toastSuccess } from "@/lib/toast";

function isAdminRouteActive(pathname, href) {
  if (!href) {
    return false;
  }

  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebar({ onNavigate }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await signOut();
      toastSuccess("Logged out successfully");
      router.replace("/login");
      onNavigate?.();
    } catch (error) {
      toastError(error.message || "Unable to log out right now.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <aside className="flex h-full flex-col rounded-[28px] bg-[linear-gradient(180deg,#081224_0%,#0c1932_52%,#111827_100%)] p-5 text-white shadow-[0_24px_70px_rgba(2,6,23,0.45)]">
      <Link className="mb-8 inline-flex items-center gap-3" href="/">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xl font-semibold tracking-tight">PromptFlow</p>
          <p className="text-xs uppercase tracking-[0.24em] text-white/60">Admin Panel</p>
        </div>
      </Link>

      <nav className="space-y-2">
        {adminNavLinks.map(({ action, disabled, href, icon: Icon, label }) => {
          if (action === "logout") {
            return (
              <button
                key={action}
                className="flex min-h-[52px] w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-rose-300 transition hover:bg-rose-500/10"
                onClick={handleLogout}
                type="button"
              >
                {isLoggingOut ? <LogOut className="h-4 w-4 animate-pulse" /> : <Icon className="h-4 w-4" />}
                <span>{label}</span>
              </button>
            );
          }

          const isActive = isAdminRouteActive(pathname, href);
          const baseClass = clsx(
            "flex min-h-[52px] items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
            isActive
              ? "bg-brand-gradient text-white shadow-[0_16px_40px_rgba(99,102,241,0.28)]"
              : "text-white/72 hover:bg-white/8 hover:text-white",
            disabled ? "cursor-default opacity-70" : "",
          );

          if (disabled) {
            return (
              <div key={`${label}-${href}`} className={baseClass}>
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </div>
            );
          }

          return (
            <Link
              key={href}
              className={baseClass}
              href={href}
              onClick={onNavigate}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4 pt-6">
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <UserAvatar
              alt={user?.name || "Admin User"}
              className="h-12 w-12 bg-brand-gradient text-sm text-white"
              fallback={(user?.name || "Admin User")
                .split(" ")
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase()}
              src={user?.image || user?.picture || user?.photoURL || user?.avatar || user?.photo}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.name || "Admin User"}</p>
              <p className="truncate text-xs text-white/60">{user?.email || "admin@promptflow.com"}</p>
            </div>
          </div>
        </div>

        <Button className="w-full justify-center" onPress={handleLogout} variant="danger">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
