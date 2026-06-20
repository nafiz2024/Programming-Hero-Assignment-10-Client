"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import clsx from "clsx";

import { dashboardNavLinks } from "@/lib/navigation";

function isActiveSidebarLink(pathname, searchParams, href) {
  const [targetPath, targetQuery] = href.split("?");

  if (pathname !== targetPath) {
    return pathname.startsWith(`${targetPath}/`);
  }

  if (!targetQuery) {
    return !searchParams.get("tab");
  }

  const query = new URLSearchParams(targetQuery);
  return query.get("tab") === searchParams.get("tab");
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <aside className="pf-card h-full rounded-lg p-5">
      <div className="mb-6 border-b border-white/10 pb-5">
        <p className="text-body-xs font-semibold uppercase tracking-[0.24em] text-primary">Workspace</p>
        <h2 className="mt-2 text-h3">Dashboard Shell</h2>
        <p className="mt-2 text-body-sm text-muted">Responsive sidebar foundation with desktop, tablet drawer, and mobile nav behavior.</p>
      </div>

      <nav className="space-y-2">
        {dashboardNavLinks.map(({ href, label, icon: Icon }) => {
          const isActive = isActiveSidebarLink(pathname, searchParams, href);

          return (
            <Link
              key={href}
              className={clsx(
                "flex min-h-[48px] items-center gap-3 rounded-md px-4 py-3 text-body-sm font-medium transition duration-300",
                isActive
                  ? "bg-primary/18 text-primary shadow-glow"
                  : "text-muted hover:bg-white/8 hover:text-foreground",
              )}
              href={href}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
