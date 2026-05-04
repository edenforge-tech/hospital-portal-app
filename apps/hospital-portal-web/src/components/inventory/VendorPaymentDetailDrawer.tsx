'use client';

import React, { useState } from 'react';
import {
  CreditCard, Calendar, Hash, Building2, FileText,
  Paperclip, RotateCcw, ExternalLink, AlertTriangle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DrawerPanel } from './DrawerPanel';
import { type VendorPaymentDto } from '@/lib/api/inventory-service.api';
import { VENDOR_PAYMENT_STATUS, getStatusConfig } from '@/lib/constants/inventory-status';

interface VendorPaymentDetailDrawerProps {
  payment: VendorPaymentDto | null;
  vendorName?: string;
  invoiceNumber?: string;
  onClose: () => void;
  onReverse: (paymentId: string, reason: string) => Promise<void>;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value == null || value === '') return null;
  return (
    <div className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 w-36 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-800 font-medium break-all">{value}</span>
    </div>
  );
}

function fmt(n: number) {
  return n.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
}

function fmtDate(s: string) {
  try { return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return s; }
}

const MODE_LABELS: Record<string, string> = {
  NEFT: 'NEFT', RTGS: 'RTGS', Cheque: 'Cheque', Cash: 'Cash', UPI: 'UPI',
};

export function VendorPaymentDetailDrawer({
  payment,
  vendorName,
  invoiceNumber,
  onClose,
  onReverse,
}: VendorPaymentDetailDrawerProps) {
  const [showReversal, setShowReversal]   = useState(false);
  const [reversalReason, setReversalReason] = useState('');
  const [reversing, setReversing]          = useState(false);

  const isReversed = !!(payment?.deletedAt) || (payment?.remarks?.startsWith('[REVERSED]') ?? false);

  const statusCfg = getStatusConfig(
    VENDOR_PAYMENT_STATUS,
    isReversed ? 'reversed' : 'active',
  );

  const handleReverse = async () => {
    if (!payment || !reversalReason.trim()) return;
    setReversing(true);
    try {
      await onReverse(payment.id, reversalReason.trim());
      toast.success('Payment reversed successfully');
      setShowReversal(false);
      setReversalReason('');
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Reversal failed');
    } finally {
      setReversing(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400';

  return (
    <DrawerPanel
      open={payment !== null}
      onClose={onClose}
      title="Payment Details"
      subtitle={payment ? `Ref: ${payment.paymentReference}` : undefined}
      width="w-full max-w-xl"
    >
      {payment && (
        <div className="p-6 space-y-6">
          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg.badgeClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`} />
              {statusCfg.label}
            </span>
            <span className="text-xs text-gray-400">
              Recorded {fmtDate(payment.createdAt)}
            </span>
          </div>

          {/* Amount highlight */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
            <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-1">Amount Paid</p>
            <p className="text-2xl font-bold text-emerald-700">{fmt(payment.amount)}</p>
          </div>

          {/* Core details */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Payment Info</p>
            </div>
            <div className="px-4 divide-y divide-gray-50">
              <InfoRow label="Reference" value={
                <span className="flex items-center gap-1.5">
                  <Hash size={13} className="text-gray-400" />
                  {payment.paymentReference}
                </span>
              } />
              <InfoRow label="Payment Date" value={
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-gray-400" />
                  {fmtDate(payment.paymentDate)}
                </span>
              } />
              <InfoRow label="Mode" value={
                <span className="flex items-center gap-1.5">
                  <CreditCard size={13} className="text-gray-400" />
                  {MODE_LABELS[payment.paymentMode] ?? payment.paymentMode}
                </span>
              } />
              {payment.chequeNumber && <InfoRow label="Cheque No." value={payment.chequeNumber} />}
              {payment.bankTransactionId && <InfoRow label="Bank Txn ID" value={payment.bankTransactionId} />}
              {payment.remarks && <InfoRow label="Remarks" value={payment.remarks} />}
            </div>
          </div>

          {/* Context */}
          {(vendorName || invoiceNumber) && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Context</p>
              </div>
              <div className="px-4 divide-y divide-gray-50">
                {vendorName && (
                  <InfoRow label="Vendor" value={
                    <span className="flex items-center gap-1.5">
                      <Building2 size={13} className="text-gray-400" />
                      {vendorName}
                    </span>
                  } />
                )}
                {invoiceNumber && (
                  <InfoRow label="Linked Invoice" value={
                    <span className="flex items-center gap-1.5">
                      <FileText size={13} className="text-gray-400" />
                      {invoiceNumber}
                    </span>
                  } />
                )}
                {!invoiceNumber && payment.invoiceId && (
                  <InfoRow label="Linked Invoice" value="Advance / General Payment" />
                )}
                {!payment.invoiceId && !invoiceNumber && (
                  <InfoRow label="Type" value="Advance / General" />
                )}
              </div>
            </div>
          )}

          {/* Attachment */}
          {payment.attachmentUrl && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Payment Proof</p>
              </div>
              <div className="px-4 py-3">
                <a
                  href={payment.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  <Paperclip size={14} />
                  <span className="truncate flex-1">{payment.attachmentFilename ?? 'View Attachment'}</span>
                  {payment.attachmentSizeKb != null && (
                    <span className="text-xs text-gray-400 shrink-0">{payment.attachmentSizeKb} KB</span>
                  )}
                  <ExternalLink size={12} className="shrink-0" />
                </a>
              </div>
            </div>
          )}

          {/* Reversal section */}
          {!isReversed && (
            <div className="border-t border-gray-100 pt-4">
              {!showReversal ? (
                <button
                  onClick={() => setShowReversal(true)}
                  className="flex items-center gap-2 text-sm text-rose-500 hover:text-rose-600 font-medium"
                >
                  <RotateCcw size={14} />
                  Reverse this payment
                </button>
              ) : (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-rose-700 font-medium">
                      This will soft-delete the payment and restore the vendor&apos;s outstanding balance. Provide a reason.
                    </p>
                  </div>
                  <textarea
                    rows={2}
                    value={reversalReason}
                    onChange={e => setReversalReason(e.target.value)}
                    placeholder="Reversal reason (required)…"
                    className={`${inputCls} resize-none`}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setShowReversal(false); setReversalReason(''); }}
                      disabled={reversing}
                      className="flex-1 px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReverse}
                      disabled={reversing || !reversalReason.trim()}
                      className="flex-1 px-4 py-2 text-sm rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
                    >
                      {reversing ? 'Reversing…' : 'Confirm Reversal'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {isReversed && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-2">
                <RotateCcw size={14} className="text-rose-500 shrink-0" />
                <p className="text-sm text-rose-700 font-medium">Payment Reversed</p>
              </div>
              {payment.deletedAt && (
                <p className="text-xs text-rose-600 pl-6">
                  Reversed on {new Date(payment.deletedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
              {payment.remarks?.replace('[REVERSED]', '').trim() && (
                <p className="text-xs text-rose-500 pl-6 italic">
                  &ldquo;{payment.remarks.replace('[REVERSED]', '').replace('|', '').trim()}&rdquo;
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </DrawerPanel>
  );
}
