'use client';

import React, { useState } from 'react';
import { 
  Heart, 
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
  Building,
  Shield,
  Wallet,
  Gift,
  Activity,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  CreditCard,
  Home,
  Car,
  GraduationCap,
  Baby,
  Plane,
  Coffee,
  IndianRupee
} from 'lucide-react';

// Types
interface BenefitPlan {
  id: string;
  name: string;
  category: 'health' | 'insurance' | 'retirement' | 'allowance' | 'leave' | 'wellness' | 'other';
  description: string;
  coverage: string;
  eligibility: string;
  employerContribution: number;
  employeeContribution: number;
  isActive: boolean;
  enrolledCount: number;
}

interface EmployeeBenefit {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  designation: string;
  enrolledBenefits: EnrolledBenefit[];
  totalBenefitValue: number;
  lastUpdated: string;
}

interface EnrolledBenefit {
  planId: string;
  planName: string;
  category: string;
  enrollmentDate: string;
  status: 'active' | 'pending' | 'cancelled' | 'expired';
  coverageAmount: number;
  employeeContribution: number;
  employerContribution: number;
  dependents?: string[];
  validUntil?: string;
}

interface BenefitClaim {
  id: string;
  employeeId: string;
  employeeName: string;
  benefitType: string;
  claimAmount: number;
  claimDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  description: string;
  documents: string[];
}

// Mock Data
const mockBenefitPlans: BenefitPlan[] = [
  {
    id: 'BP001',
    name: 'Group Health Insurance',
    category: 'health',
    description: 'Comprehensive health insurance for employees and dependents',
    coverage: 'Up to ₹5,00,000 per annum',
    eligibility: 'All permanent employees',
    employerContribution: 80,
    employeeContribution: 20,
    isActive: true,
    enrolledCount: 145
  },
  {
    id: 'BP002',
    name: 'Term Life Insurance',
    category: 'insurance',
    description: 'Life insurance coverage for employees',
    coverage: '24x Monthly Salary',
    eligibility: 'All permanent employees',
    employerContribution: 100,
    employeeContribution: 0,
    isActive: true,
    enrolledCount: 160
  },
  {
    id: 'BP003',
    name: 'Provident Fund (PF)',
    category: 'retirement',
    description: 'Mandatory retirement savings scheme',
    coverage: '12% of Basic + DA',
    eligibility: 'All employees',
    employerContribution: 50,
    employeeContribution: 50,
    isActive: true,
    enrolledCount: 165
  },
  {
    id: 'BP004',
    name: 'House Rent Allowance',
    category: 'allowance',
    description: 'Monthly housing allowance',
    coverage: '40% of Basic Salary',
    eligibility: 'All permanent employees',
    employerContribution: 100,
    employeeContribution: 0,
    isActive: true,
    enrolledCount: 158
  },
  {
    id: 'BP005',
    name: 'Medical Reimbursement',
    category: 'health',
    description: 'Reimbursement for medical expenses not covered by insurance',
    coverage: 'Up to ₹15,000 per annum',
    eligibility: 'All permanent employees',
    employerContribution: 100,
    employeeContribution: 0,
    isActive: true,
    enrolledCount: 152
  },
  {
    id: 'BP006',
    name: 'Transport Allowance',
    category: 'allowance',
    description: 'Monthly conveyance allowance',
    coverage: '₹3,200 per month',
    eligibility: 'All employees',
    employerContribution: 100,
    employeeContribution: 0,
    isActive: true,
    enrolledCount: 165
  },
  {
    id: 'BP007',
    name: 'Meal Vouchers',
    category: 'allowance',
    description: 'Tax-free meal vouchers',
    coverage: '₹2,200 per month',
    eligibility: 'All employees',
    employerContribution: 100,
    employeeContribution: 0,
    isActive: true,
    enrolledCount: 140
  },
  {
    id: 'BP008',
    name: 'Education Assistance',
    category: 'other',
    description: 'Support for professional development and education',
    coverage: 'Up to ₹50,000 per annum',
    eligibility: 'Employees with 2+ years tenure',
    employerContribution: 100,
    employeeContribution: 0,
    isActive: true,
    enrolledCount: 45
  },
  {
    id: 'BP009',
    name: 'Gym & Wellness',
    category: 'wellness',
    description: 'Gym membership and wellness program subsidy',
    coverage: 'Up to ₹12,000 per annum',
    eligibility: 'All permanent employees',
    employerContribution: 100,
    employeeContribution: 0,
    isActive: true,
    enrolledCount: 78
  }
];

