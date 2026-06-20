"use client";

import { Card as HeroCard, CardBody, CardFooter, CardHeader } from "@heroui/react";
import { Sparkles } from "lucide-react";
import clsx from "clsx";

export default function Card({
  title,
  description,
  icon,
  children,
  footer,
  className,
  bodyClassName,
  ...props
}) {
  const Icon = icon || Sparkles;

  return (
    <HeroCard className={clsx("border border-slate-200 shadow-sm", className)} {...props}>
      {(title || description) && (
        <CardHeader className="flex items-start gap-3">
          <div className="rounded-full bg-slate-100 p-2 text-slate-700">
            <Icon className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            {title ? <h3 className="text-base font-semibold text-slate-900">{title}</h3> : null}
            {description ? <p className="text-sm text-slate-500">{description}</p> : null}
          </div>
        </CardHeader>
      )}
      <CardBody className={clsx("text-sm text-slate-700", bodyClassName)}>{children}</CardBody>
      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </HeroCard>
  );
}
