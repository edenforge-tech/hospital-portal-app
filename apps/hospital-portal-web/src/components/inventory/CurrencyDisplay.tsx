'use client';

import React from 'react';

/**
 * CurrencyDisplay
 * Indian-locale formatted currency display (₹).
 * Shows negative amounts in red, zero as gray.
 */
interface Props {
  amount: number;
  /** Show ₹ prefix (default: true) */
  showSymbol?: boolean;
  /** Decimal places (default: 2) */
  decimals?: number;
  className?: string;
}

export function CurrencyDisplay({
  amount,
  showSymbol = true,
  decimals = 2,
  className = '',
}: Props) {
  const colorClass =
    amount < 0 ? 'text-red-600' :
    amount === 0 ? 'text-gray-400' :
    '';

  const formatted = Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={`tabular-nums ${colorClass} ${className}`}>
      {amount < 0 && '- '}
      {showSymbol && '₹'}
      {formatted}
    </span>
  );
}
