'use client';

import React, { useState } from 'react';
import { 
  LogIn, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  XCircle, 
  RotateCcw, 
  UserX, 
  MessageSquare, 
  FileText, 
  Upload, 
  Download, 
  Users, 
  MessageCircle, 
  DollarSign, 
  CreditCard,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionsToolbarProps {
  patientId: string;
  patientName: string;
  onActionComplete?: (action: string) => void;
}

export const QuickActionsToolbar: React.FC<QuickActionsToolbarProps> = ({
  patientId,
  patientName,
  onActionComplete
}) => {
  const [showActionModal, setShowActionModal] = useState<string | null>(null);

  const handleAction = (actionType: string) => {
    // TODO: Implement action handlers
    console.log(`Action triggered: ${actionType} for patient ${patientId}`);
    setShowActionModal(actionType);
    onActionComplete?.(actionType);
  };

  const quickActions = [
    // CRITICAL ACTIONS (Red/Primary)
    {
      id: 'check-in',
      label: 'Check-In',
      icon: LogIn,
      variant: 'default' as const,
      color: 'bg-green-600 hover:bg-green-700 text-white',
      onClick: () => handleAction('check-in')
    },
    {
      id: 'emergency-check-in',
      label: 'Emergency',
      icon: AlertTriangle,
      variant: 'destructive' as const,
      color: 'bg-red-600 hover:bg-red-700 text-white',
      onClick: () => handleAction('emergency-check-in')
    },
    {
      id: 'book-appointment',
      label: 'Book Appt',
      icon: Calendar,
      variant: 'default' as const,
      color: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      onClick: () => handleAction('book-appointment')
    },

    // HIGH-FREQUENCY ACTIONS (Outline)
    {
      id: 'view-queue',
      label: 'Queue Status',
      icon: Clock,
      variant: 'outline' as const,
      onClick: () => handleAction('view-queue')
    },
    {
      id: 'reschedule',
      label: 'Reschedule',
      icon: RotateCcw,
      variant: 'outline' as const,
      onClick: () => handleAction('reschedule')
    },
    {
      id: 'cancel-appointment',
      label: 'Cancel Appt',
      icon: XCircle,
      variant: 'outline' as const,
      onClick: () => handleAction('cancel-appointment')
    },
    {
      id: 'mark-no-show',
      label: 'No-Show',
      icon: UserX,
      variant: 'outline' as const,
      onClick: () => handleAction('mark-no-show')
    },

    // REGULAR ACTIONS (Ghost)
    {
      id: 'send-sms',
      label: 'Send SMS',
      icon: MessageSquare,
      variant: 'ghost' as const,
      onClick: () => handleAction('send-sms')
    },
    {
      id: 'call-patient',
      label: 'Call',
      icon: Phone,
      variant: 'ghost' as const,
      onClick: () => handleAction('call-patient')
    },
    {
      id: 'upload-document',
      label: 'Upload Doc',
      icon: Upload,
      variant: 'ghost' as const,
      onClick: () => handleAction('upload-document')
    },

    // OCCASIONAL ACTIONS (Ghost)
    {
      id: 'export-summary',
      label: 'Export',
      icon: Download,
      variant: 'ghost' as const,
      onClick: () => handleAction('export-summary')
    },
    {
      id: 'send-to-counselor',
      label: 'Counselor',
      icon: MessageCircle,
      variant: 'ghost' as const,
      onClick: () => handleAction('send-to-counselor')
    },
    {
      id: 'view-billing',
      label: 'Billing',
      icon: DollarSign,
      variant: 'ghost' as const,
      onClick: () => handleAction('view-billing')
    },
    {
      id: 'print-card',
      label: 'Print Card',
      icon: CreditCard,
      variant: 'ghost' as const,
      onClick: () => handleAction('print-card')
    },
    {
      id: 'medical-summary',
      label: 'Summary',
      icon: FileText,
      variant: 'ghost' as const,
      onClick: () => handleAction('medical-summary')
    }
  ];

  return (
    <>
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Quick Actions</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant}
                size="sm"
                onClick={action.onClick}
                className={`flex items-center gap-2 ${action.color || ''}`}
              >
                <action.icon className="w-4 h-4" />
                <span className="hidden md:inline">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Inline Modals */}
      {showActionModal === 'check-in' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Check-In Patient</h3>
              <button onClick={() => setShowActionModal(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Check-in <strong>{patientName}</strong> for today's appointment?
            </p>
            <div className="mb-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option>Ophthalmology</option>
                  <option>Optometry</option>
                  <option>Surgery</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option>Dr. Smith</option>
                  <option>Dr. Johnson</option>
                  <option>Dr. Williams</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowActionModal(null)}>Cancel</Button>
              <Button variant="default" onClick={() => { handleAction('check-in-confirm'); setShowActionModal(null); }}>
                Check-In Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {showActionModal === 'emergency-check-in' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Emergency Check-In
              </h3>
              <button onClick={() => setShowActionModal(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Emergency check-in for <strong>{patientName}</strong>. This will bypass the queue.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Reason</label>
              <textarea 
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-20" 
                placeholder="Describe the emergency..."
              ></textarea>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowActionModal(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { handleAction('emergency-confirm'); setShowActionModal(null); }}>
                Emergency Check-In
              </Button>
            </div>
          </div>
        </div>
      )}

      {showActionModal === 'send-sms' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Send SMS Reminder</h3>
              <button onClick={() => setShowActionModal(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message Template</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option>Appointment Reminder</option>
                  <option>Payment Reminder</option>
                  <option>Lab Results Ready</option>
                  <option>Custom Message</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-24" 
                  placeholder="Your appointment is scheduled for..."
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowActionModal(null)}>Cancel</Button>
              <Button variant="default" onClick={() => { handleAction('sms-send'); setShowActionModal(null); }}>
                Send SMS
              </Button>
            </div>
          </div>
        </div>
      )}

      {showActionModal === 'book-appointment' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Book Appointment</h3>
              <button onClick={() => setShowActionModal(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date</label>
                <input 
                  type="date" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option>9:00 AM - 9:30 AM</option>
                  <option>10:00 AM - 10:30 AM</option>
                  <option>11:00 AM - 11:30 AM</option>
                  <option>2:00 PM - 2:30 PM</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option>Dr. Smith</option>
                  <option>Dr. Johnson</option>
                  <option>Dr. Williams</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowActionModal(null)}>Cancel</Button>
              <Button variant="default" onClick={() => { handleAction('appointment-book'); setShowActionModal(null); }}>
                Book Appointment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Other modals can be added similarly */}
      {showActionModal && !['check-in', 'emergency-check-in', 'send-sms', 'book-appointment'].includes(showActionModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {showActionModal.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </h3>
              <button onClick={() => setShowActionModal(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              This action is coming soon. Feature under development.
            </p>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowActionModal(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
