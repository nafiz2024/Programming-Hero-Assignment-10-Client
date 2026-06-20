"use client";

import { ChevronDown } from "lucide-react";
import clsx from "clsx";

export default function SelectField({
  className,
  label,
  onChange,
  options = [],
  value,
}) {
  return (
    <label className={clsx("flex min-w-0 flex-col gap-2", className)}>
      {label ? <span className="text-body-xs font-medium text-muted">{label}</span> : null}
      <div className="relative">
        <select
          className="w-full appearance-none rounded-pill border border-white/10 bg-white/5 px-4 py-3 pr-10 text-body-sm text-foreground outline-none transition duration-300 focus:border-primary/60 focus:bg-white/8 focus:shadow-glow"
          onChange={onChange}
          value={value}
        >
          {options.map((option) => (
            <option key={option} className="bg-background-alt text-foreground" value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      </div>
    </label>
  );
}
