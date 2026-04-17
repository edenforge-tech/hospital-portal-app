'use client';

import React from 'react';

/**
 * EmptyState
 * Displays a centered empty-state illustration and message.
 * Used when lists have no items to display.
 */
interface Props {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className = '' }: Props) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      {icon && (
        <div className="text-gray-300 mb-4">{icon}</div>
      )}
      <h3 className="text-sm font-semibold text-gray-600">{title}</h3>
      {description && (
        <p className="text-xs text-gray-400 mt-1 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
