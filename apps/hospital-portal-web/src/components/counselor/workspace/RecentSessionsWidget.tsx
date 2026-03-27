import React from 'react';
import { FileText, ArrowRight, RotateCw, Clock, CheckCircle, XCircle } from 'lucide-react';

interface CounselingSession {
  id: string;
  sessionNumber: string;
  patientName: string;
  patientMrn: string;
  sessionType: string;
  sessionStage: string;
  status: string;
  startTime: string;
  endTime?: string;
  counselorName?: string;
  branchName?: string;
}

interface RecentSessionsWidgetProps {
  sessions: CounselingSession[];
  isLoading: boolean;
  onViewSession: (sessionId: string) => void;
  onViewAll: () => void;
}

/**
 * Recent Sessions Widget - Shows the last 10 counseling sessions
 */
export function RecentSessionsWidget({ 
  sessions, 
  isLoading, 
  onViewSession,
  onViewAll 
}: RecentSessionsWidgetProps) {
  // Get status badge styling
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: any }> = {
      completed: { 
        bg: 'bg-green-100 border-green-200', 
        text: 'text-green-700',
        icon: CheckCircle,
      },
      in_progress: { 
        bg: 'bg-blue-100 border-blue-200', 
        text: 'text-blue-700',
        icon: Clock,
      },
      pending: { 
        bg: 'bg-yellow-100 border-yellow-200', 
        text: 'text-yellow-700',
        icon: Clock,
      },
      cancelled: { 
        bg: 'bg-red-100 border-red-200', 
        text: 'text-red-700',
        icon: XCircle,
      },
    };
    return badges[status] || badges.pending;
  };
  
  // Format session stage for display
  const formatStage = (stage: string) => {
    const stages: Record<string, string> = {
      initial: 'Initial',
      examination: 'Examination',
      financial: 'Financial',
      pre_surgery: 'Pre-Surgery',
      completed: 'Completed',
    };
    return stages[stage] || stage;
  };
  
  // Calculate session duration
  const calculateDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return 'In Progress';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / 60000);
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Sessions</h3>
              <p className="text-sm text-gray-600 mt-0.5">Last 10 counseling sessions</p>
            </div>
          </div>
          
          <button
            onClick={onViewAll}
            className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Sessions Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RotateCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No recent sessions</p>
            <p className="text-sm text-gray-500 mt-1">Sessions will appear here once started</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type / Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map((session) => {
                const statusBadge = getStatusBadge(session.status);
                const StatusIcon = statusBadge.icon;
                
                return (
                  <tr 
                    key={session.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {session.sessionNumber}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {session.patientName}
                        </p>
                        <p className="text-xs text-gray-500">
                          MRN: {session.patientMrn}
                        </p>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm text-gray-900">
                          {session.sessionType}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatStage(session.sessionStage)}
                        </p>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`
                        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                        ${statusBadge.bg} ${statusBadge.text}
                      `}>
                        <StatusIcon className="h-3 w-3" />
                        {session.status.replace('_', ' ')}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(session.startTime).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(session.startTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {calculateDuration(session.startTime, session.endTime)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onViewSession(session.id)}
                        className="text-purple-600 hover:text-purple-900 inline-flex items-center gap-1"
                      >
                        <FileText className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
