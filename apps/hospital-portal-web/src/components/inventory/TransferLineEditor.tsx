'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ItemPickerDropdown } from './ItemPickerDropdown';
import { BatchPickerTable } from './BatchPickerTable';
import { StockBatchDto, ItemDto } from '@/lib/api/inventory-service.api';

/**
 * TransferLineEditor
 * Editable line items for a stock transfer between stores.
 * Each line requires an item, a source batch (from FEFO list), and quantity.
 */
export interface TransferLine {
  itemId: string;
  itemName: string;
  stockBatchId: string;
  batchNumber?: string;
  transferQuantity: number;
  unitRate: number;
  availableBatches?: StockBatchDto[];
  showBatchPicker?: boolean;
}

interface Props {
  fromStoreId?: string;
  lines: TransferLine[];
  onChange: (lines: TransferLine[]) => void;
  onFetchBatches?: (storeId: string, itemId: string) => Promise<StockBatchDto[]>;
  disabled?: boolean;
}

const emptyLine = (): TransferLine => ({
  itemId: '',
  itemName: '',
  stockBatchId: '',
  transferQuantity: 1,
  unitRate: 0,
  availableBatches: [],
  showBatchPicker: false,
});

export function TransferLineEditor({
  fromStoreId,
  lines,
  onChange,
  onFetchBatches,
  disabled = false,
}: Props) {
  const addLine    = () => onChange([...lines, emptyLine()]);
  const removeLine = (idx: number) => onChange(lines.filter((_, i) => i !== idx));

  const update = (idx: number, patch: Partial<TransferLine>) => {
    const next = [...lines];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  const selectItem = async (idx: number, item: ItemDto | null) => {
    if (!item) {
      update(idx, { itemId: '', itemName: '', stockBatchId: '', availableBatches: [] });
      return;
    }
    const batches = fromStoreId && onFetchBatches
      ? await onFetchBatches(fromStoreId, item.id).catch(() => [])
      : [];
    update(idx, { itemId: item.id, itemName: item.itemName, availableBatches: batches, stockBatchId: '' });
  };

  const selectBatch = (idx: number, batch: StockBatchDto) => {
    update(idx, {
      stockBatchId: batch.id,
      batchNumber: batch.batchNumber,
      unitRate: batch.purchaseRate,
      showBatchPicker: false,
    });
  };

  return (
    <div className="space-y-4">
      {lines.map((line, idx) => (
        <div key={idx} className="border border-gray-200 rounded-md p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Item</label>
              <ItemPickerDropdown
                value={line.itemId || null}
                itemName={line.itemName}
                onSelect={item => selectItem(idx, item)}
                disabled={disabled}
              />
            </div>
            <div className="w-28">
              <label className="block text-xs text-gray-500 mb-1">Qty</label>
              <input
                type="number"
                min={0.001}
                step={0.001}
                value={line.transferQuantity}
                onChange={e => update(idx, { transferQuantity: Number(e.target.value) })}
                disabled={disabled}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-right disabled:bg-gray-50"
              />
            </div>
            {!disabled && (
              <button
                onClick={() => removeLine(idx)}
                className="mt-5 text-red-400 hover:text-red-600"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>

          {/* Batch picker */}
          {line.itemId && !disabled && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500">
                  Batch: <strong className="text-gray-800">{line.batchNumber ?? 'not selected'}</strong>
                </span>
                <button
                  className="text-xs text-blue-600 hover:underline"
                  onClick={() => update(idx, { showBatchPicker: !line.showBatchPicker })}
                >
                  {line.showBatchPicker ? 'Hide batches' : 'Select batch'}
                </button>
              </div>
              {line.showBatchPicker && (
                <BatchPickerTable
                  batches={line.availableBatches ?? []}
                  selectedId={line.stockBatchId}
                  onSelect={batch => selectBatch(idx, batch)}
                />
              )}
            </div>
          )}
        </div>
      ))}

      {!disabled && (
        <button
          onClick={addLine}
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
        >
          <Plus size={13} /> Add transfer line
        </button>
      )}
    </div>
  );
}
