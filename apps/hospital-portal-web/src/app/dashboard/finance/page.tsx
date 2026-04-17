'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  Plus,
  Search,
  DollarSign,
  CreditCard,
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Building,
  Download,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  Receipt,
  Wallet,
} from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  patientName: string;
  patientMRN: string;
  date: string;
  dueDate: string;
  services: string[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  balance: number;
  status: 'draft' | 'sent' | 'partially-paid' | 'paid' | 'overdue' | 'cancelled';
  paymentMode?: 'cash' | 'card' | 'upi' | 'insurance' | 'cheque';
  insuranceClaim?: boolean;
}

interface InsuranceClaim {
  id: string;
  claimNumber: string;
  patientName: string;
  patientMRN: string;
  insuranceCompany: string;
  policyNumber: string;
  claimAmount: number;
  approvedAmount?: number;
  submissionDate: string;
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected' | 'settled';
  procedure: string;
  documents: string[];
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2026-001',
    patientName: 'Rajesh Kumar',
    patientMRN: 'MRN-2024-001',
    date: '2026-01-28',
    dueDate: '2026-02-07',
    services: ['Cataract Surgery (Phaco + IOL)', 'OT Charges', 'Medications'],
    subtotal: 45000,
    discount: 5000,
    tax: 0,
    total: 40000,
    paidAmount: 20000,
    balance: 20000,
    status: 'partially-paid',
    paymentMode: 'upi',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2026-002',
    patientName: 'Sunita Devi',
    patientMRN: 'MRN-2024-002',
    date: '2026-01-27',
    dueDate: '2026-02-06',
    services: ['Consultation', 'OCT Scan', 'Visual Field Test'],
    subtotal: 3500,
    discount: 0,
    tax: 0,
    total: 3500,
    paidAmount: 3500,
    balance: 0,
    status: 'paid',
    paymentMode: 'cash',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2026-003',
    patientName: 'Amit Singh',
    patientMRN: 'MRN-2024-003',
    date: '2026-01-26',
    dueDate: '2026-02-05',
    services: ['Vitrectomy', 'Room Charges (3 days)', 'Medications'],
    subtotal: 85000,
    discount: 10000,
    tax: 0,
    total: 75000,
    paidAmount: 0,
    balance: 75000,
    status: 'sent',
    insuranceClaim: true,
  },
];

const mockInsuranceClaims: InsuranceClaim[] = [
  {
    id: '1',
    claimNumber: 'CLM-2026-001',
    patientName: 'Amit Singh',
    patientMRN: 'MRN-2024-003',
    insuranceCompany: 'Star Health Insurance',
    policyNumber: 'SH-2024-789456',
    claimAmount: 75000,
    approvedAmount: 65000,
    submissionDate: '2026-01-26',
    status: 'approved',
    procedure: 'Vitrectomy',
    documents: ['Discharge Summary', 'Bills', 'Pre-auth Letter'],
  },
  {
    id: '2',
    claimNumber: 'CLM-2026-002',
    patientName: 'Priya Sharma',
    patientMRN: 'MRN-2024-004',
    insuranceCompany: 'ICICI Lombard',
    policyNumber: 'IL-2024-123789',
    claimAmount: 55000,
    submissionDate: '2026-01-27',
    status: 'under-review',
    procedure: 'Cataract Surgery (Premium IOL)',
    documents: ['Discharge Summary', 'Bills'],
  },
  {
    id: '3',
    claimNumber: 'CLM-2026-003',
    patientName: 'Ramesh Gupta',
    patientMRN: 'MRN-2024-005',
    insuranceCompany: 'New India Assurance',
    policyNumber: 'NIA-2024-456123',
    claimAmount: 35000,
    submissionDate: '2026-01-25',
    status: 'submitted',
    procedure: 'Glaucoma Surgery (Trabeculectomy)',
    documents: ['Discharge Summary', 'Bills', 'Investigation Reports'],
  },
];

const invoiceStatusColors: Record<Invoice['status'], string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  'partially-paid': 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const claimStatusColors: Record<InsuranceClaim['status'], string> = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  'under-review': 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  settled: 'bg-purple-100 text-purple-800',
};

