'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, RefreshCw, FileText, XCircle,
  PackageCheck, CheckCircle2, AlertTriangle,
  Pencil, Printer, ChevronLeft, ChevronRight, X,
  Package, ShoppingCart, Tag, Ban, ClipboardList,
  Calendar, Hash, Building2, CreditCard, Store,
  Plus, Trash2, Edit,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/lib/auth-store';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import {
  inventoryGrnApi,
  inventoryInvoiceApi,
  inventoryVendorApi,
  GrnHeaderDto,
  VendorDto,
  PurchaseInvoiceDto,
  PurchaseItemDto,
} from '@/lib/api/inventory-service.api';
import { ItemSearchModal, LastPurchaseInfo } from '@/components/inventory/ItemSearchModal';
import { ItemGstFormModal, GrnLineItem } from '@/components/inventory/ItemGstFormModal';
import type { ItemDto } from '@/lib/api/inventory-service.api';

// ─── Constants ──────────────────────────────────────────────────────────────────
const MODULE_TABS = ['GRN', 'Bill Transfer', 'Settlements'] as const;

const STATUS_TABS = [
  { key: 'All',             label: 'All',              dot: 'bg-slate-400',   activeClass: 'bg-slate-600 border-slate-600 text-white' },
  { key: 'GRNNotGenerated', label: 'Not Generated',    dot: 'bg-teal-500',    activeClass: 'bg-teal-500 border-teal-500 text-white' },
  { key: 'Draft',           label: 'Not Approved',     dot: 'bg-amber-500',   activeClass: 'bg-amber-500 border-amber-500 text-white' },
  { key: 'PrimaryApproved', label: 'Primary Approved', dot: 'bg-emerald-500', activeClass: 'bg-emerald-500 border-emerald-500 text-white' },
  { key: 'Approved',        label: 'Approved',         dot: 'bg-blue-500',    activeClass: 'bg-blue-500 border-blue-500 text-white' },
  { key: 'Cancelled',       label: 'Cancelled',        dot: 'bg-rose-500',    activeClass: 'bg-rose-500 border-rose-500 text-white' },
];

const STATUS_BORDER: Record<string, string> = {
  GRNNotGenerated: 'border-l-teal-400',
  Draft:           'border-l-amber-400',
  PrimaryApproved: 'border-l-emerald-400',
  Approved:        'border-l-blue-400',
  Cancelled:       'border-l-rose-400',
  Rejected:        'border-l-rose-400',
};

