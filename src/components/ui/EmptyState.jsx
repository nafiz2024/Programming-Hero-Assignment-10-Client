import { SearchX } from "lucide-react";

import Button from "@/components/ui/Button";

export default function EmptyState({
  actionLabel = "Clear Filters",
  description,
  onAction,
  title,
}) {
  return (
    <div className="pf-card flex flex-col items-center gap-5 rounded-xl px-6 py-10 text-center md:px-10 md:py-12">
      <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-brand-gradient/20 text-primary shadow-glow">
        <SearchX className="h-8 w-8" />
      </div>
      <div className="space-y-2">
        <h3 className="text-h2">{title}</h3>
        <p className="mx-auto max-w-xl text-body text-muted">{description}</p>
      </div>
      {onAction ? (
        <Button onPress={onAction} size="lg" variant="secondary">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
