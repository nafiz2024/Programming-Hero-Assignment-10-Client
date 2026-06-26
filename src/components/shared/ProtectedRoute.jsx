"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import GlobalLoader from "@/components/ui/GlobalLoader";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { loading, user } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  if (loading) {
    return <GlobalLoader label="Authenticating" />;
  }

  if (!user) {
    return null;
  }

  return children;
}
