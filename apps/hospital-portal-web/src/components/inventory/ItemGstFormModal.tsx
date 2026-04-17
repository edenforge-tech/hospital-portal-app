'use client';

import React, { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';
import { ItemDto } from '@/lib/api/inventory-service.api';

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface GrnLineItem {
  itemId: string;
  itemName: string;
  hsnCode?: string;
  unit: string;
  orderedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  freeQuantity: number;
  batchNumber: string;
  expiryDate: string;
  barcode: string;
  purchaseRate: number;
  mrp: number;
  discountPercent: number;
  gstPercent: number;
  cgstPercent: number;
  sgstPercent: number;
  igstPercent: number;
  sellingPrice: number;
  packing: number;
  unitsPerPack: number;
  mrpOnPack: number;
  transferMrp: number;
  mrpPerUnit: number;
  isAssetItem: boolean;
  taxOnFree: boolean;
  isReplacement: boolean;
  itemRemarks: string;
  roundingAmount: number;
}

export interface ItemGstFormModalProps {
  item: ItemDto;
  initial?: Partial<GrnLineItem>;
  /** Reference data from last purchase  -  shown as info chips */
  lastMrp?: number;
  lastPurchasePrice?: number;
  lastPurchaseCost?: number;
  lastPurchaseFree?: number;
  isEditing?: boolean;
  onSave: (line: GrnLineItem) => void;
  onClose: () => void;
}

// â”€â”€â”€ Helpers + sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function parseGst(gstRate?: string): number {
  if (!gstRate) return 0;
  const n = parseFloat(gstRate);
  return isNaN(n) ? 0 : n;
}

const GST_SLABS = ['0', '5', '12', '18', '28'];

const inputCls = (readOnly = false, accent = false) =>
  `w-full px-3 py-2 text-sm border rounded-xl transition-colors ${
    readOnly
      ? accent
        ? 'bg-blue-50 text-blue-800 border-blue-200 font-semibold cursor-default'
        : 'bg-gray-50 text-gray-600 border-gray-200 cursor-default'
      : 'bg-white border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400'
  }`;

const lblCls = 'block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1';
const secCls = 'text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-2.5 mt-5 first:mt-0';

function Lbl({ s }: { s: string }) {
  return <label className={lblCls}>{s}</label>;
}

function SecHead({ s }: { s: string }) {
  return <p className={secCls}>{s}</p>;
}

function Inp({
  value, onChange, type = 'text', placeholder = '', readOnly = false, accent = false,
}: {
  value: string | number;
  onChange?: (v: string) => void;
  type?: string; placeholder?: string; readOnly?: boolean; accent?: boolean;
}) {
  // For numeric editable fields, keep a local string so backspace / clearing works properly.
  // We only sync DOWN from `value` when the field is not focused.
  const [localVal, setLocalVal] = React.useState(String(value));
  const focused = React.useRef(false);

  // When the external value changes (e.g. slab auto-fill) update local only if not focused
  React.useEffect(() => {
    if (!focused.current) setLocalVal(String(value));
  }, [value]);

  if (readOnly || type !== 'number') {
    return (
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={e => onChange?.(e.target.value)}
        className={inputCls(readOnly, accent)}
      />
    );
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={localVal}
      placeholder={placeholder}
      onFocus={() => {
        focused.current = true;
        // Select all on focus so typing immediately replaces the 0
        if (localVal === '0') setLocalVal('');
      }}
      onBlur={() => {
        focused.current = false;
        const num = parseFloat(localVal);
        const normalised = isNaN(num) ? '0' : String(num);
        setLocalVal(normalised);
        onChange?.(isNaN(num) ? '0' : String(num));
      }}
      onChange={e => {
        const v = e.target.value;
        // Allow: digits, one decimal point, leading minus (for negatives)
        if (/^-?\d*\.?\d*$/.test(v) || v === '' || v === '-') {
          setLocalVal(v);
          const num = parseFloat(v);
          if (!isNaN(num)) onChange?.(String(num));
        }
      }}
      className={inputCls(false, accent)}
    />
  );
}

function Sel({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
    >
      {children}
    </select>
  );
}

