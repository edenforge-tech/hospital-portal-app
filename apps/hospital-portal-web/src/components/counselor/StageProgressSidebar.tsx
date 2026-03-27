/**
 * Stage Progress Sidebar
 * Shows vertical checklist of workflow stages with current status
 */

'use client';

import React from 'react';
import { CheckCircle2, Activity as Circle, Clock, Activity } from 'lucide-react';
import { useCounselingWorkspace } from '@/contexts/CounselingWorkspaceContext';
import type { SessionStage } from '@/lib/widgets/widget-types';

interface StageInfo {
  id: SessionStage;
  label: string;
  description: string;
  icon: React.ReactNode;
}

// Define counselor workflow stages
const COUNSELOR_WORKFLOW_STAGES: StageInfo[] = [
  {
    id: 'initial',
    label: 'Session Started',
    description: 'Review patient info',
    icon: <Circle className="h-5 w-5" />,
  },
  {
    id: 'package-selection',
    label: 'Payment & Package',
    description: 'Select payment mode and package',
    icon: <Circle className="h-5 w-5" />,
  },
  {
    id: 'financial',
    label: 'Financial Counseling',
    description: 'Explain costs and options',
    icon: <Circle className="h-5 w-5" />,
  },
  {
    id: 'completed',
    label: 'Session Completed',
    description: 'Next steps assigned',
    icon: <Circle className="h-5 w-5" />,
  },
];

interface StageProgressSidebarProps {
  sessionDuration?: string; // e.g., "00:12:34"
  className?: string;
}

export function StageProgressSidebar({
  sessionDuration,
  className = '',
}: StageProgressSidebarProps) {
  const { currentStage } = useCounselingWorkspace();

  // Find current stage index
  const currentStageIndex = COUNSELOR_WORKFLOW_STAGES.findIndex((s) => s.id === currentStage);

  return (
    <div className={`bg-white border-r border-gray-200 ${className}`}>
      <div className="p-4">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Workflow Progress</h3>
          {sessionDuration && (
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>{sessionDuration} elapsed</span>
            </div>
          )}
        </div>

        {/* Stage Checklist */}
        <div className="space-y-3">
          {COUNSELOR_WORKFLOW_STAGES.map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const isPending = index > currentStageIndex;

            return (
              <div
                key={stage.id}
                className={`flex items-start space-x-3 p-2 rounded-lg transition-all ${
                  isCurrent
                    ? 'bg-blue-50 border border-blue-200'
                    : isCompleted
                    ? 'bg-green-50'
                    : 'bg-gray-50 opacity-60'
                }`}
              >
                {/* Icon */}
                <div className="flex-shrink-0 pt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : isCurrent ? (
                    <Activity className="h-5 w-5 text-blue-600 animate-pulse" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm font-medium ${
                      isCurrent
                        ? 'text-blue-900'
                        : isCompleted
                        ? 'text-green-900'
                        : 'text-gray-600'
                    }`}
                  >
                    {stage.label}
                  </div>
                  <div
                    className={`text-xs mt-0.5 ${
                      isCurrent
                        ? 'text-blue-700'
                        : isCompleted
                        ? 'text-green-700'
                        : 'text-gray-500'
                    }`}
                  >
                    {stage.description}
                  </div>
                </div>

                {/* Status Badge */}
                {isCurrent && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Current
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-600">
            <div className="flex justify-between mb-1">
              <span>Completed</span>
              <span className="font-medium">{currentStageIndex} of {COUNSELOR_WORKFLOW_STAGES.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-500"
                style={{
                  width: `${(currentStageIndex / COUNSELOR_WORKFLOW_STAGES.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
