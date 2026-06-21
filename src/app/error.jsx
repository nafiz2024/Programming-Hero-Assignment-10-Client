"use client";

import { useEffect, useMemo } from "react";

import ErrorState from "@/components/common/ErrorState";
import MarketingChrome from "@/components/layout/MarketingChrome";

function buildErrorCode(error) {
  if (error?.digest) {
    return `ERR-PROMPTFLOW-${String(error.digest).slice(0, 8).toUpperCase()}`;
  }

  return "ERR-PROMPTFLOW-500";
}

export default function Error({ error, reset, unstable_retry: unstableRetry }) {
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
    <MarketingChrome>
      <ErrorState code={errorCode} onRetry={handleRetry} />
    </MarketingChrome>
  );
}
