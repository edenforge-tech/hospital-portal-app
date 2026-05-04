/**
 * useInventoryReferenceData.ts
 *
 * Shared React Query hooks for inventory reference/master data.
 * All data is cached per-session (staleTime) so repeat calls across
 * modals and pages are served instantly from cache without network hits.
 *
 * Cache times:
 *  - vendors / stores  → 5 min  (can change intra-session)
 *  - categories / branches → 10 min (very stable)
 *  - items search      → 2 min  (search-keyed, can change)
 */

import { useQuery } from '@tanstack/react-query';
import {
  inventoryVendorApi,
  inventoryStoreApi,
  inventoryCategoryApi,
  inventoryItemApi,
} from '@/lib/api/inventory-service.api';
import { branchesApi } from '@/lib/api';

// ─── Vendors ─────────────────────────────────────────────────────────────────

export function useVendors() {
  return useQuery({
    queryKey: ['inv', 'vendors'],
    queryFn: () => inventoryVendorApi.list(1, 200).then(r => r.items ?? []),
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Stores ──────────────────────────────────────────────────────────────────

export function useStores() {
  return useQuery({
    queryKey: ['inv', 'stores'],
    queryFn: () => inventoryStoreApi.list(),
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Categories ──────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: ['inv', 'categories'],
    queryFn: () => inventoryCategoryApi.list(),
    staleTime: 10 * 60 * 1000,
  });
}

// ─── Branches ────────────────────────────────────────────────────────────────

export function useBranches() {
  return useQuery({
    queryKey: ['inv', 'branches'],
    queryFn: () => branchesApi.getAll().then(r => (r.data as any)?.branches ?? []),
    staleTime: 10 * 60 * 1000,
  });
}

// ─── Items (with optional search) ────────────────────────────────────────────

/**
 * Fetches inventory items, optionally filtered by a search term.
 * Each unique (search, pageSize) pair is cached independently.
 * Pass `search=undefined` to load the default top-N list.
 */
export function useInventoryItems(search?: string, pageSize = 100) {
  return useQuery({
    queryKey: ['inv', 'items', search ?? '', pageSize],
    queryFn: () =>
      inventoryItemApi
        .list({ pageSize, search: search || undefined })
        .then(r => r.items ?? []),
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev, // keep old results while searching
  });
}
