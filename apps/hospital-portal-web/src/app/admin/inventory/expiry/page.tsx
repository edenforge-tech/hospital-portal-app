'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertTriangle, Thermometer, Clock } from 'lucide-react';
import { inventoryStockApi, ExpiringBatchDto } from '@/lib/api/inventory-service.api';
import { toast } from 'react-hot-toast';

// ─── Types ─────────────────────────────────────────────────────────────────────

const DAYS_OPTIONS = [7, 30, 60, 90] as const;
type DaysOption = (typeof DAYS_OPTIONS)[number];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysUntil(expiryDate: string): number {
  const diff = new Date(expiryDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function urgencyClass(days: number): string {
  if (days <= 0)  return 'bg-red-100 text-red-800 border-l-4 border-red-500';
  if (days <= 7)  return 'bg-red-50  text-red-700  border-l-4 border-red-400';
  if (days <= 30) return 'bg-orange-50 text-orange-700 border-l-4 border-orange-400';
  if (days <= 60) return 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-400';
  return 'bg-green-50 text-green-700 border-l-4 border-green-300';
}

function urgencyLabel(days: number): { label: string; className: string } {
  if (days <= 0)  return { label: 'Expired', className: 'bg-red-100 text-red-800' };
  if (days <= 7)  return { label: `${days}d`, className: 'bg-red-100 text-red-700' };
  if (days <= 30) return { label: `${days}d`, className: 'bg-orange-100 text-orange-700' };
  if (days <= 60) return { label: `${days}d`, className: 'bg-yellow-100 text-yellow-700' };
  return { label: `${days}d`, className: 'bg-green-100 text-green-700' };
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function BatchRow({ batch }: { batch: ExpiringBatchDto }) {
  const days = daysUntil(batch.expiryDate);
  const urgency = urgencyLabel(days);

  return (
    <tr className={`${urgencyClass(days)} text-sm`}>
      <td className="px-4 py-3 font-medium text-gray-900">
        {batch.itemName ?? batch.itemId}
      </td>
      <td className="px-4 py-3 text-gray-600">{batch.batchNumber ?? '—'}</td>
      <td className="px-4 py-3 text-gray-600">{batch.storeName ?? batch.storeId}</td>
      <td className="px-4 py-3 font-mono">{fmtDate(batch.expiryDate)}</td>
      <td className="px-4 py-3 text-right">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${urgency.className}`}>
          {urgency.label}
        </span>
      </td>
      <td className="px-4 py-3 text-right font-semibold">{batch.quantityAvailable}</td>
      <td className="px-4 py-3 text-center">
        {batch.requiresColdStorage ? (
          <span className="inline-flex items-center gap-1 text-blue-600 text-xs">
            <Thermometer className="w-3.5 h-3.5" /> Cold
          </span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        )}
      </td>
    </tr>
  );
}

// ─── Summary Cards ─────────────────────────────────────────────────────────────

function SummaryCards({ batches }: { batches: ExpiringBatchDto[] }) {
  const expired = batches.filter(b => daysUntil(b.expiryDate) <= 0).length;
  const critical = batches.filter(b => { const d = daysUntil(b.expiryDate); return d > 0 && d <= 7; }).length;
  const warning = batches.filter(b => { const d = daysUntil(b.expiryDate); return d > 7 && d <= 30; }).length;
  const upcoming = batches.filter(b => daysUntil(b.expiryDate) > 30).length;

  const cards = [
    { label: 'Expired', count: expired, color: 'bg-red-500', textColor: 'text-white' },
    { label: 'Critical (≤7d)', count: critical, color: 'bg-orange-500', textColor: 'text-white' },
    { label: 'Warning (≤30d)', count: warning, color: 'bg-yellow-400', textColor: 'text-gray-900' },
    { label: 'Upcoming', count: upcoming, color: 'bg-green-500', textColor: 'text-white' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cards.map(c => (
        <div key={c.label} className={`${c.color} rounded-xl p-4 flex flex-col gap-1`}>
          <span className={`text-xs font-medium ${c.textColor} opacity-90`}>{c.label}</span>
          <span className={`text-3xl font-bold ${c.textColor}`}>{c.count}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ExpiryAlertsPage() {
  const [daysAhead, setDaysAhead] = useState<DaysOption>(30);
  const [batches, setBatches] = useState<ExpiringBatchDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryStockApi.getExpiring(daysAhead);
      setBatches(data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: string }; message?: string };
      setError(e?.response?.data ?? e?.message ?? 'Failed to load expiry data.');
      toast.error('Failed to load expiry data.');
    } finally {
      setLoading(false);
    }
  }, [daysAhead]);

  useEffect(() => { load(); }, [load]);

  const filtered = batches.filter(b => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (b.itemName ?? '').toLowerCase().includes(q) ||
      (b.batchNumber ?? '').toLowerCase().includes(q) ||
      (b.storeName ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            Expiry Alerts
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Stock batches expiring within the selected timeframe.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Days Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {DAYS_OPTIONS.map(d => (
          <button
            key={d}
            onClick={() => setDaysAhead(d)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              daysAhead === d
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white border text-gray-600 hover:bg-gray-50'
            }`}>
            <Clock className="w-3.5 h-3.5" />
            {d} days
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      {/* Summary Cards */}
      {!loading && batches.length > 0 && <SummaryCards batches={batches} />}

      {/* Search */}
      <div className="flex items-center gap-3">
        <input
          type="search"
          placeholder="Search by item, batch or store…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm w-72 focus:ring-2 focus:ring-orange-400 focus:outline-none" />
        <span className="text-sm text-gray-500">
          {filtered.length} batch{filtered.length !== 1 ? 'es' : ''} found
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
            <AlertTriangle className="w-8 h-8 opacity-30" />
            <p className="text-sm">
              {batches.length === 0
                ? `No batches expiring within ${daysAhead} days.`
                : 'No batches match your search.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Item Name', 'Batch No', 'Store', 'Expiry Date', 'Days Left', 'Qty', 'Cold Chain'].map(h => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${
                        ['Days Left', 'Qty'].includes(h) ? 'text-right' : h === 'Cold Chain' ? 'text-center' : 'text-left'
                      }`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(b => <BatchRow key={b.id} batch={b} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
