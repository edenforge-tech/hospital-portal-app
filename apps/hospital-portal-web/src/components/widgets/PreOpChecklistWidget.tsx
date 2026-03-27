/**
 * Pre-Op Checklist Widget
 * Test ordering, fitness certificate, physician approval, and completion tracking
 */

'use client';

import React, { useState, useEffect } from 'react';
import { FileText as ClipboardList, CheckCircle2 as Check, AlertCircle, X as Upload, FileText, Activity, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/lib/widgets/widget-types';
import { widgetsApi, type ChecklistItem as ChecklistItemAPI } from '@/lib/api/widgets.api';

// Use API type with Date variant
type ChecklistItem = ChecklistItemAPI & {
  completedAt?: Date;
  remarks?: string;
};

export default function PreOpChecklistWidget({
  widgetId,
  patientId,
  sessionId,
  size,
  isMinimized,
  data,
  onAction,
  onDataChange,
}: WidgetProps) {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load checklist from API
  useEffect(() => {
    if (patientId) loadChecklist();
  }, [patientId]);

  const loadChecklist = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await widgetsApi.getPreOpChecklist(patientId!);
      // Map API items to widget format (convert completedAt to Date)
      const mappedItems = items.map(item => ({
        ...item,
        completedAt: item.completedAt ? (typeof item.completedAt === 'string' ? new Date(item.completedAt) : item.completedAt) : undefined,
      })) as ChecklistItem[];
      setChecklistItems(mappedItems);
    } catch (err: any) {
      console.error('Failed to load checklist:', err);
      setError(err.message || 'Failed to load checklist');
      // Fallback to mock data
      setChecklistItems([
        // Tests
        { id: 'test1', category: 'tests', name: 'Complete Blood Count (CBC)', description: 'Hemoglobin, WBC, Platelet count', required: true, completed: false },
        { id: 'test2', category: 'tests', name: 'Random Blood Sugar (RBS)', description: 'To check diabetes status', required: true, completed: false },
        { id: 'test3', category: 'tests', name: 'HBsAg (Hepatitis B)', description: 'Infection screening', required: true, completed: false },
        { id: 'test4', category: 'tests', name: 'HIV Screening', description: 'Infection screening', required: true, completed: false },
        { id: 'test5', category: 'tests', name: 'ECG (Electrocardiogram)', description: 'Heart function assessment', required: true, completed: false },
        { id: 'test6', category: 'tests', name: 'Chest X-Ray', description: 'Only if patient >60 years', required: false, completed: false },
        
        // Documents
        { id: 'doc1', category: 'documents', name: 'Fitness Certificate', description: 'From physician clearing for surgery', required: true, completed: false },
        { id: 'doc2', category: 'documents', name: 'Latest Eye Examination', description: 'Within last 7 days', required: true, completed: false },
        { id: 'doc3', category: 'documents', name: 'Insurance Pre-Auth (if applicable)', description: 'Approval letter from TPA', required: false, completed: false },
        
        // Approvals
        { id: 'approval1', category: 'approvals', name: 'Physician Clearance', description: 'Reviewed by anesthesiologist', required: true, completed: false },
        { id: 'approval2', category: 'approvals', name: 'Surgeon Review', description: 'Final pre-op review by surgeon', required: true, completed: false },
        
        // Instructions
        { id: 'inst1', category: 'instructions', name: 'Fasting Instructions Given', description: 'No food/water 6 hours before surgery', required: true, completed: false },
        { id: 'inst2', category: 'instructions', name: 'Eye Drop Schedule Explained', description: 'Pre-op antibiotic drops', required: true, completed: false },
        { id: 'inst3', category: 'instructions', name: 'Post-Op Care Explained', description: 'Rest, eye protection, follow-up', required: true, completed: false },
        { id: 'inst4', category: 'instructions', name: 'Escort Confirmed', description: 'Patient arranged for escort', required: true, completed: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Activity className="h-6 w-6 text-blue-500 animate-spin" />
        <span className="ml-2 text-sm text-gray-500">Loading checklist...</span>
      </div>
    );
  }

  if (error && !checklistItems.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={loadChecklist}
          className="mt-3 text-xs text-blue-600 hover:text-blue-700 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!checklistItems.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <ClipboardList className="h-10 w-10 text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">No checklist items</p>
      </div>
    );
  }

  const categoryConfig = {
    tests: { label: 'Lab Tests', color: 'purple', icon: Activity },
    documents: { label: 'Documents', color: 'blue', icon: FileText },
    approvals: { label: 'Approvals', color: 'green', icon: Check },
    instructions: { label: 'Patient Instructions', color: 'orange', icon: AlertCircle },
  };

  const handleToggleItem = async (itemId: string) => {
    const item = checklistItems.find(i => i.id === itemId);
    if (!item) return;

    const newCompleted = !item.completed;
    
    // Optimistic update
    setChecklistItems((items) =>
      items.map((i) => {
        if (i.id === itemId) {
          return {
            ...i,
            completed: newCompleted,
            completedAt: newCompleted ? new Date() : undefined,
          };
        }
        return i;
      })
    );

    // API call to update
    try {
      await widgetsApi.updateChecklistItem(patientId!, itemId, newCompleted);
      onDataChange?.({ checklistItems });
      onAction?.({
        type: 'CHECKLIST_ITEM_TOGGLED',
        payload: { itemId, completed: newCompleted },
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('Failed to update checklist item:', err);
      // Revert on error
      setChecklistItems((items) =>
        items.map((i) => (i.id === itemId ? { ...i, completed: !newCompleted } : i))
      );
    }
  };

  const handleOrderTests = () => {
    // Mark all tests as ordered
    setChecklistItems((items) =>
      items.map((item) => {
        if (item.category === 'tests' && !item.completed) {
          return { ...item, remarks: 'Test ordered' };
        }
        return item;
      })
    );
    onAction?.({ type: 'TESTS_ORDERED', timestamp: new Date() });
  };

  if (!patientId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-8">
        <ClipboardList className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">No patient selected</p>
        <p className="text-xs text-gray-400 mt-1">Select a patient for pre-op checklist</p>
      </div>
    );
  }

  const isCompact = size === 'small';

  const requiredItems = checklistItems.filter((i) => i.required);
  const completedRequired = requiredItems.filter((i) => i.completed).length;
  const completionPercentage = Math.round((completedRequired / requiredItems.length) * 100);

  if (isCompact) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-gray-500 font-medium">Pre-Op Checklist</p>
        <div className={cn(
          'rounded p-2 border',
          completionPercentage === 100 ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
        )}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-gray-900">{completionPercentage}% Complete</p>
            {completionPercentage === 100 && <Check className="h-4 w-4 text-green-600" />}
          </div>
          <p className="text-xs text-gray-600">{completedRequired}/{requiredItems.length} items done</p>
        </div>
      </div>
    );
  }

  const allRequiredComplete = completedRequired === requiredItems.length;

  return (
    <div className="space-y-4">
      {/* Progress Banner */}
      <div className={cn(
        'border rounded-lg p-3',
        allRequiredComplete ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
      )}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ClipboardList className={cn('h-5 w-5', allRequiredComplete ? 'text-green-600' : 'text-blue-600')} />
            <div>
              <p className="text-sm font-semibold text-gray-900">Pre-Operative Checklist</p>
              <p className="text-xs text-gray-600">{completedRequired} of {requiredItems.length} required items completed</p>
            </div>
          </div>
          <div className="text-right">
            <p className={cn('text-2xl font-bold', allRequiredComplete ? 'text-green-600' : 'text-blue-600')}>
              {completionPercentage}%
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={cn('h-2 rounded-full transition-all', allRequiredComplete ? 'bg-green-600' : 'bg-blue-600')}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Quick Action - Order All Tests */}
      {checklistItems.filter(i => i.category === 'tests' && !i.completed).length > 0 && (
        <button
          onClick={handleOrderTests}
          className="w-full py-2 border-2 border-dashed border-purple-400 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
        >
          <Activity className="h-4 w-4" />
          Order All Lab Tests
        </button>
      )}

      {/* Checklist by Category */}
      {Object.entries(categoryConfig).map(([category, config]) => {
        const Icon = config.icon;
        const items = checklistItems.filter((i) => i.category === category);
        const completedCount = items.filter((i) => i.completed).length;

        return (
          <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className={cn('px-3 py-2 flex items-center justify-between', `bg-${config.color}-50 border-b border-${config.color}-100`)}>
              <div className="flex items-center gap-2">
                <Icon className={cn('h-4 w-4', `text-${config.color}-600`)} />
                <p className="text-sm font-semibold text-gray-900">{config.label}</p>
              </div>
              <span className={cn('text-xs px-2 py-0.5 rounded-full', `bg-${config.color}-100 text-${config.color}-700`)}>
                {completedCount}/{items.length}
              </span>
            </div>

            <div className="p-2 space-y-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-start gap-3 p-2 rounded-lg border transition-all',
                    item.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-gray-300'
                  )}
                >
                  <button
                    onClick={() => handleToggleItem(item.id)}
                    className={cn(
                      'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors mt-0.5',
                      item.completed
                        ? 'bg-green-600 border-green-600'
                        : 'bg-white border-gray-300 hover:border-blue-500'
                    )}
                  >
                    {item.completed && <Check className="h-3 w-3 text-white" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={cn('text-sm', item.completed ? 'text-gray-500 line-through' : 'text-gray-900 font-medium')}>
                          {item.name}
                          {item.required && !item.completed && <span className="text-red-500 ml-1">*</span>}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                        {item.remarks && (
                          <p className="text-xs text-blue-600 mt-1 italic">{item.remarks}</p>
                        )}
                        {item.completedAt && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ Completed {item.completedAt.toLocaleDateString('en-IN')} at {item.completedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>

                      {!item.completed && category === 'documents' && (
                        <button
                          onClick={() => {
                            handleToggleItem(item.id);
                            onAction?.({ type: 'DOCUMENT_UPLOADED', payload: { itemId: item.id }, timestamp: new Date() });
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          <Upload className="h-3 w-3" />
                          Upload
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Completion Action */}
      {allRequiredComplete ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <Check className="h-12 w-12 text-green-600 mx-auto mb-2" />
          <p className="text-lg font-semibold text-gray-900 mb-1">Pre-Op Checklist Complete!</p>
          <p className="text-sm text-gray-600 mb-3">Patient is cleared for surgery</p>
          <button
            onClick={() => onAction?.({ type: 'PROCEED_TO_ADMISSION', timestamp: new Date() })}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
          >
            Proceed to Admission Planning
          </button>
        </div>
      ) : (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Pending Items</p>
              <p className="text-xs">Complete all required items ({requiredItems.length - completedRequired} remaining) before proceeding to surgery.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
