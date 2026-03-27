'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Eye,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  Download,
  Scale,
  MessageSquare,
  Flag,
  Gavel,
  UserX,
  History,
  Upload
} from 'lucide-react';

// Types
interface DisciplinaryCase {
  id: string;
  caseNumber: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  designation: string;
  branch: string;
  incidentDate: string;
  reportDate: string;
  category: 'misconduct' | 'performance' | 'attendance' | 'policy-violation' | 'harassment' | 'safety' | 'other';
  severity: 'minor' | 'moderate' | 'major' | 'severe';
  status: 'reported' | 'under-investigation' | 'hearing-scheduled' | 'action-taken' | 'appealed' | 'closed';
  description: string;
  witnesses?: string[];
  evidence?: string[];
  investigator?: string;
  actions: DisciplinaryAction[];
  hearings: Hearing[];
  appeal?: Appeal;
}

interface DisciplinaryAction {
  id: string;
  actionType: 'verbal-warning' | 'written-warning' | 'final-warning' | 'suspension' | 'demotion' | 'termination' | 'probation';
  actionDate: string;
  issuedBy: string;
  description: string;
  duration?: string;
  effectiveUntil?: string;
  acknowledgement?: {
    signed: boolean;
    signedDate?: string;
  };
}

interface Hearing {
  id: string;
  hearingDate: string;
  time: string;
  location: string;
  panelMembers: string[];
  outcome?: string;
  minutes?: string;
  status: 'scheduled' | 'completed' | 'postponed' | 'cancelled';
}

interface Appeal {
  id: string;
  appealDate: string;
  reason: string;
  status: 'pending' | 'review' | 'accepted' | 'rejected';
  reviewDate?: string;
  outcome?: string;
}

