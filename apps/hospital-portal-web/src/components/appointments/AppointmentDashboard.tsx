'use client';

import { useState, useEffect } from 'react';
import { appointmentsApi, AppointmentStats } from '@/lib/api/appointments-enhanced.api';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  Calendar, 
  Activity,
  AlertTriangle
} from 'lucide-react';

export default function AppointmentDashboard() {
  const [stats, setStats] = useState<AppointmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let startDate: string;
      const endDate = new Date().toISOString().split('T')[0];
      
      switch (timeRange) {
        case 'today':
          startDate = endDate;
          break;
        case 'week':
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          startDate = weekAgo.toISOString().split('T')[0];
          break;
        case 'month':
          const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          startDate = monthAgo.toISOString().split('T')[0];
          break;
      }

      const response = await appointmentsApi.getStats(startDate, endDate);
      setStats(response.data);
    } catch (err: any) {
      console.error('Error loading stats:', err);
      setError(err.response?.data?.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500">
        <BarChart3 className="h-12 w-12 mx-auto mb-4" />
        <p>No statistics available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Appointment Analytics</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="today">Today</option>
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
              <p className="text-sm text-green-600">
                {stats.totalToday > 0 ? Math.round((stats.completedToday / stats.totalToday) * 100) : 0}% completion rate
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cancelled/No-Show</p>
              <p className="text-2xl font-bold text-gray-900">{stats.cancelledToday + stats.noShowToday}</p>
              <p className="text-sm text-red-600">
                {stats.totalToday > 0 ? Math.round(((stats.cancelledToday + stats.noShowToday) / stats.totalToday) * 100) : 0}% loss rate
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageDuration}</p>
              <p className="text-sm text-purple-600">minutes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Department Breakdown */}
      {stats.departmentBreakdown && stats.departmentBreakdown.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <Users className="inline h-5 w-5 mr-2" />
            Appointments by Department
          </h3>
          <div className="space-y-4">
            {stats.departmentBreakdown.map((dept, index) => {
              const percentage = stats.totalToday > 0 ? (dept.count / stats.totalToday) * 100 : 0;
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-indigo-500 rounded"></div>
                    <span className="font-medium text-gray-900">{dept.departmentName}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-500 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{dept.count}</span>
                    <span className="text-sm text-gray-500 w-12 text-right">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Peak Hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <Activity className="inline h-5 w-5 mr-2" />
            Peak Booking Time
          </h3>
          <div className="text-center py-8">
            <div className="text-4xl font-bold text-indigo-600">{stats.mostBookedTimeSlot}</div>
            <p className="text-gray-600 mt-2">Most popular appointment time</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Utilization Rate:</span>
              <span className="font-medium">
                {stats.totalToday > 0 ? Math.round((stats.completedToday / stats.totalToday) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">No-Show Rate:</span>
              <span className="font-medium text-red-600">
                {stats.totalToday > 0 ? Math.round((stats.noShowToday / stats.totalToday) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cancellation Rate:</span>
              <span className="font-medium text-yellow-600">
                {stats.totalToday > 0 ? Math.round((stats.cancelledToday / stats.totalToday) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Duration:</span>
              <span className="font-medium">{stats.averageDuration} min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}