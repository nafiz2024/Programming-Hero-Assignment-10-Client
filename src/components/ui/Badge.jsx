"use client";

import { ShieldCheck } from "lucide-react";
import clsx from "clsx";

const toneClasses = {
  default: "border-white/10 bg-white/5 text-foreground",
  primary: "border-primary/30 bg-primary/10 text-primary",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  danger: "border-danger/30 bg-danger/10 text-danger",
};

export default function Badge({ children, className, color = "default", icon, ...props }) {
  const Icon = icon || ShieldCheck;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-pill border px-3 py-1.5 text-body-xs font-semibold",
        toneClasses[color] || toneClasses.default,
        className,
      )}
      {...props}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{children}</span>
    </span>
  );
}
