"use client";

import { useAuth } from "@/hooks/useAuth";
import { normalizeRole } from "@/lib/auth";

export function useAdminAccess() {
  const { loading, user } = useAuth();
  const isAdmin = normalizeRole(user?.role) === "admin";

  return {
    authLoading: loading,
    authResolved: !loading,
    isAdmin,
    canLoadAdminData: !loading && isAdmin,
    user,
  };
}
