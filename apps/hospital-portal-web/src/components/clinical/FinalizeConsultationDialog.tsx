'use client';

import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  X,
  CheckCircle,
  XCircle,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  getFollowUpSuggestion, 
  calculateFollowUpDate, 
  formatFollowUpDate,
  getFollowUpSchedule 
} from '@/lib/utils/followUpSuggester';

interface ValidationCheck {
  field: string;
  status: 'passed' | 'warning' | 'failed';
  message: string;
}

interface ConsultationSummary {
  chiefComplaint?: string;
  diagnoses: number;
  medications: number;
  investigations: number;
  procedures: number;
  followUpDays?: number;
  referrals: number;
}

interface FinalizeConsultationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFinalize: (pin: string, followUpDate?: string) => Promise<void>;
  summary: ConsultationSummary;
  patientName: string;
  doctorName: string;
  validationChecks: ValidationCheck[];
  diagnosisCodes?: string[]; // ICD-10 codes for smart suggestions
  isPostOperative?: boolean; // Whether patient is post-op
}

export default function FinalizeConsultationDialog({
  isOpen,
  onClose,
  onFinalize,
  summary,
  patientName,
  doctorName,
  validationChecks,
  diagnosisCodes = [],
  isPostOperative = false,
}: FinalizeConsultationDialogProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoScheduleFollowUp, setAutoScheduleFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [agreed, setAgreed] = useState(false);

  // Get smart follow-up suggestion based on diagnosis codes
  const followUpSuggestion = getFollowUpSuggestion(diagnosisCodes, isPostOperative);
  const multipleVisits = followUpSuggestion.multipleVisits;
  const suggestedDate = calculateFollowUpDate(followUpSuggestion.interval);
  
  // Auto-populate follow-up date when dialog opens
  useEffect(() => {
    if (isOpen && diagnosisCodes.length > 0) {
      const isoDate = suggestedDate.toISOString().split('T')[0];
      setFollowUpDate(isoDate);
      // Auto-enable follow-up scheduling if suggestion is urgent or critical
      if (followUpSuggestion.urgency === 'urgent' || followUpSuggestion.urgency === 'critical') {
        setAutoScheduleFollowUp(true);
      }
    }
  }, [isOpen, diagnosisCodes, followUpSuggestion.urgency]);

  const hasCriticalErrors = validationChecks.some((check) => check.status === 'failed');
  const hasWarnings = validationChecks.some((check) => check.status === 'warning');

  const handleFinalize = async () => {
    // Validation
    if (hasCriticalErrors) {
      toast.error('Cannot finalize: Please fix all critical errors');
      return;
    }

    if (!pin || pin.length < 4) {
      toast.error('Please enter your 4-6 digit PIN');
      return;
    }

    if (pin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }

    if (!agreed) {
      toast.error('Please confirm that you have reviewed all information');
      return;
    }

    setIsSubmitting(true);
    try {
      await onFinalize(pin, autoScheduleFollowUp ? followUpDate : undefined);
      toast.success('Consultation finalized and digitally signed successfully!');
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Error finalizing consultation:', error);
      toast.error(error.response?.data?.message || 'Failed to finalize consultation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPin('');
    setConfirmPin('');
    setShowPin(false);
    setAgreed(false);
    setAutoScheduleFollowUp(false);
    setFollowUpDate('');
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const getCheckIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <span className="text-amber-600">⚠</span>;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <Dialog.Title className="text-2xl font-bold text-gray-900">
                        Finalize Consultation
                      </Dialog.Title>
                      <p className="text-sm text-gray-600">
                        Digital signature and consultation lock
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {/* Patient & Doctor Info */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Patient:</span>
                        <p className="font-semibold text-gray-900">{patientName}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Doctor:</span>
                        <p className="font-semibold text-gray-900">{doctorName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Validation Checks */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Pre-finalization Validation
                    </h3>
                    <div className="space-y-2">
                      {validationChecks.map((check, index) => (
                        <div
                          key={index}
                          className={`flex items-start space-x-3 p-3 rounded-lg border-2 ${
                            check.status === 'passed'
                              ? 'bg-green-50 border-green-200'
                              : check.status === 'warning'
                              ? 'bg-amber-50 border-amber-200'
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          {getCheckIcon(check.status)}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{check.field}</p>
                            <p className="text-sm text-gray-700">{check.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Consultation Summary */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Consultation Summary
                    </h3>
                    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {summary.chiefComplaint && (
                          <div className="col-span-2 md:col-span-3">
                            <span className="text-sm text-gray-600">Chief Complaint:</span>
                            <p className="font-medium text-gray-900">{summary.chiefComplaint}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-sm text-gray-600">Diagnoses:</span>
                          <p className="text-2xl font-bold text-indigo-600">{summary.diagnoses}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Medications:</span>
                          <p className="text-2xl font-bold text-indigo-600">{summary.medications}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Investigations:</span>
                          <p className="text-2xl font-bold text-indigo-600">
                            {summary.investigations}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Procedures:</span>
                          <p className="text-2xl font-bold text-indigo-600">{summary.procedures}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Referrals:</span>
                          <p className="text-2xl font-bold text-indigo-600">{summary.referrals}</p>
                        </div>
                        {summary.followUpDays && (
                          <div>
                            <span className="text-sm text-gray-600">Follow-up:</span>
                            <p className="text-2xl font-bold text-indigo-600">
                              {summary.followUpDays} days
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Auto-schedule Follow-up with Smart Suggestions */}
                  <div className={`p-4 rounded-lg border-2 ${
                    followUpSuggestion.urgency === 'critical' 
                      ? 'bg-red-50 border-red-300'
                      : followUpSuggestion.urgency === 'urgent'
                      ? 'bg-orange-50 border-orange-300'
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-start space-x-3 mb-3">
                      <span className={`text-2xl flex-shrink-0 mt-1 ${
                        followUpSuggestion.urgency === 'critical' 
                          ? 'text-red-600'
                          : followUpSuggestion.urgency === 'urgent'
                          ? 'text-orange-600'
                          : 'text-blue-600'
                      }`}>💡</span>
                      <div className="flex-1">
                        <p className={`font-semibold ${
                          followUpSuggestion.urgency === 'critical' 
                            ? 'text-red-900'
                            : followUpSuggestion.urgency === 'urgent'
                            ? 'text-orange-900'
                            : 'text-blue-900'
                        }`}>
                          {followUpSuggestion.urgency === 'critical' && '🔴 Critical:'}
                          {followUpSuggestion.urgency === 'urgent' && '🟠 Urgent:'}
                          {followUpSuggestion.urgency === 'routine' && '💡 Recommended:'} Follow-up in{' '}
                          {followUpSuggestion.interval} day{followUpSuggestion.interval !== 1 ? 's' : ''}
                        </p>
                        <p className={`text-sm mt-1 ${
                          followUpSuggestion.urgency === 'critical' 
                            ? 'text-red-800'
                            : followUpSuggestion.urgency === 'urgent'
                            ? 'text-orange-800'
                            : 'text-blue-700'
                        }`}>
                          {followUpSuggestion.reason}
                        </p>
                        <p className={`text-xs mt-1 italic ${
                          followUpSuggestion.urgency === 'critical' 
                            ? 'text-red-700'
                            : followUpSuggestion.urgency === 'urgent'
                            ? 'text-orange-700'
                            : 'text-blue-600'
                        }`}>
                          Suggested date: {formatFollowUpDate(suggestedDate)}
                        </p>
                      </div>
                    </div>

                    {/* Multiple Visit Schedule */}
                    {multipleVisits && multipleVisits.length > 1 && (
                      <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          📅 Multiple follow-up visits recommended:
                        </p>
                        <ul className="space-y-1">
                          {multipleVisits.map((visit, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start">
                              <span className="font-medium text-indigo-600 mr-2">
                                {index + 1}.
                              </span>
                              <span>
                                <strong>{formatFollowUpDate(calculateFollowUpDate(visit.days))}</strong>
                                {' '}({visit.days} day{visit.days !== 1 ? 's' : ''}) - {visit.reason}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-xs text-gray-600 mt-2">
                          ℹ️ First visit will be auto-scheduled. Additional visits can be scheduled later.
                        </p>
                      </div>
                    )}

                    {/* Auto-schedule checkbox */}
                    <label className="flex items-center space-x-3 cursor-pointer mt-3">
                      <input
                        type="checkbox"
                        checked={autoScheduleFollowUp}
                        onChange={(e) => setAutoScheduleFollowUp(e.target.checked)}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Auto-schedule {multipleVisits && multipleVisits.length > 1 ? 'first ' : ''}follow-up appointment
                        </p>
                      </div>
                    </label>

                    {/* Date picker */}
                    {autoScheduleFollowUp && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Follow-up Date *
                        </label>
                        <input
                          type="date"
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          You can adjust the suggested date if needed
                        </p>
                      </div>
                    )}
                  </div>

                  {/* PIN Entry */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <span className="text-indigo-600 text-xl">🔒</span>
                      <span>Digital Signature (PIN)</span>
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Enter Your PIN *
                        </label>
                        <input
                          type={showPin ? 'text' : 'password'}
                          value={pin}
                          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="4-6 digit PIN"
                          maxLength={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm PIN *
                        </label>
                        <input
                          type={showPin ? 'text' : 'password'}
                          value={confirmPin}
                          onChange={(e) =>
                            setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))
                          }
                          placeholder="Re-enter PIN"
                          maxLength={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          disabled={isSubmitting}
                        />
                      </div>
                      <label className="flex items-center space-x-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={showPin}
                          onChange={(e) => setShowPin(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="text-gray-700">Show PIN</span>
                      </label>
                    </div>
                  </div>

                  {/* Agreement */}
                  <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 mt-0.5"
                        disabled={isSubmitting}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          I confirm that I have reviewed all consultation information *
                        </p>
                        <ul className="text-sm text-gray-700 mt-2 space-y-1 list-disc list-inside">
                          <li>All diagnoses, medications, and investigations are accurate</li>
                          <li>Patient counseling and education have been completed</li>
                          <li>
                            Once finalized, this consultation will be{' '}
                            <strong>locked and cannot be edited</strong>
                          </li>
                          <li>Digital signature with PIN will be legally binding</li>
                        </ul>
                      </div>
                    </label>
                  </div>

                  {/* Critical Error Warning */}
                  {hasCriticalErrors && (
                    <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg flex items-start space-x-3">
                      <span className="text-red-600 text-2xl">⚠</span>
                      <div>
                        <p className="font-semibold text-red-900">Cannot Finalize</p>
                        <p className="text-sm text-red-800 mt-1">
                          Please fix all critical errors before finalizing. Critical fields must be
                          completed for legal and medical record compliance.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Warning Notice */}
                  {!hasCriticalErrors && hasWarnings && (
                    <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-lg flex items-start space-x-3">
                      <span className="text-amber-600 text-2xl">⚠</span>
                      <div>
                        <p className="font-semibold text-amber-900">Warnings Detected</p>
                        <p className="text-sm text-amber-800 mt-1">
                          You can proceed, but some fields have warnings. Please review before
                          finalizing.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                  <p className="text-xs text-gray-600">
                    🔒 Finalized consultations are permanently locked for HIPAA compliance
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleFinalize}
                      disabled={isSubmitting || hasCriticalErrors || !agreed || !pin || !confirmPin}
                      className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Finalizing...</span>
                        </>
                      ) : (
                        <>
                          <span className="mr-1">🔒</span>
                          <span>Finalize & Sign</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
