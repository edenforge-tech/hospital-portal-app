/**
 * Stage Progress Header
 * Shows breadcrumb and progress indicator for counseling workflow stages
 */

'use client';

import React from 'react';
import { CheckCircle2, Activity as Circle, Activity as ChevronRight } from 'lucide-react';
import { useCounselingWorkspace } from '@/contexts/CounselingWorkspaceContext';
import type { SessionStage } from '@/lib/widgets/widget-types';

// Define counselor workflow stages in order
const COUNSELOR_STAGES: Array<{
  id: SessionStage;
  label: string;
  description: string;
}> = [
  { id: 'initial', label: 'Session Start', description: 'Review patient information' },
  { id: 'package-selection', label: 'Payment & Package', description: 'Select payment mode and package' },
  { id: 'financial', label: 'Financial Counseling', description: 'Explain costs and payment options' },
  { id: 'completed', label: 'Complete', description: 'Finalize and next steps' },
];

interface StageProgressHeaderProps {
  patientName?: string;
  sessionNumber?: string;
  className?: string;
}

export function StageProgressHeader({
  patientName,
  sessionNumber,
  className = '',
}: StageProgressHeaderProps) {
  const { currentStage } = useCounselingWorkspace();

  // Find current stage index
  const currentStageIndex = COUNSELOR_STAGES.findIndex((s) => s.id === currentStage);

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="px-6 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              📋 Counseling Session
              {patientName && `: ${patientName}`}
              {sessionNumber && <span className="text-gray-500 ml-2">({sessionNumber})</span>}
            </h1>
          </div>
          <div className="text-sm text-gray-600">
            Step {currentStageIndex + 1} of {COUNSELOR_STAGES.length}
          </div>
        </div>

        {/* Progress Breadcrumb */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {COUNSELOR_STAGES.map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const isPending = index > currentStageIndex;

            return (
              <React.Fragment key={stage.id}>
                {/* Stage Item */}
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
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <Circle
                      className={`h-5 w-5 flex-shrink-0 ${
                        isCurrent ? 'text-blue-600 fill-blue-600' : 'text-gray-400'
                      }`}
                    />
                  )}

                  {/* Label */}
                  <div>
                    <div
                      className={`text-sm font-medium ${
                        isCurrent ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-gray-600'
                      }`}
                    >
                      {stage.label}
                    </div>
                    {isCurrent && (
                      <div className="text-xs text-blue-700 mt-0.5">{stage.description}</div>
                    )}
                  </div>
                </div>

                {/* Arrow Separator */}
                {index < COUNSELOR_STAGES.length - 1 && (
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-500 ease-out rounded-full"
                style={{
                  width: `${((currentStageIndex + 1) / COUNSELOR_STAGES.length) * 100}%`,
                }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {Math.round(((currentStageIndex + 1) / COUNSELOR_STAGES.length) * 100)}% Complete
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
