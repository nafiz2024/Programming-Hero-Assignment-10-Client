import { ChevronRight } from "lucide-react";
import clsx from "clsx";

export default function SectionHeader({
  title,
  description,
  action,
  className,
  icon: Icon = ChevronRight,
}) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-slate-900">
          <Icon className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        </div>
        {description ? <p className="max-w-2xl text-sm text-slate-500">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
