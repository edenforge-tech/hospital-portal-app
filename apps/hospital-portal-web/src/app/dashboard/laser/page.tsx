'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  Eye, 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  User, 
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Activity,
  Target,
  Crosshair,
  Settings,
  TrendingUp,
  BarChart3,
  ChevronRight,
  Printer,
  Download,
  RefreshCw,
  Shield,
  Thermometer,
  Aperture
} from 'lucide-react';

// Types
interface LaserProcedure {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  age: number;
  gender: 'Male' | 'Female';
  procedureType: 'lasik' | 'prk' | 'smile' | 'yag-capsulotomy' | 'yag-pi' | 'slt' | 'alt' | 'prp' | 'focal-laser' | 'cxl';
  procedureName: string;
  eye: 'OD' | 'OS' | 'OU';
  scheduledDate: string;
  scheduledTime: string;
  surgeon: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'postponed';
  preOpStatus: 'pending' | 'cleared' | 'issues';
  consentSigned: boolean;
  deviceUsed?: string;
  parameters?: LaserParameters;
  outcome?: 'success' | 'partial' | 'complication';
  notes?: string;
}

interface LaserParameters {
  energy?: number;
  pulses?: number;
  spotSize?: number;
  frequency?: number;
  duration?: number;
  ablationZone?: number;
  flapThickness?: number;
  flapDiameter?: number;
}

interface LaserDevice {
  id: string;
  name: string;
  type: 'excimer' | 'femtosecond' | 'yag' | 'argon' | 'slt' | 'micropulse';
  manufacturer: string;
  model: string;
  lastCalibration: string;
  nextCalibration: string;
  status: 'operational' | 'maintenance' | 'offline';
  totalProcedures: number;
}

interface LaserStats {
  todayProcedures: number;
  weekProcedures: number;
  monthProcedures: number;
  successRate: number;
  pendingScreenings: number;
  scheduledToday: number;
}

// Mock Data
const mockProcedures: LaserProcedure[] = [
  {
    id: 'LP001',
    patientId: 'P1001',
    patientName: 'Rajesh Kumar',
    mrn: 'MRN-2024-1001',
    age: 28,
    gender: 'Male',
    procedureType: 'lasik',
    procedureName: 'LASIK - Femto',
    eye: 'OU',
    scheduledDate: '2026-01-28',
    scheduledTime: '09:00',
    surgeon: 'Dr. Priya Sharma',
    status: 'scheduled',
    preOpStatus: 'cleared',
    consentSigned: true,
    deviceUsed: 'WaveLight EX500',
    parameters: {
      ablationZone: 6.5,
      flapThickness: 110,
      flapDiameter: 8.5
    }
  },
  {
    id: 'LP002',
    patientId: 'P1002',
    patientName: 'Meera Patel',
    mrn: 'MRN-2024-1002',
    age: 32,
    gender: 'Female',
    procedureType: 'prk',
    procedureName: 'PRK - Surface Ablation',
    eye: 'OD',
    scheduledDate: '2026-01-28',
    scheduledTime: '10:30',
    surgeon: 'Dr. Priya Sharma',
    status: 'in-progress',
    preOpStatus: 'cleared',
    consentSigned: true,
    deviceUsed: 'WaveLight EX500'
  },
  {
    id: 'LP003',
    patientId: 'P1003',
    patientName: 'Suresh Reddy',
    mrn: 'MRN-2024-1003',
    age: 65,
    gender: 'Male',
    procedureType: 'yag-capsulotomy',
    procedureName: 'YAG Posterior Capsulotomy',
    eye: 'OS',
    scheduledDate: '2026-01-28',
    scheduledTime: '11:00',
    surgeon: 'Dr. Amit Verma',
    status: 'completed',
    preOpStatus: 'cleared',
    consentSigned: true,
    deviceUsed: 'Ellex Ultra Q',
    parameters: {
      energy: 1.5,
      pulses: 45
    },
    outcome: 'success'
  },
  {
    id: 'LP004',
    patientId: 'P1004',
    patientName: 'Lakshmi Devi',
    mrn: 'MRN-2024-1004',
    age: 58,
    gender: 'Female',
    procedureType: 'slt',
    procedureName: 'SLT - Glaucoma',
    eye: 'OU',
    scheduledDate: '2026-01-28',
    scheduledTime: '14:00',
    surgeon: 'Dr. Kavita Singh',
    status: 'scheduled',
    preOpStatus: 'cleared',
    consentSigned: true,
    deviceUsed: 'Ellex Tango'
  },
  {
    id: 'LP005',
    patientId: 'P1005',
    patientName: 'Vikram Shah',
    mrn: 'MRN-2024-1005',
    age: 45,
    gender: 'Male',
    procedureType: 'prp',
    procedureName: 'PRP - Diabetic Retinopathy',
    eye: 'OD',
    scheduledDate: '2026-01-28',
    scheduledTime: '15:30',
    surgeon: 'Dr. Ravi Menon',
    status: 'scheduled',
    preOpStatus: 'pending',
    consentSigned: false,
    deviceUsed: 'Pascal Pattern Scan'
  },
  {
    id: 'LP006',
    patientId: 'P1006',
    patientName: 'Anita Gupta',
    mrn: 'MRN-2024-1006',
    age: 24,
    gender: 'Female',
    procedureType: 'smile',
    procedureName: 'SMILE - Lenticule Extraction',
    eye: 'OU',
    scheduledDate: '2026-01-29',
    scheduledTime: '09:00',
    surgeon: 'Dr. Priya Sharma',
    status: 'scheduled',
    preOpStatus: 'cleared',
    consentSigned: true,
    deviceUsed: 'Zeiss VisuMax'
  }
];

