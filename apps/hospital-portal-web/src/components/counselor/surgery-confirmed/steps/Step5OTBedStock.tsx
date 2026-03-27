'use client';

/**
 * Step5OTBedStock
 * Covers OT slot confirmation, bed reservation, IOL stock and instruments.
 * Conditionally embeds IolStockWidget when scheduleId + iolCatalogId are present.
 * Quick-send buttons to notify OT / Admissions / Pharmacy departments.
 */

import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Circle, BedDouble, Package2, AlertTriangle, Send, CalendarClock, Loader2, RefreshCw, Phone, MessageSquare, Monitor, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApi } from '@/lib/api';
import { toast } from 'sonner';
import { IolStockWidget } from '../IolStockWidget';
import type { WorkflowStepItem } from '@/hooks/use-pre-admission-workflow';

interface OTScheduleSummary {
  id: string;
  status: string;   // 'Confirmed' | 'Booked' | 'Scheduled' | 'Pending' | 'Cancelled'
  theatreNumber?: string;
  startTime?: string;
  surgeonName?: string;
}

interface Props {
  scheduleId: string;
  patientId?: string;
  patientTypeCategory?: 'DayCare' | 'IPD' | 'Emergency';
  surgeryDate?: string;   // ISO date string â€” used for bed urgency calculation
  iolCatalogId?: string;
  iolModel?: string;
  surgeryType?: string;
  items: WorkflowStepItem[];
  onMarkItem: (itemId: string, isComplete: boolean, notes?: string) => void;
  onSendDeptRequest?: (dept: 'OT' | 'Admissions' | 'Pharmacy', message: string) => void;
  isMutating?: boolean;
}

const QUICK_MESSAGES: { dept: 'OT' | 'Admissions' | 'Pharmacy'; label: string; message: string }[] = [
  { dept: 'OT',        label: 'Confirm OT Slot',   message: 'Please confirm OT slot availability for this surgery.' },
  { dept: 'Admissions', label: 'Reserve Bed',       message: 'Requesting bed reservation for pre-op admission.' },
  { dept: 'Pharmacy',  label: 'Verify IOL Stock',  message: 'Please verify IOL stock availability before surgery date.' },
];

