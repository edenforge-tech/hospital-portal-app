'use client';

import React, { useState } from 'react';

// ============================================================================
// Types
// ============================================================================

interface StaffMember {
  id: string;
  name: string;
  position: string;
  department: string;
  employmentType: string;
  status: string;
  shift: string;
  phone: string;
  email: string;
  imageUrl?: string;
}

interface Shift {
  id: string;
  staffName: string;
  staffId: string;
  shiftType: string;
  date: string;
  startTime: string;
  endTime: string;
  department: string;
  status: string;
}

interface TimeOffRequest {
  id: string;
  staffName: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  reason: string;
}

// ============================================================================
// Components
// ============================================================================

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    on_leave: 'bg-yellow-100 text-yellow-700',
    inactive: 'bg-gray-100 text-gray-700',
    suspended: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    denied: 'bg-red-100 text-red-700',
    open: 'bg-blue-100 text-blue-700',
    assigned: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    confirmed: 'bg-green-100 text-green-700',
    clocked_in: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.active}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function ShiftTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    day: 'bg-amber-100 text-amber-700',
    evening: 'bg-orange-100 text-orange-700',
    night: 'bg-indigo-100 text-indigo-700',
    overnight: 'bg-purple-100 text-purple-700',
    on_call: 'bg-pink-100 text-pink-700',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-700'}`}>
      {type.replace(/_/g, ' ')}
    </span>
  );
}

