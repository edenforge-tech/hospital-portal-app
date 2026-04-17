'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, RefreshCw, Search, ShoppingCart, X, CheckCircle, XCircle, Send, Truck, Ban, Pencil, PackageCheck, Lock, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { branchesApi } from '@/lib/api';
import {
  purchaseOrderApi,
  inventoryVendorApi,
  inventoryItemApi,
  inventoryStoreApi,
  VendorDto,
  ItemDto,
  StoreDto,
  type UpdatePurchaseOrderRequest,
} from '@/lib/api/inventory-service.api';

const STATUS_TABS = [
  { key: 'All',          label: 'All',            dot: 'bg-slate-400',   activeClass: 'bg-slate-600 border-slate-600 text-white' },
  { key: 'Draft',        label: 'Draft',          dot: 'bg-amber-400',   activeClass: 'bg-amber-500 border-amber-500 text-white' },
  { key: 'Submitted',    label: 'Submitted',      dot: 'bg-blue-400',    activeClass: 'bg-blue-500 border-blue-500 text-white' },
  { key: 'L1Approved',   label: 'L1 Approved',    dot: 'bg-cyan-400',    activeClass: 'bg-cyan-600 border-cyan-600 text-white' },
  { key: 'L2Approved',   label: 'L2 Approved',    dot: 'bg-indigo-400',  activeClass: 'bg-indigo-600 border-indigo-600 text-white' },
  { key: 'Approved',     label: 'Approved',       dot: 'bg-teal-400',    activeClass: 'bg-teal-600 border-teal-600 text-white' },
  { key: 'SentToVendor', label: 'Sent to Vendor', dot: 'bg-purple-400',  activeClass: 'bg-purple-600 border-purple-600 text-white' },
  { key: 'PartiallyReceived', label: 'Partial',   dot: 'bg-orange-400',  activeClass: 'bg-orange-500 border-orange-500 text-white' },
  { key: 'FullyReceived', label: 'Received',      dot: 'bg-green-400',   activeClass: 'bg-green-600 border-green-600 text-white' },
  { key: 'Rejected',     label: 'Rejected',       dot: 'bg-red-400',     activeClass: 'bg-red-500 border-red-500 text-white' },
  { key: 'Cancelled',    label: 'Cancelled',      dot: 'bg-gray-400',    activeClass: 'bg-gray-600 border-gray-600 text-white' },
];

const STATUS_BORDER: Record<string, string> = {
  Draft: 'border-l-amber-400', Submitted: 'border-l-blue-400',
  L1Approved: 'border-l-cyan-400', L2Approved: 'border-l-indigo-400', Approved: 'border-l-teal-400',
  SentToVendor: 'border-l-purple-400', PartiallyReceived: 'border-l-orange-400',
  FullyReceived: 'border-l-green-500', Rejected: 'border-l-red-400', Cancelled: 'border-l-gray-300',
};

const STATUS_BADGE: Record<string, { bg: string; label: string }> = {
  Draft:              { bg: 'bg-amber-100 text-amber-700',   label: 'Draft'          },
  Submitted:          { bg: 'bg-blue-100 text-blue-700',     label: 'Submitted'      },
  L1Approved:         { bg: 'bg-cyan-100 text-cyan-700',     label: 'L1 Approved'   },
  L2Approved:         { bg: 'bg-indigo-100 text-indigo-700', label: 'L2 Approved'   },
  Approved:           { bg: 'bg-teal-100 text-teal-700',     label: 'Approved'       },
  SentToVendor:       { bg: 'bg-purple-100 text-purple-700', label: 'Sent to Vendor' },
  PartiallyReceived:  { bg: 'bg-orange-100 text-orange-700', label: 'Partial'        },
  FullyReceived:      { bg: 'bg-green-100 text-green-700',   label: 'Received'       },
  Rejected:           { bg: 'bg-red-100 text-red-700',       label: 'Rejected'       },
  Cancelled:          { bg: 'bg-gray-100 text-gray-500',     label: 'Cancelled'      },
};

