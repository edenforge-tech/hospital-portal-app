/**
 * Appointment Reminder Widget
 * Displays upcoming appointments with confirmation options
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, User, CheckCircle2, Clock } from 'lucide-react';
import { WidgetProps } from '@/lib/widgets/widget-types';
import type { AppointmentReminder } from '@/lib/api/widgets.api';
import { widgetsApi } from '@/lib/api/widgets.api';

const AppointmentReminderWidget: React.FC<WidgetProps> = ({ patientId }) => {
  const [appointments, setAppointments] = useState<AppointmentReminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) loadAppointments();
  }, [patientId]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await widgetsApi.getAppointmentReminders(patientId!);
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (appointmentId: string) => {
    try {
      await widgetsApi.confirmAppointment(appointmentId);
      loadAppointments();
    } catch (err) {
      alert('Failed to confirm appointment');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="h-full flex flex-col p-4 space-y-4 overflow-auto">
      <h3 className="text-lg font-semibold flex items-center">
        <Calendar className="w-5 h-5 mr-2 text-blue-600" />
        Upcoming Appointments
      </h3>

      {appointments.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No upcoming appointments
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map(apt => (
            <div key={apt.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{apt.type}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(apt.appointmentDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                {apt.confirmed && <CheckCircle2 className="w-6 h-6 text-green-500" />}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-700">
                  <Clock className="w-4 h-4 mr-2" />
                  {apt.appointmentTime}
                </div>
                <div className="flex items-center text-gray-700">
                  <User className="w-4 h-4 mr-2" />
                  {apt.doctorName}
                </div>
                <div className="flex items-center text-gray-700">
                  <MapPin className="w-4 h-4 mr-2" />
                  {apt.location}
                </div>
              </div>

              {!apt.confirmed && (
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => handleConfirm(apt.appointmentId)}
                    className="flex-1 px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Confirm
                  </button>
                  {apt.canReschedule && (
                    <button className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                      Reschedule
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentReminderWidget;
