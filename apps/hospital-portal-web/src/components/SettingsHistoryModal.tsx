'use client';

import { useEffect, useState } from 'react';
import { X, History, RotateCcw, Loader, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SettingsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRollback: () => void;
}

interface HistoryRecord {
  id: string;
  category: string;
  settingKey: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: string;
  changeReason?: string;
}

export default function SettingsHistoryModal({ isOpen, onClose, onRollback }: SettingsHistoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [error, setError] = useState('');
  const [rollingBack, setRollingBack] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/settings/history');
      if (!response.ok) throw new Error('Failed to load history');

      const data = await response.json();
      setHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load settings history');
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (historyId: string) => {
    if (!confirm('Are you sure you want to rollback to this previous value? This action will be logged.')) {
      return;
    }

    try {
      setRollingBack(historyId);

      const response = await fetch(`/api/settings/rollback/${historyId}`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Rollback failed');

      const result = await response.json();
      alert(result.message);
      onRollback(); // Refresh parent settings
      loadHistory(); // Refresh history
    } catch (err: any) {
      alert(err.message || 'Failed to rollback setting');
    } finally {
      setRollingBack(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <History className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Settings Change History</h3>
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
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
                <button
                  onClick={loadHistory}
                  className="mt-4 text-indigo-600 hover:text-indigo-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No change history found
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((record) => (
                <div key={record.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">
                          {record.category}
                        </span>
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {record.settingKey}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Old Value:</div>
                          <div className="font-mono bg-white px-2 py-1 rounded border border-gray-200">
                            {record.oldValue || '(empty)'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">New Value:</div>
                          <div className="font-mono bg-white px-2 py-1 rounded border border-gray-200">
                            {record.newValue || '(empty)'}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-600">
                        <span>Changed {formatDistanceToNow(new Date(record.changedAt), { addSuffix: true })}</span>
                        {record.changeReason && (
                          <span className="ml-2">• {record.changeReason}</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRollback(record.id)}
                      disabled={rollingBack === record.id}
                      className="ml-4 px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      {rollingBack === record.id ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <RotateCcw className="h-4 w-4" />
                      )}
                      <span>Rollback</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
