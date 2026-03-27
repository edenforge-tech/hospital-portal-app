'use client';

/**
 * AttenderPanel
 * Collapsible section inside the session form / session page.
 * Captures attender/family member information when a patient brings someone or
 * when only the attender comes (patient absent).
 */

import React, { useState } from 'react';
import { Users, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

export interface AttenderInfo {
  patientPresent: boolean;
  attenderName?: string;
  attenderPhone?: string;
  attenderRelation?: string;
  attenderIsDecisionMaker: boolean;
  attenderNotes?: string;
}

interface AttenderPanelProps {
  value: AttenderInfo;
  onChange: (info: AttenderInfo) => void;
  readOnly?: boolean;
}

const RELATIONSHIP_OPTIONS = [
  'Spouse', 'Parent', 'Child', 'Sibling', 'Guardian',
  'Grandparent', 'Relative', 'Friend', 'Caregiver', 'Other',
];

export function AttenderPanel({ value, onChange, readOnly = false }: AttenderPanelProps) {
  const [open, setOpen] = useState(!value.patientPresent || !!value.attenderName);

  const update = (partial: Partial<AttenderInfo>) => {
    onChange({ ...value, ...partial });
  };

  const hasAttender = !value.patientPresent || !!value.attenderName;

  return (
    <div className="border border-purple-200 rounded-lg bg-purple-50/40">
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-600" />
          <span className="font-medium text-sm text-purple-800">
            Attender / Family Member
          </span>
          {hasAttender && (
            <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">
              {value.patientPresent ? value.attenderName : 'Attender only'}
            </span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-purple-500" /> : <ChevronDown className="w-4 h-4 text-purple-500" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-purple-100">
          {/* Patient Present toggle */}
          <div className="flex items-center gap-3 pt-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={value.patientPresent}
                disabled={readOnly}
                onChange={e => update({ patientPresent: e.target.checked })}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Patient is physically present</span>
            </label>
          </div>

          {!value.patientPresent && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-800">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                Patient not present — this session will be marked as <strong>Attender Counseling</strong>.
                Session will still be linked to the patient's file.
              </span>
            </div>
          )}

          {/* Attender fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Attender Name {!value.patientPresent && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={value.attenderName ?? ''}
                disabled={readOnly}
                onChange={e => update({ attenderName: e.target.value })}
                placeholder="Full name"
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-50"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number</label>
              <input
                type="tel"
                value={value.attenderPhone ?? ''}
                disabled={readOnly}
                onChange={e => update({ attenderPhone: e.target.value })}
                placeholder="+91 XXXXX XXXXX"
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-50"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Relationship to Patient</label>
              <select
                value={value.attenderRelation ?? ''}
                disabled={readOnly}
                onChange={e => update({ attenderRelation: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-50"
              >
                <option value="">Select relationship</option>
                {RELATIONSHIP_OPTIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2 sm:col-span-1 flex items-center">
              <label className="flex items-center gap-2 cursor-pointer select-none mt-4">
                <input
                  type="checkbox"
                  checked={value.attenderIsDecisionMaker}
                  disabled={readOnly}
                  onChange={e => update({ attenderIsDecisionMaker: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">
                  Primary decision-maker
                  <span className="block text-xs text-gray-500">(Minor / Elderly patient)</span>
                </span>
              </label>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Attender Notes</label>
              <textarea
                value={value.attenderNotes ?? ''}
                disabled={readOnly}
                onChange={e => update({ attenderNotes: e.target.value })}
                placeholder="E.g. Spouse present, discussed financial concerns, son is the decision-maker…"
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-50 resize-none"
              />
            </div>
          </div>

          {value.attenderIsDecisionMaker && (
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-800">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                Guardian/Decision-maker consent is required.
                The consent form will indicate <strong>{value.attenderName || 'guardian'}</strong> as the signing party.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
