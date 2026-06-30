"use client";

import { createContext, startTransition, useCallback, useEffect, useRef, useState } from "react";

import { authApi, userApi } from "@/lib/api";
import { extractAuthEmail, normalizeAuthUser } from "@/lib/auth";

export const AuthContext = createContext(undefined);

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function buildFallbackAuthUser(userLike, fallbackEmail) {
  const normalizedUser = normalizeAuthUser(userLike);

  if (normalizedUser) {
    return normalizedUser;
  }

  if (typeof fallbackEmail === "string" && fallbackEmail.trim()) {
    const email = fallbackEmail.trim();

    return {
      id: email,
      email,
      role: "user",
      subscription: "free",
    };
  }

  return null;
}

function buildVerifiedAuthUser(payload, fallbackUser, fallbackEmail) {
  const normalizedUser = normalizeAuthUser(payload);

  if (normalizedUser) {
    return normalizedUser;
  }

  const resolvedEmail = extractAuthEmail(payload) || fallbackEmail;

  if (resolvedEmail) {
    return buildFallbackAuthUser(
      {
        ...(fallbackUser && typeof fallbackUser === "object" ? fallbackUser : {}),
        email: resolvedEmail,
      },
      resolvedEmail,
    );
  }

  return buildFallbackAuthUser(fallbackUser, fallbackEmail);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshRequestIdRef = useRef(0);
  const userRef = useRef(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const refreshUser = useCallback(async ({ onError, preserveUser = false } = {}) => {
    const requestId = refreshRequestIdRef.current + 1;
    refreshRequestIdRef.current = requestId;

    try {
      const currentUser = normalizeAuthUser(await userApi.getMe());
      if (refreshRequestIdRef.current === requestId) {
        setUser(currentUser);
      }

      return currentUser;
    } catch (error) {
      onError?.(error);

      if (refreshRequestIdRef.current === requestId && !preserveUser) {
        setUser(null);
      }

      return preserveUser ? userRef.current : null;
    }
  }, []);

  const verifySession = useCallback(
    async ({ attempts = 3, delayMs = 200, initialDelayMs = 400, fallbackUser = null, fallbackEmail = "" } = {}) => {
      if (initialDelayMs > 0) {
        await wait(initialDelayMs);
      }

      for (let attempt = 0; attempt < attempts; attempt += 1) {
        try {
          const { data, status } = await userApi.getMeWithMeta();
          const currentUser = buildVerifiedAuthUser(data, fallbackUser, fallbackEmail);

          if (currentUser) {
            setUser(currentUser);
            return currentUser;
          }

          if (status === 200) {
            const nextUser = buildFallbackAuthUser(fallbackUser, fallbackEmail);

            if (nextUser) {
              setUser(nextUser);
              return nextUser;
            }
          }
        } catch (error) {
          console.error("Session verification failed", {
            attempt: attempt + 1,
            message: error?.message || "Unknown session verification error.",
            status: error?.status ?? null,
            data: error?.data ?? null,
          });

          const currentUser = await refreshUser({
            preserveUser: true,
            onError: () => {},
          });

          if (currentUser) {
            return currentUser;
          }
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
      const response = await authApi.signUp(payload);
      const responseUser = normalizeAuthUser(response);
      const fallbackEmail =
        payload?.email ||
        responseUser?.email ||
        "";

      if (responseUser) {
        setUser(responseUser);
      }

      const verifiedUser = await verifySession({ fallbackUser: responseUser, fallbackEmail });

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
      const response = await authApi.signIn(payload);
      const responseUser = normalizeAuthUser(response);
      const fallbackEmail =
        payload?.email ||
        responseUser?.email ||
        "";

      if (responseUser) {
        setUser(responseUser);
      }

      const verifiedUser = await verifySession({ fallbackUser: responseUser, fallbackEmail });

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
