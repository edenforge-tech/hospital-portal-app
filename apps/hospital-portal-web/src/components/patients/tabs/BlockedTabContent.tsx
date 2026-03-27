'use client';

import React from 'react';
import { Lock, AlertCircle, ShieldAlert } from 'lucide-react';

interface BlockedTabContentProps {
  tabName: string;
  isCheckedIn: boolean;
  canOverride: boolean;
  onOverrideClick: (tabName: string) => void;
}

export function BlockedTabContent({ tabName, isCheckedIn, canOverride, onOverrideClick }: BlockedTabContentProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="max-w-md text-center">
        <div className="bg-amber-50 border-2 border-amber-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-amber-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          Check-In Required
        </h3>
        <p className="text-gray-600 mb-6">
          Patient must be checked in before accessing <strong>{tabName}</strong>. 
          This ensures proper workflow and billing compliance.
        </p>
        
        {!isCheckedIn && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-left text-sm text-blue-900">
                <p className="font-semibold mb-1">Patient Status: Not Checked In</p>
                <p className="text-blue-700">
                  Please check in the patient from the Patient Directory before proceeding with clinical documentation.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {canOverride && (
          <div className="space-y-3">
            <div className="h-px bg-gray-200" />
            <button
              onClick={() => onOverrideClick(tabName)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors font-medium mx-auto"
            >
              <ShieldAlert className="w-4 h-4" />
              Emergency Override
            </button>
            <p className="text-xs text-gray-500">
              Available for authorized users &middot; Action will be logged
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
