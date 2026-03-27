'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface Filter {
  key: string;
  label: string;
  value: string;
}

interface AdvancedFiltersProps {
  children: React.ReactNode;
  onClear?: () => void;
}

interface ActiveFiltersProps {
  filters?: Filter[];
  onRemove: (key: string) => void;
  onClearAll?: () => void;
}

export function AdvancedFilters({ children, onClear }: AdvancedFiltersProps) {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Advanced Filters</h3>
        {onClear && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear All
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );
}

export function ActiveFilters({ filters, onRemove, onClearAll }: ActiveFiltersProps) {
  if (!filters || filters.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap p-3 bg-blue-50 rounded-lg border border-blue-200">
      <span className="text-sm font-medium text-gray-700">Active Filters:</span>
      {filters.map((filter) => (
        <Badge key={filter.key} variant="secondary" className="gap-1">
          <span className="text-xs">
            {filter.label}: {filter.value}
          </span>
          <button
            onClick={() => onRemove(filter.key)}
            className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {onClearAll && filters.length > 1 && (
        <Button variant="ghost" size="sm" onClick={onClearAll} className="h-6 text-xs">
          Clear All
        </Button>
      )}
    </div>
  );
}
