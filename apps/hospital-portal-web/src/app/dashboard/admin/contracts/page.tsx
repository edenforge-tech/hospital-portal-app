'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Plus,
  Filter,
  Download,
  Upload,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  Building,
  Edit,
  Eye,
  Send,
  RefreshCw,
  FileSignature,
  ChevronDown,
  ChevronUp,
  Printer,
  History,
  AlertTriangle
} from 'lucide-react';

// Types
interface EmploymentContract {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  designation: string;
  branch: string;
  contractType: 'permanent' | 'fixed-term' | 'probationary' | 'consultant' | 'intern';
  startDate: string;
  endDate?: string;
  salary: number;
  templateUsed: string;
  status: 'draft' | 'pending-signature' | 'active' | 'expired' | 'terminated' | 'renewed';
  signedByEmployee: boolean;
  signedByEmployer: boolean;
  employeeSignDate?: string;
  employerSignDate?: string;
  createdAt: string;
  createdBy: string;
  renewalCount: number;
  terms: ContractTerms;
}

interface ContractTerms {
  noticePeriod: number;
  probationPeriod?: number;
  benefits: string[];
  workingHours: string;
  leaveEntitlement: number;
  confidentialityClause: boolean;
  nonCompeteClause: boolean;
  terminationConditions: string;
}

interface ContractTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  isActive: boolean;
  usageCount: number;
}

// Mock Data
const mockContracts: EmploymentContract[] = [
  {
    id: 'CON001',
    employeeId: 'EMP001',
    employeeName: 'Dr. Priya Sharma',
    employeeCode: 'EMP-2024-001',
    department: 'Ophthalmology',
    designation: 'Senior Consultant',
    branch: 'Main Hospital - Koramangala',
    contractType: 'permanent',
    startDate: '2024-01-15',
    salary: 250000,
    templateUsed: 'Senior Doctor Contract',
    status: 'active',
    signedByEmployee: true,
    signedByEmployer: true,
    employeeSignDate: '2024-01-10',
    employerSignDate: '2024-01-12',
    createdAt: '2024-01-05',
    createdBy: 'HR Admin',
    renewalCount: 0,
    terms: {
      noticePeriod: 90,
      benefits: ['Health Insurance', 'Professional Development', 'Conference Allowance'],
      workingHours: '9:00 AM - 6:00 PM (Mon-Sat)',
      leaveEntitlement: 30,
      confidentialityClause: true,
      nonCompeteClause: true,
      terminationConditions: 'As per employment act'
    }
  },
  {
    id: 'CON002',
    employeeId: 'EMP002',
    employeeName: 'Ravi Kumar',
    employeeCode: 'EMP-2024-015',
    department: 'Optometry',
    designation: 'Optometrist',
    branch: 'Main Hospital - Koramangala',
    contractType: 'probationary',
    startDate: '2025-11-01',
    endDate: '2026-05-01',
    salary: 45000,
    templateUsed: 'Probationary Contract',
    status: 'active',
    signedByEmployee: true,
    signedByEmployer: true,
    employeeSignDate: '2025-10-28',
    employerSignDate: '2025-10-29',
    createdAt: '2025-10-25',
    createdBy: 'HR Admin',
    renewalCount: 0,
    terms: {
      noticePeriod: 30,
      probationPeriod: 6,
      benefits: ['Health Insurance'],
      workingHours: '9:00 AM - 6:00 PM (Mon-Sat)',
      leaveEntitlement: 12,
      confidentialityClause: true,
      nonCompeteClause: false,
      terminationConditions: 'Subject to probation review'
    }
  },
  {
    id: 'CON003',
    employeeId: 'EMP003',
    employeeName: 'Lakshmi Devi',
    employeeCode: 'EMP-2024-022',
    department: 'Nursing',
    designation: 'Staff Nurse',
    branch: 'Branch - Whitefield',
    contractType: 'fixed-term',
    startDate: '2025-06-01',
    endDate: '2026-05-31',
    salary: 35000,
    templateUsed: 'Fixed Term Nurse Contract',
    status: 'active',
    signedByEmployee: true,
    signedByEmployer: true,
    employeeSignDate: '2025-05-28',
    employerSignDate: '2025-05-29',
    createdAt: '2025-05-20',
    createdBy: 'HR Admin',
    renewalCount: 1,
    terms: {
      noticePeriod: 30,
      benefits: ['Health Insurance', 'Uniform Allowance'],
      workingHours: 'Shift-based (8 hours)',
      leaveEntitlement: 18,
      confidentialityClause: true,
      nonCompeteClause: false,
      terminationConditions: 'Contract ends on specified date'
    }
  },
  {
    id: 'CON004',
    employeeId: 'EMP004',
    employeeName: 'Dr. Venkat Rao',
    employeeCode: 'EMP-2025-001',
    department: 'Retina',
    designation: 'Consultant',
    branch: 'Main Hospital - Koramangala',
    contractType: 'consultant',
    startDate: '2026-02-01',
    salary: 150000,
    templateUsed: 'Visiting Consultant Contract',
    status: 'pending-signature',
    signedByEmployee: false,
    signedByEmployer: true,
    employerSignDate: '2026-01-25',
    createdAt: '2026-01-20',
    createdBy: 'HR Admin',
    renewalCount: 0,
    terms: {
      noticePeriod: 30,
      benefits: ['Professional Indemnity'],
      workingHours: 'As per schedule (2 days/week)',
      leaveEntitlement: 0,
      confidentialityClause: true,
      nonCompeteClause: true,
      terminationConditions: 'Either party with 30 days notice'
    }
  },
  {
    id: 'CON005',
    employeeId: 'EMP005',
    employeeName: 'Anita Menon',
    employeeCode: 'EMP-2023-045',
    department: 'Front Office',
    designation: 'Patient Coordinator',
    branch: 'Main Hospital - Koramangala',
    contractType: 'permanent',
    startDate: '2023-08-01',
    salary: 28000,
    templateUsed: 'Standard Employment Contract',
    status: 'expired',
    signedByEmployee: true,
    signedByEmployer: true,
    employeeSignDate: '2023-07-28',
    employerSignDate: '2023-07-29',
    createdAt: '2023-07-20',
    createdBy: 'HR Admin',
    renewalCount: 0,
    terms: {
      noticePeriod: 30,
      benefits: ['Health Insurance'],
      workingHours: '9:00 AM - 6:00 PM (Mon-Sat)',
      leaveEntitlement: 18,
      confidentialityClause: true,
      nonCompeteClause: false,
      terminationConditions: 'As per employment act'
    }
  }
];

