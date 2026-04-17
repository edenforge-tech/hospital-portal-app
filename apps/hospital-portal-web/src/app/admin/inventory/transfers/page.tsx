'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, RefreshCw, Search, Package, X, CheckCircle, Truck, ArrowLeftRight, Ban, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  inventoryTransferApi,
  inventoryStoreApi,
  inventoryStockApi,
  StoreDto,
  StockBatchDto,
} from '@/lib/api/inventory-service.api';

const STATUS_TABS = [
  { key: 'All',        label: 'All',         dot: 'bg-slate-400',   activeClass: 'bg-slate-600 border-slate-600 text-white' },
  { key: 'Pending',    label: 'Pending',      dot: 'bg-amber-400',   activeClass: 'bg-amber-500 border-amber-500 text-white' },
  { key: 'Approved',   label: 'Approved',     dot: 'bg-blue-400',    activeClass: 'bg-blue-500 border-blue-500 text-white' },
  { key: 'InTransit',  label: 'In Transit',   dot: 'bg-orange-400',  activeClass: 'bg-orange-500 border-orange-500 text-white' },
  { key: 'Received',   label: 'Received',     dot: 'bg-green-400',   activeClass: 'bg-green-600 border-green-600 text-white' },
  { key: 'Cancelled',  label: 'Cancelled',    dot: 'bg-red-400',     activeClass: 'bg-red-500 border-red-500 text-white' },
];

const STATUS_BORDER: Record<string, string> = {
  Pending: 'border-l-amber-400', Approved: 'border-l-blue-400',
  InTransit: 'border-l-orange-400', Received: 'border-l-green-500', Cancelled: 'border-l-red-400',
};

const STATUS_BADGE: Record<string, { bg: string; label: string }> = {
  Pending:   { bg: 'bg-amber-100 text-amber-700',   label: 'Pending'    },
  Approved:  { bg: 'bg-blue-100 text-blue-700',     label: 'Approved'   },
  InTransit: { bg: 'bg-orange-100 text-orange-700', label: 'In Transit' },
  Received:  { bg: 'bg-green-100 text-green-700',   label: 'Received'   },
  Cancelled: { bg: 'bg-red-100 text-red-700',       label: 'Cancelled'  },
};

function fmtDate(s?: string) {
  return s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
}

