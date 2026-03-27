'use client';

import { useState } from 'react';
import { X, Search, UserCheck, Calendar, Clock } from 'lucide-react';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckInModal({ isOpen, onClose }: CheckInModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  if (!isOpen) return null;

  // Mock data - replace with actual API call
  const mockAppointments = [
    {
      id: '1',
      patientName: 'Alice Cooper',
      uhid: 'UH001234',
      appointmentTime: '09:00 AM',
      doctorName: 'Dr. Smith',
      department: 'Ophthalmology',
    },
    {
      id: '2',
      patientName: 'Bob Martin',
      uhid: 'UH001235',
      appointmentTime: '09:30 AM',
      doctorName: 'Dr. Johnson',
      department: 'Ophthalmology',
    },
  ];

  const handleCheckIn = (appointmentId: string) => {
    // TODO: API call to check in patient
    console.log('Checking in patient:', appointmentId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-emerald-50">
          <div className="flex items-center gap-3">
            <UserCheck className="h-6 w-6 text-emerald-600" />
            <h2 className="text-xl font-semibold text-slate-900">Patient Check-In</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-emerald-100 rounded-lg transition"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search Patient
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, UHID, or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Today's Appointments */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Today's Appointments</h3>
            <div className="space-y-3">
              {mockAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-slate-200 rounded-lg p-4 hover:border-emerald-500 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h4 className="text-lg font-semibold text-slate-900">
                          {appointment.patientName}
                        </h4>
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded">
                          {appointment.uhid}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{appointment.appointmentTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          <span>{appointment.doctorName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{appointment.department}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCheckIn(appointment.id)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                    >
                      Check-In
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
