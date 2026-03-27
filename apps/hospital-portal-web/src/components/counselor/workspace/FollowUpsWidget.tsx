import React from 'react';
import { Calendar, Clock, AlertCircle, ArrowRight, RotateCw } from 'lucide-react';

interface FollowUpAppointment {
  id: string;
  patientId: string;
  patientName?: string;
  patientMrn?: string;
  followUpType: string;
  scheduledDate: string;
  scheduledTime?: string;
  priority: string;
  status: string;
  departmentName?: string;
  doctorName?: string;
}

interface FollowUpsWidgetProps {
  followUps: FollowUpAppointment[];
  isLoading: boolean;
  onViewAll: () => void;
}

/**
 * Follow-Ups Widget - Shows upcoming follow-up appointments
 */
export function FollowUpsWidget({ followUps, isLoading, onViewAll }: FollowUpsWidgetProps) {
  // Filter for today and this week
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayFollowUps = followUps.filter(fu => {
    const fuDate = new Date(fu.scheduledDate);
    fuDate.setHours(0, 0, 0, 0);
    return fuDate.getTime() === today.getTime();
  });
  
  const thisWeekFollowUps = followUps.filter(fu => {
    const fuDate = new Date(fu.scheduledDate);
    fuDate.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return fuDate >= today && fuDate <= nextWeek;
  });
  
  // Count by priority
  const urgentCount = followUps.filter(fu => fu.priority === 'urgent').length;
  const highCount = followUps.filter(fu => fu.priority === 'high').length;
  
  // Priority badge colors
  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, string> = {
      urgent: 'bg-red-100 text-red-700 border-red-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      routine: 'bg-blue-100 text-blue-700 border-blue-200',
      low: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return badges[priority] || badges.routine;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Follow-Ups</h3>
              <p className="text-sm text-gray-600 mt-0.5">Next 7 days</p>
            </div>
          </div>
          
          <button
            onClick={onViewAll}
            className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-gray-600 mb-1">Today</p>
            <p className="text-2xl font-bold text-blue-600">{todayFollowUps.length}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <p className="text-xs text-gray-600 mb-1">This Week</p>
            <p className="text-2xl font-bold text-purple-600">{thisWeekFollowUps.length}</p>
          </div>
        </div>
      </div>
      
      {/* Priority Alerts */}
      {(urgentCount > 0 || highCount > 0) && (
        <div className="px-6 pt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900">
                  Priority Follow-Ups
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  {urgentCount > 0 && `${urgentCount} urgent`}
                  {urgentCount > 0 && highCount > 0 && ', '}
                  {highCount > 0 && `${highCount} high priority`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Follow-Ups List */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RotateCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : followUps.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No upcoming follow-ups</p>
            <p className="text-sm text-gray-500 mt-1">Schedule follow-ups from patient sessions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {thisWeekFollowUps.slice(0, 5).map((followUp) => {
              const fuDate = new Date(followUp.scheduledDate);
              const isToday = fuDate.toDateString() === today.toDateString();
              
              return (
                <div
                  key={followUp.id}
                  className={`
                    p-3 rounded-lg border transition-colors
                    ${isToday 
                      ? 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {followUp.patientName || 'Unknown Patient'}
                        </p>
                        <span className={`
                          px-2 py-0.5 text-xs font-medium rounded-full border
                          ${getPriorityBadge(followUp.priority)}
                        `}>
                          {followUp.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {followUp.followUpType}
                        {followUp.patientMrn && ` • MRN: ${followUp.patientMrn}`}
                      </p>
                      {followUp.doctorName && (
                        <p className="text-xs text-gray-500 mt-1">
                          Dr. {followUp.doctorName}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Clock className="h-3 w-3" />
                        {followUp.scheduledTime || 'All Day'}
                      </div>
                      <p className={`
                        text-xs font-medium mt-1
                        ${isToday ? 'text-cyan-600' : 'text-gray-700'}
                      `}>
                        {isToday ? 'Today' : fuDate.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {thisWeekFollowUps.length > 5 && (
              <button
                onClick={onViewAll}
                className="w-full py-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                +{thisWeekFollowUps.length - 5} more this week
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
