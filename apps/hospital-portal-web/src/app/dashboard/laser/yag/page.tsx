'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  Eye, 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  User, 
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Activity,
  TrendingUp,
  ArrowLeft,
  Printer,
  Download,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Settings,
  Target,
  BarChart3,
  Info
} from 'lucide-react';

// Types
interface YAGProcedure {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  age: number;
  gender: 'Male' | 'Female';
  procedureType: 'capsulotomy' | 'peripheral-iridotomy' | 'vitreolysis';
  eye: 'OD' | 'OS';
  scheduledDate: string;
  scheduledTime: string;
  surgeon: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  indication: string;
  preOpVA?: string;
  postOpVA?: string;
  parameters?: YAGParameters;
  outcome?: 'success' | 'partial' | 'complication';
  complications?: string;
  followUpDate?: string;
  notes?: string;
}

interface YAGParameters {
  energy: number;
  totalPulses: number;
  totalEnergy: number;
  capsulotomySize?: number;
  iridotomySize?: number;
  spotSize?: number;
}

interface YAGStats {
  todayProcedures: number;
  weekProcedures: number;
  monthProcedures: number;
  capsulotomies: number;
  iridotomies: number;
  successRate: number;
  avgEnergy: number;
}

// Mock Data
const mockProcedures: YAGProcedure[] = [
  {
    id: 'YAG001',
    patientId: 'P3001',
    patientName: 'Ramesh Sharma',
    mrn: 'MRN-2024-3001',
    age: 68,
    gender: 'Male',
    procedureType: 'capsulotomy',
    eye: 'OD',
    scheduledDate: '2026-01-28',
    scheduledTime: '09:30',
    surgeon: 'Dr. Amit Verma',
    status: 'completed',
    indication: 'Posterior capsule opacification (PCO) - 2 years post phaco',
    preOpVA: '6/18',
    postOpVA: '6/9',
    parameters: {
      energy: 1.8,
      totalPulses: 42,
      totalEnergy: 75.6,
      capsulotomySize: 4.5
    },
    outcome: 'success',
    followUpDate: '2026-02-04',
    notes: 'Clean cruciate capsulotomy, no vitreous floaters noted'
  },
  {
    id: 'YAG002',
    patientId: 'P3002',
    patientName: 'Sunita Devi',
    mrn: 'MRN-2024-3002',
    age: 72,
    gender: 'Female',
    procedureType: 'capsulotomy',
    eye: 'OS',
    scheduledDate: '2026-01-28',
    scheduledTime: '10:00',
    surgeon: 'Dr. Amit Verma',
    status: 'in-progress',
    indication: 'PCO - significant visual symptoms',
    preOpVA: '6/24'
  },
  {
    id: 'YAG003',
    patientId: 'P3003',
    patientName: 'Gopal Reddy',
    mrn: 'MRN-2024-3003',
    age: 58,
    gender: 'Male',
    procedureType: 'peripheral-iridotomy',
    eye: 'OU',
    scheduledDate: '2026-01-28',
    scheduledTime: '11:00',
    surgeon: 'Dr. Kavita Singh',
    status: 'scheduled',
    indication: 'Narrow angles - prophylactic PI',
    notes: 'Bilateral procedure planned, start with OD'
  },
  {
    id: 'YAG004',
    patientId: 'P3004',
    patientName: 'Kamala Prasad',
    mrn: 'MRN-2024-3004',
    age: 65,
    gender: 'Female',
    procedureType: 'peripheral-iridotomy',
    eye: 'OD',
    scheduledDate: '2026-01-28',
    scheduledTime: '14:00',
    surgeon: 'Dr. Kavita Singh',
    status: 'completed',
    indication: 'Acute angle closure - fellow eye',
    preOpVA: '6/12',
    postOpVA: '6/12',
    parameters: {
      energy: 4.5,
      totalPulses: 8,
      totalEnergy: 36.0,
      iridotomySize: 0.3
    },
    outcome: 'success',
    followUpDate: '2026-02-11',
    notes: 'Patent iridotomy at 11 o\'clock, good transillumination'
  },
  {
    id: 'YAG005',
    patientId: 'P3005',
    patientName: 'Venkat Rao',
    mrn: 'MRN-2024-3005',
    age: 70,
    gender: 'Male',
    procedureType: 'capsulotomy',
    eye: 'OS',
    scheduledDate: '2026-01-28',
    scheduledTime: '15:00',
    surgeon: 'Dr. Amit Verma',
    status: 'scheduled',
    indication: 'Dense PCO with fibrosis',
    preOpVA: '6/36',
    notes: 'May require higher energy due to fibrotic PCO'
  },
  {
    id: 'YAG006',
    patientId: 'P3006',
    patientName: 'Meenakshi Iyer',
    mrn: 'MRN-2024-3006',
    age: 55,
    gender: 'Female',
    procedureType: 'vitreolysis',
    eye: 'OD',
    scheduledDate: '2026-01-29',
    scheduledTime: '09:00',
    surgeon: 'Dr. Ravi Menon',
    status: 'scheduled',
    indication: 'Symptomatic vitreous floater - Weiss ring',
    notes: 'Large floater central, significantly affecting vision'
  }
];

