'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface FormStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  allowSkip?: boolean;
  className?: string;
}

export function FormStepper({
  steps,
  currentStep,
  onStepClick,
  allowSkip = false,
  className,
}: FormStepperProps) {
  const handleStepClick = (index: number) => {
    if (!onStepClick) return;
    
    // Allow going back or skipping forward if allowSkip is true
    if (index < currentStep || (allowSkip && index > currentStep)) {
      onStepClick(index);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isClickable = (index < currentStep || allowSkip) && onStepClick;

            return (
              <li key={step.id} className="relative flex-1">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'absolute top-5 left-1/2 w-full h-0.5 -translate-y-1/2',
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    )}
                    aria-hidden="true"
                  />
                )}

                {/* Step content */}
                <div className="relative flex flex-col items-center group">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => isClickable && handleStepClick(index)}
                    disabled={!isClickable}
                    className={cn(
                      'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 p-0',
                      isCompleted && 'border-primary bg-primary text-primary-foreground',
                      isCurrent && 'border-primary bg-background text-primary',
                      !isCompleted && !isCurrent && 'border-muted bg-background text-muted-foreground',
                      isClickable && 'cursor-pointer hover:border-primary/80'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </Button>

                  <div className="mt-2 text-center">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        isCurrent && 'text-primary',
                        isCompleted && 'text-primary',
                        !isCompleted && !isCurrent && 'text-muted-foreground'
                      )}
                    >
                      {step.title}
                    </p>
                    {step.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

interface FormStepperActionsProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  nextLabel?: string;
  previousLabel?: string;
  submitLabel?: string;
  disableNext?: boolean;
  className?: string;
}

export function FormStepperActions({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSubmit,
  isSubmitting = false,
  nextLabel = 'Next',
  previousLabel = 'Previous',
  submitLabel = 'Submit',
  disableNext = false,
  className,
}: FormStepperActionsProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className={cn('flex items-center justify-between pt-6 border-t', className)}>
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep || isSubmitting}
      >
        {previousLabel}
      </Button>

      {!isLastStep ? (
        <Button
          type="button"
          onClick={onNext}
          disabled={disableNext || isSubmitting}
        >
          {nextLabel}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : submitLabel}
        </Button>
      )}
    </div>
  );
}
