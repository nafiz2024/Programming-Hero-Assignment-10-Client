"use client";

import { createContext, startTransition, useEffect, useState } from "react";

import { authApi, userApi } from "@/lib/api";

export const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const currentUser = await userApi.getMe();
      setUser(currentUser);
      return currentUser;
    } catch {
      setUser(null);
      return null;
    }
  }

  async function signUp(name, email, password) {
    await authApi.signUp({ name, email, password });
    return refreshUser();
  }

  async function signIn(email, password) {
    await authApi.signIn({ email, password });
    return refreshUser();
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
