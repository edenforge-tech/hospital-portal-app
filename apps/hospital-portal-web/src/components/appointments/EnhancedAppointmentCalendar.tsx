'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import { 
  Appointment, 
  appointmentsApi, 
  DoctorAvailability, 
  AppointmentConflict,
  RealTimeUpdate 
} from '@/lib/api/appointments-enhanced.api';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Filter,
  Users,
  Stethoscope,
  Building2
} from 'lucide-react';

interface EnhancedAppointmentCalendarProps {
  appointments: Appointment[];
  onEventClick: (appointment: Appointment) => void;
  onDateClick: (date: Date) => void;
  onEventDrop?: (appointmentId: string, newDate: Date, newStartTime: string) => Promise<void>;
  onTimeSlotClick?: (doctorId: string, date: Date, time: string) => void;
  doctorIds?: string[];
  departmentIds?: string[];
  loading?: boolean;
  enableRealTime?: boolean;
  enableConflictDetection?: boolean;
  viewModes?: Array<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'resourceTimelineWeek'>;
}

const statusColors: Record<string, string> = {
  scheduled: '#3B82F6', // blue
  confirmed: '#10B981', // green
  checked_in: '#8B5CF6', // purple - patient checked in, waiting for consultation
  in_progress: '#F59E0B', // yellow - changed from 'in-progress' to match normalization
  completed: '#6B7280', // gray
  cancelled: '#EF4444', // red
  no_show: '#DC2626', // dark red - changed from 'no-show' to match normalization
};

const priorityColors: Record<string, string> = {
  low: '#10B981', // green
  normal: '#3B82F6', // blue
  high: '#F59E0B', // yellow
  urgent: '#EF4444', // red
};

