"use client";

import { createContext, useCallback, useEffect, useState } from "react";

import { bookmarkApi, paymentApi } from "@/lib/api";
import {
  buildNotificationSummary,
  getNotificationReadIds,
  getRecentlyViewedPrompts,
  hydrateReadState,
  normalizeNotificationSource,
  setNotificationReadIds,
} from "@/lib/notifications";
import { useAuth } from "@/hooks/useAuth";

export const NotificationsContext = createContext(undefined);

export function NotificationsProvider({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const viewedUserId = user?.id || "";
  const [state, setState] = useState({
    status: "loading",
    items: [],
    bookmarks: [],
    payments: [],
    recentlyViewed: [],
    error: "",
  });

  const refreshNotifications = useCallback(async () => {
    if (loading) {
      return;
    }

    if (!isAuthenticated || !user?.id) {
      setState({
        status: "idle",
        items: [],
        bookmarks: [],
        payments: [],
        recentlyViewed: [],
        error: "",
      });
      return;
    }

    setState((current) => ({
      ...current,
      status: current.items.length > 0 ? "refreshing" : "loading",
      error: "",
    }));

    const [bookmarksResult, paymentsResult] = await Promise.allSettled([
      bookmarkApi.getAll(),
      paymentApi.getMyPayments(),
    ]);

    const bookmarksPayload = bookmarksResult.status === "fulfilled" ? bookmarksResult.value : [];
    const paymentsPayload = paymentsResult.status === "fulfilled" ? paymentsResult.value : [];
    const normalized = normalizeNotificationSource({
      bookmarksPayload,
      paymentsPayload,
      user,
    });
    const readIds = getNotificationReadIds(user.id);

    setState({
      status: "success",
      items: hydrateReadState(normalized.notifications, readIds),
      bookmarks: normalized.bookmarks,
      payments: normalized.payments,
      recentlyViewed: getRecentlyViewedPrompts(user.id),
      error: "",
    });
  }, [isAuthenticated, loading, user]);

  function persistReadState(nextItems) {
    if (!user?.id) {
      return;
    }

    const readIds = nextItems.filter((item) => item.isRead).map((item) => item.id);
    setNotificationReadIds(user.id, readIds);
  }

  function markAsRead(id) {
    setState((current) => {
      const nextItems = current.items.map((item) =>
        item.id === id ? { ...item, isRead: true } : item,
      );
      persistReadState(nextItems);
      return {
        ...current,
        items: nextItems,
      };
    });
  }

  function markAllAsRead() {
    setState((current) => {
      const nextItems = current.items.map((item) => ({ ...item, isRead: true }));
      persistReadState(nextItems);
      return {
        ...current,
        items: nextItems,
      };
    });
  }

  const refreshViewedPrompts = useCallback(() => {
    if (!viewedUserId) {
      return;
    }

    setState((current) => ({
      ...current,
      recentlyViewed: getRecentlyViewedPrompts(viewedUserId),
    }));
  }, [viewedUserId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      refreshNotifications();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [refreshNotifications]);

  const summary = buildNotificationSummary(state.items);

  return (
    <NotificationsContext
      value={{
        ...state,
        ...summary,
        refreshNotifications,
        refreshViewedPrompts,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationsContext>
  );
}
