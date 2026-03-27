'use client';

/**
 * ProcedureSelector
 * Multi-procedure per-eye selector for the counselor session form.
 *
 * Features
 *  - Category tabs (Cataract, Refractive, Keratoconus, Retina, Glaucoma, Oculoplasty, Squint, Other)
 *  - Procedure cards driven from master data (surgery_types)
 *  - Per-eye chip selector (RE | LE | Both)
 *  - Sub-type selector for Refractive and Keratoconus
 *  - ICL / Laser / KCN info banners (no IOL from catalog needed)
 *  - Selected procedure chips at the bottom
 */

import React, { useState, useMemo } from 'react';
import { X, Plus, Eye, Zap, Info } from 'lucide-react';
import type { RecommendedProcedureItem, ProcedureEye, SurgeryCategory } from '@/lib/api/master-data.api';
import type { FlatVariantDto } from '@/lib/api/service-catalog.api';
import { cn } from '@/lib/utils';
import { sanitizeVariantName } from '@/lib/utils/sanitize-names';

// ============================================================================
// Constants
// ============================================================================

const CATEGORY_TABS: { key: SurgeryCategory | 'All'; label: string }[] = [
  { key: 'All',          label: 'All' },
  { key: 'Cataract',     label: 'Cataract' },
  { key: 'Refractive',   label: 'Refractive' },
  { key: 'Keratoconus',  label: 'Keratoconus' },
  { key: 'Posterior',    label: 'Retina' },
  { key: 'Glaucoma',     label: 'Glaucoma' },
  { key: 'Oculoplasty',  label: 'Oculoplasty' },
  { key: 'Squint',       label: 'Squint' },
  { key: 'Other',        label: 'Other' },
];

const KCN_SUB_TYPES = [
  { value: 'CXL',       label: 'Corneal Cross-Linking (CXL)' },
  { value: 'ICRS',      label: 'Intracorneal Ring Segments (ICRS)' },
  { value: 'DALK',      label: 'Deep Anterior Lamellar Keratoplasty (DALK)' },
  { value: 'PKP',       label: 'Penetrating Keratoplasty (PKP)' },
  { value: 'ICL+CXL',   label: 'ICL + CXL (Combined)' },
  { value: 'Spectacles', label: 'Spectacles / RGP Lens Fit' },
];

const REFRACTIVE_SUB_TYPES = [
  { value: 'LASIK',       label: 'LASIK' },
  { value: 'FemtoLASIK',  label: 'Femto-LASIK' },
  { value: 'SMILE',       label: 'SMILE' },
  { value: 'PRK',         label: 'PRK / LASEK' },
  { value: 'EVONonToric', label: 'EVO ICL (Non-Toric)' },
  { value: 'EVOToric',    label: 'EVO ICL (Toric)' },
  { value: 'PRESBYOND',   label: 'PRESBYOND' },
];

const EYE_LABELS: Record<ProcedureEye, string> = { RE: 'Right Eye', LE: 'Left Eye', Both: 'Both Eyes' };
const EYE_COLORS: Record<ProcedureEye, string> = {
  RE:   'bg-blue-100 text-blue-700 border-blue-300',
  LE:   'bg-purple-100 text-purple-700 border-purple-300',
  Both: 'bg-teal-100 text-teal-700 border-teal-300',
};

// ============================================================================
// Helpers
// ============================================================================

function isLaserProcedure(surgery: FlatVariantDto): boolean {
  const name = surgery.name.toUpperCase();
  return ['LASIK', 'SMILE', 'PRK', 'LASEK', 'FEMTO', 'PRESBYOND'].some(k => name.includes(k));
}

function isIclProcedure(surgery: FlatVariantDto): boolean {
  const name = surgery.name.toUpperCase();
  return name.includes('ICL') && !name.includes('PHACO') && !name.includes('CATARACT');
}

function isKcnProcedure(surgery: FlatVariantDto): boolean {
  return surgery.categoryCode.toUpperCase() === 'KERATOCONUS';
}

function isRefractiveProcedure(surgery: FlatVariantDto): boolean {
  return surgery.categoryCode.toUpperCase() === 'REFRACTIVE';
}

/** Build a display summary for a selected item (used in chips). */
function procedureSummary(item: RecommendedProcedureItem): string {
  const parts: string[] = [item.surgeryName];
  if (item.kcnTreatmentType) parts.push(`(${item.kcnTreatmentType})`);
  if (item.variantSubOption) parts.push(`[${item.variantSubOption}]`);
  return parts.join(' ');
}

// ============================================================================
// Sub-type picker modal (KCN / Refractive)
// ============================================================================

