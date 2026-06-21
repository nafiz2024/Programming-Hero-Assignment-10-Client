"use client";

import { use } from "react";

import { NotificationsContext } from "@/providers/NotificationsProvider";

export function useNotifications() {
  const context = use(NotificationsContext);

  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider.");
  }

  return context;
}
