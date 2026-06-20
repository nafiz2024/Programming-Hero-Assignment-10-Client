"use client";

import { Button as HeroButton } from "@heroui/react";
import { ArrowRight, Loader2 } from "lucide-react";
import clsx from "clsx";

const variantClasses = {
  solid: "bg-brand-gradient text-white shadow-glow hover:brightness-110",
  secondary: "border border-white/12 bg-white/6 text-foreground hover:bg-white/12",
  ghost: "bg-transparent text-muted hover:bg-white/6 hover:text-foreground",
  danger: "bg-danger text-background hover:bg-danger/90",
};

const sizeClasses = {
  sm: "h-10 min-w-[44px] px-4 text-body-xs",
  md: "h-11 min-w-[44px] px-5 text-body-sm",
  lg: "h-12 min-w-[48px] px-6 text-body",
};

export default function Button({
  children,
  className,
  endIcon,
  isLoading = false,
  showArrow = false,
  variant = "solid",
  size = "md",
  ...props
}) {
  return (
    <HeroButton
      className={clsx(
        "pf-touch-target rounded-pill font-semibold transition duration-300 ease-out",
        variantClasses[variant] || variantClasses.solid,
        sizeClasses[size] || sizeClasses.md,
        className,
      )}
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
      radius="full"
      variant="solid"
      {...props}
    >
      {children}
    </HeroButton>
  );
}
