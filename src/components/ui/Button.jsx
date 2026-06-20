"use client";

import { Button as HeroButton } from "@heroui/react";
import { ArrowRight, Loader2 } from "lucide-react";
import clsx from "clsx";

export default function Button({
  children,
  className,
  color = "primary",
  endIcon,
  isLoading = false,
  showArrow = false,
  variant = "solid",
  ...props
}) {
  return (
    <HeroButton
      className={clsx("font-medium", className)}
      color={color}
      endContent={
        isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : endIcon ? (
          endIcon
        ) : showArrow ? (
          <ArrowRight className="h-4 w-4" />
        ) : null
      }
      isLoading={isLoading}
      variant={variant}
      {...props}
    >
      {children}
    </HeroButton>
  );
}
