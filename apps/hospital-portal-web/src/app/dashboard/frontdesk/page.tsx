'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { Calendar, Users, Clock, ClipboardCheck, UserPlus, FileText, AlertCircle, Search, RefreshCw, Timer, UserX, Bell } from 'lucide-react';
import CheckInModal from '../../../components/modals/CheckInModal';
import WalkInBookingModal from '@/components/modals/WalkInBookingModal';
import VisitorManagementModal from '@/components/modals/VisitorManagementModal';
import NewPatientModal from '@/components/modals/NewPatientModal';

interface FrontDeskStats {
  todayAppointments: number;
  pendingRegistrations: number;
  waitingPatients: number;
  completedToday: number;
  averageWaitTime: number;
  noShows: number;
}

export default function FrontDeskDashboard() {
  const router = useRouter();
  const { user, roles } = useAuthStore();
  const [stats, setStats] = useState<FrontDeskStats>({
    todayAppointments: 0,
    pendingRegistrations: 0,
    waitingPatients: 0,
    completedToday: 0,
    averageWaitTime: 0,
    noShows: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        setStats({
          todayAppointments: 24,
          pendingRegistrations: 3,
          waitingPatients: 7,
          completedToday: 18,
          averageWaitTime: 15,
          noShows: 2,
        });
        setLastRefresh(new Date());
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to load front desk data:', error);
      setLoading(false);
    }
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadDashboardData();
    const refreshInterval = setInterval(() => {
      loadDashboardData();
    }, 30000);
    return () => clearInterval(refreshInterval);
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <div className="text-3xl font-bold font-mono">{formatTime(currentTime)}</div>
            <div className="text-sm opacity-90 mt-1">{formatDate(currentTime)}</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient (UHID, Name, Phone)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full max-w-xs rounded-lg border-0 focus:ring-2 focus:ring-white text-sm"
              />
            </div>
            <button
              onClick={loadDashboardData}
              className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-xs">Updated {new Date(lastRefresh).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 font-medium">Appointments</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.todayAppointments}</p>
              <p className="text-xs text-slate-500 mt-1">Today</p>
            </div>
            <Calendar className="h-8 w-8 text-emerald-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 font-medium">Waiting</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.waitingPatients}</p>
              <p className="text-xs text-slate-500 mt-1">In queue</p>
            </div>
            <Users className="h-8 w-8 text-purple-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 font-medium">Completed</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.completedToday}</p>
              <p className="text-xs text-slate-500 mt-1">Processed</p>
            </div>
            <ClipboardCheck className="h-8 w-8 text-emerald-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 font-medium">Avg Wait</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.averageWaitTime}</p>
              <p className="text-xs text-slate-500 mt-1">Minutes</p>
            </div>
            <Timer className="h-8 w-8 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 font-medium">Pending</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pendingRegistrations}</p>
              <p className="text-xs text-slate-500 mt-1">Registrations</p>
            </div>
            <FileText className="h-8 w-8 text-amber-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 font-medium">No-Shows</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.noShows}</p>
              <p className="text-xs text-slate-500 mt-1">Today</p>
            </div>
            <UserX className="h-8 w-8 text-red-500 opacity-20" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Up Next
            </h2>
            <span className="px-2 py-1 bg-white bg-opacity-20 rounded text-xs font-medium">Token #T001</span>
          </div>
          <div>
            <p className="text-2xl font-bold mb-1">Alice Cooper</p>
            <p className="text-sm opacity-90">Consultation • Dr. Smith</p>
            <p className="text-xs opacity-75 mt-2">Checked in at 09:15 AM • Waiting 15 min</p>
          </div>
          <button className="mt-4 w-full py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-opacity-90 transition">
            Call Patient
          </button>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Today's Schedule</h2>
            <Clock className="h-5 w-5 text-slate-400" />
          </div>
          <div className="space-y-2">
            {[
              { time: '09:00 AM', patient: 'John Doe', doctor: 'Dr. Smith', status: 'Waiting' },
              { time: '09:30 AM', patient: 'Jane Smith', doctor: 'Dr. Johnson', status: 'In Progress' },
              { time: '10:00 AM', patient: 'Robert Brown', doctor: 'Dr. Smith', status: 'Completed' },
              { time: '10:30 AM', patient: 'Sarah Wilson', doctor: 'Dr. Davis', status: 'Scheduled' },
            ].map((apt, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold text-emerald-600 w-20">{apt.time}</div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{apt.patient}</p>
                    <p className="text-xs text-slate-500">{apt.doctor}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                  apt.status === 'In Progress' ? 'bg-purple-100 text-purple-800' :
                  apt.status === 'Waiting' ? 'bg-amber-100 text-amber-800' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
          <button 
            onClick={() => router.push('/dashboard/appointments')}
            className="w-full mt-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg font-medium text-sm transition"
          >
            View All Appointments →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => setIsNewPatientModalOpen(true)}
              className="p-4 border-2 border-slate-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition text-left group"
            >
              <UserPlus className="h-6 w-6 text-emerald-600 mb-2 group-hover:scale-110 transition" />
              <p className="text-sm font-medium text-slate-900">New Patient</p>
            </button>
            <button
              onClick={() => setIsWalkInModalOpen(true)}
              className="p-4 border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left group"
            >
              <Calendar className="h-6 w-6 text-blue-600 mb-2 group-hover:scale-110 transition" />
              <p className="text-sm font-medium text-slate-900">Walk-In</p>
            </button>
            <button
              onClick={() => setIsCheckInModalOpen(true)}
              className="p-4 border-2 border-slate-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-left group"
            >
              <ClipboardCheck className="h-6 w-6 text-purple-600 mb-2 group-hover:scale-110 transition" />
              <p className="text-sm font-medium text-slate-900">Check-In</p>
            </button>
            <button
              onClick={() => setIsVisitorModalOpen(true)}
              className="p-4 border-2 border-slate-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition text-left group"
            >
              <UserPlus className="h-6 w-6 text-amber-600 mb-2 group-hover:scale-110 transition" />
              <p className="text-sm font-medium text-slate-900">Visitor</p>
            </button>
            <button
              onClick={() => router.push('/dashboard/frontdesk/queue')}
              className="p-4 border-2 border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-left group"
            >
              <Users className="h-6 w-6 text-indigo-600 mb-2 group-hover:scale-110 transition" />
              <p className="text-sm font-medium text-slate-900">Queue</p>
            </button>
            <button
              onClick={() => router.push('/dashboard/appointments')}
              className="p-4 border-2 border-slate-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition text-left group"
            >
              <FileText className="h-6 w-6 text-teal-600 mb-2 group-hover:scale-110 transition" />
              <p className="text-sm font-medium text-slate-900">Waitlist</p>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Important Alerts</h2>
          <div className="space-y-3">
            {stats.pendingRegistrations > 0 && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer hover:bg-amber-100 transition">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">{stats.pendingRegistrations} pending registrations</p>
                  <p className="text-xs text-amber-700 mt-1">Complete patient registration forms</p>
                </div>
              </div>
            )}
            {stats.waitingPatients > 0 && (
              <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg cursor-pointer hover:bg-purple-100 transition">
                <Users className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-900">{stats.waitingPatients} patients waiting</p>
                  <p className="text-xs text-purple-700 mt-1">Average wait: {stats.averageWaitTime} minutes</p>
                </div>
              </div>
            )}
            {stats.noShows > 0 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition">
                <UserX className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">{stats.noShows} no-shows today</p>
                  <p className="text-xs text-red-700 mt-1">Follow up with patients</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Current Waitlist</h2>
          <button 
            onClick={() => router.push('/dashboard/frontdesk/queue-display')}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Open Queue TV →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Token</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Check-in</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Wait Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {[
                { token: 'T001', name: 'Alice Cooper', type: 'Consultation', checkIn: '09:15 AM', wait: '15 min', status: 'Waiting', priority: false },
                { token: 'T002', name: 'Bob Martin', type: 'Follow-up', checkIn: '09:20 AM', wait: '10 min', status: 'Waiting', priority: false },
                { token: 'T003', name: 'Carol White', type: 'Emergency', checkIn: '09:25 AM', wait: '5 min', status: 'Priority', priority: true },
              ].map((patient, idx) => (
                <tr key={idx} className={`hover:bg-slate-50 ${patient.priority ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900">{patient.token}</td>
                  <td className="px-4 py-3 text-sm text-slate-900">{patient.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{patient.type}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{patient.checkIn}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{patient.wait}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      patient.status === 'Priority' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="px-3 py-1 text-xs font-medium text-purple-600 hover:bg-purple-50 rounded transition">
                      Call
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CheckInModal 
        isOpen={isCheckInModalOpen} 
        onClose={() => setIsCheckInModalOpen(false)} 
      />
      <WalkInBookingModal 
        isOpen={isWalkInModalOpen} 
        onClose={() => setIsWalkInModalOpen(false)} 
      />
      <VisitorManagementModal 
        isOpen={isVisitorModalOpen} 
        onClose={() => setIsVisitorModalOpen(false)} 
      />
      <NewPatientModal 
        isOpen={isNewPatientModalOpen} 
        onClose={() => setIsNewPatientModalOpen(false)} 
      />
    </div>
  );
}
