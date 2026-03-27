'use client';

import React from 'react';
import { 
  Shield, 
  Search, 
  Filter,
  Plus,
  Eye,
  Edit,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  User,
  Building,
  GraduationCap,
  Briefcase,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  FileCheck,
  Users
} from 'lucide-react';

type VerificationType = 'identity' | 'address' | 'education' | 'employment' | 'criminal' | 'credit' | 'reference' | 'license';
type VerificationStatus = 'pending' | 'in-progress' | 'completed' | 'failed' | 'discrepancy';
type CaseStatus = 'initiated' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';

interface VerificationCheck {
  id: string;
  type: VerificationType;
  status: VerificationStatus;
  vendor?: string;
  initiatedDate: string;
  completedDate?: string;
  result?: 'clear' | 'discrepancy' | 'adverse';
  remarks?: string;
  documents: number;
}

interface BackgroundCase {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  caseType: 'pre-employment' | 'periodic' | 'promotion';
  status: CaseStatus;
  initiatedDate: string;
  completedDate?: string;
  vendor: string;
  checks: VerificationCheck[];
  overallResult?: 'clear' | 'adverse' | 'pending';
  priority: 'normal' | 'high' | 'urgent';
  assignedTo: string;
  remarks?: string;
}

interface VendorStats {
  name: string;
  casesCompleted: number;
  avgTurnaround: number; // days
  accuracy: number; // percentage
  status: 'active' | 'inactive';
}

const mockBackgroundCases: BackgroundCase[] = [
  {
    id: 'BGV001',
    employeeId: 'EMP201',
    employeeName: 'Dr. Priya Natarajan',
    department: 'Ophthalmology',
    designation: 'Consultant',
    caseType: 'pre-employment',
    status: 'in-progress',
    initiatedDate: '2026-01-15',
    vendor: 'AuthBridge',
    priority: 'high',
    assignedTo: 'HR Team',
    checks: [
      { id: 'CHK001', type: 'identity', status: 'completed', vendor: 'AuthBridge', initiatedDate: '2026-01-15', completedDate: '2026-01-17', result: 'clear', documents: 3 },
      { id: 'CHK002', type: 'address', status: 'completed', vendor: 'AuthBridge', initiatedDate: '2026-01-15', completedDate: '2026-01-18', result: 'clear', documents: 2 },
      { id: 'CHK003', type: 'education', status: 'in-progress', vendor: 'AuthBridge', initiatedDate: '2026-01-15', documents: 5 },
      { id: 'CHK004', type: 'employment', status: 'pending', vendor: 'AuthBridge', initiatedDate: '2026-01-15', documents: 0 },
      { id: 'CHK005', type: 'license', status: 'completed', vendor: 'MCI Direct', initiatedDate: '2026-01-15', completedDate: '2026-01-16', result: 'clear', documents: 2, remarks: 'Medical Council Registration verified' }
    ]
  },
  {
    id: 'BGV002',
    employeeId: 'EMP202',
    employeeName: 'Ravi Shankar',
    department: 'IT',
    designation: 'System Administrator',
    caseType: 'pre-employment',
    status: 'completed',
    initiatedDate: '2026-01-10',
    completedDate: '2026-01-22',
    vendor: 'FirstAdvantage',
    priority: 'normal',
    assignedTo: 'HR Team',
    overallResult: 'clear',
    checks: [
      { id: 'CHK011', type: 'identity', status: 'completed', vendor: 'FirstAdvantage', initiatedDate: '2026-01-10', completedDate: '2026-01-12', result: 'clear', documents: 3 },
      { id: 'CHK012', type: 'address', status: 'completed', vendor: 'FirstAdvantage', initiatedDate: '2026-01-10', completedDate: '2026-01-14', result: 'clear', documents: 2 },
      { id: 'CHK013', type: 'education', status: 'completed', vendor: 'FirstAdvantage', initiatedDate: '2026-01-10', completedDate: '2026-01-18', result: 'clear', documents: 4 },
      { id: 'CHK014', type: 'employment', status: 'completed', vendor: 'FirstAdvantage', initiatedDate: '2026-01-10', completedDate: '2026-01-20', result: 'clear', documents: 3 },
      { id: 'CHK015', type: 'criminal', status: 'completed', vendor: 'Police Verification', initiatedDate: '2026-01-10', completedDate: '2026-01-22', result: 'clear', documents: 1 }
    ]
  },
  {
    id: 'BGV003',
    employeeId: 'EMP156',
    employeeName: 'Anjali Mehta',
    department: 'Finance',
    designation: 'Senior Accountant',
    caseType: 'promotion',
    status: 'completed',
    initiatedDate: '2026-01-05',
    completedDate: '2026-01-18',
    vendor: 'AuthBridge',
    priority: 'normal',
    assignedTo: 'HR Team',
    overallResult: 'discrepancy',
    remarks: 'Minor discrepancy in previous employment dates - resolved',
    checks: [
      { id: 'CHK021', type: 'education', status: 'completed', vendor: 'AuthBridge', initiatedDate: '2026-01-05', completedDate: '2026-01-10', result: 'clear', documents: 3 },
      { id: 'CHK022', type: 'employment', status: 'completed', vendor: 'AuthBridge', initiatedDate: '2026-01-05', completedDate: '2026-01-15', result: 'discrepancy', documents: 4, remarks: 'Employment dates differ by 2 months' },
      { id: 'CHK023', type: 'credit', status: 'completed', vendor: 'CIBIL', initiatedDate: '2026-01-05', completedDate: '2026-01-08', result: 'clear', documents: 1 }
    ]
  },
  {
    id: 'BGV004',
    employeeId: 'EMP203',
    employeeName: 'Karthik Reddy',
    department: 'Pharmacy',
    designation: 'Pharmacist',
    caseType: 'pre-employment',
    status: 'on-hold',
    initiatedDate: '2026-01-18',
    vendor: 'AuthBridge',
    priority: 'urgent',
    assignedTo: 'HR Team',
    remarks: 'Awaiting additional documents from candidate',
    checks: [
      { id: 'CHK031', type: 'identity', status: 'completed', vendor: 'AuthBridge', initiatedDate: '2026-01-18', completedDate: '2026-01-19', result: 'clear', documents: 3 },
      { id: 'CHK032', type: 'license', status: 'pending', vendor: 'State Pharmacy Council', initiatedDate: '2026-01-18', documents: 0, remarks: 'Registration number not matching' },
      { id: 'CHK033', type: 'education', status: 'pending', vendor: 'AuthBridge', initiatedDate: '2026-01-18', documents: 2, remarks: 'Degree certificate pending' }
    ]
  }
];

