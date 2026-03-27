/**
 * Session Controls Component
 * Step navigation and session actions for active counseling sessions
 */

'use client';

import React from 'react';
import { X, CheckCircle, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionControlsProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  patientName?: string;
  sessionId?: string;
  canGoBack?: boolean;
  canGoNext?: boolean;
    onPreviousStep: () => void;
  onNextStep: () => void;
  onSaveSession?: () => void;
  onCompleteSession?: () => void;
  onCancelSession?: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  isSaving?: boolean;
  className?: string;
}

export function SessionControls({
  currentStep,
  totalSteps,
  stepTitle,
  patientName,
  sessionId,
  canGoBack = true,
  canGoNext = true,
  onPreviousStep,
  onNextStep,
  onSaveSession,
  onCompleteSession,
  onCancelSession,
  onToggleFullscreen,
  isFullscreen = false,
  isSaving = false,
  className,
}: SessionControlsProps) {
  return (
    <div className={cn('bg-white border-b border-gray-200', className)}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Step Progress */}
          <div className="flex items-center gap-4">
            {/* Step Breadcrumb */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-gray-300">•</span>
              <h2 className="text-lg font-semibold text-gray-900">{stepTitle}</h2>
              {patientName && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-600">{patientName}</span>
                </>
              )}
            </div>

            {/* Progress Bar */}
            <div className="hidden lg:flex items-center gap-1">
              {Array.from({ length: totalSteps }).map((_, index) => {
                const step = index + 1;
                const isComplete = step < currentStep;
                const isCurrent = step === currentStep;

                return (
                  <div
                    key={step}
                    className={cn(
                      'h-2 w-12 rounded-full transition-all duration-300',
                      isComplete && 'bg-green-500',
                      isCurrent && 'bg-blue-500',
                      !isComplete && !isCurrent && 'bg-gray-200'
                    )}
                    title={`Step ${step}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Save Button */}
            {onSaveSession && (
              <button
                onClick={onSaveSession}
                disabled={isSaving}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm font-medium',
                  'bg-white border border-gray-300 rounded-lg',
                  'hover:bg-gray-50 transition-colors',
                  isSaving && 'opacity-50 cursor-not-allowed'
                )}
              >
              <Activity className={cn('h-4 w-4', isSaving && 'animate-pulse')} />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            )}

            {/* Fullscreen Toggle */}
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                <Activity className="h-4 w-4 text-gray-600" />
              </button>
            )}

            {/* Divider */}
            <div className="h-8 w-px bg-gray-300" />

            {/* Previous Step */}
            <button
              onClick={onPreviousStep}
              disabled={!canGoBack || currentStep === 1}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium',
                'bg-white border border-gray-300 rounded-lg',
                'hover:bg-gray-50 transition-colors',
                (!canGoBack || currentStep === 1) && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span>←</span>
              Previous
            </button>

            {/* Next Step / Complete */}
            {currentStep < totalSteps ? (
              <button
                onClick={onNextStep}
                disabled={!canGoNext}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-semibold',
                  'bg-blue-600 text-white rounded-lg',
                  'hover:bg-blue-700 transition-colors shadow-sm',
                  !canGoNext && 'opacity-50 cursor-not-allowed'
                )}
              >
                Next Step
                <span>→</span>
              </button>
            ) : (
              <button
                onClick={onCompleteSession}
                disabled={!canGoNext}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-semibold',
                  'bg-green-600 text-white rounded-lg',
                  'hover:bg-green-700 transition-colors shadow-sm',
                  !canGoNext && 'opacity-50 cursor-not-allowed'
                )}
              >
                <CheckCircle className="h-4 w-4" />
                Complete Session
              </button>
            )}

            {/* Cancel Session */}
            {onCancelSession && (
              <button
                onClick={onCancelSession}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Mobile Progress Indicators */}
        <div className="lg:hidden mt-3 flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const step = index + 1;
            const isComplete = step < currentStep;
            const isCurrent = step === currentStep;

            return (
              <div
                key={step}
                className={cn(
                  'flex-1 h-2 rounded-full transition-all duration-300',
                  isComplete && 'bg-green-500',
                  isCurrent && 'bg-blue-500',
                  !isComplete && !isCurrent && 'bg-gray-200'
                )}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
