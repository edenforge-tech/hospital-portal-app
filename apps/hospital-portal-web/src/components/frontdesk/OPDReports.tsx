'use client';

import React, { useState, useEffect } from 'react';
import { getApi } from '@/lib/api';
import { Download, Calendar, Users, UserCheck, TrendingUp, Activity, Clock, AlertCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface OPDStats {
  totalRegistrations: number;
  newPatients: number;
  returningPatients: number;
  totalCheckIns: number;
  totalNoShows: number;
  totalAppointments: number;
  averageWaitTime: number;
}

interface DoctorStats {
  doctorId: string;
  doctorName: string;
  specialization: string;
  totalPatients: number;
  checkIns: number;
  noShows: number;
  averageConsultationTime: number;
}

interface DepartmentStats {
  departmentName: string;
  patientCount: number;
  percentage: number;
}

interface PeakHoursData {
  hour: string;
  registrations: number;
  checkIns: number;
}

export default function OPDReports() {
  const [dateRange, setDateRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  const [opdStats, setOpdStats] = useState<OPDStats>({
    totalRegistrations: 0,
    newPatients: 0,
    returningPatients: 0,
    totalCheckIns: 0,
    totalNoShows: 0,
    totalAppointments: 0,
    averageWaitTime: 0,
  });

  const [doctorStats, setDoctorStats] = useState<DoctorStats[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [peakHoursData, setPeakHoursData] = useState<PeakHoursData[]>([]);

  useEffect(() => {
    fetchReportData();
  }, [dateRange, selectedDate]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const api = getApi();
      const response = await api.get(`/reports/opd/${dateRange}?date=${selectedDate}`);

      if (response.data) {
        setOpdStats(response.data.stats || opdStats);
        setDoctorStats(response.data.doctorStats || []);
        setDepartmentStats(response.data.departmentStats || []);
        setPeakHoursData(response.data.peakHours || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch OPD report data:', error);
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    // Prepare CSV data
    let csvContent = 'OPD Report - ' + dateRange.toUpperCase() + ' - ' + selectedDate + '\n\n';

    // Overall Stats
    csvContent += 'Overall Statistics\n';
    csvContent += 'Metric,Value\n';
    csvContent += `Total Registrations,${opdStats.totalRegistrations}\n`;
    csvContent += `New Patients,${opdStats.newPatients}\n`;
    csvContent += `Returning Patients,${opdStats.returningPatients}\n`;
    csvContent += `Total Check-Ins,${opdStats.totalCheckIns}\n`;
    csvContent += `Total No-Shows,${opdStats.totalNoShows}\n`;
    csvContent += `Average Wait Time,${opdStats.averageWaitTime} min\n\n`;

    // Doctor-wise Stats
    csvContent += 'Doctor-wise Statistics\n';
    csvContent += 'Doctor Name,Specialization,Total Patients,Check-Ins,No-Shows,Avg Consultation Time\n';
    doctorStats.forEach((doc) => {
      csvContent += `${doc.doctorName},${doc.specialization},${doc.totalPatients},${doc.checkIns},${doc.noShows},${doc.averageConsultationTime} min\n`;
    });
    csvContent += '\n';

    // Department-wise Stats
    csvContent += 'Department-wise Distribution\n';
    csvContent += 'Department,Patient Count,Percentage\n';
    departmentStats.forEach((dept) => {
      csvContent += `${dept.departmentName},${dept.patientCount},${dept.percentage}%\n`;
    });

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `opd-report-${dateRange}-${selectedDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const noShowPercentage = opdStats.totalAppointments > 0 
    ? ((opdStats.totalNoShows / opdStats.totalAppointments) * 100).toFixed(1) 
    : '0.0';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading OPD reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">OPD Reports & Analytics</h1>
            <p className="text-slate-600">Comprehensive statistics and insights for OPD operations</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export to CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Report Type</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as 'daily' | 'weekly' | 'monthly')}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="daily">Daily Report</option>
                <option value="weekly">Weekly Report</option>
                <option value="monthly">Monthly Report</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchReportData}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* Overall Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Registrations</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">{opdStats.totalRegistrations}</p>
                <p className="text-xs text-slate-500 mt-1">
                  New: {opdStats.newPatients} | Returning: {opdStats.returningPatients}
                </p>
              </div>
              <Users className="w-12 h-12 text-emerald-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Check-Ins</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">{opdStats.totalCheckIns}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {opdStats.totalAppointments > 0 
                    ? ((opdStats.totalCheckIns / opdStats.totalAppointments) * 100).toFixed(1) 
                    : '0'}% of appointments
                </p>
              </div>
              <UserCheck className="w-12 h-12 text-emerald-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">No-Shows</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{opdStats.totalNoShows}</p>
                <p className="text-xs text-slate-500 mt-1">{noShowPercentage}% of appointments</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Wait Time</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">{opdStats.averageWaitTime}</p>
                <p className="text-xs text-slate-500 mt-1">minutes</p>
              </div>
              <Clock className="w-12 h-12 text-orange-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Doctor-wise Patient Count */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Doctor-wise Patient Count
            </h3>
            {doctorStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={doctorStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="doctorName" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalPatients" fill="#10b981" name="Total Patients" />
                  <Bar dataKey="checkIns" fill="#059669" name="Check-Ins" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-slate-500 py-12">No doctor data available</p>
            )}
          </div>

          {/* Department-wise Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Department-wise Distribution
            </h3>
            {departmentStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentStats}
                    dataKey="patientCount"
                    nameKey="departmentName"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.departmentName}: ${entry.percentage}%`}
                  >
                    {departmentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-slate-500 py-12">No department data available</p>
            )}
          </div>
        </div>

        {/* Peak Hours Analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Peak Hours Analysis
          </h3>
          {peakHoursData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="registrations" stroke="#10b981" name="Registrations" strokeWidth={2} />
                <Line type="monotone" dataKey="checkIns" stroke="#059669" name="Check-Ins" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-slate-500 py-12">No peak hours data available</p>
          )}
        </div>

        {/* Doctor-wise Detailed Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-100 p-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Doctor-wise Detailed Statistics</h3>
          </div>
          {doctorStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Doctor Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Specialization</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">Total Patients</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">Check-Ins</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">No-Shows</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">Avg Consultation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {doctorStats.map((doc) => (
                    <tr key={doc.doctorId} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{doc.doctorName}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{doc.specialization}</td>
                      <td className="px-6 py-4 text-sm text-slate-700 text-right">{doc.totalPatients}</td>
                      <td className="px-6 py-4 text-sm text-emerald-700 text-right font-medium">{doc.checkIns}</td>
                      <td className="px-6 py-4 text-sm text-red-700 text-right font-medium">{doc.noShows}</td>
                      <td className="px-6 py-4 text-sm text-slate-700 text-right">{doc.averageConsultationTime} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">No doctor statistics available</p>
          )}
        </div>
      </div>
    </div>
  );
}
