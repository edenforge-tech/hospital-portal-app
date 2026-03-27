'use client';

/**
 * IolStockWidget
 * Shows IOL model from the OT booking and its stock availability for the branch.
 * APIs:
 *  - GET /api/master-data/iol-availability/{iolCatalogId}  → stock at current branch
 * Falls back gracefully when iolCatalogId is absent.
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getApi } from '@/lib/api';
import { Boxes, CheckCircle2, AlertTriangle, Loader2, ExternalLink, ChevronDown, ChevronUp, RefreshCw, ShoppingCart, CalendarX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IolAvailability {
  iolCatalogId: string;
  iolModelName?: string;
  manufacturer?: string;
  availableQuantity?: number;
  reservedQuantity?: number;
  minimumStockLevel?: number;
  isAvailable?: boolean;
  branchName?: string;
}

interface IolStockWidgetProps {
  iolCatalogId?: string;
  iolModel?: string;       // fallback display name from OT schedule
  surgeryType?: string;
  onEscalationChoice?: (choice: 'substitute' | 'order' | 'postpone') => void;
}

type EscalationChoice = 'substitute' | 'order' | 'postpone' | null;

export function IolStockWidget({ iolCatalogId, iolModel, surgeryType, onEscalationChoice }: IolStockWidgetProps) {
  const [escalationChoice, setEscalationChoice] = useState<EscalationChoice>(null);
  const [showEscalation, setShowEscalation] = useState(false);
  // Only relevant for cataract / ICL / lens-based surgeries
  const isLensSurgery = !surgeryType || /cataract|phaco|icl|lens|iol/i.test(surgeryType);

  const { data: availability, isLoading, isError } = useQuery<IolAvailability>({
    queryKey: ['iol-availability', iolCatalogId],
    enabled: !!iolCatalogId && isLensSurgery,
    staleTime: 120_000,
    queryFn: async () => {
      const api = getApi();
      const res = await api.get<IolAvailability>(`/master-data/iol-availability/${iolCatalogId}`);
      return res.data;
    },
  });

  // No IOL involved → don't render
  if (!isLensSurgery) return null;

  const modelLabel = availability?.iolModelName ?? iolModel;

  // No IOL data at all
  if (!iolCatalogId && !iolModel) {
    return (
      <div className="border border-dashed border-gray-200 rounded-xl px-4 py-3 flex items-center gap-2">
        <Boxes className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <p className="text-sm text-gray-500">IOL model not specified in OT booking.</p>
      </div>
    );
  }

  const qty = availability?.availableQuantity ?? null;
  const minLevel = availability?.minimumStockLevel ?? 2;
  const isAvailable = availability?.isAvailable ?? (qty !== null ? qty > 0 : null);
  const isLow = qty !== null && qty <= minLevel && qty > 0;

  return (
    <div
      className={cn(
        'border rounded-xl overflow-hidden',
        isAvailable === false
          ? 'border-red-200'
          : isLow
          ? 'border-amber-200'
          : 'border-gray-200'
      )}
    >
      {/* Header row */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3',
          isAvailable === false
            ? 'bg-red-50'
            : isLow
            ? 'bg-amber-50'
            : 'bg-white'
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Boxes
            className={cn(
              'w-4 h-4 flex-shrink-0',
              isAvailable === false ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-blue-500'
            )}
          />
          <span className="text-sm font-semibold text-gray-800">IOL / Lens Availability</span>
        </div>

        {isLoading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}

        {!isLoading && isAvailable === true && !isLow && (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        )}
        {!isLoading && (isLow || isAvailable === false) && (
          <AlertTriangle className={cn('w-4 h-4', isAvailable === false ? 'text-red-500' : 'text-amber-500')} />
        )}
      </div>

      {/* Detail */}
      <div className="border-t border-gray-100 px-4 py-3 bg-white space-y-2">
        {/* Model name */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">IOL Model</span>
          <span className="text-sm font-semibold text-gray-800 max-w-[200px] truncate text-right">
            {modelLabel ?? '—'}
          </span>
        </div>

        {availability?.manufacturer && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Manufacturer</span>
            <span className="text-sm text-gray-700">{availability.manufacturer}</span>
          </div>
        )}

        {/* Stock status */}
        {isLoading && (
          <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
        )}

        {!isLoading && !isError && availability && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Stock at branch</span>
            <span
              className={cn(
                'text-sm font-bold',
                isAvailable === false ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-green-700'
              )}
            >
              {qty !== null ? `${qty} units` : isAvailable ? 'Available' : 'Out of stock'}
            </span>
          </div>
        )}

        {!isLoading && isError && iolCatalogId && (
          <p className="text-xs text-gray-400">Could not load stock data.</p>
        )}

        {/* Availability badge */}
        {!isLoading && !isError && availability && (
          <div
            className={cn(
              'mt-1 rounded-lg px-3 py-2 flex items-center gap-2',
              isAvailable === false
                ? 'bg-red-50 border border-red-200'
                : isLow
                ? 'bg-amber-50 border border-amber-200'
                : 'bg-green-50 border border-green-200'
            )}
          >
            {isAvailable === false ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-700 font-medium">
                  Out of stock — notify OT to source or substitute before surgery.
                </p>
              </>
            ) : isLow ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <p className="text-xs text-amber-700 font-medium">
                  Low stock ({qty} units). Confirm with OT team before surgery day.
                </p>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                <p className="text-xs text-green-700 font-medium">IOL available at branch.</p>
              </>
            )}
          </div>
        )}

        {/* ── Out-of-stock 3-option escalation ─────────────────────────── */}
        {!isLoading && isAvailable === false && (
          <div className="mt-2 border border-red-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowEscalation((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2 bg-red-50 hover:bg-red-100 transition-colors"
            >
              <span className="text-xs font-semibold text-red-700">Choose Escalation Option</span>
              {showEscalation ? (
                <ChevronUp className="w-3.5 h-3.5 text-red-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-red-500" />
              )}
            </button>
            {showEscalation && (
              <div className="divide-y divide-red-100 bg-white">
                {[
                  { key: 'substitute' as const, icon: <RefreshCw className="w-3.5 h-3.5" />, label: 'Substitute IOL', desc: 'Use an equivalent alternate IOL model from stock' },
                  { key: 'order' as const, icon: <ShoppingCart className="w-3.5 h-3.5" />, label: 'Order from Pharmacy', desc: 'Raise an urgent IOL procurement request' },
                  { key: 'postpone' as const, icon: <CalendarX className="w-3.5 h-3.5" />, label: 'Postpone Surgery', desc: 'Reschedule until IOL stock is available' },
                ].map(({ key, icon, label, desc }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setEscalationChoice(key);
                      onEscalationChoice?.(key);
                      setShowEscalation(false);
                    }}
                    className={cn(
                      'w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-red-50 transition-colors',
                      escalationChoice === key && 'bg-red-50'
                    )}
                  >
                    <span className={cn('mt-0.5 flex-shrink-0 text-red-500')}>{icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                    {escalationChoice === key && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 ml-auto flex-shrink-0 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
            )}
            {escalationChoice && (
              <div className="px-3 py-2 bg-amber-50 border-t border-red-200">
                <p className="text-xs text-amber-700 font-medium">
                  Selected:{' '}
                  {{ substitute: 'Substitute IOL', order: 'Order from Pharmacy', postpone: 'Postpone Surgery' }[escalationChoice]}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Link when no catalogId but model name shown */}
        {!iolCatalogId && iolModel && (
          <div className="mt-1 rounded-lg px-3 py-2 bg-amber-50 border border-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              IOL catalog ID not linked in OT booking. Stock check unavailable.{' '}
              <a href="/dashboard/ot" className="underline inline-flex items-center gap-0.5">
                Open OT <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