/** Coloured reference chip: "Last Purchase Price : 105" */
function RefChip({ label, value, color = 'amber' }: { label: string; value: number; color?: 'amber' | 'orange' | 'rose' | 'teal' }) {
  const cls: Record<string, string> = {
    amber:  'bg-amber-50  text-amber-700  border-amber-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    rose:   'bg-rose-50   text-rose-700   border-rose-200',
    teal:   'bg-teal-50   text-teal-700   border-teal-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border ${cls[color]}`}>
      <Info size={11} className="flex-shrink-0" />
      {label} : <span className="font-bold">₹{value.toFixed(2)}</span>
    </span>
  );
}

/** GST Split display badge  -  "CGST 2.50%" header + value box below */
function TaxBadge({ label, pct }: { label: string; pct: number }) {
  return (
    <div>
      <p className={`${lblCls} text-orange-600`}>{label} {pct.toFixed(2)}%</p>
      <input
        readOnly
        value={pct.toFixed(4)}
        className="w-full px-3 py-2 text-sm border border-orange-100 bg-orange-50/60 rounded-xl text-orange-700 font-semibold cursor-default"
      />
    </div>
  );
}

function Chk({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-3.5 h-3.5 rounded accent-blue-600"
      />
      <span className="text-xs text-gray-600 font-medium">{label}</span>
    </label>
  );
}