const mockTemplates: ContractTemplate[] = [
  { id: 'TPL001', name: 'Senior Doctor Contract', type: 'permanent', description: 'For senior medical staff with full benefits', isActive: true, usageCount: 12 },
  { id: 'TPL002', name: 'Standard Employment Contract', type: 'permanent', description: 'General employment contract for permanent staff', isActive: true, usageCount: 45 },
  { id: 'TPL003', name: 'Probationary Contract', type: 'probationary', description: 'For new hires during probation period', isActive: true, usageCount: 28 },
  { id: 'TPL004', name: 'Fixed Term Nurse Contract', type: 'fixed-term', description: 'Fixed term contract for nursing staff', isActive: true, usageCount: 15 },
  { id: 'TPL005', name: 'Visiting Consultant Contract', type: 'consultant', description: 'For visiting/part-time consultants', isActive: true, usageCount: 8 },
  { id: 'TPL006', name: 'Intern Agreement', type: 'intern', description: 'For medical and non-medical interns', isActive: true, usageCount: 20 }
];

// Helper Functions
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'draft': 'bg-gray-100 text-gray-800',
    'pending-signature': 'bg-yellow-100 text-yellow-800',
    'active': 'bg-green-100 text-green-800',
    'expired': 'bg-red-100 text-red-800',
    'terminated': 'bg-red-100 text-red-800',
    'renewed': 'bg-blue-100 text-blue-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'permanent': 'bg-blue-100 text-blue-800',
    'fixed-term': 'bg-purple-100 text-purple-800',
    'probationary': 'bg-orange-100 text-orange-800',
    'consultant': 'bg-teal-100 text-teal-800',
    'intern': 'bg-pink-100 text-pink-800'
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

