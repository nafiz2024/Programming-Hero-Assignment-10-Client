"use client";

import { Spinner } from "@heroui/react";
import clsx from "clsx";

export default function LoadingSpinner({
  className,
  color = "primary",
  label = "Loading",
  size = "md",
  ...props
}) {
  return (
    <div className={clsx("flex items-center justify-center", className)}>
      <Spinner color={color} label={label} size={size} {...props} />
    </div>
  );
}
