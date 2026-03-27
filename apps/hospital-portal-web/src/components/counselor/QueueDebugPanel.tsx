/**
 * Debug Panel - Temporary component to diagnose queue filtering issues
 * This should be removed after fixing the assignedCounselorId filter
 */

'use client';

import React, { useState } from 'react';

interface QueueDebugPanelProps {
  queueItems: any[];
  assignedPatients: any[];
  currentUserId?: string;
}

export function QueueDebugPanel({
  queueItems,
  assignedPatients,
  currentUserId,
}: QueueDebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-4 right-4 px-4 py-2 bg-yellow-500 text-white rounded-lg shadow-lg hover:bg-yellow-600 transition-colors z-50"
      >
        🐛 Debug Queue Filter
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 overflow-y-auto bg-white border-2 border-yellow-500 rounded-lg shadow-xl z-50">
      {/* Header */}
      <div className="sticky top-0 bg-yellow-500 text-white px-4 py-2 flex items-center justify-between">
        <h3 className="font-bold">🐛 Queue Debug Panel</h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-white hover:text-gray-200 text-xl"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 text-xs">
        {/* Summary */}
        <div className="bg-gray-100 p-3 rounded">
          <h4 className="font-semibold mb-2">📊 Summary</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Total Queue Items:</span>
              <span className="font-bold">{queueItems.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Assigned to Me:</span>
              <span className="font-bold text-blue-600">{assignedPatients.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Current User ID:</span>
              <span className="font-mono text-xs break-all">{currentUserId || 'None'}</span>
            </div>
          </div>
        </div>

        {/* Queue Items Detail */}
        <div>
          <h4 className="font-semibold mb-2">📋 Queue Items Detail</h4>
          {queueItems.length === 0 ? (
            <p className="text-gray-500 italic">No queue items found</p>
          ) : (
            <div className="space-y-2">
              {queueItems.slice(0, 5).map((item, index) => {
                const counselorId = item.assignedCounselorId || item.assigned_counselor_id;
                const isAssigned = counselorId === currentUserId;

                return (
                  <div
                    key={index}
                    className={`p-2 rounded border ${
                      isAssigned
                        ? 'bg-green-50 border-green-300'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 mb-1">
                      {isAssigned ? '✅ ' : '❌ '}
                      {item.patientName || 'Unknown Patient'}
                    </div>
                    <div className="text-gray-600 space-y-0.5">
                      <div>Token: {item.tokenNumber}</div>
                      <div className="font-mono">
                        assignedCounselorId: {item.assignedCounselorId || 'null'}
                      </div>
                      <div className="font-mono">
                        assigned_counselor_id: {item.assigned_counselor_id || 'null'}
                      </div>
                      <div>
                        Match: {isAssigned ? '✅ YES' : '❌ NO'}
                      </div>
                    </div>
                  </div>
                );
              })}
              {queueItems.length > 5 && (
                <p className="text-gray-500 italic text-center">
                  ...and {queueItems.length - 5} more items
                </p>
              )}
            </div>
          )}
        </div>

        {/* Diagnosis */}
        <div className="bg-blue-50 p-3 rounded border border-blue-300">
          <h4 className="font-semibold mb-2 text-blue-900">💡 Diagnosis</h4>
          {assignedPatients.length === 0 && queueItems.length > 0 ? (
            <div className="space-y-2 text-blue-900">
              <p className="font-semibold">⚠️ No patients assigned to you!</p>
              <p>Possible causes:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>
                  Property name mismatch (check if backend uses snake_case or camelCase)
                </li>
                <li>All queue items assigned to other counselors</li>
                <li>User ID doesn't match any assignedCounselorId values</li>
                <li>Backend not populating assignedCounselorId field</li>
              </ul>
            </div>
          ) : assignedPatients.length > 0 ? (
            <p className="text-green-700">
              ✅ Filter working correctly! {assignedPatients.length} patients assigned to you.
            </p>
          ) : (
            <p className="text-gray-700">
              No queue items to filter. Add patients to the queue first.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