function MetricCard({ label, value, icon, color, subtitle }: { 
  label: string; 
  value: string | number; 
  icon: string; 
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <span className="text-lg">{icon}</span>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function Avatar({ name, imageUrl, size = 'md' }: { name: string; imageUrl?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-blue-100 flex items-center justify-center font-medium text-blue-600`}>
      {initials}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function StaffSchedulingPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schedule' | 'staff' | 'time-off' | 'time-clock'>('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [showNewShiftModal, setShowNewShiftModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Mock data
  const staff: StaffMember[] = [
    { id: '1', name: 'Dr. Sarah Wilson', position: 'Attending Physician', department: 'Internal Medicine', employmentType: 'full_time', status: 'active', shift: 'Day', phone: '555-0101', email: 'sarah.wilson@hospital.com' },
    { id: '2', name: 'Nurse John Davis', position: 'Registered Nurse', department: 'Emergency', employmentType: 'full_time', status: 'active', shift: 'Night', phone: '555-0102', email: 'john.davis@hospital.com' },
    { id: '3', name: 'Dr. Michael Chen', position: 'Radiologist', department: 'Radiology', employmentType: 'full_time', status: 'active', shift: 'Day', phone: '555-0103', email: 'michael.chen@hospital.com' },
    { id: '4', name: 'Nurse Emily Brown', position: 'Nurse Practitioner', department: 'Pediatrics', employmentType: 'part_time', status: 'on_leave', shift: 'Evening', phone: '555-0104', email: 'emily.brown@hospital.com' },
    { id: '5', name: 'Tech James Lee', position: 'Lab Technician', department: 'Laboratory', employmentType: 'full_time', status: 'active', shift: 'Day', phone: '555-0105', email: 'james.lee@hospital.com' },
    { id: '6', name: 'Dr. Lisa Anderson', position: 'Cardiologist', department: 'Cardiology', employmentType: 'full_time', status: 'active', shift: 'Day', phone: '555-0106', email: 'lisa.anderson@hospital.com' },
  ];

  const shifts: Shift[] = [
    { id: '1', staffName: 'Dr. Sarah Wilson', staffId: '1', shiftType: 'day', date: '2026-01-24', startTime: '08:00', endTime: '16:00', department: 'Internal Medicine', status: 'confirmed' },
    { id: '2', staffName: 'Nurse John Davis', staffId: '2', shiftType: 'night', date: '2026-01-24', startTime: '22:00', endTime: '06:00', department: 'Emergency', status: 'clocked_in' },
    { id: '3', staffName: 'Dr. Michael Chen', staffId: '3', shiftType: 'day', date: '2026-01-24', startTime: '09:00', endTime: '17:00', department: 'Radiology', status: 'assigned' },
    { id: '4', staffName: 'Tech James Lee', staffId: '5', shiftType: 'day', date: '2026-01-24', startTime: '07:00', endTime: '15:00', department: 'Laboratory', status: 'confirmed' },
    { id: '5', staffName: 'Dr. Lisa Anderson', staffId: '6', shiftType: 'day', date: '2026-01-24', startTime: '08:00', endTime: '16:00', department: 'Cardiology', status: 'assigned' },
    { id: '6', staffName: '', staffId: '', shiftType: 'evening', date: '2026-01-24', startTime: '16:00', endTime: '00:00', department: 'Emergency', status: 'open' },
    { id: '7', staffName: '', staffId: '', shiftType: 'night', date: '2026-01-25', startTime: '22:00', endTime: '06:00', department: 'ICU', status: 'open' },
  ];

  const timeOffRequests: TimeOffRequest[] = [
    { id: '1', staffName: 'Nurse Emily Brown', type: 'vacation', startDate: '2026-01-20', endDate: '2026-01-27', status: 'approved', reason: 'Family vacation' },
    { id: '2', staffName: 'Dr. Sarah Wilson', type: 'personal', startDate: '2026-02-01', endDate: '2026-02-01', status: 'pending', reason: 'Personal appointment' },
    { id: '3', staffName: 'Tech James Lee', type: 'sick', startDate: '2026-01-23', endDate: '2026-01-23', status: 'approved', reason: 'Doctor appointment' },
    { id: '4', staffName: 'Nurse John Davis', type: 'vacation', startDate: '2026-02-10', endDate: '2026-02-15', status: 'pending', reason: 'Winter vacation' },
  ];

  const departments = ['Internal Medicine', 'Emergency', 'Radiology', 'Pediatrics', 'Laboratory', 'Cardiology', 'ICU', 'Surgery'];

  // Generate week days for the schedule view
  const getWeekDays = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  };

  const weekDays = getWeekDays(selectedDate);
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Scheduling</h1>
          <p className="text-gray-500 mt-1">Shift management, time tracking, and workforce optimization</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <span>📅</span>
            Auto-Schedule
          </button>
          <button
            onClick={() => setShowNewShiftModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>➕</span>
            Add Shift
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'schedule', label: 'Schedule', icon: '📅' },
            { id: 'staff', label: 'Staff', icon: '👥' },
            { id: 'time-off', label: 'Time Off', icon: '🏖️' },
            { id: 'time-clock', label: 'Time Clock', icon: '⏰' },
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

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Active Staff" value={45} icon="👥" color="bg-blue-100" subtitle="5 on leave" />
            <MetricCard label="Open Shifts" value={8} icon="📅" color="bg-yellow-100" subtitle="Next 7 days" />
            <MetricCard label="Coverage Rate" value="94%" icon="✅" color="bg-green-100" subtitle="+2% this week" />
            <MetricCard label="Overtime Hours" value="32" icon="⏰" color="bg-red-100" subtitle="This week" />
          </div>

          {/* Today's Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Currently Working */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>🟢</span> Currently Working
              </h3>
              <div className="space-y-3">
                {shifts.filter(s => s.status === 'clocked_in' || (s.status === 'confirmed' && s.date === selectedDate)).slice(0, 5).map((shift) => (
                  <div key={shift.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar name={shift.staffName || 'Unassigned'} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{shift.staffName || 'Unassigned'}</p>
                        <p className="text-xs text-gray-500">{shift.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <ShiftTypeBadge type={shift.shiftType} />
                      <p className="text-xs text-gray-500 mt-1">{shift.startTime} - {shift.endTime}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
                View All Staff on Duty
              </button>
            </div>

            {/* Open Shifts */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>⚠️</span> Open Shifts (Urgent)
              </h3>
              <div className="space-y-3">
                {shifts.filter(s => s.status === 'open').map((shift) => (
                  <div key={shift.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{shift.department}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <ShiftTypeBadge type={shift.shiftType} />
                        <span className="text-xs text-gray-500">{shift.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-700">{shift.startTime} - {shift.endTime}</p>
                      <button className="text-xs text-blue-600 hover:text-blue-800 mt-1">Assign Staff</button>
                    </div>
                  </div>
                ))}
                {shifts.filter(s => s.status === 'open').length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No open shifts! 🎉</p>
                )}
              </div>
            </div>
          </div>

          {/* Pending Requests & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Time Off */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>📋</span> Pending Time Off Requests
              </h3>
              <div className="space-y-3">
                {timeOffRequests.filter(r => r.status === 'pending').map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar name={request.staffName} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{request.staffName}</p>
                        <p className="text-xs text-gray-500">{request.type} • {request.startDate} - {request.endDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">
                        Approve
                      </button>
                      <button className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">
                        Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expiring Credentials */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>🔔</span> Expiring Credentials
              </h3>
              <div className="space-y-3">
                {[
                  { staff: 'Nurse John Davis', credential: 'BLS Certification', expires: '2026-02-15', daysLeft: 22 },
                  { staff: 'Dr. Sarah Wilson', credential: 'Medical License', expires: '2026-03-01', daysLeft: 36 },
                  { staff: 'Tech James Lee', credential: 'CLIA Certificate', expires: '2026-02-28', daysLeft: 35 },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.staff}</p>
                      <p className="text-xs text-gray-500">{item.credential}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-yellow-700 font-medium">{item.daysLeft} days left</p>
                      <p className="text-xs text-gray-500">Expires: {item.expires}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          {/* Schedule Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
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

          {/* Week Schedule Grid */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-8 border-b border-gray-200">
              <div className="p-3 bg-gray-50 font-medium text-sm text-gray-700">Staff</div>
              {weekDays.map((day, idx) => (
                <div 
                  key={day} 
                  className={`p-3 text-center font-medium text-sm ${
                    day === new Date().toISOString().split('T')[0] 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'bg-gray-50 text-gray-700'
                  }`}
                >
                  <p>{dayNames[idx]}</p>
                  <p className="text-xs">{new Date(day).getDate()}</p>
                </div>
              ))}
            </div>

            {staff.filter(s => s.status === 'active').map((member) => (
              <div key={member.id} className="grid grid-cols-8 border-b border-gray-200 last:border-0">
                <div className="p-3 flex items-center gap-2">
                  <Avatar name={member.name} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.department}</p>
                  </div>
                </div>
                {weekDays.map((day) => {
                  const dayShifts = shifts.filter(s => s.staffId === member.id && s.date === day);
                  return (
                    <div key={day} className="p-2 min-h-[60px] border-l border-gray-200">
                      {dayShifts.map((shift) => (
                        <div
                          key={shift.id}
                          className={`text-xs p-1 rounded mb-1 ${
                            shift.shiftType === 'day' ? 'bg-amber-100 text-amber-800' :
                            shift.shiftType === 'evening' ? 'bg-orange-100 text-orange-800' :
                            shift.shiftType === 'night' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {shift.startTime}-{shift.endTime}
                        </div>
                      ))}
                      {dayShifts.length === 0 && (
                        <button className="w-full h-full flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-50 rounded">
                          <span className="text-lg">+</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">Shift Types:</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-200"></span> Day</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-200"></span> Evening</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-200"></span> Night</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-pink-200"></span> On-Call</span>
          </div>
        </div>
      )}

      {/* Staff Tab */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="inactive">Inactive</option>
            </select>
            <input
              type="text"
              placeholder="Search staff..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              ➕ Add Staff
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Default Shift</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {staff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={member.name} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{member.position}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{member.department}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        member.employmentType === 'full_time' ? 'bg-green-100 text-green-700' :
                        member.employmentType === 'part_time' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {member.employmentType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <ShiftTypeBadge type={member.shift.toLowerCase()} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={member.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                        <button className="text-gray-600 hover:text-gray-800 text-sm">Schedule</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Time Off Tab */}
      {activeTab === 'time-off' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                <option value="">All Types</option>
                <option value="vacation">Vacation</option>
                <option value="sick">Sick</option>
                <option value="personal">Personal</option>
                <option value="bereavement">Bereavement</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
              </select>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              ➕ New Request
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {timeOffRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={request.staffName} size="sm" />
                        <p className="text-sm font-medium text-gray-900">{request.staffName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        request.type === 'vacation' ? 'bg-blue-100 text-blue-700' :
                        request.type === 'sick' ? 'bg-red-100 text-red-700' :
                        request.type === 'personal' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {request.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {request.startDate} - {request.endDate}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{request.reason}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-6 py-4">
                      {request.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button className="text-green-600 hover:text-green-800 text-sm">Approve</button>
                          <button className="text-red-600 hover:text-red-800 text-sm">Deny</button>
                        </div>
                      ) : (
                        <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Time Clock Tab */}
      {activeTab === 'time-clock' && (
        <div className="space-y-6">
          {/* Quick Clock Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Clock</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button className="p-6 border-2 border-green-500 rounded-lg text-center hover:bg-green-50 transition-colors">
                <span className="text-4xl">🟢</span>
                <p className="mt-2 font-semibold text-green-700">Clock In</p>
              </button>
              <button className="p-6 border-2 border-red-500 rounded-lg text-center hover:bg-red-50 transition-colors">
                <span className="text-4xl">🔴</span>
                <p className="mt-2 font-semibold text-red-700">Clock Out</p>
              </button>
              <button className="p-6 border-2 border-yellow-500 rounded-lg text-center hover:bg-yellow-50 transition-colors">
                <span className="text-4xl">☕</span>
                <p className="mt-2 font-semibold text-yellow-700">Start Break</p>
              </button>
              <button className="p-6 border-2 border-blue-500 rounded-lg text-center hover:bg-blue-50 transition-colors">
                <span className="text-4xl">▶️</span>
                <p className="mt-2 font-semibold text-blue-700">End Break</p>
              </button>
            </div>
          </div>

          {/* Today's Time Entries */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Time Entries</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Clock In</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Break</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Clock Out</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Hours</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { name: 'Dr. Sarah Wilson', clockIn: '08:02', break: '30 min', clockOut: '-', total: '7h 58m', status: 'clocked_in' },
                  { name: 'Nurse John Davis', clockIn: '22:05', break: '-', clockOut: '-', total: '4h 55m', status: 'clocked_in' },
                  { name: 'Tech James Lee', clockIn: '06:58', break: '45 min', clockOut: '15:03', total: '7h 20m', status: 'completed' },
                  { name: 'Dr. Lisa Anderson', clockIn: '08:15', break: '30 min', clockOut: '-', total: '7h 45m', status: 'clocked_in' },
                ].map((entry, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={entry.name} size="sm" />
                        <span className="text-sm text-gray-900">{entry.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{entry.clockIn}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{entry.break}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{entry.clockOut}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{entry.total}</td>
                    <td className="px-4 py-3"><StatusBadge status={entry.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Shift Modal */}
      {showNewShiftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Add New Shift</h2>
                <button
                  onClick={() => setShowNewShiftModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select department...</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shift Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="day">Day (8:00 AM - 4:00 PM)</option>
                      <option value="evening">Evening (4:00 PM - 12:00 AM)</option>
                      <option value="night">Night (10:00 PM - 6:00 AM)</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Staff (Optional)</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Leave unassigned</option>
                    {staff.filter(s => s.status === 'active').map((member) => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional notes..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowNewShiftModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Create Shift
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
