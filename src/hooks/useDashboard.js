"use client";

import { use } from "react";

import { DashboardContext } from "@/providers/DashboardProvider";

export function useDashboard() {
  const context = use(DashboardContext);

  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider.");
  }

  return context;
}

