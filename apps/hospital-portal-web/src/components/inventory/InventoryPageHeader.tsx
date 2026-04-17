'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * InventoryPageHeader
 * Standardized page header for all inventory sub-pages.
 * Includes title, optional description, action buttons slot, and refresh.
 */
interface Props {
  title: string;
  description?: string;
  onRefresh?: () => void;
  loading?: boolean;
  actions?: React.ReactNode;
}

export function InventoryPageHeader({ title, description, onRefresh, loading = false, actions }: Props) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {actions}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}
