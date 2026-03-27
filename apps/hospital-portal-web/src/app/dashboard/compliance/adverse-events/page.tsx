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
  Upload,
  Building,
  Activity,
  TrendingUp,
  Flag,
  Users,
  MessageSquare,
  ClipboardCheck,
  BarChart3,
  Target,
  Siren
} from 'lucide-react';

// Types
interface AdverseEvent {
  id: string;
  reportNumber: string;
  reportDate: string;
  reportedBy: string;
  reporterRole: string;
  eventDate: string;
  eventTime: string;
  eventType: 'medication' | 'surgical' | 'diagnostic' | 'fall' | 'equipment' | 'transfusion' | 'procedure' | 'other';
  severity: 'near-miss' | 'minor' | 'moderate' | 'major' | 'sentinel';
  patientInfo: {
    id?: string;
    name?: string;
    mrn?: string;
    age?: number;
    gender?: string;
  };
  location: string;
  department: string;
  description: string;
  immediateActions: string;
  status: 'reported' | 'under-review' | 'investigating' | 'rca-complete' | 'action-plan' | 'resolved' | 'closed';
  assignedTo?: string;
  investigation?: Investigation;
  harmLevel: 'no-harm' | 'temporary-harm' | 'permanent-harm' | 'death';
}

interface Investigation {
  id: string;
  startDate: string;
  investigator: string;
  rootCauses: string[];
  contributingFactors: string[];
  findings: string;
  recommendations: string[];
  correctiveActions: CorrectiveAction[];
  completionDate?: string;
}

interface CorrectiveAction {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  completionDate?: string;
}

