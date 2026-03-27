/**
 * Empty State Component
 * Shown when no patient is selected in the counselor workspace
 */

'use client';

import React from 'react';
import { Users, Activity, Clock, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyWorkspaceStateProps {
  waitingCount: number;
  onCallNext?: () => void;
  onOpenSidebar?: () => void;
  className?: string;
}

export function EmptyWorkspaceState({
  waitingCount,
  onCallNext,
  onOpenSidebar,
  className,
}: EmptyWorkspaceStateProps) {
  return (
    <div className={cn('flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-blue-50/30', className)}>
      <div className="text-center max-w-md px-6">
        {/* Icon */}
        <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <Users className="h-12 w-12 text-blue-600" />
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {waitingCount > 0 ? 'Select a patient to begin' : 'No patients in queue'}
        </h2>
        <p className="text-gray-600 mb-8">
          {waitingCount > 0
            ? `You have ${waitingCount} patient${waitingCount === 1 ? '' : 's'} waiting. Select a patient from the queue or call the next patient to start a counseling session.`
            : 'There are currently no patients in the queue. Patients will appear here when they are added to the counselor queue.'}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {waitingCount > 0 && onCallNext && (
            <button
              onClick={onCallNext}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              <Phone className="h-5 w-5" />
              Call Next Patient
            </button>
          )}
          
          {onOpenSidebar && (
            <button
              onClick={onOpenSidebar}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <span>←</span>
              View Queue
            </button>
          )}
        </div>

        {/* Info Cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">Patient Selection</h3>
                <p className="text-xs text-gray-600">
                  Click on any patient in the queue to start their counseling session
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">7-Step Workflow</h3>
                <p className="text-xs text-gray-600">
                  Follow the structured workflow from patient review to session completion
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
