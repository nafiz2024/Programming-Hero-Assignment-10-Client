"use client";

import { createContext, useCallback, useEffect, useState } from "react";

import { useBookmarks } from "@/hooks/useBookmarks";
import { promptApi, userApi } from "@/lib/api";
import {
  DASHBOARD_REVIEWS_EVENT,
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
  setStorageItem,
  toDashboardPromptPayload,
} from "@/lib/dashboard";
import { normalizePromptPayload } from "@/lib/marketplace";
import { enrichPromptsWithReviewSummaries, fetchUserReviewsForPrompts, REVIEW_SYNC_EVENT } from "@/lib/reviews";

export const DashboardContext = createContext(undefined);

export function DashboardProvider({ children }) {
  const [state, setState] = useState({
    status: "loading",
    error: "",
    user: null,
    promptCatalog: [],
    ownedPrompts: [],
    localReviews: [],
  });
  const { items: bookmarks, refreshBookmarks, status: bookmarksStatus } = useBookmarks();

  const refreshDashboard = useCallback(async () => {
    setState((currentState) => ({
      ...currentState,
      status: currentState.user ? "refreshing" : "loading",
      error: "",
    }));

    try {
      const [userResponse, bookmarksResponse, promptsResponse] = await Promise.all([
        userApi.getMe(),
        refreshBookmarks(),
        promptApi.getAll(),
      ]);

      const profileOverrides = getStorageItem(getProfileStorageKey(), {});
      const promptCatalog = await enrichPromptsWithReviewSummaries(normalizePromptPayload(promptsResponse));
      const normalizedBookmarks =
        Array.isArray(bookmarksResponse) && bookmarksResponse.length > 0
          ? bookmarksResponse
          : normalizeBookmarks(bookmarksResponse, promptCatalog);
      const normalizedUser = normalizeDashboardUser(userResponse, profileOverrides);
      const ownedPrompts = normalizeOwnedPrompts(promptsResponse, normalizedUser);
      const localReviews = await fetchUserReviewsForPrompts(promptCatalog, normalizedUser);

      setState({
        status: "success",
        error: "",
        user: normalizedUser,
        promptCatalog,
        ownedPrompts,
        localReviews,
      });
    } catch (error) {
      setState({
        status: "error",
        error: error.message || "Unable to load dashboard data.",
        user: null,
        promptCatalog: [],
        ownedPrompts: [],
        localReviews: [],
      });
    }
  }, [refreshBookmarks]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      refreshDashboard();
    }, 0);

    function syncStoredReviews() {
      const nextReviews = getStorageItem(getReviewsStorageKey(), []);
      setState((currentState) => ({
        ...currentState,
        localReviews: Array.isArray(nextReviews) ? nextReviews : currentState.localReviews,
      }));
    }

    window.addEventListener("storage", syncStoredReviews);
    window.addEventListener(DASHBOARD_REVIEWS_EVENT, syncStoredReviews);
    window.addEventListener(REVIEW_SYNC_EVENT, refreshDashboard);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", syncStoredReviews);
      window.removeEventListener(DASHBOARD_REVIEWS_EVENT, syncStoredReviews);
      window.removeEventListener(REVIEW_SYNC_EVENT, refreshDashboard);
    };
  }, [refreshDashboard]);

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
    saveDashboardReviews(nextReviews);
    setState((currentState) => ({
      ...currentState,
      localReviews: nextReviews,
    }));
  }

  const derived = state.user
    ? {
        stats: buildDashboardStats({
          bookmarks,
          promptCatalog: state.promptCatalog,
          reviews: state.localReviews,
          user: state.user,
        }),
        promptStats: buildDashboardPromptStats(state.ownedPrompts, bookmarks, state.localReviews, state.user),
        promptPerformance: buildPromptPerformance(state.ownedPrompts),
        activity: buildRecentActivity({
          user: state.user,
          bookmarks,
          reviews: state.localReviews,
        }),
        userActivity: buildUserDashboardActivity({
          user: state.user,
          bookmarks,
          reviews: state.localReviews,
          ownedPrompts: state.ownedPrompts,
        }),
        recommendedPrompts: buildRecommendedPrompts(state.promptCatalog, bookmarks),
        freeUserRecommendations: buildRecommendedForFreeUser(state.promptCatalog, bookmarks, state.ownedPrompts),
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
    bookmarks,
    status:
      state.status === "success" && (bookmarksStatus === "loading" || bookmarksStatus === "refreshing")
        ? bookmarksStatus
        : state.status,
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
