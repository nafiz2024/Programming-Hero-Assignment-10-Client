"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import FadeIn from "@/components/shared/FadeIn";

const authRoutes = new Set(["/login", "/register"]);

export default function MarketingChrome({ children }) {
  const pathname = usePathname();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const isAuthRoute = mounted && authRoutes.has(pathname);

  if (isAuthRoute) {
    return (
      <main className="min-h-screen">
        <FadeIn>{children}</FadeIn>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <FadeIn>{children}</FadeIn>
      </main>
      <Footer />
    </div>
  );
}
