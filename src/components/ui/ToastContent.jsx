"use client";

import { AlertTriangle, Check, CircleAlert, X } from "lucide-react";
import clsx from "clsx";

const toneConfig = {
  success: {
    icon: Check,
    accent: "bg-success",
    iconWrap: "bg-success text-background",
  },
  warning: {
    icon: AlertTriangle,
    accent: "bg-warning",
    iconWrap: "bg-warning text-background",
  },
  error: {
    icon: CircleAlert,
    accent: "bg-danger",
    iconWrap: "bg-danger text-background",
  },
};

export default function ToastContent({ message, onClose, title, tone = "success" }) {
  const config = toneConfig[tone] || toneConfig.success;
  const Icon = config.icon;

  return (
    <div className="pf-card relative flex w-[min(100vw-24px,360px)] items-center gap-3 overflow-hidden rounded-md p-3 pr-4">
      <span className={clsx("absolute inset-y-0 left-0 w-1 rounded-l-md", config.accent)} />
      <div className={clsx("ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full", config.iconWrap)}>
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <div className="min-w-0 flex-1">
        {title ? <p className="text-body-xs font-semibold uppercase tracking-[0.18em] text-muted">{title}</p> : null}
        <p className="truncate text-body-sm font-medium text-foreground">{message}</p>
      </div>
      <button
        aria-label="Close notification"
        className="pf-touch-target inline-flex h-10 w-10 items-center justify-center rounded-full text-muted transition hover:bg-white/8 hover:text-foreground"
        onClick={onClose}
        type="button"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
