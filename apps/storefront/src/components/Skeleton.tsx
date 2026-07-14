export function ProductCardSkeleton() {
  return (
    <div className="double-bezel animate-pulse">
      <div className="double-bezel-inner">
        <div className="aspect-[4/3] bg-panel-elevated" />
        <div className="space-y-3 p-5">
          <div className="h-3 w-1/3 rounded bg-white/10" />
          <div className="h-4 w-full rounded bg-white/10" />
          <div className="h-4 w-2/3 rounded bg-white/10" />
          <div className="h-5 w-1/2 rounded bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-24">
      <div className="mb-10 h-10 w-1/3 animate-pulse rounded-lg bg-white/10" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
