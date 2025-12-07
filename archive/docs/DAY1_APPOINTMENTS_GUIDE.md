# Day 1-2: Appointments Calendar Implementation
**Quick Start Guide**

**Goal**: Transform basic appointments page into fully functional calendar with scheduling

---

## 🎯 Today's Objectives

- [ ] Install FullCalendar React library
- [ ] Create `AppointmentCalendar.tsx` component with month/week/day views
- [ ] Create enhanced `AppointmentFormModal.tsx` for create/edit
- [ ] Integrate with 7 existing API endpoints
- [ ] Replace table view with calendar in appointments page

**Estimated Time**: 12-16 hours (2 days)

---

## Step 1: Install Dependencies (5 minutes)

```powershell
cd apps/hospital-portal-web

# Install FullCalendar
pnpm add @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction @fullcalendar/list

# Install date utilities
pnpm add date-fns

# Install additional UI libraries (if needed)
pnpm add react-datepicker
pnpm add react-select
```

---

## Step 2: Create API Service (30 minutes)

**File**: `src/lib/api/appointments.api.ts`

```typescript
import { getApi } from '../api';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  departmentId?: string;
  departmentName?: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  appointmentType: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  reasonForVisit?: string;
  duration: number; // minutes
}

export interface AppointmentFilters {
  startDate?: string;
  endDate?: string;
  doctorId?: string;
  patientId?: string;
  departmentId?: string;
  status?: string;
  appointmentType?: string;
}

export interface CreateAppointmentDto {
  patientId: string;
  doctorId: string;
  departmentId?: string;
  appointmentDate: string;
  startTime: string;
  duration: number;
  appointmentType: string;
  reasonForVisit?: string;
  notes?: string;
}

export interface UpdateAppointmentDto extends Partial<CreateAppointmentDto> {
  status?: string;
}

export const appointmentsApi = {
  // List appointments with filters
  getAll: async (filters?: AppointmentFilters) => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.doctorId) params.append('doctorId', filters.doctorId);
    if (filters?.patientId) params.append('patientId', filters.patientId);
    if (filters?.departmentId) params.append('departmentId', filters.departmentId);
    if (filters?.status) params.append('status', filters.status);
    
    return getApi().get<Appointment[]>(`/appointments?${params.toString()}`);
  },

  // Get single appointment
  getById: async (id: string) => {
    return getApi().get<Appointment>(`/appointments/${id}`);
  },

  // Create appointment
  create: async (data: CreateAppointmentDto) => {
    return getApi().post<Appointment>('/appointments', data);
  },

  // Update appointment
  update: async (id: string, data: UpdateAppointmentDto) => {
    return getApi().put<Appointment>(`/appointments/${id}`, data);
  },

  // Delete/Cancel appointment
  cancel: async (id: string) => {
    return getApi().delete(`/appointments/${id}`);
  },

  // Change status
  updateStatus: async (id: string, status: string) => {
    return getApi().put(`/appointments/${id}/status`, { status });
  },

  // Get calendar view data
  getCalendarData: async (startDate: string, endDate: string) => {
    return getApi().get<Appointment[]>(`/appointments/calendar?startDate=${startDate}&endDate=${endDate}`);
  },

  // Check availability (optional)
  checkAvailability: async (doctorId: string, date: string, startTime: string, duration: number) => {
    return getApi().get(`/appointments/availability?doctorId=${doctorId}&date=${date}&startTime=${startTime}&duration=${duration}`);
  }
};
```

---

## Step 3: Create Calendar Component (4 hours)

**File**: `src/components/appointments/AppointmentCalendar.tsx`

