'use client';

import { X, Building2 } from 'lucide-react';
import { PatientJourneyRowDto } from '@/lib/api/ip-management.api';
import { PreOpTab } from './PreOpTab';
import { StatusBadge } from '@/components/counsellors-desk/StatusBadge';

interface PreOpChecklistModalProps {
  journey: PatientJourneyRowDto;
  onClose: () => void;
  /** Called after a successful admit. Receives the synthesised updated row. */
  onAdmitSuccess: (updated: PatientJourneyRowDto) => void;
  branchId?: string;
}

export function PreOpChecklistModal({
  journey,
  onClose,
  onAdmitSuccess,
  branchId,
}: PreOpChecklistModalProps) {
  function handleAdmitSuccess() {
    // approvePreOpClearance transitioned the journey to Admitted.
    // We synthesise the updated row so the ward page list refreshes immediately.
    onAdmitSuccess({ ...journey, clinicalState: 'Admitted' });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Pre-Op Clearance Checklist
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {journey.patientName ?? '—'}
                {journey.uhid ? ` · MR: ${journey.uhid}` : ''}
                {journey.procedureName ? ` · ${journey.procedureName}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={journey.clinicalState} size="sm" />
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Scrollable body ──────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 p-4">
          <PreOpTab
            journeyId={journey.id}
            clinicalState={journey.clinicalState}
            branchId={branchId}
            onAdmitSuccess={handleAdmitSuccess}
          />
        </div>
      </div>
    </div>
  );
}
