'use client';

/**
 * Step4AnaesthesiaType
 * S4-1: Live GA availability from GET /surgery/ga-availability
 * S4-2: GA consent form (POST /patient-consents)
 * S4-3: GA cost annotation (PATCH /otbooking/schedules/{id})
 * S4-4: Auto Anaesthesia dept request (POST /dept-coordination)
 * S4-5: Pre-Op Fitness Clearance check from orders
 * Static fallback: if branchId/surgeryDate unavailable, shows manual GA options
 */

import React, { useState, useCallback } from 'react';
import {
  CheckCircle2, Circle, Activity, AlertTriangle,
  ChevronDown, ChevronUp, Send, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApi } from '@/lib/api';
import { toast } from 'sonner';
import type { WorkflowStepItem } from '@/hooks/use-pre-admission-workflow';

interface Props {
  scheduleId: string;
  patientId?: string;
  patientAge?: number;
  branchId?: string;
  surgeryDate?: string;
  anaesthesiaTypeChoice?: 'GA' | 'Topical' | 'Local';
  items: WorkflowStepItem[];
  onMarkItem: (itemId: string, isComplete: boolean, notes?: string) => void;
  onSendDeptRequest?: (dept: string, message: string) => void;
  isMutating?: boolean;
}

interface GaAvailability {
  available: boolean;
  anaesthesiologistName?: string;
  slots?: string[];
}

const anaesthesiaColors = {
  GA:      'bg-purple-100 text-purple-700',
  Topical: 'bg-teal-100 text-teal-700',
  Local:   'bg-blue-100 text-blue-700',
};

