'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  Search, 
  Filter,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Plus,
  Edit,
  Eye,
  Activity,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Droplet,
  ThermometerSun,
  Bug,
  Hand,
  Syringe,
  Building,
  RefreshCw,
  Target
} from 'lucide-react';

// Types
interface InfectionCase {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  ward: string;
  bed: string;
  admissionDate: string;
  infectionType: 'hai' | 'community' | 'device-related' | 'surgical-site' | 'other';
  infectionCategory: 'respiratory' | 'urinary' | 'bloodstream' | 'surgical' | 'skin' | 'gastrointestinal' | 'other';
  organism?: string;
  detectionDate: string;
  status: 'suspected' | 'confirmed' | 'resolved' | 'monitoring';
  isolationRequired: boolean;
  isolationType?: 'contact' | 'droplet' | 'airborne' | 'standard';
  antibioticResistance?: string[];
  assignedTo: string;
  notes: string;
}

interface HygieneCompliance {
  id: string;
  department: string;
  month: string;
  handHygieneRate: number;
  ppeCompliance: number;
  surfaceDisinfection: number;
  wasteDisposal: number;
  overallScore: number;
  observations: number;
  violations: number;
}

interface OutbreakAlert {
  id: string;
  alertDate: string;
  infectionType: string;
  affectedArea: string;
  casesCount: number;
  status: 'active' | 'contained' | 'resolved';
  severity: 'low' | 'medium' | 'high' | 'critical';
  responseTeam: string[];
  lastUpdate: string;
}

// Mock Data
const mockInfectionCases: InfectionCase[] = [
  {
    id: 'INF001',
    patientId: 'PAT1001',
    patientName: 'Rajendra Prasad',
    mrn: 'MRN-2026-1001',
    ward: 'General Ward A',
    bed: 'A-12',
    admissionDate: '2026-01-10',
    infectionType: 'hai',
    infectionCategory: 'urinary',
    organism: 'E. coli',
    detectionDate: '2026-01-15',
    status: 'confirmed',
    isolationRequired: false,
    isolationType: 'standard',
    assignedTo: 'Dr. Sunil Reddy',
    notes: 'Catheter-associated UTI. Antibiotic therapy initiated.'
  },
  {
    id: 'INF002',
    patientId: 'PAT1015',
    patientName: 'Lakshmi Devi',
    mrn: 'MRN-2026-1015',
    ward: 'ICU',
    bed: 'ICU-3',
    admissionDate: '2026-01-08',
    infectionType: 'device-related',
    infectionCategory: 'bloodstream',
    organism: 'MRSA',
    detectionDate: '2026-01-14',
    status: 'confirmed',
    isolationRequired: true,
    isolationType: 'contact',
    antibioticResistance: ['Methicillin', 'Penicillin'],
    assignedTo: 'Dr. Priya Sharma',
    notes: 'Central line associated BSI. Contact precautions implemented. Vancomycin started.'
  },
  {
    id: 'INF003',
    patientId: 'PAT1022',
    patientName: 'Mohammad Ali',
    mrn: 'MRN-2026-1022',
    ward: 'Surgical Ward',
    bed: 'S-8',
    admissionDate: '2026-01-12',
    infectionType: 'surgical-site',
    infectionCategory: 'surgical',
    organism: 'Staphylococcus aureus',
    detectionDate: '2026-01-18',
    status: 'monitoring',
    isolationRequired: false,
    assignedTo: 'Dr. Vikram Singh',
    notes: 'Post-operative wound infection. Wound culture sent. Empirical antibiotics started.'
  },
  {
    id: 'INF004',
    patientId: 'PAT1030',
    patientName: 'Kamala Sharma',
    mrn: 'MRN-2026-1030',
    ward: 'General Ward B',
    bed: 'B-5',
    admissionDate: '2026-01-05',
    infectionType: 'community',
    infectionCategory: 'respiratory',
    organism: 'Influenza A',
    detectionDate: '2026-01-06',
    status: 'resolved',
    isolationRequired: true,
    isolationType: 'droplet',
    assignedTo: 'Dr. Meera Nair',
    notes: 'Community-acquired influenza. Resolved after oseltamivir treatment.'
  }
];

