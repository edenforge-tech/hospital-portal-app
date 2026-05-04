'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  CheckCircle, AlertTriangle, AlertCircle, Edit2, RefreshCw,
  ExternalLink, ChevronDown, ChevronUp, X, Plus, Loader2,
} from 'lucide-react';
import {
  type InvoiceExtractionPreview,
  type ExtractedField,
  type ExtractedLineItem,
  type ExtractionCandidate,
  type ConfirmedLineItem,
  type ExtractionConfidence,
  type VendorDto,
  type StoreDto,
  inventoryItemApi,
} from '@/lib/api/inventory-service.api';
import { ItemSearchModal } from './ItemSearchModal';
import { ItemGstFormModal } from './ItemGstFormModal';
import type { GrnLineItem } from './ItemGstFormModal';
import type { ItemDto, LastPurchaseInfo } from '@/lib/api/inventory-service.api';

// ─── Item creation constants ──────────────────────────────────────────────────
const ITEM_TYPES = ['Drug', 'Surgical', 'Equipment', 'Consumable', 'Optical', 'IOL'];
const UNITS = ['Nos', 'Pcs', 'Box', 'Strip', 'Vial', 'Amp', 'Tab', 'Cap', 'Syringe'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function confidenceColor(c: ExtractionConfidence) {
  return c === 'High'   ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
       : c === 'Review' ? 'text-amber-600   bg-amber-50   border-amber-200'
                        : 'text-red-600     bg-red-50     border-red-200';
}

function confidenceIcon(c: ExtractionConfidence) {
  return c === 'High'
    ? <CheckCircle size={11} />
    : c === 'Review'
    ? <AlertTriangle size={11} />
    : <AlertCircle size={11} />;
}

function ConfBadge({ c }: { c: ExtractionConfidence }) {
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${confidenceColor(c)}`}>
      {confidenceIcon(c)} {c}
    </span>
  );
}

// A single editable review row
function FieldRow({
  label, field, renderInput,
}: {
  label: string;
  field: ExtractedField<unknown>;
  renderInput: (conf: ExtractionConfidence) => React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr_auto] gap-2 items-start py-2 border-b border-gray-50 last:border-0">
      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide pt-2 truncate">{label}</span>
      <div className="space-y-1">
        {renderInput(field.confidence)}
        {field.mismatchReason && (
          <p className="text-[10px] text-amber-600 leading-snug">{field.mismatchReason}</p>
        )}
        {field.sourceText && field.sourceText !== String(field.value ?? '') && (
          <p className="text-[10px] text-gray-400">Extracted: <span className="font-mono">{field.sourceText}</span></p>
        )}
      </div>
      <div className="pt-1.5">
        <ConfBadge c={field.confidence} />
      </div>
    </div>
  );
}

const inputCls = 'w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400';
const inputHighCls = `${inputCls} bg-emerald-50/40 border-emerald-200`;
const inputReviewCls = `${inputCls} bg-amber-50/40 border-amber-200`;
const inputLowCls = `${inputCls} bg-red-50/40 border-red-100`;

function inputStyle(c: ExtractionConfidence) {
  return c === 'High' ? inputHighCls : c === 'Review' ? inputReviewCls : inputLowCls;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface LineItemState extends ConfirmedLineItem {
  // Display-only (not sent to backend)
  displayName: string;
  displayHsn: string;
  candidates: ExtractionCandidate[];
}

interface Props {
  preview: InvoiceExtractionPreview;
  vendors: VendorDto[];
  stores: StoreDto[];
  onConfirm: (data: {
    vendorId: string;
    storeId: string;
    invoiceNumber: string;
    invoiceDate: string;
    invoiceType: string;
    paymentMode: string;
    creditPeriod: string;
    dueDate: string;
    reference: string;
    purchaseCategory: string;
    grnDate: string;
    remarks: string;
    items: ConfirmedLineItem[];
    // Audit metadata
    originalFilename?: string;
    documentUrl?: string;
    providerModel?: string;
    processingMs?: number;
    highFieldCount?: number;
    reviewFieldCount?: number;
    lowFieldCount?: number;
    fieldOverrideCount?: number;
    overriddenFieldsJson?: string;
  }) => void;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ExtractionReviewModal({ preview, vendors, stores, onConfirm, onClose }: Props) {
  const h = preview.header;
  const today = new Date().toISOString().slice(0, 10);

  // ── Header state ──────────────────────────────────────────────────────────
  const [vendorId,         setVendorId]         = useState(h.resolvedVendorId ?? '');
  const [storeId,          setStoreId]          = useState(h.resolvedStoreId  ?? '');
  const [invoiceNumber,    setInvoiceNumber]    = useState(h.invoiceNumber.value ?? '');
  const [invoiceDate,      setInvoiceDate]      = useState(
    h.invoiceDate.value ? String(h.invoiceDate.value).slice(0, 10) : today);
  const [invoiceType,      setInvoiceType]      = useState(h.invoiceType.value ?? 'Invoice');
  const [paymentMode,      setPaymentMode]      = useState(h.paymentMode.value ?? '');
  const [creditPeriod,     setCreditPeriod]     = useState(String(h.creditPeriod.value ?? ''));
  const [reference,        setReference]        = useState(h.reference.value ?? '');
  const [grnDate,          setGrnDate]          = useState(
    h.grnDate.value ? String(h.grnDate.value).slice(0, 10) : today);
  const [remarks,          setRemarks]          = useState(h.remarks.value ?? '');
  const [purchaseCategory, setPurchaseCategory] = useState('');

  // Auto-compute due date
  const dueDate = (() => {
    const days = parseInt(creditPeriod) || 0;
    if (!invoiceDate || days <= 0) return '';
    const d = new Date(invoiceDate);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  })();

  // ── Line items state ──────────────────────────────────────────────────────
  const initLines = (): LineItemState[] =>
    preview.lineItems.map(l => ({
      itemId:          l.resolvedItemId ?? '',
      displayName:     l.resolvedItemName ?? l.rawDescription.value ?? '',
      displayHsn:      l.hsnCode.value ?? '',
      candidates:      l.itemCandidates,
      orderedQuantity: l.orderedQuantity.value ?? 1,
      freeQuantity:    l.freeQuantity.value ?? 0,
      batchNumber:     l.batchNumber.value ?? null,
      expiryDate:      l.expiryDate.value ? String(l.expiryDate.value).slice(0, 10) : null,
      barcode:         null,
      mrp:             l.mrp.value ?? 0,
      purchaseRate:    l.purchaseRate.value ?? 0,
      discountPercent: l.discountPercent.value ?? 0,
      hsnCode:         l.hsnCode.value ?? null,
      gstPercent:      l.gstPercent.value ?? 0,
      cgstPercent:     l.cgstPercent.value ?? 0,
      sgstPercent:     l.sgstPercent.value ?? 0,
      igstPercent:     l.igstPercent.value ?? 0,
      sellingPrice:    l.sellingPrice.value ?? 0,
    }));

  const [lines, setLines] = useState<LineItemState[]>(initLines);
  const [remapIdx, setRemapIdx] = useState<number | null>(null); // open ItemSearchModal for this idx
  const [linesSectionOpen, setLinesSectionOpen] = useState(true);
  const [totalsSectionOpen, setTotalsSectionOpen] = useState(false);

  // ── Bulk item creation state ──────────────────────────────────────────────
  const [showBulkConfig, setShowBulkConfig] = useState(false);
  const [bulkCreating, setBulkCreating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkDefaults, setBulkDefaults] = useState({ itemType: 'IOL', unit: 'Nos' });

  // ── GST form modal (Create & Fill flow) ──────────────────────────────────
  const [gstModalIdx,      setGstModalIdx]      = useState<number | null>(null);
  const [gstModalItem,     setGstModalItem]      = useState<ItemDto | null>(null);
  const [gstModalCreating, setGstModalCreating]  = useState(false);

  // ── Line helpers ──────────────────────────────────────────────────────────
  const updateLine = useCallback(<K extends keyof LineItemState>(
    idx: number, field: K, value: LineItemState[K]
  ) => {
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  }, []);

  const handleRemapItem = (item: ItemDto, _lp?: LastPurchaseInfo) => {
    if (remapIdx === null) return;
    setLines(prev => prev.map((l, i) => i === remapIdx ? {
      ...l,
      itemId:      item.id,
      displayName: item.itemName,
      displayHsn:  item.hsnCode ?? '',
      hsnCode:     item.hsnCode ?? null,
      gstPercent:  parseFloat(item.defaultGstRate ?? '0') || 0,
      cgstPercent: (parseFloat(item.defaultGstRate ?? '0') || 0) / 2,
      sgstPercent: (parseFloat(item.defaultGstRate ?? '0') || 0) / 2,
    } : l));
    setRemapIdx(null);
  };

  // ── Create & Fill: create item in master then open ItemGstFormModal ───────
  const handleOpenGstModal = async (idx: number) => {
    const src = preview.lineItems[idx];
    const rawName = src.rawDescription.value?.trim() || `Item ${idx + 1}`;
    const gstVal  = typeof src.gstPercent?.value === 'number' ? src.gstPercent.value : 0;
    setGstModalCreating(true);
    setBulkError(null);
    try {
      const created = await inventoryItemApi.create({
        itemName:            rawName,
        hsnCode:             src.hsnCode?.value ?? undefined,
        defaultGstRate:      gstVal > 0 ? String(gstVal) : undefined,
        unit:                'Nos',
        itemType:            'IOL',
        requiresColdStorage: false,
        isBarcodeTracked:    false,
        reorderLevel:        0,
        reorderQuantity:     0,
      });
      setGstModalItem(created);
      setGstModalIdx(idx);
    } catch {
      setBulkError('Could not create item. Check your connection and try again.');
    } finally {
      setGstModalCreating(false);
    }
  };

  const handleGstModalSave = (grn: GrnLineItem) => {
    if (gstModalIdx === null || gstModalItem === null) return;
    setLines(prev => prev.map((l, i) => i === gstModalIdx ? {
      ...l,
      itemId:          gstModalItem.id,
      displayName:     gstModalItem.itemName,
      displayHsn:      gstModalItem.hsnCode ?? '',
      hsnCode:         gstModalItem.hsnCode ?? null,
      orderedQuantity: grn.orderedQuantity,
      freeQuantity:    grn.freeQuantity,
      batchNumber:     grn.batchNumber || null,
      expiryDate:      grn.expiryDate   || null,
      mrp:             grn.mrp,
      purchaseRate:    grn.purchaseRate,
      discountPercent: grn.discountPercent,
      gstPercent:      grn.gstPercent,
      cgstPercent:     grn.cgstPercent,
      sgstPercent:     grn.sgstPercent,
      igstPercent:     grn.igstPercent,
      sellingPrice:    grn.sellingPrice,
    } : l));
    setGstModalIdx(null);
    setGstModalItem(null);
  };

  // ── Tax conflict detection ──────────────────────────────────────────────
  // Warn when IGST > 0 AND (CGST > 0 OR SGST > 0) for the same line (intra- vs inter-state mix)
  const taxConflicts: number[] = useMemo(
    () => lines.reduce<number[]>((acc, l, i) => {
      if (l.igstPercent > 0 && (l.cgstPercent > 0 || l.sgstPercent > 0)) acc.push(i + 1);
      return acc;
    }, []),
    [lines]
  );

  // ── Accept All High-Confidence ────────────────────────────────────────────
  const acceptAllHigh = () => {
    // Header fields — accept vendor/store/invoice values that are High confidence
    if (h.invoiceNumber.confidence === 'High' && h.invoiceNumber.value)
      setInvoiceNumber(h.invoiceNumber.value);
    if (h.invoiceDate.confidence === 'High' && h.invoiceDate.value)
      setInvoiceDate(String(h.invoiceDate.value).slice(0, 10));
    if (h.invoiceType.confidence === 'High' && h.invoiceType.value)
      setInvoiceType(h.invoiceType.value);
    if (h.paymentMode.confidence === 'High' && h.paymentMode.value)
      setPaymentMode(h.paymentMode.value);
    if (h.creditPeriod.confidence === 'High' && h.creditPeriod.value != null)
      setCreditPeriod(String(h.creditPeriod.value));
    if (h.reference.confidence === 'High' && h.reference.value)
      setReference(h.reference.value);
    if (h.grnDate.confidence === 'High' && h.grnDate.value)
      setGrnDate(String(h.grnDate.value).slice(0, 10));
    if (h.remarks.confidence === 'High' && h.remarks.value)
      setRemarks(h.remarks.value);
    if (h.resolvedVendorId) setVendorId(h.resolvedVendorId);
    if (h.resolvedStoreId)  setStoreId(h.resolvedStoreId);
    // Line items — accept resolved items that are High confidence
    setLines(prev => prev.map((l, i) => {
      const src = preview.lineItems[i];
      if (!l.itemId && src.resolvedItemId) return { ...l, itemId: src.resolvedItemId };
      return l;
    }));
  };

  // ── Section-wise accept header ────────────────────────────────────────────
  const acceptAllHeaderFields = () => {
    if (h.invoiceNumber.value) setInvoiceNumber(h.invoiceNumber.value);
    if (h.invoiceDate.value)   setInvoiceDate(String(h.invoiceDate.value).slice(0, 10));
    if (h.invoiceType.value)   setInvoiceType(h.invoiceType.value);
    if (h.paymentMode.value)   setPaymentMode(h.paymentMode.value);
    if (h.creditPeriod.value != null) setCreditPeriod(String(h.creditPeriod.value));
    if (h.reference.value)     setReference(h.reference.value);
    if (h.grnDate.value)       setGrnDate(String(h.grnDate.value).slice(0, 10));
    if (h.remarks.value)       setRemarks(h.remarks.value);
    if (h.resolvedVendorId)    setVendorId(h.resolvedVendorId);
    if (h.resolvedStoreId)     setStoreId(h.resolvedStoreId);
  };

  // ── Section-wise accept all line items ─────────────────────────────────────────
  const acceptAllLineItems = () => {
    setLines(prev => prev.map((l, i) => {
      const src = preview.lineItems[i];
      return src.resolvedItemId ? { ...l, itemId: src.resolvedItemId } : l;
    }));
  };

  // ── Bulk create unmatched items ─────────────────────────────────────────────
  const unmappedCount = lines.filter(l => !l.itemId).length;

  const bulkCreateItems = async () => {
    const unmatched = lines.map((l, i) => ({ l, i })).filter(({ l }) => !l.itemId);
    if (unmatched.length === 0) return;
    setBulkCreating(true);
    setBulkProgress({ done: 0, total: unmatched.length });
    setBulkError(null);
    setShowBulkConfig(false);
    let failures = 0;
    for (const { l: _l, i } of unmatched) {
      const src = preview.lineItems[i];
      const rawName = src.rawDescription.value?.trim() || `Item ${i + 1}`;
      const gstVal  = typeof src.gstPercent?.value === 'number' ? src.gstPercent.value : 0;
      try {
        const created = await inventoryItemApi.create({
          itemName:             rawName,
          hsnCode:              src.hsnCode?.value ?? undefined,
          defaultGstRate:       gstVal > 0 ? String(gstVal) : undefined,
          unit:                 bulkDefaults.unit,
          itemType:             bulkDefaults.itemType,
          requiresColdStorage:  false,
          isBarcodeTracked:     false,
          reorderLevel:         0,
          reorderQuantity:      0,
        });
        const half = gstVal / 2;
        setLines(prev => prev.map((line, idx) =>
          idx === i
            ? {
                ...line,
                itemId:      created.id,
                displayName: created.itemName,
                displayHsn:  created.hsnCode ?? '',
                hsnCode:     created.hsnCode ?? null,
                gstPercent:  gstVal,
                cgstPercent: half,
                sgstPercent: half,
              }
            : line
        ));
      } catch {
        failures++;
      }
      setBulkProgress(prev => prev ? { ...prev, done: prev.done + 1 } : null);
    }
    setBulkCreating(false);
    setBulkProgress(null);
    if (failures > 0) {
      setBulkError(`${failures} item${failures !== 1 ? 's' : ''} could not be created. Retry them individually.`);
    }
  };

  // ── Override tracking ───────────────────────────────────────────────
  // Collect names of fields the user has changed from extracted defaults
  const overriddenFields = useMemo(() => {
    const fields: string[] = [];
    if (vendorId      !== (h.resolvedVendorId ?? ''))    fields.push('VendorId');
    if (storeId       !== (h.resolvedStoreId  ?? ''))    fields.push('StoreId');
    if (invoiceNumber !== (h.invoiceNumber.value ?? '')) fields.push('InvoiceNumber');
    if (invoiceDate   !== (h.invoiceDate.value ? String(h.invoiceDate.value).slice(0, 10) : today))
      fields.push('InvoiceDate');
    if (invoiceType   !== (h.invoiceType.value ?? 'Invoice'))  fields.push('InvoiceType');
    if (paymentMode   !== (h.paymentMode.value ?? ''))         fields.push('PaymentMode');
    if (creditPeriod  !== String(h.creditPeriod.value ?? ''))  fields.push('CreditPeriod');
    if (reference     !== (h.reference.value ?? ''))           fields.push('Reference');
    if (remarks       !== (h.remarks.value ?? ''))             fields.push('Remarks');
    return fields;
  }, [vendorId, storeId, invoiceNumber, invoiceDate, invoiceType, paymentMode, creditPeriod, reference, remarks, h, today]);

  // ── Validation ────────────────────────────────────────────────────────────
  const pendingFields: string[] = [];
  if (!vendorId)      pendingFields.push('Vendor');
  if (!storeId)       pendingFields.push('Store');
  if (!invoiceNumber) pendingFields.push('Invoice Number');
  if (unmappedCount > 0) pendingFields.push(`${unmappedCount} item${unmappedCount !== 1 ? 's' : ''} need mapping`);
  const canConfirm = pendingFields.length === 0;

  // ── Review stats ──────────────────────────────────────────────────────────
  const allFields: ExtractionConfidence[] = [
    h.invoiceNumber.confidence, h.invoiceDate.confidence, h.invoiceType.confidence,
    h.paymentMode.confidence, h.vendorName.confidence,
    ...preview.lineItems.flatMap(l => [
      l.orderedQuantity.confidence, l.purchaseRate.confidence, l.mrp.confidence,
    ]),
  ];
  const highCount   = allFields.filter(c => c === 'High').length;
  const reviewCount = allFields.filter(c => c === 'Review').length;
  const lowCount    = allFields.filter(c => c === 'Low').length;

  // ── Confirm ───────────────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm({
      vendorId, storeId, invoiceNumber, invoiceDate, invoiceType,
      paymentMode, creditPeriod, dueDate, reference, purchaseCategory, grnDate, remarks,
      // Audit metadata
      originalFilename:     preview.originalFilename,
      documentUrl:          preview.documentUrl ?? undefined,
      providerModel:        preview.providerModel,
      processingMs:         preview.processingMs,
      highFieldCount:       highCount,
      reviewFieldCount:     reviewCount,
      lowFieldCount:        lowCount,
      fieldOverrideCount:   overriddenFields.length,
      overriddenFieldsJson: JSON.stringify(overriddenFields),
      items: lines.map(l => ({
        itemId:          l.itemId,
        orderedQuantity: l.orderedQuantity,
        freeQuantity:    l.freeQuantity,
        batchNumber:     l.batchNumber,
        expiryDate:      l.expiryDate,
        barcode:         l.barcode,
        mrp:             l.mrp,
        purchaseRate:    l.purchaseRate,
        discountPercent: l.discountPercent,
        hsnCode:         l.hsnCode,
        gstPercent:      l.gstPercent,
        cgstPercent:     l.cgstPercent,
        sgstPercent:     l.sgstPercent,
        igstPercent:     l.igstPercent,
        sellingPrice:    l.sellingPrice ?? 0,
      })),
    });
  };

  const lblCls = 'block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1';
  const PAYMENT_MODES = ['Cash', 'Credit', 'UPI', 'NEFT', 'RTGS', 'Cheque'];
  const PURCHASE_CATEGORIES = ['Pharmacy', 'OT & Surgery', 'Consumables', 'Optical', 'Laboratory', 'Stationery', 'Equipment', 'General Hospital'];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-6 px-4">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[92vh]">

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-100 rounded-t-2xl flex-shrink-0">
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-gray-900">Review Extracted Invoice</h2>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {preview.originalFilename} · {preview.providerModel} · {preview.processingMs}ms
              </p>
            </div>
            {/* confidence stats */}
            <div className="flex items-center gap-2 text-xs mx-4">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded font-semibold">{highCount} high</span>
              {reviewCount > 0 && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded font-semibold">{reviewCount} review</span>}
              {lowCount   > 0 && <span className="px-2 py-0.5 bg-red-100   text-red-700   rounded font-semibold">{lowCount} low</span>}
            </div>
            {/* Accept-all toolbar */}
            <button
              onClick={acceptAllHigh}
              title="Accept all High-confidence extracted values at once"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors mr-2"
            >
              <CheckCircle size={12} /> Accept All High
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white/70 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* ── Scrollable body ──────────────────────────────────────────── */}
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

            {/* Duplicate warning */}
            {preview.hasDuplicateWarning && (
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0 text-amber-500" />
                <span><strong>Possible duplicate:</strong> {preview.duplicateWarningDetail}</span>
              </div>
            )}

            {/* Document preview link */}
            {preview.documentUrl && (
              <a href={preview.documentUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-teal-700 hover:underline font-medium">
                <ExternalLink size={12} /> View uploaded document
              </a>
            )}

            {/* ── Section: Invoice Header ────────────────────────────────── */}
            <Section
              title="Invoice Header"
              action={
                <button
                  onClick={acceptAllHeaderFields}
                  className="text-[10px] font-semibold text-teal-700 hover:text-teal-900 hover:underline"
                  title="Fill all header fields from extracted values"
                >
                  Accept All Header
                </button>
              }
            >
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {/* Vendor */}
                <div>
                  <label className={lblCls}>
                    Vendor * <ConfBadge c={h.vendorName.confidence} />
                  </label>
                  <select
                    value={vendorId}
                    onChange={e => setVendorId(e.target.value)}
                    className={`${inputStyle(vendorId ? 'High' : 'Low')}`}
                  >
                    <option value="">Select vendor…</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                  {h.vendorName.value && <p className="text-[10px] text-gray-400 mt-0.5">Extracted: {h.vendorName.value} {h.vendorGstin.value ? `· GSTIN: ${h.vendorGstin.value}` : ''}</p>}
                </div>

                {/* Store */}
                <div>
                  <label className={lblCls}>
                    Store * <ConfBadge c={h.storeName.confidence} />
                  </label>
                  <select
                    value={storeId}
                    onChange={e => setStoreId(e.target.value)}
                    className={`${inputStyle(storeId ? 'High' : 'Low')}`}
                  >
                    <option value="">Select store…</option>
                    {stores.map(s => <option key={s.id} value={s.id}>{s.storeName}</option>)}
                  </select>
                  {h.storeName.value && <p className="text-[10px] text-gray-400 mt-0.5">Extracted: {h.storeName.value}</p>}
                </div>

                {/* Invoice No */}
                <div>
                  <label className={lblCls}>Invoice No * <ConfBadge c={h.invoiceNumber.confidence} /></label>
                  <input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)}
                    className={inputStyle(h.invoiceNumber.confidence)} />
                </div>

                {/* Invoice Date */}
                <div>
                  <label className={lblCls}>Invoice Date <ConfBadge c={h.invoiceDate.confidence} /></label>
                  <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)}
                    className={inputStyle(h.invoiceDate.confidence)} />
                </div>

                {/* Type */}
                <div>
                  <label className={lblCls}>Type <ConfBadge c={h.invoiceType.confidence} /></label>
                  <select value={invoiceType} onChange={e => setInvoiceType(e.target.value)}
                    className={inputStyle(h.invoiceType.confidence)}>
                    <option value="Invoice">Invoice</option>
                    <option value="Packing Slip">Packing Slip</option>
                  </select>
                </div>

                {/* Payment Mode */}
                <div>
                  <label className={lblCls}>Payment Mode <ConfBadge c={h.paymentMode.confidence} /></label>
                  <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)}
                    className={inputStyle(h.paymentMode.confidence)}>
                    <option value="">Select…</option>
                    {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                {/* Credit Period */}
                <div>
                  <label className={lblCls}>Credit Period (days) <ConfBadge c={h.creditPeriod.confidence} /></label>
                  <input type="number" min="0" value={creditPeriod} onChange={e => setCreditPeriod(e.target.value)}
                    placeholder="0" className={inputStyle(h.creditPeriod.confidence)} />
                </div>

                {/* Due Date (auto) */}
                <div>
                  <label className={lblCls}>Due Date (auto)</label>
                  <input type="date" value={dueDate} readOnly className={`${inputCls} bg-gray-50 text-gray-400 cursor-default`} />
                </div>

                {/* GRN Date */}
                <div>
                  <label className={lblCls}>GRN Date <ConfBadge c={h.grnDate.confidence} /></label>
                  <input type="date" value={grnDate} onChange={e => setGrnDate(e.target.value)}
                    className={inputStyle(h.grnDate.confidence)} />
                </div>

                {/* Reference */}
                <div>
                  <label className={lblCls}>Reference <ConfBadge c={h.reference.confidence} /></label>
                  <input value={reference} onChange={e => setReference(e.target.value)}
                    placeholder="PO No / Ref…" className={inputStyle(h.reference.confidence)} />
                </div>

                {/* Purchase Category */}
                <div>
                  <label className={lblCls}>Purchase Category</label>
                  <select value={purchaseCategory} onChange={e => setPurchaseCategory(e.target.value)}
                    className={inputCls}>
                    <option value="">Select…</option>
                    {PURCHASE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Remarks */}
                <div>
                  <label className={lblCls}>Remarks <ConfBadge c={h.remarks.confidence} /></label>
                  <input value={remarks} onChange={e => setRemarks(e.target.value)}
                    placeholder="Optional" className={inputStyle(h.remarks.confidence)} />
                </div>
              </div>

              {/* Vendor contact block */}
              {(h.vendorContact.value || h.vendorPhone.value || h.vendorEmail.value) && (
                <div className="mt-3 grid grid-cols-3 gap-3 bg-teal-50/60 border border-teal-100 rounded-xl p-3">
                  {[
                    { label: 'Contact', field: h.vendorContact },
                    { label: 'Phone',   field: h.vendorPhone   },
                    { label: 'Email',   field: h.vendorEmail   },
                  ].map(({ label, field }) => (
                    <div key={label}>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5 flex items-center gap-1">
                        {label} <ConfBadge c={field.confidence} />
                      </p>
                      <p className="text-xs text-gray-700 truncate">{field.value ?? <span className="text-gray-300">—</span>}</p>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* ── Section: Line Items ────────────────────────────────────── */}
            <CollapsibleSection
              title={`Line Items (${lines.length})`}
              open={linesSectionOpen}
              onToggle={() => setLinesSectionOpen(o => !o)}
              action={
                <div className="flex items-center gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); acceptAllLineItems(); }}
                    className="text-[10px] font-semibold text-teal-700 hover:text-teal-900 hover:underline"
                    title="Accept resolved item mappings for all lines"
                  >
                    Accept All Matches
                  </button>
                  {unmappedCount > 0 && !bulkCreating && (
                    <button
                      onClick={e => { e.stopPropagation(); setShowBulkConfig(v => !v); setBulkError(null); }}
                      className="flex items-center gap-1 text-[10px] font-semibold text-white bg-teal-700 hover:bg-teal-800 px-2 py-0.5 rounded-lg"
                      title="Auto-create all unmatched items in inventory master"
                    >
                      <Plus size={10} /> Create {unmappedCount} New
                    </button>
                  )}
                  {bulkCreating && bulkProgress && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-teal-700">
                      <Loader2 size={11} className="animate-spin" />
                      Creating {bulkProgress.done + 1}/{bulkProgress.total}…
                    </span>
                  )}
                </div>
              }
            >
              {/* Bulk create config banner */}
              {showBulkConfig && !bulkCreating && (
                <div className="mb-3 flex flex-wrap items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-xs">
                  <span className="font-semibold text-teal-800">
                    Create {unmappedCount} new item{unmappedCount !== 1 ? 's' : ''} with defaults:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <label className="text-gray-500 font-medium">Type</label>
                    <select
                      value={bulkDefaults.itemType}
                      onChange={e => setBulkDefaults(d => ({ ...d, itemType: e.target.value }))}
                      className="text-xs border border-teal-200 rounded-lg px-2 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                    >
                      {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label className="text-gray-500 font-medium">Unit</label>
                    <select
                      value={bulkDefaults.unit}
                      onChange={e => setBulkDefaults(d => ({ ...d, unit: e.target.value }))}
                      className="text-xs border border-teal-200 rounded-lg px-2 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                    >
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <button
                    onClick={bulkCreateItems}
                    className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm"
                  >
                    <Plus size={11} /> Confirm &amp; Create {unmappedCount}
                  </button>
                  <button
                    onClick={() => setShowBulkConfig(false)}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Bulk create error */}
              {bulkError && (
                <div className="mb-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-xs text-red-700">
                  <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
                  {bulkError}
                </div>
              )}

              {/* Tax conflict warning */}
              {taxConflicts.length > 0 && (
                <div className="flex items-start gap-2 mb-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-xs text-red-800">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-red-500" />
                  <span>
                    <strong>Tax conflict</strong> on line{taxConflicts.length > 1 ? 's' : ''}{' '}
                    {taxConflicts.join(', ')}: IGST and CGST/SGST are both non-zero.
                    Only one should apply (IGST for inter-state, CGST+SGST for intra-state).
                    Please correct the GST fields before confirming.
                  </span>
                </div>
              )}
              <div className="space-y-3">
                {lines.map((line, idx) => (
                  <LineItemRow
                    key={idx}
                    idx={idx}
                    line={line}
                    sourceItem={preview.lineItems[idx]}
                    onUpdate={updateLine}
                    onRemap={() => setRemapIdx(idx)}
                    onCreateNew={() => handleOpenGstModal(idx)}
                    creating={gstModalCreating && gstModalIdx === null}
                  />
                ))}
              </div>
            </CollapsibleSection>

            {/* ── Section: Totals ───────────────────────────────────────── */}
            <CollapsibleSection
              title="Extracted Totals (Reference Only)"
              open={totalsSectionOpen}
              onToggle={() => setTotalsSectionOpen(o => !o)}
            >
              <div className="grid grid-cols-4 gap-3 text-xs">
                {[
                  { label: 'Subtotal',   field: preview.totals.subtotal },
                  { label: 'Total CGST', field: preview.totals.totalCgst },
                  { label: 'Total SGST', field: preview.totals.totalSgst },
                  { label: 'Total IGST', field: preview.totals.totalIgst },
                  { label: 'Discount',   field: preview.totals.totalDiscount },
                  { label: 'Rounding',   field: preview.totals.roundingAmount },
                  { label: 'Net Amount', field: preview.totals.netAmount },
                ].map(({ label, field }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">{label}</p>
                    <p className={`font-bold ${field.confidence === 'High' ? 'text-gray-800' : 'text-amber-700'}`}>
                      ₹{(field.value as number ?? 0).toFixed(2)}
                    </p>
                    <ConfBadge c={field.confidence} />
                  </div>
                ))}
              </div>
            </CollapsibleSection>

          </div>

          {/* ── Footer ──────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex-shrink-0 gap-3">
            <div className="text-xs text-gray-400 min-w-0">
              {!canConfirm ? (
                <span className="text-amber-600 font-medium flex items-center gap-1.5 flex-wrap">
                  Pending: {pendingFields.join(', ')}
                  {unmappedCount > 0 && !bulkCreating && (
                    <button
                      onClick={() => { setShowBulkConfig(true); setLinesSectionOpen(true); }}
                      className="text-teal-700 hover:underline font-semibold"
                    >
                      Create All →
                    </button>
                  )}
                  {bulkCreating && bulkProgress && (
                    <span className="flex items-center gap-1 text-teal-700">
                      <Loader2 size={11} className="animate-spin" />
                      Creating {bulkProgress.done + 1}/{bulkProgress.total}…
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-emerald-600 font-medium">All required fields resolved ✓</span>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!canConfirm || bulkCreating}
                className="px-5 py-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-40 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                Use These Values →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Item remap modal */}
      {remapIdx !== null && (
        <div className="z-[60]">
          <ItemSearchModal
            storeId={storeId}
            onSelect={handleRemapItem}
            onClose={() => setRemapIdx(null)}
          />
        </div>
      )}

      {/* Create & Fill modal — item already created, now fill purchase details */}
      {gstModalIdx !== null && gstModalItem !== null && (
        <div className="z-[70]">
          <ItemGstFormModal
            item={gstModalItem}
            initial={{
              orderedQuantity: lines[gstModalIdx].orderedQuantity,
              freeQuantity:    lines[gstModalIdx].freeQuantity,
              purchaseRate:    lines[gstModalIdx].purchaseRate,
              mrp:             lines[gstModalIdx].mrp,
              discountPercent: lines[gstModalIdx].discountPercent,
              gstPercent:      lines[gstModalIdx].gstPercent,
              cgstPercent:     lines[gstModalIdx].cgstPercent,
              sgstPercent:     lines[gstModalIdx].sgstPercent,
              igstPercent:     lines[gstModalIdx].igstPercent,
              batchNumber:     lines[gstModalIdx].batchNumber ?? '',
              expiryDate:      lines[gstModalIdx].expiryDate  ?? '',
            }}
            onSave={handleGstModalSave}
            onClose={() => { setGstModalIdx(null); setGstModalItem(null); }}
          />
        </div>
      )}
    </>
  );
}

// ─── Section wrappers ─────────────────────────────────────────────────────────

function Section({
  title, children, action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">{title}</span>
        {action}
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

function CollapsibleSection({
  title, open, onToggle, children, action,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <div className="flex items-center bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition-colors">
        <button
          onClick={onToggle}
          className="flex-1 flex items-center justify-between px-4 py-2.5"
        >
          <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">{title}</span>
          {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </button>
        {action && (
          <div className="pr-3 flex-shrink-0">{action}</div>
        )}
      </div>
      {open && <div className="px-4 py-3">{children}</div>}
    </div>
  );
}

// ─── Line item row ────────────────────────────────────────────────────────────

function LineItemRow({
  idx, line, sourceItem, onUpdate, onRemap, onCreateNew, creating,
}: {
  idx: number;
  line: LineItemState;
  sourceItem: ExtractedLineItem;
  onUpdate: <K extends keyof LineItemState>(idx: number, field: K, value: LineItemState[K]) => void;
  onRemap: () => void;
  onCreateNew: () => void;
  creating: boolean;
}) {
  const [expanded, setExpanded] = useState(!line.itemId || sourceItem.orderedQuantity.confidence !== 'High');

  const overallConf: ExtractionConfidence = !line.itemId ? 'Low'
    : [sourceItem.orderedQuantity.confidence, sourceItem.purchaseRate.confidence, sourceItem.mrp.confidence]
        .includes('Low') ? 'Low'
    : [sourceItem.orderedQuantity.confidence, sourceItem.purchaseRate.confidence, sourceItem.mrp.confidence]
        .includes('Review') ? 'Review'
    : 'High';

  return (
    <div className={`border rounded-xl overflow-hidden ${
      overallConf === 'High' ? 'border-emerald-100' : overallConf === 'Review' ? 'border-amber-100' : 'border-red-100'
    }`}>
      {/* Row header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
          overallConf === 'High' ? 'bg-emerald-50/40 hover:bg-emerald-50/80'
          : overallConf === 'Review' ? 'bg-amber-50/40 hover:bg-amber-50/80'
          : 'bg-red-50/40 hover:bg-red-50/80'
        }`}
      >
        <span className="text-[11px] font-extrabold text-gray-500 w-5 flex-shrink-0">{idx + 1}</span>
        <span className="flex-1 text-sm font-medium text-gray-800 truncate min-w-0">
          {line.displayName || <span className="text-red-500">Item not matched — remap required</span>}
        </span>
        {line.displayHsn && <span className="text-[10px] font-mono text-gray-400 hidden sm:block">HSN: {line.displayHsn}</span>}
        <span className="text-xs text-gray-500">
          Qty {line.orderedQuantity} · ₹{line.purchaseRate.toFixed(2)}
        </span>
        <ConfBadge c={overallConf} />
        {expanded ? <ChevronUp size={12} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={12} className="text-gray-400 flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="px-3 py-3 space-y-3 border-t border-gray-100">
          {/* Item mapping */}
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Item * <ConfBadge c={line.itemId ? 'High' : 'Low'} />
              </label>
              <input
                readOnly
                value={line.displayName || 'Not matched'}
                className={`${line.itemId ? inputHighCls : inputLowCls} cursor-default`}
              />
              {sourceItem.rawDescription.value && (
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Extracted: <span className="font-mono">{sourceItem.rawDescription.value}</span>
                </p>
              )}
            </div>
            {/* Remap (search existing) */}
            <button
              onClick={onRemap}
              title="Search inventory master and remap"
              className="mt-5 flex-shrink-0 p-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg border border-teal-200 transition-colors"
            >
              <RefreshCw size={13} />
            </button>
            {/* Create new item + fill purchase details */}
            {!line.itemId && (
              <button
                onClick={onCreateNew}
                disabled={creating}
                title="Create new item in master and fill purchase details"
                className="mt-5 flex-shrink-0 flex items-center gap-1 px-2.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-colors text-[11px] font-semibold disabled:opacity-50"
              >
                {creating
                  ? <Loader2 size={11} className="animate-spin" />
                  : <Plus size={11} />
                }
                {creating ? '…' : 'New'}
              </button>
            )}
          </div>

          {/* Quick-pick candidates */}
          {!line.itemId && line.candidates.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Suggested matches</p>
              <div className="flex flex-wrap gap-1.5">
                {line.candidates.slice(0, 5).map(c => (
                  <button
                    key={c.id}
                    onClick={() => onUpdate(idx, 'itemId', c.id) || onUpdate(idx, 'displayName', c.name)}
                    className="px-2 py-1 text-xs bg-teal-50 text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
                  >
                    {c.name} <span className="text-[10px] text-teal-400">{(c.score * 100).toFixed(0)}%</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fields grid */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Qty', field: sourceItem.orderedQuantity, key: 'orderedQuantity', step: '1' },
              { label: 'Free Qty', field: sourceItem.freeQuantity, key: 'freeQuantity', step: '1' },
              { label: 'Rate (₹)', field: sourceItem.purchaseRate, key: 'purchaseRate', step: '0.01' },
              { label: 'MRP (₹)', field: sourceItem.mrp, key: 'mrp', step: '0.01' },
              { label: 'Disc %', field: sourceItem.discountPercent, key: 'discountPercent', step: '0.01' },
              { label: 'GST %', field: sourceItem.gstPercent, key: 'gstPercent', step: '0.01' },
              { label: 'CGST %', field: sourceItem.cgstPercent, key: 'cgstPercent', step: '0.01' },
              { label: 'SGST %', field: sourceItem.sgstPercent, key: 'sgstPercent', step: '0.01' },
              { label: 'IGST %', field: sourceItem.igstPercent, key: 'igstPercent', step: '0.01' },
            ].map(({ label, field, key, step }) => (
              <div key={key}>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5 flex items-center gap-1">
                  {label} <ConfBadge c={field.confidence} />
                </label>
                <input
                  type="number"
                  step={step}
                  min="0"
                  value={(line as Record<string, unknown>)[key] as number}
                  onChange={e => onUpdate(idx, key as keyof LineItemState, parseFloat(e.target.value) || 0 as unknown as LineItemState[keyof LineItemState])}
                  className={`w-full px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400 ${
                    field.confidence === 'High' ? 'border-emerald-200 bg-emerald-50/30'
                    : field.confidence === 'Review' ? 'border-amber-200 bg-amber-50/30'
                    : 'border-red-100 bg-red-50/30'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Batch / Expiry */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5 flex items-center gap-1">
                Batch <ConfBadge c={sourceItem.batchNumber.confidence} />
              </label>
              <input value={line.batchNumber ?? ''} onChange={e => onUpdate(idx, 'batchNumber', e.target.value || null)}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5 flex items-center gap-1">
                Expiry <ConfBadge c={sourceItem.expiryDate.confidence} />
              </label>
              <input type="date" value={line.expiryDate ?? ''} onChange={e => onUpdate(idx, 'expiryDate', e.target.value || null)}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface LineItemStateWithIndex extends LineItemState {
  _idx?: number;
}
