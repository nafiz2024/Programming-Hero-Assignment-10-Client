import Skeleton from "@/components/ui/Skeleton";
import PageContainer from "@/components/shared/PageContainer";
import PromptCardSkeleton from "@/components/common/PromptCardSkeleton";

export default function PageLoader({ cards = 3, titleWidth = "w-56", withGrid = true }) {
  return (
    <PageContainer className="space-y-8 py-10 sm:py-12" size="xl">
      <div className="space-y-4">
        <Skeleton className={`h-12 max-w-full rounded-2xl ${titleWidth}`} />
        <Skeleton className="h-5 w-full max-w-2xl rounded-full" />
        <Skeleton className="h-5 w-full max-w-xl rounded-full" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: cards }).map((_, index) => (
          <div key={`page-loader-card-${index}`} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <Skeleton className="h-12 w-40 rounded-full" />
            <div className="mt-5 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          </div>
        ))}
      </div>

      {withGrid ? (
        <div className="responsive-shell-grid">
          {Array.from({ length: cards }).map((_, index) => (
            <PromptCardSkeleton key={`page-loader-prompt-${index}`} />
          ))}
        </div>
      ) : null}
    </PageContainer>
  );
}
