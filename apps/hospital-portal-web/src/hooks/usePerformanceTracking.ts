/**
 * Performance Tracking Hook
 * Custom hook for measuring and recording performance metrics
 */

import { useCallback, useEffect, useRef } from 'react';

export interface PerformanceEntry {
  name: string;
  type: 'mark' | 'measure';
  duration?: number;
  startTime: number;
}

export function usePerformanceTracking() {
  const marksRef = useRef<Map<string, number>>(new Map());

  /**
   * Start measuring a performance metric
   */
  const startMeasure = useCallback((name: string) => {
    const startTime = performance.now();
    marksRef.current.set(name, startTime);
    
    // Create performance mark
    try {
      performance.mark(`${name}-start`);
    } catch (error) {
      console.warn('Performance API not available:', error);
    }
  }, []);

  /**
   * End measuring and record the duration
   */
  const endMeasure = useCallback((name: string) => {
    const startTime = marksRef.current.get(name);
    if (!startTime) {
      console.warn(`No start mark found for: ${name}`);
      return;
    }

    const duration = performance.now() - startTime;
    marksRef.current.delete(name);

    // Create performance measure
    try {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    } catch (error) {
      console.warn('Performance API not available:', error);
    }

    return duration;
  }, []);

  /**
   * Track DICOM file load performance
   */
  const trackDicomLoad = useCallback(
    async (loadFn: () => Promise<any>, fileName: string) => {
      startMeasure(`dicom-load-${fileName}`);
      
      try {
        const result = await loadFn();
        const duration = endMeasure(`dicom-load-${fileName}`);
        
        console.log(`[Performance] DICOM load (${fileName}): ${duration?.toFixed(2)}ms`);
        
        return result;
      } catch (error) {
        endMeasure(`dicom-load-${fileName}`);
        throw error;
      }
    },
    [startMeasure, endMeasure]
  );

  /**
   * Track viewport render performance
   */
  const trackViewportRender = useCallback(
    (renderFn: () => void) => {
      startMeasure('viewport-render');
      
      try {
        renderFn();
        const duration = endMeasure('viewport-render');
        
        if (duration && duration > 100) {
          console.warn(`[Performance] Slow render detected: ${duration.toFixed(2)}ms`);
        }
      } catch (error) {
        endMeasure('viewport-render');
        throw error;
      }
    },
    [startMeasure, endMeasure]
  );

  /**
   * Track Web Worker task processing
   */
  const trackWorkerTask = useCallback(
    async (task: () => Promise<any>, taskName: string = 'worker-task') => {
      startMeasure(`worker-process-${taskName}`);
      
      try {
        const result = await task();
        const duration = endMeasure(`worker-process-${taskName}`);
        
        console.log(`[Performance] Worker task (${taskName}): ${duration?.toFixed(2)}ms`);
        
        return result;
      } catch (error) {
        endMeasure(`worker-process-${taskName}`);
        throw error;
      }
    },
    [startMeasure, endMeasure]
  );

  /**
   * Track annotation creation performance
   */
  const trackAnnotationCreation = useCallback(
    (creationFn: () => void, annotationType: string) => {
      startMeasure(`annotation-create-${annotationType}`);
      
      try {
        creationFn();
        const duration = endMeasure(`annotation-create-${annotationType}`);
        
        console.log(`[Performance] Annotation created (${annotationType}): ${duration?.toFixed(2)}ms`);
      } catch (error) {
        endMeasure(`annotation-create-${annotationType}`);
        throw error;
      }
    },
    [startMeasure, endMeasure]
  );

  /**
   * Get all recorded performance entries
   */
  const getPerformanceEntries = useCallback((filterName?: string) => {
    const entries = performance.getEntriesByType('measure');
    
    if (filterName) {
      return entries.filter(entry => entry.name.includes(filterName));
    }
    
    return entries;
  }, []);

  /**
   * Clear all performance measurements
   */
  const clearPerformanceData = useCallback(() => {
    try {
      performance.clearMarks();
      performance.clearMeasures();
      marksRef.current.clear();
      console.log('[Performance] All metrics cleared');
    } catch (error) {
      console.warn('Failed to clear performance data:', error);
    }
  }, []);

  /**
   * Get memory usage (if available)
   */
  const getMemoryUsage = useCallback(() => {
    const memoryAPI = (performance as any).memory;
    
    if (!memoryAPI) {
      return null;
    }

    return {
      usedJSHeapSize: memoryAPI.usedJSHeapSize,
      totalJSHeapSize: memoryAPI.totalJSHeapSize,
      jsHeapSizeLimit: memoryAPI.jsHeapSizeLimit,
      percentage: (memoryAPI.usedJSHeapSize / memoryAPI.jsHeapSizeLimit) * 100,
    };
  }, []);

  /**
   * Export performance data to console
   */
  const logPerformanceSummary = useCallback(() => {
    const measures = performance.getEntriesByType('measure');
    
    console.group('[Performance Summary]');
    
    // Group by type
    const dicomLoads = measures.filter(m => m.name.includes('dicom-load'));
    const renders = measures.filter(m => m.name.includes('viewport-render'));
    const workers = measures.filter(m => m.name.includes('worker-process'));
    const annotations = measures.filter(m => m.name.includes('annotation-create'));

    if (dicomLoads.length > 0) {
      console.log('DICOM Loads:', {
        count: dicomLoads.length,
        avgDuration: dicomLoads.reduce((sum, m) => sum + m.duration, 0) / dicomLoads.length,
        totalDuration: dicomLoads.reduce((sum, m) => sum + m.duration, 0),
      });
    }

    if (renders.length > 0) {
      console.log('Viewport Renders:', {
        count: renders.length,
        avgDuration: renders.reduce((sum, m) => sum + m.duration, 0) / renders.length,
        fps: Math.round(1000 / (renders.reduce((sum, m) => sum + m.duration, 0) / renders.length)),
      });
    }

    if (workers.length > 0) {
      console.log('Worker Tasks:', {
        count: workers.length,
        avgDuration: workers.reduce((sum, m) => sum + m.duration, 0) / workers.length,
      });
    }

    if (annotations.length > 0) {
      console.log('Annotations:', {
        count: annotations.length,
        avgDuration: annotations.reduce((sum, m) => sum + m.duration, 0) / annotations.length,
      });
    }

    const memory = getMemoryUsage();
    if (memory) {
      console.log('Memory Usage:', {
        usedMB: (memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
        limitMB: (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2),
        percentage: memory.percentage.toFixed(2) + '%',
      });
    }

    console.groupEnd();
  }, [getMemoryUsage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      marksRef.current.clear();
    };
  }, []);

  return {
    startMeasure,
    endMeasure,
    trackDicomLoad,
    trackViewportRender,
    trackWorkerTask,
    trackAnnotationCreation,
    getPerformanceEntries,
    clearPerformanceData,
    getMemoryUsage,
    logPerformanceSummary,
  };
}
