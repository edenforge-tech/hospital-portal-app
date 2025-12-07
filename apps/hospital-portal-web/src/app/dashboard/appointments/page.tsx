'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { appointmentsApi, Appointment, AppointmentFilters } from '@/lib/api/appointments.api';
import AppointmentCalendar from '@/components/appointments/AppointmentCalendar';
import AppointmentFormModal from '@/components/appointments/AppointmentFormModal';
import { Calendar, Plus, RefreshCw } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: any;
  color?: string;
  trend?: { value: number; isPositive: boolean };
}

const StatCard = ({ title, value, icon: Icon, color = 'indigo', trend }: StatCardProps) => {
  const colorClasses = {
    indigo: 'bg-indigo-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`${colorClasses[color as keyof typeof colorClasses] || colorClasses.indigo} p-3 rounded-lg`}>
          <Icon className="text-white" size={24} />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '' : ''} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
};

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

  const todayAppointments = appointments.filter(apt => 
    apt.appointmentDate === new Date().toISOString().split('T')[0]
  ).length;
  const scheduledCount = appointments.filter(apt => apt.status === 'scheduled').length;
  const completedCount = appointments.filter(apt => apt.status === 'completed').length;

  return (
    <div className="p-6">
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

      <AppointmentCalendar
        appointments={appointments}
        onEventClick={handleEventClick}
        onDateClick={handleDateClick}
        loading={loading}
      />

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