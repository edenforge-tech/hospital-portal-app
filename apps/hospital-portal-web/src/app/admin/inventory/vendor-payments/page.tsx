'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Building2, CreditCard, Search, SlidersHorizontal,
  ChevronLeft, ChevronRight, RotateCcw, Eye, Plus,
  X, AlertTriangle, TrendingDown, FileText,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  inventoryVendorApi,
  inventoryInvoiceApi,
  type VendorDto,
  type VendorPaymentDto,
  type PurchaseInvoiceDto,
} from '@/lib/api/inventory-service.api';
import { VENDOR_PAYMENT_STATUS, getStatusConfig } from '@/lib/constants/inventory-status';
import { VendorPaymentDetailDrawer } from '@/components/inventory/VendorPaymentDetailDrawer';
import { VendorReconciliationDrawer } from '@/components/inventory/VendorReconciliationDrawer';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
}

function fmtDate(s: string | null | undefined) {
  if (!s) return '—';
  try { return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return s; }
}

const PAGE_SIZE = 20;

// ─── Record Payment Modal ─────────────────────────────────────────────────────

interface RecordPaymentModalProps {
  vendor: VendorDto;
  onClose: () => void;
  onSuccess: () => void;
}

function RecordPaymentModal({ vendor, onClose, onSuccess }: RecordPaymentModalProps) {
  const [paymentType, setPaymentType]   = useState<'invoice' | 'advance'>('advance');
  const [invoices, setInvoices]         = useState<PurchaseInvoiceDto[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');

  const [amount,    setAmount]    = useState('');
  const [mode,      setMode]      = useState<'NEFT' | 'RTGS' | 'Cheque' | 'Cash' | 'UPI'>('NEFT');
  const [ref,       setRef]       = useState('');
  const [date,      setDate]      = useState(new Date().toISOString().slice(0, 10));
  const [cheque,    setCheque]    = useState('');
  const [bankTxId,  setBankTxId]  = useState('');
  const [remarks,   setRemarks]   = useState('');
  const [saving,    setSaving]    = useState(false);

  const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400';
  const lblCls   = 'block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1';

  const selectedInvoice = invoices.find(i => i.id === selectedInvoiceId) ?? null;
  const maxAmount = paymentType === 'invoice' && selectedInvoice
    ? selectedInvoice.balanceAmount
    : vendor.outstandingBalance > 0 ? vendor.outstandingBalance : 999999999;

  const amt   = parseFloat(amount);
  const valid = amt > 0 && ref.trim().length > 0 &&
    (paymentType === 'advance' || selectedInvoiceId.length > 0);

  // Load outstanding invoices when switching to "Against Invoice"
  useEffect(() => {
    if (paymentType !== 'invoice') return;
    setInvoicesLoading(true);
    inventoryInvoiceApi
      .list({ vendorId: vendor.id, pageSize: 100 })
      .then(r => {
        const outstanding = r.items.filter(
          i => i.approvalStatus === 'Approved' && (i.balanceAmount ?? 0) > 0
        );
        setInvoices(outstanding);
      })
      .catch(() => toast.error('Failed to load invoices'))
      .finally(() => setInvoicesLoading(false));
  }, [paymentType, vendor.id]);

  const handleSave = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      await inventoryVendorApi.recordPayment(vendor.id, {
        invoiceId: paymentType === 'invoice' ? selectedInvoiceId : undefined,
        paymentReference: ref.trim(),
        paymentDate: new Date(date).toISOString(),
        amount: amt,
        paymentMode: mode,
        chequeNumber: mode === 'Cheque' ? cheque || undefined : undefined,
        bankTransactionId: (mode === 'NEFT' || mode === 'RTGS' || mode === 'UPI') ? bankTxId || undefined : undefined,
        remarks: remarks || undefined,
      });
      toast.success('Payment recorded');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Record Payment</h2>
            <p className="text-xs text-gray-500 mt-0.5">{vendor.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Payment type toggle */}
          <div>
            <label className={lblCls}>Payment Type</label>
            <div className="flex rounded-xl border border-gray-200 overflow-hidden">
              {(['advance', 'invoice'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setPaymentType(t)}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                    paymentType === t
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {t === 'advance' ? 'Advance / General' : 'Against Invoice'}
                </button>
              ))}
            </div>
          </div>

          {/* Invoice selector */}
          {paymentType === 'invoice' && (
            <div>
              <label className={lblCls}>Select Invoice *</label>
              {invoicesLoading ? (
                <p className="text-sm text-gray-400 py-2">Loading invoices…</p>
              ) : invoices.length === 0 ? (
                <div className="flex items-center gap-2 py-3 px-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                  <p className="text-sm text-amber-700">No approved invoices with outstanding balance found for this vendor.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {invoices.map(inv => (
                    <label
                      key={inv.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        selectedInvoiceId === inv.id
                          ? 'border-emerald-400 bg-emerald-50/60'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="invoice-select"
                        value={inv.id}
                        checked={selectedInvoiceId === inv.id}
                        onChange={() => {
                          setSelectedInvoiceId(inv.id);
                          setAmount(String((inv.balanceAmount ?? 0).toFixed(2)));
                        }}
                        className="accent-emerald-600"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{inv.invoiceNumber}</p>
                        <p className="text-xs text-gray-500">{fmtDate(inv.invoiceDate)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-400">Balance</p>
                        <p className="text-sm font-semibold text-rose-600">{fmt(inv.balanceAmount ?? 0)}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Amount */}
          <div>
            <label className={lblCls}>
              Amount{maxAmount < 999999999 ? ` (max ${fmt(maxAmount)})` : ''}
            </label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min={0.01}
              max={maxAmount < 999999999 ? maxAmount : undefined}
              step={0.01}
              className={inputCls}
            />
          </div>

          {/* Payment mode */}
          <div>
            <label className={lblCls}>Payment Mode</label>
            <select value={mode} onChange={e => setMode(e.target.value as typeof mode)} className={inputCls}>
              {(['NEFT', 'RTGS', 'Cheque', 'Cash', 'UPI'] as const).map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          {/* Reference */}
          <div>
            <label className={lblCls}>
              {mode === 'NEFT' || mode === 'RTGS' ? 'UTR Number *'
                : mode === 'Cheque' ? 'Cheque / Reference Number *'
                : mode === 'UPI'    ? 'RRN / Transaction ID *'
                : 'Receipt Number *'}
            </label>
            <input value={ref} onChange={e => setRef(e.target.value)} className={inputCls} />
          </div>

          {/* Cheque number */}
          {mode === 'Cheque' && (
            <div>
              <label className={lblCls}>Cheque Number</label>
              <input value={cheque} onChange={e => setCheque(e.target.value)} className={inputCls} />
            </div>
          )}

          {/* Bank txn ID */}
          {(mode === 'NEFT' || mode === 'RTGS' || mode === 'UPI') && (
            <div>
              <label className={lblCls}>Bank Transaction ID</label>
              <input value={bankTxId} onChange={e => setBankTxId(e.target.value)} className={inputCls} />
            </div>
          )}

          {/* Payment date */}
          <div>
            <label className={lblCls}>Payment Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
          </div>

          {/* Remarks */}
          <div>
            <label className={lblCls}>Remarks</label>
            <input value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Optional" className={inputCls} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} disabled={saving} className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !valid}
            className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 font-medium"
          >
            {saving ? 'Saving…' : 'Record Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function VendorPaymentsPage() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'ledgers' | 'history'>('ledgers');

  // ── Vendor Ledgers state ──────────────────────────────────────────────────
  const [vendors, setVendors]             = useState<VendorDto[]>([]);
  const [vendorSearch, setVendorSearch]   = useState('');
  const [ledgerPage, setLedgerPage]       = useState(1);
  const [ledgerTotal, setLedgerTotal]     = useState(0);
  const [ledgersLoading, setLedgersLoading] = useState(false);

  const [recordTarget, setRecordTarget]         = useState<VendorDto | null>(null);
  const [reconciliationTarget, setReconciliationTarget] = useState<VendorDto | null>(null);

  // ── Payment History state ─────────────────────────────────────────────────
  const [historyVendors, setHistoryVendors]     = useState<VendorDto[]>([]);
  const [historyVendorId, setHistoryVendorId]   = useState('');
  const [payments, setPayments]                 = useState<VendorPaymentDto[]>([]);
  const [historyPage, setHistoryPage]           = useState(1);
  const [historyTotal, setHistoryTotal]         = useState(0);
  const [historyLoading, setHistoryLoading]     = useState(false);
  const [modeFilter, setModeFilter]             = useState('');
  const [selectedPayment, setSelectedPayment]   = useState<VendorPaymentDto | null>(null);

  const historyTotalPages = Math.max(1, Math.ceil(historyTotal / PAGE_SIZE));
  const ledgerTotalPages  = Math.max(1, Math.ceil(ledgerTotal / PAGE_SIZE));

  // ── Load vendors ──────────────────────────────────────────────────────────
  const loadVendors = useCallback(async (pg: number) => {
    setLedgersLoading(true);
    try {
      const r = await inventoryVendorApi.list(pg, PAGE_SIZE);
      setVendors(r.items);
      setLedgerTotal(r.total);
    } catch {
      toast.error('Failed to load vendors');
    } finally {
      setLedgersLoading(false);
    }
  }, []);

  useEffect(() => { loadVendors(ledgerPage); }, [loadVendors, ledgerPage]);

  // ── URL-driven: ?vendorId= auto-opens reconciliation drawer ──────────────
  const vendorIdParam = searchParams.get('vendorId');
  useEffect(() => {
    if (!vendorIdParam || !vendors.length || reconciliationTarget) return;
    const found = vendors.find(v => v.id === vendorIdParam);
    if (found) setReconciliationTarget(found);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorIdParam, vendors]);

  // Seed historyVendors dropdown from already-loaded vendors on first tab switch
  useEffect(() => {
    if (tab === 'history' && historyVendors.length === 0) {
      inventoryVendorApi.list(1, 200).then(r => {
        setHistoryVendors(r.items);
        if (r.items.length > 0 && !historyVendorId) {
          setHistoryVendorId(r.items[0].id);
        }
      }).catch(() => undefined);
    }
  }, [tab, historyVendors.length, historyVendorId]);

  // ── Load payments when vendor / page / filter changes ────────────────────
  useEffect(() => {
    if (!historyVendorId) return;
    setHistoryLoading(true);
    inventoryVendorApi
      .listPayments(historyVendorId, historyPage, PAGE_SIZE)
      .then(r => {
        const filtered = modeFilter
          ? r.items.filter(p => p.paymentMode === modeFilter)
          : r.items;
        setPayments(filtered);
        setHistoryTotal(r.total);
      })
      .catch(() => toast.error('Failed to load payments'))
      .finally(() => setHistoryLoading(false));
  }, [historyVendorId, historyPage, modeFilter]);

  const selectedHistoryVendor = historyVendors.find(v => v.id === historyVendorId);

  // ── Client-side vendor search filter ─────────────────────────────────────
  const filteredVendors = vendorSearch.trim()
    ? vendors.filter(v =>
        v.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
        (v.vendorCode ?? '').toLowerCase().includes(vendorSearch.toLowerCase())
      )
    : vendors;

  // ── Reverse payment ───────────────────────────────────────────────────────
  const handleReverse = async (paymentId: string, reason: string) => {
    await inventoryVendorApi.reversePayment(paymentId, reason);
    // Reload payments for current vendor
    if (historyVendorId) {
      const r = await inventoryVendorApi.listPayments(historyVendorId, historyPage, PAGE_SIZE);
      setPayments(modeFilter ? r.items.filter(p => p.paymentMode === modeFilter) : r.items);
      setHistoryTotal(r.total);
    }
    await loadVendors(ledgerPage);
  };

  // ── Pagination UI ─────────────────────────────────────────────────────────
  function PaginationBar({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
    if (totalPages <= 1) return null;
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    const end   = Math.min(totalPages, start + 4);
    return (
      <div className="flex items-center justify-end gap-1 py-2">
        <button onClick={() => onPage(page - 1)} disabled={page === 1}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30">
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(p => (
          <button key={p} onClick={() => onPage(p)}
            className={`w-8 h-8 text-sm rounded-lg font-medium ${p === page ? 'bg-emerald-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
            {p}
          </button>
        ))}
        <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30">
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  const tabCls = (t: 'ledgers' | 'history') =>
    `px-5 py-2.5 text-sm font-medium rounded-xl transition-colors ${
      tab === t
        ? 'bg-white text-emerald-700 shadow-sm border border-gray-200'
        : 'text-gray-500 hover:text-gray-700'
    }`;

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Vendor Payments</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage vendor outstanding balances and payment history</p>
        </div>
      </div>

      {/* KPI strip */}
      {vendors.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Outstanding</p>
            <p className="text-xl font-bold text-rose-600 tabular-nums">
              {fmt(vendors.reduce((s, v) => s + v.outstandingBalance, 0))}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Vendors with Dues</p>
            <p className="text-xl font-bold text-gray-800 tabular-nums">
              {vendors.filter(v => v.outstandingBalance > 0).length}
              <span className="text-sm font-normal text-gray-400 ml-1">/ {ledgerTotal}</span>
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">At Risk (overdue)</p>
            <p className="text-xl font-bold text-amber-600 tabular-nums">
              {vendors.filter(v => v.outstandingBalance > 0 && (v.creditDays ?? 0) === 0).length}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => setTab('ledgers')} className={tabCls('ledgers')}>
          <span className="flex items-center gap-2">
            <Building2 size={15} />
            Vendor Ledgers
          </span>
        </button>
        <button onClick={() => setTab('history')} className={tabCls('history')}>
          <span className="flex items-center gap-2">
            <CreditCard size={15} />
            Payment History
          </span>
        </button>
      </div>

      {/* ── TAB: VENDOR LEDGERS ──────────────────────────────────────────────── */}
      {tab === 'ledgers' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={vendorSearch}
                onChange={e => setVendorSearch(e.target.value)}
                placeholder="Search vendor name or code…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
              />
              {vendorSearch && (
                <button onClick={() => setVendorSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={13} />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {ledgerTotal} vendor{ledgerTotal !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {ledgersLoading ? (
              <div className="flex items-center justify-center py-16 text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500" />
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Building2 size={40} className="mb-3 opacity-30" />
                <p className="text-sm">{vendorSearch ? 'No vendors match your search.' : 'No vendors found.'}</p>
              </div>
            ) : (
              <>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vendor</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Category</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Credit Days</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Outstanding</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredVendors.map(v => (
                      <tr
                        key={v.id}
                        className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                        onClick={() => setReconciliationTarget(v)}
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{v.name}</p>
                          {v.vendorCode && <p className="text-xs text-gray-400">{v.vendorCode}</p>}
                          {v.outstandingBalance > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 font-medium mt-0.5">
                              ⚠ Outstanding
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{v.vendorCategory}</td>
                        <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{v.creditDays}d</td>
                        <td className="px-4 py-3 text-right">
                          {v.outstandingBalance > 0 ? (
                            <span className="flex items-center justify-end gap-1 text-rose-600 font-semibold">
                              <TrendingDown size={13} />
                              {fmt(v.outstandingBalance)}
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-medium text-xs">Cleared</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={e => { e.stopPropagation(); setHistoryVendorId(v.id); setTab('history'); }}
                              title="View payment history"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); setRecordTarget(v); }}
                              title="Record payment"
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            >
                              <Plus size={13} />
                              Pay
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-4 border-t border-gray-50">
                  <PaginationBar page={ledgerPage} totalPages={ledgerTotalPages} onPage={setLedgerPage} />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: PAYMENT HISTORY ─────────────────────────────────────────────── */}
      {tab === 'history' && (
        <div className="space-y-4">
          {/* Filters bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Vendor selector */}
            <div className="flex items-center gap-2">
              <Building2 size={15} className="text-gray-400 shrink-0" />
              <select
                value={historyVendorId}
                onChange={e => { setHistoryVendorId(e.target.value); setHistoryPage(1); }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 min-w-[220px]"
              >
                <option value="">— Select vendor —</option>
                {historyVendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            {/* Mode filter */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={15} className="text-gray-400 shrink-0" />
              <select
                value={modeFilter}
                onChange={e => { setModeFilter(e.target.value); setHistoryPage(1); }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
              >
                <option value="">All modes</option>
                {['NEFT', 'RTGS', 'Cheque', 'Cash', 'UPI'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>

            {/* Record payment shortcut */}
            {selectedHistoryVendor && (
              <button
                onClick={() => setRecordTarget(selectedHistoryVendor)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 ml-auto"
              >
                <Plus size={15} />
                Record Payment
              </button>
            )}
          </div>

          {/* Payments table */}
          {!historyVendorId ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400">
              <CreditCard size={40} className="mb-3 opacity-30" />
              <p className="text-sm">Select a vendor to view payment history.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {historyLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500" />
                </div>
              ) : payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <FileText size={40} className="mb-3 opacity-30" />
                  <p className="text-sm">No payments recorded for this vendor yet.</p>
                  {selectedHistoryVendor && (
                    <button
                      onClick={() => setRecordTarget(selectedHistoryVendor)}
                      className="mt-3 flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    >
                      <Plus size={14} />
                      Record first payment
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reference</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Date</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mode</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Invoice</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {payments.map(p => {
                        const isReversed = p.remarks?.startsWith('[REVERSED]') ?? false;
                        const statusCfg  = getStatusConfig(VENDOR_PAYMENT_STATUS, isReversed ? 'reversed' : 'active');
                        return (
                          <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-mono text-xs text-gray-800">{p.paymentReference}</p>
                              {p.remarks && !isReversed && (
                                <p className="text-xs text-gray-400 truncate max-w-[160px]">{p.remarks}</p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-600 hidden md:table-cell whitespace-nowrap">
                              {fmtDate(p.paymentDate)}
                            </td>
                            <td className="px-4 py-3 text-gray-700">{p.paymentMode}</td>
                            <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs">
                              {p.invoiceId ? 'Against Invoice' : 'Advance'}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                              {fmt(p.amount)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusCfg.badgeClass}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`} />
                                {statusCfg.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => setSelectedPayment(p)}
                                title="View details"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                              >
                                <Eye size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="px-4 border-t border-gray-50">
                    <PaginationBar page={historyPage} totalPages={historyTotalPages} onPage={setHistoryPage} />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Record Payment Modal */}
      {recordTarget && (
        <RecordPaymentModal
          vendor={recordTarget}
          onClose={() => setRecordTarget(null)}
          onSuccess={() => {
            loadVendors(ledgerPage);
            if (historyVendorId === recordTarget.id) {
              inventoryVendorApi.listPayments(historyVendorId, historyPage, PAGE_SIZE).then(r => {
                setPayments(modeFilter ? r.items.filter(p => p.paymentMode === modeFilter) : r.items);
                setHistoryTotal(r.total);
              }).catch(() => undefined);
            }
          }}
        />
      )}

      {/* Payment Detail Drawer */}
      <VendorPaymentDetailDrawer
        payment={selectedPayment}
        vendorName={selectedHistoryVendor?.name}
        onClose={() => setSelectedPayment(null)}
        onReverse={handleReverse}
      />

      {/* Vendor Reconciliation Drawer */}
      <VendorReconciliationDrawer
        vendor={reconciliationTarget}
        onClose={() => setReconciliationTarget(null)}
        onRecordPayment={v => { setReconciliationTarget(null); setRecordTarget(v); }}
      />
    </div>
  );
}

export default function VendorPaymentsPageWrapper() {
  return (
    <Suspense>
      <VendorPaymentsPage />
    </Suspense>
  );
}
