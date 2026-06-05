export function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-secondary mb-3" />
      <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
      <div className="h-4 bg-secondary rounded w-1/3" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {Array(count)
        .fill(null)
        .map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
    </div>
  );
}
