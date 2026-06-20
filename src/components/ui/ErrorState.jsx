import { AlertTriangle } from "lucide-react";

import Button from "@/components/ui/Button";

export default function ErrorState({ description, onRetry, title = "Unable to load prompts" }) {
  return (
    <div className="pf-card flex flex-col items-center gap-5 rounded-xl border border-danger/20 px-6 py-10 text-center md:px-10 md:py-12">
      <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-danger/12 text-danger">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <div className="space-y-2">
        <h3 className="text-h2">{title}</h3>
        <p className="mx-auto max-w-xl text-body text-muted">{description}</p>
      </div>
      {onRetry ? (
        <Button onPress={onRetry} size="lg">
          Try Again
        </Button>
      ) : null}
    </div>
  );
}
