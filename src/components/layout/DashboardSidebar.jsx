"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Crown, LogOut, Sparkles } from "lucide-react";
import clsx from "clsx";

import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { dashboardNavLinks } from "@/lib/navigation";
import { toastError, toastSuccess } from "@/lib/toast";

export default function DashboardSidebar({ onNavigate }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useDashboard();
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
    <aside className="flex h-full flex-col rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_25px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <Link className="mb-8 inline-flex items-center gap-3" href="/">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xl font-semibold tracking-tight text-slate-950">PromptFlow</p>
          <p className="text-xs uppercase tracking-[0.24em] text-primary">User Workspace</p>
        </div>
      </Link>

      <nav className="space-y-2">
        {dashboardNavLinks.map(({ action, href, icon: Icon, label }) => {
          if (action === "logout") {
            return (
              <button
                key={action}
                className="flex min-h-[52px] w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-rose-500 transition hover:bg-rose-50"
                onClick={handleLogout}
                type="button"
              >
                {isLoggingOut ? <LogOut className="h-4 w-4 animate-pulse" /> : <Icon className="h-4 w-4" />}
                <span>{label}</span>
              </button>
            );
          }

          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              className={clsx(
                "flex min-h-[52px] items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                isActive
                  ? "bg-brand-gradient text-white shadow-[0_16px_40px_rgba(99,102,241,0.28)]"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              )}
              href={href}
              onClick={onNavigate}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="rounded-[24px] bg-[linear-gradient(135deg,rgba(99,102,241,0.96),rgba(139,92,246,0.92),rgba(56,189,248,0.88))] p-5 text-white shadow-[0_20px_60px_rgba(99,102,241,0.25)]">
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/16">
            <Crown className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold">Unlock Every Premium Prompt</h3>
          <p className="mt-2 text-sm leading-6 text-white/80">
            Get unlimited access to all premium prompts and advanced creator tools.
          </p>
          <Button
            className="mt-5 w-full border-0 bg-white text-slate-950 hover:bg-white/90"
            onPress={() => toastSuccess("Premium upgrade flow will be connected later.")}
            variant="secondary"
          >
            Upgrade Now
          </Button>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-gradient text-sm font-semibold text-white">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={user.name} className="h-full w-full rounded-full object-cover" src={user.image} />
              ) : (
                user?.initials || "PF"
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">{user?.name || "PromptFlow User"}</p>
              <p className="text-xs text-slate-500">{user?.subscription || "Free"} plan</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

