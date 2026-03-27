// PrescriptionValidationModal - Display validation errors and warnings
// Phase 3: Drug Interaction Service

'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  X, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  ShieldAlert,
  CheckCircle2 
} from 'lucide-react';
import type { PrescriptionValidationResult } from '@/types/prescription';

interface PrescriptionValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: (overrideReason?: string) => void;
  validationResult: PrescriptionValidationResult | null;
}

export default function PrescriptionValidationModal({
  isOpen,
  onClose,
  onProceed,
  validationResult,
}: PrescriptionValidationModalProps) {
  const [overrideReason, setOverrideReason] = useState('');

  if (!validationResult) return null;

  const hasErrors = validationResult.errors.length > 0;
  const hasWarnings = validationResult.warnings.length > 0;
  const hasCriticalIssues = hasErrors || validationResult.requiresOverride;

  const handleProceed = () => {
    if (hasCriticalIssues && !overrideReason.trim()) {
      alert('Please provide a reason for overriding this prescription');
      return;
    }
    onProceed(hasCriticalIssues ? overrideReason : undefined);
    setOverrideReason('');
  };

  const handleCancel = () => {
    setOverrideReason('');
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleCancel}>
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
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2"
                  >
                    {hasCriticalIssues ? (
                      <>
                        <ShieldAlert className="h-6 w-6 text-red-600" />
                        Prescription Safety Alert
                      </>
                    ) : hasWarnings ? (
                      <>
                        <AlertTriangle className="h-6 w-6 text-yellow-600" />
                        Prescription Warnings
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                        Prescription Valid
                      </>
                    )}
                  </Dialog.Title>
                  <button
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Validation Summary */}
                <div className="mb-4">
                  {validationResult.isValid && !hasWarnings && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800">
                        ✓ This prescription passed all safety checks and is ready to be added.
                      </p>
                    </div>
                  )}
                  {hasCriticalIssues && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-800 font-medium">
                        ⚠️ Critical safety issues detected. This prescription cannot be processed without physician override.
                      </p>
                    </div>
                  )}
                </div>

                {/* Errors Section */}
                {hasErrors && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-red-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      Critical Errors ({validationResult.errors.length})
                    </h4>
                    <div className="space-y-3">
                      {validationResult.errors.map((error, idx) => (
                        <div
                          key={idx}
                          className="bg-red-50 border-l-4 border-red-600 p-4 rounded"
                        >
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-red-900">
                                {error.medicationName}
                              </p>
                              <p className="text-sm text-red-800 mt-1">{error.message}</p>
                              {error.conflictsWith && (
                                <p className="text-xs text-red-700 mt-2">
                                  <span className="font-medium">Conflicts with:</span> {error.conflictsWith}
                                </p>
                              )}
                              {error.recommendation && (
                                <p className="text-xs text-red-700 mt-1 bg-red-100 p-2 rounded">
                                  <span className="font-medium">Recommendation:</span> {error.recommendation}
                                </p>
                              )}
                            </div>
                            <span className="text-xs px-2 py-1 bg-red-200 text-red-900 rounded font-medium">
                              {error.severity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings Section */}
                {hasWarnings && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      Warnings ({validationResult.warnings.length})
                    </h4>
                    <div className="space-y-3">
                      {validationResult.warnings.map((warning, idx) => (
                        <div
                          key={idx}
                          className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded"
                        >
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-yellow-900">
                                {warning.medicationName}
                              </p>
                              <p className="text-sm text-yellow-800 mt-1">{warning.message}</p>
                              {warning.conflictsWith && (
                                <p className="text-xs text-yellow-700 mt-2">
                                  <span className="font-medium">Conflicts with:</span> {warning.conflictsWith}
                                </p>
                              )}
                              {warning.recommendation && (
                                <p className="text-xs text-yellow-700 mt-1 bg-yellow-100 p-2 rounded">
                                  <span className="font-medium">Recommendation:</span> {warning.recommendation}
                                </p>
                              )}
                              {warning.canOverride && (
                                <p className="text-xs text-yellow-600 mt-2 italic">
                                  ℹ️ This warning can be overridden with clinical justification
                                </p>
                              )}
                            </div>
                            <span className="text-xs px-2 py-1 bg-yellow-200 text-yellow-900 rounded font-medium">
                              {warning.severity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Drug Interactions Section */}
                {validationResult.interactions.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <Info className="h-5 w-5 text-blue-600" />
                      Drug Interactions ({validationResult.interactions.length})
                    </h4>
                    <div className="space-y-2">
                      {validationResult.interactions.map((interaction, idx) => (
                        <div
                          key={idx}
                          className="bg-blue-50 border border-blue-200 p-3 rounded text-sm"
                        >
                          <p className="font-medium text-blue-900">
                            {interaction.drug1Name} ↔ {interaction.drug2Name}
                          </p>
                          <p className="text-blue-800 text-xs mt-1">{interaction.description}</p>
                          {interaction.management && (
                            <p className="text-blue-700 text-xs mt-1 italic">
                              Management: {interaction.management}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Override Reason (if critical issues) */}
                {hasCriticalIssues && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Override Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="Provide clinical justification for overriding these safety checks..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This will be recorded in the audit log for compliance purposes.
                    </p>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProceed}
                    className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
                      hasCriticalIssues
                        ? 'bg-orange-600 hover:bg-orange-700'
                        : hasWarnings
                        ? 'bg-yellow-600 hover:bg-yellow-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {hasCriticalIssues
                      ? 'Override & Proceed'
                      : hasWarnings
                      ? 'Acknowledge & Proceed'
                      : 'Add Medication'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
