import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function QuestionCardSkeleton() {
  return (
    <Card className="art-deco-border p-5 bg-card/50 backdrop-blur-sm h-[300px]">
      <div className="h-full flex flex-col">
        {/* Question text skeleton */}
        <div className="mb-4 space-y-2">
          <Skeleton className="h-6 w-full bg-secondary/30" />
          <Skeleton className="h-6 w-3/4 mx-auto bg-secondary/30" />
        </div>

        {/* Tags skeleton */}
        <div className="flex justify-center gap-2 mb-4">
          <Skeleton className="h-5 w-16 rounded-full bg-secondary/30" />
          <Skeleton className="h-5 w-20 rounded-full bg-secondary/30" />
        </div>

        {/* Chili rating skeleton */}
        <div className="flex justify-center gap-1 mb-4">
          <Skeleton className="h-5 w-5 bg-secondary/30" />
          <Skeleton className="h-5 w-5 bg-secondary/30" />
          <Skeleton className="h-5 w-5 bg-secondary/30" />
        </div>

        {/* Action text skeleton */}
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="h-4 w-48 bg-secondary/30" />
        </div>
      </div>
    </Card>
  );
}

export function SecretCardSkeleton() {
  return (
    <Card className="art-deco-border p-5 bg-card/50 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full bg-secondary/30" />
          <Skeleton className="h-4 w-24 bg-secondary/30" />
        </div>
        <Skeleton className="h-3 w-16 bg-secondary/30" />
      </div>

      {/* Badges */}
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-5 w-16 rounded-full bg-secondary/30" />
        <Skeleton className="h-5 w-28 rounded-full bg-secondary/30" />
      </div>

      {/* Question text */}
      <div className="mb-3 pb-2 border-b border-border/50">
        <Skeleton className="h-4 w-full mb-1 bg-secondary/30" />
        <Skeleton className="h-4 w-2/3 bg-secondary/30" />
      </div>

      {/* Content */}
      <div className="mb-4 space-y-2">
        <Skeleton className="h-4 w-full bg-secondary/30" />
        <Skeleton className="h-4 w-5/6 bg-secondary/30" />
        <Skeleton className="h-4 w-4/5 bg-secondary/30" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-32 bg-secondary/30" />
        <Skeleton className="h-4 w-8 bg-secondary/30" />
      </div>
    </Card>
  );
}
