"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import clsx from "clsx";

import Button from "@/components/ui/Button";
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

        <div className="hidden items-center gap-3 md:flex">
          <Button as={Link} href={authNavLinks[0].href} size="sm" variant="secondary">
            {authNavLinks[0].label}
          </Button>
          <Button as={Link} href={authNavLinks[1].href} size="sm">
            {authNavLinks[1].label}
          </Button>
        </div>
      </PageContainer>
    </header>
  );
}
