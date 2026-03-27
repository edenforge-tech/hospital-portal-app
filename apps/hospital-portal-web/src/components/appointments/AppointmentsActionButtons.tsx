'use client';

import { useState } from 'react';
import { 
  Plus, 
  Download, 
  Upload, 
  Mail, 
  RefreshCw, 
  Calendar as CalendarIcon,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Repeat,
  BarChart3
} from 'lucide-react';
import { appointmentsApi } from '@/lib/api/appointments-enhanced.api';

interface AppointmentsActionButtonsProps {
  selectedAppointments?: string[];
  onNewAppointment: () => void;
  onRefresh: () => void;
  onBulkAction?: (action: string) => void;
  onExport?: () => void;
  onImport?: () => void;
  onSendReminders?: () => void;
  onShowAvailability?: () => void;
  onShowStatistics?: () => void;
  loading?: boolean;
}

export default function AppointmentsActionButtons({
  selectedAppointments = [],
  onNewAppointment,
  onRefresh,
  onBulkAction,
  onExport,
  onImport,
  onSendReminders,
  onShowAvailability,
  onShowStatistics,
  loading = false
}: AppointmentsActionButtonsProps) {
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const handleBulkAction = (action: string) => {
    setShowBulkMenu(false);
    onBulkAction?.(action);
  };

  const hasSelection = selectedAppointments.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Primary Actions */}
      <button
        onClick={onNewAppointment}
        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline font-medium">New Appointment</span>
        <span className="sm:hidden">New</span>
      </button>

      {/* Bulk Actions (shown when items selected) */}
      {hasSelection && onBulkAction && (
        <div className="relative">
          <button
            onClick={() => setShowBulkMenu(!showBulkMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">Bulk Actions</span>
            <span className="bg-white text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {selectedAppointments.length}
            </span>
          </button>

          {showBulkMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowBulkMenu(false)}
              />
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
                <button
                  onClick={() => handleBulkAction('confirm')}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors text-left"
                >
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">Confirm</div>
                    <div className="text-xs text-gray-500">Mark as confirmed</div>
                  </div>
                </button>

                <button
                  onClick={() => handleBulkAction('cancel')}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left border-t border-gray-100"
                >
                  <XCircle className="h-4 w-4 text-red-600" />
                  <div>
                    <div className="font-medium text-gray-900">Cancel</div>
                    <div className="text-xs text-gray-500">Cancel appointments</div>
                  </div>
                </button>

                <button
                  onClick={() => handleBulkAction('reschedule')}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-t border-gray-100"
                >
                  <CalendarIcon className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Reschedule</div>
                    <div className="text-xs text-gray-500">Change date/time</div>
                  </div>
                </button>

                <button
                  onClick={() => handleBulkAction('send-reminders')}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-left border-t border-gray-100"
                >
                  <Mail className="h-4 w-4 text-purple-600" />
                  <div>
                    <div className="font-medium text-gray-900">Send Reminders</div>
                    <div className="text-xs text-gray-500">Email/SMS reminders</div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Secondary Actions */}
      <div className="flex items-center gap-2 ml-auto">
        {onShowStatistics && (
          <button
            onClick={onShowStatistics}
            className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="View Statistics"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden lg:inline">Stats</span>
          </button>
        )}

        {onShowAvailability && (
          <button
            onClick={onShowAvailability}
            className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Manage Availability"
          >
            <Clock className="h-4 w-4" />
            <span className="hidden lg:inline">Availability</span>
          </button>
        )}

        {onSendReminders && (
          <button
            onClick={onSendReminders}
            className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Send Reminders"
          >
            <Mail className="h-4 w-4" />
            <span className="hidden lg:inline">Reminders</span>
          </button>
        )}

        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Export Data"
          >
            <Download className="h-4 w-4" />
            <span className="hidden lg:inline">Export</span>
          </button>
        )}

        {onImport && (
          <button
            onClick={onImport}
            className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Import Data"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden lg:inline">Import</span>
          </button>
        )}

        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden lg:inline">Refresh</span>
        </button>
      </div>
    </div>
  );
}