export function Step5OTBedStock({
  scheduleId,
  patientTypeCategory,
  surgeryDate,
  iolCatalogId,
  iolModel,
  surgeryType,
  items,
  onMarkItem,
  onSendDeptRequest,
  isMutating,
}: Props) {
  const qc = useQueryClient();
  const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});
  const [iolEscalation, setIolEscalation] = useState<'substitute' | 'order' | 'postpone' | null>(null);
  const [otSlotManualConfirmed, setOtSlotManualConfirmed] = useState(false);
  const [substituteModel, setSubstituteModel] = useState('');
  const iolOrderFiredRef = useRef(false);

  // 3-card confirmation state
  type HowOption = 'Verbal' | 'Phone' | 'In-Person' | 'System';
  interface ConfirmationData { by: string; how: HowOption; at: string; notes: string; }
  const [otState, setOtState] = useState<'pending' | 'awaiting' | 'confirmed'>('pending');
  const [otConfirmation, setOtConfirmation] = useState<ConfirmationData>({ by: '', how: 'Phone', at: '', notes: '' });
  const [showOtForm, setShowOtForm] = useState(false);
  const [bedState, setBedState] = useState<'pending' | 'awaiting' | 'confirmed'>('pending');
  const [bedConfirmation, setBedConfirmation] = useState<ConfirmationData>({ by: '', how: 'Phone', at: '', notes: '' });
  const [showBedForm, setShowBedForm] = useState(false);
  const [stockState, setStockState] = useState<'pending' | 'awaiting' | 'confirmed'>('pending');
  const [stockConfirmation, setStockConfirmation] = useState<ConfirmationData>({ by: '', how: 'System', at: '', notes: '' });
  const [showStockForm, setShowStockForm] = useState(false);

  const completedCount = items.filter((i) => i.isComplete).length;
  const blockers = items.filter((i) => i.isBlocking && !i.isComplete);
  const needsIol  = !!iolCatalogId;
  const isDayCare = patientTypeCategory === 'DayCare';

  // â”€â”€ OT Schedule fetch â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { data: schedule, isLoading: scheduleLoading } = useQuery<OTScheduleSummary>({
    queryKey: ['ot-schedule-summary', scheduleId],
    enabled: !!scheduleId,
    staleTime: 2 * 60_000,
    queryFn: async () => {
      const api = getApi();
      const res = await api.get(`/otbooking/schedules/${scheduleId}`);
      return res.data;
    },
  });

  const otSlotConfirmed = schedule?.status === 'Confirmed' || otSlotManualConfirmed;
  const otSlotBooked    = schedule?.status === 'Booked' || schedule?.status === 'Scheduled';

  // â”€â”€ Bed urgency: days until surgery â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const daysUntilSurgery = surgeryDate
    ? Math.ceil((new Date(surgeryDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86_400_000)
    : null;

  // Items keyed as bed/ward items (N/A for DayCare)
  const isBedItem = (key?: string) =>
    key ? /bed_reserved|bed_booking|ward_allocation|admission_bed/.test(key) : false;

  function handleQuickSend(dept: 'OT' | 'Admissions' | 'Pharmacy', message: string) {
    onSendDeptRequest?.(dept, message);
    setSentRequests((prev) => ({ ...prev, [dept]: true }));
  }

  function handleOtDeptRequest() {
    onSendDeptRequest?.('OT', 'Requesting OT slot confirmation for this surgical booking.');
    setSentRequests((prev) => ({ ...prev, OT: true }));
  }

  // â”€â”€ IOL escalation mutations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // "Order from Pharmacy" â€” POST dept-coordination
  const iolPharmacyMutation = useMutation({
    mutationFn: async () => {
      const api = getApi();
      await api.post('/dept-coordination', {
        scheduleId,
        department: 'Pharmacy',
        requestType: 'iol_procurement',
        priority: 'urgent',
        requestMessage: `URGENT: IOL out of stock â€” ${iolModel ?? 'prescribed IOL'}. Please procure before surgery date.`,
      });
    },
    onSuccess: () => toast.success('Pharmacy dept notified for IOL procurement'),
    onError: () => toast.error('Failed to notify Pharmacy'),
  });

  // "Postpone Surgery" â€” PATCH schedule status
  const iolPostponeMutation = useMutation({
    mutationFn: async () => {
      const api = getApi();
      await api.patch(`/otbooking/schedules/${scheduleId}`, {
        status: 'Postponed',
        notes: 'Postponed due to IOL stock unavailability.',
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ot-schedule-summary', scheduleId] });
      toast.success('Surgery marked as Postponed');
    },
    onError: () => toast.error('Failed to postpone surgery'),
  });

  // "Substitute IOL" â€” PATCH schedule with new IOL model
  const iolSubstituteMutation = useMutation({
    mutationFn: async () => {
      const api = getApi();
      await api.patch(`/otbooking/schedules/${scheduleId}`, { iolModel: substituteModel.trim() });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ot-schedule-summary', scheduleId] });
      toast.success('Schedule updated with substitute IOL');
      setSubstituteModel('');
    },
    onError: () => toast.error('Failed to update IOL'),
  });

  // Auto-fire Pharmacy dept request when escalation choice is "order" (once)
  useEffect(() => {
    if (iolEscalation === 'order' && !iolOrderFiredRef.current) {
      iolOrderFiredRef.current = true;
      iolPharmacyMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iolEscalation]);

  // How-option pill picker (used inside each card's confirm form)
  const HOW_OPTIONS = ['Verbal', 'Phone', 'In-Person', 'System'] as const;

  function HowPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const icons: Record<string, React.ReactNode> = {
      Verbal: <MessageSquare className="w-3 h-3" />,
      Phone: <Phone className="w-3 h-3" />,
      'In-Person': <Users className="w-3 h-3" />,
      System: <Monitor className="w-3 h-3" />,
    };
    return (
      <div className="flex gap-1.5 flex-wrap">
        {HOW_OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              'flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors',
              value === opt
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            )}
          >
            {icons[opt]}{opt}
          </button>
        ))}
      </div>
    );
  }

  function confirmationSummary(label: string, d: { by: string; how: string; at: string; notes: string }) {
    return `${label}_CONFIRMED: by=${d.by}, how=${d.how}, at=${d.at || 'now'}${d.notes ? `, notes=${d.notes}` : ''}`;
  }

  const nowStr = new Date().toISOString().slice(0, 16);

  return (
    <div className="space-y-4">
      {/* â”€â”€ Blocker alert â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {blockers.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Blocking items</p>
            <p className="text-xs text-red-600 mt-0.5">{blockers.map((b) => b.itemLabel).join(', ')} must be resolved before OT date.</p>
          </div>
        </div>
      )}

      {/* â”€â”€ OT Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className={cn(
        'border rounded-xl overflow-hidden',
        otState === 'confirmed' ? 'border-green-200' : otState === 'awaiting' ? 'border-amber-200' : 'border-gray-200'
      )}>
        <div className={cn('px-4 py-3 flex items-center justify-between',
          otState === 'confirmed' ? 'bg-green-50' : otState === 'awaiting' ? 'bg-amber-50' : 'bg-gray-50'
        )}>
          <div className="flex items-center gap-2">
            <CalendarClock className={cn('w-4 h-4', otState === 'confirmed' ? 'text-green-600' : otState === 'awaiting' ? 'text-amber-600' : 'text-gray-500')} />
            <span className={cn('text-sm font-semibold', otState === 'confirmed' ? 'text-green-800' : otState === 'awaiting' ? 'text-amber-800' : 'text-gray-700')}>OT Slot</span>
          </div>
          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full',
            otState === 'confirmed' ? 'bg-green-100 text-green-700' : otState === 'awaiting' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
          )}>
            {otState === 'confirmed' ? 'Confirmed âœ“' : otState === 'awaiting' ? 'Awaitingâ€¦' : 'Pending'}
          </span>
        </div>
        <div className="px-4 py-3 bg-white">
          {scheduleLoading && <div className="flex items-center gap-2 text-sm text-gray-400"><Loader2 className="w-4 h-4 animate-spin" />Checking OT scheduleâ€¦</div>}
          {!scheduleLoading && schedule?.status === 'Confirmed' && (
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">OT confirmed in system â€” Theatre {schedule?.theatreNumber ?? 'â€“'}{schedule?.startTime ? ` at ${schedule.startTime}` : ''}</span>
            </div>
          )}
          {otState === 'pending' && (
            <button type="button"
              onClick={() => { setOtState('awaiting'); onSendDeptRequest?.('OT', 'Requesting OT slot confirmation for this surgical booking.'); }}
              className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700">
              <Send className="w-3.5 h-3.5" />Request OT Confirmation
            </button>
          )}
          {otState === 'awaiting' && !showOtForm && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-amber-700">Awaiting OT confirmationâ€¦</p>
              <button type="button" onClick={() => setShowOtForm(true)}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">
                <CheckCircle2 className="w-3 h-3" />Confirm OT
              </button>
            </div>
          )}
          {otState === 'awaiting' && showOtForm && (
            <div className="space-y-2.5">
              <input type="text" placeholder="Confirmed by (name / role)" value={otConfirmation.by}
                onChange={(e) => setOtConfirmation((p) => ({ ...p, by: e.target.value }))}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-300" />
              <div><p className="text-xs text-gray-500 mb-1">How was it confirmed?</p><HowPicker value={otConfirmation.how} onChange={(v) => setOtConfirmation((p) => ({ ...p, how: v as HowOption }))} /></div>
              <input type="datetime-local" value={otConfirmation.at || nowStr} onChange={(e) => setOtConfirmation((p) => ({ ...p, at: e.target.value }))} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-300" />
              <textarea rows={2} placeholder="Notes (optional)" value={otConfirmation.notes} onChange={(e) => setOtConfirmation((p) => ({ ...p, notes: e.target.value }))} className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none" />
              <div className="flex gap-2">
                <button type="button" disabled={!otConfirmation.by.trim() || isMutating}
                  onClick={() => {
                    const noteStr = confirmationSummary('OT', otConfirmation);
                    const otItem = items.find((i) => /ot_slot|ot_confirm|theatre/i.test(i.itemKey ?? i.itemLabel));
                    if (otItem) onMarkItem(otItem.id, true, noteStr);
                    setOtState('confirmed'); setShowOtForm(false);
                  }}
                  className="flex items-center gap-1.5 text-sm bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                  <CheckCircle2 className="w-3.5 h-3.5" />Save Confirmation
                </button>
                <button type="button" onClick={() => setShowOtForm(false)} className="text-sm text-gray-500 px-3 py-1.5 hover:bg-gray-100 rounded-lg">Cancel</button>
              </div>
            </div>
          )}
          {otState === 'confirmed' && (
            <div className="text-sm text-green-700 space-y-0.5">
              <p className="font-medium">By: {otConfirmation.by} Â· {otConfirmation.how}</p>
              {otConfirmation.at && <p className="text-xs text-green-600">At: {new Date(otConfirmation.at).toLocaleString()}</p>}
              {otConfirmation.notes && <p className="text-xs text-green-600">{otConfirmation.notes}</p>}
            </div>
          )}
        </div>
      </div>

      {/* â”€â”€ BED Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {isDayCare ? (
        <div className="border border-green-200 bg-green-50 rounded-xl px-4 py-3 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <div>
            <p className="text-sm font-semibold text-green-800">Bed Reservation â€” Not Required</p>
            <p className="text-xs text-green-600">Day Care procedure â€” no bed needed âœ“</p>
          </div>
        </div>
      ) : (
        <div className={cn('border rounded-xl overflow-hidden',
          bedState === 'confirmed' ? 'border-green-200' : bedState === 'awaiting' ? 'border-amber-200' : 'border-gray-200'
        )}>
          <div className={cn('px-4 py-3 flex items-center justify-between',
            bedState === 'confirmed' ? 'bg-green-50' : bedState === 'awaiting' ? 'bg-amber-50' : 'bg-gray-50'
          )}>
            <div className="flex items-center gap-2">
              <BedDouble className={cn('w-4 h-4', bedState === 'confirmed' ? 'text-green-600' : bedState === 'awaiting' ? 'text-amber-600' : 'text-gray-500')} />
              <span className={cn('text-sm font-semibold', bedState === 'confirmed' ? 'text-green-800' : bedState === 'awaiting' ? 'text-amber-800' : 'text-gray-700')}>
                Bed Reservation{patientTypeCategory === 'Emergency' ? ' â€” URGENT' : ''}
              </span>
            </div>
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full',
              bedState === 'confirmed' ? 'bg-green-100 text-green-700' : bedState === 'awaiting' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
            )}>
              {bedState === 'confirmed' ? 'Confirmed âœ“' : bedState === 'awaiting' ? 'Awaitingâ€¦' : 'Pending'}
            </span>
          </div>
          <div className="px-4 py-3 bg-white">
            {daysUntilSurgery !== null && daysUntilSurgery <= 1 && bedState === 'pending' && (
              <p className="text-xs text-red-600 font-medium mb-2">âš  Surgery is {daysUntilSurgery === 0 ? 'today' : 'tomorrow'} â€” reserve bed immediately!</p>
            )}
            {bedState === 'pending' && (
              <button type="button"
                onClick={() => { setBedState('awaiting'); onSendDeptRequest?.('Admissions', `Requesting bed reservation. Patient type: ${patientTypeCategory}. Surgery in ${daysUntilSurgery ?? '?'} day(s).`); }}
                className={cn('flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg', patientTypeCategory === 'Emergency' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-blue-600 text-white hover:bg-blue-700')}>
                <Send className="w-3.5 h-3.5" />Request Bed Reservation
              </button>
            )}
            {bedState === 'awaiting' && !showBedForm && (
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-amber-700">Awaiting Admissions confirmationâ€¦</p>
                <button type="button" onClick={() => setShowBedForm(true)}
                  className="flex-shrink-0 flex items-center gap-1.5 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">
                  <CheckCircle2 className="w-3 h-3" />Confirm Bed
                </button>
              </div>
            )}
            {bedState === 'awaiting' && showBedForm && (
              <div className="space-y-2.5">
                <input type="text" placeholder="Confirmed by (name / role)" value={bedConfirmation.by} onChange={(e) => setBedConfirmation((p) => ({ ...p, by: e.target.value }))} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                <div><p className="text-xs text-gray-500 mb-1">How was it confirmed?</p><HowPicker value={bedConfirmation.how} onChange={(v) => setBedConfirmation((p) => ({ ...p, how: v as HowOption }))} /></div>
                <input type="datetime-local" value={bedConfirmation.at || nowStr} onChange={(e) => setBedConfirmation((p) => ({ ...p, at: e.target.value }))} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                <textarea rows={2} placeholder="Notes (optional)" value={bedConfirmation.notes} onChange={(e) => setBedConfirmation((p) => ({ ...p, notes: e.target.value }))} className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none" />
                <div className="flex gap-2">
                  <button type="button" disabled={!bedConfirmation.by.trim() || isMutating}
                    onClick={() => {
                      const noteStr = confirmationSummary('BED', bedConfirmation);
                      const bedItem = items.find((i) => /bed_reserved|bed_booking|ward|admission/i.test(i.itemKey ?? i.itemLabel));
                      if (bedItem) onMarkItem(bedItem.id, true, noteStr);
                      setBedState('confirmed'); setShowBedForm(false);
                    }}
                    className="flex items-center gap-1.5 text-sm bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                    <CheckCircle2 className="w-3.5 h-3.5" />Save Confirmation
                  </button>
                  <button type="button" onClick={() => setShowBedForm(false)} className="text-sm text-gray-500 px-3 py-1.5 hover:bg-gray-100 rounded-lg">Cancel</button>
                </div>
              </div>
            )}
            {bedState === 'confirmed' && (
              <div className="text-sm text-green-700 space-y-0.5">
                <p className="font-medium">By: {bedConfirmation.by} Â· {bedConfirmation.how}</p>
                {bedConfirmation.at && <p className="text-xs text-green-600">At: {new Date(bedConfirmation.at).toLocaleString()}</p>}
                {bedConfirmation.notes && <p className="text-xs text-green-600">{bedConfirmation.notes}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* â”€â”€ STOCK / IOL Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className={cn('border rounded-xl overflow-hidden',
        stockState === 'confirmed' ? 'border-green-200' : stockState === 'awaiting' ? 'border-amber-200' : 'border-gray-200'
      )}>
        <div className={cn('px-4 py-3 flex items-center justify-between',
          stockState === 'confirmed' ? 'bg-green-50' : stockState === 'awaiting' ? 'bg-amber-50' : 'bg-gray-50'
        )}>
          <div className="flex items-center gap-2">
            <Package2 className={cn('w-4 h-4', stockState === 'confirmed' ? 'text-green-600' : stockState === 'awaiting' ? 'text-amber-600' : 'text-gray-500')} />
            <span className={cn('text-sm font-semibold', stockState === 'confirmed' ? 'text-green-800' : stockState === 'awaiting' ? 'text-amber-800' : 'text-gray-700')}>
              Stock / IOL{iolModel && <span className="ml-2 text-xs font-normal bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{iolModel}</span>}
            </span>
          </div>
          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full',
            stockState === 'confirmed' ? 'bg-green-100 text-green-700' : stockState === 'awaiting' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
          )}>
            {stockState === 'confirmed' ? 'Confirmed âœ“' : stockState === 'awaiting' ? 'Awaitingâ€¦' : 'Pending'}
          </span>
        </div>
        <div className="px-4 py-3 bg-white space-y-3">
          {stockState === 'pending' && (
            <button type="button"
              onClick={() => { setStockState('awaiting'); onSendDeptRequest?.('Pharmacy', `Requesting IOL/stock verification.${iolModel ? ` IOL: ${iolModel}` : ''}`); }}
              className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700">
              <Send className="w-3.5 h-3.5" />Request Stock Verification
            </button>
          )}
          {stockState === 'awaiting' && !showStockForm && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-amber-700">Awaiting Pharmacy confirmationâ€¦</p>
              <button type="button" onClick={() => setShowStockForm(true)}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">
                <CheckCircle2 className="w-3 h-3" />Confirm Stock
              </button>
            </div>
          )}
          {stockState === 'awaiting' && showStockForm && (
            <div className="space-y-2.5">
              <input type="text" placeholder="Confirmed by (name / role)" value={stockConfirmation.by} onChange={(e) => setStockConfirmation((p) => ({ ...p, by: e.target.value }))} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-300" />
              <div><p className="text-xs text-gray-500 mb-1">How was it confirmed?</p><HowPicker value={stockConfirmation.how} onChange={(v) => setStockConfirmation((p) => ({ ...p, how: v as HowOption }))} /></div>
              <input type="datetime-local" value={stockConfirmation.at || nowStr} onChange={(e) => setStockConfirmation((p) => ({ ...p, at: e.target.value }))} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-300" />
              <textarea rows={2} placeholder="Notes (optional)" value={stockConfirmation.notes} onChange={(e) => setStockConfirmation((p) => ({ ...p, notes: e.target.value }))} className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none" />
              <div className="flex gap-2">
                <button type="button" disabled={!stockConfirmation.by.trim() || isMutating}
                  onClick={() => {
                    const noteStr = confirmationSummary('STOCK', stockConfirmation);
                    const stockItem = items.find((i) => /inventory|stock|iol_stock|instrument/i.test(i.itemKey ?? i.itemLabel));
                    if (stockItem) onMarkItem(stockItem.id, true, noteStr);
                    setStockState('confirmed'); setShowStockForm(false);
                  }}
                  className="flex items-center gap-1.5 text-sm bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                  <CheckCircle2 className="w-3.5 h-3.5" />Save Confirmation
                </button>
                <button type="button" onClick={() => setShowStockForm(false)} className="text-sm text-gray-500 px-3 py-1.5 hover:bg-gray-100 rounded-lg">Cancel</button>
              </div>
            </div>
          )}
          {stockState === 'confirmed' && (
            <div className="text-sm text-green-700 space-y-0.5">
              <p className="font-medium">By: {stockConfirmation.by} Â· {stockConfirmation.how}</p>
              {stockConfirmation.at && <p className="text-xs text-green-600">At: {new Date(stockConfirmation.at).toLocaleString()}</p>}
              {stockConfirmation.notes && <p className="text-xs text-green-600">{stockConfirmation.notes}</p>}
            </div>
          )}
          {needsIol && (
            <>
              <div className="border-t border-gray-100 pt-3">
                <IolStockWidget iolCatalogId={iolCatalogId!} iolModel={iolModel} surgeryType={surgeryType} onEscalationChoice={(choice) => setIolEscalation(choice)} />
              </div>
              {iolEscalation === 'substitute' && (
                <div className="border border-blue-200 rounded-xl overflow-hidden">
                  <div className="px-3 py-2 bg-blue-50 flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5 text-blue-600" /><span className="text-sm font-medium text-blue-800">Substitute IOL</span></div>
                  <div className="px-3 py-3 bg-white flex gap-2">
                    <input type="text" value={substituteModel} onChange={(e) => setSubstituteModel(e.target.value)} placeholder="e.g. Alcon AcrySof IQ SN60WF" className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                    <button type="button" disabled={!substituteModel.trim() || iolSubstituteMutation.isPending} onClick={() => iolSubstituteMutation.mutate()}
                      className="flex-shrink-0 flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                      {iolSubstituteMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}Update
                    </button>
                  </div>
                </div>
              )}
              {iolEscalation === 'order' && (
                <div className="border border-amber-200 rounded-xl px-3 py-2.5 bg-amber-50 flex items-center gap-2">
                  {iolPharmacyMutation.isPending ? <Loader2 className="w-4 h-4 text-amber-600 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-green-600" />}
                  <span className="text-sm text-amber-800 font-medium">{iolPharmacyMutation.isPending ? 'Notifying Pharmacyâ€¦' : 'Pharmacy notified â€” IOL procurement requested'}</span>
                </div>
              )}
              {iolEscalation === 'postpone' && (
                <div className="border border-red-200 rounded-xl overflow-hidden">
                  <div className="px-3 py-2 bg-red-50 flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5 text-red-600" /><span className="text-sm font-medium text-red-800">Postpone Surgery</span></div>
                  <div className="px-3 py-3 bg-white">
                    <p className="text-xs text-gray-600 mb-2">Marks surgery as <strong>Postponed</strong> due to IOL unavailability.</p>
                    {iolPostponeMutation.isSuccess ? (
                      <p className="text-xs text-amber-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Surgery marked as Postponed</p>
                    ) : (
                      <button type="button" disabled={iolPostponeMutation.isPending} onClick={() => iolPostponeMutation.mutate()} className="flex items-center gap-1.5 text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50">
                        {iolPostponeMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Confirm: Postpone Surgery
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* â”€â”€ Remaining checklist items â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {items.filter((i) => !/ot_slot|ot_confirm|theatre|bed_reserved|bed_booking|ward|admission|inventory|stock|iol_stock|instrument/i.test(i.itemKey ?? i.itemLabel)).length > 0 && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-gray-50"><span className="text-sm font-medium text-gray-700">Other Checklist Items</span></div>
          <div className="divide-y divide-gray-100">
            {items.filter((i) => !/ot_slot|ot_confirm|theatre|bed_reserved|bed_booking|ward|admission|inventory|stock|iol_stock|instrument/i.test(i.itemKey ?? i.itemLabel)).map((item) => (
              <div key={item.id} className="px-4 py-3 flex items-start gap-3">
                <button type="button" disabled={isMutating} onClick={() => onMarkItem(item.id, !item.isComplete)} className="mt-0.5 flex-shrink-0">
                  {item.isComplete ? <CheckCircle2 className="w-5 h-5 text-blue-500" /> : <Circle className="w-5 h-5 text-gray-300 hover:text-blue-400 transition-colors" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium', item.isComplete ? 'text-gray-400 line-through' : 'text-gray-800')}>
                    {item.itemLabel}
                    {item.isMandatory && !item.isComplete && <span className="ml-1 text-xs text-red-500">*</span>}
                    {item.isBlocking && !item.isComplete && <span className="ml-1 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">blocking</span>}
                  </p>
                  {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
