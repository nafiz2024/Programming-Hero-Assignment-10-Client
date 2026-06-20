"use client";

import { createContext, startTransition, useEffect, useState } from "react";

import { authApi, userApi } from "@/lib/api";
import { normalizeAuthUser } from "@/lib/auth";

export const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const currentUser = normalizeAuthUser(await userApi.getMe());
      setUser(currentUser);
      return currentUser;
    } catch {
      setUser(null);
      return null;
    }
  }

  async function signUp(nameOrPayload, email, password, extras = {}) {
    const payload =
      typeof nameOrPayload === "object"
        ? nameOrPayload
        : { name: nameOrPayload, email, password, ...extras };
    const response = await authApi.signUp(payload);
    const responseUser = normalizeAuthUser(response);

    if (responseUser) {
      setUser(responseUser);
    }

    return (await refreshUser()) || responseUser;
  }

  async function signIn(emailOrPayload, password) {
    const payload =
      typeof emailOrPayload === "object"
        ? emailOrPayload
        : { email: emailOrPayload, password };
    const response = await authApi.signIn(payload);
    const responseUser = normalizeAuthUser(response);

    if (responseUser) {
      setUser(responseUser);
    }

    return (await refreshUser()) || responseUser;
  }

  async function signOut() {
    try {
      await authApi.signOut();
    } finally {
      setUser(null);
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
  }, []);

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
