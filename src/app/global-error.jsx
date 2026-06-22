"use client";

import "../styles/globals.css";

import { Geist } from "next/font/google";
import { useEffect, useMemo } from "react";

import ErrorState from "@/components/common/ErrorState";
import MarketingChrome from "@/components/layout/MarketingChrome";
import { AuthProvider } from "@/providers/AuthProvider";
import { BookmarksProvider } from "@/providers/BookmarksProvider";
import { NotificationsProvider } from "@/providers/NotificationsProvider";
import { UIProvider } from "@/providers/UIProvider";

const geist = Geist({
  subsets: ["latin"],
});

function buildErrorCode(error) {
  if (error?.digest) {
    return `ERR-PROMPTFLOW-${String(error.digest).slice(0, 8).toUpperCase()}`;
  }

  return "ERR-PROMPTFLOW-500";
}

export default function GlobalError({ error, reset, unstable_retry: unstableRetry }) {
  const errorCode = useMemo(() => buildErrorCode(error), [error]);

  useEffect(() => {
    console.error(error);
  }, [error]);

  function handleRetry() {
    if (typeof reset === "function") {
      reset();
      return;
    }

    if (typeof unstableRetry === "function") {
      unstableRetry();
      return;
    }

    window.location.reload();
  }

  return (
    <html className={geist.className} data-scroll-behavior="smooth" lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground" suppressHydrationWarning>
        <AuthProvider>
          <BookmarksProvider>
            <NotificationsProvider>
              <UIProvider>
                <MarketingChrome>
                  <ErrorState code={errorCode} onRetry={handleRetry} />
                </MarketingChrome>
              </UIProvider>
            </NotificationsProvider>
          </BookmarksProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
