"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import clsx from "clsx";

import NotificationBell from "@/components/notifications/NotificationBell";
import Button from "@/components/ui/Button";
import UserAvatar from "@/components/ui/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { getPostAuthRedirect } from "@/lib/auth";
import PageContainer from "@/components/shared/PageContainer";
import { authNavLinks, primaryNavLinks } from "@/lib/navigation";

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
  const { isAuthenticated, user } = useAuth();
  const dashboardHref = getPostAuthRedirect(user);

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

        {isAuthenticated ? (
          <div className="hidden items-center gap-3 md:flex">
            <NotificationBell />
            <Button as={Link} href={dashboardHref} size="sm" variant="secondary">
              Dashboard
            </Button>
            <Link
              className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/6 px-3 py-2"
              href={dashboardHref}
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
              <div className="text-left">
                <p className="text-body-sm font-semibold text-foreground">{user?.name || "PromptFlow User"}</p>
                <p className="text-body-xs text-muted">{user?.role || "User"}</p>
              </div>
            </Link>
          </div>
        ) : (
          <div className="hidden items-center gap-3 md:flex">
            <Button as={Link} href={authNavLinks[0].href} size="sm" variant="secondary">
              {authNavLinks[0].label}
            </Button>
            <Button as={Link} href={authNavLinks[1].href} size="sm">
              {authNavLinks[1].label}
            </Button>
          </div>
        )}
      </PageContainer>
    </header>
  );
}