// â”€â”€â”€ Main modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function ItemGstFormModal({
  item, initial, isEditing = false, lastMrp, lastPurchasePrice, lastPurchaseCost, lastPurchaseFree, onSave, onClose,
}: ItemGstFormModalProps) {
  const defaultGst = parseGst(item.defaultGstRate);
  const halfGst    = defaultGst / 2;

  const [form, setForm] = useState<GrnLineItem>({
    itemId:           item.id,
    itemName:         item.itemName,
    hsnCode:          item.hsnCode ?? '',
    unit:             item.unit,
    orderedQuantity:  1,
    acceptedQuantity: 1,
    rejectedQuantity: 0,
    freeQuantity:     0,
    batchNumber:      '',
    expiryDate:       '',
    barcode:          '',
    purchaseRate:     0,
    mrp:              0,
    discountPercent:  0,
    gstPercent:       defaultGst,
    cgstPercent:      halfGst,
    sgstPercent:      halfGst,
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
    itemRemarks:      '',
    roundingAmount:   0,
    ...initial,
  });

  const [deductDiscount,  setDeductDiscount]  = useState(true);
  const [taxInclusive,    setTaxInclusive]    = useState(false);
  const [taxOnFreeCalc,   setTaxOnFreeCalc]   = useState(false);
  const [sellingGst,      setSellingGst]      = useState(String(defaultGst));
  const [purchaseTaxSlab, setPurchaseTaxSlab] = useState(String(defaultGst));
  const [igstSlab,        setIgstSlab]        = useState('0');
  const [saved,           setSaved]           = useState(false);

  // Rounding sign toggle — keeps the sign separate from the abs value input
  const [roundingSign, setRoundingSign] = useState<'+' | '-'>(() =>
    (initial?.roundingAmount !== undefined && initial.roundingAmount < 0) ? '-' : '+'
  );
  const handleRoundingSignToggle = (sign: '+' | '-') => {
    setRoundingSign(sign);
    const abs = Math.abs(form.roundingAmount ?? 0);
    setForm(f => ({ ...f, roundingAmount: sign === '-' ? -abs : abs }));
  };
  const handleRoundingAbsChange = (v: string) => {
    const abs = parseFloat(v) || 0;
    setForm(f => ({ ...f, roundingAmount: roundingSign === '-' ? -abs : abs }));
  };

  const set    = <K extends keyof GrnLineItem>(key: K, val: GrnLineItem[K]) => setForm(f => ({ ...f, [key]: val }));
  const setNum = (key: keyof GrnLineItem) => (v: string) => set(key, (parseFloat(v) || 0) as GrnLineItem[typeof key]);

  // Purchase tax slab -> auto-split CGST/SGST
  const handlePurchaseTaxChange = (slab: string) => {
    setPurchaseTaxSlab(slab);
    const pct = parseFloat(slab) || 0;
    setForm(f => ({ ...f, gstPercent: pct, cgstPercent: pct / 2, sgstPercent: pct / 2 }));
  };

  // IGST slab -> drives igstPercent
  const handleIgstSlabChange = (slab: string) => {
    setIgstSlab(slab);
    const pct = parseFloat(slab) || 0;
    setForm(f => ({ ...f, igstPercent: pct }));
  };

  // MRP per unit auto-calc when pack data changes
  useEffect(() => {
    if (form.mrpOnPack > 0 && form.unitsPerPack > 0) {
      setForm(f => ({ ...f, mrpPerUnit: parseFloat((form.mrpOnPack / form.unitsPerPack).toFixed(4)) }));
    }
  }, [form.mrpOnPack, form.unitsPerPack]);

  // Tax Inclusive -> auto selling price
  useEffect(() => {
    if (!taxInclusive) return;
    const gst = parseFloat(sellingGst) || 0;
    if (form.mrp > 0 && gst > 0) {
      const sp = form.mrp / (1 + gst / 100);
      setForm(f => ({ ...f, sellingPrice: parseFloat(sp.toFixed(2)) }));
    }
  }, [taxInclusive, form.mrp, sellingGst]);

  // â”€â”€ Derived purchase math â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const purchaseAmount  = form.acceptedQuantity * form.purchaseRate;
  const discountAmount  = purchaseAmount * form.discountPercent / 100;
  const taxableAmt      = deductDiscount ? purchaseAmount - discountAmount : purchaseAmount;
  const cgstAmt         = taxableAmt * form.cgstPercent / 100;
  const sgstAmt         = taxableAmt * form.sgstPercent / 100;
  const igstAmt         = taxableAmt * form.igstPercent / 100;
  const totalTax        = cgstAmt + sgstAmt + igstAmt;
  const purchaseCost    = (purchaseAmount - discountAmount) + totalTax;
  const totalPayable    = purchaseCost + (form.roundingAmount ?? 0);

  // â”€â”€ Tax on free items breakdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const freeBase        = form.freeQuantity * form.purchaseRate;
  const freeCgstAmt     = taxOnFreeCalc ? freeBase * form.cgstPercent / 100 : 0;
  const freeSgstAmt     = taxOnFreeCalc ? freeBase * form.sgstPercent / 100 : 0;
  const freeIgstAmt     = taxOnFreeCalc ? freeBase * form.igstPercent / 100 : 0;
  const freeTotalTax    = freeCgstAmt + freeSgstAmt + freeIgstAmt;

  // Selling tax split
  const sellingGstPct   = parseFloat(sellingGst) || 0;
  const sellingCgst     = sellingGstPct / 2;
  const sellingSgst     = sellingGstPct / 2;

  const handleSubmit = () => {
    setSaved(true);
    // persist taxOnFree into the line item  
    setTimeout(() => { onSave({ ...form, taxOnFree: taxOnFreeCalc }); }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative z-10 w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '94vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* â”€â”€ Modal header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">{item.itemName}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {[item.unit, item.hsnCode ? `HSN: ${item.hsnCode}` : null, item.genericName].filter(Boolean).join(' · ')}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white/70 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* â”€â”€ Success banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {saved && (
          <div className="px-5 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2 flex-shrink-0">
            <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">✔</span>
            <span className="text-xs font-semibold text-emerald-700">{isEditing ? 'Item updated!' : 'Item added to GRN!'}</span>
          </div>
        )}

        {/* â”€â”€ Body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          <div className="grid grid-cols-2 gap-6">

            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â• LEFT PANEL  -  Quantities + Purchase â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
            <div>
              {/* QUANTITIES */}
              <SecHead s="Quantities" />

              {/* Asset Item radio */}
              <div className="mb-3">
                <Lbl s="Asset Item" />
                <div className="flex gap-6 mt-1">
                  {(['Yes', 'No'] as const).map(opt => (
                    <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="assetItem"
                        value={opt}
                        checked={form.isAssetItem === (opt === 'Yes')}
                        onChange={() => set('isAssetItem', opt === 'Yes')}
                        className="accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Lbl s="Batch No" />
                  <Inp value={form.batchNumber} onChange={v => set('batchNumber', v)} placeholder="Batch #" />
                </div>
                <div>
                  <Lbl s="Expiry Date" />
                  <Inp type="date" value={form.expiryDate} onChange={v => set('expiryDate', v)} />
                </div>
                <div>
                  <Lbl s="Packing" />
                  <Inp type="number" value={form.packing} onChange={setNum('packing')} placeholder="0" />
                </div>
                <div>
                  <Lbl s="No. of Unit" />
                  <Inp type="number" value={form.unitsPerPack} onChange={setNum('unitsPerPack')} placeholder="0" />
                </div>
                <div>
                  <Lbl s="Received Qty" />
                  <Inp type="number" value={form.orderedQuantity} onChange={setNum('orderedQuantity')} />
                </div>
                <div>
                  <Lbl s="Accepted Qty" />
                  <Inp type="number" value={form.acceptedQuantity} onChange={setNum('acceptedQuantity')} />
                </div>

                {/* Free Qty | Purchase Amount (auto) | Item Price */}
                <div>
                  <Lbl s="Free" />
                  <Inp type="number" value={form.freeQuantity} onChange={setNum('freeQuantity')} placeholder="0" />
                </div>
                <div>
                  <Lbl s="Subtotal (Qty × Rate)" />
                  <Inp value={purchaseAmount.toFixed(2)} readOnly accent />
                </div>
              </div>

              {/* Purchase Rate  -  full width with last purchase chips */}
              <div className="mt-3">
                <div className="flex items-baseline gap-2 mb-1">
                  <label className={lblCls}>Purchase Rate</label>
                  <span className="text-[10px] text-gray-400 normal-case tracking-normal">per unit — from vendor invoice</span>
                </div>
                <Inp type="number" value={form.purchaseRate} onChange={setNum('purchaseRate')} />
                {(lastPurchasePrice !== undefined || lastPurchaseFree !== undefined) && (
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {lastPurchasePrice !== undefined && <RefChip label="Last Purchase Price" value={lastPurchasePrice} color="orange" />}
                    {lastPurchaseFree !== undefined && <RefChip label="Last Purchase Free" value={lastPurchaseFree} color="teal" />}
                  </div>
                )}
              </div>

              {/* PURCHASE TAX bordered box */}
              <SecHead s="Purchase Tax" />
              <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/40">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Lbl s="Purchase Tax" />
                    <Sel value={purchaseTaxSlab} onChange={handlePurchaseTaxChange}>
                      {GST_SLABS.map(s => <option key={s} value={s}>GST {s}%</option>)}
                    </Sel>
                  </div>
                  <TaxBadge label="CGST" pct={form.cgstPercent} />
                  <TaxBadge label="SGST" pct={form.sgstPercent} />
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div>
                    <Lbl s="IGST" />
                    <Sel value={igstSlab} onChange={handleIgstSlabChange}>
                      {GST_SLABS.map(s => <option key={s} value={s}>GST {s}%</option>)}
                    </Sel>
                  </div>
                  <TaxBadge label="IGST" pct={form.igstPercent} />
                  <div />
                </div>
              </div>

              {/* Discount row */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <Lbl s="Purchase Discount (%)" />
                  <Inp type="number" value={form.discountPercent} onChange={setNum('discountPercent')} placeholder="0.00" />
                </div>
                <div>
                  <Lbl s="Discount Amount" />
                  <Inp value={discountAmount.toFixed(2)} readOnly />
                </div>
              </div>
              <div className="mt-2">
                <Chk label="GST on net amount (after discount)" checked={deductDiscount} onChange={setDeductDiscount} />
              </div>

              {/* Total Payable — includes optional rounding adjustment */}
              <div className="mt-3 border border-blue-100 rounded-xl p-3 bg-blue-50/20">
                <div className="grid grid-cols-2 gap-3 mb-2.5">
                  <div>
                    <Lbl s="Subtotal (before tax)" />
                    <Inp value={(purchaseAmount - discountAmount).toFixed(2)} readOnly />
                  </div>
                  <div>
                    <label className={lblCls + ' mb-1.5'}>Rounding</label>
                    <div className="flex gap-1.5">
                      {(['+', '-'] as const).map(sign => (
                        <button
                          key={sign}
                          type="button"
                          onClick={() => handleRoundingSignToggle(sign)}
                          className={`w-8 h-[38px] rounded-lg text-sm font-bold border transition-colors flex-shrink-0 ${
                            roundingSign === sign
                              ? sign === '+'
                                ? 'bg-emerald-500 text-white border-emerald-500'
                                : 'bg-rose-500 text-white border-rose-500'
                              : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          {sign}
                        </button>
                      ))}
                      <Inp type="number" value={Math.abs(form.roundingAmount ?? 0)}
                        onChange={handleRoundingAbsChange} placeholder="0.00" />
                    </div>
                  </div>
                </div>
                <div className="border-t border-blue-100 pt-2 flex items-end justify-between">
                  <div>
                    <p className="block text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-1">Total Payable</p>
                    <p className="text-[10px] text-blue-400">Subtotal + Tax + Rounding</p>
                  </div>
                  <p className="text-xl font-extrabold text-blue-800 leading-none">₹{totalPayable.toFixed(2)}</p>
                </div>
                {lastPurchaseCost !== undefined && (
                  <div className="mt-1.5">
                    <RefChip label="Last Payable" value={lastPurchaseCost} color="rose" />
                  </div>
                )}
              </div>

              {/* PACK PRICING */}
              <div className="mt-5 mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">Pack Pricing</p>
                  <span className="text-[10px] text-violet-500 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full font-medium">For strips / boxes</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">e.g. Tablet strip of 10: MRP on Pack = strip price, Units/Pack = 10 → MRP per Unit auto-fills.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Lbl s="Transfer MRP" />
                  <Inp type="number" value={form.transferMrp} onChange={setNum('transferMrp')} placeholder="0.00" />
                </div>
                <div>
                  <Lbl s="MRP on Pack" />
                  <Inp type="number" value={form.mrpOnPack} onChange={setNum('mrpOnPack')} placeholder="0.00" />
                </div>
                <div>
                  <Lbl s="MRP per Unit" />
                  <Inp type="number" value={form.mrpPerUnit ?? 0} onChange={setNum('mrpPerUnit')} placeholder="0.00" />
                </div>
              </div>
            </div>

            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â• RIGHT PANEL  -  Selling + Tax + Totals â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
            <div>
              {/* Last MRP chip  -  prominent at top */}
              {lastMrp !== undefined && (
                <div className="mb-3">
                  <RefChip label="Last MRP" value={lastMrp} color="amber" />
                </div>
              )}

              {/* MRP + Barcode */}
              <SecHead s="Retail Pricing" />
              <p className="text-[10px] text-gray-400 -mt-2 mb-2.5">MRP = max price printed on package (regulatory). Selling Price = amount billed to patient.</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Lbl s="MRP (Max. Retail Price)" />
                  <Inp type="number" value={form.mrp} onChange={setNum('mrp')} />
                </div>
                <div>
                  <Lbl s="Barcode" />
                  <Inp value={form.barcode} onChange={v => set('barcode', v)} placeholder="Barcode" />
                </div>
              </div>

              {/* SELLING TAX bordered box */}
              <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/40 mt-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Lbl s="Selling Tax" />
                    <Sel value={sellingGst} onChange={setSellingGst}>
                      {GST_SLABS.map(s => <option key={s} value={s}>GST {s}%</option>)}
                    </Sel>
                  </div>
                  <TaxBadge label="CGST" pct={sellingCgst} />
                  <TaxBadge label="SGST" pct={sellingSgst} />
                </div>
                <div className="mt-3">
                  <Chk label="Tax Inclusive (auto-calc selling price from MRP)" checked={taxInclusive} onChange={setTaxInclusive} />
                  {taxInclusive && (
                    <p className="text-[10px] text-teal-600 mt-1 font-medium">SP = MRP / (1 + GST%/100)</p>
                  )}
                </div>
                <div className="mt-2">
                  <div className="flex items-baseline gap-2 mb-1">
                    <label className={lblCls}>Patient Selling Price</label>
                    <span className="text-[10px] text-gray-400 normal-case tracking-normal">must be ≤ MRP</span>
                  </div>
                  <Inp
                    type="number"
                    value={form.sellingPrice}
                    onChange={taxInclusive ? () => {} : setNum('sellingPrice')}
                    readOnly={taxInclusive}
                    accent={taxInclusive}
                  />
                </div>
              </div>

              {/* TAX ON FREE bordered box */}
              <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/40 mt-4">
                <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-2.5">Tax on Free</p>
                <Chk label="Calculate Tax On Free Items" checked={taxOnFreeCalc} onChange={setTaxOnFreeCalc} />
                {taxOnFreeCalc && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {[
                      { label: 'Total Tax', value: freeTotalTax },
                      { label: 'CGST',      value: freeCgstAmt  },
                      { label: 'SGST',      value: freeSgstAmt  },
                      { label: 'IGST',      value: freeIgstAmt  },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <Lbl s={label} />
                        <Inp value={value.toFixed(2)} readOnly />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* OPTIONS */}
              <div className="mt-4">
                <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-2">Options</p>
                <Chk label="Replacement" checked={form.isReplacement} onChange={v => set('isReplacement', v)} />
              </div>

              {/* PURCHASE SUMMARY */}
              <div className="mt-4 bg-blue-50/70 border border-blue-100 rounded-xl p-4">
                <p className="text-[10px] font-extrabold text-blue-700 uppercase tracking-widest mb-3">Purchase Summary</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Subtotal',     value: taxableAmt,   sub: 'Qty × Rate − Disc' },
                    { label: 'CGST',         value: cgstAmt,      sub: `${form.cgstPercent}%` },
                    { label: 'SGST',         value: sgstAmt,      sub: `${form.sgstPercent}%` },
                    { label: 'IGST',         value: igstAmt,      sub: `${form.igstPercent}%` },
                    { label: 'Total Tax',    value: totalTax,     sub: 'CGST+SGST+IGST' },
                    { label: 'Before Round', value: purchaseCost, sub: '' },
                  ].map(({ label, value, sub }) => (
                    <div key={label} className="text-center">
                      <p className="text-[10px] text-blue-500 font-semibold uppercase leading-tight">{label}</p>
                      {sub && <p className="text-[9px] text-blue-300 leading-none mb-0.5">{sub}</p>}
                      <p className="text-sm font-bold text-blue-800 mt-0.5">₹{value.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                {(form.roundingAmount ?? 0) !== 0 && (
                  <div className="mt-2 pt-2 border-t border-blue-100 flex items-center justify-between">
                    <span className="text-[10px] text-blue-400 uppercase font-semibold tracking-wide">Rounding</span>
                    <span className="text-sm font-bold text-blue-600">
                      {(form.roundingAmount ?? 0) > 0 ? '+' : ''}₹{(form.roundingAmount ?? 0).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="mt-2 pt-2 border-t border-blue-200 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-blue-900 uppercase tracking-wide">Total Payable</span>
                  <span className="text-lg font-extrabold text-blue-900">₹{totalPayable.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Item Remarks  -  full width */}
          <div className="mt-5">
            <label className={lblCls}>Item Remarks</label>
            <textarea
              value={form.itemRemarks}
              onChange={e => set('itemRemarks', e.target.value)}
              rows={2}
              placeholder="Optional remarks..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
            />
          </div>
        </div>

        {/* â”€â”€ Footer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between flex-shrink-0 bg-gray-50/50">
          <p className="text-xs text-gray-400">
            Qty {form.acceptedQuantity} · Net <span className="font-semibold text-gray-700">₹{totalPayable.toFixed(2)}</span>
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saved}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              {saved ? (isEditing ? 'Updated ✔' : 'Added ✔') : (isEditing ? 'Update GRN' : 'Add to GRN')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
