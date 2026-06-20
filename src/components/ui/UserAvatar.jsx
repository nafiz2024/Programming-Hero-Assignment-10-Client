"use client";

import { useState } from "react";
import clsx from "clsx";

export default function UserAvatar({
  alt,
  className,
  fallback,
  imageClassName,
  initialsClassName,
  src,
}) {
  const [failedSrc, setFailedSrc] = useState("");
  const normalizedSrc = src || "";
  const showImage = Boolean(normalizedSrc) && failedSrc !== normalizedSrc;

  return (
    <div
      className={clsx(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        className,
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={alt}
          className={clsx("h-full w-full rounded-full object-cover", imageClassName)}
          onError={() => setFailedSrc(normalizedSrc)}
          src={normalizedSrc}
        />
      ) : (
        <span
          className={clsx(
            "flex h-full w-full items-center justify-center text-center font-semibold leading-none",
            initialsClassName,
          )}
        >
          {fallback}
        </span>
      )}
    </div>
  );
}
