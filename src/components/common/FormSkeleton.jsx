import Skeleton from "@/components/ui/Skeleton";

function FieldBlock({ tall = false }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className={tall ? "h-32 w-full rounded-2xl" : "h-12 w-full rounded-2xl"} />
    </div>
  );
}

export default function FormSkeleton({ sidebar = true }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
      <div className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-4 md:grid-cols-2">
          <FieldBlock />
          <FieldBlock />
        </div>
        <FieldBlock tall />
        <div className="grid gap-4 md:grid-cols-2">
          <FieldBlock />
          <FieldBlock />
        </div>
        <FieldBlock tall />
        <div className="grid gap-3 md:grid-cols-3">
          <Skeleton className="h-12 w-full rounded-full" />
          <Skeleton className="h-12 w-full rounded-full" />
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>

      {sidebar ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`form-sidebar-${index}`}
              className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6"
            >
              <Skeleton className="h-7 w-40" />
              <div className="mt-5 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
