/**
 * Collapsed Widget Badge
 * Shows completed step as compact green badge with checkmark
 * Used when counselor moves to next step in workflow
 */

'use client';

import React from 'react';
import { CheckCircle2, Activity as ChevronDown, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsedWidgetBadgeProps {
  widgetId: string;
  label: string;
  icon: any;
  completionSummary: string;
  onClick?: () => void;
  className?: string;
}

export function CollapsedWidgetBadge({
  widgetId,
  label,
  icon: Icon,
  completionSummary,
  onClick,
  className = '',
}: CollapsedWidgetBadgeProps) {
  return (
    <div
      className={cn(
        'bg-green-50 border border-green-300 rounded-lg p-3 transition-all hover:shadow-md',
        onClick && 'cursor-pointer hover:bg-green-100',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        {/* Left: Icon, Label, and Summary */}
        <div className="flex items-center gap-3 flex-1">
          {/* Completion Checkmark */}
          <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
          
          {/* Widget Icon */}
          <Icon className="h-5 w-5 text-green-700 flex-shrink-0" />
          
          {/* Label and Summary */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-green-900">{label}</p>
              <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                Completed
              </span>
            </div>
            <p className="text-sm text-green-700 mt-0.5 truncate">
              {completionSummary}
            </p>
          </div>
        </div>
        
        {/* Right: Expand button (if clickable) */}
        {onClick && (
          <button
            className="ml-2 p-1 hover:bg-green-200 rounded transition-colors"
            aria-label="Expand widget"
          >
            <ChevronDown className="h-4 w-4 text-green-600" />
          </button>
        )}
      </div>
    </div>
  );
}