// Mock Data
const mockAdverseEvents: AdverseEvent[] = [
  {
    id: 'AE001',
    reportNumber: 'ADV-2026-001',
    reportDate: '2026-01-18',
    reportedBy: 'Nurse Priya Sharma',
    reporterRole: 'Staff Nurse',
    eventDate: '2026-01-18',
    eventTime: '09:30',
    eventType: 'medication',
    severity: 'minor',
    patientInfo: {
      id: 'PAT1001',
      name: 'Rajendra Prasad',
      mrn: 'MRN-2026-1001',
      age: 65,
      gender: 'Male'
    },
    location: 'General Ward A',
    department: 'Internal Medicine',
    description: 'Patient received wrong dosage of antihypertensive medication. Prescribed 5mg but 10mg was administered.',
    immediateActions: 'Patient vitals monitored. Doctor informed. Additional dose withheld. Patient stable.',
    status: 'investigating',
    assignedTo: 'Dr. Sunil Reddy',
    harmLevel: 'temporary-harm',
    investigation: {
      id: 'INV001',
      startDate: '2026-01-19',
      investigator: 'Dr. Sunil Reddy',
      rootCauses: ['Look-alike medication packaging', 'High workload during shift'],
      contributingFactors: ['Similar medication names', 'No barcode verification at bedside'],
      findings: 'Medication error due to similar packaging and manual verification process.',
      recommendations: ['Implement barcode scanning', 'Separate storage for look-alike meds', 'Double-check protocol'],
      correctiveActions: [
        { id: 'CA001', description: 'Implement barcode medication verification', assignedTo: 'Pharmacy Manager', dueDate: '2026-02-15', status: 'in-progress' },
        { id: 'CA002', description: 'Reorganize medication storage', assignedTo: 'Ward In-charge', dueDate: '2026-01-31', status: 'completed', completionDate: '2026-01-25' }
      ]
    }
  },
  {
    id: 'AE002',
    reportNumber: 'ADV-2026-002',
    reportDate: '2026-01-15',
    reportedBy: 'Dr. Vikram Singh',
    reporterRole: 'Surgeon',
    eventDate: '2026-01-15',
    eventTime: '14:20',
    eventType: 'surgical',
    severity: 'near-miss',
    patientInfo: {
      id: 'PAT1022',
      name: 'Mohammad Ali',
      mrn: 'MRN-2026-1022',
      age: 45,
      gender: 'Male'
    },
    location: 'Operating Theatre 2',
    department: 'Surgery',
    description: 'Near miss - wrong surgical site marked. Detected during surgical timeout before incision.',
    immediateActions: 'Procedure halted. Correct site verified and remarked. Surgery proceeded safely.',
    status: 'rca-complete',
    assignedTo: 'OT Manager',
    harmLevel: 'no-harm',
    investigation: {
      id: 'INV002',
      startDate: '2026-01-16',
      investigator: 'OT Manager',
      rootCauses: ['Site marking done without patient participation', 'Consent form discrepancy'],
      contributingFactors: ['Rush before surgery', 'Communication gap'],
      findings: 'Site marking protocol not fully followed. Timeout checklist caught the error.',
      recommendations: ['Mandatory patient verification during site marking', 'Enhanced timeout checklist'],
      correctiveActions: [
        { id: 'CA003', description: 'Update site marking protocol', assignedTo: 'OT Manager', dueDate: '2026-01-25', status: 'completed', completionDate: '2026-01-22' }
      ],
      completionDate: '2026-01-22'
    }
  },
  {
    id: 'AE003',
    reportNumber: 'ADV-2026-003',
    reportDate: '2026-01-12',
    reportedBy: 'Nurse Lakshmi',
    reporterRole: 'Staff Nurse',
    eventDate: '2026-01-12',
    eventTime: '06:45',
    eventType: 'fall',
    severity: 'moderate',
    patientInfo: {
      id: 'PAT1030',
      name: 'Kamala Sharma',
      mrn: 'MRN-2026-1030',
      age: 72,
      gender: 'Female'
    },
    location: 'General Ward B',
    department: 'Internal Medicine',
    description: 'Elderly patient fell while attempting to go to bathroom unassisted. Patient found on floor by night nurse.',
    immediateActions: 'Patient assessed for injuries. X-ray ordered - mild hip contusion, no fracture. Fall precautions implemented.',
    status: 'action-plan',
    assignedTo: 'Ward In-charge',
    harmLevel: 'temporary-harm'
  },
  {
    id: 'AE004',
    reportNumber: 'ADV-2025-098',
    reportDate: '2025-12-20',
    reportedBy: 'Lab Technician Ravi',
    reporterRole: 'Lab Technician',
    eventDate: '2025-12-20',
    eventTime: '11:00',
    eventType: 'diagnostic',
    severity: 'minor',
    patientInfo: {
      name: 'Unknown - Sample Mix-up',
      mrn: 'Multiple'
    },
    location: 'Pathology Lab',
    department: 'Laboratory',
    description: 'Two patient blood samples were mislabeled. Discovered during verification before releasing results.',
    immediateActions: 'Results held. Samples recollected from both patients. New samples processed.',
    status: 'closed',
    assignedTo: 'Lab Manager',
    harmLevel: 'no-harm'
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
    'near-miss': 'bg-blue-100 text-blue-800',
    'minor': 'bg-yellow-100 text-yellow-800',
    'moderate': 'bg-orange-100 text-orange-800',
    'major': 'bg-red-100 text-red-800',
    'sentinel': 'bg-red-200 text-red-900 font-bold'
  };
  return colors[severity] || 'bg-gray-100 text-gray-800';
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'reported': 'bg-blue-100 text-blue-800',
    'under-review': 'bg-yellow-100 text-yellow-800',
    'investigating': 'bg-purple-100 text-purple-800',
    'rca-complete': 'bg-indigo-100 text-indigo-800',
    'action-plan': 'bg-orange-100 text-orange-800',
    'resolved': 'bg-green-100 text-green-800',
    'closed': 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getHarmColor = (harm: string) => {
  const colors: Record<string, string> = {
    'no-harm': 'text-green-600',
    'temporary-harm': 'text-yellow-600',
    'permanent-harm': 'text-orange-600',
    'death': 'text-red-600'
  };
  return colors[harm] || 'text-gray-600';
};

const getEventTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    'medication': '💊',
    'surgical': '🔪',
    'diagnostic': '🔬',
    'fall': '⚠️',
    'equipment': '🔧',
    'transfusion': '🩸',
    'procedure': '📋',
    'other': '❓'
  };
  return icons[type] || '❓';
};

