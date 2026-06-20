"use client";

import { Chip } from "@heroui/react";
import { ShieldCheck } from "lucide-react";
import clsx from "clsx";

export default function Badge({
  children,
  className,
  color = "default",
  icon,
  variant = "flat",
  ...props
}) {
  const Icon = icon || ShieldCheck;

  return (
    <Chip
      className={clsx("font-medium", className)}
      color={color}
      startContent={<Icon className="h-3.5 w-3.5" />}
      variant={variant}
      {...props}
    >
      {children}
    </Chip>
  );
}
