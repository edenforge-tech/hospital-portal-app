'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  Shield,
  FileText,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Plus,
  Eye,
  Edit,
  AlertCircle,
  Building,
  Calendar,
  User,
  Phone,
  Mail,
  Download,
  Upload,
  Filter,
  RefreshCw,
  Send,
  FileCheck,
  Receipt,
  CreditCard,
  TrendingUp,
  TrendingDown,
  ClipboardCheck,
  AlertTriangle,
  History,
  Paperclip,
} from 'lucide-react';

// Types
interface InsurancePolicy {
  id: string;
  patientName: string;
  patientMRN: string;
  insuranceCompany: string;
  policyNumber: string;
  groupNumber?: string;
  memberID: string;
  policyType: 'individual' | 'corporate' | 'government' | 'tpa';
  coverageType: 'cashless' | 'reimbursement' | 'both';
  validFrom: string;
  validTo: string;
  sumInsured: number;
  availableBalance: number;
  status: 'active' | 'expired' | 'pending-verification' | 'suspended';
  primaryHolder: string;
  relationship: 'self' | 'spouse' | 'child' | 'parent' | 'other';
  networkStatus: 'in-network' | 'out-network' | 'unknown';
  verifiedAt?: string;
  documents: string[];
}

interface PreAuthorization {
  id: string;
  patientName: string;
  patientMRN: string;
  insuranceCompany: string;
  policyNumber: string;
  preAuthNumber?: string;
  procedure: string;
  procedureCode: string;
  estimatedCost: number;
  requestedAmount: number;
  approvedAmount?: number;
  submissionDate: string;
  expiryDate?: string;
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'partially-approved' | 'rejected' | 'expired';
  remarks?: string;
  surgeon: string;
  scheduledDate?: string;
  documents: string[];
  timeline: TimelineEvent[];
}

interface InsuranceClaim {
  id: string;
  claimNumber: string;
  patientName: string;
  patientMRN: string;
  insuranceCompany: string;
  policyNumber: string;
  preAuthNumber?: string;
  procedure: string;
  admissionDate: string;
  dischargeDate?: string;
  totalBill: number;
  claimAmount: number;
  approvedAmount?: number;
  settledAmount?: number;
  patientShare: number;
  submissionDate: string;
  status: 'draft' | 'submitted' | 'under-process' | 'query-raised' | 'approved' | 'partially-approved' | 'rejected' | 'settled';
  claimType: 'cashless' | 'reimbursement';
  documents: string[];
  queries?: ClaimQuery[];
  timeline: TimelineEvent[];
}

interface TimelineEvent {
  date: string;
  event: string;
  user: string;
  notes?: string;
}

interface ClaimQuery {
  id: string;
  raisedDate: string;
  query: string;
  response?: string;
  responseDate?: string;
  status: 'pending' | 'responded';
}

interface InsuranceStats {
  activePolicies: number;
  pendingVerifications: number;
  preAuthsPending: number;
  claimsInProcess: number;
  totalClaimsValue: number;
  approvalRate: number;
  avgProcessingDays: number;
  queriesRaised: number;
}

