import Skeleton from "@/components/ui/Skeleton";

export default function CardSkeleton() {
  return (
    <div className="pf-card rounded-lg p-4">
      <Skeleton className="mb-4 aspect-[4/3] w-full rounded-md" />
      <Skeleton className="mb-3 h-4 w-3/4" />
      <Skeleton className="mb-4 h-4 w-1/2" />
      <div className="mb-4 border-t border-white/8 pt-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
      <Skeleton className="h-12 w-full rounded-md" />
    </div>
  );
}
