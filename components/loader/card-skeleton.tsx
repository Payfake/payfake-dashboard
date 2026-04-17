"use client";

import { Skeleton } from "./skeleton";

interface CardSkeletonProps {
  count?: number;
}

export function CardSkeleton({ count = 3 }: CardSkeletonProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-6 bg-white/5 border border-white/10 rounded-xl"
        >
          <Skeleton width="w-10" height="h-10" rounded="lg" className="mb-4" />
          <Skeleton width="w-3/4" height="h-5" className="mb-2" />
          <Skeleton width="w-full" height="h-4" />
        </div>
      ))}
    </div>
  );
}
