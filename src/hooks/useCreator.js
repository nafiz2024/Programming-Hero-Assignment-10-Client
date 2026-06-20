"use client";

import { useContext } from "react";

import { CreatorContext } from "@/providers/CreatorProvider";

export function useCreator() {
  const context = useContext(CreatorContext);

  if (context === undefined) {
    throw new Error("useCreator must be used within a CreatorProvider.");
  }

  return context;
}
