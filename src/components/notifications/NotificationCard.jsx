"use client";

import Link from "next/link";
import { ArrowRight, CheckCheck } from "lucide-react";

import Button from "@/components/ui/Button";

export default function NotificationCard({
  compact = false,
  notification,
  onMarkRead,
  onNavigate,
}) {
  const Icon = notification.icon;

  return (
    <article
      className={`rounded-[24px] border p-4 transition ${
        notification.isRead
          ? "border-slate-200 bg-white"
          : "border-primary/18 bg-primary/[0.045] shadow-[0_18px_50px_rgba(99,102,241,0.08)]"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${notification.accent}`}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-950">{notification.title}</h3>
            {!notification.isRead ? <span className="h-2.5 w-2.5 rounded-full bg-primary" /> : null}
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">{notification.message}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
            <span>{notification.relativeTime}</span>
            <span>{notification.category.replace("-", " ")}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {notification.actionHref ? (
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-secondary"
            href={notification.actionHref}
            onClick={() => {
              onMarkRead?.(notification.id);
              onNavigate?.();
            }}
          >
            {notification.actionLabel || "Open"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="text-sm text-slate-400">No action required</span>
        )}

        {!notification.isRead ? (
          <Button
            className={compact ? "h-10 px-4 text-xs" : ""}
            onPress={() => onMarkRead?.(notification.id)}
            size={compact ? "sm" : "md"}
            variant="secondary"
          >
            <CheckCheck className="h-4 w-4" />
            Mark as read
          </Button>
        ) : null}
      </div>
    </article>
  );
}
