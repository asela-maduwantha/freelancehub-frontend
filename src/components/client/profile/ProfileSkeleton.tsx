"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";

const SkeletonBox = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header Skeleton */}
      <div>
        <SkeletonBox className="h-8 w-48 mb-2" />
        <SkeletonBox className="h-4 w-64" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <SkeletonBox className="h-4 w-24" />
              <SkeletonBox className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <SkeletonBox className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Profile Form Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <SkeletonBox className="h-6 w-48" />
            <SkeletonBox className="h-8 w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture Skeleton */}
          <div className="flex items-center space-x-4">
            <SkeletonBox className="w-20 h-20 rounded-full" />
            <div>
              <SkeletonBox className="h-5 w-32 mb-2" />
              <SkeletonBox className="h-4 w-24" />
            </div>
          </div>

          {/* Form Fields Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <SkeletonBox className="h-4 w-24 mb-2" />
              <SkeletonBox className="h-10 w-full" />
            </div>
            <div>
              <SkeletonBox className="h-4 w-20 mb-2" />
              <SkeletonBox className="h-10 w-full" />
            </div>
            <div className="md:col-span-2">
              <SkeletonBox className="h-4 w-16 mb-2" />
              <SkeletonBox className="h-10 w-full" />
            </div>
            <div className="md:col-span-2">
              <SkeletonBox className="h-4 w-32 mb-2" />
              <SkeletonBox className="h-24 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
