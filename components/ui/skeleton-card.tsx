interface SkeletonCardProps {
  minHeight?: number;
  lineWidths?: string[];
  className?: string;
}

export function SkeletonCard({ minHeight = 140, lineWidths = ["80%", "60%", "75%"], className = "" }: SkeletonCardProps) {
  return (
    <article className={`k-module-card k-skeleton-card p-5 ${className}`.trim()} style={{ minHeight }} aria-hidden="true">
      <div className="k-skeleton-shimmer h-[14px] w-2/5 rounded" />

      <div className="mt-4 space-y-2.5">
        {lineWidths.map((width, index) => (
          <div key={`${width}-${index}`} className="k-skeleton-shimmer h-3 rounded" style={{ width }} />
        ))}
      </div>
    </article>
  );
}
