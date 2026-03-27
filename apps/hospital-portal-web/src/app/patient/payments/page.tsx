'use client';

import { useState } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  Download,
  Receipt,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  Wallet,
  FileText,
  ChevronDown,
  ChevronUp,
  Building,
  Shield,
  Printer,
  ExternalLink,
  Plus,
  ArrowRight,
  RefreshCw,
  Phone,
} from 'lucide-react';

interface Bill {
  id: string;
  billNumber: string;
  date: string;
  dueDate: string;
  visitDate: string;
  visitType: string;
  department: string;
  doctor?: string;
  items: BillItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  insuranceCovered?: number;
  patientResponsibility: number;
  amountPaid: number;
  amountDue: number;
  status: 'paid' | 'partial' | 'due' | 'overdue';
  paymentHistory: Payment[];
}

interface BillItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  category: string;
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
  reference: string;
  status: 'completed' | 'pending' | 'failed';
}

interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  memberId: string;
  coverageType: string;
  status: 'active' | 'inactive';
}

// Mock data
const mockBills: Bill[] = [
  {
    id: 'BILL-001',
    billNumber: 'INV-2026-001234',
    date: '2026-01-15',
    dueDate: '2026-02-15',
    visitDate: '2026-01-15',
    visitType: 'Outpatient Consultation',
    department: 'Ophthalmology',
    doctor: 'Dr. Arun Mehta',
    items: [
      { description: 'Consultation - Senior Consultant', quantity: 1, unitPrice: 1500, amount: 1500, category: 'Consultation' },
      { description: 'OCT Scan - Both Eyes', quantity: 1, unitPrice: 2500, amount: 2500, category: 'Diagnostics' },
      { description: 'Tonometry (IOP)', quantity: 1, unitPrice: 500, amount: 500, category: 'Diagnostics' },
      { description: 'Visual Acuity Test', quantity: 1, unitPrice: 300, amount: 300, category: 'Diagnostics' },
    ],
    subtotal: 4800,
    discount: 0,
    tax: 0,
    total: 4800,
    insuranceCovered: 3360,
    patientResponsibility: 1440,
    amountPaid: 0,
    amountDue: 1440,
    status: 'due',
    paymentHistory: [],
  },
  {
    id: 'BILL-002',
    billNumber: 'INV-2026-001100',
    date: '2026-01-10',
    dueDate: '2026-01-25',
    visitDate: '2026-01-10',
    visitType: 'Outpatient Consultation',
    department: 'General Medicine',
    doctor: 'Dr. Priya Nair',
    items: [
      { description: 'Consultation - Consultant', quantity: 1, unitPrice: 800, amount: 800, category: 'Consultation' },
      { description: 'CBC Test', quantity: 1, unitPrice: 400, amount: 400, category: 'Laboratory' },
      { description: 'Chest X-Ray', quantity: 1, unitPrice: 600, amount: 600, category: 'Radiology' },
    ],
    subtotal: 1800,
    discount: 100,
    tax: 0,
    total: 1700,
    insuranceCovered: 1190,
    patientResponsibility: 510,
    amountPaid: 510,
    amountDue: 0,
    status: 'paid',
    paymentHistory: [
      { id: 'PAY-001', date: '2026-01-10', amount: 510, method: 'Credit Card', reference: 'TXN123456', status: 'completed' },
    ],
  },
  {
    id: 'BILL-003',
    billNumber: 'INV-2025-098765',
    date: '2025-12-20',
    dueDate: '2026-01-20',
    visitDate: '2025-12-20',
    visitType: 'Day Care Surgery',
    department: 'Ophthalmology',
    doctor: 'Dr. Arun Mehta',
    items: [
      { description: 'Cataract Surgery (Phaco) - Right Eye', quantity: 1, unitPrice: 35000, amount: 35000, category: 'Surgery' },
      { description: 'Premium IOL - Toric', quantity: 1, unitPrice: 25000, amount: 25000, category: 'Implant' },
      { description: 'OT Charges', quantity: 1, unitPrice: 10000, amount: 10000, category: 'Facility' },
      { description: 'Anesthesia', quantity: 1, unitPrice: 5000, amount: 5000, category: 'Anesthesia' },
      { description: 'Medications', quantity: 1, unitPrice: 2500, amount: 2500, category: 'Pharmacy' },
    ],
    subtotal: 77500,
    discount: 5000,
    tax: 0,
    total: 72500,
    insuranceCovered: 50000,
    patientResponsibility: 22500,
    amountPaid: 15000,
    amountDue: 7500,
    status: 'partial',
    paymentHistory: [
      { id: 'PAY-002', date: '2025-12-20', amount: 15000, method: 'UPI', reference: 'UPI987654', status: 'completed' },
    ],
  },
];

