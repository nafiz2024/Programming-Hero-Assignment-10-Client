"use client";

import { use } from "react";

import { BookmarksContext } from "@/providers/BookmarksProvider";

export function useBookmarks() {
  const context = use(BookmarksContext);

  if (context === undefined) {
    throw new Error("useBookmarks must be used within a BookmarksProvider.");
  }

  return context;
}