const mockStats: YAGStats = {
  todayProcedures: 5,
  weekProcedures: 22,
  monthProcedures: 85,
  capsulotomies: 58,
  iridotomies: 25,
  successRate: 98.8,
  avgEnergy: 1.6
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
    'cancelled': 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getProcedureTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'capsulotomy': 'YAG Capsulotomy',
    'peripheral-iridotomy': 'YAG Peripheral Iridotomy',
    'vitreolysis': 'YAG Vitreolysis'
  };
  return labels[type] || type;
};

const getOutcomeColor = (outcome?: string) => {
  const colors: Record<string, string> = {
    'success': 'bg-green-100 text-green-800',
    'partial': 'bg-yellow-100 text-yellow-800',
    'complication': 'bg-red-100 text-red-800'
  };
  return outcome ? colors[outcome] : 'bg-gray-100 text-gray-800';
};

export default function YAGModulePage() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'parameters' | 'outcomes'>('schedule');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedProcedure, setSelectedProcedure] = useState<YAGProcedure | null>(null);
  const [showNewProcedureModal, setShowNewProcedureModal] = useState(false);
  const [expandedProcedure, setExpandedProcedure] = useState<string | null>(null);

  // Filter procedures
  const filteredProcedures = mockProcedures.filter(proc => {
    const matchesSearch = 
      proc.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proc.mrn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || proc.procedureType === filterType;
    const matchesStatus = filterStatus === 'all' || proc.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <a 
            href="/dashboard/laser"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </a>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="h-7 w-7 text-yellow-600" />
              YAG Laser Module
            </h1>
            <p className="text-gray-600 mt-1">
              Capsulotomy, Peripheral Iridotomy, and Vitreolysis procedures
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewProcedureModal(true)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New YAG Procedure
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.todayProcedures}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
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
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Capsulotomies</p>
              <p className="text-2xl font-bold text-yellow-600">{mockStats.capsulotomies}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Eye className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Iridotomies</p>
              <p className="text-2xl font-bold text-blue-600">{mockStats.iridotomies}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
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
              <p className="text-sm text-gray-500">Avg Energy</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.avgEnergy} mJ</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Zap className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'schedule', label: 'Procedure Schedule', icon: Calendar },
              { id: 'parameters', label: 'Parameter Guide', icon: Settings },
              { id: 'outcomes', label: 'Outcomes Analysis', icon: BarChart3 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-yellow-500 text-yellow-600'
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
                    placeholder="Search patient, MRN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
              >
                <option value="all">All Procedures</option>
                <option value="capsulotomy">Capsulotomy</option>
                <option value="peripheral-iridotomy">Peripheral Iridotomy</option>
                <option value="vitreolysis">Vitreolysis</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Procedure List */}
            <div className="space-y-3">
              {filteredProcedures.map(proc => (
                <div key={proc.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setExpandedProcedure(expandedProcedure === proc.id ? null : proc.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          proc.procedureType === 'capsulotomy' ? 'bg-yellow-100' :
                          proc.procedureType === 'peripheral-iridotomy' ? 'bg-blue-100' :
                          'bg-purple-100'
                        }`}>
                          <Zap className={`h-5 w-5 ${
                            proc.procedureType === 'capsulotomy' ? 'text-yellow-600' :
                            proc.procedureType === 'peripheral-iridotomy' ? 'text-blue-600' :
                            'text-purple-600'
                          }`} />
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
                            {getProcedureTypeLabel(proc.procedureType)} • {proc.eye} • {proc.surgeon}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1 text-gray-500">
                              <Clock className="h-3 w-3" />
                              {proc.scheduledTime}
                            </span>
                            {proc.preOpVA && (
                              <span className="text-gray-500">
                                Pre-Op VA: {proc.preOpVA}
                              </span>
                            )}
                            {proc.postOpVA && (
                              <span className="text-green-600 font-medium">
                                Post-Op VA: {proc.postOpVA}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {proc.status === 'scheduled' && (
                          <button className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700">
                            Start
                          </button>
                        )}
                        {proc.status === 'in-progress' && (
                          <button className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                            Complete
                          </button>
                        )}
                        {proc.outcome && (
                          <span className={`px-2 py-0.5 rounded text-xs ${getOutcomeColor(proc.outcome)}`}>
                            {proc.outcome}
                          </span>
                        )}
                        {expandedProcedure === proc.id ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedProcedure === proc.id && (
                    <div className="p-4 border-t border-gray-200 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-800 mb-3">Procedure Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Indication:</span>
                              <span className="font-medium text-right max-w-xs">{proc.indication}</span>
                            </div>
                            {proc.parameters && (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Energy per pulse:</span>
                                  <span className="font-medium">{proc.parameters.energy} mJ</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Total pulses:</span>
                                  <span className="font-medium">{proc.parameters.totalPulses}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Total energy:</span>
                                  <span className="font-medium">{proc.parameters.totalEnergy} mJ</span>
                                </div>
                                {proc.parameters.capsulotomySize && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Capsulotomy size:</span>
                                    <span className="font-medium">{proc.parameters.capsulotomySize} mm</span>
                                  </div>
                                )}
                                {proc.parameters.iridotomySize && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Iridotomy size:</span>
                                    <span className="font-medium">{proc.parameters.iridotomySize} mm</span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 mb-3">Follow-up</h4>
                          <div className="space-y-2 text-sm">
                            {proc.followUpDate && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Follow-up Date:</span>
                                <span className="font-medium">{formatDate(proc.followUpDate)}</span>
                              </div>
                            )}
                            {proc.notes && (
                              <div>
                                <span className="text-gray-500">Notes:</span>
                                <p className="mt-1 text-gray-700">{proc.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          View Full Report
                        </button>
                        <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-1">
                          <Printer className="h-4 w-4" />
                          Print
                        </button>
                        <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          Export
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Parameters Tab */}
        {activeTab === 'parameters' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">YAG Laser Parameter Guidelines</h3>
              <p className="text-gray-600">Recommended settings for different YAG procedures</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Capsulotomy */}
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Eye className="h-5 w-5 text-yellow-600" />
                  </div>
                  <h4 className="font-semibold text-yellow-800">YAG Capsulotomy</h4>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-yellow-700 font-medium">Energy</p>
                    <p className="text-yellow-600">Start: 1.0-1.5 mJ</p>
                    <p className="text-yellow-600">Max: 3.0 mJ</p>
                  </div>
                  <div>
                    <p className="text-yellow-700 font-medium">Pattern</p>
                    <p className="text-yellow-600">Cruciate or circular</p>
                  </div>
                  <div>
                    <p className="text-yellow-700 font-medium">Size</p>
                    <p className="text-yellow-600">4-5 mm diameter</p>
                  </div>
                  <div>
                    <p className="text-yellow-700 font-medium">Typical Pulses</p>
                    <p className="text-yellow-600">20-50 shots</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    <strong>Tip:</strong> Start posteriorly and work anteriorly. Avoid IOL contact.
                  </p>
                </div>
              </div>

              {/* Peripheral Iridotomy */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-blue-800">Peripheral Iridotomy</h4>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-blue-700 font-medium">Energy</p>
                    <p className="text-blue-600">Start: 3.0-5.0 mJ</p>
                    <p className="text-blue-600">Max: 8.0 mJ</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-medium">Location</p>
                    <p className="text-blue-600">10-11 o'clock or 1-2 o'clock</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-medium">Size</p>
                    <p className="text-blue-600">0.2-0.5 mm (visible transillumination)</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-medium">Typical Pulses</p>
                    <p className="text-blue-600">2-10 shots</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Tip:</strong> Choose iris crypt. Pre-treat with pilocarpine for stretch.
                  </p>
                </div>
              </div>

              {/* Vitreolysis */}
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Activity className="h-5 w-5 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-purple-800">Vitreolysis</h4>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-purple-700 font-medium">Energy</p>
                    <p className="text-purple-600">Start: 3.0-5.0 mJ</p>
                    <p className="text-purple-600">Max: 8.0 mJ</p>
                  </div>
                  <div>
                    <p className="text-purple-700 font-medium">Target</p>
                    <p className="text-purple-600">Weiss ring or dense floaters</p>
                  </div>
                  <div>
                    <p className="text-purple-700 font-medium">Distance from Retina</p>
                    <p className="text-purple-600">≥2mm safety margin</p>
                  </div>
                  <div>
                    <p className="text-purple-700 font-medium">Typical Pulses</p>
                    <p className="text-purple-600">100-500+ shots</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                  <p className="text-xs text-purple-800">
                    <strong>Tip:</strong> Requires specialized contact lens. Multiple sessions may be needed.
                  </p>
                </div>
              </div>
            </div>

            {/* Complications & Management */}
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Potential Complications & Management</h4>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-red-700">
                    <div>
                      <p className="font-medium">IOP Spike</p>
                      <p>Monitor 1-hour post-procedure, consider prophylactic drops</p>
                    </div>
                    <div>
                      <p className="font-medium">IOL Pitting</p>
                      <p>Focus carefully, start posteriorly</p>
                    </div>
                    <div>
                      <p className="font-medium">Vitreous Floaters</p>
                      <p>Usually transient, warn patient preoperatively</p>
                    </div>
                    <div>
                      <p className="font-medium">CME (rare)</p>
                      <p>Use NSAIDs post-operatively if concerned</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Outcomes Tab */}
        {activeTab === 'outcomes' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Visual Outcomes */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Visual Acuity Outcomes (Capsulotomy)</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Improved ≥2 lines</span>
                    <span className="font-semibold text-green-600">92%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Improved 1 line</span>
                    <span className="font-semibold text-blue-600">5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">No change</span>
                    <span className="font-semibold text-yellow-600">2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Worse</span>
                    <span className="font-semibold text-red-600">1%</span>
                  </div>
                </div>
              </div>

              {/* Iridotomy Outcomes */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Peripheral Iridotomy Outcomes</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Patent at 1 month</span>
                    <span className="font-semibold text-green-600">98%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Angle opened</span>
                    <span className="font-semibold text-green-600">95%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Required repeat</span>
                    <span className="font-semibold text-yellow-600">3%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Dysphotopsia</span>
                    <span className="font-semibold text-yellow-600">5%</span>
                  </div>
                </div>
              </div>

              {/* Complications Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Complications (This Month)</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">IOP spike &gt;30mmHg</span>
                    <span className="font-semibold">2 cases (2.4%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">IOL pitting</span>
                    <span className="font-semibold">0 cases (0%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Bleeding</span>
                    <span className="font-semibold">1 case (1.2%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">CME</span>
                    <span className="font-semibold">0 cases (0%)</span>
                  </div>
                </div>
              </div>

              {/* Surgeon Stats */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">By Surgeon</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Dr. Amit Verma', procedures: 38, success: 100 },
                    { name: 'Dr. Kavita Singh', procedures: 25, success: 96 },
                    { name: 'Dr. Ravi Menon', procedures: 12, success: 100 },
                    { name: 'Dr. Priya Sharma', procedures: 10, success: 100 }
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
            </div>

            {/* Generate Reports */}
            <div className="mt-6 flex gap-3">
              <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Monthly YAG Report
              </button>
              <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Outcomes Analysis
              </button>
              <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Procedure Modal */}
      {showNewProcedureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">New YAG Procedure</h2>
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
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500">
                    <option>Select Patient</option>
                    <option>Ramesh Sharma (MRN-2024-3001)</option>
                    <option>Sunita Devi (MRN-2024-3002)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Procedure Type</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500">
                    <option value="capsulotomy">YAG Capsulotomy</option>
                    <option value="peripheral-iridotomy">Peripheral Iridotomy</option>
                    <option value="vitreolysis">Vitreolysis</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Eye</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500">
                    <option value="OD">OD (Right)</option>
                    <option value="OS">OS (Left)</option>
                    <option value="OU">OU (Both)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    defaultValue="2026-01-28"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surgeon</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500">
                    <option>Select Surgeon</option>
                    <option>Dr. Amit Verma</option>
                    <option>Dr. Kavita Singh</option>
                    <option>Dr. Ravi Menon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pre-Op VA</label>
                  <input
                    type="text"
                    placeholder="e.g., 6/18"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Indication</label>
                <textarea
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  placeholder="e.g., PCO 2 years post phaco, visually significant"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">Pre-Procedure Checklist</p>
                    <ul className="mt-1 space-y-1">
                      <li>• Verify informed consent is signed</li>
                      <li>• Check IOP baseline</li>
                      <li>• Dilate pupil (for capsulotomy)</li>
                      <li>• Apply apraclonidine 1% if needed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowNewProcedureModal(false)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                Schedule Procedure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
