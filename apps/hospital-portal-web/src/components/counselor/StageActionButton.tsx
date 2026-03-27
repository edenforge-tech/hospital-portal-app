/**
 * Stage Action Button
 * Large floating button that shows the next action in the workflow
 */

'use client';

import React from 'react';
import { Activity as ChevronRight, CheckCircle } from 'lucide-react';
import { useCounselingWorkspace } from '@/contexts/CounselingWorkspaceContext';
import type { SessionStage } from '@/lib/widgets/widget-types';

interface StageAction {
  currentStage: SessionStage;
  nextStage: SessionStage;
  label: string;
  description: string;
  icon?: React.ReactNode;
}

// Define stage transitions for counselor workflow
const STAGE_ACTIONS: StageAction[] = [
  {
    currentStage: 'initial',
    nextStage: 'package-selection',
    label: 'Select Payment Mode',
    description: 'Choose how the patient will pay',
  },
  {
    currentStage: 'package-selection',
    nextStage: 'financial',
    label: 'Proceed to Financial Counseling',
    description: 'Explain costs and payment details',
  },
  {
    currentStage: 'financial',
    nextStage: 'completed',
    label: 'Finalize Financial Plan',
    description: 'Complete counseling session',
  },
];

interface StageActionButtonProps {
  onAction?: (nextStage: SessionStage) => void;
  disabled?: boolean;
  className?: string;
}

export function StageActionButton({
  onAction,
  disabled = false,
  className = '',
}: StageActionButtonProps) {
  const { currentStage, setCurrentStage } = useCounselingWorkspace();

  // Find the action for current stage
  const stageAction = STAGE_ACTIONS.find((action) => action.currentStage === currentStage);

  // If no action found (e.g., already completed), don't show button
  if (!stageAction) {
    return null;
  }

  const handleClick = () => {
    if (!disabled && onAction) {
      onAction(stageAction.nextStage);
    } else if (!disabled) {
      // Default: just advance to next stage
      setCurrentStage(stageAction.nextStage);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        fixed bottom-6 right-6 z-50
        flex items-center space-x-3
        px-6 py-4
        bg-gradient-to-r from-blue-600 to-blue-700
        hover:from-blue-700 hover:to-blue-800
        disabled:from-gray-400 disabled:to-gray-500
        text-white
        rounded-lg shadow-lg hover:shadow-xl
        transition-all duration-200
        transform hover:scale-105 active:scale-95
        disabled:cursor-not-allowed disabled:transform-none
        ${className}
      `}
      title={stageAction.description}
    >
      {/* Icon */}
      <div className="flex items-center justify-center w-6 h-6">
        {stageAction.icon || <ChevronRight className="h-6 w-6" />}
      </div>

      {/* Text */}
      <div className="text-left">
        <div className="text-sm font-medium opacity-90">💡 Next:</div>
        <div className="text-base font-semibold">{stageAction.label}</div>
      </div>

      {/* Arrow */}
      <ChevronRight className="h-5 w-5" />
    </button>
  );
}

/**
 * Alternative compact version for inline use
 */
export function InlineStageActionButton({
  onAction,
  disabled = false,
  className = '',
}: StageActionButtonProps) {
  const { currentStage, setCurrentStage } = useCounselingWorkspace();

  const stageAction = STAGE_ACTIONS.find((action) => action.currentStage === currentStage);

  if (!stageAction) {
    return null;
  }

  const handleClick = () => {
    if (!disabled && onAction) {
      onAction(stageAction.nextStage);
    } else if (!disabled) {
      setCurrentStage(stageAction.nextStage);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        w-full flex items-center justify-between
        px-4 py-3
        bg-blue-600 hover:bg-blue-700
        disabled:bg-gray-400
        text-white
        rounded-lg
        transition-colors duration-200
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      <div className="flex items-center space-x-2">
        <CheckCircle className="h-5 w-5" />
        <span className="font-medium">{stageAction.label}</span>
      </div>
      <ChevronRight className="h-5 w-5" />
    </button>
  );
}
