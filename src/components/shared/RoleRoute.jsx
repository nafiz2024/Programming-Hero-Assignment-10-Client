"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import GlobalLoader from "@/components/ui/GlobalLoader";
import { useAuth } from "@/hooks/useAuth";
import { getPostAuthRedirect, normalizeRole } from "@/lib/auth";
import { toastWarning } from "@/lib/toast";

export default function RoleRoute({ allowedRoles = [], children, redirectTo = "/" }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const lastBlockedPathRef = useRef("");
  const userRole = normalizeRole(user?.role);
  const normalizedAllowedRoles = useMemo(
    () => allowedRoles.map((role) => normalizeRole(role)),
    [allowedRoles],
  );
  const isAllowed = normalizedAllowedRoles.includes(userRole);
  const forbiddenRedirect = redirectTo === "/" ? getPostAuthRedirect(user) : redirectTo;

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!isAllowed) {
      if (lastBlockedPathRef.current !== pathname) {
        toastWarning("You do not have permission to access this page.");
        lastBlockedPathRef.current = pathname;
      }

      router.replace(forbiddenRedirect);
      return;
    }

    lastBlockedPathRef.current = "";
  }, [forbiddenRedirect, isAllowed, loading, pathname, router, user]);

  if (loading) {
    return <GlobalLoader label="Checking access" />;
  }

  if (!user || !isAllowed) {
    return null;
  }

  return children;
}
