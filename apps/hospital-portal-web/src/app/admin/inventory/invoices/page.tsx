'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, RefreshCw, Search, Receipt, X, CheckCircle, XCircle, Send, Ban } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  inventoryInvoiceApi,
  inventoryVendorApi,
  inventoryItemApi,
  PurchaseInvoiceDto,
  VendorDto,
} from '@/lib/api/inventory-service.api';

const STATUS_TABS = [
  { key: 'All',              label: 'All',            dot: 'bg-slate-400',   activeClass: 'bg-slate-600 border-slate-600 text-white' },
  { key: 'Draft',            label: 'Draft',          dot: 'bg-amber-400',   activeClass: 'bg-amber-500 border-amber-500 text-white' },
  { key: 'PrimaryApproved',  label: 'Primary Appr.', dot: 'bg-blue-400',    activeClass: 'bg-blue-500 border-blue-500 text-white' },
  { key: 'Approved',         label: 'Approved',       dot: 'bg-green-400',   activeClass: 'bg-green-600 border-green-600 text-white' },
  { key: 'Rejected',         label: 'Rejected',       dot: 'bg-red-400',     activeClass: 'bg-red-500 border-red-500 text-white' },
  { key: 'Cancelled',        label: 'Cancelled',      dot: 'bg-gray-400',    activeClass: 'bg-gray-600 border-gray-600 text-white' },
];

const STATUS_BORDER: Record<string, string> = {
  Draft: 'border-l-amber-400', PrimaryApproved: 'border-l-blue-400',
  Approved: 'border-l-green-500', Rejected: 'border-l-red-400', Cancelled: 'border-l-gray-300',
};

const STATUS_BADGE: Record<string, { bg: string; label: string }> = {
  Draft:           { bg: 'bg-amber-100 text-amber-700',  label: 'Draft'          },
  PrimaryApproved: { bg: 'bg-blue-100 text-blue-700',    label: 'Primary Appr.'  },
  Approved:        { bg: 'bg-green-100 text-green-700',  label: 'Approved'       },
  Rejected:        { bg: 'bg-red-100 text-red-700',      label: 'Rejected'       },
  Cancelled:       { bg: 'bg-gray-100 text-gray-500',    label: 'Cancelled'      },
};

function fmtDate(s?: string) {
  return s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
}

