"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bell, ChevronRight } from "lucide-react";

import NotificationCard from "@/components/notifications/NotificationCard";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { useNotifications } from "@/hooks/useNotifications";
import { motionPresets } from "@/lib/motion";

function NotificationPreviewSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={`notification-preview-${index}`} className="rounded-[22px] border border-slate-200 bg-white p-4">
          <div className="flex gap-4">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NotificationBell({ className = "" }) {
  const {
    items,
    markAllAsRead,
    markAsRead,
    status,
    unread,
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const previewItems = items.slice(0, 4);
  const dropdownPreset = shouldReduceMotion ? motionPresets.reduced : motionPresets.dropdownScale;

  useEffect(() => {
    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <motion.button
        animate={unread > 0 && !shouldReduceMotion ? { y: [0, -2, 0] } : { y: 0 }}
        aria-expanded={isOpen}
        aria-label="Notifications"
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
        onClick={() => setIsOpen((current) => !current)}
        transition={unread > 0 && !shouldReduceMotion ? { duration: 0.45, ease: "easeOut" } : { duration: 0.2 }}
        type="button"
        whileHover={shouldReduceMotion ? undefined : { y: -1, scale: 1.02 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 ? (
          <motion.span
            animate={shouldReduceMotion ? undefined : { scale: [1, 1.08, 1] }}
            className="absolute -right-0.5 -top-0.5 inline-flex min-w-[20px] items-center justify-center rounded-full bg-brand-gradient px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-[0_10px_20px_rgba(99,102,241,0.35)]"
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        ) : null}
      </motion.button>

      <AnimatePresence>
        {isOpen ? (
        <motion.div
          animate="visible"
          className="absolute right-0 top-[calc(100%+12px)] z-[85] w-[min(92vw,420px)] overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_28px_80px_rgba(15,23,42,0.16)]"
          exit="exit"
          initial="hidden"
          transition={dropdownPreset.transition}
          variants={dropdownPreset.variants}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-slate-950">Notifications</p>
              <p className="text-sm text-slate-500">
                {unread > 0 ? `${unread} unread update${unread > 1 ? "s" : ""}` : "All caught up"}
              </p>
            </div>
            {unread > 0 ? (
              <button
                className="text-sm font-semibold text-primary transition hover:text-secondary"
                onClick={() => markAllAsRead()}
                type="button"
              >
                Mark all as read
              </button>
            ) : null}
          </div>

          <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {status === "loading" ? (
              <NotificationPreviewSkeleton />
            ) : previewItems.length === 0 ? (
              <EmptyState
                actionLabel="Close"
                description="You do not have any notifications yet."
                onAction={() => setIsOpen(false)}
                title="Nothing new right now"
              />
            ) : (
              previewItems.map((notification) => (
                <NotificationCard
                  compact
                  key={notification.id}
                  notification={notification}
                  onMarkRead={markAsRead}
                  onNavigate={() => setIsOpen(false)}
                />
              ))
            )}
          </div>

          <Link
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            href="/notifications"
            onClick={() => setIsOpen(false)}
          >
            View all notifications
            <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>
      ) : null}
      </AnimatePresence>
    </div>
  );
}
