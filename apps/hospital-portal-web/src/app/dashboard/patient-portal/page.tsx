'use client';

import { useState, useEffect } from 'react';
import { Calendar, FileText, MessageSquare, Pill, User, Clock, MapPin, Video } from 'lucide-react';

interface DashboardStats {
  upcomingAppointments: number;
  newDocuments: number;
  unreadMessages: number;
  activePrescriptions: number;
}

export default function PatientPortalPage() {
  const [stats, setStats] = useState<DashboardStats>({
    upcomingAppointments: 0,
    newDocuments: 0,
    unreadMessages: 0,
    activePrescriptions: 0
  });
  const [loading, setLoading] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      // Simulated data - will be replaced with real API calls
      setStats({
        upcomingAppointments: 2,
        newDocuments: 3,
        unreadMessages: 5,
        activePrescriptions: 4
      });

      setUpcomingAppointments([
        {
          id: '1',
          providerName: 'Dr. Sarah Johnson',
          specialty: 'Ophthalmology',
          date: '2026-01-28',
          startTime: '10:00 AM',
          location: 'Main Clinic - Room 301',
          type: 'Follow-up'
        },
        {
          id: '2',
          providerName: 'Dr. Michael Chen',
          specialty: 'Optometry',
          date: '2026-02-05',
          startTime: '2:30 PM',
          location: 'Vision Center - Room 102',
          type: 'Annual Exam'
        }
      ]);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Upcoming Appointments',
      value: stats.upcomingAppointments,
      icon: Calendar,
      color: 'bg-blue-500',
      link: '/dashboard/appointments'
    },
    {
      title: 'New Documents',
      value: stats.newDocuments,
      icon: FileText,
      color: 'bg-green-500',
      link: '/dashboard/documents'
    },
    {
      title: 'Unread Messages',
      value: stats.unreadMessages,
      icon: MessageSquare,
      color: 'bg-purple-500',
      link: '/dashboard/messages'
    },
    {
      title: 'Active Prescriptions',
      value: stats.activePrescriptions,
      icon: Pill,
      color: 'bg-orange-500',
      link: '/dashboard/pharmacy'
    }
  ];

  const quickActions = [
    {
      title: 'Schedule Appointment',
      description: 'Book a new appointment with your provider',
      icon: Calendar,
      color: 'bg-blue-50 text-blue-600',
      link: '/dashboard/appointments/new'
    },
    {
      title: 'Message Your Doctor',
      description: 'Send a secure message to your care team',
      icon: MessageSquare,
      color: 'bg-purple-50 text-purple-600',
      link: '/dashboard/messages/new'
    },
    {
      title: 'Request Prescription Refill',
      description: 'Refill your medications',
      icon: Pill,
      color: 'bg-orange-50 text-orange-600',
      link: '/dashboard/pharmacy/refill'
    },
    {
      title: 'View Medical Records',
      description: 'Access your health records and test results',
      icon: FileText,
      color: 'bg-green-50 text-green-600',
      link: '/dashboard/documents'
    },
    {
      title: 'Update Profile',
      description: 'Manage your personal information',
      icon: User,
      color: 'bg-gray-50 text-gray-600',
      link: '/dashboard/profile'
    },
    {
      title: 'Telehealth Visit',
      description: 'Join a virtual appointment',
      icon: Video,
      color: 'bg-indigo-50 text-indigo-600',
      link: '/dashboard/telehealth'
    }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading patient portal...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Patient Portal</h1>
        <p className="text-gray-600 mt-1">Welcome to your healthcare dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
        </div>
        <div className="p-6">
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No upcoming appointments</p>
              <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Schedule Appointment
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{appointment.providerName}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {appointment.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{appointment.specialty}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(appointment.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{appointment.startTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{appointment.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        Reschedule
                      </button>
                      <button className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className={`inline-flex p-2 rounded-lg ${action.color} mb-3`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Health Tips Banner */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 bg-blue-500 rounded-full p-2">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Health Tip of the Day</h3>
            <p className="text-gray-600 text-sm">
              Regular eye exams are essential for maintaining good vision and detecting eye diseases early. Schedule your annual eye exam today!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
