"use client";

import { ChevronRight } from "lucide-react";

export default function DashboardPageHeader({ title, description, crumbs = [] }) {
  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        {crumbs.map((crumb, index) => (
          <div key={`${crumb}-${index}`} className="inline-flex items-center gap-2">
            {index > 0 ? <ChevronRight className="h-3.5 w-3.5 text-slate-300" /> : null}
            <span className={index === crumbs.length - 1 ? "font-medium text-slate-900" : ""}>{crumb}</span>
          </div>
        ))}
      </div>
      <div>
        <h1 className="text-[2rem] font-semibold tracking-[-0.04em] text-slate-950 md:text-[2.35rem]">{title}</h1>
        {description ? <p className="mt-2 text-base text-slate-500 md:text-lg">{description}</p> : null}
      </div>
    </div>
  );
}

