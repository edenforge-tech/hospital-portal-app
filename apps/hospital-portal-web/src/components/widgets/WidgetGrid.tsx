/**
 * Widget Grid Layout Manager
 * Responsive grid layout for widgets
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface WidgetGridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Responsive grid layout for widgets
 * - Mobile: 1 column
 * - Tablet: 2 columns
 * - Desktop: 3 columns
 * - Wide: 4 columns
 */
export function WidgetGrid({ children, className }: WidgetGridProps) {
  return (
    <div
      className={cn(
        'widget-grid',
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        'gap-4 auto-rows-min',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Compact grid for smaller widgets (like stats)
 */
export function WidgetGridCompact({ children, className }: WidgetGridProps) {
  return (
    <div
      className={cn(
        'widget-grid-compact',
        'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6',
        'gap-3 auto-rows-min',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Single column layout for list widgets
 */
export function WidgetStack({ children, className }: WidgetGridProps) {
  return (
    <div
      className={cn(
        'widget-stack',
        'flex flex-col gap-4',
        className
      )}
    >
      {children}
    </div>
  );
}
