'use client';

import { useState } from 'react';
import { Dialog, Transition, RadioGroup } from '@headlessui/react';
import { Fragment } from 'react';
import { X, ScanLine, AlertTriangle } from 'lucide-react';

interface ImagingType {
  value: string;
  label: string;
  icon: string;
}

interface OrderImagingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (order: ImagingOrder) => void;
  imagingTypes: ImagingType[];
}

interface ImagingOrder {
  imagingType: string;
  laterality: 'OD' | 'OS' | 'OU';
  urgency: 'routine' | 'urgent' | 'stat';
  notes?: string;
  clinicalIndication: string;
}

export default function OrderImagingDialog({
  isOpen,
  onClose,
  onSubmit,
  imagingTypes,
}: OrderImagingDialogProps) {
  const [selectedType, setSelectedType] = useState('');
  const [laterality, setLaterality] = useState<'OD' | 'OS' | 'OU'>('OU');
  const [urgency, setUrgency] = useState<'routine' | 'urgent' | 'stat'>('routine');
  const [clinicalIndication, setClinicalIndication] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!selectedType || !clinicalIndication.trim()) {
      alert('Please select imaging type and provide clinical indication');
      return;
    }

    const order: ImagingOrder = {
      imagingType: selectedType,
      laterality,
      urgency,
      clinicalIndication: clinicalIndication.trim(),
      notes: notes.trim() || undefined,
    };

    onSubmit(order);
    resetForm();
  };

  const resetForm = () => {
    setSelectedType('');
    setLaterality('OU');
    setUrgency('routine');
    setClinicalIndication('');
    setNotes('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                      <ScanLine className="h-6 w-6 text-indigo-600" />
                    </div>
                    <Dialog.Title className="text-2xl font-bold text-gray-900">
                      Order Imaging Study
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Body */}
                <div className="space-y-6">
                  {/* Imaging Type Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Select Imaging Type *
                    </label>
                    <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                      {imagingTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setSelectedType(type.value)}
                          className={`p-3 text-left border-2 rounded-lg transition-all ${
                            selectedType === type.value
                              ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500'
                              : 'border-gray-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{type.icon}</span>
                            <span
                              className={`text-sm font-medium ${
                                selectedType === type.value
                                  ? 'text-indigo-900'
                                  : 'text-gray-700'
                              }`}
                            >
                              {type.label}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Laterality */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Eye Laterality *
                    </label>
                    <RadioGroup value={laterality} onChange={setLaterality}>
                      <div className="grid grid-cols-3 gap-3">
                        <RadioGroup.Option value="OD">
                          {({ checked }) => (
                            <div
                              className={`p-3 text-center border-2 rounded-lg cursor-pointer transition-all ${
                                checked
                                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                                  : 'border-gray-200 hover:border-blue-300'
                              }`}
                            >
                              <span
                                className={`text-sm font-medium ${
                                  checked ? 'text-blue-900' : 'text-gray-700'
                                }`}
                              >
                                OD (Right Eye)
                              </span>
                            </div>
                          )}
                        </RadioGroup.Option>
                        <RadioGroup.Option value="OS">
                          {({ checked }) => (
                            <div
                              className={`p-3 text-center border-2 rounded-lg cursor-pointer transition-all ${
                                checked
                                  ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500'
                                  : 'border-gray-200 hover:border-purple-300'
                              }`}
                            >
                              <span
                                className={`text-sm font-medium ${
                                  checked ? 'text-purple-900' : 'text-gray-700'
                                }`}
                              >
                                OS (Left Eye)
                              </span>
                            </div>
                          )}
                        </RadioGroup.Option>
                        <RadioGroup.Option value="OU">
                          {({ checked }) => (
                            <div
                              className={`p-3 text-center border-2 rounded-lg cursor-pointer transition-all ${
                                checked
                                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500'
                                  : 'border-gray-200 hover:border-indigo-300'
                              }`}
                            >
                              <span
                                className={`text-sm font-medium ${
                                  checked ? 'text-indigo-900' : 'text-gray-700'
                                }`}
                              >
                                OU (Both Eyes)
                              </span>
                            </div>
                          )}
                        </RadioGroup.Option>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Urgency */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Urgency Level *
                    </label>
                    <RadioGroup value={urgency} onChange={setUrgency}>
                      <div className="grid grid-cols-3 gap-3">
                        <RadioGroup.Option value="routine">
                          {({ checked }) => (
                            <div
                              className={`p-3 text-center border-2 rounded-lg cursor-pointer transition-all ${
                                checked
                                  ? 'border-gray-500 bg-gray-50 ring-2 ring-gray-500'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <span
                                className={`text-sm font-medium ${
                                  checked ? 'text-gray-900' : 'text-gray-700'
                                }`}
                              >
                                Routine
                              </span>
                              <p className="text-xs text-gray-600 mt-1">Within 1-2 weeks</p>
                            </div>
                          )}
                        </RadioGroup.Option>
                        <RadioGroup.Option value="urgent">
                          {({ checked }) => (
                            <div
                              className={`p-3 text-center border-2 rounded-lg cursor-pointer transition-all ${
                                checked
                                  ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500'
                                  : 'border-gray-200 hover:border-amber-300'
                              }`}
                            >
                              <span
                                className={`text-sm font-medium ${
                                  checked ? 'text-amber-900' : 'text-gray-700'
                                }`}
                              >
                                Urgent
                              </span>
                              <p className="text-xs text-gray-600 mt-1">Within 24-48 hours</p>
                            </div>
                          )}
                        </RadioGroup.Option>
                        <RadioGroup.Option value="stat">
                          {({ checked }) => (
                            <div
                              className={`p-3 text-center border-2 rounded-lg cursor-pointer transition-all ${
                                checked
                                  ? 'border-red-500 bg-red-50 ring-2 ring-red-500'
                                  : 'border-gray-200 hover:border-red-300'
                              }`}
                            >
                              <span
                                className={`text-sm font-medium ${
                                  checked ? 'text-red-900' : 'text-gray-700'
                                }`}
                              >
                                STAT
                              </span>
                              <p className="text-xs text-gray-600 mt-1">Immediate</p>
                            </div>
                          )}
                        </RadioGroup.Option>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Clinical Indication */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Clinical Indication *
                    </label>
                    <textarea
                      value={clinicalIndication}
                      onChange={(e) => setClinicalIndication(e.target.value)}
                      placeholder="e.g., Suspected diabetic retinopathy, glaucoma screening, post-op cataract follow-up..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Provide reason for ordering this imaging study (required for insurance/documentation)
                    </p>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special instructions or additional information..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Warning for STAT orders */}
                  {urgency === 'stat' && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-900">
                        <strong>STAT Order:</strong> This will be flagged for immediate processing.
                        Imaging department will be notified immediately. Only use for true emergencies.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-8 flex justify-end gap-3">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedType || !clinicalIndication.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Order
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
