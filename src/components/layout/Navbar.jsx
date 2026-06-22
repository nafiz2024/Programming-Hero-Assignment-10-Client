"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, LayoutDashboard, LogOut, Sparkles, UserRound } from "lucide-react";
import clsx from "clsx";

import NotificationBell from "@/components/notifications/NotificationBell";
import Button from "@/components/ui/Button";
import UserAvatar from "@/components/ui/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { getPostAuthRedirect, normalizeRole } from "@/lib/auth";
import { motionPresets } from "@/lib/motion";
import PageContainer from "@/components/shared/PageContainer";
import { authNavLinks, primaryNavLinks } from "@/lib/navigation";
import { toastError, toastSuccess } from "@/lib/toast";

function isActiveLink(pathname, href) {
  if (href.startsWith("/#")) {
    return pathname === "/";
  }

  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading, signOut, user } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const profileMenuRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const userRole = normalizeRole(user?.role);
  const dashboardHref = getPostAuthRedirect(user);
  const profileHref = userRole === "admin" ? "/admin" : "/dashboard/profile";
  const hasUser = Boolean(user?.id || user?.email);
  const isAuthResolved = mounted && !loading;
  const showAuthenticatedActions = isAuthResolved && (hasUser || isAuthenticated);
  const showGuestActions = isAuthResolved && !showAuthenticatedActions;
  const dropdownPreset = shouldReduceMotion ? motionPresets.reduced : motionPresets.dropdownScale;

  useEffect(() => {
    function handlePointerDown(event) {
      if (!profileMenuRef.current?.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await signOut();
      setIsProfileMenuOpen(false);
      toastSuccess("Logged out successfully");
      router.replace("/");
    } catch (error) {
      toastError(error.message || "Unable to log out right now.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/72 backdrop-blur-xl">
      <PageContainer
        as="div"
        className="flex items-center justify-between gap-4 py-4"
        size="xl"
      >
        <Link className="flex items-center gap-3" href="/">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-gradient text-sm font-semibold text-white shadow-glow">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-body font-semibold tracking-tight text-foreground">PromptFlow</p>
            <p className="text-body-xs uppercase tracking-[0.24em] text-primary">Premium Client</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {primaryNavLinks.map(({ href, label }) => {
            const isActive = isActiveLink(pathname, href);

            return (
              <Link
                key={href}
                className={clsx(
                  "rounded-pill px-4 py-2.5 text-body-sm font-medium transition duration-300",
                  isActive
                    ? "bg-primary/18 text-primary shadow-glow"
                    : "text-muted hover:bg-white/8 hover:text-foreground",
                )}
                href={href}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {showAuthenticatedActions ? (
            <>
              <NotificationBell />
              <Button as={Link} className="hidden md:inline-flex" href={dashboardHref} size="sm" variant="secondary">
                Dashboard
              </Button>

              <div className="relative" ref={profileMenuRef}>
                <button
                  aria-expanded={isProfileMenuOpen}
                  aria-label="Open profile menu"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-2.5 py-2 text-left transition hover:bg-white/10 sm:gap-3 sm:px-3"
                  onClick={() => {
                    if (pathname) {
                      setIsProfileMenuOpen((currentValue) => !currentValue);
                    }
                  }}
                  type="button"
                >
                  <UserAvatar
                    alt={user?.name || "PromptFlow User"}
                    className="h-9 w-9 bg-brand-gradient text-xs text-white"
                    fallback={(user?.name || "PF")
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")
                      .toUpperCase()}
                    src={user?.image || user?.picture || user?.photoURL || user?.avatar || user?.photo}
                  />
                  <div className="hidden text-left sm:block">
                    <p className="text-body-sm font-semibold text-foreground">{user?.name || "PromptFlow User"}</p>
                    <p className="text-body-xs text-muted">{user?.role || "User"}</p>
                  </div>
                  <ChevronDown className="hidden h-4 w-4 text-muted sm:block" />
                </button>

                <AnimatePresence>
                  {isProfileMenuOpen ? (
                  <motion.div
                    animate="visible"
                    className="absolute right-0 top-[calc(100%+12px)] z-[85] min-w-[220px] rounded-[24px] border border-slate-200 bg-white p-2 shadow-[0_28px_80px_rgba(15,23,42,0.16)]"
                    exit="exit"
                    initial="hidden"
                    transition={dropdownPreset.transition}
                    variants={dropdownPreset.variants}
                  >
                    <Link
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      href={dashboardHref}
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4 text-primary" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      href={profileHref}
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <UserRound className="h-4 w-4 text-primary" />
                      <span>Profile</span>
                    </Link>
                    <button
                      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-rose-500 transition hover:bg-rose-50"
                      onClick={handleLogout}
                      type="button"
                    >
                      <LogOut className={clsx("h-4 w-4", isLoggingOut ? "animate-pulse" : "")} />
                      <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                    </button>
                  </motion.div>
                ) : null}
                </AnimatePresence>
              </div>
            </>
          ) : showGuestActions ? (
            <>
              <Button as={Link} className="md:hidden" href={authNavLinks[0].href} size="sm" variant="secondary">
                {authNavLinks[0].label}
              </Button>
              <div className="hidden items-center gap-3 md:flex">
                <Button as={Link} href={authNavLinks[0].href} size="sm" variant="secondary">
                  {authNavLinks[0].label}
                </Button>
                <Button as={Link} href={authNavLinks[1].href} size="sm">
                  {authNavLinks[1].label}
                </Button>
              </div>
            </>
          ) : (
            <div className="h-11 w-[140px] rounded-full border border-white/8 bg-white/[0.04] sm:w-[180px]" />
          )}
        </div>
      </PageContainer>
    </header>
  );
}