const mockEmployeeBenefits: EmployeeBenefit[] = [
  {
    id: 'EB001',
    employeeId: 'EMP001',
    employeeName: 'Dr. Rajesh Kumar',
    employeeCode: 'EMP-2020-001',
    department: 'Ophthalmology',
    designation: 'Senior Ophthalmologist',
    totalBenefitValue: 285000,
    lastUpdated: '2026-01-15',
    enrolledBenefits: [
      { planId: 'BP001', planName: 'Group Health Insurance', category: 'health', enrollmentDate: '2020-03-01', status: 'active', coverageAmount: 500000, employeeContribution: 2000, employerContribution: 8000, dependents: ['Spouse', 'Child 1', 'Child 2'], validUntil: '2027-03-01' },
      { planId: 'BP002', planName: 'Term Life Insurance', category: 'insurance', enrollmentDate: '2020-03-01', status: 'active', coverageAmount: 3600000, employeeContribution: 0, employerContribution: 5000 },
      { planId: 'BP003', planName: 'Provident Fund', category: 'retirement', enrollmentDate: '2020-03-01', status: 'active', coverageAmount: 15000, employeeContribution: 7500, employerContribution: 7500 },
      { planId: 'BP004', planName: 'House Rent Allowance', category: 'allowance', enrollmentDate: '2020-03-01', status: 'active', coverageAmount: 30000, employeeContribution: 0, employerContribution: 30000 }
    ]
  },
  {
    id: 'EB002',
    employeeId: 'EMP005',
    employeeName: 'Priya Sharma',
    employeeCode: 'EMP-2021-005',
    department: 'Nursing',
    designation: 'Head Nurse',
    totalBenefitValue: 156000,
    lastUpdated: '2026-01-10',
    enrolledBenefits: [
      { planId: 'BP001', planName: 'Group Health Insurance', category: 'health', enrollmentDate: '2021-06-01', status: 'active', coverageAmount: 500000, employeeContribution: 1500, employerContribution: 6000, dependents: ['Spouse'] },
      { planId: 'BP002', planName: 'Term Life Insurance', category: 'insurance', enrollmentDate: '2021-06-01', status: 'active', coverageAmount: 1200000, employeeContribution: 0, employerContribution: 2000 },
      { planId: 'BP003', planName: 'Provident Fund', category: 'retirement', enrollmentDate: '2021-06-01', status: 'active', coverageAmount: 6000, employeeContribution: 3000, employerContribution: 3000 }
    ]
  }
];

const mockClaims: BenefitClaim[] = [
  { id: 'CLM001', employeeId: 'EMP003', employeeName: 'Arun Patel', benefitType: 'Medical Reimbursement', claimAmount: 8500, claimDate: '2026-01-18', status: 'pending', description: 'OPD consultation and lab tests', documents: ['receipt.pdf', 'prescription.pdf'] },
  { id: 'CLM002', employeeId: 'EMP007', employeeName: 'Sunita Reddy', benefitType: 'Education Assistance', claimAmount: 25000, claimDate: '2026-01-15', status: 'approved', description: 'Advanced Nursing Certification Course', documents: ['fee_receipt.pdf', 'course_certificate.pdf'] },
  { id: 'CLM003', employeeId: 'EMP012', employeeName: 'Vikram Singh', benefitType: 'Gym & Wellness', claimAmount: 6000, claimDate: '2026-01-10', status: 'paid', description: 'Gym membership - 6 months', documents: ['gym_invoice.pdf'] },
  { id: 'CLM004', employeeId: 'EMP015', employeeName: 'Meera Nair', benefitType: 'Medical Reimbursement', claimAmount: 12500, claimDate: '2026-01-05', status: 'rejected', description: 'Dental treatment', documents: ['dental_bill.pdf'] }
];