// Mock Data
const mockPolicies: InsurancePolicy[] = [
  {
    id: '1',
    patientName: 'Rajesh Kumar',
    patientMRN: 'MRN-2024-001',
    insuranceCompany: 'Star Health Insurance',
    policyNumber: 'SH-2024-123456',
    groupNumber: 'GRP-TECH-001',
    memberID: 'MEM-001234',
    policyType: 'corporate',
    coverageType: 'cashless',
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
    sumInsured: 500000,
    availableBalance: 450000,
    status: 'active',
    primaryHolder: 'Rajesh Kumar',
    relationship: 'self',
    networkStatus: 'in-network',
    verifiedAt: '2026-01-28',
    documents: ['policy_doc.pdf', 'id_card.pdf'],
  },
  {
    id: '2',
    patientName: 'Sunita Devi',
    patientMRN: 'MRN-2024-002',
    insuranceCompany: 'ICICI Lombard',
    policyNumber: 'ICICI-2024-789012',
    memberID: 'MEM-789012',
    policyType: 'individual',
    coverageType: 'both',
    validFrom: '2024-04-01',
    validTo: '2025-03-31',
    sumInsured: 1000000,
    availableBalance: 980000,
    status: 'pending-verification',
    primaryHolder: 'Ramesh Devi',
    relationship: 'spouse',
    networkStatus: 'in-network',
    documents: ['policy_doc.pdf'],
  },
  {
    id: '3',
    patientName: 'Vikram Reddy',
    patientMRN: 'MRN-2024-005',
    insuranceCompany: 'Max Bupa',
    policyNumber: 'MB-2024-345678',
    memberID: 'MEM-345678',
    policyType: 'individual',
    coverageType: 'cashless',
    validFrom: '2024-06-01',
    validTo: '2025-05-31',
    sumInsured: 750000,
    availableBalance: 700000,
    status: 'active',
    primaryHolder: 'Vikram Reddy',
    relationship: 'self',
    networkStatus: 'in-network',
    verifiedAt: '2026-01-27',
    documents: ['policy_doc.pdf', 'id_card.pdf', 'kyc.pdf'],
  },
];

const mockPreAuths: PreAuthorization[] = [
  {
    id: '1',
    patientName: 'Rajesh Kumar',
    patientMRN: 'MRN-2024-001',
    insuranceCompany: 'Star Health Insurance',
    policyNumber: 'SH-2024-123456',
    preAuthNumber: 'PA-2026-001234',
    procedure: 'Cataract Surgery (Phaco + Premium IOL)',
    procedureCode: 'CPT-66984',
    estimatedCost: 85000,
    requestedAmount: 50000,
    approvedAmount: 45000,
    submissionDate: '2026-01-25',
    expiryDate: '2026-02-25',
    status: 'approved',
    surgeon: 'Dr. Arun Mehta',
    scheduledDate: '2026-02-01',
    documents: ['pre_auth_form.pdf', 'medical_report.pdf'],
    timeline: [
      { date: '2026-01-25', event: 'Pre-auth submitted', user: 'Insurance Desk' },
      { date: '2026-01-26', event: 'Under review', user: 'Star Health' },
      { date: '2026-01-27', event: 'Approved with ₹45,000', user: 'Star Health' },
    ],
  },
  {
    id: '2',
    patientName: 'Vikram Reddy',
    patientMRN: 'MRN-2024-005',
    insuranceCompany: 'Max Bupa',
    policyNumber: 'MB-2024-345678',
    procedure: 'Vitrectomy',
    procedureCode: 'CPT-67036',
    estimatedCost: 120000,
    requestedAmount: 80000,
    submissionDate: '2026-01-28',
    status: 'submitted',
    surgeon: 'Dr. Suresh Rao',
    documents: ['pre_auth_form.pdf', 'oct_report.pdf', 'fundus_images.pdf'],
    timeline: [
      { date: '2026-01-28', event: 'Pre-auth submitted', user: 'Insurance Desk' },
    ],
  },
  {
    id: '3',
    patientName: 'Amit Singh',
    patientMRN: 'MRN-2024-003',
    insuranceCompany: 'HDFC ERGO',
    policyNumber: 'HE-2024-567890',
    procedure: 'Glaucoma Surgery (Trabeculectomy)',
    procedureCode: 'CPT-66170',
    estimatedCost: 75000,
    requestedAmount: 60000,
    submissionDate: '2026-01-27',
    status: 'under-review',
    surgeon: 'Dr. Arun Mehta',
    documents: ['pre_auth_form.pdf', 'visual_field_report.pdf'],
    timeline: [
      { date: '2026-01-27', event: 'Pre-auth submitted', user: 'Insurance Desk' },
      { date: '2026-01-28', event: 'Under review', user: 'HDFC ERGO' },
    ],
  },
];

