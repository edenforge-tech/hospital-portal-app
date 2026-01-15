'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { Calendar, Users, Clock, ClipboardCheck, UserPlus, FileText, AlertCircle } from 'lucide-react';

interface FrontDeskStats {
  todayAppointments: number;
  pendingRegistrations: number;
  waitingPatients: number;
  completedToday: number;
}

export default function FrontDeskDashboard() {
  const { user, roles } = useAuthStore();
  const [stats, setStats] = useState<FrontDeskStats>({
    todayAppointments: 0,
    pendingRegistrations: 0,
    waitingPatients: 0,
    completedToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await dashboardApi.getFrontDeskStats();
      
      // Demo data for now
      setTimeout(() => {
        setStats({
          todayAppointments: 24,
          pendingRegistrations: 3,
          waitingPatients: 7,
          completedToday: 18,
        });
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to load front desk data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Front Desk Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.firstName} {user?.lastName} ({roles?.[0]})
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Register Patient
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Appointment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Today's Appointments</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.todayAppointments}</p>
              <p className="text-xs text-gray-500 mt-1">Total scheduled</p>
            </div>
            <Calendar className="h-12 w-12 text-blue-500 opacity-20" />
          </div>
        </div>

        {/* Pending Registrations */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending Registrations</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{stats.pendingRegistrations}</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting completion</p>
            </div>
            <FileText className="h-12 w-12 text-orange-500 opacity-20" />
          </div>
        </div>

        {/* Waiting Patients */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Waiting Patients</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.waitingPatients}</p>
              <p className="text-xs text-gray-500 mt-1">In waiting area</p>
            </div>
            <Users className="h-12 w-12 text-purple-500 opacity-20" />
          </div>
        </div>

        {/* Completed Today */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Completed Today</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.completedToday}</p>
              <p className="text-xs text-gray-500 mt-1">Check-ins processed</p>
            </div>
            <ClipboardCheck className="h-12 w-12 text-green-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Today's Schedule</h2>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {/* Timeline items - Demo data */}
            {[
              { time: '09:00 AM', patient: 'John Doe', doctor: 'Dr. Smith', status: 'Waiting' },
              { time: '09:30 AM', patient: 'Jane Smith', doctor: 'Dr. Johnson', status: 'In Progress' },
              { time: '10:00 AM', patient: 'Robert Brown', doctor: 'Dr. Smith', status: 'Completed' },
              { time: '10:30 AM', patient: 'Sarah Wilson', doctor: 'Dr. Davis', status: 'Scheduled' },
            ].map((apt, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold text-blue-600 w-20">{apt.time}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{apt.patient}</p>
                    <p className="text-xs text-gray-500">{apt.doctor}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  apt.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  apt.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  apt.status === 'Waiting' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium text-sm transition">
            View All Appointments →
          </button>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left">
                <UserPlus className="h-6 w-6 text-blue-600 mb-2" />
                <p className="text-sm font-medium text-gray-900">New Patient</p>
              </button>
              <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-left">
                <Calendar className="h-6 w-6 text-green-600 mb-2" />
                <p className="text-sm font-medium text-gray-900">Book Appointment</p>
              </button>
              <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-left">
                <Users className="h-6 w-6 text-purple-600 mb-2" />
                <p className="text-sm font-medium text-gray-900">Check-In</p>
              </button>
              <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition text-left">
                <FileText className="h-6 w-6 text-orange-600 mb-2" />
                <p className="text-sm font-medium text-gray-900">View Waitlist</p>
              </button>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Important Alerts</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">3 pending registrations</p>
                  <p className="text-xs text-yellow-700 mt-1">Complete patient registration forms</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">7 patients waiting</p>
                  <p className="text-xs text-blue-700 mt-1">Average wait time: 15 minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Waitlist */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Waitlist</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Token #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wait Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { token: 'T001', name: 'Alice Cooper', type: 'Consultation', checkIn: '09:15 AM', wait: '15 min', status: 'Waiting' },
                { token: 'T002', name: 'Bob Martin', type: 'Follow-up', checkIn: '09:20 AM', wait: '10 min', status: 'Waiting' },
                { token: 'T003', name: 'Carol White', type: 'Emergency', checkIn: '09:25 AM', wait: '5 min', status: 'Priority' },
              ].map((patient, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{patient.token}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{patient.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{patient.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{patient.checkIn}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{patient.wait}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      patient.status === 'Priority' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
