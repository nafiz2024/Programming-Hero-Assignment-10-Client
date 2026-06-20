"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import GlobalLoader from "@/components/ui/GlobalLoader";
import { useAuth } from "@/hooks/useAuth";

export default function RoleRoute({ allowedRoles = [], children }) {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const userRole = user?.role;
  const isAllowed = allowedRoles.includes(userRole);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!isAllowed) {
      router.replace("/");
    }
  }, [isAllowed, isAuthenticated, loading, router]);

  if (loading) {
    return <GlobalLoader label="Checking access" />;
  }

  if (!isAuthenticated || !isAllowed) {
    return null;
  }

  return children;
}
