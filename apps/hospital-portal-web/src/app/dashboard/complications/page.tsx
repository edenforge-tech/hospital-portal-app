'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  User, 
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Eye,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
  Flag,
  Shield,
  Stethoscope,
  ClipboardList,
  MessageSquare
} from 'lucide-react';

// Types
interface Complication {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  age: number;
  gender: 'Male' | 'Female';
  procedureType: string;
  procedureDate: string;
  eye: 'OD' | 'OS' | 'OU';
  surgeon: string;
  complicationType: 'intraoperative' | 'early-postop' | 'late-postop';
  severity: 'minor' | 'moderate' | 'major' | 'sight-threatening';
  category: string;
  description: string;
  detectedDate: string;
  detectedBy: string;
  status: 'active' | 'resolving' | 'resolved' | 'monitoring';
  management: string;
  outcome?: string;
  rootCause?: string;
  preventable: boolean;
  reportedToRegistry: boolean;
  followUps: ComplicationFollowUp[];
}

interface ComplicationFollowUp {
  date: string;
  clinician: string;
  findings: string;
  vaOD?: string;
  vaOS?: string;
  iop?: number;
  action: string;
}

interface ComplicationStats {
  totalComplications: number;
  activeComplications: number;
  resolvedThisMonth: number;
  sightThreatening: number;
  intraoperativeRate: number;
  overallRate: number;
}

