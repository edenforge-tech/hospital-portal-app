'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Package } from 'lucide-react';
import { inventoryItemApi, inventoryStockApi, ItemDto } from '@/lib/api/inventory-service.api';

export interface LastPurchaseInfo {
  lastMrp?: number;
  lastPurchasePrice?: number;
}

export interface ItemSearchModalProps {
  onSelect: (item: ItemDto, lastPurchase?: LastPurchaseInfo) => void;
  onClose: () => void;
  /** Pass the current store ID to show outlet stock for that store */
  storeId?: string;
}

/**
 * ItemSearchModal — search inventory items and select one for GRN entry.
 * Table layout with: Item Name · Item Cost (MRP) · Outlet Stock ·
 *   Company Name (Brand) · Itemrol (ScheduleType) · Chemical Composition (Generic)
 */
export function ItemSearchModal({ onSelect, onClose, storeId }: ItemSearchModalProps) {
  const [query,    setQuery]    = useState('');
  const [items,    setItems]    = useState<ItemDto[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const inputRef  = useRef<HTMLInputElement>(null);
  const timerRef  = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Load stock summary once for the selected store
  useEffect(() => {
    if (!storeId) return;
    inventoryStockApi.getSummary(storeId)
      .then(summary => {
        const map: Record<string, number> = {};
        summary.forEach(s => { map[s.itemId] = s.totalAvailable; });
        setStockMap(map);
      })
      .catch(() => { /* non-critical — stock column shows — */ });
  }, [storeId]);

  // Debounced search
  const search = useCallback((q: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await inventoryItemApi.list({ search: q, pageSize: 60 });
        setItems(result.items ?? (Array.isArray(result) ? (result as ItemDto[]) : []));
      } catch { setItems([]); }
      finally   { setLoading(false); }
    }, 300);
  }, []);

  useEffect(() => { search(query); }, [query, search]);

  const handleSearch = () => { search(query); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative z-10 w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '82vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Select Item</h2>
            <p className="text-xs text-gray-500 mt-0.5">Search by name, generic name, brand or HSN code</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white/70 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0 flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Type item name, generic, brand, HSN…"
              className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
          <button
            onClick={handleSearch}
            className="flex-shrink-0 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
          >
            Search
          </button>
        </div>

        {/* Table results */}
        <div className="overflow-auto flex-1">
          {loading && (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl">
                  {[200, 90, 70, 110, 80, 130].map((w, j) => (
                    <div key={j} className="h-3 bg-gray-100 rounded-full animate-pulse" style={{ width: w }} />
                  ))}
                </div>
              ))}
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package size={32} className="text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">
                {query ? 'No items match your search' : 'Start typing to search items'}
              </p>
            </div>
          )}

          {!loading && items.length > 0 && (
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50/95 border-b border-gray-100">
                  {['Item Name', 'Item Cost (MRP)', 'Outlet Stock', 'Company (Brand)', 'Itemrol', 'Chemical Composition'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-[10px] font-extrabold text-gray-600 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(item => {
                  const stock = storeId ? (stockMap[item.id] ?? null) : null;
                  const stockDisplay = stock === null
                    ? <span className="text-gray-300">—</span>
                    : stock <= 0
                      ? <span className="text-rose-500 font-semibold">Out of stock</span>
                      : <span className="text-emerald-700 font-semibold">{stock}</span>;

                  return (
                    <tr
                      key={item.id}
                      onClick={async () => {
                        let lastPurchase: LastPurchaseInfo | undefined;
                        try {
                          const batches = await inventoryStockApi.getBatches(storeId, item.id);
                          if (batches && batches.length > 0) {
                            const latest = batches[0];
                            lastPurchase = { lastMrp: latest.mrp, lastPurchasePrice: latest.purchaseRate };
                          }
                        } catch { /* non-critical */ }
                        onSelect(item, lastPurchase);
                      }}
                      className="border-b border-gray-50 last:border-0 hover:bg-blue-50/40 cursor-pointer transition-colors group"
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition-colors">
                            <Package size={13} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">{item.itemName}</p>
                            {item.hsnCode && (
                              <p className="text-[10px] text-gray-400 font-mono">HSN {item.hsnCode}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 text-xs whitespace-nowrap">
                        {item.defaultGstRate ? `GST ${item.defaultGstRate}%` : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-3 py-2.5 text-xs whitespace-nowrap">
                        {stockDisplay}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 text-xs max-w-[120px] truncate">
                        {item.brand || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-3 py-2.5">
                        {item.scheduleType ? (
                          <span className="text-[10px] font-semibold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                            {item.scheduleType}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 text-xs max-w-[160px] truncate">
                        {item.genericName || <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400 flex-shrink-0 flex justify-between items-center">
          <span>{!loading && items.length > 0 ? `${items.length} item${items.length !== 1 ? 's' : ''} found` : ''}</span>
          {storeId && <span className="text-[10px] text-teal-600 font-medium">Showing stock for selected store</span>}
        </div>
      </div>
    </div>
  );
}