const mockHygieneCompliance: HygieneCompliance[] = [
  { id: 'HC001', department: 'ICU', month: '2026-01', handHygieneRate: 92, ppeCompliance: 95, surfaceDisinfection: 88, wasteDisposal: 94, overallScore: 92, observations: 150, violations: 12 },
  { id: 'HC002', department: 'OT', month: '2026-01', handHygieneRate: 98, ppeCompliance: 99, surfaceDisinfection: 96, wasteDisposal: 98, overallScore: 98, observations: 120, violations: 2 },
  { id: 'HC003', department: 'General Ward', month: '2026-01', handHygieneRate: 78, ppeCompliance: 82, surfaceDisinfection: 75, wasteDisposal: 85, overallScore: 80, observations: 200, violations: 40 },
  { id: 'HC004', department: 'Emergency', month: '2026-01', handHygieneRate: 72, ppeCompliance: 80, surfaceDisinfection: 70, wasteDisposal: 82, overallScore: 76, observations: 180, violations: 43 },
  { id: 'HC005', department: 'OPD', month: '2026-01', handHygieneRate: 85, ppeCompliance: 88, surfaceDisinfection: 82, wasteDisposal: 90, overallScore: 86, observations: 250, violations: 35 }
];

const mockOutbreakAlerts: OutbreakAlert[] = [
  {
    id: 'OB001',
    alertDate: '2026-01-15',
    infectionType: 'Norovirus',
    affectedArea: 'General Ward B',
    casesCount: 5,
    status: 'active',
    severity: 'medium',
    responseTeam: ['Dr. Sunil Reddy', 'Infection Control Nurse', 'Ward In-charge'],
    lastUpdate: '2026-01-18'
  }
];

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
    'suspected': 'bg-yellow-100 text-yellow-800',
    'confirmed': 'bg-red-100 text-red-800',
    'resolved': 'bg-green-100 text-green-800',
    'monitoring': 'bg-blue-100 text-blue-800',
    'active': 'bg-red-100 text-red-800',
    'contained': 'bg-yellow-100 text-yellow-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    'low': 'bg-green-100 text-green-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-orange-100 text-orange-800',
    'critical': 'bg-red-100 text-red-800'
  };
  return colors[severity] || 'bg-gray-100 text-gray-800';
};

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-yellow-600';
  return 'text-red-600';
};

const getIsolationTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'contact': 'bg-orange-100 text-orange-800',
    'droplet': 'bg-blue-100 text-blue-800',
    'airborne': 'bg-purple-100 text-purple-800',
    'standard': 'bg-gray-100 text-gray-800'
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

