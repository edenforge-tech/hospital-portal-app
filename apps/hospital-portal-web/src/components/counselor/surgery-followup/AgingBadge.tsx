'use client';

/**
 * AgingBadge
 * Color-coded chip showing how many days have elapsed since the counseling session.
 * green < 3 days | amber 3–7 days | red > 7 days
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface AgingBadgeProps {
  daysSince: number;
  className?: string;
}

export function AgingBadge({ daysSince, className }: AgingBadgeProps) {
  const isGreen  = daysSince < 3;
  const isAmber  = daysSince >= 3 && daysSince <= 7;
  // else red

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full',
        isGreen  ? 'bg-green-100 text-green-700' :
        isAmber  ? 'bg-amber-100 text-amber-700' :
                   'bg-red-100  text-red-700',
        className
      )}
    >
      <span className={cn(
        'inline-block w-1.5 h-1.5 rounded-full',
        isGreen  ? 'bg-green-500' :
        isAmber  ? 'bg-amber-500' :
                   'bg-red-500 animate-pulse'
      )} />
      {daysSince === 0 ? 'Today' : `${daysSince}d ago`}
    </span>
  );
}
