'use client';

import React, { useState } from 'react';
import { 
  Target, 
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
  AlertCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  Activity,
  TrendingUp,
  Ruler,
  Layers,
  Shield,
  Info,
  ArrowLeft,
  Printer,
  Download,
  ThumbsUp,
  ThumbsDown,
  HelpCircle
} from 'lucide-react';

// Types
interface ScreeningPatient {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  age: number;
  gender: 'Male' | 'Female';
  phone: string;
  screeningDate: string;
  referredBy: string;
  status: 'pending' | 'in-progress' | 'completed' | 'deferred';
  candidacy?: 'excellent' | 'good' | 'marginal' | 'not-suitable';
  procedureRecommended?: 'lasik' | 'prk' | 'smile' | 'icl' | 'none';
  notes?: string;
}

interface ScreeningResult {
  patientId: string;
  // Refraction
  sphereOD: number;
  sphereOS: number;
  cylinderOD: number;
  cylinderOS: number;
  axisOD: number;
  axisOS: number;
  // Keratometry
  k1OD: number;
  k2OD: number;
  k1OS: number;
  k2OS: number;
  // Pachymetry
  cctOD: number;
  cctOS: number;
  // Topography
  topographyStatus: 'normal' | 'suspicious' | 'abnormal';
  keratoconusSuspect: boolean;
  // Pupil
  scotopicPupilOD: number;
  scotopicPupilOS: number;
  // Other
  tearFilm: 'normal' | 'dry' | 'very-dry';
  dominantEye: 'OD' | 'OS';
  occupation: string;
  lifestyle: string;
  expectations: string;
}

interface CandidacyCriteria {
  name: string;
  status: 'pass' | 'caution' | 'fail';
  value: string;
  threshold: string;
  notes?: string;
}

interface ScreeningStats {
  totalScreenings: number;
  pendingScreenings: number;
  completedToday: number;
  suitableCandidates: number;
  notSuitable: number;
  scheduledProcedures: number;
}

// Mock Data
const mockPatients: ScreeningPatient[] = [
  {
    id: 'SC001',
    patientId: 'P2001',
    patientName: 'Arjun Mehta',
    mrn: 'MRN-2024-2001',
    age: 26,
    gender: 'Male',
    phone: '+91 98765 43210',
    screeningDate: '2026-01-28',
    referredBy: 'Dr. Priya Sharma',
    status: 'completed',
    candidacy: 'excellent',
    procedureRecommended: 'lasik',
    notes: 'Ideal candidate, stable refraction for 2 years'
  },
  {
    id: 'SC002',
    patientId: 'P2002',
    patientName: 'Neha Kapoor',
    mrn: 'MRN-2024-2002',
    age: 32,
    gender: 'Female',
    phone: '+91 98765 43211',
    screeningDate: '2026-01-28',
    referredBy: 'Self',
    status: 'completed',
    candidacy: 'good',
    procedureRecommended: 'prk',
    notes: 'Thin corneas, PRK preferred over LASIK'
  },
  {
    id: 'SC003',
    patientId: 'P2003',
    patientName: 'Rahul Joshi',
    mrn: 'MRN-2024-2003',
    age: 24,
    gender: 'Male',
    phone: '+91 98765 43212',
    screeningDate: '2026-01-28',
    referredBy: 'Dr. Amit Verma',
    status: 'in-progress',
    notes: 'Awaiting topography results'
  },
  {
    id: 'SC004',
    patientId: 'P2004',
    patientName: 'Priyanka Singh',
    mrn: 'MRN-2024-2004',
    age: 28,
    gender: 'Female',
    phone: '+91 98765 43213',
    screeningDate: '2026-01-28',
    referredBy: 'Dr. Kavita Singh',
    status: 'pending'
  },
  {
    id: 'SC005',
    patientId: 'P2005',
    patientName: 'Vikram Malhotra',
    mrn: 'MRN-2024-2005',
    age: 42,
    gender: 'Male',
    phone: '+91 98765 43214',
    screeningDate: '2026-01-28',
    referredBy: 'Self',
    status: 'completed',
    candidacy: 'not-suitable',
    procedureRecommended: 'none',
    notes: 'Early presbyopia, not suitable for standard LASIK. Consider monovision or ICL.'
  },
  {
    id: 'SC006',
    patientId: 'P2006',
    patientName: 'Ananya Reddy',
    mrn: 'MRN-2024-2006',
    age: 22,
    gender: 'Female',
    phone: '+91 98765 43215',
    screeningDate: '2026-01-29',
    referredBy: 'Dr. Priya Sharma',
    status: 'pending'
  }
];

