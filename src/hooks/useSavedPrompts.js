"use client";

import { useEffect, useState } from "react";

import { bookmarkApi, promptApi } from "@/lib/api";
import {
  createSavedPromptFallbacks,
  normalizeSavedPrompts,
} from "@/lib/saved-prompts";
import { normalizePromptPayload } from "@/lib/marketplace";

export function useSavedPrompts() {
  const [state, setState] = useState({
    status: "loading",
    error: "",
    items: [],
    source: "api",
  });

  async function refresh() {
    setState((currentState) => ({
      ...currentState,
      status: currentState.items.length > 0 ? "refreshing" : "loading",
      error: "",
    }));

    try {
      const [bookmarksResponse, promptsResponse] = await Promise.all([
        bookmarkApi.getAll(),
        promptApi.getAll(),
      ]);
      const promptCatalog = normalizePromptPayload(promptsResponse);
      const items = normalizeSavedPrompts(bookmarksResponse, promptCatalog);

      setState({
        status: "success",
        error: "",
        items,
        source: "api",
      });
    } catch (error) {
      try {
        const promptsResponse = await promptApi.getAll();
        const promptCatalog = normalizePromptPayload(promptsResponse);

        setState({
          status: "success",
          error: "",
          items: createSavedPromptFallbacks(promptCatalog),
          source: "mock",
        });
      } catch {
        setState({
          status: "success",
          error: "",
          items: createSavedPromptFallbacks(),
          source: "mock",
        });
      }
    }
  }

  function removePromptLocally(promptId) {
    setState((currentState) => ({
      ...currentState,
      items: currentState.items.filter(
        (item) => item.id !== promptId && item.bookmarkId !== promptId,
      ),
    }));
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      refresh();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return {
    ...state,
    refresh,
    removePromptLocally,
  };
}
