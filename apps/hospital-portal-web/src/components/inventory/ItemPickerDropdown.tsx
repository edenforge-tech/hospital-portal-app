'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ScanLine, X } from 'lucide-react';
import { inventoryItemApi, ItemDto } from '@/lib/api/inventory-service.api';
import { ColdChainBadge } from './ColdChainBadge';

/**
 * ItemPickerDropdown
 * Searchable item selector with live API search and optional barcode scan trigger.
 * Displays item type, unit, and cold chain badge in results.
 */
interface Props {
  value?: string | null;
  itemName?: string;
  onSelect: (item: ItemDto | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Show the scan button — parents wire up their barcode scanner */
  onScanClick?: () => void;
}

export function ItemPickerDropdown({
  value,
  itemName,
  onSelect,
  placeholder = 'Search item…',
  disabled = false,
  className = '',
  onScanClick,
}: Props) {
  const [query, setQuery] = useState(itemName ?? '');
  const [results, setResults] = useState<ItemDto[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await inventoryItemApi.list({ search: q, pageSize: 20 });
      setResults(res.items ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (item: ItemDto) => {
    setQuery(item.itemName);
    setResults([]);
    setOpen(false);
    onSelect(item);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    onSelect(null);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="flex items-center border border-gray-300 rounded-md bg-white focus-within:ring-2 focus-within:ring-blue-500">
        <Search size={14} className="ml-2 text-gray-400 shrink-0" />
        <input
          type="text"
          className="flex-1 py-1.5 px-2 text-sm bg-transparent outline-none disabled:bg-gray-50"
          placeholder={placeholder}
          value={query}
          disabled={disabled}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => query.length >= 2 && setOpen(true)}
        />
        {query && !disabled && (
          <button onClick={handleClear} className="mr-1 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
        {onScanClick && (
          <button
            onClick={onScanClick}
            className="mr-1 text-blue-500 hover:text-blue-700"
            title="Scan barcode"
            disabled={disabled}
          >
            <ScanLine size={16} />
          </button>
        )}
      </div>

      {open && (loading || results.length > 0) && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-y-auto">
          {loading && (
            <li className="px-3 py-2 text-xs text-gray-400">Searching…</li>
          )}
          {results.map(item => (
            <li
              key={item.id}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 flex items-center justify-between gap-2"
              onMouseDown={() => handleSelect(item)}
            >
              <div>
                <span className="font-medium text-gray-900">{item.itemName}</span>
                {item.genericName && (
                  <span className="ml-1 text-xs text-gray-500">({item.genericName})</span>
                )}
                <div className="text-xs text-gray-400">{item.itemType} · {item.unit}</div>
              </div>
              <ColdChainBadge requiresColdStorage={item.requiresColdStorage} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