const mockDevices: LaserDevice[] = [
  {
    id: 'DEV001',
    name: 'WaveLight EX500',
    type: 'excimer',
    manufacturer: 'Alcon',
    model: 'EX500',
    lastCalibration: '2026-01-15',
    nextCalibration: '2026-02-15',
    status: 'operational',
    totalProcedures: 1250
  },
  {
    id: 'DEV002',
    name: 'Zeiss VisuMax',
    type: 'femtosecond',
    manufacturer: 'Carl Zeiss',
    model: 'VisuMax 800',
    lastCalibration: '2026-01-20',
    nextCalibration: '2026-02-20',
    status: 'operational',
    totalProcedures: 890
  },
  {
    id: 'DEV003',
    name: 'Ellex Ultra Q',
    type: 'yag',
    manufacturer: 'Ellex',
    model: 'Ultra Q Reflex',
    lastCalibration: '2026-01-10',
    nextCalibration: '2026-02-10',
    status: 'operational',
    totalProcedures: 2100
  },
  {
    id: 'DEV004',
    name: 'Ellex Tango',
    type: 'slt',
    manufacturer: 'Ellex',
    model: 'Tango Reflex',
    lastCalibration: '2026-01-18',
    nextCalibration: '2026-02-18',
    status: 'operational',
    totalProcedures: 650
  },
  {
    id: 'DEV005',
    name: 'Pascal Pattern Scan',
    type: 'argon',
    manufacturer: 'Topcon',
    model: 'Pascal Streamline',
    lastCalibration: '2026-01-05',
    nextCalibration: '2026-02-05',
    status: 'maintenance',
    totalProcedures: 1800
  }
];

const mockStats: LaserStats = {
  todayProcedures: 6,
  weekProcedures: 28,
  monthProcedures: 112,
  successRate: 98.5,
  pendingScreenings: 12,
  scheduledToday: 6
};

