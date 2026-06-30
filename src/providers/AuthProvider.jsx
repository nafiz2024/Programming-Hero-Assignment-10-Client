"use client";

import { createContext, startTransition, useCallback, useEffect, useRef, useState } from "react";

import { authApi, userApi } from "@/lib/api";

export const AuthContext = createContext(undefined);

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

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

  const verifySession = useCallback(
    async ({ attempts = 3, delayMs = 150 } = {}) => {
      for (let attempt = 0; attempt < attempts; attempt += 1) {
        const currentUser = await refreshUser();

        if (currentUser) {
          return currentUser;
        }

        if (attempt < attempts - 1) {
          await wait(delayMs);
        }
      }

      return null;
    },
    [refreshUser],
  );

  async function signUp(nameOrPayload, email, password, extras = {}) {
    const payload =
      typeof nameOrPayload === "object"
        ? nameOrPayload
        : { name: nameOrPayload, email, password, ...extras };
    setLoading(true);

    try {
      await authApi.signUp(payload);
      const verifiedUser = await verifySession();

      if (!verifiedUser) {
        throw new Error("Registration completed, but your session could not be verified. Please sign in again.");
      }

      return verifiedUser;
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
      await authApi.signIn(payload);
      const verifiedUser = await verifySession();

      if (!verifiedUser) {
        throw new Error("Login completed, but your session cookie could not be verified. Please try again.");
      }

      return verifiedUser;
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
