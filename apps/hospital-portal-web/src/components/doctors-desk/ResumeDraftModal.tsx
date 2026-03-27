'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FileText, Trash2, Calendar, Clock, AlertTriangle } from 'lucide-react';

interface ResumeDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResume: () => void;
  onDiscard: () => void;
  draftInfo: {
    savedAt: string;
    expiresAt: string;
    dataPreview?: string;
  } | null;
}

export default function ResumeDraftModal({
  isOpen,
  onClose,
  onResume,
  onDiscard,
  draftInfo,
}: ResumeDraftModalProps) {
  if (!draftInfo) return null;

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    };
  };

  const savedDateTime = formatDateTime(draftInfo.savedAt);
  const expiresDateTime = formatDateTime(draftInfo.expiresAt);

  // Check if expires soon (within 2 hours)
  const expiresInMillis = new Date(draftInfo.expiresAt).getTime() - Date.now();
  const expiresInHours = expiresInMillis / (1000 * 60 * 60);
  const expiresSoon = expiresInHours < 2 && expiresInHours > 0;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Icon */}
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>

                {/* Title */}
                <Dialog.Title
                  as="h3"
                  className="text-lg font-semibold leading-6 text-gray-900 mt-4 text-center"
                >
                  Resume Previous Draft?
                </Dialog.Title>

                {/* Description */}
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-gray-600 text-center">
                    We found an existing draft for this patient's examination. Would you like to continue where you left off or start fresh?
                  </p>

                  {/* Draft Info Card */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {/* Last Saved */}
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Saved</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {savedDateTime.date} at {savedDateTime.time}
                        </p>
                      </div>
                    </div>

                    {/* Expires */}
                    <div className="flex items-start gap-3">
                      <Calendar className={`w-4 h-4 mt-0.5 flex-shrink-0 ${expiresSoon ? 'text-orange-500' : 'text-gray-500'}`} />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expires</p>
                        <p className={`text-sm font-semibold ${expiresSoon ? 'text-orange-600' : 'text-gray-900'}`}>
                          {expiresDateTime.date} at {expiresDateTime.time}
                          {expiresSoon && (
                            <span className="ml-2 text-xs font-normal text-orange-600">
                              (expires soon!)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Data Preview (if available) */}
                    {draftInfo.dataPreview && (
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          {draftInfo.dataPreview}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Warning for expires soon */}
                  {expiresSoon && (
                    <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-orange-800">
                        This draft will expire soon. Resume now to avoid losing your work.
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    className="flex-1 inline-flex justify-center items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                    onClick={onDiscard}
                  >
                    <Trash2 className="w-4 h-4" />
                    Start Fresh
                  </button>
                  <button
                    type="button"
                    className="flex-1 inline-flex justify-center items-center gap-2 rounded-lg border border-transparent bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    onClick={onResume}
                  >
                    <FileText className="w-4 h-4" />
                    Resume Draft
                  </button>
                </div>

                {/* Cancel link */}
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={onClose}
                  >
                    Go back to queue
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
