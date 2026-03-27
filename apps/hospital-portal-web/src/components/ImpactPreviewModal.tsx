'use client';

import { useState } from 'react';
import { X, AlertTriangle, Info, Loader } from 'lucide-react';

interface ImpactPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  changes: Record<string, any>;
  category: string;
}

interface ImpactAnalysis {
  setting: string;
  oldValue: any;
  newValue: any;
  impact: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedUsers: number;
  requiresRestart: boolean;
}

export default function ImpactPreviewModal({ isOpen, onClose, onConfirm, changes, category }: ImpactPreviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [impacts, setImpacts] = useState<ImpactAnalysis[]>([]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const analyzeImpact = async () => {
    try {
      setLoading(true);
      setError('');

      // Convert changes to format expected by API
      const proposedChanges: Record<string, any> = {};
      Object.entries(changes).forEach(([key, value]) => {
        proposedChanges[`${category}.${key}`] = value;
      });

      const response = await fetch('/api/settings/impact-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposedChanges)
      });

      if (!response.ok) throw new Error('Failed to analyze impact');

      const data = await response.json();
      setImpacts(data.changes || []);
    } catch (err: any) {
      setError(err.message || 'Failed to preview impact');
    } finally {
      setLoading(false);
    }
  };

  // Analyze on mount
  useState(() => {
    analyzeImpact();
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getImpactIcon = (impact: string) => {
    if (impact === 'critical' || impact === 'high') {
      return <AlertTriangle className="h-5 w-5" />;
    }
    return <Info className="h-5 w-5" />;
  };

  const highestImpact = impacts.reduce((max, curr) => {
    const levels = { low: 0, medium: 1, high: 2, critical: 3 };
    return levels[curr.impact] > levels[max] ? curr.impact : max;
  }, 'low' as ImpactAnalysis['impact']);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Impact Preview</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className={`mb-6 p-4 rounded-lg border ${getImpactColor(highestImpact)}`}>
                <div className="flex items-center space-x-2">
                  {getImpactIcon(highestImpact)}
                  <div className="font-semibold">
                    Overall Impact: {highestImpact.toUpperCase()}
                  </div>
                </div>
                <p className="mt-2 text-sm">
                  {impacts.length} setting{impacts.length !== 1 ? 's' : ''} will be changed
                </p>
              </div>

              {/* Changes List */}
              <div className="space-y-4">
                {impacts.map((change, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="font-mono text-sm font-medium text-gray-900 mb-1">
                          {change.setting}
                        </div>
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${getImpactColor(change.impact)}`}>
                          {getImpactIcon(change.impact)}
                          <span>{change.impact} impact</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Current Value:</div>
                        <div className="font-mono bg-white px-2 py-1 rounded border border-gray-200">
                          {String(change.oldValue)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">New Value:</div>
                        <div className="font-mono bg-white px-2 py-1 rounded border border-green-200 bg-green-50">
                          {String(change.newValue)}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-700 mb-2">
                      {change.description}
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      {change.affectedUsers > 0 && (
                        <span>👥 Affects ~{change.affectedUsers} users</span>
                      )}
                      {change.requiresRestart && (
                        <span className="text-orange-600 font-medium">⚠️ Requires system restart</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Warnings */}
              {impacts.some(i => i.requiresRestart) && (
                <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div className="text-sm text-orange-800">
                      <div className="font-medium mb-1">System Restart Required</div>
                      <div>Some changes require a system restart to take effect. Plan maintenance accordingly.</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Review the impact before proceeding
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              disabled={loading}
              className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                highestImpact === 'critical' || highestImpact === 'high'
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              Proceed with Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
