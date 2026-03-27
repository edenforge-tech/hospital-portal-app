'use client';

/**
 * InsuranceClearanceStatus
 * Inline widget for Surgery Confirmed → Checklist tab.
 * Shows current pre-auth status for Insurance/CoPay/CGHS/ESH/SGHS/Railway patient types.
 * Uses existing GET /api/insurance/pre-auths?sessionId=... endpoint.
 */

import React, { useState } from 'react';
import { Shield, CheckCircle2, Clock, AlertCircle, XCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getApi } from '@/lib/api';
import { cn } from '@/lib/utils';

// Patient types that require insurance pre-auth
const PREAUTH_REQUIRED_TYPES = ['Insurance', 'CoPay', 'CGHS', 'ESH', 'SGHS', 'Railway'];

interface PreAuthRecord {
  id: string;
  status: string;
  insuranceProvider?: string;
  policyNumber?: string;
  requestedAmount?: number;
  approvedAmount?: number;
  submittedDate?: string;
  approvedDate?: string;
  rejectionReason?: string;
}

interface InsuranceClearanceStatusProps {
  sessionId: string;
  patientType?: string;
  compact?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode; blocking: boolean }> = {
  Draft:         { label: 'Not Submitted',  color: 'text-gray-600',  bg: 'bg-gray-100',   icon: <Clock className="w-3.5 h-3.5" />,         blocking: true },
  Applied:       { label: 'Applied',        color: 'text-blue-700',  bg: 'bg-blue-100',   icon: <Clock className="w-3.5 h-3.5" />,         blocking: true },
  submitted:     { label: 'Submitted',      color: 'text-blue-700',  bg: 'bg-blue-100',   icon: <Clock className="w-3.5 h-3.5" />,         blocking: true },
  UnderReview:   { label: 'Under Review',   color: 'text-amber-700', bg: 'bg-amber-100',  icon: <Clock className="w-3.5 h-3.5 animate-spin" />, blocking: true },
  'under-review':{ label: 'Under Review',   color: 'text-amber-700', bg: 'bg-amber-100',  icon: <Clock className="w-3.5 h-3.5 animate-spin" />, blocking: true },
  PendingDocs:   { label: 'Pending Docs',   color: 'text-orange-700',bg: 'bg-orange-100', icon: <AlertCircle className="w-3.5 h-3.5" />,   blocking: true },
  'additional-info-required': { label: 'Info Required', color: 'text-orange-700', bg: 'bg-orange-100', icon: <AlertCircle className="w-3.5 h-3.5" />, blocking: true },
  Approved:      { label: 'Approved ✓',     color: 'text-green-700', bg: 'bg-green-100',  icon: <CheckCircle2 className="w-3.5 h-3.5" />,  blocking: false },
  approved:      { label: 'Approved ✓',     color: 'text-green-700', bg: 'bg-green-100',  icon: <CheckCircle2 className="w-3.5 h-3.5" />,  blocking: false },
  Rejected:      { label: 'Rejected',       color: 'text-red-700',   bg: 'bg-red-100',    icon: <XCircle className="w-3.5 h-3.5" />,       blocking: true },
  rejected:      { label: 'Rejected',       color: 'text-red-700',   bg: 'bg-red-100',    icon: <XCircle className="w-3.5 h-3.5" />,       blocking: true },
  Expired:       { label: 'Expired',        color: 'text-red-700',   bg: 'bg-red-100',    icon: <XCircle className="w-3.5 h-3.5" />,       blocking: true },
  Cancelled:     { label: 'Cancelled',      color: 'text-gray-600',  bg: 'bg-gray-100',   icon: <XCircle className="w-3.5 h-3.5" />,       blocking: false },
};

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] ?? {
    label: status,
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    icon: <Clock className="w-3.5 h-3.5" />,
    blocking: true,
  };
}

export function InsuranceClearanceStatus({
  sessionId,
  patientType,
  compact = false,
}: InsuranceClearanceStatusProps) {
  const [expanded, setExpanded] = useState(false);

  const requiresPreAuth = patientType && PREAUTH_REQUIRED_TYPES.includes(patientType);

  const { data, isLoading } = useQuery<{ items: PreAuthRecord[] }>({
    queryKey: ['insurance-preauth', sessionId],
    queryFn: async () => {
      const api = getApi();
      const res = await api.get(`/insurance/pre-auths?sessionId=${sessionId}&pageSize=5`);
      return res.data;
    },
    enabled: !!sessionId && !!requiresPreAuth,
    staleTime: 60_000,
  });

  // If patient type doesn't need pre-auth, show success indicator
  if (!requiresPreAuth) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
        <Shield className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-500">Pre-auth not required ({patientType ?? 'Cash'})</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg animate-pulse">
        <Shield className="w-4 h-4 text-gray-300" />
        <span className="text-xs text-gray-400">Checking insurance…</span>
      </div>
    );
  }

  const preAuths = data?.items ?? [];
  const latest = preAuths[0] ?? null;
  const cfg = latest ? getStatusConfig(latest.status) : getStatusConfig('Draft');
  const isBlocking = cfg.blocking;

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium', cfg.bg, cfg.color)}>
        <Shield className="w-3 h-3" />
        <span>Pre-Auth: {cfg.label}</span>
        {isBlocking && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      </div>
    );
  }

  return (
    <div className={cn(
      'border rounded-xl overflow-hidden',
      isBlocking ? 'border-amber-300' : 'border-green-300'
    )}>
      {/* Header row — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors',
          isBlocking ? 'bg-amber-50 hover:bg-amber-100' : 'bg-green-50 hover:bg-green-100'
        )}
      >
        <span className={cn('flex items-center gap-2', isBlocking ? 'text-amber-800' : 'text-green-800')}>
          <Shield className="w-4 h-4" />
          Insurance Pre-Authorization
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-bold', cfg.bg, cfg.color)}>
            {cfg.label}
          </span>
          {isBlocking && (
            <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-bold">
              ⚠ BLOCKING
            </span>
          )}
        </span>
        {expanded
          ? <ChevronUp className="w-4 h-4 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 py-3 bg-white space-y-3">
          {latest ? (
            <>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {latest.insuranceProvider && (
                  <div>
                    <p className="text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Provider</p>
                    <p className="text-gray-800 font-medium">{latest.insuranceProvider}</p>
                  </div>
                )}
                {latest.policyNumber && (
                  <div>
                    <p className="text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Policy No.</p>
                    <p className="text-gray-800 font-medium font-mono">{latest.policyNumber}</p>
                  </div>
                )}
                {latest.requestedAmount && (
                  <div>
                    <p className="text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Requested</p>
                    <p className="text-gray-800 font-medium">₹{latest.requestedAmount.toLocaleString('en-IN')}</p>
                  </div>
                )}
                {latest.approvedAmount && (
                  <div>
                    <p className="text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Approved</p>
                    <p className="text-green-700 font-bold">₹{latest.approvedAmount.toLocaleString('en-IN')}</p>
                  </div>
                )}
              </div>
              {latest.rejectionReason && (
                <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-800">
                    <strong>Rejection reason:</strong> {latest.rejectionReason}
                  </p>
                </div>
              )}
              {isBlocking && latest.status !== 'Approved' && (
                <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800 font-medium">
                    ⚠ All-clear indicator will be blocked until pre-auth is Approved.
                    Go to the Insurance module to update status.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-amber-700 font-medium">
                No pre-authorization found for this patient. This is required for {patientType} patients.
              </p>
              <a
                href={`/counselor?tab=insurance&session=${sessionId}`}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                Initiate pre-auth in Insurance module
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
