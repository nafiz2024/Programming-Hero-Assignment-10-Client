"use client";

import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { bookmarkApi, promptApi } from "@/lib/api";
import { getPromptId } from "@/lib/prompt-id";
import { getBookmarkItems, normalizeSavedPrompts, resolvePromptId } from "@/lib/saved-prompts";

const defaultAccent = "from-sky-500/30 via-cyan-500/12 to-transparent";

export const BookmarksContext = createContext(undefined);

function createOptimisticBookmark(prompt) {
  const promptId = getPromptId(prompt);

  return {
    id: promptId,
    _id: promptId,
    bookmarkId: `optimistic-${promptId || "bookmark"}`,
    title: prompt?.title || "PromptFlow prompt",
    description:
      prompt?.description || "High-quality prompt content preview from the PromptFlow marketplace.",
    category: prompt?.category || "General",
    aiTool: prompt?.aiTool || "ChatGPT",
    creatorName: prompt?.creatorName || prompt?.author || "PromptFlow Creator",
    author: prompt?.creatorName || prompt?.author || "PromptFlow Creator",
    savedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    rating: Number(prompt?.rating || 0),
    copyCount: Number(prompt?.copyCount || 0),
    visibility: prompt?.visibility || "Public",
    thumbnail: prompt?.thumbnail || prompt?.thumbnailUrl || "",
    thumbnailUrl: prompt?.thumbnail || prompt?.thumbnailUrl || "",
    accent: prompt?.accent || defaultAccent,
  };
}

async function hydrateBookmarkResponse(response) {
  const bookmarks = getBookmarkItems(response);

  if (bookmarks.length === 0) {
    return [];
  }

  const missingPromptIds = [
    ...new Set(
      bookmarks
        .filter((bookmark) => !bookmark?.prompt)
        .map((bookmark) => resolvePromptId(bookmark))
        .filter(Boolean),
    ),
  ];

  if (missingPromptIds.length === 0) {
    return normalizeSavedPrompts(response);
  }

  const promptResults = await Promise.all(
    missingPromptIds.map(async (promptId) => {
      try {
        const promptResponse = await promptApi.getById(promptId);
        const prompt = Array.isArray(promptResponse?.data)
          ? promptResponse.data[0]
          : promptResponse?.data || promptResponse?.prompt || promptResponse;

        return [promptId, prompt];
      } catch {
        return [promptId, null];
      }
    }),
  );

  const promptCatalog = promptResults
    .map(([, prompt]) => prompt)
    .filter(Boolean);

  return normalizeSavedPrompts(response, promptCatalog);
}

export function BookmarksProvider({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const [state, setState] = useState({
    status: "idle",
    items: [],
    error: "",
  });
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const refreshBookmarks = useCallback(async () => {
    if (loading) {
      return stateRef.current.items;
    }

    if (!isAuthenticated) {
      setState({
        status: "idle",
        items: [],
        error: "",
      });
      return [];
    }

    setState((currentState) => ({
      ...currentState,
      status: currentState.items.length > 0 ? "refreshing" : "loading",
      error: "",
    }));

    try {
      const response = await bookmarkApi.getAll();
      const items = await hydrateBookmarkResponse(response);

      setState({
        status: "success",
        items,
        error: "",
      });

      return items;
    } catch (error) {
      setState((currentState) => ({
        ...currentState,
        status: "error",
        error: error.message || "Unable to load bookmarks.",
      }));
      throw error;
    }
  }, [isAuthenticated, loading]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      setState({
        status: "idle",
        items: [],
        error: "",
      });
      return;
    }

    const timer = window.setTimeout(() => {
      refreshBookmarks().catch(() => {
        // Keep the app usable if the initial bookmark fetch fails.
      });
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isAuthenticated, loading, refreshBookmarks]);

  const bookmarkIds = useMemo(
    () => new Set(state.items.map((item) => String(item.id))),
    [state.items],
  );

  const isBookmarked = useCallback(
    (promptId) => bookmarkIds.has(String(promptId)),
    [bookmarkIds],
  );

  const addBookmark = useCallback(async (prompt) => {
    const promptId = getPromptId(prompt);

    if (!promptId) {
      throw new Error("Prompt id is required to add a bookmark.");
    }

    if (stateRef.current.items.some((item) => String(item.id) === promptId)) {
      return { bookmarked: true };
    }

    const optimisticBookmark = createOptimisticBookmark(prompt);

    setState((currentState) => ({
      ...currentState,
      status: "success",
      error: "",
      items: [optimisticBookmark, ...currentState.items],
    }));

    try {
      const response = await bookmarkApi.create(promptId);
      await refreshBookmarks();
      return response;
    } catch (error) {
      setState((currentState) => ({
        ...currentState,
        items: currentState.items.filter((item) => String(item.id) !== promptId),
      }));
      throw error;
    }
  }, [refreshBookmarks]);

  const removeBookmark = useCallback(async (promptId) => {
    const normalizedPromptId = String(promptId || "");
    const previousBookmark = stateRef.current.items.find(
      (item) => String(item.id) === normalizedPromptId,
    );

    setState((currentState) => ({
      ...currentState,
      status: "success",
      error: "",
      items: currentState.items.filter((item) => String(item.id) !== normalizedPromptId),
    }));

    try {
      const response = await bookmarkApi.remove(normalizedPromptId);
      await refreshBookmarks();
      return response;
    } catch (error) {
      if (previousBookmark) {
        setState((currentState) => ({
          ...currentState,
          items: [previousBookmark, ...currentState.items],
        }));
      }
      throw error;
    }
  }, [refreshBookmarks]);

  const toggleBookmark = useCallback(async (prompt) => {
    const promptId = getPromptId(prompt);

    if (!promptId) {
      throw new Error("Prompt id is required to update a bookmark.");
    }

    if (stateRef.current.items.some((item) => String(item.id) === promptId)) {
      await removeBookmark(promptId);
      return { bookmarked: false };
    }

    await addBookmark(prompt);
    return { bookmarked: true };
  }, [addBookmark, removeBookmark]);

  return (
    <BookmarksContext
      value={{
        ...state,
        bookmarkIds,
        isBookmarked,
        refreshBookmarks,
        addBookmark,
        removeBookmark,
        toggleBookmark,
      }}
    >
      {children}
    </BookmarksContext>
  );
}
