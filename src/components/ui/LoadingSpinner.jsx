"use client";

import clsx from "clsx";

export default function LoadingSpinner({ className, label = "Loading" }) {
  return (
    <div className={clsx("flex items-center justify-center gap-3 text-muted", className)} role="status">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse-soft" />
        <span className="h-2.5 w-2.5 rounded-full bg-secondary animate-pulse-soft [animation-delay:0.15s]" />
        <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse-soft [animation-delay:0.3s]" />
      </div>
      {label ? <span className="text-body-xs font-medium uppercase tracking-[0.18em]">{label}</span> : null}
    </div>
  );
}