function fmtINR(n?: number | null) {
  return '\u20B9' + (n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

function SkeletonRow() {
  return (
    <tr>{[130, 120, 80, 80, 80, 90].map((w, i) => (
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

function CreateInvoiceModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [vendors, setVendors] = useState<VendorDto[]>([]);
  const [vendorId, setVendorId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [invoiceType, setInvoiceType] = useState('Standard');
  const [paymentMode, setPaymentMode] = useState('NEFT');
  const [creditPeriod, setCreditPeriod] = useState(30);
  const [reference, setReference] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    inventoryVendorApi.list(1, 100).then(r => setVendors(r.items ?? [])).catch(() => {});
  }, []);

  const submit = async () => {
    if (!vendorId) { setError('Select a vendor.'); return; }
    if (!invoiceNumber.trim()) { setError('Invoice number is required.'); return; }
    setBusy(true); setError('');
    try {
      await inventoryInvoiceApi.create({ vendorId, invoiceNumber, invoiceDate, invoiceType, paymentMode, creditPeriod, reference: reference || undefined });
      onCreated();
    } catch (e: any) { setError(e?.response?.data ?? e?.message ?? 'Failed to create invoice.'); }
    finally { setBusy(false); }
  };

  return (
    <Modal title="New Invoice" onClose={onClose}>
      <div className="p-6 space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor <span className="text-red-500">*</span></label>
            <select value={vendorId} onChange={e => setVendorId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— Select Vendor —</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number <span className="text-red-500">*</span></label>
            <input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
            <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Type</label>
            <select value={invoiceType} onChange={e => setInvoiceType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['Standard', 'Credit', 'Debit', 'Proforma'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
            <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['NEFT', 'RTGS', 'Cheque', 'UPI', 'Cash', 'Card'].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Credit Period (days)</label>
            <input type="number" min={0} value={creditPeriod} onChange={e => setCreditPeriod(parseInt(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
            <input value={reference} onChange={e => setReference(e.target.value)} placeholder="e.g. PO number or delivery note"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
        <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Cancel</button>
        <button onClick={submit} disabled={busy}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
          {busy ? 'Creating…' : 'Create Invoice'}
        </button>
      </div>
    </Modal>
  );
}

export default function InvoicesPage() {
  const [rows, setRows] = useState<PurchaseInvoiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { const d = await inventoryInvoiceApi.list({ pageSize: 100 }); setRows(d.items ?? []); }
    catch (err: any) { setError(err?.response?.data ?? err?.message ?? 'Failed to load.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() =>
    rows.filter(r => statusTab === 'All' || r.invoiceStatus === statusTab)
        .filter(r => !search || r.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) || r.vendorName?.toLowerCase().includes(search.toLowerCase())),
    [rows, statusTab, search]);

  const doAction = async (id: string, action: () => Promise<unknown>, label: string) => {
    setActing(id + label);
    try { await action(); toast.success(`${label} successful.`); await load(); }
    catch (err: any) { toast.error(err?.response?.data ?? err?.message ?? `${label} failed.`); await load(); }
    finally { setActing(null); }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Invoices</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track and approve vendor invoices</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4" /> New Invoice
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
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by invoice # or vendor…"
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
              {['Invoice #', 'Vendor', 'Status', 'Type', 'Net Amount', 'Date', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />) :
             filtered.length === 0 ? (
               <tr><td colSpan={7} className="px-4 py-16 text-center">
                 <Receipt className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                 <p className="text-gray-400 text-sm">No invoices found</p>
               </td></tr>
             ) : filtered.map(r => (
               <tr key={r.id} className={`border-l-4 ${STATUS_BORDER[r.invoiceStatus] ?? 'border-l-transparent'} hover:bg-gray-50 transition-colors`}>
                 <td className="px-4 py-3 font-mono font-semibold text-xs text-blue-600">{r.invoiceNumber}</td>
                 <td className="px-4 py-3 text-gray-700 text-xs">{r.vendorName ?? '—'}</td>
                 <td className="px-4 py-3"><StatusBadge status={r.invoiceStatus} /></td>
                 <td className="px-4 py-3 text-gray-500 text-xs">{r.invoiceType ?? '—'}</td>
                 <td className="px-4 py-3 text-right font-mono text-xs">{fmtINR(r.netAmount)}</td>
                 <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(r.invoiceDate)}</td>
                 <td className="px-4 py-3">
                   <div className="flex items-center gap-1 flex-wrap">
                     {r.invoiceStatus === 'Draft' && (
                       <button onClick={() => doAction(r.id, () => inventoryInvoiceApi.submit(r.id), 'Submit')}
                         disabled={acting === r.id + 'Submit'}
                         className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                         <Send className="w-3 h-3" /> Submit
                       </button>
                     )}
                     {(r.invoiceStatus === 'PrimaryApproved') && (
                       <button onClick={() => doAction(r.id, () => inventoryInvoiceApi.approve(r.id, 'FinalApproval'), 'Approve')}
                         disabled={acting === r.id + 'Approve'}
                         className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                         <CheckCircle className="w-3 h-3" /> Approve
                       </button>
                     )}
                     {(r.invoiceStatus === 'PrimaryApproved') && (
                       <button onClick={() => {
                         const remarks = window.prompt('Rejection remarks?') ?? '';
                         doAction(r.id, () => inventoryInvoiceApi.approve(r.id, 'Rejection', remarks), 'Reject');
                       }}
                         className="flex items-center gap-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">
                         <XCircle className="w-3 h-3" /> Reject
                       </button>
                     )}
                     {(r.invoiceStatus === 'Draft') && (
                       <button onClick={() => doAction(r.id, () => inventoryInvoiceApi.cancel(r.id), 'Cancel')}
                         className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                         <Ban className="w-3 h-3" /> Cancel
                       </button>
                     )}
                   </div>
                 </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateInvoiceModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); toast.success('Invoice created!'); }} />
      )}
    </div>
  );
}
