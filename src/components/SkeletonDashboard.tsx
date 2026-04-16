
import { Skeleton } from '@/components/ui/skeleton';

function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-5 ${className}`}>
      <Skeleton className="shimmer h-4 w-24 mb-3" />
      <Skeleton className="shimmer h-8 w-32 mb-2" />
      <Skeleton className="shimmer h-3 w-20" />
    </div>
  );
}

function SkeletonChart({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-5 ${className}`}>
      <Skeleton className="shimmer h-4 w-32 mb-4" />
      <Skeleton className="shimmer h-48 w-full rounded-lg" />
    </div>
  );
}

export default function SkeletonDashboard() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Hero stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <SkeletonChart />
        <SkeletonChart />
      </div>
      {/* Rating cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
      {/* Insight skeleton */}
      <div className="rounded-xl border border-border bg-card p-5">
        <Skeleton className="shimmer h-4 w-40 mb-3" />
        <Skeleton className="shimmer h-3 w-full mb-2" />
        <Skeleton className="shimmer h-3 w-5/6 mb-2" />
        <Skeleton className="shimmer h-3 w-4/6" />
      </div>
    </div>
  );
}
