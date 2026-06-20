import { ChevronRight } from "lucide-react";
import clsx from "clsx";

export default function SectionHeader({
  title,
  description,
  action,
  className,
  icon: Icon = ChevronRight,
  eyebrow,
}) {
  return (
    <div
      className={clsx(
        "pf-card flex flex-col gap-4 rounded-lg p-5 md:flex-row md:items-end md:justify-between md:p-6",
        className,
      )}
    >
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-body-xs font-semibold uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
        ) : null}
        <div className="flex items-center gap-3 text-foreground">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-primary/12 text-primary shadow-glow">
            <Icon className="h-5 w-5" />
          </div>
          <h2 className="text-h2">{title}</h2>
        </div>
        {description ? <p className="max-w-2xl text-body-sm text-muted md:text-body">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
