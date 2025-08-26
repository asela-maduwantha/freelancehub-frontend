"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";

const SkeletonBox = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Welcome Section Skeleton */}
      <div className="bg-gray-300 animate-pulse rounded-2xl h-48" />

      {/* Stats Section Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <SkeletonBox className="h-4 w-24" />
              <SkeletonBox className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <SkeletonBox className="h-8 w-16 mb-2" />
              <SkeletonBox className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div>
        <SkeletonBox className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <SkeletonBox className="h-10 w-10 rounded-lg" />
                  <div className="flex-1">
                    <SkeletonBox className="h-5 w-32 mb-2" />
                    <SkeletonBox className="h-4 w-48" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity & Active Projects Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <SkeletonBox className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex items-center space-x-3">
                    <SkeletonBox className="w-2 h-2 rounded-full" />
                    <div className="flex-1">
                      <SkeletonBox className="h-4 w-32 mb-1" />
                      <SkeletonBox className="h-3 w-24" />
                    </div>
                    <SkeletonBox className="h-3 w-12" />
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <SkeletonBox className="h-8 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
