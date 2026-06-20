import Skeleton from "@/components/ui/Skeleton";

function SidebarCardSkeleton() {
  return (
    <div className="pf-card rounded-xl p-5">
      <Skeleton className="mb-4 h-5 w-32" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`sidebar-row-${index}`} className="flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PromptDetailsSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-10 w-full max-w-3xl" />
        <Skeleton className="h-5 w-full max-w-2xl" />
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`badge-${index}`} className="h-10 w-28 rounded-full" />
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`action-${index}`} className="h-12 w-36 rounded-full" />
          ))}
        </div>
      </div>

      <div className="grid gap-6 desktop:grid-cols-[minmax(0,1.4fr)_360px]">
        <div className="space-y-6">
          <div className="pf-card rounded-xl p-5">
            <Skeleton className="mb-5 h-6 w-40" />
            <Skeleton className="h-[440px] w-full rounded-xl" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 desktop:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`usage-${index}`} className="pf-card rounded-xl p-4">
                <Skeleton className="mb-3 h-8 w-8 rounded-full" />
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
          <div className="pf-card rounded-xl p-5">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
          <div className="pf-card rounded-xl p-5">
            <Skeleton className="mb-5 h-6 w-40" />
            <div className="grid gap-5 md:grid-cols-[260px_minmax(0,1fr)]">
              <div className="space-y-4">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-44 w-full rounded-xl" />
              </div>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={`review-${index}`} className="rounded-xl border border-white/8 p-4">
                    <div className="mb-4 flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                    <Skeleton className="mb-2 h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <SidebarCardSkeleton />
          <SidebarCardSkeleton />
          <div className="pf-card rounded-xl p-5">
            <Skeleton className="mb-4 h-6 w-40" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={`benefit-${index}`} className="h-4 w-full" />
              ))}
            </div>
            <Skeleton className="mt-5 h-12 w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

