"use client";

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
    <section className={clsx("pf-card rounded-lg p-5 md:p-6", className)} {...props}>
      {(title || description) && (
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-primary/12 text-primary shadow-glow">
            <Icon className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            {title ? <h3 className="text-h3">{title}</h3> : null}
            {description ? <p className="text-body-sm text-muted">{description}</p> : null}
          </div>
        </div>
      )}

      <div className={clsx("text-body-sm text-foreground", bodyClassName)}>{children}</div>
      {footer ? <div className="mt-5 border-t border-white/10 pt-4">{footer}</div> : null}
    </section>
  );
}