// Helper Functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getCategoryIcon = (category: string) => {
  const icons: Record<string, React.ReactNode> = {
    'health': <Heart className="h-5 w-5" />,
    'insurance': <Shield className="h-5 w-5" />,
    'retirement': <Wallet className="h-5 w-5" />,
    'allowance': <IndianRupee className="h-5 w-5" />,
    'leave': <Calendar className="h-5 w-5" />,
    'wellness': <Activity className="h-5 w-5" />,
    'other': <Gift className="h-5 w-5" />
  };
  return icons[category] || <Gift className="h-5 w-5" />;
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'health': 'bg-red-100 text-red-600',
    'insurance': 'bg-blue-100 text-blue-600',
    'retirement': 'bg-green-100 text-green-600',
    'allowance': 'bg-purple-100 text-purple-600',
    'leave': 'bg-yellow-100 text-yellow-600',
    'wellness': 'bg-pink-100 text-pink-600',
    'other': 'bg-gray-100 text-gray-600'
  };
  return colors[category] || 'bg-gray-100 text-gray-600';
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'active': 'bg-green-100 text-green-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'cancelled': 'bg-gray-100 text-gray-800',
    'expired': 'bg-red-100 text-red-800',
    'approved': 'bg-blue-100 text-blue-800',
    'rejected': 'bg-red-100 text-red-800',
    'paid': 'bg-green-100 text-green-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export default function BenefitsAdministrationPage() {
  const [activeTab, setActiveTab] = useState<'plans' | 'enrollment' | 'claims'>('plans');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  // Calculate totals
  const totalBenefitsCost = mockBenefitPlans.reduce((sum, p) => sum + (p.enrolledCount * (p.employerContribution / 100) * 10000), 0);
  const pendingClaims = mockClaims.filter(c => c.status === 'pending').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="h-7 w-7 text-red-600" />
            Benefits Administration
          </h1>
          <p className="text-gray-600 mt-1">
            Manage employee benefits, enrollments, and claims
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewPlanModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Benefit Plan
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Plans</p>
              <p className="text-2xl font-bold text-blue-600">
                {mockBenefitPlans.filter(p => p.isActive).length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Enrollments</p>
              <p className="text-2xl font-bold text-green-600">
                {mockBenefitPlans.reduce((sum, p) => sum + p.enrolledCount, 0)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <User className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Monthly Cost</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(totalBenefitsCost / 12).replace('₹', '₹')}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Wallet className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Claims</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingClaims}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Claims Paid (YTD)</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(mockClaims.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.claimAmount, 0))}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'plans', label: 'Benefit Plans', count: mockBenefitPlans.length },
              { id: 'enrollment', label: 'Employee Benefits', count: mockEmployeeBenefits.length },
              { id: 'claims', label: 'Claims', count: mockClaims.length }
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
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Benefit Plans Tab */}
        {activeTab === 'plans' && (
          <div className="p-6">
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search benefit plans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="all">All Categories</option>
                <option value="health">Health</option>
                <option value="insurance">Insurance</option>
                <option value="retirement">Retirement</option>
                <option value="allowance">Allowance</option>
                <option value="wellness">Wellness</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockBenefitPlans
                .filter(plan => {
                  const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesCategory = filterCategory === 'all' || plan.category === filterCategory;
                  return matchesSearch && matchesCategory;
                })
                .map(plan => (
                  <div key={plan.id} className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(plan.category)}`}>
                        {getCategoryIcon(plan.category)}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${plan.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{plan.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{plan.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Coverage:</span>
                        <span className="font-medium text-gray-800">{plan.coverage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Enrolled:</span>
                        <span className="font-medium text-gray-800">{plan.enrolledCount} employees</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Employer Pays:</span>
                        <span className="font-medium text-green-600">{plan.employerContribution}%</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                      <button className="flex-1 px-3 py-1.5 border border-gray-200 text-gray-700 text-sm rounded hover:bg-gray-50">
                        <Eye className="h-4 w-4 inline mr-1" /> View
                      </button>
                      <button className="flex-1 px-3 py-1.5 border border-gray-200 text-gray-700 text-sm rounded hover:bg-gray-50">
                        <Edit className="h-4 w-4 inline mr-1" /> Edit
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Employee Benefits Tab */}
        {activeTab === 'enrollment' && (
          <div className="p-6">
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowEnrollModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Enrollment
              </button>
            </div>

            <div className="space-y-3">
              {mockEmployeeBenefits.map(employee => (
                <div key={employee.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedEmployee(expandedEmployee === employee.id ? null : employee.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-lg">
                          <User className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{employee.employeeName}</span>
                            <span className="text-sm text-gray-500">({employee.employeeCode})</span>
                          </div>
                          <p className="text-sm text-gray-600">{employee.designation} • {employee.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">{formatCurrency(employee.totalBenefitValue)}</p>
                          <p className="text-xs text-gray-500">Annual Value</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-600">{employee.enrolledBenefits.length}</p>
                          <p className="text-xs text-gray-500">Benefits</p>
                        </div>
                        {expandedEmployee === employee.id ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedEmployee === employee.id && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                      <h4 className="font-medium text-gray-800 mb-3">Enrolled Benefits</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {employee.enrolledBenefits.map((benefit, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`p-1.5 rounded ${getCategoryColor(benefit.category)}`}>
                                  {getCategoryIcon(benefit.category)}
                                </span>
                                <span className="font-medium text-gray-800">{benefit.planName}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(benefit.status)}`}>
                                {benefit.status}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between text-gray-600">
                                <span>Enrolled:</span>
                                <span>{formatDate(benefit.enrollmentDate)}</span>
                              </div>
                              <div className="flex justify-between text-gray-600">
                                <span>Coverage:</span>
                                <span className="font-medium">{formatCurrency(benefit.coverageAmount)}</span>
                              </div>
                              <div className="flex justify-between text-gray-600">
                                <span>Your Contribution:</span>
                                <span>{formatCurrency(benefit.employeeContribution)}/mo</span>
                              </div>
                              {benefit.dependents && benefit.dependents.length > 0 && (
                                <div className="flex justify-between text-gray-600">
                                  <span>Dependents:</span>
                                  <span>{benefit.dependents.join(', ')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                          Add Benefit
                        </button>
                        <button className="px-3 py-1.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                          Download Statement
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Claims Tab */}
        {activeTab === 'claims' && (
          <div className="p-6">
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search claims..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Claim
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Benefit Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockClaims.map(claim => (
                    <tr key={claim.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{claim.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{claim.employeeName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{claim.benefitType}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(claim.claimAmount)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(claim.claimDate)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                          {claim.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="p-1 text-gray-400 hover:text-blue-600">
                            <Eye className="h-4 w-4" />
                          </button>
                          {claim.status === 'pending' && (
                            <>
                              <button className="p-1 text-gray-400 hover:text-green-600">
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-red-600">
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* New Benefit Plan Modal */}
      {showNewPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">New Benefit Plan</h2>
                <button onClick={() => setShowNewPlanModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="Enter plan name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                    <option value="health">Health</option>
                    <option value="insurance">Insurance</option>
                    <option value="retirement">Retirement</option>
                    <option value="allowance">Allowance</option>
                    <option value="wellness">Wellness</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={2} className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="Describe the benefit..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Details</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="e.g., Up to ₹5,00,000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="e.g., All permanent employees" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employer Contribution (%)</label>
                  <input type="number" min="0" max="100" className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="0-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee Contribution (%)</label>
                  <input type="number" min="0" max="100" className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="0-100" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" className="rounded" defaultChecked />
                <label htmlFor="isActive" className="text-sm text-gray-700">Active (available for enrollment)</label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setShowNewPlanModal(false)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Create Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">New Enrollment</h2>
                <button onClick={() => setShowEnrollModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                  <option value="">Select Employee</option>
                  <option value="EMP001">Dr. Rajesh Kumar (EMP-2020-001)</option>
                  <option value="EMP005">Priya Sharma (EMP-2021-005)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Benefit Plan</label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                  <option value="">Select Benefit Plan</option>
                  {mockBenefitPlans.filter(p => p.isActive).map(plan => (
                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Date</label>
                <input type="date" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dependents (if applicable)</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="Spouse, Child 1, etc." />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setShowEnrollModal(false)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Enroll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
