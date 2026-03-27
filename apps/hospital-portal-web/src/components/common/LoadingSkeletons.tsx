import React from 'react';

/**
 * Loading Skeleton Components
 * Used to show placeholder UI while data is loading
 */

interface SkeletonProps {
  className?: string;
}

/**
 * Generic skeleton box with shimmer animation
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-label="Loading..."
    />
  );
}

/**
 * Skeleton for widget card container
 */
export function WidgetCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Skeleton for queue widget
 */
export function QueueWidgetSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 p-6 border-b border-gray-200">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="text-center">
            <Skeleton className="h-5 w-5 mx-auto mb-2" />
            <Skeleton className="h-8 w-12 mx-auto mb-2" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>
      
      {/* Queue List */}
      <div className="flex-1 p-6">
        <Skeleton className="h-4 w-24 mb-3" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for follow-ups widget
 */
export function FollowUpsWidgetSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
      </div>
      
      {/* Follow-ups List */}
      <div className="flex-1 p-6">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for recent sessions widget (table format)
 */
export function RecentSessionsWidgetSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      
      {/* Table Skeleton */}
      <div className="overflow-x-auto">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="grid grid-cols-7 gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-4" />
            ))}
          </div>
        </div>
        
        {/* Table Rows */}
        <div className="divide-y divide-gray-200">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="px-6 py-4">
              <div className="grid grid-cols-7 gap-4 items-center">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for quick actions widget
 */
export function QuickActionsWidgetSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
      
      {/* Actions List */}
      <div className="flex-1 p-6">
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}

/**
 * Skeleton for text content
 */
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} 
        />
      ))}
    </div>
  );
}

/**
 * Skeleton for avatar
 */
export function AvatarSkeleton() {
  return <Skeleton className="h-10 w-10 rounded-full" />;
}

/**
 * Skeleton for button
 */
export function ButtonSkeleton() {
  return <Skeleton className="h-10 w-24 rounded-lg" />;
}

/**
 * Skeleton for card
 */
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <Skeleton className="h-6 w-48 mb-4" />
      <TextSkeleton lines={4} />
      <div className="flex gap-2 mt-4">
        <ButtonSkeleton />
        <ButtonSkeleton />
      </div>
    </div>
  );
}
