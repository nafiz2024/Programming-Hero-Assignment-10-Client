"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useBookmarks } from "@/hooks/useBookmarks";
import { toastError, toastSuccess, toastWarning } from "@/lib/toast";

export function usePromptBookmark(prompt) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isBookmarked, status, toggleBookmark } = useBookmarks();
  const pathname = usePathname();
  const router = useRouter();
  const [isMutating, setIsMutating] = useState(false);
  const promptId = String(prompt?.id || "");
  const bookmarked = promptId ? isBookmarked(promptId) : false;

  async function handleBookmarkToggle(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    if (!promptId || isMutating) {
      return null;
    }

    if (authLoading) {
      return null;
    }

    if (!isAuthenticated) {
      toastWarning("Please log in to bookmark prompts.");
      router.push(`/login?next=${encodeURIComponent(pathname || `/prompts/${promptId}`)}`);
      return null;
    }

    setIsMutating(true);

    try {
      const result = await toggleBookmark(prompt);
      toastSuccess(result.bookmarked ? "Prompt bookmarked" : "Bookmark removed");
      return result;
    } catch (error) {
      toastError(error.message || "Unable to update your bookmark.");
      return null;
    } finally {
      setIsMutating(false);
    }
  }

  return {
    isBookmarked: bookmarked,
    isBookmarkReady: status !== "loading" && status !== "refreshing" && !authLoading,
    isBookmarkLoading: isMutating,
    handleBookmarkToggle,
  };
}