export default function EnhancedAppointmentCalendar({
  appointments,
  onEventClick,
  onDateClick,
  onEventDrop,
  onTimeSlotClick,
  doctorIds = [],
  departmentIds = [],
  loading = false,
  enableRealTime = true,
  enableConflictDetection = true,
  viewModes = ['dayGridMonth', 'timeGridWeek', 'timeGridDay', 'resourceTimelineWeek']
}: EnhancedAppointmentCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  
  const [currentView, setCurrentView] = useState('timeGridWeek');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [doctorAvailabilities, setDoctorAvailabilities] = useState<Map<string, DoctorAvailability>>(new Map());
  const [conflicts, setConflicts] = useState<AppointmentConflict[]>([]);
  const [realTimeEnabled, setRealTimeEnabled] = useState(enableRealTime);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    doctors: doctorIds,
    departments: departmentIds,
    statuses: ['scheduled', 'confirmed', 'checked_in', 'in_progress'],
    priorities: ['low', 'normal', 'high', 'urgent']
  });

  // Load doctor availability data
  const loadDoctorAvailability = useCallback(async (doctorId: string, date: string) => {
    try {
      const response = await appointmentsApi.getDoctorAvailability(doctorId, date);
      setDoctorAvailabilities(prev => new Map(prev.set(doctorId, response.data)));
    } catch (error) {
      console.error('Error loading doctor availability:', error);
    }
  }, []);

  // Check for conflicts
  const checkForConflicts = useCallback(async (appointment: Appointment) => {
    if (!enableConflictDetection) return;
    
    try {
      const response = await appointmentsApi.checkConflicts(
        appointment.doctorId,
        appointment.patientId,
        appointment.appointmentDate,
        appointment.startTime,
        appointment.duration,
        appointment.id
      );
      setConflicts(prev => [...prev.filter(c => c.conflictingAppointmentId !== appointment.id), ...response.data]);
    } catch (error) {
      console.error('Error checking conflicts:', error);
    }
  }, [enableConflictDetection]);

  // Handle real-time updates
  useEffect(() => {
    if (!realTimeEnabled) return;

    const handleRealTimeUpdate = (update: RealTimeUpdate) => {
      console.log('Real-time update received:', update);
      
      // Refresh calendar view
      const calendar = calendarRef.current;
      if (calendar) {
        calendar.getApi().refetchEvents();
      }

      // Re-check conflicts if needed
      if (update.type === 'appointment_created' || update.type === 'appointment_updated') {
        // Find the appointment in our current list and check for conflicts
        const appointment = appointments.find(apt => apt.id === update.appointmentId);
        if (appointment) {
          checkForConflicts(appointment);
        }
      }
    };

    eventSourceRef.current = appointmentsApi.subscribeToUpdates(handleRealTimeUpdate);

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [realTimeEnabled, appointments, checkForConflicts]);

  // Load availability for visible doctors when date changes
  useEffect(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    filters.doctors.forEach(doctorId => {
      loadDoctorAvailability(doctorId, dateStr);
    });
  }, [selectedDate, filters.doctors, loadDoctorAvailability]);

  // Transform appointments to FullCalendar events
  // DEBUG: Log ALL appointments before filtering
  console.log('📋 TOTAL APPOINTMENTS FROM API:', appointments.length);
  console.log('📊 APPOINTMENT STATUSES:', appointments.map(a => ({ patient: a.patientName, status: a.status, date: a.appointmentDate })));
  console.log('🎯 FILTER STATUSES:', filters.statuses);

  const events = appointments
    .filter(apt => {
      // Normalize status for comparison
      const aptStatusNormalized = apt.status.toLowerCase().replace(/[-\s]/g, '_');
      
      // Case-insensitive status comparison
      const statusMatch = filters.statuses.length === 0 || filters.statuses.some(s => s.toLowerCase() === aptStatusNormalized);
      const priorityMatch = filters.priorities.length === 0 || (apt.priority && filters.priorities.some(p => p.toLowerCase() === apt.priority?.toLowerCase()));
      const doctorMatch = filters.doctors.length === 0 || filters.doctors.includes(apt.doctorId);
      const departmentMatch = filters.departments.length === 0 || (apt.departmentId && filters.departments.includes(apt.departmentId));
      
      // DEBUG: Log filter decisions for checked_in appointments
      if (aptStatusNormalized === 'checked_in') {
        console.log('🔍 FILTER CHECK FOR CHECKED_IN:', {
          patient: apt.patientName,
          status: apt.status,
          normalized: aptStatusNormalized,
          statusMatch,
          priorityMatch,
          doctorMatch,
          departmentMatch,
          willPass: statusMatch && priorityMatch && doctorMatch && departmentMatch
        });
      }
      
      return statusMatch && priorityMatch && doctorMatch && departmentMatch;
    })
    .map(apt => {
      const hasConflict = conflicts.some(c => c.conflictingAppointmentId === apt.id);
      // Normalize status: handle variations like "CheckedIn", "Checked_In", "checked-in", "checked_in"
      const statusNormalized = apt.status.toLowerCase().replace(/[-\s]/g, '_');
      const statusLower = statusNormalized;
      const priorityLower = apt.priority?.toLowerCase() || 'normal';
      const borderColor = hasConflict ? '#EF4444' : (priorityColors[priorityLower] || statusColors[statusLower] || '#3B82F6');
      
      // DEBUG: Log status and color for checked_in appointments
      if (statusLower === 'checked_in') {
        console.log('🎨 CHECKED_IN APPOINTMENT COLOR:', {
          patientName: apt.patientName,
          originalStatus: apt.status,
          normalizedStatus: statusLower,
          assignedColor: statusColors[statusLower],
          backgroundColor: statusColors[statusLower] || '#3B82F6',
          statusColorsMap: statusColors
        });
      }
      
      // Parse appointment date (handle both ISO string and date-only formats)
      const dateOnly = apt.appointmentDate.split('T')[0];
      
      // Build start datetime - if no startTime, default to 9am
      const startTime = apt.startTime || '09:00';
      const startDateTime = `${dateOnly}T${startTime}`;
      
      // Build end datetime - calculate from duration if no endTime
      let endDateTime: string | undefined;
      if (apt.endTime) {
        endDateTime = `${dateOnly}T${apt.endTime}`;
      } else if (apt.durationMinutes || apt.duration) {
        // Calculate end time from start time and duration
        const duration = apt.durationMinutes || apt.duration || 30;
        const [hours, minutes] = startTime.split(':').map(Number);
        const endMinutes = hours * 60 + minutes + duration;
        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        endDateTime = `${dateOnly}T${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
      }
      
      return {
        id: apt.id,
        title: `${statusLower === 'checked_in' ? '✓ ' : ''}${apt.patientName}`,
        start: startDateTime,
        end: endDateTime,
        backgroundColor: statusColors[statusLower] || '#3B82F6',
        borderColor: borderColor,
        textColor: '#FFFFFF',
        resourceId: apt.doctorId, // for resource timeline view
        extendedProps: {
          appointment: apt,
          hasConflict: hasConflict,
          conflictReason: conflicts.find(c => c.conflictingAppointmentId === apt.id)?.message
        },
        classNames: [
          priorityLower === 'urgent' ? 'urgent-appointment' : '',
          hasConflict ? 'conflict-appointment' : '',
          apt.isRecurring ? 'recurring-appointment' : '',
          statusLower === 'checked_in' ? 'checked-in-appointment' : ''
        ].filter(Boolean)
      };
    });

  // Add availability slots as background events
  const availabilityEvents = Array.from(doctorAvailabilities.values()).flatMap(availability => 
    availability.availableSlots.map(slot => ({
      id: `availability-${availability.doctorId}-${slot.startTime}`,
      start: `${availability.date}T${slot.startTime}`,
      end: `${availability.date}T${slot.endTime}`,
      display: 'background',
      backgroundColor: slot.isAvailable ? '#E5F7E5' : '#FFE5E5',
      resourceId: availability.doctorId,
      extendedProps: {
        type: 'availability',
        doctorId: availability.doctorId,
        isAvailable: slot.isAvailable
      }
    }))
  );

  const handleEventClick = (eventClickInfo: any) => {
    const appointment = eventClickInfo.event.extendedProps.appointment;
    if (appointment) {
      onEventClick(appointment);
    }
  };

  const handleDateClick = (dateClickInfo: any) => {
    onDateClick(new Date(dateClickInfo.date));
    setSelectedDate(new Date(dateClickInfo.date));
  };

  const handleEventDrop = async (eventDropInfo: any) => {
    if (!onEventDrop) return;

    const appointment = eventDropInfo.event.extendedProps.appointment;
    const newDate = new Date(eventDropInfo.event.start);
    const newStartTime = newDate.toTimeString().substring(0, 5);
    
    try {
      await onEventDrop(appointment.id, newDate, newStartTime);
    } catch (error) {
      console.error('Error updating appointment:', error);
      eventDropInfo.revert(); // Revert the drag if update fails
    }
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    const calendar = calendarRef.current;
    if (calendar) {
      calendar.getApi().changeView(view);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const calendar = calendarRef.current;
      if (calendar) {
        calendar.getApi().refetchEvents();
      }
      // Reload availability data
      const dateStr = selectedDate.toISOString().split('T')[0];
      await Promise.all(
        filters.doctors.map(doctorId => loadDoctorAvailability(doctorId, dateStr))
      );
    } catch (error) {
      console.error('Error refreshing calendar:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const allEvents = [...events, ...availabilityEvents];

  return (
    <div className="space-y-4">
      {/* Calendar Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          {/* View Mode Selector */}
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <select
              value={currentView}
              onChange={(e) => handleViewChange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {viewModes.includes('dayGridMonth') && <option value="dayGridMonth">Month</option>}
              {viewModes.includes('timeGridWeek') && <option value="timeGridWeek">Week</option>}
              {viewModes.includes('timeGridDay') && <option value="timeGridDay">Day</option>}
              {viewModes.includes('resourceTimelineWeek') && <option value="resourceTimelineWeek">Doctor Timeline</option>}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">Status:</span>
            {['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed'].map(status => (
              <label key={status} className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={filters.statuses.includes(status)}
                  onChange={(e) => {
                    setFilters(prev => ({
                      ...prev,
                      statuses: e.target.checked 
                        ? [...prev.statuses, status]
                        : prev.statuses.filter(s => s !== status)
                    }));
                  }}
                  className="rounded"
                />
                <span className="text-xs capitalize">{status.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Real-time toggle */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={realTimeEnabled}
              onChange={(e) => setRealTimeEnabled(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Real-time</span>
            <div className={`w-2 h-2 rounded-full ${realTimeEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
          </label>

          {/* Conflicts indicator */}
          {conflicts.length > 0 && (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{conflicts.length} conflicts</span>
            </div>
          )}

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>
      </div>

      {/* Calendar Component */}
      <div className="bg-white rounded-lg shadow p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, resourceTimelinePlugin]}
          initialView={currentView}
          events={allEvents}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          eventDrop={onEventDrop ? handleEventDrop : undefined}
          editable={!!onEventDrop}
          droppable={true}
          height="600px"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,resourceTimelineWeek'
          }}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
          }}
          eventDisplay="block"
          eventClassNames={(eventInfo) => {
            const classes = ['appointment-event'];
            if (eventInfo.event.extendedProps.hasConflict) {
              classes.push('conflict-event');
            }
            return classes;
          }}
          eventDidMount={(eventInfo) => {
            // Add tooltip for conflicts
            if (eventInfo.event.extendedProps.hasConflict) {
              eventInfo.el.title = `Conflict: ${eventInfo.event.extendedProps.conflictReason}`;
            }
          }}
          // Resource timeline specific settings
          resourceAreaHeaderContent="Doctors"
          resources={filters.doctors.map(doctorId => ({
            id: doctorId,
            title: `Dr. ${doctorId}` // This should be replaced with actual doctor names
          }))}
          resourceOrder="title"
        />
      </div>

      {/* Conflicts Panel */}
      {conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">Scheduling Conflicts</h3>
          </div>
          <div className="space-y-2">
            {conflicts.map((conflict, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded border border-red-200">
                <div>
                  <p className="text-sm font-medium text-red-800">{conflict.type.replace('_', ' ').toUpperCase()}</p>
                  <p className="text-sm text-red-600">{conflict.message}</p>
                </div>
                {conflict.suggestedAlternatives && conflict.suggestedAlternatives.length > 0 && (
                  <div className="text-sm text-red-700">
                    <span>{conflict.suggestedAlternatives.length} alternatives available</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom styles */}
      <style jsx global>{`
        .appointment-event {
          border-radius: 4px !important;
        }
        .conflict-event {
          border: 2px solid #EF4444 !important;
          animation: pulse 2s infinite;
        }
        .urgent-appointment {
          border-left: 4px solid #EF4444 !important;
        }
        .recurring-appointment::after {
          content: "↻";
          position: absolute;
          top: 2px;
          right: 2px;
          color: white;
          font-weight: bold;
        }
        .checked-in-appointment {
          border-left: 4px solid #6D28D9 !important;
          font-weight: 600 !important;
        }
        .checked-in-appointment::before {
          content: "🎟️";
          position: absolute;
          bottom: 2px;
          right: 2px;
          font-size: 12px;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}