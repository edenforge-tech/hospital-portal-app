'use client';

import React, { useState } from 'react';

// ============================================================================
// Types
// ============================================================================

interface Appointment {
  id: string;
  patientName: string;
  patientMrn: string;
  providerName: string;
  department: string;
  type: string;
  status: string;
  date: string;
  time: string;
  endTime: string;
  duration: number;
  room?: string;
  isVirtual: boolean;
  chiefComplaint?: string;
  notes?: string;
}

// ============================================================================
// Components
// ============================================================================

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-green-100 text-green-700',
    checked_in: 'bg-emerald-100 text-emerald-700',
    in_progress: 'bg-purple-100 text-purple-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
    no_show: 'bg-orange-100 text-orange-700',
    rescheduled: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.scheduled}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function AppointmentTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    new_patient: 'bg-purple-100 text-purple-700',
    follow_up: 'bg-blue-100 text-blue-700',
    consultation: 'bg-green-100 text-green-700',
    procedure: 'bg-orange-100 text-orange-700',
    telehealth: 'bg-cyan-100 text-cyan-700',
    urgent_care: 'bg-red-100 text-red-700',
    physical_exam: 'bg-indigo-100 text-indigo-700',
    vaccination: 'bg-pink-100 text-pink-700',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs ${colors[type] || 'bg-gray-100 text-gray-700'}`}>
      {type.replace(/_/g, ' ')}
    </span>
  );
}

function MetricCard({ label, value, icon, color, trend }: { 
  label: string; 
  value: string | number; 
  icon: string; 
  color: string;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
            <span className="text-lg">{icon}</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-blue-100 flex items-center justify-center font-medium text-blue-600`}>
      {initials}
    </div>
  );
}