const mockVendors: VendorStats[] = [
  { name: 'AuthBridge', casesCompleted: 156, avgTurnaround: 5.2, accuracy: 98.5, status: 'active' },
  { name: 'FirstAdvantage', casesCompleted: 89, avgTurnaround: 6.1, accuracy: 97.8, status: 'active' },
  { name: 'HireRight', casesCompleted: 45, avgTurnaround: 7.3, accuracy: 96.2, status: 'active' },
  { name: 'IDfy', casesCompleted: 23, avgTurnaround: 3.5, accuracy: 99.1, status: 'inactive' }
];

export default function BackgroundVerificationPage() {
  const [activeTab, setActiveTab] = React.useState<'cases' | 'checks' | 'vendors' | 'analytics'>('cases');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [selectedCase, setSelectedCase] = React.useState<BackgroundCase | null>(null);
  const [showNewCaseModal, setShowNewCaseModal] = React.useState(false);

  const getVerificationTypeIcon = (type: VerificationType) => {
    switch (type) {
      case 'identity': return User;
      case 'address': return MapPin;
      case 'education': return GraduationCap;
      case 'employment': return Briefcase;
      case 'criminal': return Shield;
      case 'credit': return CreditCard;
      case 'reference': return Users;
      case 'license': return FileCheck;
      default: return FileText;
    }
  };

  const getVerificationTypeColor = (type: VerificationType) => {
    switch (type) {
      case 'identity': return 'bg-blue-100 text-blue-600';
      case 'address': return 'bg-green-100 text-green-600';
      case 'education': return 'bg-purple-100 text-purple-600';
      case 'employment': return 'bg-orange-100 text-orange-600';
      case 'criminal': return 'bg-red-100 text-red-600';
      case 'credit': return 'bg-yellow-100 text-yellow-600';
      case 'reference': return 'bg-pink-100 text-pink-600';
      case 'license': return 'bg-teal-100 text-teal-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusColor = (status: VerificationStatus | CaseStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'pending':
      case 'initiated': return 'bg-yellow-100 text-yellow-700';
      case 'failed':
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'discrepancy':
      case 'on-hold': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getResultColor = (result: string | undefined) => {
    switch (result) {
      case 'clear': return 'text-green-600';
      case 'adverse': return 'text-red-600';
      case 'discrepancy': return 'text-orange-600';
      default: return 'text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCompletionPercentage = (checks: VerificationCheck[]) => {
    const completed = checks.filter(c => c.status === 'completed').length;
    return Math.round((completed / checks.length) * 100);
  };

  const stats = {
    totalCases: mockBackgroundCases.length,
    inProgress: mockBackgroundCases.filter(c => c.status === 'in-progress').length,
    completed: mockBackgroundCases.filter(c => c.status === 'completed').length,
    onHold: mockBackgroundCases.filter(c => c.status === 'on-hold').length,
    clearResults: mockBackgroundCases.filter(c => c.overallResult === 'clear').length,
    discrepancies: mockBackgroundCases.filter(c => c.overallResult === 'discrepancy').length
  };

  const filteredCases = mockBackgroundCases.filter(bgCase => {
    const matchesSearch = bgCase.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bgCase.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bgCase.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderCases = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by employee name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="initiated">Initiated</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
        </select>
        <button 
          onClick={() => setShowNewCaseModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Verification
        </button>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {filteredCases.map(bgCase => (
          <div 
            key={bgCase.id} 
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{bgCase.employeeName}</h3>
                      {bgCase.priority !== 'normal' && (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(bgCase.priority)}`}>
                          {bgCase.priority.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{bgCase.designation} • {bgCase.department}</p>
                    <p className="text-xs text-gray-400">{bgCase.employeeId} • {bgCase.caseType.replace('-', ' ')}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bgCase.status)}`}>
                    {bgCase.status.replace('-', ' ')}
                  </span>
                  {bgCase.overallResult && (
                    <span className={`text-sm font-medium ${getResultColor(bgCase.overallResult)}`}>
                      {bgCase.overallResult === 'clear' ? '✓ Clear' : 
                       bgCase.overallResult === 'adverse' ? '✗ Adverse' : '⚠ Discrepancy'}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Verification Progress</span>
                  <span className="text-sm font-medium text-gray-900">
                    {bgCase.checks.filter(c => c.status === 'completed').length}/{bgCase.checks.length} checks
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${getCompletionPercentage(bgCase.checks)}%` }}
                  />
                </div>
              </div>

              {/* Checks Summary */}
              <div className="flex flex-wrap gap-2 mb-4">
                {bgCase.checks.map(check => {
                  const CheckIcon = getVerificationTypeIcon(check.type);
                  return (
                    <div 
                      key={check.id}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${getVerificationTypeColor(check.type)}`}
                      title={`${check.type}: ${check.status}`}
                    >
                      <CheckIcon className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium capitalize">{check.type}</span>
                      {check.status === 'completed' && check.result === 'clear' && (
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                      )}
                      {check.status === 'completed' && check.result === 'discrepancy' && (
                        <AlertTriangle className="w-3 h-3 text-orange-600" />
                      )}
                      {check.status === 'in-progress' && (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      )}
                      {check.status === 'pending' && (
                        <Clock className="w-3 h-3 opacity-50" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    {bgCase.vendor}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(bgCase.initiatedDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setSelectedCase(bgCase)}
                    className="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Download className="w-4 h-4" />
                    Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderChecks = () => {
    const allChecks = mockBackgroundCases.flatMap(c => 
      c.checks.map(check => ({ ...check, employeeName: c.employeeName, caseId: c.id }))
    );

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">All Verification Checks</h3>
          <div className="flex gap-2">
            {['all', 'pending', 'in-progress', 'completed'].map(status => (
              <button
                key={status}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  status === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Initiated</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Result</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allChecks.map(check => {
                  const CheckIcon = getVerificationTypeIcon(check.type);
                  return (
                    <tr key={check.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg ${getVerificationTypeColor(check.type)}`}>
                          <CheckIcon className="w-4 h-4" />
                          <span className="text-sm font-medium capitalize">{check.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900">{check.employeeName}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{check.vendor || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900">
                          {new Date(check.initiatedDate).toLocaleDateString('en-IN')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(check.status)}`}>
                          {check.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {check.result ? (
                          <span className={`font-medium ${getResultColor(check.result)}`}>
                            {check.result === 'clear' ? '✓ Clear' : 
                             check.result === 'adverse' ? '✗ Adverse' : '⚠ Discrepancy'}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-sm text-blue-600 hover:text-blue-700">
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderVendors = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Verification Vendors</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Add Vendor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockVendors.map(vendor => (
          <div key={vendor.name} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{vendor.name}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    vendor.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {vendor.status}
                  </span>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Edit className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{vendor.casesCompleted}</p>
                <p className="text-xs text-gray-500">Cases</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{vendor.avgTurnaround}</p>
                <p className="text-xs text-gray-500">Avg Days</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{vendor.accuracy}%</p>
                <p className="text-xs text-gray-500">Accuracy</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="flex-1 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
                View Performance
              </button>
              <button className="flex-1 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Verification Types Configuration */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Verification Types & Requirements</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { type: 'identity', required: true, mandatory: true },
            { type: 'address', required: true, mandatory: true },
            { type: 'education', required: true, mandatory: true },
            { type: 'employment', required: true, mandatory: false },
            { type: 'criminal', required: true, mandatory: true },
            { type: 'credit', required: false, mandatory: false },
            { type: 'reference', required: false, mandatory: false },
            { type: 'license', required: true, mandatory: true }
          ].map(item => {
            const Icon = getVerificationTypeIcon(item.type as VerificationType);
            return (
              <div key={item.type} className={`p-4 rounded-lg border ${
                item.mandatory ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-5 h-5 ${item.mandatory ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="font-medium text-gray-900 capitalize">{item.type}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {item.mandatory && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">Mandatory</span>
                  )}
                  {item.required && (
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded">Required</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900">Total Cases</h4>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalCases}</p>
          <p className="text-sm text-gray-500 mt-1">This month</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900">Clear Results</h4>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.clearResults}</p>
          <p className="text-sm text-gray-500 mt-1">No issues found</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <h4 className="font-medium text-gray-900">Discrepancies</h4>
          </div>
          <p className="text-3xl font-bold text-orange-600">{stats.discrepancies}</p>
          <p className="text-sm text-gray-500 mt-1">Require review</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <h4 className="font-medium text-gray-900">Avg. TAT</h4>
          </div>
          <p className="text-3xl font-bold text-gray-900">5.8</p>
          <p className="text-sm text-gray-500 mt-1">Days to complete</p>
        </div>
      </div>

      {/* Results Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Results by Check Type</h3>
          <div className="space-y-4">
            {[
              { type: 'Identity', clear: 45, discrepancy: 2, adverse: 0 },
              { type: 'Address', clear: 42, discrepancy: 5, adverse: 0 },
              { type: 'Education', clear: 38, discrepancy: 8, adverse: 1 },
              { type: 'Employment', clear: 35, discrepancy: 10, adverse: 2 },
              { type: 'Criminal', clear: 46, discrepancy: 0, adverse: 1 }
            ].map(item => (
              <div key={item.type} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600">{item.type}</div>
                <div className="flex-1 flex gap-1 h-6">
                  <div 
                    className="bg-green-500 rounded-l"
                    style={{ width: `${(item.clear / 50) * 100}%` }}
                  />
                  <div 
                    className="bg-orange-500"
                    style={{ width: `${(item.discrepancy / 50) * 100}%` }}
                  />
                  <div 
                    className="bg-red-500 rounded-r"
                    style={{ width: `${(item.adverse / 50) * 100}%` }}
                  />
                </div>
                <div className="w-24 text-xs text-right">
                  <span className="text-green-600">{item.clear}</span>
                  <span className="text-gray-400"> / </span>
                  <span className="text-orange-600">{item.discrepancy}</span>
                  <span className="text-gray-400"> / </span>
                  <span className="text-red-600">{item.adverse}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded" /> Clear</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-500 rounded" /> Discrepancy</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded" /> Adverse</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Vendor Performance</h3>
          <div className="space-y-4">
            {mockVendors.filter(v => v.status === 'active').map(vendor => (
              <div key={vendor.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{vendor.name}</p>
                    <p className="text-xs text-gray-500">{vendor.casesCompleted} cases</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{vendor.avgTurnaround} days</p>
                  <p className="text-xs text-green-600">{vendor.accuracy}% accuracy</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Monthly Verification Trend</h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'].map((month, i) => {
            const cases = 20 + Math.floor(Math.random() * 30);
            return (
              <div key={month} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col gap-1">
                  <div 
                    className="w-full bg-green-500 rounded-t"
                    style={{ height: `${cases * 3}px` }}
                  />
                  <div 
                    className="w-full bg-orange-500"
                    style={{ height: `${Math.floor(cases * 0.1) * 3}px` }}
                  />
                </div>
                <span className="text-xs text-gray-500 mt-2">{month}</span>
                <span className="text-xs font-medium text-gray-700">{cases}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Background Verification</h1>
          </div>
          <p className="text-gray-500">Manage employee background checks, vendor integrations, and verification status</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <FileText className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-gray-900">{stats.totalCases}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Total Cases</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <RefreshCw className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-900">{stats.inProgress}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">In Progress</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-gray-900">{stats.clearResults}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Clear</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold text-gray-900">{stats.discrepancies}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Discrepancies</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 border border-gray-200 w-fit">
          {[
            { id: 'cases', label: 'Verification Cases', icon: FileText },
            { id: 'checks', label: 'All Checks', icon: CheckCircle2 },
            { id: 'vendors', label: 'Vendors', icon: Building },
            { id: 'analytics', label: 'Analytics', icon: Shield }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'cases' && renderCases()}
        {activeTab === 'checks' && renderChecks()}
        {activeTab === 'vendors' && renderVendors()}
        {activeTab === 'analytics' && renderAnalytics()}

        {/* Case Detail Modal */}
        {selectedCase && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Verification Case Details</h2>
                  <button onClick={() => setSelectedCase(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <XCircle className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {/* Employee Info */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{selectedCase.employeeName}</h3>
                    <p className="text-sm text-gray-500">{selectedCase.designation}</p>
                    <p className="text-sm text-gray-400">{selectedCase.department} • {selectedCase.employeeId}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCase.status)}`}>
                      {selectedCase.status.replace('-', ' ')}
                    </span>
                    {selectedCase.priority !== 'normal' && (
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getPriorityColor(selectedCase.priority)}`}>
                        {selectedCase.priority.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Case Details */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Case Type</p>
                    <p className="font-medium text-gray-900 capitalize">{selectedCase.caseType.replace('-', ' ')}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Vendor</p>
                    <p className="font-medium text-gray-900">{selectedCase.vendor}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Initiated</p>
                    <p className="font-medium text-gray-900">{new Date(selectedCase.initiatedDate).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>

                {/* Checks List */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Verification Checks</h4>
                  <div className="space-y-3">
                    {selectedCase.checks.map(check => {
                      const CheckIcon = getVerificationTypeIcon(check.type);
                      return (
                        <div key={check.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                          <div className={`p-2 rounded-lg ${getVerificationTypeColor(check.type)}`}>
                            <CheckIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 capitalize">{check.type} Verification</p>
                            <p className="text-sm text-gray-500">{check.vendor || 'Pending assignment'}</p>
                            {check.remarks && (
                              <p className="text-xs text-gray-400 mt-1">{check.remarks}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(check.status)}`}>
                              {check.status}
                            </span>
                            {check.result && (
                              <p className={`text-sm font-medium mt-1 ${getResultColor(check.result)}`}>
                                {check.result === 'clear' ? '✓ Clear' : 
                                 check.result === 'adverse' ? '✗ Adverse' : '⚠ Discrepancy'}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedCase.remarks && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800">Remarks</p>
                        <p className="text-sm text-yellow-700">{selectedCase.remarks}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button onClick={() => setSelectedCase(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Close
                </button>
                <button className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50">
                  Download Report
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Update Case
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
