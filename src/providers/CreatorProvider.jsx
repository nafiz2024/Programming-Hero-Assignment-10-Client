"use client";

import { createContext, useCallback, useEffect, useState } from "react";

import { promptApi } from "@/lib/api";
import {
  buildCreatorAnalytics,
  buildCreatorStats,
  normalizeCreatorPrompt,
  normalizeCreatorPrompts,
  toCreatorPromptPayload,
} from "@/lib/creator";
import { useDashboard } from "@/hooks/useDashboard";

export const CreatorContext = createContext(undefined);

export function CreatorProvider({ children }) {
  const { status: dashboardStatus, user } = useDashboard();
  const [state, setState] = useState({
    status: "loading",
    error: "",
    prompts: [],
  });

  const refreshCreator = useCallback(async () => {
    if (!user?.id && !user?.email) {
      return;
    }

    setState((currentState) => ({
      ...currentState,
      status: currentState.prompts.length > 0 ? "refreshing" : "loading",
      error: "",
    }));

    try {
      const response = await promptApi.getAll();
      const prompts = normalizeCreatorPrompts(response, user);

      setState({
        status: "success",
        error: "",
        prompts,
      });
    } catch (error) {
      setState({
        status: "error",
        error: error.message || "Unable to load creator prompts.",
        prompts: [],
      });
    }
  }, [user]);

  useEffect(() => {
    if (dashboardStatus === "loading" || dashboardStatus === "refreshing") {
      return;
    }

    if (!user?.id && !user?.email) {
      return;
    }

    const timer = window.setTimeout(() => {
      refreshCreator();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [dashboardStatus, refreshCreator, user?.email, user?.id]);

  async function createPrompt(values) {
    const payload = toCreatorPromptPayload(values, user);
    const response = await promptApi.create(payload);
    const normalized = normalizeCreatorPrompt(response?.prompt || response?.data || response || payload, 0, user);

    setState((currentState) => ({
      ...currentState,
      prompts: [normalized, ...currentState.prompts],
    }));

    return normalized;
  }

  async function updatePrompt(id, values, existingPrompt) {
    const payload = toCreatorPromptPayload(values, user, existingPrompt);
    const response = await promptApi.update(id, payload);
    const normalized = normalizeCreatorPrompt(response?.prompt || response?.data || response || { ...existingPrompt, ...payload }, 0, user);

    setState((currentState) => ({
      ...currentState,
      prompts: currentState.prompts.map((prompt) => (prompt.id === id ? { ...prompt, ...normalized } : prompt)),
    }));

    return normalized;
  }

  async function deletePrompt(id) {
    await promptApi.remove(id);
    setState((currentState) => ({
      ...currentState,
      prompts: currentState.prompts.filter((prompt) => prompt.id !== id),
    }));
  }

  const derived = {
    stats: buildCreatorStats(state.prompts),
    analytics: buildCreatorAnalytics(state.prompts, user),
  };

  return (
    <CreatorContext
      value={{
        ...state,
        ...derived,
        refreshCreator,
        createPrompt,
        updatePrompt,
        deletePrompt,
      }}
    >
      {children}
    </CreatorContext>
  );
}