const mockClaims: InsuranceClaim[] = [
  {
    id: '1',
    claimNumber: 'CLM-2026-001234',
    patientName: 'Meera Patel',
    patientMRN: 'MRN-2024-004',
    insuranceCompany: 'New India Assurance',
    policyNumber: 'NIA-2024-234567',
    preAuthNumber: 'PA-2026-000987',
    procedure: 'Retinal Detachment Surgery',
    admissionDate: '2026-01-20',
    dischargeDate: '2026-01-22',
    totalBill: 95000,
    claimAmount: 80000,
    approvedAmount: 75000,
    settledAmount: 75000,
    patientShare: 20000,
    submissionDate: '2026-01-23',
    status: 'settled',
    claimType: 'cashless',
    documents: ['final_bill.pdf', 'discharge_summary.pdf', 'op_notes.pdf'],
    timeline: [
      { date: '2026-01-23', event: 'Claim submitted', user: 'Insurance Desk' },
      { date: '2026-01-24', event: 'Under process', user: 'New India Assurance' },
      { date: '2026-01-25', event: 'Approved - ₹75,000', user: 'New India Assurance' },
      { date: '2026-01-26', event: 'Settled', user: 'Accounts' },
    ],
  },
  {
    id: '2',
    claimNumber: 'CLM-2026-001235',
    patientName: 'Rajesh Kumar',
    patientMRN: 'MRN-2024-001',
    insuranceCompany: 'Star Health Insurance',
    policyNumber: 'SH-2024-123456',
    preAuthNumber: 'PA-2026-001234',
    procedure: 'Cataract Surgery (Phaco + Premium IOL)',
    admissionDate: '2026-01-28',
    totalBill: 85000,
    claimAmount: 50000,
    patientShare: 35000,
    submissionDate: '2026-01-28',
    status: 'under-process',
    claimType: 'cashless',
    documents: ['admission_form.pdf'],
    timeline: [
      { date: '2026-01-28', event: 'Claim initiated', user: 'Insurance Desk' },
    ],
  },
  {
    id: '3',
    claimNumber: 'CLM-2026-001230',
    patientName: 'Priya Sharma',
    patientMRN: 'MRN-2024-006',
    insuranceCompany: 'Bajaj Allianz',
    policyNumber: 'BA-2024-112233',
    procedure: 'LASIK Surgery',
    admissionDate: '2026-01-15',
    dischargeDate: '2026-01-15',
    totalBill: 65000,
    claimAmount: 50000,
    patientShare: 15000,
    submissionDate: '2026-01-18',
    status: 'query-raised',
    claimType: 'reimbursement',
    documents: ['bill.pdf', 'discharge_summary.pdf'],
    queries: [
      {
        id: 'Q1',
        raisedDate: '2026-01-20',
        query: 'Please provide the original prescription and medical necessity certificate.',
        status: 'pending',
      },
    ],
    timeline: [
      { date: '2026-01-18', event: 'Claim submitted', user: 'Insurance Desk' },
      { date: '2026-01-19', event: 'Under process', user: 'Bajaj Allianz' },
      { date: '2026-01-20', event: 'Query raised', user: 'Bajaj Allianz' },
    ],
  },
];