function SkeletonRow() {
  return (
    <tr>{[130, 110, 110, 80, 80, 70, 100].map((w, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-3 bg-gray-100 rounded-full animate-pulse" style={{ width: w }} />
      </td>
    ))}</tr>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_BADGE[status] ?? { bg: 'bg-gray-100 text-gray-600', label: status };
  return <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg}`}>{cfg.label}</span>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-6 pb-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CreateTransferModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [stores, setStores] = useState<StoreDto[]>([]);
  const [batches, setBatches] = useState<StockBatchDto[]>([]);
  const [sourceStoreId, setSourceStoreId] = useState('');
  const [destStoreId, setDestStoreId] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<{ stockBatchId: string; itemName: string; batchNumber: string; available: number; quantity: number }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    inventoryStoreApi.list().then(setStores).catch(() => {});
  }, []);

  useEffect(() => {
    if (!sourceStoreId) { setBatches([]); return; }
    inventoryStockApi.getBatches(sourceStoreId).then(b => setBatches(b ?? [])).catch(() => setBatches([]));
  }, [sourceStoreId]);

  const addLine = (batch: StockBatchDto) => {
    if (lines.some(l => l.stockBatchId === batch.id)) return;
    setLines(prev => [...prev, { stockBatchId: batch.id, itemName: batch.itemName, batchNumber: batch.batchNumber ?? '', available: batch.quantityAvailable, quantity: 1 }]);
  };

  const submit = async () => {
    if (!sourceStoreId) { setError('Select a source store.'); return; }
    if (!destStoreId) { setError('Select a destination store.'); return; }
    if (sourceStoreId === destStoreId) { setError('Source and destination stores must be different.'); return; }
    if (lines.length === 0) { setError('Add at least one item.'); return; }
    setBusy(true); setError('');
    try {
      await inventoryTransferApi.create({
        fromStoreId: sourceStoreId,
        toStoreId: destStoreId,
        transferDate,
        notes: notes || undefined,
        items: lines.map(l => ({ stockBatchId: l.stockBatchId, quantity: l.quantity })),
      });
      onCreated();
    } catch (e: any) {
      setError(e?.response?.data ?? e?.message ?? 'Failed to create transfer.');
    } finally { setBusy(false); }
  };

  return (
    <Modal title="New Stock Transfer" onClose={onClose}>
      <div className="p-6 space-y-4 max-h-[68vh] overflow-y-auto">
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Store <span className="text-red-500">*</span></label>
            <select value={sourceStoreId} onChange={e => { setSourceStoreId(e.target.value); setLines([]); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— Select Source Store —</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.storeName} ({s.storeType})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Store <span className="text-red-500">*</span></label>
            <select value={destStoreId} onChange={e => setDestStoreId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— Select Destination Store —</option>
              {stores.filter(s => s.id !== sourceStoreId).map(s => <option key={s.id} value={s.id}>{s.storeName} ({s.storeType})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Date</label>
            <input type="date" value={transferDate} onChange={e => setTransferDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        {sourceStoreId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Add Batch</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              onChange={e => { const b = batches.find(x => x.id === e.target.value); if (b) addLine(b); (e.target as HTMLSelectElement).value = ''; }}>
              <option value="">— Select batch to transfer —</option>
              {batches.filter(b => b.quantityAvailable > 0).map(b => (
                <option key={b.id} value={b.id}>{b.itemName} | Batch {b.batchNumber} | Avail: {b.quantityAvailable}</option>
              ))}
            </select>
          </div>
        )}
        {lines.length > 0 && (
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['Item', 'Batch', 'Available', 'Transfer Qty', ''].map(h => <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lines.map((l, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 font-medium">{l.itemName}</td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-500">{l.batchNumber}</td>
                    <td className="px-3 py-2 text-gray-500">{l.available}</td>
                    <td className="px-3 py-2">
                      <input type="number" min={1} max={l.available} value={l.quantity}
                        onChange={e => setLines(prev => { const n = [...prev]; n[i] = { ...n[i], quantity: Math.min(parseInt(e.target.value) || 1, l.available) }; return n; })}
                        className="border rounded px-2 py-1 w-20 text-center text-sm" />
                    </td>
                    <td className="px-3 py-2">
                      <button onClick={() => setLines(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
        <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Cancel</button>
        <button onClick={submit} disabled={busy || lines.length === 0}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
          {busy ? 'Creating…' : 'Create Transfer'}
        </button>
      </div>
    </Modal>
  );
}

export default function TransfersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [acting, setActing] = useState<string | null>(null);
  const [viewTransfer, setViewTransfer] = useState<any | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { const d = await inventoryTransferApi.list({ pageSize: 100 }); setRows((d as any).items ?? d ?? []); }
    catch (err: any) { setError(err?.response?.data ?? err?.message ?? 'Failed to load.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() =>
    rows.filter(r => statusTab === 'All' || r.transferStatus === statusTab || r.status === statusTab)
        .filter(r => !search || r.transferNumber?.toLowerCase().includes(search.toLowerCase())),
    [rows, statusTab, search]);

  const doAction = async (id: string, action: () => Promise<unknown>, label: string) => {
    setActing(id + label);
    try { await action(); toast.success(`${label} successful.`); await load(); }
    catch (err: any) { toast.error(err?.response?.data ?? err?.message ?? `${label} failed.`); await load(); }
    finally { setActing(null); }
  };

  const getStatus = (r: any) => r.transferStatus ?? r.status ?? 'Pending';

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Transfers</h1>
          <p className="text-sm text-gray-500 mt-0.5">Inter-store inventory movements</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50" title="Refresh">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4" /> New Transfer
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_TABS.map(t => (
          <button key={t.key} onClick={() => setStatusTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors
              ${statusTab === t.key ? t.activeClass : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            <span className={`w-2 h-2 rounded-full ${t.dot}`} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by transfer number…"
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={load} className="text-red-700 text-xs underline font-medium">Retry</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Transfer #', 'From Store', 'To Store', 'Status', 'Date', 'Items', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />) :
             filtered.length === 0 ? (
               <tr><td colSpan={7} className="px-4 py-16 text-center">
                 <ArrowLeftRight className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                 <p className="text-gray-400 text-sm">No transfers found</p>
               </td></tr>
             ) : filtered.map(r => {
               const status = getStatus(r);
               return (
                 <tr key={r.id} className={`border-l-4 ${STATUS_BORDER[status] ?? 'border-l-transparent'} hover:bg-gray-50 transition-colors`}>
                   <td className="px-4 py-3 font-mono font-semibold text-xs">{r.transferNumber ?? r.id?.slice(0, 8)}</td>
                   <td className="px-4 py-3 text-gray-600 text-xs">{r.fromStoreName ?? r.fromStoreId?.slice(0, 8)}</td>
                   <td className="px-4 py-3 text-gray-600 text-xs">{r.toStoreName ?? r.toStoreId?.slice(0, 8)}</td>
                   <td className="px-4 py-3"><StatusBadge status={status} /></td>
                   <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(r.transferDate ?? r.createdAt)}</td>
                   <td className="px-4 py-3 text-gray-500 text-xs">{r.items?.length ?? 0}</td>
                   <td className="px-4 py-3">
                     <div className="flex items-center gap-1 flex-wrap">
                       {status === 'Pending' && (
                         <button onClick={() => setViewTransfer(r)}
                           className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                           <Eye className="w-3 h-3" /> View
                         </button>
                       )}
                       {status === 'Pending' && (
                         <button onClick={() => doAction(r.id, () => inventoryTransferApi.approve(r.id), 'Approve')}
                           disabled={acting === r.id + 'Approve'}
                           className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                           <CheckCircle className="w-3 h-3" /> Approve
                         </button>
                       )}
                       {status === 'Approved' && (
                         <button onClick={() => doAction(r.id, () => inventoryTransferApi.dispatch(r.id), 'Dispatch')}
                           disabled={acting === r.id + 'Dispatch'}
                           className="flex items-center gap-1 px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50">
                           <Truck className="w-3 h-3" /> Dispatch
                         </button>
                       )}
                       {status === 'InTransit' && (
                         <button onClick={() => doAction(r.id, () => inventoryTransferApi.receive(r.id), 'Receive')}
                           disabled={acting === r.id + 'Receive'}
                           className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                           <Package className="w-3 h-3" /> Receive
                         </button>
                       )}
                       {(status === 'Pending' || status === 'Approved') && (
                         <button onClick={() => doAction(r.id, () => inventoryTransferApi.cancel(r.id), 'Cancel')}
                           disabled={acting === r.id + 'Cancel'}
                           className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50">
                           <Ban className="w-3 h-3" /> Cancel
                         </button>
                       )}
                     </div>
                   </td>
                 </tr>
               );
             })}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateTransferModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load(); toast.success('Transfer created!'); }}
        />
      )}
      {viewTransfer && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Transfer Details</h2>
              <button onClick={() => setViewTransfer(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Transfer #</span><p className="font-mono font-semibold">{viewTransfer.transferNumber ?? viewTransfer.id?.slice(0,8)}</p></div>
              <div><span className="text-gray-500">Status</span><p className="font-medium">{getStatus(viewTransfer)}</p></div>
              <div><span className="text-gray-500">From Store</span><p>{viewTransfer.fromStoreName ?? viewTransfer.fromStoreId ?? '—'}</p></div>
              <div><span className="text-gray-500">To Store</span><p>{viewTransfer.toStoreName ?? viewTransfer.toStoreId ?? '—'}</p></div>
              <div><span className="text-gray-500">Transfer Date</span><p>{fmtDate(viewTransfer.transferDate ?? viewTransfer.createdAt)}</p></div>
            </div>
            {viewTransfer.notes && <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{viewTransfer.notes}</p>}
            {viewTransfer.items?.length > 0 && (
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 border-b"><tr>{['Item','Batch','Qty'].map(h=><th key={h} className="text-left px-3 py-2 font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {viewTransfer.items.map((it: any, i: number) => (
                      <tr key={i}>
                        <td className="px-3 py-2">{it.itemName ?? it.item?.itemName ?? '—'}</td>
                        <td className="px-3 py-2 text-gray-500">{it.batchNumber ?? '—'}</td>
                        <td className="px-3 py-2 font-mono font-semibold">{it.quantity ?? it.transferQty ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-xs text-amber-600">To modify this transfer, cancel it and create a new one.</p>
            <div className="flex justify-end"><button onClick={() => setViewTransfer(null)} className="px-4 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-900">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
