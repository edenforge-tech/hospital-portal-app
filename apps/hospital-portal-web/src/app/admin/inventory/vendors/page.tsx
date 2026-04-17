'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, RefreshCw, Search, Building2, X, Edit2, CheckCircle, XCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  inventoryVendorApi,
  VendorDto,
  CreateVendorRequest,
} from '@/lib/api/inventory-service.api';

const STATUS_TABS = [
  { key: 'All',      label: 'All',      dot: 'bg-slate-400', activeClass: 'bg-slate-600 border-slate-600 text-white' },
  { key: 'active',   label: 'Active',   dot: 'bg-green-400', activeClass: 'bg-green-600 border-green-600 text-white' },
  { key: 'inactive', label: 'Inactive', dot: 'bg-gray-400',  activeClass: 'bg-gray-600 border-gray-600 text-white' },
];

function SkeletonRow() {
  return (
    <tr>{[130, 100, 120, 100, 90, 80].map((w, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-3 bg-gray-100 rounded-full animate-pulse" style={{ width: w }} />
      </td>
    ))}</tr>
  );
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

const BLANK: CreateVendorRequest = {
  name: '', vendorCode: '', contactPerson: '', phone: '', email: '',
  gstinNumber: '', panNumber: '', apmcRegistration: '', foodLicenseNumber: '', importExportCode: '',
};

function VendorFormModal({ initial, onClose, onSaved }: { initial?: VendorDto; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<CreateVendorRequest>(initial ? {
    name: initial.name, vendorCode: initial.vendorCode, contactPerson: initial.contactPerson ?? '',
    phone: initial.phone ?? '', email: initial.email ?? '', gstinNumber: initial.gstinNumber ?? '',
    panNumber: initial.panNumber ?? '', apmcRegistration: initial.apmcRegistration ?? '',
    foodLicenseNumber: initial.foodLicenseNumber ?? '', importExportCode: initial.importExportCode ?? '',
  } : { ...BLANK });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof CreateVendorRequest) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim()) { setError('Vendor name is required.'); return; }
    if (!form.vendorCode.trim()) { setError('Vendor code is required.'); return; }
    setBusy(true); setError('');
    try {
      if (initial) await inventoryVendorApi.update(initial.id, form);
      else await inventoryVendorApi.create(form);
      onSaved();
    } catch (e: any) { setError(e?.response?.data ?? e?.message ?? 'Save failed.'); }
    finally { setBusy(false); }
  };

  const fi = (label: string, k: keyof CreateVendorRequest, req = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}{req && <span className="text-red-500 ml-0.5">*</span>}</label>
      <input value={(form[k] as string) ?? ''} onChange={set(k)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  );

  return (
    <Modal title={initial ? 'Edit Vendor' : 'New Vendor'} onClose={onClose}>
      <div className="p-6 space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        <div className="grid grid-cols-2 gap-4">
          {fi('Vendor Name', 'name', true)} {fi('Vendor Code', 'vendorCode', true)}
          {fi('Contact Person', 'contactPerson')} {fi('Phone', 'phone')}
          {fi('Email', 'email')} {fi('GSTIN', 'gstinNumber')}
          {fi('PAN', 'panNumber')} {fi('APMC Registration', 'apmcRegistration')}
          {fi('Food License No.', 'foodLicenseNumber')} {fi('Import/Export Code', 'importExportCode')}
        </div>
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
        <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Cancel</button>
        <button onClick={submit} disabled={busy}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
          {busy ? 'Saving…' : initial ? 'Update Vendor' : 'Create Vendor'}
        </button>
      </div>
    </Modal>
  );
}

export default function VendorsPage() {
  const [rows, setRows] = useState<VendorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('All');
  const [modal, setModal] = useState<null | 'create' | VendorDto>(null);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { const d = await inventoryVendorApi.list(1, 200); setRows(d.items ?? []); }
    catch (err: any) { setError(err?.response?.data ?? err?.message ?? 'Failed to load.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() =>
    rows.filter(r => statusTab === 'All' || (statusTab === 'active' ? r.status === 'active' : r.status !== 'active'))
        .filter(r => !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.vendorCode?.toLowerCase().includes(search.toLowerCase())),
    [rows, statusTab, search]);

  const toggleStatus = async (v: VendorDto) => {
    const label = v.status === 'active' ? 'Deactivate' : 'Activate';
    setActing(v.id + label);
    try {
      await inventoryVendorApi.update(v.id, { status: v.status === 'active' ? 'inactive' : 'active' });
      toast.success(`Vendor ${label.toLowerCase()}d.`);
      await load();
    } catch (err: any) { toast.error(err?.response?.data ?? `${label} failed.`); }
    finally { setActing(null); }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage supplier accounts and compliance documents</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button onClick={() => setModal('create')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4" /> New Vendor
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_TABS.map(t => (
          <button key={t.key} onClick={() => setStatusTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors
              ${statusTab === t.key ? t.activeClass : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            <span className={`w-2 h-2 rounded-full ${t.dot}`} />{t.label}
          </button>
        ))}
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or code…"
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
              {['Vendor', 'Code', 'Contact', 'Phone', 'GSTIN', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />) :
             filtered.length === 0 ? (
               <tr><td colSpan={7} className="px-4 py-16 text-center">
                 <Building2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                 <p className="text-gray-400 text-sm">No vendors found</p>
               </td></tr>
             ) : filtered.map(r => (
               <tr key={r.id} className={`border-l-4 ${r.status === 'active' ? 'border-l-green-400' : 'border-l-gray-200'} hover:bg-gray-50 transition-colors`}>
                 <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                 <td className="px-4 py-3 font-mono text-xs text-blue-600">{r.vendorCode}</td>
                 <td className="px-4 py-3 text-gray-600 text-xs">{r.contactPerson ?? '—'}</td>
                 <td className="px-4 py-3 text-gray-600 text-xs">{r.phone ?? '—'}</td>
                 <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.gstinNumber ?? '—'}</td>
                 <td className="px-4 py-3">
                   <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                     {r.status === 'active' ? 'Active' : 'Inactive'}
                   </span>
                 </td>
                 <td className="px-4 py-3">
                   <div className="flex items-center gap-1">
                     <button onClick={() => setModal(r)} title="Edit"
                       className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                       <Edit2 className="w-3.5 h-3.5" />
                     </button>
                     <button onClick={() => toggleStatus(r)} disabled={!!acting}
                       title={r.status === 'active' ? 'Deactivate' : 'Activate'}
                       className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50">
                       {r.status === 'active' ? <ToggleRight className="w-3.5 h-3.5 text-green-500" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                     </button>
                   </div>
                 </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>

      {modal === 'create' && (
        <VendorFormModal onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); toast.success('Vendor created!'); }} />
      )}
      {modal && modal !== 'create' && (
        <VendorFormModal initial={modal as VendorDto} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); toast.success('Vendor updated!'); }} />
      )}
    </div>
  );
}
