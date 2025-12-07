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
