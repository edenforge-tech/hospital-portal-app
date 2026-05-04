'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowRight, CheckCircle, XCircle, Send, Ban,
  Package, FileText, Building2, Calendar, Hash,
  CreditCard, Tag, ChevronDown, ChevronRight,
  AlertTriangle, Clock, CircleCheck, Download,
  Receipt, Layers, DollarSign,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { DrawerPanel } from './DrawerPanel';
import { InvoiceFinancialSummary } from './InvoiceFinancialSummary';
import {
  type PurchaseInvoiceDto,
  type GrnHeaderDto,
  type BillTransferDto,
  type InvoiceSettlementDto,
  type VendorPaymentDto,
  inventoryInvoiceApi,
  inventoryGrnApi,
  inventoryBillTransferApi,
  inventorySettlementApi,
  inventoryVendorApi,
} from '@/lib/api/inventory-service.api';
import {
  INVOICE_STATUS,
  GRN_STATUS,
  BT_STATUS,
  SETTLEMENT_STATUS,
  VENDOR_PAYMENT_STATUS,
  getStatusConfig,
} from '@/lib/constants/inventory-status';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(s?: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtINR(n?: number | null) {
  return '₹' + (n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 font-medium truncate">{value ?? '—'}</p>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  open,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-2.5 text-left"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        {icon}
        {title}
      </div>
      {open ? (
        <ChevronDown className="w-4 h-4 text-gray-400" />
      ) : (
        <ChevronRight className="w-4 h-4 text-gray-400" />
      )}
    </button>
  );
}

// ─── Approval trail steps ─────────────────────────────────────────────────────

function ApprovalTrail({ status }: { status: string }) {
  type Step = { label: string; done: boolean; active: boolean };

  const steps: Step[] = [
    {
      label: 'Draft Created',
      done: true,
      active: status === 'Draft',
    },
    {
      label: 'Primary Approval',
      done: ['PrimaryApproved', 'Approved'].includes(status),
      active: status === 'Draft',
    },
    {
      label: 'Final Approval',
      done: status === 'Approved',
      active: status === 'PrimaryApproved',
    },
  ];

  if (status === 'Cancelled' || status === 'Rejected') {
    return (
      <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
        <XCircle className="w-4 h-4 shrink-0" />
        Invoice {status.toLowerCase()} — no further action possible.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center min-w-[80px]">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors
                ${s.done
                  ? 'bg-green-500 border-green-500 text-white'
                  : s.active
                    ? 'bg-white border-blue-500 text-blue-600'
                    : 'bg-white border-gray-200 text-gray-300'}`}
            >
              {s.done ? <CircleCheck className="w-4 h-4" /> : i + 1}
            </div>
            <p className={`text-xs mt-1 text-center leading-tight ${s.done ? 'text-green-600' : s.active ? 'text-blue-600' : 'text-gray-400'}`}>
              {s.label}
            </p>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mb-5 mx-1 rounded ${s.done ? 'bg-green-400' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Next-steps CTA ───────────────────────────────────────────────────────────

function NextStepsBanner({
  invoice,
  onAction,
  acting,
}: {
  invoice: PurchaseInvoiceDto;
  onAction: (action: string) => void;
  acting: boolean;
}) {
  const { approvalStatus, id, grnNumber } = invoice;

  if (approvalStatus === 'Draft') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-blue-800">Ready for Primary Approval</p>
            <p className="text-xs text-blue-600 mt-0.5">Submit this invoice to initiate the approval workflow.</p>
          </div>
          <button
            onClick={() => onAction('submit')}
            disabled={acting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium shrink-0"
          >
            <Send className="w-3 h-3" />
            Submit
          </button>
        </div>
      </div>
    );
  }

  if (approvalStatus === 'PrimaryApproved') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-emerald-800">Awaiting Final Approval</p>
            <p className="text-xs text-emerald-600 mt-0.5">Primary approval complete. Approve or reject to finalise.</p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={() => onAction('approve')}
              disabled={acting}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              <CheckCircle className="w-3 h-3" />
              Approve
            </button>
            <button
              onClick={() => onAction('reject')}
              disabled={acting}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 font-medium"
            >
              <XCircle className="w-3 h-3" />
              Reject
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (approvalStatus === 'Approved') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-green-800">
              {grnNumber ? 'GRN Created' : 'Ready for GRN'}
            </p>
            <p className="text-xs text-green-600 mt-0.5">
              {grnNumber
                ? `GRN ${grnNumber} has been generated. Continue in the lifecycle engine.`
                : 'Invoice fully approved. Generate a GRN to receive stock.'}
            </p>
          </div>
          <Link
            href={`/admin/inventory/purchase-query?tab=grn&invoiceId=${id}`}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-700 text-white rounded-lg hover:bg-green-800 font-medium shrink-0"
          >
            Open Lifecycle
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Line items table ─────────────────────────────────────────────────────────

function LineItemsTable({ invoice }: { invoice: PurchaseInvoiceDto }) {
  if (!invoice.items?.length) {
    return (
      <p className="text-xs text-gray-400 italic py-2">No line items recorded yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            {['Item', 'Batch', 'Expiry', 'Qty', 'Rate', 'Disc%', 'GST%', 'Net'].map(h => (
              <th key={h} className="px-3 py-2 text-left font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {invoice.items.map((item, i) => (
            <tr key={item.id ?? i} className="hover:bg-gray-50">
              <td className="px-3 py-2 font-medium text-gray-800 max-w-[140px] truncate" title={item.itemName}>
                {item.itemName}
              </td>
              <td className="px-3 py-2 text-gray-500 font-mono">{item.batchNumber ?? '—'}</td>
              <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{fmtDate(item.expiryDate)}</td>
              <td className="px-3 py-2 text-right text-gray-700 font-mono">{item.orderedQuantity}</td>
              <td className="px-3 py-2 text-right text-gray-700 font-mono">{item.purchaseRate.toFixed(2)}</td>
              <td className="px-3 py-2 text-right text-gray-500">{item.discountPercent > 0 ? `${item.discountPercent}%` : '—'}</td>
              <td className="px-3 py-2 text-right text-gray-500">{item.gstPercent}%</td>
              <td className="px-3 py-2 text-right font-semibold text-gray-800 font-mono">{fmtINR(item.netAmount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t border-gray-200 bg-gray-50">
          <tr>
            <td colSpan={7} className="px-3 py-2 text-xs font-semibold text-gray-500 text-right">Total</td>
            <td className="px-3 py-2 text-xs font-bold text-gray-900 text-right font-mono">
              {fmtINR(invoice.items.reduce((s, i) => s + (i.netAmount ?? 0), 0))}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─── Payment progress bar ─────────────────────────────────────────────────────

function PaymentProgress({ invoice }: { invoice: PurchaseInvoiceDto }) {
  const pct = invoice.netAmount > 0
    ? Math.min(100, (invoice.paidAmount / invoice.netAmount) * 100)
    : 0;

  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
      <div className="flex justify-between text-xs text-gray-500">
        <span>Paid: <span className="font-semibold text-gray-800">{fmtINR(invoice.paidAmount)}</span></span>
        <span>Balance: <span className={`font-semibold ${invoice.balanceAmount > 0 ? 'text-amber-700' : 'text-green-700'}`}>{fmtINR(invoice.balanceAmount)}</span></span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-green-500' : pct > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 text-right">{pct.toFixed(0)}% paid</p>
    </div>
  );
}

// ─── Exception banners ────────────────────────────────────────────────────────

function ExceptionBanners({
  grns,
  bts,
  settlements,
}: {
  grns: GrnHeaderDto[];
  bts: BillTransferDto[];
  settlements: InvoiceSettlementDto[];
}) {
  const grnRejected = grns.some(g => g.grnStatus === 'Rejected');
  const btOnHold = bts.some(b => b.status === 'OnHold' as string);
  const slOverdue = settlements.some(
    s => s.status === 'Overdue' || (s.status === 'Pending' && s.dueDate && new Date(s.dueDate) < new Date()),
  );

  if (!grnRejected && !btOnHold && !slOverdue) return null;

  return (
    <div className="space-y-1.5">
      {grnRejected && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          <XCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="font-semibold">GRN Rejected</span> — goods receipt was rejected. Review and re-process.
        </div>
      )}
      {btOnHold && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span className="font-semibold">Bill Transfer On Hold</span> — payment approval is currently paused.
        </div>
      )}
      {slOverdue && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span className="font-semibold">Settlement Overdue</span> — payment due date has passed.
        </div>
      )}
    </div>
  );
}

// ─── Linked GRN section ───────────────────────────────────────────────────────

function LinkedGrnSection({ grns, invoiceId }: { grns: GrnHeaderDto[]; invoiceId: string }) {
  if (!grns.length) {
    return (
      <p className="text-xs text-gray-400 italic py-1">
        No GRN created yet.{' '}
        <Link href={`/admin/inventory/purchase-query?tab=grn&invoiceId=${invoiceId}`} className="text-blue-600 hover:underline">
          Generate GRN →
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {grns.map(g => {
        const cfg = getStatusConfig(GRN_STATUS, g.grnStatus);
        const accepted = g.items.reduce((s, i) => s + i.acceptedQuantity, 0);
        const rejected = g.items.reduce((s, i) => s + i.rejectedQuantity, 0);
        return (
          <div key={g.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Package className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="text-xs font-mono font-semibold text-gray-800 truncate">{g.grnNumber ?? 'Pending'}</span>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${cfg?.badgeClass ?? 'bg-gray-100 text-gray-600'}`}>
                {cfg?.label ?? g.grnStatus}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
              {accepted > 0 && <span className="text-green-600">✓ {accepted} accepted</span>}
              {rejected > 0 && <span className="text-red-500">✗ {rejected} rejected</span>}
              <Link
                href={`/admin/inventory/purchase-query?tab=grn&invoiceId=${invoiceId}`}
                className="flex items-center gap-0.5 text-blue-600 hover:text-blue-800 font-medium"
              >
                View <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Linked BT section ────────────────────────────────────────────────────────

function LinkedBtSection({ bts, invoiceId }: { bts: BillTransferDto[]; invoiceId: string }) {
  if (!bts.length) {
    return <p className="text-xs text-gray-400 italic py-1">No Bill Transfer generated yet.</p>;
  }

  const slaBadge = (state: string) => {
    if (state === 'Breached') return 'bg-red-100 text-red-700';
    if (state === 'AtRisk') return 'bg-amber-100 text-amber-700';
    return 'bg-green-100 text-green-600';
  };

  return (
    <div className="space-y-2">
      {bts.map(bt => {
        const cfg = getStatusConfig(BT_STATUS, bt.status);
        return (
          <div key={bt.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Layers className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="text-xs font-mono font-semibold text-gray-800 truncate">{bt.id.slice(0, 8).toUpperCase()}</span>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${cfg?.badgeClass ?? 'bg-gray-100 text-gray-600'}`}>
                {cfg?.label ?? bt.status}
              </span>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${slaBadge(bt.slaState)}`}>
                SLA: {bt.slaState}
              </span>
            </div>
            <Link
              href={`/admin/inventory/purchase-query?tab=bt`}
              className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0"
            >
              View <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        );
      })}
    </div>
  );
}

// ─── Linked Settlement section ────────────────────────────────────────────────

function LinkedSettlementSection({ settlements }: { settlements: InvoiceSettlementDto[] }) {
  if (!settlements.length) {
    return <p className="text-xs text-gray-400 italic py-1">No settlement created yet.</p>;
  }

  return (
    <div className="space-y-2">
      {settlements.map(sl => {
        const cfg = getStatusConfig(SETTLEMENT_STATUS, sl.status);
        const isOverdue =
          sl.status === 'Overdue' ||
          (sl.status === 'Pending' && sl.dueDate && new Date(sl.dueDate) < new Date());
        return (
          <div key={sl.id} className="rounded-lg bg-gray-50 px-3 py-2 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <DollarSign className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${cfg?.badgeClass ?? 'bg-gray-100 text-gray-600'}`}>
                  {cfg?.label ?? sl.status}
                </span>
                {isOverdue && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-600">
                    <AlertTriangle className="w-2.5 h-2.5" /> Overdue
                  </span>
                )}
              </div>
              <Link
                href="/admin/inventory/purchase-query?tab=settlements"
                className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0"
              >
                View <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span>Paid: <span className="font-semibold text-gray-800">₹{sl.amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></span>
              <span>Balance: <span className={`font-semibold ${sl.balanceRemaining > 0 ? 'text-amber-700' : 'text-green-700'}`}>₹{sl.balanceRemaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></span>
              {sl.dueDate && <span className="text-gray-400">Due: {new Date(sl.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Payment history section ──────────────────────────────────────────────────

function PaymentHistorySection({ payments }: { payments: VendorPaymentDto[] }) {
  if (!payments.length) {
    return <p className="text-xs text-gray-400 italic py-1">No payments recorded against this invoice.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            {['Date', 'Mode', 'Reference', 'Amount', 'Status', 'Proof'].map(h => (
              <th key={h} className="px-3 py-2 text-left font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {payments.map(p => {
            const cfg = getStatusConfig(VENDOR_PAYMENT_STATUS, p.deletedAt ? 'reversed' : 'active');
            return (
              <tr key={p.id} className={`hover:bg-gray-50 ${p.deletedAt ? 'opacity-60' : ''}`}>
                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                  {new Date(p.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-3 py-2 text-gray-600">{p.paymentMode}</td>
                <td className="px-3 py-2 font-mono text-gray-700">{p.paymentReference}</td>
                <td className="px-3 py-2 font-semibold text-gray-800 text-right font-mono">
                  ₹{p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-2">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${cfg?.badgeClass ?? 'bg-gray-100 text-gray-600'}`}>
                    {cfg?.label ?? (p.deletedAt ? 'Reversed' : 'Active')}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {p.attachmentUrl ? (
                    <a
                      href={p.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <Download className="w-3 h-3" />
                      {p.attachmentFilename ?? 'Download'}
                    </a>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="border-t border-gray-200 bg-gray-50">
          <tr>
            <td colSpan={3} className="px-3 py-2 text-xs font-semibold text-gray-500 text-right">Total Paid</td>
            <td className="px-3 py-2 text-xs font-bold text-gray-900 text-right font-mono">
              ₹{payments.filter(p => !p.deletedAt).reduce((s, p) => s + p.amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </td>
            <td colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─── Main drawer ──────────────────────────────────────────────────────────────

interface Props {
  invoice: PurchaseInvoiceDto | null;
  onClose: () => void;
  onActionComplete: () => void;
}

export function InvoiceDetailDrawer({ invoice, onClose, onActionComplete }: Props) {
  const [openSections, setOpenSections] = useState({
    meta: true,
    items: true,
    financial: false,
    payment: false,
    grn: true,
    bt: true,
    settlement: true,
    paymentHistory: false,
  });
  const [acting, setActing] = useState(false);

  // Linked entity state
  const [linkedGrns, setLinkedGrns] = useState<GrnHeaderDto[]>([]);
  const [linkedBts, setLinkedBts] = useState<BillTransferDto[]>([]);
  const [linkedSettlements, setLinkedSettlements] = useState<InvoiceSettlementDto[]>([]);
  const [linkedPayments, setLinkedPayments] = useState<VendorPaymentDto[]>([]);
  const [linkedLoading, setLinkedLoading] = useState(false);

  // Load linked entities when invoice changes
  useEffect(() => {
    if (!invoice) {
      setLinkedGrns([]);
      setLinkedBts([]);
      setLinkedSettlements([]);
      setLinkedPayments([]);
      return;
    }
    setLinkedLoading(true);
    Promise.allSettled([
      inventoryGrnApi.list({ page: 1, pageSize: 100 }),
      inventoryBillTransferApi.list({ page: 1, pageSize: 100 }),
      inventorySettlementApi.list({ page: 1, pageSize: 100 }),
      inventoryVendorApi.listPayments(invoice.vendorId, 1, 100),
    ]).then(([grnRes, btRes, slRes, vpRes]) => {
      if (grnRes.status === 'fulfilled') {
        setLinkedGrns((grnRes.value.items ?? []).filter((g: GrnHeaderDto) => g.invoiceId === invoice.id));
      }
      if (btRes.status === 'fulfilled') {
        setLinkedBts((btRes.value.items ?? []).filter((b: BillTransferDto) => b.invoiceId === invoice.id));
      }
      if (slRes.status === 'fulfilled') {
        setLinkedSettlements((slRes.value.items ?? []).filter((s: InvoiceSettlementDto) => s.invoiceNumber === invoice.invoiceNumber));
      }
      if (vpRes.status === 'fulfilled') {
        setLinkedPayments((vpRes.value.items ?? []).filter((p: VendorPaymentDto) => p.invoiceId === invoice.id));
      }
    }).finally(() => setLinkedLoading(false));
  }, [invoice?.id]);

  const toggle = (key: keyof typeof openSections) =>
    setOpenSections(s => ({ ...s, [key]: !s[key] }));

  const doAction = async (action: string) => {
    if (!invoice) return;
    setActing(true);
    try {
      if (action === 'submit') {
        await inventoryInvoiceApi.submit(invoice.id);
        toast.success('Invoice submitted for primary approval.');
      } else if (action === 'approve') {
        await inventoryInvoiceApi.approve(invoice.id, 'FinalApproval');
        toast.success('Invoice approved.');
      } else if (action === 'reject') {
        const remarks = window.prompt('Rejection remarks (optional):') ?? '';
        await inventoryInvoiceApi.approve(invoice.id, 'Rejection', remarks || undefined);
        toast.success('Invoice rejected.');
      } else if (action === 'cancel') {
        await inventoryInvoiceApi.cancel(invoice.id);
        toast.success('Invoice cancelled.');
      }
      onActionComplete();
    } catch (err: any) {
      toast.error(err?.response?.data ?? err?.message ?? `Action failed.`);
    } finally {
      setActing(false);
    }
  };

  const statusCfg = invoice ? getStatusConfig(INVOICE_STATUS, invoice.approvalStatus) : null;

  return (
    <DrawerPanel
      open={!!invoice}
      onClose={onClose}
      title={invoice?.invoiceNumber ?? 'Invoice Detail'}
      subtitle={invoice?.vendorName}
      width="w-full max-w-2xl"
      footer={
        invoice?.approvalStatus === 'Draft' ? (
          <button
            onClick={() => { onClose(); }}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            Close
          </button>
        ) : undefined
      }
    >
      {invoice && (
        <div className="space-y-4">
          {/* Status + trail */}
          <div className="flex items-center justify-between mb-1">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusCfg?.badgeClass}`}>
              {statusCfg?.label ?? invoice.approvalStatus}
            </span>
            {invoice.dueDate && (
              <span className={`text-xs flex items-center gap-1 ${new Date(invoice.dueDate) < new Date() && invoice.balanceAmount > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                <Calendar className="w-3.5 h-3.5" />
                Due: {fmtDate(invoice.dueDate)}
                {new Date(invoice.dueDate) < new Date() && invoice.balanceAmount > 0 && (
                  <span className="ml-1 text-red-600 font-semibold flex items-center gap-0.5">
                    <AlertTriangle className="w-3 h-3" /> Overdue
                  </span>
                )}
              </span>
            )}
          </div>

          <ApprovalTrail status={invoice.approvalStatus} />

          <NextStepsBanner invoice={invoice} onAction={doAction} acting={acting} />

          {/* ── Invoice Metadata ── */}
          <div className="border rounded-xl overflow-hidden">
            <div className="border-b">
              <div className="px-4">
                <SectionHeader
                  icon={<FileText className="w-4 h-4 text-gray-400" />}
                  title="Invoice Details"
                  open={openSections.meta}
                  onToggle={() => toggle('meta')}
                />
              </div>
            </div>
            {openSections.meta && (
              <div className="px-4 pb-4 pt-3 grid grid-cols-2 gap-x-6 gap-y-3">
                <Field label="Vendor" value={invoice.vendorName} />
                <Field label="Invoice Number" value={<span className="font-mono">{invoice.invoiceNumber}</span>} />
                <Field label="Invoice Date" value={fmtDate(invoice.invoiceDate)} />
                <Field label="Invoice Type" value={invoice.invoiceType} />
                <Field label="Payment Mode" value={invoice.paymentMode} />
                <Field label="Credit Period" value={invoice.creditPeriod ? `${invoice.creditPeriod} days` : undefined} />
                <Field label="Store" value={invoice.storeName} />
                <Field label="Reference" value={invoice.reference} />
                {invoice.deliveryChallNumber && (
                  <Field label="Delivery Chall. #" value={invoice.deliveryChallNumber} />
                )}
                {invoice.vendorOrderNumber && (
                  <Field label="Vendor Order #" value={invoice.vendorOrderNumber} />
                )}
                {invoice.grnNumber && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 mb-0.5">Linked GRN</p>
                    <Link
                      href={`/admin/inventory/purchase-query?tab=grn&invoiceId=${invoice.id}`}
                      className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-mono font-semibold"
                    >
                      <Package className="w-4 h-4" />
                      {invoice.grnNumber}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Line Items ── */}
          <div className="border rounded-xl overflow-hidden">
            <div className="border-b">
              <div className="px-4">
                <SectionHeader
                  icon={<Tag className="w-4 h-4 text-gray-400" />}
                  title={`Line Items (${invoice.items?.length ?? 0})`}
                  open={openSections.items}
                  onToggle={() => toggle('items')}
                />
              </div>
            </div>
            {openSections.items && (
              <div className="px-3 pb-3 pt-2">
                <LineItemsTable invoice={invoice} />
              </div>
            )}
          </div>

          {/* ── Financial Summary ── */}
          <div className="border rounded-xl overflow-hidden">
            <div className="border-b">
              <div className="px-4">
                <SectionHeader
                  icon={<CreditCard className="w-4 h-4 text-gray-400" />}
                  title="Financial Summary"
                  open={openSections.financial}
                  onToggle={() => toggle('financial')}
                />
              </div>
            </div>
            {openSections.financial && (
              <div className="px-4 pb-4 pt-2">
                <InvoiceFinancialSummary
                  grossAmount={invoice.grossAmount}
                  discountAmount={invoice.discountAmount}
                  taxableAmount={invoice.taxableAmount}
                  totalGst={invoice.totalGst}
                  tcsPercent={invoice.tcsPercent}
                  tcsAmount={invoice.tcsAmount}
                  netAmount={invoice.netAmount}
                />
              </div>
            )}
          </div>

          {/* ── Payment Progress ── */}
          {invoice.approvalStatus === 'Approved' && (
            <div className="border rounded-xl overflow-hidden">
              <div className="border-b">
                <div className="px-4">
                  <SectionHeader
                    icon={<Building2 className="w-4 h-4 text-gray-400" />}
                    title="Payment Status"
                    open={openSections.payment}
                    onToggle={() => toggle('payment')}
                  />
                </div>
              </div>
              {openSections.payment && (
                <div className="px-4 pb-4 pt-2">
                  <PaymentProgress invoice={invoice} />
                </div>
              )}
            </div>
          )}

          {/* ── Cancel action ── */}
          {invoice.approvalStatus === 'Draft' && (
            <div className="pt-1">
              <button
                onClick={() => doAction('cancel')}
                disabled={acting}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
              >
                <Ban className="w-3.5 h-3.5" />
                Cancel this invoice
              </button>
            </div>
          )}

          {/* ── Exception banners ── */}
          {!linkedLoading && (
            <ExceptionBanners grns={linkedGrns} bts={linkedBts} settlements={linkedSettlements} />
          )}

          {/* ── Linked GRN ── */}
          <div className="border rounded-xl overflow-hidden">
            <div className="border-b">
              <div className="px-4">
                <SectionHeader
                  icon={<Package className="w-4 h-4 text-gray-400" />}
                  title={`Linked GRN${linkedGrns.length > 0 ? ` (${linkedGrns.length})` : ''}`}
                  open={openSections.grn}
                  onToggle={() => toggle('grn')}
                />
              </div>
            </div>
            {openSections.grn && (
              <div className="px-4 pb-3 pt-2">
                {linkedLoading ? (
                  <p className="text-xs text-gray-400 italic">Loading…</p>
                ) : (
                  <LinkedGrnSection grns={linkedGrns} invoiceId={invoice.id} />
                )}
              </div>
            )}
          </div>

          {/* ── Linked Bill Transfer ── */}
          <div className="border rounded-xl overflow-hidden">
            <div className="border-b">
              <div className="px-4">
                <SectionHeader
                  icon={<Layers className="w-4 h-4 text-gray-400" />}
                  title={`Linked Bill Transfer${linkedBts.length > 0 ? ` (${linkedBts.length})` : ''}`}
                  open={openSections.bt}
                  onToggle={() => toggle('bt')}
                />
              </div>
            </div>
            {openSections.bt && (
              <div className="px-4 pb-3 pt-2">
                {linkedLoading ? (
                  <p className="text-xs text-gray-400 italic">Loading…</p>
                ) : (
                  <LinkedBtSection bts={linkedBts} invoiceId={invoice.id} />
                )}
              </div>
            )}
          </div>

          {/* ── Linked Settlement ── */}
          <div className="border rounded-xl overflow-hidden">
            <div className="border-b">
              <div className="px-4">
                <SectionHeader
                  icon={<Receipt className="w-4 h-4 text-gray-400" />}
                  title={`Linked Settlement${linkedSettlements.length > 0 ? ` (${linkedSettlements.length})` : ''}`}
                  open={openSections.settlement}
                  onToggle={() => toggle('settlement')}
                />
              </div>
            </div>
            {openSections.settlement && (
              <div className="px-4 pb-3 pt-2">
                {linkedLoading ? (
                  <p className="text-xs text-gray-400 italic">Loading…</p>
                ) : (
                  <LinkedSettlementSection settlements={linkedSettlements} />
                )}
              </div>
            )}
          </div>

          {/* ── Payment History ── */}
          <div className="border rounded-xl overflow-hidden">
            <div className="border-b">
              <div className="px-4">
                <SectionHeader
                  icon={<CreditCard className="w-4 h-4 text-gray-400" />}
                  title={`Payment History${linkedPayments.length > 0 ? ` (${linkedPayments.length})` : ''}`}
                  open={openSections.paymentHistory}
                  onToggle={() => toggle('paymentHistory')}
                />
              </div>
            </div>
            {openSections.paymentHistory && (
              <div className="px-3 pb-3 pt-2">
                {linkedLoading ? (
                  <p className="text-xs text-gray-400 italic">Loading…</p>
                ) : (
                  <PaymentHistorySection payments={linkedPayments} />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </DrawerPanel>
  );
}
