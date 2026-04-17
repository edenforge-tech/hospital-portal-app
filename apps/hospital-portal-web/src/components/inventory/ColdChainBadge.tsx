'use client';

import { Thermometer } from 'lucide-react';

/**
 * ColdChainBadge
 * Shows a refrigeration indicator for items that require cold storage.
 * Optionally shows a warning variant when the item is in a non-refrigerated store.
 */
interface Props {
  /** If false/undefined the badge is not rendered at all. */
  requiresColdStorage?: boolean;
  /** Show orange "alert" variant when stored in wrong store type. */
  alert?: boolean;
  className?: string;
}

export function ColdChainBadge({ requiresColdStorage, alert = false, className = '' }: Props) {
  if (!requiresColdStorage) return null;

  const base = alert
    ? 'bg-orange-100 text-orange-700 border border-orange-300'
    : 'bg-blue-50  text-blue-600  border border-blue-200';

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${base} ${className}`}
      title={alert ? 'Cold-chain item in non-refrigerated store!' : 'Requires cold storage'}
    >
      <Thermometer size={11} />
      {alert ? 'Cold Chain ⚠' : 'Cold Chain'}
    </span>
  );
}
