'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ItemPickerDropdown } from './ItemPickerDropdown';
import { ItemDto } from '@/lib/api/inventory-service.api';

/**
 * PharmacyBillLineEditor
 * Editable list of line items for creating a pharmacy bill.
 * Each line: item, quantity, batch reference (read-only from FEFO), unit rate, total.
 */
export interface PharmacyBillLine {
  itemId: string;
  itemName: string;
  stockBatchId?: string;
  batchNumber?: string;
  quantity: number;
  unitRate: number;
  mrp: number;
  remarks?: string;
}

interface Props {
  lines: PharmacyBillLine[];
  onChange: (lines: PharmacyBillLine[]) => void;
  disabled?: boolean;
}

const emptyLine = (): PharmacyBillLine => ({
  itemId: '',
  itemName: '',
  quantity: 1,
  unitRate: 0,
  mrp: 0,
});

export function PharmacyBillLineEditor({ lines, onChange, disabled = false }: Props) {
  const addLine   = () => onChange([...lines, emptyLine()]);
  const removeLine = (idx: number) => onChange(lines.filter((_, i) => i !== idx));

  const update = (idx: number, field: keyof PharmacyBillLine, value: string | number) => {
    const next = [...lines];
    (next[idx] as any)[field] = value;
    onChange(next);
  };

  const selectItem = (idx: number, item: ItemDto | null) => {
    const next = [...lines];
    if (item) {
      next[idx].itemId   = item.id;
      next[idx].itemName = item.itemName;
    } else {
      next[idx].itemId   = '';
      next[idx].itemName = '';
    }
    onChange(next);
  };

  const total = lines.reduce((s, l) => s + l.quantity * l.unitRate, 0);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider">
              <th className="px-2 py-2 text-left font-medium">Item</th>
              <th className="px-2 py-2 text-right font-medium w-20">Qty</th>
              <th className="px-2 py-2 text-right font-medium w-24">Rate</th>
              <th className="px-2 py-2 text-right font-medium w-24">Amount</th>
              {!disabled && <th className="w-8" />}
            </tr>
          </thead>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-2 py-1.5">
                  <ItemPickerDropdown
                    value={line.itemId || null}
                    itemName={line.itemName}
                    onSelect={item => selectItem(idx, item)}
                    disabled={disabled}
                    className="min-w-[180px]"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    min={0.001}
                    step={0.001}
                    value={line.quantity}
                    onChange={e => update(idx, 'quantity', Number(e.target.value))}
                    disabled={disabled}
                    className="w-full border border-gray-300 rounded px-1 py-0.5 text-right text-xs disabled:bg-gray-50"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={line.unitRate}
                    onChange={e => update(idx, 'unitRate', Number(e.target.value))}
                    disabled={disabled}
                    className="w-full border border-gray-300 rounded px-1 py-0.5 text-right text-xs disabled:bg-gray-50"
                  />
                </td>
                <td className="px-2 py-1.5 text-right font-medium">
                  ₹{(line.quantity * line.unitRate).toFixed(2)}
                </td>
                {!disabled && (
                  <td className="px-2 py-1.5">
                    <button
                      onClick={() => removeLine(idx)}
                      className="text-red-400 hover:text-red-600"
                      title="Remove line"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        {!disabled && (
          <button
            onClick={addLine}
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          >
            <Plus size={13} /> Add item
          </button>
        )}
        <div className="ml-auto text-sm font-semibold text-gray-900">
          Total: ₹{total.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
