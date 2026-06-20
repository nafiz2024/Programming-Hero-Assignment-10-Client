import Skeleton from "@/components/ui/Skeleton";
import TableSkeleton from "@/components/ui/TableSkeleton";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 desktop:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`stat-${index}`} className="pf-card rounded-lg p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 desktop:grid-cols-[1.3fr_1fr_0.9fr]">
        <div className="pf-card rounded-lg p-4">
          <Skeleton className="mb-5 h-3 w-32" />
          <Skeleton className="h-40 w-full rounded-md" />
        </div>
        <div className="pf-card rounded-lg p-4">
          <Skeleton className="mb-5 h-3 w-24" />
          <div className="grid h-40 grid-cols-7 items-end gap-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={`bar-${index}`} className={`w-full rounded-md ${index % 2 === 0 ? "h-24" : "h-16"}`} />
            ))}
          </div>
        </div>
        <div className="pf-card rounded-lg p-4">
          <Skeleton className="mb-5 h-3 w-28" />
          <div className="flex items-center gap-5">
            <Skeleton className="h-28 w-28 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          </div>
        </div>
      </div>

      <TableSkeleton columns={7} rows={4} />
    </div>
  );
}