interface SubTypePickerProps {
  surgery: FlatVariantDto;
  eye: ProcedureEye;
  onConfirm: (subType: string) => void;
  onCancel: () => void;
}

function SubTypePicker({ surgery, eye, onConfirm, onCancel }: SubTypePickerProps) {
  const isKcn = isKcnProcedure(surgery);
  const options = isKcn ? KCN_SUB_TYPES : REFRACTIVE_SUB_TYPES;
  const [selected, setSelected] = useState('');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {isKcn ? 'Keratoconus Treatment' : 'Refractive Procedure Type'}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {eye === 'Both' ? 'Both Eyes' : eye === 'RE' ? 'Right Eye' : 'Left Eye'} · {surgery.name}
        </p>

        <div className="space-y-2">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelected(opt.value)}
              className={cn(
                'w-full text-left px-4 py-3 rounded-lg border transition-all text-sm',
                selected === opt.value
                  ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="button"
            disabled={!selected}
            onClick={() => selected && onConfirm(selected)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-blue-700"
          >
            Add Procedure
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Eye picker
// ============================================================================

interface EyePickerProps {
  surgery: FlatVariantDto;
  onSelect: (eye: ProcedureEye) => void;
  alreadyAdded: ProcedureEye[];
}

function EyePicker({ surgery, onSelect, alreadyAdded }: EyePickerProps) {
  const bilateral = surgery.priceType === 'BOTH_EYES';

  return (
    <div className="flex gap-2 mt-2">
      {(['RE', 'LE', 'Both'] as ProcedureEye[]).map(eye => {
        const taken = alreadyAdded.includes(eye);
        // For bilateral-default (LASIK etc.), show Both prominently
        if (bilateral && eye !== 'Both') return null;
        return (
          <button
            key={eye}
            type="button"
            disabled={taken}
            onClick={() => onSelect(eye)}
            className={cn(
              'px-3 py-1.5 text-xs rounded-full border font-medium transition-all',
              taken ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer',
              EYE_COLORS[eye]
            )}
          >
            {eye}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// Procedure Card
// ============================================================================

interface ProcedureCardProps {
  surgery: FlatVariantDto;
  selectedItems: RecommendedProcedureItem[];
  onAdd: (surgery: FlatVariantDto, eye: ProcedureEye, subType?: string, variantSubOption?: string) => void;
}

function ProcedureCard({ surgery, selectedItems, onAdd }: ProcedureCardProps) {
  const [showEyePicker, setShowEyePicker] = useState(false);
  const [pendingEye, setPendingEye] = useState<ProcedureEye | null>(null);
  const [selectedVariantSub, setSelectedVariantSub] = useState<string | null>(null);

  const selectedEyes = selectedItems
    .filter(i => i.surgeryTypeId === surgery.id)
    .map(i => i.eye);

  const needsSubType = isKcnProcedure(surgery) || isRefractiveProcedure(surgery);
  const hasVariantSubOpts = (surgery.subOptions?.length ?? 0) > 0;
  const isLaser = isLaserProcedure(surgery);
  const isIcl = isIclProcedure(surgery);

  const handleEyePick = (eye: ProcedureEye) => {
    if (needsSubType) {
      // KCN/Refractive: show modal sub-type picker
      setPendingEye(eye);
      setShowEyePicker(false);
    } else if (hasVariantSubOpts) {
      // Catalog variant with internal sub-options: show inline pill picker
      setPendingEye(eye);
      setSelectedVariantSub(null);
      setShowEyePicker(false);
    } else {
      onAdd(surgery, eye);
      setShowEyePicker(false);
    }
  };

  return (
    <>
      {pendingEye && needsSubType && (
        <SubTypePicker
          surgery={surgery}
          eye={pendingEye}
          onConfirm={(sub) => { onAdd(surgery, pendingEye!, sub); setPendingEye(null); }}
          onCancel={() => setPendingEye(null)}
        />
      )}

      <div className={cn(
        'relative border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all',
        selectedEyes.length > 0 ? 'border-blue-400 ring-1 ring-blue-200' : 'border-gray-200'
      )}>
        {/* Category badge */}
        <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
          {surgery.categoryName}
        </span>

        <h4 className="font-semibold text-sm text-gray-900 pr-20 leading-snug">{sanitizeVariantName(surgery.name)}</h4>

        {/* Info banner */}
        {isLaser && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
            <Zap className="w-3.5 h-3.5" /> Laser — no IOL required
          </div>
        )}
        {isIcl && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-violet-700 bg-violet-50 px-2 py-1 rounded">
            <Info className="w-3.5 h-3.5" /> ICL — power prescribed by doctor
          </div>
        )}

        {/* Price */}
        {surgery.defaultPrice > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            ₹{surgery.defaultPrice.toLocaleString('en-IN')}
          </p>
        )}

        {/* Inline variant sub-option picker (shown after eye pick for variants with sub-options) */}
        {pendingEye && hasVariantSubOpts && !needsSubType && (
          <div className="mt-3 p-2.5 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-[10px] text-blue-700 font-semibold mb-1.5">
              Select type <span className="text-red-500">*</span> (staff-only)
            </p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {surgery.subOptions!.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedVariantSub(opt)}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
                    selectedVariantSub === opt
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!selectedVariantSub}
                onClick={() => {
                  if (selectedVariantSub) {
                    onAdd(surgery, pendingEye!, undefined, selectedVariantSub);
                    setPendingEye(null);
                    setSelectedVariantSub(null);
                    setShowEyePicker(false);
                  }
                }}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-lg font-medium transition-all',
                  selectedVariantSub
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
              >
                Add Procedure
              </button>
              <button
                type="button"
                onClick={() => { setPendingEye(null); setSelectedVariantSub(null); }}
                className="text-xs px-3 py-1.5 rounded-lg font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Eye selection */}
        {!pendingEye && (showEyePicker ? (
          <EyePicker surgery={surgery} onSelect={handleEyePick} alreadyAdded={selectedEyes} />
        ) : (
          <button
            type="button"
            onClick={() => setShowEyePicker(true)}
            className="mt-3 flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            <Plus className="w-3.5 h-3.5" />
            {selectedEyes.length === 0 ? 'Add Procedure' : 'Add Another Eye'}
          </button>
        ))}

        {/* Already selected eyes */}
        {selectedEyes.length > 0 && (
          <div className="mt-2 flex gap-1.5 flex-wrap">
            {selectedEyes.map(eye => (
              <span key={eye} className={cn('text-xs px-2 py-0.5 rounded-full border', EYE_COLORS[eye])}>
                {eye}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ============================================================================
// Main Component
// ============================================================================

interface ProcedureSelectorProps {
  surgeryTypes: FlatVariantDto[];
  isLoading: boolean;
  value: RecommendedProcedureItem[];
  onChange: (items: RecommendedProcedureItem[]) => void;
}

export default function ProcedureSelector({ surgeryTypes, isLoading, value, onChange }: ProcedureSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<SurgeryCategory | 'All'>('All');

  const filteredTypes = useMemo(() => {
    if (activeCategory === 'All') return surgeryTypes;
    const dataKey = activeCategory === 'Posterior' ? 'Posterior' : activeCategory;
    return surgeryTypes.filter(s => s.categoryCode.toLowerCase() === dataKey.toLowerCase());
  }, [surgeryTypes, activeCategory]);

  const handleAdd = (surgery: FlatVariantDto, eye: ProcedureEye, subType?: string, variantSubOption?: string) => {
    const newItem: RecommendedProcedureItem = {
      eye,
      surgeryTypeId: surgery.id,
      surgeryName: surgery.name,
      surgeryCategory: surgery.categoryCode,
      requiresIol: !isLaserProcedure(surgery) && !isIclProcedure(surgery) && surgery.hasIolOptions,
      iclProcedure: isIclProcedure(surgery),
      laserProcedure: isLaserProcedure(surgery),
      kcnTreatmentType: subType || null,
      variantSubOption: variantSubOption || null,
      iolCatalogId: null,
      iolModelName: null,
      iolType: null,
      packageId: null,
      packageName: null,
      unitPrice: surgery.defaultPrice ?? null,
      notes: null,
    };
    onChange([...value, newItem]);
  };

  const handleRemove = (index: number) => {
    const next = [...value];
    next.splice(index, 1);
    onChange(next);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category Tab Bar */}
      <div className="flex gap-1 flex-wrap">
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveCategory(tab.key)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-full border transition-all',
              activeCategory === tab.key
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Procedure Cards Grid */}
      {filteredTypes.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          No procedures found in this category.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
          {filteredTypes.map(surgery => (
            <ProcedureCard
              key={surgery.id}
              surgery={surgery}
              selectedItems={value}
              onAdd={handleAdd}
            />
          ))}
        </div>
      )}

      {/* Selected Procedures Summary */}
      {value.length > 0 && (
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            Selected Procedures ({value.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {value.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium bg-blue-50 text-blue-800 border-blue-200"
              >
                <Eye className="w-3 h-3" />
                <span>{item.eye} — {procedureSummary(item)}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="ml-0.5 hover:text-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
