/**
 * Auto-Save Hook for Doctor's Examination Forms
 * 
 * Automatically saves form data to backend every 30 seconds
 * with debounce to prevent excessive API calls.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';

interface AutoSaveOptions {
  /** Delay in milliseconds before auto-saving (default: 30000ms = 30 seconds) */
  delay?: number;
  /** Function to save data - should return a promise */
  onSave: (data: any) => Promise<void>;
  /** Data to save */
  data: any;
  /** Enable/disable auto-save */
  enabled?: boolean;
  /** Show toast notification on save */
  showToast?: boolean;
  /** Debounce user changes (wait for user to stop typing) */
  debounceChanges?: boolean;
  /** Debounce delay for changes in milliseconds (default: 2000ms = 2 seconds) */
  debounceDelay?: number;
}

interface AutoSaveReturn {
  /** Manually trigger save */
  saveNow: () => Promise<void>;
  /** Last save timestamp */
  lastSaved: Date | null;
  /** Whether a save is in progress */
  isSaving: boolean;
  /** Whether data has changed since last save */
  hasUnsavedChanges: boolean;
}

export function useAutoSave({
  delay = 30000, // 30 seconds
  onSave,
  data,
  enabled = true,
  showToast = true,
  debounceChanges = true,
  debounceDelay = 2000, // 2 seconds
}: AutoSaveOptions): AutoSaveReturn {
  const lastSavedDataRef = useRef<string>('');
  const lastSavedTimeRef = useRef<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const mountedRef = useRef(true);

  // Check if data has changed
  const hasUnsavedChanges = useCallback(() => {
    const currentDataStr = JSON.stringify(data);
    return currentDataStr !== lastSavedDataRef.current;
  }, [data]);

  // Manual save function
  const saveNow = useCallback(async () => {
    if (isSavingRef.current || !enabled) {
      return;
    }

    if (!hasUnsavedChanges()) {
      console.log('⏭️ AutoSave: No changes detected, skipping save');
      return;
    }

    try {
      isSavingRef.current = true;
      console.log('💾 AutoSave: Saving data...', {
        timestamp: new Date().toISOString(),
        dataSize: JSON.stringify(data).length,
      });

      await onSave(data);

      if (mountedRef.current) {
        lastSavedDataRef.current = JSON.stringify(data);
        lastSavedTimeRef.current = new Date();

        if (showToast) {
          const timeStr = lastSavedTimeRef.current.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          });
          toast.success(`Draft saved at ${timeStr}`, {
            duration: 2000,
            icon: '💾',
          });
        }

        console.log('✅ AutoSave: Save successful', {
          timestamp: lastSavedTimeRef.current.toISOString(),
        });
      }
    } catch (error) {
      console.error('❌ AutoSave: Save failed', error);
      if (mountedRef.current && showToast) {
        toast.error('Failed to save draft');
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [data, onSave, enabled, showToast, hasUnsavedChanges]);

  // Setup auto-save timer
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }

    // Set up periodic auto-save
    autoSaveTimerRef.current = setInterval(() => {
      if (!isSavingRef.current && hasUnsavedChanges()) {
        console.log('⏰ AutoSave: Timer triggered');
        saveNow();
      }
    }, delay);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [delay, enabled, saveNow, hasUnsavedChanges]);

  // Setup debounce for immediate changes (e.g., after 2 seconds of no typing)
  useEffect(() => {
    if (!enabled || !debounceChanges) {
      return;
    }

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Only debounce if there are unsaved changes
    if (hasUnsavedChanges()) {
      debounceTimerRef.current = setTimeout(() => {
        if (!isSavingRef.current) {
          console.log('⌨️ AutoSave: Debounce triggered (user stopped typing)');
          saveNow();
        }
      }, debounceDelay);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [data, debounceChanges, debounceDelay, enabled, saveNow, hasUnsavedChanges]);

  // Save on unmount (when user leaves page)
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      
      // Attempt to save before unmounting
      if (hasUnsavedChanges() && !isSavingRef.current) {
        console.log('👋 AutoSave: Component unmounting, attempting final save');
        // Use synchronous approach or beacon API for unmount save
        saveNow();
      }
    };
  }, [saveNow, hasUnsavedChanges]);

  return {
    saveNow,
    lastSaved: lastSavedTimeRef.current,
    isSaving: isSavingRef.current,
    hasUnsavedChanges: hasUnsavedChanges(),
  };
}

/**
 * Simple debounce utility hook
 * Useful for debouncing input changes
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