export default function EmploymentContractsPage() {
  const [activeTab, setActiveTab] = useState<'contracts' | 'templates' | 'expiring'>('contracts');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedContract, setExpandedContract] = useState<string | null>(null);
  const [showNewContractModal, setShowNewContractModal] = useState(false);

  // Filter contracts
  const filteredContracts = mockContracts.filter(contract => {
    const matchesSearch = 
      contract.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || contract.status === filterStatus;
    const matchesType = filterType === 'all' || contract.contractType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Expiring contracts (within 60 days)
  const expiringContracts = mockContracts.filter(contract => {
    if (!contract.endDate) return false;
    const endDate = new Date(contract.endDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 60 && contract.status === 'active';
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileSignature className="h-7 w-7 text-blue-600" />
            Employment Contracts
          </h1>
          <p className="text-gray-600 mt-1">
            Manage employee contracts, templates, and renewals
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewContractModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Contract
          </button>
          <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import
          </button>
        </div>
      </div>

      {/* Alert for Expiring Contracts */}
      {expiringContracts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800">Contracts Expiring Soon</h3>
              <p className="text-sm text-yellow-700 mt-1">
                {expiringContracts.length} contract(s) will expire within the next 60 days. 
                <button onClick={() => setActiveTab('expiring')} className="underline ml-1">View details</button>
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
              <p className="text-sm text-gray-500">Total Contracts</p>
              <p className="text-2xl font-bold text-gray-900">{mockContracts.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {mockContracts.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Signature</p>
              <p className="text-2xl font-bold text-yellow-600">
                {mockContracts.filter(c => c.status === 'pending-signature').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Expiring Soon</p>
              <p className="text-2xl font-bold text-orange-600">{expiringContracts.length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Expired</p>
              <p className="text-2xl font-bold text-red-600">
                {mockContracts.filter(c => c.status === 'expired').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Templates</p>
              <p className="text-2xl font-bold text-purple-600">{mockTemplates.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'contracts', label: 'All Contracts', count: mockContracts.length },
              { id: 'templates', label: 'Templates', count: mockTemplates.length },
              { id: 'expiring', label: 'Expiring Soon', count: expiringContracts.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Contracts Tab */}
        {activeTab === 'contracts' && (
          <div className="p-6">
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, code, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending-signature">Pending Signature</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="terminated">Terminated</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="all">All Types</option>
                <option value="permanent">Permanent</option>
                <option value="fixed-term">Fixed Term</option>
                <option value="probationary">Probationary</option>
                <option value="consultant">Consultant</option>
                <option value="intern">Intern</option>
              </select>
            </div>

            <div className="space-y-3">
              {filteredContracts.map(contract => (
                <div key={contract.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedContract(expandedContract === contract.id ? null : contract.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{contract.employeeName}</span>
                            <span className="text-sm text-gray-500">({contract.employeeCode})</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                            <span>{contract.designation}</span>
                            <span className="text-gray-300">•</span>
                            <span>{contract.department}</span>
                            <span className="text-gray-300">•</span>
                            <span>{contract.branch}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(contract.contractType)}`}>
                          {contract.contractType}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                          {contract.status.replace('-', ' ')}
                        </span>
                        {expandedContract === contract.id ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedContract === contract.id && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-800 mb-3">Contract Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Start Date:</span>
                              <span className="font-medium">{formatDate(contract.startDate)}</span>
                            </div>
                            {contract.endDate && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">End Date:</span>
                                <span className="font-medium">{formatDate(contract.endDate)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-500">Salary:</span>
                              <span className="font-medium">{formatCurrency(contract.salary)}/month</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Template:</span>
                              <span className="font-medium">{contract.templateUsed}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Renewals:</span>
                              <span className="font-medium">{contract.renewalCount}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 mb-3">Terms & Conditions</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Notice Period:</span>
                              <span className="font-medium">{contract.terms.noticePeriod} days</span>
                            </div>
                            {contract.terms.probationPeriod && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Probation:</span>
                                <span className="font-medium">{contract.terms.probationPeriod} months</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-500">Leave Entitlement:</span>
                              <span className="font-medium">{contract.terms.leaveEntitlement} days/year</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Working Hours:</span>
                              <span className="font-medium text-xs">{contract.terms.workingHours}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 mb-3">Signature Status</h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              {contract.signedByEmployer ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : (
                                <Clock className="h-5 w-5 text-yellow-600" />
                              )}
                              <span className="text-sm">
                                Employer: {contract.signedByEmployer ? `Signed ${formatDate(contract.employerSignDate!)}` : 'Pending'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {contract.signedByEmployee ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : (
                                <Clock className="h-5 w-5 text-yellow-600" />
                              )}
                              <span className="text-sm">
                                Employee: {contract.signedByEmployee ? `Signed ${formatDate(contract.employeeSignDate!)}` : 'Pending'}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Benefits:</h5>
                            <div className="flex flex-wrap gap-1">
                              {contract.terms.benefits.map((benefit, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                  {benefit}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2 pt-4 border-t border-gray-200">
                        <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          View Document
                        </button>
                        {contract.status === 'pending-signature' && (
                          <button className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-1">
                            <Send className="h-4 w-4" />
                            Send Reminder
                          </button>
                        )}
                        {(contract.status === 'active' || contract.status === 'expired') && (
                          <button className="px-3 py-1.5 border border-blue-200 text-blue-700 text-sm rounded-lg hover:bg-blue-50 flex items-center gap-1">
                            <RefreshCw className="h-4 w-4" />
                            Renew Contract
                          </button>
                        )}
                        <button className="px-3 py-1.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-1">
                          <Printer className="h-4 w-4" />
                          Print
                        </button>
                        <button className="px-3 py-1.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-1">
                          <History className="h-4 w-4" />
                          History
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="p-6">
            <div className="flex justify-between mb-6">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Template
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockTemplates.map(template => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FileText className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{template.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(template.type)}`}>
                          {template.type}
                        </span>
                      </div>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-xs ${template.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">{template.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Used {template.usageCount} times</span>
                    <div className="flex gap-2">
                      <button className="p-1.5 hover:bg-gray-100 rounded">
                        <Eye className="h-4 w-4 text-gray-500" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded">
                        <Edit className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expiring Tab */}
        {activeTab === 'expiring' && (
          <div className="p-6">
            {expiringContracts.length > 0 ? (
              <div className="space-y-3">
                {expiringContracts.map(contract => {
                  const endDate = new Date(contract.endDate!);
                  const today = new Date();
                  const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={contract.id} className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-orange-100 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{contract.employeeName}</span>
                              <span className="text-sm text-gray-500">({contract.employeeCode})</span>
                            </div>
                            <p className="text-sm text-gray-600">{contract.designation} • {contract.department}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-orange-600">{daysUntilExpiry} days</p>
                          <p className="text-sm text-gray-600">Expires: {formatDate(contract.endDate!)}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1">
                          <RefreshCw className="h-4 w-4" />
                          Initiate Renewal
                        </button>
                        <button className="px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-white flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          View Contract
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">No Expiring Contracts</h3>
                <p className="text-gray-600 mt-1">All contracts are up to date. No renewals needed in the next 60 days.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Contract Modal */}
      {showNewContractModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Create New Contract</h2>
                <button onClick={() => setShowNewContractModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                    <option>Select Employee</option>
                    <option>Dr. Priya Sharma (EMP-2024-001)</option>
                    <option>Ravi Kumar (EMP-2024-015)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Template</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                    <option>Select Template</option>
                    {mockTemplates.map(t => (
                      <option key={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                    <option value="permanent">Permanent</option>
                    <option value="fixed-term">Fixed Term</option>
                    <option value="probationary">Probationary</option>
                    <option value="consultant">Consultant</option>
                    <option value="intern">Intern</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Salary (₹)</label>
                  <input type="number" className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="e.g., 50000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date (if applicable)</label>
                  <input type="date" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notice Period (days)</label>
                  <input type="number" className="w-full px-4 py-2 border border-gray-200 rounded-lg" defaultValue={30} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Probation Period (months)</label>
                  <input type="number" className="w-full px-4 py-2 border border-gray-200 rounded-lg" defaultValue={6} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Terms</label>
                <textarea rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="Any additional terms or conditions..." />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setShowNewContractModal(false)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                Save as Draft
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Create & Send for Signature
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
