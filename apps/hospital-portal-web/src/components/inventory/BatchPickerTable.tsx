'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { StockBatchDto } from '@/lib/api/inventory-service.api';
import { ExpiryDateBadge } from './ExpiryDateBadge';
import { ColdChainBadge } from './ColdChainBadge';

/**
 * BatchPickerTable
 * FEFO-ordered table of available stock batches for selecting during
 * pharmacy issue, OT consumption, or manual stock deduction.
 */
interface Props {
  batches: StockBatchDto[];
  selectedId?: string | null;
  onSelect?: (batch: StockBatchDto) => void;
  className?: string;
}

export function BatchPickerTable({ batches, selectedId, onSelect, className = '' }: Props) {
  if (batches.length === 0) {
    return <p className="text-sm text-gray-400 py-4 text-center">No batches available.</p>;
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider">
            <th className="px-3 py-2 text-left font-medium w-6" />
            <th className="px-3 py-2 text-left font-medium">Batch</th>
            <th className="px-3 py-2 text-left font-medium">Expiry</th>
            <th className="px-3 py-2 text-right font-medium">Available</th>
            <th className="px-3 py-2 text-right font-medium">MRP</th>
            <th className="px-3 py-2 text-right font-medium">Purchase Rate</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {batches.map((batch, idx) => {
            const isSelected = batch.id === selectedId;
            return (
              <tr
                key={batch.id}
                onClick={() => onSelect?.(batch)}
                className={`cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-50 border-l-2 border-blue-500'
                    : idx % 2 === 0
                    ? 'bg-white hover:bg-gray-50'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <td className="px-3 py-2">
                  {isSelected && <CheckCircle size={14} className="text-blue-600" />}
                </td>
                <td className="px-3 py-2 font-medium text-gray-900">
                  {batch.batchNumber ?? 'AUTO'}
                  {batch.barcode && (
                    <div className="text-gray-400 font-normal">{batch.barcode}</div>
                  )}
                </td>
                <td className="px-3 py-2">
                  <ExpiryDateBadge date={batch.expiryDate} />
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {batch.quantityAvailable} {batch.unitOfMeasure ?? ''}
                </td>
                <td className="px-3 py-2 text-right">₹{batch.mrp.toFixed(2)}</td>
                <td className="px-3 py-2 text-right">₹{batch.purchaseRate.toFixed(2)}</td>
                <td className="px-3 py-2">
                  <ColdChainBadge requiresColdStorage={batch.requiresColdStorage} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
