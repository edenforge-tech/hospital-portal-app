/**
 * Step Progress Breadcrumb
 * Shows compact breadcrumb for 7-step counseling workflow
 * Simplified version - no progress bar, just breadcrumb navigation
 */

'use client';

import React from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  User, 
  Activity, 
  Calendar, 
  FileText 
} from 'lucide-react';

// Define 7-step counselor workflow
const COUNSELOR_STEPS = [
  { step: 1, label: 'Demographics', icon: User },
  { step: 2, label: 'Pre-Op', icon: Activity },
  { step: 3, label: 'IOL', icon: Activity },
  { step: 4, label: 'Package', icon: Activity },
  { step: 5, label: 'Imaging', icon: Activity },
  { step: 6, label: 'Surgery', icon: Calendar },
  { step: 7, label: 'Documents', icon: FileText },
];

interface StepProgressBreadcrumbProps {
  currentStep?: number;
  patientName?: string;
  className?: string;
}

export function StepProgressBreadcrumb({
  currentStep = 1,
  patientName,
  className = '',
}: StepProgressBreadcrumbProps) {
  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="px-6 py-2">
        {/* Progress Breadcrumb */}
        <div className="flex items-center space-x-2 overflow-x-auto">
          {COUNSELOR_STEPS.map((step, index) => {
            const isCompleted = step.step < currentStep;
            const isCurrent = step.step === currentStep;
            const StepIcon = step.icon;

            return (
              <React.Fragment key={step.step}>
                {/* Step Item */}
                <div
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                    isCurrent
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : isCompleted
                      ? 'bg-green-50 border border-green-300'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  {/* Icon */}
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <StepIcon
                      className={`h-4 w-4 flex-shrink-0 ${
                        isCurrent ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    />
                  )}

                  {/* Label */}
                  <span
                    className={`text-sm font-medium ${
                      isCurrent ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-gray-600'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Arrow Separator */}
                {index < COUNSELOR_STEPS.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
