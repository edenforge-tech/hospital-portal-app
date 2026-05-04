'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle, Package, Search, ChevronDown, ChevronRight, Thermometer, Plus, ClipboardList } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  inventoryStockApi,
  inventoryRequisitionApi,
  StockSummaryDto,
  StockBatchDto,
  ColdChainAlertDto,
} from '@/lib/api/inventory-service.api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ExpiryBadge({ date }: { date?: string }) {
  if (!date) return <span className="text-gray-400 text-xs">N/A</span>;
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);
  const cls =
    days <= 0  ? 'text-red-700 font-bold' :
    days <= 30 ? 'text-red-600 font-semibold' :
    days <= 90 ? 'text-amber-600 font-medium' :
    'text-gray-600';
  return (
    <span className={`text-xs ${cls}`}>
      {new Date(date).toLocaleDateString('en-IN')}
      {days <= 90 && <span className="ml-1">({days <= 0 ? 'Expired' : `${days}d`})</span>}
    </span>
  );
}

// Domain tabs derived from store names (keywords)
const DOMAIN_TABS = [
  { key: 'all',      label: 'All' },
  { key: 'ot',       label: 'OT Store',  match: (s: string) => /\bot\b|operation/i.test(s) },
  { key: 'pharmacy', label: 'Pharmacy',  match: (s: string) => /pharmacy|pharm/i.test(s) },
  { key: 'iol',      label: 'IOL Store', match: (s: string) => /iol/i.test(s) },
  { key: 'optical',  label: 'Optical',   match: (s: string) => /optical|optic/i.test(s) },
  { key: 'central',  label: 'Central',   match: (s: string) => /central|main/i.test(s) },
] as const;

type DomainKey = typeof DOMAIN_TABS[number]['key'];

// ─── Adjustment Modal ─────────────────────────────────────────────────────────