const STATUS_BADGE: Record<string, { bg: string; label: string }> = {
  GRNNotGenerated: { bg: 'bg-teal-100 text-teal-700',       label: 'Not Generated'    },
  Draft:           { bg: 'bg-amber-100 text-amber-700',     label: 'Not Approved'     },
  PrimaryApproved: { bg: 'bg-emerald-100 text-emerald-700', label: 'Primary Approved' },
  Approved:        { bg: 'bg-blue-100 text-blue-700',       label: 'Approved'         },
  Cancelled:       { bg: 'bg-rose-100 text-rose-700',       label: 'Cancelled'        },
  Rejected:        { bg: 'bg-rose-100 text-rose-700',       label: 'Rejected'         },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────────
function fmtDate(s?: string) {
  return s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
}

function fmtINR(n?: number | null) {
  return '₹' + (n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

// ─── Mini progress bar ────────────────────────────────────────────────────────────
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="mt-2 h-1 w-full rounded-full bg-gray-100 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_BADGE[status] ?? { bg: 'bg-gray-100 text-gray-600', label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg}`}>
      {cfg.label}
    </span>
  );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr>
      {[100, 90, 80, 130, 110, 90, 90, 80, 90, 90].map((w, i) => (
        <td key={i} className="px-3 py-3">
          <div className="h-3 bg-gray-100 rounded-full animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Inline action buttons ────────────────────────────────────────────────────────
function ActionButtons({
  row,
  onEdit,
  onGenerateGrn,
  onCancelGrn,
  onCancelInvoice,
  onPrimaryApproval,
  onFinalApproval,
  onPrint,
}: {
  row: GrnHeaderDto;
  onEdit:            (r: GrnHeaderDto) => void;
  onGenerateGrn:     (r: GrnHeaderDto) => void;
  onCancelGrn:       (r: GrnHeaderDto) => void;
  onCancelInvoice:   (r: GrnHeaderDto) => void;
  onPrimaryApproval: (r: GrnHeaderDto) => void;
  onFinalApproval:   (r: GrnHeaderDto) => void;
  onPrint:           (r: GrnHeaderDto) => void;
}) {
  const btn = (title: string, icon: React.ReactNode, onClick: () => void, cls: string) => (
    <button
      key={title}
      title={title}
      onClick={e => { e.stopPropagation(); onClick(); }}
      className={`p-1.5 rounded-lg transition-colors ${cls}`}
    >
      {icon}
    </button>
  );

  switch (row.grnStatus) {
    case 'GRNNotGenerated':
      return (
        <div className="flex items-center gap-0.5">
          {btn('Generate GRN',   <PackageCheck size={14} />, () => onGenerateGrn(row),  'text-teal-600 hover:bg-teal-50')}
          {btn('Edit',           <Pencil size={14} />,       () => onEdit(row),          'text-gray-400 hover:text-blue-600 hover:bg-blue-50')}
          {btn('Cancel Invoice', <XCircle size={14} />,      () => onCancelInvoice(row), 'text-gray-400 hover:text-rose-600 hover:bg-rose-50')}
        </div>
      );
    case 'Draft':
      return (
        <div className="flex items-center gap-0.5">
          {btn('Primary Approval', <CheckCircle2 size={14} />, () => onPrimaryApproval(row), 'text-amber-500 hover:bg-amber-50')}
          {btn('Edit',             <Pencil size={14} />,       () => onEdit(row),             'text-gray-400 hover:text-blue-600 hover:bg-blue-50')}
          {btn('Print',            <Printer size={14} />,      () => onPrint(row),            'text-gray-400 hover:text-gray-700 hover:bg-gray-100')}
          {btn('Cancel GRN',       <XCircle size={14} />,      () => onCancelGrn(row),        'text-gray-400 hover:text-rose-600 hover:bg-rose-50')}
        </div>
      );
    case 'PrimaryApproved':
      return (
        <div className="flex items-center gap-0.5">
          {btn('Final Approval', <CheckCircle2 size={14} />, () => onFinalApproval(row), 'text-emerald-600 hover:bg-emerald-50')}
          {btn('Edit',           <Pencil size={14} />,       () => onEdit(row),           'text-gray-400 hover:text-blue-600 hover:bg-blue-50')}
          {btn('Print',          <Printer size={14} />,      () => onPrint(row),          'text-gray-400 hover:text-gray-700 hover:bg-gray-100')}
          {btn('Cancel GRN',     <XCircle size={14} />,      () => onCancelGrn(row),      'text-gray-400 hover:text-rose-600 hover:bg-rose-50')}
        </div>
      );
    case 'Approved':
      return (
        <div className="flex items-center gap-0.5">
          {btn('Print', <Printer size={14} />, () => onPrint(row), 'text-gray-400 hover:text-gray-700 hover:bg-gray-100')}
        </div>
      );
    default:
      return null;
  }
}

// ─── MetaRow helper ──────────────────────────────────────────────────────────────
function MetaRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-xs font-medium text-gray-700">{value || '—'}</span>
    </div>
  );
}

// ─── MetaChip helper (used in GrnDetailsModal metadata strip) ────────────────────
function MetaChip({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-center gap-1.5 bg-white border border-blue-100 shadow-sm rounded-lg px-3 py-1.5">
      {icon && <span className="text-blue-400 flex-shrink-0">{icon}</span>}
      <div className="flex flex-col leading-tight">
        <span className="text-[9px] font-bold uppercase tracking-wide text-gray-400">{label}</span>
        <span className="text-xs font-semibold text-gray-800 truncate max-w-[160px]">{value || '—'}</span>
      </div>
    </div>
  );
}

// ─── GRN Details modal ────────────────────────────────────────────────────────────
function GrnDetailsModal({ row, onClose, onPrint }: { row: GrnHeaderDto; onClose: () => void; onPrint: (r: GrnHeaderDto) => void }) {
  const [fetchedInv, setFetchedInv] = useState<PurchaseInvoiceDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setDetailLoading(true);
    inventoryInvoiceApi.get(row.invoiceId)
      .then(inv => { if (!cancelled) setFetchedInv(inv); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setDetailLoading(false); });
    return () => { cancelled = true; };
  }, [row.invoiceId]);

  const items = (fetchedInv?.items ?? []) as PurchaseItemDto[];

  const taxable = fetchedInv?.taxableAmount ?? 0;
  const cgst    = (fetchedInv?.totalGst ?? 0) / 2;
  const sgst    = (fetchedInv?.totalGst ?? 0) / 2;
  const igst    = 0;

  const isCancelled = row.grnStatus === 'Cancelled' || row.grnStatus === 'Rejected';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/35 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden mt-6 mb-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Package size={16} className="text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-semibold text-gray-900">Purchase Details</h2>
                {row.grnNumber && (
                  <span className="font-mono text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded">
                    {row.grnNumber}
                  </span>
                )}
                <StatusBadge status={row.grnStatus} />
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {row.vendorName} · {detailLoading ? 'Loading…' : `${items.length} ${items.length === 1 ? 'item' : 'items'}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(row.grnStatus === 'Draft' || row.grnStatus === 'PrimaryApproved' || row.grnStatus === 'Approved') && (
              <button
                onClick={() => { onClose(); onPrint(row); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Printer size={13} /> Print
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white/70 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Metadata strip ─────────────────────────────────────────── */}
        <div className="bg-blue-50/60 border-b border-blue-100 px-5 py-3 flex flex-wrap gap-2">
          <MetaChip icon={<Hash size={12} />}      label="Invoice No"    value={row.invoiceNumber} />
          <MetaChip icon={<Hash size={12} />}      label="GRN No"        value={row.grnNumber} />
          <MetaChip icon={<Calendar size={12} />}  label="Invoice Date"  value={fmtDate(row.invoiceDate)} />
          <MetaChip icon={<Calendar size={12} />}  label="GRN Date"      value={fmtDate(row.grnDate)} />
          <MetaChip icon={<Building2 size={12} />} label="Supplier"      value={row.vendorName} />
          {row.dueDate         && <MetaChip icon={<Calendar size={12} />}   label="Due Date"      value={fmtDate(row.dueDate)} />}
          {row.storeName       && <MetaChip icon={<Store size={12} />}       label="Store"         value={row.storeName} />}
          {row.paymentMode     && <MetaChip icon={<CreditCard size={12} />}  label="Payment Mode"  value={row.paymentMode} />}
          {row.purchaseCategory && <MetaChip icon={<Tag size={12} />}        label="Category"      value={row.purchaseCategory} />}
        </div>

        {/* ── Cancellation / rejection reason banner ──────────────── */}
        {isCancelled && row.remarks && (
          <div className="mx-5 mt-4 flex items-start gap-2.5 bg-rose-50 border-l-4 border-rose-400 rounded-xl px-4 py-3">
            <AlertTriangle size={14} className="text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-rose-700">
                {row.grnStatus === 'Rejected' ? 'Rejection' : 'Cancellation'} Reason:
              </span>
              <span className="text-xs text-rose-600 ml-1">{row.remarks}</span>
            </div>
          </div>
        )}

        {/* ── Body (scrollable) ───────────────────────────────────── */}
        <div className="px-5 py-5 max-h-[65vh] overflow-y-auto space-y-5">

          {/* Items table */}
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
              Items ({detailLoading ? '…' : items.length})
            </p>
            {detailLoading ? (
              <div className="py-12 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
                No item details available
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-widest text-gray-400 w-8">#</th>
                      <th className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-widest text-gray-400">Item Name</th>
                      <th className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-widest text-gray-400">Batch</th>
                      <th className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-widest text-gray-400">Expiry</th>
                      <th className="px-3 py-2.5 text-center text-[9px] font-bold uppercase tracking-widest text-gray-400">Ordered</th>
                      <th className="px-3 py-2.5 text-center text-[9px] font-bold uppercase tracking-widest text-emerald-500">Accepted</th>
                      <th className="px-3 py-2.5 text-center text-[9px] font-bold uppercase tracking-widest text-rose-400">Rejected</th>
                      <th className="px-3 py-2.5 text-center text-[9px] font-bold uppercase tracking-widest text-teal-500">Free</th>
                      <th className="px-3 py-2.5 text-right text-[9px] font-bold uppercase tracking-widest text-gray-400">Rate</th>
                      <th className="px-3 py-2.5 text-right text-[9px] font-bold uppercase tracking-widest text-emerald-600">Disc%</th>
                      <th className="px-3 py-2.5 text-right text-[9px] font-bold uppercase tracking-widest text-gray-400">MRP</th>
                      <th className="px-3 py-2.5 text-right text-[9px] font-bold uppercase tracking-widest text-orange-500">CGST%</th>
                      <th className="px-3 py-2.5 text-right text-[9px] font-bold uppercase tracking-widest text-orange-500">SGST%</th>
                      <th className="px-3 py-2.5 text-right text-[9px] font-bold uppercase tracking-widest text-orange-500">IGST%</th>
                      <th className="px-3 py-2.5 text-right text-[9px] font-bold uppercase tracking-widest text-blue-400">P.Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {items.map((item, i) => (
                      <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                        {/* # */}
                        <td className="px-3 py-3 text-gray-400 text-center font-medium">{i + 1}</td>
                        {/* Item Name + inline batch/expiry tags */}
                        <td className="px-3 py-3">
                          <div className="flex items-start gap-1.5">
                            <div>
                              <p className="font-semibold text-gray-800 leading-tight">{item.itemName || '—'}</p>
                              {item.packing > 0 && (
                                <span className="text-[9px] text-gray-400">
                                  Pack <span className="font-semibold text-gray-600">{item.packing}</span>
                                </span>
                              )}
                            </div>
                            {item.rejectionReason && (
                              <span className="flex-shrink-0 text-[9px] text-rose-600 bg-rose-50 border border-rose-100 rounded px-1.5 py-0.5 leading-tight">
                                Rejected
                              </span>
                            )}
                          </div>
                        </td>
                        {/* Batch */}
                        <td className="px-3 py-3 text-gray-600 font-mono text-xs whitespace-nowrap">
                          {item.batchNumber || <span className="text-gray-300">—</span>}
                        </td>
                        {/* Expiry */}
                        <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                          {item.expiryDate ? fmtDate(item.expiryDate) : <span className="text-gray-300">—</span>}
                        </td>
                        {/* Quantities */}
                        <td className="px-3 py-3 text-center font-medium text-gray-700">{item.orderedQuantity ?? '—'}</td>
                        <td className="px-3 py-3 text-center font-bold text-emerald-600">{(item as any).receivedQuantity ?? (item as any).acceptedQuantity ?? '—'}</td>
                        <td className="px-3 py-3 text-center font-semibold">
                          <span className={(item.rejectedQuantity ?? 0) > 0 ? 'text-rose-600' : 'text-gray-300'}>
                            {item.rejectedQuantity ?? 0}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center font-semibold text-teal-600">{item.freeQuantity ?? 0}</td>
                        {/* Pricing */}
                        <td className="px-3 py-3 text-right text-gray-700">₹{(item.purchaseRate ?? 0).toFixed(2)}</td>
                        <td className="px-3 py-3 text-right">
                          <span className="text-emerald-600 font-medium">{(item as any).discountPercent > 0 ? `${(item as any).discountPercent}%` : <span className="text-gray-300">—</span>}</span>
                        </td>
                        <td className="px-3 py-3 text-right text-gray-700">₹{(item.mrp ?? 0).toFixed(2)}</td>
                        <td className="px-3 py-3 text-right text-orange-600 font-medium">{((item as any).cgstPercent ?? (item as any).gstPercent / 2 ?? 0) > 0 ? `${((item as any).cgstPercent ?? (item as any).gstPercent / 2).toFixed(1)}%` : <span className="text-gray-300">0%</span>}</td>
                        <td className="px-3 py-3 text-right text-orange-600 font-medium">{((item as any).sgstPercent ?? (item as any).gstPercent / 2 ?? 0) > 0 ? `${((item as any).sgstPercent ?? (item as any).gstPercent / 2).toFixed(1)}%` : <span className="text-gray-300">0%</span>}</td>
                        <td className="px-3 py-3 text-right text-orange-600 font-medium">{((item as any).igstPercent ?? 0) > 0 ? `${(item as any).igstPercent}%` : <span className="text-gray-300">0%</span>}</td>
                        <td className="px-3 py-3 text-right font-bold text-blue-700">₹{((item as any).purchaseCost ?? (item as any).netAmount ?? 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Financial Summary — right-aligned below table */}
          <div className="flex justify-end">
            <div className="w-72 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 overflow-hidden">
              {/* Card header */}
              <div className="px-4 py-2.5 border-b border-blue-100">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Financial Summary</span>
              </div>
              {/* Rows */}
              <div className="px-4 py-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Taxable Amount</span>
                  <span className="text-xs font-medium text-gray-700">{fmtINR(taxable)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">CGST</span>
                  <span className="text-xs font-medium text-gray-700">{fmtINR(cgst)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">SGST</span>
                  <span className="text-xs font-medium text-gray-700">{fmtINR(sgst)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">IGST</span>
                  <span className="text-xs font-medium text-gray-700">{fmtINR(igst)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-blue-100 pt-2 mt-1">
                  <span className="text-xs font-semibold text-gray-600">Net Amount</span>
                  <span className="text-sm font-semibold text-gray-800">{fmtINR(fetchedInv?.netAmount ?? row.netAmount)}</span>
                </div>
              </div>
              {/* Total footer bar */}
              <div className="bg-blue-600 px-4 py-3 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-100 uppercase tracking-wide">Total</span>
                <span className="text-xl font-bold text-white">{fmtINR(fetchedInv?.netAmount ?? row.totalAmount)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Print GRN modal ─────────────────────────────────────────────────────────────
function PrintGrnModal({ row, onClose }: { row: GrnHeaderDto; onClose: () => void }) {
  const items = row.items ?? [];
  const taxable = items.reduce((s, i) => s + (i.purchaseRate ?? 0) * (i.acceptedQuantity ?? 0), 0);
  const cgst    = items.reduce((s, i) => s + (i.cgstAmount  ?? 0), 0);
  const sgst    = items.reduce((s, i) => s + (i.sgstAmount  ?? 0), 0);
  const igst    = items.reduce((s, i) => s + (i.igstAmount  ?? 0), 0);

  const doPrint = () => {
    const el = document.getElementById('grn-print-content');
    if (!el) return;
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(`
      <html><head><title>GRN – ${row.grnNumber ?? row.invoiceNumber}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: Arial, sans-serif; font-size: 11px; }
        body { padding: 24px; color: #111; }
        h1 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
        .subtitle { color: #555; font-size: 11px; margin-bottom: 16px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
        .card-title { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin-bottom: 8px; }
        .row { display: flex; justify-content: space-between; padding: 2px 0; }
        .row .label { color: #6b7280; }
        .row .value { font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th { background: #f3f4f6; text-align: left; padding: 6px 8px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: #374151; border-bottom: 2px solid #e5e7eb; }
        td { padding: 6px 8px; border-bottom: 1px solid #f3f4f6; }
        .total-row td { font-weight: 700; border-top: 2px solid #e5e7eb; }
        .footer { margin-top: 24px; border-top: 1px dashed #d1d5db; padding-top: 12px; color: #9ca3af; font-size: 9px; text-align: right; }
      </style></head><body>
      ${el.innerHTML}
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const cfg = STATUS_BADGE[row.grnStatus] ?? { bg: '', label: row.grnStatus };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/35 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden mt-6 mb-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Print GRN</h2>
            <p className="text-xs text-gray-500 mt-0.5">{row.grnNumber ?? row.invoiceNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={doPrint}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
            >
              <Printer size={14} /> Print
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable area */}
        <div className="p-6 overflow-y-auto max-h-[72vh]">
          <div id="grn-print-content">
            <h1>Goods Receipt Note (GRN)</h1>
            <p className="subtitle">
              {row.grnNumber ? `GRN No: ${row.grnNumber}` : `Invoice: ${row.invoiceNumber}`}
              {' · '}
              {cfg.label}
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Invoice Details</p>
                <div className="space-y-1.5">
                  <MetaRow label="Invoice No"   value={row.invoiceNumber} />
                  <MetaRow label="GRN No"       value={row.grnNumber ?? '—'} />
                  <MetaRow label="Invoice Date" value={fmtDate(row.invoiceDate)} />
                  <MetaRow label="GRN Date"     value={fmtDate(row.grnDate)} />
                  <MetaRow label="Due Date"     value={fmtDate(row.dueDate)} />
                  <MetaRow label="Status"       value={cfg.label} />
                </div>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Supplier & Purchase</p>
                <div className="space-y-1.5">
                  <MetaRow label="Supplier"      value={row.vendorName} />
                  <MetaRow label="Store"         value={row.storeName} />
                  <MetaRow label="Category"      value={row.purchaseCategory} />
                  <MetaRow label="Payment Mode"  value={row.paymentMode} />
                  <MetaRow label="Remarks"       value={row.remarks} />
                </div>
              </div>
            </div>

            {/* Items table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-gray-100 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-gray-50">
                    {['#', 'Item Name', 'Batch', 'Expiry', 'Accepted', 'Rejected', 'Free', 'Rate', 'MRP', 'CGST%', 'SGST%', 'IGST%', 'P.Cost'].map(h => (
                      <th key={h} className="px-2.5 py-2 text-left text-[9px] font-extrabold text-gray-500 uppercase tracking-widest whitespace-nowrap border-b border-gray-100">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="px-2.5 py-2 text-gray-400">{i + 1}</td>
                      <td className="px-2.5 py-2 font-medium text-gray-800">{item.itemName || '—'}</td>
                      <td className="px-2.5 py-2 text-gray-600">{item.batchNumber || '—'}</td>
                      <td className="px-2.5 py-2 text-gray-600 whitespace-nowrap">{fmtDate(item.expiryDate)}</td>
                      <td className="px-2.5 py-2 text-emerald-700 font-semibold">{item.acceptedQuantity ?? 0}</td>
                      <td className="px-2.5 py-2 text-rose-600 font-semibold">{item.rejectedQuantity ?? 0}</td>
                      <td className="px-2.5 py-2 text-teal-600">{item.freeQuantity ?? 0}</td>
                      <td className="px-2.5 py-2 text-gray-700">₹{(item.purchaseRate ?? 0).toFixed(2)}</td>
                      <td className="px-2.5 py-2 text-gray-700">₹{(item.mrp ?? 0).toFixed(2)}</td>
                      <td className="px-2.5 py-2 text-gray-600">{item.cgstPercent ?? 0}%</td>
                      <td className="px-2.5 py-2 text-gray-600">{item.sgstPercent ?? 0}%</td>
                      <td className="px-2.5 py-2 text-gray-600">{item.igstPercent ?? 0}%</td>
                      <td className="px-2.5 py-2 font-semibold text-blue-700">₹{(item.purchaseCost ?? 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mt-4">
              <div className="w-64 space-y-1.5 border border-gray-100 rounded-xl p-4">
                {taxable > 0 && <MetaRow label="Taxable" value={`₹${taxable.toFixed(2)}`} />}
                {cgst > 0    && <MetaRow label="CGST"    value={`₹${cgst.toFixed(2)}`} />}
                {sgst > 0    && <MetaRow label="SGST"    value={`₹${sgst.toFixed(2)}`} />}
                {igst > 0    && <MetaRow label="IGST"    value={`₹${igst.toFixed(2)}`} />}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs font-semibold text-gray-600">Net Amount</span>
                  <span className="text-sm font-semibold text-gray-800">₹{(row.netAmount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Total</span>
                  <span className="text-base font-bold text-blue-700">₹{(row.totalAmount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Invoice modal ─────────────────────────────────────────────────────────────
const PURCHASE_CATEGORIES_QP = ['Pharmacy', 'OT & Surgery', 'Consumables', 'Optical', 'Laboratory', 'Stationery', 'Equipment', 'General Hospital'] as const;
const PAYMENT_MODES_QP       = ['Cash', 'Credit', 'UPI', 'NEFT', 'RTGS', 'Cheque'] as const;

function purchaseItemToGrnLine(item: PurchaseItemDto): Partial<GrnLineItem> {
  return {
    itemId:           item.itemId,
    itemName:         item.itemName,
    hsnCode:          item.hsnCode ?? '',
    unit:             'Unit',
    orderedQuantity:  item.orderedQuantity,
    acceptedQuantity: item.receivedQuantity > 0 ? item.receivedQuantity : item.orderedQuantity,
    rejectedQuantity: item.rejectedQuantity,
    freeQuantity:     item.freeQuantity,
    batchNumber:      item.batchNumber ?? '',
    expiryDate:       item.expiryDate ? new Date(item.expiryDate).toISOString().slice(0, 10) : '',
    barcode:          item.barcode ?? '',
    purchaseRate:     item.purchaseRate,
    mrp:              item.mrp,
    discountPercent:  item.discountPercent,
    gstPercent:       item.gstPercent,
    cgstPercent:      item.gstPercent / 2,
    sgstPercent:      item.gstPercent / 2,
    igstPercent:      0,
    sellingPrice:     0,
    packing:          0,
    unitsPerPack:     0,
    mrpOnPack:        0,
    transferMrp:      0,
    mrpPerUnit:       0,
    isAssetItem:      false,
    taxOnFree:        false,
    isReplacement:    false,
    itemRemarks:      item.itemRemarks ?? '',
    roundingAmount:   0,
  };
}

function purchaseItemFromGrnLine(saved: GrnLineItem, original: PurchaseItemDto): PurchaseItemDto {
  return {
    ...original,
    itemId:           saved.itemId,
    itemName:         saved.itemName,
    hsnCode:          saved.hsnCode,
    orderedQuantity:  saved.orderedQuantity,
    receivedQuantity: saved.acceptedQuantity,
    rejectedQuantity: saved.rejectedQuantity,
    freeQuantity:     saved.freeQuantity,
    batchNumber:      saved.batchNumber || undefined,
    expiryDate:       saved.expiryDate || undefined,
    barcode:          saved.barcode || undefined,
    purchaseRate:     saved.purchaseRate,
    mrp:              saved.mrp,
    originalMrp:      original.originalMrp,
    discountPercent:  saved.discountPercent,
    gstPercent:       saved.gstPercent,
    netAmount:        Math.round(
      (saved.acceptedQuantity * saved.purchaseRate * (1 - (saved.discountPercent ?? 0) / 100)) *
      (1 + (saved.gstPercent ?? 0) / 100) * 100
    ) / 100,
    itemRemarks:      saved.itemRemarks || undefined,
  };
}

function itemDtoFromPurchaseItem(item: PurchaseItemDto): ItemDto {
  return {
    id:                  item.itemId,
    itemName:            item.itemName,
    hsnCode:             item.hsnCode,
    unit:                'Unit',
    requiresColdStorage: false,
    isBarcodeTracked:    false,
    itemType:            'Medicine',
    reorderLevel:        0,
    reorderQuantity:     0,
    defaultGstRate:      String(item.gstPercent),
    status:              'active',
  };
}

function EditInvoiceModal({
  row,
  onClose,
  onSaved,
}: {
  row: GrnHeaderDto;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [invoiceNo,        setInvoiceNo]        = useState('');
  const [invoiceDate,      setInvoiceDate]       = useState('');
  const [invoiceType,      setInvoiceType]       = useState<'Invoice' | 'Packing Slip'>('Invoice');
  const [paymentMode,      setPaymentMode]       = useState('');
  const [creditPeriod,     setCreditPeriod]      = useState('');
  const [dueDate,          setDueDate]           = useState('');
  const [reference,        setReference]         = useState('');
  const [purchaseCategory, setPurchaseCategory]  = useState('');
  const [wasPackingSlip,   setWasPackingSlip]    = useState(false);

  // Item editing states (only active when grnStatus === 'GRNNotGenerated')
  const [editItems,      setEditItems]      = useState<PurchaseItemDto[]>([]);
  const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null);
  const [showItemSearch, setShowItemSearch] = useState(false);
  const [pendingItem,    setPendingItem]    = useState<ItemDto | null>(null);
  const [pendingLastP,   setPendingLastP]   = useState<LastPurchaseInfo | undefined>(undefined);

  // Items are editable until final approval (GRNNotGenerated, Draft, PrimaryApproved)
  const canEditItems = row.grnStatus !== 'Approved' && row.grnStatus !== 'Cancelled' && row.grnStatus !== 'Rejected';

  useEffect(() => {
    inventoryInvoiceApi.get(row.invoiceId).then((inv: PurchaseInvoiceDto) => {
      setInvoiceNo(inv.invoiceNumber ?? '');
      setInvoiceDate(inv.invoiceDate ? new Date(inv.invoiceDate).toISOString().slice(0, 10) : '');
      const itype = (inv.invoiceType as 'Invoice' | 'Packing Slip') ?? 'Invoice';
      setInvoiceType(itype);
      setWasPackingSlip(itype === 'Packing Slip');
      setPaymentMode(inv.paymentMode ?? '');
      setCreditPeriod(inv.creditPeriod?.toString() ?? '');
      setDueDate(inv.dueDate ? new Date(inv.dueDate).toISOString().slice(0, 10) : '');
      setReference(inv.reference ?? '');
      setPurchaseCategory(inv.purchaseCategory ?? '');
      setEditItems(inv.items ?? []);
    }).catch(() => toast.error('Failed to load invoice')).finally(() => setLoading(false));
  }, [row.invoiceId]);

  useEffect(() => {
    const days = parseInt(creditPeriod) || 0;
    if (!invoiceDate || days <= 0) return;
    const d = new Date(invoiceDate);
    d.setDate(d.getDate() + days);
    setDueDate(d.toISOString().slice(0, 10));
  }, [invoiceDate, creditPeriod]);

  const handleSave = async () => {
    if (!invoiceNo.trim()) { toast.error('Invoice number is required'); return; }
    setSaving(true);
    const tid = toast.loading('Saving…');
    try {
      await inventoryInvoiceApi.update(row.invoiceId, {
        invoiceNumber:    invoiceNo,
        invoiceDate:      invoiceDate ? new Date(invoiceDate).toISOString() : undefined,
        invoiceType,
        paymentMode:      paymentMode || undefined,
        creditPeriod:     parseInt(creditPeriod) || undefined,
        dueDate:          dueDate ? new Date(dueDate).toISOString() : undefined,
        reference:        reference || undefined,
        purchaseCategory: purchaseCategory || undefined,
      });
      if (canEditItems && editItems.length > 0) {
        await inventoryInvoiceApi.updateItems(row.invoiceId, editItems.map(item => ({
          id:               item.id,
          itemId:           item.itemId,
          orderedQuantity:  item.orderedQuantity,
          receivedQuantity: item.receivedQuantity,
          freeQuantity:     item.freeQuantity,
          batchNumber:      item.batchNumber || null,
          expiryDate:       item.expiryDate ? new Date(item.expiryDate).toISOString() : null,
          barcode:          item.barcode || null,
          mrp:              item.mrp,
          originalMrp:      item.originalMrp,
          purchaseRate:     item.purchaseRate,
          discountPercent:  item.discountPercent,
          hsnCode:          item.hsnCode || null,
          gstPercent:       item.gstPercent,
          cgstPercent:      item.gstPercent / 2,
          sgstPercent:      item.gstPercent / 2,
          igstPercent:      0,
          itemRemarks:      item.itemRemarks || null,
        })));
      }
      toast.success('Invoice updated.', { id: tid });
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data ?? 'Failed to update', { id: tid });
    } finally {
      setSaving(false);
    }
  };

  const handleItemSaved = (saved: GrnLineItem) => {
    if (editingItemIdx !== null) {
      setEditItems(prev => prev.map((it, i) => i === editingItemIdx ? purchaseItemFromGrnLine(saved, it) : it));
    } else {
      const newItem: PurchaseItemDto = {
        id:               '',
        itemId:           saved.itemId,
        itemName:         saved.itemName,
        hsnCode:          saved.hsnCode,
        orderedQuantity:  saved.orderedQuantity,
        receivedQuantity: saved.acceptedQuantity,
        rejectedQuantity: saved.rejectedQuantity,
        freeQuantity:     saved.freeQuantity,
        batchNumber:      saved.batchNumber || undefined,
        expiryDate:       saved.expiryDate || undefined,
        barcode:          saved.barcode || undefined,
        originalMrp:      saved.mrp,
        mrp:              saved.mrp,
        purchaseRate:     saved.purchaseRate,
        discountPercent:  saved.discountPercent,
        isFullDiscount:   false,
        gstPercent:       saved.gstPercent,
        netAmount:        Math.round(
          (saved.acceptedQuantity * saved.purchaseRate * (1 - (saved.discountPercent ?? 0) / 100)) *
          (1 + (saved.gstPercent ?? 0) / 100) * 100
        ) / 100,
        itemRemarks:      saved.itemRemarks || undefined,
      };
      setEditItems(prev => [...prev, newItem]);
    }
    setPendingItem(null);
    setEditingItemIdx(null);
  };

  const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400';
  const lblCls   = 'block text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-1';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
        <div className="absolute inset-0 bg-black/35 backdrop-blur-sm" onClick={onClose} />
        <div
          className="relative z-10 w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden mt-8 mb-8"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Edit Purchase Invoice</h2>
              <p className="text-xs text-gray-500 mt-0.5">{row.invoiceNumber}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white/70 transition-colors">
              <X size={16} />
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="px-5 py-5 space-y-4">
              {wasPackingSlip && invoiceType === 'Invoice' && (
                <div className="flex items-center gap-2.5 bg-amber-50 border-l-4 border-amber-400 rounded-xl px-4 py-3">
                  <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
                  <p className="text-xs font-semibold text-amber-700">
                    You are converting this packing slip to an invoice. Enter the actual invoice number and date.
                  </p>
                </div>
              )}

              {/* ── Header fields ── */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={lblCls}>Type</label>
                  <div className="flex gap-4">
                    {(['Invoice', 'Packing Slip'] as const).map(t => (
                      <label key={t} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="editInvoiceType"
                          value={t}
                          checked={invoiceType === t}
                          onChange={() => setInvoiceType(t)}
                          className="accent-teal-600"
                        />
                        <span className="text-sm text-gray-700">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={lblCls}>{invoiceType === 'Packing Slip' ? 'Packing Slip No *' : 'Invoice No *'}</label>
                  <input value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} placeholder={invoiceType === 'Packing Slip' ? 'e.g. PS-2024-001' : 'e.g. INV-2024-001'} className={inputCls} />
                </div>
                <div>
                  <label className={lblCls}>{invoiceType === 'Packing Slip' ? 'Packing Slip Date' : 'Invoice Date'}</label>
                  <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={lblCls}>Purchase Category</label>
                  <select value={purchaseCategory} onChange={e => setPurchaseCategory(e.target.value)} className={inputCls}>
                    <option value="">Select…</option>
                    {PURCHASE_CATEGORIES_QP.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lblCls}>Payment Mode</label>
                  <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className={inputCls}>
                    <option value="">Select…</option>
                    {PAYMENT_MODES_QP.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lblCls}>Credit Period (days)</label>
                  <input type="number" min="0" value={creditPeriod} onChange={e => setCreditPeriod(e.target.value)} placeholder="0" className={inputCls} />
                </div>
                <div>
                  <label className={lblCls}>Due Date (auto)</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={`${inputCls} bg-gray-50`} />
                </div>
                <div className="col-span-2">
                  <label className={lblCls}>Reference</label>
                  <input value={reference} onChange={e => setReference(e.target.value)} placeholder="PO No / Ref…" className={inputCls} />
                </div>
              </div>

              {/* ── Items section ── */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Items ({editItems.length})</span>
                  {canEditItems && (
                    <button
                      onClick={() => { setEditingItemIdx(null); setShowItemSearch(true); }}
                      className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Plus size={12} /> Add Item
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto max-h-52">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr className="text-left text-[10px] font-semibold text-gray-500 uppercase">
                        <th className="px-3 py-2">Item</th>
                        <th className="px-2 py-2 text-right">Qty</th>
                        <th className="px-2 py-2 text-right">Free</th>
                        <th className="px-2 py-2">Batch</th>
                        <th className="px-2 py-2">Expiry</th>
                        <th className="px-2 py-2 text-right">MRP</th>
                        <th className="px-2 py-2 text-right">Rate</th>
                        <th className="px-2 py-2 text-right">Disc%</th>
                        <th className="px-2 py-2 text-right">GST%</th>
                        <th className="px-2 py-2 text-right">Amount</th>
                        {canEditItems && <th className="px-2 py-2" />}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {editItems.length === 0 ? (
                        <tr>
                          <td colSpan={canEditItems ? 11 : 10} className="px-3 py-4 text-center text-gray-400 italic">No items</td>
                        </tr>
                      ) : editItems.map((it, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium text-gray-800">{it.itemName}</td>
                          <td className="px-2 py-2 text-right text-gray-700">{it.receivedQuantity > 0 ? it.receivedQuantity : it.orderedQuantity}</td>
                          <td className="px-2 py-2 text-right text-gray-500">{it.freeQuantity || '—'}</td>
                          <td className="px-2 py-2 text-gray-600">{it.batchNumber || '—'}</td>
                          <td className="px-2 py-2 text-gray-600">{it.expiryDate ? new Date(it.expiryDate).toLocaleDateString('en-IN') : '—'}</td>
                          <td className="px-2 py-2 text-right text-gray-700">₹{it.mrp.toFixed(2)}</td>
                          <td className="px-2 py-2 text-right text-gray-700">₹{it.purchaseRate.toFixed(2)}</td>
                          <td className="px-2 py-2 text-right text-gray-600">{it.discountPercent || 0}%</td>
                          <td className="px-2 py-2 text-right text-gray-600">{it.gstPercent}%</td>
                          <td className="px-2 py-2 text-right font-semibold text-gray-800">₹{it.netAmount.toFixed(2)}</td>
                          {canEditItems && (
                            <td className="px-2 py-2">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => { setEditingItemIdx(idx); setPendingItem(itemDtoFromPurchaseItem(it)); setPendingLastP(undefined); }}
                                  className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                  title="Edit item"
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  onClick={() => setEditItems(prev => prev.filter((_, i) => i !== idx))}
                                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Remove item"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!canEditItems && (
                  <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 text-[11px] text-amber-700 font-medium">
                    Items are locked after final approval.
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Item Search nested modal ── */}
      {showItemSearch && (
        <ItemSearchModal
          onSelect={(item, lastP) => {
            setPendingItem(item);
            setPendingLastP(lastP);
            setShowItemSearch(false);
          }}
          onClose={() => setShowItemSearch(false)}
          storeId={row.storeId}
        />
      )}

      {/* ── Item GST form nested modal ── */}
      {pendingItem && (
        <ItemGstFormModal
          item={pendingItem}
          initial={editingItemIdx !== null ? purchaseItemToGrnLine(editItems[editingItemIdx]) : undefined}
          lastMrp={pendingLastP?.lastMrp}
          lastPurchasePrice={pendingLastP?.lastPurchasePrice}
          isEditing={editingItemIdx !== null}
          onSave={handleItemSaved}
          onClose={() => { setPendingItem(null); setEditingItemIdx(null); }}
        />
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────────
export default function PurchaseQueryPage() {
  const { tenantId } = useAuthStore();

  const [moduleTab, setModuleTab] = useState<string>('GRN');

  // Data
  const [rows,    setRows]    = useState<GrnHeaderDto[]>([]);
  const [vendors, setVendors] = useState<VendorDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const todayStr = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgoStr = (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10); })();
  const [statusTab,            setStatusTab]            = useState('All');
  const [search,               setSearch]               = useState('');
  const [supplierFilter,       setSupplierFilter]       = useState('');
  const [purchaseCategoryFilter, setPurchaseCategoryFilter] = useState('');
  const [fromDate,             setFromDate]             = useState(thirtyDaysAgoStr);
  const [toDate,               setToDate]               = useState(todayStr);

  // Detail modal + pagination
  const [detailRow,   setDetailRow]   = useState<GrnHeaderDto | null>(null);
  const [page,        setPage]        = useState(1);
  const [pageSize,    setPageSize]    = useState(10);

  // Confirm dialog
  const [confirm, setConfirm] = useState<null | {
    title:    string;
    subtitle: string;
    variant:  'danger' | 'warning' | 'info';
    action:   () => Promise<void>;
  }>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Edit modal
  const [editRow,  setEditRow]  = useState<GrnHeaderDto | null>(null);
  // Print modal
  const [printRow, setPrintRow] = useState<GrnHeaderDto | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [grnResult, vResult] = await Promise.all([
        inventoryGrnApi.list({ includeUngenerated: true, pageSize: 500 }),
        inventoryVendorApi.list(1, 200),
      ]);
      setRows(grnResult.items ?? []);
      setVendors(vResult.items ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data ?? 'Failed to load purchase data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Filtering ──────────────────────────────────────────────────────────────────
  // Non-status filters (used for both stat cards and table so they stay in sync)
  const dateFiltered = rows.filter(r => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.invoiceNumber?.toLowerCase().includes(q) ||
      r.vendorName?.toLowerCase().includes(q) ||
      (r.grnNumber?.toLowerCase().includes(q) ?? false);
    const matchSupplier  = !supplierFilter         || r.vendorId         === supplierFilter;
    const matchCategory  = !purchaseCategoryFilter || r.purchaseCategory === purchaseCategoryFilter;
    const rowDate = (r.grnDate ?? r.invoiceDate ?? '').slice(0, 10);
    const matchFrom = !fromDate || rowDate >= fromDate;
    const matchTo   = !toDate   || rowDate <= toDate;
    return matchSearch && matchSupplier && matchCategory && matchFrom && matchTo;
  });

  const filtered = dateFiltered.filter(r =>
    statusTab === 'All' ||
    r.grnStatus === statusTab ||
    (statusTab === 'Cancelled' && (r.grnStatus === 'Cancelled' || r.grnStatus === 'Rejected'))
  );

  // ── Pagination ─────────────────────────────────────────────────────────────────
  const totalFiltered = filtered.length;
  const totalPages    = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safePage      = Math.min(page, totalPages);
  const sliceStart    = (safePage - 1) * pageSize;
  const pageRows      = filtered.slice(sliceStart, sliceStart + pageSize);
  const showingFrom   = totalFiltered === 0 ? 0 : sliceStart + 1;
  const showingTo     = Math.min(sliceStart + pageSize, totalFiltered);

  // ── Tab counts — sourced from dateFiltered so they always match the table ──────
  const counts = STATUS_TABS.reduce((acc, t) => {
    acc[t.key] = t.key === 'All'
      ? dateFiltered.length
      : dateFiltered.filter(r =>
          t.key === 'Cancelled'
            ? r.grnStatus === 'Cancelled' || r.grnStatus === 'Rejected'
            : r.grnStatus === t.key
        ).length;
    return acc;
  }, {} as Record<string, number>);

  // ── Actions ────────────────────────────────────────────────────────────────────
  const runWithConfirm = (
    title: string, subtitle: string, variant: 'danger' | 'warning' | 'info', action: () => Promise<void>,
  ) => setConfirm({ title, subtitle, variant, action });

  const execConfirm = async () => {
    if (!confirm || isProcessing) return;
    const fn = confirm.action;
    setConfirm(null);
    setIsProcessing(true);
    const tid = toast.loading('Processing…');
    try {
      await fn();
      toast.success('Done', { id: tid });
      load();
    } catch (err: any) {
      const msg = err?.response?.data ?? err?.message ?? 'Action failed';
      toast.error(String(msg).substring(0, 300), { id: tid });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateGrn    = (r: GrnHeaderDto) => runWithConfirm('Generate GRN?',     `Create a GRN for invoice "${r.invoiceNumber}".`,                                                             'info',    () => inventoryGrnApi.generateFromInvoice(r.invoiceId, new Date().toISOString()));
  const handleCancelGrn      = (r: GrnHeaderDto) => runWithConfirm('Cancel GRN?',        `GRN "${r.grnNumber ?? r.invoiceNumber}" will be cancelled. This cannot be undone.`,                          'danger',  () => inventoryGrnApi.cancel(r.id).then(() => undefined));
  const handleCancelInvoice  = (r: GrnHeaderDto) => runWithConfirm('Cancel Invoice?',    `Invoice "${r.invoiceNumber}" will be cancelled. This cannot be undone.`,                                     'danger',  () => inventoryInvoiceApi.cancel(r.invoiceId));
  const handlePrimaryApproval= (r: GrnHeaderDto) => runWithConfirm('Primary Approval?',  `Give primary approval for GRN "${r.grnNumber ?? r.invoiceNumber}".`,                                        'warning', () => inventoryGrnApi.primaryApprove(r.id).then(() => undefined));
  const handleFinalApproval  = (r: GrnHeaderDto) => runWithConfirm('Final Approval?',    `Final approval of GRN "${r.grnNumber ?? r.invoiceNumber}" will update stock. This cannot be undone.`,      'warning', () => inventoryGrnApi.finalApprove(r.id).then(() => undefined));
  const handleEdit           = (r: GrnHeaderDto) => setEditRow(r);
  const handlePrint          = (r: GrnHeaderDto) => setPrintRow(r);

  const resetFilters = () => { setSearch(''); setSupplierFilter(''); setPurchaseCategoryFilter(''); setFromDate(thirtyDaysAgoStr); setToDate(todayStr); setPage(1); };

  // ── Stat cards config ─────────────────────────────────────────────────────────
  const STAT_CARDS = [
    { key: 'All',             label: 'Total Invoices',    icon: ClipboardList, color: 'text-slate-600',   iconBg: 'bg-slate-100',   bar: 'bg-slate-400'   },
    { key: 'GRNNotGenerated', label: 'GRN Pending',       icon: Package,       color: 'text-teal-600',    iconBg: 'bg-teal-100',    bar: 'bg-teal-500'    },
    { key: 'Draft',           label: 'Not Approved',      icon: ShoppingCart,  color: 'text-amber-600',   iconBg: 'bg-amber-100',   bar: 'bg-amber-500'   },
    { key: 'PrimaryApproved', label: 'Primary Approved',  icon: CheckCircle2,  color: 'text-emerald-600', iconBg: 'bg-emerald-100', bar: 'bg-emerald-500' },
    { key: 'Approved',        label: 'Fully Approved',    icon: Tag,           color: 'text-blue-600',    iconBg: 'bg-blue-100',    bar: 'bg-blue-500'    },
    { key: 'Cancelled',       label: 'Cancelled',         icon: Ban,           color: 'text-rose-600',    iconBg: 'bg-rose-100',    bar: 'bg-rose-500'    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50/60 p-4 sm:p-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
        {STAT_CARDS.map(card => {
          const Icon = card.icon;
          const count = counts[card.key] ?? 0;
          const total = counts['All'] || 1;
          const isActive = statusTab === card.key;
          return (
            <button
              key={card.key}
              onClick={() => { setStatusTab(card.key); setPage(1); }}
              className={`text-left p-3.5 rounded-2xl border transition-all duration-150 ${
                isActive
                  ? 'bg-white border-blue-200 shadow-md ring-2 ring-blue-100'
                  : 'bg-white border-gray-100 shadow-sm hover:border-blue-100 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                  <Icon size={15} className={card.color} />
                </div>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{card.label}</p>
              <MiniBar value={count} max={total} color={card.bar} />
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Module tabs (B2) */}
        <div className="border-b border-gray-100">
          <div className="flex px-4">
            {MODULE_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setModuleTab(tab)}
                className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                  moduleTab === tab
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 border-transparent'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {moduleTab !== 'GRN' ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FileText size={36} className="mb-3 text-gray-200" />
            <p className="text-sm">{moduleTab} — coming soon</p>
          </div>
        ) : (
          <>
            {/* Status filter sub-tabs (pill style) */}
            <div className="px-4 pt-3 pb-2 border-b border-gray-50 overflow-x-auto">
              <div className="flex min-w-max gap-2">
                {STATUS_TABS.map(t => {
                  const isActive = statusTab === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => { setStatusTab(t.key); setPage(1); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 whitespace-nowrap ${
                        isActive ? t.activeClass : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white/70' : t.dot}`} />
                      {t.label}
                      {counts[t.key] > 0 && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {counts[t.key]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter bar (B3) */}
            <div className="px-4 py-3 border-b border-gray-50 flex flex-wrap gap-3 items-center">
              <select
                  value={supplierFilter}
                  onChange={e => { setSupplierFilter(e.target.value); setPage(1); }}
                  className="px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 min-w-[160px]"
                >
                  <option value="">All Suppliers</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>

              <select
                  value={purchaseCategoryFilter}
                  onChange={e => { setPurchaseCategoryFilter(e.target.value); setPage(1); }}
                  className="px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 min-w-[140px]"
                >
                  <option value="">All Categories</option>
                  {PURCHASE_CATEGORIES_QP.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

              <input
                  type="date"
                  value={fromDate}
                  onChange={e => { setFromDate(e.target.value); setPage(1); }}
                  className="px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />

              <input
                  type="date"
                  value={toDate}
                  onChange={e => { setToDate(e.target.value); setPage(1); }}
                  className="px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />

              <div className="relative flex-1 min-w-[180px]">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Invoice, GRN, vendor…"
                    className="w-full pl-7 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>

              <div className="flex gap-2">
                <button
                  onClick={resetFilters}
                  className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  Reset
                </button>
                <button
                  onClick={() => setPage(1)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Table (B5) */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Status', 'Purchase Date', 'Category', 'Supplier', 'Invoice No', 'Invoice Date', 'Due Date', 'GRN No', 'Total', 'Actions'].map((h, i) => (
                      <th key={i} className={`px-3 py-2.5 text-[10px] font-extrabold text-gray-600 uppercase tracking-widest bg-gray-50/70 whitespace-nowrap ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-16 text-center">
                        <FileText size={32} className="mx-auto mb-2 text-gray-200" />
                        <p className="text-sm text-gray-400">No records found</p>
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((row, idx) => (
                      <tr
                        key={row.id}
                        onClick={() => setDetailRow(row)}
                        className={`cursor-pointer border-l-4 ${STATUS_BORDER[row.grnStatus] ?? 'border-l-gray-200'} border-b border-gray-50 hover:bg-blue-50/30 transition-all duration-150 ${idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}
                      >
                        <td className="px-3 py-2.5">
                          <StatusBadge status={row.grnStatus} />
                        </td>
                        <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap text-xs">
                          {fmtDate(row.grnDate ?? row.invoiceDate)}
                        </td>
                        <td className="px-3 py-2.5">
                          {row.purchaseCategory
                            ? <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-violet-50 text-violet-700">{row.purchaseCategory}</span>
                            : <span className="text-gray-300 text-xs">—</span>
                          }
                        </td>
                        <td className="px-3 py-2.5 text-gray-800 font-medium max-w-[140px] truncate text-xs">
                          {row.vendorName || <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {row.invoiceNumber}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap text-xs">
                          {fmtDate(row.invoiceDate)}
                        </td>
                        <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap text-xs">
                          {fmtDate(row.dueDate)}
                        </td>
                        <td className="px-3 py-2.5">
                          {row.grnStatus === 'GRNNotGenerated' || !row.grnNumber
                            ? <span className="text-gray-300 text-xs">—</span>
                            : <span className="font-mono text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">{row.grnNumber}</span>
                          }
                        </td>
                        <td className="px-3 py-2.5 text-gray-900 font-semibold whitespace-nowrap text-xs">
                          {fmtINR(row.totalAmount)}
                        </td>
                        <td className="px-3 py-2.5 text-right" onClick={e => e.stopPropagation()}>
                          <ActionButtons
                            row={row}
                            onEdit={handleEdit}
                            onGenerateGrn={handleGenerateGrn}
                            onCancelGrn={handleCancelGrn}
                            onCancelInvoice={handleCancelInvoice}
                            onPrimaryApproval={handlePrimaryApproval}
                            onFinalApproval={handleFinalApproval}
                            onPrint={handlePrint}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination (B10) */}
            {!loading && totalFiltered > 0 && (
              <div className="px-4 py-3 border-t border-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    Showing {showingFrom} to {showingTo} of {totalFiltered} entries
                  </span>
                  <select
                    value={pageSize}
                    onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                    className="text-xs border border-gray-200 rounded-lg px-1.5 py-0.5 bg-white focus:outline-none"
                  >
                    {[10, 25, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft size={12} /> Prev
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const start = Math.max(1, Math.min(safePage - 2, totalPages - 4));
                    const p = totalPages <= 5 ? i + 1 : start + i;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-7 h-7 text-xs font-medium rounded-lg transition-colors ${
                          p === safePage
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    Next <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {editRow && (
        <EditInvoiceModal
          row={editRow}
          onClose={() => setEditRow(null)}
          onSaved={load}
        />
      )}

      {printRow && (
        <PrintGrnModal
          row={printRow}
          onClose={() => setPrintRow(null)}
        />
      )}

      {detailRow && (
        <GrnDetailsModal
          row={detailRow}
          onClose={() => setDetailRow(null)}
          onPrint={r => { setDetailRow(null); setPrintRow(r); }}
        />
      )}

      {/* Confirm dialog (B7) */}
      <ConfirmationDialog
        isOpen={!!confirm}
        title={confirm?.title ?? ''}
        message={confirm?.subtitle ?? ''}
        variant={confirm?.variant ?? 'info'}
        confirmText={isProcessing ? 'Processing…' : 'Yes, proceed'}
        cancelText="No, keep it"
        onConfirm={execConfirm}
        onClose={() => { if (!isProcessing) setConfirm(null); }}
      />
    </div>
  );
}