const mockScreeningResult: ScreeningResult = {
  patientId: 'P2001',
  sphereOD: -4.50,
  sphereOS: -4.25,
  cylinderOD: -0.75,
  cylinderOS: -1.00,
  axisOD: 180,
  axisOS: 175,
  k1OD: 43.50,
  k2OD: 44.25,
  k1OS: 43.75,
  k2OS: 44.50,
  cctOD: 545,
  cctOS: 542,
  topographyStatus: 'normal',
  keratoconusSuspect: false,
  scotopicPupilOD: 6.2,
  scotopicPupilOS: 6.0,
  tearFilm: 'normal',
  dominantEye: 'OD',
  occupation: 'Software Engineer',
  lifestyle: 'Indoor work, occasional sports',
  expectations: 'Freedom from glasses for daily activities'
};

const mockStats: ScreeningStats = {
  totalScreenings: 245,
  pendingScreenings: 12,
  completedToday: 8,
  suitableCandidates: 198,
  notSuitable: 47,
  scheduledProcedures: 156
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
    'pending': 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'deferred': 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getCandidacyColor = (candidacy?: string) => {
  const colors: Record<string, string> = {
    'excellent': 'bg-green-100 text-green-800 border-green-200',
    'good': 'bg-blue-100 text-blue-800 border-blue-200',
    'marginal': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'not-suitable': 'bg-red-100 text-red-800 border-red-200'
  };
  return candidacy ? colors[candidacy] : 'bg-gray-100 text-gray-800 border-gray-200';
};

const getCriteriaIcon = (status: string) => {
  switch (status) {
    case 'pass': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case 'caution': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    case 'fail': return <XCircle className="h-5 w-5 text-red-600" />;
    default: return <HelpCircle className="h-5 w-5 text-gray-400" />;
  }
};

// Sample candidacy criteria
const getCandidacyCriteria = (result: ScreeningResult): CandidacyCriteria[] => [
  {
    name: 'Age',
    status: 'pass',
    value: '26 years',
    threshold: '≥18 years',
    notes: 'Age within acceptable range'
  },
  {
    name: 'Refraction Stability',
    status: 'pass',
    value: 'Stable 2+ years',
    threshold: 'Stable ≥1 year',
    notes: 'No significant change in last 2 years'
  },
  {
    name: 'Myopia Range',
    status: 'pass',
    value: '-4.50 / -4.25 D',
    threshold: 'Up to -10.00 D',
    notes: 'Within treatable range'
  },
  {
    name: 'Astigmatism',
    status: 'pass',
    value: '-0.75 / -1.00 D',
    threshold: 'Up to -5.00 D',
    notes: 'Minimal astigmatism'
  },
  {
    name: 'Central Corneal Thickness',
    status: 'pass',
    value: `${result.cctOD} / ${result.cctOS} µm`,
    threshold: '≥500 µm',
    notes: 'Adequate thickness for ablation'
  },
  {
    name: 'Residual Stromal Bed',
    status: 'pass',
    value: '298 µm (estimated)',
    threshold: '≥250 µm',
    notes: 'Safe residual bed after ablation'
  },
  {
    name: 'Topography',
    status: result.topographyStatus === 'normal' ? 'pass' : result.topographyStatus === 'suspicious' ? 'caution' : 'fail',
    value: result.topographyStatus,
    threshold: 'Normal pattern',
    notes: result.keratoconusSuspect ? 'Keratoconus suspect - further evaluation needed' : 'No ectasia indicators'
  },
  {
    name: 'Scotopic Pupil Size',
    status: result.scotopicPupilOD <= 7 ? 'pass' : 'caution',
    value: `${result.scotopicPupilOD} / ${result.scotopicPupilOS} mm`,
    threshold: '≤7 mm preferred',
    notes: 'Consider larger ablation zone'
  },
  {
    name: 'Tear Film',
    status: result.tearFilm === 'normal' ? 'pass' : result.tearFilm === 'dry' ? 'caution' : 'fail',
    value: result.tearFilm,
    threshold: 'Normal',
    notes: result.tearFilm !== 'normal' ? 'Pre-operative dry eye treatment recommended' : 'Healthy tear film'
  },
  {
    name: 'General Health',
    status: 'pass',
    value: 'No contraindications',
    threshold: 'No autoimmune/healing disorders',
    notes: 'No systemic contraindications identified'
  }
];

export default function LASIKScreeningPage() {
  const [activeTab, setActiveTab] = useState<'patients' | 'criteria' | 'calculator'>('patients');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPatient, setSelectedPatient] = useState<ScreeningPatient | null>(null);
  const [showNewScreeningModal, setShowNewScreeningModal] = useState(false);
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);

  // Filter patients
  const filteredPatients = mockPatients.filter(patient => {
    const matchesSearch = 
      patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.mrn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const candidacyCriteria = getCandidacyCriteria(mockScreeningResult);
  const passCount = candidacyCriteria.filter(c => c.status === 'pass').length;
  const cautionCount = candidacyCriteria.filter(c => c.status === 'caution').length;
  const failCount = candidacyCriteria.filter(c => c.status === 'fail').length;

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
              <Target className="h-7 w-7 text-purple-600" />
              LASIK/PRK Screening
            </h1>
            <p className="text-gray-600 mt-1">
              Candidacy assessment for refractive surgery
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewScreeningModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Screening
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Screenings</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.totalScreenings}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{mockStats.pendingScreenings}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today</p>
              <p className="text-2xl font-bold text-blue-600">{mockStats.completedToday}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Suitable</p>
              <p className="text-2xl font-bold text-green-600">{mockStats.suitableCandidates}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <ThumbsUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Not Suitable</p>
              <p className="text-2xl font-bold text-red-600">{mockStats.notSuitable}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <ThumbsDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.scheduledProcedures}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Activity className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'patients', label: 'Screening Queue', icon: User },
              { id: 'criteria', label: 'Candidacy Criteria', icon: Shield },
              { id: 'calculator', label: 'RSB Calculator', icon: Ruler }
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

        {/* Patients Tab */}
        {activeTab === 'patients' && (
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="deferred">Deferred</option>
              </select>
              <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </button>
            </div>

            {/* Patient List */}
            <div className="space-y-3">
              {filteredPatients.map(patient => (
                <div key={patient.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setExpandedPatient(expandedPatient === patient.id ? null : patient.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          patient.candidacy === 'excellent' || patient.candidacy === 'good' ? 'bg-green-100' :
                          patient.candidacy === 'marginal' ? 'bg-yellow-100' :
                          patient.candidacy === 'not-suitable' ? 'bg-red-100' :
                          'bg-purple-100'
                        }`}>
                          <Target className={`h-5 w-5 ${
                            patient.candidacy === 'excellent' || patient.candidacy === 'good' ? 'text-green-600' :
                            patient.candidacy === 'marginal' ? 'text-yellow-600' :
                            patient.candidacy === 'not-suitable' ? 'text-red-600' :
                            'text-purple-600'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{patient.patientName}</span>
                            <span className="text-sm text-gray-500">({patient.mrn})</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(patient.status)}`}>
                              {patient.status.replace('-', ' ')}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {patient.age}Y / {patient.gender} • {formatDate(patient.screeningDate)} • Ref: {patient.referredBy}
                          </div>
                          {patient.candidacy && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-2 py-1 rounded border text-xs font-medium ${getCandidacyColor(patient.candidacy)}`}>
                                {patient.candidacy.replace('-', ' ').toUpperCase()}
                              </span>
                              {patient.procedureRecommended && patient.procedureRecommended !== 'none' && (
                                <span className="text-sm text-purple-600 font-medium">
                                  → {patient.procedureRecommended.toUpperCase()} recommended
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {patient.status === 'pending' && (
                          <button className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
                            Start Screening
                          </button>
                        )}
                        {patient.status === 'completed' && (
                          <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                            View Report
                          </button>
                        )}
                        {expandedPatient === patient.id ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedPatient === patient.id && (
                    <div className="p-4 border-t border-gray-200 bg-white">
                      {patient.status === 'completed' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-800 mb-3">Screening Summary</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Candidacy:</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCandidacyColor(patient.candidacy)}`}>
                                  {patient.candidacy?.replace('-', ' ').toUpperCase()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Recommended:</span>
                                <span className="font-medium">
                                  {patient.procedureRecommended === 'none' ? 'Not suitable' : patient.procedureRecommended?.toUpperCase()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Screened By:</span>
                                <span className="font-medium">Dr. Priya Sharma</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800 mb-3">Notes</h4>
                            <p className="text-sm text-gray-600">{patient.notes || 'No additional notes'}</p>
                          </div>
                          <div className="md:col-span-2 flex gap-2">
                            <button className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
                              Schedule Procedure
                            </button>
                            <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-1">
                              <Printer className="h-4 w-4" />
                              Print Report
                            </button>
                            <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-1">
                              <Download className="h-4 w-4" />
                              Export
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>Screening not yet completed</p>
                          <button className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                            Start Screening
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Candidacy Criteria Tab */}
        {activeTab === 'criteria' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">LASIK Candidacy Evaluation Criteria</h3>
              <p className="text-gray-600">Standard criteria for assessing refractive surgery candidacy</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">Pass</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{passCount}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-800">Caution</span>
                </div>
                <p className="text-2xl font-bold text-yellow-600">{cautionCount}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-800">Fail</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{failCount}</p>
              </div>
            </div>

            {/* Criteria List */}
            <div className="space-y-3">
              {candidacyCriteria.map((criteria, idx) => (
                <div key={idx} className={`rounded-lg p-4 border ${
                  criteria.status === 'pass' ? 'bg-green-50 border-green-200' :
                  criteria.status === 'caution' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getCriteriaIcon(criteria.status)}
                      <div>
                        <h4 className="font-medium text-gray-900">{criteria.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{criteria.notes}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{criteria.value}</p>
                      <p className="text-xs text-gray-500">Threshold: {criteria.threshold}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reference Guidelines */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Screening Guidelines</h4>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• All criteria marked "Pass" = Excellent candidate</li>
                    <li>• 1-2 "Caution" items = Good candidate with considerations</li>
                    <li>• 3+ "Caution" or any "Fail" = Consider alternative procedures</li>
                    <li>• Always discuss risks and realistic expectations with patient</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RSB Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Residual Stromal Bed Calculator</h3>
              <p className="text-gray-600">Calculate post-LASIK residual stromal bed thickness</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">Input Parameters</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CCT OD (µm)</label>
                    <input
                      type="number"
                      defaultValue={545}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CCT OS (µm)</label>
                    <input
                      type="number"
                      defaultValue={542}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Flap Thickness (µm)</label>
                  <input
                    type="number"
                    defaultValue={110}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Standard femtosecond flap: 100-120 µm</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sphere OD (D)</label>
                    <input
                      type="number"
                      step="0.25"
                      defaultValue={-4.50}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sphere OS (D)</label>
                    <input
                      type="number"
                      step="0.25"
                      defaultValue={-4.25}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cylinder OD (D)</label>
                    <input
                      type="number"
                      step="0.25"
                      defaultValue={-0.75}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cylinder OS (D)</label>
                    <input
                      type="number"
                      step="0.25"
                      defaultValue={-1.00}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Optical Zone (mm)</label>
                  <input
                    type="number"
                    step="0.1"
                    defaultValue={6.5}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Calculate RSB
                </button>
              </div>

              {/* Results Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">Calculated Results</h4>

                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-sm text-gray-500">Ablation Depth OD</p>
                      <p className="text-xl font-bold text-gray-900">67 µm</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-sm text-gray-500">Ablation Depth OS</p>
                      <p className="text-xl font-bold text-gray-900">64 µm</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className={`rounded-lg p-3 border ${545 - 110 - 67 >= 250 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <p className="text-sm text-gray-500">RSB OD</p>
                      <p className={`text-xl font-bold ${545 - 110 - 67 >= 250 ? 'text-green-600' : 'text-red-600'}`}>
                        {545 - 110 - 67} µm
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Min: 250 µm</p>
                    </div>
                    <div className={`rounded-lg p-3 border ${542 - 110 - 64 >= 250 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <p className="text-sm text-gray-500">RSB OS</p>
                      <p className={`text-xl font-bold ${542 - 110 - 64 >= 250 ? 'text-green-600' : 'text-red-600'}`}>
                        {542 - 110 - 64} µm
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Min: 250 µm</p>
                    </div>
                  </div>

                  <div className="bg-green-100 rounded-lg p-4 text-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold text-green-800">Safe for LASIK</p>
                    <p className="text-sm text-green-700 mt-1">Both eyes have adequate RSB (&gt;250 µm)</p>
                  </div>
                </div>

                {/* Formula Reference */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h5 className="font-medium text-blue-800 mb-2">Calculation Formula</h5>
                  <p className="text-sm text-blue-700 font-mono">
                    RSB = CCT - Flap Thickness - Ablation Depth
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    Ablation ≈ (Sphere + Cyl/2) × 13-15 µm per diopter
                  </p>
                </div>

                {/* Warnings */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span>RSB &lt;300 µm: Consider PRK instead of LASIK</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span>RSB &lt;250 µm: LASIK contraindicated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Screening Modal */}
      {showNewScreeningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">New LASIK Screening</h2>
                <button
                  onClick={() => setShowNewScreeningModal(false)}
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
                    <option>Arjun Mehta (MRN-2024-2001)</option>
                    <option>Neha Kapoor (MRN-2024-2002)</option>
                    <option>New Patient...</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Screening Date</label>
                  <input
                    type="date"
                    defaultValue="2026-01-28"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Referred By</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500">
                    <option>Self</option>
                    <option>Dr. Priya Sharma</option>
                    <option>Dr. Amit Verma</option>
                    <option>Dr. Kavita Singh</option>
                    <option>External Referral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Screening Optometrist</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500">
                    <option>Select Optometrist</option>
                    <option>Dr. Sneha Patel</option>
                    <option>Dr. Rahul Verma</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Consultation</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Patient's reason for seeking refractive surgery..."
                />
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-medium text-purple-800 mb-2">Screening Protocol</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-purple-700">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>Uncorrected Visual Acuity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>Manifest Refraction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>Cycloplegic Refraction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>Keratometry</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>Corneal Topography</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>Pachymetry</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>Pupil Assessment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>Tear Film Evaluation</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowNewScreeningModal(false)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Start Screening
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