// Mock Data
const mockComplications: Complication[] = [
  {
    id: 'COMP001',
    patientId: 'P4001',
    patientName: 'Ravi Kumar',
    mrn: 'MRN-2024-4001',
    age: 65,
    gender: 'Male',
    procedureType: 'Phacoemulsification + PCIOL',
    procedureDate: '2026-01-20',
    eye: 'OD',
    surgeon: 'Dr. Amit Verma',
    complicationType: 'early-postop',
    severity: 'moderate',
    category: 'Corneal Edema',
    description: 'Persistent corneal edema day 1 post-op, likely due to prolonged ultrasound time',
    detectedDate: '2026-01-21',
    detectedBy: 'Dr. Priya Sharma',
    status: 'resolving',
    management: 'Hypertonic saline 5% QID, increased steroid frequency',
    outcome: 'Cornea clearing, central thickness reducing',
    rootCause: 'Dense nucleus requiring extended phaco time',
    preventable: false,
    reportedToRegistry: true,
    followUps: [
      {
        date: '2026-01-23',
        clinician: 'Dr. Priya Sharma',
        findings: 'Corneal edema reducing, central clarity improving',
        vaOD: '6/36',
        iop: 14,
        action: 'Continue current management, review in 3 days'
      },
      {
        date: '2026-01-26',
        clinician: 'Dr. Amit Verma',
        findings: 'Significant improvement, mild residual edema',
        vaOD: '6/18',
        iop: 16,
        action: 'Taper hypertonic saline, routine follow-up 1 week'
      }
    ]
  },
  {
    id: 'COMP002',
    patientId: 'P4002',
    patientName: 'Lakshmi Narayanan',
    mrn: 'MRN-2024-4002',
    age: 58,
    gender: 'Female',
    procedureType: 'Trabeculectomy',
    procedureDate: '2026-01-15',
    eye: 'OS',
    surgeon: 'Dr. Kavita Singh',
    complicationType: 'early-postop',
    severity: 'moderate',
    category: 'Hypotony',
    description: 'Low IOP (4 mmHg) day 3 post-op with shallow AC',
    detectedDate: '2026-01-18',
    detectedBy: 'Dr. Kavita Singh',
    status: 'resolved',
    management: 'Cycloplegia, compression sutures placed',
    outcome: 'IOP normalized after compression sutures, AC formed',
    rootCause: 'Over-filtration through scleral flap',
    preventable: true,
    reportedToRegistry: true,
    followUps: [
      {
        date: '2026-01-20',
        clinician: 'Dr. Kavita Singh',
        findings: 'IOP 10 mmHg, AC formed, bleb well-formed',
        vaOS: '6/12',
        iop: 10,
        action: 'Continue current drops, monitor closely'
      }
    ]
  },
  {
    id: 'COMP003',
    patientId: 'P4003',
    patientName: 'Gopal Menon',
    mrn: 'MRN-2024-4003',
    age: 70,
    gender: 'Male',
    procedureType: 'Phacoemulsification + PCIOL',
    procedureDate: '2026-01-22',
    eye: 'OS',
    surgeon: 'Dr. Ravi Menon',
    complicationType: 'intraoperative',
    severity: 'major',
    category: 'Posterior Capsule Rupture',
    description: 'PCR with vitreous loss during cortex removal',
    detectedDate: '2026-01-22',
    detectedBy: 'Dr. Ravi Menon',
    status: 'monitoring',
    management: 'Anterior vitrectomy performed, sulcus IOL placed',
    outcome: 'Stable, monitoring for CME',
    rootCause: 'Weak zonules',
    preventable: false,
    reportedToRegistry: true,
    followUps: [
      {
        date: '2026-01-25',
        clinician: 'Dr. Ravi Menon',
        findings: 'Quiet eye, IOL well-centered, no CME on OCT',
        vaOS: '6/18',
        iop: 18,
        action: 'Start NSAID, repeat OCT in 2 weeks'
      }
    ]
  },
  {
    id: 'COMP004',
    patientId: 'P4004',
    patientName: 'Saroja Devi',
    mrn: 'MRN-2024-4004',
    age: 62,
    gender: 'Female',
    procedureType: 'LASIK',
    procedureDate: '2026-01-10',
    eye: 'OD',
    surgeon: 'Dr. Priya Sharma',
    complicationType: 'early-postop',
    severity: 'minor',
    category: 'DLK (Diffuse Lamellar Keratitis)',
    description: 'Grade 2 DLK noted on day 1 post-LASIK',
    detectedDate: '2026-01-11',
    detectedBy: 'Dr. Priya Sharma',
    status: 'resolved',
    management: 'Increased topical steroid to hourly, close monitoring',
    outcome: 'Complete resolution by day 5',
    rootCause: 'Unknown - possible debris under flap',
    preventable: false,
    reportedToRegistry: false,
    followUps: [
      {
        date: '2026-01-13',
        clinician: 'Dr. Priya Sharma',
        findings: 'DLK reducing, grade 1 now',
        vaOD: '6/9',
        action: 'Continue hourly steroids, review tomorrow'
      },
      {
        date: '2026-01-15',
        clinician: 'Dr. Priya Sharma',
        findings: 'DLK resolved, clear interface',
        vaOD: '6/6',
        action: 'Taper steroids, routine 1 month review'
      }
    ]
  },
  {
    id: 'COMP005',
    patientId: 'P4005',
    patientName: 'Krishnamurthy S',
    mrn: 'MRN-2024-4005',
    age: 72,
    gender: 'Male',
    procedureType: 'Phacoemulsification + PCIOL',
    procedureDate: '2026-01-25',
    eye: 'OD',
    surgeon: 'Dr. Amit Verma',
    complicationType: 'early-postop',
    severity: 'sight-threatening',
    category: 'Endophthalmitis',
    description: 'Day 2 post-op with pain, decreased vision, hypopyon',
    detectedDate: '2026-01-27',
    detectedBy: 'Dr. Amit Verma',
    status: 'active',
    management: 'Emergency intravitreal antibiotics (Vancomycin + Ceftazidime), vitreous tap sent for culture',
    rootCause: 'Under investigation - culture pending',
    preventable: false,
    reportedToRegistry: true,
    followUps: [
      {
        date: '2026-01-28',
        clinician: 'Dr. Amit Verma',
        findings: 'Hypopyon reducing, culture positive for Staph epidermidis',
        vaOD: 'HM',
        iop: 12,
        action: 'Repeat intravitreal injection, consider vitrectomy if no improvement'
      }
    ]
  }
];