function AdjustmentModal({
  item, onClose, onSaved,
}: { item: StockSummaryDto; onClose: () => void; onSaved: () => void }) {
  const [qty, setQty] = useState('');
  const [remarks, setRemarks] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const n = parseFloat(qty);
    if (isNaN(n) || n === 0) { toast.error('Enter a non-zero quantity (negative = deduct).'); return; }
    setBusy(true);
    try {
      await inventoryStockApi.createAdjustment({
        storeId: item.storeId,
        itemId: item.itemId,
        adjustmentQuantity: n,
        unitRate: 0,
        remarks: remarks || `Manual adjustment by store user`,
      });
      toast.success('Adjustment posted.');
      onSaved();
    } catch (e: any) {
      toast.error(e?.response?.data ?? e?.message ?? 'Adjustment failed.');
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="px-6 py-4 border-b">
          <h2 className="text-base font-bold text-gray-900">Stock Adjustment</h2>
          <p className="text-xs text-gray-500 mt-0.5">{item.itemName} · {item.storeName}</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adjustment Qty <span className="text-gray-400 font-normal">(+ve = add, -ve = deduct)</span>
            </label>
            <input type="number" value={qty} onChange={e => setQty(e.target.value)}
              placeholder="e.g. -2 or 5"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <input value={remarks} onChange={e => setRemarks(e.target.value)}
              placeholder="Damaged, count correction…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={submit} disabled={busy}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
            {busy ? 'Posting…' : 'Post Adjustment'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reorder Modal ────────────────────────────────────────────────────────────

function ReorderModal({
  item, onClose, onSaved,
}: { item: StockSummaryDto; onClose: () => void; onSaved: () => void }) {
  const [qty, setQty] = useState(String(item.reorderLevel > 0 ? item.reorderLevel * 2 : 10));
  const [remarks, setRemarks] = useState(`Below reorder level — current: ${item.totalAvailable}`);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const n = parseFloat(qty);
    if (isNaN(n) || n <= 0) { toast.error('Enter a positive quantity.'); return; }
    setBusy(true);
    try {
      await inventoryRequisitionApi.create({
        storeId: item.storeId,
        requisitionType: 'Manual',
        remarks,
        items: [{ itemId: item.itemId, requiredQuantity: n, currentStock: item.totalAvailable }],
      });
      toast.success('Purchase requisition raised.');
      onSaved();
    } catch (e: any) {
      toast.error(e?.response?.data ?? e?.message ?? 'Requisition failed.');
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="px-6 py-4 border-b">
          <h2 className="text-base font-bold text-gray-900">Request Reorder</h2>
          <p className="text-xs text-gray-500 mt-0.5">{item.itemName} · {item.storeName}</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Quantity</label>
            <input type="number" min={1} value={qty} onChange={e => setQty(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <input value={remarks} onChange={e => setRemarks(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={submit} disabled={busy}
            className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium">
            {busy ? 'Raising…' : 'Raise Requisition'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Batch Drilldown Row ──────────────────────────────────────────────────────

function BatchDrilldown({ storeId, itemId }: { storeId: string; itemId: string }) {
  const [batches, setBatches] = useState<StockBatchDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inventoryStockApi.getBatches(storeId, itemId)
      .then(setBatches)
      .catch(() => setBatches([]))
      .finally(() => setLoading(false));
  }, [storeId, itemId]);

  if (loading) return <tr><td colSpan={8} className="px-8 py-3 text-xs text-gray-400">Loading batches…</td></tr>;
  if (batches.length === 0) return <tr><td colSpan={8} className="px-8 py-3 text-xs text-gray-400 italic">No active batches found.</td></tr>;

  return (
    <>
      {batches.map(b => (
        <tr key={b.id} className="bg-blue-50/40 border-l-4 border-l-blue-200">
          <td className="px-8 py-2 text-xs text-blue-700 font-mono">↳ {b.batchNumber || '—'}</td>
          <td className="px-4 py-2 text-xs text-gray-500" colSpan={2}></td>
          <td className="px-4 py-2 text-xs text-right font-mono text-gray-700">{b.quantityAvailable}</td>
          <td className="px-4 py-2 text-xs"><ExpiryBadge date={b.expiryDate} /></td>
          <td className="px-4 py-2 text-xs text-gray-500 text-right font-mono">₹{b.mrp?.toFixed(2) ?? '—'}</td>
          <td className="px-4 py-2" colSpan={2}></td>
        </tr>
      ))}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StockPage() {
  const [summary, setSummary] = useState<StockSummaryDto[]>([]);
  const [belowReorder, setBelowReorder] = useState<StockSummaryDto[]>([]);
  const [coldChain, setColdChain] = useState<ColdChainAlertDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'all' | 'reorder' | 'coldchain'>('all');
  const [domain, setDomain] = useState<DomainKey>('all');
  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState<string>('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [adjustModal, setAdjustModal] = useState<StockSummaryDto | null>(null);
  const [reorderModal, setReorderModal] = useState<StockSummaryDto | null>(null);

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

  const stores = useMemo(() =>
    Array.from(new Set(summary.map(s => s.storeName))).sort(),
    [summary]);

  const urgencyRank = (s: StockSummaryDto) =>
    s.totalAvailable === 0 ? 0 : s.isBelowReorder ? 1 : 2;

  const domainMatch = useCallback((storeName: string): boolean => {
    if (domain === 'all') return true;
    const tab = DOMAIN_TABS.find(t => t.key === domain);
    return tab && 'match' in tab ? tab.match(storeName) : false;
  }, [domain]);

  const base = tab === 'reorder' ? belowReorder : summary;
  const displayed = useMemo(() =>
    base
      .filter(r => domainMatch(r.storeName))
      .filter(r => !storeFilter || r.storeName === storeFilter)
      .filter(r => !search || r.itemName?.toLowerCase().includes(search.toLowerCase()) || r.storeName?.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => urgencyRank(a) - urgencyRank(b)),
    [base, search, storeFilter, domainMatch]);

  const toggleRow = (key: string) =>
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const kpis = [
    { label: 'Total SKUs',      value: summary.length,                                                 icon: Package,       color: 'blue' },
    { label: 'Below Reorder',   value: belowReorder.length,                                            icon: AlertTriangle, color: 'red' },
    { label: 'Cold Chain Alerts', value: coldChain.length,                                             icon: Thermometer,   color: 'orange' },
    { label: 'Adequate Stock',  value: summary.filter(s => s.totalAvailable > 0 && !s.isBelowReorder).length, icon: CheckCircle, color: 'green' },
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

      {/* Domain tabs */}
      <div className="flex gap-1 flex-wrap">
        {DOMAIN_TABS.map(t => (
          <button key={t.key} onClick={() => setDomain(t.key)}
            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors
              ${domain === t.key ? 'bg-gray-800 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search + Store Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search item or store…"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={storeFilter} onChange={e => setStoreFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Stores</option>
          {stores.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {storeFilter && (
          <button onClick={() => setStoreFilter('')} className="text-xs text-gray-500 hover:text-gray-700 underline">Clear</button>
        )}
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
                <th className="w-6 px-4 py-3"></th>
                {['Item', 'Store', 'Available', 'Batches', 'Nearest Expiry', 'Reorder Lvl', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={9} className="text-center py-8 text-gray-400">Loading…</td></tr>
              ) : displayed.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-gray-400">
                  {tab === 'reorder' ? 'All items are above reorder level.' : 'No stock data found.'}
                </td></tr>
              ) : displayed.map((s) => {
                const rowKey = `${s.storeId}-${s.itemId}`;
                const expanded = expandedRows.has(rowKey);
                return (
                  <React.Fragment key={rowKey}>
                    <tr className={`hover:bg-gray-50 ${s.totalAvailable === 0 ? 'bg-red-50/30' : s.isBelowReorder ? 'bg-amber-50/30' : ''}`}>
                      {/* Expand toggle */}
                      <td className="px-4 py-3">
                        <button onClick={() => toggleRow(rowKey)}
                          className="text-gray-400 hover:text-gray-700 transition-colors">
                          {expanded
                            ? <ChevronDown className="w-4 h-4" />
                            : <ChevronRight className="w-4 h-4" />}
                        </button>
                      </td>
                      {/* Item */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{s.itemName}</p>
                        {s.genericName && <p className="text-xs text-gray-400 mt-0.5">{s.genericName}</p>}
                      </td>
                      {/* Store */}
                      <td className="px-4 py-3 text-gray-600 text-xs">{s.storeName}</td>
                      {/* Available */}
                      <td className="px-4 py-3 text-right font-mono">
                        <span className={s.totalAvailable === 0 ? 'text-red-600 font-bold' : s.isBelowReorder ? 'text-amber-700 font-semibold' : 'text-gray-900'}>
                          {s.totalAvailable}
                        </span>
                        {s.unit && <span className="text-gray-400 text-xs ml-1">{s.unit}</span>}
                      </td>
                      {/* Batches */}
                      <td className="px-4 py-3 text-right text-gray-500">{s.batchCount}</td>
                      {/* Expiry */}
                      <td className="px-4 py-3"><ExpiryBadge date={s.nearestExpiry} /></td>
                      {/* Reorder */}
                      <td className="px-4 py-3 text-right text-gray-500 font-mono">{s.reorderLevel}</td>
                      {/* Status chip */}
                      <td className="px-4 py-3">
                        {s.totalAvailable === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">Out of Stock</span>
                        ) : s.isBelowReorder ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                            <AlertTriangle className="w-3 h-3" /> Low
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                            <CheckCircle className="w-3 h-3" /> OK
                          </span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {(s.isBelowReorder || s.totalAvailable === 0) && (
                            <button onClick={() => setReorderModal(s)} title="Raise Requisition"
                              className="p-1.5 rounded-md bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors">
                              <ClipboardList className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={() => setAdjustModal(s)} title="Stock Adjustment"
                            className="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Batch drilldown */}
                    {expanded && <BatchDrilldown storeId={s.storeId} itemId={s.itemId} />}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {adjustModal && (
        <AdjustmentModal item={adjustModal} onClose={() => setAdjustModal(null)} onSaved={() => { setAdjustModal(null); load(); }} />
      )}
      {reorderModal && (
        <ReorderModal item={reorderModal} onClose={() => setReorderModal(null)} onSaved={() => setReorderModal(null)} />
      )}
    </div>
  );
}