const mockInsurance: InsuranceInfo = {
  provider: 'Star Health Insurance',
  policyNumber: 'SHI-2024-987654',
  memberId: 'MEM-001234',
  coverageType: 'Family Floater - 10L',
  status: 'active',
};

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusBadge = (status: Bill['status']) => {
  switch (status) {
    case 'paid': return 'bg-green-100 text-green-800';
    case 'partial': return 'bg-yellow-100 text-yellow-800';
    case 'due': return 'bg-blue-100 text-blue-800';
    case 'overdue': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function PatientPaymentsPage() {
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedBills, setExpandedBills] = useState<string[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalDue = bills.reduce((sum, b) => sum + b.amountDue, 0);
  const totalPaid = bills.reduce((sum, b) => sum + b.amountPaid, 0);
  const totalInsuranceCovered = bills.reduce((sum, b) => sum + (b.insuranceCovered || 0), 0);

  const toggleExpand = (id: string) => {
    setExpandedBills(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handlePayNow = (bill: Bill) => {
    setSelectedBill(bill);
    setShowPaymentModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Bills</h1>
          <p className="text-gray-500">View and pay your hospital bills</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Statement
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Wallet className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Due</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(totalDue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Paid</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Insurance Covered</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(totalInsuranceCovered)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Receipt className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Bills</p>
              <p className="text-xl font-bold text-gray-900">{bills.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Outstanding Amount Alert */}
      {totalDue > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-orange-800">Outstanding Balance</p>
                <p className="text-sm text-orange-700 mt-1">
                  You have {formatCurrency(totalDue)} pending. Pay before due date to avoid late fees.
                </p>
              </div>
            </div>
            <button 
              onClick={() => {
                const dueB = bills.find(b => b.amountDue > 0);
                if (dueB) handlePayNow(dueB);
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
            >
              Pay Now
            </button>
          </div>
        </div>
      )}

      {/* Insurance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-5 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Shield className="h-7 w-7" />
            </div>
            <div>
              <p className="text-blue-100 text-sm">Insurance Coverage</p>
              <p className="text-xl font-semibold">{mockInsurance.provider}</p>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-blue-100">
                <span>Policy: {mockInsurance.policyNumber}</span>
                <span>Member ID: {mockInsurance.memberId}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
              Active
            </span>
            <p className="text-sm text-blue-100 mt-2">{mockInsurance.coverageType}</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by bill number or department..."
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
          <option value="due">Due</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Bills List */}
      <div className="space-y-4">
        {filteredBills.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No bills found</p>
          </div>
        ) : (
          filteredBills.map((bill) => {
            const isExpanded = expandedBills.includes(bill.id);

            return (
              <div key={bill.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
                bill.status === 'overdue' ? 'border-red-200' : 'border-gray-100'
              }`}>
                {/* Bill Header */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleExpand(bill.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        bill.status === 'paid' ? 'bg-green-100' :
                        bill.status === 'overdue' ? 'bg-red-100' :
                        'bg-blue-100'
                      }`}>
                        <Receipt className={`h-6 w-6 ${
                          bill.status === 'paid' ? 'text-green-600' :
                          bill.status === 'overdue' ? 'text-red-600' :
                          'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{bill.billNumber}</h3>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(bill.status)}`}>
                            {bill.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{bill.visitType} - {bill.department}</p>
                        {bill.doctor && <p className="text-sm text-gray-400">{bill.doctor}</p>}
                        
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          <span className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {formatDate(bill.visitDate)}
                          </span>
                          <span className={`flex items-center gap-1 text-sm ${
                            new Date(bill.dueDate) < new Date() && bill.amountDue > 0 
                              ? 'text-red-600' 
                              : 'text-gray-600'
                          }`}>
                            <Clock className="h-4 w-4" />
                            Due: {formatDate(bill.dueDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(bill.total)}</p>
                      {bill.amountDue > 0 && (
                        <p className="text-sm text-red-600 font-medium">
                          Due: {formatCurrency(bill.amountDue)}
                        </p>
                      )}
                      <div className="flex items-center justify-end gap-2 mt-2">
                        {bill.amountDue > 0 && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handlePayNow(bill); }}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                          >
                            Pay Now
                          </button>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4">
                    {/* Bill Items */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Bill Items</p>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Category</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Qty</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Unit Price</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {bill.items.map((item, idx) => (
                              <tr key={idx}>
                                <td className="px-4 py-2 text-sm text-gray-900">{item.description}</td>
                                <td className="px-4 py-2 text-sm text-gray-500">{item.category}</td>
                                <td className="px-4 py-2 text-sm text-gray-600 text-right">{item.quantity}</td>
                                <td className="px-4 py-2 text-sm text-gray-600 text-right">{formatCurrency(item.unitPrice)}</td>
                                <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">{formatCurrency(item.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-50">
                            <tr>
                              <td colSpan={4} className="px-4 py-2 text-sm text-gray-600 text-right">Subtotal</td>
                              <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">{formatCurrency(bill.subtotal)}</td>
                            </tr>
                            {bill.discount > 0 && (
                              <tr>
                                <td colSpan={4} className="px-4 py-2 text-sm text-green-600 text-right">Discount</td>
                                <td className="px-4 py-2 text-sm text-green-600 text-right font-medium">-{formatCurrency(bill.discount)}</td>
                              </tr>
                            )}
                            <tr className="border-t border-gray-200">
                              <td colSpan={4} className="px-4 py-2 text-sm font-semibold text-gray-900 text-right">Total</td>
                              <td className="px-4 py-2 text-sm font-bold text-gray-900 text-right">{formatCurrency(bill.total)}</td>
                            </tr>
                            {bill.insuranceCovered && (
                              <tr>
                                <td colSpan={4} className="px-4 py-2 text-sm text-blue-600 text-right">Insurance Covered</td>
                                <td className="px-4 py-2 text-sm text-blue-600 text-right font-medium">-{formatCurrency(bill.insuranceCovered)}</td>
                              </tr>
                            )}
                            <tr className="border-t border-gray-200">
                              <td colSpan={4} className="px-4 py-2 text-sm font-semibold text-gray-900 text-right">Patient Responsibility</td>
                              <td className="px-4 py-2 text-sm font-bold text-gray-900 text-right">{formatCurrency(bill.patientResponsibility)}</td>
                            </tr>
                            <tr>
                              <td colSpan={4} className="px-4 py-2 text-sm text-green-600 text-right">Amount Paid</td>
                              <td className="px-4 py-2 text-sm text-green-600 text-right font-medium">{formatCurrency(bill.amountPaid)}</td>
                            </tr>
                            {bill.amountDue > 0 && (
                              <tr className="bg-red-50">
                                <td colSpan={4} className="px-4 py-2 text-sm font-semibold text-red-600 text-right">Amount Due</td>
                                <td className="px-4 py-2 text-sm font-bold text-red-600 text-right">{formatCurrency(bill.amountDue)}</td>
                              </tr>
                            )}
                          </tfoot>
                        </table>
                      </div>
                    </div>

                    {/* Payment History */}
                    {bill.paymentHistory.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Payment History</p>
                        <div className="space-y-2">
                          {bill.paymentHistory.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                                  <p className="text-xs text-gray-500">{payment.method} • Ref: {payment.reference}</p>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600">{formatDate(payment.date)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      {bill.amountDue > 0 && (
                        <button 
                          onClick={() => handlePayNow(bill)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
                        >
                          <CreditCard className="h-4 w-4" />
                          Pay {formatCurrency(bill.amountDue)}
                        </button>
                      )}
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download Invoice
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2">
                        <Printer className="h-4 w-4" />
                        Print
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Payment Help */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Options</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
            <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Credit/Debit Card</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
            <Building className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Net Banking</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
            <Wallet className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">UPI / Wallets</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
            <RefreshCw className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">EMI Options</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600">
          <Phone className="h-4 w-4" />
          <span>Need help with payments? Call billing support: +91 1234 567 892</span>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Make Payment</h3>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">Bill: {selectedBill.billNumber}</p>
              <p className="text-xl font-bold text-blue-900 mt-1">{formatCurrency(selectedBill.amountDue)}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-3 border-2 border-blue-500 rounded-lg bg-blue-50 text-center">
                    <CreditCard className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <span className="text-sm text-blue-700">Card</span>
                  </button>
                  <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
                    <Wallet className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                    <span className="text-sm text-gray-600">UPI</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input 
                  type="text" 
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input 
                    type="text" 
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  alert('Payment processed successfully!');
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                Pay {formatCurrency(selectedBill.amountDue)}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-center text-gray-500 mt-4 flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" />
              Secured by 256-bit SSL encryption
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