export default function AdverseEventReportingPage() {
  const [activeTab, setActiveTab] = useState<'reports' | 'investigations' | 'analytics'>('reports');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [showNewReportModal, setShowNewReportModal] = useState(false);

  // Filter events
  const filteredEvents = mockAdverseEvents.filter(event => {
    const matchesSearch = 
      event.reportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.patientInfo.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || event.severity === filterSeverity;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  // Stats
  const openEvents = mockAdverseEvents.filter(e => !['closed', 'resolved'].includes(e.status)).length;
  const nearMisses = mockAdverseEvents.filter(e => e.severity === 'near-miss').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Siren className="h-7 w-7 text-red-600" />
            Adverse Event Reporting
          </h1>
          <p className="text-gray-600 mt-1">
            Report, investigate, and track clinical incidents and adverse events
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewReportModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Report Event
          </button>
          <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Events (YTD)</p>
              <p className="text-2xl font-bold text-gray-700">{mockAdverseEvents.length}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <FileText className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Open Events</p>
              <p className="text-2xl font-bold text-yellow-600">{openEvents}</p>
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
              <p className="text-2xl font-bold text-purple-600">
                {mockAdverseEvents.filter(e => e.status === 'investigating').length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Search className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Near Misses</p>
              <p className="text-2xl font-bold text-blue-600">{nearMisses}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">Good catch rate!</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Sentinel Events</p>
              <p className="text-2xl font-bold text-red-600">
                {mockAdverseEvents.filter(e => e.severity === 'sentinel').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'reports', label: 'Event Reports', count: mockAdverseEvents.length },
              { id: 'investigations', label: 'Investigations', count: mockAdverseEvents.filter(e => e.investigation).length },
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

        {/* Event Reports Tab */}
        {activeTab === 'reports' && (
          <div className="p-6">
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by report number, description, or patient..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
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
                <option value="under-review">Under Review</option>
                <option value="investigating">Investigating</option>
                <option value="rca-complete">RCA Complete</option>
                <option value="action-plan">Action Plan</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="all">All Severity</option>
                <option value="near-miss">Near Miss</option>
                <option value="minor">Minor</option>
                <option value="moderate">Moderate</option>
                <option value="major">Major</option>
                <option value="sentinel">Sentinel</option>
              </select>
            </div>

            <div className="space-y-3">
              {filteredEvents.map(event => (
                <div key={event.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{getEventTypeIcon(event.eventType)}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{event.reportNumber}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${getSeverityColor(event.severity)}`}>
                              {event.severity.replace('-', ' ')}
                            </span>
                            <span className={`text-sm ${getHarmColor(event.harmLevel)}`}>
                              • {event.harmLevel.replace('-', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{event.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-sm">
                          <p className="text-gray-500">{event.department}</p>
                          <p className="text-gray-400">{formatDate(event.eventDate)}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(event.status)}`}>
                          {event.status.replace('-', ' ')}
                        </span>
                        {expandedEvent === event.id ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedEvent === event.id && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-800 mb-3">Event Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Event Date/Time:</span>
                              <span className="font-medium">{formatDate(event.eventDate)} at {event.eventTime}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Location:</span>
                              <span className="font-medium">{event.location}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Event Type:</span>
                              <span className="font-medium capitalize">{event.eventType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Reported By:</span>
                              <span className="font-medium">{event.reportedBy}</span>
                            </div>
                            {event.assignedTo && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Assigned To:</span>
                                <span className="font-medium">{event.assignedTo}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-800 mb-3">Patient Info</h4>
                          {event.patientInfo.name ? (
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between"><span className="text-gray-500">Name:</span><span>{event.patientInfo.name}</span></div>
                              {event.patientInfo.mrn && <div className="flex justify-between"><span className="text-gray-500">MRN:</span><span>{event.patientInfo.mrn}</span></div>}
                              {event.patientInfo.age && <div className="flex justify-between"><span className="text-gray-500">Age:</span><span>{event.patientInfo.age} years</span></div>}
                              {event.patientInfo.gender && <div className="flex justify-between"><span className="text-gray-500">Gender:</span><span>{event.patientInfo.gender}</span></div>}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">Patient details not applicable</p>
                          )}
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-800 mb-3">Immediate Actions</h4>
                          <p className="text-sm text-gray-600">{event.immediateActions}</p>
                        </div>
                      </div>

                      {/* Investigation Section */}
                      {event.investigation && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="font-medium text-gray-800 mb-3">Root Cause Analysis</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-2">Root Causes:</p>
                              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                {event.investigation.rootCauses.map((cause, i) => (
                                  <li key={i}>{cause}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-2">Contributing Factors:</p>
                              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                {event.investigation.contributingFactors.map((factor, i) => (
                                  <li key={i}>{factor}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {event.investigation.correctiveActions.length > 0 && (
                            <div className="mt-4">
                              <p className="text-xs font-medium text-gray-500 mb-2">Corrective Actions:</p>
                              <div className="space-y-2">
                                {event.investigation.correctiveActions.map(action => (
                                  <div key={action.id} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                                    <div className="flex items-center gap-2">
                                      {action.status === 'completed' ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                      ) : action.status === 'overdue' ? (
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                      ) : (
                                        <Clock className="h-4 w-4 text-yellow-600" />
                                      )}
                                      <span className="text-sm text-gray-700">{action.description}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                      <span className="text-gray-500">{action.assignedTo}</span>
                                      <span className={`px-2 py-0.5 rounded text-xs ${
                                        action.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        action.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                      }`}>
                                        {action.status}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-4 flex gap-2 pt-4 border-t border-gray-200">
                        <button className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center gap-1">
                          <Edit className="h-4 w-4" />
                          Update
                        </button>
                        {!event.investigation && (
                          <button className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 flex items-center gap-1">
                            <Search className="h-4 w-4" />
                            Start Investigation
                          </button>
                        )}
                        <button className="px-3 py-1.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          Add Comment
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

        {/* Investigations Tab */}
        {activeTab === 'investigations' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Investigations</h3>
            <div className="space-y-4">
              {mockAdverseEvents.filter(e => e.investigation).map(event => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{event.reportNumber}</h4>
                      <p className="text-sm text-gray-600">{event.description.substring(0, 100)}...</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(event.status)}`}>
                      {event.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Investigator</p>
                      <p className="font-medium">{event.investigation?.investigator}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Started</p>
                      <p className="font-medium">{formatDate(event.investigation!.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Root Causes</p>
                      <p className="font-medium">{event.investigation?.rootCauses.length} identified</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Actions</p>
                      <p className="font-medium">
                        {event.investigation?.correctiveActions.filter(a => a.status === 'completed').length}/
                        {event.investigation?.correctiveActions.length} complete
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Events by Type */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Events by Type (YTD)</h3>
                <div className="space-y-3">
                  {[
                    { type: 'Medication', count: 15, percentage: 35, color: 'bg-blue-500' },
                    { type: 'Fall', count: 10, percentage: 24, color: 'bg-orange-500' },
                    { type: 'Surgical', count: 6, percentage: 14, color: 'bg-red-500' },
                    { type: 'Diagnostic', count: 5, percentage: 12, color: 'bg-purple-500' },
                    { type: 'Other', count: 6, percentage: 15, color: 'bg-gray-500' }
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{item.type}</span>
                        <span className="font-medium">{item.count} ({item.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${item.color}`} style={{width: `${item.percentage}%`}}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Events by Severity */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Events by Severity</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">12</p>
                    <p className="text-sm text-gray-500">Near Misses</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-3xl font-bold text-yellow-600">8</p>
                    <p className="text-sm text-gray-500">Minor</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-3xl font-bold text-orange-600">4</p>
                    <p className="text-sm text-gray-500">Moderate</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-3xl font-bold text-red-600">1</p>
                    <p className="text-sm text-gray-500">Major/Sentinel</p>
                  </div>
                </div>
              </div>

              {/* Monthly Trend */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Monthly Trend</h3>
                <div className="space-y-2">
                  {['Jan', 'Dec', 'Nov', 'Oct', 'Sep'].map((month, idx) => (
                    <div key={month} className="flex items-center gap-4">
                      <span className="w-12 text-sm text-gray-500">{month}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-red-500 h-4 rounded-full flex items-center justify-end pr-2"
                          style={{width: `${[65, 45, 55, 40, 50][idx]}%`}}
                        >
                          <span className="text-xs text-white font-medium">{[8, 5, 7, 4, 6][idx]}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resolution Time */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Key Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Avg. Resolution Time</span>
                    <span className="font-bold text-gray-800">12 days</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">RCA Completion Rate</span>
                    <span className="font-bold text-green-600">85%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Action Completion Rate</span>
                    <span className="font-bold text-blue-600">78%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Reporting Rate (per 1000 patients)</span>
                    <span className="font-bold text-purple-600">2.4</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Report Modal */}
      {showNewReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Report Adverse Event</h2>
                <button onClick={() => setShowNewReportModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                  <input type="date" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Time</label>
                  <input type="time" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                    <option value="medication">Medication Error</option>
                    <option value="surgical">Surgical Complication</option>
                    <option value="diagnostic">Diagnostic Error</option>
                    <option value="fall">Patient Fall</option>
                    <option value="equipment">Equipment Failure</option>
                    <option value="transfusion">Transfusion Reaction</option>
                    <option value="procedure">Procedure Complication</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                    <option value="near-miss">Near Miss (No harm reached patient)</option>
                    <option value="minor">Minor (Temporary harm, minimal intervention)</option>
                    <option value="moderate">Moderate (Temporary harm, intervention required)</option>
                    <option value="major">Major (Permanent harm)</option>
                    <option value="sentinel">Sentinel (Death or serious injury)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                    <option value="">Select Department</option>
                    <option value="surgery">Surgery</option>
                    <option value="internal-medicine">Internal Medicine</option>
                    <option value="emergency">Emergency</option>
                    <option value="icu">ICU</option>
                    <option value="laboratory">Laboratory</option>
                    <option value="pharmacy">Pharmacy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="e.g., General Ward A, OT 2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient MRN (if applicable)</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="Enter MRN or leave blank" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Description</label>
                <textarea rows={4} className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="Describe what happened in detail. Include relevant facts, sequence of events, and any contributing factors observed." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Immediate Actions Taken</label>
                <textarea rows={2} className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="Describe any immediate actions taken to address the situation..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Role</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="Your designation" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="anonymous" className="rounded" />
                <label htmlFor="anonymous" className="text-sm text-gray-700">Submit anonymously (your identity will be protected)</label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setShowNewReportModal(false)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