// Helper functions
const getPolicyStatusColor = (status: InsurancePolicy['status']) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'expired': return 'bg-red-100 text-red-800';
    case 'pending-verification': return 'bg-yellow-100 text-yellow-800';
    case 'suspended': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPreAuthStatusColor = (status: PreAuthorization['status']) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800';
    case 'submitted': return 'bg-blue-100 text-blue-800';
    case 'under-review': return 'bg-yellow-100 text-yellow-800';
    case 'approved': return 'bg-green-100 text-green-800';
    case 'partially-approved': return 'bg-orange-100 text-orange-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'expired': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getClaimStatusColor = (status: InsuranceClaim['status']) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800';
    case 'submitted': return 'bg-blue-100 text-blue-800';
    case 'under-process': return 'bg-yellow-100 text-yellow-800';
    case 'query-raised': return 'bg-orange-100 text-orange-800';
    case 'approved': return 'bg-green-100 text-green-800';
    case 'partially-approved': return 'bg-emerald-100 text-emerald-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'settled': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function InsuranceDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'policies' | 'preauth' | 'claims'>('policies');
  const [policies, setPolicies] = useState<InsurancePolicy[]>(mockPolicies);
  const [preAuths, setPreAuths] = useState<PreAuthorization[]>(mockPreAuths);
  const [claims, setClaims] = useState<InsuranceClaim[]>(mockClaims);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showPreAuthModal, setShowPreAuthModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [stats, setStats] = useState<InsuranceStats>({
    activePolicies: 3,
    pendingVerifications: 1,
    preAuthsPending: 2,
    claimsInProcess: 2,
    totalClaimsValue: 245000,
    approvalRate: 85,
    avgProcessingDays: 3.5,
    queriesRaised: 1,
  });

  // Filter policies
  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = 
      policy.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.patientMRN.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || policy.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter pre-auths
  const filteredPreAuths = preAuths.filter(preAuth => {
    const matchesSearch = 
      preAuth.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      preAuth.patientMRN.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (preAuth.preAuthNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === 'all' || preAuth.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter claims
  const filteredClaims = claims.filter(claim => {
    const matchesSearch = 
      claim.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.patientMRN.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <ProtectedRoute requiredPermissions={['insurance.view']}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Insurance Management</h1>
            <p className="text-gray-600 mt-1">
              Policy Verification, Pre-Authorization & Claims Processing
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowVerifyModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Verify Policy
            </button>
            <button 
              onClick={() => setShowPreAuthModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
            >
              <FileCheck className="h-4 w-4" />
              New Pre-Auth
            </button>
            <button 
              onClick={() => setShowClaimModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Receipt className="h-4 w-4" />
              New Claim
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Active Policies</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.activePolicies}</p>
                <p className="text-xs text-yellow-600 mt-1">{stats.pendingVerifications} pending</p>
              </div>
              <Shield className="h-8 w-8 text-green-500 opacity-30" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Pre-Auths Pending</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.preAuthsPending}</p>
                <p className="text-xs text-green-600 mt-1">{stats.approvalRate}% approval rate</p>
              </div>
              <FileCheck className="h-8 w-8 text-blue-500 opacity-30" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Claims in Process</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{stats.claimsInProcess}</p>
                <p className="text-xs text-orange-600 mt-1">{stats.queriesRaised} queries raised</p>
              </div>
              <Receipt className="h-8 w-8 text-purple-500 opacity-30" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Total Claims Value</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(stats.totalClaimsValue)}</p>
                <p className="text-xs text-gray-500 mt-1">Avg {stats.avgProcessingDays} days</p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-500 opacity-30" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => { setActiveTab('policies'); setStatusFilter('all'); }}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'policies'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Shield className="h-4 w-4" />
              Patient Policies
            </button>
            <button
              onClick={() => { setActiveTab('preauth'); setStatusFilter('all'); }}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'preauth'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileCheck className="h-4 w-4" />
              Pre-Authorization
              {preAuths.filter(p => p.status === 'submitted' || p.status === 'under-review').length > 0 && (
                <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {preAuths.filter(p => p.status === 'submitted' || p.status === 'under-review').length}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('claims'); setStatusFilter('all'); }}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'claims'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Receipt className="h-4 w-4" />
              Claims
              {claims.filter(c => c.status === 'query-raised').length > 0 && (
                <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {claims.filter(c => c.status === 'query-raised').length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient, MRN, policy or claim number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            {activeTab === 'policies' && (
              <>
                <option value="active">Active</option>
                <option value="pending-verification">Pending Verification</option>
                <option value="expired">Expired</option>
                <option value="suspended">Suspended</option>
              </>
            )}
            {activeTab === 'preauth' && (
              <>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="under-review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </>
            )}
            {activeTab === 'claims' && (
              <>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="under-process">Under Process</option>
                <option value="query-raised">Query Raised</option>
                <option value="approved">Approved</option>
                <option value="settled">Settled</option>
                <option value="rejected">Rejected</option>
              </>
            )}
          </select>

          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Policies Tab */}
        {activeTab === 'policies' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient / Policy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Insurance Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coverage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sum Insured / Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPolicies.map((policy) => (
                  <tr key={policy.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{policy.patientName}</div>
                          <div className="text-sm text-gray-500">{policy.patientMRN}</div>
                          <div className="text-xs text-gray-400">{policy.policyNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-900">{policy.insuranceCompany}</div>
                          <div className="text-xs text-gray-500">Member: {policy.memberID}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          policy.policyType === 'corporate' ? 'bg-blue-100 text-blue-800' :
                          policy.policyType === 'government' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {policy.policyType}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          policy.coverageType === 'cashless' ? 'bg-green-100 text-green-800' :
                          policy.coverageType === 'reimbursement' ? 'bg-orange-100 text-orange-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {policy.coverageType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-gray-900 font-medium">
                          {formatCurrency(policy.sumInsured)}
                        </div>
                        <div className="text-green-600 text-xs">
                          Available: {formatCurrency(policy.availableBalance)}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-green-500 h-1.5 rounded-full" 
                            style={{ width: `${(policy.availableBalance / policy.sumInsured) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="text-gray-900">{formatDate(policy.validFrom)}</div>
                      <div className="text-gray-500">to {formatDate(policy.validTo)}</div>
                      {policy.networkStatus === 'in-network' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          In-Network
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPolicyStatusColor(policy.status)}`}>
                        {policy.status.replace('-', ' ')}
                      </span>
                      {policy.verifiedAt && (
                        <div className="text-xs text-gray-500 mt-1">
                          Verified: {formatDate(policy.verifiedAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {policy.status === 'pending-verification' && (
                          <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                            <Shield className="h-4 w-4" />
                            Verify
                          </button>
                        )}
                        <button className="text-gray-600 hover:text-gray-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Paperclip className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPolicies.length === 0 && (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No policies found</p>
              </div>
            )}
          </div>
        )}

        {/* Pre-Authorization Tab */}
        {activeTab === 'preauth' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient / Pre-Auth #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Procedure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Insurance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPreAuths.map((preAuth) => (
                  <tr key={preAuth.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <FileCheck className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{preAuth.patientName}</div>
                          <div className="text-sm text-gray-500">{preAuth.patientMRN}</div>
                          {preAuth.preAuthNumber && (
                            <div className="text-xs text-blue-600 font-mono">{preAuth.preAuthNumber}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{preAuth.procedure}</div>
                      <div className="text-xs text-gray-500">{preAuth.procedureCode}</div>
                      <div className="text-xs text-gray-400">Surgeon: {preAuth.surgeon}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{preAuth.insuranceCompany}</div>
                      <div className="text-xs text-gray-500">{preAuth.policyNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-gray-500">Est: {formatCurrency(preAuth.estimatedCost)}</div>
                        <div className="text-blue-600">Req: {formatCurrency(preAuth.requestedAmount)}</div>
                        {preAuth.approvedAmount && (
                          <div className="text-green-600 font-medium">App: {formatCurrency(preAuth.approvedAmount)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {preAuth.scheduledDate ? (
                        <div className="flex items-center gap-1 text-gray-900">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDate(preAuth.scheduledDate)}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not scheduled</span>
                      )}
                      {preAuth.expiryDate && (
                        <div className="text-xs text-orange-600 mt-1">
                          Expires: {formatDate(preAuth.expiryDate)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPreAuthStatusColor(preAuth.status)}`}>
                        {preAuth.status.replace('-', ' ')}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(preAuth.submissionDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {preAuth.status === 'draft' && (
                          <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                            <Send className="h-4 w-4" />
                            Submit
                          </button>
                        )}
                        <button className="text-gray-600 hover:text-gray-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <History className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPreAuths.length === 0 && (
              <div className="text-center py-12">
                <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No pre-authorizations found</p>
              </div>
            )}
          </div>
        )}

        {/* Claims Tab */}
        {activeTab === 'claims' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient / Claim #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Procedure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amounts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClaims.map((claim) => (
                  <tr key={claim.id} className={`hover:bg-gray-50 ${claim.status === 'query-raised' ? 'bg-orange-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <Receipt className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{claim.patientName}</div>
                          <div className="text-sm text-gray-500">{claim.patientMRN}</div>
                          <div className="text-xs text-purple-600 font-mono">{claim.claimNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{claim.procedure}</div>
                      <div className="text-xs text-gray-500">{claim.insuranceCompany}</div>
                      {claim.preAuthNumber && (
                        <div className="text-xs text-blue-600">PA: {claim.preAuthNumber}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="text-gray-900">Adm: {formatDate(claim.admissionDate)}</div>
                      {claim.dischargeDate && (
                        <div className="text-gray-500">Dis: {formatDate(claim.dischargeDate)}</div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        Filed: {formatDate(claim.submissionDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-gray-900">Bill: {formatCurrency(claim.totalBill)}</div>
                        <div className="text-blue-600">Claim: {formatCurrency(claim.claimAmount)}</div>
                        {claim.approvedAmount && (
                          <div className="text-green-600">Approved: {formatCurrency(claim.approvedAmount)}</div>
                        )}
                        <div className="text-orange-600 text-xs">Patient: {formatCurrency(claim.patientShare)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        claim.claimType === 'cashless' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {claim.claimType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getClaimStatusColor(claim.status)}`}>
                        {claim.status === 'query-raised' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {claim.status.replace('-', ' ')}
                      </span>
                      {claim.queries && claim.queries.filter(q => q.status === 'pending').length > 0 && (
                        <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {claim.queries.filter(q => q.status === 'pending').length} pending query
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {claim.status === 'query-raised' && (
                          <button className="text-orange-600 hover:text-orange-900 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            Respond
                          </button>
                        )}
                        {claim.status === 'draft' && (
                          <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                            <Send className="h-4 w-4" />
                            Submit
                          </button>
                        )}
                        <button className="text-gray-600 hover:text-gray-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredClaims.length === 0 && (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No claims found</p>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions Panel */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Shield className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm text-gray-700">Verify Policy</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <FileCheck className="h-8 w-8 text-emerald-600 mb-2" />
              <span className="text-sm text-gray-700">Submit Pre-Auth</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Receipt className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm text-gray-700">File Claim</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <AlertCircle className="h-8 w-8 text-orange-600 mb-2" />
              <span className="text-sm text-gray-700">Respond to Query</span>
            </button>
          </div>
        </div>

        {/* Verify Policy Modal */}
        {showVerifyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Verify Insurance Policy</h2>
                <button onClick={() => setShowVerifyModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient MRN *</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Company *</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select company</option>
                    <option value="star">Star Health Insurance</option>
                    <option value="icici">ICICI Lombard</option>
                    <option value="hdfc">HDFC ERGO</option>
                    <option value="max">Max Bupa</option>
                    <option value="bajaj">Bajaj Allianz</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number *</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Member ID *</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Policy Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="individual">Individual</option>
                    <option value="corporate">Corporate</option>
                    <option value="government">Government</option>
                    <option value="tpa">TPA</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Policy Document</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click or drag to upload</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Verify Policy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pre-Auth Modal */}
        {showPreAuthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">New Pre-Authorization Request</h2>
                <button onClick={() => setShowPreAuthModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number *</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Procedure *</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., Cataract Surgery (Phaco + IOL)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Procedure Code</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., CPT-66984" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surgeon *</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select surgeon</option>
                    <option value="dr-mehta">Dr. Arun Mehta</option>
                    <option value="dr-nair">Dr. Priya Nair</option>
                    <option value="dr-rao">Dr. Suresh Rao</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost *</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="₹" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requested Amount *</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="₹" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Documents</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Medical reports, OCT scans, etc.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowPreAuthModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Save as Draft
                </button>
                <button
                  onClick={() => setShowPreAuthModal(false)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Submit Pre-Auth
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Claim Modal */}
        {showClaimModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">New Insurance Claim</h2>
                <button onClick={() => setShowClaimModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number *</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pre-Auth Number</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Claim Type *</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="cashless">Cashless</option>
                    <option value="reimbursement">Reimbursement</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Procedure *</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date *</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discharge Date</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Bill *</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="₹" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Claim Amount *</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="₹" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Documents *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Final bill, discharge summary, OP notes</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Save as Draft
                </button>
                <button
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Submit Claim
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
