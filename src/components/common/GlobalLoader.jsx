import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function GlobalLoader({ label = "Loading workspace" }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pf-card flex w-full max-w-xs flex-col items-center rounded-xl px-8 py-12 text-center shadow-modal">
        <div className="relative mb-8 flex h-28 w-28 items-center justify-center">
          <div
            className="absolute inset-0 animate-float-soft rounded-[32px] bg-brand-gradient opacity-90 shadow-glow"
            style={{ clipPath: "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0 50%)" }}
          />
          <div
            className="absolute inset-[18%] rounded-[24px] border border-white/14 bg-background/70"
            style={{ clipPath: "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0 50%)" }}
          />
          <div className="relative z-10 h-5 w-5 rounded-full bg-brand-gradient shadow-glow" />
        </div>
        <h2 className="mb-2 text-h2">PromptFlow</h2>
        <p className="mb-6 text-body-sm text-muted">{label}</p>
        <LoadingSpinner label="" />
      </div>
    </div>
  );
}
