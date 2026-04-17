'use client';

import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { GrnItemDto } from '@/lib/api/inventory-service.api';
import { ExpiryDateBadge } from './ExpiryDateBadge';
import { ColdChainBadge } from './ColdChainBadge';

/**
 * GrnLineItemTable
 * Displays GRN line items with accept/reject quantities, batch info and expiry.
 * Used in GRN detail drawers and approval screens.
 */
interface Props {
  items: GrnItemDto[];
  /** When provided, shows editable accept/reject columns */
  editable?: boolean;
  onItemChange?: (idx: number, field: 'acceptedQty' | 'rejectedQty' | 'batchNumber' | 'expiryDate', value: string | number) => void;
  className?: string;
}

export function GrnLineItemTable({ items, editable = false, onItemChange, className = '' }: Props) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-400 py-4 text-center">No line items.</p>;
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider">
            <th className="px-3 py-2 text-left font-medium">Item</th>
            <th className="px-3 py-2 text-right font-medium">Ordered</th>
            <th className="px-3 py-2 text-right font-medium">Accepted</th>
            <th className="px-3 py-2 text-right font-medium">Rejected</th>
            <th className="px-3 py-2 text-left font-medium">Batch</th>
            <th className="px-3 py-2 text-left font-medium">Expiry</th>
            <th className="px-3 py-2 text-right font-medium">Rate</th>
            <th className="px-3 py-2 text-center font-medium">Verified</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr
              key={item.id}
              className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              <td className="px-3 py-2">
                <span className="font-medium text-gray-900">{item.itemName}</span>
              </td>
              <td className="px-3 py-2 text-right">{item.orderedQty}</td>

              {/* Accepted */}
              <td className="px-3 py-2 text-right">
                {editable ? (
                  <input
                    type="number"
                    min={0}
                    max={item.orderedQty}
                    value={item.acceptedQty}
                    onChange={e => onItemChange?.(idx, 'acceptedQty', Number(e.target.value))}
                    className="w-20 border border-gray-300 rounded px-1 py-0.5 text-right text-xs"
                  />
                ) : (
                  <span className={item.acceptedQty > 0 ? 'text-green-700 font-medium' : 'text-gray-400'}>
                    {item.acceptedQty}
                  </span>
                )}
              </td>

              {/* Rejected */}
              <td className="px-3 py-2 text-right">
                {editable ? (
                  <input
                    type="number"
                    min={0}
                    value={item.rejectedQty}
                    onChange={e => onItemChange?.(idx, 'rejectedQty', Number(e.target.value))}
                    className="w-20 border border-gray-300 rounded px-1 py-0.5 text-right text-xs"
                  />
                ) : (
                  <span className={item.rejectedQty > 0 ? 'text-red-600' : 'text-gray-400'}>
                    {item.rejectedQty}
                  </span>
                )}
              </td>

              {/* Batch */}
              <td className="px-3 py-2">
                {editable ? (
                  <input
                    type="text"
                    value={item.batchNumber ?? ''}
                    onChange={e => onItemChange?.(idx, 'batchNumber', e.target.value)}
                    className="w-28 border border-gray-300 rounded px-1 py-0.5 text-xs"
                    placeholder="Batch #"
                  />
                ) : (
                  <span className="text-gray-700">{item.batchNumber ?? '—'}</span>
                )}
              </td>

              {/* Expiry */}
              <td className="px-3 py-2">
                {editable ? (
                  <input
                    type="date"
                    value={item.expiryDate ? item.expiryDate.slice(0, 10) : ''}
                    onChange={e => onItemChange?.(idx, 'expiryDate', e.target.value)}
                    className="w-32 border border-gray-300 rounded px-1 py-0.5 text-xs"
                  />
                ) : (
                  <ExpiryDateBadge date={item.expiryDate} />
                )}
              </td>

              <td className="px-3 py-2 text-right">
                ₹{item.unitRate.toFixed(2)}
              </td>

              <td className="px-3 py-2 text-center">
                {item.isVerified
                  ? <CheckCircle size={14} className="text-green-500 mx-auto" />
                  : <XCircle   size={14} className="text-gray-300 mx-auto" />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
