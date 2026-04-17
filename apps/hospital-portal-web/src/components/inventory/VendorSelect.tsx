'use client';

import React, { useState, useEffect } from 'react';
import { inventoryVendorApi, VendorDto } from '@/lib/api/inventory-service.api';

/**
 * VendorSelect
 * Dropdown for selecting a vendor from the active vendor list.
 * Loads all vendors once on mount (vendors are a bounded list).
 */
interface Props {
  value?: string | null;
  onChange: (vendor: VendorDto | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function VendorSelect({
  value,
  onChange,
  placeholder = 'Select vendor…',
  disabled = false,
  className = '',
}: Props) {
  const [vendors, setVendors] = useState<VendorDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inventoryVendorApi
      .list(1, 200)
      .then(res => setVendors(res.items ?? []))
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = vendors.find(v => v.id === e.target.value) ?? null;
    onChange(selected);
  };

  return (
    <select
      className={`border border-gray-300 rounded-md text-sm py-1.5 px-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 ${className}`}
      value={value ?? ''}
      onChange={handleChange}
      disabled={disabled || loading}
    >
      <option value="">{loading ? 'Loading…' : placeholder}</option>
      {vendors
        .filter(v => v.status === 'active')
        .map(v => (
          <option key={v.id} value={v.id}>
            {v.name} {v.vendorCode ? `(${v.vendorCode})` : ''}
          </option>
        ))}
    </select>
  );
}
