/**
 * Counseling Workspace Context
 * Provides widget state management and patient/session context for the counselor workspace
 */

'use client';

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useWidgetLayout } from '@/hooks/use-widget-layout';
import { useRouter } from 'next/navigation';
import type { WidgetContextValue } from '@/lib/widgets/widget-types';

const CounselingWorkspaceContext = createContext<WidgetContextValue | null>(null);

export interface CounselingWorkspaceProviderProps {
  children: React.ReactNode;
  initialPatientId?: string;
  initialSessionId?: string;
}

/**
 * Provider component for counseling workspace
 * Manages widget layout, patient/session context, and widget actions
 */
export function CounselingWorkspaceProvider({
  children,
  initialPatientId,
  initialSessionId,
}: CounselingWorkspaceProviderProps) {
  const router = useRouter();
  const widgetLayout = useWidgetLayout();

  // Initialize with patient/session if provided
  React.useEffect(() => {
    if (initialPatientId && initialPatientId !== widgetLayout.layoutState.activePatientId) {
      widgetLayout.setActivePatient(initialPatientId);
    }
    if (initialSessionId && initialSessionId !== widgetLayout.layoutState.activeSessionId) {
      widgetLayout.setActiveSession(initialSessionId);
    }
  }, [initialPatientId, initialSessionId]);

  /**
   * Handle widget actions
   */
  const handleWidgetAction = useCallback(
    (widgetId: string, action: { type: string; payload?: unknown; timestamp: Date }) => {
      switch (action.type) {
        case 'CALL_NEXT_PATIENT':
          // Navigate to queue or trigger call next patient API
          router.push('/dashboard/counselor/queue');
          break;

        case 'VIEW_QUEUE':
          router.push('/dashboard/counselor/queue');
          break;

        case 'START_SESSION':
          // Transition from queue to initial consultation stage
          widgetLayout.setCurrentStage('initial');
          widgetLayout.applyTemplate('initial');
          break;

        case 'PAUSE_SESSION':
          // Handle session pause
          console.log('Session paused', action);
          break;

        case 'RESUME_SESSION':
          // Handle session resume
          console.log('Session resumed', action);
          break;

        case 'COMPLETE_STAGE':
          // Move to next stage
          const currentStage = widgetLayout.layoutState.currentStage;
          const stageTransitions = {
            initial: 'package-selection',
            'clinical-review': 'package-selection',
            'package-selection': 'iol-selection',
            'iol-selection': 'financial',
            financial: 'consent',
            consent: 'pre-surgery',
            'pre-surgery': 'scheduling',
            scheduling: 'admission',
            admission: 'completed',
            followup: 'completed',
          };
          
          const nextStage = stageTransitions[currentStage as keyof typeof stageTransitions];
          if (nextStage) {
            widgetLayout.setCurrentStage(nextStage as any);
            // Auto-apply template for new stage
            widgetLayout.applyTemplate(nextStage);
          }
          break;

        case 'NAVIGATE_TO_STAGE':
          // Direct navigation to specific stage
          if (action.payload && typeof action.payload === 'string') {
            widgetLayout.setCurrentStage(action.payload as any);
            widgetLayout.applyTemplate(action.payload);
          }
          break;

        default:
          console.log(`Unhandled widget action: ${action.type}`, action);
      }
    },
    [router, widgetLayout]
  );

  /**
   * Context value with widget actions wrapped to handle global actions
   */
  const contextValue: WidgetContextValue = useMemo(
    () => ({
      // State from useWidgetLayout
      layoutState: widgetLayout.layoutState,
      widgets: widgetLayout.widgets,
      activePatientId: widgetLayout.layoutState.activePatientId,
      activeSessionId: widgetLayout.layoutState.activeSessionId,
      currentStage: widgetLayout.layoutState.currentStage,

      // Actions from useWidgetLayout
      addWidget: widgetLayout.addWidget,
      removeWidget: widgetLayout.removeWidget,
      updateWidget: widgetLayout.updateWidget,
      updateWidgetData: widgetLayout.updateWidgetData,
      minimizeWidget: widgetLayout.minimizeWidget,
      maximizeWidget: widgetLayout.maximizeWidget,
      pinWidget: widgetLayout.pinWidget,
      unpinWidget: widgetLayout.unpinWidget,
      resizeWidget: widgetLayout.resizeWidget,
      setActivePatient: widgetLayout.setActivePatient,
      setActiveSession: widgetLayout.setActiveSession,
      setCurrentStage: widgetLayout.setCurrentStage,
      applyTemplate: widgetLayout.applyTemplate,
      resetLayout: widgetLayout.resetLayout,
      saveLayout: widgetLayout.saveLayout,
      loadLayout: widgetLayout.loadLayout,
    }),
    [widgetLayout]
  );

  return (
    <CounselingWorkspaceContext.Provider value={contextValue}>
      {children}
    </CounselingWorkspaceContext.Provider>
  );
}

/**
 * Hook to use counseling workspace context
 * Must be used within CounselingWorkspaceProvider
 */
export function useCounselingWorkspace() {
  const context = useContext(CounselingWorkspaceContext);
  
  if (!context) {
    throw new Error(
      'useCounselingWorkspace must be used within CounselingWorkspaceProvider'
    );
  }
  
  return context;
}

/**
 * Hook to get current active patient ID
 */
export function useActivePatient() {
  const { activePatientId, setActivePatient } = useCounselingWorkspace();
  return { activePatientId, setActivePatient };
}

/**
 * Hook to get current active session ID
 */
export function useActiveSession() {
  const { activeSessionId, setActiveSession } = useCounselingWorkspace();
  return { activeSessionId, setActiveSession };
}

/**
 * Hook to get current session stage
 */
export function useSessionStage() {
  const { currentStage, setCurrentStage } = useCounselingWorkspace();
  return { currentStage, setCurrentStage };
}

/**
 * Hook to manage widgets for current context
 */
export function useWorkspaceWidgets() {
  const {
    widgets,
    addWidget,
    removeWidget,
    updateWidget,
    updateWidgetData,
    minimizeWidget,
    maximizeWidget,
    pinWidget,
    unpinWidget,
    resizeWidget,
  } = useCounselingWorkspace();

  return {
    widgets,
    addWidget,
    removeWidget,
    updateWidget,
    updateWidgetData,
    minimizeWidget,
    maximizeWidget,
    pinWidget,
    unpinWidget,
    resizeWidget,
  };
}