// Helper Functions
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'scheduled': 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
    'postponed': 'bg-orange-100 text-orange-800',
    'operational': 'bg-green-100 text-green-800',
    'maintenance': 'bg-yellow-100 text-yellow-800',
    'offline': 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getPreOpColor = (status: string) => {
  const colors: Record<string, string> = {
    'cleared': 'bg-green-100 text-green-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'issues': 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getProcedureIcon = (type: string) => {
  const icons: Record<string, React.ReactNode> = {
    'lasik': <Aperture className="h-4 w-4" />,
    'prk': <Target className="h-4 w-4" />,
    'smile': <Eye className="h-4 w-4" />,
    'yag-capsulotomy': <Zap className="h-4 w-4" />,
    'yag-pi': <Zap className="h-4 w-4" />,
    'slt': <Activity className="h-4 w-4" />,
    'alt': <Activity className="h-4 w-4" />,
    'prp': <Crosshair className="h-4 w-4" />,
    'focal-laser': <Crosshair className="h-4 w-4" />,
    'cxl': <Shield className="h-4 w-4" />
  };
  return icons[type] || <Zap className="h-4 w-4" />;
};

const getProcedureCategory = (type: string) => {
  const categories: Record<string, string> = {
    'lasik': 'Refractive',
    'prk': 'Refractive',
    'smile': 'Refractive',
    'yag-capsulotomy': 'YAG',
    'yag-pi': 'YAG',
    'slt': 'Glaucoma',
    'alt': 'Glaucoma',
    'prp': 'Retina',
    'focal-laser': 'Retina',
    'cxl': 'Cornea'
  };
  return categories[type] || 'Other';
};

export default function LaserTreatmentPage() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'devices' | 'reports'>('schedule');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedProcedure, setSelectedProcedure] = useState<LaserProcedure | null>(null);
  const [showNewProcedureModal, setShowNewProcedureModal] = useState(false);
  const [showParametersModal, setShowParametersModal] = useState(false);

  // Filter procedures
  const filteredProcedures = mockProcedures.filter(proc => {
    const matchesSearch = 
      proc.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proc.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proc.procedureName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || proc.procedureType === filterType;
    const matchesStatus = filterStatus === 'all' || proc.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Group by category
  const proceduresByCategory = filteredProcedures.reduce((acc, proc) => {
    const category = getProcedureCategory(proc.procedureType);
    if (!acc[category]) acc[category] = [];
    acc[category].push(proc);
    return acc;
  }, {} as Record<string, LaserProcedure[]>);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="h-7 w-7 text-purple-600" />
            Laser Treatment Center
          </h1>
          <p className="text-gray-600 mt-1">
            Manage refractive, YAG, glaucoma, and retinal laser procedures
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewProcedureModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Schedule Procedure
          </button>
          <a
            href="/dashboard/laser/lasik-screening"
            className="px-4 py-2 border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 flex items-center gap-2"
          >
            <Target className="h-4 w-4" />
            LASIK Screening
          </a>
          <a
            href="/dashboard/laser/yag"
            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            YAG Module
          </a>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Procedures</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.todayProcedures}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.weekProcedures}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.monthProcedures}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">{mockStats.successRate}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Screenings</p>
              <p className="text-2xl font-bold text-orange-600">{mockStats.pendingScreenings}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Devices Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockDevices.filter(d => d.status === 'operational').length}/{mockDevices.length}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Settings className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'schedule', label: 'Today\'s Schedule', icon: Calendar },
              { id: 'devices', label: 'Laser Devices', icon: Settings },
              { id: 'reports', label: 'Outcomes & Reports', icon: BarChart3 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="p-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search patient, MRN, procedure..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Procedures</option>
                <optgroup label="Refractive">
                  <option value="lasik">LASIK</option>
                  <option value="prk">PRK</option>
                  <option value="smile">SMILE</option>
                </optgroup>
                <optgroup label="YAG">
                  <option value="yag-capsulotomy">YAG Capsulotomy</option>
                  <option value="yag-pi">YAG PI</option>
                </optgroup>
                <optgroup label="Glaucoma">
                  <option value="slt">SLT</option>
                  <option value="alt">ALT</option>
                </optgroup>
                <optgroup label="Retina">
                  <option value="prp">PRP</option>
                  <option value="focal-laser">Focal Laser</option>
                </optgroup>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </button>
            </div>

            {/* Procedure Categories */}
            <div className="space-y-6">
              {Object.entries(proceduresByCategory).map(([category, procedures]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    {category === 'Refractive' && <Aperture className="h-5 w-5 text-purple-600" />}
                    {category === 'YAG' && <Zap className="h-5 w-5 text-yellow-600" />}
                    {category === 'Glaucoma' && <Activity className="h-5 w-5 text-blue-600" />}
                    {category === 'Retina' && <Crosshair className="h-5 w-5 text-red-600" />}
                    {category} Procedures ({procedures.length})
                  </h3>
                  <div className="grid gap-4">
                    {procedures.map(proc => (
                      <div
                        key={proc.id}
                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => setSelectedProcedure(proc)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${
                              proc.status === 'completed' ? 'bg-green-100' :
                              proc.status === 'in-progress' ? 'bg-yellow-100' :
                              'bg-purple-100'
                            }`}>
                              {getProcedureIcon(proc.procedureType)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">{proc.patientName}</span>
                                <span className="text-sm text-gray-500">({proc.mrn})</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(proc.status)}`}>
                                  {proc.status.replace('-', ' ')}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {proc.procedureName} • {proc.eye} • {proc.surgeon}
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className="flex items-center gap-1 text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  {proc.scheduledTime}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-xs ${getPreOpColor(proc.preOpStatus)}`}>
                                  Pre-Op: {proc.preOpStatus}
                                </span>
                                {proc.consentSigned ? (
                                  <span className="flex items-center gap-1 text-green-600">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Consent Signed
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-red-600">
                                    <XCircle className="h-3 w-3" />
                                    Consent Pending
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {proc.status === 'scheduled' && (
                              <>
                                <button className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
                                  Start
                                </button>
                                <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                                  Reschedule
                                </button>
                              </>
                            )}
                            {proc.status === 'in-progress' && (
                              <button className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                                Complete
                              </button>
                            )}
                            {proc.status === 'completed' && (
                              <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                                View Report
                              </button>
                            )}
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Devices Tab */}
        {activeTab === 'devices' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Laser Equipment Inventory</h3>
              <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Sync Calibration Data
              </button>
            </div>

            <div className="grid gap-4">
              {mockDevices.map(device => (
                <div key={device.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${
                        device.status === 'operational' ? 'bg-green-100' :
                        device.status === 'maintenance' ? 'bg-yellow-100' :
                        'bg-red-100'
                      }`}>
                        <Zap className={`h-6 w-6 ${
                          device.status === 'operational' ? 'text-green-600' :
                          device.status === 'maintenance' ? 'text-yellow-600' :
                          'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{device.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(device.status)}`}>
                            {device.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {device.manufacturer} • {device.model} • Type: {device.type.toUpperCase()}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-gray-500">
                            Last Calibration: {formatDate(device.lastCalibration)}
                          </span>
                          <span className={`${
                            new Date(device.nextCalibration) < new Date() ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            Next Due: {formatDate(device.nextCalibration)}
                          </span>
                          <span className="text-gray-500">
                            Total Procedures: {device.totalProcedures.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                        Calibration Log
                      </button>
                      <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                        Maintenance
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Calibration Alert */}
            {mockDevices.some(d => new Date(d.nextCalibration) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Calibration Due Soon</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      One or more devices have calibration due within the next 7 days. Schedule maintenance to ensure regulatory compliance.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Outcomes Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Procedure Outcomes (This Month)</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Procedures</span>
                    <span className="font-semibold">{mockStats.monthProcedures}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Successful</span>
                    <span className="font-semibold text-green-600">108 (96.4%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Minor Complications</span>
                    <span className="font-semibold text-yellow-600">3 (2.7%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Major Complications</span>
                    <span className="font-semibold text-red-600">1 (0.9%)</span>
                  </div>
                </div>
              </div>

              {/* By Procedure Type */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">By Procedure Type</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Aperture className="h-4 w-4 text-purple-600" />
                      LASIK/PRK/SMILE
                    </span>
                    <span className="font-semibold">45 procedures</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-600" />
                      YAG Procedures
                    </span>
                    <span className="font-semibold">38 procedures</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      Glaucoma Laser
                    </span>
                    <span className="font-semibold">18 procedures</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Crosshair className="h-4 w-4 text-red-600" />
                      Retinal Laser
                    </span>
                    <span className="font-semibold">11 procedures</span>
                  </div>
                </div>
              </div>

              {/* Surgeon Performance */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Surgeon Performance</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Dr. Priya Sharma', procedures: 42, success: 100 },
                    { name: 'Dr. Amit Verma', procedures: 35, success: 97.1 },
                    { name: 'Dr. Kavita Singh', procedures: 20, success: 95 },
                    { name: 'Dr. Ravi Menon', procedures: 15, success: 93.3 }
                  ].map((surgeon, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-gray-600">{surgeon.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">{surgeon.procedures} proc.</span>
                        <span className={`font-semibold ${surgeon.success >= 95 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {surgeon.success}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Generate Reports</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-3 border border-gray-200 rounded-lg hover:bg-white flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-purple-600" />
                    Monthly Summary
                  </button>
                  <button className="p-3 border border-gray-200 rounded-lg hover:bg-white flex items-center gap-2 text-sm">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    Outcomes Analysis
                  </button>
                  <button className="p-3 border border-gray-200 rounded-lg hover:bg-white flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-green-600" />
                    Surgeon Report
                  </button>
                  <button className="p-3 border border-gray-200 rounded-lg hover:bg-white flex items-center gap-2 text-sm">
                    <Settings className="h-4 w-4 text-gray-600" />
                    Equipment Log
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <a href="/dashboard/laser/lasik-screening" className="bg-purple-50 rounded-xl p-4 hover:bg-purple-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-900">LASIK Screening</h3>
              <p className="text-sm text-purple-700">Candidacy assessment</p>
            </div>
          </div>
        </a>
        <a href="/dashboard/laser/yag" className="bg-yellow-50 rounded-xl p-4 hover:bg-yellow-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Zap className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-yellow-900">YAG Module</h3>
              <p className="text-sm text-yellow-700">Capsulotomy & PI</p>
            </div>
          </div>
        </a>
        <a href="/dashboard/operations/consent" className="bg-green-50 rounded-xl p-4 hover:bg-green-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">Laser Consent</h3>
              <p className="text-sm text-green-700">Digital consent forms</p>
            </div>
          </div>
        </a>
        <a href="/dashboard/surgeon" className="bg-blue-50 rounded-xl p-4 hover:bg-blue-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Surgeon Dashboard</h3>
              <p className="text-sm text-blue-700">Performance & stats</p>
            </div>
          </div>
        </a>
      </div>

      {/* New Procedure Modal */}
      {showNewProcedureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Schedule Laser Procedure</h2>
                <button
                  onClick={() => setShowNewProcedureModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500">
                    <option>Select Patient</option>
                    <option>Rajesh Kumar (MRN-2024-1001)</option>
                    <option>Meera Patel (MRN-2024-1002)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Procedure Type</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500">
                    <option>Select Procedure</option>
                    <optgroup label="Refractive">
                      <option value="lasik">LASIK</option>
                      <option value="prk">PRK</option>
                      <option value="smile">SMILE</option>
                    </optgroup>
                    <optgroup label="YAG">
                      <option value="yag-capsulotomy">YAG Capsulotomy</option>
                      <option value="yag-pi">YAG Peripheral Iridotomy</option>
                    </optgroup>
                    <optgroup label="Glaucoma">
                      <option value="slt">SLT</option>
                      <option value="alt">ALT</option>
                    </optgroup>
                    <optgroup label="Retina">
                      <option value="prp">PRP</option>
                      <option value="focal-laser">Focal Laser</option>
                    </optgroup>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Eye</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500">
                    <option value="OD">OD (Right)</option>
                    <option value="OS">OS (Left)</option>
                    <option value="OU">OU (Both)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surgeon</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500">
                    <option>Select Surgeon</option>
                    <option>Dr. Priya Sharma</option>
                    <option>Dr. Amit Verma</option>
                    <option>Dr. Kavita Singh</option>
                    <option>Dr. Ravi Menon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Device</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500">
                    <option>Select Device</option>
                    {mockDevices.filter(d => d.status === 'operational').map(device => (
                      <option key={device.id} value={device.id}>{device.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowNewProcedureModal(false)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Schedule Procedure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Procedure Detail Modal */}
      {selectedProcedure && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${
                    selectedProcedure.status === 'completed' ? 'bg-green-100' :
                    selectedProcedure.status === 'in-progress' ? 'bg-yellow-100' :
                    'bg-purple-100'
                  }`}>
                    {getProcedureIcon(selectedProcedure.procedureType)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedProcedure.procedureName}</h2>
                    <p className="text-gray-600">{selectedProcedure.patientName} • {selectedProcedure.mrn}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProcedure(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Patient Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name:</span>
                      <span className="font-medium">{selectedProcedure.patientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">MRN:</span>
                      <span className="font-medium">{selectedProcedure.mrn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Age/Gender:</span>
                      <span className="font-medium">{selectedProcedure.age}Y / {selectedProcedure.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Eye:</span>
                      <span className="font-medium">{selectedProcedure.eye}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Procedure Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date/Time:</span>
                      <span className="font-medium">{formatDate(selectedProcedure.scheduledDate)} {selectedProcedure.scheduledTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Surgeon:</span>
                      <span className="font-medium">{selectedProcedure.surgeon}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Device:</span>
                      <span className="font-medium">{selectedProcedure.deviceUsed || 'Not assigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(selectedProcedure.status)}`}>
                        {selectedProcedure.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedProcedure.parameters && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Laser Parameters</h3>
                  <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-3 gap-4 text-sm">
                    {selectedProcedure.parameters.energy && (
                      <div>
                        <span className="text-gray-500">Energy:</span>
                        <span className="ml-2 font-medium">{selectedProcedure.parameters.energy} mJ</span>
                      </div>
                    )}
                    {selectedProcedure.parameters.pulses && (
                      <div>
                        <span className="text-gray-500">Pulses:</span>
                        <span className="ml-2 font-medium">{selectedProcedure.parameters.pulses}</span>
                      </div>
                    )}
                    {selectedProcedure.parameters.ablationZone && (
                      <div>
                        <span className="text-gray-500">Ablation Zone:</span>
                        <span className="ml-2 font-medium">{selectedProcedure.parameters.ablationZone} mm</span>
                      </div>
                    )}
                    {selectedProcedure.parameters.flapThickness && (
                      <div>
                        <span className="text-gray-500">Flap Thickness:</span>
                        <span className="ml-2 font-medium">{selectedProcedure.parameters.flapThickness} µm</span>
                      </div>
                    )}
                    {selectedProcedure.parameters.flapDiameter && (
                      <div>
                        <span className="text-gray-500">Flap Diameter:</span>
                        <span className="ml-2 font-medium">{selectedProcedure.parameters.flapDiameter} mm</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm ${getPreOpColor(selectedProcedure.preOpStatus)}`}>
                  Pre-Op: {selectedProcedure.preOpStatus}
                </span>
                {selectedProcedure.consentSigned ? (
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    Consent Signed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600 text-sm">
                    <XCircle className="h-4 w-4" />
                    Consent Pending
                  </span>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-between">
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Print
                </button>
                <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedProcedure(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedProcedure.status === 'scheduled' && (
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Start Procedure
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