function fmtDate(s?: string) {
  return s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
}

function fmtINR(n?: number | null) {
  return '\u20B9' + (n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

function SkeletonRow() {
  return (
    <tr>{[130, 120, 80, 80, 90, 80, 90].map((w, i) => (
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CreatePOModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [vendors, setVendors] = useState<VendorDto[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [items, setItems] = useState<ItemDto[]>([]);
  const [itemSearch, setItemSearch] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [poDate, setPoDate] = useState(new Date().toISOString().slice(0, 10));
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [lines, setLines] = useState<{ itemId: string; itemName: string; orderedQty: number; unit: string; unitPrice: number; gstPercent: number }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      inventoryVendorApi.list().then(r => r.items ?? []),
      branchesApi.getAll().then(r => r.data?.branches ?? []),
      inventoryItemApi.list({ pageSize: 100 }).then(r => r.items ?? []),
    ]).then(([v, b, it]) => { setVendors(v); setBranches(b); setItems(it); }).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      inventoryItemApi.list({ pageSize: 100, search: itemSearch || undefined }).then(it => setItems(it.items ?? [])).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [itemSearch]);

  const addLine = (item: ItemDto) => {
    if (lines.some(l => l.itemId === item.id)) return;
    setLines(prev => [...prev, { itemId: item.id, itemName: item.itemName, orderedQty: 1, unit: item.unit ?? 'Nos', unitPrice: 0, gstPercent: 0 }]);
  };

  const lineTotal  = lines.reduce((s, l) => s + l.orderedQty * l.unitPrice, 0);
  const gstTotal   = lines.reduce((s, l) => s + l.orderedQty * l.unitPrice * l.gstPercent / 100, 0);
  const grandTotal = lineTotal + gstTotal;

  const submit = async () => {
    if (!vendorId) { setError('Select a vendor.'); return; }
    if (!branchId) { setError('Select a branch.'); return; }
    if (lines.length === 0) { setError('Add at least one item.'); return; }
    setBusy(true); setError('');
    try {
      await purchaseOrderApi.create({
        vendorId,
        branchId,
        sourceType: 'Direct',
        expectedDeliveryDate: expectedDelivery || undefined,
        isEmergency,
        notes: notes || undefined,
        terms: terms || undefined,
        items: lines.map(l => ({
          itemId: l.itemId,
          orderedQty: l.orderedQty,
          unitPrice: l.unitPrice,
          gstPercent: l.gstPercent,
          totalAmount: l.orderedQty * l.unitPrice,
          unit: l.unit,
        })),
      });
      onCreated();
    } catch (e: any) {
      setError(e?.response?.data ?? e?.message ?? 'Failed to create PO.');
    } finally { setBusy(false); }
  };

  return (
    <Modal title="New Purchase Order" onClose={onClose}>
      <div className="p-6 space-y-4 max-h-[68vh] overflow-y-auto">
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor <span className="text-red-500">*</span></label>
            <select value={vendorId} onChange={e => setVendorId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— Select Vendor —</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name} ({v.vendorCode})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch <span className="text-red-500">*</span></label>
            <select value={branchId} onChange={e => setBranchId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— Select Branch —</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PO Date</label>
            <input type="date" value={poDate} onChange={e => setPoDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery</label>
            <input type="date" value={expectedDelivery} onChange={e => setExpectedDelivery(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <input type="checkbox" id="emergency" checked={isEmergency} onChange={e => setIsEmergency(e.target.checked)}
              className="rounded" />
            <label htmlFor="emergency" className="text-sm font-medium text-gray-700">Emergency Purchase</label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search & Add Items</label>
          <input value={itemSearch} onChange={e => setItemSearch(e.target.value)} placeholder="Type to search items…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2" />
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            onChange={e => { const item = items.find(i => i.id === e.target.value); if (item) addLine(item); (e.target as HTMLSelectElement).value = ''; }}>
            <option value="">— Select item to add —</option>
            {items.map(it => <option key={it.id} value={it.id}>{it.itemName} ({it.unit})</option>)}
          </select>
        </div>

        {lines.length > 0 && (
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['Item', 'Unit', 'Qty', 'Unit Price', 'GST%', 'Total', ''].map(h => <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lines.map((l, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 font-medium text-gray-900">{l.itemName}</td>
                    <td className="px-3 py-2 text-gray-500">{l.unit}</td>
                    <td className="px-3 py-2">
                      <input type="number" min={1} value={l.orderedQty}
                        onChange={e => setLines(prev => { const n = [...prev]; n[i] = { ...n[i], orderedQty: parseInt(e.target.value) || 1 }; return n; })}
                        className="border rounded px-2 py-1 w-20 text-center text-sm" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min={0} step={0.01} value={l.unitPrice}
                        onChange={e => setLines(prev => { const n = [...prev]; n[i] = { ...n[i], unitPrice: parseFloat(e.target.value) || 0 }; return n; })}
                        className="border rounded px-2 py-1 w-24 text-right text-sm" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min={0} max={100} step={0.5} value={l.gstPercent}
                        onChange={e => setLines(prev => { const n = [...prev]; n[i] = { ...n[i], gstPercent: parseFloat(e.target.value) || 0 }; return n; })}
                        className="border rounded px-2 py-1 w-16 text-center text-sm" />
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs">{fmtINR(l.orderedQty * l.unitPrice * (1 + l.gstPercent / 100))}</td>
                    <td className="px-3 py-2">
                      <button onClick={() => setLines(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 bg-gray-50 border-t flex justify-end gap-4">
              <span className="text-sm text-gray-500">Subtotal: {fmtINR(lineTotal)}</span>
              <span className="text-sm text-gray-500">GST: {fmtINR(gstTotal)}</span>
              <span className="text-sm font-semibold text-gray-700">Grand Total: {fmtINR(grandTotal)}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
            <textarea value={terms} onChange={e => setTerms(e.target.value)} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
        <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Cancel</button>
        <button onClick={submit} disabled={busy || lines.length === 0}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
          {busy ? 'Creating…' : 'Create Purchase Order'}
        </button>
      </div>
    </Modal>
  );
}

function RecordReceiptModal({ po, onClose, onDone }: { po: any; onClose: () => void; onDone: () => void }) {
  const [stores, setStores] = useState<StoreDto[]>([]);
  const [storeId, setStoreId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<{ itemId: string; itemName: string; orderedQty: number; alreadyReceived: number; receivedQty: number; batchNumber: string; expiryDate: string; mrp: string; barcode: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    inventoryStoreApi.list().then(r => setStores(r.items ?? [])).catch(() => {});
    const items: any[] = po.items ?? po.lineItems ?? [];
    setLines(items.map((it: any) => {
      const oQty = it.orderedQty ?? it.quantity ?? 0;
      const rxQty = it.receivedQty ?? 0;
      const remaining = Math.max(0, oQty - rxQty);
      return {
        itemId: it.itemId ?? it.id,
        itemName: it.item?.itemName ?? it.itemName ?? '—',
        orderedQty: oQty,
        alreadyReceived: rxQty,
        receivedQty: po.poStatus === 'PartiallyReceived' ? remaining : oQty,
        batchNumber: '',
        expiryDate: '',
        mrp: '',
        barcode: '',
      };
    }));
  }, [po]);

  const submit = async () => {
    if (!storeId) { setErr('Select a store.'); return; }
    if (lines.some(l => l.receivedQty <= 0)) { setErr('All received quantities must be > 0.'); return; }
    setBusy(true); setErr('');
    try {
      await purchaseOrderApi.receive(po.id, {
        storeId,
        actualDeliveryDate: deliveryDate || undefined,
        notes: notes || undefined,
        items: lines.map(l => ({
          itemId: l.itemId,
          receivedQty: l.receivedQty,
          batchNumber: l.batchNumber || undefined,
          expiryDate: l.expiryDate || undefined,
          mrp: l.mrp ? parseFloat(l.mrp) : undefined,
          barcode: l.barcode || undefined,
        })),
      });
      toast.success('Receipt recorded. Stock updated.');
      onDone();
    } catch (e: any) {
      setErr(e?.response?.data ?? e?.message ?? 'Failed to record receipt.');
    } finally { setBusy(false); }
  };

  return (
    <Modal title={`Record Receipt — ${po.poNumber}`} onClose={onClose}>
      <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receiving Store <span className="text-red-500">*</span></label>
            <select value={storeId} onChange={e => setStoreId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— Select Store —</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.storeName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Actual Delivery Date</label>
            <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        {lines.length > 0 && (
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['Item', 'Ordered', 'Rcvd So Far', 'Receiving Now', 'Batch #', 'Expiry', 'MRP', 'Barcode'].map(h =>
                  <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lines.map((l, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 font-medium text-gray-900 text-xs">{l.itemName}</td>
                    <td className="px-3 py-2 text-gray-500 text-xs font-mono">{l.orderedQty}</td>
                    <td className="px-3 py-2 text-gray-400 text-xs font-mono">{l.alreadyReceived}</td>
                    <td className="px-3 py-2">
                      <input type="number" min={1} value={l.receivedQty}
                        onChange={e => setLines(prev => { const n = [...prev]; n[i] = { ...n[i], receivedQty: parseInt(e.target.value) || 0 }; return n; })}
                        className="border rounded px-2 py-1 w-20 text-center text-sm" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" placeholder="Batch #" value={l.batchNumber}
                        onChange={e => setLines(prev => { const n = [...prev]; n[i] = { ...n[i], batchNumber: e.target.value }; return n; })}
                        className="border rounded px-2 py-1 w-24 text-sm" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="date" value={l.expiryDate}
                        onChange={e => setLines(prev => { const n = [...prev]; n[i] = { ...n[i], expiryDate: e.target.value }; return n; })}
                        className="border rounded px-2 py-1 text-sm" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min={0} step={0.01} placeholder="MRP" value={l.mrp}
                        onChange={e => setLines(prev => { const n = [...prev]; n[i] = { ...n[i], mrp: e.target.value }; return n; })}
                        className="border rounded px-2 py-1 w-20 text-right text-sm" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" placeholder="Barcode" value={l.barcode}
                        onChange={e => setLines(prev => { const n = [...prev]; n[i] = { ...n[i], barcode: e.target.value }; return n; })}
                        className="border rounded px-2 py-1 w-28 text-sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {lines.length === 0 && <p className="text-sm text-amber-600">No line items found on this PO. Cannot record receipt.</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
        <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Cancel</button>
        <button onClick={submit} disabled={busy || lines.length === 0}
          className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium">
          {busy ? 'Recording…' : 'Record Receipt'}
        </button>
      </div>
    </Modal>
  );
}

function EditPOModal({ poId, onClose, onUpdated }: { poId: string; onClose: () => void; onUpdated: () => void }) {
  const [vendors, setVendors] = useState<VendorDto[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [items, setItems] = useState<ItemDto[]>([]);
  const [itemSearch, setItemSearch] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [lines, setLines] = useState<{ itemId: string; itemName: string; orderedQty: number; unit: string; unitPrice: number; gstPercent: number }[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      inventoryVendorApi.list().then(r => r.items ?? []),
      branchesApi.getAll().then(r => r.data?.branches ?? []),
      inventoryItemApi.list({ pageSize: 100 }).then(r => r.items ?? []),
      purchaseOrderApi.get(poId),
    ]).then(([v, b, it, po]) => {
      setVendors(v); setBranches(b); setItems(it);
      setVendorId(po.vendorId ?? '');
      setBranchId(po.branchId ?? '');
      setExpectedDelivery(po.expectedDeliveryDate ? po.expectedDeliveryDate.slice(0, 10) : '');
      setIsEmergency(po.isEmergency ?? false);
      setNotes(po.notes ?? '');
      setTerms(po.terms ?? '');
      setLines((po.items ?? []).map((it: any) => ({
        itemId: it.itemId,
        itemName: it.item?.itemName ?? it.itemName ?? '—',
        orderedQty: it.orderedQty ?? 1,
        unit: it.unit ?? 'Nos',
        unitPrice: it.unitPrice ?? 0,
        gstPercent: it.gstPercent ?? 0,
      })));
      setLoading(false);
    }).catch(e => { setError(e?.message ?? 'Failed to load PO.'); setLoading(false); });
  }, [poId]);

  useEffect(() => {
    const t = setTimeout(() => {
      inventoryItemApi.list({ pageSize: 100, search: itemSearch || undefined }).then(it => setItems(it.items ?? [])).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [itemSearch]);

  const addLine = (item: ItemDto) => {
    if (lines.some(l => l.itemId === item.id)) return;
    setLines(prev => [...prev, { itemId: item.id, itemName: item.itemName, orderedQty: 1, unit: item.unit ?? 'Nos', unitPrice: 0, gstPercent: 0 }]);
  };

  const lineTotal  = lines.reduce((s, l) => s + l.orderedQty * l.unitPrice, 0);
  const gstTotal   = lines.reduce((s, l) => s + l.orderedQty * l.unitPrice * l.gstPercent / 100, 0);
  const grandTotal = lineTotal + gstTotal;

  const submit = async () => {
    if (!vendorId) { setError('Select a vendor.'); return; }
    if (!branchId) { setError('Select a branch.'); return; }
    if (lines.length === 0) { setError('Add at least one item.'); return; }
    setBusy(true); setError('');
    try {
      const req: UpdatePurchaseOrderRequest = {
        vendorId,
        branchId,
        expectedDeliveryDate: expectedDelivery || undefined,
        isEmergency,
        notes: notes || undefined,
        terms: terms || undefined,
        items: lines.map(l => ({
          itemId: l.itemId,
          orderedQty: l.orderedQty,
          unitPrice: l.unitPrice,
          gstPercent: l.gstPercent,
          totalAmount: l.orderedQty * l.unitPrice,
          unit: l.unit,
        })),
      };
      await purchaseOrderApi.update(poId, req);
      onUpdated();
    } catch (e: any) {
      setError(e?.response?.data ?? e?.message ?? 'Failed to update PO.');
    } finally { setBusy(false); }
  };

  return (
    <Modal title="Edit Purchase Order (Draft)" onClose={onClose}>
      <div className="p-6 space-y-4 max-h-[68vh] overflow-y-auto">
        {loading && <p className="text-sm text-gray-500">Loading PO details…</p>}
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        {!loading && (<>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor <span className="text-red-500">*</span></label>
              <select value={vendorId} onChange={e => setVendorId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— Select Vendor —</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name} ({v.vendorCode})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch <span className="text-red-500">*</span></label>
              <select value={branchId} onChange={e => setBranchId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— Select Branch —</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery</label>
              <input type="date" value={expectedDelivery} onChange={e => setExpectedDelivery(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex items-center gap-2 mt-5">
              <input type="checkbox" id="edit-emergency" checked={isEmergency} onChange={e => setIsEmergency(e.target.checked)} className="rounded" />
              <label htmlFor="edit-emergency" className="text-sm font-medium text-gray-700">Emergency Purchase</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search & Add Items</label>
            <input value={itemSearch} onChange={e => setItemSearch(e.target.value)} placeholder="Type to search items…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2" />
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              onChange={e => { const item = items.find(i => i.id === e.target.value); if (item) addLine(item); (e.target as HTMLSelectElement).value = ''; }}>
              <option value="">— Select item to add —</option>
              {items.map(it => <option key={it.id} value={it.id}>{it.itemName} ({it.unit})</option>)}
            </select>
          </div>

          {lines.length > 0 && (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>{['Item', 'Unit', 'Qty', 'Unit Price', 'GST%', 'Total', ''].map(h => <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lines.map((l, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 font-medium text-gray-900">{l.itemName}</td>
                      <td className="px-3 py-2 text-gray-500">{l.unit}</td>
                      <td className="px-3 py-2">
                        <input type="number" min={1} value={l.orderedQty}
                          onChange={e => setLines(prev => { const n = [...prev]; n[i] = { ...n[i], orderedQty: parseInt(e.target.value) || 1 }; return n; })}
                          className="border rounded px-2 py-1 w-20 text-center text-sm" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" min={0} step={0.01} value={l.unitPrice}
                          onChange={e => setLines(prev => { const n = [...prev]; n[i] = { ...n[i], unitPrice: parseFloat(e.target.value) || 0 }; return n; })}
                          className="border rounded px-2 py-1 w-24 text-right text-sm" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" min={0} max={100} step={0.5} value={l.gstPercent}
                          onChange={e => setLines(prev => { const n = [...prev]; n[i] = { ...n[i], gstPercent: parseFloat(e.target.value) || 0 }; return n; })}
                          className="border rounded px-2 py-1 w-16 text-center text-sm" />
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs">{fmtINR(l.orderedQty * l.unitPrice * (1 + l.gstPercent / 100))}</td>
                      <td className="px-3 py-2">
                        <button onClick={() => setLines(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-2 bg-gray-50 border-t flex justify-end gap-4">
                <span className="text-sm text-gray-500">Subtotal: {fmtINR(lineTotal)}</span>
                <span className="text-sm text-gray-500">GST: {fmtINR(gstTotal)}</span>
                <span className="text-sm font-semibold text-gray-700">Grand Total: {fmtINR(grandTotal)}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
              <textarea value={terms} onChange={e => setTerms(e.target.value)} rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </>)}
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
        <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Cancel</button>
        <button onClick={submit} disabled={busy || loading || lines.length === 0}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
          {busy ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </Modal>
  );
}

const CHANNELS = ['Email', 'WhatsApp', 'SMS', 'Call', 'Other'] as const;
type Channel = typeof CHANNELS[number];

function SendToVendorModal({ po, onClose, onSent }: { po: any; onClose: () => void; onSent: () => void }) {
  const [channel, setChannel] = useState<Channel>('Email');
  const [contactTarget, setContactTarget] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ notificationSent: boolean; ackId?: string } | null>(null);
  const [error, setError] = useState('');

  const contactLabel = channel === 'Email' ? 'Email address' : 'Phone number';

  const send = async () => {
    if (!contactTarget.trim()) { setError(`Enter the vendor's ${contactLabel.toLowerCase()}.`); return; }
    setBusy(true); setError('');
    try {
      const res = await purchaseOrderApi.sendToVendor(po.id, { channel, contactTarget: contactTarget.trim(), notes: notes || undefined });
      setResult({ notificationSent: res.notificationSent ?? false, ackId: res.ackId });
      onSent();
    } catch (e: any) {
      setError(e?.response?.data ?? e?.message ?? 'Failed to send PO to vendor.');
    } finally { setBusy(false); }
  };

  return (
    <Modal title={`Send to Vendor — ${po.poNumber}`} onClose={onClose}>
      <div className="p-6 space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        {result ? (
          <div className={`rounded-lg p-4 border ${result.notificationSent ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
            <p className={`text-sm font-medium ${result.notificationSent ? 'text-green-700' : 'text-amber-700'}`}>
              {result.notificationSent
                ? `✓ PO sent to vendor via ${channel}. Acknowledgment tracking created.`
                : `PO recorded as sent. Automated notification could not be delivered — please contact the vendor manually.`}
            </p>
            {result.ackId && <p className="text-xs text-gray-500 mt-1">Ack ID: {result.ackId}</p>}
          </div>
        ) : (<>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Channel</label>
            <div className="flex gap-2 flex-wrap">
              {CHANNELS.map(c => (
                <button key={c} onClick={() => setChannel(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                    ${channel === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{contactLabel} <span className="text-red-500">*</span></label>
            <input value={contactTarget} onChange={e => setContactTarget(e.target.value)}
              placeholder={channel === 'Email' ? 'vendor@example.com' : '+91 98765 43210'}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </>)}
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
        <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
          {result ? 'Close' : 'Cancel'}
        </button>
        {!result && (
          <button onClick={send} disabled={busy}
            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium">
            {busy ? 'Sending…' : 'Send & Record'}
          </button>
        )}
      </div>
    </Modal>
  );
}

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [acting, setActing] = useState<string | null>(null);
  const [receiptPo, setReceiptPo] = useState<any | null>(null);
  const [editPoId, setEditPoId] = useState<string | null>(null);
  const [sendPoTarget, setSendPoTarget] = useState<any | null>(null);
  const [fetchingReceipt, setFetchingReceipt] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { const d = await purchaseOrderApi.list({ pageSize: 100 }); setRows(d.items ?? []); }
    catch (err: any) { setError(err?.response?.data ?? err?.message ?? 'Failed to load.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() =>
    rows.filter(r => statusTab === 'All' || r.poStatus === statusTab)
        .filter(r => !search || r.poNumber?.toLowerCase().includes(search.toLowerCase()) || r.vendorName?.toLowerCase().includes(search.toLowerCase())),
    [rows, statusTab, search]);

  const doAction = async (id: string, action: () => Promise<unknown>, label: string) => {
    setActing(id + label);
    try { await action(); toast.success(`${label} successful.`); await load(); }
    catch (err: any) { toast.error(err?.response?.data ?? err?.message ?? `${label} failed.`); await load(); }
    finally { setActing(null); }
  };

  const fetchPoAndOpenReceipt = async (id: string) => {
    setFetchingReceipt(id);
    try {
      const full = await purchaseOrderApi.get(id);
      setReceiptPo(full);
    } catch (e: any) {
      toast.error(e?.response?.data ?? e?.message ?? 'Failed to load PO details.');
    } finally {
      setFetchingReceipt(null);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create, approve, and track vendor purchase orders</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50" title="Refresh">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4" /> New PO
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
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by PO # or vendor…"
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
              {['PO #', 'Vendor', 'Status', 'Emergency', 'Amount', 'PO Date', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />) :
             filtered.length === 0 ? (
               <tr><td colSpan={7} className="px-4 py-16 text-center">
                 <ShoppingCart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                 <p className="text-gray-400 text-sm">No purchase orders found</p>
               </td></tr>
             ) : filtered.map(r => (
               <tr key={r.id} className={`border-l-4 ${STATUS_BORDER[r.poStatus] ?? 'border-l-transparent'} hover:bg-gray-50 transition-colors`}>
                 <td className="px-4 py-3 font-mono font-semibold text-xs text-blue-600">{r.poNumber}</td>
                 <td className="px-4 py-3 text-gray-700 text-xs">{r.vendorName ?? '—'}</td>
                 <td className="px-4 py-3"><StatusBadge status={r.poStatus} /></td>
                 <td className="px-4 py-3">
                   {r.isEmergency && <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">Emergency</span>}
                 </td>
                 <td className="px-4 py-3 text-right font-mono text-xs">{fmtINR(r.netAmount)}</td>
                 <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(r.poDate ?? r.createdAt)}</td>
                 <td className="px-4 py-3">
                   <div className="flex items-center gap-1 flex-wrap">
                     <button onClick={() => router.push(`/admin/inventory/po/${r.id}`)}
                       className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200" title="View details">
                       <Eye className="w-3 h-3" />
                     </button>
                     {r.poStatus === 'Draft' && (<>
                       <button onClick={() => setEditPoId(r.id)}
                         className="flex items-center gap-1 px-2 py-1 text-xs bg-amber-50 text-amber-700 rounded hover:bg-amber-100 border border-amber-200" title="Edit">
                         <Pencil className="w-3 h-3" /> Edit
                       </button>
                       <button onClick={() => doAction(r.id, () => purchaseOrderApi.submit(r.id), 'Submit')}
                         disabled={acting === r.id + 'Submit'}
                         className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                         <Send className="w-3 h-3" /> Submit
                       </button>
                     </>)}
                     {r.poStatus === 'Submitted' && (
                       <button onClick={() => doAction(r.id, () => purchaseOrderApi.approveL1(r.id), 'L1 Approve')}
                         disabled={acting === r.id + 'L1 Approve'}
                         className="flex items-center gap-1 px-2 py-1 text-xs bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:opacity-50">
                         <CheckCircle className="w-3 h-3" /> L1 Approve
                       </button>
                     )}
                     {r.poStatus === 'L1Approved' && (
                       <button onClick={() => doAction(r.id, () => purchaseOrderApi.approveL2(r.id), 'L2 Approve')}
                         disabled={acting === r.id + 'L2 Approve'}
                         className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
                         <CheckCircle className="w-3 h-3" /> L2 Approve
                       </button>
                     )}
                     {(r.poStatus === 'L2Approved' || r.poStatus === 'Approved') && (
                       <button onClick={() => setSendPoTarget(r)}
                         className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700">
                         <Truck className="w-3 h-3" /> Send to Vendor
                       </button>
                     )}
                     {(r.poStatus === 'SentToVendor' || r.poStatus === 'PartiallyReceived') && (
                       <button onClick={() => fetchPoAndOpenReceipt(r.id)}
                         disabled={fetchingReceipt === r.id}
                         className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                         <PackageCheck className="w-3 h-3" /> {fetchingReceipt === r.id ? 'Loading…' : 'Record Receipt'}
                       </button>
                     )}
                     {r.poStatus === 'FullyReceived' && (
                       <button onClick={() => doAction(r.id, () => purchaseOrderApi.close(r.id), 'Close')}
                         disabled={acting === r.id + 'Close'}
                         className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 text-white rounded hover:bg-gray-800 disabled:opacity-50">
                         <Lock className="w-3 h-3" /> Close
                       </button>
                     )}
                     {(r.poStatus === 'Submitted' || r.poStatus === 'L1Approved') && (
                       <button onClick={() => {
                         const remarks = window.prompt('Rejection remarks?') ?? '';
                         doAction(r.id, () => purchaseOrderApi.reject(r.id, { remarks }), 'Reject');
                       }}
                         className="flex items-center gap-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">
                         <XCircle className="w-3 h-3" /> Reject
                       </button>
                     )}
                     {(r.poStatus === 'Draft' || r.poStatus === 'Submitted') && (
                       <button onClick={() => {
                         const reason = window.prompt('Cancellation reason?') ?? '';
                         doAction(r.id, () => purchaseOrderApi.cancel(r.id, { reason }), 'Cancel');
                       }}
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
        <CreatePOModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); toast.success('Purchase Order created!'); }} />
      )}
      {editPoId && (
        <EditPOModal poId={editPoId} onClose={() => setEditPoId(null)} onUpdated={() => { setEditPoId(null); load(); toast.success('PO updated!'); }} />
      )}
      {sendPoTarget && (
        <SendToVendorModal po={sendPoTarget} onClose={() => setSendPoTarget(null)} onSent={() => { setSendPoTarget(null); load(); }} />
      )}
      {receiptPo && (
        <RecordReceiptModal po={receiptPo} onClose={() => setReceiptPo(null)} onDone={() => { setReceiptPo(null); load(); }} />
      )}
    </div>
  );
}
