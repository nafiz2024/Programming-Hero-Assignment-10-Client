"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import GlobalLoader from "@/components/ui/GlobalLoader";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <GlobalLoader label="Authenticating" />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
