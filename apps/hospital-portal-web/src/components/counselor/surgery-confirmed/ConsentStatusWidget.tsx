'use client';

/**
 * ConsentStatusWidget
 * Read-only panel showing the 4 consent forms status for a patient.
 * API: GET /api/patient-consents/patient/{patientId}
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getApi } from '@/lib/api';
import { CheckCircle2, XCircle, Clock, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConsentRecord {
  id: string;
  consentStatus: string; // Draft | Signed | Revoked | Expired
  isPatientSigned: boolean;
  isWitnessSigned: boolean;
  isGuardianSigned: boolean;
  patientSignedAt?: string;
  createdAt: string;
  templateName?: string;
  consentCategory?: string;
}

interface ConsentListResponse {
  items?: ConsentRecord[];
  data?: ConsentRecord[];
  total?: number;
}

interface ConsentStatusWidgetProps {
  patientId: string;
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  Signed:  { label: 'Signed',   cls: 'text-green-700 bg-green-50 border-green-200',   icon: CheckCircle2 },
  Draft:   { label: 'Pending',  cls: 'text-amber-700 bg-amber-50 border-amber-200',   icon: Clock },
  Revoked: { label: 'Revoked',  cls: 'text-red-700 bg-red-50 border-red-200',         icon: XCircle },
  Expired: { label: 'Expired',  cls: 'text-gray-600 bg-gray-50 border-gray-200',      icon: XCircle },
};

function statusCfg(status: string) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG['Draft'];
}

export function ConsentStatusWidget({ patientId }: ConsentStatusWidgetProps) {
  const [expanded, setExpanded] = useState(true);

  const { data, isLoading, isError } = useQuery<ConsentRecord[]>({
    queryKey: ['patient-consents', patientId],
    enabled: !!patientId,
    staleTime: 60_000,
    queryFn: async () => {
      const api = getApi();
      try {
        const res = await api.get<ConsentListResponse | ConsentRecord[]>(
          `/patient-consents/patient/${patientId}`
        );
        const d = res.data as any;
        return Array.isArray(d) ? d : d?.items ?? d?.data ?? [];
      } catch {
        return [];
      }
    },
  });

  const consents = data ?? [];
  const allSigned = consents.length > 0 && consents.every(c => c.consentStatus === 'Signed' || c.isPatientSigned);
  const pendingCount = consents.filter(c => c.consentStatus !== 'Signed' && !c.isPatientSigned).length;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-semibold text-gray-800">Consent Forms</span>
          {isLoading && (
            <span className="text-xs text-gray-400 ml-1">Loading…</span>
          )}
          {!isLoading && consents.length > 0 && (
            allSigned ? (
              <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                All signed ✓
              </span>
            ) : (
              <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                {pendingCount} pending
              </span>
            )
          )}
          {!isLoading && consents.length === 0 && !isError && (
            <span className="text-xs text-gray-400">No consents on file</span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-gray-100 bg-white divide-y divide-gray-50">
          {isLoading && (
            <div className="px-4 py-3 space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && isError && (
            <div className="px-4 py-3 text-xs text-red-500">Failed to load consent records.</div>
          )}

          {!isLoading && !isError && consents.length === 0 && (
            <div className="px-4 py-4 text-center">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No consent forms found for this patient.</p>
              <p className="text-xs text-gray-400 mt-1">Consents are managed in the Consents module.</p>
            </div>
          )}

          {!isLoading && !isError && consents.map(c => {
            const cfg = statusCfg(c.isPatientSigned ? 'Signed' : c.consentStatus);
            const Icon = cfg.icon;
            const signedAt = c.patientSignedAt
              ? new Date(c.patientSignedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : null;

            return (
              <div key={c.id} className="px-4 py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className={cn('w-4 h-4 flex-shrink-0', c.isPatientSigned ? 'text-green-600' : 'text-amber-500')} />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800 truncate">
                      {c.templateName ?? c.consentCategory ?? 'Consent Form'}
                    </p>
                    {signedAt && (
                      <p className="text-[11px] text-gray-400">Signed {signedAt}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Witness / Guardian badges */}
                  {c.isWitnessSigned && (
                    <span className="text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5">
                      Witness ✓
                    </span>
                  )}
                  {c.isGuardianSigned && (
                    <span className="text-[10px] font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded px-1.5 py-0.5">
                      Guardian ✓
                    </span>
                  )}
                  <span className={cn('text-xs font-medium border rounded-full px-2 py-0.5', cfg.cls)}>
                    {cfg.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
