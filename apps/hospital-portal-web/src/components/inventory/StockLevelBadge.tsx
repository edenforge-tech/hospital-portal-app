'use client';

import { AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * StockLevelBadge
 * Color-coded indicator showing whether a store/item combination is
 * below, at, or above its reorder point.
 */
interface Props {
  totalAvailable: number;
  reorderLevel: number;
  unit?: string;
  showQuantity?: boolean;
  className?: string;
}

export function StockLevelBadge({
  totalAvailable,
  reorderLevel,
  unit = '',
  showQuantity = true,
  className = '',
}: Props) {
  const isZero    = totalAvailable === 0;
  const isLow     = totalAvailable > 0 && totalAvailable <= reorderLevel;
  const isOk      = totalAvailable > reorderLevel;

  const style = isZero
    ? 'bg-red-100   text-red-700'
    : isLow
    ? 'bg-amber-100 text-amber-700'
    : 'bg-green-100 text-green-700';

  const Icon = isOk ? CheckCircle : AlertTriangle;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${style} ${className}`}
    >
      <Icon size={11} />
      {showQuantity && (
        <span>
          {totalAvailable.toLocaleString('en-IN')}
          {unit ? ` ${unit}` : ''}
        </span>
      )}
      {isZero && <span>· Zero</span>}
      {isLow  && <span>· Low</span>}
    </span>
  );
}
