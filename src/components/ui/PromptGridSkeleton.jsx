import PromptCardSkeleton from "@/components/common/PromptCardSkeleton";

export default function PromptGridSkeleton({ count = 4 }) {
  return (
    <div className="responsive-shell-grid">
      {Array.from({ length: count }).map((_, index) => (
        <PromptCardSkeleton key={`prompt-skeleton-${index}`} />
      ))}
    </div>
  );
}
