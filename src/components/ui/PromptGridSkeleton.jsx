import CardSkeleton from "@/components/ui/CardSkeleton";

export default function PromptGridSkeleton({ count = 4 }) {
  return (
    <div className="responsive-shell-grid">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={`prompt-skeleton-${index}`} />
      ))}
    </div>
  );
}
