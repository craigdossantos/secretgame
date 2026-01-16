"use client";

import {
  QuestionCardSkeleton,
  SecretCardSkeleton,
} from "@/components/skeleton-card";

export function RoomLoadingState() {
  return (
    <div className="min-h-screen bg-background art-deco-pattern">
      {/* Header Skeleton */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-secondary/30 animate-pulse" />
              <div className="space-y-2">
                <div className="h-8 w-48 bg-secondary/30 rounded animate-pulse" />
                <div className="h-4 w-24 bg-secondary/30 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-10 w-32 bg-secondary/30 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content Skeletons */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 text-center">
          <div className="h-8 w-64 bg-secondary/30 rounded mx-auto mb-2 animate-pulse" />
          <div className="h-4 w-96 bg-secondary/30 rounded mx-auto animate-pulse" />
        </div>

        {/* Question Cards Skeleton */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <QuestionCardSkeleton />
          <QuestionCardSkeleton />
          <QuestionCardSkeleton />
        </div>

        {/* Secrets Skeleton */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <SecretCardSkeleton />
          <SecretCardSkeleton />
          <SecretCardSkeleton />
        </div>
      </div>
    </div>
  );
}
