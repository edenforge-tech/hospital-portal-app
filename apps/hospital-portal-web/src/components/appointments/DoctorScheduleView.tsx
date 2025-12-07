'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, Phone, Mail } from 'lucide-react';
import { appointmentsApi, Appointment } from '@/lib/api/appointments.api';
import { getApi } from '@/lib/api';

const getStatusColor = (status: string) => {
  const colors = {
    scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    completed: 'bg-gray-100 text-gray-800 border-gray-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    'no-show': 'bg-red-200 text-red-900 border-red-300'
  };
  return colors[status as keyof typeof colors] || colors.scheduled;
};

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  specialization?: string;
  departmentName?: string;
}

interface DoctorScheduleViewProps {
  doctorId?: string;
  date?: Date;
}

export default function DoctorScheduleView({ doctorId, date = new Date() }: DoctorScheduleViewProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(date);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  useEffect(() => {
    if (doctorId) {
      loadDoctorData();
      loadAppointments();
    }
  }, [doctorId, selectedDate]);

  const loadDoctorData = async () => {
    try {
      const response = await getApi().get<Doctor>(`/users/${doctorId}`);
      setDoctor(response.data);
    } catch (error) {
      console.error('Error loading doctor data:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const filters = {
        doctorId,
        startDate: selectedDate.toISOString().split('T')[0],
        endDate: viewMode === 'week'
          ? new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : selectedDate.toISOString().split('T')[0]
      };

      const response = await appointmentsApi.getAll(filters);
      setAppointments(response.data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDayAppointments = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments
      .filter(apt => apt.appointmentDate === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const generateWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setSelectedDate(newDate);
  };

  if (!doctorId) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No Doctor Selected</h3>
        <p className="mt-1 text-sm text-gray-500">Please select a doctor to view their schedule.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Loading...'}
                </h2>
                {doctor?.specialization && (
                  <p className="text-sm text-gray-600">{doctor.specialization}</p>
                )}
                {doctor?.departmentName && (
                  <p className="text-xs text-gray-500">{doctor.departmentName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === 'day'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === 'week'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Week
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateDate('prev')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                ‹
              </button>
              <span className="text-sm font-medium text-gray-900 min-w-[120px] text-center">
                {viewMode === 'day'
                  ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                  : `${generateWeekDays()[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${generateWeekDays()[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                }
              </span>
              <button
                onClick={() => navigateDate('next')}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-gray-600">Loading schedule...</span>
          </div>
        ) : viewMode === 'day' ? (
          <DayView appointments={getDayAppointments(selectedDate)} />
        ) : (
          <WeekView appointments={appointments} weekDays={generateWeekDays()} />
        )}
      </div>
    </div>
  );
}

function DayView({ appointments }: { appointments: Appointment[] }) {
  const timeSlots = [];
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Daily Schedule</h3>
        <div className="text-sm text-gray-600">
          {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} today
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {timeSlots.map((timeSlot, index) => {
          const appointment = appointments.find(apt => apt.startTime === timeSlot);
          const isAppointmentStart = appointment !== undefined;

          if (isAppointmentStart) {
            const duration = appointment.duration;
            const slotsToSpan = Math.ceil(duration / 30);

            return (
              <div
                key={timeSlot}
                className={`p-4 rounded-lg border-2 ${getStatusColor(appointment.status)}`}
                style={{ gridRow: `span ${slotsToSpan}` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">
                        {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900">{appointment.patientName}</p>
                      <p className="text-sm text-gray-600">{appointment.appointmentType}</p>
                      {appointment.reasonForVisit && (
                        <p className="text-sm text-gray-500">{appointment.reasonForVisit}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          } else if (index % 2 === 0) { // Only show empty slots for hour marks
            return (
              <div key={timeSlot} className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{formatTime(timeSlot)}</span>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

function WeekView({ appointments, weekDays }: { appointments: Appointment[], weekDays: Date[] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Weekly Schedule</h3>

      <div className="grid grid-cols-8 gap-2">
        {/* Header */}
        <div className="p-2"></div>
        {weekDays.map((day, index) => (
          <div key={index} className="p-2 text-center">
            <div className="text-sm font-medium text-gray-900">
              {day.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className="text-xs text-gray-500">
              {day.getDate()}
            </div>
          </div>
        ))}

        {/* Time slots */}
        {Array.from({ length: 24 }, (_, hour) => (
          <div key={hour} className="contents">
            <div className="p-2 text-right text-xs text-gray-500 border-t">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
            {weekDays.map((day, dayIndex) => {
              const dayAppointments = appointments.filter(apt =>
                apt.appointmentDate === day.toISOString().split('T')[0] &&
                parseInt(apt.startTime.split(':')[0]) === hour
              );

              return (
                <div key={dayIndex} className="min-h-[60px] p-1 border-t border-l">
                  {dayAppointments.map((apt, aptIndex) => (
                    <div
                      key={aptIndex}
                      className={`p-2 mb-1 text-xs rounded ${getStatusColor(apt.status)} cursor-pointer hover:opacity-80`}
                      title={`${apt.patientName} - ${apt.appointmentType}`}
                    >
                      <div className="font-medium truncate">{apt.patientName}</div>
                      <div className="text-xs opacity-75">{formatTime(apt.startTime)}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}