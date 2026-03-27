/**
 * Session Completion Modal
 * Final step after counseling - capture patient decision and finalize session
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  FileText,
  X,
  Mail,
  MessageCircle,
  Send,
  Share2,
  Download,
  Loader2,
  ChevronDown,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { generateCounsellingSheetPDF, downloadPDF, pdfBlobToBase64 } from '@/lib/pdf-generator';
import type { CounsellingProcedureRow, CounsellingSheetData } from '@/lib/pdf-generator';
import { CounsellingSheetPreview } from '@/components/counselor/CounsellingSheet';
import { shareCostEstimate, ShareCostEstimateRequest } from '@/lib/api/cost-sharing.api';
import { getTheaters, getAvailableSlots, createSchedule } from '@/lib/api/surgery-scheduling.api';
import type { OTTheaterDto, TimeSlotDto } from '@/types/surgery-scheduling';

interface SessionSummary {
  patientName: string;
  mrn: string;
  packageSelected: string;
  iolSelected: string;
  surgeryDate?: string;
  paymentType: string;
  totalAmount: number;
  sessionId: string;
  surgeryName?: string;
  // Optional fields for counselling sheet
  procedures?: CounsellingProcedureRow[];
  doctorName?: string;
  counsellorName?: string;
  counsellorDesignation?: string;
  hospitalName?: string;
  hospitalAddress?: string;
  hospitalPhone?: string;
  hospitalLogoBase64?: string;
  patientDOB?: string;
  patientPhone?: string;
  patientEmail?: string;
  patientAge?: number;
  patientGender?: string;
  sessionNumber?: string;
  sessionDate?: string;
  patientType?: string;
  referredBy?: string;
  diagnosisOD?: string;
  diagnosisOS?: string;
  preOpInstructions?: string[];
  nextSurgeryDate?: string;
  nextSurgeryTime?: string;
  reportTo?: string;
  followUpDate?: string;
  // Insurance
  insuranceProvider?: string;
  tpaName?: string;
  policyNumber?: string;
  corporateName?: string;
  // Vitals
  vitalsIopRight?: number;
  vitalsIopLeft?: number;
  vitalsVaRight?: string;
  vitalsVaLeft?: string;
  surgeryEye?: string;
  investigationCount?: number;
  patientAddress?: string;
  // OR surgery booking — used to pre-fill slot booking
  surgeonId?: string;
  patientId?: string;
  branchId?: string;
  // Imaging orders
  imagingOrders?: Array<{ modality: string; eye: string; urgency: string; estimatedCost?: number }>;
}

interface SessionCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionSummary: SessionSummary;
  onComplete: (finalData: { patientIntention: string; confirmedSurgeryDate?: string; confirmedTimeSlot?: string }) => Promise<void>;
}

const WILLING_OPTIONS = [
  { value: 'WillingNow', label: 'Ready now — proceed immediately' },
  { value: 'WillingWeek', label: 'Within 1 week' },
  { value: 'WillingTwoWeeks', label: 'Within 2 weeks' },
  { value: 'WillingMonth', label: 'Within 1 month' },
  { value: 'WillingQuarter', label: 'Within 3 months' },
  { value: 'WillingSixMonths', label: 'Within 6 months' },
  { value: 'WillingCallToConfirm', label: 'Will call to confirm date' },
];

const NOT_READY_OPTIONS = [
  { value: 'Undecided', label: 'Still undecided' },
  { value: 'WaitingFinancial', label: 'Waiting for financial arrangement' },
  { value: 'WaitingFear', label: 'Fear / Anxiety — needs more counseling' },
  { value: 'SecondOpinion', label: 'Wants a second opinion' },
  { value: 'Declined', label: 'Declined surgery' },
  { value: 'ReferredElsewhere', label: 'Referred to another hospital' },
];

const WILLING_VALUES = new Set(WILLING_OPTIONS.map(o => o.value));

// Derive a display label from a raw string (e.g. 'Not selected' → blank display)
function displayOrDash(val?: string | number, prefix = '') {
  if (!val || val === 'Not selected' || val === '0' || val === 0) return '—';
  return `${prefix}${val}`;
}

export function SessionCompletionModal({
  isOpen,
  onClose,
  sessionSummary,
  onComplete,
}: SessionCompletionModalProps) {
  const [decisionGroup, setDecisionGroup] = useState<'willing' | 'not-ready' | null>(null);
  const [selectedIntention, setSelectedIntention] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSheetPreview, setShowSheetPreview] = useState(false);
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isSharingInProgress, setIsSharingInProgress] = useState(false);

  // Surgery booking state (only used when WillingNow)
  const [theaters, setTheaters] = useState<OTTheaterDto[]>([]);
  const [selectedTheaterId, setSelectedTheaterId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlotDto[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotDto | null>(null);
  const [isLoadingTheaters, setIsLoadingTheaters] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookedSchedule, setBookedSchedule] = useState<{ scheduleId: string; date: string; slot: TimeSlotDto } | null>(null);

  const canComplete = !!selectedIntention;

  // Fetch theaters when patient decides "Ready now"
  useEffect(() => {
    if (selectedIntention !== 'WillingNow' || theaters.length > 0) return;
    setIsLoadingTheaters(true);
    getTheaters({ branchId: sessionSummary.branchId })
      .then(data => setTheaters(data))
      .catch(() => toast.error('Could not load operating theaters'))
      .finally(() => setIsLoadingTheaters(false));
  }, [selectedIntention, sessionSummary.branchId]);

  // Fetch available slots when date + theater are both selected
  useEffect(() => {
    if (!bookingDate || !selectedTheaterId) {
      setAvailableSlots([]);
      setSelectedSlot(null);
      return;
    }
    setIsLoadingSlots(true);
    getAvailableSlots(selectedTheaterId, new Date(bookingDate))
      .then(slots => setAvailableSlots(slots))
      .catch(() => toast.error('Could not load available time slots'))
      .finally(() => setIsLoadingSlots(false));
  }, [bookingDate, selectedTheaterId]);

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !bookingDate || !selectedTheaterId) return;
    setIsBooking(true);
    try {
      const result = await createSchedule({
        theaterId: selectedTheaterId,
        sessionId: sessionSummary.sessionId,
        patientId: sessionSummary.patientId,
        scheduledDate: bookingDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        surgeryType: sessionSummary.surgeryName || 'Surgery',
        surgeonId: sessionSummary.surgeonId || '',
      });
      if (result.success) {
        setBookedSchedule({ scheduleId: result.scheduleId || '', date: bookingDate, slot: selectedSlot });
        toast.success('Surgery booking confirmed!');
      } else {
        toast.error(result.message || 'Booking failed');
      }
    } catch {
      toast.error('Could not confirm surgery booking — please try from the scheduling desk');
    } finally {
      setIsBooking(false);
    }
  };

  // Build counselling sheet data from session summary
  const buildSheetData = (): CounsellingSheetData => {
    const procedures: CounsellingProcedureRow[] =
      sessionSummary.procedures && sessionSummary.procedures.length > 0
        ? sessionSummary.procedures
        : [
            {
              eye: 'Both',
              procedureName:
                (sessionSummary.packageSelected !== 'Not selected' ? sessionSummary.packageSelected : null) ||
                sessionSummary.surgeryName ||
                'Surgery',
              iolModel: sessionSummary.iolSelected !== 'Not selected' ? sessionSummary.iolSelected : undefined,
              packageName: sessionSummary.packageSelected !== 'Not selected' ? sessionSummary.packageSelected : undefined,
              amount: sessionSummary.totalAmount || undefined,
            },
          ];
    return {
      hospitalName: sessionSummary.hospitalName || 'Hospital',
      hospitalAddress: sessionSummary.hospitalAddress,
      hospitalPhone: sessionSummary.hospitalPhone,
      hospitalLogoBase64: sessionSummary.hospitalLogoBase64,
      patientName: sessionSummary.patientName,
      patientMRN: sessionSummary.mrn,
      patientDOB: sessionSummary.patientDOB,
      patientPhone: sessionSummary.patientPhone,
      patientAge: sessionSummary.patientAge,
      patientGender: sessionSummary.patientGender,
      doctorName: sessionSummary.doctorName,
      counsellorName: sessionSummary.counsellorName,
      counsellorDesignation: sessionSummary.counsellorDesignation,
      sessionDate: sessionSummary.sessionDate || sessionSummary.surgeryDate || new Date().toLocaleDateString('en-IN'),
      sessionNumber: sessionSummary.sessionNumber,
      patientType: sessionSummary.patientType,
      referredBy: sessionSummary.referredBy,
      diagnosisOD: sessionSummary.diagnosisOD,
      diagnosisOS: sessionSummary.diagnosisOS,
      paymentMode: sessionSummary.paymentType,
      preOpInstructions: sessionSummary.preOpInstructions,
      nextSurgeryDate: sessionSummary.nextSurgeryDate,
      nextSurgeryTime: sessionSummary.nextSurgeryTime,
      reportTo: sessionSummary.reportTo,
      followUpDate: sessionSummary.followUpDate,
      insuranceProvider: sessionSummary.insuranceProvider,
      tpaName: sessionSummary.tpaName,
      policyNumber: sessionSummary.policyNumber,
      corporateName: sessionSummary.corporateName,
      vitalsIopRight: sessionSummary.vitalsIopRight,
      vitalsIopLeft: sessionSummary.vitalsIopLeft,
      vitalsVaRight: sessionSummary.vitalsVaRight,
      vitalsVaLeft: sessionSummary.vitalsVaLeft,
      patientAddress: sessionSummary.patientAddress,
      imagingOrders: sessionSummary.imagingOrders,
      procedures,
      totalAmount: sessionSummary.totalAmount,
      patientDecision: intentionLabel || undefined,
    };
  };

  const handleDownloadSheet = async () => {
    setIsPdfDownloading(true);
    try {
      const blob = await generateCounsellingSheetPDF(buildSheetData());
      downloadPDF(blob, `counselling-sheet-${sessionSummary.mrn || sessionSummary.sessionId}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
      toast.error('Could not generate counselling sheet PDF');
    } finally {
      setIsPdfDownloading(false);
    }
  };

  const handleShareSheet = async (method: 'email' | 'sms' | 'whatsapp') => {
    if (method === 'email' && !sessionSummary.patientEmail) {
      toast.error('Patient email address is not available');
      return;
    }
    if ((method === 'sms' || method === 'whatsapp') && !sessionSummary.patientPhone) {
      toast.error('Patient phone number is not available');
      return;
    }

    setIsSharingInProgress(true);
    setIsShareMenuOpen(false);
    try {
      const sheetData = buildSheetData();
      const pdfBlob = await generateCounsellingSheetPDF(sheetData);
      let pdfBase64: string | undefined;
      if (method === 'email' || method === 'whatsapp') {
        pdfBase64 = await pdfBlobToBase64(pdfBlob);
      }

      const shareRequest: ShareCostEstimateRequest = {
        patientName: sessionSummary.patientName,
        patientEmail: sessionSummary.patientEmail,
        patientPhone: sessionSummary.patientPhone,
        totalCost: sessionSummary.totalAmount,
        surgeryName: sessionSummary.packageSelected || 'Counselling',
        doctorName: sessionSummary.doctorName,
        estimateNumber: sessionSummary.sessionNumber || sessionSummary.sessionId,
        method,
        pdfBase64,
        pdfFilename: `counselling-sheet-${sessionSummary.mrn || sessionSummary.sessionId}.pdf`,
      };

      const result = await shareCostEstimate(shareRequest);
      if (result.success) {
        toast.success(`Counselling sheet sent via ${method.toUpperCase()} successfully`);
      } else {
        toast.error(result.error || `Failed to send via ${method.toUpperCase()}`);
      }
    } catch (error) {
      console.error(`Error sharing via ${method}:`, error);
      toast.error(`Failed to share counselling sheet via ${method.toUpperCase()}`);
    } finally {
      setIsSharingInProgress(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedIntention) return;
    setIsCompleting(true);
    try {
      await onComplete({
        patientIntention: selectedIntention,
        confirmedSurgeryDate: bookedSchedule?.date,
        confirmedTimeSlot: bookedSchedule
          ? `${bookedSchedule.slot.startTime.slice(0, 5)} – ${bookedSchedule.slot.endTime.slice(0, 5)}`
          : undefined,
      });
      toast.success('Counseling session completed successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete session');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleGroupChange = (group: 'willing' | 'not-ready') => {
    setDecisionGroup(group);
    setSelectedIntention('');
  };

  const intentionLabel = selectedIntention
    ? [...WILLING_OPTIONS, ...NOT_READY_OPTIONS].find(o => o.value === selectedIntention)?.label
    : '';

  if (!isOpen) return null;

  return (
    <>
      {/* Counselling sheet preview overlay */}
      <CounsellingSheetPreview
        data={buildSheetData()}
        isOpen={showSheetPreview}
        onClose={() => setShowSheetPreview(false)}
        onDownload={handleDownloadSheet}
        isPrinting={isPdfDownloading}
      />

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Complete Counseling Session</h2>
              <p className="text-sm text-gray-600 mt-0.5">Record decision and finalize session</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isCompleting}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Session Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Session Summary
            </h3>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Patient Name</p>
                <p className="font-medium text-gray-900">{sessionSummary.patientName}</p>
              </div>
              <div>
                <p className="text-gray-500">MRN</p>
                <p className="font-medium text-gray-900">{sessionSummary.mrn || '—'}</p>
              </div>
              {sessionSummary.doctorName && (
                <div>
                  <p className="text-gray-500">Consulting Doctor</p>
                  <p className="font-medium text-gray-900">{sessionSummary.doctorName}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Payment Mode</p>
                <p className="font-medium text-gray-900">{displayOrDash(sessionSummary.paymentType)}</p>
              </div>
              {(sessionSummary.diagnosisOD || sessionSummary.diagnosisOS) && (
                <div className="col-span-2">
                  <p className="text-gray-500">Diagnosis</p>
                  <p className="font-medium text-gray-900">
                    {[
                      sessionSummary.diagnosisOD && `OD: ${sessionSummary.diagnosisOD}`,
                      sessionSummary.diagnosisOS && `OS: ${sessionSummary.diagnosisOS}`,
                    ].filter(Boolean).join(' | ') || '—'}
                  </p>
                </div>
              )}
              {sessionSummary.surgeryEye && (
                <div>
                  <p className="text-gray-500">Surgery Eye</p>
                  <p className="font-medium text-gray-900">{sessionSummary.surgeryEye}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Package</p>
                <p className={`font-medium ${sessionSummary.packageSelected === 'Not selected' ? 'text-orange-500 italic' : 'text-gray-900'}`}>
                  {sessionSummary.packageSelected}
                </p>
              </div>
              <div>
                <p className="text-gray-500">IOL Selected</p>
                <p className={`font-medium ${sessionSummary.iolSelected === 'Not selected' ? 'text-orange-500 italic' : 'text-gray-900'}`}>
                  {sessionSummary.iolSelected}
                </p>
              </div>
              {sessionSummary.surgeryDate && (
                <div>
                  <p className="text-gray-500">Surgery Date</p>
                  <p className="font-medium text-gray-900">{sessionSummary.surgeryDate}</p>
                </div>
              )}
              {(sessionSummary.investigationCount ?? 0) > 0 && (
                <div>
                  <p className="text-gray-500">Investigations Ordered</p>
                  <p className="font-medium text-gray-900">{sessionSummary.investigationCount}</p>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-gray-500">Total Amount</p>
                <p className={`text-lg font-bold ${sessionSummary.totalAmount > 0 ? 'text-green-600' : 'text-orange-500 italic text-sm'}`}>
                  {sessionSummary.totalAmount > 0
                    ? `₹${sessionSummary.totalAmount.toLocaleString('en-IN')}`
                    : 'No package confirmed yet'}
                </p>
              </div>
            </div>
          </div>

          {/* Patient Decision */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1">
              Patient Decision <span className="text-red-500">*</span>
            </h3>
            <p className="text-xs text-gray-500 mb-4">Select the patient&apos;s decision to proceed with treatment</p>
            {/* Radio group */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {([
                { value: 'willing' as const, label: 'Willing to Proceed', color: 'green' },
                { value: 'not-ready' as const, label: 'Not Ready Yet', color: 'orange' },
              ] as const).map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleGroupChange(opt.value)}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                    decisionGroup === opt.value
                      ? opt.color === 'green'
                        ? 'border-green-500 bg-green-50'
                        : 'border-orange-400 bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    decisionGroup === opt.value
                      ? opt.color === 'green' ? 'border-green-500' : 'border-orange-400'
                      : 'border-gray-300'
                  }`}>
                    {decisionGroup === opt.value && (
                      <div className={`w-2 h-2 rounded-full ${opt.color === 'green' ? 'bg-green-500' : 'bg-orange-400'}`} />
                    )}
                  </div>
                  <span className={`font-medium text-sm ${
                    decisionGroup === opt.value
                      ? opt.color === 'green' ? 'text-green-800' : 'text-orange-800'
                      : 'text-gray-700'
                  }`}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
            {/* Conditional dropdown */}
            {decisionGroup && (
              <div className="mb-3">
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  {decisionGroup === 'willing' ? 'Expected timeline' : 'Reason for delay'}
                </label>
                <div className="relative">
                  <select
                    value={selectedIntention}
                    onChange={e => setSelectedIntention(e.target.value)}
                    className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                  >
                    <option value="">&mdash; Select an option &mdash;</option>
                    {(decisionGroup === 'willing' ? WILLING_OPTIONS : NOT_READY_OPTIONS).map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}
            {/* Confirmation badge */}
            {selectedIntention && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                WILLING_VALUES.has(selectedIntention)
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-orange-50 text-orange-800 border border-orange-200'
              }`}>
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span><strong>Recorded:</strong> {intentionLabel}</span>
              </div>
            )}

            {/* Surgery Booking — shown only when patient is Ready Now */}
            {selectedIntention === 'WillingNow' && (
              <div className="mt-4 border border-blue-200 rounded-lg p-4 bg-blue-50 space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold text-blue-900 text-sm">Book Surgery Slot</h4>
                </div>

                {bookedSchedule ? (
                  /* Confirmed booking card */
                  <div className="bg-green-50 border border-green-300 rounded-lg p-3 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-green-800">Surgery Booking Confirmed</p>
                      <p className="text-green-700 mt-0.5">
                        {new Date(bookedSchedule.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-green-700">
                        {bookedSchedule.slot.startTime.slice(0, 5)} – {bookedSchedule.slot.endTime.slice(0, 5)}
                        {' '}({bookedSchedule.slot.durationMinutes} min)
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Date + Theater */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">Surgery Date</label>
                        <input
                          type="date"
                          value={bookingDate}
                          min={new Date().toISOString().split('T')[0]}
                          max={new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0]}
                          onChange={e => { setBookingDate(e.target.value); setSelectedSlot(null); }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">Operating Theater</label>
                        {isLoadingTheaters ? (
                          <div className="flex items-center gap-2 py-2 text-sm text-gray-500">
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading theaters…
                          </div>
                        ) : (
                          <select
                            value={selectedTheaterId}
                            onChange={e => { setSelectedTheaterId(e.target.value); setSelectedSlot(null); }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            <option value="">— Select —</option>
                            {theaters.map(t => (
                              <option key={t.id} value={t.id}>{t.theaterName}{t.theaterCode ? ` (${t.theaterCode})` : ''}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>

                    {/* Available Slots */}
                    {bookingDate && selectedTheaterId && (
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-2">Available Time Slots</label>
                        {isLoadingSlots ? (
                          <div className="flex items-center gap-2 py-2 text-sm text-gray-500">
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading slots…
                          </div>
                        ) : availableSlots.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">No slots available for this date/theater.</p>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            {availableSlots.map((slot, i) => (
                              <button
                                key={i}
                                type="button"
                                disabled={!slot.isAvailable}
                                onClick={() => setSelectedSlot(slot)}
                                className={`text-xs rounded-lg px-2 py-2 border transition-all text-left ${
                                  !slot.isAvailable
                                    ? 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed line-through'
                                    : selectedSlot?.startTime === slot.startTime
                                      ? 'bg-blue-600 border-blue-600 text-white'
                                      : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                                }`}
                              >
                                <span className="font-medium block">{slot.startTime.slice(0, 5)}</span>
                                <span className="text-[10px] opacity-75">{slot.durationMinutes} min</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Confirm Booking Button */}
                    {selectedSlot && (
                      <button
                        type="button"
                        onClick={handleConfirmBooking}
                        disabled={isBooking}
                        className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isBooking ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Confirming booking…</>
                        ) : (
                          `Confirm Surgery: ${selectedSlot.startTime.slice(0, 5)} – ${selectedSlot.endTime.slice(0, 5)}`
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Counselling Sheet */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Counselling Summary Sheet</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Patient details · diagnosis · procedures · pricing · pre-op instructions
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setShowSheetPreview(true); }}
                className="text-xs text-blue-600 underline hover:text-blue-800 font-medium flex-shrink-0 ml-4"
              >
                Preview
              </button>
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm font-medium text-yellow-900">⚠️ Important Note</p>
            <p className="text-sm text-yellow-800 mt-1">
              {!selectedIntention
                ? "Please record the patient's decision before completing the session."
                : WILLING_VALUES.has(selectedIntention)
                  ? 'Patient is willing to proceed. Route to billing desk or admission for next steps.'
                  : 'Patient is not yet ready. Ensure follow-up is scheduled to re-engage the patient.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50">
          {/* Left: Download + Share */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadSheet}
              disabled={isPdfDownloading || isSharingInProgress}
              className="px-3 py-2 text-sm text-blue-700 border border-blue-300 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isPdfDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {isPdfDownloading ? 'Generating...' : 'Download Sheet'}
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsShareMenuOpen(v => !v)}
                disabled={isSharingInProgress}
                className="px-3 py-2 text-sm text-green-700 border border-green-300 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSharingInProgress ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                {isSharingInProgress ? 'Sending...' : 'Share'}
              </button>
              {isShareMenuOpen && (
                <div className="absolute bottom-full left-0 mb-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <button
                    type="button"
                    onClick={() => handleShareSheet('email')}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                  >
                    <Mail className="h-4 w-4 text-blue-500" />
                    Send via Email
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShareSheet('whatsapp')}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <MessageCircle className="h-4 w-4 text-green-500" />
                    Share via WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShareSheet('sms')}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
                  >
                    <Send className="h-4 w-4 text-purple-500" />
                    Send via SMS
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Right: Cancel + Complete */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isCompleting}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleComplete}
              disabled={isCompleting || !canComplete}
              title={!canComplete ? 'Please record patient decision first' : undefined}
              className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isCompleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Completing...
                </>
              ) : (
                'Complete Session'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
