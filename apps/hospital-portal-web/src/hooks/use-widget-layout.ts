/**
 * Widget Layout Hook
 * Manages widget visibility, state, and persistence
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  WidgetLayoutState,
  WidgetConfig,
  WidgetInstance,
  WidgetData,
  SessionStage,
} from '@/lib/widgets/widget-types';
import { WidgetRegistry, getWidgetMetadata } from '@/lib/widgets/widget-registry';
import { getTemplateByStage, getTemplate } from '@/lib/widgets/widget-templates';

const STORAGE_KEY = 'counselor-widget-layout';

/**
 * Default layout state
 */
const DEFAULT_LAYOUT_STATE: WidgetLayoutState = {
  currentStage: 'queue',
  visibleWidgets: [],
  widgetConfigs: {},
  pinnedWidgets: [],
  lastUpdated: new Date(),
};

/**
 * Hook for managing widget layout
 */
export function useWidgetLayout() {
  // State
  const [layoutState, setLayoutState] = useState<WidgetLayoutState>(DEFAULT_LAYOUT_STATE);
  const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [skipAutoSave, setSkipAutoSave] = useState(false);

  /**
   * Load layout from localStorage on mount
   * Skip loading if counselor page has flagged fresh start
   */
  useEffect(() => {
    const skipCache = sessionStorage.getItem('skip-widget-cache');
    
    if (skipCache === 'true') {
      console.log('📂 Skipping localStorage cache (fresh counselor session)');
      sessionStorage.removeItem('skip-widget-cache');
      setIsLoading(false);
      return;
    }
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        console.log('📂 Loading widget layout from localStorage...');
        const parsed = JSON.parse(stored);
        setLayoutState({
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated),
        });
      } else {
        console.log('📂 No cached layout found - using defaults');
      }
    } catch (error) {
      console.error('Failed to load widget layout:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Save layout to localStorage whenever it changes
   */
  const saveLayout = useCallback(() => {
    // Don't save if skip flag is set (during template application)
    const skipSave = sessionStorage.getItem('skip-widget-autosave');
    if (skipSave === 'true') {
      console.log('📂 Skipping auto-save (template application in progress)');
      return;
    }
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...layoutState,
        lastUpdated: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to save widget layout:', error);
    }
  }, [layoutState]);

  /**
   * Auto-save layout on changes (debounced)
   */
  useEffect(() => {
    if (isLoading || skipAutoSave) return;
    
    const timer = setTimeout(() => {
      saveLayout();
    }, 1000);

    return () => clearTimeout(timer);
  }, [layoutState, isLoading, skipAutoSave, saveLayout]);

  /**
   * Initialize widgets from visible widget IDs
   */
  useEffect(() => {
    const instances: WidgetInstance[] = layoutState.visibleWidgets
      .map((widgetId) => {
        const metadata = getWidgetMetadata(widgetId);
        if (!metadata) return null;

        const configOverride = layoutState.widgetConfigs[widgetId] || {};
        const isPinned = layoutState.pinnedWidgets.includes(widgetId);

        const config: WidgetConfig = {
          ...metadata,
          isVisible: true,
          isMinimized: false,
          isPinned,
          currentSize: configOverride.currentSize || metadata.defaultSize,
          position: configOverride.position,
          order: configOverride.order || 0,
          ...configOverride,
        };

        return {
          widgetId,
          config,
          data: {},
          lastUpdated: new Date(),
        };
      })
      .filter(Boolean) as WidgetInstance[];

    // Sort by order
    instances.sort((a, b) => a.config.order - b.config.order);

    setWidgets(instances);
  }, [layoutState.visibleWidgets, layoutState.widgetConfigs, layoutState.pinnedWidgets]);

  /**
   * Add widget to layout
   */
  const addWidget = useCallback((widgetId: string, config?: Partial<WidgetConfig>) => {
    setLayoutState((prev) => {
      // Don't add if already visible
      if (prev.visibleWidgets.includes(widgetId)) {
        return prev;
      }

      return {
        ...prev,
        visibleWidgets: [...prev.visibleWidgets, widgetId],
        widgetConfigs: {
          ...prev.widgetConfigs,
          [widgetId]: config || {},
        },
        lastUpdated: new Date(),
      };
    });
  }, []);

  /**
   * Remove widget from layout
   */
  const removeWidget = useCallback((widgetId: string) => {
    setLayoutState((prev) => ({
      ...prev,
      visibleWidgets: prev.visibleWidgets.filter((id) => id !== widgetId),
      pinnedWidgets: prev.pinnedWidgets.filter((id) => id !== widgetId),
      lastUpdated: new Date(),
    }));
  }, []);

  /**
   * Update widget configuration
   */
  const updateWidget = useCallback((widgetId: string, config: Partial<WidgetConfig>) => {
    setLayoutState((prev) => ({
      ...prev,
      widgetConfigs: {
        ...prev.widgetConfigs,
        [widgetId]: {
          ...prev.widgetConfigs[widgetId],
          ...config,
        },
      },
      lastUpdated: new Date(),
    }));
  }, []);

  /**
   * Update widget data
   */
  const updateWidgetData = useCallback((widgetId: string, data: Partial<WidgetData>) => {
    setWidgets((prev) =>
      prev.map((widget) =>
        widget.widgetId === widgetId
          ? {
              ...widget,
              data: { ...widget.data, ...data },
              lastUpdated: new Date(),
            }
          : widget
      )
    );
  }, []);

  /**
   * Minimize widget
   */
  const minimizeWidget = useCallback((widgetId: string) => {
    updateWidget(widgetId, { isMinimized: true });
  }, [updateWidget]);

  /**
   * Maximize widget
   */
  const maximizeWidget = useCallback((widgetId: string) => {
    updateWidget(widgetId, { isMinimized: false });
  }, [updateWidget]);

  /**
   * Pin widget (always visible)
   */
  const pinWidget = useCallback((widgetId: string) => {
    setLayoutState((prev) => ({
      ...prev,
      pinnedWidgets: [...new Set([...prev.pinnedWidgets, widgetId])],
      lastUpdated: new Date(),
    }));
  }, []);

  /**
   * Unpin widget
   */
  const unpinWidget = useCallback((widgetId: string) => {
    setLayoutState((prev) => ({
      ...prev,
      pinnedWidgets: prev.pinnedWidgets.filter((id) => id !== widgetId),
      lastUpdated: new Date(),
    }));
  }, []);

  /**
   * Resize widget
   */
  const resizeWidget = useCallback((widgetId: string, size: string) => {
    updateWidget(widgetId, { currentSize: size as any });
  }, [updateWidget]);

  /**
   * Set active patient
   */
  const setActivePatient = useCallback((patientId: string | undefined) => {
    setLayoutState((prev) => ({
      ...prev,
      activePatientId: patientId,
      lastUpdated: new Date(),
    }));
  }, []);

  /**
   * Set active session
   */
  const setActiveSession = useCallback((sessionId: string | undefined) => {
    setLayoutState((prev) => ({
      ...prev,
      activeSessionId: sessionId,
      lastUpdated: new Date(),
    }));
  }, []);

  /**
   * Set current session stage
   */
  const setCurrentStage = useCallback((stage: SessionStage) => {
    setLayoutState((prev) => ({
      ...prev,
      currentStage: stage,
      lastUpdated: new Date(),
    }));
  }, []);

  /**
   * Apply widget template
   */
  const applyTemplate = useCallback((templateId: string) => {
    // Clear localStorage first to prevent stale data interference
    localStorage.removeItem(STORAGE_KEY);
    console.log('🧹 [applyTemplate] Cleared localStorage before applying template');
    
    // Try to get template by ID first, fallback to stage-based lookup
    const template = getTemplate(templateId) || getTemplateByStage(templateId as SessionStage);
    if (!template) {
      console.error('❌ Template not found:', templateId);
      return;
    }
    console.log('✅ Applying template:', templateId, template);
    console.log('📋 Template widgets:', template.widgets.map(w => `${w.widgetId} (order: ${w.order})`));

    const visibleWidgets = template.widgets.map((w) => w.widgetId);
    const widgetConfigs: Record<string, Partial<WidgetConfig>> = {};
    const pinnedWidgets: string[] = [];

    template.widgets.forEach((w) => {
      widgetConfigs[w.widgetId] = {
        currentSize: w.size,
        order: w.order,
      };
      if (w.isPinned) {
        pinnedWidgets.push(w.widgetId);
      }
    });

    setLayoutState((prev) => ({
      ...prev,
      visibleWidgets,
      widgetConfigs,
      pinnedWidgets,
      currentStage: template.stage,
      lastUpdated: new Date(),
    }));
    
    console.log('✅ Template applied successfully. Visible widgets:', visibleWidgets);
  }, []);

  /**
   * Reset layout to default
   */
  const resetLayout = useCallback(() => {
    setLayoutState(DEFAULT_LAYOUT_STATE);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  /**
   * Load layout from storage
   */
  const loadLayout = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setLayoutState({
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated),
        });
      }
    } catch (error) {
      console.error('Failed to load widget layout:', error);
    }
  }, []);

  /**
   * Get widgets available for current stage
   */
  const availableWidgets = useMemo(() => {
    return WidgetRegistry.getByStage(layoutState.currentStage);
  }, [layoutState.currentStage]);

  /**
   * Check if widget is visible
   */
  const isWidgetVisible = useCallback(
    (widgetId: string) => {
      return layoutState.visibleWidgets.includes(widgetId);
    },
    [layoutState.visibleWidgets]
  );

  /**
   * Check if widget is pinned
   */
  const isWidgetPinned = useCallback(
    (widgetId: string) => {
      return layoutState.pinnedWidgets.includes(widgetId);
    },
    [layoutState.pinnedWidgets]
  );

  /**
   * Get widget instance by ID
   */
  const getWidgetInstance = useCallback(
    (widgetId: string) => {
      return widgets.find((w) => w.widgetId === widgetId);
    },
    [widgets]
  );

  return {
    // State
    layoutState,
    widgets,
    availableWidgets,
    isLoading,

    // Actions
    addWidget,
    removeWidget,
    updateWidget,
    updateWidgetData,
    minimizeWidget,
    maximizeWidget,
    pinWidget,
    unpinWidget,
    resizeWidget,

    // Context
    setActivePatient,
    setActiveSession,
    setCurrentStage,

    // Templates
    applyTemplate,
    resetLayout,

    // Persistence
    saveLayout,
    loadLayout,

    // Utilities
    isWidgetVisible,
    isWidgetPinned,
    getWidgetInstance,
  };
}

export type UseWidgetLayoutReturn = ReturnType<typeof useWidgetLayout>;
