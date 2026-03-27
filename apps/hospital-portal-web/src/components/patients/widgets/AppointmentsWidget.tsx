'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { appointmentsApi } from '@/lib/api';
import { format } from 'date-fns';

interface AppointmentsWidgetProps {
  patientId: string;
  onBookAppointment?: () => void;
}

export const AppointmentsWidget: React.FC<AppointmentsWidgetProps> = ({ patientId, onBookAppointment }) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!patientId) return;
      
      setLoading(true);
      try {
        const response = await appointmentsApi.getByPatient(patientId);
        const upcomingAppointments = response.data
          ?.filter((apt: any) => new Date(apt.appointmentDateTime) >= new Date())
          .sort((a: any, b: any) => new Date(a.appointmentDateTime).getTime() - new Date(b.appointmentDateTime).getTime())
          .slice(0, 3) || [];
        
        setAppointments(upcomingAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [patientId]);

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Appointments
          </span>
          <Badge variant="secondary">{appointments.length} Upcoming</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {appointments.length > 0 ? (
          <>
            {appointments.map((apt) => (
              <div key={apt.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(apt.status)}
                    <span className="font-semibold text-sm">{apt.appointmentType || 'General'}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">{apt.status}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Doctor:</strong> {apt.doctorName || 'TBD'}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Date:</strong> {format(new Date(apt.appointmentDateTime), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={onBookAppointment}>
              Book New Appointment
            </Button>
          </>
        ) : (
          <div className="text-center py-6">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-3">No upcoming appointments</p>
            <Button size="sm" onClick={onBookAppointment}>
              Book Appointment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
