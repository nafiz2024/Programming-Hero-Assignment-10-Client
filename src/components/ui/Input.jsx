"use client";

import { Input as HeroInput } from "@heroui/react";
import { Search } from "lucide-react";
import clsx from "clsx";

export default function Input({
  className,
  showSearchIcon = false,
  startContent,
  ...props
}) {
  return (
    <HeroInput
      className={clsx("w-full", className)}
      startContent={
        startContent || (showSearchIcon ? <Search className="h-4 w-4 text-slate-400" /> : null)
      }
      {...props}
    />
  );
}
