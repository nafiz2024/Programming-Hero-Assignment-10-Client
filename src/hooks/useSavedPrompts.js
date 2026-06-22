"use client";

import { useBookmarks } from "@/hooks/useBookmarks";

export function useSavedPrompts() {
  const { error, items, refreshBookmarks, removeBookmark, status } = useBookmarks();

  return {
    error,
    items,
    refresh: refreshBookmarks,
    removeBookmark,
    status,
  };
}
