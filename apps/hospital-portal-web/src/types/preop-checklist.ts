/**
 * Pre-Op Checklist Type Definitions
 * LocalStorage-based checklist tracking (no backend storage yet)
 */

export interface PreOpChecklistItem {
  id: string; // Generated UUID
  description: string;
  isCompleted: boolean;
  completedAt?: string;
  completedByUserId?: string;
  notes?: string;
}

export interface SessionChecklist {
  sessionId: string;
  scheduleId?: string;
  surgeryType: string;
  procedureType: string;
  generatedAt: string;
  items: PreOpChecklistItem[];
  completionPercentage: number;
  isFullyCompleted: boolean;
}

// LocalStorage key pattern
export const getChecklistStorageKey = (sessionId: string) => `preop_checklist_${sessionId}`;

// Helper functions for localStorage management
export const saveChecklistToStorage = (checklist: SessionChecklist): void => {
  const key = getChecklistStorageKey(checklist.sessionId);
  localStorage.setItem(key, JSON.stringify(checklist));
};

export const loadChecklistFromStorage = (sessionId: string): SessionChecklist | null => {
  const key = getChecklistStorageKey(sessionId);
  const stored = localStorage.getItem(key);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const deleteChecklistFromStorage = (sessionId: string): void => {
  const key = getChecklistStorageKey(sessionId);
  localStorage.removeItem(key);
};

export const calculateCompletionPercentage = (items: PreOpChecklistItem[]): number => {
  if (items.length === 0) return 0;
  const completedCount = items.filter((item) => item.isCompleted).length;
  return Math.round((completedCount / items.length) * 100);
};
