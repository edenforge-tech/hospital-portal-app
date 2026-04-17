'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * PagedTable
 * Generic paginated table wrapper.
 * Renders a table with a header slot, body slot, and pagination controls.
 */
interface Props {
  totalItems: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  children: React.ReactNode;   // <table> element
  className?: string;
}

export function PagedTable({
  totalItems,
  page,
  pageSize,
  onPageChange,
  loading = false,
  children,
  className = '',
}: Props) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end   = Math.min(page * pageSize, totalItems);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Table */}
      <div className={`overflow-x-auto rounded-md border border-gray-200 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        {children}
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {start}–{end} of {totalItems.toLocaleString('en-IN')}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
