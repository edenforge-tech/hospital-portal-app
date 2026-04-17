'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ItemPickerDropdown } from './ItemPickerDropdown';
import { ItemDto } from '@/lib/api/inventory-service.api';

/**
 * SurgeryConsumableForm
 * Editable line items for recording OT (Operating Theatre) consumable usage
 * against a surgery/IP encounter.
 */
export interface SurgeryConsumableLine {
  itemId: string;
  itemName: string;
  stockBatchId?: string;
  quantity: number;
  unitRate: number;
  remarks?: string;
}

interface Props {
  patientIpNo: string;
  surgeryId?: string;
  lines: SurgeryConsumableLine[];
  onChange: (lines: SurgeryConsumableLine[]) => void;
  disabled?: boolean;
}

const emptyLine = (): SurgeryConsumableLine => ({
  itemId: '',
  itemName: '',
  quantity: 1,
  unitRate: 0,
});

export function SurgeryConsumableForm({
  patientIpNo,
  surgeryId,
  lines,
  onChange,
  disabled = false,
}: Props) {
  const addLine    = () => onChange([...lines, emptyLine()]);
  const removeLine = (idx: number) => onChange(lines.filter((_, i) => i !== idx));

  const update = (idx: number, field: keyof SurgeryConsumableLine, value: string | number) => {
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

  return (
    <div className="space-y-3">
      {/* Context */}
      <div className="text-xs text-gray-500 flex gap-4">
        <span>IP: <strong className="text-gray-800">{patientIpNo || '—'}</strong></span>
        {surgeryId && <span>Surgery: <strong className="text-gray-800">{surgeryId}</strong></span>}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider">
              <th className="px-2 py-2 text-left font-medium">Item / Consumable</th>
              <th className="px-2 py-2 text-right font-medium w-20">Qty</th>
              <th className="px-2 py-2 text-right font-medium w-24">Unit Rate</th>
              <th className="px-2 py-2 text-right font-medium w-24">Amount</th>
              <th className="px-2 py-2 text-left font-medium">Remarks</th>
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
                <td className="px-2 py-1.5">
                  <input
                    type="text"
                    value={line.remarks ?? ''}
                    onChange={e => update(idx, 'remarks', e.target.value)}
                    disabled={disabled}
                    placeholder="Notes…"
                    className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs disabled:bg-gray-50"
                  />
                </td>
                {!disabled && (
                  <td className="px-2 py-1.5">
                    <button
                      onClick={() => removeLine(idx)}
                      className="text-red-400 hover:text-red-600"
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

      {!disabled && (
        <button
          onClick={addLine}
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
        >
          <Plus size={13} /> Add consumable
        </button>
      )}
    </div>
  );
}