```typescript
'use client';

import { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Appointment } from '@/lib/api/appointments.api';

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onEventClick: (appointment: Appointment) => void;
  onDateClick: (date: Date) => void;
  onEventDrop?: (appointmentId: string, newDate: Date) => void;
  loading?: boolean;
}

const statusColors: Record<string, string> = {
  scheduled: '#3B82F6', // blue
  confirmed: '#10B981', // green
  'in-progress': '#F59E0B', // yellow
  completed: '#6B7280', // gray
  cancelled: '#EF4444', // red
  'no-show': '#DC2626', // dark red
};

export default function AppointmentCalendar({
  appointments,
  onEventClick,
  onDateClick,
  onEventDrop,
  loading = false
}: AppointmentCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [currentView, setCurrentView] = useState('dayGridMonth');

  // Transform appointments to FullCalendar events
  const events = appointments.map(apt => ({
    id: apt.id,
    title: `${apt.patientName} - ${apt.doctorName}`,
    start: `${apt.appointmentDate}T${apt.startTime}`,
    end: apt.endTime ? `${apt.appointmentDate}T${apt.endTime}` : undefined,
    backgroundColor: statusColors[apt.status] || '#3B82F6',
    borderColor: statusColors[apt.status] || '#3B82F6',
    extendedProps: {
      appointment: apt
    }
  }));

  const handleEventClick = (info: any) => {
    const appointment = info.event.extendedProps.appointment as Appointment;
    onEventClick(appointment);
  };

  const handleDateClick = (info: any) => {
    onDateClick(new Date(info.dateStr));
  };

  const handleEventDrop = (info: any) => {
    if (onEventDrop) {
      const appointment = info.event.extendedProps.appointment as Appointment;
      onEventDrop(appointment.id, info.event.start);
    }
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(view);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* View Switcher */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => handleViewChange('dayGridMonth')}
            className={`px-4 py-2 rounded ${
              currentView === 'dayGridMonth'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => handleViewChange('timeGridWeek')}
            className={`px-4 py-2 rounded ${
              currentView === 'timeGridWeek'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => handleViewChange('timeGridDay')}
            className={`px-4 py-2 rounded ${
              currentView === 'timeGridDay'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => handleViewChange('listWeek')}
            className={`px-4 py-2 rounded ${
              currentView === 'listWeek'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            List
          </button>
        </div>

        {/* Legend */}
        <div className="flex gap-3 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: statusColors.scheduled }}></div>
            <span>Scheduled</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: statusColors.confirmed }}></div>
            <span>Confirmed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: statusColors['in-progress'] }}></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: statusColors.completed }}></div>
            <span>Completed</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: '' // We have custom view switcher
          }}
          events={events}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          editable={true}
          droppable={true}
          eventDrop={handleEventDrop}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          height="auto"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }}
        />
      )}
    </div>
  );
}
```

---

## Step 4: Create Appointment Form Modal (4 hours)

**File**: `src/components/appointments/AppointmentFormModal.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Users, FileText } from 'lucide-react';
import { Appointment, CreateAppointmentDto, appointmentsApi } from '@/lib/api/appointments.api';
import { getApi } from '@/lib/api';

interface AppointmentFormModalProps {
  appointment?: Appointment;
  initialDate?: Date;
  onClose: () => void;
  onSave: () => void;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  medicalRecordNumber: string;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization?: string;
}

interface Department {
  id: string;
  name: string;
}

export default function AppointmentFormModal({
  appointment,
  initialDate,
  onClose,
  onSave
}: AppointmentFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data
  const [patientId, setPatientId] = useState(appointment?.patientId || '');
  const [doctorId, setDoctorId] = useState(appointment?.doctorId || '');
  const [departmentId, setDepartmentId] = useState(appointment?.departmentId || '');
  const [appointmentDate, setAppointmentDate] = useState(
    appointment?.appointmentDate || initialDate?.toISOString().split('T')[0] || ''
  );
  const [startTime, setStartTime] = useState(appointment?.startTime || '09:00');
  const [duration, setDuration] = useState(appointment?.duration || 30);
  const [appointmentType, setAppointmentType] = useState(appointment?.appointmentType || 'consultation');
  const [reasonForVisit, setReasonForVisit] = useState(appointment?.reasonForVisit || '');
  const [notes, setNotes] = useState(appointment?.notes || '');
  
  // Lookup data
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load patients, doctors, departments
      const [patientsRes, doctorsRes, departmentsRes] = await Promise.all([
        getApi().get<Patient[]>('/patients'),
        getApi().get<Doctor[]>('/users?userType=Doctor'),
        getApi().get<Department[]>('/departments')
      ]);
      
      setPatients(patientsRes.data || []);
      setDoctors(doctorsRes.data || []);
      setDepartments(departmentsRes.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientId || !doctorId || !appointmentDate || !startTime) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data: CreateAppointmentDto = {
        patientId,
        doctorId,
        departmentId: departmentId || undefined,
        appointmentDate,
        startTime,
        duration,
        appointmentType,
        reasonForVisit: reasonForVisit || undefined,
        notes: notes || undefined
      };

      if (appointment) {
        await appointmentsApi.update(appointment.id, data);
      } else {
        await appointmentsApi.create(data);
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save appointment');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p =>
    `${p.firstName} ${p.lastName} ${p.medicalRecordNumber}`
      .toLowerCase()
      .includes(patientSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {appointment ? 'Edit Appointment' : 'New Appointment'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Patient Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search patient by name or MRN..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {patientSearch && (
              <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto">
                {filteredPatients.map(patient => (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => {
                      setPatientId(patient.id);
                      setPatientSearch(`${patient.firstName} ${patient.lastName} (${patient.medicalRecordNumber})`);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50"
                  >
                    {patient.firstName} {patient.lastName} - {patient.medicalRecordNumber}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Doctor <span className="text-red-500">*</span>
            </label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.firstName} {doctor.lastName}
                  {doctor.specialization && ` - ${doctor.specialization}`}
                </option>
              ))}
            </select>
          </div>

          {/* Department Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Department (Optional)</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Duration & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Type
              </label>
              <select
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="consultation">Consultation</option>
                <option value="follow-up">Follow-up</option>
                <option value="emergency">Emergency</option>
                <option value="routine-checkup">Routine Checkup</option>
                <option value="procedure">Procedure</option>
              </select>
            </div>
          </div>

          {/* Reason for Visit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Visit
            </label>
            <textarea
              value={reasonForVisit}
              onChange={(e) => setReasonForVisit(e.target.value)}
              rows={2}
              placeholder="Brief description of the reason for visit..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any additional notes or special instructions..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : (appointment ? 'Update' : 'Create')} Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

## Step 5: Update Appointments Page (2 hours)

**File**: `apps/hospital-portal-web/src/app/dashboard/appointments/page.tsx`

Replace entire content with:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { appointmentsApi, Appointment, AppointmentFilters } from '@/lib/api/appointments.api';
import AppointmentCalendar from '@/components/appointments/AppointmentCalendar';
import AppointmentFormModal from '@/components/appointments/AppointmentFormModal';
import { Calendar, Plus, Filter, RefreshCw } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';

export default function AppointmentsPage() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [filters, setFilters] = useState<AppointmentFilters>({});

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user, filters]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentsApi.getAll(filters);
      setAppointments(response.data || []);
    } catch (err) {
      console.error('Error loading appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowFormModal(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedAppointment(undefined);
    setShowFormModal(true);
  };

  const handleSave = () => {
    loadAppointments();
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setSelectedAppointment(undefined);
    setSelectedDate(undefined);
  };

  // Calculate statistics
  const todayAppointments = appointments.filter(apt => 
    apt.appointmentDate === new Date().toISOString().split('T')[0]
  ).length;
  const scheduledCount = appointments.filter(apt => apt.status === 'scheduled').length;
  const completedCount = appointments.filter(apt => apt.status === 'completed').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">Schedule and manage patient appointments</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadAppointments}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={20} />
            Refresh
          </button>
          <button
            onClick={() => {
              setSelectedAppointment(undefined);
              setSelectedDate(undefined);
              setShowFormModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus size={20} />
            New Appointment
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Today's Appointments"
          value={todayAppointments}
          icon={Calendar}
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Scheduled"
          value={scheduledCount}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Completed"
          value={completedCount}
          icon={Calendar}
          color="green"
        />
        <StatCard
          title="Total"
          value={appointments.length}
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Calendar */}
      <AppointmentCalendar
        appointments={appointments}
        onEventClick={handleEventClick}
        onDateClick={handleDateClick}
        loading={loading}
      />

      {/* Form Modal */}
      {showFormModal && (
        <AppointmentFormModal
          appointment={selectedAppointment}
          initialDate={selectedDate}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
```

---

## Step 6: Test Everything (1 hour)

### Manual Testing Checklist

- [ ] **Calendar Loads**
  - Navigate to `/dashboard/appointments`
  - Calendar displays with month view
  - View switcher works (Month/Week/Day/List)

- [ ] **Create Appointment**
  - Click "New Appointment" button
  - Form modal opens
  - Fill in all fields
  - Submit successfully
  - Appointment appears on calendar

- [ ] **Date Click**
  - Click on any date in calendar
  - Form modal opens with pre-filled date
  - Create appointment for that date

- [ ] **Event Click**
  - Click on existing appointment
  - Form modal opens with appointment data
  - Edit and save
  - Changes reflect on calendar

- [ ] **Status Colors**
  - Scheduled appointments are blue
  - Confirmed appointments are green
  - Completed appointments are gray
  - Cancelled appointments are red

- [ ] **Statistics**
  - "Today's Appointments" shows correct count
  - "Scheduled" shows correct count
  - "Completed" shows correct count
  - "Total" shows correct count

- [ ] **Responsive Design**
  - Calendar works on desktop
  - Calendar works on tablet
  - Calendar works on mobile

---

## Common Issues & Solutions

### Issue 1: FullCalendar CSS not loading
**Solution**:
```typescript
// Add to page.tsx or layout.tsx
import '@fullcalendar/common/main.css';
import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/timegrid/main.css';
```

### Issue 2: API returns 401 Unauthorized
**Solution**: Check that JWT token is included in headers (should be automatic via `getApi()`)

### Issue 3: Appointments not displaying
**Solution**: 
1. Check API response in Network tab
2. Verify date format matches `YYYY-MM-DD`
3. Check time format matches `HH:MM`

### Issue 4: Patient search not working
**Solution**: 
1. Verify `/patients` endpoint returns data
2. Check patient data structure matches interface
3. Add console.log to debug filtered results

---

## Next Steps (Day 3-5)

Once appointments calendar is complete, move to:
- **Day 3-5**: Complete Patients Management (multi-step form + details modal)
- **Day 6-8**: Complete Clinical Examinations (5-step workflow)

---

## Success Criteria ✅

- [ ] Calendar displays appointments in month/week/day views
- [ ] Click date creates new appointment
- [ ] Click event opens edit modal
- [ ] Form validation works
- [ ] API integration successful (create/update/delete)
- [ ] Status colors display correctly
- [ ] Statistics cards show accurate counts
- [ ] Responsive on all screen sizes
- [ ] Zero console errors
- [ ] Zero TypeScript errors

---

**Ready to start? Let's build! 🚀**

Run `pnpm dev` and navigate to `/dashboard/appointments` to see your progress.
