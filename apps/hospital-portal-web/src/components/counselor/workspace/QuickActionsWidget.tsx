import React from 'react';
import { 
  PlusCircle, 
  Calendar,
  FileText, 
  Activity,
  Users,
  Building,
  ArrowRight 
} from 'lucide-react';

interface QuickActionsWidgetProps {
  onNewSession: () => void;
  onScheduleFollowUp: () => void;
  onViewSessions: () => void;
  onManageAdmissions: () => void;
}

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  onClick: () => void;
}

/**
 * Quick Actions Widget - Provides shortcuts to common counselor tasks
 */
export function QuickActionsWidget({ 
  onNewSession,
  onScheduleFollowUp,
  onViewSessions,
  onManageAdmissions,
}: QuickActionsWidgetProps) {
  const actions: QuickAction[] = [
    {
      id: 'new-session',
      label: 'New Session',
      description: 'Start counseling',
      icon: PlusCircle,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      onClick: onNewSession,
    },
    {
      id: 'schedule-followup',
      label: 'Schedule Follow-Up',
      description: 'Create appointment',
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      onClick: onScheduleFollowUp,
    },
    {
      id: 'view-sessions',
      label: 'View All Sessions',
      description: 'Browse history',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      onClick: onViewSessions,
    },
    {
      id: 'manage-admissions',
      label: 'Manage Admissions',
      description: 'Surgery bookings',
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      onClick: onManageAdmissions,
    },
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ArrowRight className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <p className="text-sm text-gray-600 mt-0.5">Common tasks</p>
          </div>
        </div>
      </div>
      
      {/* Actions Grid */}
      <div className="flex-1 p-6">
        <div className="space-y-3">
          {actions.map((action) => {
            const Icon = action.icon;
            
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className={`
                  w-full p-4 rounded-lg border transition-all
                  ${action.bgColor} ${action.borderColor}
                  hover:shadow-md hover:scale-[1.02]
                  group
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    flex-shrink-0 p-2 rounded-lg
                    ${action.bgColor}
                  `}>
                    <Icon className={`h-6 w-6 ${action.color}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-700">
                      {action.label}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className={`
                    h-5 w-5 ${action.color} opacity-0 group-hover:opacity-100
                    transform translate-x-0 group-hover:translate-x-1
                    transition-all flex-shrink-0
                  `} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Building className="h-4 w-4" />
          <span>
            All actions are branch-specific
          </span>
        </div>
      </div>
    </div>
  );
}
