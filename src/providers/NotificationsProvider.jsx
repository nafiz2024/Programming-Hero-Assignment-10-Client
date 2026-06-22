"use client";

import { createContext, useCallback, useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useBookmarks } from "@/hooks/useBookmarks";
import { paymentApi } from "@/lib/api";
import {
  buildNotificationSummary,
  getNotificationReadIds,
  getRecentlyViewedPrompts,
  hydrateReadState,
  normalizeNotificationSource,
  setNotificationReadIds,
} from "@/lib/notifications";

export const NotificationsContext = createContext(undefined);

export function NotificationsProvider({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const { items: bookmarks } = useBookmarks();
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

    const paymentsResult = await Promise.allSettled([
      paymentApi.getMyPayments(),
    ]);

    const paymentsPayload = paymentsResult[0]?.status === "fulfilled" ? paymentsResult[0].value : [];
    const normalized = normalizeNotificationSource({
      bookmarksPayload: bookmarks,
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
  }, [bookmarks, isAuthenticated, loading, user]);

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
