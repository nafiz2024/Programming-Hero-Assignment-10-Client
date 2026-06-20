"use client";

import { Search } from "lucide-react";
import clsx from "clsx";

export default function Input({
  className,
  inputClassName,
  showSearchIcon = false,
  startContent,
  ...props
}) {
  return (
    <div
      className={clsx(
        "flex min-h-[48px] w-full items-center gap-3 rounded-pill border border-white/10 bg-white/5 px-4 text-foreground transition duration-300 focus-within:border-primary/60 focus-within:bg-white/8 focus-within:shadow-glow",
        className,
      )}
    >
      {startContent || (showSearchIcon ? <Search className="h-4 w-4 shrink-0 text-muted" /> : null)}
      <input
        className={clsx(
          "w-full border-none bg-transparent text-body-sm text-foreground outline-none placeholder:text-muted",
          inputClassName,
        )}
        {...props}
      />
    </div>
  );
}
