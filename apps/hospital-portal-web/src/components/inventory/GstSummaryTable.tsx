'use client';

import React from 'react';
import { GstSummaryByRateDto } from '@/lib/api/inventory-service.api';

/**
 * GstSummaryTable
 * Renders a GST rate-wise breakdown for an invoice or monthly report.
 */
interface Props {
  rows: GstSummaryByRateDto[];
  className?: string;
}

const fmt = (n: number) => `₹${n.toFixed(2)}`;

export function GstSummaryTable({ rows, className = '' }: Props) {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-400">No GST data.</p>;
  }

  const totals = rows.reduce(
    (acc, r) => ({
      taxable:   acc.taxable   + r.taxableAmount,
      cgst:      acc.cgst      + r.cgstAmount,
      sgst:      acc.sgst      + r.sgstAmount,
      igst:      acc.igst      + r.igstAmount,
      totalGst:  acc.totalGst  + r.totalGstAmount,
    }),
    { taxable: 0, cgst: 0, sgst: 0, igst: 0, totalGst: 0 }
  );

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider">
            <th className="px-3 py-2 text-left font-medium">GST Rate</th>
            <th className="px-3 py-2 text-right font-medium">Taxable</th>
            <th className="px-3 py-2 text-right font-medium">CGST</th>
            <th className="px-3 py-2 text-right font-medium">SGST</th>
            <th className="px-3 py-2 text-right font-medium">IGST</th>
            <th className="px-3 py-2 text-right font-medium">Total GST</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-3 py-2 font-medium">{row.gstRate}%</td>
              <td className="px-3 py-2 text-right">{fmt(row.taxableAmount)}</td>
              <td className="px-3 py-2 text-right">{fmt(row.cgstAmount)}</td>
              <td className="px-3 py-2 text-right">{fmt(row.sgstAmount)}</td>
              <td className="px-3 py-2 text-right">{fmt(row.igstAmount)}</td>
              <td className="px-3 py-2 text-right font-medium">{fmt(row.totalGstAmount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 font-semibold text-sm border-t-2 border-gray-300">
            <td className="px-3 py-2">Total</td>
            <td className="px-3 py-2 text-right">{fmt(totals.taxable)}</td>
            <td className="px-3 py-2 text-right">{fmt(totals.cgst)}</td>
            <td className="px-3 py-2 text-right">{fmt(totals.sgst)}</td>
            <td className="px-3 py-2 text-right">{fmt(totals.igst)}</td>
            <td className="px-3 py-2 text-right">{fmt(totals.totalGst)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
