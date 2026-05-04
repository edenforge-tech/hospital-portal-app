'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, X, CreditCard, TrendingDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  inventoryVendorApi,
  type VendorDto,
  type VendorReconciliationReport,
} from '@/lib/api/inventory-service.api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtINR(n: number) {
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

function fmtDate(s?: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  vendor: VendorDto | null;
  onClose: () => void;
  onRecordPayment?: (vendor: VendorDto) => void;
}

export function VendorReconciliationDrawer({ vendor, onClose, onRecordPayment }: Props) {
  const [report, setReport]   = useState<VendorReconciliationReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!vendor) {
      setReport(null);
      return;
    }
    setLoading(true);
    setReport(null);
    inventoryVendorApi
      .getReconciliation(vendor.id)
      .then(r => setReport(r))
      .catch(err => toast.error(err?.response?.data ?? 'Failed to load reconciliation'))
      .finally(() => setLoading(false));
  }, [vendor?.id]);

  if (!vendor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{vendor.name}</h3>
            {vendor.vendorCode && (
              <p className="text-xs text-gray-400 font-mono mt-0.5">{vendor.vendorCode}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={20} className="animate-spin text-gray-300" />
          </div>
        ) : report ? (
          <div className="px-5 py-4 space-y-4">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Total Invoiced</p>
                <p className="text-sm font-bold text-gray-800 tabular-nums">{fmtINR(report.totalInvoiced)}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3">
                <p className="text-[10px] text-emerald-600 uppercase tracking-wide mb-1">Total Paid</p>
                <p className="text-sm font-bold text-emerald-700 tabular-nums">{fmtINR(report.totalPaid)}</p>
              </div>
              <div className={`rounded-xl p-3 ${report.outstandingBalance > 0 ? 'bg-rose-50' : 'bg-gray-50'}`}>
                <p className={`text-[10px] uppercase tracking-wide mb-1 ${report.outstandingBalance > 0 ? 'text-rose-500' : 'text-gray-500'}`}>
                  Outstanding
                </p>
                <p className={`text-sm font-bold tabular-nums ${report.outstandingBalance > 0 ? 'text-rose-700' : 'text-gray-400'}`}>
                  {fmtINR(report.outstandingBalance)}
                </p>
              </div>
            </div>

            {/* Record payment CTA */}
            {report.outstandingBalance > 0 && onRecordPayment && (
              <button
                onClick={() => onRecordPayment(vendor)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                <CreditCard size={15} />
                Record Payment
              </button>
            )}

            {/* Ledger lines */}
            {report.lines.length > 0 ? (
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Transaction Ledger</p>
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                        <th className="px-3 py-2 text-left">Date</th>
                        <th className="px-3 py-2 text-left">Type</th>
                        <th className="px-3 py-2 text-left">Reference</th>
                        <th className="px-3 py-2 text-right">Debit</th>
                        <th className="px-3 py-2 text-right">Credit</th>
                        <th className="px-3 py-2 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {report.lines.map((line, i) => {
                        const entryColor =
                          line.entryType === 'Invoice'   ? 'text-rose-600'
                          : line.entryType === 'Payment' ? 'text-emerald-600'
                          : 'text-blue-600';
                        return (
                          <tr key={i} className="hover:bg-gray-50/50">
                            <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{fmtDate(line.entryDate)}</td>
                            <td className="px-3 py-2">
                              <span className={`font-medium ${entryColor}`}>{line.entryType}</span>
                            </td>
                            <td className="px-3 py-2 font-mono text-gray-600">{line.referenceNumber}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-rose-600">
                              {line.debit > 0 ? fmtINR(line.debit) : '—'}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums text-emerald-600">
                              {line.credit > 0 ? fmtINR(line.credit) : '—'}
                            </td>
                            <td className={`px-3 py-2 text-right tabular-nums font-semibold ${line.runningBalance > 0 ? 'text-rose-600' : 'text-gray-400'}`}>
                              {fmtINR(Math.abs(line.runningBalance))}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-xs">No transactions recorded yet.</div>
            )}

            {/* Bank details */}
            {vendor.bankName && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Bank Details</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ['Bank', vendor.bankName],
                    ['Account', vendor.bankAccountNumber],
                    ['IFSC', vendor.bankIfscCode],
                    ['Holder', vendor.bankAccountHolderName],
                  ].filter(([, v]) => v).map(([label, value]) => (
                    <div key={label as string}>
                      <p className="text-gray-400">{label}</p>
                      <p className="text-gray-700 font-medium font-mono">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Outstanding risk badge */}
            {vendor.outstandingBalance > 0 && vendor.creditDays && vendor.creditDays > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                <span>Vendor has {fmtINR(vendor.outstandingBalance)} outstanding against {vendor.creditDays} credit days.</span>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
