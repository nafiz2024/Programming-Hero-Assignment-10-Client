"use client";

import { createContext, startTransition, useCallback, useEffect, useRef, useState } from "react";

import { authApi, userApi } from "@/lib/api";
import { normalizeAuthUser } from "@/lib/auth";

export const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshRequestIdRef = useRef(0);
  const userRef = useRef(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const refreshUser = useCallback(async ({ preserveUser = false } = {}) => {
    const requestId = refreshRequestIdRef.current + 1;
    refreshRequestIdRef.current = requestId;

    try {
      const currentUser = normalizeAuthUser(await userApi.getMe());
      if (refreshRequestIdRef.current === requestId) {
        setUser(currentUser);
      }

      return currentUser;
    } catch {
      if (refreshRequestIdRef.current === requestId && !preserveUser) {
        setUser(null);
      }

      return preserveUser ? userRef.current : null;
    }
  }, []);

  async function signUp(nameOrPayload, email, password, extras = {}) {
    const payload =
      typeof nameOrPayload === "object"
        ? nameOrPayload
        : { name: nameOrPayload, email, password, ...extras };
    setLoading(true);

    try {
      const response = await authApi.signUp(payload);
      const responseUser = normalizeAuthUser(response);

      if (responseUser) {
        setUser(responseUser);
      }

      return (await refreshUser({ preserveUser: Boolean(responseUser) })) || responseUser;
    } finally {
      setLoading(false);
    }
  }

  async function signIn(emailOrPayload, password) {
    const payload =
      typeof emailOrPayload === "object"
        ? emailOrPayload
        : { email: emailOrPayload, password };
    setLoading(true);

    try {
      const response = await authApi.signIn(payload);
      const responseUser = normalizeAuthUser(response);

      if (responseUser) {
        setUser(responseUser);
      }

      return (await refreshUser({ preserveUser: Boolean(responseUser) })) || responseUser;
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    setLoading(true);

    try {
      await authApi.signOut();
    } finally {
      refreshRequestIdRef.current += 1;
      setUser(null);
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    startTransition(() => {
      refreshUser().finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    });

    return () => {
      isMounted = false;
    };
  }, [refreshUser]);

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    signUp,
    signIn,
    signOut,
    refreshUser,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}
