'use client';

import React, { useState, useEffect } from 'react';
import { inventoryStoreApi, StoreDto } from '@/lib/api/inventory-service.api';

/**
 * StoreSelect
 * Dropdown for selecting a store (pharmacy, OT, central store, etc.)
 * Optionally filters by storeType.
 */
interface Props {
  value?: string | null;
  onChange: (store: StoreDto | null) => void;
  filterType?: string;            // e.g. "Pharmacy" | "OT" | "Central"
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function StoreSelect({
  value,
  onChange,
  filterType,
  placeholder = 'Select store…',
  disabled = false,
  className = '',
}: Props) {
  const [stores, setStores] = useState<StoreDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inventoryStoreApi
      .list()
      .then(res => setStores(res))
      .catch(() => setStores([]))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = stores.find(s => s.id === e.target.value) ?? null;
    onChange(selected);
  };

  const visible = filterType
    ? stores.filter(s => s.storeType === filterType)
    : stores;

  return (
    <select
      className={`border border-gray-300 rounded-md text-sm py-1.5 px-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 ${className}`}
      value={value ?? ''}
      onChange={handleChange}
      disabled={disabled || loading}
    >
      <option value="">{loading ? 'Loading…' : placeholder}</option>
      {visible.map(s => (
        <option key={s.id} value={s.id}>
          {s.storeName} ({s.storeType})
        </option>
      ))}
    </select>
  );
}
