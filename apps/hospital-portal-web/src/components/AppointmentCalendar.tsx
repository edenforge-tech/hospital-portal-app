'use client';

import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, User, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: Date;
  time: string;
  duration: number; // minutes
  type: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  department: string;
  phone?: string;
}

type ViewMode = 'day' | 'week' | 'month';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800 border-blue-300',
  confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'in-progress': 'bg-amber-100 text-amber-800 border-amber-300',
  completed: 'bg-gray-100 text-gray-800 border-gray-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
};

const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientName: 'John Smith',
    doctorName: 'Dr. Sarah Johnson',
    date: new Date(2026, 0, 25, 9, 0),
    time: '09:00 AM',
    duration: 30,
    type: 'Eye Examination',
    status: 'confirmed',
    department: 'Ophthalmology',
    phone: '+1 234-567-8901',
  },
  {
    id: '2',
    patientName: 'Emily Davis',
    doctorName: 'Dr. Michael Chen',
    date: new Date(2026, 0, 25, 10, 30),
    time: '10:30 AM',
    duration: 45,
    type: 'Cataract Surgery Consultation',
    status: 'scheduled',
    department: 'Surgery',
    phone: '+1 234-567-8902',
  },
  {
    id: '3',
    patientName: 'Robert Wilson',
    doctorName: 'Dr. Sarah Johnson',
    date: new Date(2026, 0, 25, 14, 0),
    time: '02:00 PM',
    duration: 30,
    type: 'Follow-up Visit',
    status: 'in-progress',
    department: 'Ophthalmology',
    phone: '+1 234-567-8903',
  },
  {
    id: '4',
    patientName: 'Lisa Anderson',
    doctorName: 'Dr. James Lee',
    date: new Date(2026, 0, 25, 15, 30),
    time: '03:30 PM',
    duration: 60,
    type: 'Retinal Examination',
    status: 'confirmed',
    department: 'Retina Clinic',
    phone: '+1 234-567-8904',
  },
];

export function AppointmentCalendar() {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Filter appointments for current view
  const filteredAppointments = mockAppointments.filter(apt => {
    const aptDate = new Date(apt.date);
    if (viewMode === 'day') {
      return aptDate.toDateString() === currentDate.toDateString();
    }
    // TODO: Implement week and month filtering
    return true;
  });

  // Day view time slots
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-heading font-bold text-gray-900">Appointments Calendar</h1>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('day')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                viewMode === 'day'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                viewMode === 'week'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                viewMode === 'month'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Month
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateDate('prev')}
              aria-label="Previous period"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-lg font-semibold text-gray-900 min-w-[280px] text-center">
              {formatDate(currentDate)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateDate('next')}
              aria-label="Next period"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <Button variant="primary" size="md" leftIcon={<Calendar className="h-4 w-4" />}>
            New Appointment
          </Button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'day' && (
        <div className="grid grid-cols-12 gap-6">
          {/* Time Slots */}
          <div className="col-span-8">
            <Card className="p-0 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                <h3 className="font-semibold text-gray-900">Schedule</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {timeSlots.map((hour) => {
                  const hourAppointments = filteredAppointments.filter(apt => {
                    const aptHour = new Date(apt.date).getHours();
                    return aptHour === hour;
                  });

                  return (
                    <div key={hour} className="flex">
                      <div className="w-20 flex-shrink-0 bg-gray-50 border-r border-gray-200 p-3 text-right">
                        <span className="text-sm font-medium text-gray-600">
                          {hour === 12 ? '12:00 PM' : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                        </span>
                      </div>
                      <div className="flex-1 p-2 min-h-[80px] relative">
                        {hourAppointments.length === 0 ? (
                          <button
                            className="w-full h-full hover:bg-primary-50 rounded-lg transition-colors border-2 border-dashed border-gray-200 hover:border-primary-300 text-gray-400 hover:text-primary-600 text-sm"
                            aria-label={`Schedule appointment at ${hour}:00`}
                          >
                            + Add appointment
                          </button>
                        ) : (
                          <div className="space-y-2">
                            {hourAppointments.map((apt) => (
                              <button
                                key={apt.id}
                                onClick={() => setSelectedAppointment(apt)}
                                className={cn(
                                  'w-full text-left p-3 rounded-lg border-l-4 transition-all hover:shadow-md',
                                  statusColors[apt.status]
                                )}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="font-semibold text-sm">{apt.patientName}</p>
                                    <p className="text-xs opacity-75 mt-1">{apt.type}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs opacity-75">
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {apt.time} ({apt.duration}min)
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {apt.doctorName}
                                      </span>
                                    </div>
                                  </div>
                                  <span className={cn(
                                    'px-2 py-1 rounded-full text-xs font-medium',
                                    statusColors[apt.status]
                                  )}>
                                    {apt.status}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Appointment Details Sidebar */}
          <div className="col-span-4">
            <Card className="sticky top-6">
              {selectedAppointment ? (
                <div className="p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Appointment Details</h3>
                    <span className={cn(
                      'px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide',
                      statusColors[selectedAppointment.status]
                    )}>
                      {selectedAppointment.status}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Patient</label>
                      <p className="mt-1 text-base font-semibold text-gray-900">{selectedAppointment.patientName}</p>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Doctor</label>
                      <p className="mt-1 text-base font-medium text-gray-900">{selectedAppointment.doctorName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Time</label>
                        <p className="mt-1 text-sm font-medium text-gray-900 flex items-center gap-1">
                          <Clock className="h-4 w-4 text-primary-500" />
                          {selectedAppointment.time}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</label>
                        <p className="mt-1 text-sm font-medium text-gray-900">{selectedAppointment.duration} min</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Type</label>
                      <p className="mt-1 text-sm font-medium text-gray-900">{selectedAppointment.type}</p>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Department</label>
                      <p className="mt-1 text-sm font-medium text-gray-900 flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-primary-500" />
                        {selectedAppointment.department}
                      </p>
                    </div>

                    {selectedAppointment.phone && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</label>
                        <p className="mt-1 text-sm font-medium text-gray-900 flex items-center gap-1">
                          <Phone className="h-4 w-4 text-primary-500" />
                          {selectedAppointment.phone}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    <Button variant="primary" size="md" className="w-full">
                      Start Consultation
                    </Button>
                    <Button variant="outline" size="md" className="w-full">
                      Reschedule
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full text-red-600 hover:bg-red-50">
                      Cancel Appointment
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Select an appointment to view details</p>
                  <p className="text-sm text-gray-400 mt-2">Click on any appointment slot to see more information</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Week View (Placeholder) */}
      {viewMode === 'week' && (
        <Card className="p-12 text-center">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Week View</h3>
          <p className="text-gray-500">Week view coming soon - will show 7-day grid with all appointments</p>
        </Card>
      )}

      {/* Month View (Placeholder) */}
      {viewMode === 'month' && (
        <Card className="p-12 text-center">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Month View</h3>
          <p className="text-gray-500">Month view coming soon - will show traditional calendar grid</p>
        </Card>
      )}

      {/* Stats Footer */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Today</p>
              <p className="text-2xl font-bold text-gray-900">{filteredAppointments.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-emerald-600">
                {filteredAppointments.filter(a => a.status === 'confirmed').length}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-emerald-500"></div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-amber-600">
                {filteredAppointments.filter(a => a.status === 'in-progress').length}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-amber-500"></div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-600">
                {filteredAppointments.filter(a => a.status === 'completed').length}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-gray-500"></div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">
                {filteredAppointments.filter(a => a.status === 'cancelled').length}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-red-500"></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
