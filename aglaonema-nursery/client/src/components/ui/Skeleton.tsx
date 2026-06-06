export function ProductCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="aspect-square bg-cream-300" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-cream-300 rounded w-1/2" />
        <div className="h-4 bg-cream-300 rounded w-3/4" />
        <div className="h-3 bg-cream-300 rounded w-1/3" />
        <div className="h-5 bg-cream-300 rounded w-1/2" />
      </div>
    </div>
  );
}

export function TextSkeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-cream-300 rounded ${className}`} />;
}