export function Step4AnaesthesiaType({
  scheduleId,
  patientId,
  patientAge,
  branchId,
  surgeryDate,
  anaesthesiaTypeChoice,
  items,
  onMarkItem,
  onSendDeptRequest,
  isMutating,
}: Props) {
  const qc = useQueryClient();
  const [localType, setLocalType] = useState<'GA' | 'Topical' | 'Local' | null>(null);
  const [showGaOptions, setShowGaOptions] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [gaAdditionalCost, setGaAdditionalCost] = useState('');
  const [witnessName, setWitnessName] = useState('');
  const [showConsentForm, setShowConsentForm] = useState(false);
  const [fitnessFailedManual, setFitnessFailedManual] = useState(false);

  const isUnder20 = patientAge != null && patientAge < 20;
  const recommendedType = isUnder20 ? 'GA' : 'Topical';
  // effectiveType: counselor local pick > saved DB choice > system recommendation
  const effectiveType = localType ?? anaesthesiaTypeChoice ?? recommendedType;

  const handleTypeSelect = useCallback((type: 'GA' | 'Topical' | 'Local') => {
    setLocalType(type);
    // Persist via first step item notes so it survives reload
    const firstItem = items[0];
    if (firstItem) {
      onMarkItem(firstItem.id, firstItem.isComplete, `TYPE:${type}`);
    }
  }, [items, onMarkItem]);

  const completedCount = items.filter((i) => i.isComplete).length;
  const blockers = items.filter((i) => i.isBlocking && !i.isComplete);

  // â”€â”€ S4-1: Live GA availability â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { data: gaAvailability, isLoading: gaLoading } = useQuery<GaAvailability>({
    queryKey: ['ga-availability', branchId, surgeryDate],
    enabled: !!(branchId && surgeryDate),
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const api = getApi();
      const res = await api.get('/surgery/ga-availability', { params: { branchId, date: surgeryDate } });
      return res.data;
    },
  });

  // S4-5: Pre-Op Fitness Clearance orders
  const { data: clearanceOrders = [] } = useQuery<Array<{ id: string; testType: string; resultReceivedAt?: string; notes?: string }>>({
    queryKey: ['preop-fitness-clearance', scheduleId],
    enabled: !!scheduleId,
    staleTime: 60_000,
    queryFn: async () => {
      const api = getApi();
      const res = await api.get('/pre-op-test-management/orders', { params: { scheduleId, testType: 'GA' } });
      const data = res.data;
      return Array.isArray(data) ? data : (data?.items ?? []);
    },
  });
  const fitnessDenied = clearanceOrders.some((o) => (o.notes ?? '').toLowerCase().includes('denied') || (o.notes ?? '').toLowerCase().includes('not fit'));

  // â”€â”€ S4-2: GA consent mutation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const consentMutation = useMutation({
    mutationFn: async () => {
      const api = getApi();
      await api.post('/patient-consents', {
        patientId,
        scheduleId,
        consentType: 'ga_anaesthesia',
        consentGiven: true,
        witnessedBy: witnessName || undefined,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patient-consents'] });
      toast.success('GA anaesthesia consent recorded');
      setShowConsentForm(false);
      setWitnessName('');
    },
    onError: () => toast.error('Failed to record consent'),
  });

  // â”€â”€ S4-3: GA cost annotation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const costMutation = useMutation({
    mutationFn: async (cost: number) => {
      const api = getApi();
      await api.patch(`/otbooking/schedules/${scheduleId}`, { gaAdditionalCost: cost });
    },
    onSuccess: () => toast.success('GA cost updated'),
    onError: () => toast.error('Failed to update GA cost'),
  });

  // â”€â”€ S4-4: Auto Anaesthesia dept request â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const anaesthesiaDeptMutation = useMutation({
    mutationFn: async (message: string) => {
      const api = getApi();
      await api.post('/dept-coordination', {
        scheduleId,
        department: 'Anesthesia',
        requestMessage: message,
      });
    },
    onSuccess: () => toast.success('Anaesthesia dept request sent'),
    onError: () => toast.error('Failed to send dept request'),
  });

  const gaIsAvailable = gaAvailability?.available ?? true; // default to true if not loaded
  const gaAnesthesiologistName = gaAvailability?.anaesthesiologistName;

  return (
    <div className="space-y-4">
      {/* Recommendation banner */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3 rounded-xl border',
          isUnder20
            ? 'bg-purple-50 border-purple-200'
            : 'bg-teal-50 border-teal-200'
        )}
      >
        <div className="flex items-center gap-3">
          <Activity
            className={cn('w-5 h-5', isUnder20 ? 'text-purple-600' : 'text-teal-600')}
          />
          <div>
            <p
              className={cn(
                'text-sm font-semibold',
                isUnder20 ? 'text-purple-800' : 'text-teal-800'
              )}
            >
              Recommended: {recommendedType} Anaesthesia
            </p>
            <p
              className={cn(
                'text-xs',
                isUnder20 ? 'text-purple-600' : 'text-teal-600'
              )}
            >
              {isUnder20
                ? `Patient age ${patientAge} â€” GA mandatory for patients under 20.`
                : `Patient age ${patientAge ?? 'â€”'} â€” Topical is standard; GA available on request.`}
            </p>
          </div>
        </div>
        {anaesthesiaTypeChoice && (
          <span
            className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-full',
              anaesthesiaColors[anaesthesiaTypeChoice]
            )}
          >
            {anaesthesiaTypeChoice}
          </span>
        )}
      </div>

      {/* Type selector pill-buttons */}
      <div className="flex gap-2">
        {(['GA', 'Topical', 'Local'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => handleTypeSelect(type)}
            className={cn(
              'flex-1 py-2 px-3 rounded-xl text-sm font-semibold border transition-colors',
              effectiveType === type
                ? type === 'GA'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : type === 'Topical'
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            )}
          >
            {type}
          </button>
        ))}
      </div>

      {/* S4-1: Live GA availability panel */}
      {(effectiveType === 'GA' || isUnder20) && (
        <div
          className={cn(
            'border rounded-xl px-4 py-3',
            gaLoading
              ? 'border-gray-200 bg-gray-50'
              : gaIsAvailable
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50'
          )}
        >
          <div className="flex items-center justify-between">
            <p className={cn('text-sm font-semibold', gaLoading ? 'text-gray-500' : gaIsAvailable ? 'text-green-800' : 'text-red-700')}>
              {gaLoading ? 'Checking GA availabilityâ€¦' : gaIsAvailable ? 'GA anaesthesiologist available' : 'GA not available on this date'}
            </p>
            {gaLoading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
            {!gaLoading && gaIsAvailable && gaAnesthesiologistName && (
              <span className="text-xs text-green-600">Dr. {gaAnesthesiologistName}</span>
            )}
          </div>

          {/* S4-2: GA consent form (when available) */}
          {!gaLoading && gaIsAvailable && (
            <div className="mt-3 space-y-2">
              {!showConsentForm ? (
                <button
                  type="button"
                  onClick={() => setShowConsentForm(true)}
                  className="text-xs text-purple-600 hover:underline font-medium"
                >
                  Record GA Consent â†’
                </button>
              ) : (
                <div className="space-y-2 p-3 bg-white rounded-lg border border-purple-200">
                  <p className="text-xs font-semibold text-purple-700">GA Anaesthesia Consent</p>
                  <input
                    type="text"
                    placeholder="Witness name (optional)"
                    value={witnessName}
                    onChange={(e) => setWitnessName(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={consentMutation.isPending}
                      onClick={() => consentMutation.mutate()}
                      className="flex items-center gap-1.5 text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {consentMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                      Record Consent
                    </button>
                    <button type="button" onClick={() => setShowConsentForm(false)} className="text-xs text-gray-500 px-3 py-1.5 hover:bg-gray-100 rounded-lg">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* S4-3: GA cost */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-600">GA Additional Cost (â‚¹)</span>
                <input
                  type="number"
                  min={0}
                  value={gaAdditionalCost}
                  onChange={(e) => setGaAdditionalCost(e.target.value)}
                  placeholder="0"
                  className="w-24 text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <button
                  type="button"
                  disabled={!gaAdditionalCost || costMutation.isPending}
                  onClick={() => costMutation.mutate(parseFloat(gaAdditionalCost))}
                  className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg hover:bg-gray-200 disabled:opacity-40"
                >
                  {costMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                </button>
              </div>

              {/* S4-4: Send Anaesthesia dept request */}
              <button
                type="button"
                disabled={anaesthesiaDeptMutation.isPending}
                onClick={() => anaesthesiaDeptMutation.mutate(`GA anaesthesia required for patient (age ${patientAge ?? 'â€”'}). Please confirm availability and assignment.`)}
                className="flex items-center gap-1.5 text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 disabled:opacity-50 mt-1"
              >
                {anaesthesiaDeptMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                Send Anaesthesia Dept Request
              </button>
            </div>
          )}
        </div>
      )}

      {/* S4-5: Fitness clearance — smart 3-option panel (all ages) */}
      {(fitnessDenied || fitnessFailedManual) ? (
        <div className="border border-red-200 bg-red-50 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-red-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-semibold text-red-700">Fitness Assessment — Failed</span>
            </div>
            {fitnessFailedManual && !fitnessDenied && (
              <button type="button" onClick={() => setFitnessFailedManual(false)} className="text-[11px] text-red-500 hover:underline">Undo</button>
            )}
          </div>
          <div className="px-4 py-4 space-y-3">
            {isUnder20 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                GA remains medically recommended for age {patientAge}. Consult a senior anaesthesiologist before switching.
              </div>
            )}
            <p className="text-xs font-medium text-red-700">Choose an action to resolve:</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onSendDeptRequest?.('Anesthesia', `Fitness assessment failed for GA — updated plan: local/topical anaesthesia. Please review and confirm.${isUnder20 ? ' Note: GA recommended for this age group.' : ''}`)}
                className="w-full text-left text-sm px-3 py-2.5 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 text-teal-700 font-medium"
              >
                1. Proceed with local / topical anaesthesia
                <span className="block text-[11px] text-teal-600 font-normal mt-0.5">Notify Anaesthesia dept to update the plan</span>
              </button>
              <button
                type="button"
                onClick={() => onSendDeptRequest?.('OT', 'Surgery postponed — patient fitness assessment failed. Further medical workup required before rescheduling.')}
                className="w-full text-left text-sm px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 text-amber-700 font-medium"
              >
                2. Postpone surgery for further workup
                <span className="block text-[11px] text-amber-600 font-normal mt-0.5">Notify OT dept to hold / release the slot</span>
              </button>
              <button
                type="button"
                onClick={() => onSendDeptRequest?.('Anesthesia', 'URGENT — Fitness for anaesthesia failed. Escalation to senior anaesthesiologist required for review before proceeding.')}
                className="w-full text-left text-sm px-3 py-2.5 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100 text-red-700 font-semibold"
              >
                3. Escalate to senior anaesthesiologist
                <span className="block text-[11px] text-red-600 font-normal mt-0.5">Sends urgent escalation to Anaesthesia dept</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setFitnessFailedManual(true)}
          className="text-xs text-red-400 hover:text-red-600 hover:underline"
        >
          Mark fitness assessment as failed
        </button>
      )}

      {/* Topical / Local simplified section */}
      {effectiveType !== 'GA' && (
        <div className={cn(
          'border rounded-xl px-4 py-3 space-y-2',
          effectiveType === 'Topical' ? 'border-teal-200 bg-teal-50' : 'border-blue-200 bg-blue-50'
        )}>
          <p className={cn('text-sm font-semibold', effectiveType === 'Topical' ? 'text-teal-800' : 'text-blue-800')}>
            {effectiveType} Anaesthesia — No special pre-op needed
          </p>
          <p className={cn('text-xs', effectiveType === 'Topical' ? 'text-teal-600' : 'text-blue-600')}>
            Standard consent applies. Notify anaesthesia dept if clinical situation changes.
          </p>
          <button
            type="button"
            disabled={anaesthesiaDeptMutation.isPending}
            onClick={() => anaesthesiaDeptMutation.mutate(
              `Patient proceeding with ${effectiveType} anaesthesia for scheduled surgery.`
            )}
            className={cn(
              'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg disabled:opacity-50',
              effectiveType === 'Topical'
                ? 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            )}
          >
            {anaesthesiaDeptMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            Notify Anaesthesia Dept
          </button>
        </div>
      )}

      {/* GA options (if GA recommended or requested and no live data, show manual fallback) */}
      {(effectiveType === 'GA' || isUnder20) && !gaIsAvailable && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            onClick={() => setShowGaOptions((v) => !v)}
          >
            <span className="text-sm font-medium text-gray-700">
              GA Unavailability Options (4 actions)
            </span>
            {showGaOptions ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {showGaOptions && (
            <div className="px-4 pb-4 space-y-2 bg-white border-t border-gray-100">
              <p className="text-xs text-gray-500 pt-2">
                GA is unavailable on the scheduled date. Choose one of the following:
              </p>
              {!isUnder20 && (
                <button
                  type="button"
                  onClick={() => onSendDeptRequest?.('Anesthesia', 'Patient consents to proceed with topical anaesthesia if GA is unavailable.')}
                  className="w-full text-left text-sm px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 text-teal-700"
                >
                  Proceed with Topical + obtain topical consent
                </button>
              )}
              <button
                type="button"
                onClick={() => onSendDeptRequest?.('OT', 'Requesting OT reschedule â€” GA anaesthesiologist unavailable.')}
                className="w-full text-left text-sm px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 text-amber-700"
              >
                Reschedule (notify OT)
              </button>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add clinical note about GA situation..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <button
                  type="button"
                  disabled={!noteText.trim()}
                  onClick={() => {
                    onSendDeptRequest?.('Anesthesia', noteText);
                    setNoteText('');
                  }}
                  className="flex-shrink-0 flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 disabled:opacity-40"
                >
                  <Send className="w-3 h-3" />
                  Send Note
                </button>
              </div>
              {/* Option 4: Direct OT dept resource request */}
              <button
                type="button"
                onClick={() => onSendDeptRequest?.('OT', 'GA anaesthesiologist unavailable for scheduled surgery date. Please advise on alternative scheduling or resource allocation.')}
                className="w-full text-left text-sm px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 text-indigo-700"
              >
                Request OT resource / alternate scheduling
              </button>
            </div>
          )}
        </div>
      )}

      {/* Blocking items alert */}
      {blockers.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Clearance required</p>
            <p className="text-xs text-red-600 mt-0.5">
              {blockers.map((b) => b.itemLabel).join(', ')} must be obtained.
            </p>
          </div>
        </div>
      )}

      {/* Checklist items */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Anaesthesia Checklist</span>
          </div>
          <span
            className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-full',
              completedCount === items.length
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600'
            )}
          >
            {completedCount}/{items.length}
          </span>
        </div>
        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.id} className="px-4 py-3 flex items-start gap-3">
              <button
                type="button"
                disabled={isMutating}
                onClick={() => onMarkItem(item.id, !item.isComplete)}
                className="mt-0.5 flex-shrink-0"
              >
                {item.isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-purple-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 hover:text-purple-400 transition-colors" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-sm font-medium',
                    item.isComplete ? 'text-gray-400 line-through' : 'text-gray-800'
                  )}
                >
                  {item.itemLabel}
                  {item.isMandatory && !item.isComplete && (
                    <span className="ml-1 text-xs text-red-500">*</span>
                  )}
                  {item.isBlocking && !item.isComplete && (
                    <span className="ml-1 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                      blocking
                    </span>
                  )}
                </p>
                {item.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
