'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle, Thermometer, Package, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  inventoryStockApi,
  StockSummaryDto,
  ColdChainAlertDto,
} from '@/lib/api/inventory-service.api';

function ExpiryBadge({ date }: { date?: string }) {
  if (!date) return <span className="text-gray-400 text-xs">N/A</span>;
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);
  const cls =
    days <= 30 ? 'text-red-600 font-semibold' :
    days <= 90 ? 'text-amber-600 font-medium' :
    'text-gray-600';
  return (
    <span className={`text-xs ${cls}`}>
      {new Date(date).toLocaleDateString('en-IN')}
      {days <= 90 && <span className="ml-1">({days}d)</span>}
    </span>
  );
}

export default function StockPage() {
  const [summary, setSummary] = useState<StockSummaryDto[]>([]);
  const [belowReorder, setBelowReorder] = useState<StockSummaryDto[]>([]);
  const [coldChain, setColdChain] = useState<ColdChainAlertDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'all' | 'reorder' | 'coldchain'>('all');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, r, cc] = await Promise.all([
        inventoryStockApi.getSummary(),
        inventoryStockApi.getBelowReorder(),
        inventoryStockApi.getColdChainAlerts(),
      ]);
      setSummary(s);
      setBelowReorder(r);
      setColdChain(cc);
    } catch (err: any) {
      setError(err?.response?.data ?? err?.message ?? 'Failed to load stock data.');
      toast.error('Failed to refresh stock data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const base = tab === 'reorder' ? belowReorder : summary;
  const displayed = useMemo(() =>
    base.filter(r => !search || r.itemName?.toLowerCase().includes(search.toLowerCase()) || r.storeName?.toLowerCase().includes(search.toLowerCase())),
    [base, search]);

  const kpis = [
    { label: 'Total SKUs', value: summary.length, icon: Package, color: 'blue' },
    { label: 'Below Reorder', value: belowReorder.length, icon: AlertTriangle, color: 'red' },
    {
      label: 'Cold Chain Alerts',
      value: coldChain.length,
      icon: Thermometer,
      color: 'orange',
    },
    {
      label: 'Adequate Stock',
      value: summary.filter(s => s.totalAvailable > 0 && !s.isBelowReorder).length,
      icon: CheckCircle,
      color: 'green',
    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    red: 'bg-red-50 text-red-700',
    orange: 'bg-orange-50 text-orange-700',
    green: 'bg-green-50 text-green-700',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Summary</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time inventory levels across all stores</p>
        </div>
        <button onClick={load} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50" title="Refresh">
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className={`rounded-xl p-4 ${colorMap[k.color]}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{k.label}</p>
              <k.icon className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-3xl font-bold mt-2">{loading ? '…' : k.value}</p>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
      )}

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search item or store…"
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(['all', 'reorder', 'coldchain'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>
            {t === 'all' ? 'All Items' :
             t === 'reorder' ? `Below Reorder (${belowReorder.length})` :
             `Cold Chain Alerts (${coldChain.length})`}
          </button>
        ))}
      </div>

      {/* Cold Chain Table */}
      {tab === 'coldchain' && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Item', 'Batch', 'Store', 'Store Type', 'Qty Available', 'Expiry', 'Alert'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading…</td></tr>
              ) : coldChain.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No cold chain violations found.</td></tr>
              ) : coldChain.map((a, i) => (
                <tr key={`${a.batchId}-${i}`} className="hover:bg-orange-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{a.itemName}</td>
                  <td className="px-4 py-3 font-mono text-xs">{a.batchNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{a.storeName}</td>
                  <td className="px-4 py-3 text-gray-500">{a.storeType}</td>
                  <td className="px-4 py-3 text-right font-mono text-red-600 font-semibold">{a.quantityAvailable}</td>
                  <td className="px-4 py-3"><ExpiryBadge date={a.expiryDate} /></td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                      <Thermometer className="w-3 h-3" /> Cold Chain Violation
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stock Table (all / reorder tabs) */}
      {tab !== 'coldchain' && (
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Item', 'Store', 'Available', 'Batches', 'Nearest Expiry', 'Reorder Level', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading…</td></tr>
            ) : displayed.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">
                {tab === 'reorder' ? 'All items are above reorder level.' : 'No stock data found.'}
              </td></tr>
            ) : displayed.map((s, i) => (
              <tr key={`${s.storeId}-${s.itemId}-${i}`} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{s.itemName}</td>
                <td className="px-4 py-3 text-gray-600">{s.storeName}</td>
                <td className="px-4 py-3 text-right font-mono">
                  <span className={s.totalAvailable === 0 ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                    {s.totalAvailable}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-500">{s.batchCount}</td>
                <td className="px-4 py-3"><ExpiryBadge date={s.nearestExpiry} /></td>
                <td className="px-4 py-3 text-right text-gray-500 font-mono">{s.reorderLevel}</td>
                <td className="px-4 py-3">
                  {s.isBelowReorder ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                      <AlertTriangle className="w-3 h-3" /> Low
                    </span>
                  ) : s.totalAvailable === 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                      Out
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                      <CheckCircle className="w-3 h-3" /> OK
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
