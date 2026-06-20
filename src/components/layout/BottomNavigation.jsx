"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function BottomNavigation({ links }) {
  const pathname = usePathname();

  return (
    <nav className="pf-card pf-safe-bottom fixed inset-x-4 bottom-4 z-40 rounded-xl px-3 py-2 md:hidden">
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${Math.max(links.length, 1)}, minmax(0, 1fr))` }}
      >
        {links.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

          return (
            <Link
              key={href}
              className={clsx(
                "flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition",
                isActive ? "bg-primary/16 text-primary" : "text-muted hover:bg-white/6 hover:text-foreground",
              )}
              href={href}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
