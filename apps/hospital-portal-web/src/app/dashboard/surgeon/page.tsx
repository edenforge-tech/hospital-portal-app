'use client';

import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  Clock, 
  Activity, 
  TrendingUp,
  TrendingDown,
  Eye,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Award,
  Target,
  FileText,
  Filter,
  Download,
  Settings,
  ChevronRight,
  Stethoscope,
  Timer,
  Users,
  Building
} from 'lucide-react';

// Types
interface SurgeryRecord {
  id: string;
  patientName: string;
  mrn: string;
  procedureType: string;
  eye: 'OD' | 'OS' | 'OU';
  date: string;
  startTime: string;
  duration: number;
  outcome: 'excellent' | 'good' | 'fair' | 'complication';
  complication?: string;
  notes?: string;
}

interface SurgeonStats {
  totalSurgeries: number;
  surgeriesToday: number;
  surgeriesThisWeek: number;
  surgeriesThisMonth: number;
  avgDuration: number;
  successRate: number;
  complicationRate: number;
  visualOutcomeExcellent: number;
}

interface ProcedureBreakdown {
  procedureType: string;
  count: number;
  successRate: number;
  avgDuration: number;
  complicationRate: number;
}

// Mock Data
const surgeonProfile = {
  name: 'Dr. Amit Verma',
  title: 'Senior Consultant Ophthalmologist',
  specializations: ['Cataract', 'Glaucoma', 'Refractive Surgery'],
  qualification: 'MS, DNB, FRCS',
  experience: '18 years',
  employeeId: 'EMP-001',
  branch: 'Main Hospital - Koramangala'
};

const mockStats: SurgeonStats = {
  totalSurgeries: 1842,
  surgeriesToday: 4,
  surgeriesThisWeek: 18,
  surgeriesThisMonth: 68,
  avgDuration: 22,
  successRate: 98.3,
  complicationRate: 1.7,
  visualOutcomeExcellent: 89.5
};

const mockRecentSurgeries: SurgeryRecord[] = [
  {
    id: 'SRG001',
    patientName: 'Ravi Kumar',
    mrn: 'MRN-2024-4001',
    procedureType: 'Phacoemulsification + PCIOL',
    eye: 'OD',
    date: '2026-01-28',
    startTime: '09:00',
    duration: 18,
    outcome: 'excellent',
    notes: 'Uncomplicated surgery, SN60WF IOL implanted'
  },
  {
    id: 'SRG002',
    patientName: 'Lakshmi Devi',
    mrn: 'MRN-2024-4002',
    procedureType: 'Phacoemulsification + PCIOL',
    eye: 'OS',
    date: '2026-01-28',
    startTime: '09:45',
    duration: 25,
    outcome: 'good',
    notes: 'Dense nucleus required higher phaco energy'
  },
  {
    id: 'SRG003',
    patientName: 'Gopal Menon',
    mrn: 'MRN-2024-4003',
    procedureType: 'Trabeculectomy',
    eye: 'OS',
    date: '2026-01-27',
    startTime: '11:00',
    duration: 45,
    outcome: 'good',
    notes: 'MMC 0.02% applied for 2 minutes'
  },
  {
    id: 'SRG004',
    patientName: 'Saroja Devi',
    mrn: 'MRN-2024-4004',
    procedureType: 'Phacoemulsification + PCIOL',
    eye: 'OD',
    date: '2026-01-27',
    startTime: '09:30',
    duration: 20,
    outcome: 'excellent'
  },
  {
    id: 'SRG005',
    patientName: 'Krishnamurthy S',
    mrn: 'MRN-2024-4005',
    procedureType: 'Phacoemulsification + PCIOL',
    eye: 'OS',
    date: '2026-01-25',
    startTime: '10:15',
    duration: 35,
    outcome: 'complication',
    complication: 'PCR with vitreous loss',
    notes: 'Converted to sulcus IOL placement'
  },
  {
    id: 'SRG006',
    patientName: 'Meena Kumari',
    mrn: 'MRN-2024-4006',
    procedureType: 'LASIK',
    eye: 'OU',
    date: '2026-01-24',
    startTime: '14:00',
    duration: 15,
    outcome: 'excellent'
  }
];

const mockProcedureBreakdown: ProcedureBreakdown[] = [
  { procedureType: 'Phacoemulsification', count: 1520, successRate: 98.8, avgDuration: 20, complicationRate: 1.2 },
  { procedureType: 'Trabeculectomy', count: 145, successRate: 94.5, avgDuration: 42, complicationRate: 5.5 },
  { procedureType: 'LASIK/PRK', count: 120, successRate: 99.2, avgDuration: 12, complicationRate: 0.8 },
  { procedureType: 'YAG Capsulotomy', count: 42, successRate: 100, avgDuration: 8, complicationRate: 0 },
  { procedureType: 'Vitrectomy', count: 15, successRate: 93.3, avgDuration: 65, complicationRate: 6.7 }
];