export default function FinancePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [claims, setClaims] = useState<InsuranceClaim[]>(mockInsuranceClaims);
  const [activeTab, setActiveTab] = useState<'invoices' | 'insurance' | 'reports'>('invoices');
  const [statusFilter, setStatusFilter] = useState<Invoice['status'] | 'ALL'>('ALL');
  const [dateRange, setDateRange] = useState('today');

  const statistics = {
    todayRevenue: 23500,
    monthlyRevenue: 1250000,
    pendingAmount: 95000,
    insurancePending: 165000,
    totalInvoices: invoices.length,
    paidInvoices: invoices.filter(i => i.status === 'paid').length,
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.patientMRN.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <ProtectedRoute requiredPermission="FINANCE:VIEW">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-blue-600" />
              Financial Management
            </h1>
            <p className="text-gray-600 mt-1">
              Billing, invoicing, insurance claims, and financial reports
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard/finance/reports')}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <TrendingUp className="h-5 w-5" />
              Reports
            </button>
            <button
              onClick={() => router.push('/dashboard/finance/new-invoice')}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create Invoice
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Today's Revenue</p>
                <p className="text-2xl font-bold text-green-900">₹{statistics.todayRevenue.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Monthly Revenue</p>
                <p className="text-2xl font-bold text-blue-900">₹{(statistics.monthlyRevenue / 100000).toFixed(1)}L</p>
              </div>
              <Wallet className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Pending Payments</p>
                <p className="text-2xl font-bold text-yellow-900">₹{statistics.pendingAmount.toLocaleString()}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Insurance Pending</p>
                <p className="text-2xl font-bold text-purple-900">₹{(statistics.insurancePending / 1000).toFixed(0)}K</p>
              </div>
              <Building className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-600 font-medium">Total Invoices</p>
                <p className="text-2xl font-bold text-teal-900">{statistics.totalInvoices}</p>
              </div>
              <FileText className="h-8 w-8 text-teal-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 font-medium">Paid Invoices</p>
                <p className="text-2xl font-bold text-emerald-900">{statistics.paidInvoices}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('invoices')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'invoices'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Receipt className="h-4 w-4 inline mr-2" />
                Invoices & Billing
              </button>
              <button
                onClick={() => setActiveTab('insurance')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'insurance'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Building className="h-4 w-4 inline mr-2" />
                Insurance Claims
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'reports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <TrendingUp className="h-4 w-4 inline mr-2" />
                Financial Reports
              </button>
            </nav>
          </div>

          <div className="p-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center mb-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search invoice, patient, MRN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              {activeTab === 'invoices' && (
                <>
                  <div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ALL">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="partially-paid">Partially Paid</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                  <div>
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="all">All Time</option>
                    </select>
                  </div>
                </>
              )}
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Services
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Paid
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                            <div className="text-xs text-gray-500">{invoice.date}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{invoice.patientName}</div>
                            <div className="text-xs text-gray-500">{invoice.patientMRN}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={invoice.services.join(', ')}>
                            {invoice.services.join(', ')}
                          </div>
                          {invoice.insuranceClaim && (
                            <span className="text-xs text-purple-600">Insurance Claim Filed</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                          ₹{invoice.total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-green-600">
                          ₹{invoice.paidAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={invoice.balance > 0 ? 'text-orange-600 font-medium' : 'text-gray-500'}>
                            ₹{invoice.balance.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${invoiceStatusColors[invoice.status]}`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => router.push(`/dashboard/finance/invoice/${invoice.id}`)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {invoice.balance > 0 && (
                              <button
                                onClick={() => router.push(`/dashboard/finance/invoice/${invoice.id}/payment`)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                title="Record Payment"
                              >
                                <CreditCard className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => router.push(`/dashboard/finance/invoice/${invoice.id}/edit`)}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Insurance Claims Tab */}
            {activeTab === 'insurance' && (
              <div className="space-y-4">
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => router.push('/dashboard/finance/insurance/new-claim')}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    File New Claim
                  </button>
                </div>

                {claims.map((claim) => (
                  <div
                    key={claim.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{claim.claimNumber}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${claimStatusColors[claim.status]}`}>
                            {claim.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{claim.procedure}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Claim Amount</p>
                        <p className="text-lg font-bold text-gray-900">₹{claim.claimAmount.toLocaleString()}</p>
                        {claim.approvedAmount && (
                          <p className="text-sm text-green-600">Approved: ₹{claim.approvedAmount.toLocaleString()}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Patient</p>
                        <p className="text-sm font-medium">{claim.patientName}</p>
                        <p className="text-xs text-gray-500">{claim.patientMRN}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Insurance Company</p>
                        <p className="text-sm font-medium">{claim.insuranceCompany}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Policy Number</p>
                        <p className="text-sm font-medium">{claim.policyNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Submission Date</p>
                        <p className="text-sm font-medium">{claim.submissionDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex gap-2">
                        {claim.documents.map((doc, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                            {doc}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/finance/insurance/${claim.id}`)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </button>
                        {claim.status !== 'settled' && claim.status !== 'rejected' && (
                          <button
                            onClick={() => router.push(`/dashboard/finance/insurance/${claim.id}/update`)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <Edit className="h-4 w-4" />
                            Update Status
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push('/dashboard/finance/reports/daily-collection')}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Daily Collection Report</h3>
                  </div>
                  <p className="text-sm text-gray-600">View daily revenue breakdown by payment mode</p>
                </div>

                <div
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push('/dashboard/finance/reports/outstanding')}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Outstanding Report</h3>
                  </div>
                  <p className="text-sm text-gray-600">Track pending payments and overdue invoices</p>
                </div>

                <div
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push('/dashboard/finance/reports/insurance-analysis')}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Building className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Insurance Analysis</h3>
                  </div>
                  <p className="text-sm text-gray-600">Claims status and settlement analysis</p>
                </div>

                <div
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push('/dashboard/finance/reports/revenue-trend')}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Revenue Trend</h3>
                  </div>
                  <p className="text-sm text-gray-600">Monthly and yearly revenue comparison</p>
                </div>

                <div
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push('/dashboard/finance/reports/service-wise')}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-teal-100 rounded-lg">
                      <FileText className="h-6 w-6 text-teal-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Service-wise Revenue</h3>
                  </div>
                  <p className="text-sm text-gray-600">Revenue breakdown by service category</p>
                </div>

                <div
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push('/dashboard/finance/reports/doctor-wise')}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <Users className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Doctor-wise Revenue</h3>
                  </div>
                  <p className="text-sm text-gray-600">Revenue generated by each doctor</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