export default function InfectionControlDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'cases' | 'hygiene' | 'outbreaks'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);

  // Stats
  const activeCases = mockInfectionCases.filter(c => c.status !== 'resolved').length;
  const isolatedPatients = mockInfectionCases.filter(c => c.isolationRequired && c.status !== 'resolved').length;
  const avgHygieneScore = Math.round(mockHygieneCompliance.reduce((sum, h) => sum + h.overallScore, 0) / mockHygieneCompliance.length);
  const activeOutbreaks = mockOutbreakAlerts.filter(o => o.status === 'active').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-7 w-7 text-green-600" />
            Infection Control Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor hospital-acquired infections, hygiene compliance, and outbreak management
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewCaseModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Report Infection
          </button>
          <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {activeOutbreaks > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-4">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-800">Active Outbreak Alert</h3>
            <p className="text-sm text-red-700">
              {mockOutbreakAlerts[0].infectionType} outbreak in {mockOutbreakAlerts[0].affectedArea} - {mockOutbreakAlerts[0].casesCount} cases reported
            </p>
          </div>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            View Details
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Infections</p>
              <p className="text-2xl font-bold text-red-600">{activeCases}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Bug className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">+2 this week</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Isolated Patients</p>
              <p className="text-2xl font-bold text-orange-600">{isolatedPatients}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Shield className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Contact/Droplet precautions</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Hand Hygiene Rate</p>
              <p className={`text-2xl font-bold ${getScoreColor(avgHygieneScore)}`}>{avgHygieneScore}%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Hand className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +3% from last month
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">HAI Rate</p>
              <p className="text-2xl font-bold text-purple-600">2.4%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <TrendingDown className="h-3 w-3" /> Below national avg (3.2%)
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Outbreaks</p>
              <p className={`text-2xl font-bold ${activeOutbreaks > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {activeOutbreaks}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${activeOutbreaks > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
              <AlertTriangle className={`h-6 w-6 ${activeOutbreaks > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'cases', label: 'Infection Cases', count: mockInfectionCases.length },
              { id: 'hygiene', label: 'Hygiene Compliance', count: null },
              { id: 'outbreaks', label: 'Outbreak Management', count: activeOutbreaks }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== null && tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Infection Types Distribution */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Infections by Category</h3>
                <div className="space-y-3">
                  {[
                    { category: 'Urinary Tract (UTI)', count: 12, percentage: 35, color: 'bg-blue-500' },
                    { category: 'Bloodstream (BSI)', count: 8, percentage: 24, color: 'bg-red-500' },
                    { category: 'Surgical Site (SSI)', count: 6, percentage: 18, color: 'bg-orange-500' },
                    { category: 'Respiratory', count: 5, percentage: 15, color: 'bg-purple-500' },
                    { category: 'Other', count: 3, percentage: 8, color: 'bg-gray-500' }
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{item.category}</span>
                        <span className="font-medium">{item.count} ({item.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${item.color}`} style={{width: `${item.percentage}%`}}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Department-wise HAI Rates */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">HAI Rate by Department</h3>
                <div className="space-y-3">
                  {[
                    { dept: 'ICU', rate: 4.2, benchmark: 3.5, status: 'above' },
                    { dept: 'Surgical Ward', rate: 2.8, benchmark: 3.0, status: 'below' },
                    { dept: 'General Ward', rate: 1.5, benchmark: 2.0, status: 'below' },
                    { dept: 'NICU', rate: 2.1, benchmark: 2.5, status: 'below' },
                    { dept: 'Emergency', rate: 1.8, benchmark: 2.0, status: 'below' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-gray-700 font-medium">{item.dept}</span>
                      <div className="flex items-center gap-4">
                        <span className={`font-bold ${item.status === 'above' ? 'text-red-600' : 'text-green-600'}`}>
                          {item.rate}%
                        </span>
                        <span className="text-xs text-gray-500">(Target: {item.benchmark}%)</span>
                        {item.status === 'above' ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Infections */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Recent Infections</h3>
                <div className="space-y-3">
                  {mockInfectionCases.slice(0, 4).map(c => (
                    <div key={c.id} className="flex items-center justify-between p-2 border border-gray-100 rounded">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded ${c.isolationRequired ? 'bg-orange-100' : 'bg-gray-100'}`}>
                          <Bug className={`h-4 w-4 ${c.isolationRequired ? 'text-orange-600' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{c.patientName}</p>
                          <p className="text-xs text-gray-500">{c.ward} • {c.organism || 'Pending culture'}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(c.status)}`}>
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hygiene Compliance Summary */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Hygiene Compliance Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Hand className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className={`text-2xl font-bold ${getScoreColor(86)}`}>86%</p>
                    <p className="text-xs text-gray-500">Hand Hygiene</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className={`text-2xl font-bold ${getScoreColor(89)}`}>89%</p>
                    <p className="text-xs text-gray-500">PPE Compliance</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Droplet className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className={`text-2xl font-bold ${getScoreColor(82)}`}>82%</p>
                    <p className="text-xs text-gray-500">Surface Disinfection</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <RefreshCw className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className={`text-2xl font-bold ${getScoreColor(90)}`}>90%</p>
                    <p className="text-xs text-gray-500">Waste Disposal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Infection Cases Tab */}
        {activeTab === 'cases' && (
          <div className="p-6">
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by patient name, MRN, or ward..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="all">All Status</option>
                <option value="suspected">Suspected</option>
                <option value="confirmed">Confirmed</option>
                <option value="monitoring">Monitoring</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="space-y-3">
              {mockInfectionCases
                .filter(c => {
                  const matchesSearch = 
                    c.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.ward.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
                  return matchesSearch && matchesStatus;
                })
                .map(caseItem => (
                  <div key={caseItem.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpandedCase(expandedCase === caseItem.id ? null : caseItem.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${caseItem.isolationRequired ? 'bg-orange-100' : 'bg-gray-100'}`}>
                            <Bug className={`h-5 w-5 ${caseItem.isolationRequired ? 'text-orange-600' : 'text-gray-600'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{caseItem.patientName}</span>
                              <span className="text-sm text-gray-500">({caseItem.mrn})</span>
                              {caseItem.isolationRequired && (
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getIsolationTypeColor(caseItem.isolationType!)}`}>
                                  {caseItem.isolationType} precautions
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{caseItem.ward} • Bed {caseItem.bed} • {caseItem.organism || 'Culture pending'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(caseItem.status)}`}>
                            {caseItem.status}
                          </span>
                          <span className="text-sm text-gray-500">{formatDate(caseItem.detectionDate)}</span>
                          {expandedCase === caseItem.id ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {expandedCase === caseItem.id && (
                      <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2 text-sm">
                            <h4 className="font-medium text-gray-800">Case Details</h4>
                            <div className="flex justify-between"><span className="text-gray-500">Infection Type:</span><span className="capitalize">{caseItem.infectionType.replace('-', ' ')}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Category:</span><span className="capitalize">{caseItem.infectionCategory}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Admission Date:</span><span>{formatDate(caseItem.admissionDate)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Detection Date:</span><span>{formatDate(caseItem.detectionDate)}</span></div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <h4 className="font-medium text-gray-800">Clinical Info</h4>
                            <div className="flex justify-between"><span className="text-gray-500">Organism:</span><span>{caseItem.organism || 'Pending'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Assigned To:</span><span>{caseItem.assignedTo}</span></div>
                            {caseItem.antibioticResistance && (
                              <div><span className="text-gray-500">Resistance:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {caseItem.antibioticResistance.map((r, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">{r}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2 text-sm">
                            <h4 className="font-medium text-gray-800">Notes</h4>
                            <p className="text-gray-600">{caseItem.notes}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">Update Status</button>
                          <button className="px-3 py-1.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50">Add Notes</button>
                          <button className="px-3 py-1.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50">View Timeline</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Hygiene Compliance Tab */}
        {activeTab === 'hygiene' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Department-wise Hygiene Compliance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Hand Hygiene</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">PPE</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Surface</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Waste</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Overall</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Violations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockHygieneCompliance.map(h => (
                    <tr key={h.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{h.department}</td>
                      <td className={`px-4 py-3 text-center font-bold ${getScoreColor(h.handHygieneRate)}`}>{h.handHygieneRate}%</td>
                      <td className={`px-4 py-3 text-center font-bold ${getScoreColor(h.ppeCompliance)}`}>{h.ppeCompliance}%</td>
                      <td className={`px-4 py-3 text-center font-bold ${getScoreColor(h.surfaceDisinfection)}`}>{h.surfaceDisinfection}%</td>
                      <td className={`px-4 py-3 text-center font-bold ${getScoreColor(h.wasteDisposal)}`}>{h.wasteDisposal}%</td>
                      <td className={`px-4 py-3 text-center font-bold ${getScoreColor(h.overallScore)}`}>{h.overallScore}%</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${h.violations > 30 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                          {h.violations}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Outbreaks Tab */}
        {activeTab === 'outbreaks' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Outbreak Management</h3>
            {mockOutbreakAlerts.length > 0 ? (
              <div className="space-y-4">
                {mockOutbreakAlerts.map(outbreak => (
                  <div key={outbreak.id} className={`border rounded-lg p-4 ${outbreak.status === 'active' ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`h-6 w-6 ${outbreak.status === 'active' ? 'text-red-600' : 'text-gray-600'}`} />
                        <div>
                          <h4 className="font-semibold text-gray-900">{outbreak.infectionType} Outbreak</h4>
                          <p className="text-sm text-gray-600">{outbreak.affectedArea}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(outbreak.severity)}`}>
                          {outbreak.severity} severity
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(outbreak.status)}`}>
                          {outbreak.status}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div><span className="text-gray-500">Alert Date:</span> <span className="font-medium">{formatDate(outbreak.alertDate)}</span></div>
                      <div><span className="text-gray-500">Cases:</span> <span className="font-bold text-red-600">{outbreak.casesCount}</span></div>
                      <div><span className="text-gray-500">Last Update:</span> <span className="font-medium">{formatDate(outbreak.lastUpdate)}</span></div>
                      <div><span className="text-gray-500">Response Team:</span> <span className="font-medium">{outbreak.responseTeam.length} members</span></div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">Update Status</button>
                      <button className="px-3 py-1.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50">Add Case</button>
                      <button className="px-3 py-1.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50">View Timeline</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-800">No Active Outbreaks</h3>
                <p className="text-gray-500 mt-2">All outbreak situations are currently contained or resolved.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Case Modal */}
      {showNewCaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Report New Infection</h2>
                <button onClick={() => setShowNewCaseModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                    <option value="">Select Patient</option>
                    <option value="PAT1001">Rajendra Prasad (MRN-2026-1001)</option>
                    <option value="PAT1015">Lakshmi Devi (MRN-2026-1015)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Detection Date</label>
                  <input type="date" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Infection Type</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                    <option value="hai">Hospital Acquired (HAI)</option>
                    <option value="community">Community Acquired</option>
                    <option value="device-related">Device Related</option>
                    <option value="surgical-site">Surgical Site</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                    <option value="respiratory">Respiratory</option>
                    <option value="urinary">Urinary Tract</option>
                    <option value="bloodstream">Bloodstream</option>
                    <option value="surgical">Surgical</option>
                    <option value="skin">Skin/Soft Tissue</option>
                    <option value="gastrointestinal">Gastrointestinal</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organism (if known)</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="e.g., E. coli, MRSA" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                    <option value="">Select Doctor</option>
                    <option value="dr1">Dr. Sunil Reddy</option>
                    <option value="dr2">Dr. Priya Sharma</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isolation" className="rounded" />
                  <label htmlFor="isolation" className="text-sm text-gray-700">Isolation Required</label>
                </div>
                <select className="px-4 py-2 border border-gray-200 rounded-lg">
                  <option value="standard">Standard Precautions</option>
                  <option value="contact">Contact Precautions</option>
                  <option value="droplet">Droplet Precautions</option>
                  <option value="airborne">Airborne Precautions</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Notes</label>
                <textarea rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="Add clinical details..." />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setShowNewCaseModal(false)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Report Infection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
