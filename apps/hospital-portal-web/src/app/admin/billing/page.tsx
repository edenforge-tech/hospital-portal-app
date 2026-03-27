'use client';

import React, { useState } from 'react';

// ============================================================================
// Types
// ============================================================================

interface Invoice {
  id: string;
  invoiceNumber: string;
  patientName: string;
  mrn: string;
  status: string;
  type: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  issueDate: string;
  dueDate: string;
}

interface Claim {
  id: string;
  claimNumber: string;
  patientName: string;
  insuranceCompany: string;
  status: string;
  totalCharges: number;
  paidAmount: number;
  serviceDateFrom: string;
  submissionDate: string;
}

interface Payment {
  id: string;
  paymentNumber: string;
  invoiceNumber: string;
  patientName: string;
  amount: number;
  method: string;
  status: string;
  paymentDate: string;
}

// ============================================================================
// Components
// ============================================================================

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    pending: 'bg-yellow-100 text-yellow-700',
    sent: 'bg-blue-100 text-blue-700',
    submitted: 'bg-blue-100 text-blue-700',
    partially_paid: 'bg-orange-100 text-orange-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    denied: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-700',
    completed: 'bg-green-100 text-green-700',
    in_review: 'bg-purple-100 text-purple-700',
    appealed: 'bg-indigo-100 text-indigo-700',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function MetricCard({ label, value, icon, color, trend }: { 
  label: string; 
  value: string | number; 
  icon: string; 
  color: string;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
            <span className="text-lg">{icon}</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function PaymentMethodIcon({ method }: { method: string }) {
  const icons: Record<string, string> = {
    cash: '💵',
    check: '📝',
    credit_card: '💳',
    debit_card: '💳',
    insurance_payment: '🏥',
    ach: '🏦',
    payment_plan: '📅',
  };
  return <span>{icons[method] || '💰'}</span>;
}

function SimpleBarChart({ data, maxValue }: { data: { label: string; value: number; color: string }[]; maxValue: number }) {
  return (
    <div className="space-y-3">
      {data.map((item, idx) => (
        <div key={idx}>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">{item.label}</span>
            <span className="font-medium text-gray-900">{formatCurrency(item.value)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${item.color}`}
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'claims' | 'payments' | 'insurance'>('dashboard');
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);

  // Mock data
  const invoices: Invoice[] = [
    {
      id: '1',
      invoiceNumber: 'INV-2026-0125',
      patientName: 'John Smith',
      mrn: 'MRN-2026-001',
      status: 'sent',
      type: 'patient_responsibility',
      totalAmount: 850.00,
      paidAmount: 0,
      balanceDue: 850.00,
      issueDate: '2026-01-24',
      dueDate: '2026-02-23',
    },
    {
      id: '2',
      invoiceNumber: 'INV-2026-0124',
      patientName: 'Emily Johnson',
      mrn: 'MRN-2026-015',
      status: 'partially_paid',
      type: 'self_pay',
      totalAmount: 1200.00,
      paidAmount: 400.00,
      balanceDue: 800.00,
      issueDate: '2026-01-20',
      dueDate: '2026-02-19',
    },
    {
      id: '3',
      invoiceNumber: 'INV-2026-0120',
      patientName: 'Michael Davis',
      mrn: 'MRN-2026-022',
      status: 'paid',
      type: 'insurance_claim',
      totalAmount: 2500.00,
      paidAmount: 2500.00,
      balanceDue: 0,
      issueDate: '2026-01-15',
      dueDate: '2026-02-14',
    },
    {
      id: '4',
      invoiceNumber: 'INV-2026-0115',
      patientName: 'Sarah Williams',
      mrn: 'MRN-2026-008',
      status: 'overdue',
      type: 'patient_responsibility',
      totalAmount: 450.00,
      paidAmount: 0,
      balanceDue: 450.00,
      issueDate: '2026-01-01',
      dueDate: '2026-01-15',
    },
  ];

  const claims: Claim[] = [
    {
      id: '1',
      claimNumber: 'CLM-2026-0089',
      patientName: 'John Smith',
      insuranceCompany: 'Blue Cross Blue Shield',
      status: 'submitted',
      totalCharges: 3500.00,
      paidAmount: 0,
      serviceDateFrom: '2026-01-20',
      submissionDate: '2026-01-22',
    },
    {
      id: '2',
      claimNumber: 'CLM-2026-0085',
      patientName: 'Emily Johnson',
      insuranceCompany: 'Aetna',
      status: 'in_review',
      totalCharges: 2200.00,
      paidAmount: 0,
      serviceDateFrom: '2026-01-15',
      submissionDate: '2026-01-18',
    },
    {
      id: '3',
      claimNumber: 'CLM-2026-0080',
      patientName: 'Michael Davis',
      insuranceCompany: 'United Healthcare',
      status: 'paid',
      totalCharges: 4800.00,
      paidAmount: 3840.00,
      serviceDateFrom: '2026-01-10',
      submissionDate: '2026-01-12',
    },
    {
      id: '4',
      claimNumber: 'CLM-2026-0075',
      patientName: 'Sarah Williams',
      insuranceCompany: 'Cigna',
      status: 'denied',
      totalCharges: 1500.00,
      paidAmount: 0,
      serviceDateFrom: '2026-01-05',
      submissionDate: '2026-01-08',
    },
  ];

  const payments: Payment[] = [
    {
      id: '1',
      paymentNumber: 'PAY-2026-0456',
      invoiceNumber: 'INV-2026-0120',
      patientName: 'Michael Davis',
      amount: 2500.00,
      method: 'insurance_payment',
      status: 'completed',
      paymentDate: '2026-01-23',
    },
    {
      id: '2',
      paymentNumber: 'PAY-2026-0455',
      invoiceNumber: 'INV-2026-0124',
      patientName: 'Emily Johnson',
      amount: 400.00,
      method: 'credit_card',
      status: 'completed',
      paymentDate: '2026-01-22',
    },
    {
      id: '3',
      paymentNumber: 'PAY-2026-0454',
      invoiceNumber: 'INV-2026-0118',
      patientName: 'Robert Brown',
      amount: 150.00,
      method: 'cash',
      status: 'completed',
      paymentDate: '2026-01-22',
    },
  ];

  const arAgingData = [
    { label: 'Current (0-30 days)', value: 45000, color: 'bg-green-500' },
    { label: '31-60 days', value: 28000, color: 'bg-yellow-500' },
    { label: '61-90 days', value: 15000, color: 'bg-orange-500' },
    { label: '91-120 days', value: 8000, color: 'bg-red-400' },
    { label: '120+ days', value: 4000, color: 'bg-red-600' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Insurance</h1>
          <p className="text-gray-500 mt-1">Claims processing, payments, and revenue management</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewClaimModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span>🏥</span>
            New Claim
          </button>
          <button
            onClick={() => setShowNewInvoiceModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>➕</span>
            New Invoice
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'invoices', label: 'Invoices', icon: '📄' },
            { id: 'claims', label: 'Claims', icon: '🏥' },
            { id: 'payments', label: 'Payments', icon: '💳' },
            { id: 'insurance', label: 'Insurance', icon: '🛡️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              label="Total A/R" 
              value={formatCurrency(100000)} 
              icon="💰" 
              color="bg-blue-100"
              trend={{ value: '5.2%', positive: false }}
            />
            <MetricCard 
              label="Collections (MTD)" 
              value={formatCurrency(78500)} 
              icon="📥" 
              color="bg-green-100"
              trend={{ value: '12.3%', positive: true }}
            />
            <MetricCard 
              label="Days in A/R" 
              value="32.5" 
              icon="📅" 
              color="bg-yellow-100"
              trend={{ value: '2.1', positive: true }}
            />
            <MetricCard 
              label="Clean Claim Rate" 
              value="94.2%" 
              icon="✅" 
              color="bg-purple-100"
              trend={{ value: '1.5%', positive: true }}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* A/R Aging */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">A/R Aging Summary</h3>
              <SimpleBarChart data={arAgingData} maxValue={50000} />
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-500">Total Outstanding</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(100000)}</span>
              </div>
            </div>

            {/* Revenue Trend */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
              <div className="space-y-4">
                {[
                  { month: 'January', charges: 125000, collections: 98000, adjustments: 12000 },
                  { month: 'December', charges: 118000, collections: 95000, adjustments: 11500 },
                  { month: 'November', charges: 112000, collections: 89000, adjustments: 10800 },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm font-medium text-gray-700">{item.month}</span>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-gray-500">Charges: <span className="font-medium text-gray-900">{formatCurrency(item.charges)}</span></span>
                      <span className="text-gray-500">Collections: <span className="font-medium text-green-600">{formatCurrency(item.collections)}</span></span>
                      <span className="text-gray-500">Adj: <span className="font-medium text-red-600">-{formatCurrency(item.adjustments)}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Claims & Denials */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Claims by Status */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Claims by Status</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { status: 'Pending', count: 45, amount: 125000, color: 'bg-yellow-100 text-yellow-700' },
                  { status: 'Submitted', count: 28, amount: 85000, color: 'bg-blue-100 text-blue-700' },
                  { status: 'In Review', count: 15, amount: 42000, color: 'bg-purple-100 text-purple-700' },
                  { status: 'Paid', count: 120, amount: 380000, color: 'bg-green-100 text-green-700' },
                  { status: 'Denied', count: 8, amount: 22000, color: 'bg-red-100 text-red-700' },
                  { status: 'Appealed', count: 3, amount: 8500, color: 'bg-indigo-100 text-indigo-700' },
                ].map((item, idx) => (
                  <div key={idx} className={`p-3 rounded-lg ${item.color.split(' ')[0]}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.status}</span>
                      <span className="text-lg font-bold">{item.count}</span>
                    </div>
                    <p className="text-xs opacity-75 mt-1">{formatCurrency(item.amount)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Denial Reasons */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Denial Reasons</h3>
              <div className="space-y-3">
                {[
                  { reason: 'Missing/Invalid Authorization', count: 12, amount: 35000 },
                  { reason: 'Service Not Covered', count: 8, amount: 22000 },
                  { reason: 'Duplicate Claim', count: 5, amount: 15000 },
                  { reason: 'Patient Eligibility Issue', count: 4, amount: 12000 },
                  { reason: 'Coding Error', count: 3, amount: 8500 },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.reason}</p>
                      <p className="text-xs text-gray-500">{item.count} claims</p>
                    </div>
                    <span className="text-sm font-medium text-red-600">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <input
              type="text"
              placeholder="Search invoices..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-blue-600">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-gray-500">{invoice.issueDate}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{invoice.patientName}</p>
                      <p className="text-xs text-gray-500">{invoice.mrn}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(invoice.totalAmount)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm font-medium ${invoice.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(invoice.balanceDue)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{invoice.dueDate}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                        <button className="text-green-600 hover:text-green-800 text-sm">Pay</button>
                        <button className="text-gray-600 hover:text-gray-800 text-sm">Print</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Claims Tab */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="in_review">In Review</option>
              <option value="paid">Paid</option>
              <option value="denied">Denied</option>
              <option value="appealed">Appealed</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
              <option value="">All Insurance</option>
              <option value="bcbs">Blue Cross Blue Shield</option>
              <option value="aetna">Aetna</option>
              <option value="united">United Healthcare</option>
              <option value="cigna">Cigna</option>
            </select>
            <input
              type="text"
              placeholder="Search claims..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Claim</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Insurance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Charges</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-blue-600">{claim.claimNumber}</p>
                      <p className="text-xs text-gray-500">Submitted: {claim.submissionDate}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{claim.patientName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{claim.insuranceCompany}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(claim.totalCharges)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-green-600">{formatCurrency(claim.paidAmount)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{claim.serviceDateFrom}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={claim.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                        {claim.status === 'denied' && (
                          <button className="text-orange-600 hover:text-orange-800 text-sm">Appeal</button>
                        )}
                        {claim.status === 'draft' && (
                          <button className="text-green-600 hover:text-green-800 text-sm">Submit</button>
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

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                <option value="">All Methods</option>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="credit_card">Credit Card</option>
                <option value="insurance_payment">Insurance Payment</option>
              </select>
              <input
                type="text"
                placeholder="Search payments..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
              💳 Record Payment
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{payment.paymentNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-blue-600">{payment.invoiceNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{payment.patientName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-green-600">{formatCurrency(payment.amount)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2 text-sm text-gray-700">
                        <PaymentMethodIcon method={payment.method} />
                        {payment.method.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{payment.paymentDate}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={payment.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">Receipt</button>
                        <button className="text-red-600 hover:text-red-800 text-sm">Refund</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insurance Tab */}
      {activeTab === 'insurance' && (
        <div className="space-y-6">
          {/* Insurance Companies */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Insurance Companies</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                ➕ Add Insurance
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Blue Cross Blue Shield', payerId: 'BCBS001', avgDays: 28, contractStatus: 'in_network' },
                { name: 'Aetna', payerId: 'AETNA01', avgDays: 32, contractStatus: 'in_network' },
                { name: 'United Healthcare', payerId: 'UHC0001', avgDays: 25, contractStatus: 'in_network' },
                { name: 'Cigna', payerId: 'CIGNA01', avgDays: 30, contractStatus: 'in_network' },
                { name: 'Medicare', payerId: 'MEDCR01', avgDays: 14, contractStatus: 'in_network' },
                { name: 'Medicaid', payerId: 'MEDCD01', avgDays: 21, contractStatus: 'in_network' },
              ].map((company, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{company.name}</h4>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                      In Network
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Payer ID: {company.payerId}</p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-gray-500">Avg. Payment Days</span>
                    <span className="font-medium text-gray-900">{company.avgDays} days</span>
                  </div>
                  <button className="mt-3 w-full px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Fee Schedules */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Fee Schedules</h3>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                ➕ Create Fee Schedule
              </button>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Effective Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { name: 'Standard Fee Schedule 2026', type: 'Standard', effective: '2026-01-01', status: 'active' },
                  { name: 'Medicare Fee Schedule', type: 'Medicare', effective: '2026-01-01', status: 'active' },
                  { name: 'BCBS Contracted Rates', type: 'Contracted', effective: '2025-07-01', status: 'active' },
                  { name: 'Medicaid Fee Schedule', type: 'Medicaid', effective: '2026-01-01', status: 'active' },
                ].map((schedule, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{schedule.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{schedule.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{schedule.effective}</td>
                    <td className="px-4 py-3"><StatusBadge status={schedule.status} /></td>
                    <td className="px-4 py-3">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Invoice Modal */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Create New Invoice</h2>
                <button
                  onClick={() => setShowNewInvoiceModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                  <input
                    type="text"
                    placeholder="Search patient..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="patient_responsibility">Patient Responsibility</option>
                      <option value="self_pay">Self Pay</option>
                      <option value="insurance_claim">Insurance Claim</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Line Items</label>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500 text-center">Add services and charges</p>
                    <button className="mt-2 w-full px-3 py-2 border border-dashed border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">
                      ➕ Add Line Item
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowNewInvoiceModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Create Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Claim Modal */}
      {showNewClaimModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Create New Claim</h2>
                <button
                  onClick={() => setShowNewClaimModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                  <input
                    type="text"
                    placeholder="Search patient..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Policy</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select insurance policy...</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Claim Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="professional">Professional (CMS-1500)</option>
                      <option value="institutional">Institutional (UB-04)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filing Indicator</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                      <option value="tertiary">Tertiary</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Generate from encounter/invoice...</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowNewClaimModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Create Claim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
