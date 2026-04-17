'use client';

import React from 'react';

/**
 * KpiCard
 * Reusable KPI metric card for inventory dashboard panels.
 */
interface Props {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  colorScheme?: 'blue' | 'green' | 'red' | 'amber' | 'gray';
  description?: string;
  onClick?: () => void;
}

const schemeStyles: Record<string, { bg: string; text: string; icon: string }> = {
  blue:  { bg: 'bg-blue-50',   text: 'text-blue-700',   icon: 'text-blue-400'  },
  green: { bg: 'bg-green-50',  text: 'text-green-700',  icon: 'text-green-400' },
  red:   { bg: 'bg-red-50',    text: 'text-red-700',    icon: 'text-red-400'   },
  amber: { bg: 'bg-amber-50',  text: 'text-amber-700',  icon: 'text-amber-400' },
  gray:  { bg: 'bg-gray-50',   text: 'text-gray-700',   icon: 'text-gray-400'  },
};

export function KpiCard({ label, value, icon, colorScheme = 'gray', description, onClick }: Props) {
  const s = schemeStyles[colorScheme];

  return (
    <div
      className={`rounded-xl p-4 ${s.bg} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${s.text}`}>
            {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
          </p>
          {description && (
            <p className="text-xs text-gray-400 mt-1">{description}</p>
          )}
        </div>
        {icon && (
          <div className={`${s.icon} mt-0.5`}>{icon}</div>
        )}
      </div>
    </div>
  );
}