const upcomingSurgeries = [
  { time: '09:00', patient: 'Anand Sharma', procedure: 'Phaco + PCIOL OD', status: 'Prepared' },
  { time: '10:00', patient: 'Vijaya Lakshmi', procedure: 'Phaco + PCIOL OS', status: 'Waiting' },
  { time: '11:15', patient: 'Suresh Kumar', procedure: 'Trabeculectomy OD', status: 'Pre-op' },
  { time: '14:00', patient: 'Kamala Devi', procedure: 'Phaco + PCIOL OU', status: 'Pre-op' }
];

// Helper Functions
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getOutcomeColor = (outcome: string) => {
  const colors: Record<string, string> = {
    'excellent': 'bg-green-100 text-green-800',
    'good': 'bg-blue-100 text-blue-800',
    'fair': 'bg-yellow-100 text-yellow-800',
    'complication': 'bg-red-100 text-red-800'
  };
  return colors[outcome] || 'bg-gray-100 text-gray-800';
};

export default function SurgeonDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'surgeries' | 'analytics'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <User className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{surgeonProfile.name}</h1>
            <p className="text-gray-600">{surgeonProfile.title}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-500">{surgeonProfile.qualification}</span>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500">{surgeonProfile.experience} experience</span>
            </div>
            <div className="flex gap-2 mt-2">
              {surgeonProfile.specializations.map((spec, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </button>
          <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-100">Today</p>
              <p className="text-3xl font-bold">{mockStats.surgeriesToday}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.surgeriesThisWeek}</p>
            </div>
            <Activity className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.surgeriesThisMonth}</p>
            </div>
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Career</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.totalSurgeries.toLocaleString()}</p>
            </div>
            <Award className="h-6 w-6 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.avgDuration}<span className="text-sm font-normal text-gray-500"> min</span></p>
            </div>
            <Timer className="h-6 w-6 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">{mockStats.successRate}%</p>
            </div>
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Complication</p>
              <p className="text-2xl font-bold text-red-600">{mockStats.complicationRate}%</p>
            </div>
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">VA Excellent</p>
              <p className="text-2xl font-bold text-blue-600">{mockStats.visualOutcomeExcellent}%</p>
            </div>
            <Eye className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Today's Schedule & Recent */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Today&apos;s Schedule
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {upcomingSurgeries.map((surgery, idx) => (
                <div key={idx} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{surgery.time}</p>
                    </div>
                    <div className="h-10 w-px bg-gray-200"></div>
                    <div>
                      <p className="font-medium text-gray-900">{surgery.patient}</p>
                      <p className="text-sm text-gray-600">{surgery.procedure}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      surgery.status === 'Prepared' ? 'bg-green-100 text-green-700' :
                      surgery.status === 'Waiting' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {surgery.status}
                    </span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Surgeries */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-blue-600" />
                Recent Surgeries
              </h2>
              <button className="text-sm text-blue-600 hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Procedure</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockRecentSurgeries.map(surgery => (
                    <tr key={surgery.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{formatDate(surgery.date)}</div>
                        <div className="text-xs text-gray-500">{surgery.startTime}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{surgery.patientName}</div>
                        <div className="text-xs text-gray-500">{surgery.mrn}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{surgery.procedureType}</div>
                        <div className="text-xs text-gray-500">{surgery.eye}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{surgery.duration} min</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${getOutcomeColor(surgery.outcome)}`}>
                          {surgery.outcome}
                        </span>
                        {surgery.complication && (
                          <p className="text-xs text-red-600 mt-1">{surgery.complication}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Breakdown */}
        <div className="space-y-6">
          {/* Performance Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Performance Metrics
              </h2>
            </div>
            <div className="p-4 space-y-4">
              {/* Success Rate Gauge */}
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-green-100 to-green-200 border-4 border-green-500">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-700">{mockStats.successRate}%</p>
                    <p className="text-xs text-green-600">Success Rate</p>
                  </div>
                </div>
              </div>

              {/* Comparison to Dept Average */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-sm text-gray-500">vs Dept Avg</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600">+2.1%</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-sm text-gray-500">Benchmark</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-gray-900">Top 10%</span>
                  </div>
                </div>
              </div>

              {/* Trends */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Monthly Trend</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Surgeries</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">+12%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Efficiency</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">+5%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Complications</span>
                    <div className="flex items-center gap-1">
                      <TrendingDown className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">-0.3%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Procedure Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-600" />
                Procedure Breakdown
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {mockProcedureBreakdown.map((proc, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{proc.procedureType}</p>
                    <p className="text-xs text-gray-500">{proc.count} cases • {proc.avgDuration} min avg</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">{proc.successRate}%</p>
                    <p className="text-xs text-gray-500">success</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-2">
              <button className="w-full px-4 py-3 text-left hover:bg-gray-50 rounded-lg flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-700">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Generate Monthly Report
                </span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
              <button className="w-full px-4 py-3 text-left hover:bg-gray-50 rounded-lg flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-700">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  View My Complications
                </span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
              <button className="w-full px-4 py-3 text-left hover:bg-gray-50 rounded-lg flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-700">
                  <Users className="h-5 w-5 text-green-600" />
                  Patient Outcomes
                </span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
              <button className="w-full px-4 py-3 text-left hover:bg-gray-50 rounded-lg flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-700">
                  <Building className="h-5 w-5 text-purple-600" />
                  Department Comparison
                </span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