// Mock Data
const mockDisciplinaryCases: DisciplinaryCase[] = [
  {
    id: 'DC001',
    caseNumber: 'DISC-2026-001',
    employeeId: 'EMP025',
    employeeName: 'Ramesh Verma',
    employeeCode: 'EMP-2022-025',
    department: 'Housekeeping',
    designation: 'Housekeeping Staff',
    branch: 'Main Hospital - Koramangala',
    incidentDate: '2026-01-10',
    reportDate: '2026-01-11',
    category: 'attendance',
    severity: 'minor',
    status: 'action-taken',
    description: 'Employee has been consistently arriving late for shifts. 8 instances of late arrival in the past month, with an average delay of 30 minutes.',
    investigator: 'HR Manager - Anita Menon',
    actions: [
      {
        id: 'ACT001',
        actionType: 'verbal-warning',
        actionDate: '2026-01-12',
        issuedBy: 'Anita Menon',
        description: 'Verbal warning issued for chronic late arrivals. Employee counseled on attendance policy.',
        acknowledgement: { signed: true, signedDate: '2026-01-12' }
      }
    ],
    hearings: [],
    appeal: undefined
  },
  {
    id: 'DC002',
    caseNumber: 'DISC-2026-002',
    employeeId: 'EMP030',
    employeeName: 'Suresh Kumar',
    employeeCode: 'EMP-2021-030',
    department: 'Pharmacy',
    designation: 'Pharmacy Assistant',
    branch: 'Branch - Whitefield',
    incidentDate: '2026-01-08',
    reportDate: '2026-01-09',
    category: 'policy-violation',
    severity: 'major',
    status: 'under-investigation',
    description: 'Employee found dispensing medication without proper verification of prescription. Potential patient safety risk identified.',
    witnesses: ['Rajesh Gupta (Pharmacist)', 'Meera Nair (Staff Nurse)'],
    evidence: ['CCTV footage', 'Dispensing records', 'Witness statements'],
    investigator: 'Dr. Sunil Reddy - Compliance Officer',
    actions: [],
    hearings: [
      {
        id: 'HRG001',
        hearingDate: '2026-01-25',
        time: '10:00 AM',
        location: 'Conference Room A',
        panelMembers: ['Dr. Sunil Reddy', 'Anita Menon', 'Legal Advisor'],
        status: 'scheduled'
      }
    ]
  },
  {
    id: 'DC003',
    caseNumber: 'DISC-2026-003',
    employeeId: 'EMP018',
    employeeName: 'Priya Sinha',
    employeeCode: 'EMP-2023-018',
    department: 'Front Office',
    designation: 'Receptionist',
    branch: 'Main Hospital - Koramangala',
    incidentDate: '2025-12-20',
    reportDate: '2025-12-21',
    category: 'misconduct',
    severity: 'moderate',
    status: 'action-taken',
    description: 'Employee behaved rudely with a patient and their family. Patient complaint received through feedback system.',
    witnesses: ['Patient - Mr. Sharma', 'Security Guard - Ravi'],
    investigator: 'Anita Menon - HR Manager',
    actions: [
      {
        id: 'ACT002',
        actionType: 'written-warning',
        actionDate: '2025-12-28',
        issuedBy: 'Anita Menon',
        description: 'Written warning issued for unprofessional conduct. Employee to attend customer service training.',
        effectiveUntil: '2026-06-28',
        acknowledgement: { signed: true, signedDate: '2025-12-28' }
      }
    ],
    hearings: [],
    appeal: undefined
  },
  {
    id: 'DC004',
    caseNumber: 'DISC-2025-045',
    employeeId: 'EMP012',
    employeeName: 'Anil Sharma',
    employeeCode: 'EMP-2020-012',
    department: 'Maintenance',
    designation: 'Maintenance Technician',
    branch: 'Main Hospital - Koramangala',
    incidentDate: '2025-11-15',
    reportDate: '2025-11-16',
    category: 'safety',
    severity: 'severe',
    status: 'appealed',
    description: 'Employee bypassed safety protocols while working on electrical systems, creating significant risk. Incident caused brief power disruption in OT.',
    witnesses: ['Biomedical Engineer - Vikram', 'OT Nurse - Lakshmi'],
    evidence: ['Incident report', 'Safety audit report', 'CCTV footage'],
    investigator: 'Safety Officer - Mohan Das',
    actions: [
      {
        id: 'ACT003',
        actionType: 'suspension',
        actionDate: '2025-11-20',
        issuedBy: 'HR Director',
        description: '2-week suspension without pay for serious safety violation.',
        duration: '14 days',
        effectiveUntil: '2025-12-04',
        acknowledgement: { signed: true, signedDate: '2025-11-20' }
      },
      {
        id: 'ACT004',
        actionType: 'final-warning',
        actionDate: '2025-12-05',
        issuedBy: 'HR Director',
        description: 'Final written warning. Any further violations will result in termination.',
        effectiveUntil: '2026-12-05',
        acknowledgement: { signed: true, signedDate: '2025-12-05' }
      }
    ],
    hearings: [
      {
        id: 'HRG002',
        hearingDate: '2025-11-18',
        time: '02:00 PM',
        location: 'HR Meeting Room',
        panelMembers: ['HR Director', 'Safety Officer', 'Department Head'],
        outcome: 'Suspension and final warning recommended',
        status: 'completed'
      }
    ],
    appeal: {
      id: 'APL001',
      appealDate: '2025-12-10',
      reason: 'Employee claims safety equipment was not available at the time of incident. Requests review of circumstances.',
      status: 'review',
      reviewDate: '2026-01-20'
    }
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

const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    'minor': 'bg-yellow-100 text-yellow-800',
    'moderate': 'bg-orange-100 text-orange-800',
    'major': 'bg-red-100 text-red-800',
    'severe': 'bg-red-200 text-red-900'
  };
  return colors[severity] || 'bg-gray-100 text-gray-800';
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'misconduct': 'bg-purple-100 text-purple-800',
    'performance': 'bg-blue-100 text-blue-800',
    'attendance': 'bg-yellow-100 text-yellow-800',
    'policy-violation': 'bg-red-100 text-red-800',
    'harassment': 'bg-pink-100 text-pink-800',
    'safety': 'bg-orange-100 text-orange-800',
    'other': 'bg-gray-100 text-gray-800'
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'reported': 'bg-blue-100 text-blue-800',
    'under-investigation': 'bg-yellow-100 text-yellow-800',
    'hearing-scheduled': 'bg-purple-100 text-purple-800',
    'action-taken': 'bg-green-100 text-green-800',
    'appealed': 'bg-orange-100 text-orange-800',
    'closed': 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getActionTypeColor = (actionType: string) => {
  const colors: Record<string, string> = {
    'verbal-warning': 'bg-yellow-100 text-yellow-700',
    'written-warning': 'bg-orange-100 text-orange-700',
    'final-warning': 'bg-red-100 text-red-700',
    'suspension': 'bg-red-200 text-red-800',
    'demotion': 'bg-purple-100 text-purple-700',
    'termination': 'bg-red-300 text-red-900',
    'probation': 'bg-blue-100 text-blue-700'
  };
  return colors[actionType] || 'bg-gray-100 text-gray-700';
};

export default function DisciplinaryManagementPage() {
  const [activeTab, setActiveTab] = useState<'cases' | 'actions' | 'appeals'>('cases');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<DisciplinaryCase | null>(null);

  // Filter cases
  const filteredCases = mockDisciplinaryCases.filter(c => {
    const matchesSearch = 
      c.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.employeeCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || c.severity === filterSeverity;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  // Stats
  const openCases = mockDisciplinaryCases.filter(c => !['closed', 'action-taken'].includes(c.status)).length;
  const pendingAppeals = mockDisciplinaryCases.filter(c => c.appeal?.status === 'pending' || c.appeal?.status === 'review').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gavel className="h-7 w-7 text-purple-600" />
            Disciplinary Management
          </h1>
          <p className="text-gray-600 mt-1">
            Track disciplinary cases, actions, warnings, and appeals
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewCaseModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Report Incident
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Cases</p>
              <p className="text-2xl font-bold text-gray-700">{mockDisciplinaryCases.length}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <FileText className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Open Cases</p>
              <p className="text-2xl font-bold text-yellow-600">{openCases}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Under Investigation</p>
              <p className="text-2xl font-bold text-blue-600">
                {mockDisciplinaryCases.filter(c => c.status === 'under-investigation').length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Search className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Appeals</p>
              <p className="text-2xl font-bold text-orange-600">{pendingAppeals}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Scale className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Severe Cases</p>
              <p className="text-2xl font-bold text-red-600">
                {mockDisciplinaryCases.filter(c => c.severity === 'severe' || c.severity === 'major').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Flag className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'cases', label: 'All Cases', count: mockDisciplinaryCases.length },
              { id: 'actions', label: 'Actions & Warnings', count: mockDisciplinaryCases.flatMap(c => c.actions).length },
              { id: 'appeals', label: 'Appeals', count: mockDisciplinaryCases.filter(c => c.appeal).length }
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
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Cases Tab */}
        {activeTab === 'cases' && (
          <div className="p-6">
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, code, or case number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="all">All Status</option>
                <option value="reported">Reported</option>
                <option value="under-investigation">Under Investigation</option>
                <option value="hearing-scheduled">Hearing Scheduled</option>
                <option value="action-taken">Action Taken</option>
                <option value="appealed">Appealed</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="all">All Severity</option>
                <option value="minor">Minor</option>
                <option value="moderate">Moderate</option>
                <option value="major">Major</option>
                <option value="severe">Severe</option>
              </select>
            </div>

            <div className="space-y-3">
              {filteredCases.map(caseItem => (
                <div key={caseItem.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedCase(expandedCase === caseItem.id ? null : caseItem.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          caseItem.severity === 'severe' ? 'bg-red-100' :
                          caseItem.severity === 'major' ? 'bg-orange-100' :
                          caseItem.severity === 'moderate' ? 'bg-yellow-100' : 'bg-gray-100'
                        }`}>
                          <AlertTriangle className={`h-5 w-5 ${
                            caseItem.severity === 'severe' ? 'text-red-600' :
                            caseItem.severity === 'major' ? 'text-orange-600' :
                            caseItem.severity === 'moderate' ? 'text-yellow-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{caseItem.caseNumber}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-700">{caseItem.employeeName}</span>
                            <span className="text-sm text-gray-500">({caseItem.employeeCode})</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{caseItem.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getCategoryColor(caseItem.category)}`}>
                          {caseItem.category.replace('-', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getSeverityColor(caseItem.severity)}`}>
                          {caseItem.severity}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(caseItem.status)}`}>
                          {caseItem.status.replace('-', ' ')}
                        </span>
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-800 mb-3">Case Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Department:</span>
                              <span className="font-medium">{caseItem.department}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Designation:</span>
                              <span className="font-medium">{caseItem.designation}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Incident Date:</span>
                              <span className="font-medium">{formatDate(caseItem.incidentDate)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Reported:</span>
                              <span className="font-medium">{formatDate(caseItem.reportDate)}</span>
                            </div>
                            {caseItem.investigator && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Investigator:</span>
                                <span className="font-medium">{caseItem.investigator}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-800 mb-3">Description</h4>
                          <p className="text-sm text-gray-600">{caseItem.description}</p>
                          {caseItem.witnesses && caseItem.witnesses.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-gray-500 mb-1">Witnesses:</p>
                              <div className="flex flex-wrap gap-1">
                                {caseItem.witnesses.map((w, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">{w}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-800 mb-3">Actions Taken ({caseItem.actions.length})</h4>
                          {caseItem.actions.length > 0 ? (
                            <div className="space-y-2">
                              {caseItem.actions.map(action => (
                                <div key={action.id} className="bg-white rounded-lg p-2 border border-gray-200">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${getActionTypeColor(action.actionType)}`}>
                                      {action.actionType.replace('-', ' ')}
                                    </span>
                                    <span className="text-xs text-gray-500">{formatDate(action.actionDate)}</span>
                                  </div>
                                  <p className="text-xs text-gray-600 line-clamp-2">{action.description}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No actions taken yet</p>
                          )}
                        </div>
                      </div>

                      {/* Hearings Section */}
                      {caseItem.hearings.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="font-medium text-gray-800 mb-3">Hearings</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {caseItem.hearings.map(hearing => (
                              <div key={hearing.id} className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-gray-800">{formatDate(hearing.hearingDate)} at {hearing.time}</span>
                                  <span className={`px-2 py-0.5 rounded text-xs ${
                                    hearing.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    hearing.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {hearing.status}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">Location: {hearing.location}</p>
                                <p className="text-xs text-gray-500 mt-1">Panel: {hearing.panelMembers.join(', ')}</p>
                                {hearing.outcome && (
                                  <p className="text-sm text-gray-700 mt-2 font-medium">Outcome: {hearing.outcome}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Appeal Section */}
                      {caseItem.appeal && (
                        <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-orange-800 flex items-center gap-2">
                              <Scale className="h-4 w-4" /> Appeal Filed
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              caseItem.appeal.status === 'accepted' ? 'bg-green-100 text-green-700' :
                              caseItem.appeal.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {caseItem.appeal.status}
                            </span>
                          </div>
                          <p className="text-sm text-orange-700">{caseItem.appeal.reason}</p>
                          <p className="text-xs text-orange-600 mt-1">Filed on: {formatDate(caseItem.appeal.appealDate)}</p>
                        </div>
                      )}

                      <div className="mt-4 flex gap-2 pt-4 border-t border-gray-200">
                        <button 
                          onClick={() => { setSelectedCase(caseItem); setShowActionModal(true); }}
                          className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 flex items-center gap-1"
                        >
                          <Gavel className="h-4 w-4" />
                          Add Action
                        </button>
                        <button className="px-3 py-1.5 border border-purple-200 text-purple-700 text-sm rounded-lg hover:bg-purple-50 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Schedule Hearing
                        </button>
                        <button className="px-3 py-1.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-1">
                          <History className="h-4 w-4" />
                          View Full History
                        </button>
                        <button className="px-3 py-1.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          Export Report
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions Tab */}
        {activeTab === 'actions' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">All Disciplinary Actions & Warnings</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issued By</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valid Until</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acknowledged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockDisciplinaryCases.flatMap(c => 
                    c.actions.map(action => ({
                      ...action,
                      employeeName: c.employeeName,
                      employeeCode: c.employeeCode,
                      caseNumber: c.caseNumber
                    }))
                  ).map((action, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{action.employeeName}</p>
                          <p className="text-xs text-gray-500">{action.caseNumber}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getActionTypeColor(action.actionType)}`}>
                          {action.actionType.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(action.actionDate)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{action.issuedBy}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {action.effectiveUntil ? formatDate(action.effectiveUntil) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {action.acknowledgement?.signed ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-xs">{formatDate(action.acknowledgement.signedDate!)}</span>
                          </span>
                        ) : (
                          <span className="text-yellow-600 flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span className="text-xs">Pending</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Appeals Tab */}
        {activeTab === 'appeals' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Disciplinary Appeals</h3>
            <div className="space-y-4">
              {mockDisciplinaryCases.filter(c => c.appeal).map(caseItem => (
                <div key={caseItem.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Scale className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-semibold text-gray-900">{caseItem.employeeName}</p>
                        <p className="text-sm text-gray-500">Case: {caseItem.caseNumber}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      caseItem.appeal?.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      caseItem.appeal?.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      caseItem.appeal?.status === 'review' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {caseItem.appeal?.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{caseItem.appeal?.reason}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Filed: {formatDate(caseItem.appeal!.appealDate)}</span>
                    {caseItem.appeal?.reviewDate && (
                      <span>Review Date: {formatDate(caseItem.appeal.reviewDate)}</span>
                    )}
                  </div>
                  {caseItem.appeal?.status === 'pending' || caseItem.appeal?.status === 'review' ? (
                    <div className="mt-4 flex gap-2">
                      <button className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                        Accept Appeal
                      </button>
                      <button className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                        Reject Appeal
                      </button>
                      <button className="px-3 py-1.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                        Request More Info
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New Case Modal */}
      {showNewCaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Report Disciplinary Incident</h2>
                <button onClick={() => setShowNewCaseModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                    <option value="">Select Employee</option>
                    <option value="EMP025">Ramesh Verma (EMP-2022-025)</option>
                    <option value="EMP030">Suresh Kumar (EMP-2021-030)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Incident Date</label>
                  <input type="date" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                    <option value="misconduct">Misconduct</option>
                    <option value="performance">Performance</option>
                    <option value="attendance">Attendance</option>
                    <option value="policy-violation">Policy Violation</option>
                    <option value="harassment">Harassment</option>
                    <option value="safety">Safety Violation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                    <option value="minor">Minor</option>
                    <option value="moderate">Moderate</option>
                    <option value="major">Major</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={4} className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="Describe the incident in detail..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Witnesses (if any)</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="Enter witness names (comma separated)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Evidence</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Drag and drop files or click to upload</p>
                  <p className="text-xs text-gray-400 mt-1">Supports: PDF, Images, Documents</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setShowNewCaseModal(false)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Add Disciplinary Action</h2>
                <button onClick={() => { setShowActionModal(false); setSelectedCase(null); }} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {selectedCase && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-800">{selectedCase.employeeName}</p>
                  <p className="text-sm text-gray-500">Case: {selectedCase.caseNumber}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                  <option value="verbal-warning">Verbal Warning</option>
                  <option value="written-warning">Written Warning</option>
                  <option value="final-warning">Final Warning</option>
                  <option value="suspension">Suspension</option>
                  <option value="demotion">Demotion</option>
                  <option value="probation">Probation Period</option>
                  <option value="termination">Termination</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
                <input type="date" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (if applicable)</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="e.g., 14 days, 3 months" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="Describe the action and reasons..." />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => { setShowActionModal(false); setSelectedCase(null); }} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Add Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