function TimeSlot({ time, appointment, onClick }: { 
  time: string; 
  appointment?: Appointment; 
  onClick: () => void;
}) {
  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    confirmed: 'bg-green-50 border-green-200 hover:bg-green-100',
    checked_in: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
    in_progress: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    completed: 'bg-gray-50 border-gray-200',
    cancelled: 'bg-red-50 border-red-200',
    no_show: 'bg-orange-50 border-orange-200',
  };

  if (!appointment) {
    return (
      <div 
        onClick={onClick}
        className="p-2 border border-dashed border-gray-200 rounded text-xs text-gray-400 hover:bg-gray-50 cursor-pointer min-h-[60px] flex items-center justify-center"
      >
        + Available
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`p-2 border rounded cursor-pointer min-h-[60px] ${statusColors[appointment.status] || statusColors.scheduled}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-900">{appointment.time}</span>
        {appointment.isVirtual && <span className="text-xs">📹</span>}
      </div>
      <p className="text-sm font-medium text-gray-900 truncate">{appointment.patientName}</p>
      <p className="text-xs text-gray-500 truncate">{appointment.providerName}</p>
      <AppointmentTypeBadge type={appointment.type} />
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'list' | 'waitlist'>('calendar');
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [showAppointmentDetailModal, setShowAppointmentDetailModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Mock data
  const appointments: Appointment[] = [
    {
      id: '1',
      patientName: 'John Smith',
      patientMrn: 'MRN-2026-001',
      providerName: 'Dr. Sarah Wilson',
      department: 'Internal Medicine',
      type: 'follow_up',
      status: 'confirmed',
      date: '2026-01-24',
      time: '09:00',
      endTime: '09:30',
      duration: 30,
      room: 'Room 101',
      isVirtual: false,
      chiefComplaint: 'Follow-up for hypertension',
    },
    {
      id: '2',
      patientName: 'Emily Johnson',
      patientMrn: 'MRN-2026-015',
      providerName: 'Dr. Sarah Wilson',
      department: 'Internal Medicine',
      type: 'new_patient',
      status: 'checked_in',
      date: '2026-01-24',
      time: '09:30',
      endTime: '10:15',
      duration: 45,
      room: 'Room 101',
      isVirtual: false,
      chiefComplaint: 'Annual physical exam',
    },
    {
      id: '3',
      patientName: 'Michael Davis',
      patientMrn: 'MRN-2026-022',
      providerName: 'Dr. Sarah Wilson',
      department: 'Internal Medicine',
      type: 'consultation',
      status: 'scheduled',
      date: '2026-01-24',
      time: '10:30',
      endTime: '11:00',
      duration: 30,
      room: 'Room 102',
      isVirtual: false,
      chiefComplaint: 'Diabetes management consultation',
    },
    {
      id: '4',
      patientName: 'Sarah Williams',
      patientMrn: 'MRN-2025-089',
      providerName: 'Dr. Michael Chen',
      department: 'Cardiology',
      type: 'telehealth',
      status: 'confirmed',
      date: '2026-01-24',
      time: '11:00',
      endTime: '11:30',
      duration: 30,
      isVirtual: true,
      chiefComplaint: 'Virtual follow-up for heart palpitations',
    },
    {
      id: '5',
      patientName: 'Robert Brown',
      patientMrn: 'MRN-2026-031',
      providerName: 'Dr. Jennifer Martinez',
      department: 'Pediatrics',
      type: 'vaccination',
      status: 'scheduled',
      date: '2026-01-24',
      time: '14:00',
      endTime: '14:15',
      duration: 15,
      room: 'Room 201',
      isVirtual: false,
      chiefComplaint: 'Routine vaccinations',
    },
    {
      id: '6',
      patientName: 'Lisa Anderson',
      patientMrn: 'MRN-2026-045',
      providerName: 'Dr. Sarah Wilson',
      department: 'Internal Medicine',
      type: 'urgent_care',
      status: 'in_progress',
      date: '2026-01-24',
      time: '14:30',
      endTime: '15:00',
      duration: 30,
      room: 'Room 101',
      isVirtual: false,
      chiefComplaint: 'Acute chest pain',
    },
  ];

  const providers = [
    { id: '1', name: 'Dr. Sarah Wilson', specialty: 'Internal Medicine' },
    { id: '2', name: 'Dr. Michael Chen', specialty: 'Cardiology' },
    { id: '3', name: 'Dr. Jennifer Martinez', specialty: 'Pediatrics' },
    { id: '4', name: 'Dr. Lisa Anderson', specialty: 'Dermatology' },
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00'
  ];

  const getAppointmentForSlot = (time: string, providerId?: string) => {
    return appointments.find(apt => 
      apt.time === time && 
      apt.date === selectedDate &&
      (!providerId || apt.providerName === providers.find(p => p.id === providerId)?.name)
    );
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetailModal(true);
  };

  const todayAppointments = appointments.filter(apt => apt.date === selectedDate);
  const upcomingCount = todayAppointments.filter(apt => ['scheduled', 'confirmed'].includes(apt.status)).length;
  const checkedInCount = todayAppointments.filter(apt => apt.status === 'checked_in').length;
  const completedCount = todayAppointments.filter(apt => apt.status === 'completed').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
          <p className="text-gray-500 mt-1">Schedule, manage, and track patient appointments</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <span>📥</span>
            Import
          </button>
          <button
            onClick={() => setShowNewAppointmentModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>➕</span>
            New Appointment
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'calendar', label: 'Calendar', icon: '📅' },
            { id: 'list', label: 'Appointment List', icon: '📋' },
            { id: 'waitlist', label: 'Waitlist', icon: '⏳' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Today's Appointments" value={todayAppointments.length} icon="📅" color="bg-blue-100" />
            <MetricCard label="Checked In" value={checkedInCount} icon="✅" color="bg-green-100" />
            <MetricCard label="Upcoming" value={upcomingCount} icon="⏰" color="bg-yellow-100" />
            <MetricCard label="Completed Today" value={completedCount} icon="🏁" color="bg-gray-100" />
          </div>

          {/* Calendar Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">←</button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">→</button>
              <button 
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Providers</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>{provider.name}</option>
                ))}
              </select>

              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {['day', 'week', 'month'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as typeof viewMode)}
                    className={`px-3 py-1.5 text-sm font-medium rounded ${
                      viewMode === mode
                        ? 'bg-white text-gray-900 shadow'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Day View Calendar */}
          {viewMode === 'day' && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-[80px_1fr] divide-x divide-gray-200">
                {/* Time Column */}
                <div className="bg-gray-50">
                  <div className="h-12 border-b border-gray-200" />
                  {timeSlots.map((time) => (
                    <div key={time} className="h-16 px-2 py-1 text-xs text-gray-500 border-b border-gray-100">
                      {time}
                    </div>
                  ))}
                </div>

                {/* Appointments Column */}
                <div>
                  <div className="h-12 border-b border-gray-200 px-4 flex items-center">
                    <h3 className="font-medium text-gray-900">
                      {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {timeSlots.map((time) => {
                      const appointment = getAppointmentForSlot(time, selectedProvider);
                      return (
                        <div key={time} className="h-16 px-2 py-1">
                          <TimeSlot 
                            time={time} 
                            appointment={appointment}
                            onClick={() => appointment ? handleAppointmentClick(appointment) : setShowNewAppointmentModal(true)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Week View */}
          {viewMode === 'week' && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-center text-gray-500 py-12">Week view coming soon...</p>
            </div>
          )}

          {/* Month View */}
          {viewMode === 'month' && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-center text-gray-500 py-12">Month view coming soon...</p>
            </div>
          )}
        </div>
      )}

      {/* List Tab */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
              <option value="">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
              <option value="">All Types</option>
              <option value="new_patient">New Patient</option>
              <option value="follow_up">Follow Up</option>
              <option value="consultation">Consultation</option>
              <option value="telehealth">Telehealth</option>
              <option value="urgent_care">Urgent Care</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
              <option value="">All Providers</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>{provider.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search patient name or MRN..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Appointments Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
                      <p className="text-xs text-gray-500">{appointment.duration} min</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={appointment.patientName} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{appointment.patientName}</p>
                          <p className="text-xs text-gray-500">{appointment.patientMrn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{appointment.providerName}</p>
                      <p className="text-xs text-gray-500">{appointment.department}</p>
                    </td>
                    <td className="px-6 py-4">
                      <AppointmentTypeBadge type={appointment.type} />
                      {appointment.isVirtual && <span className="ml-1 text-xs">📹</span>}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={appointment.status} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{appointment.room || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleAppointmentClick(appointment)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </button>
                        {appointment.status === 'scheduled' && (
                          <button className="text-green-600 hover:text-green-800 text-sm">Check In</button>
                        )}
                        {appointment.status === 'checked_in' && (
                          <button className="text-purple-600 hover:text-purple-800 text-sm">Start</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Waitlist Tab */}
      {activeTab === 'waitlist' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Patients waiting for appointment openings</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              ➕ Add to Waitlist
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preferred Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Added</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { id: '1', patientName: 'Jane Doe', provider: 'Dr. Sarah Wilson', type: 'follow_up', preferredDates: 'Jan 25-31', priority: 'high', addedDate: '2026-01-20' },
                  { id: '2', patientName: 'Mark Johnson', provider: 'Any Available', type: 'consultation', preferredDates: 'Feb 1-7', priority: 'normal', addedDate: '2026-01-18' },
                  { id: '3', patientName: 'Alice Smith', provider: 'Dr. Michael Chen', type: 'new_patient', preferredDates: 'ASAP', priority: 'high', addedDate: '2026-01-22' },
                ].map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={entry.patientName} size="sm" />
                        <p className="text-sm font-medium text-gray-900">{entry.patientName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{entry.provider}</td>
                    <td className="px-6 py-4">
                      <AppointmentTypeBadge type={entry.type} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{entry.preferredDates}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        entry.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {entry.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{entry.addedDate}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-green-600 hover:text-green-800 text-sm">Schedule</button>
                        <button className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Appointment Modal */}
      {showNewAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Schedule New Appointment</h2>
                <button
                  onClick={() => setShowNewAppointmentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
                  <input
                    type="text"
                    placeholder="Search patient by name or MRN..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Provider *</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="">Select provider...</option>
                      {providers.map((provider) => (
                        <option key={provider.id} value={provider.id}>{provider.name} - {provider.specialty}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Type *</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="">Select type...</option>
                      <option value="new_patient">New Patient</option>
                      <option value="follow_up">Follow Up</option>
                      <option value="consultation">Consultation</option>
                      <option value="procedure">Procedure</option>
                      <option value="telehealth">Telehealth</option>
                      <option value="physical_exam">Physical Exam</option>
                      <option value="vaccination">Vaccination</option>
                      <option value="urgent_care">Urgent Care</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      defaultValue={selectedDate}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="">Select time...</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="15">15 minutes</option>
                      <option value="30" selected>30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="">Auto-assign</option>
                      <option value="101">Room 101</option>
                      <option value="102">Room 102</option>
                      <option value="201">Room 201</option>
                      <option value="202">Room 202</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-gray-700">Virtual / Telehealth</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chief Complaint / Reason for Visit</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of the visit reason..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-700">Send confirmation email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-700">Send SMS reminder</span>
                  </label>
                </div>
              </form>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowNewAppointmentModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Schedule Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {showAppointmentDetailModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
                    <StatusBadge status={selectedAppointment.status} />
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedAppointment.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    {' • '}{selectedAppointment.time} - {selectedAppointment.endTime}
                  </p>
                </div>
                <button
                  onClick={() => setShowAppointmentDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Patient Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">👤 Patient</h3>
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar name={selectedAppointment.patientName} />
                    <div>
                      <p className="font-medium text-gray-900">{selectedAppointment.patientName}</p>
                      <p className="text-sm text-gray-500">{selectedAppointment.patientMrn}</p>
                    </div>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-800">View Patient Profile →</button>
                </div>

                {/* Provider Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">🩺 Provider</h3>
                  <p className="font-medium text-gray-900">{selectedAppointment.providerName}</p>
                  <p className="text-sm text-gray-500">{selectedAppointment.department}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedAppointment.room || (selectedAppointment.isVirtual ? '📹 Virtual' : 'No room assigned')}
                  </p>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">📋 Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Type</p>
                    <AppointmentTypeBadge type={selectedAppointment.type} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="text-sm text-gray-900">{selectedAppointment.duration} minutes</p>
                  </div>
                </div>
                {selectedAppointment.chiefComplaint && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">Chief Complaint</p>
                    <p className="text-sm text-gray-900">{selectedAppointment.chiefComplaint}</p>
                  </div>
                )}
                {selectedAppointment.notes && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">Notes</p>
                    <p className="text-sm text-gray-900">{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {selectedAppointment.status === 'scheduled' && (
                  <>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                      ✅ Confirm
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                      📥 Check In
                    </button>
                  </>
                )}
                {selectedAppointment.status === 'confirmed' && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    📥 Check In
                  </button>
                )}
                {selectedAppointment.status === 'checked_in' && (
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                    ▶️ Start Appointment
                  </button>
                )}
                {selectedAppointment.status === 'in_progress' && (
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">
                    ✓ Complete
                  </button>
                )}
                {selectedAppointment.isVirtual && ['confirmed', 'checked_in', 'in_progress'].includes(selectedAppointment.status) && (
                  <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm">
                    📹 Join Video Call
                  </button>
                )}
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                  📅 Reschedule
                </button>
                {!['completed', 'cancelled', 'no_show'].includes(selectedAppointment.status) && (
                  <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm">
                    ✕ Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
