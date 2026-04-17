'use client';

import React from 'react';

/**
 * InvoiceFinancialSummary
 * Read-only display of invoice gross, discount, taxes, and net total.
 * Used in invoice detail drawers and GRN approval screens.
 */
interface Props {
  grossAmount: number;
  discountAmount: number;
  taxableAmount: number;
  totalGst: number;
  tcsPercent?: number;
  tcsAmount?: number;
  netAmount: number;
  className?: string;
}

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? 'font-semibold border-t pt-2 mt-1' : ''}`}>
      <span className={bold ? 'text-gray-900' : 'text-gray-500'}>{label}</span>
      <span className={bold ? 'text-gray-900' : 'text-gray-700'}>{value}</span>
    </div>
  );
}

const fmt = (n: number) => `₹${n.toFixed(2)}`;

export function InvoiceFinancialSummary({
  grossAmount,
  discountAmount,
  taxableAmount,
  totalGst,
  tcsPercent,
  tcsAmount = 0,
  netAmount,
  className = '',
}: Props) {
  return (
    <div className={`bg-gray-50 rounded-lg p-4 space-y-1.5 ${className}`}>
      <Row label="Gross"    value={fmt(grossAmount)} />
      <Row label="Discount" value={`- ${fmt(discountAmount)}`} />
      <Row label="Taxable"  value={fmt(taxableAmount)} />
      <Row label="GST"      value={fmt(totalGst)} />
      {tcsAmount > 0 && (
        <Row label={`TCS (${tcsPercent ?? 0}%)`} value={fmt(tcsAmount)} />
      )}
      <Row label="Net Amount" value={fmt(netAmount)} bold />
    </div>
  );
}
