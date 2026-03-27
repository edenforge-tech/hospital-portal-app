/**
 * Smart Workflow Assistant Widget  
 * AI-powered workflow suggestions and guidance
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Info, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { WidgetProps } from '@/lib/widgets/widget-types';
import type { WorkflowSuggestion } from '@/lib/api/widgets.api';
import { widgetsApi } from '@/lib/api/widgets.api';

const SmartWorkflowAssistantWidget: React.FC<WidgetProps> = ({ sessionId, sessionStage }) => {
  const [suggestions, setSuggestions] = useState<WorkflowSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId && sessionStage) loadSuggestions();
  }, [sessionId, sessionStage]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const data = await widgetsApi.getWorkflowSuggestions(sessionId!, sessionStage);
      setSuggestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestionConfig = (type: string, priority: string) => {
    const configs = {
      info: { icon: Info, bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-900' },
      warning: { icon: AlertTriangle, bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', textColor: 'text-yellow-900' },
      action: { icon: CheckCircle2, bgColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-green-900' },
      recommendation: { icon: Brain, bgColor: 'bg-purple-50', borderColor: 'border-purple-200', textColor: 'text-purple-900' },
    };
    return configs[type as keyof typeof configs] || configs.info;
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800',
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
    </div>;
  }

  return (
    <div className="h-full flex flex-col p-4 space-y-4 overflow-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <Brain className="w-5 h-5 mr-2 text-purple-600" />
          Workflow Assistant
        </h3>
        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
          AI-Powered
        </span>
      </div>

      {suggestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
          <p className="text-sm font-medium text-gray-900">All tasks complete!</p>
          <p className="text-xs text-gray-600 mt-1">No pending actions for this stage.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions
            .sort((a, b) => {
              const priorityOrder = { high: 0, medium: 1, low: 2 };
              return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
            })
            .map(suggestion => {
              const config = getSuggestionConfig(suggestion.type, suggestion.priority);
              const Icon = config.icon;

              return (
                <div
                  key={suggestion.id}
                  className={`border ${config.borderColor} ${config.bgColor} rounded-lg p-4`}
                >
                  <div className="flex items-start space-x-3">
                    <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.textColor}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`text-sm font-medium ${config.textColor}`}>
                          {suggestion.title}
                        </h4>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityBadge(suggestion.priority)}`}>
                          {suggestion.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{suggestion.message}</p>

                      {suggestion.actionLabel && suggestion.actionUrl && (
                        <button
                          onClick={() => {
                            // Navigate to action URL or trigger action
                            console.log('Navigate to:', suggestion.actionUrl);
                          }}
                          className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            suggestion.priority === 'high'
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : suggestion.priority === 'medium'
                              ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                              : 'bg-gray-600 text-white hover:bg-gray-700'
                          }`}
                        >
                          {suggestion.actionLabel}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Workflow Tips */}
      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">💡 Pro Tips</h4>
        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
          <li>Complete high-priority tasks first for smooth workflow</li>
          <li>Use keyboard shortcuts for faster navigation</li>
          <li>Pin frequently used widgets to your dashboard</li>
        </ul>
      </div>
    </div>
  );
};

export default SmartWorkflowAssistantWidget;
