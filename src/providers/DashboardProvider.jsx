"use client";

import { createContext, useEffect, useState } from "react";

import { bookmarkApi, promptApi, userApi } from "@/lib/api";
import {
  buildDashboardStats,
  buildDashboardPromptStats,
  buildPromptPerformance,
  buildRecentActivity,
  buildRecommendedPrompts,
  buildRecommendedForFreeUser,
  buildUserDashboardActivity,
  getProfileStorageKey,
  getReviewsStorageKey,
  getStorageItem,
  normalizeBookmarks,
  normalizeDashboardUser,
  normalizeDashboardPromptResponse,
  normalizeOwnedPrompts,
  seedLocalReviews,
  setStorageItem,
  toDashboardPromptPayload,
} from "@/lib/dashboard";
import { normalizePromptPayload } from "@/lib/marketplace";

export const DashboardContext = createContext(undefined);

export function DashboardProvider({ children }) {
  const [state, setState] = useState({
    status: "loading",
    error: "",
    user: null,
    bookmarks: [],
    promptCatalog: [],
    ownedPrompts: [],
    localReviews: [],
  });

  async function refreshDashboard() {
    setState((currentState) => ({
      ...currentState,
      status: currentState.user ? "refreshing" : "loading",
      error: "",
    }));

    try {
      const [userResponse, bookmarksResponse, promptsResponse] = await Promise.all([
        userApi.getMe(),
        bookmarkApi.getAll(),
        promptApi.getAll(),
      ]);

      const profileOverrides = getStorageItem(getProfileStorageKey(), {});
      const promptCatalog = normalizePromptPayload(promptsResponse);
      const normalizedBookmarks = normalizeBookmarks(bookmarksResponse, promptCatalog);
      const normalizedUser = normalizeDashboardUser(userResponse, profileOverrides);
      const ownedPrompts = normalizeOwnedPrompts(promptsResponse, normalizedUser);
      const persistedReviews = getStorageItem(getReviewsStorageKey(), null);
      const localReviews =
        Array.isArray(persistedReviews) && persistedReviews.length > 0
          ? persistedReviews
          : seedLocalReviews(normalizedUser, normalizedBookmarks, ownedPrompts.length > 0 ? ownedPrompts : promptCatalog);

      if (!persistedReviews) {
        setStorageItem(getReviewsStorageKey(), localReviews);
      }

      setState({
        status: "success",
        error: "",
        user: normalizedUser,
        bookmarks: normalizedBookmarks,
        promptCatalog,
        ownedPrompts,
        localReviews,
      });
    } catch (error) {
      setState({
        status: "error",
        error: error.message || "Unable to load dashboard data.",
        user: null,
        bookmarks: [],
        promptCatalog: [],
        ownedPrompts: [],
        localReviews: [],
      });
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      refreshDashboard();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  function updateProfileLocally(values) {
    const nextOverrides = {
      name: values.name,
      bio: values.bio,
      image: values.image,
    };

    setStorageItem(getProfileStorageKey(), nextOverrides);
    setState((currentState) => ({
      ...currentState,
      user: currentState.user
        ? normalizeDashboardUser(currentState.user, nextOverrides)
        : currentState.user,
    }));
  }

  function updateReviewsLocally(nextReviews) {
    setStorageItem(getReviewsStorageKey(), nextReviews);
    setState((currentState) => ({
      ...currentState,
      localReviews: nextReviews,
    }));
  }

  const derived = state.user
    ? {
        stats: buildDashboardStats({
          bookmarks: state.bookmarks,
          promptCatalog: state.promptCatalog,
          reviews: state.localReviews,
          user: state.user,
        }),
        promptStats: buildDashboardPromptStats(state.ownedPrompts, state.bookmarks, state.localReviews, state.user),
        promptPerformance: buildPromptPerformance(state.ownedPrompts),
        activity: buildRecentActivity({
          user: state.user,
          bookmarks: state.bookmarks,
          reviews: state.localReviews,
        }),
        userActivity: buildUserDashboardActivity({
          user: state.user,
          bookmarks: state.bookmarks,
          reviews: state.localReviews,
          ownedPrompts: state.ownedPrompts,
        }),
        recommendedPrompts: buildRecommendedPrompts(state.promptCatalog, state.bookmarks),
        freeUserRecommendations: buildRecommendedForFreeUser(state.promptCatalog, state.bookmarks, state.ownedPrompts),
      }
    : {
        stats: [],
        promptStats: [],
        promptPerformance: {
          topPrompts: [],
          series: [],
          totalCopies: 0,
          averageRating: 4.7,
          totalEarnings: 0,
        },
        activity: [],
        userActivity: [],
        recommendedPrompts: [],
        freeUserRecommendations: [],
      };

  async function createOwnedPrompt(values) {
    const payload = toDashboardPromptPayload(values, state.user);
    const response = await promptApi.create(payload);
    const normalizedPrompt = normalizeDashboardPromptResponse(response, state.user, payload);

    setState((currentState) => ({
      ...currentState,
      ownedPrompts: [normalizedPrompt, ...currentState.ownedPrompts],
    }));

    return normalizedPrompt;
  }

  async function updateOwnedPrompt(id, values, existingPrompt) {
    const payload = toDashboardPromptPayload(values, state.user, existingPrompt);
    const response = await promptApi.update(id, payload);
    const normalizedPrompt = normalizeDashboardPromptResponse(
      response,
      state.user,
      { ...existingPrompt, ...payload, id },
    );

    setState((currentState) => ({
      ...currentState,
      ownedPrompts: currentState.ownedPrompts.map((prompt) =>
        prompt.id === id ? { ...prompt, ...normalizedPrompt } : prompt,
      ),
    }));

    return normalizedPrompt;
  }

  async function deleteOwnedPrompt(id) {
    await promptApi.remove(id);
    setState((currentState) => ({
      ...currentState,
      ownedPrompts: currentState.ownedPrompts.filter((prompt) => prompt.id !== id),
    }));
  }

  const value = {
    ...state,
    ...derived,
    refreshDashboard,
    updateProfileLocally,
    updateReviewsLocally,
    createOwnedPrompt,
    updateOwnedPrompt,
    deleteOwnedPrompt,
  };

  return <DashboardContext value={value}>{children}</DashboardContext>;
}
