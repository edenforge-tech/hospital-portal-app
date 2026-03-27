import React from 'react';
import { Clock, Users, Activity, CheckCircle, ArrowRight, Activity as RotateCw } from 'lucide-react';

interface QueueStats {
  waiting: number;
  called: number;
  inProgress: number;
  completed: number;
}

interface QueueItem {
  id: string;
  patientName?: string;
  mrn?: string;
  tokenNumber: string;
  queueStatus: string;
  sessionType?: string;
  addedToQueueAt: string;
  estimatedWaitMinutes?: number;
}

interface QueueWidgetProps {
  queueItems: QueueItem[];
  stats: QueueStats;
  isLoading: boolean;
  onViewQueue: () => void;
  onStartSession: (queueItemId: string) => void;
}

/**
 * Queue Widget - Shows today's patient queue with real-time status
 */
export function QueueWidget({ 
  queueItems, 
  stats, 
  isLoading, 
  onViewQueue,
  onStartSession 
}: QueueWidgetProps) {
  // Get next patients (up to 5)
  const nextPatients = queueItems
    .filter(item => item.queueStatus === 'Waiting')
    .sort((a, b) => (a.tokenNumber || '').localeCompare(b.tokenNumber || ''))
    .slice(0, 5);
  
  // Debug logging
  console.log('🏥 QueueWidget render:', {
    queueItemsCount: queueItems.length,
    nextPatientsCount: nextPatients.length,
    stats,
    isLoading,
    nextPatients: nextPatients.map(p => ({ id: p.id, name: p.patientName, token: p.tokenNumber }))
  });
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <Users className="h-6 w-6 text-cyan-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Today's Queue</h3>
              <p className="text-sm text-gray-600 mt-0.5">Patient waiting list</p>
            </div>
          </div>
          
          <button
            onClick={onViewQueue}
            className="text-sm font-medium text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 p-6 border-b border-gray-200">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="h-5 w-5 text-cyan-600" />
          </div>
          <p className="text-2xl font-bold text-cyan-600">{stats.waiting}</p>
          <p className="text-xs text-gray-600 mt-1">Waiting</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <RotateCw className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.called}</p>
          <p className="text-xs text-gray-600 mt-1">Called</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Activity className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.inProgress}</p>
          <p className="text-xs text-gray-600 mt-1">In Progress</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-xs text-gray-600 mt-1">Completed</p>
        </div>
      </div>
      
      {/* Queue List */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RotateCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : nextPatients.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No patients waiting</p>
            <p className="text-sm text-gray-500 mt-1">All caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Next Patients</h4>
            {nextPatients.map((patient, index) => (
              <div
                key={patient.id}
                onClick={() => onStartSession(patient.id)}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-cyan-50 hover:border-cyan-300 transition-colors border border-gray-200 cursor-pointer"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
                      ${index === 0 ? 'bg-cyan-600 text-white' : 'bg-gray-300 text-gray-700'}
                    `}>
                      {patient.tokenNumber || '#'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {patient.patientName || 'Unknown Patient'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {patient.mrn ? `MRN: ${patient.mrn}` : 'No MRN'}{patient.sessionType ? ` • ${patient.sessionType}` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-xs text-gray-500">
                    {new Date(patient.addedToQueueAt).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                  {patient.estimatedWaitMinutes && (
                    <p className="text-xs text-gray-600 mt-0.5">
                      ~{patient.estimatedWaitMinutes} min
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer Action */}
      {nextPatients.length > 0 && (
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={() => onStartSession(nextPatients[0].id)}
            className="w-full px-4 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
          >
            <Activity className="h-4 w-4" />
            Start Next Session
          </button>
        </div>
      )}
    </div>
  );
}