const mockStats: ComplicationStats = {
  totalComplications: 42,
  activeComplications: 5,
  resolvedThisMonth: 8,
  sightThreatening: 2,
  intraoperativeRate: 1.2,
  overallRate: 2.8
};

// Helper Functions
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    'minor': 'bg-green-100 text-green-800 border-green-200',
    'moderate': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'major': 'bg-orange-100 text-orange-800 border-orange-200',
    'sight-threatening': 'bg-red-100 text-red-800 border-red-200'
  };
  return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'active': 'bg-red-100 text-red-800',
    'resolving': 'bg-yellow-100 text-yellow-800',
    'resolved': 'bg-green-100 text-green-800',
    'monitoring': 'bg-blue-100 text-blue-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'intraoperative': 'bg-purple-100 text-purple-800',
    'early-postop': 'bg-blue-100 text-blue-800',
    'late-postop': 'bg-gray-100 text-gray-800'
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

export default function ComplicationTrackingPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'all' | 'analytics'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedComplication, setExpandedComplication] = useState<string | null>(null);
  const [showNewComplicationModal, setShowNewComplicationModal] = useState(false);

  // Filter complications
  const filteredComplications = mockComplications.filter(comp => {
    const matchesSearch = 
      comp.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || comp.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || comp.status === filterStatus;
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'active' && (comp.status === 'active' || comp.status === 'resolving' || comp.status === 'monitoring'));
    return matchesSearch && matchesSeverity && matchesStatus && matchesTab;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-7 w-7 text-red-600" />
            Complication Tracking
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage surgical complications and adverse events
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewComplicationModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Report Complication
          </button>
          <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Alert Banner for Active Sight-Threatening */}
      {mockComplications.some(c => c.severity === 'sight-threatening' && c.status === 'active') && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Active Sight-Threatening Complication</h3>
              <p className="text-sm text-red-700 mt-1">
                There is 1 active sight-threatening complication requiring immediate attention. 
                <a href="#" className="underline ml-1">View details</a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Cases</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.totalComplications}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <ClipboardList className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-red-600">{mockStats.activeComplications}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Resolved (Month)</p>
              <p className="text-2xl font-bold text-green-600">{mockStats.resolvedThisMonth}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Sight-Threatening</p>
              <p className="text-2xl font-bold text-red-600">{mockStats.sightThreatening}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Eye className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Intraop Rate</p>
              <p className="text-2xl font-bold text-orange-600">{mockStats.intraoperativeRate}%</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overall Rate</p>
              <p className="text-2xl font-bold text-blue-600">{mockStats.overallRate}%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'active', label: 'Active Cases', count: mockStats.activeComplications },
              { id: 'all', label: 'All Complications', count: mockStats.totalComplications },
              { id: 'analytics', label: 'Analytics', count: null }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Active/All Tabs */}
        {(activeTab === 'active' || activeTab === 'all') && (
          <div className="p-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search patient, MRN, complication..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Severity</option>
                <option value="minor">Minor</option>
                <option value="moderate">Moderate</option>
                <option value="major">Major</option>
                <option value="sight-threatening">Sight-Threatening</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="resolving">Resolving</option>
                <option value="monitoring">Monitoring</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* Complication List */}
            <div className="space-y-3">
              {filteredComplications.map(comp => (
                <div 
                  key={comp.id} 
                  className={`border rounded-lg overflow-hidden ${
                    comp.severity === 'sight-threatening' ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <div 
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      comp.severity === 'sight-threatening' ? 'hover:bg-red-100' : ''
                    }`}
                    onClick={() => setExpandedComplication(expandedComplication === comp.id ? null : comp.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          comp.severity === 'sight-threatening' ? 'bg-red-200' :
                          comp.severity === 'major' ? 'bg-orange-100' :
                          comp.severity === 'moderate' ? 'bg-yellow-100' :
                          'bg-green-100'
                        }`}>
                          <AlertTriangle className={`h-5 w-5 ${
                            comp.severity === 'sight-threatening' ? 'text-red-700' :
                            comp.severity === 'major' ? 'text-orange-600' :
                            comp.severity === 'moderate' ? 'text-yellow-600' :
                            'text-green-600'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">{comp.patientName}</span>
                            <span className="text-sm text-gray-500">({comp.mrn})</span>
                            <span className={`px-2 py-0.5 rounded border text-xs font-medium ${getSeverityColor(comp.severity)}`}>
                              {comp.severity.replace('-', ' ')}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(comp.status)}`}>
                              {comp.status}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-800 mt-1">
                            {comp.category}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span>{comp.procedureType} • {comp.eye}</span>
                            <span>Surgery: {formatDate(comp.procedureDate)}</span>
                            <span>Surgeon: {comp.surgeon}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${getTypeColor(comp.complicationType)}`}>
                          {comp.complicationType.replace('-', ' ')}
                        </span>
                        {expandedComplication === comp.id ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedComplication === comp.id && (
                    <div className="p-4 border-t border-gray-200 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-800 mb-3">Complication Details</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-500">Description:</span>
                              <p className="mt-1 text-gray-700">{comp.description}</p>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Detected:</span>
                              <span className="font-medium">{formatDate(comp.detectedDate)} by {comp.detectedBy}</span>
                            </div>
                            {comp.rootCause && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Root Cause:</span>
                                <span className="font-medium">{comp.rootCause}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-500">Preventable:</span>
                              <span className={`font-medium ${comp.preventable ? 'text-red-600' : 'text-green-600'}`}>
                                {comp.preventable ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 mb-3">Management</h4>
                          <p className="text-sm text-gray-700">{comp.management}</p>
                          {comp.outcome && (
                            <div className="mt-3">
                              <span className="text-sm text-gray-500">Current Outcome:</span>
                              <p className="text-sm text-gray-700 mt-1">{comp.outcome}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Follow-ups */}
                      {comp.followUps.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-medium text-gray-800 mb-3">Follow-up History</h4>
                          <div className="space-y-3">
                            {comp.followUps.map((fu, idx) => (
                              <div key={idx} className="bg-gray-50 rounded-lg p-3 text-sm">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-gray-800">{formatDate(fu.date)}</span>
                                  <span className="text-gray-500">{fu.clinician}</span>
                                </div>
                                <p className="text-gray-700">{fu.findings}</p>
                                <div className="flex gap-4 mt-2 text-gray-600">
                                  {fu.vaOD && <span>VA OD: {fu.vaOD}</span>}
                                  {fu.vaOS && <span>VA OS: {fu.vaOS}</span>}
                                  {fu.iop && <span>IOP: {fu.iop} mmHg</span>}
                                </div>
                                <p className="text-blue-600 mt-2">Action: {fu.action}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex gap-2">
                        <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                          Add Follow-up
                        </button>
                        <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          Full Report
                        </button>
                        {!comp.reportedToRegistry && (
                          <button className="px-3 py-1.5 border border-orange-300 text-orange-700 text-sm rounded-lg hover:bg-orange-50 flex items-center gap-1">
                            <Flag className="h-4 w-4" />
                            Report to Registry
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* By Procedure Type */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Complications by Procedure</h3>
                <div className="space-y-3">
                  {[
                    { procedure: 'Phacoemulsification', total: 1850, complications: 28, rate: 1.5 },
                    { procedure: 'Trabeculectomy', total: 120, complications: 8, rate: 6.7 },
                    { procedure: 'LASIK/PRK', total: 450, complications: 4, rate: 0.9 },
                    { procedure: 'Vitrectomy', total: 85, complications: 2, rate: 2.4 }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-gray-600">{item.procedure}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">{item.complications}/{item.total}</span>
                        <span className={`font-semibold ${item.rate < 2 ? 'text-green-600' : item.rate < 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {item.rate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Severity */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">By Severity (This Year)</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      Minor
                    </span>
                    <span className="font-semibold">18 (42.9%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      Moderate
                    </span>
                    <span className="font-semibold">15 (35.7%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      Major
                    </span>
                    <span className="font-semibold">7 (16.7%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      Sight-Threatening
                    </span>
                    <span className="font-semibold text-red-600">2 (4.8%)</span>
                  </div>
                </div>
              </div>

              {/* By Surgeon */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">By Surgeon</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Dr. Amit Verma', procedures: 620, complications: 12, rate: 1.9 },
                    { name: 'Dr. Kavita Singh', procedures: 280, complications: 8, rate: 2.9 },
                    { name: 'Dr. Priya Sharma', procedures: 450, complications: 4, rate: 0.9 },
                    { name: 'Dr. Ravi Menon', procedures: 155, complications: 3, rate: 1.9 }
                  ].map((surgeon, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-gray-600">{surgeon.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">{surgeon.complications}/{surgeon.procedures}</span>
                        <span className={`font-semibold ${surgeon.rate < 2 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {surgeon.rate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trend */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Monthly Trend</h3>
                <div className="space-y-3">
                  {[
                    { month: 'January 2026', complications: 5, rate: 2.8, trend: 'down' },
                    { month: 'December 2025', complications: 7, rate: 3.2, trend: 'up' },
                    { month: 'November 2025', complications: 4, rate: 2.1, trend: 'down' },
                    { month: 'October 2025', complications: 6, rate: 2.9, trend: 'up' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-gray-600">{item.month}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.complications} cases ({item.rate}%)</span>
                        {item.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Reports */}
            <div className="mt-6 flex gap-3">
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Quarterly M&M Report
              </button>
              <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Surgeon Comparison
              </button>
              <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Registry Submission
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Complication Modal */}
      {showNewComplicationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Report New Complication</h2>
                <button
                  onClick={() => setShowNewComplicationModal(false)}
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
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500">
                    <option>Select Patient</option>
                    <option>Ravi Kumar (MRN-2024-4001)</option>
                    <option>Lakshmi Narayanan (MRN-2024-4002)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Related Procedure</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500">
                    <option>Select Procedure</option>
                    <option>Phaco + PCIOL OD - 20 Jan 2026</option>
                    <option>Trabeculectomy OS - 15 Jan 2026</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timing</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500">
                    <option value="intraoperative">Intraoperative</option>
                    <option value="early-postop">Early Post-Op (&lt;1 month)</option>
                    <option value="late-postop">Late Post-Op (&gt;1 month)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500">
                    <option value="minor">Minor</option>
                    <option value="moderate">Moderate</option>
                    <option value="major">Major</option>
                    <option value="sight-threatening">Sight-Threatening</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Detection Date</label>
                  <input
                    type="date"
                    defaultValue="2026-01-28"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Complication Category</label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500">
                  <option>Select Category</option>
                  <optgroup label="Cataract Surgery">
                    <option>Posterior Capsule Rupture</option>
                    <option>Vitreous Loss</option>
                    <option>Dropped Nucleus</option>
                    <option>Corneal Edema</option>
                    <option>Endophthalmitis</option>
                    <option>CME</option>
                    <option>IOL Dislocation</option>
                  </optgroup>
                  <optgroup label="Glaucoma Surgery">
                    <option>Hypotony</option>
                    <option>Bleb Leak</option>
                    <option>Choroidal Effusion</option>
                    <option>Hyphema</option>
                  </optgroup>
                  <optgroup label="Refractive Surgery">
                    <option>DLK</option>
                    <option>Flap Complications</option>
                    <option>Ectasia</option>
                    <option>Infection</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Detailed description of the complication..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Management Plan</label>
                <textarea
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Current management and treatment plan..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Root Cause (if known)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="e.g., Dense nucleus, weak zonules..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preventable?</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium">Mandatory Reporting</p>
                    <p className="mt-1">Sight-threatening complications and endophthalmitis cases must be reported to the hospital infection control and quality committees within 24 hours.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowNewComplicationModal(false)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Report Complication
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
