'use client';
import { useState, useEffect } from 'react';
import { masterValuesApi } from '@/lib/api';

export interface MasterOption {
  /** Stored value — equals the master_value.code */
  value: string;
  /** Display label */
  label: string;
}

// ── Module-level cache/dedup ─────────────────────────────────────────────────
// Survives component unmounts; prevents duplicate requests for the same entity.
const _cache = new Map<string, MasterOption[]>();
const _pending = new Map<string, Promise<MasterOption[]>>();

async function _fetch(entityType: string): Promise<MasterOption[]> {
  if (_cache.has(entityType)) return _cache.get(entityType)!;
  if (_pending.has(entityType)) return _pending.get(entityType)!;

  const promise = masterValuesApi
    .getByEntityType(entityType, false, 1, 200)
    .then((res) => {
      const raw = Array.isArray(res.data) ? res.data : (res.data?.items ?? []);
      const items: MasterOption[] = raw.map((mv: { code: string; label: string }) => ({
        value: mv.code,
        label: mv.label,
      }));
      if (items.length > 0) _cache.set(entityType, items);
      return items;
    })
    .catch((): MasterOption[] => [])
    .finally(() => _pending.delete(entityType));

  _pending.set(entityType, promise);
  return promise;
}

/**
 * Fetch master values for a given entity type.
 *
 * - Caches results in module scope (no duplicate API calls across components).
 * - Falls back to `fallback` when the API returns nothing or errors.
 *
 * @param entityType  e.g. `'patient.gender'`, `'insurance.provider'`
 * @param fallback    Hardcoded options shown while loading or if API is empty.
 */
export function useMasterValues(
  entityType: string,
  fallback: MasterOption[] = [],
): { options: MasterOption[]; loading: boolean } {
  const [options, setOptions] = useState<MasterOption[]>(() => _cache.get(entityType) ?? []);
  const [loading, setLoading] = useState(!_cache.has(entityType));

  useEffect(() => {
    if (_cache.has(entityType)) {
      setOptions(_cache.get(entityType)!);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    _fetch(entityType).then((items) => {
      if (cancelled) return;
      setOptions(items);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [entityType]);

  return {
    options: options.length > 0 ? options : fallback,
    loading,
  };
}

/** Convenience: invalidate the cache for one entity type (e.g. after creating a new value). */
export function invalidateMasterCache(entityType: string): void {
  _cache.delete(entityType);
  _pending.delete(entityType);
}
