'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, RefreshCw, Search, Store, X, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { branchesApi } from '@/lib/api';
import { inventoryStoreApi, StoreDto } from '@/lib/api/inventory-service.api';

const STORE_TYPES = ['Central', 'Pharmacy', 'OT'];

const TYPE_TABS = [
  { key: 'All',      dot: 'bg-slate-400',  activeClass: 'bg-slate-600 border-slate-600 text-white' },
  { key: 'Central',  dot: 'bg-blue-400',   activeClass: 'bg-blue-500 border-blue-500 text-white' },
  { key: 'Pharmacy', dot: 'bg-green-400',  activeClass: 'bg-green-600 border-green-600 text-white' },
  { key: 'OT',       dot: 'bg-purple-400', activeClass: 'bg-purple-600 border-purple-600 text-white' },
];

function SkeletonRow() {
  return (
    <tr>{[140, 80, 120, 80].map((w, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-3 bg-gray-100 rounded-full animate-pulse" style={{ width: w }} />
      </td>
    ))}</tr>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-6 pb-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StoreModal({ initial, onClose, onSaved }: { initial?: StoreDto; onClose: () => void; onSaved: () => void }) {
  const [branches, setBranches] = useState<any[]>([]);
  const [storeName, setStoreName] = useState(initial?.storeName ?? '');
  const [storeType, setStoreType] = useState(initial?.storeType ?? 'Central');
  const [branchId, setBranchId] = useState(initial?.branchId ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { branchesApi.getAll().then(r => setBranches(r.data?.branches ?? [])).catch(() => {}); }, []);

  const submit = async () => {
    if (!storeName.trim()) { setError('Store name is required.'); return; }
    setBusy(true); setError('');
    try {
      if (initial) await inventoryStoreApi.update(initial.id, { storeName, storeType, branchId: branchId || undefined });
      else await inventoryStoreApi.create({ storeName, storeType, branchId: branchId || undefined });
      onSaved();
    } catch (e: any) { setError(e?.response?.data ?? e?.message ?? 'Save failed.'); }
    finally { setBusy(false); }
  };

  return (
    <Modal title={initial ? 'Edit Store' : 'New Store'} onClose={onClose}>
      <div className="p-6 space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Store Name <span className="text-red-500">*</span></label>
          <input value={storeName} onChange={e => setStoreName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Store Type</label>
          <select value={storeType} onChange={e => setStoreType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {STORE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
          <select value={branchId} onChange={e => setBranchId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">— Select Branch —</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
        <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Cancel</button>
        <button onClick={submit} disabled={busy}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
          {busy ? 'Saving…' : initial ? 'Update Store' : 'Create Store'}
        </button>
      </div>
    </Modal>
  );
}

export default function StoresPage() {
  const [rows, setRows] = useState<StoreDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeTab, setTypeTab] = useState('All');
  const [modal, setModal] = useState<null | 'create' | StoreDto>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { const d = await inventoryStoreApi.list(); setRows(d ?? []); }
    catch (err: any) { setError(err?.response?.data ?? err?.message ?? 'Failed to load.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() =>
    rows.filter(r => typeTab === 'All' || r.storeType === typeTab)
        .filter(r => !search || r.storeName?.toLowerCase().includes(search.toLowerCase())),
    [rows, typeTab, search]);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage pharmacy, OT, and central inventory stores</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button onClick={() => setModal('create')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4" /> New Store
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {TYPE_TABS.map(t => (
          <button key={t.key} onClick={() => setTypeTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors
              ${typeTab === t.key ? t.activeClass : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            <span className={`w-2 h-2 rounded-full ${t.dot}`} />{t.key}
          </button>
        ))}
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search store name…"
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
              {['Store Name', 'Type', 'Branch ID', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />) :
             filtered.length === 0 ? (
               <tr><td colSpan={4} className="px-4 py-16 text-center">
                 <Store className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                 <p className="text-gray-400 text-sm">No stores found</p>
               </td></tr>
             ) : filtered.map(r => (
               <tr key={r.id} className={`border-l-4 ${r.storeType === 'Pharmacy' ? 'border-l-green-400' : r.storeType === 'OT' ? 'border-l-purple-400' : 'border-l-blue-400'} hover:bg-gray-50 transition-colors`}>
                 <td className="px-4 py-3 font-medium text-gray-900">{r.storeName}</td>
                 <td className="px-4 py-3">
                   <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${r.storeType === 'Pharmacy' ? 'bg-green-100 text-green-700' : r.storeType === 'OT' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                     {r.storeType ?? 'Central'}
                   </span>
                 </td>
                 <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.branchId ? r.branchId.slice(0, 8) + '…' : '—'}</td>
                 <td className="px-4 py-3">
                   <button onClick={() => setModal(r)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                     <Edit2 className="w-3.5 h-3.5" />
                   </button>
                 </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>

      {modal === 'create' && (
        <StoreModal onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); toast.success('Store created!'); }} />
      )}
      {modal && modal !== 'create' && (
        <StoreModal initial={modal as StoreDto} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); toast.success('Store updated!'); }} />
      )}
    </div>
  );
}
