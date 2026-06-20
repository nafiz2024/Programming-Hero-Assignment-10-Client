import Skeleton from "@/components/ui/Skeleton";

export default function TableSkeleton({ columns = 6, rows = 4 }) {
  return (
    <div className="pf-card rounded-lg p-4">
      <div className="space-y-3">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={`header-${index}`} className="h-3 w-full rounded-full" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="grid gap-4 border-t border-white/6 pt-3"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((__, cellIndex) => (
              <Skeleton key={`cell-${rowIndex}-${cellIndex}`} className="h-3.5 w-full rounded-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
